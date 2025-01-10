const mqttBroker = require("../mqtt-broker.js");
const index = require('../index.js');

//sessions variables 
const jwtVerification = require('../jwtVerification.js');
const jwt = require('jsonwebtoken');

/* ################################################# LOGIN, LOGOUT AND SIGNUP ENDPOINTS ############################################################# */
exports.login = async (req, res) => {
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
    
        //send nameOfService to check service array and make a roundRobin
        const balancedService = await index.balanceService(nameOfService);   
        if(balancedService === 0){
            res.status(400).json({message: "service is not active"});
            return
        }
        topic = topic.replace(nameOfService,balancedService);
        var responseTopic = 'response/'+topic
        var serviceTopic = balancedService+"/topics";
        var serviceTopicResponse = "response/"+serviceTopic;
        

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
            return res.status(status).json({message : responseArr[1]});
        }else{
            var adaptedResponse = JSON.parse(responseArr[2]);        
                
            // after login, each request is supposed to have a token. Here I check if it does exist
                if (adaptedResponse.token) {

                // setting the token in the cookie
                res.cookie('token', adaptedResponse.token, {
                    httpOnly: true,
                    secure: true,
                    sameSite: 'None',
                    maxAge: 3600000,
                })
                
            }
            
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
}


exports.logout = async (req, res) => { 
    try {
        res.clearCookie('token', {
            httpOnly: true,
            secure: true,
            sameSite: 'None'
        })

        return res.status(200).json({
            message: 'Logout successful!',
            loggedIn: false,
            isPatient: false,
            isDentist: false,
            isAdmin: false,
        });
    } catch (error) {        
        return res.status(400).json({ message: 'Something went wrong. Logout failed!' });
    }
}

exports.loginCheck = async (req, res) => { 
    const token = req.cookies.token;
    // console.log('printing the token in verify method: ', token);
    
    if (!token) {
        // if token is not set, i am returning 401 unauthorized code
        return res.status(401).json({message: 'Access denied. Authentication token is missing'})
    }

    var decodedToken = '';
    try {
        const secret_key = process.env.JWT_SECRET_KEY;

        // check if the token contains our secret key. Without this, we are vulnerable 
        // attacks by fake tokens. here we make sure the incoming request has the key that we set
        decodedToken = jwt.verify(token, secret_key); 
        
        const userRole = decodedToken.role;
        const userRegion = decodedToken.region;

        if (userRole === 'patient') {
            return res.status(200).json({
                message: 'Logged in!',
                loggedIn: true,
                isPatient: true,
                isDentist: false,
                isAdmin: false,
                region: userRegion
            });
        } else if (userRole === 'dentist') {
            return res.status(200).json({
                message: 'Logged in!',
                loggedIn: true,
                isPatient: false,
                isDentist: true,
                isAdmin: false,
                region: userRegion
            });
        } else if (userRole === 'admin') {
            return res.status(200).json({
                message: 'Logged in!',
                loggedIn: true,
                isPatient: false,
                isDentist: false,
                isAdmin: true,
                region: userRegion
            });
        }

    } catch (error) {                
        return res.status(403).json({message: 'Token either expired or invalid', user: decodedToken})
    }
}


exports.signup = async (req, res) => {
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
    
        //send nameOfService to check service array and make a roundRobin
        const balancedService = await index.balanceService(nameOfService);  
        if(balancedService === 0){
            res.status(400).json({message: "service is not active"});
            return
        } 
        topic = topic.replace(nameOfService,balancedService);
        var responseTopic = 'response/'+topic
        var serviceTopic = balancedService+"/topics";
        var serviceTopicResponse = "response/"+serviceTopic;
        

        //tell service to subscribe to the topic sent as a payload and make gateway subscribe to response topic
        await mqttBroker.subscribeToBroker(serviceTopicResponse);
        var serviceResponse = await mqttBroker.publishToBroker(serviceTopic, topic);
      
        if (!serviceResponse) {
            res.status(400).json({ message: "could not find service" })
            return
        } else if (serviceResponse) {
            mqttBroker.unsubscribe(serviceTopicResponse);
        }
        
        //Publish request
        await mqttBroker.subscribeToBroker(responseTopic);
        
        var mqttResponse = await mqttBroker.publishToBroker(topic, payload);
        if (!mqttResponse) {
            res.status(400).json({ message: "could not create object" });
            return
        } else if (mqttResponse) {
            mqttBroker.unsubscribe(responseTopic);
        }

        //exstract information from topic and response, parse the payload and return http response
        var responseArr = mqttResponse.split("/");
        var status = parseInt(responseArr[0]);
        
        if (responseArr.length <= 2) {
            return res.status(status).json({ message: responseArr[1] });
        } else {
            var adaptedResponse = JSON.parse(responseArr[2]);

            return res.status(status).json({ message: responseArr[1], [nameOfService]: adaptedResponse });
            
        }
    } catch (error) {
        const errorMessage = error.toString();
        let catchArr = errorMessage.split("/")
       
        if (catchArr.length === 1) {
            return res.status(400).json({ message: "something went wrong" });
        } else {
            const status = parseInt(catchArr[0]);
            return res.status(status).json({ message: catchArr[1] });
        }

    }
}


