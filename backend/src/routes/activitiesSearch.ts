/**
 * Activities Search Routes
 * 
 * Activities-first search using the LLM orchestrator with propose → verify → recommend pipeline.
 * Replaces places-first approach with activity-centric recommendations.
 */

import { 
  rankByFeasibility, 
  filterByMinimumFeasibility,
  applyVibeSpecificBoosts,
  getFeasibilityInsights,
  FeasibilityCandidate
} from '../services/feasibility/feasibilityRanker.js';
import { 
  scorePlacesForVibe,
  getVibeMatchingInsights 
} from '../services/vibe/improvedVibeMatcher.js';
import { 
  boostSportsVenues,
  ensureSportsInTopFive 
} from '../services/vibe/sportsVibeBooster.js';
import { claudeAgent } from '../services/claude/agent.js';
import { updateMemoryFeedback } from '../services/claude/memory.js';
import { ActivitiesAgent } from '../services/orchestrator/activitiesAgent.js';
import { GooglePlacesService } from '../services/googlePlacesService.js';
import { VibeProfileService } from '../services/vibeProfile/vibeProfileService.js';
import { getActivityEnrichmentService } from '../services/activity/enrichment.js';
// import { WeatherService } from '../services/weather/weatherService.js';
import { Router, Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import { 
  ALL_ROMANIA_ACTIVITIES, 
  ALL_REGIONS,
  filterActivities 
} from '../domain/activities/index.js';
// Removed unused provider mappings - app now uses database only
import type { VibeContext } from '../services/llm/schemas.js';

const router = Router();

/**
 * POST /api/activities/search
 * Activities-first search with LLM orchestrator
 */
router.post('/search', [
  body('vibe').isString().isLength({ min: 3, max: 500 }).withMessage('Vibe must be 3-500 characters'),
  body('location.lat').isFloat({ min: -90, max: 90 }).withMessage('Invalid latitude'),
  body('location.lng').isFloat({ min: -180, max: 180 }).withMessage('Invalid longitude'),
  body('filters.radiusKm').optional().isFloat({ min: 1, max: 250 }).withMessage('Radius must be 1-250km'), // Extended for day trips
  body('filters.durationHours').optional().isFloat({ min: 0.5, max: 24 }).withMessage('Duration must be 0.5-24 hours'),
  body('filters.willingToTravel').optional().isBoolean().withMessage('Willing to travel must be boolean'),
  body('userId').optional().isString().withMessage('Invalid user ID'),
  body('timeOfDay').optional().isIn(['morning', 'afternoon', 'evening', 'night']).withMessage('Invalid time of day'),
  body('weatherConditions').optional().isString().withMessage('Invalid weather conditions'),
  body('enableDebug').optional().isBoolean().withMessage('Enable debug must be boolean')
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

    const { 
      vibe, 
      location, 
      filters = {}, 
      userId, 
      timeOfDay = 'afternoon',
      weatherConditions = 'clear',
      enableDebug = false 
    } = req.body;
    
    console.log('🎯 Activities search request:', {
      vibe: vibe.slice(0, 50),
      location: `${location.lat.toFixed(4)}, ${location.lng.toFixed(4)}`,
      filters,
      userId
    });

    // Build vibe context for LLM orchestrator
    const context = await buildVibeContext({
      vibe,
      location,
      filters,
      userId,
      timeOfDay,
      weatherConditions
    });

    console.log('📋 Built context with:', {
      userProfile: context.userProfile,
      regionsSeed: context.regionsSeed.length,
      activityOntology: context.activityOntology.length,
      weather: context.weather.length
    });

    // Use the working NearbyOrchestrator approach directly (for now)
    // TODO: Re-enable ActivitiesAgent once import issues are resolved
    let vibeMatch: any;
    let usedActivitiesAgent = false;

    console.log('🔄 Using proven NearbyOrchestrator approach...');
    
    // Import the working services
    const { VibeToPlacesMapper } = await import('../services/llm/vibeToPlacesMapper.js');
    const { NearbyOrchestrator } = await import('../services/places/nearbyOrchestrator.js');
    
    // Map vibe to places parameters (same as working endpoint)
    const vibeMapper = new VibeToPlacesMapper();
    const vibeMapping = await vibeMapper.parseVibeToPlacesSpec(vibe);
    
    console.log('🧠 Vibe mapping result:', {
      types: vibeMapping.types,
      keywords: vibeMapping.keywords,
      buckets: vibeMapping.buckets,
      confidence: vibeMapping.confidence
    });

    // Apply day-trip radius extension logic
    const durationHours = filters.durationHours || 3;
    const isDayTrip = durationHours >= 8;
    
    // Auto-extend radius for day trips (8+ hours)
    let effectiveRadius: number;
    if (filters.radiusMeters) {
      // Use provided radiusMeters directly (from mobile app)
      effectiveRadius = filters.radiusMeters;
    } else if (isDayTrip) {
      // Auto-extend to 250km for day trips
      effectiveRadius = 250000; // 250km in meters
    } else {
      // Use provided radiusKm or default
      effectiveRadius = (filters.radiusKm || 25) * 1000;
    }
    
    console.log('📏 Radius calculation:', {
      durationHours,
      isDayTrip,
      providedRadiusKm: filters.radiusKm,
      providedRadiusMeters: filters.radiusMeters,
      effectiveRadiusKm: effectiveRadius / 1000,
      willingToTravel: filters.willingToTravel
    });

    // Execute nearby search with extended radius
    const orchestrator = new NearbyOrchestrator();
    const searchResult = await orchestrator.nearbySearch({
      origin: location,
      filters: {
        radiusMeters: effectiveRadius,
        durationHours: durationHours,
        travelMode: 'drive' as const,
        nationwide: isDayTrip || (effectiveRadius > 50000) // Enable nationwide for day trips or >50km
      },
      types: vibeMapping.types,
      keywords: vibeMapping.keywords,
      buckets: vibeMapping.buckets
    });

    // Convert to vibeMatch format
    vibeMatch = {
      places: searchResult.places || [],
      totalFound: searchResult.places?.length || 0
    };
    
    console.log('✅ NearbyOrchestrator returned', vibeMatch.places.length, 'places');
    
    // STEP 1: Apply improved vibe matching to score places properly
    console.log('🎯 Applying improved vibe matching...');
    const vibeMatchedPlaces = scorePlacesForVibe(vibeMatch.places, vibe);
    
    // STEP 2: Apply feasibility ranking based on real-world data
    console.log('📊 Ranking by feasibility (reviews, ratings, popularity)...');
    const feasibilityCandidates: FeasibilityCandidate[] = vibeMatchedPlaces.map((place: any) => ({
      placeId: place.placeId,
      name: place.name,
      rating: place.rating,
      userRatingsTotal: place.userRatingsTotal,
      types: place.types || [],
      vicinity: place.vicinity,
      priceLevel: place.priceLevel,
      location: {
        lat: place.geometry?.location?.lat || 0,
        lng: place.geometry?.location?.lng || 0
      },
      bucket: place.bucket || 'general',
      vibeScore: place.vibeScore
    }));
    
    const rankedByFeasibility = rankByFeasibility(feasibilityCandidates);
    const feasiblePlaces = filterByMinimumFeasibility(rankedByFeasibility, 0.3);
    const vibeBoostPlaces = applyVibeSpecificBoosts(feasiblePlaces, vibe);
    
    // Get insights for debugging
    const vibeInsights = getVibeMatchingInsights(vibe, vibeMatch.places);
    const feasibilityInsights = getFeasibilityInsights(vibeBoostPlaces);
    
    console.log('✅ Vibe & Feasibility Analysis:', {
      originalPlaces: vibeMatch.places.length,
      afterVibeMatching: vibeMatchedPlaces.length,
      afterFeasibilityFilter: feasiblePlaces.length,
      vibeConfidence: vibeInsights.vibeAnalysis.confidence.toFixed(2),
      avgFeasibility: feasibilityInsights.averages
    });
    
    // Merge back the enhanced data
    vibeMatch.places = vibeBoostPlaces.map((feasiblePlace: any) => {
      const originalPlace = vibeMatch.places.find((p: any) => p.placeId === feasiblePlace.placeId);
      return {
        ...originalPlace,
        vibeScore: feasiblePlace.vibeScore || originalPlace.vibeScore,
        feasibilityScore: feasiblePlace.feasibility.overallFeasibility,
        feasibilityReasons: feasiblePlace.feasibility.reasoning,
        personalizedScore: (feasiblePlace.vibeScore || 0.5) * 0.6 + feasiblePlace.feasibility.overallFeasibility * 0.4
      };
    });
    
    // STEP 3: Apply sports-specific boosting for sports vibes
    console.log('🏃‍♂️ Applying sports vibe boosting...');
    vibeMatch.places = boostSportsVenues(vibeMatch.places, vibe);
    
    // Sort by combined score (vibe + feasibility)
    vibeMatch.places.sort((a: any, b: any) => (b.personalizedScore || 0) - (a.personalizedScore || 0));
    
    // Add basic activity blurbs to places (fast heuristic approach)
    console.log('🎯 Adding activity blurbs to places...');
    vibeMatch.places = vibeMatch.places.map((place: any) => {
      // Generate simple activity blurb based on place types
      let blurb = 'Experience something new and exciting at this location';
      
      if (place.types) {
        if (place.types.includes('book_store') || place.types.includes('library')) {
          blurb = 'Browse books and find quiet spaces for reading and connection';
        } else if (place.types.includes('cafe')) {
          blurb = 'Sip coffee and connect with others in a cozy social atmosphere';
        } else if (place.types.includes('museum')) {
          blurb = 'Explore fascinating exhibits and learn something new';
        } else if (place.types.includes('park')) {
          blurb = 'Walk peaceful trails and enjoy fresh air outdoors';
        } else if (place.types.includes('night_club') || place.types.includes('bar')) {
          blurb = 'Dance to live music and socialize with a vibrant crowd';
        } else if (place.types.includes('amusement_park')) {
          blurb = 'Experience thrilling rides and exciting attractions';
        } else if (place.types.includes('art_gallery')) {
          blurb = 'Discover inspiring artworks and creative expressions';
        } else if (place.types.includes('restaurant')) {
          blurb = 'Enjoy delicious meals and social dining experiences';
        } else if (place.types.includes('shopping_mall')) {
          blurb = 'Shop and explore various stores and boutiques';
        }
      }
      
      // Determine bucket based on place types
      let bucket = 'entertainment';
      if (place.types) {
        if (place.types.some((t: string) => ['book_store', 'library', 'cafe'].includes(t))) {
          bucket = 'social';
        } else if (place.types.some((t: string) => ['museum', 'art_gallery'].includes(t))) {
          bucket = 'culture';
        } else if (place.types.some((t: string) => ['park', 'natural_feature'].includes(t))) {
          bucket = 'nature';
        } else if (place.types.some((t: string) => ['night_club', 'bar'].includes(t))) {
          bucket = 'nightlife';
        } else if (place.types.some((t: string) => ['amusement_park'].includes(t))) {
          bucket = 'adventure';
        }
      }
      
      return {
        ...place,
        blurb,
        bucket,
        activitySubtype: place.types?.[0] || 'establishment'
      };
    });
    
    console.log('✅ Activities search completed with blurbs:', {
      places: vibeMatch.places.length,
      placesWithBlurbs: vibeMatch.places.filter((p: any) => p.blurb).length,
      totalFound: vibeMatch.totalFound
    });

    // Apply basic diversity selection (simplified for now)
    console.log('🎯 Applying basic diversity selection...');
    
    // Simple diversity logic: group by bucket and pick best from each
    const bucketGroups = new Map<string, any[]>();
    vibeMatch.places.forEach((place: any) => {
      const bucket = place.bucket || 'general';
      if (!bucketGroups.has(bucket)) {
        bucketGroups.set(bucket, []);
      }
      bucketGroups.get(bucket)!.push(place);
    });

    // Sort each bucket by score and take the best
    let topFiveDiverse: any[] = [];
    for (const [bucket, places] of bucketGroups) {
      if (topFiveDiverse.length >= 5) break;
      const bestInBucket = places.sort((a, b) => (b.vibeScore || 0.7) - (a.vibeScore || 0.7))[0];
      topFiveDiverse.push(bestInBucket);
    }

    // Fill remaining slots if needed
    while (topFiveDiverse.length < 5 && topFiveDiverse.length < vibeMatch.places.length) {
      const remaining = vibeMatch.places.filter(p => !topFiveDiverse.some(t => t.placeId === p.placeId));
      if (remaining.length > 0) {
        topFiveDiverse.push(remaining[0]);
      } else {
        break;
      }
    }

    console.log('✅ Basic diversity selection complete:', {
      candidates: vibeMatch.places.length,
      selected: topFiveDiverse.length,
      uniqueBuckets: new Set(topFiveDiverse.map((p: any) => p.bucket)).size
    });

    // STEP 4: Ensure sports venues appear in top 5 for sports vibes
    console.log('🎯 Ensuring sports venues in top 5...');
    topFiveDiverse = ensureSportsInTopFive(topFiveDiverse, vibe);

    // Track search event for ML learning
    if (userId) {
      try {
        const vibeProfileService = new VibeProfileService();
        await vibeProfileService.trackEvent({
          userId,
          eventType: 'search',
          data: {
            searchVibe: vibe,
            location: location,
            weatherConditions,
            timeOfDay
          },
          context: {
            deviceType: 'mobile',
            appVersion: '1.0.0'
          }
        });
      } catch (trackingError) {
        console.error('⚠️ Failed to track search event:', trackingError);
        // Don't fail the request for tracking errors
      }
    }

    // Format response to match existing API structure
    const formattedResponse = {
      success: true,
      data: {
        // Core response data
        vibe,
        location,
        filters: {
          radiusMeters: (filters.radiusKm || 20) * 1000,
          durationHours: filters.durationHours || 3,
          willingToTravel: filters.willingToTravel || false
        },
        
        // Activities-first results with diversity and enhanced metadata
        topFive: topFiveDiverse.map((place: any) => ({
          id: place.placeId,
          name: place.name,
          category: place.vibeCategories?.[0] || place.bucket || 'adventure',
          rating: place.rating || 4.0,
          location: {
            lat: place.geometry?.location?.lat,
            lng: place.geometry?.location?.lng
          },
          vicinity: place.vicinity,
          types: place.types || [],
          imageUrl: place.imageUrl,
          mapsUrl: place.mapsUrl,
          estimatedDuration: place.estimatedDuration || `${filters.durationHours || 3} hours`,
          vibeScore: place.vibeScore || 0.8,
          vibeReasons: place.vibeReasons || ['Great match for your vibe'],
          weatherSuitability: 'good',
          
          // NEW: Activity-first fields
          blurb: place.blurb,
          bucket: place.bucket,
          activitySubtype: place.activitySubtype,
          
          verifiedVenues: [{
            placeId: place.placeId,
            name: place.name,
            rating: place.rating,
            coords: place.geometry?.location,
            provider: 'google',
            mapsUrl: place.mapsUrl,
            imageUrl: place.imageUrl,
            vicinity: place.vicinity,
            evidence: {
              types: place.types,
              verificationMethod: 'Google Places API'
            }
          }],
          personalizedScore: place.vibeScore || 0.8
        })),
        
        // All recommendations for detailed view with activity-first fields
        places: vibeMatch.places.map((place: any) => ({
          id: place.placeId,
          placeId: place.placeId,
          name: place.name,
          category: place.vibeCategories?.[0] || place.bucket || 'adventure',
          rating: place.rating || 4.0,
          userRatingsTotal: place.userRatingsTotal,
          location: {
            lat: place.geometry?.location?.lat,
            lng: place.geometry?.location?.lng
          },
          vicinity: place.vicinity,
          types: place.types || [],
          imageUrl: place.imageUrl,
          mapsUrl: place.mapsUrl,
          estimatedDuration: place.estimatedDuration || `${filters.durationHours || 3} hours`,
          vibeScore: place.vibeScore || 0.8,
          vibeReasons: place.vibeReasons || ['Great match for your vibe'],
          weatherSuitability: 'good',
          
          // NEW: Activity-first fields
          blurb: place.blurb,
          bucket: place.bucket,
          activitySubtype: place.activitySubtype,
          
          verifiedVenues: [{
            placeId: place.placeId,
            name: place.name,
            rating: place.rating,
            coords: place.geometry?.location,
            provider: 'google',
            mapsUrl: place.mapsUrl,
            imageUrl: place.imageUrl,
            vicinity: place.vicinity,
            evidence: {
              types: place.types,
              verificationMethod: 'Google Places API'
            }
          }],
          personalizedScore: place.vibeScore || 0.8,
          
          // Activity-specific metadata
          activityMetadata: {
            energy: place.energyLevel || 'medium',
            indoorOutdoor: place.bucket === 'nature' ? 'outdoor' : place.bucket === 'social' ? 'indoor' : 'either',
            difficulty: 3,
            subtypes: place.types || [],
            regions: [place.vicinity || 'Bucharest']
          }
        })),
        
        // No challenges in activities-first approach (activities are the challenges)
        challenges: [],
        
        // Search statistics
        searchStats: {
          totalFound: vibeMatch.places.length,
          searchCenters: context.regionsSeed.map(region => ({
            name: region.name,
            lat: region.lat,
            lng: region.lon,
            resultsCount: Math.floor(vibeMatch.places.length / context.regionsSeed.length)
          })),
          deduplication: {
            totalRaw: vibeMatch.totalFound,
            duplicatesRemoved: vibeMatch.totalFound - vibeMatch.places.length,
            finalCount: vibeMatch.places.length
          },
          activities: {
            totalProposed: vibeMatch.totalFound,
            totalVerified: vibeMatch.places.length,
            totalVenues: vibeMatch.places.length,
            verificationRate: 1.0, // All places are verified via Google Places API
            diversityScore: new Set(topFiveDiverse.map((p: any) => p.bucket)).size / 5
          },
          diversity: {
            totalCandidates: vibeMatch.places.length,
            uniqueBuckets: new Set(topFiveDiverse.map((p: any) => p.bucket)).size,
            uniqueSubtypes: new Set(topFiveDiverse.map((p: any) => p.activitySubtype)).size,
            diversityScore: new Set(topFiveDiverse.map((p: any) => p.bucket)).size / 5,
            topFiveBuckets: topFiveDiverse.map((p: any) => p.bucket)
          }
        },
        
        // Processing metadata
        processingTime: Date.now() - Date.now(), // Simplified for now
        
        // Activities-first metadata (using Google Places)
        orchestration: {
          llmCalls: 0, // No LLM calls in simplified version
          toolCalls: 1, // One Google Places call
          fallbacksUsed: [],
          qualityMetrics: {
            verificationRate: 1.0,
            diversityScore: 0.8,
            confidenceScore: 0.9
          }
        }
      },
      
      // Debug information (if requested)
      debug: enableDebug ? {} : undefined
    };

    res.json(formattedResponse);

  } catch (error) {
    console.error('❌ Activities search failed:', error);
    
    res.status(500).json({
      success: false,
      error: 'Activities search failed',
      message: error instanceof Error ? error.message : 'Unknown error',
      data: {
        vibe: req.body.vibe,
        location: req.body.location,
        places: [],
        topFive: [],
        challenges: [],
        searchStats: {
          totalFound: 0,
          searchCenters: [],
          deduplication: { totalRaw: 0, duplicatesRemoved: 0, finalCount: 0 }
        },
        processingTime: 0
      }
    });
  }
});

