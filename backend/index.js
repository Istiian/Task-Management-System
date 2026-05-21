import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import httpErrors from 'http-errors';
import sequelize from './db.js';
import passport from 'passport';
import cookieParser from 'cookie-parser';
import { rateLimit } from 'express-rate-limit'
import authRoutes from './routes/auth.routes.js';
import userRoutes from './routes/user.routes.js';
import taskRoutes from './routes/task.routes.js';
import './passport.js';

dotenv.config();
const app = express();

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(passport.initialize());

app.use('/auth', authRoutes);
app.use('/user', userRoutes);
app.use('/task', passport.authenticate('jwt', { session: false }), taskRoutes);


// Test the database connection
try {
  await sequelize.authenticate();
  console.log('Connection has been established successfully.');
  await sequelize.sync();
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



