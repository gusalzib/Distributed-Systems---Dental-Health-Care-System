const Appointment = require("../models/Appointment.js");

exports.createAppointment = async (req, res) => {
    try {
        var newAppointment = new Appointment();
    
        const patient_id = req.body.patient_id;
        const dentist_id = req.body.dentist_id;
        const dentist_clinic_id = req.body.dentist_clinic_id;
        const date_and_time_from = req.body.date_and_time_from;
        const date_and_time_until = req.body.date_and_time_until;
        const available = req.body.available;
        
    
        newAppointment.patient_id = patient_id;
        newAppointment.dentist_id = dentist_id;
        newAppointment.dentist_clinic_id = dentist_clinic_id;
        newAppointment.date_and_time_from = date_and_time_from;
        newAppointment.date_and_time_until = date_and_time_until;
        newAppointment.available = available;
        
    
        await newAppointment.save();
    
        res
          .status(200)
          .json({
            message: "Appointment created successfully",
            appointment: newAppointment,
          });
      } catch (error) {
        res
          .status(400)
          .json({
            message: "Failed to create appointment",
            error_message: error.message,
          });
      }
    };
