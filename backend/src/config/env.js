import dotenv from 'dotenv';

dotenv.config();

export const config = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: process.env.PORT || 5000,
  mongodbUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/petweb',
  jwtSecret: process.env.JWT_SECRET || 'dev_secret_key',
  jwtExpire: process.env.JWT_EXPIRE || '24h'
};

export default config;
