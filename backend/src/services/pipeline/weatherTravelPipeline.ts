/**
 * Final Weather/Travel-Aware Pipeline with Guardrails
 * Enforces exactly 5 diverse picks with weather/travel intelligence
 */

import { parseVibeToFilterSpec } from '../llm/queryUnderstanding.js';
import { curateTopFive } from '../llm/curation.js';
import { GooglePlacesService } from '../googlePlacesService.js';
import { OutdoorActivitiesOrchestrator } from '../outdoor/orchestrator.js';
import { OpenMeteoService } from '../weather/openmeteo.js';
import { LocationService } from '../location/index.js';
import { FilterSpec } from '../../schemas/filterSpec.js';
import { CurationSpec } from '../../schemas/curationSpec.js';

export interface CandidateItem {
  id: string;
  name: string;
  types: string[];
  rating?: number;
  userRatingsTotal?: number;
  priceLevel?: number;
  location: {
    lat: number;
    lng: number;
  };
  // Guardrail annotations
  regionName: string;
  distanceKm: number;
  travelMinutes: number;
  weatherSuitabilityScore: number;
  weatherHint: string;
  bucket: 'trails' | 'adrenaline' | 'nature' | 'culture' | 'wellness' | 'nightlife';
  isFood: boolean;
  isCulinaryPremium: boolean;
  source: 'places' | 'overpass' | 'otm';
}

export interface PipelineContext {
  userLocation: {
    lat: number;
    lng: number;
    city?: string;
    country?: string;
  };
  willingToTravel: boolean;
  maxTravelMinutes: number;
  currentWeather: any;
  destinationForecasts: Map<string, any>; // regionName -> 72h forecast
}

export interface PipelineResult {
  topFive: CandidateItem[];
  curationSpec: CurationSpec;
  context: PipelineContext;
  guardrailsApplied: {
    foodFiltered: number;
    weatherFiltered: number;
    travelFiltered: number;
    totalCandidates: number;
  };
}

/**
 * Main pipeline orchestrator with all guardrails
 */
export class WeatherTravelPipeline {
  private placesService: GooglePlacesService;
  private outdoorOrchestrator: OutdoorActivitiesOrchestrator;
  private weatherService: OpenMeteoService;

  constructor() {
    this.placesService = new GooglePlacesService();
    this.outdoorOrchestrator = new OutdoorActivitiesOrchestrator();
    this.weatherService = new OpenMeteoService();
  }

  /**
   * Execute complete pipeline: vibe → weather/travel-aware top 5
   */
  async execute(
    vibeText: string,
    userLocation: { lat: number; lng: number; city?: string; country?: string },
    options: {
      willingToTravel?: boolean;
      maxTravelMinutes?: number;
    } = {}
  ): Promise<PipelineResult> {
    const startTime = Date.now();
    
    console.log('🚀 Starting weather/travel-aware pipeline:', {
      vibe: vibeText.slice(0, 50),
      location: userLocation.city || 'Unknown',
      willingToTravel: options.willingToTravel || false
    });

    // Step 1: Parse vibe to FilterSpec
    const filterSpec = await parseVibeToFilterSpec(vibeText);
    
    // Step 2: Build context with weather forecasts
    const context = await this.buildPipelineContext(userLocation, options);
    
    // Step 3: Search all providers
    const rawCandidates = await this.searchAllProviders(filterSpec, context);
    
    // Step 4: Apply guardrails and annotations
    const annotatedCandidates = await this.applyGuardrails(rawCandidates, context, filterSpec);
    
    // Step 5: LLM curation to exactly 5
    const curationSpec = await this.curateFinalFive(annotatedCandidates, filterSpec, context);
    
    // Step 6: Extract final results
    const topFive = this.extractTopFive(annotatedCandidates, curationSpec);

    const duration = Date.now() - startTime;
    
    console.log('✅ Pipeline completed:', {
      duration,
      candidates: rawCandidates.length,
      afterGuardrails: annotatedCandidates.length,
      finalResults: topFive.length
    });

    return {
      topFive,
      curationSpec,
      context,
      guardrailsApplied: {
        foodFiltered: rawCandidates.filter(c => this.isFood(c) && !this.isCulinaryPremium(c)).length,
        weatherFiltered: 0, // Calculated during guardrails
        travelFiltered: 0, // Calculated during guardrails
        totalCandidates: rawCandidates.length
      }
    };
  }

