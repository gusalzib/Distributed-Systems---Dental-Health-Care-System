var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var mongoose = require('mongoose')
var cors = require('cors');


var app = express();
var port = 3003; 

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


const {createClinic,retrieveAllClinics,retrieveSpecificClinic,updateClinic,deleteClinic} = require("./controller/clinicController");

app.post("/api/clinics", createClinic);
app.get("/api/clinics", retrieveAllClinics);
app.get("/api/clinics/:clinic_id",retrieveSpecificClinic);
app.put("/api/clinics/:clinic_id",updateClinic);
app.delete("/api/clinics/:clinic_id",deleteClinic);






app.listen(port, function (err) {
  if (err) throw err;
  console.log(`Express server listening on port ${port}`);
  console.log(`Backend: http://localhost:${port}/api/`);
  console.log(`Frontend (production): http://localhost:${port}/`);
});

