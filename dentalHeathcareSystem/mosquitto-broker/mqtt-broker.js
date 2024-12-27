const mqtt = require('async-mqtt');
const {spawn} = require('child_process');
const { log } = require('console');
const path = require('path');



function startMosquittoBroker(){
    
    const confPath = './mosquitto-broker.conf';
    const mosquittoProcess = spawn('mosquitto',['-c',confPath]);
    
    mosquittoProcess.stdout.on('data',(data) => {
        const message = data.toString();
        console.log('[Message] -> ', message);

        if(message.includes('PINGREQ')){
            
            console.log('[PING] -> ',message);
            const messageArr = message.split(' ');
            const activeService = messageArr[4];
            console.log('[Active Service] -> ', activeService);
        }
    });
    mosquittoProcess.stderr.on('data', (data) =>{
        const message = data.toString();
        if(message.toLowerCase().includes('error')){
            console.log('[error] -> ', message);
        }else{
            console.log('[Message] -> ', message);
            
        }
    });
    mosquittoProcess.on('close', (code) =>{
        console.log(`[Mosquitto] Process exited with code ${code}`);
    });

    return mosquittoProcess;
}

const mosquittoProcess = startMosquittoBroker();


