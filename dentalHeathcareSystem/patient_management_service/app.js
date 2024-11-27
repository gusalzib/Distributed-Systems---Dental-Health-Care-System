var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var mongoose = require('mongoose')
var cors = require('cors');



var app = express();
var port = 3001; 


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

/*  the CORS settings were slightly refactored for both the patient_management_service and api gateway. 
This is because of an issue with preflight headers/requests that were blocked for no apparent reason. 
It could be because of the api gateway being an intermediary between the browser and service server. */
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


// // catch 404 and forward to error handler
// app.use(function(req, res, next) {
//   next(createError(404));
// });

// // error handler
// app.use(function(err, req, res, next) {
//   // set locals, only providing error in development
//   res.locals.message = err.message;
//   res.locals.error = req.app.get('env') === 'development' ? err : {};

//   // render the error page
//   res.status(err.status || 500);
//   res.render('error');
// });

const { registerPatient, retrieveAllPatients, retrieveSpecificPatient, updatePatient, deletePatientByID,addAppoinmentToPatient } = require("./controller/patientController");

app.post("/api/patients", registerPatient)
app.get("/api/patients", retrieveAllPatients)
app.get("/api/patients/:patient_id", retrieveSpecificPatient)
app.put("/api/patients/:patient_id", updatePatient)
app.delete("/api/patients/:patient_id", deletePatientByID)

app.listen(port, function (err) {
  if (err) throw err;
  console.log(`Express server listening on port ${port}`);
  console.log(`Backend: http://localhost:${port}/api/`);
  console.log(`Frontend (production): http://localhost:${port}/`);
});
