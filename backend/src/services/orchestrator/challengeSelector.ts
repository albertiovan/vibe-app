/**
 * Challenge Me Selector
 * 
 * Proposes outside-the-box activities that push users beyond their comfort zone.
 * Features:
 * - Travel-aware recommendations (beyond normal radius)
 * - Weather-conscious suggestions with seasonal timing
 * - Learning from user acceptance/decline patterns
 * - Safety hints and "why now" rationales
 */

import { VibeContext } from '../llm/schemas.js';
import { ActivityIntent } from '../../domain/activities/types.js';
import { 
  ALL_ROMANIA_ACTIVITIES, 
  filterActivities,
  getActivitiesByCategory,
  getActivitiesByEnergyLevel
} from '../../domain/activities/index.js';
import { assessWeatherSuitability } from './weatherSuitability.js';
import { ProviderExecutor } from './providerExecutor.js';

// Base activity recommendation interface
interface ActivityRecommendation {
  intent: ActivityIntent;
  verifiedVenues: any[];
  weatherSuitability: 'good' | 'ok' | 'bad';
  rationale: string;
  confidence: number;
  personalizationFactors: {
    interestMatch: number;
    energyMatch: number;
    profileAlignment: number;
    mlWeightBoost?: number;
  };
}

export interface ChallengeRecommendation extends ActivityRecommendation {
  /** Challenge-specific metadata */
  challenge: {
    /** Destination city for this challenge */
    destinationCity: string;
    
    /** Travel estimate from user's location */
    travelEstimate: {
      distanceKm: number;
      drivingTimeHours: number;
      feasible: boolean;
      transportMode: 'drive' | 'train' | 'flight';
    };
    
    /** Weather forecast badge */
    forecastBadge: {
      condition: string;
      suitability: 'perfect' | 'good' | 'challenging';
      nextBestDays?: string[];
    };
    
    /** Safety considerations */
    safetyHint?: string;
    
    /** Why this challenge is timely */
    whyNow: string;
    
    /** Challenge difficulty (1-5, 5 being most adventurous) */
    challengeLevel: number;
    
    /** What makes this outside comfort zone */
    comfortZoneStretch: string[];
  };
}

export class ChallengeSelector {
  private providerExecutor: ProviderExecutor;
  
  constructor() {
    this.providerExecutor = new ProviderExecutor();
  }
  
  /**
   * Select up to 2 challenge activities that push user outside comfort zone
   */
  async select(
    context: VibeContext,
    mainRecommendations: ActivityRecommendation[]
  ): Promise<ChallengeRecommendation[]> {
    console.log('🎯 Selecting challenge activities...');
    
    try {
      // Get user's exploration bias for challenge difficulty calibration
      const explorationBias = this.getExplorationBias(context);
      
      // Find challenge candidates outside comfort zone
      const candidates = this.findChallengeCandidates(context, mainRecommendations, explorationBias);
      
      if (candidates.length === 0) {
        console.log('⚠️ No suitable challenge candidates found');
        return [];
      }
      
      console.log(`🔍 Found ${candidates.length} challenge candidates`);
      
      // Score and rank candidates
      const scoredCandidates = await this.scoreChallenges(context, candidates);
      
      // Select top 2 diverse challenges
      const selectedChallenges = this.selectDiverseChallenges(scoredCandidates, 2);
      
      // Verify venues for selected challenges
      const verifiedChallenges = await this.verifyChallengeVenues(context, selectedChallenges);
      
      console.log(`✅ Selected ${verifiedChallenges.length} challenge activities`);
      
      return verifiedChallenges;
      
    } catch (error) {
      console.error('❌ Challenge selection failed:', error);
      return [];
    }
  }
  
  /**
   * Get user's exploration bias (willingness to try new things)
   */
  private getExplorationBias(context: VibeContext): number {
    // Base exploration bias from user profile openness score
    let bias = (context.userProfile.opennessScore || 3) / 5; // 0-1 scale
    
    // Boost from ML weights if available
    if (context.mlWeights?.explorationBias) {
      bias = Math.max(bias, context.mlWeights.explorationBias);
    }
    
    // Clamp to reasonable range
    return Math.max(0.1, Math.min(0.9, bias));
  }
  
