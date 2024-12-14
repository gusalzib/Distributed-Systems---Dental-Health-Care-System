var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var mongoose = require('mongoose')
var cors = require('cors');
const mqtt = require('mqtt');

var app = express();
var port = 3020;

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


const {registerSubscription, retrieveSubscriptions, retrieveASpecificSubscription, updateSubscription, deleteSubscription
} = require("./src/subscription_controller/subscription_controller");

app.post("/api/subscriptions/create", registerSubscription);
app.get("/api/subscriptions/get", retrieveSubscriptions);
app.get("/api/subscriptions/:subscription_id", retrieveASpecificSubscription);
app.put("/api/subscriptions/:subscription_id", updateSubscription);
app.delete("/api/subscriptions/:subscription_id", deleteSubscription);




app.get("/active", (req,res) =>{
    res.sendStatus(200)
  })

app.listen(port, function (err) {
    if (err) throw err;
    console.log(`Express server listening on port ${port}`);
    console.log(`Backend: http://localhost:${port}/api/`);
    console.log(`Frontend (production): http://localhost:${port}/`);
});