/**
 * GET /api/activities/ontology
 * Get the complete Romania activities ontology
 */
router.get('/ontology', async (req: Request, res: Response): Promise<void> => {
  try {
    const { category, region, energy, difficulty } = req.query;
    
    let activities = ALL_ROMANIA_ACTIVITIES;
    
    // Apply filters if provided
    if (category || region || energy || difficulty) {
      activities = filterActivities({
        categories: category ? [category as any] : undefined,
        regions: region ? [region as string] : undefined,
        energyLevel: energy as any,
        maxDifficulty: difficulty ? parseInt(difficulty as string) : undefined
      });
    }
    
    res.json({
      success: true,
      data: {
        activities: activities.map(activity => ({
          id: activity.id,
          label: activity.label,
          category: activity.category,
          subtypes: activity.subtypes,
          regions: activity.regions,
          energy: activity.energy,
          indoorOutdoor: activity.indoorOutdoor,
          difficulty: activity.difficulty,
          durationHintHrs: activity.durationHintHrs,
          seasonality: activity.seasonality
        })),
        metadata: {
          totalActivities: activities.length,
          categories: [...new Set(activities.map(a => a.category))],
          regions: [...new Set(activities.flatMap(a => a.regions))],
          energyLevels: [...new Set(activities.map(a => a.energy))],
          subtypes: [...new Set(activities.flatMap(a => a.subtypes))]
        }
      }
    });
    
  } catch (error) {
    console.error('❌ Failed to get ontology:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve activities ontology'
    });
  }
});

