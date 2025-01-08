const mqtt = require('async-mqtt');
const patientCtrl = require("./controller/patientController");
const authenticator = require('./controller/authenticator')

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
        var payloadReceived = payload.toString()
        console.log("Message received: ",payloadReceived);
        console.log("On topic: " + topic); 
        console.log(packet);
        var publishTopic = "response/" + topic;
        // console.log("publishTopic =",publishTopic);

        if(topic === `${thisService}/topics`){
            subscribeToBroker(payloadReceived);
            var newPayload = '200/subscribed to topic/'+payloadReceived;
            await publishToBroker(publishTopic,newPayload);

        } else if (topic.startsWith(`${thisService}/signup/`)) {
            console.log("create a patient");
            await patientCtrl.createPatient(payload).then(response => {
                publishToBroker(publishTopic, response);
            });
            await unsubscribe(topic);
        
        }else if (topic.startsWith(`${thisService}/login/`)) {
            console.log("login patient");
            await authenticator.authenticatePatient(topic ,payload).then(response => {
                publishToBroker(publishTopic, response)
            });
            await unsubscribe(topic);

        }else if (topic.startsWith(`${thisService}/get/specific/`)) {
            console.log("get specific patient");
            await patientCtrl.fetchSpecificPatient(topic, payload).then(response => {
                publishToBroker(publishTopic, response);
            });
            await unsubscribe(topic);

        }else if (topic.startsWith(`${thisService}/get/`)) {
            console.log("get all patients");
            await patientCtrl.fetchAllPatients(payload).then(response => {
                publishToBroker(publishTopic, response)
            });
            await unsubscribe(topic);

        } else if (topic.startsWith(`${thisService}/update/`)){
            console.log("update patient");
            await patientCtrl.updateSpecificPatient(topic,payload).then(response => {
                publishToBroker(publishTopic, response);
            });
            await unsubscribe(topic);

        } else if (topic.startsWith(`${thisService}/delete/`)) {
            console.log("delete patient");
            await patientCtrl.deleteSpecificPatient(topic, payload).then(response => {
                publishToBroker(publishTopic, response)
            });
            await unsubscribe(topic);
        }
    });
}


async function publishToBroker(topic, payload) {
    mqttClient.publish(topic, payload, {qos: 0, retain: false})
};

function subscribeToBroker(topic) {
    mqttClient.subscribe(topic, {qos: 0})
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
