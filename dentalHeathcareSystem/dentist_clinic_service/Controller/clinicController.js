var Clinic = require("../models/clinic.js");
const emailValidator = require('validator');
const MqttBroker = require("../mqtt-broker");



exports.clinicCreate = async (payload) => {
    // console.log('incoming payload ', payload.toString());
    // parsedPayload contains both object attributes and session variables. try the to print the incoming payload to see the session variables
    /* example payload: clinic payload  {
    "name":"Tandkliniken Johanneberg",
    "address":"Universitetsplatsen 1, 405 30 Göteborg",
    "email":"johanneberg@gmail.com",
    "phoneNumber":"1234567890",
    "userId":"67630274c5502c7c3cb1b318",
    "role":"admin"} */
    try {
        var message ='';
        var status = 0;
        const parsedPayload = JSON.parse(payload);
        const userRole = parsedPayload.role;

        /* only admin can create a clinic */
        if (userRole === 'admin') {
            const newClinicValidation = validateClinic(parsedPayload);
            if(!newClinicValidation.success) {
                status = 400
                return status +"/"+ newClinicValidation.message;
            }
        
            const clinic = new Clinic(parsedPayload);
            await clinic.save();

            var stringClinic = JSON.stringify(clinic);
            message = "Clinic created"
            status = 200;
            return status + "/" + message + "/" + stringClinic;
            
        } else {
            message = "Unauthorized request. Only admin can perform this action. "
            status = 400;
            return status +"/"+ message;
        }
        


    } catch (error) {        
        status = 400
        return status +"/"+ error.message;
    }
};

exports.getClinics = async () => {
    try {
        var message ='';
        var status = 0;
        const clinics = await Clinic.find();

        if (!clinics) {
            status = 400
            message = "No clinics found!";
            return status +"/"+ message; 
        }
        status = 200;
        message = "All clinics retrieved";
        var stringClinics = JSON.stringify(clinics);
        return status +"/"+ message +"/"+ stringClinics;
        
    } catch (error) {
        status = 400; 
        return status +"/"+ error.message;
    }
};

exports.getOneClinic = async (topic) => {
    try {
        var message ='';
        var status = 0;
        var topicArr = topic.split("/");
        const id = topicArr[3];
        const clinic = await Clinic.findById(id);
        
        if (!clinic) {
            status = 400; 
            message = "No clinic found!";
            return status +"/"+ message; 
        }
        status = 200;
        message = "Clinic retrieved successfully!";
        var stringClinic = JSON.stringify(clinic);
        return status +"/"+ message +"/"+ stringClinic;

    } catch (error) {
        status = 400; 
        return status +"/"+ error.message;
    }
};
exports.updateAClinic = async (topic,payload) => {
    try {
        var message ='';
        var status = 0;
        var topicArr = topic.split("/");
        const id = topicArr[2];

        var parsedPayload = JSON.parse(payload);
        const userRole = parsedPayload.role;

        /* only admin can update a clinic */
        if (userRole === 'admin') { 
            const existingClinic = await Clinic.findById(id);


            var name = parsedPayload.name ? parsedPayload.name : existingClinic.name;
            var email = parsedPayload.email ? parsedPayload.email : existingClinic.email;
            var phoneNumber = parsedPayload.phoneNumber ? parsedPayload.phoneNumber : existingClinic.phoneNumber;        
            var address = parsedPayload.address ? parsedPayload.address : existingClinic.address;
            var dentists = parsedPayload.dentists ? parsedPayload.dentists : existingClinic.dentists;
            var appointments = parsedPayload.appointments ? parsedPayload.appointments : existingClinic.appointments;
            
            var updatedClinic = await Clinic.findByIdAndUpdate(id, {
                name: name,
                email: email,
                phoneNumber: phoneNumber,
                address: address, 
                dentists: dentists,
                appointments: appointments
            },
                {new: true}
            );
            await updatedClinic.save()
                status = 200;
                message = "Clinic information updated successfully";
                var stringClinic = JSON.stringify(updatedClinic);
                return status +"/"+ message +"/"+ stringClinic;
        }else {
            message = "Unauthorized request. Only admin can perform this action. "
            status = 400;
            return status +"/"+ message;
        }


    } catch (error) {
        status = 400; 
        return status +"/"+ error.message;
    }
};

