import { Request, Response, NextFunction } from 'express';
import {
  httpRequestDuration,
  httpRequestsTotal,
  httpRequestsInProgress,
  errorRate
} from '../metrics/prometheus';

export const metricsMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();
  
  httpRequestsInProgress.inc();
  
  const route = req.route ? req.route.path : req.path;
  const cleanRoute = route.replace(/:[^\s/]+/g, ':id');
  
  res.on('finish', () => {
    const duration = (Date.now() - start) / 1000;
    const method = req.method;
    const statusCode = res.statusCode.toString();
    
    // Record metrics
    httpRequestDuration
      .labels(method, cleanRoute, statusCode)
      .observe(duration);
    
    httpRequestsTotal
      .labels(method, cleanRoute, statusCode)
      .inc();
    
    httpRequestsInProgress.dec();
    
    // Track errors
    if (res.statusCode >= 400) {
      errorRate
        .labels('http_error', cleanRoute)
        .inc();
    }
  });
  
  next();
};
