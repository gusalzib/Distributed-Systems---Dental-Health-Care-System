const Appointment = require("../models/Appointment.js");
const MqttBroker = require("../mqtt-broker");




exports.makeAppointment = async (payload) => {
    try {
        var status = 0;
        const newAppointment = JSON.parse(payload);
        console.log("new appointment =",newAppointment);

        const newAppointmentValidation = validateAppointment(newAppointment);
        if(!newAppointmentValidation.success) {
            console.log(newAppointmentValidation.message);
            status = 400
            return status +"/"+ newAppointmentValidation.message;
        }
     
        const appointment = new Appointment(newAppointment);
        console.log("Appointment =",appointment);

     

        message = "Appointment created"
        console.log(message);
        var stringAppointment = JSON.stringify(appointment) 
        status = 200;
        response = status +"/"+ message +"/"+ stringAppointment;
        
        return response;

    } catch(error) {
        status = 400
        console.log(error.message);
        return status +"/"+ error.message;
    }
};
exports.getAppointments = async (payload) => {
    try{
        const appointments = await Appointment.find().sort({"date_and_time_from": 1});
        var status = "";
        if(appointments.lenght === 0){
            status = 404
            message = "No appointments found"
            console.log(message);
            return status +"/"+ message
        }
        status = 200;
        message = "All appointments retrieved";
        console.log(message);
        var stringAppointments = appointments.join();
        return status +"/"+ message +"/"+ stringAppointments
    }catch (error) {
        status = 400
        console.log(error.message);
        return status +"/"+ error.message
    }
};

exports.getOneAppointment = async (payload) => {
    try{
        var status = 0;
        const id = JSON.parse(payload);
        const appointment = await Appointment.findById(id);
        if(!appointment){
            status = 404
            message = "No appointment found";
            return status +"/"+ message;
        }
        
        status = 200;
        message = "Appointment retrieved";
        var stringAppointment = JSON.stringify(appointment);
        return status +"/"+ message +"/"+ stringAppointment
    }catch (error) {
        status = 400;
        return status +"/"+ error.message;
    }
};

exports.updateOneAppointment = async (_id, payload) => {
    try {
            
        var status = 0;
        const existing_appointment = await Appointment.findById(_id);
        if(!existing_appointment){
            status = 400;
            message = "No appointment found";
            return status +"/"+ message;
        }
        var newAppointment = JSON.parse(payload)
        console.log("new appoinment =",newAppointment);
        console.log("testing attribute =",newAppointment.date_and_time_from);

        const appointment = {
            patient_id: newAppointment.patient_id ? newAppointment.patient_id : existing_appointment.patient_id,
            dentist_id: newAppointment.dentist_id ? newAppointment.dentist_id: existing_appointment.dentist_id,
            dentist_clinic_id: newAppointment.dentist_clinic_id ? newAppointment.dentist_clinic_id : existing_appointment.dentist_clinic_id,
            type_of_appointment: newAppointment.type_of_appointment ? newAppointment.type_of_appointment : existing_appointment.type_of_appointment,
            date_and_time_from: newAppointment.date_and_time_from ? newAppointment.date_and_time_from: existing_appointment.date_and_time_from,
            date_and_time_until: newAppointment.date_and_time_until ? newAppointment.date_and_time_until: existing_appointment.date_and_time_until,
            available: newAppointment.available !== undefined ? newAppointment.available: existing_appointment.available
        }

        const newAppointmentValidation = validateAppointment(appointment);
        if(!newAppointmentValidation.success) {
            status = 400;
            console.log("is this the one complaining?");
            message = newAppointmentValidation.message;
            return status +"/"+ newAppointmentValidation.message;
        };

        const updatedAppointment = await Appointment.findByIdAndUpdate(_id, appointment, {new: true});

        status = 200; 
        message= "Appointment updated";
        var stringUpdatedAppointment = JSON.stringify(updatedAppointment);
        return status +"/"+ message +"/"+ stringUpdatedAppointment;


    } catch (error) {
        status = 400;
        return status +"/"+ error.message;
                
        }
};




