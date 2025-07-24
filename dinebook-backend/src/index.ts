import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import compression from 'compression';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { createClient } from 'redis';
import dotenv from 'dotenv';
import authRoutes from './routes/auth';
import restaurantRoutes from './routes/restaurant';
import bookingRoutes from './routes/booking';
import reviewRoutes from './routes/review';
import mongoose from 'mongoose';

dotenv.config();

// Redis client for caching
const redisClient = createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379',
  socket: {
    reconnectStrategy: (retries) => {
      if (retries > 3) {
        console.log('Redis connection failed after 3 attempts, disabling cache');
        return false; 
      }
      return Math.min(retries * 50, 500);
    }
  }
});

redisClient.on('error', (err) => {
  console.log('Redis unavailable, continuing without cache');
  redisConnected = false;
});

// Connect to Redis with limited retries
let redisConnected = false;
redisClient.connect()
  .then(() => {
    console.log('Connected to Redis');
    redisConnected = true;
  })
  .catch((error) => {
    console.log('Redis unavailable, caching disabled');
    redisConnected = false;
  });


const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/dinebook';
console.log('Connecting to MongoDB:', MONGODB_URI);

mongoose.set('bufferCommands', false);

// Optimize MongoDB connection
mongoose.connect(MONGODB_URI, {
  maxPoolSize: 10,
  minPoolSize: 2,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
  connectTimeoutMS: 10000,
  maxIdleTimeMS: 30000,
  retryWrites: true,
  w: 'majority',
  appName: 'DineBook-API'
})
  .then(() => console.log('Connected to MongoDB'))
  .catch((error) => console.error('MongoDB connection error:', error));



const app = express();
const port = process.env.PORT || 3000;

const allowedOrigins = [
  'http://localhost:4200',
  'https://web-assignment03-csci-5709.vercel.app'
];

// Security middleware
app.use(helmet());

// Compression middleware
app.use(compression({
  filter: (req, res) => {
    if (req.headers['x-no-compression']) {
      return false;
    }
    return compression.filter(req, res);
  },
  level: 6,
  threshold: 1024,
}));


// Environment rate limit
const isDevelopment = process.env.NODE_ENV !== 'production';


// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: isDevelopment ? 10000000 : 100, // High limit for testing
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(limiter);

// API-specific rate limiting
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: isDevelopment ? 10000000 : 200, // High limit for testing
  message: 'Too many API requests, please try again later.',
});

// CORS configuration
app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.warn('Blocked by CORS:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));

// Cache middleware 
const cacheMiddleware = (duration: number) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    if (req.method !== 'GET' || !redisConnected) {
      return next();
    }

    const key = `cache:${req.originalUrl}`;
    
    try {
      const cachedResponse = await redisClient.get(key);
      if (cachedResponse) {
        res.set('X-Cache', 'HIT');
        res.set('Cache-Control', 'public, max-age=300');
        return res.json(JSON.parse(cachedResponse));
      }
    } catch (error) {
      console.warn('Cache read error:', error);
    }
    const originalJson = res.json.bind(res);
    res.json = (data: any) => {
      if (res.statusCode === 200 && redisConnected) {
        redisClient.setEx(key, duration, JSON.stringify(data)).catch(console.error);
      }
      res.set('X-Cache', 'MISS');
      res.set('Cache-Control', 'public, max-age=' + duration);
      return originalJson(data);
    };

    next();
  };
};

// Routes with caching
app.use('/api/auth', apiLimiter, authRoutes);
app.use('/api/restaurants', apiLimiter, cacheMiddleware(300), restaurantRoutes);
app.use('/api/bookings', apiLimiter, bookingRoutes);
app.use('/api/reviews', apiLimiter, cacheMiddleware(600), reviewRoutes);

// Basic route
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to DineBook Backend!', version: '1.0.0' });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    redis: redisConnected ? 'connected' : 'disconnected'
  });
});

// Start server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
  console.log(`Access the API at http://localhost:${port}`);
});

process.on('SIGINT', async () => {
  console.log('Shutting down gracefully...');
  await mongoose.connection.close();
  if (redisConnected) {
    await redisClient.quit();
  }
  process.exit(0);
});