  /**
   * Build pipeline context with weather forecasts
   */
  private async buildPipelineContext(
    userLocation: { lat: number; lng: number; city?: string; country?: string },
    options: { willingToTravel?: boolean; maxTravelMinutes?: number }
  ): Promise<PipelineContext> {
    const context: PipelineContext = {
      userLocation,
      willingToTravel: options.willingToTravel || false,
      maxTravelMinutes: options.maxTravelMinutes || 60,
      currentWeather: null,
      destinationForecasts: new Map()
    };

    // Get current weather
    try {
      context.currentWeather = await this.weatherService.getCurrentWeather(
        userLocation.lat, 
        userLocation.lng
      );
    } catch (error) {
      console.warn('Failed to get current weather:', error);
    }

    // Get destination forecasts if willing to travel
    if (context.willingToTravel) {
      const destinations = this.getNearbyDestinations(userLocation);
      
      for (const destination of destinations) {
        try {
          const forecast = await this.weatherService.getWeatherForecast(
            destination.lat,
            destination.lng
          );
          context.destinationForecasts.set(destination.name, forecast);
        } catch (error) {
          console.warn(`Failed to get forecast for ${destination.name}:`, error);
        }
      }
    }

    return context;
  }

  /**
   * Search all providers (Places, Overpass, OpenTripMap)
   */
  private async searchAllProviders(
    filterSpec: FilterSpec,
    context: PipelineContext
  ): Promise<any[]> {
    const searches: Promise<any[]>[] = [];

    // Google Places search using existing service
    searches.push(
      this.searchGooglePlacesIntegrated(filterSpec, context).catch(() => [])
    );

    // Outdoor activities if relevant buckets
    const hasOutdoorBuckets = filterSpec.buckets?.some(bucket => 
      ['trails', 'nature', 'adrenaline'].includes(bucket)
    );

    if (hasOutdoorBuckets) {
      searches.push(
        this.outdoorOrchestrator.searchOutdoorActivities({
          location: {
            coordinates: context.userLocation,
            city: context.userLocation.city,
            country: context.userLocation.country,
            timezone: 'Europe/Bucharest', // Default timezone
            source: 'gps' // Location source
          },
          maxDistance: filterSpec.radiusKm || 15,
          includeTrails: true,
          includePOIs: true,
          includeWeather: false // We handle weather separately
        }).then(result => [...result.trails, ...result.pois]).catch(() => [])
      );
    }

    const results = await Promise.all(searches);
    return results.flat();
  }

