import mongoose from 'mongoose';
import { env } from './env';

const connectDB = async (): Promise<void> => {
  const conn = await mongoose.connect(env.MONGO_URI, {
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
  });
  console.log(`MongoDB connected: ${conn.connection.host}`);
};

export default connectDB;
