const mongoose = require('mongoose');
var emailValidator = require("validator");
var Schema = mongoose.Schema;

var dentistSchema = new Schema({

    clinic_id:{
        type: String, required: true
    },

    name: {
        type: String, required: true
    },

    address: {
        type: String, required: true
    },

    phone_number: {
        type: String, required: true
    },

    email: {
        type: String, required: true,
        validate: [emailValidator.isEmail, "invalid email"]
    },

    password: {
        type: String, required: true,
    },

    appointments: [{
        appointment_id: {type: mongoose.Schema.Types.ObjectId, ref: 'Appointment'}
    }],

});
module.exports = mongoose.model("dentist", dentistSchema);