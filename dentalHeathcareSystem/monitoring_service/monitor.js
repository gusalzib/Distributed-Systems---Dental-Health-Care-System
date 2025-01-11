const Docker = require('dockerode');
const docker = new Docker();
const {spawn} = require('child_process');




var services = [                                      //Service array
    {
      service: "dentalheathcaresystem-appointments-service-1",
      numberOfInstances:1,
    },
    {
      service: "dentalheathcaresystem-patients-service-1",
      numberOfInstances:1,
    },
    {
      service: "dentalheathcaresystem-clinic-service-1",
      numberOfInstances:1,
    },
    {
      service: "dentalheathcaresystem-dentists-service-1",
      numberOfInstances:1,
    },
    {
        service: "dentalheathcaresystem-api-gateway-1",
        numberOfInstances:1,
      }
   ];

   async function getContainerStatistics (containerName) {
    try{
        const containers = await docker.listContainers();
        const containerInfo = containers.find(container => container.Names.includes(`/${containerName}`));

        if(!containerInfo){
            throw new Error(`Container ${containerName} not found`)
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

        if(stats.cpu > 0.30 || stats.memory > 70){
            console.log("Scale up!" , containerName);
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



function scaleUpServices(serviceName,containerName) {

    const service = services.find((service) => service.service === containerName);
    if(!service){
        console.error(`Service not found for container: ${containerName}`)
        return;
    }
    console.log("service name :", serviceName);
    console.log("container name :", containerName);
    const replicas = service.numberOfInstances + 1;
    
    const pathToYmlFile ='/app/docker-compose.yml';
    const projectName = 'dentalheathcaresystem';
   
    console.log('NUMBER of instances before:',service.numberOfInstances);

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
        console.log('NUMBER of instances after:',service.numberOfInstances);

    compose.stdout.on('data', (data) => {
        console.log(`tsdout: ${data}`);
        console.log('TESTING');
    });

    compose.stderr.on('data', (data) => {
        console.error(`tsderr: ${data}`);
    });

    compose.on('error', (err) => {
        console.error('Failed to execute docker compose:',err);
    });
    
    compose.on('close',  (code) => {
        console.log(`child process exited with code ${code}`);
        if(code === 0) {
            console.log(serviceName,'scaled up!');
            service.numberOfInstances = replicas;
            console.log('NUMBER OF INSTANCES : ',service.numberOfInstances);
        } else {
            console.error('Failed to update service instance count.')
        }
    });
}




