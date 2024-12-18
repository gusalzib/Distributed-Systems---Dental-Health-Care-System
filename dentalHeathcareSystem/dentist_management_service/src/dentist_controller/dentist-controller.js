const Dentist = require("../dentist_model/Dentist.js");
const MqttBroker = require("../../mqtt-broker");

exports.createDentist = async (payload) => {
    let message;
    let response;
    let status;
    try {
        const newDentist = JSON.parse(payload);
        const newDentistValidation = validateDentist(newDentist);

        if (!newDentistValidation.success) {
            status = 400
            return status + "/" + newDentistValidation.message;
        }

        const dentist = new Dentist(newDentist);
        await dentist.save();
        message = "Dentist registered successfully!"
        let stringDentist = JSON.stringify(dentist)
        status = 200;
        response = status + "/" + message + "/" + stringDentist;
        return response;

    } catch (error) {
        status = 400;
        message = "Failed to register. Something went wrong!"
        return status + "/" + message + "/" + error.message;
    }
};

exports.getAllDentists = async (payload) => {
    let status;
    let message;
    try {
        const dentists = await Dentist.find();
        if (!dentists) {
            status = 200;
            message = "Clinic has no dentists yet!";
            return status + "/" + message;
        }

        status = 200;
        message = "Dentists retrieved!";
        let stringifiedDentists = JSON.stringify(dentists);
        let messageToReturn = status + "/" + message + "/" + stringifiedDentists;
        return messageToReturn;

    } catch (error) {
        status = 400;
        error.message = "Something went wrong!";
        return status + "/" + error.message;
    }
};

exports.getSpecificDentist = async (topic) => {
    let status;
    let message;
    try {
        let topicArray = topic.split("/");
        let id = topicArray[3];
        const dentist = await Dentist.findById(id);

        if (!dentist) {
            status = 404;
            message = "No dentist with this ID";
            return status + "/" + message;
        }

        status = 200;
        message = "Dentist retrieved!";
        let stringifiedDentist = JSON.stringify(dentist);
        let messageToReturn = status + "/" + message + "/" + stringifiedDentist;
        return messageToReturn;

    } catch (error) {
        status = 400;
        error.message = "Something went wrong!";
        return status + "/" + error.message;
    }
}

exports.updateSpecificDentist = async (topic, payload) => {
    let status;
    let message;
    try {
        let topicArray = topic.split("/");
        let id = topicArray[2];

        const foundDentist = await Dentist.findById(id);
        if (!foundDentist) {
            status = 404;
            message = "No dentist with this ID";
            return status + "/" + message;
        }

        const newDentist = JSON.parse(payload);

        const dentist = {
            clinic_id: newDentist.clinic_id ? newDentist.clinic_id : foundDentist.clinic_id,
            name: newDentist.name ? newDentist.name : foundDentist.name,
            address: newDentist.address ? newDentist.address : foundDentist.address,
            phone_number: newDentist.phone_number ? newDentist.phone_number : foundDentist.phone_number,
            email: newDentist.email ? newDentist.email : foundDentist.email,
            password: newDentist.password ? newDentist.password : foundDentist.password,
            appointments: newDentist.appointments ? newDentist.appointments : foundDentist.appointments
        }

        const newDentistValidation = validateDentist(dentist);
        if(!newDentistValidation.success) {
            status = 400;
            message = newDentistValidation.message;
            return status + "/" + message;
        }

        const updatedDentist = await Dentist.findByIdAndUpdate(id, dentist, {new: true});
        status = 200;
        message = "Dentist has been updated!";

        let stringifiedUpdatedDentist = JSON.stringify(updatedDentist);
        let messageToReturn = status + "/" + message + "/" + stringifiedUpdatedDentist;
        return messageToReturn;

    } catch (error) {
        status = 400;
        error.message = "Something went wrong!";
        return status + "/" + error.message;
    }
};

exports.deleteSpecificDentist = async (topic) => {
    let status;
    let message;
    try {
        let topicArray = topic.split("/");
        let id = topicArray[2];

        const dentistToDelete = await Dentist.findByIdAndDelete(id);
        if (!dentistToDelete) {
            status = 404;
            message = "No dentist with this ID";
            return status + "/" + message;
        }

        let stringifiedDeletedDentist = JSON.stringify(dentistToDelete);
        status = 200;
        message = "Dentist has been Deleted!";
        let messageToReturn = status + "/" + message + "/" + stringifiedDeletedDentist;
        return messageToReturn;

    } catch (error) {
        status = 400;
        error.message = "Something went wrong!";
        return status + "/" + error.message;
    }
};
exports.fetchClinicsDentists = async (topic) => {
    try {
        var message ='';
        var status = 0; 
        var topicArr = topic.split("/");
        const _id = topicArr[4];
        
        const dentists = await Dentist.find();
        
        if (dentists.length === 0) {
            status = 404; 
            message = "No dentist found"; 
            return status + "/" + message;
        }
        
        const clinicsDentists = dentists.filter(dentist => dentist.clinic_id && dentist.clinic_id.equals(_id));
       
        if (clinicsDentists.length === 0) {
            status = 400; 
            message = "This clinic has no dentists"; 
            return status + "/" + message;

        } else {
            status = 200; 
            message = "Dentists retrieved"; 
            var stringDentists = JSON.stringify(dentists)
            return status + "/" + message + "/" + stringDentists;
        }

    } catch (error) {
            status = 400; 
            message = "Something went wrong!" 
            return status + "/" + message + "/" + error.message;
    }
}