  /**
   * Find challenge candidates outside user's comfort zone
   */
  private findChallengeCandidates(
    context: VibeContext,
    mainRecommendations: ActivityRecommendation[],
    explorationBias: number
  ): ActivityIntent[] {
    const mainCategories = new Set(mainRecommendations.map(r => r.intent.category));
    const mainSubtypes = new Set(mainRecommendations.flatMap(r => r.intent.subtypes));
    const userInterests = new Set(context.userProfile.interests.map(i => i.toLowerCase()));
    
    // Find activities that stretch the user's comfort zone
    const candidates = ALL_ROMANIA_ACTIVITIES.filter(activity => {
      // Skip if already in main recommendations
      if (mainCategories.has(activity.category)) return false;
      
      // Challenge criteria based on exploration bias
      const challenges: string[] = [];
      
      // 1. Different energy level (higher energy = more challenging)
      if (activity.energy === 'high' && context.userProfile.energyLevel !== 'high') {
        challenges.push('higher_energy');
      }
      
      // 2. Different indoor/outdoor preference
      if (context.userProfile.indoorOutdoor !== 'either' && 
          activity.indoorOutdoor !== 'either' &&
          activity.indoorOutdoor !== context.userProfile.indoorOutdoor) {
        challenges.push('different_environment');
      }
      
      // 3. Higher difficulty than comfort level
      if (activity.difficulty && activity.difficulty > (context.userProfile.opennessScore || 3)) {
        challenges.push('higher_difficulty');
      }
      
      // 4. Unfamiliar activity subtypes
      const hasUnfamiliarSubtype = activity.subtypes.some(subtype => 
        !userInterests.has(subtype.toLowerCase()) && !mainSubtypes.has(subtype)
      );
      if (hasUnfamiliarSubtype) {
        challenges.push('unfamiliar_activity');
      }
      
      // 5. Requires travel outside normal radius
      const requiresTravel = !activity.regions.some(region =>
        context.regionsSeed.some(seed => 
          seed.distanceKmFromStart! <= context.sessionFilters.radiusKm
        )
      );
      if (requiresTravel) {
        challenges.push('travel_required');
      }
      
      // 6. Seasonal/weather timing opportunity
      const hasSeasonalOpportunity = this.hasSeasonalOpportunity(activity, context);
      if (hasSeasonalOpportunity) {
        challenges.push('seasonal_opportunity');
      }
      
      // Require at least one challenge factor
      if (challenges.length === 0) return false;
      
      // Filter by exploration bias - higher bias = more challenges accepted
      const challengeScore = challenges.length / 6; // Normalize to 0-1
      return challengeScore <= explorationBias + 0.3; // Allow some stretch
    });
    
    return candidates;
  }
  
  /**
   * Check if activity has seasonal timing opportunity
   */
  private hasSeasonalOpportunity(activity: ActivityIntent, context: VibeContext): boolean {
    const currentSeason = context.timeContext.season;
    
    // Winter activities in winter
    if (currentSeason === 'winter' && activity.seasonality === 'winter') {
      return true;
    }
    
    // Summer activities in summer
    if (currentSeason === 'summer' && activity.seasonality === 'summer') {
      return true;
    }
    
    // Weather-dependent activities with good weather
    const hasGoodWeather = activity.subtypes.some(subtype => {
      const weather = context.weather[0]?.forecastDaily[0];
      if (!weather) return false;
      
      const suitability = assessWeatherSuitability(subtype, {
        tMax: weather.tMax,
        precipMm: weather.precipMm,
        windMps: weather.windMps,
        condition: weather.condition
      });
      
      return suitability.suitability === 'good';
    });
    
    return hasGoodWeather;
  }
  