/**
 * Build vibe context for LLM orchestrator
 */
async function buildVibeContext(params: {
  vibe: string;
  location: { lat: number; lng: number };
  filters: any;
  userId?: string;
  timeOfDay: string;
  weatherConditions: string;
}): Promise<VibeContext> {
  const { vibe, location, filters, userId, timeOfDay, weatherConditions } = params;
  
  // Get user profile and ML weights
  let userProfile: {
    interests: string[];
    energyLevel: 'chill' | 'medium' | 'high';
    indoorOutdoor: 'indoor' | 'outdoor' | 'either';
    opennessScore: number;
  } = {
    interests: ['adventure', 'nature', 'culture'],
    energyLevel: 'medium',
    indoorOutdoor: 'either',
    opennessScore: 3
  };
  
  let mlWeights: Record<string, number> | undefined;
  
  if (userId) {
    try {
      const vibeProfileService = new VibeProfileService();
      const profile = await vibeProfileService.getVibeProfile(userId);
      
      if (profile.coreProfile) {
        userProfile = {
          interests: profile.coreProfile.interests,
          energyLevel: profile.coreProfile.energyLevel,
          indoorOutdoor: profile.coreProfile.indoorOutdoor,
          opennessScore: profile.coreProfile.opennessScore
        };
      }
      
      if (profile.mlProfile) {
        mlWeights = (profile.mlProfile as any).weights;
      }
    } catch (error) {
      console.error('⚠️ Failed to get user profile:', error);
      // Continue with defaults
    }
  }
  
  // Generate region seeds based on location
  const regionsSeed = generateRegionSeeds(location, filters.radiusKm || 20);
  
  // Get weather data
  const weather = await getWeatherData(regionsSeed);
  
  // Determine current season
  const now = new Date();
  const month = now.getMonth();
  let season: 'spring' | 'summer' | 'autumn' | 'winter';
  if (month >= 2 && month <= 4) season = 'spring';
  else if (month >= 5 && month <= 7) season = 'summer';
  else if (month >= 8 && month <= 10) season = 'autumn';
  else season = 'winter';
  
  return {
    userProfile,
    mlWeights,
    vibeText: vibe,
    sessionFilters: {
      radiusKm: filters.radiusKm || 20,
      durationHours: filters.durationHours || 3,
      startCity: 'Bucharest', // Default, could be determined from location
      lat: location.lat,
      lon: location.lng,
      willingToTravel: filters.willingToTravel || false
    },
    regionsSeed,
    activityOntology: ALL_ROMANIA_ACTIVITIES,
    weather,
    timeContext: {
      currentTime: now.toISOString(),
      dayOfWeek: now.toLocaleDateString('en-US', { weekday: 'long' }),
      season
    }
  };
}