/*=========== HTTP endpoints ==============*/


exports.registerDentist = async (req, res) => {
    try {
        const dentist = {
            clinic_id: req.body.clinic_id,
            name: req.body.name,
            address: req.body.address,
            phone_number: req.body.phone_number,
            email: req.body.email,
            password: req.body.password,
            appointments: [],
        };

        const newDentistValidation = validateDentist(dentist);
        if(!newDentistValidation.success) {
            res.status(400).json({message: newDentistValidation.message})
            return;
        }

        const newDentsit = new Dentist(dentist);
        await newDentsit.save();
        res.status(200).json({
            message: "Registered successfully!",
            dentist: newDentsit});
    } catch(error) {
        res
            .status(400)
            .json({
                message: "Failed to register",
                error_message: error.message,
            });
    }
};

exports.retrieveDentists = async (req, res) => {
    try {
        const dentists = await Dentist.find();

        if (!dentists) {
            res.status(400).json({ message: "Clinic has no dentists yet!" })
            return;
        }
        res.status(200).json({
            message: "Dentists retrieved",
            dentists: dentists });
    } catch (error) {
        res.status(400).json({ message: "Something went wrong!",
            error_message: error.message });
    }
}

exports.retrieveASpecificDentist = async (req, res) => {
    try {
        const id = req.params.dentist_id;
        const dentist = await Dentist.findById(id);
        if (!dentist) {
            res.status(400).json({ message: "Dentist was not found!" });
            return;
        }
        res.status(200).json({message: "Dentist is retrieved",
            dentist: dentist})
    } catch (error) {
        res
            .status(400)
            .json({ message: "Something went wrong!",
                error_message: error.message });
    }
};


exports.updateDentist = async (req, res) => {
    try {
        const id = req.params.dentist_id;

        const existingDentist = await Dentist.findById(id);
        if (!existingDentist) {
            res.status(400).json({ message: "Dentist was not found" })
            return;
        }

        const dentist = {
            clinic_id: req.body.clinic_id ? req.body.clinic_id : existingDentist.clinic_id,
            name: req.body.name ? req.body.name : existingDentist.name,
            address: req.body.address ? req.body.address : existingDentist.address,
            phone_number: req.body.phone_number ? req.body.phone_number : existingDentist.phone_number,
            email: req.body.email ? req.body.email : existingDentist.email,
            password: req.body.password ? req.body.password : existingDentist.password,
            appointments: req.body.appointments ? req.body.appointments : existingDentist.appointments
        }

        const newDentistValidation = validateDentist(dentist);
        if(!newDentistValidation.success) {
            res.status(400).json({message: newDentistValidation.message})
            return;
        }

        const updatedDentist = await Dentist.findByIdAndUpdate(id, dentist);

        res.status(200).json({message: "Dentist information has been updated",
            dentist: updatedDentist})

    } catch (error) {
        res.status(400)
            .json({message: "Something went wrong!",
                error_message: error.message})
    }
}

exports.deleteDentistByID = async (req, res) => {
    try {
        const id = req.params.dentist_id;
        const deletedDentist = await Dentist.findByIdAndDelete(id)
        if(!deletedDentist) {
            res.status(400)
                .json({ message: "Dentist was not found" });
            return;
        }
        res.status(200)
            .json({message: "Dentist was deleted successfully",
                dentist: deletedDentist})
    } catch (error) {
        res.status(400)
            .json({message: "Something went wrong",
                error_message: error.message})
    }
}


function validateDentist(dentist) {
    const {clinic_id, name, address, phone_number, email, password} = dentist; //destructuring the received dentist Object.

    if (!clinic_id || !name || !address || !phone_number || !email || !password ) {
        return {success: false, message: "You missed to fill in required fields!"}
    } else if (phone_number.length < 8 || phone_number.length > 10) {
        return {success: false, message: "Phone number must be 8 to 10 digits!"}
    } else if(password.length <= 10) {
        return {success: false, message: "Password must be 10 or more characters!"}
    } else if(!/^\d+$/.test(phone_number)) {
        return {success: false, message: "Phone number must be only numbers!"}
    } else {
        return {success: true, message: "Success"}
    }
}