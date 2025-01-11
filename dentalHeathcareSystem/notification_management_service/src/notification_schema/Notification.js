const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let notificationSchema = new Schema({

    patient_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref:"Patient",
        // type: String
    },

    appointment_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Appointment'
        // type: String
    },

    notification_message: {
        type: String
    },

    notification_status: {
        type: String
    },

    createdAt: {
        type: Date,
        default: Date.now()
    }

});
module.exports = mongoose.model(
    "notification", notificationSchema);