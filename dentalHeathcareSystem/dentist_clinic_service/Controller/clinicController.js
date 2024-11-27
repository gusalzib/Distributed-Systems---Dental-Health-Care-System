var Clinic = require("../models/clinic.js");

exports.createClinic = async (req, res) => {
    
    try {
        var newClinic = new Clinic();

        var name = req.body.name;
        var address = req.body.address;
        var email = req.body.email;
        var phoneNumber = req.body.phoneNumber;
       
        newClinic.name = name;
        newClinic.address = address;
        newClinic.email = email;
        newClinic.phoneNumber = phoneNumber;
        newClinic.appointments = [];
        newClinic.dentists = [];

        await newClinic.save();
        console.log("new clinic =", newClinic)

        res.status(200).json({message: "Clinic registered successfully", clinic: newClinic})

        
    }catch(error) {
        res.status(400).json({message: "Failed to create Clinic", error_message: error.message});
    }
};