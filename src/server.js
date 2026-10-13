import http from 'http';
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
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
  try {
    await connectDB();
  } catch (err) {
    console.error('Database connection failed on request:', err.message);
  }
  next();
});

// Root Route
app.get('/', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'Al Salhiya Marketplace Server is running with local MongoDB connection',
    timestamp: new Date().toISOString(),
  });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    database: 'connected',
    uptime: process.uptime(),
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

// Create HTTP server & bind Socket.io
const httpServer = http.createServer(app);
initSocket(httpServer, CLIENT_URL);

// Connect to Database, Seed Data, and Start Server
const startServer = async () => {
  try {
    await connectDB();
    await seedDatabaseIfEmpty();

    httpServer.listen(PORT, () => {
      console.log(`🚀 [Server Ready]: Listening on http://localhost:${PORT}`);
      console.log(`📡 [CORS Origin]: Accepting requests from ${CLIENT_URL}`);
      console.log(`🍃 [Database]: Local MongoDB connected & collections initialized`);
    });
  } catch (err) {
    console.error('❌ Failed to start server:', err.message);
    process.exit(1);
  }
};

startServer();

export default app;