  /**
   * Score challenge candidates based on multiple factors
   */
  private async scoreChallenges(
    context: VibeContext,
    candidates: ActivityIntent[]
  ): Promise<Array<ActivityIntent & { challengeScore: number; challengeFactors: string[] }>> {
    const scored = candidates.map(activity => {
      let score = 0;
      const factors: string[] = [];
      
      // 1. Weather suitability (0-0.3)
      const weatherScore = this.calculateWeatherScore(activity, context);
      score += weatherScore * 0.3;
      if (weatherScore > 0.7) factors.push('perfect_weather');
      
      // 2. Travel feasibility (0-0.2)
      const travelScore = this.calculateTravelScore(activity, context);
      score += travelScore * 0.2;
      if (travelScore > 0.6) factors.push('accessible_travel');
      
      // 3. Novelty factor (0-0.25)
      const noveltyScore = this.calculateNoveltyScore(activity, context);
      score += noveltyScore * 0.25;
      if (noveltyScore > 0.7) factors.push('high_novelty');
      
      // 4. Seasonal timing (0-0.15)
      const seasonalScore = this.calculateSeasonalScore(activity, context);
      score += seasonalScore * 0.15;
      if (seasonalScore > 0.8) factors.push('perfect_timing');
      
      // 5. Safety/feasibility (0-0.1)
      const safetyScore = this.calculateSafetyScore(activity, context);
      score += safetyScore * 0.1;
      if (safetyScore < 0.5) factors.push('safety_considerations');
      
      return {
        ...activity,
        challengeScore: Math.min(score, 1.0),
        challengeFactors: factors
      };
    });
    
    return scored.sort((a, b) => b.challengeScore - a.challengeScore);
  }
  
  /**
   * Calculate weather suitability score for activity
   */
  private calculateWeatherScore(activity: ActivityIntent, context: VibeContext): number {
    if (!context.weather.length) return 0.5;
    
    const weather = context.weather[0].forecastDaily[0];
    if (!weather) return 0.5;
    
    const suitabilities = activity.subtypes.map(subtype => {
      const assessment = assessWeatherSuitability(subtype, {
        tMax: weather.tMax,
        precipMm: weather.precipMm,
        windMps: weather.windMps,
        condition: weather.condition
      });
      
      switch (assessment.suitability) {
        case 'good': return 1.0;
        case 'ok': return 0.6;
        case 'bad': return 0.2;
        default: return 0.5;
      }
    });
    
    return suitabilities.reduce((sum, score) => sum + score, 0) / suitabilities.length;
  }
  
  /**
   * Calculate travel feasibility score
   */
  private calculateTravelScore(activity: ActivityIntent, context: VibeContext): number {
    const userLocation = { lat: context.sessionFilters.lat, lng: context.sessionFilters.lon };
    
    // Find closest region for this activity
    let minDistance = Infinity;
    for (const regionName of activity.regions) {
      const region = this.findRegionCoordinates(regionName);
      if (region) {
        const distance = this.calculateDistance(userLocation, region);
        minDistance = Math.min(minDistance, distance);
      }
    }
    
    if (minDistance === Infinity) return 0.3; // Unknown location
    
    // Score based on travel distance
    if (minDistance <= 50) return 1.0;      // Very accessible
    if (minDistance <= 100) return 0.8;     // Reasonable drive
    if (minDistance <= 200) return 0.6;     // Day trip possible
    if (minDistance <= 400) return 0.4;     // Weekend trip
    return 0.2;                             // Requires significant travel
  }
  
  /**
   * Calculate novelty score (how different from user's normal activities)
   */
  private calculateNoveltyScore(activity: ActivityIntent, context: VibeContext): number {
    const userInterests = new Set(context.userProfile.interests.map(i => i.toLowerCase()));
    
    let noveltyFactors = 0;
    
    // Different category
    if (!userInterests.has(activity.category.toLowerCase())) {
      noveltyFactors += 0.3;
    }
    
    // Unfamiliar subtypes
    const unfamiliarSubtypes = activity.subtypes.filter(subtype =>
      !userInterests.has(subtype.toLowerCase())
    );
    noveltyFactors += (unfamiliarSubtypes.length / activity.subtypes.length) * 0.4;
    
    // Different energy level
    if (activity.energy !== context.userProfile.energyLevel) {
      noveltyFactors += 0.2;
    }
    
    // Different environment
    if (context.userProfile.indoorOutdoor !== 'either' &&
        activity.indoorOutdoor !== 'either' &&
        activity.indoorOutdoor !== context.userProfile.indoorOutdoor) {
      noveltyFactors += 0.1;
    }
    
    return Math.min(noveltyFactors, 1.0);
  }
  
  /**
   * Calculate seasonal timing score
   */
  private calculateSeasonalScore(activity: ActivityIntent, context: VibeContext): number {
    const currentSeason = context.timeContext.season;
    
    // Perfect seasonal match
    if (activity.seasonality === currentSeason) return 1.0;
    
    // All-season activities are always good
    if (!activity.seasonality || activity.seasonality === 'all') return 0.7;
    
    // Wrong season
    if (activity.seasonality && activity.seasonality !== currentSeason) return 0.3;
    
    return 0.5;
  }
  
