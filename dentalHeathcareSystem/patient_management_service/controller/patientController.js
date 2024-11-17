const Patient = require("../models/Patient.js");

exports.registerPatient = async (req, res) => {
  try {
    var newPatient = new Patient();

    const patientName = req.body.name;
    const patientEmail = req.body.email;
    const patientPhoneNumber = req.body.phone_number;
    const patientAddress = req.body.address;
    const patientSSN = req.body.ssn;
    const patientAppointments = req.body.appointments;
    const patientMedicalJournal = req.body.medical_journal;

    newPatient.name = patientName;
    newPatient.email = patientEmail;
    newPatient.phone_number = patientPhoneNumber;
    newPatient.address = patientAddress;
    newPatient.ssn = patientSSN;
    newPatient.appointments = patientAppointments;
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

