const Dentist = require("../dentist_model/Dentist");

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
            console.log("got in validation")
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
        console.log(dentist)
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
            return
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
            console.log("got in validation")
            res.status(400).json({message: newDentistValidation.message})
            return;
        }
        const updatedDentist = await Dentist.findByIdAndUpdate(id, dentist);

        res.status(200).json({message: "Dentist information has been updated",
            dentist: updatedDentist})

    } catch (error) {
        res.status(400)
            .json({message: "Something went wrong",
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