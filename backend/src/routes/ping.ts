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
 * GET /api/ping/quota
 * Get current quota status and usage information
 */
router.get('/quota', async (req: Request, res: Response) => {
  try {
    const { rapidApiClient } = await import('../clients/rapidapi.js');
    
    if (!rapidApiClient) {
      return res.status(503).json({
        success: false,
        data: {
          error: 'RapidAPI client not configured',
          quotaStatus: null,
        },
        message: 'RapidAPI client not available',
      });
    }

    const quotaStatus = rapidApiClient.getLastQuotaStatus();
    
    if (!quotaStatus) {
      return res.status(200).json({
        success: true,
        data: {
          message: 'No quota data available yet - make an API call first',
          quotaStatus: null,
        },
        message: 'Quota status not available',
      });
    }

    // Determine overall health based on quota levels
    const monthlyHealthy = quotaStatus.monthly.remaining > 1000;
    const rateHealthy = quotaStatus.rate.remaining > 5;
    const overallHealthy = monthlyHealthy && rateHealthy;

    res.status(overallHealthy ? 200 : 503).json({
      success: overallHealthy,
      data: {
        quotaStatus,
        health: {
          overall: overallHealthy ? 'healthy' : 'degraded',
          monthly: monthlyHealthy ? 'healthy' : 'low',
          rate: rateHealthy ? 'healthy' : 'low',
        },
        recommendations: [
          ...(quotaStatus.monthly.remaining <= 10000 ? ['Consider upgrading plan or reducing API usage'] : []),
          ...(quotaStatus.rate.remaining <= 10 ? ['Rate limit approaching - requests may be throttled'] : []),
          ...(quotaStatus.monthly.usagePercent >= 80 ? ['Monthly quota usage is high - monitor closely'] : []),
        ],
      },
      message: overallHealthy 
        ? 'Quota levels are healthy' 
        : 'Quota levels require attention',
    });

  } catch (error) {
    console.error('Quota status endpoint error:', error);
    
    res.status(500).json({
      success: false,
      data: {
        error: error instanceof Error ? error.message : 'Unknown error',
        quotaStatus: null,
      },
      message: 'Internal server error getting quota status',
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

/**
 * GET /api/ping/test-alerts
 * Test the quota alert system with simulated data
 */
router.get('/test-alerts', async (req: Request, res: Response) => {
  try {
    const { rapidApiClient } = await import('../clients/rapidapi.js');
    
    if (!rapidApiClient) {
      return res.status(503).json({
        success: false,
        message: 'RapidAPI client not configured',
      });
    }

    console.log('🧪 Testing Quota Alert System\n');

    // Test 1: Rate Limit Warning
    console.log('1️⃣ Testing Rate Limit Warning (5 remaining)...');
    rapidApiClient.monitorQuotaUsage({
      'x-ratelimit-requests-limit': '50',
      'x-ratelimit-requests-remaining': '5',
      'x-ratelimit-rapid-free-plans-hard-limit-limit': '500000',
      'x-ratelimit-rapid-free-plans-hard-limit-remaining': '450000'
    });

    // Test 2: Rate Limit Critical
    setTimeout(() => {
      console.log('\n2️⃣ Testing Rate Limit Critical (2 remaining)...');
      rapidApiClient.monitorQuotaUsage({
        'x-ratelimit-requests-limit': '50',
        'x-ratelimit-requests-remaining': '2',
        'x-ratelimit-rapid-free-plans-hard-limit-limit': '500000',
        'x-ratelimit-rapid-free-plans-hard-limit-remaining': '450000'
      });
    }, 500);

    // Test 3: Monthly Quota Warning
    setTimeout(() => {
      console.log('\n3️⃣ Testing Monthly Quota Warning (5000 remaining)...');
      rapidApiClient.monitorQuotaUsage({
        'x-ratelimit-requests-limit': '50',
        'x-ratelimit-requests-remaining': '45',
        'x-ratelimit-rapid-free-plans-hard-limit-limit': '500000',
        'x-ratelimit-rapid-free-plans-hard-limit-remaining': '5000'
      });
    }, 1000);

    // Test 4: Monthly Quota Critical
    setTimeout(() => {
      console.log('\n4️⃣ Testing Monthly Quota Critical (500 remaining)...');
      rapidApiClient.monitorQuotaUsage({
        'x-ratelimit-requests-limit': '50',
        'x-ratelimit-requests-remaining': '45',
        'x-ratelimit-rapid-free-plans-hard-limit-limit': '500000',
        'x-ratelimit-rapid-free-plans-hard-limit-remaining': '500'
      });
    }, 1500);

    res.json({
      success: true,
      message: 'Alert tests triggered - check server logs and logs/quota-alerts.log file',
      tests: [
        'Rate Limit Warning (5 remaining)',
        'Rate Limit Critical (2 remaining)', 
        'Monthly Quota Warning (5000 remaining)',
        'Monthly Quota Critical (500 remaining)'
      ]
    });

  } catch (error) {
    console.error('Test alerts endpoint error:', error);
    
    res.status(500).json({
      success: false,
      message: 'Error running alert tests',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

export default router;
