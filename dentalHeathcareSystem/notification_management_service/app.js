const createError = require('http-errors');
const express = require('express');
let path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const mongoose = require('mongoose')
const cors = require('cors');
const mqtt = require('mqtt');
require('dotenv').config();

let app = express();
let port = 3021;

const mongoURI =  process.env.NOTIFICATION_DB_CONNECTION_STRING;
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


const {registerNotification, retrieveNotifications, retrieveASpecificNotification
} = require("./src/notification_controller/notification_controller");

app.post("/api/notifications/create", registerNotification);
app.get("/api/dentists/get", retrieveNotifications);
app.get("/api/notifications/:notification_id", retrieveASpecificNotification);


app.get("/active", (req,res) =>{
    res.sendStatus(200)
  })

app.listen(port, function (err) {
    if (err) throw err;
    console.log(`Express server listening on port ${port}`);
    console.log(`Backend: http://localhost:${port}/api/`);
    console.log(`Frontend (production): http://localhost:${port}/`);
});
