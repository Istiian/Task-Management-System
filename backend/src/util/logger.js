import winston from 'winston';

// Application-wide logger with three transports:
//   - Console: colorised output for development
//   - combined.log: all log levels in JSON
//   - error.log: errors only in JSON
export const logger = winston.createLogger({
    level: 'info',
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.errors({ stack: true }),
        winston.format.json()
    ),
    transports: [
        new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
        new winston.transports.File({ filename: 'logs/combined.log' }),
        new winston.transports.Console({
            format: winston.format.combine(
                winston.format.colorize(),
                winston.format.simple(),
                winston.format.printf(({ level, message, timestamp, stack }) => {
                    return `[${level}]: ${timestamp} ${stack || message}`;
                })
            ),
        }),
    ],
});
