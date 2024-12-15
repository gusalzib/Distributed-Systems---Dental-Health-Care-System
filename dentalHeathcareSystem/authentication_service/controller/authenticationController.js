// const mqttBroker = require('../mqtt-broker')
exports.loginAuthenticator = async (incomingPayload, topic, mqttBroker) => {
    // var topicArr = topic.split("/");
    // const userId = topicArr[2];
    var requestPayload = JSON.parse(incomingPayload)
    console.log(requestPayload);
    
    var email = requestPayload.email;
    var password = requestPayload.password;

    var status = 0;
    var message = '';
    var authenticationResult = ''
    try {
        var publishTopic = 'patients/find/patient/' 
        var responseTopic = 'response/patients/find/patient/'
        var resultTopic = 'response/authenticate/login/' // topic to which the final result of the login authentication is sent
        mqttBroker.publishToBroker(publishTopic, incomingPayload)

        mqttBroker.subscribeToBroker(responseTopic)

        var patientCredentials = ''
        const patient = await new Promise((resolve) => {
            mqttBroker.mqttClient.on("message", (topic, payload, packet) => {
                try {
                    patientCredentials = JSON.parse(payload.toString())
                    resolve(patientCredentials)
                } catch (error) {
                    status = 400;
                    message = 'Patient credentials missing!'
                    return status + "/" + message;
                }
            });

        });

        console.log('credentials ', patientCredentials);
        
        if ((patientCredentials.password === password) && (patientCredentials.email === email)) {
 
            authenticationResult = {
                status: 200,
                message: 'Login successful',
                session: {
                    isAdmin: false,
                    isPatient: true,
                    loggedIn: true,
                    userID: patientCredentials.id,
                }
            }
        } else {

            authenticationResult = {
                status: 401,
                message: 'Login failed',
                session: {
                    isAdmin: false,
                    isPatient: false,
                    loggedIn: false,
                    userID: '',
                }
            }
        }
        console.log('authentication result: ', authenticationResult);
        
        mqttBroker.publishToBroker(resultTopic, JSON.stringify(authenticationResult))

        // status = 200
        // message = "Login Successful"

        // return status + "/" + message;
    } catch (error) {
        console.log(error.message);
        
    }
}