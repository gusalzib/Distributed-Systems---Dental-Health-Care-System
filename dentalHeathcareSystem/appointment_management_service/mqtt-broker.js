const mqtt = require('async-mqtt');
const oldMqtt = require('mqtt');
const appointmentCtrl = require("./controller/appointmentController")

const os = require('os');
const specialNumber = os.hostname();
const service = process.env.SERVICE;
const thisService = service +'-'+ specialNumber;

var mqttClient;
const host = "mosquitto-broker";
const protocol = "mqtt";
const port = "1884";

var activeSubscriptions = [];

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
        var notificationTopic = "subscriptions";
        // console.log("publishTopic =",publishTopic);

        if(topic.startsWith(`${thisService}/topics`)) {
            await subscribeToBroker(payloadReceived);
            var newPayload = '200/subscribed to topic/'+payloadReceived;
            await publishToBroker(publishTopic,newPayload);

        } else if (topic.startsWith( `${thisService}/create/`)) {
            console.log("create an appointment");
            console.log("this is the topic we are subscribed to before CREATE APPOINTMENT", topic);
            await appointmentCtrl.makeAppointment(payload).then(response => {
                publishToBroker(publishTopic, response);
                publishToBroker(notificationTopic, response);
                console.log(publishTopic + "this is PUBLISH CREATE methid in appointments")
                console.log(notificationTopic + "this is SUBS PUBS topic in the CREATE methid in appointments")
            });
            await unsubscribe(topic);
        
        } else if (topic.startsWith( `${thisService}/book/`)) {
            console.log("book an appointment");
            await appointmentCtrl.bookAppointment(topic, payload).then(response => {
                publishToBroker(publishTopic, response);
            });
            await unsubscribe(topic);
        
        } else if (topic.startsWith( `${thisService}/filter/`)) {
            console.log("filter appointments");
            await appointmentCtrl.filterAppointments(topic, payload).then(response => {
                publishToBroker(publishTopic, response);
            });
            await unsubscribe(topic);
        
        } else if (topic.startsWith(`${thisService}/get/clinics/available/appointments/`)) {
            console.log("get clinics available appointments");
            await appointmentCtrl.fetchClinicsAvailableAppointments(topic, payload).then(response => {
                publishToBroker(publishTopic, response);
            });
            await unsubscribe(topic);

        } else if (topic.startsWith(`${thisService}/get/patient/appointments/`)) {
            console.log("get a patients appointments");
            await appointmentCtrl.fetchPatientAppointments(topic, payload).then(response => {
                publishToBroker(publishTopic, response)
            });
            await unsubscribe(topic);

        }else if (topic.startsWith(`${thisService}/get/available/appointments/`)) {
            console.log("get available appointments");
            await appointmentCtrl.fetchAvailableAppointments(payload).then(response => {
                publishToBroker(publishTopic, response);
            });
            await unsubscribe(topic);

        } else if (topic.startsWith(`${thisService}/get/clinic/appointments/`)) {
            console.log("get a clinics appointments");
            await appointmentCtrl.fetchClinicAppointments(topic).then(response => {
                publishToBroker(publishTopic, response);
            });
            await unsubscribe(topic);

        }else if (topic.startsWith(`${thisService}/get/specific/`)){
            console.log("get a specific appointment");
            await appointmentCtrl.getOneAppointment(topic).then(response => {
                publishToBroker(publishTopic,response)
            });
            await unsubscribe(topic);

        }else if (topic.startsWith(`${thisService}/update/`)){
            console.log("update appointment");
            await appointmentCtrl.updateOneAppointment(topic,payload).then(response => {
                publishToBroker(publishTopic, response);
            });
            await unsubscribe(topic);

        } else if (topic.startsWith(`${thisService}/delete/`)) {
            console.log("delete appointment");
            await appointmentCtrl.removeAppointment(topic, payload).then(response => {
                publishToBroker(publishTopic, response)
            });
            await unsubscribe(topic);

        }else if (topic.startsWith(`${thisService}/get/`)){
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
    try {
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
        if (!activeSubscriptions.includes(topic)){
            console.log('Not subscribed to', topic);
            return;
        } else {
            await mqttClient.unsubscribe(topic)
            // console.log("You've successfully unsubscribed from topic: ",topic);
            const tempActiveSubscriptions = activeSubscriptions.filter((activeTopic) => activeTopic !== topic);
            activeSubscriptions = tempActiveSubscriptions;
        };
    } catch(error) {
        console.log("Unsubscribing failed");
    }
};


connectToBroker();

