const mqtt = require('async-mqtt');
var mqttClient;

const host = "127.0.0.1";
const protocol = "mqtt";
const port = "1883";
var responseArr = [];


function connectToBroker() {
    const clientId = "client" + Math.random() + Date.now();
    const hostURL = `${protocol}://${host}:${port}`;
    const options = {
        keepalive: 60,
        retryInterval: 0,
        clientId: clientId,
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

    mqttClient.on("message", (topic, payload, packet) => {
        console.log("Message received: " + payload.toString());
        console.log("On topic: " + topic);
        console.log(packet);
        var stringPayload = payload.toString();
        
        
        if (topic.startsWith("response/")){
            var newResponse = {topic : topic, payload: stringPayload}
            responseArr.push(newResponse);
        }else if(topic.startsWith("/active")){

        }
    });
}

async function publishToBroker(topic, payload) {
    
    const resTopic = "response/"+topic;
    await mqttClient.publish(topic, payload, {qos: 0, retain: false})

    return new Promise((resolve) => {        
        const checkResponse = () => {
            
            const response = responseArr.find(response => response.topic === resTopic);
            if(response){
                responseArr = responseArr.filter(response => response.topic !== resTopic);  
                resolve(response.payload);
            }else {
                setTimeout(checkResponse, 100);
            }
        };
        checkResponse();
    })
};

function subscribeToBroker(topic) {
    mqttClient.subscribe(topic, {qos: 0})
    console.log("subscribed to topic: ",topic);
};
function unsubscribe(topic){
    mqttClient.unsubscribe(topic).then((successful) => {
        console.log("You've successfully unsubscribed");
    })
    .catch((e) => {
        console.log("Unsubscribing failed");
    }) 
};

connectToBroker();
// subscribeToBroker("response/#");
subscribeToBroker("active/#")


module.exports = {publishToBroker,unsubscribe,subscribeToBroker};
