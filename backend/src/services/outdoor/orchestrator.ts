/**
 * Outdoor Activities Orchestrator
 * Combines Google Places, Overpass trails, OpenTripMap POIs, and weather data
 */

import { OverpassProvider } from '../../providers/trails/overpass.js';
import { OpenTripMapProvider } from '../../providers/activities/opentripmap.js';
import { OpenMeteoService } from '../weather/openmeteo.js';
import { WeatherGatingService } from '../weather/gating.js';
import { LocationService } from '../location/index.js';
import { diversifyResults } from '../../config/app.experiences.js';
import { TrailSummary, OutdoorPOI, WeatherForecast, LocationContext } from '../../types/trails.js';

export interface OutdoorSearchParams {
  location: LocationContext;
  maxDistance?: number; // km
  includeTrails?: boolean;
  includePOIs?: boolean;
  includeWeather?: boolean;
  trailTypes?: Array<'hiking' | 'mtb' | 'cycling' | 'ski'>;
  poiCategories?: Array<'natural' | 'adventure' | 'parks' | 'viewpoints'>;
}

export interface OutdoorSearchResult {
  trails: TrailSummary[];
  pois: OutdoorPOI[];
  weather?: WeatherForecast;
  weatherAdvice?: string;
  totalFound: number;
  searchParams: OutdoorSearchParams;
  timestamp: Date;
}

export class OutdoorActivitiesOrchestrator {
  private overpassProvider: OverpassProvider;
  private openTripMapProvider: OpenTripMapProvider;
  private weatherService: OpenMeteoService;

  constructor() {
    this.overpassProvider = new OverpassProvider();
    this.openTripMapProvider = new OpenTripMapProvider();
    this.weatherService = new OpenMeteoService();
  }

  /**
   * Search for comprehensive outdoor activities
   */
  async searchOutdoorActivities(params: OutdoorSearchParams): Promise<OutdoorSearchResult> {
    const startTime = Date.now();
    
    console.log('🏔️ Starting outdoor activities search:', {
      location: params.location.city || 'Unknown',
      maxDistance: params.maxDistance || 15,
      includeTrails: params.includeTrails !== false,
      includePOIs: params.includePOIs !== false,
      includeWeather: params.includeWeather !== false
    });

    // Run searches in parallel for better performance
    const [trails, pois, weather] = await Promise.allSettled([
      this.searchTrails(params),
      this.searchPOIs(params),
      this.getWeatherData(params)
    ]);

    // Extract results, handling failures gracefully
    const trailResults = trails.status === 'fulfilled' ? trails.value : [];
    const poiResults = pois.status === 'fulfilled' ? pois.value : [];
    const weatherData = weather.status === 'fulfilled' ? weather.value : undefined;

    // Apply distance filtering
    const filteredTrails = this.filterByDistance(trailResults, params);
    const filteredPOIs = this.filterByDistance(poiResults, params);

    // Apply weather-based filtering if weather data is available
    let weatherAdvice: string | undefined;
    let finalTrails = filteredTrails;
    let finalPOIs = filteredPOIs;

    if (weatherData?.current) {
      const trailGating = WeatherGatingService.applyWeatherGating(
        filteredTrails.map(t => ({ ...t, types: [t.type] })),
        weatherData.current
      );
      
      const poiGating = WeatherGatingService.applyWeatherGating(
        filteredPOIs.map(p => ({ ...p, types: [p.category] })),
        weatherData.current
      );

      finalTrails = trailGating.filtered.map(t => {
        const { types, ...trail } = t;
        return trail as TrailSummary;
      });
      
      finalPOIs = poiGating.filtered.map(p => {
        const { types, ...poi } = p;
        return poi as OutdoorPOI;
      });

      weatherAdvice = trailGating.weatherAdvice;
    }

    const totalFound = trailResults.length + poiResults.length;
    const duration = Date.now() - startTime;

    console.log('🏔️ Outdoor search completed:', {
      trails: finalTrails.length,
      pois: finalPOIs.length,
      weather: !!weatherData,
      duration: `${duration}ms`,
      totalFound
    });

    return {
      trails: finalTrails,
      pois: finalPOIs,
      weather: weatherData,
      weatherAdvice,
      totalFound,
      searchParams: params,
      timestamp: new Date()
    };
  }

