const mqtt = require('mqtt');
var mqttClient;

const host = "127.0.0.1";
const protocol = "mqtt";
const port = "1883";

function connectToBroker() {
    const clientId = "client" + Math.random() + Date.now();
    const hostURL = `${protocol}://${host}:${port}`;
    const options = {
        keepalive: 60,
        clientId: clientId,
        protocolId: "MQTT",
        protocolVersion: 4,
        clean: true,
        reconnectPeriod: 1000,
        connectTimeout: 30 * 1000,
        anonymous: false,
        username: 'ourUser-name',
        password: 'proper0-0-smiley-0071'
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
    });
}

function publishToBroker(topic, payload) {
    mqttClient.publish(topic, payload, {qos: 0, retain: false})
};

connectToBroker();
publishToBroker("topic-01010", "Hey, we're connected");
// subscribeToBroker("topicX100");
function subscribeToBroker(topic) {
    mqttClient.subscribe(topic, {qos: 0})
};
