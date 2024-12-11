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
        var publishTopic = "response3/" + topic;
        console.log("publishTopic =",publishTopic);

        if (topic.startsWith( 'appointments3/create/')) {
            console.log("create an appointment");
            appointmentCtrl.makeAppointment(payload).then(response => {
                publishToBroker(publishTopic, response);
            })
        
        }else if (topic.startsWith('appointments3/get/patient/appointments/')) {
            console.log("get a patients appointments");
            appointmentCtrl.fetchPatientAppointments(payload).then(response => {
                publishToBroker(publishTopic, response)
            })
        }else if (topic.startsWith('appointments3/get/available/appointments/')) {
            console.log("get available appointments");
            appointmentCtrl.fetchAvailableAppointments(payload).then(response => {
                publishToBroker(publishTopic, response);
            })
        } else if (topic.startsWith('appointments3/get/clinic/appointments/')) {
            console.log("get a clinics appointments");
            appointmentCtrl.fetchAvailableAppointments(payload).then(response => {
                publishToBroker(publishTopic, response);
            })
        }else if (topic.startsWith('appointments3/get/specific/')){
            console.log("get a specific appointment");
            appointmentCtrl.getOneAppointment(topic).then(response => {
                publishToBroker(publishTopic,response)
            })
        }else if (topic.startsWith('appointments3/update/')){
            console.log("update appointment");
            appointmentCtrl.updateOneAppointment(topic,payload).then(response => {
                publishToBroker(publishTopic, response);
            })
        } else if (topic.startsWith('appointments3/delete/')) {
            console.log("delete appointment");
            appointmentCtrl.removeAppointment(topic).then(response => {
                publishToBroker(publishTopic, response)
            })
        }else if (topic.startsWith('appointments3/get/')){
            console.log("get all appointments");
            appointmentCtrl.getAppointments(payload).then(response =>{
                publishToBroker(publishTopic, response);
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
    mqttClient.subscribe(topic, {qos: 0})
    console.log("subscribed to topic: ",topic);
};
connectToBroker();
subscribeToBroker('appointments3/create/+');
subscribeToBroker('appointments3/get/+');
subscribeToBroker('appointments3/get/specific/+');
subscribeToBroker('appointments3/update/+');
subscribeToBroker('appointments3/get/patient/appointments/+');
subscribeToBroker('appointments3/delete/+');
subscribeToBroker('appointments3/get/available/appointments/+');
subscribeToBroker('appointments3/get/clinic/appointments/+')
