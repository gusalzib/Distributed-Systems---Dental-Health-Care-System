const mongoose = require('mongoose');
var Schema = mongoose.Schema;

var appointmentSchema = new Schema({
    patient_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref:"Patient"
    },
    dentist_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref:"Dentist"
},
    dentist_clinic_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Clinic",
},
    type_of_appointment: {
        type: String,
        required: true
    },
    date_and_time_from: {
        type: Date,
        required: true
    },
    date_and_time_until: {
        type: Date,
        required: true
    },
    available: {
        type: Boolean,
        required: true
    },
    region: {
        type: String,
        required: true
    }
})

module.exports = mongoose.model("appointment",appointmentSchema);