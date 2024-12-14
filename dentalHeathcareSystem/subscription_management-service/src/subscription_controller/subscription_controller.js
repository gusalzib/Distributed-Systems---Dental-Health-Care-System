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

function validateSubscription(subscription) {
    const {patient_id, appointment_type, clinic_subscription, period_subscription,
        notification_preference, email_notification, phone_notification} = subscription;

    console.log("are we validating?")
    if (!patient_id || !(clinic_subscription || period_subscription) || !appointment_type ||
        !notification_preference || !(email_notification || phone_notification)) {
        return {
            success: false, message: "must provide all required fields!"
        }
    } else {
        return {success: true, message: "Success"}
    }
}