/* ################################################# GENERIC POST, GET, PUT AND DELETE ENDPOINTS ############################################################# */

exports.post = async (req, res) => { 
    try {
        
        //get the body and make it a string, get url, remove "api" and give it a unique id
        var body = req.body;
        var payload = JSON.stringify(body);
        const reqURL = req.url;
        var adaptedURL = adaptRequestURL(reqURL);
        
        //create all topics
        var topic = adaptedURL + "/" + giveUniqueID();
        var topicArr = topic.split("/");
        var nameOfService = topicArr[0];
    
        //send nameOfService to check service array and make a roundRobin
        const balancedService = await index.balanceService(nameOfService);
        if(balancedService === 0){
            res.status(400).json({message: "service is not active"});
            return
        }  
        
        topic = topic.replace(nameOfService,balancedService);
        var responseTopic = 'response/'+topic
        var serviceTopic = balancedService+"/topics";
        var serviceTopicResponse = "response/"+serviceTopic;

        

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

        // get the user id from the current session and send it to the controller so that it knows which patient is logged in at the moment.
        const sessionUserId = req.user.userId;
        const sessionUserRole = req.user.role;
        const sessionUserEmail = req.user.email;
        const sessionPhoneNumber = req.user.phone_number;
        // adding the userId field to the payload 
        payload.userId = sessionUserId;
        payload.role = sessionUserRole;
        payload.email = sessionUserEmail;
        payload.phone_number = sessionPhoneNumber;
        
        var mqttResponse = await mqttBroker.publishToBroker(topic, JSON.stringify(payload));
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
}

exports.get = async (req, res) => { 
    try {
        //get the body and make it a string, get the url and call method to remove "api"
        var body = req.body;
        var payload = JSON.stringify(body);
        const reqURL = req.url;
        var adaptedURL = adaptRequestURL(reqURL);
        
        // pagination variables
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10; 
                
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

        //send nameOfService to check service array and make a roundRobin
        const balancedService = await index.balanceService(nameOfService);
        if(balancedService === 0){
            res.status(400).json({message: "service is not active"});
            console.log(nameOfService,'IS NOT ACTIVE');
            return
        }   
        topic = topic.replace(nameOfService,balancedService);
        var responseTopic = 'response/'+topic
        var serviceTopic = balancedService+"/topics";
        var serviceTopicResponse = "response/"+serviceTopic;

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

        // add the pagination variables to the payload
        if (page && limit) {
            payload.page = page;
            payload.limit = limit; 
        }

        if (req.user) {

            // get the user id from the current session and send it to the controller so that it knows which patient is logged in at the moment.
            const sessionUserId = req.user.userId;
            const sessionUserRole = req.user.role;
            
            // adding the userId field to the payload 
            payload.userId = sessionUserId;
            payload.role = sessionUserRole;
        }

        
        var mqttResponse = await mqttBroker.publishToBroker(topic, JSON.stringify(payload));
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
        res.status(status).json({ message: responseArr[1], [nameOfService]: adaptedResponse });
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
}

exports.put = async (req, res) => { 
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
        var nameOfService = topicArr[0];

        //send nameOfService to check service array and make a roundRobin
        const balancedService = await index.balanceService(nameOfService); 
        if(balancedService === 0){
            res.status(400).json({message: "service is not active"});
            return
        }  
        topic = topic.replace(nameOfService,balancedService);
        var responseTopic = 'response/'+topic
        var serviceTopic = balancedService+"/topics";
        var serviceTopicResponse = "response/"+serviceTopic;

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
        if (req.user) {

            // get the user id from the current session and send it to the controller so that it knows which patient is logged in at the moment.
            const sessionUserId = req.user.userId;
            const sessionUserRole = req.user.role;
            
            // adding the userId field to the payload 
            payload.userId = sessionUserId;
            payload.role = sessionUserRole;
        }

        // stringifying the payload again because mqtt expects a string
        var mqttResponse = await mqttBroker.publishToBroker(topic, JSON.stringify(payload));
        
        if (!mqttResponse) {
            res.status(400).json({message: "could not update object"});
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
        res.status(status).json({ message: responseArr[1], [nameOfService]: adaptedResponse });
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
}

exports.deleteEndpoint = async (req, res) => {
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
        var nameOfService = topicArr[0];

        //send nameOfService to check service array and make a roundRobin
        const balancedService = await index.balanceService(nameOfService); 
        if(balancedService === 0){
            res.status(400).json({message: "service is not active"});
            return
        }  
        topic = topic.replace(nameOfService,balancedService);
        var responseTopic = 'response/'+topic
        var serviceTopic = balancedService+"/topics";
        var serviceTopicResponse = "response/"+serviceTopic;

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
        const sessionUserRole = req.user.role;
        // adding the userId and role field to the payload 
        payload.userId = sessionUserId;
        payload.role = sessionUserRole;

        var mqttResponse = await mqttBroker.publishToBroker(topic, JSON.stringify(payload));
        if(!mqttResponse){
            res.status(400).json({message: "could not delete object"});
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
        res.status(status).json({ message: responseArr[1], [nameOfService]: adaptedResponse });
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
 }


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
