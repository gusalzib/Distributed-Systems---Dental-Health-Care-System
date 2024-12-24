require('dotenv').config()
const secret_key = process.env.JWT_SECRET_KEY;

const Dentist = require("../dentist_model/Dentist.js");
const jwt = require('jsonwebtoken');

exports.authenticateDentist = async (topic, payload) => {
    console.log('secret key ', secret_key);
    
    try{
        var status = 0;
        var message = "";
        console.log('payload  ',payload.toString());
        
        const incomingPayload = JSON.parse(payload);

        const email = incomingPayload.email;
        const password = incomingPayload.password;


        const dentist = await Dentist.findOne({ email });
        
        if(!dentist){
            status = 404
            message = "No dentist found";
            return status +"/"+ message;
        }
        
        /* trim the passwords to remove any trailing spaces */
        const passwordCheck = dentist.password.trim() === password.trim(); 
        
        if (!passwordCheck) {
            status = 401
            message = "Password incorrect!";
            return status +"/"+ message;
        }

        const token = jwt.sign(
            {
            userId: dentist._id,
            role: 'dentist',
            email: dentist.email,
            },
            secret_key,
            {expiresIn: '1h'}
        )
        
        status = 200;
        message = "Dentist retrieved";

        // returning the patient object with the token 
        var stringDentist= JSON.stringify({ dentist, token });

        return status + "/" + message + "/" + stringDentist;

    } catch (error) {
        console.log(error);
        
        status = 400; 
        message = "Something went wrong!" 
        return status + "/" + message + "/" + error.message;
    }
}