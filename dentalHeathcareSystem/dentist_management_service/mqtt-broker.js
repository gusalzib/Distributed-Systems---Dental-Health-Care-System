const mqtt = require('mqtt');
const dentistCtrl = require('./src/dentist_controller/dentist-controller');
let mqttClient;

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
        let publishTopic = "response/" + topic;
        console.log("publishTopic =", publishTopic);

        if (topic.startsWith('dentists/create/')) {
            dentistCtrl.createDentist(payload).then(response => {
                publishToBroker(publishTopic, response);
            });

        } else if (topic === 'dentists/get') {
            console.log("get all dentists");
            dentistCtrl.getAllDentists(payload).then(response => {
                console.log("all dentists = ", response);
                console.log("publish topic=", publishTopic);
                publishToBroker(publishTopic, response);
            });

        } else if (topic.startsWith('dentists/get/specific/')) {
            console.log("get a specific dentist ongoing");
            dentistCtrl.getSpecificDentist(topic).then(response => {
                console.log("specific dentist = " + response);
                console.log("publish topic = " + publishTopic);
                publishToBroker(publishTopic, response);
            });

        } else if (topic.startsWith('dentists/update/')) {
            console.log("updating dentist...");
            dentistCtrl.updateSpecificDentist(topic, payload).then(response => {
                console.log("specific dentist to update = " + response);
                console.log("publish topic = " + publishTopic);
                publishToBroker(publishTopic, response);
            });
        }
    });
}

function publishToBroker(topic, payload) {
    mqttClient.publish(topic, payload, {qos: 0, retain: false})
};

function subscribeToBroker(topic) {
    mqttClient.subscribe(topic, {qos: 0})
}

connectToBroker();
subscribeToBroker('dentists/create/+');
subscribeToBroker('dentists/get');
subscribeToBroker('dentists/get/specific/+');
subscribeToBroker('dentists/update/+');
