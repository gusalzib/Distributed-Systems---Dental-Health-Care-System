const Appointment = require("../models/Appointment.js");


exports.createAppointment = async (req, res) => {
    try {
        var newAppointment = new Appointment();
    
        const patient_id = null;
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
    
        res.status(200).json({message: "Appointment created successfully",appointment: newAppointment });

      }catch(error) {
        res.status(400).json({message: "Failed to create appointment",error_message: error.message });
      }
    };
exports.getAllAppointments = async (req, res) => {
    try{
        const appointments = await Appointment.find();
        if(appointments.lenght === 0){
            res.status(404).json({ message: "No appointments found"})
            return;
        }
        res.status(200).json({ message: "All appointments retrieved", appointments: appointments });
    }catch (error) {
        res.status(400).json({ message: "Something went wrong!", error_message: error.message });
    }
}
exports.getSpecificAppointment = async (req, res) => {
    try{
        const id = req.params.appointment_id;
        const appointment = await Appointment.findById(id);
        if(!appointment){
            res.status(404).json({ message: "No appointment found"})
            return;
        }
        res.status(200).json({ message: "Appointment retrieved", appointment: appointment });
    }catch (error) {
        res.status(400).json({ message: "Something went wrong!", error_message: error.message});
    }
}
exports.getPatientsAppointments = async (req, res) => {
    try{
        const patient_id = req.params.patient_id;    
        const appointments = await Appointment.find();
        if(appointments.length === 0){
            res.status(404).json({ message: "No appointments found"})
            return;
        }

        const patientAppointments = appointments.filter(appointment => appointment.patient_id && appointment.patient_id.equals(patient_id));
        if(patientAppointments.length === 0){
            res.status(400).json({ message: "This patient has no appointments booked"})
            return;
        }else{
            res.status(200).json({ message: "Appointments retrieved",patientAppointments: patientAppointments});
        }

    }catch (error) {
        res.status(400).json({ message: "Something went wrong!", error_message: error.message});
    }
}

exports.updateAppointment = async (req, res) => {
    try{
        const id = req.params.appointment_id;

        const existing_appointment = await Appointment.findById(id);
        if(!existing_appointment){
            res.status(400).json({ message: "No appointment found"})
            return;
        }
        
        var patient_id = req.body.patient_id ? req.body.patient_id : existing_appointment.patient_id;
        var dentist_id = req.body.dentist_id ? req.body.dentist_id : existing_appointment.dentist_id;
        var dentist_clinic_id = req.body.dentist_clinic_id ? req.body.dentist_clinic_id : existing_appointment.dentist_clinic_id;
        var type_of_appointment = req.body.type_of_appointment ? req.body.type_of_appointment: existing_appointment.type_of_appointment;
        var date_and_time_from = req.body.date_and_time_from ? req.body.date_and_time_from: existing_appointment.date_and_time_from;
        var date_and_time_until = req.body.date_and_time_until ? req.body.date_and_time_until: existing_appointment.date_and_time_until;
        var available = req.body.available !== undefined ? req.body.available: existing_appointment.available;
        
        var updatedAppointment = await Appointment.findByIdAndUpdate(id, {
            patient_id: patient_id,
            dentist_id: dentist_id,
            dentist_clinic_id: dentist_clinic_id,
            type_of_appointment: type_of_appointment,
            date_and_time_from: date_and_time_from,
            date_and_time_until: date_and_time_until,
            available: available},
            {new: true}
        )

        res.status(200).json({ message: "Appointment updated", updatedAppointment: updatedAppointment });

    }catch (error) {
        res.status(400).json({ message: "Something went wrong!", error_message: error.message});
    }
}
exports.deleteAppointment = async (req, res) => {
    try{
        const id = req.params.appointment_id;
        const appointment = await Appointment.findByIdAndDelete(id);
        if(!appointment){
            res.status(404).json({ message: "No appointment found"})
            return;
        }
        res.status(200).json({ message: "Appointment deleted", appointment: appointment });
    }catch (error) {
        res.status(400).json({ message: "Something went wrong!", error_message: error.message});
    }
}
exports.getAvailableAppointments = async (req, res) => {
    try{
        const allAppointments = await Appointment.find();
        if(allAppointments.lenght === 0){
            res.status(404).json({ message: "No appointments found"})
            return;
        }
        const appointments = allAppointments.filter(allAppointments => allAppointments.available && allAppointments.available === true )
        res.status(200).json({ message: "All available appointments retrieved", appointments: appointments });
    }catch (error) {
        res.status(400).json({ message: "Something went wrong!", error_message: error.message});
    }
}
