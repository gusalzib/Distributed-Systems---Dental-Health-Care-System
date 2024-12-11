const Patient = require("../models/Patient.js");
const emailValidator = require('validator');

exports.createPatient = async (payload) => {
    try {
        var status = 0; 
        var message = "";

        const patient = JSON.parse(payload);
        
        const email = patient.email;
        const exisitingPatient = await Patient.findOne({ email });

        // check if patient already exist. If not then check if email is valid
        if (exisitingPatient) {
            status = 400
            message = "Email already exists."
            return status +"/"+ message;
                
        } else if (!emailValidator.isEmail(email)) {
            status = 400
            message = "Invalid email"
            return status +"/"+ message;
        }

        var newPatient = new Patient(patient);

        await newPatient.save();
        console.log("Patient =", newPatient);

        var patient_id = newPatient._id;
        var retrievedPatient = await Patient.find(patient_id);

        // make sure the patient is created and saved in the database. 
        if (!patient_id) {
            status = 400
            message = "failed to register patient";
            return status +"/"+ message 
        }else if (!retrievedPatient) {
            status = 400
            message = "failed to register patient";
            return status +"/"+ message 
        }


        var stringPatient = JSON.stringify(retrievedPatient); 

        message = "Patient registered successfully"
        console.log(message);
        status = 200;
        return status + "/" + message + "/" + stringPatient;
        
    }catch(error){
        if (error.name === 'ValidatorError') {
            status = 400
            message = "Invalid email"
            return status +"/"+ message;

        }
        else if (error.code === 11000 && error.keyValue?.ssn){
            status = 400
            message = "SSN already exists"
            return status +"/"+ message;
        } else {            
            status = 400
            message = "Something went wrong. Failed to register patient."
            return status +"/"+ message;
        }
    }
}

exports.fetchAllPatients = async (payload) => {
    try {
        
        var status = "";
        var message = "";

        const patients = await Patient.find();

        if(patients.length === 0){
            status = 404
            message = "No patients found"
            return status +"/"+ message
        }

        status = 200;
        message = "All patients retrieved";
        var stringPatients = JSON.stringify(patients);
        
        return status + "/" + message + "/" + stringPatients;

    }catch (error) {
        status = 400; 
        message = "Something went wrong!" 
        return status + "/" + message + "/" + error.message;
    }
}

exports.fetchSpecificPatient = async (topic) => {
    try{
        var status = 0;
        var message = "";

        var topicArr = topic.split("/");
        const id = topicArr[3];
        console.log("id: ", id);
        
        const patient = await Patient.findById(id);
        if(!patient){
            status = 404
            message = "No patient found";
            return status +"/"+ message;
        }
        
        status = 200;
        message = "Patient retrieved";
        var stringPatient = JSON.stringify(patient);
        
        return status + "/" + message + "/" + stringPatient;

    }catch (error) {
        status = 400; 
        message = "Something went wrong!" 
        return status + "/" + message + "/" + error.message;
    }
}

exports.updateSpecificPatient = async (payload) => {
    
}

exports.deleteSpecificPatient = async (payload) => {
    
}

/* XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX HTTP METHODS XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX */
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
        console.log("NO PATIENT FOUND");
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
    // console.log(error.message);
    console.log("catch");
    res.status(400).json({message: "Failed to register patient",message: error.message});
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
