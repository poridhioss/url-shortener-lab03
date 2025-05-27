const redis = require('redis');
const config = require('../config');
const Url = require('../models/mongoUrlModel');
const { fetchUniqueKey } = require('./keyService');


// Redis client
const redisClient = redis.createClient({
  socket: {
    host: config.redisConfig.host,
    port: parseInt(config.redisConfig.port),
  },
  password: config.redisConfig.password,
});
redisClient.connect();

async function shortenUrl(longUrl, userId) {
  // 1. Check if longUrl already exists in Redis
  const existingShortId = await redisClient.get(`long:${longUrl}`);
  if (existingShortId) {
    return `${config.baseUrl}/${existingShortId}`;
  }

  // 2. Generate new short key from PostgreSQL
  const shortUrlId = await fetchUniqueKey();

  // 3. Save in MongoDB
  const url = new Url({ shortUrlId, longUrl, userId });
  await url.save();

  // 4. Cache in Redis
  await redisClient.setEx(`short:${shortUrlId}`, 3600, longUrl);
  await redisClient.setEx(`long:${longUrl}`, 3600, shortUrlId);

  return `${config.baseUrl}/${shortUrlId}`;
}

async function getLongUrl(shortUrlId) {
  const cacheKey = `short:${shortUrlId}`;

  // 1. Check Redis cache
  const cachedUrl = await redisClient.get(cacheKey);
  if (cachedUrl) return cachedUrl;

  // 2. Fallback to MongoDB
  const url = await Url.findOne({ shortUrlId });
  if (!url) throw new Error('URL not found');

  // 3. Cache it back in Redis
  await redisClient.setEx(cacheKey, 3600, url.longUrl);

  return url.longUrl;
}


module.exports = { shortenUrl, getLongUrl };