exports.getDentistFromClinic = async (topic) => {
    try {
        var message ='';
        var status = 0;
        var topicArr = topic.split("/");
        const id = topicArr[3];
        const clinic = await Clinic.findById(id);
        
        if (!clinic) {
            status = 400; 
            message = "No clinic found!";
            return status +"/"+ message; 
        }
        
        const clinicDentists = clinic.dentists;
        if (clinicDentists.length <= 0) {
            status = 400; 
            message = "No dentists found!";
            return status +"/"+ message; 
        }
        status = 200;
        message = "Clinics dentists retrieved successfully!"; 
        var stringDentists = JSON.stringify(clinicDentists);
        return status +"/"+ message +"/"+ stringDentists;

  } catch (error) {
    status = 400; 
    return status +"/"+ error.message;
  }
};

exports.deleteAClinic = async (topic, payload) => {
    try {
        var parsedPayload = JSON.parse(payload);
        const userRole = parsedPayload.role;

        /* only admin can create a clinic */
        if (userRole === 'admin') { 
            var message ='';
            var status = 0;
            var topicArr = topic.split("/");
            const id = topicArr[2];
            const clinic = await Clinic.findByIdAndDelete(id);
            if(!clinic){
                status = 404
                message = "No clinic found";
                return status +"/"+ message; 
            }
            status =200;
            message = "Clinic deleted";
            var stringClinic = JSON.stringify(clinic);
            return status + "/" + message + "/" + stringClinic;
            
        }else {
            message = "Unauthorized request. Only admin can perform this action. "
            status = 400;
            return status +"/"+ message;
        }


    }catch (error) {
        status = 400; 
        return status +"/"+ error.message;
    }
};
exports.getClinicInformation = async (payload) => {
    try {
        var message ='';
        var status = 0;
        const clinicArr = JSON.parse(payload);
    
        const clinics = clinicArr
        
        var clinicReturnArray = []
        for(const clinicId of clinics){

            var tempClinic = await Clinic.findById(clinicId.dentist_clinic_id);
            if (!tempClinic) {
                status = 400; 
                message = "No clinic found!";
                return status +"/"+ message; 
            }
            var clinic = {_id : tempClinic._id,
                        name: tempClinic.name,
                        address: tempClinic.location.formattedAddress}
                       

            clinicReturnArray.push(clinic);
        };
        status = 200;
        message = "Clinics retrieved successfully!";
        var stringClinics = JSON.stringify(clinicReturnArray);
        return status +"/"+ message +"/"+ stringClinics;

    } catch (error) {
        status = 400; 
        return status +"/"+ error.message;
    }
};




// -------------------------------- HTTP Methods -----------------------------------


