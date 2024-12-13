const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let subscriptionSchema = new Schema({

    patient_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref:"Patient"
    },

    subscription_type: [{
        clinic_subscription: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Clinic',
            isActive: Boolean
        },

        period_subscription: {
            sub_from: Date,
            sub_until: Date,
            required: true,
            isActive: Boolean
        }
    }],

    appointment_type: {
        type: String,
        required: true
    },

    notification_preference: {
        type: Boolean,
        required: true
    },

    notification_means: {
        type: String,
        required: true
    },

    createdAt: {
        type: Date,
        default: Date.now()
    }

});
module.exports = mongoose.model(
    "subscription",subscriptionSchema);