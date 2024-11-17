const mongoose = require('mongoose'); 
var emailValidator = require("validator");
var Schema = mongoose.Schema;

var patientSchema = new Schema({
  name: { type: String, required: true },
  address: { type: String, required: true },
  email: {
    type: String,
    required: true,
    validate: [emailValidator.isEmail, "invalid email"]
  },
  phone_number: { type: String, required: true },
  ssn: { type: String, required: true },
  medical_journal: [
    {
      journal: { type: String, required: true },
      date: { type: String, required: true }
    },
  ],
  appointments: [
    {
      appointment_id: mongoose.Schema.Types.ObjectId
      // ref: "Appointment",
    },
  ]
});

module.exports = mongoose.model("patient", patientSchema);