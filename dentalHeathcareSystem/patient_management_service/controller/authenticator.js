require('dotenv').config()
const secret_key = process.env.JWT_SECRET_KEY;

const Patient = require("../models/Patient.js");
const emailValidator = require('validator');
const jwt = require('jsonwebtoken');

exports.authenticatePatient = async (topic, payload) => {
    // console.log('secret key ', secret_key);
    
    try{
        var status = 0;
        var message = "";
        
        const incomingPayload = JSON.parse(payload);

        const email = incomingPayload.email;
        const password = incomingPayload.password;

        const adminEmail = 'admin@gmail.com';
        const adminPassword = 'admin';

        const patient = await Patient.findOne({ email });
        // console.log('patient printed: ', patient);
        
        if(!patient){
            status = 404
            message = "No patient found";
            return status +"/"+ message;
        }
        
        /* trim the passwords to remove any trailing spaces */
        const passwordCheck = patient.password.trim() === password.trim(); 

        if (!passwordCheck) {
            status = 401
            message = "Password incorrect!";
            return status +"/"+ message;
        }

        var token = '';
        // check if the user is the admin
        if (email === adminEmail && password.trim() === adminPassword.trim()) {
            token = jwt.sign(
                {
                    userId: patient._id,
                    role: 'admin',
                    email: patient.email,
                    region: patient.region,
                    phone_number: patient.phone_number
                },
                secret_key,
                { expiresIn: '1h' }
            );
        } else {
            token = jwt.sign(
                {
                    userId: patient._id,
                    role: 'patient',
                    email: patient.email,
                    region: patient.region,
                    phone_number: patient.phone_number

                },
                secret_key,
                { expiresIn: '1h' }
            );
        }


        console.log('this is the token right here ',token);
        
        status = 200;
        message = "Patient retrieved";

        // returning the patient object with the token 
        var stringPatient = JSON.stringify({ patient, token });
        console.log('string patitent:',stringPatient);
        return status + "/" + message + "/" + stringPatient;

    } catch (error) {
        status = 400; 
        message = "Something went wrong!" 
        return status + "/" + message + "/" + error.message;
    }
}