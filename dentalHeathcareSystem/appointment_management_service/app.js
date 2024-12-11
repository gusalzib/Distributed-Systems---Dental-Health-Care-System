var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var mongoose = require('mongoose')
var cors = require('cors');
const mqtt = require('mqtt');
const MqttBroker = require("./mqtt-broker"); //starts the broker

var app = express();
var port = 3002; 
// view engine setup
//app.set('views', path.join(__dirname, 'views'));
//app.set('view engine', 'jade');

var mongoURI =  "mongodb://localhost:27017/dentalHealthcareSystem";
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

// view engine setup
// app.set("views", path.join(__dirname, "client_patient/src/"));
// app.set('view engine', 'jade');

const origins = [
  "http://localhost:3000",
];
app.use(
  cors({
    origin: origins , // Allow all origins
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    credentials: true,
    preflightContinue: true,
  })
);

// Also, handle preflight requests for all routes
app.options("*", cors());

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

const {createAppointment, getAllAppointments,getSpecificAppointment,getPatientsAppointments,updateAppointment,deleteAppointment,getAvailableAppointments,getClinicAppointments} = require("./controller/appointmentController");


app.post("/api/appointments/create", createAppointment);
app.get("/api/appointments/get", getAllAppointments); //added "get" to url
app.get("/api/appointments/get/specific/:appointment_id", getSpecificAppointment); //added "get" to url
app.get("/api/appointments/get/patient/appointments/:patient_id",getPatientsAppointments);
app.get("/api/appointments/get/available/appointment",getAvailableAppointments)
app.get("/api/appointments/get/clinics/appointments/:clinicID",getClinicAppointments) //changed id to the end,added "get" to url, also changed in postman and clinic.vue
app.put("/api/appointments/update/:appointment_id",updateAppointment);
app.delete("/api/appointments/delete/:appointment_id",deleteAppointment);


app.get("/active", (req,res) =>{
  res.sendStatus(200).json("appointment")
})



app.listen(port, function (err) {
  if (err) throw err;
  console.log(`Express server listening on port ${port}`);
  console.log(`Backend: http://localhost:${port}/api/`);
  console.log(`Frontend (production): http://localhost:${port}/`);
});


