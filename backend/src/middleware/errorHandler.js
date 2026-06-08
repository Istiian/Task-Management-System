import { logger } from '../util/logger.js';

export const errorHandler = (err, req, res, next) => {
    const statusCode = err.status || 500;
    const message = err.message || "Internal Server Error";

    if (statusCode === 500) {
        logger.error({
            message: err.message,
            stack: err.stack,
            method: req.method,
            url: req.originalUrl,
        })
    }else{
        logger.warn({
            message: err.message,
            method: req.method,
            url: req.originalUrl,

        })
    }
    res.status(statusCode).json({
        success: false,
        error: message
    });
}

