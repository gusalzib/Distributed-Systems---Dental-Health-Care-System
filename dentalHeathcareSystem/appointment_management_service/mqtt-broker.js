const mqtt = require('mqtt');
const appointmentCtrl = require("./controller/appointmentController")
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

        if (topic === "appointment/create/1234") {
            appointmentCtrl.makeAppointment(payload).then(response =>{
                console.log("message in broker = ",response);
                console.log("status =" );
                var newTopic = topic + "/response";
                console.log("newTopic = ",newTopic);
                publishToBroker(newTopic,response)

                resArr = response.split("/");
                var status = resArr[0];
                var message = resArr[1];
                var appointment = resArr[2];

                console.log("status =", status);
                console.log("message =", message);
                console.log("appointment =", appointment);

            });
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
    mqttClient.subscribe(topic, {qos: 0})
};
connectToBroker();
subscribeToBroker("appointment/create/1234");
