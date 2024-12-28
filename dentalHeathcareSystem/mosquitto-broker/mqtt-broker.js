const mqtt = require('async-mqtt');
const {spawn} = require('child_process');
const { log } = require('console');
const path = require('path');



function startMosquittoBroker(){
    
    const confPath = './mosquitto-broker.conf';
    const mosquittoProcess = spawn('mosquitto',['-c',confPath]);
    
    mosquittoProcess.stdout.on('data',(data) => {
        const message = data.toString();
        // console.log('[Message] -> ', message);
       
        if(message.includes('PINGREQ')){
            
            // console.log('[PING] -> ',message);
            const payloadArr = message.split('\n');
            const messageArr = payloadArr[0].split(' ')
            const activeService = messageArr[4];
            console.log('[Active Service] ->',activeService);
            
            publishToBroker('active',activeService);
        }
    });
    mosquittoProcess.stderr.on('data', (data) =>{
        const message = data.toString();
        if(message.toLowerCase().includes('error')){
            console.log('[error] -> ', message);
        }else{
            // console.log('[Message] -> ', message);
            
        }
    });
    mosquittoProcess.on('close', (code) =>{
        console.log(`[Mosquitto] Process exited with code ${code}`);
    });

    return mosquittoProcess;
}

var mqttClient;
const host = "127.0.0.1";
const protocol = "mqtt";
const port = "1884";

function connectToBroker() {
    mqttClient = mqtt.connect(protocol+'://'+host+':'+port);
        mqttClient.on("error", (error) => {
            console.log(error);
            mqttClient.end();
        });


    mqttClient.on("connect", () => {
        console.log("broker connected");
    });
}
function publishToBroker(topic, payload) {
    mqttClient.publish(topic, payload, {qos: 0, retain: false})
};


const mosquittoProcess = startMosquittoBroker();
connectToBroker();


