import { Request, Response, NextFunction } from 'express';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import cors from 'cors';

// Global rate limiting: 300 requests / 15 minutes / IP
export const globalRateLimit = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'), // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '300'),
  message: {
    error: 'rate_limit_exceeded',
    message: 'Too many requests, please try again later'
  },
  standardHeaders: true,
  legacyHeaders: false,
  // Log rate limit hits for monitoring
  handler: (req: Request, res: Response) => {
    console.log(`Rate limit exceeded for IP: ${req.ip} at ${new Date().toISOString()}`);
    res.status(429).json({
      error: 'rate_limit_exceeded',
      message: 'Too many requests, please try again later'
    });
  }
});

// Auth routes rate limiting: 50 requests / 15 minutes / IP
export const authRateLimit = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'), // 15 minutes
  max: parseInt(process.env.AUTH_RATE_LIMIT_MAX || '50'),
  message: {
    error: 'auth_rate_limit_exceeded',
    message: 'Too many authentication attempts, please try again later'
  },
  standardHeaders: true,
  legacyHeaders: false
});

// External API proxy rate limiting: 60 requests / minute / IP
export const externalApiRateLimit = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: parseInt(process.env.EXTERNAL_API_RATE_LIMIT_MAX || '60'),
  message: {
    error: 'external_api_rate_limit_exceeded',
    message: 'Too many API requests, please try again in a minute'
  },
  standardHeaders: true,
  legacyHeaders: false
});

// Helmet security headers
export const securityHeaders = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", "https://travel-advisor.p.rapidapi.com"]
    }
  },
  crossOriginEmbedderPolicy: false
});

// CORS configuration from environment variables
export const corsConfig = cors({
  origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
    const allowedOrigins = process.env.CORS_ORIGINS?.split(',') || ['http://localhost:3000'];
    
    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin) {
      callback(null, true);
      return;
    }
    
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS policy'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
});

// JSON payload size limit: 100KB
export const jsonSizeLimit = (req: Request, res: Response, next: NextFunction): void => {
  const contentLength = req.get('content-length');
  const maxSize = 100 * 1024; // 100KB
  
  if (contentLength && parseInt(contentLength) > maxSize) {
    res.status(413).json({
      error: 'payload_too_large',
      message: 'Request payload exceeds 100KB limit'
    });
    return;
  }
  
  next();
};

// Deny multipart uploads on public routes
export const denyMultipart = (req: Request, res: Response, next: NextFunction): void => {
  const contentType = req.get('content-type');
  
  if (contentType && contentType.includes('multipart/form-data')) {
    res.status(415).json({
      error: 'unsupported_media_type',
      message: 'Multipart uploads not allowed on this endpoint'
    });
    return;
  }
  
  next();
};

// Error logging middleware for 5xx responses
export const errorLogger = (err: Error, req: Request, res: Response, next: NextFunction) => {
  // Log 5xx errors with timestamp and route (no PII)
  if (res.statusCode >= 500) {
    console.error(`5xx Error: ${err.message} | Route: ${req.method} ${req.path} | Time: ${new Date().toISOString()}`);
  }
  
  next(err);
};