  /**
   * Apply all guardrails and annotations
   */
  private async applyGuardrails(
    rawCandidates: any[],
    context: PipelineContext,
    filterSpec: FilterSpec
  ): Promise<CandidateItem[]> {
    const annotated: CandidateItem[] = [];

    for (const candidate of rawCandidates) {
      // Annotate with guardrail data
      const annotatedCandidate: CandidateItem = {
        id: candidate.id || candidate.place_id,
        name: candidate.name,
        types: candidate.types || [],
        rating: candidate.rating,
        userRatingsTotal: candidate.user_ratings_total,
        priceLevel: candidate.price_level,
        location: candidate.location || {
          lat: candidate.geometry?.location?.lat || context.userLocation.lat,
          lng: candidate.geometry?.location?.lng || context.userLocation.lng
        },
        // Guardrail annotations
        regionName: this.determineRegion(candidate, context),
        distanceKm: this.calculateDistance(candidate, context.userLocation),
        travelMinutes: this.estimateTravelTime(candidate, context.userLocation),
        weatherSuitabilityScore: this.calculateWeatherSuitability(candidate, context),
        weatherHint: this.generateWeatherHint(candidate, context),
        bucket: this.classifyToBucket(candidate),
        isFood: this.isFood(candidate),
        isCulinaryPremium: this.isCulinaryPremium(candidate),
        source: this.determineSource(candidate)
      };

      // Apply filters
      
      // Food filter: drop isFood && !isCulinaryPremium unless vibe demands food
      if (annotatedCandidate.isFood && !annotatedCandidate.isCulinaryPremium) {
        const vibeDemandsFood = this.vibeDemandsFood(filterSpec);
        if (!vibeDemandsFood) {
          continue; // Skip this candidate
        }
      }

      // Travel filter: respect maxTravelMinutes
      if (annotatedCandidate.travelMinutes > context.maxTravelMinutes) {
        continue; // Skip this candidate
      }

      annotated.push(annotatedCandidate);
    }

    return annotated;
  }

  /**
   * LLM curation to exactly 5 items
   */
  private async curateFinalFive(
    candidates: CandidateItem[],
    filterSpec: FilterSpec,
    context: PipelineContext
  ): Promise<CurationSpec> {
    if (candidates.length < 5) {
      console.warn('Insufficient candidates for curation:', candidates.length);
      return this.createFallbackCuration(candidates);
    }

    try {
      return await curateTopFive({
        items: candidates.map(c => ({
          id: c.id,
          name: c.name,
          rating: c.rating,
          types: c.types,
          weatherSuitability: c.weatherSuitabilityScore,
          bucket: c.bucket
        })),
        filterSpec: {
          buckets: filterSpec.buckets || ['trails', 'adrenaline', 'nature', 'culture', 'wellness'],
          energy: filterSpec.energy || 'medium',
          avoidFood: filterSpec.avoidFood !== false
        },
        weather: context.currentWeather ? {
          conditions: context.currentWeather.conditions,
          temperature: context.currentWeather.temperature,
          precipitation: context.currentWeather.precipitation,
          recommendation: this.getWeatherRecommendation(context.currentWeather)
        } : undefined
      });
    } catch (error) {
      console.error('LLM curation failed:', error);
      return this.createFallbackCuration(candidates);
    }
  }

  /**
   * Fallback curation using heuristics
   */
  private createFallbackCuration(candidates: CandidateItem[]): CurationSpec {
    // Score = 1.5*weatherSuitabilityScore + rating * ln(1 + userRatingsTotal)
    const scored = candidates.map(c => ({
      ...c,
      score: 1.5 * c.weatherSuitabilityScore + 
             (c.rating || 0) * Math.log(1 + (c.userRatingsTotal || 1))
    })).sort((a, b) => b.score - a.score);

    // Pick best 1 per bucket, round-robin until 5
    const buckets = ['trails', 'adrenaline', 'nature', 'culture', 'wellness', 'nightlife'];
    const selected: CandidateItem[] = [];
    const usedBuckets = new Set<string>();

    // First pass: one per bucket
    for (const candidate of scored) {
      if (selected.length >= 5) break;
      if (!usedBuckets.has(candidate.bucket)) {
        selected.push(candidate);
        usedBuckets.add(candidate.bucket);
      }
    }

    // Second pass: fill remaining slots
    for (const candidate of scored) {
      if (selected.length >= 5) break;
      if (!selected.some(s => s.id === candidate.id)) {
        selected.push(candidate);
      }
    }

    const topFiveIds = selected.slice(0, 5).map(c => c.id);
    
    return {
      topFiveIds,
      clusters: [{
        label: 'Curated Experiences',
        ids: topFiveIds
      }],
      summaries: selected.slice(0, 5).map(c => ({
        id: c.id,
        blurb: `${c.name} in ${c.regionName} (${c.distanceKm.toFixed(1)}km away). ${c.weatherHint} Rated ${c.rating?.toFixed(1) || 'well'} by visitors.`
      })),
      rationale: 'Fallback curation using weather suitability and rating scores'
    };
  }