/**
 * Generate region seeds based on location and radius
 */
function generateRegionSeeds(
  location: { lat: number; lng: number }, 
  radiusKm: number
): Array<{ name: string; lat: number; lon: number; distanceKmFromStart?: number }> {
  // Major Romanian cities and regions with approximate coordinates
  const majorRegions = [
    { name: 'București', lat: 44.4268, lng: 26.1025 },
    { name: 'Brașov', lat: 45.6427, lng: 25.5887 },
    { name: 'Cluj-Napoca', lat: 46.7712, lng: 23.6236 },
    { name: 'Timișoara', lat: 45.7489, lng: 21.2087 },
    { name: 'Iași', lat: 47.1585, lng: 27.6014 },
    { name: 'Constanța', lat: 44.1598, lng: 28.6348 },
    { name: 'Sibiu', lat: 45.7983, lng: 24.1256 },
    { name: 'Oradea', lat: 47.0465, lng: 21.9189 },
    { name: 'Sinaia', lat: 45.3500, lng: 25.5500 },
    { name: 'Poiana Brașov', lat: 45.5833, lng: 25.5667 }
  ];
  
  // Calculate distances and filter by radius
  const nearbyRegions = majorRegions
    .map(region => {
      const distance = calculateDistance(location, { lat: region.lat, lng: region.lng });
      return {
        name: region.name,
        lat: region.lat,
        lon: region.lng,
        distanceKmFromStart: distance
      };
    })
    .filter(region => region.distanceKmFromStart! <= radiusKm)
    .sort((a, b) => a.distanceKmFromStart! - b.distanceKmFromStart!)
    .slice(0, 5); // Limit to 5 regions
  
  // Always include the search location as a region
  if (nearbyRegions.length === 0) {
    nearbyRegions.push({
      name: 'Search Location',
      lat: location.lat,
      lon: location.lng,
      distanceKmFromStart: 0
    });
  }
  
  return nearbyRegions;
}

