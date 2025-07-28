import { Request, Response, NextFunction } from 'express';
import client from 'prom-client';

const register = new client.Registry();

register.setDefaultLabels({
  app: 'dinebook-backend',
  version: '1.0.0'
});

client.collectDefaultMetrics({ register });

const httpRequestsTotal = new client.Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status_code'],
  registers: [register]
});

const httpRequestDuration = new client.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [0.01, 0.05, 0.1, 0.3, 0.5, 0.7, 1, 3, 5, 7, 10, 30],
  registers: [register]
});

const activeConnections = new client.Gauge({
  name: 'active_connections',
  help: 'Number of active connections',
  registers: [register]
});

const httpRequestsInProgress = new client.Gauge({
  name: 'http_requests_in_progress',
  help: 'Number of HTTP requests currently in progress',
  registers: [register]
});

const databaseConnections = new client.Gauge({
  name: 'database_connections',
  help: 'Number of database connections',
  registers: [register]
});

const redisConnections = new client.Gauge({
  name: 'redis_connections',
  help: 'Redis connection status',
  registers: [register]
});

const errorRate = new client.Counter({
  name: 'error_rate_total',
  help: 'Total number of errors',
  labelNames: ['type', 'route', 'status_code'],
  registers: [register]
});

// Memory usage metrics
const memoryUsage = new client.Gauge({
  name: 'memory_usage_bytes',
  help: 'Memory usage in bytes',
  labelNames: ['type'],
  registers: [register]
});

// CPU usage metrics
const cpuUsage = new client.Gauge({
  name: 'cpu_usage_percent',
  help: 'CPU usage percentage',
  registers: [register]
});

setInterval(() => {
  const usage = process.memoryUsage();
  memoryUsage.set({ type: 'rss' }, usage.rss);
  memoryUsage.set({ type: 'heapUsed' }, usage.heapUsed);
  memoryUsage.set({ type: 'heapTotal' }, usage.heapTotal);
  memoryUsage.set({ type: 'external' }, usage.external);
}, 2000);

let lastCpuUsage = process.cpuUsage();
setInterval(() => {
  const currentUsage = process.cpuUsage(lastCpuUsage);
  const totalUsage = currentUsage.user + currentUsage.system;
  const totalTime = 2000000; 
  const cpuPercent = Math.min((totalUsage / totalTime) * 100, 100); // Cap at 100%
  cpuUsage.set(cpuPercent);
  lastCpuUsage = process.cpuUsage();
}, 2000);

// Middleware to collect HTTP metrics
export const metricsMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();
  
  activeConnections.inc();
  httpRequestsInProgress.inc();
  
  res.on('finish', () => {
    const duration = (Date.now() - start) / 1000;
    let route = req.route?.path || req.path || 'unknown';
    if (route.includes(':')) {
      route = route.replace(/:[^/]+/g, ':id');
    }
    
    const method = req.method;
    const statusCode = res.statusCode.toString();
    
    // Record metrics
    httpRequestsTotal.inc({ method, route, status_code: statusCode });
    httpRequestDuration.observe({ method, route, status_code: statusCode }, duration);
    
    // Record errors
    if (res.statusCode >= 400) {
      errorRate.inc({ 
        type: res.statusCode >= 500 ? 'server_error' : 'client_error', 
        route,
        status_code: statusCode
      });
    }
    
    activeConnections.dec();
    httpRequestsInProgress.dec();
  });
  
  next();
};

export const updateDatabaseMetrics = (isConnected: boolean) => {
  databaseConnections.set(isConnected ? 1 : 0);
};

export const updateRedisMetrics = (isConnected: boolean) => {
  redisConnections.set(isConnected ? 1 : 0);
};

// Export register and metrics
export { 
  register, 
  httpRequestsTotal, 
  httpRequestDuration, 
  activeConnections, 
  httpRequestsInProgress, 
  errorRate 
};