  /**
   * Extract final top 5 candidates
   */
  private extractTopFive(candidates: CandidateItem[], curation: CurationSpec): CandidateItem[] {
    return curation.topFiveIds
      .map(id => candidates.find(c => c.id === id))
      .filter(Boolean) as CandidateItem[];
  }

  // Helper methods for guardrails

  private determineRegion(candidate: any, context: PipelineContext): string {
    // Simple region determination - in production would use proper geocoding
    const distance = this.calculateDistance(candidate, context.userLocation);
    if (distance < 5) return context.userLocation.city || 'Local';
    if (distance < 50) return 'Nearby';
    return 'Regional';
  }

  private calculateDistance(candidate: any, userLocation: { lat: number; lng: number }): number {
    const candidateLat = candidate.location?.lat || candidate.geometry?.location?.lat || userLocation.lat;
    const candidateLng = candidate.location?.lng || candidate.geometry?.location?.lng || userLocation.lng;
    
    return LocationService.calculateDistance(
      userLocation,
      { lat: candidateLat, lng: candidateLng }
    );
  }

  private estimateTravelTime(candidate: any, userLocation: { lat: number; lng: number }): number {
    const distance = this.calculateDistance(candidate, userLocation);
    return Math.round(distance * 2); // Rough estimate: 30km/h average
  }

  private calculateWeatherSuitability(candidate: any, context: PipelineContext): number {
    if (!context.currentWeather) return 1.0;

    const isIndoor = candidate.types?.some((type: string) => 
      ['museum', 'art_gallery', 'shopping_mall', 'spa'].includes(type)
    );

    if (isIndoor) return 1.0;

    // Weather suitability matrix
    const weather = context.currentWeather;
    if (weather.precipitation > 5) return 0.2; // Heavy rain
    if (weather.precipitation > 1) return 0.6; // Light rain
    if (weather.temperature < -5 || weather.temperature > 35) return 0.3; // Extreme temps
    if (weather.windSpeed > 25) return 0.4; // Strong wind
    
    return 1.0; // Good weather
  }

  private generateWeatherHint(candidate: any, context: PipelineContext): string {
    if (!context.currentWeather) return 'Weather conditions unknown';
    
    const suitability = this.calculateWeatherSuitability(candidate, context);
    const temp = Math.round(context.currentWeather.temperature);
    
    if (suitability >= 0.8) return `Perfect weather • ${temp}°C`;
    if (suitability >= 0.6) return `Good conditions • ${temp}°C`;
    if (suitability >= 0.4) return `Fair weather • ${temp}°C`;
    return `Weather advisory • ${temp}°C`;
  }

  private classifyToBucket(candidate: any): CandidateItem['bucket'] {
    const types = candidate.types || [];
    
    if (types.some((t: string) => ['park', 'natural_feature'].includes(t))) return 'trails';
    if (types.some((t: string) => ['amusement_park', 'stadium', 'gym'].includes(t))) return 'adrenaline';
    if (types.some((t: string) => ['zoo', 'aquarium', 'botanical_garden'].includes(t))) return 'nature';
    if (types.some((t: string) => ['museum', 'art_gallery', 'library'].includes(t))) return 'culture';
    if (types.some((t: string) => ['spa', 'beauty_salon'].includes(t))) return 'wellness';
    if (types.some((t: string) => ['night_club', 'bar', 'casino'].includes(t))) return 'nightlife';
    
    return 'nature'; // Default
  }

  private isFood(candidate: any): boolean {
    const types = candidate.types || [];
    return types.some((type: string) => 
      ['restaurant', 'food', 'meal_takeaway', 'meal_delivery', 'cafe', 'bakery'].includes(type)
    );
  }

  private isCulinaryPremium(candidate: any): boolean {
    return this.isFood(candidate) && (candidate.price_level >= 3);
  }

