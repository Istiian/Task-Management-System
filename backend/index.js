import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import httpErrors from 'http-errors';
import sequelize from './src/config/db.js';
import passport from 'passport';
import cookieParser from 'cookie-parser';
import { rateLimit } from 'express-rate-limit'
import User from './src/models/user.js';
import Task from './src/models/task.js';
import './src/config/passport.js';
import './src/models/relations.js';
import authRoutes from './src/modules/auth/auth.routes.js';
import userRoutes from './src/modules/user/user.routes.js';
import projectRoutes from './src/modules/project/project.routes.js';
import taskRoutes from './src/modules/task/task.routes.js';
import commentRoutes from './src/modules/comment/comment.routes.js';
import './src/scheduler/notification.js';
dotenv.config();
const app = express();

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(passport.initialize());

app.use('/auth', authRoutes);
app.use('/user', userRoutes);
app.use('/project', passport.authenticate('jwt', { session: false }), projectRoutes);
app.use('/task', taskRoutes);
app.use('/comment', commentRoutes);



// Test the database connection
try {
  await sequelize.authenticate();
  console.log('Connection has been established successfully.');
  await sequelize.sync({alter: true});
  console.log('Database schema is in sync.');
} catch (error) {
  console.error('Unable to connect to the database:', error);
}

app.listen(process.env.PORT, () => {
  console.log(`Server is running on port ${process.env.PORT}`);
});



// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, 
  message: 'Too many requests, please try again after 15 minutes' 
});
app.use(limiter);

// Error handling
app.use((req, res, next) => {
  next(httpErrors(404, 'Not Found'));
});

// Global error handler
app.use((err, req, res, next) => {
  res.status(err.status || 500);
  res.json({
    error: {
      message: err.message,
    },
  });
});



