/**
 * Weather-Aware Pipeline Routes
 * New endpoints using the comprehensive weather/travel pipeline
 */

import { Router, Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
// LAZY IMPORTS: Don't import LLM services at module level to avoid config loading during import

const router = Router();

/**
 * POST /api/weather/claude-search  
 * Claude-first recommendation engine with API verification
 */
router.post('/claude-search', [
  body('vibe').isString().isLength({ min: 3, max: 500 }).withMessage('Vibe must be 3-500 characters'),
  body('location.lat').isFloat({ min: -90, max: 90 }).withMessage('Valid latitude required'),
  body('location.lng').isFloat({ min: -180, max: 180 }).withMessage('Valid longitude required'),
  body('location.city').optional().isString(),
  body('location.country').optional().isString()
], async (req: Request, res: Response): Promise<void> => {
  try {
    // Validate input
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors.array()
      });
      return;
    }

    const { vibe, location } = req.body;
    
    console.log('🧠 Claude-first search:', {
      vibe: vibe.slice(0, 50),
      location: location.city || 'Unknown'
    });

    // LAZY IMPORT: Load Claude service only when needed (after environment is loaded)
    const { SimpleClaudeRecommender } = await import('../services/llm/simpleClaudeRecommender.js');
    
    // Execute simple Claude recommender
    const claudeRecommender = new SimpleClaudeRecommender();
    const recommendations = await claudeRecommender.getRecommendations(vibe);
    const apiResponse = claudeRecommender.formatForAPI(recommendations, vibe);

    res.json(apiResponse);

  } catch (error) {
    console.error('❌ Claude-first search error:', error);
    res.status(500).json({
      success: false,
      error: 'Claude-first search failed',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * POST /api/weather/vibe-search
 * Weather/travel-aware vibe search with exactly 5 diverse results
 */
router.post('/vibe-search', [
  body('vibe').isString().isLength({ min: 3, max: 500 }).withMessage('Vibe must be 3-500 characters'),
  body('location.lat').isFloat({ min: -90, max: 90 }).withMessage('Valid latitude required'),
  body('location.lng').isFloat({ min: -180, max: 180 }).withMessage('Valid longitude required'),
  body('location.city').optional().isString(),
  body('location.country').optional().isString(),
  body('willingToTravel').optional().isBoolean(),
  body('maxTravelMinutes').optional().isInt({ min: 5, max: 240 })
], async (req: Request, res: Response): Promise<void> => {
  try {
    // Validate input
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors.array()
      });
      return;
    }

    const { vibe, location, willingToTravel = false, maxTravelMinutes = 60 } = req.body;
    
    console.log('🌤️ Weather-aware vibe search:', {
      vibe: vibe.slice(0, 50),
      location: location.city || 'Unknown',
      willingToTravel,
      maxTravelMinutes
    });

    // LAZY IMPORT: Load weather pipeline only when needed
    const { WeatherTravelPipeline } = await import('../services/pipeline/weatherTravelPipeline.js');
    
    // Execute weather/travel pipeline
    const pipeline = new WeatherTravelPipeline();
    const result = await pipeline.execute(vibe, location, {
      willingToTravel,
      maxTravelMinutes
    });

    // Transform to API response format
    const response = {
      success: true,
      data: {
        vibe,
        location,
        topFive: result.topFive.map(item => ({
          id: item.id,
          name: item.name,
          rating: item.rating,
          location: item.location,
          region: item.regionName,
          distance: item.distanceKm,
          travelTime: item.travelMinutes,
          weatherSuitability: item.weatherSuitabilityScore,
          weatherHint: item.weatherHint,
          bucket: item.bucket,
          source: item.source,
          highlights: [
            ...(item.rating ? [`${item.rating}⭐ rated`] : []),
            ...(item.distanceKm < 5 ? ['Nearby'] : []),
            ...(item.weatherSuitabilityScore > 0.8 ? ['Perfect weather'] : [])
          ]
        })),
        curation: {
          clusters: result.curationSpec.clusters,
          summaries: result.curationSpec.summaries,
          rationale: result.curationSpec.rationale
        },
        context: {
          weather: result.context.currentWeather ? {
            temperature: result.context.currentWeather.temperature,
            conditions: result.context.currentWeather.conditions,
            recommendation: result.context.currentWeather.recommendation || 'outdoor'
          } : null,
          willingToTravel: result.context.willingToTravel,
          destinationForecasts: Array.from(result.context.destinationForecasts.entries()).map(([region, forecast]) => ({
            region,
            forecast: forecast?.next72h || null
          }))
        },
        guardrails: result.guardrailsApplied,
        timestamp: new Date().toISOString()
      }
    };

    res.json(response);

  } catch (error) {
    console.error('❌ Weather vibe search error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * POST /api/weather/quick-search
 * Simplified weather-aware search
 */
router.post('/quick-search', [
  body('vibe').isString().isLength({ min: 3, max: 200 }),
  body('lat').isFloat({ min: -90, max: 90 }),
  body('lng').isFloat({ min: -180, max: 180 })
], async (req: Request, res: Response): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors.array()
      });
      return;
    }

    const { vibe, lat, lng } = req.body;
    
    // LAZY IMPORT: Load weather pipeline only when needed
    const { WeatherTravelPipeline } = await import('../services/pipeline/weatherTravelPipeline.js');
    
    const pipeline = new WeatherTravelPipeline();
    const result = await pipeline.execute(vibe, { lat, lng }, {
      willingToTravel: false,
      maxTravelMinutes: 30
    });

    res.json({
      success: true,
      data: {
        topFive: result.topFive.map(item => ({
          name: item.name,
          rating: item.rating,
          distance: item.distanceKm,
          weatherHint: item.weatherHint,
          bucket: item.bucket
        })),
        guardrails: result.guardrailsApplied
      }
    });

  } catch (error) {
    console.error('❌ Quick weather search error:', error);
    res.status(500).json({
      success: false,
      error: 'Search failed'
    });
  }
});

export default router;
