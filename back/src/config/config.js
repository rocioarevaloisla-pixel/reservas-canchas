require('dotenv').config();

module.exports = {
  port: process.env.PORT || 3000,
  jwtSecret: process.env.JWT_SECRET || 'fallback_secret_dev',
  jwtExpiresIn: '7d',
};
