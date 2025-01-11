const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let subscriptionSchema = new Schema({

    patient_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref:"Patient"
    },

    clinic_subscription: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Clinic',
        isActive: Boolean
        },

    period_sub_from: {
            type: String
        },
    period_sub_until: {
            type: String
        },

    appointment_type: {
        type: String,
        required: false
    },
    notification_preference: {
        type: Boolean,
        required: true
    },

    email_notification: {
        type: String,
    },

    phone_notification: {
        type: String,
        required: false,
        match: [ /^\d+$/, "Phone number has to be only digits"]
    },

    createdAt: {
        type: Date,
        default: Date.now()
    }


});
module.exports = mongoose.model(
    "subscription", subscriptionSchema);
