const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const { createProxyMiddleware } = require("http-proxy-middleware");
const request = require("request");
const app = express();
const mqttBroker = require("./mqtt-broker.js");

//sessions variables 
const jwtVerification = require('./jwtVerification.js')
const cookieParser = require('cookie-parser');
const session = require('express-session');
const MongoStore = require('connect-mongo');

const PORT = 3000;

// function activityCheck(server){                           //ping and echo - is the server running
//   request(server.host + '/active', (err,res) =>{
//     if(!err && res.statusCode == 200){
//       server.isActive = true;
//       console.log(`Server ${server.host} is running`);
//     } else {
//       server.isActive = false;
//       console.log(`Server ${server.host} is not running`);
//     }
//   }) 
// }

// setInterval(() => {                                     // Interval for ping and echo (every 5 seconds)
//   services.forEach((server) => {
//     server.ports.forEach((service_instance) => {
//       activityCheck(service_instance);
//     })
//
//   })
// }, 5000)


// const origins = [
//   "http://localhost:5173",
//   "http://localhost:3001",
//   "http://localhost:3002",
//   "http://localhost:3003",
//   "http://localhost:3004",
//   "http://localhost:3009",
//   "http://localhost:3011",
//   "http://localhost:3012",
//   "http://localhost:3005"
// ];
// Middleware setup
// app.use(cors()); // Enable CORS
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

// app.use((req, res) => {               //load balancer middleware
//   let activeServers = []
//   services.forEach((server) => {      // only active servers are recieving requests
//     server.ports.forEach((port) => {
//       if(port.isActive == true) {
//         activeServers.push(server)      // save the active servers in an array
//       }
//     })
//   })
//
//   var currServer=""
//   var url = extractRoute(req.url)                // calling method to make sure it only contains the two first words (/api/resourseName)
//   activeServers.forEach((activeServer) => {      // search for the service with the same route that should receive the request
//     if(url === activeServer.route){
//       currServer = activeServer
//     }
//   })
//
//   const port = roundRobinPort(currServer.ports, currServer.index)             // if there are many instances of the same service - balance between them
//   currServer.index = port.index
//   currServer.host = `http://localhost:${port.portValue}`              // give the portnumber for the port that should receive the request
//   req.pipe(request(currServer.host + req.url)).pipe(res)              // forwarding the request to the correct service (the straw)
// })

// function extractRoute(url){
//   var tempArr = url.split("/")
//   var route = "/"+tempArr[1]+ "/"+tempArr[2]
//   return route
// }


//-----------http mqtt adapter---------------//
// var activeServices = [];
// var checkServices = [];
// exports.saveActiveService = async (topic, payload) => {
    
//     var service = {topic: topic, entity:payload}
//     var alreadyExists = activeServices.find(service => service.payload === payload)

//     if (!alreadyExists){
//     activeServices.push(service)
//     }
// }


// const services = [                                      //Service array
//     {
//       service: "appointments",
//       topics: [
//         {topic:"appointment",isActive:true},
//         {topic:"appointment2",isActive:true},
//         {topic:"appointment3",isActive:true}
//       ],
//       index:0
//     },
//     {
//       service: "patients",
//       topics: [
//             {topic:"patients",isActive:true}
//       ],
//       index:0
//     },
//     {
//       service: "clinics",
//       topics: [
//         {topic: "clinics", isActive: true}
//       ],
//       index:0
//     },
//     {
//       service: "dentists",
//       topics: [
//         {topic: "dentists", isActive: true},
//       ],
//       index:0
//     },
//    ];

