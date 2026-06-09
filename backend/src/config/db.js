import dotenv from 'dotenv';
import { Sequelize } from 'sequelize';

dotenv.config();

// Sequelize connection for PostgreSQL.
// timezone '+08:00' keeps timestamps aligned with local time (UTC+8).
// logging is disabled to keep server output clean.
const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASSWORD, {
    host: process.env.DB_HOST,
    dialect: 'postgres',
    timezone: '+08:00',
    logging: false,
});

export default sequelize;
