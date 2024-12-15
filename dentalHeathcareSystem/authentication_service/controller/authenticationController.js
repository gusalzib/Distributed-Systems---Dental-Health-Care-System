const mqttClient = require('../mqtt-broker')
exports.loginAuthenticator = (payload, topic) => {
    var topicArr = topic.split("/");
    const userId = topicArr[2];
    var requestPayload = JSON.parse(payload)
    var email = requestPayload.email;
    var password = requestPayload.password;

    try {
        var publishTopic = 'patients/get/specific/' 
        mqttClient.publishToBroker(topic, payload)
    } catch (error) {
        
    }
}