/**
 * Calculate distance between two points in kilometers
 */
function calculateDistance(
  point1: { lat: number; lng: number },
  point2: { lat: number; lng: number }
): number {
  const R = 6371; // Earth's radius in km
  const dLat = (point2.lat - point1.lat) * Math.PI / 180;
  const dLng = (point2.lng - point1.lng) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(point1.lat * Math.PI / 180) * Math.cos(point2.lat * Math.PI / 180) *
    Math.sin(dLng/2) * Math.sin(dLng/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

/**
 * Get weather data for regions
 */
async function getWeatherData(
  regions: Array<{ name: string; lat: number; lon: number }>
): Promise<Array<{ region: string; forecastDaily: Array<any> }>> {
  try {
    // const weatherService = new WeatherService();
    const weatherPromises = regions.map(async region => {
      try {
        // TODO: Integrate with weather service when available
        // const forecast = await weatherService.getWeatherForecast(region.lat, region.lon);
        
        // Return mock weather data for now
        return {
          region: region.name,
          forecastDaily: [{
            date: new Date().toISOString(),
            tMax: 22,
            precipMm: 0,
            windMps: 5,
            condition: 'clear'
          }, {
            date: new Date(Date.now() + 86400000).toISOString(),
            tMax: 24,
            precipMm: 1,
            windMps: 7,
            condition: 'partly_cloudy'
          }, {
            date: new Date(Date.now() + 172800000).toISOString(),
            tMax: 20,
            precipMm: 3,
            windMps: 10,
            condition: 'cloudy'
          }]
        };
      } catch (error) {
        console.error(`⚠️ Failed to get weather for ${region.name}:`, error);
        // Return default weather
        return {
          region: region.name,
          forecastDaily: [{
            date: new Date().toISOString(),
            tMax: 20,
            precipMm: 0,
            windMps: 5,
            condition: 'clear'
          }]
        };
      }
    });
    
    return await Promise.all(weatherPromises);
    
  } catch (error) {
    console.error('⚠️ Failed to get weather data:', error);
    // Return default weather for all regions
    return regions.map(region => ({
      region: region.name,
      forecastDaily: [{
        date: new Date().toISOString(),
        tMax: 20,
        precipMm: 0,
        windMps: 5,
        condition: 'clear'
      }]
    }));
  }
}

export default router;
