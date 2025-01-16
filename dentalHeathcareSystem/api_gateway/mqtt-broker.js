const mqtt = require('async-mqtt');
const index = require('./index');

var mqttClient;
const host = "mosquitto-broker";
const protocol = "mqtt";
const port = "1884";
var responseArr = [];

const os = require('os');
const { log } = require('console');
const specialNumber = os.hostname();
const service = process.env.SERVICE;
const thisService = service +'-'+specialNumber;
console.log("Gateway name is:",thisService);



function connectToBroker() {
    const clientId = "client" + Math.random() + Date.now();
    const hostURL = `${protocol}://${host}:${port}`;
    const options = {
        keepalive: 60,
        retryInterval: 0,
        clientId: thisService,
        protocolId: "MQTT",
        protocolVersion: 4,
        clean: true,
        reconnectPeriod: 1000,
        connectTimeout: 30 * 1000,
        anonymous: false,
        username: 'extraOrdinary-mosquitto-33',
        password: '12345'
    }

    mqttClient = mqtt.connect(hostURL, options);
    mqttClient.on("error", (error) => {
        console.log(error);
        mqttClient.end();
    });

    mqttClient.on("reconnect", () => {
        console.log("reconnecting...");
    });

    mqttClient.on("connect", () => {
        console.log("client connected. client ID: " + clientId);
    });

    mqttClient.on("message", async (topic, payload, packet) => {
        
        // console.log("On topic: " + topic);
        // console.log(packet);
        var stringPayload = payload.toString();
        
        
        if (topic === "active"){
            const messageReceived = JSON.parse(payload);
            //console.log("MESSAGE RECEIVED :",messageReceived);
            const isActive = messageReceived.isActive;
            const serviceTopic = messageReceived.serviceTopic;
            if(!serviceTopic){
                console.log("Message is undefined");
                return
            }
            //console.log("SERVICETOPIC:",serviceTopic);
            const messageArr = serviceTopic.split('-');
            await index.updateIsActive(messageArr[0],serviceTopic,isActive);   
        }else{

         if (topic.startsWith("response/")){
            var newResponse = {topic : topic, payload: stringPayload}
            responseArr.push(newResponse);
         }
        }
    });
}

async function publishToBroker(topic, payload) {
    
    const resTopic = "response/"+topic;

    return new Promise(async(resolve,reject) => {    
        
        await mqttClient.subscribe(resTopic);
        const timeout = setTimeout(() =>{
            const message = `408/3. request timed out for ${topic} `;
            mqttClient.unsubscribe(resTopic);
            
            reject(message)
        },10000)
        
        const onResponse = (receivedTopic,message) => {
            
            if(receivedTopic === resTopic){
                clearTimeout(timeout);
                mqttClient.unsubscribe(resTopic);
                mqttClient.removeListener('message', onResponse);
                //console.log("message in gateway on response: ", message.toString());
                resolve(message.toString());
            }
        };
        
        mqttClient.on('message',onResponse);
        await mqttClient.publish(topic, payload, {qos: 0, retain: false})
    });
   
};

async function dentistPublishToBroker(topic, payload) {
    
    const resTopic = "response/"+topic;
    await mqttClient.publish(topic, payload, {qos: 0, retain: false})

    return new Promise((resolve,reject) => {    
        const timeout = setTimeout(() => {
            const message = `408/request timed out for ${topic} `;

            reject(message)
        }, 3000);
        
        const checkResponse = () => {
            
            const response = responseArr.find(response => response.topic === resTopic);
            if(response){
                clearTimeout(timeout);
                responseArr = responseArr.filter(response => response.topic !== resTopic);                  
                resolve(response.payload);
            }else {
                setTimeout(checkResponse, 100);
            }
        };
        checkResponse();
    })
   
};

async function subscribeToBroker(topic) {
    mqttClient.subscribe(topic, {qos: 0})
    //console.log("subscribed to topic: ",topic);
};
async function unsubscribe(topic){
    mqttClient.unsubscribe(topic).then((successful) => {
        //console.log("You've successfully unsubscribed from topic: ",topic);
    })
    .catch((e) => {
        console.log("Unsubscribing failed");
    }) 
};

connectToBroker();
subscribeToBroker('active');




module.exports = {publishToBroker,unsubscribe,subscribeToBroker,dentistPublishToBroker};
