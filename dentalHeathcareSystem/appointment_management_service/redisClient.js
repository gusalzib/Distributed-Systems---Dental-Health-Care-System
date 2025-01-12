const { createClient } = require('redis');

const redisClient = createClient({
    url: 'redis://host.docker.internal:6379',
});
redisClient.on('error', (error) => console.error('Redis Client Error', error));
redisClient.on('ready', () => console.log('Redis Client connected'));
redisClient.on('connect', () => console.log('Redis Client is trying to connect...'));

(async () => {
    await redisClient.connect();
    console.log("connected to Redis.");

}) ();
module.exports = redisClient;