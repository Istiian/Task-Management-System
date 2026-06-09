import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import sequelize from './src/config/db.js';
import passport from 'passport';
import cookieParser from 'cookie-parser';
import { rateLimit } from 'express-rate-limit';
import { errorHandler } from './src/middleware/errorHandler.js';
import { ApiError } from './src/util/apiError.js';
import { logger } from './src/util/logger.js';

// Sets up the JWT strategy and registers all model associations
import './src/config/passport.js';
import './src/models/relations.js';

import authRoutes from './src/modules/auth/auth.routes.js';
import userRoutes from './src/modules/user/user.routes.js';
import projectRoutes from './src/modules/project/project.routes.js';
import taskRoutes from './src/modules/task/task.routes.js';

// Starts the deadline notification cron job on import
import './src/scheduler/notification.js';

dotenv.config();

const app = express();

app.use(cors({
    origin: process.env.CLIENT_URL || true, // allow all origins if CLIENT_URL is not set
    credentials: true, // required for cookies (refresh token)
}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser()); // parses the refresh token cookie
app.use(passport.initialize());

// Public routes
app.use('/auth', authRoutes);

// only registration is public; all other user routes require JWT auth
app.use('/user', userRoutes);

// Protected routes — JWT required
app.use('/project', passport.authenticate('jwt', { session: false }), projectRoutes);
app.use('/task', passport.authenticate('jwt', { session: false }), taskRoutes);

// Connect to DB and sync schema; exit process if connection fails
try {
    await sequelize.authenticate();
    logger.info('Connection has been established successfully.');
    await sequelize.sync({ alter: true }); // updates columns without dropping data
    logger.info('Database schema is in sync.');
} catch (error) {
    logger.error({
        message: 'Unable to connect to the database:',
        error: error.message,
        stack: error.stack,
    });
    process.exit(1);
}

app.listen(process.env.PORT, () => {
    logger.info(`Server is running on port ${process.env.PORT}`);
});

// Global rate limit: 100 requests per 15 minutes per IP
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: 'Too many requests, please try again after 15 minutes',
});
app.use(limiter);

// 404 for unmatched routes
app.use((req, res, next) => {
    next(new ApiError(404, `Route not found: ${req.originalUrl}`));
});

// Central error handler — must be last
app.use(errorHandler);
