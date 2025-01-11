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