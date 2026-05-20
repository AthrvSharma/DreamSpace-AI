import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

const dialectOptions = {};

if (process.env.DB_SSL === 'true') {
  dialectOptions.ssl = {
    rejectUnauthorized: process.env.DB_SSL_REJECT_UNAUTHORIZED !== 'false',
  };
}

const sequelize = new Sequelize(
  process.env.DB_NAME || 'dreamspace',
  process.env.DB_USER || 'root',
  process.env.DB_PASSWORD || 'Athrv@200611',
  {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT) || 3306,
    dialect: process.env.DB_DIALECT || 'mysql',
    dialectOptions,
    logging: false, // Set to console.log to see SQL queries
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
  }
);

export default sequelize;
