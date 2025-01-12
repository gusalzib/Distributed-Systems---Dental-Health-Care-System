const mqtt = require('async-mqtt');
const oldMqtt = require('mqtt');
const subscriptionCtrl = require("./src/subscription_controller/subscription_controller")

const os = require('os');
const specialNumber = os.hostname();
const service = process.env.SERVICE;
const thisService = service +'-'+specialNumber;

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
        subscribeToBroker(`subscriptions/new-appointment-available/`);
    });

    mqttClient.on("disconnect", async () => {
        console.log(clientId,'disconnected.');
        for (const topic of activeSubscriptions){
            await unsubscribe(topic);
        };
        activeSubscriptions = [];
    });

    mqttClient.on("message", async (topic, payload, packet) => {
        var payloadReceived = payload.toString()
        console.log("Message received: " + payloadReceived);
        console.log("On topic: " + topic);
        console.log(packet);
        var publishTopic = "response/" + topic;
        var subscribers_to_notify = "notifications/subscribers-to-notify/"
        console.log("publishTopic =", publishTopic);

        if (topic.startsWith(`${thisService}/topics`)) {
            await subscribeToBroker(payloadReceived);
            var newPayload = '200/subscribed to topic/' + payloadReceived;
            await publishToBroker(publishTopic,newPayload);

        } else if (topic.startsWith(`${thisService}/create/`)) {
            console.log("create a subscription");
            await subscriptionCtrl.createSubscription(payload).then(response => {
                publishToBroker(publishTopic, response);
            });
            await unsubscribe(topic);

        } else if (topic === `${thisService}/new-appointment-available/`){
            console.log("A new appointment is created!!!!!!!!!!!!!!!!!!!!!!! WE ARE IN SUBSCRIPTION" +
                "and this is the payload" + payloadReceived);
            // await subscriptionCtrl.createSubscription(payload).then(response => {
            //     publishToBroker(publishTopic, response);
            // });
            console.log("create a subscription");
            await subscriptionCtrl.findRelevantSubscriptions(payload).then(response => {
                publishToBroker(subscribers_to_notify, response);
            });
            await unsubscribe(topic);


        } else if (topic.startsWith(`${thisService}/get/specific/`)) {
            await subscriptionCtrl.getSpecificSubscription(topic).then(response => {
                publishToBroker(publishTopic, response);
            });
            await unsubscribe(topic);

        } else if (topic.startsWith(`${thisService}/update/`)) {
            await subscriptionCtrl.updateSpecificSubscription(topic, payload).then(response => {
                publishToBroker(publishTopic, response);
            });
            await unsubscribe(topic);

        } else if (topic.startsWith(`${thisService}/delete/`)) {
            await subscriptionCtrl.deleteSpecificSubscription(topic).then(response => {
                publishToBroker(publishTopic, response);
            });
            await unsubscribe(topic);

        } else if (topic.startsWith(`${thisService}/get/`)) {
            await subscriptionCtrl.getAllSubscriptions(payload).then(response => {
                publishToBroker(publishTopic, response);
            });
            await unsubscribe(topic);
        }
    });
}

async function publishToBroker(topic, payload) {
    mqttClient.publish(topic, payload, {qos: 0, retain: false})
};

async function subscribeToBroker(topic) {
    try {
        if(activeSubscriptions.includes(topic)) {
            console.log('Already subscribed to', topic);
            return;
        } else {
            mqttClient.subscribe(topic, {qos: 0});
            activeSubscriptions.push(topic);
        };
    } catch(error) {
        console.log('could not subscribe to', topic);
    }
};

async function unsubscribe(topic){
    try {
        if (!activeSubscriptions.includes(topic)) {
            console.log('Not subscribed to',topic);
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