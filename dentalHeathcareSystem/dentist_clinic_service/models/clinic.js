const mongoose = require('mongoose');
var emailValidator = require("validator");
const geocoder = require('../utils/geocoder')
var Schema = mongoose.Schema;

var clinicSchema = new Schema({
    name: {type: String, required: true},
    address: { type: String, required: true },
    location: {
        type: {
            type: String,
            enum: ['Point']
        },
        coordinates: {
            type: [Number],
            index: '2dsphere'
        },
        formattedAddress: String
    },
    email: {type: String,required: true, validate: [emailValidator.isEmail, "invalid email"]},
    phoneNumber: { type: String, required: true, match: [ /^\d+$/, "Phone number has to be only digits"]},
    appointments: [{
        appointment_id: {type: mongoose.Schema.Types.ObjectId, ref: 'Appointment'}
    }],
    dentists: [{
        dentist_id: {type: mongoose.Schema.Types.ObjectId, ref: 'Dentist'}
    }]
})

// geocoder 
clinicSchema.pre('save', async function (next) {
    const loc = await geocoder.geocode(this.address);
    this.location = {
        type: 'Point',
        coordinates: [loc[0].longitude, loc[0].latitude],
        formattedAddress: loc[0].formattedAddress
    }

    this.address = undefined
    next();
    // console.log(location);
    
})

module.exports = mongoose.model("clinic",clinicSchema);