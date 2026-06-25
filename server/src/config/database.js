const { Sequelize } = require('sequelize');
require('dotenv').config();

const databaseUrl = process.env.DATABASE_URL;

const sequelize = databaseUrl
  ? new Sequelize(databaseUrl, { dialect: 'mysql', logging: false })
  : new Sequelize(
      process.env.DB_NAME || 'reservas_canchas',
      process.env.DB_USER || 'root',
      process.env.DB_PASSWORD || '',
      {
        host: process.env.DB_HOST || 'localhost',
        port: process.env.DB_PORT || 3306,
        dialect: 'mysql',
        logging: false,
      }
    );

module.exports = sequelize;

module.exports.development = {
  use_env_variable: 'DATABASE_URL',
  dialect: 'mysql',
  logging: false,
};

module.exports.production = {
  use_env_variable: 'DATABASE_URL',
  dialect: 'mysql',
  logging: false,
};