app.post("/api/*", async (req, res) => {
    try {
        
        //get the body and make it a string, get url, remove "api" and give it a unique id
        var body = req.body;
        const payload = JSON.stringify(body);
        const reqURL = req.url;
        var adaptedURL = adaptRequestURL(reqURL);
        
        //create all topics
        var topic = adaptedURL + "/" + giveUniqueID();
        var responseTopic = 'response/'+topic

        var topicArr = topic.split("/");
        var nameOfEntity = topicArr[0];
        var serviceTopic = nameOfEntity+"/topics";
        
        var serviceTopicResponse = "response/"+serviceTopic;
        var responseTopic = 'response/'+topic

        //tell service to subscribe to the topic sent as a payload and make gateway subscribe to response topic
        await mqttBroker.subscribeToBroker(serviceTopicResponse);
        var serviceResponse = await mqttBroker.publishToBroker(serviceTopic,topic);
      
        if(!serviceResponse){
            res.status(400).json({message: "could not find service"})
            return
        }else if (serviceResponse){
            mqttBroker.unsubscribe(serviceTopicResponse);
        }
        


        //Publish request
        await mqttBroker.subscribeToBroker(responseTopic);
        
        var mqttResponse = await mqttBroker.publishToBroker(topic, payload);
        if(!mqttResponse){
            res.status(400).json({message: "could not create object"});
            return
        }else if(mqttResponse){
            mqttBroker.unsubscribe(responseTopic);
        }
        
        //exstract information from topic and response, parse the payload and return http response
        var responseArr = mqttResponse.split("/");
        var status = parseInt(responseArr[0]);
        
        if(responseArr.length <=2){
            res.status(status).json({message : responseArr[1]});
        }else{
        var adaptedResponse = JSON.parse(responseArr[2]);        
            
        // after login, each request is supposed to have a token. Here I check if it does exist
            if (adaptedResponse.token) {
            
            // setting the token in the cookie
            res.cookie('token', adaptedResponse.token, {
                httpOnly: true,
                secure: true,
                sameSite: 'strict',
                maxAge: 3600000,
            })
            
        }
        res.status(status).json({ message: responseArr[1], [nameOfEntity]: adaptedResponse });
        return;
        }

    } catch (error) {

        const errorMessage = error.toString();
        let catchArr = errorMessage.split("/")
       
        if(catchArr.length===1){
            res.status(400).json({message: "something went wrong"}); 
        }else{
            const status = parseInt(catchArr[0]);
            res.status(status).json({message: catchArr[1]});
        }

    }
});
app.get("/api/*", jwtVerification.verifyToken, async (req, res) => {
    try {
        //get the body and make it a string, get the url and call method to remove "api"
        var body = req.body;
        var payload = JSON.stringify(body);
        const reqURL = req.url;
        var adaptedURL = adaptRequestURL(reqURL);
        
        //create all topics
        // does url contain an _id? if not give it an unique id
        var id = checkForId(adaptedURL);
        if(!id){
            var topic = adaptedURL + "/" + giveUniqueID();
        }else{
            topic = adaptedURL;
        }
        var topicArr = topic.split("/");
        var nameOfEntity = topicArr[0];
        var serviceTopic = nameOfEntity+"/topics";
        var serviceTopicResponse = "response/"+serviceTopic;
        var responseTopic = 'response/'+topic

        //tell service to subscribe to the topic sent as a payload and make gateway subscribe to response topic
        await mqttBroker.subscribeToBroker(serviceTopicResponse);
        var serviceResponse = await mqttBroker.publishToBroker(serviceTopic,topic);
        if(!serviceResponse){
            res.status(400).json({message: "could not find service"})
            return
        }else if (serviceResponse){
            mqttBroker.unsubscribe(serviceTopicResponse);
        }

        

        //Publish request
        await mqttBroker.subscribeToBroker(responseTopic);
        console.log('payload before ',payload);
        // I am parsing the payload to json in order to add the userId field to it. 
        payload = JSON.parse(payload);

        // get the user id from the current session and send it to the controller so that it knows which patient is logged in at the moment.
        const sessionUserId = req.user.userId;

        // adding the userId field to the payload 
        payload.userId = sessionUserId;
        console.log('payload after ',payload);

        
        var mqttResponse = await mqttBroker.publishToBroker(topic, JSON.stringify(payload));
        if(!mqttResponse){
            res.status(400).json({message: "could not create object"});
            return
        }else if(mqttResponse){
            mqttBroker.unsubscribe(responseTopic);
        }
         //exstract information from topic and response, parse the payload and return http response
        var topicArr = topic.split("/");
        var nameOfEntity = topicArr[0]
        var responseArr = mqttResponse.split("/"); 
        var status = parseInt(responseArr[0]);
        if(responseArr.length <=2){
            res.status(status).json({message : responseArr[1]});
        }else{
        var adaptedResponse = JSON.parse(responseArr[2]);     
        res.status(status).json({ message: responseArr[1], [nameOfEntity]: adaptedResponse });
        return;
        }

    } catch (error) {        
        const errorMessage = error.toString();
        let catchArr = errorMessage.split("/")
       
        if(catchArr.length===1){
            res.status(400).json({message: "something went wrong"}); 
        }else{
            const status = parseInt(catchArr[0]);
            res.status(status).json({message: catchArr[1]});
        }
    }
});
app.put("/api/*", jwtVerification.verifyToken, async (req, res) => {
    try {
        //get the body and make it a string, get the url and call method to remove "api"
        var body = req.body;
        var payload = JSON.stringify(body);
        const reqURL = req.url;
        var adaptedURL = adaptRequestURL(reqURL);
        
        //create all topics
        // does url contain an _id? if not give it an unique id
        var id = checkForId(adaptedURL);
        if(!id){
            var topic = adaptedURL + "/" + giveUniqueID();
        }else{
            topic = adaptedURL;
        }
        var topicArr = topic.split("/");
        var nameOfEntity = topicArr[0];
        var serviceTopic = nameOfEntity+"/topics";
        var serviceTopicResponse = "response/"+serviceTopic;
        var responseTopic = 'response/'+topic

        //tell service to subscribe to the topic sent as a payload and make gateway subscribe to response topic
        await mqttBroker.subscribeToBroker(serviceTopicResponse);
        var serviceResponse = await mqttBroker.publishToBroker(serviceTopic,topic);
        
        if(!serviceResponse){
            res.status(400).json({message: "could not find service"})
            return
        }else if (serviceResponse){
            mqttBroker.unsubscribe(serviceTopicResponse);
        }



        //Publish request
        await mqttBroker.subscribeToBroker(responseTopic);

        // I am parsing the payload to json in order to add the userId field to it. 
        payload = JSON.parse(payload);

        // get the session variable
        const sessionUserId = req.user.userId;

        // adding the userId field to the payload 
        payload.userId = sessionUserId;

        // stringifying the payload again because mqtt expects a string
        var mqttResponse = await mqttBroker.publishToBroker(topic, JSON.stringify(payload));
        
        if (!mqttResponse) {
            res.status(400).json({message: "could not update object"});
            return
        }else if(mqttResponse){
            mqttBroker.unsubscribe(responseTopic);
        }
         //exstract information from topic and response, parse the payload and return http response
        var topicArr = topic.split("/");
        var nameOfEntity = topicArr[0]
        var responseArr = mqttResponse.split("/"); 
        var status = parseInt(responseArr[0]);
        if(responseArr.length <=2){
            res.status(status).json({message : responseArr[1]});
        }else{
        var adaptedResponse = JSON.parse(responseArr[2]);     
        res.status(status).json({ message: responseArr[1], [nameOfEntity]: adaptedResponse });
        return;
        }

    } catch (error) {        
        const errorMessage = error.toString();
        let catchArr = errorMessage.split("/")
       
        if(catchArr.length===1){
            res.status(400).json({message: "something went wrong"}); 
        }else{
            const status = parseInt(catchArr[0]);
            res.status(status).json({message: catchArr[1]});
        }
    }
});
app.delete("/api/*",  jwtVerification.verifyToken, async (req, res) => {
    try {
        //get the body and make it a string, get the url and call method to remove "api"
        var body = req.body;
        var payload = JSON.stringify(body);
        const reqURL = req.url;
        var adaptedURL = adaptRequestURL(reqURL);
        
        //create all topics
        // does url contain an _id? if not give it an unique id
        var id = checkForId(adaptedURL);
        if(!id){
            var topic = adaptedURL + "/" + giveUniqueID();
        }else{
            topic = adaptedURL;
        }
        var topicArr = topic.split("/");
        var nameOfEntity = topicArr[0];
        var serviceTopic = nameOfEntity+"/topics";
        var serviceTopicResponse = "response/"+serviceTopic;
        var responseTopic = 'response/'+topic

        //tell service to subscribe to the topic sent as a payload and make gateway subscribe to response topic
        await mqttBroker.subscribeToBroker(serviceTopicResponse);
        var serviceResponse = await mqttBroker.publishToBroker(serviceTopic,topic);
        
        if(!serviceResponse){
            res.status(400).json({message: "could not find service"})
            return
        }else if (serviceResponse){
            mqttBroker.unsubscribe(serviceTopicResponse);
        }



        //Publish request
        await mqttBroker.subscribeToBroker(responseTopic);
        // I am parsing the payload to json in order to add the userId field to it. 
        payload = JSON.parse(payload);

        // get the session variable
        const sessionUserId = req.user.userId;

        // adding the userId field to the payload 
        payload.userId = sessionUserId;

        var mqttResponse = await mqttBroker.publishToBroker(topic, JSON.stringify(payload));
        if(!mqttResponse){
            res.status(400).json({message: "could not delete object"});
            return
        }else if(mqttResponse){
            mqttBroker.unsubscribe(responseTopic);
        }
         //exstract information from topic and response, parse the payload and return http response
        var topicArr = topic.split("/");
        var nameOfEntity = topicArr[0]
        var responseArr = mqttResponse.split("/"); 
        var status = parseInt(responseArr[0]);
        if(responseArr.length <=2){
            res.status(status).json({message : responseArr[1]});
        }else{
        var adaptedResponse = JSON.parse(responseArr[2]);     
        res.status(status).json({ message: responseArr[1], [nameOfEntity]: adaptedResponse });
        return;
        }

    } catch (error) {
        
        var catchArr = message.split("/")
        if(catchArr.length===1){
            res.status(400).json({message: "something went wrong"}); 
        }else{
            var status = parseInt(catchArr[0]);
        res.status(status).json({message: catchArr[1]});
        }
    }
});

