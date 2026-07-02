import mongoose from 'mongoose';
import config from './env.js';

export const connectDatabase = async () => {
  try {
    await mongoose.connect(config.mongodbUri);
    console.log('✓ MongoDB connected');
    return true;
  } catch (error) {
    console.error('✗ MongoDB connection failed:', error.message);
    process.exit(1);
  }
};

export default connectDatabase;
