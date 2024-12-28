const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const { createProxyMiddleware } = require("http-proxy-middleware");
const request = require("request");
const app = express();
const mqttBroker = require("./mqtt-broker.js");
const { baseModelName } = require("../appointment_management_service/models/Appointment.js");

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



exports.updateIsActive = async (serviceName, topicName) => {
    const specificService = services.find((service) => service.service === serviceName);
    if(!specificService){
        console.log('service not found');
        return
    }
    const specificTopic = specificService.topics.find((topic)=> topic.topic === topicName);
    if(!specificTopic){
        console.log('no topic found');
        return
    }
    specificTopic.isActive = true;
    
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

app.post("/api/*", async (req, res) => {
    try {
        
        //get the body and make it a string, get url, remove "api" and give it a unique id
        var body = req.body;
        const payload = JSON.stringify(body);
        const reqURL = req.url;
        var adaptedURL = adaptRequestURL(reqURL);
        
        //create all topics
        var topic = adaptedURL + "/" + giveUniqueID();
        var topicArr = topic.split("/");
        var nameOfService = topicArr[0];
        const balancedService = balanceService(nameOfService);   
        console.log("BALANCED SERVICE: ",balancedService);
        topic = topic.replace(nameOfService,balancedService);
        console.log("NEW TOPIC: ",topic);
        var responseTopic = 'response/'+topic

        
        

        //send nameOfService to check service array and make a roundRobin
        
        var serviceTopic = balancedService+"/topics";
        
        var serviceTopicResponse = "response/"+serviceTopic;
        var responseTopic = 'response/'+topic

        //tell service to subscribe to the topic sent as a payload and make gateway subscribe to response topic
        await mqttBroker.subscribeToBroker(serviceTopicResponse);
        var serviceResponse = await mqttBroker.publishToBroker(serviceTopic,topic);
      
        if(!serviceResponse){
            return res.status(400).json({message: "could not find service"})
            
        }else if (serviceResponse){
            mqttBroker.unsubscribe(serviceTopicResponse);
        }
        
        

        //Publish request
        await mqttBroker.subscribeToBroker(responseTopic);
        
        var mqttResponse = await mqttBroker.publishToBroker(topic, payload);
        if(!mqttResponse){
            return res.status(400).json({message: "could not create object"});
            
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
    
        return res.status(status).json({ message: responseArr[1], [nameOfService]: adaptedResponse });
        
        }
        var catchArr = []
        if (errorMessage) {
            catchArr = errorMessage.split("/")
        }





    } catch (error) {
        const errorMessage = error.toString();
        let catchArr = errorMessage.split("/")
       
        if(catchArr.length===1){
            return res.status(400).json({message: "something went wrong"}); 
        }else{
            const status = parseInt(catchArr[0]);
            return res.status(status).json({message: catchArr[1]});
        }
    }
});
app.get("/api/*", async (req, res) => {
    try {
        //get the body and make it a string, get the url and call method to remove "api"
        var body = req.body;
        const payload = JSON.stringify(body);
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
        var nameOfService = topicArr[0];
        const balancedService = balanceService(nameOfService);   
        console.log("BALANCED SERVICE: ",balancedService);
        topic = topic.replace(nameOfService,balancedService);
        console.log("NEW TOPIC: ",topic);

        var serviceTopic = balancedService+"/topics";
        var serviceTopicResponse = "response/"+serviceTopic;
        var responseTopic = 'response/'+topic

        //tell service to subscribe to the topic sent as a payload and make gateway subscribe to response topic
        await mqttBroker.subscribeToBroker(serviceTopicResponse);
        var serviceResponse = await mqttBroker.publishToBroker(serviceTopic,topic);
        if(!serviceResponse){
            return res.status(400).json({message: "could not find service"})
            
        }else if (serviceResponse){
            mqttBroker.unsubscribe(serviceTopicResponse);
        }

        

        //Publish request
        await mqttBroker.subscribeToBroker(responseTopic);
        
        var mqttResponse = await mqttBroker.publishToBroker(topic, payload);
        if(!mqttResponse){
            return res.status(400).json({message: "could not create object"});
            
        }else if(mqttResponse){
            mqttBroker.unsubscribe(responseTopic);
        }
         //exstract information from topic and response, parse the payload and return http response
        
        var responseArr = mqttResponse.split("/"); 
        var status = parseInt(responseArr[0]);
        if(responseArr.length <=2){
            return res.status(status).json({message : responseArr[1]});
        }else{
            var adaptedResponse = JSON.parse(responseArr[2]);     
            return res.status(status).json({ message: responseArr[1], [nameOfService]: adaptedResponse });
        
        }

    } catch (error) {
        const errorMessage = error.toString();
        let catchArr = errorMessage.split("/")
       
        if(catchArr.length===1){
            return res.status(400).json({message: "something went wrong"}); 
        }else{
            const status = parseInt(catchArr[0]);
            return res.status(status).json({message: catchArr[1]});
        }
    }
});
app.put("/api/*", async (req, res) => {
    try {
        //get the body and make it a string, get the url and call method to remove "api"
        var body = req.body;
        const payload = JSON.stringify(body);
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
        var nameOfService = topicArr[0];
        const balancedService = balanceService(nameOfService);   
        console.log("BALANCED SERVICE: ",balancedService);
        topic = topic.replace(nameOfService,balancedService);
        console.log("NEW TOPIC: ",topic);

        var serviceTopic = balancedService+"/topics";
        var serviceTopicResponse = "response/"+serviceTopic;
        var responseTopic = 'response/'+topic

        //tell service to subscribe to the topic sent as a payload and make gateway subscribe to response topic
        await mqttBroker.subscribeToBroker(serviceTopicResponse);
        var serviceResponse = await mqttBroker.publishToBroker(serviceTopic,topic);
        
        if(!serviceResponse){
            return res.status(400).json({message: "could not find service"})
            
        }else if (serviceResponse){
            mqttBroker.unsubscribe(serviceTopicResponse);
        }



        //Publish request
        await mqttBroker.subscribeToBroker(responseTopic);
        
        var mqttResponse = await mqttBroker.publishToBroker(topic, payload);
        if(!mqttResponse){
            return res.status(400).json({message: "could not update object"});
            
        }else if(mqttResponse){
            mqttBroker.unsubscribe(responseTopic);
        }
         //exstract information from topic and response, parse the payload and return http response
        
        var responseArr = mqttResponse.split("/"); 
        var status = parseInt(responseArr[0]);
        if(responseArr.length <=2){
            return res.status(status).json({message : responseArr[1]});
        }else{
        var adaptedResponse = JSON.parse(responseArr[2]);     
        return res.status(status).json({ message: responseArr[1], [nameOfService]: adaptedResponse });
        
        }

    } catch (error) {
        const errorMessage = error.toString();
        let catchArr = errorMessage.split("/")
       
        if(catchArr.length===1){
            return res.status(400).json({message: "something went wrong"}); 
        }else{
            const status = parseInt(catchArr[0]);
            return res.status(status).json({message: catchArr[1]});
        }
    }
});
app.delete("/api/*", async (req, res) => {
    try {
        //get the body and make it a string, get the url and call method to remove "api"
        var body = req.body;
        const payload = JSON.stringify(body);
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
        var nameOfService = topicArr[0];
        const balancedService = balanceService(nameOfService);   
        console.log("BALANCED SERVICE: ",balancedService);
        topic = topic.replace(nameOfService,balancedService);
        console.log("NEW TOPIC: ",topic);

        var serviceTopic = balancedService+"/topics";
        var serviceTopicResponse = "response/"+serviceTopic;
        var responseTopic = 'response/'+topic

        //tell service to subscribe to the topic sent as a payload and make gateway subscribe to response topic
        await mqttBroker.subscribeToBroker(serviceTopicResponse);
        var serviceResponse = await mqttBroker.publishToBroker(serviceTopic,topic);
        
        if(!serviceResponse){
            return res.status(400).json({message: "could not find service"})
            
        }else if (serviceResponse){
            mqttBroker.unsubscribe(serviceTopicResponse);
        }



        //Publish request
        await mqttBroker.subscribeToBroker(responseTopic);
        
        var mqttResponse = await mqttBroker.publishToBroker(topic, payload);
        if(!mqttResponse){
            return res.status(400).json({message: "could not delete object"});
            
        }else if(mqttResponse){
            mqttBroker.unsubscribe(responseTopic);
        }
         //exstract information from topic and response, parse the payload and return http response
        
        var responseArr = mqttResponse.split("/"); 
        var status = parseInt(responseArr[0]);
        if(responseArr.length <=2){
            return res.status(status).json({message : responseArr[1]});
        }else{
        var adaptedResponse = JSON.parse(responseArr[2]);     
            return res.status(status).json({ message: responseArr[1], [nameOfService]: adaptedResponse });
        }

    } catch (error) {
        const errorMessage = error.toString();
        let catchArr = errorMessage.split("/")
       
        if(catchArr.length===1){
            return res.status(400).json({message: "something went wrong"}); 
        }else{
            const status = parseInt(catchArr[0]);
            return res.status(status).json({message: catchArr[1]});
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
    function balanceService (serviceName){
        const specificService = services.find((service) => service.service === serviceName);
        if(!specificService){
            console.log('service not found');
            return
        }
        const response = roundRobin(specificService.topics,specificService.index);
        specificService.index = response.index;
        const balancedService = response.topic;
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
