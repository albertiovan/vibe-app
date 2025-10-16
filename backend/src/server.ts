import express from 'express';
import dotenv from 'dotenv';
import {
  globalRateLimit,
  securityHeaders,
  corsConfig,
  jsonSizeLimit,
  denyMultipart,
  errorLogger
} from './middleware/security';
import { sanitizeQuery } from './middleware/validation';
import healthRoutes from './routes/health';
import recommendationRoutes from './routes/recommendations';
import pingRoutes from './routes/ping';

// Load environment variables
dotenv.config();

const app = express();
const PORT = parseInt(process.env.PORT || '3000', 10);

// Security middleware (must be applied in correct order)
app.use(securityHeaders); // Helmet security headers
app.use(corsConfig); // CORS configuration
app.use(globalRateLimit); // Global rate limiting: 300/15min
app.use(jsonSizeLimit); // Limit JSON payload to 100KB
app.use(denyMultipart); // Deny multipart uploads

// Body parsing middleware
app.use(express.json({ limit: '100kb' })); // JSON parsing with size limit
app.use(express.urlencoded({ extended: true, limit: '100kb' }));

// Query sanitization
app.use(sanitizeQuery);

// Routes
app.use('/api', healthRoutes);
app.use('/api', recommendationRoutes);
app.use('/api/ping', pingRoutes);

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    name: 'Vibe API',
    version: '1.0.0',
    description: 'AI-powered activity recommendation API for Romania',
    endpoints: {
      health: '/api/health',
      metrics: '/api/metrics',
      recommendations: 'POST /api/recommendations',
      parseMood: 'POST /api/parse-mood',
      pingTripAdvisor: '/api/ping/tripadvisor',
      pingAll: '/api/ping/all'
    }
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'not_found',
    message: 'Endpoint not found'
  });
});

// Global error handler
app.use(errorLogger);
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  // Don't log the full error in production to avoid leaking sensitive info
  const isDev = process.env.NODE_ENV === 'development';
  
  if (isDev) {
    console.error('Unhandled error:', err);
  }

  // Send structured error response
  res.status(500).json({
    error: 'internal_server_error',
    message: isDev ? err.message : 'Something went wrong',
    timestamp: new Date().toISOString()
  });
});

// Graceful shutdown handling
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  process.exit(0);
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🌊 Vibe API server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`Health check: http://localhost:${PORT}/api/health`);
  console.log(`Network access: http://10.103.30.198:${PORT}/api/health`);
  
  // Warn if required env vars are missing
  if (!process.env.RAPIDAPI_KEY) {
    console.warn('⚠️  RAPIDAPI_KEY not configured - TripAdvisor integration will not work');
  }
  
  if (!process.env.CORS_ORIGINS) {
    console.warn('⚠️  CORS_ORIGINS not configured - using default localhost origins');
  }
});

export default app;
