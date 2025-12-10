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
console.log('=== MONGODB CONNECTION ATTEMPT ===');

const hasMongoScheme = (uri) => /^mongodb(\+srv)?:\/\//i.test(uri || '');
const stripWrappingQuotes = (value) => value?.replace(/^['"]+|['"]+$/g, '');
const resolvePlaceholders = (value) => {
  if (!value) return value;
  return value.replace(/\$\{\{?\s*([^}\s]+)\s*\}?\}/g, (_, key) => process.env[key] ?? '');
};

const cleanEnvValue = (value) => {
  if (!value) return null;
  const trimmed = stripWrappingQuotes(value.trim());
  if (!trimmed || trimmed.toLowerCase() === 'undefined' || trimmed.toLowerCase() === 'null') return null;
  const resolved = resolvePlaceholders(trimmed);
  return resolved;
};

const redactMongoUri = (uri) => {
  if (!uri) return 'null';
  try {
    const parsed = new URL(uri.startsWith('mongodb') ? uri : `mongodb://${uri}`);
    const auth = parsed.username ? `${parsed.username}:***@` : '';
    parsed.username = '';
    parsed.password = '';
    return `${parsed.protocol}//${auth}${parsed.host}${parsed.pathname || ''}`;
  } catch {
    return uri.replace(/:\S+@/, ':***@');
  }
};

const appendDbIfMissing = (uri, databaseName) => {
  if (!uri) return uri;
  try {
    const parsed = new URL(uri);
    if (parsed.pathname && parsed.pathname !== '/') return uri;
    parsed.pathname = `/${databaseName}`;
    return parsed.toString();
  } catch {
    return uri.endsWith('/') ? `${uri}${databaseName}` : `${uri}/${databaseName}`;
  }
};

const ensureAuthSource = (uri, authSource) => {
  if (!uri || !authSource) return uri;
  try {
    const parsed = new URL(uri);
    if (parsed.username && !parsed.searchParams.has('authSource')) {
      parsed.searchParams.set('authSource', authSource);
      return parsed.toString();
    }
    return uri;
  } catch {
    // If parsing fails, leave unchanged to avoid introducing new malformed values.
    return uri;
  }
};

const validateMongoUri = (uri) => {
  if (!uri || !hasMongoScheme(uri)) return false;
  try {
    new URL(uri);
    return true;
  } catch {
    return false;
  }
};

const databaseName = process.env.MONGO_DB_NAME || 'treasure_hunt';

// Optional authSource; defaults to "admin" so root credentials work out of the box.
// Set MONGODB_AUTH_SOURCE=none to disable or provide a specific database name.
const rawAuthSource = process.env.MONGODB_AUTH_SOURCE;
const cleanedAuthSource = cleanEnvValue(rawAuthSource);
const authSource = cleanedAuthSource?.toLowerCase() === 'none'
  ? null
  : cleanedAuthSource || 'admin';
const envMongoUriRaw = cleanEnvValue(process.env.MONGODB_URI);
const envMongoUrl = cleanEnvValue(process.env.MONGO_URL);
const envMongoPublicUrl = cleanEnvValue(process.env.MONGO_PUBLIC_URL);
const derivedHost = cleanEnvValue(process.env.MONGOHOST)
  || cleanEnvValue(process.env.MONGO_HOST)
  || cleanEnvValue(process.env.RAILWAY_PRIVATE_DOMAIN);
const derivedUser = cleanEnvValue(process.env.MONGOUSER)
  || cleanEnvValue(process.env.MONGO_USER)
  || cleanEnvValue(process.env.MONGO_INITDB_ROOT_USERNAME);
const derivedPassword = cleanEnvValue(process.env.MONGOPASSWORD)
  || cleanEnvValue(process.env.MONGO_PASSWORD)
  || cleanEnvValue(process.env.MONGO_INITDB_ROOT_PASSWORD);
const derivedPort = cleanEnvValue(process.env.MONGOPORT)
  || cleanEnvValue(process.env.MONGO_PORT)
  || '27017';
const defaultInternalHost = 'mongodb.railway.internal';
const tcpProxyHost = cleanEnvValue(process.env.RAILWAY_TCP_PROXY_DOMAIN);
const tcpProxyPort = cleanEnvValue(process.env.RAILWAY_TCP_PROXY_PORT);

const withCredentials = (host, port) => {
  if (!host) return null;
  const auth = derivedUser ? `${derivedUser}${derivedPassword ? `:${derivedPassword}` : ''}@` : '';
  return `mongodb://${auth}${host}${port ? `:${port}` : ''}`;
};

const candidates = [];

// Always prefer the explicitly provided URI and leave it untouched unless an explicit authSource is requested.
if (envMongoUriRaw) {
  const preferredUri = authSource ? ensureAuthSource(envMongoUriRaw, authSource) : envMongoUriRaw;
  if (hasMongoScheme(preferredUri) && validateMongoUri(preferredUri)) {
    candidates.push({ uri: preferredUri, source: authSource ? 'MONGODB_URI (preferred, authSource applied)' : 'MONGODB_URI (preferred, unmodified)' });
  } else {
    console.warn('Ignoring invalid MONGODB_URI value (scheme or format):', redactMongoUri(envMongoUriRaw));
  }
}

const addCandidate = (uri, source) => {
  if (!uri) return;
  const withDb = appendDbIfMissing(hasMongoScheme(uri) ? uri : `mongodb://${uri.replace(/^\/+/, '')}`, databaseName);
  const finalUri = authSource ? ensureAuthSource(withDb, authSource) : withDb;
  if (validateMongoUri(finalUri)) {
    candidates.push({ uri: finalUri, source });
  }
};

addCandidate(envMongoPublicUrl, 'MONGO_PUBLIC_URL + database');
addCandidate(envMongoUrl, 'MONGO_URL + database');
addCandidate(withCredentials(derivedHost, derivedPort), 'Constructed from host credentials');
addCandidate(derivedHost ? `mongodb://${derivedHost}${derivedPort ? `:${derivedPort}` : ''}` : null, 'Constructed from host without credentials');
addCandidate(withCredentials(tcpProxyHost, tcpProxyPort), 'Constructed from TCP proxy values');
addCandidate(withCredentials(derivedHost || defaultInternalHost, derivedPort), 'Constructed from default Railway internal host');

const validCandidate = candidates[0];
let mongoUri = validCandidate?.uri || `mongodb://${derivedUser ? `${derivedUser}${derivedPassword ? `:${derivedPassword}` : ''}@` : ''}${derivedHost || defaultInternalHost}:${derivedPort}/${databaseName}`;
mongoUri = authSource ? ensureAuthSource(mongoUri, authSource) : mongoUri;

if (!validateMongoUri(mongoUri)) {
  console.warn('MongoDB URI invalid or missing scheme, falling back to localhost. Raw value:', redactMongoUri(mongoUri));
  mongoUri = `mongodb://localhost:27017/${databaseName}`;
}

console.log('MongoDB connection candidates (redacted):');
candidates.forEach((candidate) => {
  console.log(`- ${candidate.source}: ${redactMongoUri(candidate.uri)}`);
});
console.log('Attempting to connect using URI source:', validCandidate?.source || 'constructed internal fallback');
console.log('MongoDB connection string (redacted):', redactMongoUri(mongoUri));

mongoose.connect(mongoUri, {
  family: 4 // Force IPv4 to resolve Railway internal hostname issues
})
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