  /**
   * Calculate safety/feasibility score
   */
  private calculateSafetyScore(activity: ActivityIntent, context: VibeContext): number {
    let score = 1.0;
    
    // High difficulty activities need safety consideration
    if (activity.difficulty && activity.difficulty >= 4) {
      score -= 0.3;
    }
    
    // Weather-dependent activities in bad weather
    const weatherScore = this.calculateWeatherScore(activity, context);
    if (weatherScore < 0.4) {
      score -= 0.4;
    }
    
    // Very long duration activities
    if (activity.durationHintHrs && activity.durationHintHrs[0] > 8) {
      score -= 0.2;
    }
    
    return Math.max(score, 0.1);
  }
  
  /**
   * Select diverse challenges (different categories)
   */
  private selectDiverseChallenges(
    candidates: Array<ActivityIntent & { challengeScore: number; challengeFactors: string[] }>,
    maxCount: number
  ): Array<ActivityIntent & { challengeScore: number; challengeFactors: string[] }> {
    const selected: typeof candidates = [];
    const usedCategories = new Set<string>();
    
    for (const candidate of candidates) {
      if (selected.length >= maxCount) break;
      
      // Ensure category diversity
      if (!usedCategories.has(candidate.category)) {
        selected.push(candidate);
        usedCategories.add(candidate.category);
      }
    }
    
    // If we still need more and have room, add highest scoring regardless of category
    for (const candidate of candidates) {
      if (selected.length >= maxCount) break;
      if (!selected.includes(candidate)) {
        selected.push(candidate);
      }
    }
    
    return selected;
  }
  
  /**
   * Verify venues for selected challenges
   */
  private async verifyChallengeVenues(
    context: VibeContext,
    challenges: Array<ActivityIntent & { challengeScore: number; challengeFactors: string[] }>
  ): Promise<ChallengeRecommendation[]> {
    const verified: ChallengeRecommendation[] = [];
    
    for (const challenge of challenges) {
      try {
        // Find best region for this challenge
        const targetRegion = this.findBestRegionForChallenge(challenge, context);
        if (!targetRegion) continue;
        
        // Create basic verification query
        const queries = [{
          intentId: challenge.id,
          provider: 'google' as const,
          priority: 3,
          query: {
            location: { lat: targetRegion.lat, lon: targetRegion.lng },
            radiusMeters: 25000,
            keywords: challenge.subtypes.slice(0, 2),
            type: 'tourist_attraction'
          },
          expectedResultType: 'venues' as const
        }];
        
        // Execute verification
        const results = await this.providerExecutor.executeQueries(queries, {
          maxTotalCalls: 2,
          maxCallsPerProvider: { google: 2, osm: 0, otm: 0 },
          maxConcurrentCalls: 1,
          timeoutPerCall: 5000,
          maxTotalExecutionTime: 10000
        });
        
        const venues = results.resultsByIntent[challenge.id]?.google || [];
        if (venues.length === 0) continue;
        
        // Create challenge recommendation
        const challengeRec = await this.createChallengeRecommendation(
          challenge,
          targetRegion,
          venues,
          context
        );
        
        verified.push(challengeRec);
        
      } catch (error) {
        console.error(`❌ Failed to verify challenge ${challenge.id}:`, error);
        continue;
      }
    }
    
    return verified;
  }
  
