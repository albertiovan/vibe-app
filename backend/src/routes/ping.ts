/**
 * Ping/Health Check Routes
 * Provides endpoints to test external API connectivity
 */

import { Router, Request, Response } from 'express';
import { TripAdvisorService } from '../services/tripAdvisorService.js';

const router = Router();
const tripAdvisorService = new TripAdvisorService();

/**
 * GET /api/ping/tripadvisor
 * Health check for TripAdvisor API connectivity
 */
router.get('/tripadvisor', async (req: Request, res: Response) => {
  try {
    const startTime = Date.now();
    const pingResult = await tripAdvisorService.ping();
    const duration = Date.now() - startTime;

    // Log the ping result (development only)
    if (process.env.NODE_ENV !== 'production') {
      console.log('🏓 TripAdvisor ping result:', {
        ok: pingResult.ok,
        duration: `${duration}ms`,
        provider: pingResult.provider,
        quotaHeaders: pingResult.quotaHeaders,
      });
    }

    // Return appropriate HTTP status based on ping result
    const statusCode = pingResult.ok ? 200 : 503;
    
    res.status(statusCode).json({
      success: pingResult.ok,
      data: {
        ...pingResult,
        duration: `${duration}ms`,
      },
      message: pingResult.ok 
        ? 'TripAdvisor API is accessible' 
        : 'TripAdvisor API is not accessible',
    });

  } catch (error) {
    console.error('Ping endpoint error:', error);
    
    res.status(500).json({
      success: false,
      data: {
        ok: false,
        provider: 'TripAdvisor (travel-advisor.p.rapidapi.com)',
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      message: 'Internal server error during ping',
    });
  }
});

/**
 * GET /api/ping/all
 * Health check for all external APIs
 */
router.get('/all', async (req: Request, res: Response) => {
  try {
    const startTime = Date.now();
    
    // Test all external APIs
    const [tripAdvisorResult] = await Promise.allSettled([
      tripAdvisorService.ping(),
    ]);

    const duration = Date.now() - startTime;

    const results = {
      tripadvisor: tripAdvisorResult.status === 'fulfilled' 
        ? tripAdvisorResult.value 
        : { 
            ok: false, 
            provider: 'TripAdvisor', 
            timestamp: new Date().toISOString(),
            error: tripAdvisorResult.reason?.message || 'Promise rejected',
          },
    };

    const allOk = Object.values(results).every(result => result.ok);

    res.status(allOk ? 200 : 503).json({
      success: allOk,
      data: {
        ...results,
        duration: `${duration}ms`,
        summary: {
          total: 1,
          healthy: Object.values(results).filter(r => r.ok).length,
          unhealthy: Object.values(results).filter(r => !r.ok).length,
        },
      },
      message: allOk 
        ? 'All external APIs are accessible' 
        : 'Some external APIs are not accessible',
    });

  } catch (error) {
    console.error('Ping all endpoint error:', error);
    
    res.status(500).json({
      success: false,
      data: {
        error: error instanceof Error ? error.message : 'Unknown error',
        duration: '0ms',
      },
      message: 'Internal server error during ping all',
    });
  }
});

export default router;
