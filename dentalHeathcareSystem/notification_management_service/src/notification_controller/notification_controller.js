const Notification = require("../notification_schema/Notification");
const MqttBroker = require("../../mqtt-broker");


exports.createNotification = async (payload) => {
    let message;
    let response;
    let status;
    try {
        const newNotification = JSON.parse(payload);
        const notification = new Notification(newNotification);
        await notification.save();

        message = "Notification created successfully!"
        let stringNotification = JSON.stringify(notification);
        status = 200;
        response = status + "/" + message + "/" + stringNotification;
        return response;

    } catch (error) {
        status = 400;
        message = "Failed to create Notification. Something went wrong!"
        return status + "/" + message + "/" + error.message;
    }
};



exports.getAllNotifications = async (payload) => {
    let status;
    let message;
    try {
        const notifications = await Notification.find();
        if (!notifications) {
            status = 200;
            message = "Clinic has no notifications yet!";
            return status + "/" + message;
        }

        status = 200;
        message = "Notifications retrieved!";
        let stringifiedNotifications = JSON.stringify(notifications);
        let messageToReturn = status + "/" + message + "/" + stringifiedNotifications;
        return messageToReturn;

    } catch (error) {
        status = 400;
        error.message = "Something went wrong!";
        return status + "/" + error.message;
    }
};

exports.getSpecificNotification = async (topic, payload) => {
    let status;
    let message;
    try {
        let topicArray = topic.split("/");
        let id = topicArray[3];
        const notification = await Notification.findById(id);

        if (!notification) {
            status = 404;
            message = "This appointment slot has been filled";
            return status + "/" + message;
        }

            status = 200;
            message = "Notification retrieved!";
            let stringifiedNotification = JSON.stringify(notification);
            let messageToReturn = status + "/" + message + "/" + stringifiedNotification;
            return messageToReturn;

    } catch (error) {
        status = 400;
        error.message = "Something went wrong!";
        return status + "/" + error.message;
    }
}

/*=========== HTTP endpoints ==============*/


exports.registerNotification = async (req, res) => {
    try {
        const notification = {
            patient_id: req.body.patient_id,
            appointment_id: req.body.appointment_id,
            notification_message: req.body.notification_message,
            notification_status: req.body.notification_status
        };

        const notificationValidation = validateNotification(notification);
        if(!notificationValidation.success) {
            res.status(400).json({message: notificationValidation.message})
            return;
        }

        const newNotification = new Notification(notification);
        await newNotification.save();
        res.status(200).json({
            message: "Notification Created and saved successfully!",
            notification: newNotification});
    } catch(error) {
        res
            .status(400)
            .json({
                message: "Failed to create notification",
                error_message: error.message,
            });
    }
};


exports.retrieveNotifications = async (req, res) => {
    try {
        const notifications = await Notification.find();

        if (!notifications) {
            res.status(400).json({
                message: "Clinic has no notifications yet!"
            })
            return;
        }
        res.status(200).json({
            message: "Notifications retrieved",
            dentists: notifications
        });
    } catch (error) {
        res.status(400).json({ message: "Something went wrong!",
            error_message: error.message });
    }
}

exports.retrieveASpecificNotification = async (req, res) => {
    try {
        const id = req.params.notification_id;
        const notification = await Notification.findById(id);
        if (!notification) {
            res.status(400).json({
                message: "This appointment slot has been filled!"
            });
            return;
        }
        res.status(200).json({
            message: "Notification is retrieved",
            notification: notification})
        console.log(notification);

    } catch (error) {
        res
            .status(400)
            .json({ message: "Something went wrong!",
                error_message: error.message });
    }
};

/* ==================== non-CRUD methods =========================  */

function validateNotification(notification) {
    const {patient_id, appointment_id, notification_message, notification_status} = notification;

    console.log("validating notifications " + notification);
    if (!patient_id || !appointment_id || !notification_message || !notification_status)  {
        return {
            success: false, message: "must provide all notification information!"
        }
    } else {
        return {success: true, message: "Success"}
    }
}