exports.createClinic = async (req, res) => {   //DONE
    
    try {
        var email = req.body.email;
        const clinic = await Clinic.findOne({ email});
        if (clinic) {
            res.status(400).json({ message: "Email already exists." });
            return;
        } else if(!emailValidator.isEmail(email)){
            res.status(400).json({ message: "Invalid email" });
            return;
        }

        var newClinic = new Clinic();

        var name = req.body.name;
        var address = req.body.address;
        var phoneNumber = req.body.phoneNumber;

        if(!name || !address  || !email || !phoneNumber ){
            res.status(422).send({message:"Missing clinic information. Fields with * can not be empty"});
            return;
        }
       
        newClinic.name = name;
        newClinic.address = address;
        newClinic.email = email;
        newClinic.phoneNumber = phoneNumber;
        newClinic.appointments = [];
        newClinic.dentists = [];

        await newClinic.save();

        var clinicId = newClinic._id;
        if (!clinicId) {
            res.status(400).json({ message: "failed to register clinic" });
            return; 
        }
        
        res.status(200).json({message: "Clinic registered successfully", clinic: newClinic})

        
    }catch(error) {
        if (error.name === 'ValidatorError') {
            res.status(400).json({ message: "invalid email" });
            return;
        }
        res.status(400).json({message: "Failed to create Clinic", error_message: error.message});
    }
};
exports.retrieveAllClinics = async (req, res) => {                  //DONE
    try {
        const clinics = await Clinic.find();

        if (!clinics) {
            res.status(400).json({ message: "No clinics found!" })
            return; 
        }
        res.status(200).json({ message: "All clinics retrieved", clinics: clinics });
    } catch (error) {
        res.status(400).json({ message: "Something went wrong!", error_message: error.message });
    }
}
exports.retrieveSpecificClinic = async (req, res) => {          //DONE
    try {
        const id = req.params.clinic_id;
        const clinic = await Clinic.findById(id);
        
        if (!clinic) {
            res.status(400).json({ message: "No clinic found!" });
            return;
        }
        res.status(200).json({message: "Clinic retrieved successfully!", clinic: clinic})
  } catch (error) {
    res.status(400).json({ message: "Something went wrong!", error_message: error.message });
  }
};
// This method should come from dentist management service, but since we dont have that servie implemented yet, we can use this method until it is done 
exports.retrieveDentistsInSpecificClinic = async (req, res) => {                //DONE
    try {
        const id = req.params.clinic_id;
        const clinic = await Clinic.findById(id);
        
        if (!clinic) {
            res.status(400).json({ message: "No clinic found!" });
            return;
        }
        const clinicDentists = clinic.dentists;
        if (!clinicDentists) {
            res.status(400).json({ message: "No clinic found!" });
            return;
        }
        res.status(200).json({message: "Clinics dentists retrieved successfully!", clinicDentists: clinicDentists})
  } catch (error) {
    res.status(400).json({ message: "Something went wrong!", error_message: error.message });
  }
};
exports.updateClinic = async (req, res) => {                        //DONE
    try {
        const id = req.params.clinic_id; 
        const existingClinic = await Clinic.findById(id);

        var name = req.body.name ? req.body.name : existingClinic.name;
        var email = req.body.email ? req.body.email : existingClinic.email;
        var phoneNumber = req.body.phoneNumber ? req.body.phoneNumber : existingClinic.phoneNumber;        
        var address = req.body.address ? req.body.address : existingClinic.address;
        var dentists = req.body.dentists ? req.body.dentists : existingClinic.dentists;
        var appointments = req.body.appointments ? req.body.appointments : existingClinic.appointments;
        
        var updatedClinic = await Clinic.findByIdAndUpdate(id, {
            name: name,
            email: email,
            phoneNumber: phoneNumber,
            address: address, 
            dentists: dentists,
            appointments: appointments},
            {new: true}
        );
            res.status(200).json({message: "Clinic information updated successfully", clinic: updatedClinic})
        
    } catch (error) {
        
        res.status(400).json({message: "Something went wrong", error_message: error.message})
    }
};
exports.deleteClinic = async (req, res) => {                    //DONE
    try{
        const id = req.params.clinic_id;
        const clinic = await Clinic.findByIdAndDelete(id);
        if(!clinic){
            res.status(404).json({ message: "No clinic found"})
            return;
        }
        res.status(200).json({ message: "Clinic deleted", clinic: clinic });
    }catch (error) {
        res.status(400).json({ message: "Something went wrong!", error_message: error.message});
    }
}

function validateClinic(clinic) {
    const {name, address, email, phoneNumber} = clinic; //destructuring the received clinic Object.
    if (!name || !address || !email || !phoneNumber ) {
        return {
            success: false,
            message: "You missed to fill in required fields!"
        }
    } else {
        return {success: true, message: "Success"}
    }
}
