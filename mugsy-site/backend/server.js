import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import compression from 'compression';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { config } from 'dotenv';

// Load environment variables
config();

console.log('=== ES MODULES LOADED SUCCESSFULLY ===');

// === STARTUP DEBUG LOGGING ===
console.log('=== SERVER STARTING ===');
console.log('Node.js version:', process.version);
console.log('MongoDB URI:', process.env.MONGODB_URI ? 'Set' : 'MISSING');
console.log('Port:', process.env.PORT || 'MISSING (using 3001)');
console.log('Frontend URL:', process.env.FRONTEND_URL || 'MISSING (using localhost)');
console.log('NODE_ENV:', process.env.NODE_ENV || 'MISSING');

const app = express();
const PORT = process.env.PORT || 3001;

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));

// CORS configuration
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-csrf-token'],
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/', limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Compression
app.use(compression());

// Database connection
console.log('=== MONGODB CONNECTION ATTEMPT ===');
console.log('Attempting to connect to:', process.env.MONGODB_URI ? 'MongoDB URI (hidden)' : 'No URI provided');

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/treasure_hunt')
.then(() => {
  console.log('✅ Connected to MongoDB successfully');
  console.log('Database name:', mongoose.connection.db.databaseName);
})
.catch((error) => {
  console.error('❌ MongoDB connection failed:', error.message);
  console.warn('⚠️  Server will continue without DB, but functionality may be limited');
});

// Health check endpoint
app.get('/health', (req, res) => {
  const dbStatus = mongoose.connection.readyState;
  const dbStatusText = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting'
  };
  
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    database: dbStatusText[dbStatus] || 'unknown',
    environment: process.env.NODE_ENV || 'development',
    version: '1.0.0'
  });
});

// API Routes
import authRoutes from './routes/auth.js';
import promoterRoutes from './routes/promoters.js';
import participantRoutes from './routes/participants.js';
import treasureHuntRoutes from './routes/treasureHunts.js';
import messageRoutes from './routes/messages.js';

app.use('/api/auth', authRoutes);
app.use('/api/promoters', promoterRoutes);
app.use('/api/participants', participantRoutes);
app.use('/api/treasure-hunts', treasureHuntRoutes);
app.use('/api/admin/messages', messageRoutes);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: 'The requested endpoint does not exist',
    path: req.originalUrl
  });
});

// Global error handler
app.use((error, req, res, next) => {
  console.error('❌ Server Error:', error);
  
  const status = error.status || 500;
  const message = error.message || 'Internal Server Error';
  
  res.status(status).json({
    error: process.env.NODE_ENV === 'production' ? 'Internal Server Error' : error.name,
    message: process.env.NODE_ENV === 'production' && status === 500 ? 'Something went wrong' : message,
    ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
  });
});

// Global error handlers
process.on('uncaughtException', (error) => {
  console.error('💥 UNCAUGHT EXCEPTION:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('💥 UNHANDLED REJECTION at:', promise, 'reason:', reason);
  process.exit(1);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('📴 SIGTERM received, shutting down gracefully...');

  mongoose.connection.close()
    .then(() => {
      console.log('📴 MongoDB connection closed.');
      process.exit(0);
    })
    .catch(() => {
      console.log('📴 MongoDB connection close failed, exiting anyway.');
      process.exit(0);
    });
});

process.on('SIGINT', () => {
  console.log('📴 SIGINT received, shutting down gracefully...');

  mongoose.connection.close()
    .then(() => {
      console.log('📴 MongoDB connection closed.');
      process.exit(0);
    })
    .catch(() => {
      console.log('📴 MongoDB connection close failed, exiting anyway.');
      process.exit(0);
    });
});

console.log('=== STARTING SERVER ===');
app.listen(PORT, '0.0.0.0', () => {
  console.log('=== SERVER STARTED SUCCESSFULLY ===');
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🌐 CORS origin: ${process.env.FRONTEND_URL || 'http://localhost:5173'}`);
  console.log(`🔗 Health check: http://0.0.0.0:${PORT}/health`);
  console.log('=== SERVER READY FOR CONNECTIONS ===');
});export default app;
