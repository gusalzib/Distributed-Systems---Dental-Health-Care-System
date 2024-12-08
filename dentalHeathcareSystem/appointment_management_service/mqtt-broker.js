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
        var publishTopic = "response/" + topic;
        console.log("publishTopic =",publishTopic);

        if (topic.startsWith( 'appointment/create/')) {
            appointmentCtrl.makeAppointment(payload).then(response =>{
                // console.log("message in broker = ",response);
                
                // console.log("status =" )
                // console.log("newTopic = ",newTopic);
                publishToBroker(publishTopic,response);
                
                // resArr = response.split("/");
                // var status = resArr[0];
                // var message = resArr[1];
                // var appointment = resArr[2];

                // console.log("status =", status);
                // console.log("message =", message);
                // console.log("appointment =", appointment);

            });
        }else if (topic.startsWith('appointment/get/all/')){
            console.log("get all appointments");
            appointmentCtrl.getAppointments(payload).then(response =>{
                console.log("all appointments = ",response);
                console.log("publish topic=",publishTopic);
                publishToBroker(publishTopic, response);
            })
        }else if (topic.startsWith('appointment/get/one/')){
            appointmentCtrl.getOneAppointment(payload).then(response => {
                console.log(response);
                publishToBroker(publishTopic,response)
            })
        }else if (topic.startsWith('appointment/update/')){
            var topicArr = topic.split("/");
            var _id = topicArr[2];
            console.log("_id = ",_id);
            appointmentCtrl.updateOneAppointment(_id,payload).then(response => {
                console.log("response =",response);
                publishToBroker(publishTopic, response);
            })
        } else if (topic.startsWith('appointment/get/patient/appointments/')) {
            appointmentCtrl.fetchPatientAppointments(payload).then(response => {
                
                
                console.log("response =", response);
                publishToBroker(publishTopic, response)
                
            })
        } else if (topic.startsWith('appointment/delete/')) {
            appointmentCtrl.removeAppointment(payload).then(response => {
                

                console.log("response =", response);
                publishToBroker(publishTopic, response)
            })
        } else if (topic.startsWith('appointment/get/available/appointments/')) {
            appointmentCtrl.fetchAvailableAppointments(payload).then(response => {

                console.log("response =", response);
                publishToBroker(publishTopic, response);
            })
        } else if (topic.startsWith('appointment/get/clinic/appointment/')) {
            appointmentCtrl.fetchAvailableAppointments(payload).then(response => {
                console.log('publish topid here: ', publishTopic);

                console.log("response =", response);
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
};
connectToBroker();
subscribeToBroker('appointment/create/+');
subscribeToBroker('appointment/get/all/+');
subscribeToBroker('appointment/get/one/+');
subscribeToBroker('appointment/update/+');
subscribeToBroker('appointment/get/patient/appointments/+');
subscribeToBroker('appointment/delete/+');
subscribeToBroker('appointment/get/available/appointments/+');
subscribeToBroker('appointment/get/clinic/appointment/+')
