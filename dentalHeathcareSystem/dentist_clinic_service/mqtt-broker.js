const mqtt = require('async-mqtt');
const oldMqtt = require('mqtt');
const clinicCtrl = require("./Controller/clinicController");
var mqttClient;

const host = "127.0.0.1";
const protocol = "mqtt";
const port = "1884";

function connectToBroker() {
    const clientId = "client" + Math.random() + Date.now();
    const hostURL = `${protocol}://${host}:${port}`;
    const options = {
        keepalive: 5,
        retryInterval: 0,
        clientId: 'clinics-1',
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
        var payloadReceived = payload.toString();
        console.log("Message received: ", payloadReceived);
        console.log("On topic: " + topic); 
        console.log(packet);
        var publishTopic = "response/" + topic;

        if(topic.startsWith('clinics-1/topics')){
            subscribeToBroker(payloadReceived);
            var newPayload = '200/subscribed to topic/'+topic;
            publishToBroker(publishTopic,newPayload);

        }else if (topic.startsWith( 'clinics-1/create/')) {
            console.log("clinic create");
            clinicCtrl.clinicCreate(payload).then(response =>{ 
                publishToBroker(publishTopic,response);  
            });
            unsubscribe(topic);

        }else if(topic.startsWith('clinics-1/delete/')){
            console.log("delete clinic");
            clinicCtrl.deleteAClinic(topic).then(response => {
                publishToBroker(publishTopic, response);
            });
            unsubscribe(topic);

        }else if (topic.startsWith('clinics-1/get/clinic/from/appointment/')){
            console.log("clinic array");
            clinicCtrl.getClinicInformation(payload).then(response => {
                publishToBroker(publishTopic,response);
            });
            unsubscribe(topic);
        }else if (topic.startsWith('clinics-1/get/specific/')){
            console.log("get specific clinic");
            clinicCtrl.getOneClinic(topic).then(response => {
                publishToBroker(publishTopic, response);
            });
            unsubscribe(topic);

        }else if(topic.startsWith('clinics-1/get/dentists/')){
            console.log("get the clinics dentists");
            clinicCtrl.getDentistFromClinic(topic).then(response => {
                publishToBroker(publishTopic, response);
            });
            unsubscribe(topic);

        }else if (topic.startsWith('clinics-1/get/')){
            console.log("get all clinics");
            clinicCtrl.getClinics().then( response => {
                publishToBroker(publishTopic, response);
            });
            unsubscribe(topic);

        }else if (topic.startsWith('clinics-1/update/')){
            console.log("update clinics");
            clinicCtrl.updateAClinic(topic,payload).then(response => {
                publishToBroker(publishTopic,response);
            });
            unsubscribe(topic);
        }
        

    });
}

function printPayload(payload) {
    console.log("our payload is: " + payload);
}

async function publishToBroker(topic, payload) {
    mqttClient.publish(topic, payload, {qos: 0, retain: false})
};

async function subscribeToBroker(topic) {
    mqttClient.subscribe(topic, {qos: 0, retain: false})
    console.log("subscribed to topic: ",topic);
};
async function unsubscribe(topic){
    mqttClient.unsubscribe(topic).then((successful) => {
        console.log("You've successfully unsubscribed from topic: ",topic);
    })
    .catch((e) => {
        console.log("Unsubscribing failed");
    }) 
};

connectToBroker();
subscribeToBroker('clinics-1/topics')

