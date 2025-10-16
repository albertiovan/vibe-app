/**
 * Ping/Health Check Routes
 * Simple health checks for external services
 */

import { Router, Request, Response } from 'express';

const router = Router();

/**
 * GET /api/ping/google-places
 * Health check for Google Places API
 */
router.get('/google-places', async (req: Request, res: Response) => {
  try {
    const startTime = Date.now();
    const hasApiKey = Boolean(process.env.GOOGLE_MAPS_API_KEY);
    const duration = Date.now() - startTime;

    res.json({
      service: 'Google Places API',
      status: hasApiKey ? 'configured' : 'missing_api_key',
      ok: hasApiKey,
      duration: `${duration}ms`,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    res.status(500).json({
      service: 'Google Places API',
      status: 'error',
      ok: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * GET /api/ping/all
 * Health check for all external services
 */
router.get('/all', async (req: Request, res: Response) => {
  try {
    const startTime = Date.now();
    
    const services = {
      googlePlaces: {
        name: 'Google Places API',
        configured: Boolean(process.env.GOOGLE_MAPS_API_KEY),
        status: Boolean(process.env.GOOGLE_MAPS_API_KEY) ? 'ready' : 'missing_api_key'
      }
    };
    
    const allHealthy = Object.values(services).every(service => service.configured);
    const duration = Date.now() - startTime;

    res.json({
      overall: {
        status: allHealthy ? 'healthy' : 'degraded',
        ok: allHealthy,
        duration: `${duration}ms`
      },
      services,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    res.status(500).json({
      overall: {
        status: 'error',
        ok: false
      },
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * GET /api/ping/quota
 * Check API quota status (simplified)
 */
router.get('/quota', async (req: Request, res: Response) => {
  try {
    res.json({
      service: 'Google Places API',
      quota: {
        status: 'unknown',
        note: 'Google Places quota monitoring not implemented yet'
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    });
  }
});

export default router;
