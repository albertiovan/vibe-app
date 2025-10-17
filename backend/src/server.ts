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
import pingRoutes from './routes/ping.js';
import vibeRoutes from './routes/vibe.js';
import llmRoutes from './routes/llm.js';

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

// API Routes
app.use('/api', healthRoutes);
app.use('/api/ping', pingRoutes);
app.use('/api/vibe', vibeRoutes);
app.use('/api/llm', llmRoutes);

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    name: 'Vibe API',
    version: '1.0.0',
    description: 'AI-powered activity recommendation API for Romania',
    endpoints: {
      health: '/api/health',
      metrics: '/api/metrics',
      vibeMatch: 'POST /api/vibe/match',
      quickVibeMatch: 'POST /api/vibe/quick-match',
      vibePresets: 'GET /api/vibe/presets',
      vibeOptions: 'GET /api/vibe/options',
      vibeStatus: 'GET /api/vibe/status',
      llmStatus: 'GET /api/llm/status',
      llmParseVibe: 'POST /api/llm/parse-vibe',
      llmCurate: 'POST /api/llm/curate',
      llmTestFixtures: 'GET /api/llm/test-fixtures',
      pingAll: '/api/ping/all',
      quotaStatus: '/api/ping/quota'
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
  
  // Warn if optional env vars are missing (legacy TripAdvisor removed)
  // RAPIDAPI_KEY no longer required - using Google Places API exclusively
  
  if (!process.env.CORS_ORIGINS) {
    console.warn('⚠️  CORS_ORIGINS not configured - using default localhost origins');
  }
});

export default app;