  /**
   * Create complete challenge recommendation
   */
  private async createChallengeRecommendation(
    challenge: ActivityIntent & { challengeScore: number; challengeFactors: string[] },
    targetRegion: { name: string; lat: number; lng: number },
    venues: any[],
    context: VibeContext
  ): Promise<ChallengeRecommendation> {
    const userLocation = { lat: context.sessionFilters.lat, lng: context.sessionFilters.lon };
    const distance = this.calculateDistance(userLocation, { lat: targetRegion.lat, lng: targetRegion.lng });
    
    // Calculate travel estimate
    const travelEstimate = {
      distanceKm: distance,
      drivingTimeHours: distance / 80, // Rough estimate
      feasible: distance <= 400,
      transportMode: distance <= 200 ? 'drive' as const : 
                    distance <= 600 ? 'train' as const : 'flight' as const
    };
    
    // Get weather forecast
    const weather = context.weather.find(w => 
      w.region.toLowerCase().includes(targetRegion.name.toLowerCase())
    )?.forecastDaily[0] || context.weather[0]?.forecastDaily[0];
    
    const forecastBadge = {
      condition: weather?.condition || 'clear',
      suitability: this.calculateWeatherScore(challenge, context) > 0.7 ? 'perfect' as const :
                  this.calculateWeatherScore(challenge, context) > 0.5 ? 'good' as const : 'challenging' as const,
      nextBestDays: ['Tomorrow', 'This weekend'] // Simplified
    };
    
    // Generate why now rationale
    const whyNow = this.generateWhyNowRationale(challenge, context, forecastBadge);
    
    // Generate safety hint if needed
    const safetyHint = challenge.difficulty && challenge.difficulty >= 4 ?
      `This is a ${challenge.difficulty}/5 difficulty activity. Consider going with experienced guides.` :
      undefined;
    
    // Determine comfort zone stretches
    const comfortZoneStretch = this.identifyComfortZoneStretches(challenge, context);
    
    // Select best venues
    const topVenues = venues
      .filter(v => v.rating && v.rating >= 3.5)
      .sort((a, b) => (b.rating || 0) - (a.rating || 0))
      .slice(0, 2)
      .map(venue => ({
        placeId: venue.placeId,
        name: venue.name,
        rating: venue.rating,
        userRatingsTotal: venue.userRatingsTotal,
        coords: { lat: venue.location.lat, lon: venue.location.lng },
        provider: 'google' as const,
        mapsUrl: `https://www.google.com/maps/search/?api=1&query_place_id=${venue.placeId}`,
        imageUrl: venue.photos?.[0] ? `/api/places/photo?ref=${venue.photos[0].photoReference}&maxwidth=400` : undefined,
        vicinity: venue.vicinity,
        distanceKm: distance,
        travelTimeMin: Math.round(travelEstimate.drivingTimeHours * 60),
        evidence: {
          types: venue.types,
          verificationMethod: 'Google Places API'
        }
      }));
    
    return {
      intent: {
        id: challenge.id,
        label: challenge.label,
        category: challenge.category,
        subtypes: challenge.subtypes,
        regions: challenge.regions,
        energy: challenge.energy,
        indoorOutdoor: challenge.indoorOutdoor,
        difficulty: challenge.difficulty,
        durationHintHrs: challenge.durationHintHrs
      },
      verifiedVenues: topVenues,
      weatherSuitability: forecastBadge.suitability === 'perfect' ? 'good' as const :
                         forecastBadge.suitability === 'good' ? 'ok' as const : 'bad' as const,
      rationale: `${whyNow} This ${challenge.category} activity in ${targetRegion.name} offers ${comfortZoneStretch.join(' and ')}.`,
      confidence: challenge.challengeScore,
      personalizationFactors: {
        interestMatch: 0.3, // Intentionally low for challenges
        energyMatch: challenge.energy === context.userProfile.energyLevel ? 1.0 : 0.5,
        profileAlignment: 0.4, // Intentionally lower for stretch activities
        mlWeightBoost: context.mlWeights?.explorationBias || 0
      },
      challenge: {
        destinationCity: targetRegion.name,
        travelEstimate,
        forecastBadge,
        safetyHint,
        whyNow,
        challengeLevel: Math.ceil(challenge.challengeScore * 5),
        comfortZoneStretch
      }
    };
  }
  
  /**
   * Generate "why now" rationale for timing
   */
  private generateWhyNowRationale(
    challenge: ActivityIntent,
    context: VibeContext,
    forecastBadge: { condition: string; suitability: string }
  ): string {
    const reasons: string[] = [];
    
    // Seasonal reasons
    if (challenge.seasonality === context.timeContext.season) {
      reasons.push(`Perfect ${context.timeContext.season} activity`);
    }
    
    // Weather reasons
    if (forecastBadge.suitability === 'perfect') {
      reasons.push(`Ideal weather conditions forecasted`);
    }
    
    // Day of week reasons
    if (context.timeContext.dayOfWeek === 'Saturday' || context.timeContext.dayOfWeek === 'Sunday') {
      reasons.push(`Weekend adventure opportunity`);
    }
    
    // Default reason
    if (reasons.length === 0) {
      reasons.push(`Great time to try something new`);
    }
    
    return reasons.join(', ');
  }
  
