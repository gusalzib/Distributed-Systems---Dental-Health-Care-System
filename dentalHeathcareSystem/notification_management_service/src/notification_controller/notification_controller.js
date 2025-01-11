const Subscription = require("../notification_schema/Notification");
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