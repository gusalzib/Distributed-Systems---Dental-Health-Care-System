const Appointment = require("../models/Appointment.js");
const mongoose = require('mongoose');

exports.makeAppointment = async (payload) => {
    /*
    An example of how the incoming payload looks like. It contains the information of the appointment we want to create and the session variables 
    like userId and role. 
    printing payload in the appointment service {
    patient_id: '67630274c5502c7c3cb1b318',
    dentist_id: '676abacc424c03dadc73d5d0',
    date_and_time_from: '2024-12-20T10:09:00Z',
    date_and_time_until: '2024-12-20T10:10:00Z',
    dentist_clinic_id: '676ab652b77e8c31f7475fbb',
    available: true,
    type_of_appointment: 'General Checkup',
    userId: '676ae091f926a48638a2f868',
    role: 'dentist'
    }
    */
    try {
        var message ='';
        var status = 0;
        // fetch the session variables from the incoming payload
        const parsedPayload = JSON.parse(payload);
        const userRole = parsedPayload.role;
        const currentUserId = parsedPayload.userId; // when the dentist is logged in, their id will be in this variable


        // add the id of the dentist to the new appointment to be created
        parsedPayload.dentist_id = currentUserId;
        
        /* only admin or owner dentist can create an appointment*/
        if ((userRole === 'admin') || (userRole === 'dentist')) {

            const newAppointmentValidation = validateAppointment(parsedPayload);
            if (!newAppointmentValidation.success) {
                status = 400
                return status + "/" + newAppointmentValidation.message;
            }
        
            const appointment = new Appointment(parsedPayload);
            await appointment.save();

            var appoinmentId = appointment._id;
            if (!appoinmentId) {
                status = 400
                message = "failed to register clinic";
                return status + "/" + message
            }
            var retrievedAppointment = await Appointment.find(appoinmentId);
            message = "Appointment created"
            var stringAppointment = JSON.stringify(retrievedAppointment)
            status = 200;
            return status + "/" + message + "/" + stringAppointment;

        } else {
            message = "Unauthorized request. Please login to create an appointment "
            status = 400;
            return status + "/" + message;
        }


    } catch(error) {
        status = 400; 
        message = "Something went wrong!" 
        return status + "/" + message + "/" +error.message;
    }
};
exports.getAppointments = async (payload) => {
    try{
        var message ='';
        const appointments = await Appointment.find().sort({"date_and_time_from": 1});
        var status = "";
        if(appointments.length === 0){
            status = 404
            message = "No appointments found"
            return status +"/"+ message
        }
        status = 200;
        message = "All appointments retrieved";
        var stringAppointments = JSON.stringify(appointments);
        return status +"/"+ message +"/"+ stringAppointments
    }catch (error) {
        status = 400; 
        message = "Something went wrong!" 
        return status + "/" + message + "/" +error.message;
    }
};

exports.getOneAppointment = async (topic) => {
    try{
        var message ='';
        var status = 0;
        var topicArr = topic.split("/");        
        const id = topicArr[3];
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
        message = "Something went wrong!" 
        return status + "/" + message + "/" +error.message;
    }
};

exports.updateOneAppointment = async (topic, payload) => {
    
    try {
        var message ='';    
        var status = 0;
        var topicArr = topic.split("/");
        const _id = topicArr[2];

        const existing_appointment = await Appointment.findById(_id);

        const parsedPayload = JSON.parse(payload);


        // make sure the appointment is correctly retrieved
        if(!existing_appointment){
            status = 400;
            message = "No appointment found";
            return status +"/"+ message;
        }
        var newAppointment = JSON.parse(payload)

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
            message = "Something went wrong!" 
            return status + "/" + message + "/" +error.message;
                
        }
};

exports.fetchPatientAppointments = async (topic, payload) => {
    try {
        var message ='';
        var status = 0; 
        
        // fetch the session variables from the incoming payload
        const parsedPayload = JSON.parse(payload);
        const userRole = parsedPayload.role;
        const currentUserId = parsedPayload.userId;

        if ((userRole === 'admin') || (userRole === 'patient')) { 

            const appointments = await Appointment.find();
            if (appointments.length === 0) {
                status = 404; 
                message = "No appointments found"; 
                return status + "/" + message;
            }

            const patientAppointments = appointments.filter(appointment => appointment.patient_id && appointment.patient_id.equals(currentUserId));
            if (patientAppointments.length === 0) {
                status = 200; 
                message = "You have no appointments booked"; 
                var stringAppointments = JSON.stringify(patientAppointments)
                return status + "/" + message + "/" + stringAppointments;

            } else {
                status = 200; 
                message = "Appointments retrieved"; 
                var stringAppointments = JSON.stringify(patientAppointments)
                return status + "/" + message + "/" + stringAppointments;
            }
        }
        


    } catch (error) {
            status = 400; 
            message = "Something went wrong!" 
            return status + "/" + message + "/" + error.message;
    }
}