  /**
   * Identify what aspects stretch the user's comfort zone
   */
  private identifyComfortZoneStretches(
    challenge: ActivityIntent,
    context: VibeContext
  ): string[] {
    const stretches: string[] = [];
    
    if (challenge.energy === 'high' && context.userProfile.energyLevel !== 'high') {
      stretches.push('higher intensity than usual');
    }
    
    if (challenge.difficulty && challenge.difficulty > (context.userProfile.opennessScore || 3)) {
      stretches.push('increased challenge level');
    }
    
    if (context.userProfile.indoorOutdoor !== 'either' && 
        challenge.indoorOutdoor !== context.userProfile.indoorOutdoor) {
      stretches.push(`${challenge.indoorOutdoor} experience`);
    }
    
    const userInterests = new Set(context.userProfile.interests.map(i => i.toLowerCase()));
    const hasUnfamiliarSubtype = challenge.subtypes.some(subtype => 
      !userInterests.has(subtype.toLowerCase())
    );
    if (hasUnfamiliarSubtype) {
      stretches.push('new activity type');
    }
    
    if (stretches.length === 0) {
      stretches.push('adventure beyond your usual preferences');
    }
    
    return stretches;
  }
  
  /**
   * Find best region for a challenge activity
   */
  private findBestRegionForChallenge(
    challenge: ActivityIntent,
    context: VibeContext
  ): { name: string; lat: number; lng: number } | null {
    for (const regionName of challenge.regions) {
      const coords = this.findRegionCoordinates(regionName);
      if (coords) {
        return { name: regionName, ...coords };
      }
    }
    return null;
  }
  
  /**
   * Find coordinates for a Romanian region/city
   */
  private findRegionCoordinates(regionName: string): { lat: number; lng: number } | null {
    const regions: Record<string, { lat: number; lng: number }> = {
      'București': { lat: 44.4268, lng: 26.1025 },
      'Brașov': { lat: 45.6427, lng: 25.5887 },
      'Cluj-Napoca': { lat: 46.7712, lng: 23.6236 },
      'Timișoara': { lat: 45.7489, lng: 21.2087 },
      'Iași': { lat: 47.1585, lng: 27.6014 },
      'Constanța': { lat: 44.1598, lng: 28.6348 },
      'Sibiu': { lat: 45.7983, lng: 24.1256 },
      'Oradea': { lat: 47.0465, lng: 21.9189 },
      'Sinaia': { lat: 45.3500, lng: 25.5500 },
      'Poiana Brașov': { lat: 45.5833, lng: 25.5667 },
      'Alba': { lat: 46.0667, lng: 23.5833 },
      'Alba Iulia': { lat: 46.0667, lng: 23.5833 },
      'Apuseni': { lat: 46.5000, lng: 22.8000 },
      'Bucegi': { lat: 45.4000, lng: 25.4500 },
      'Maramureș': { lat: 47.6500, lng: 23.5833 },
      'Sighetu Marmației': { lat: 47.9333, lng: 23.8833 },
      'Caraș-Severin': { lat: 45.3000, lng: 22.0000 },
      'Mehedinți': { lat: 44.6333, lng: 22.6500 },
      'Tulcea': { lat: 45.1667, lng: 28.8000 },
      'Danube Delta': { lat: 45.2500, lng: 29.0000 },
      'Prahova': { lat: 45.1000, lng: 26.0000 },
      'Buzău': { lat: 45.1500, lng: 26.8333 },
      'Vâlcea': { lat: 45.1000, lng: 24.3667 },
      'Horezu': { lat: 45.1500, lng: 23.9833 },
      'Mureș': { lat: 46.5500, lng: 24.5667 },
      'Sovata': { lat: 46.6000, lng: 25.0833 },
      'Sighișoara': { lat: 46.2167, lng: 24.7833 },
      'Bihor': { lat: 47.0667, lng: 22.1000 },
      'Argeș': { lat: 44.8500, lng: 24.8667 }
    };
    
    return regions[regionName] || null;
  }
  
  /**
   * Calculate distance between two points in kilometers
   */
  private calculateDistance(
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
}
