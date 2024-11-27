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
exports.retrieveAllClinics = async (req, res) => { 
    try {
        const clinics = await Clinic.find();

        if (!clinics) {
            res.status(400).json({ message: "No clinics found!" })
            return; 
        }
        res.status(200).json({ message: "All clinics retrieved", clinics: clinics });
    } catch (error) {
        res.status(400).json({ message: "Something went wrong!", error_message: error.message });
    }
}
exports.retrieveSpecificClinic = async (req, res) => {
    try {
        const id = req.params.clinic_id;
        const clinic = await Clinic.findById(id);
        
        if (!clinic) {
            res.status(400).json({ message: "No clinic found!" });
            return;
        }
        res.status(200).json({message: "Clinic retrieved successfully!", clinic: clinic})
  } catch (error) {
    res.status(400).json({ message: "Something went wrong!", error_message: error.message });
  }
};
exports.updateClinic = async (req, res) => {
    try {
        const id = req.params.clinic_id; 
        const existingClinic = await Clinic.findById(id);

        if (!existingClinic) {
            res.status(400).json({ message: "Could not find clinic" })
            return
        }

        var name = req.body.name ? req.body.name : existingClinic.name;
        var email = req.body.email ? req.body.email : existingClinic.email;
        var phoneNumber = req.body.phoneNumber ? req.body.phoneNumber : existingClinic.phoneNumber;        
        var address = req.body.address ? req.body.address : existingClinic.address;
        var dentists = req.body.dentists ? req.body.dentists : existingClinic.dentists;
        var appointments = req.body.appointments ? req.body.appointments : existingClinic.appointments;

        var updatedClinic = await Clinic.findByIdAndUpdate(id, {
            name: name,
            email: email,
            phoneNumber: phoneNumber,
            address: address, 
            dentists: dentists,
            appointments: appointments},
            {new: true}
        );
            res.status(200).json({message: "Clinic information updated successfully", clinic: updatedClinic})
        
    } catch (error) {
        res.status(400).json({message: "Something went wrong", error_message: error.message})
    }
};
exports.deleteClinic = async (req, res) => {
    try{
        const id = req.params.clinic_id;
        const clinic = await Clinic.findByIdAndDelete(id);
        if(!clinic){
            res.status(404).json({ message: "No clinic found"})
            return;
        }
        res.status(200).json({ message: "Clinic deleted", clinic: clinic });
    }catch (error) {
        res.status(400).json({ message: "Something went wrong!", error_message: error.message});
    }
}
