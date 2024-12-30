const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const { createProxyMiddleware } = require("http-proxy-middleware");
const request = require("request");
const app = express();
const mqttBroker = require("./mqtt-broker.js");
const { baseModelName } = require("../appointment_management_service/models/Appointment.js");

//sessions variables 
const jwtVerification = require('./jwtVerification.js');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const MongoStore = require('connect-mongo');

const PORT = 3000;


app.use(
  cors({
    origin: true, // Allow all origins
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    credentials: true
  })
);

// app.use(session({
//     secret: 'secret_patient_key',
//     resave: false,
//     saveUninitialized: true,
//     store: new MongoStore({
//         mongoUrl: 'mongodb://127.0.0.1:27017/dentalHealthcareSystem', 
//         ttl: 14 * 24 * 60 * 60, // this stands for: time to live (14 days)
//         autoRemove: 'native',  // an automatical removal of expired sessions offered by connect-mongo
//         collectionName: 'sessions'
//     })
// }))
app.use(cookieParser());
// Also, handle preflight requests for all routes
app.options("*", cors());
app.use(helmet()); // Add security headers
app.use(morgan("dev")); // Log HTTP requests
// app.disable("x-powered-by"); // Hide Express server information
app.use(express.json());


//----------------------------------- LOAD BALANCER -----------------------------------------

exports.balanceService = async (serviceName) => {
    const specificService = services.find((service) => service.service === serviceName);
    var balancedService = '';
    if(!specificService){
        console.log('service not found');
        return
    }
    var activeTopics = [];
    specificService.topics.forEach(topic =>{
      if(topic.isActive){
        activeTopics.push(topic);
      }
    });
    if(activeTopics.length === 0){
      balancedService = 0;
      return message
    }else{
    const response = roundRobin(activeTopics,specificService.index);
    specificService.index = response.index;
    balancedService = response.topic;
    }
    return balancedService;
}


function roundRobin(topics,index){
  var topic = '';

  if(topics.length === 1){                 //if there is only one service
    topic = topics[index].topic
    topicAndIndex = {topic, index}

    return topicAndIndex
  } else {                              //If there is duplicate services
    index = (index + 1) % topics.length   //roundRobin algorithm

    if (topics[index].isActive == false){
      roundRobin(topics, index);             //if the current service instance is down, move on to the next
    } else {
      topic = topics[index].topic;
      topicAndIndex = { topic, index }; //returning the portnumber and the new index value
    }

    return topicAndIndex
  }
}


exports.updateIsActive = async (serviceName, topicName, activity) => {
    const specificService = services.find((service) => service.service === serviceName);
    if(!specificService){
        // console.log('service not found');
        return
    }
    const specificTopic = specificService.topics.find((topic)=> topic.topic === topicName);
    if(!specificTopic){
        console.log('no topic found');
        return
    }
    specificTopic.isActive = activity;
    startTimer(specificTopic);
    
    var topicArr = [];
    services.forEach(service => {
        service.topics.forEach(topic =>{
            if(topic.isActive){
                topicArr.push(topic.topic)
            }
        });
    });
    //console.log('Active topics are: ',topicArr);
}
function startTimer (topic){
    if(topic.timeout){
        clearTimeout(topic.timeout);
    }
    topic.timeout = setTimeout(() =>{
        topic.isActive = false;
    },10000)
}

const services = [                                      //Service array
    {
      service: "patients",
      topics: [
        {topic: "patients-1", isActive: false},
        {topic: "patients-2", isActive: false},
        {topic: "patients-3", isActive: false}
      ] ,
      index:0,

    },
    {
        service: "appointments",
        topics: [
          {topic: "appointments-1", isActive: false},
          {topic: "appointments-2", isActive: false},
          {topic: "appointments-3", isActive: false}

        ],
        index:0,
      },
      {
        service: "clinics",
        topics: [
          {topic: 'clinics-1', isActive: false}
        ],
        index:0,
      },
      {
        service: "dentists",
        topics: [
          {topic: 'dentists-1', isActive: false},
        ],
        index:0,
      },
   ];

//--------------------------------- ADAPTER -----------------------------------------------   

const { login, signup, post, get, put, deleteEndpoint, loginCheck, logout } = require('./controller/gatewayController.js')
/*######################################################################## LOGOUT ENPOINT #################################################################################### */
/* connected to the logout button in App.vue */
app.get('/api/logout', logout);

/*######################################################################## LOGIN CHECK ENPOINT #################################################################################### */
/* Login check is performed whenever we need to make sure the user is authorized to do a certain action or if the user is trying to access certain routes.*/
app.get('/api/login/check', loginCheck);

/*######################################################################## PATIENT SIGNUP ENPOINT #################################################################################### */
app.post('/api/patients/signup', signup);

/*######################################################################## PATIENT LOGIN ENPOINT #################################################################################### */
app.post('/api/patients/login', login)

/*######################################################################## DENTIST LOGIN ENPOINT #################################################################################### */
app.post('/api/dentists/login', login)

/*######################################################################## UNPROTECTED ENPOINT #################################################################################### */
/* Below are the enpoints that don't require a login. They do not require a token to be accessed */
app.get('/api/clinics/get', get)
app.get('/api/appointments/get/clinics/available/appointments/:appointment_id', get)
app.put('/api/appointments/update/:appointment_id', put)
app.get('/api/appointments/get/available/appointments', get)
app.get('/api/clinics/get/specific/:clinic_id', get)
app.get('/api/dentists/get/clinics/dentists/:clinic_id', get)


/*######################################################################## GENERIC POST ENPOINT #################################################################################### */
/* catches the rest of post requests after the user is authenticated and given a token */
app.post("/api/*", jwtVerification.verifyToken, post);

/*######################################################################## GENERIC GET ENPOINT #################################################################################### */
/* catches all get requests and requires a token otherwise the request will be blocked  */
app.get("/api/*", jwtVerification.verifyToken, get);

/*######################################################################## GENERIC PUT ENPOINT #################################################################################### */
/* catches all put requests and requires a token otherwise the request will be blocked  */
app.put("/api/*", jwtVerification.verifyToken, put);

/*######################################################################## GENERIC DELETE ENPOINT #################################################################################### */
/* catches all delete requests and requires a token otherwise the request will be blocked  */
app.delete("/api/*",  jwtVerification.verifyToken, deleteEndpoint);


// Start Express server
app.listen(PORT, () => {
 console.log(`Gateway is running on port ${PORT}`);
})
