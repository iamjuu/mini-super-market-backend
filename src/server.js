import http from 'http';
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import connectDB from './config/db.js';
import { initSocket } from './config/socket.js';
import seedDatabaseIfEmpty from './utils/seedData.js';
import apiRoutes from './routes/index.js';
import errorHandler from './middleware/errorHandler.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';

// Core Middlewares
app.use(
  cors({
    origin: (origin, callback) => callback(null, true),
    credentials: true,
  })
);
app.use(express.json({ limit: '15mb' }));
app.use(express.urlencoded({ extended: true, limit: '15mb' }));

// Ensure Database is connected for serverless environments (e.g. Vercel)
app.use(async (req, res, next) => {
  // Allow health and root endpoints to respond even if DB is connecting/failing
  if (req.path === '/api/health' || req.path === '/health' || req.path === '/') {
    return next();
  }

  try {
    await connectDB();
    next();
  } catch (err) {
    console.error('Database connection failed on request:', err.message);
    return res.status(503).json({
      success: false,
      code: 'DATABASE_CONNECTION_ERROR',
      message: 'Failed to connect to database. Please verify MongoDB Atlas IP whitelist (0.0.0.0/0) and MONGODB_URI.',
      details: err.message,
    });
  }
});

// Root Route
app.get('/', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'Al Salhiya Marketplace Server is running',
    timestamp: new Date().toISOString(),
  });
});

// Health check endpoint with live database diagnostics
app.get('/api/health', async (req, res) => {
  let dbStatus = 'disconnected';
  let dbError = null;
  const rawUri = process.env.MONGODB_URI || 'default_atlas_uri';
  const maskedUri = rawUri ? rawUri.replace(/:([^@]+)@/, ':****@') : 'none';

  try {
    await connectDB();
    dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'connecting';
  } catch (err) {
    dbStatus = 'error';
    dbError = {
      name: err.name,
      message: err.message,
    };
  }

  res.status(dbError ? 503 : 200).json({
    status: dbError ? 'database_error' : 'healthy',
    database: dbStatus,
    readyState: mongoose.connection.readyState,
    mongoUri: maskedUri,
    hasCustomMongoUri: !!process.env.MONGODB_URI,
    uptime: process.uptime(),
    dbError,
    timestamp: new Date().toISOString(),
  });
});

// Mount All API Routes
app.use('/api', apiRoutes);

// 404 Route Handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    status: 'error',
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });
});

// Global Error Handler
app.use(errorHandler);

// Only start standalone HTTP server when running standalone (not in Vercel serverless)
if (!process.env.VERCEL) {
  const httpServer = http.createServer(app);
  initSocket(httpServer, CLIENT_URL);

  const startServer = async () => {
    try {
      await connectDB();
      await seedDatabaseIfEmpty();

      httpServer.listen(PORT, () => {
        console.log(`🚀 [Server Ready]: Listening on http://localhost:${PORT}`);
        console.log(`📡 [CORS Origin]: Accepting requests from ${CLIENT_URL}`);
        console.log(`🍃 [Database]: MongoDB connected & collections initialized`);
      });
    } catch (err) {
      console.error('❌ Failed to start server:', err.message);
      process.exit(1);
    }
  };

  startServer();
}

export default app;
