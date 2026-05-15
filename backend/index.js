import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import httpErrors from 'http-errors';
import sequelize from './db.js';
import authRoutes from './routes/auth.routes.js';

dotenv.config();
const app = express();

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use('/auth', authRoutes);


app.listen(process.env.PORT, () => {
  console.log(`Server is running on port ${process.env.PORT}`);
});


// Test the database connection
try {
  await sequelize.authenticate();
  console.log('Connection has been established successfully.');

} catch (error) {
  console.error('Unable to connect to the database:', error);
}

// Error handling
app.use((req, res, next) => {
  next(httpErrors(404, 'Not Found'));
});

app.use((err, req, res, next) => {
  res.status(err.status || 500);
  res.json({
    error: {
      message: err.message,
    },
  });
});



