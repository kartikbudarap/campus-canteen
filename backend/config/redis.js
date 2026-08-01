const { createClient } = require('redis');

let client;
let attempted = false;

const getRedis = async () => {
  if (!process.env.REDIS_URL) return null;
  if (client?.isReady) return client;
  if (attempted) return null;

  attempted = true;
  client = createClient({ url: process.env.REDIS_URL });
  client.on('error', (error) => console.warn(`Redis unavailable: ${error.message}`));

  try {
    await client.connect();
    console.log('Redis connected');
    return client;
  } catch {
    console.warn('Continuing without Redis; MongoDB pickup verification remains available.');
    return null;
  }
};

module.exports = { getRedis };