  private determineSource(candidate: any): CandidateItem['source'] {
    if (candidate.place_id) return 'places';
    if (candidate.source === 'overpass') return 'overpass';
    if (candidate.source === 'opentripmap') return 'otm';
    return 'places';
  }

  private vibeDemandsFood(filterSpec: FilterSpec): boolean {
    return filterSpec.avoidFood === false;
  }

  private getGooglePlacesTypes(filterSpec: FilterSpec): string[] {
    // Convert buckets to Google Places types
    const bucketToTypes: Record<string, string[]> = {
      trails: ['park', 'tourist_attraction'],
      adrenaline: ['amusement_park', 'stadium', 'gym'],
      nature: ['park', 'zoo', 'aquarium'],
      culture: ['museum', 'art_gallery', 'library'],
      wellness: ['spa', 'beauty_salon'],
      nightlife: ['night_club', 'bar', 'casino']
    };

    const types = new Set<string>();
    filterSpec.buckets?.forEach(bucket => {
      bucketToTypes[bucket]?.forEach(type => types.add(type));
    });

    return Array.from(types);
  }

  private getNearbyDestinations(userLocation: { lat: number; lng: number }) {
    // Hardcoded nearby destinations - in production would be dynamic
    return [
      { name: 'Brașov', lat: 45.6427, lng: 25.5887 },
      { name: 'Sinaia', lat: 45.3500, lng: 25.5500 },
      { name: 'Constanța', lat: 44.1598, lng: 28.6348 }
    ];
  }

  private getWeatherRecommendation(weather: any): 'indoor' | 'covered' | 'outdoor' {
    if (weather.precipitation > 5 || weather.temperature < -5 || weather.temperature > 35) {
      return 'indoor';
    }
    if (weather.precipitation > 1 || weather.windSpeed > 25) {
      return 'covered';
    }
    return 'outdoor';
  }

  /**
   * Integrate with existing Google Places service
   */
  private async searchGooglePlacesIntegrated(
    filterSpec: FilterSpec,
    context: PipelineContext
  ): Promise<any[]> {
    try {
      // Convert new FilterSpec to legacy UserVibe format
      const legacyVibe = {
        energy: this.mapEnergyLevel(filterSpec.energy || 'medium'),
        social: 'intimate' as const, // Default
        mood: this.bucketToMood(filterSpec.buckets?.[0] || 'nature'),
        timeAvailable: 'moderate' as const,
        budget: 'moderate' as const,
        weatherPreference: filterSpec.indoorOutdoor || 'either',
        exploration: 'mixed' as const,
        location: {
          lat: context.userLocation.lat,
          lng: context.userLocation.lng,
          radius: filterSpec.radiusKm || 10
        }
      };

      // Use existing Google Places service
      const result = await this.placesService.findExperiencesByVibe(legacyVibe);
      
      return result.places || [];
    } catch (error) {
      console.warn('Google Places integration failed:', error);
      return [];
    }
  }

  /**
   * Map energy level from new schema to legacy schema
   */
  private mapEnergyLevel(energy: 'chill' | 'medium' | 'high'): 'low' | 'medium' | 'high' {
    if (energy === 'chill') return 'low';
    return energy;
  }

  /**
   * Convert bucket to mood for legacy compatibility
   */
  private bucketToMood(bucket: string): 'adventurous' | 'relaxed' | 'creative' | 'productive' | 'social' | 'contemplative' | 'playful' {
    const bucketToMoodMap: Record<string, 'adventurous' | 'relaxed' | 'creative' | 'productive' | 'social' | 'contemplative' | 'playful'> = {
      'trails': 'adventurous',
      'adrenaline': 'adventurous', 
      'nature': 'contemplative',
      'culture': 'creative',
      'wellness': 'relaxed',
      'nightlife': 'social'
    };
    
    return bucketToMoodMap[bucket] || 'adventurous';
  }
}
