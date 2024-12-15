const mqtt = require('async-mqtt');
const patientCtrl = require("./controller/patientController")
// var mqttClient;

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
        var payloadReceived = payload.toString()
        console.log("Message received: ",payloadReceived);
        console.log("On topic: " + topic); 
        console.log(packet);
        var publishTopic = "response/" + topic;
        console.log("publishTopic =",publishTopic);

        if(topic.startsWith('patients/topics')){
            subscribeToBroker(payloadReceived);
            var newPayload = '200/subscribed to topic/'+topic;
            publishToBroker(publishTopic,newPayload);

        }else if (topic.startsWith('patients/create/')) {
            console.log("create a patient");
            patientCtrl.createPatient(payload).then(response => {
                publishToBroker(publishTopic, response);
            });
            unsubscribe(topic);
        
        }else if (topic.startsWith('patients/get/specific/')) {
            console.log("get specific patient");
            patientCtrl.fetchSpecificPatient(topic).then(response => {
                publishToBroker(publishTopic, response);
            });
            unsubscribe(topic);

        }else if (topic.startsWith('patients/get/')) {
            console.log("get all patients");
            patientCtrl.fetchAllPatients(payload).then(response => {
                publishToBroker(publishTopic, response)
            });
            unsubscribe(topic);

        } else if (topic.startsWith('patients/update/')){
            console.log("update patient");
            patientCtrl.updateSpecificPatient(topic,payload).then(response => {
                publishToBroker(publishTopic, response);
            });
            unsubscribe(topic);

        } else if (topic.startsWith('patients/delete/')) {
            console.log("delete patient");
            patientCtrl.deleteSpecificPatient(topic).then(response => {
                publishToBroker(publishTopic, response)
            });
            unsubscribe(topic);
        }
    });
}
// function heartbeat(){
//     var payload = "patient1"
//     var topic = "active/patient"
    
//     setTimeout(() => {
//         heartbeat()
//         console.log("heartbeat");
//     }, 5000);
//     publishToBroker(topic,payload);
    
// }

function printPayload(payload) {
    console.log("our payload is: " + payload);
}

function publishToBroker(topic, payload) {
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
// heartbeat();
subscribeToBroker('patients/topics');


