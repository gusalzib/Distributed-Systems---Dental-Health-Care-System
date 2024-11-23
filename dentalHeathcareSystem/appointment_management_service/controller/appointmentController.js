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
exports.getAllAppointments = async (req, res) => {
    try{
        const appointments = await Appointment.find();
        if(appointments.lenght === 0){
            res.status(400).json({ message: "No appointments found"})
            return;
        }
        res.status(200).json({ message: "All appointments retrieved", appointments: appointments });
    }catch (error) {
        res.status(400).json({ message: "Something went wrong!", error_message: error.message});
    }
}
exports.getSpecificAppointment = async (req, res) => {
    try{
        const id = req.params.appointment_id;
        const appointment = await Appointment.findById(id);
        if(!appointment){
            res.status(400).json({ message: "No appointment found"})
            return;
        }
        res.status(200).json({ message: "Appointment retrieved", appointment: appointment });
    }catch (error) {
        res.status(400).json({ message: "Something went wrong!", error_message: error.message});
    }
}
exports.bookAppointment = async (req, res) => {
    try{
        const app_id = req.params.appointment_id;
        const patient_id = req.params.patient_id;

        const existing_appointment = await Appointment.findById(app_id);
        if(!existing_appointment){
            res.status(400).json({ message: "No appointment found"})
            return;
        }

        if(existing_appointment.patient_id === null){
            const appointment = await Appointment.findByIdAndUpdate(app_id, {
                patient_id: patient_id
                });

        res.status(200).json({ message: "Patient added", appointment: appointment });
        
        }else{
            res.status(409).json({ message: "This appointment is already booked", existing_appointment: existing_appointment });
        }

    }catch (error) {
        res.status(500).json({ message: "Something went wrong!", error_message: error.message});
    }
}