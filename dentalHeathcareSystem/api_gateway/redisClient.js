const { createClient } = require('redis');

// Create a Redis client
const redisClient = createClient({
    url: 'redis://host.docker.internal:6379',
});


// Handle connection events
redisClient.on('error', (err) => console.error('Redis Client Error', err));
redisClient.on('ready', () => console.log('Redis client connected!'));
redisClient.on('connect', () => console.log('Redis client is trying to connect...'));

// Connect to Redis
(async () => {
    await redisClient.connect();
    console.log("Connected to Redis!");
})();

module.exports = redisClient; // Export if needed in other files
