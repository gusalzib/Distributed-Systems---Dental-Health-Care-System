const mqtt = require('async-mqtt');
const oldMqtt = require('mqtt');
const clinicCtrl = require("./Controller/clinicController");

const os = require('os');
const specialNumber = os.hostname();
const service = process.env.SERVICE;
const thisService = service +'-'+specialNumber;

var mqttClient;
const host = "mosquitto-broker";
const protocol = "mqtt";
const port = "1884";

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
        subscribeToBroker(`${thisService}/topics`);
    });

    mqttClient.on("message", async (topic, payload, packet) => {
        var payloadReceived = payload.toString();
        // console.log("Message received: ", payloadReceived);
        // console.log("On topic: " + topic); 
        // console.log(packet);
        var publishTopic = "response/" + topic;

        if(topic.startsWith(`${thisService}/topics`)){
            subscribeToBroker(payloadReceived);
            var newPayload = '200/subscribed to topic/'+payloadReceived;
            await publishToBroker(publishTopic,newPayload);

        }else if (topic.startsWith( `${thisService}/create/`)) {
            console.log("clinic create");
            await clinicCtrl.clinicCreate(payload).then(response =>{ 
                publishToBroker(publishTopic,response);  
            });
            await unsubscribe(topic);

        }else if(topic.startsWith(`${thisService}/delete/`)){
            console.log("delete clinic");
            await clinicCtrl.deleteAClinic(topic, payload).then(response => {
                publishToBroker(publishTopic, response);
            });
            await unsubscribe(topic);

        }else if (topic.startsWith(`${thisService}/get/clinic/from/appointment/`)){
            console.log("clinic array");
            await clinicCtrl.getClinicInformation(payload).then(response => {
                publishToBroker(publishTopic,response);
            });
            await unsubscribe(topic);
        }else if (topic.startsWith(`${thisService}/get/specific/`)){
            console.log("get specific clinic");
            await clinicCtrl.getOneClinic(topic).then(response => {
                publishToBroker(publishTopic, response);
            });
            await unsubscribe(topic);

        }else if(topic.startsWith(`${thisService}/get/dentists/`)){
            console.log("get the clinics dentists");
            await clinicCtrl.getDentistFromClinic(topic).then(response => {
                publishToBroker(publishTopic, response);
            });
            await unsubscribe(topic);

        }else if (topic.startsWith(`${thisService}/get/`)){
            console.log("get all clinics");
            await clinicCtrl.getClinics().then( response => {
                publishToBroker(publishTopic, response);
            });
            await unsubscribe(topic);

        }else if (topic.startsWith(`${thisService}/update/`)){
            console.log("update clinics");
            await clinicCtrl.updateAClinic(topic,payload).then(response => {
                publishToBroker(publishTopic,response);
            });
            await unsubscribe(topic);
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


