const Docker = require('dockerode');
const docker = new Docker();



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
        console.log('memory %:', memoryUsagePercentage);

        const nameArr = containerName.split('-');
        const serviceToScale = nameArr[1]+'-'+nameArr[2];
        
        if(cpuUsage > 0.60 || memoryUsagePercentage > 70){
            console.log("Scale up!");
            scaleUpServices(serviceToScale,containerName)
        }

        return {
            name: containerName,
            cpu: cpuUsage,
            memory: memoryUsagePercentage
        };
    } catch (err) {
        throw new Error(`Error when fetching stats: ${err.message}`);
    }
}





