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
       

        if (topic.startsWith( 'clinics/create/')) {
            console.log("clinic create");
            clinicCtrl.clinicCreate(payload).then(response =>{ 
                publishToBroker(publishTopic,response);  

            });
        }else if('clinics/delete/'){
            console.log("clinic delete");
            clinicCtrl.deleteAClinic(payload).then(response => {
                publishToBroker(publishTopic, response);
            })
        }else if (topic.startsWith('clinics/get/specific/')){
            console.log("get specific clinic");
            clinicCtrl.getOneClinic(payload).then(response => {
                publishToBroker(publishTopic, response);
            })
        }else if(topic.startsWith('clinics/get/dentists/')){
            console.log("get the clinics dentists");
            clinicCtrl.getDentistFromClinic(payload).then(response => {
                publishToBroker(publishTopic, response);
            })
        }else if (topic.startsWith('clinics/get/')){
            console.log("get all clinics");
            clinicCtrl.getClinics(payload).then( response => {
                publishToBroker(publishTopic, response);
            })
        }else if (topic.startsWith('clinics/update/')){
            console.log("update clinics");
            var topicArr = topic.split("/");
            var id = topicArr[2];
            
            clinicCtrl.updateAClinic(id,payload).then(response => {
                publishToBroker(publishTopic,response);
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
    console.log("subscribed to topic: ",topic);
};
connectToBroker();
subscribeToBroker("clinics/create/+");
subscribeToBroker("clinics/get/+");
subscribeToBroker("clinics/get/specific/+");
subscribeToBroker("clinics/update/+");
subscribeToBroker("clinics/get/dentists/+")
subscribeToBroker("clinics/delete/+")
