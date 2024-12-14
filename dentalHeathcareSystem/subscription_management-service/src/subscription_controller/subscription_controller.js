const Subscription = require("../subscription_model/Subscription");
const MqttBroker = require("../../mqtt-broker");
// const emailValidator = require('validator'); // this could be used to validate email from notification means

exports.createSubscription = async (payload) => {
    console.log("first payload, ", payload);
    let message;
    let response;
    let status;
    try {
        const newSubscription = JSON.parse(payload);
        console.log("second parsed payload", payload);
        const newSubscriptionValidation = validateSubscription(newSubscription);

        console.log("parsed payload " + JSON.stringify(newSubscription));
        if (!newSubscriptionValidation.success) {
            status = 400
            return status + "/" + newSubscriptionValidation.message;
        }

        const subscription = new Subscription(newSubscription);
        console.log("just before saving " , newSubscription);
        await subscription.save();
        console.log("are we getting after save?")

        message = "Subscription created successfully!"
        let stringSubscription = JSON.stringify(subscription)
        console.log("string ", subscription);
        status = 200;
        response = status + "/" + message + "/" + stringSubscription;
        return response;

    } catch (error) {
        console.log("are we catching?" , error.message);
        status = 400;
        message = "Failed to create. Something went wrong!"
        return status + "/" + message + "/" + error.message;
    }
};


exports.getAllSubscriptions = async (payload) => {
    let status;
    let message;
    try {
        const subscriptions = await Subscription.find();
        if (!subscriptions) {
            status = 200;
            message = "There are no subscriptions!";
            return status + "/" + message;
        }

        status = 200;
        message = "Subscriptions retrieved!";
        let stringifiedSubscriptions = JSON.stringify(subscriptions);
        let messageToReturn = status + "/" + message + "/" + stringifiedSubscriptions;
        return messageToReturn;

    } catch (error) {
        status = 400;
        error.message = "Something went wrong!";
        return status + "/" + error.message;
    }
};

exports.getSpecificSubscription = async (topic) => {
    let status;
    let message;
    try {
        let topicArray = topic.split("/");
        let id = topicArray[3];
        const subscription = await Subscription.findById(id);

        if (!subscription) {
            status = 404;
            message = "No such subscription";
            return status + "/" + message;
        }

        status = 200;
        message = "Subscription retrieved!";
        let stringifiedSubscription = JSON.stringify(subscription);
        let messageToReturn = status + "/" + message + "/" + stringifiedSubscription;
        return messageToReturn;

    } catch (error) {
        status = 400;
        error.message = "Something went wrong!";
        return status + "/" + error.message;
    }
}

exports.updateSpecificSubscription = async (topic, payload) => {
    let status;
    let message;
    try {
        let topicArray = topic.split("/");
        let id = topicArray[2];

        const foundSub = await Subscription.findById(id);
        if (!foundSub) {
            status = 404;
            message = "No subscription with this id";
            return status + "/" + message;
        }

        const newSubscription = JSON.parse(payload);

        const subscription = {
            patient_id: newSubscription.patient_id ? newSubscription.patient_id : foundSub.patient_id,
            clinic_subscription: newSubscription.clinic_subscription ? newSubscription.clinic_subscription : foundSub.clinic_subscription,
            period_subscription: newSubscription.period_subscription ? newSubscription.period_subscription : foundSub.period_subscription,
            appointment_type: newSubscription.appointment_type ? newSubscription.appointment_type : foundSub.appointment_type,
            notification_preference: newSubscription.notification_preference ? newSubscription.notification_preference : foundSub.notification_preference,
            email_notification: newSubscription.email_notification ? newSubscription.email_notification : foundSub.email_notification,
            phone_notification: newSubscription.phone_notification ? newSubscription.phone_notification : foundSub.phone_notification
        }

        const newSubscriptionValidation = validateSubscription(subscription);
        if(!newSubscriptionValidation.success) {
            status = 400;
            message = newSubscriptionValidation.message;
            return status + "/" + message;
        }

        const updatedSubscription = await Subscription.findByIdAndUpdate(id, subscription, {new: true});
        status = 200;
        message = "Subscription has been updated!";
        console.log("updated sub: " + updatedSubscription);

        let stringifiedUpdatedSub = JSON.stringify(updatedSubscription);
        let messageToReturn = status + "/" + message + "/" + stringifiedUpdatedSub;
        console.log(messageToReturn);
        return messageToReturn;

    } catch (error) {
        status = 400;
        error.message = "Something went wrong!";
        return status + "/" + error.message;
    }
};