exports.createAppointment = async (req, res) => {
    try {
        const appointment = {
            patient_id: req.body.patient_id,
            dentist_id: req.body.dentist_id,
            dentist_clinic_id: req.body.dentist_clinic_id,
            type_of_appointment: req.body.type_of_appointment,
            date_and_time_from: req.body.date_and_time_from,
            date_and_time_until: req.body.date_and_time_until,
            available: req.body.available
        }

        const newAppointmentValidation = validateAppointment(appointment);
        if(!newAppointmentValidation.success) {
            res.status(400).json({message: newAppointmentValidation.message})
            return;
        }

        const newAppointment= new Appointment(appointment);
        await newAppointment.save();
        res.status(200)
            .json({
            message: "Appointment created successfully",
            appointment: newAppointment
        });
    } catch(error) {
        res
            .status(400)
            .json({
                message: "Failed to create appointment",
                error_message: error.message
            });
    }
};

exports.getAllAppointments = async (req, res) => {
    try{
        const appointments = await Appointment.find().sort({"date_and_time_from": 1});

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
    try {
        const id = req.params.appointment_id;

        const existing_appointment = await Appointment.findById(id);
        if(!existing_appointment){
            res.status(400).json({ message: "No appointment found"})
            return;
        }

        const appointment = {
            patient_id: req.body.patient_id ? req.body.patient_id : existing_appointment.patient_id,
            dentist_id: req.body.dentist_id ? req.body.dentist_id : existing_appointment.dentist_id,
            dentist_clinic_id: req.body.dentist_clinic_id ? req.body.dentist_clinic_id : existing_appointment.dentist_clinic_id,
            type_of_appointment: req.body.type_of_appointment ? req.body.type_of_appointment: existing_appointment.type_of_appointment,
            date_and_time_from: req.body.date_and_time_from ? req.body.date_and_time_from: existing_appointment.date_and_time_from,
            date_and_time_until: req.body.date_and_time_until ? req.body.date_and_time_until: existing_appointment.date_and_time_until,
            available: req.body.available !== undefined ? req.body.available: existing_appointment.available
        }

        const newAppointmentValidation = validateAppointment(appointment);
        if(!newAppointmentValidation.success) {
            res.status(400).json({message: newAppointmentValidation.message})
            return;
        };

        const updatedAppointment = await Appointment.findByIdAndUpdate(id, appointment, {new: true});

        res.status(200).json({ message: "Appointment updated",
            appointment: updatedAppointment });

    } catch (error) {
        res.status(400)
            .json({ message: "Something went wrong!",
                error_message: error.message});
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
        const allAppointments = await Appointment.find().sort({"date_and_time_from": 1});
        if(allAppointments.lenght === 0){
            res.status(404).json({ message: "No appointments found"})
            return;
        }
        const appointments = allAppointments.filter(allAppointments => allAppointments.available && allAppointments.available === true )
        res.status(200).json({ message: "All available appointments retrieved", appointments: appointments });
    }catch (error) {
        res.status(400).json({ message: "Something went wrong!", error_message: error.message});
    }
},
exports.getClinicAppointments = async (req, res) => {
    try{
        const clinicID = req.params.clinicID;
        const allAppointments = await Appointment.find().sort({"date_and_time_from": 1});
       
        if(allAppointments.lenght === 0){
            res.status(404).json({ message: "No appointments found"})
            return;
        }
        
        var appointments=[];
        for (let i = 0; i<= allAppointments.length-1; i++){
            var appointment = allAppointments[i];
            if(appointment.dentist_clinic_id.equals(clinicID)){
                appointments.push(appointment)
            }
        }
        if(appointments.lenght === 0){
            res.status(404).json({ message: "This clinic has no appointments"})
            return;
        }
        res.status(200).json({ message: "All available appointments retrieved", appointments: appointments });
    }catch (error) {
        res.status(400).json({ message: "Something went wrong!", error_message: error.message});
    }
}

function validateAppointment(appointment) {
    const {patient_id, dentist_id, dentist_clinic_id, type_of_appointment,
        date_and_time_from, date_and_time_until, available} = appointment; //destructuring the received dentist Object.
    if (!type_of_appointment || !dentist_id || !dentist_clinic_id || !date_and_time_from
        || !date_and_time_until || available === null) {
        return {
            success: false,
            message: "You missed to fill in required fields!"
        }
    } else {
        return {success: true, message: "Success"}
    }
}