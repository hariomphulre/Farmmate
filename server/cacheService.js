/**
 * Production Cache Service
 * Provides resilient, non-blocking caching with automatic serialization,
 * safe fallback on Redis downtime, and non-blocking pattern deletion.
 */
const { redisClient, isReady } = require('./redisClient');

const DEFAULT_TTL = parseInt(process.env.REDIS_TTL_DEFAULT || '1800', 10); // 30 minutes default

const cacheService = {
  /**
   * Check if Redis cache is currently online and healthy
   */
  isHealthy() {
    return isReady();
  },

  /**
   * Retrieve cached value by key
   * Returns parsed value or null if miss / Redis offline
   */
  async get(key) {
    if (!isReady()) return null;
    try {
      const data = await redisClient.get(key);
      if (!data) return null;
      return JSON.parse(data);
    } catch (err) {
      console.warn(`[Cache] GET error for key "${key}":`, err.message);
      return null;
    }
  },

  /**
   * Store value in cache with expiration
   * @param {string} key
   * @param {*} value
   * @param {number} ttlSeconds Expiration in seconds
   */
  async set(key, value, ttlSeconds = DEFAULT_TTL) {
    if (!isReady()) return false;
    try {
      const serialized = JSON.stringify(value);
      if (ttlSeconds && ttlSeconds > 0) {
        await redisClient.set(key, serialized, 'EX', ttlSeconds);
      } else {
        await redisClient.set(key, serialized);
      }
      return true;
    } catch (err) {
      console.warn(`[Cache] SET error for key "${key}":`, err.message);
      return false;
    }
  },

  /**
   * Delete a key from cache
   */
  async del(key) {
    if (!isReady()) return false;
    try {
      await redisClient.del(key);
      return true;
    } catch (err) {
      console.warn(`[Cache] DEL error for key "${key}":`, err.message);
      return false;
    }
  },

  /**
   * High-level cache wrapper:
   * Returns cached value if available; otherwise executes fetchFn(),
   * stores result in cache with TTL, and returns the result.
   * If Redis is down, seamlessly falls back to executing fetchFn().
   */
  async getOrSet(key, fetchFn, ttlSeconds = DEFAULT_TTL) {
    // 1. Try cache first
    const cached = await this.get(key);
    if (cached !== null && cached !== undefined) {
      return { data: cached, fromCache: true };
    }

    // 2. Fetch fresh data
    const freshData = await fetchFn();

    // 3. Cache asynchronously without blocking
    if (freshData !== null && freshData !== undefined) {
      this.set(key, freshData, ttlSeconds).catch((err) => {
        console.warn(`[Cache] Async cache write failed for "${key}":`, err.message);
      });
    }

    return { data: freshData, fromCache: false };
  },

  /**
   * Non-blocking deletion using SCAN (safe for production, unlike KEYS)
   */
  async delByPattern(pattern) {
    if (!isReady()) return false;
    try {
      const stream = redisClient.scanStream({
        match: pattern,
        count: 100,
      });

      stream.on('data', async (keys) => {
        if (keys.length > 0) {
          const pipeline = redisClient.pipeline();
          keys.forEach((key) => pipeline.unlink(key));
          await pipeline.exec();
        }
      });

      return true;
    } catch (err) {
      console.warn(`[Cache] delByPattern error for "${pattern}":`, err.message);
      return false;
    }
  },
};

module.exports = cacheService;
