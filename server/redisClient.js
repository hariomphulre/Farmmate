/**
 * Redis Client Configuration & Lifecycle Management
 * Production-ready singleton with exponential backoff and error handling.
 */
const Redis = require('ioredis');

const REDIS_ENABLED = process.env.REDIS_ENABLED !== 'false';
const REDIS_HOST = process.env.REDIS_HOST || '127.0.0.1';
const REDIS_PORT = parseInt(process.env.REDIS_PORT || '6379', 10);
const REDIS_PASSWORD = process.env.REDIS_PASSWORD || undefined;

let redisClient = null;
let isReady = false;

if (REDIS_ENABLED) {
  try {
    const redisOptions = {
      host: REDIS_HOST,
      port: REDIS_PORT,
      password: REDIS_PASSWORD,
      // Reconnect strategy with exponential backoff
      retryStrategy: (times) => {
        const delay = Math.min(times * 150, 3000);
        console.warn(`[Redis] Reconnection attempt #${times} in ${delay}ms`);
        return delay;
      },
      // Fail fast per individual command so HTTP requests don't hang if Redis is unreachable
      maxRetriesPerRequest: 2,
      enableOfflineQueue: false,
      connectTimeout: 5000,
      lazyConnect: false,
      keepAlive: 30000,
    };

    redisClient = new Redis(process.env.REDIS_URL || redisOptions);

    redisClient.on('connect', () => {
      console.log(`[Redis] Connecting to ${REDIS_HOST}:${REDIS_PORT}...`);
    });

    redisClient.on('ready', () => {
      isReady = true;
      console.log('✅ [Redis] Connection established and ready');
    });

    redisClient.on('error', (err) => {
      isReady = false;
      // Log without crashing the application
      console.warn('⚠️ [Redis] Client error:', err.message);
    });

    redisClient.on('close', () => {
      isReady = false;
      console.warn('ℹ️ [Redis] Connection closed');
    });

    redisClient.on('reconnecting', () => {
      console.log('🔄 [Redis] Reconnecting to server...');
    });
  } catch (initErr) {
    console.error('❌ [Redis] Initialization failed:', initErr.message);
    redisClient = null;
    isReady = false;
  }
} else {
  console.log('ℹ️ [Redis] Caching disabled via REDIS_ENABLED=false');
}

module.exports = {
  redisClient,
  isReady: () => isReady && redisClient !== null && redisClient.status === 'ready',
};