  /**
   * Search for trails using Overpass API
   */
  private async searchTrails(params: OutdoorSearchParams): Promise<TrailSummary[]> {
    if (params.includeTrails === false) {
      return [];
    }

    try {
      const bbox = LocationService.createBoundingBox(
        params.location.coordinates,
        params.maxDistance || 15
      );

      const trailTypes = params.trailTypes || ['hiking', 'mtb', 'cycling'];
      const trails = await this.overpassProvider.searchTrails(bbox, trailTypes);

      console.log(`🥾 Found ${trails.length} trails from Overpass`);
      return trails;
    } catch (error) {
      console.error('❌ Trail search failed:', error);
      return [];
    }
  }

  /**
   * Search for outdoor POIs using OpenTripMap
   */
  private async searchPOIs(params: OutdoorSearchParams): Promise<OutdoorPOI[]> {
    if (params.includePOIs === false) {
      return [];
    }

    try {
      const { lat, lng } = params.location.coordinates;
      const radius = (params.maxDistance || 15) * 1000; // Convert to meters
      
      const categories = params.poiCategories || ['natural', 'parks', 'adventure', 'viewpoints'];
      const allPOIs: OutdoorPOI[] = [];

      // Search each category
      for (const category of categories) {
        try {
          const categoryPOIs = await this.openTripMapProvider.searchOutdoorActivities(
            lat, lng, radius, category
          );
          allPOIs.push(...categoryPOIs);
        } catch (error) {
          console.warn(`⚠️ Failed to search ${category} POIs:`, error);
        }
      }

      // Filter for outdoor relevance and remove duplicates
      const outdoorPOIs = this.openTripMapProvider.filterOutdoorRelevant(allPOIs);
      const uniquePOIs = this.deduplicatePOIs(outdoorPOIs);

      console.log(`🗺️ Found ${uniquePOIs.length} outdoor POIs from OpenTripMap`);
      return uniquePOIs;
    } catch (error) {
      console.error('❌ POI search failed:', error);
      return [];
    }
  }

  /**
   * Get weather data for location
   */
  private async getWeatherData(params: OutdoorSearchParams): Promise<WeatherForecast | undefined> {
    if (params.includeWeather === false) {
      return undefined;
    }

    try {
      const { lat, lng } = params.location.coordinates;
      const weather = await this.weatherService.getWeatherForecast(lat, lng);
      
      if (weather) {
        console.log('🌤️ Weather data retrieved:', {
          temperature: Math.round(weather.current.temperature),
          conditions: weather.current.conditions,
          precipitation: weather.current.precipitation
        });
      }

      return weather || undefined;
    } catch (error) {
      console.error('❌ Weather data failed:', error);
      return undefined;
    }
  }

  /**
   * Filter results by distance from user location
   */
  private filterByDistance<T extends { location: { lat: number; lng: number } }>(
    items: T[],
    params: OutdoorSearchParams
  ): T[] {
    const maxDistance = params.maxDistance || 15; // km
    
    return LocationService.filterByDistance(
      items,
      params.location.coordinates,
      maxDistance
    );
  }

  /**
   * Remove duplicate POIs based on name and location proximity
   */
  private deduplicatePOIs(pois: OutdoorPOI[]): OutdoorPOI[] {
    const unique: OutdoorPOI[] = [];
    const seen = new Set<string>();

    for (const poi of pois) {
      // Create key based on name and approximate location
      const locationKey = `${Math.round(poi.location.lat * 1000)},${Math.round(poi.location.lng * 1000)}`;
      const key = `${poi.name.toLowerCase().replace(/\s+/g, '_')}_${locationKey}`;

      if (!seen.has(key)) {
        seen.add(key);
        unique.push(poi);
      }
    }

    return unique;
  }

