const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const emailValidator = require("validator");


var subscriptionSchema = new Schema({

    patient_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref:"Patient"
    },

    clinic_subscription: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Clinic',
        isActive: Boolean
        },

    period_subscription: {
        sub_from: {
            type: Date,
            required: true
        },
        sub_until: {
            type: Date,
            required: true
        },
        isActive: Boolean
    },

    appointment_type: {
        type: String,
        required: true
    },

    notification_preference: {
        type: Boolean,
        required: true
    },

    email_notification: {
        type: String,
        validate: [emailValidator.isEmail, "invalid email"],
        unique: true,
        sparse: true
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