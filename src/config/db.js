import mongoose from 'mongoose';

export const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/shamil_db';
    const conn = await mongoose.connect(mongoUri, {
      autoIndex: true,
    });

    console.log(`🍃 [MongoDB Connected]: ${conn.connection.host}:${conn.connection.port}/${conn.connection.name}`);
    return conn;
  } catch (error) {
    console.error('❌ [MongoDB Connection Error]:', error.message);
    process.exit(1);
  }
};

export default connectDB;
