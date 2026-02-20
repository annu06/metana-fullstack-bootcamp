// Loads environment variables and exports them
require('dotenv').config();

module.exports = {
  // PostgreSQL Configuration
  DB_USER: process.env.DB_USER || 'postgres',
  DB_HOST: process.env.DB_HOST || 'localhost',
  DB_NAME: process.env.DB_NAME || 'module6_db',
  DB_PASSWORD: process.env.DB_PASSWORD || 'password',
  DB_PORT: process.env.DB_PORT || 5432,
  
  // Server Configuration
  PORT: process.env.PORT || 3000,
  NODE_ENV: process.env.NODE_ENV || 'development',
};
