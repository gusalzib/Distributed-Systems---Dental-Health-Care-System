const mqtt = require('async-mqtt');
const dentistCtrl = require('./src/dentist_controller/dentist-controller');
const dentistAuthenticator = require('./src/dentist_controller/authenticator');
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

    mqttClient.on("message",async (topic, payload, packet) => {
        var payloadReceived = payload.toString()
        //console.log("Message received: ",payloadReceived);
        //console.log("On topic: " + topic); 
        let publishTopic = "response/" + topic;

        if(topic.startsWith('dentists-1/topics')){
            subscribeToBroker(payloadReceived);
            var newPayload = '200/subscribed to topic/'+topic;
            await publishToBroker(publishTopic,newPayload);

        }else if (topic.startsWith('dentists-1/create/')) {
            await dentistCtrl.createDentist(payload).then(response => {
                publishToBroker(publishTopic, response);
            });
            await unsubscribe(topic);
        }else if (topic.startsWith('dentists/login/')) {
            await dentistAuthenticator.authenticateDentist(topic, payload).then(response => {
                publishToBroker(publishTopic, response);
            });
            await unsubscribe(topic);

        }else if(topic.startsWith('dentists-1/get/clinics/dentists/')){
            await dentistCtrl.fetchClinicsDentists(topic).then(response => {
                publishToBroker(publishTopic,response);
            });
            await unsubscribe(topic);

        }else if (topic.startsWith('dentists/get/specific/')) {
            await dentistCtrl.getSpecificDentist(topic, payload).then(response => {
                publishToBroker(publishTopic, response);
            });
            await unsubscribe(topic);

        } else if (topic.startsWith('dentists-1/update/')) {
            await dentistCtrl.updateSpecificDentist(topic, payload).then(response => {
                publishToBroker(publishTopic, response);
            });
            await unsubscribe(topic);

        } else if (topic.startsWith('dentists/delete/')) {
            await dentistCtrl.deleteSpecificDentist(topic, payload).then(response => {
                publishToBroker(publishTopic, response);
            });
            await unsubscribe(topic);

        } else if (topic.startsWith('dentists-1/get/')) {
            await dentistCtrl.getAllDentists(payload).then(response => {
                publishToBroker(publishTopic, response);
            });
            await unsubscribe(topic);
        }
    });
}

async function publishToBroker(topic, payload) {
    mqttClient.publish(topic, payload, {qos: 0, retain: false})
};

function subscribeToBroker(topic) {
    mqttClient.subscribe(topic, {qos: 0});
    console.log("subscribed to topic: ",topic);
}
async function unsubscribe(topic){
    mqttClient.unsubscribe(topic).then((successful) => {
        //console.log("You've successfully unsubscribed from topic: ",topic);
    })
    .catch((e) => {
        console.log("Unsubscribing failed");
    }) 
};

connectToBroker();
subscribeToBroker('dentists-1/topics');

