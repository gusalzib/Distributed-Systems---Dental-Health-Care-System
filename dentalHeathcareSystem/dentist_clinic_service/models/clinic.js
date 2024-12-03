const mongoose = require('mongoose');
var emailValidator = require("validator");
var Schema = mongoose.Schema;

var clinicSchema = new Schema({
    name: {type: String, required: true},
    address: {type: String, required: true},
    email: {type: String,required: true, validate: [emailValidator.isEmail, "invalid email"]},
    phoneNumber: { type: String, required: true, match: [ /^\d+$/, "Phone number has to be only digits"]},
    appointments: [{
        appointment_id: {type: mongoose.Schema.Types.ObjectId, ref: 'Appointment'}
    }],
    dentists: [{
        dentist_id: {type: mongoose.Schema.Types.ObjectId, ref: 'Dentist'}
    }]
})

module.exports = mongoose.model("clinic",clinicSchema);