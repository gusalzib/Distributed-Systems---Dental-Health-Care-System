const mqtt = require('mqtt');
const clinicCtrl = require("./Controller/clinicController");
var mqttClient;

const host = "127.0.0.1";
const protocol = "mqtt";
const port = "1883";

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
        var publishTopic = "response/" + topic;
        console.log("publishTopic =",publishTopic);

        if (topic.startsWith( 'clinic/create/')) {
            clinicCtrl.clinicCreate(payload).then(response =>{
                console.log("message in broker = ",response);
                
                publishToBroker(publishTopic,response);  

            });
        }else if (topic.startsWith('clinic/get/all/')){
            clinicCtrl.getClinics(payload).then( response => {
                console.log("Resepnse =",response);
                publishToBroker(publishTopic, response);
            })
        }
        

    });
}

function printPayload(payload) {
    console.log("our payload is: " + payload);
}

function publishToBroker(topic, payload) {
    mqttClient.publish(topic, payload, {qos: 0, retain: false})
};

function subscribeToBroker(topic) {
    mqttClient.subscribe(topic, {qos: 0, retain: false})
};
connectToBroker();
subscribeToBroker("clinic/create/+");
subscribeToBroker("clinic/get/all/+");
