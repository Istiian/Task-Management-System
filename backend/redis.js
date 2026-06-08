import { createClient } from "redis";
import { ApiError } from "./src/util/apiError.js";
import { logger } from "./src/util/logger.js";

const redisClient = createClient({
    url: process.env.REDIS_URL,
});

redisClient.on('error', (err) => {
    throw new ApiError(500, `Redis Client Error: ${err.message}`);
});

redisClient.connect()
    .then(() => logger.info('Connected to Redis successfully.'))
    .catch((err) => {
        throw new ApiError(500, `Failed to connect to Redis: ${err.message}`);
    });

export default redisClient;

