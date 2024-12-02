const Patient = require("../models/Patient.js");
const emailValidator = require('validator');

exports.registerPatient = async (req, res) => {
  try {
    const {email} = req.body;

    const patient = await Patient.findOne({ email });
        if (patient) {
            res.status(400).json({ message: "Email already exists." });
            return;
        } else if(!emailValidator.isEmail(email)){
            res.status(400).json({ message: "Invalid email" });
            return;
        }

    var newPatient = new Patient();

    const patientName = req.body.name;
    const patientEmail = req.body.email;
    const patientPhoneNumber = req.body.phone_number;
    const patientAddress = req.body.address;
    const patientSSN = req.body.ssn;
    const patientMedicalJournal = req.body.medical_journal;

    if(!patientName || !patientEmail || !patientPhoneNumber || !patientAddress || !patientSSN ){
        res.status(422).send({message:"Missing patient information. Fields with * can not be empty"});
        return;
    }
    if(isNaN(patientPhoneNumber)){
        res.status(400).json({ message: "Phone number has to be a number" });
        return;
    }
    if(isNaN(patientSSN)){
        res.status(400).json({ message: "Ssn has to be a number" });
        return;
    }

    newPatient.name = patientName;
    newPatient.email = patientEmail;
    newPatient.phone_number = patientPhoneNumber;
    newPatient.address = patientAddress;
    newPatient.ssn = patientSSN;
    newPatient.appointments = [];
    newPatient.medical_journal = patientMedicalJournal;

    await newPatient.save();

    var patientId = newPatient._id;
    if (!patientId) {
        res.status(400).json({ message: "failed to register patient" });
        return; 
    }
    res.status(200).json({message: "Patient registered successfully",patient: newPatient});

  }catch(error){
    if (error.name === 'ValidatorError') {
        res.status(400).json({ message: "invalid email" });
        return;
    }
    else if (error.code === 11000 && error.keyValue?.ssn){
        res.status(400).json({ message: "Ssn is not uniqe"});
        return;
    }
    res.status(400).json({message: "Failed to register patient"});
  }
};

exports.retrieveAllPatients = async (req, res) => { 
    try {
        const patients = await Patient.find();

        if (!patients) {
            res.status(400).json({ message: "No patients found!" })
            return; 
        }
        res
          .status(200)
          .json({ message: "All patients retrieved", patients: patients });
    } catch (error) {
        res.status(400).json({ message: "Something went wrong!", error_message: error.message });
    }
}


exports.retrieveSpecificPatient = async (req, res) => {
    try {
        const id = req.params.patient_id;
        const patient = await Patient.findById(id);
        console.log(patient)
        if (!patient) {
            res.status(400).json({ message: "No patients found!" });
            return;
        }
        res.status(200).json({message: "All patients retrieved", patients: patient})
  } catch (error) {
    res
      .status(400)
      .json({ message: "Something went wrong!", error_message: error.message });
  }
};


exports.updatePatient = async (req, res) => {
    try {
        const id = req.params.patient_id; 
        const existingPatient = await Patient.findById(id);

        if (!existingPatient) {
            res.status(400).json({ message: "Could not find patient account" })
            return
        }

        var name = req.body.name ? req.body.name : existingPatient.name
        var email = req.body.email ? req.body.email : existingPatient.email
        var phone_number = req.body.phone_number ? req.body.phone_number : existingPatient.phone_number
        var ssn = req.body.ssn ? req.body.ssn : existingPatient.ssn
        var address = req.body.address ? req.body.address : existingPatient.address
        var medical_journal = req.body.medical_journal ? req.body.medical_journal : existingPatient.medical_journal
        var appointments = req.body.appointments ? req.body.appointments : existingPatient.appointments



        var updatedPatient = await Patient.findByIdAndUpdate(id, {
            name: name,
            email: email,
            phone_number: phone_number,
            address: address, 
            ssn: ssn,
            medical_journal: medical_journal,
            appointments: appointments
        })

            res.status(200).json({message: "Patient information updated successfully", patient: updatedPatient})
        
    } catch (error) {
        res.status(400).json({message: "Something went wrong", error_message: error.message})
    }
}

exports.deletePatientByID = async (req, res) => {
    try {
        const id = req.params.patient_id;
        const deletedPatient = await Patient.findByIdAndDelete(id)
            if (!deletedPatient) {
                res.status(400).json({ message: "Could not find patient account" });
                return;
            }
        res.status(200).json({message: "Patient account deleted successfully", patient: deletedPatient})

    } catch (error) {
        res.status(400).json({message: "Something went wrong", error_message: error.message})
    }
}
