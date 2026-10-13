import mongoose from 'mongoose';

const DEFAULT_ATLAS_URI =
  'mongodb+srv://shamilalsalhya_db_user:5usKgqwf41subeAp@cluster0.stehh9f.mongodb.net/shamil_db?retryWrites=true&w=majority';

export const connectDB = async () => {
  // Return existing connection if already connected (vital for serverless environments)
  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  try {
    const mongoUri = process.env.MONGODB_URI || DEFAULT_ATLAS_URI;
    const conn = await mongoose.connect(mongoUri, {
      autoIndex: true,
      serverSelectionTimeoutMS: 10000,
    });

    console.log(`🍃 [MongoDB Connected]: ${conn.connection.host}/${conn.connection.name}`);
    return conn;
  } catch (error) {
    console.error('❌ [MongoDB Connection Error]:', error.message);
    // Do not call process.exit(1) in serverless to prevent unhandled container crash
    if (process.env.NODE_ENV !== 'production' && !process.env.VERCEL) {
      process.exit(1);
    }
    throw error;
  }
};

export default connectDB;
