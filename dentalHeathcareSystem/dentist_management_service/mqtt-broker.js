const mqtt = require('async-mqtt');
const dentistCtrl = require('./src/dentist_controller/dentist-controller');
let mqttClient;

const host = "127.0.0.1";
const protocol = "mqtt";
const port = "1884";

function connectToBroker() {
    const clientId = "client" + Math.random() + Date.now();
    const hostURL = `${protocol}://${host}:${port}`;
    const options = {
        keepalive: 5,
        retryInterval: 0,
        clientId: 'dentists-1',
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
        let publishTopic = "response/" + topic;

        if(topic.startsWith('dentists/topics')){
            subscribeToBroker(payloadReceived);
            var newPayload = '200/subscribed to topic/'+topic;
            publishToBroker(publishTopic,newPayload);

        }else if (topic.startsWith('dentists/create/')) {
            dentistCtrl.createDentist(payload).then(response => {
                publishToBroker(publishTopic, response);
            });
            unsubscribe(topic);

        }else if(topic.startsWith('dentists/get/clinics/dentists/')){
            dentistCtrl.fetchClinicsDentists(topic).then(response => {
                publishToBroker(publishTopic,response);
            });
            unsubscribe(topic);

        }else if (topic.startsWith('dentists/get/specific/')) {
            dentistCtrl.getSpecificDentist(topic).then(response => {
                publishToBroker(publishTopic, response);
            });
            unsubscribe(topic);

        } else if (topic.startsWith('dentists/update/')) {
            dentistCtrl.updateSpecificDentist(topic, payload).then(response => {
                publishToBroker(publishTopic, response);
            });
            unsubscribe(topic);

        } else if (topic.startsWith('dentists/delete/')) {
            dentistCtrl.deleteSpecificDentist(topic).then(response => {
                publishToBroker(publishTopic, response);
            });
            unsubscribe(topic);

        } else if (topic.startsWith('dentists/get/')) {
            dentistCtrl.getAllDentists(payload).then(response => {
                publishToBroker(publishTopic, response);
            });
            unsubscribe(topic);
        }
    });
}

function publishToBroker(topic, payload) {
    mqttClient.publish(topic, payload, {qos: 0, retain: false})
};

function subscribeToBroker(topic) {
    mqttClient.subscribe(topic, {qos: 0});
    console.log("subscribed to topic: ",topic);
}
async function unsubscribe(topic){
    mqttClient.unsubscribe(topic).then((successful) => {
        console.log("You've successfully unsubscribed from topic: ",topic);
    })
    .catch((e) => {
        console.log("Unsubscribing failed");
    }) 
};

connectToBroker();
subscribeToBroker('dentists/topics');

