import mongoose from 'mongoose';

const DEFAULT_ATLAS_URI =
  'mongodb+srv://shamilalsalhya_db_user:5usKgqwf41subeAp@cluster0.stehh9f.mongodb.net/shamil_db?retryWrites=true&w=majority';

// Global cache across serverless function invocations
let cached = global.mongoose;
if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

export const connectDB = async () => {
  // Return existing connection if already connected
  if (cached.conn && mongoose.connection.readyState === 1) {
    return cached.conn;
  }

  if (!cached.promise) {
    let mongoUri = process.env.MONGODB_URI;
    // On Vercel, localhost/127.0.0.1 does not exist, so fallback to MongoDB Atlas
    if (!mongoUri || (process.env.VERCEL && (mongoUri.includes('127.0.0.1') || mongoUri.includes('localhost')))) {
      mongoUri = DEFAULT_ATLAS_URI;
    }

    const opts = {
      autoIndex: false,
      serverSelectionTimeoutMS: 8000,
      connectTimeoutMS: 8000,
      family: 4,
    };

    cached.promise = mongoose.connect(mongoUri, opts).then((conn) => {
      console.log(`🍃 [MongoDB Connected]: ${conn.connection.host}/${conn.connection.name}`);
      return conn;
    });
  }

  try {
    cached.conn = await cached.promise;
    return cached.conn;
  } catch (error) {
    cached.promise = null;
    console.error('❌ [MongoDB Connection Error]:', error.message);
    if (process.env.NODE_ENV !== 'production' && !process.env.VERCEL) {
      process.exit(1);
    }
    throw error;
  }
};

export default connectDB;
