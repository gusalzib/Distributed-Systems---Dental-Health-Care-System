const Docker = require('dockerode');
const docker = new Docker();
const {spawn} = require('child_process');




var services = [                                      //Service array
    {
      service: "dentalheathcaresystem-appointments-service-1",
      numberOfInstances:1,
      copys: [{nameOfCopy : '', isActive : false}]
    },
    {
      service: "dentalheathcaresystem-patients-service-1",
      numberOfInstances:1,
      copys: [{nameOfCopy : '', isActive : false}]
    },
    {
      service: "dentalheathcaresystem-clinic-service-1",
      numberOfInstances:1,
      copys: [{nameOfCopy : '', isActive : false}]
    },
    {
      service: "dentalheathcaresystem-dentists-service-1",
      numberOfInstances:1,
      copys: [{nameOfCopy : '', isActive : false}]
    },
    {
        service: "dentalheathcaresystem-api-gateway-1",
        numberOfInstances:1,
        copys: [{nameOfCopy : '', isActive : false}]
      }
   ];

   async function getContainerStatistics (containerName) {
    try{
        const containers = await docker.listContainers();
        const containerInfo = containers.find(container => container.Names.includes(`/${containerName}`));

        if(!containerInfo){
            throw new Error(`Container ${containerName} not found`);
            return;
        }

        const container = docker.getContainer(containerInfo.Id);
        
        const statsStream = await container.stats({ stream: false});
        if(!statsStream || !statsStream.cpu_stats || !statsStream.precpu_stats){
            throw new Error(`Invalid stats data for container ${containerName}`);
        }
        //total cpu usage for this service right now - total usage of this service before
        const cpuDelta = statsStream.cpu_stats.cpu_usage.total_usage - statsStream.precpu_stats.cpu_usage.total_usage;
        
        //total cpu usage of the whole system before - total cpu usage of the whole system before
        const systemDelta = statsStream.cpu_stats.system_cpu_usage - statsStream.precpu_stats.system_cpu_usage;
        
        //gives a percentage of the cpu usage this service made since last check
        const cpuUsage = ((cpuDelta / systemDelta ) * 100).toFixed(2)

        const memoryUsage = (statsStream.memory_stats.usage / 1024 / 1024);
        const memoryLimit = (statsStream.memory_stats.limit / 1024 / 1024);
        const memoryUsagePercentage = ((memoryUsage / memoryLimit) * 100).toFixed(2);

        return {
            name: containerName,
            cpu: cpuUsage,
            memory: memoryUsagePercentage
        };
    } catch (err) {
        throw new Error(`Error when fetching stats: ${err.message}`);
    }
}

async function monitor(containerName) {
    setInterval(async () => {
        try{
        const stats = await getContainerStatistics(containerName);

        const nameArr = containerName.split('-');
        const serviceToScale = nameArr[1]+'-'+nameArr[2];

        if(stats.cpu > 0.60 || stats.memory > 70){
            console.log(`Scale up --> ${serviceToScale} : Stats for ${stats.name}: CPU: ${stats.cpu}, Memory: ${stats.memory}`);
            scaleUpServices(serviceToScale,containerName)
        }


        //console.log(`Stats for ${stats.name}: CPU: ${stats.cpu}, Memory: ${stats.memory}`);
 
        } catch (err) {
            console.error(err.message);
        }
    },5000);    
}
async function printStatistics(containerName) {
    setInterval( async () => {
        try{
            const stats = await getContainerStatistics(containerName);
            console.log(`Stats for ${stats.name}: CPU: ${stats.cpu}, Memory: ${stats.memory}`);
     
        } catch (err) {
            console.error(err.message);
        }
    },5000);  
};

monitor('dentalheathcaresystem-appointments-service-1');
monitor('dentalheathcaresystem-clinic-service-1')
monitor('dentalheathcaresystem-patients-service-1');
monitor('dentalheathcaresystem-dentists-service-1');
monitor('dentalheathcaresystem-api-gateway-1');
const gatewayStats = printStatistics('dentalheathcaresystem-api-gateway-1');
const brokerStats = printStatistics('dentalheathcaresystem-mosquitto-broker-1');



function scaleUpServices(serviceName,containerName) {
    
    const service = services.find((service) => service.service === containerName);
    if(!service){
        console.error(`Service not found for container: ${containerName}`)
        return;
    }
    
    const replicas = service.numberOfInstances + 1;
    
    const pathToYmlFile ='/app/docker-compose.yml';
    const projectName = 'dentalheathcaresystem';

    const compose = spawn('docker-compose', [
        '-p',projectName,
        '-f', pathToYmlFile,
        'up','-d',
        '--no-recreate',
        '--no-build',
        '--scale', `${serviceName}=${replicas}`],{
            stdio: 'inherit',
            cwd:'/app'
        });

    service.numberOfInstances = replicas;
    console.log(`Scaling up service: ${service.serviceName}, Current replicas: ${service.numberOfInstances}, Target replicas: ${replicas} `);
    if(compose.stdout){
        compose.stdout.on('data', (data) => {
        console.log(`stdout: ${data}`);
        });
    } else {
        console.error("stdout stream is null.");
    }
    
    if (compose.stderr){
        compose.stderr.on('data', (data) => {
            console.error(`stderr: ${data}`);
        });
    } else{
        console.error("stderr stream is null.")
    }
    

    compose.on('error', (err) => {
        console.error('Failed to execute docker compose:',err);
        if (err.code){
            console.error(`Error code: ${err.code}`);
        }
    });
    
    compose.on('close',  (code) => {
        console.log(`child process exited with code ${code}`);
        if(code === 0) {
            service.numberOfInstances = replicas;
        } else {
            console.error('Failed to update service instance count.')
        }
    });
}

exports.updateIsActive = async (serviceName, topicName, activity) => {
    const specificService = services.find((service) => service.service === serviceName);
    if(!specificService){
        return
    }
    const specificCopy = specificService.copys.find((copy)=> copy.nameOfCopy === topicName);
    if(!specificCopy){
      tempCopy = {nameOfCopy: topicName, isActive: activity};
      specificService.topics.push(tempCopy);
      startTimer(tempCopy);
      
      return
    }
    specificCopy.isActive = activity;
    startTimer(specificCopy);
    
    var topicArr = [];
    services.forEach(service => {
        service.copys.forEach(copy =>{
            if(copy.isActive){
                topicArr.push(topic.topic)
            }
        });
    });
    console.log('Active topics are: ',topicArr);
}
function startTimer (topic){
    if(topic.timeout){
        clearTimeout(topic.timeout);
    }
    topic.timeout = setTimeout(() =>{
        topic.isActive = false;
    },20000)
}




