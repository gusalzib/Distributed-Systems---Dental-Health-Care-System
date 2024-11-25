const Patient = require("../models/Patient.js");

exports.registerPatient = async (req, res) => {
  try {
    var newPatient = new Patient();

    const patientName = req.body.name;
    const patientEmail = req.body.email;
    const patientPhoneNumber = req.body.phone_number;
    const patientAddress = req.body.address;
    const patientSSN = req.body.ssn;
    
    const patientMedicalJournal = req.body.medical_journal;

    newPatient.name = patientName;
    newPatient.email = patientEmail;
    newPatient.phone_number = patientPhoneNumber;
    newPatient.address = patientAddress;
    newPatient.ssn = patientSSN;
    newPatient.appointments = [];
    newPatient.medical_journal = patientMedicalJournal;

    await newPatient.save();

    res
      .status(200)
      .json({
        message: "Patient registered successfully",
        patient: newPatient,
      });
  } catch (error) {
    res
      .status(400)
      .json({
        message: "Failed to register patient",
        error_message: error.message,
      });
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
        // var appointments = req.body.appointments ? req.body.appointments : existingPatient.appointments

        var updatedPatient = await Patient.findByIdAndUpdate(id, {
            name: name,
            email: email,
            phone_number: phone_number,
            address: address, 
            ssn: ssn,
            medical_journal: medical_journal
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
exports.addAppoinmentToPatient = async (req, res) => {
    try {
        const id = req.params.patient_id; 
        const existingPatient = await Patient.findById(id);

        if (!existingPatient) {
            res.status(400).json({ message: "Could not find patient account" })
            return
        }

        var addAppointment = req.params.appointmentID 

        console.log("this is addAppointment = ", addAppointment)
    
        

        var bookedAppointment ={appointment_id: addAppointment} 


        if (addAppointment !== null){
            console.log("is not the same")
            var newUpdatedPatient = await Patient.findById(id);
            newUpdatedPatient.appointments.push(bookedAppointment);
            newUpdatedPatient.save();

            console.log("Updated P = ", newUpdatedPatient)
            res.status(200).json({message: "Patient information updated successfully", patient: newUpdatedPatient})
        }else{
            res.status(200).json({message: "Patient information updated successfully", patient: existingPatient})
        }

    } catch (error) {
        res.status(400).json({message: "Something went wrong", error_message: error.message})
    }
}
