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
            res.status(404).json({ message: "No appointments found"})
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
            res.status(404).json({ message: "No appointment found"})
            return;
        }
        res.status(200).json({ message: "Appointment retrieved", appointment: appointment });
    }catch (error) {
        res.status(400).json({ message: "Something went wrong!", error_message: error.message});
    }
}
exports.getPatientsAppointments = async (req, res) => {
    console.log("I got here");
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
        res.status(500).json({ message: "Something went wrong!", error_message: error.message});
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
                patient_id: patient_id,
                available: false},
                {new: true}
                );

        res.status(200).json({ message: "Patient added", appointment: appointment });
        
        }else{
            res.status(409).json({ message: "This appointment is already booked", existing_appointment: existing_appointment });
        }

    }catch (error) {
        res.status(500).json({ message: "Something went wrong!", error_message: error.message});
    }
}
exports.cancelAppointment = async (req, res) => {
    try{
        const app_id = req.params.appointment_id;
        const patient_id = req.params.patient_id;

        const existing_appointment = await Appointment.findById(app_id);
        if(!existing_appointment){
            res.status(404).json({ message: "No appointment found"})
            return;
        }

        if(existing_appointment.patient_id.equals(patient_id)){
            const appointment = await Appointment.findByIdAndUpdate(app_id, {
                patient_id: null,
                available: true},
                {new: true}
                );

        res.status(200).json({ message: "Appointment canceled", appointment: appointment });
        
        }else{
            res.status(409).json({ message: "This appointment is booked by someone else", existing_appointment: existing_appointment });
        }

    }catch (error) {
        res.status(500).json({ message: "Something went wrong!", error_message: error.message});
    }
}
exports.reserveAppointment = async (req, res) => {
    try{
        const app_id = req.params.appointment_id;

        const existing_appointment = await Appointment.findById(app_id);
        if(!existing_appointment){
            res.status(404).json({ message: "No appointment found"})
            return;
        }

        const appointment = await Appointment.findByIdAndUpdate(app_id, {
                available: false},
                {new: true}
                );

        res.status(200).json({ message: "Appointment reserved", appointment: appointment });

    }catch (error) {
        res.status(500).json({ message: "Something went wrong!", error_message: error.message});
    }
}
exports.unReserveAppointment = async (req, res) => {
    try{
        const app_id = req.params.appointment_id;

        const existing_appointment = await Appointment.findById(app_id);
        if(!existing_appointment){
            res.status(404).json({ message: "No appointment found"})
            return;
        }

        const appointment = await Appointment.findByIdAndUpdate(app_id, {
                available: true},
                {new: true}
                );

        res.status(200).json({ message: "Appointment reserved", appointment: appointment });

    }catch (error) {
        res.status(500).json({ message: "Something went wrong!", error_message: error.message});
    }
}