exports.deleteSpecificSubscription = async (topic) => {
    let status;
    let message;
    try {
        let topicArray = topic.split("/");
        let id = topicArray[2];

        const subscriptionToDelete = await Subscription.findByIdAndDelete(id);
        if (!subscriptionToDelete) {
            status = 404;
            message = "No subscription with this ID";
            return status + "/" + message;
        }

        let stringifiedDeletedSub = JSON.stringify(subscriptionToDelete);
        status = 200;
        message = "Subscription has been Deleted!";
        let messageToReturn = status + "/" + message + "/" + stringifiedDeletedSub;
        return messageToReturn;

    } catch (error) {
        status = 400;
        error.message = "Something went wrong!";
        return status + "/" + error.message;
    }
};

/*=========== HTTP endpoints ==============*/


exports.registerSubscription = async (req, res) => {
    try {
        const subscription = {
            patient_id: req.body.patient_id,
            // subscription_type: req.body.subscription_type,
            clinic_subscription: req.body.clinic_subscription,
            period_subscription: req.body.period_subscription,
            appointment_type: req.body.appointment_type,
            notification_preference: req.body.notification_preference,
            // notification_means: req.body.notification_means
            email_notification: req.body.email_notification,
            phone_notification: req.body.phone_notification
        };

        const newSubscriptionValidation = validateSubscription(subscription);
        if(!newSubscriptionValidation.success) {
            res.status(400).json({message: newSubscriptionValidation.message})
            return;
        }

        const newSubscription = new Subscription(subscription);
        await newSubscription.save();
        res.status(200).json({
            message: "Created and saved successfully!",
            subscription: newSubscription});
    } catch(error) {
        res
            .status(400)
            .json({
                message: "Failed to create",
                error_message: error.message,
            });
    }
};

exports.retrieveSubscriptions = async (req, res) => {
    try {
        const subscriptions = await Subscription.find();

        if (!subscriptions) {
            res.status(400).json({ message: "There are no subscriptions!" })
            return;
        }
        res.status(200).json({
            message: "Subscriptions retrieved",
            subscriptions: subscriptions });
    } catch (error) {
        res.status(400).json({ message: "Something went wrong!",
            error_message: error.message });
    }
};

exports.retrieveASpecificSubscription = async (req, res) => {
    try {
        console.log("are we getting to specific sub?")
        const id = req.params.subscription_id;
        const subscription = await Subscription.findById(id);
        if (!subscription) {
            res.status(400).json({ message: "Subscription was not found!" });
            return;
        }
        res.status(200).json({message: "Subscription is retrieved",
            subscription: subscription})
        console.log(subscription);
    } catch (error) {
        res
            .status(400)
            .json({ message: "Something went wrong!",
                error_message: error.message });
    }
};

exports.updateSubscription = async (req, res) => {
    try {
        const id = req.params.subscription_id;

        const existingSub = await Subscription.findById(id);
        if (!existingSub) {
            res.status(400).json({ message: "Subscription was not found" })
            return;
        }

        const subscription = {
            patient_id: req.body.patient_id ? req.body.patient_id : existingSub.patient_id,
            clinic_subscription: req.body.clinic_subscription ? req.body.clinic_subscription : existingSub.clinic_subscription,
            period_subscription: req.body.period_subscription ? req.body.period_subscription : existingSub.period_subscription,
            appointment_type: req.body.appointment_type ? req.body.appointment_type : existingSub.appointment_type,
            notification_preference: req.body.notification_preference ? req.body.notification_preference : existingSub.notification_preference,
            email_notification: req.body.email_notification ? req.body.email_notification : existingSub.email_notification,
            phone_notification: req.body.phone_notification ? req.body.phone_notification : existingSub.phone_notification
        }

        const newSubValidation = validateSubscription(subscription);
        if(!newSubValidation.success) {
            res.status(400).json({message: newSubValidation.message})
            return;
        }

        const updatedSubscription = await Subscription.findByIdAndUpdate(id, subscription);

        res.status(200).json({message: "Subscription has been updated",
            subscription: updatedSubscription})

    } catch (error) {
        res.status(400)
            .json({message: "Something went wrong!",
                error_message: error.message})
    }
}

exports.deleteSubscription = async (req, res) => {
    try {
        const id = req.params.subscription_id;
        const deletedSubscription = await Subscription.findByIdAndDelete(id)
        if(!deletedSubscription) {
            res.status(400)
                .json({ message: "Subscription was not found" });
            return;
        }
        res.status(200)
            .json({message: "Subscription was deleted successfully",
                subscription: deletedSubscription})
    } catch (error) {
        res.status(400)
            .json({message: "Something went wrong",
                error_message: error.message})
    }
}


function validateSubscription(subscription) {
    const {patient_id, appointment_type, clinic_subscription, period_subscription,
        notification_preference, email_notification, phone_notification} = subscription;

    console.log("are we validating?");
    console.log("my email is " + email_notification);
    if (!patient_id || !(clinic_subscription || period_subscription) || !appointment_type ||
        !notification_preference || !(email_notification || phone_notification)) {
        return {
            success: false, message: "must provide all required fields!"
        }
    } else {
        return {success: true, message: "Success"}
    }
}