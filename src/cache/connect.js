/* lint:disable */
/**
 * GLOBAL Dependencies
 */
const Redis = require('redis');
require('dotenv').config();

/**
 * Start DB Connection
 */
module.exports = new Promise((resolve, reject) => {
  // -- Create Redis Client if not exist
  if (process.env.REDIS_CONNECTION) {
    resolve(process.env.REDIS_CONNECTION);
  }

  const client = Redis.createClient({
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT,
    password: process.env.REDIS_PASSWORD,
  });

  // -- Listen events
  client.on('ready', () => {
    process.env.REDIS_CONNECTION = client;
    resolve(client);
  });

  client.on('error', (error) => {
    reject(error);
  });
});
