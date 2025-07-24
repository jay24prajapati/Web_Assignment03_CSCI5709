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

// Disable Express powered-by header
app.disable('x-powered-by');

app.use((req, res, next) => {
  // Disable TRACE and TRACK methods
  const blockedMethods = ['TRACE', 'TRACK', 'CONNECT'];
  
  if (blockedMethods.includes(req.method)) {
    res.destroy();
    return;
  }
  
  // Handle OPTIONS
  if (req.method === 'OPTIONS') {
    if (!req.headers['access-control-request-method'] && !req.headers.origin) {
      res.destroy();
      return;
    }
  }
  res.removeHeader('X-Powered-By');
  res.removeHeader('Server');
  
  // Add security headers 
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '0'); // Disable to avoid fingerprinting
  res.setHeader('Referrer-Policy', 'no-referrer');
  res.setHeader('Cross-Origin-Embedder-Policy', 'require-corp');
  res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
  res.setHeader('Cross-Origin-Resource-Policy', 'same-origin');
  
    // Set cache control for API route
  if (req.url.startsWith('/api/')) {
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate, private');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
  }
  
  if (req.headers['max-forwards'] || 
      req.headers['via'] || 
      req.headers['x-forwarded-server'] ||
      req.method === 'PATCH' && !req.url.startsWith('/api/')) {
    res.status(400).end();
    return;
  }
  
  next();
});

// Security headers with proper CSP
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameAncestors: ["'none'"],
      formAction: ["'self'"],
      baseUri: ["'self'"],
      upgradeInsecureRequests: [],
    },
  },
  crossOriginEmbedderPolicy: {
    policy: "require-corp"
  },
  crossOriginOpenerPolicy: {
    policy: "same-origin"
  },
  crossOriginResourcePolicy: {
    policy: "same-origin"
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  },
  hidePoweredBy: true,
  frameguard: { action: 'deny' },
  noSniff: true,
  xssFilter: false 
}));

// Permissions Policy header
app.use((req, res, next) => {
  res.setHeader('Server', 'nginx/1.18.0');
  
  res.setHeader('Permissions-Policy', 
    'geolocation=(), microphone=(), camera=(), magnetometer=(), gyroscope=(), speaker=(), vibrate=(), fullscreen=(), payment=(), usb=(), bluetooth=(), midi=(), accelerometer=(), ambient-light-sensor=(), autoplay=(), battery=(), display-capture=(), document-domain=(), encrypted-media=(), execution-while-not-rendered=(), execution-while-out-of-viewport=(), gamepad=(), navigation-override=(), picture-in-picture=(), publickey-credentials-get=(), screen-wake-lock=(), sync-xhr=(), web-share=(), xr-spatial-tracking=()');
  
  next();
});

// security headers for static files
app.use('/api', (req, res, next) => {
  res.setHeader('Content-Security-Policy', 
    "default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self'; connect-src 'self'; font-src 'self'; object-src 'none'; media-src 'self'; frame-ancestors 'none'; form-action 'self'; base-uri 'self'; upgrade-insecure-requests;");
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate, private');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  res.setHeader('Server', 'nginx/1.18.0');
  next();
});

app.get('/robots.txt', (req, res) => {
  res.type('text/plain');
  res.setHeader('Content-Security-Policy', 
    "default-src 'none'; frame-ancestors 'none'; form-action 'none';");
  res.setHeader('Cache-Control', 'public, max-age=86400, immutable');
  res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
  res.setHeader('Server', 'nginx/1.18.0');
  res.send('User-agent: *\nDisallow: /api/\nAllow: /');
});

app.get('/sitemap.xml', (req, res) => {
  res.type('application/xml');
  res.setHeader('Content-Security-Policy', 
    "default-src 'none'; frame-ancestors 'none'; form-action 'none';");
  res.setHeader('Cache-Control', 'public, max-age=86400, immutable');
  res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
  res.setHeader('Server', 'nginx/1.18.0');
  res.send('<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"></urlset>');
});

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
  message: { error: 'Too many requests' }, 
  standardHeaders: false,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).json({ error: 'Too many requests' });
  }
});

app.use(limiter);

// API-specific rate limiting
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: isDevelopment ? 10000000 : 200,  // High limit for testing
  message: { error: 'Too many API requests' },
  standardHeaders: false,
  legacyHeaders: false,
  handler: (req, res) => {
    res.setHeader('Server', 'nginx/1.18.0');
    res.status(429).json({ error: 'Too many API requests' });
  }
});

// CORS configuration
app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  optionsSuccessStatus: 200 
}));

app.use(express.json({ 
  limit: '10mb',
  verify: (req, res, buf) => {
  }
}));

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
        res.set('Cache-Control', 'private, max-age=300');
        res.setHeader('Server', 'nginx/1.18.0');
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
      res.set('Cache-Control', 'private, max-age=' + duration);
      res.setHeader('Server', 'nginx/1.18.0');
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
  res.set('Cache-Control', 'no-cache, no-store, must-revalidate, private');
  res.setHeader('Server', 'nginx/1.18.0');
  res.json({ message: 'Welcome to DineBook Backend!', version: '1.0.0' });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.set('Cache-Control', 'no-cache, no-store, must-revalidate, private');
  res.setHeader('Server', 'nginx/1.18.0');
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    redis: redisConnected ? 'connected' : 'disconnected'
  });
});

app.use('*', (req, res) => {
  res.setHeader('Server', 'nginx/1.18.0');
  res.status(404).json({ error: 'Not Found' });
});

app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error('Unhandled error:', err);
  res.setHeader('Server', 'nginx/1.18.0');
  res.status(500).json({ error: 'Internal Server Error' });
});

const originalSend = express.response.send;
express.response.send = function(this: Response, ...args: any[]) {
  this.setHeader('Server', 'nginx/1.18.0');
  return originalSend.apply(this, args);
};

const originalJson = express.response.json;
express.response.json = function(this: Response, ...args: any[]) {
  this.setHeader('Server', 'nginx/1.18.0');
  return originalJson.apply(this, args);
};

// Start server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
  console.log(`Access the API at http://localhost:${port}`);
});

process.on('SIGINT', async () => {
  console.log('Shutting down...');
  await mongoose.connection.close();
  if (redisConnected) {
    await redisClient.quit();
  }
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('SIGTERM received, shutting down...');
  await mongoose.connection.close();
  if (redisConnected) {
    await redisClient.quit();
  }
  process.exit(0);
});