  /**
   * Get weather-appropriate outdoor recommendations
   */
  async getWeatherAwareRecommendations(
    location: LocationContext,
    maxDistance: number = 15
  ): Promise<{
    recommended: OutdoorSearchResult;
    weatherSummary: string;
    activitySuggestions: { prioritize: string[]; avoid: string[]; message: string };
  }> {
    // Get weather first to inform search strategy
    const weather = await this.weatherService.getWeatherForecast(
      location.coordinates.lat,
      location.coordinates.lng
    );

    let searchParams: OutdoorSearchParams = {
      location,
      maxDistance,
      includeTrails: true,
      includePOIs: true,
      includeWeather: true
    };

    // Adjust search based on weather
    if (weather?.current) {
      const gating = WeatherGatingService.analyzeWeatherGating(weather.current);
      
      if (gating.recommendation === 'indoor') {
        // Focus on covered/indoor outdoor activities
        searchParams.poiCategories = ['adventure']; // Indoor climbing, etc.
        searchParams.trailTypes = []; // Skip trails in bad weather
      } else if (gating.recommendation === 'covered') {
        // Prefer less exposed activities
        searchParams.trailTypes = ['hiking']; // Skip cycling/MTB in wind
        searchParams.poiCategories = ['parks', 'adventure'];
      }
    }

    const results = await this.searchOutdoorActivities(searchParams);
    
    const weatherSummary = weather?.current 
      ? `${Math.round(weather.current.temperature)}°C, ${weather.current.conditions.replace(/_/g, ' ')}`
      : 'Weather data unavailable';

    const activitySuggestions = weather?.current
      ? WeatherGatingService.getWeatherActivitySuggestions(weather.current)
      : { prioritize: [], avoid: [], message: 'Weather data unavailable' };

    return {
      recommended: results,
      weatherSummary,
      activitySuggestions
    };
  }

  /**
   * Search for specific activity types
   */
  async searchSpecificActivity(
    location: LocationContext,
    activityType: 'trails' | 'nature' | 'adventure' | 'parks',
    maxDistance: number = 20
  ): Promise<OutdoorSearchResult> {
    const searchParams: OutdoorSearchParams = {
      location,
      maxDistance,
      includeWeather: true
    };

    switch (activityType) {
      case 'trails':
        searchParams.includeTrails = true;
        searchParams.includePOIs = false;
        searchParams.trailTypes = ['hiking', 'mtb', 'cycling'];
        break;
        
      case 'nature':
        searchParams.includeTrails = false;
        searchParams.includePOIs = true;
        searchParams.poiCategories = ['natural', 'parks'];
        break;
        
      case 'adventure':
        searchParams.includeTrails = true;
        searchParams.includePOIs = true;
        searchParams.trailTypes = ['mtb', 'cycling'];
        searchParams.poiCategories = ['adventure'];
        break;
        
      case 'parks':
        searchParams.includeTrails = false;
        searchParams.includePOIs = true;
        searchParams.poiCategories = ['parks', 'viewpoints'];
        break;
    }

    return this.searchOutdoorActivities(searchParams);
  }

  /**
   * Get activity recommendations based on user preferences and weather
   */
  async getPersonalizedRecommendations(
    location: LocationContext,
    preferences: {
      difficulty?: 'easy' | 'moderate' | 'difficult';
      duration?: 'short' | 'medium' | 'long'; // <1h, 1-3h, >3h
      interests?: Array<'nature' | 'adventure' | 'culture' | 'relaxation'>;
    },
    maxDistance: number = 15
  ): Promise<OutdoorSearchResult> {
    const searchParams: OutdoorSearchParams = {
      location,
      maxDistance,
      includeTrails: true,
      includePOIs: true,
      includeWeather: true
    };

    // Adjust search based on preferences
    if (preferences.interests?.includes('adventure')) {
      searchParams.trailTypes = ['mtb', 'cycling', 'hiking'];
      searchParams.poiCategories = ['adventure', 'natural'];
    } else if (preferences.interests?.includes('nature')) {
      searchParams.trailTypes = ['hiking'];
      searchParams.poiCategories = ['natural', 'parks', 'viewpoints'];
    } else if (preferences.interests?.includes('relaxation')) {
      searchParams.trailTypes = ['hiking'];
      searchParams.poiCategories = ['parks', 'viewpoints'];
    }

    const results = await this.searchOutdoorActivities(searchParams);

    // Filter results based on preferences
    if (preferences.difficulty) {
      results.trails = results.trails.filter(trail => 
        trail.difficulty === preferences.difficulty
      );
    }

    if (preferences.duration) {
      const durationRanges = {
        short: [0, 60],      // < 1 hour
        medium: [60, 180],   // 1-3 hours  
        long: [180, Infinity] // > 3 hours
      };
      
      const [minDuration, maxDuration] = durationRanges[preferences.duration];
      
      results.trails = results.trails.filter(trail => {
        if (!trail.duration) return true; // Include if duration unknown
        return trail.duration >= minDuration && trail.duration < maxDuration;
      });
    }

    return results;
  }
}