function adaptRequestURL (url) {
    var newURL = url.replace('/api/', '');
    return newURL;
}

function giveUniqueID () {
    let uniqueID = Math.random() + Date.now();
    return uniqueID;
}
function checkForId(adaptedURL){
    var urlArr = adaptedURL.split("/")
    var index = urlArr.length -1
    var lastElement = urlArr[index];
    if(lastElement.length < 24){
        //element is not an id
        return;
    }else{
        var id = lastElement;
        return id;
    }
}


// const services = [                                      //Service array
//     {
//       route: "/api/patients",
//       target: "",
//       isRunning: true,
//       host:"",
//       ports: [
//         {port: 3001, isActive: true, host: `http://localhost:3001`},
//         {port: 3004, isActive: true, host: `http://localhost:3004`},
//         {port: 3009, isActive: true, host: `http://localhost:3009`}
//       ] ,
//       index:0,
//
//     },
//     {
//         route: "/api/appointments",
//         target: "",
//         isRunning: true,
//         host: "",
//         ports: [
//           {port: 3002, isActive: true, host: `http://localhost:3002`},
//           {port: 3011, isActive: true, host: `http://localhost:3011`},
//           {port: 3012, isActive: true, host: `http://localhost:3012`}
//
//         ],
//         index:0,
//       },
//       {
//         route: "/api/clinics",
//         target: "",
//         isRunning: true,
//         host: "",
//         ports: [
//           {port: 3003, isActive: true, host: `http://localhost:3003`}
//         ],
//         index:0,
//       },
//       {
//         route: "/api/dentists",
//         target: "",
//         isRunning: true,
//         host: "",
//         ports: [
//           {port: 3005, isActive: true, host: `http://localhost:3005`},
//         ],
//         index:0,
//       },
//    ];

   // services.forEach(service => {                    // populate the target and the host with the correct values using roundRobin if there is duplicate services
   //    var portAndIndex = roundRobinPort(service.ports, service.index)
   //    var port = portAndIndex.portValue
   //    service.index = portAndIndex.index
   //
   //    service.target = `http://localhost:${port}${service.route}`
   //    service.host = `http://localhost:${port}`
   // })

   // function roundRobinPort(ports,index){
   //    var portValue = 0
   //
   //    if(ports.length === 1){                 //if there is only one service
   //      portValue = ports[index].port
   //      portAndIndex = {portValue, index}
   //
   //      return portAndIndex
   //    } else {                              //If there is duplicate services
   //      index = (index + 1) % ports.length   //roundRobin algorithm
   //
   //      if (ports[index].isActive == false){
   //        roundRobinPort(ports, index);             //if the current service instance is down, move on to the next
   //      } else {
   //        portValue = ports[index].port;
   //        portAndIndex = { portValue, index }; //returning the portnumber and the new index value
   //      }
   //
   //      return portAndIndex
   //    }
   // }



// services.forEach(({ route, target }) => {           //Gateway receiving Api calls and rerouts it to its corresponding service
//     // Proxy options
//     const proxyOptions = {
//       target,
//       changeOrigin: true,
//       pathRewrite: {
//         [`^${route}`]: "",
//       },
//     };
//     app.use(route, createProxyMiddleware(proxyOptions));
// });


// Start Express server
app.listen(PORT, () => {
 console.log(`Gateway is running on port ${PORT}`);
})
