const { client } = require("../config/redisClient");
const logger = new (require("./loggerService"))("cache");

const DEFAULT_TTL = 60 * 60;

/**
 * Cache Wrapper:
 * @param {string} key
 * @param {function} fetchFn
 * @param {number} ttl
 * @returns {Promise<any>}
 */
const cacheWrapper = async (key, fetchFn, ttl = DEFAULT_TTL) => {
  try {
    const cached = await client.get(key);

    if (cached) {
      logger.info(`Cache HIT: ${key}`);
      return JSON.parse(cached);
    }

    logger.info(`Cache MISS: ${key}`);
    const result = await fetchFn();

    if (result) {
      await client.setEx(key, ttl, JSON.stringify(result));
      logger.info(`Cache SET: ${key} (TTL: ${ttl}s)`);
    }

    return result;
  } catch (err) {
    logger.error(`Cache Wrapper Error: ${err.message}`);
    return fetchFn();
  }
};

/**
 * Update cache manually
 */
const setCache = async (key, value, ttl = DEFAULT_TTL) => {
  try {
    await client.setEx(key, ttl, JSON.stringify(value));
    logger.info(`Cache UPDATED: ${key}`);
  } catch (err) {
    logger.error(`Cache SET Error: ${err.message}`);
  }
};

/**
 * Delete a specific cache key
 */
const delCache = async (keyPattern) => {
  try {
    if (keyPattern.includes("*")) {
      const keys = await client.keys(keyPattern);
      if (keys.length) await client.del(keys);
      logger.info(`Cache DELETED (pattern): ${keyPattern}`);
    } else {
      await client.del(keyPattern);
      logger.info(`Cache DELETED: ${keyPattern}`);
    }
  } catch (err) {
    logger.error(`Cache DEL Error: ${err.message}`);
  }
};

/**
 * Clear all cache
 */
const flushCache = async () => {
  try {
    await client.flushAll();
    logger.warn("Cache FLUSH: all keys deleted");
  } catch (err) {
    logger.error(`Cache FLUSH Error: ${err.message}`);
  }
};

module.exports = {
  cacheWrapper,
  setCache,
  delCache,
  flushCache,
};