exports.removeAppointment = async (topic, payload) => {
    try{
        var message ='';
        var status = 0;
        var topicArr = topic.split("/");
        const id = topicArr[2];

        // fetch the session variables from the incoming payload
        var parsedPayload = JSON.parse(payload);   
        const userRole = parsedPayload.role;
        const currentUserId = parsedPayload.userId;

        const foundAppointment = await Appointment.findById(id)

        /* only a dentist or an admin can delete an appointment */
        if ((userRole === 'admin') || (userRole === 'dentist')) {

            /* only the dentist who created the appointment can remove it or the admin
                converting the foundAppointment.dentist_id to string is necessary because it cannot compare 
                an ObjectId to a String*/
            if ((foundAppointment.dentist_id.toString() === currentUserId) || (userRole === 'admin')) {

                const appointment = await Appointment.findByIdAndDelete(id);
                if (!appointment) {
                    status = 404; 
                    message = "No appointment found" 
                    return status + "/" + message;
                }
                var stringAppointment = JSON.stringify(appointment)
                status = 200; 
                message = "Appointment deleted"; 
                return status + "/" + message + "/" + stringAppointment;

            } else {
                message = "Unauthorized request. The appointment belongs to another dentist "
                status = 400;
                return status +"/"+ message;
            }
        } else {
            message = "Unauthorized request. Please login to delete this appointment "
            status = 400;
            return status +"/"+ message;
        }


    } catch (error) {
        status = 404; 
        message = "Something went wrong!"
        return status + "/" + message + "/" + error.message;
    }
}


exports.fetchAvailableAppointments = async (payload) => {    
    try{
        var message ='';
        const appointments = await Appointment.find({available: true}).sort({"date_and_time_from": 1});
        var status = 0;

        if(appointments.length === 0){
            status = 404
            message = "No appointments found"
            return status +"/"+ message
        }

        status = 200;
        message = "All appointments retrieved";

        var stringAppointments = JSON.stringify(appointments);
        
        return status + "/" + message + "/" + stringAppointments;

    }catch (error) {
        status = 400; 
        message = "Something went wrong!" 
        return status + "/" + message + "/" + error.message;
    }
}


exports.fetchClinicAppointments = async (topic) => {
    try {
        var message ='';
        var topicArr = topic.split("/");
        const id = topicArr[4];

        var status = 0;
        var allAppointments = []
        allAppointments = await Appointment.find({ dentist_clinic_id: id });
       
        if (allAppointments.length === 0) {
            status = 200; 
            message = "No appointments found"
            return status + "/" + message + allAppointments;

        }
        var stringAppointments = JSON.stringify(allAppointments)
        status = 200; 
        message = "All available appointments retrieved"
        return status + "/" + message + "/" + stringAppointments;

    }catch (error) {
        status = 400; 
        message = "Something went wrong!" 
        return status + "/" + message + "/" + error.message;
    }
};
exports.fetchClinicsAvailableAppointments = async (topic) => {    
    try{
        var topicArr = topic.split("/");
        const id = topicArr[5];

        var allAppointments = []
        allAppointments = await Appointment.find({ dentist_clinic_id: id }).sort({"date_and_time_from": 1});
        
        const appointments = allAppointments.filter(appointment => appointment.available);
        
        var status = 0;
        if(appointments.length === 0){
            message = "This clinic has no available appointments"
        }else{
            message = "All appointments retrieved";
        }

        status = 200;
        var stringAppointments = JSON.stringify(appointments);
        
        return status + "/" + message + "/" + stringAppointments;

    }catch (error) {
        status = 400; 
        message = "Something went wrong!" 
        return status + "/" + message + "/" + error.message;
    }
}
exports.bookAppointment = async (topic, payload) => {
    
    try {

        var status = 0;
        var topicArr = topic.split("/");
        const _id = topicArr[2];

        // fetch the session variables from the incoming payload
        var parsedPayload = JSON.parse(payload);   
        const userRole = parsedPayload.role;

        if ((userRole === 'patient') || (userRole === 'admin')) {
            const existing_appointment = await Appointment.findById(_id);
            if(!existing_appointment){
                status = 400;
                message = "No appointment found";
                return status +"/"+ message;
            }
            

            const appointment = {
                patient_id: parsedPayload.userId ? parsedPayload.userId : existing_appointment.patient_id,
                dentist_id: parsedPayload.dentist_id ? parsedPayload.dentist_id: existing_appointment.dentist_id,
                dentist_clinic_id: parsedPayload.dentist_clinic_id ? parsedPayload.dentist_clinic_id : existing_appointment.dentist_clinic_id,
                type_of_appointment: parsedPayload.type_of_appointment ? parsedPayload.type_of_appointment : existing_appointment.type_of_appointment,
                date_and_time_from: parsedPayload.date_and_time_from ? parsedPayload.date_and_time_from: existing_appointment.date_and_time_from,
                date_and_time_until: parsedPayload.date_and_time_until ? parsedPayload.date_and_time_until: existing_appointment.date_and_time_until,
                available: false
            }

            const newAppointmentValidation = validateAppointment(appointment);
            if(!newAppointmentValidation.success) {
                status = 400;
                
                message = newAppointmentValidation.message;
                return status +"/"+ newAppointmentValidation.message;
            };

            const updatedAppointment = await Appointment.findByIdAndUpdate(_id, appointment, {new: true});

            status = 200; 
            message= "Appointment updated";
            var stringUpdatedAppointment = JSON.stringify(updatedAppointment);
            return status +"/"+ message +"/"+ stringUpdatedAppointment;

        } else {
            message = "Unauthorized request. Please login to book an appointment "
            status = 400;
            return status +"/"+ message;
        }
        


    } catch (error) {
            status = 400; 
            message = "Something went wrong!" 
            return status + "/" + message + "/" +error.message;
                
        }
}




/* XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX HTTP METHODS XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX */

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

        if(appointments.length === 0){
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
        if(allAppointments.length === 0){
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
       
        if(allAppointments.length === 0){
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
        if(appointments.length === 0){
            res.status(404).json({ message: "This clinic has no appointments"})
            return;
        }
        res.status(200).json({ message: "All available appointments retrieved", appointments: appointments });
    }catch (error) {
        res.status(400).json({ message: "Something went wrong!", error_message: error.message});
    }
};

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