const Dentist = require("../dentist_model/Dentist");

exports.registerDentist = async (req, res) => {
    try {
        var newDentist = new Dentist();

        const clinic_id = req.body.clinic_id;
        const name = req.body.name;
        const address = req.body.address;
        const phone_number = req.body.phone_number;
        const email = req.body.email;
        const password = req.body.password;
        const appointments = [];

        newDentist.clinic_id = clinic_id;
        newDentist.name = name;
        newDentist.address = address;
        newDentist.phone_number = phone_number;
        newDentist.email = email;
        newDentist.password = password;
        newDentist.appointments = [];

        await newDentist.save();
        res.status(200).json({
                message: "Registered successfully!",
            dentist: newDentist});
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

        var clinic_id = req.body.clinic_id ? req.body.clinic_id : existingDentist.clinic_id
        var name = req.body.name ? req.body.name : existingDentist.name
        var address = req.body.address ? req.body.address : existingDentist.address
        var phone_number = req.body.phone_number ? req.body.phone_number : existingDentist.phone_number
        var email = req.body.email ? req.body.email : existingDentist.email
        var password = req.body.password ? req.body.password : existingDentist.password
        var appointments = req.body.appointments ? req.body.appointments : existingDentist.appointments

        var updatedDentist = await Dentist.findByIdAndUpdate(id, {
            clinic_id: clinic_id,
            name: name,
            address: address,
            phone_number: phone_number,
            email: email,
            password: password,
            appointments: appointments
        })

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
