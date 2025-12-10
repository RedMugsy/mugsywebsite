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
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/treasure_hunt')
.then(() => {
  console.log('✅ Connected to MongoDB');
})
.catch((error) => {
  console.warn('⚠️  MongoDB connection failed (server will continue without DB):', error.message);
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

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🌐 CORS origin: ${process.env.FRONTEND_URL || 'http://localhost:5173'}`);
});

export default app;
