const mongoose = require('mongoose'); 
var emailValidator = require("validator");
var Schema = mongoose.Schema;


var patientSchema = new Schema({
  name: { type: String, required: true },
  address: { type: String, required: true },
  email: {
    type: String,
    required: true,
    validate: [emailValidator.isEmail, "invalid email"],
    unique: true
  },
  phone_number: { type: String, required: true, match: [ /^\d+$/, "Phone number has to be only digits"]}, 
  password: {type: String, required: true},
  ssn: { type: String, required: true, unique: [true,'This Ssn already exists ']},
  medical_journal: [
    {
      journal: { type: String, required: true },
      date: { type: String, required: true }
    },
  ],
  appointments: [{
      appointment_id: {type: mongoose.Schema.Types.ObjectId, ref: 'Appointment'}
    },
  ],
  region: {
      type: String,
      required: true
  }
});

module.exports = mongoose.model("patient", patientSchema);