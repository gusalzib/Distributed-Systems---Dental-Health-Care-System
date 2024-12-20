const Patient = require("../models/Patient.js");
const emailValidator = require('validator');

exports.authenticatePatient = async (topic, payload) => {
    
    /*since the authentication service does not have access to patient database,
     it needs to request the patient service to actually check if patient exists so that the authentication service 
     can continue it job*/
    try{
        var status = 0;
        var message = "";
        console.log('payload  ',payload.toString());
        
        const incomingPayload = JSON.parse(payload);

        const email = incomingPayload.email;
        const password = incomingPayload.password;


        const patient = await Patient.findOne({ email });
        console.log('patient printed: ', patient);
        
        if(!patient){
            status = 404
            message = "No patient found";
            return status +"/"+ message;
        }
        console.log(patient.password, ' and ', password);
        
        const passwordCheck = patient.password.trim() === password.trim(); 

        if (!passwordCheck) {
            status = 401
            message = "Password incorrect!";
            return status +"/"+ message;
        }

        status = 200;
        message = "Patient retrieved";
        var stringPatient = JSON.stringify(patient);

        return status + "/" + message + "/" + stringPatient;

    } catch (error) {
        status = 400; 
        message = "Something went wrong!" 
        return status + "/" + message + "/" + error.message;
    }
}