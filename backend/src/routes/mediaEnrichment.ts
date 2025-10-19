/**
 * Media & Enrichment API Routes
 * 
 * Provides endpoints for testing and managing media/enrichment services
 */

import { Router, Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import { mediaEnrichmentOrchestrator } from '../services/orchestrator/mediaEnrichment.js';
import { youtubeService } from '../services/media/youtube.js';
import { tavilyService } from '../services/enrichment/tavily.js';
import { wikipediaService } from '../services/enrichment/wikipedia.js';
import { validateIntegrationConfig } from '../config/integrations.js';
import { sharedCache } from '../services/shared/cache.js';
import { getRateLimiterStats } from '../services/shared/httpClient.js';

const router = Router();

/**
 * Get enrichment services status
 */
router.get('/status', async (req: Request, res: Response) => {
  try {
    const config = validateIntegrationConfig();
    const stats = await mediaEnrichmentOrchestrator.getEnrichmentStats();
    const validation = await mediaEnrichmentOrchestrator.validateServices();
    
    res.json({
      success: true,
      data: {
        configuration: config,
        services: stats.services,
        features: stats.features,
        validation,
        cache: sharedCache.getStats(),
        rateLimiters: getRateLimiterStats()
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to get enrichment status',
      details: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
});


/**
 * Test YouTube video search
 */
router.post('/test/youtube', [
  body('activity').isString().isLength({ min: 2, max: 100 }),
  body('region').optional().isString().isLength({ max: 50 })
], async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Invalid parameters',
        details: errors.array()
      });
    }

    const { activity, region } = req.body;
    
    const result = await youtubeService.searchActivityVideos(activity, region, { maxResults: 3 });
    
    if (result.ok) {
      res.json({
        success: true,
        data: {
          query: activity,
          region,
          videos: result.videos.map(video => ({
            id: video.id,
            title: video.title,
            channel: video.channel.name,
            duration: video.duration,
            viewCount: video.viewCount,
            relevanceScore: video.relevanceScore,
            url: video.url,
            thumbnail: video.thumbnail
          })),
          count: result.videos.length
        }
      });
    } else {
      res.status(400).json({
        success: false,
        error: result.error
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'YouTube test failed',
      details: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
});

/**
 * Test Tavily web search
 */
router.post('/test/tavily', [
  body('query').isString().isLength({ min: 3, max: 200 }),
  body('maxResults').optional().isInt({ min: 1, max: 10 })
], async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Invalid parameters',
        details: errors.array()
      });
    }

    const { query, maxResults = 5 } = req.body;
    
    const result = await tavilyService.webSearch(query, { maxResults });
    
    if (result.ok) {
      const extracted = tavilyService.extractVenueSuggestions(result.data.results);
      
      res.json({
        success: true,
        data: {
          query,
          results: result.data.results.map(r => ({
            title: r.title,
            url: r.url,
            content: r.content.substring(0, 200) + '...',
            score: r.score
          })),
          extracted: {
            venues: extracted.venueNames.slice(0, 5),
            keywords: extracted.keywords.slice(0, 10),
            tips: extracted.tips.slice(0, 3)
          },
          answer: result.data.answer
        }
      });
    } else {
      res.status(400).json({
        success: false,
        error: result.error
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Tavily test failed',
      details: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
});

/**
 * Test Wikipedia summary
 */
router.post('/test/wikipedia', [
  body('activity').isString().isLength({ min: 2, max: 100 })
], async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Invalid parameters',
        details: errors.array()
      });
    }

    const { activity } = req.body;
    
    const result = await wikipediaService.getSummary(activity);
    
    if (result.ok) {
      const activityInfo = {
        definition: result.summary.extract.split('.')[0] + '.',
        benefits: [],
        equipment: []
      };
      
      res.json({
        success: true,
        data: {
          query: activity,
          summary: {
            title: result.summary.title,
            extract: result.summary.extract,
            url: result.summary.url,
            thumbnail: result.summary.thumbnail
          },
          extracted: activityInfo
        }
      });
    } else {
      res.status(400).json({
        success: false,
        error: result.error
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Wikipedia test failed',
      details: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
});

/**
 * Test full enrichment pipeline
 */
router.post('/test/enrich', [
  body('activity').isObject(),
  body('activity.name').isString().isLength({ min: 2, max: 100 }),
  body('activity.category').isString().isLength({ min: 2, max: 50 }),
  body('activity.places').isArray(),
  body('options').optional().isObject()
], async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Invalid parameters',
        details: errors.array()
      });
    }

    const { activity, options = {} } = req.body;
    
    // Add required fields
    const testActivity = {
      id: `test_${Date.now()}`,
      ...activity
    };
    
    const enriched = await mediaEnrichmentOrchestrator.enrichActivity(testActivity, options);
    
    res.json({
      success: true,
      data: {
        original: testActivity,
        enriched: {
          ...enriched,
          // Truncate large fields for response
          tutorialVideos: enriched.tutorialVideos?.map(v => ({
            title: v.title,
            channel: v.channel.name,
            duration: v.duration,
            url: v.url,
            relevanceScore: v.relevanceScore
          })),
          activityInfo: enriched.activityInfo ? {
            title: enriched.activityInfo.title,
            extract: enriched.activityInfo.extract.substring(0, 200) + '...',
            url: enriched.activityInfo.url
          } : undefined
        },
        enrichmentSources: enriched.enrichmentSources,
        processingTime: Date.now() - enriched.enrichedAt
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Enrichment test failed',
      details: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
});

/**
 * Clear enrichment cache
 */
router.post('/cache/clear', async (req: Request, res: Response) => {
  try {
    const beforeStats = sharedCache.getStats();
    sharedCache.clear();
    const afterStats = sharedCache.getStats();
    
    res.json({
      success: true,
      message: 'Cache cleared successfully',
      data: {
        before: beforeStats,
        after: afterStats,
        cleared: beforeStats.size
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to clear cache'
    });
  }
});

/**
 * Get cache statistics
 */
router.get('/cache/stats', async (req: Request, res: Response) => {
  try {
    const cacheStats = sharedCache.getStats();
    const rateLimiterStats = getRateLimiterStats();
    
    res.json({
      success: true,
      data: {
        cache: cacheStats,
        rateLimiters: rateLimiterStats,
        timestamp: Date.now()
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to get cache stats'
    });
  }
});

export default router;
