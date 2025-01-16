const mqtt = require('async-mqtt');
const oldMqtt = require('mqtt');
const monitor = require('./monitor.js');


const os = require('os');
const specialNumber = os.hostname();
const service = process.env.SERVICE;
const thisService = service +'-'+specialNumber;

console.log("monitor service name:",thisService);

var mqttClient;
const host = "mosquitto-broker";
const protocol = "mqtt";
const port = "1884";

var activeSubscriptions = [];

function connectToBroker() {
    const clientId = "client" + Math.random() + Date.now();
    const hostURL = `${protocol}://${host}:${port}`;
    const options = {
        keepalive: 5,
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
        subscribeToBroker(`active`);
    });

    mqttClient.on("disconnect", async () => {
        console.log(clientId,'disconnected.');
        for (const topic of activeSubscriptions){
            await unsubscribe(topic);
        };
        activeSubscriptions = [];
    });

    mqttClient.on("message",async (topic, payload, packet) => {
        var payloadReceived = payload.toString()
        // console.log("Message received: ",payloadReceived);
        // console.log("On topic: " + topic); 
        // console.log(packet);
        var publishTopic = "response/" + topic;
        // console.log("publishTopic =",publishTopic);

        if(topic === 'active'){
            const messageReceived = JSON.parse(payload);
            console.log("MESSAGE RECEIVED :",messageReceived);
            const isActive = messageReceived.isActive;
            const serviceTopic = messageReceived.serviceTopic;
            if(!serviceTopic){
                console.log("Message is undefined");
                return
            }
            console.log("SERVICETOPIC:",serviceTopic);
            const messageArr = serviceTopic.split('-');
            await monitor.updateIsActive(messageArr[0],serviceTopic,isActive);

        }
    });
}
const messageReceived = JSON.parse(payload);
            

function printPayload(payload) {
    console.log("our payload is: " + payload);
}

async function publishToBroker(topic, payload) {
    mqttClient.publish(topic, payload, {qos: 0, retain: false})
};

async function subscribeToBroker(topic) {
    try{
        if(activeSubscriptions.includes(topic)){
            console.log('Already subscribed to',topic);
            return;
        }else{
            mqttClient.subscribe(topic, {qos: 0});
            activeSubscriptions.push(topic);
            //console.log("subscribed to topic: ",topic);
        };
    }catch(error){
        console.log('could not subscribe to',topic);
    }
};

async function unsubscribe(topic){
    try{
        if(!activeSubscriptions.includes(topic)){
            console.log('Not subscribed to',topic);
            return;
        }else{
            await mqttClient.unsubscribe(topic)
            // console.log("You've successfully unsubscribed from topic: ",topic);
            const tempActiveSubscriptions = activeSubscriptions.filter((activeTopic) => activeTopic !== topic);
            activeSubscriptions = tempActiveSubscriptions;
        };
    }catch(error){
        console.log("Unsubscribing failed");
    }
};


connectToBroker();

