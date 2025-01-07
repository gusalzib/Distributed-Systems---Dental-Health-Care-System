var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var mongoose = require('mongoose')
var cors = require('cors');
const mqtt = require('mqtt');
require('dotenv').config()


var app = express();
var port = 3005;


var mongoURI =  process.env.DENTIST_DB_CONNECTION_STRING;
// Connect to MongoDB
mongoose
    .connect(mongoURI)
    .catch(function (err) {
        console.error(`Failed to connect to MongoDB with URI: ${mongoURI}`);
        console.error(err.stack);
        process.exit(1);
    })
    .then(function () {
        console.log(`Connected to MongoDB with URI: ${mongoURI}`);
    });

const origins = [
    "http://localhost:3000",
];
app.use(
    cors({
        origin: origins, // Allow all origins
        methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        credentials: true,
        preflightContinue: true
    })
);


// Also, handle preflight requests for all routes
app.options("*", cors());

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

const { registerDentist, retrieveDentists, retrieveASpecificDentist, updateDentist, deleteDentistByID } = require("./src/dentist_controller/dentist-controller");

app.post("/api/dentists/create", registerDentist)
app.get("/api/dentists/get", retrieveDentists)
app.get("/api/dentists/:dentist_id", retrieveASpecificDentist)
app.put("/api/dentists/:dentist_id", updateDentist)
app.delete("/api/dentists/:dentist_id", deleteDentistByID)
// app.get("api/dentists/get/clinics/dentists/:clinic_id")      added with mqtt

app.get("/active", (req,res) =>{
    res.sendStatus(200)
  })

app.listen(port, function (err) {
    if (err) throw err;
    console.log(`Express server listening on port ${port}`);
    console.log(`Backend: http://localhost:${port}/api/`);
    console.log(`Frontend (production): http://localhost:${port}/`);
});
