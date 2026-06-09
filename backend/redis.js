import { createClient } from 'redis';
import { ApiError } from './src/util/apiError.js';
import { logger } from './src/util/logger.js';

// Shared Redis client used for caching, OTP storage, and cache version counters.
// Connects eagerly on module load so the first request doesn't pay the connection cost.
const redisClient = createClient({
    url: process.env.REDIS_URL,
});

// Forward Redis errors to the global error handler
redisClient.on('error', (err) => {
    throw new ApiError(500, `Redis Client Error: ${err.message}`);
});

redisClient.connect()
    .then(() => logger.info('Connected to Redis successfully.'))
    .catch((err) => {
        throw new ApiError(500, `Failed to connect to Redis: ${err.message}`);
    });

export default redisClient;
