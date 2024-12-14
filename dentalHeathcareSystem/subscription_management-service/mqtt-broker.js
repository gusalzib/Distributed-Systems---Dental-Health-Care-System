const mqtt = require('mqtt');
const subscriptionCtrl = require("./src/subscription_controller/subscription_controller")
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
        var publishTopic = "response/" + topic;
        console.log("publishTopic =",publishTopic);

        if (topic.startsWith('subscriptions/create/')) {
            console.log("create a subscription");
            subscriptionCtrl.createSubscription(payload).then(response => {
                publishToBroker(publishTopic, response);
            })
        }
    });
}

function publishToBroker(topic, payload) {
    mqttClient.publish(topic, payload, {qos: 0, retain: false})
};

function subscribeToBroker(topic) {
    mqttClient.subscribe(topic, {qos: 0})
    console.log("subscribed to topic: ",topic);
    
};

connectToBroker();

subscribeToBroker('subscriptions/create/+');
