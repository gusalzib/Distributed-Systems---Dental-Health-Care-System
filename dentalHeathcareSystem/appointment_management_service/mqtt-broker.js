const mqtt = require('async-mqtt');
const oldMqtt = require('mqtt');
const appointmentCtrl = require("./controller/appointmentController")
var mqttClient;

const host = "127.0.0.1";
const protocol = "mqtt";
const port = "1884";

var activeSubscriptions = [];

function connectToBroker() {
    const clientId = "client" + Math.random() + Date.now();
    const hostURL = `${protocol}://${host}:${port}`;
    const options = {
        keepalive: 5,
        retryInterval: 0,
        clientId: 'appointments-1',
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
        subscribeToBroker('appointments-1/topics');
    });

    mqttClient.on("disconnect", async () => {
        console.log(clientId,'disconnected.');
        for (const topic of activeSubscriptions){
            await unsubscribe(topic);
        };
        activeSubscriptions = [];
    });

    mqttClient.on("message",async (topic, payload, packet) => {
        var payloadReceived = payload.toString()
        // console.log("Message received: ",payloadReceived);
        // console.log("On topic: " + topic); 
        // console.log(packet);
        var publishTopic = "response/" + topic;
        // console.log("publishTopic =",publishTopic);

        if(topic.startsWith('appointments-1/topics')){
            await subscribeToBroker(payloadReceived);
            var newPayload = '200/subscribed to topic/'+payloadReceived;
            await publishToBroker(publishTopic,newPayload);

        }else if (topic.startsWith( 'appointments-1/create/')) {
            console.log("create an appointment");
            await appointmentCtrl.makeAppointment(payload).then(response => {
                publishToBroker(publishTopic, response);
            });
            await unsubscribe(topic);
        
        }else if (topic.startsWith( 'appointments-1/book/')) {
            console.log("book an appointment");
            await appointmentCtrl.bookAppointment(topic, payload).then(response => {
                publishToBroker(publishTopic, response);
            });
            await unsubscribe(topic);
        
        }else if (topic.startsWith('appointments-1/get/clinics/available/appointments/')) {
            console.log("get clinics available appointments");
            await appointmentCtrl.fetchClinicsAvailableAppointments(topic).then(response => {
                publishToBroker(publishTopic, response);
            });
            await unsubscribe(topic);

        }else if (topic.startsWith('appointments-1/get/patient/appointments/')) {
            console.log("get a patients appointments");
            await appointmentCtrl.fetchPatientAppointments(topic, payload).then(response => {
                publishToBroker(publishTopic, response)
            });
            await unsubscribe(topic);

        }else if (topic.startsWith('appointments-1/get/available/appointments/')) {
            console.log("get available appointments");
            await appointmentCtrl.fetchAvailableAppointments(payload).then(response => {
                publishToBroker(publishTopic, response);
            });
            await unsubscribe(topic);

        } else if (topic.startsWith('appointments-1/get/clinic/appointments/')) {
            console.log("get a clinics appointments");
            await appointmentCtrl.fetchClinicAppointments(topic).then(response => {
                publishToBroker(publishTopic, response);
            });
            await unsubscribe(topic);

        }else if (topic.startsWith('appointments-1/get/specific/')){
            console.log("get a specific appointment");
            await appointmentCtrl.getOneAppointment(topic).then(response => {
                publishToBroker(publishTopic,response)
            });
            await unsubscribe(topic);

        }else if (topic.startsWith('appointments-1/update/')){
            console.log("update appointment");
            await appointmentCtrl.updateOneAppointment(topic,payload).then(response => {
                publishToBroker(publishTopic, response);
            });
            await unsubscribe(topic);

        } else if (topic.startsWith('appointments-1/delete/')) {
            console.log("delete appointment");
            await appointmentCtrl.removeAppointment(topic, payload).then(response => {
                publishToBroker(publishTopic, response)
            });
            await unsubscribe(topic);

        }else if (topic.startsWith('appointments-1/get/')){
            console.log("get all appointments");
            await appointmentCtrl.getAppointments(payload).then(response =>{
                publishToBroker(publishTopic, response);
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
    try{
        if(activeSubscriptions.includes(topic)){
            console.log('Already subscribed to',topic);
            return;
        }else{
            mqttClient.subscribe(topic, {qos: 0});
            activeSubscriptions.push(topic);
            //console.log("subscribed to topic: ",topic);
        };
    }catch(error){
        console.log('could not subscribe to',topic);
    }
};

async function unsubscribe(topic){
    try{
        if(!activeSubscriptions.includes(topic)){
            console.log('Not subscribed to',topic);
            return;
        }else{
            await mqttClient.unsubscribe(topic)
            // console.log("You've successfully unsubscribed from topic: ",topic);
            const tempActiveSubscriptions = activeSubscriptions.filter((activeTopic) => activeTopic !== topic);
            activeSubscriptions = tempActiveSubscriptions;
        };
    }catch(error){
        console.log("Unsubscribing failed");
    }
};


connectToBroker();

