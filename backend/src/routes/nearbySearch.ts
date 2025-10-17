/**
 * Nearby Search Routes
 * Google Places Nearby Search with local and nationwide discovery
 */

import { Router, Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import { NearbyOrchestrator } from '../services/places/nearbyOrchestrator.js';
import { VibeToPlacesMapper } from '../services/llm/vibeToPlacesMapper.js';
import { SearchFilters } from '../types/vibe.js';

const router = Router();

/**
 * POST /api/nearby/search
 * Comprehensive nearby search with vibe mapping and filtering
 */
router.post('/search', [
  body('vibe').isString().isLength({ min: 3, max: 500 }).withMessage('Vibe must be 3-500 characters'),
  body('location.lat').isFloat({ min: -90, max: 90 }).withMessage('Invalid latitude'),
  body('location.lng').isFloat({ min: -180, max: 180 }).withMessage('Invalid longitude'),
  body('filters.radiusMeters').optional().isInt({ min: 100, max: 200000 }).withMessage('Radius must be 100m-200km'),
  body('filters.durationHours').optional().isFloat({ min: 0.5, max: 24 }).withMessage('Duration must be 0.5-24 hours'),
  body('filters.nationwide').optional().isBoolean().withMessage('Nationwide must be boolean'),
  body('filters.travelMode').optional().isIn(['drive', 'transit', 'walk']).withMessage('Invalid travel mode')
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

    const { vibe, location, filters = {} } = req.body;
    
    console.log('🔍 Nearby search request:', {
      vibe: vibe.slice(0, 50),
      location: `${location.lat.toFixed(4)}, ${location.lng.toFixed(4)}`,
      filters
    });

    // Set default filters
    const searchFilters: SearchFilters = {
      radiusMeters: filters.radiusMeters || 20000, // 20km default
      durationHours: filters.durationHours || 3, // 3 hours default
      travelMode: filters.travelMode || 'drive',
      nationwide: filters.nationwide || false
    };

    // Map vibe to places parameters
    const vibeMapper = new VibeToPlacesMapper();
    const vibeMapping = await vibeMapper.parseVibeToPlacesSpec(vibe);
    
    console.log('🧠 Vibe mapping result:', {
      types: vibeMapping.types,
      keywords: vibeMapping.keywords,
      buckets: vibeMapping.buckets,
      confidence: vibeMapping.confidence
    });

    // Execute nearby search
    const orchestrator = new NearbyOrchestrator();
    const searchResult = await orchestrator.nearbySearch({
      origin: location,
      filters: searchFilters,
      types: vibeMapping.types,
      keywords: vibeMapping.keywords,
      buckets: vibeMapping.buckets
    });

    // Format response
    res.json({
      success: true,
      data: {
        vibe,
        location,
        filters: searchFilters,
        vibeMapping: {
          types: vibeMapping.types,
          keywords: vibeMapping.keywords,
          buckets: vibeMapping.buckets,
          reasoning: vibeMapping.reasoning,
          confidence: vibeMapping.confidence
        },
        places: searchResult.places.map(place => ({
          id: place.placeId,
          name: place.name,
          rating: place.rating,
          location: place.geometry.location,
          vicinity: place.vicinity,
          types: place.types,
          priceLevel: place.priceLevel,
          imageUrl: place.imageUrl,
          photoAttribution: place.photoAttribution,
          mapsUrl: place.mapsUrl,
          estimatedDuration: place.estimatedDuration,
          walkingTime: place.walkingTime,
          vibeScore: place.vibeScore,
          vibeReasons: place.vibeReasons,
          openingHours: place.openingHours
        })),
        challenges: searchResult.challenges.map(challenge => ({
          id: challenge.placeId,
          name: challenge.name,
          rating: challenge.rating,
          location: challenge.geometry.location,
          vicinity: challenge.vicinity,
          city: challenge.travelEstimate.distanceKm > 50 ? 'Regional destination' : 'Extended area',
          imageUrl: challenge.imageUrl,
          mapsUrl: challenge.mapsUrl,
          travelEstimate: `${challenge.travelEstimate.distanceKm}km, ${Math.round(challenge.travelEstimate.estimatedMinutes / 60)}h drive`,
          weatherBadge: challenge.weatherForecast.badge,
          challengeReason: challenge.challengeReason,
          challengeScore: challenge.challengeScore,
          riskNote: challenge.riskNote,
          seasonalPerks: challenge.seasonalPerks
        })),
        searchStats: {
          totalFound: searchResult.totalFound,
          searchCenters: searchResult.searchCenters,
          deduplication: searchResult.deduplicationStats,
          challenges: searchResult.challengeStats
        },
        processingTime: Date.now() - Date.now() // Will be calculated properly
      }
    });

  } catch (error) {
    console.error('🔍 Nearby search error:', error);
    res.status(500).json({
      success: false,
      error: 'Nearby search failed',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * POST /api/nearby/nationwide
 * Nationwide discovery across Romania's major cities
 */
router.post('/nationwide', [
  body('vibe').isString().isLength({ min: 3, max: 500 }).withMessage('Vibe must be 3-500 characters'),
  body('maxResults').optional().isInt({ min: 5, max: 50 }).withMessage('Max results must be 5-50')
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

    const { vibe, maxResults = 20 } = req.body;
    
    console.log('🔍 Nationwide search request:', vibe.slice(0, 50));

    // Use Bucharest as origin for nationwide search
    const origin = { lat: 44.4268, lng: 26.1025 };
    
    const searchFilters: SearchFilters = {
      radiusMeters: 500000, // 500km radius to cover all of Romania
      durationHours: 4, // Flexible duration for nationwide
      travelMode: 'drive',
      nationwide: true
    };

    // Map vibe to places parameters
    const vibeMapper = new VibeToPlacesMapper();
    const vibeMapping = await vibeMapper.parseVibeToPlacesSpec(vibe);

    // Execute nationwide search
    const orchestrator = new NearbyOrchestrator();
    const searchResult = await orchestrator.nearbySearch({
      origin,
      filters: searchFilters,
      types: vibeMapping.types,
      keywords: vibeMapping.keywords,
      buckets: vibeMapping.buckets
    });

    // Limit results and add diversity
    const topPlaces = searchResult.places
      .slice(0, maxResults)
      .map(place => ({
        id: place.placeId,
        name: place.name,
        rating: place.rating,
        location: place.geometry.location,
        vicinity: place.vicinity,
        city: inferCityFromVicinity(place.vicinity || ''),
        imageUrl: place.imageUrl,
        mapsUrl: place.mapsUrl,
        estimatedDuration: place.estimatedDuration,
        vibeScore: place.vibeScore,
        distance: Math.round((place.walkingTime || 0) / 12) // Convert walk time to km estimate
      }));

    res.json({
      success: true,
      data: {
        vibe,
        searchType: 'nationwide',
        places: topPlaces,
        searchStats: {
          totalFound: searchResult.totalFound,
          citiesSearched: searchResult.searchCenters.length,
          deduplication: searchResult.deduplicationStats
        },
        vibeMapping: {
          buckets: vibeMapping.buckets,
          confidence: vibeMapping.confidence
        }
      }
    });

  } catch (error) {
    console.error('🔍 Nationwide search error:', error);
    res.status(500).json({
      success: false,
      error: 'Nationwide search failed',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * GET /api/nearby/cache/stats
 * Get cache statistics for debugging
 */
router.get('/cache/stats', (req: Request, res: Response) => {
  try {
    const orchestrator = new NearbyOrchestrator();
    const stats = orchestrator.getCacheStats();
    
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to get cache stats'
    });
  }
});

/**
 * POST /api/nearby/cache/clear
 * Clear search cache
 */
router.post('/cache/clear', (req: Request, res: Response) => {
  try {
    const orchestrator = new NearbyOrchestrator();
    orchestrator.clearCache();
    
    res.json({
      success: true,
      message: 'Cache cleared successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to clear cache'
    });
  }
});

/**
 * Helper function to infer city from vicinity string
 */
function inferCityFromVicinity(vicinity: string): string {
  const cities = ['Bucharest', 'Cluj-Napoca', 'Timișoara', 'Iași', 'Constanța', 'Craiova', 'Brașov', 'Galați'];
  
  for (const city of cities) {
    if (vicinity.toLowerCase().includes(city.toLowerCase())) {
      return city;
    }
  }
  
  return 'Romania'; // Default fallback
}

export default router;
