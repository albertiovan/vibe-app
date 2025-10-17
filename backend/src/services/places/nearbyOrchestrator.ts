/**
 * Google Places Nearby Search Orchestrator
 * Handles local and nationwide place discovery with filtering and deduplication
 */

import { Client } from '@googlemaps/google-maps-services-js';
import { 
  SearchFilters, 
  VibePlace, 
  ROMANIA_REGIONAL_CENTERS,
  BUCKET_DURATION_HEURISTICS,
  VIBE_TO_PLACES_MAPPING,
  VibeMapping
} from '../../types/vibe.js';

export interface NearbySearchParams {
  origin: { lat: number; lng: number };
  filters: SearchFilters;
  types: string[];
  keywords: string[];
  buckets?: string[];
}

export interface NearbySearchResult {
  places: VibePlace[];
  totalFound: number;
  searchCenters: Array<{ name: string; lat: number; lng: number; resultsCount: number }>;
  deduplicationStats: {
    totalRaw: number;
    duplicatesRemoved: number;
    finalCount: number;
  };
}

// Short TTL cache for repeated searches
interface CacheEntry {
  result: NearbySearchResult;
  timestamp: number;
}

const searchCache = new Map<string, CacheEntry>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

export class NearbyOrchestrator {
  private client: Client;
  private apiKey: string;

  constructor() {
    this.apiKey = process.env.GOOGLE_MAPS_API_KEY || '';
    if (!this.apiKey) {
      throw new Error('Google Maps API key not configured');
    }
    
    this.client = new Client({});
    console.log('🔍 Nearby Orchestrator initialized');
  }

  /**
   * Main orchestration method for nearby search
   */
  async nearbySearch(params: NearbySearchParams): Promise<NearbySearchResult> {
    const { origin, filters, types, keywords, buckets } = params;
    
    console.log('🔍 Nearby search:', {
      origin: `${origin.lat.toFixed(4)}, ${origin.lng.toFixed(4)}`,
      nationwide: filters.nationwide,
      radius: `${filters.radiusMeters / 1000}km`,
      duration: `${filters.durationHours}h`,
      types: types.slice(0, 3),
      keywords: keywords.slice(0, 3)
    });

    // Check cache first
    const cacheKey = this.generateCacheKey(params);
    const cached = searchCache.get(cacheKey);
    
    if (cached && (Date.now() - cached.timestamp) < CACHE_TTL) {
      console.log('🔍 Cache hit for nearby search');
      return cached.result;
    }

    try {
      // Determine search centers
      const searchCenters = filters.nationwide 
        ? this.getRegionalCenters(origin, filters.radiusMeters)
        : [{ name: 'Origin', lat: origin.lat, lng: origin.lng, population: 0 }];

      console.log('🔍 Searching', searchCenters.length, 'centers:', searchCenters.map(c => c.name));

      // Fan out searches across centers and types/keywords
      const allResults = await this.fanOutSearches(searchCenters, filters, types, keywords);
      
      // Merge and deduplicate results
      const { places, deduplicationStats } = this.mergeAndDeduplicate(allResults, origin, filters);
      
      // Apply duration filtering and scoring
      const filteredPlaces = this.applyDurationFiltering(places, filters, buckets);
      
      // Enrich with photos and maps URLs
      const enrichedPlaces = await this.enrichWithDetails(filteredPlaces);

      const result: NearbySearchResult = {
        places: enrichedPlaces,
        totalFound: enrichedPlaces.length,
        searchCenters: searchCenters.map(center => ({
          name: center.name,
          lat: center.lat,
          lng: center.lng,
          resultsCount: allResults.filter(r => r.centerName === center.name).length
        })),
        deduplicationStats
      };

      // Cache the result
      searchCache.set(cacheKey, {
        result,
        timestamp: Date.now()
      });

      console.log('🔍 Nearby search complete:', {
        totalPlaces: result.places.length,
        searchCenters: result.searchCenters.length,
        duplicatesRemoved: result.deduplicationStats.duplicatesRemoved
      });

      return result;

    } catch (error) {
      console.error('🔍 Nearby search failed:', error);
      throw error;
    }
  }

  /**
   * Generate cache key for search parameters
   */
  private generateCacheKey(params: NearbySearchParams): string {
    const { origin, filters, types, keywords } = params;
    return `nearby_${origin.lat.toFixed(3)}_${origin.lng.toFixed(3)}_${filters.radiusMeters}_${filters.durationHours}_${filters.nationwide}_${types.sort().join(',')}_${keywords.sort().join(',')}`;
  }

  /**
   * Get regional centers for nationwide search
   */
  private getRegionalCenters(origin: { lat: number; lng: number }, maxDistance: number): typeof ROMANIA_REGIONAL_CENTERS {
    return ROMANIA_REGIONAL_CENTERS.filter(center => {
      const distance = this.calculateDistance(origin, center);
      return distance <= maxDistance / 1000; // Convert meters to km
    }).sort((a, b) => {
      // Sort by population (larger cities first)
      return b.population - a.population;
    }).slice(0, 6); // Limit to top 6 centers to avoid API quota issues
  }

  /**
   * Fan out searches across centers and types/keywords
   */
  private async fanOutSearches(
    centers: Array<{ name: string; lat: number; lng: number }>,
    filters: SearchFilters,
    types: string[],
    keywords: string[]
  ): Promise<Array<{ place: any; centerName: string; searchType: string }>> {
    const allResults: Array<{ place: any; centerName: string; searchType: string }> = [];
    const concurrencyLimit = 4; // Limit concurrent API calls

    // Prepare search queries
    const searchQueries: Array<{
      center: { name: string; lat: number; lng: number };
      type?: string;
      keyword?: string;
      searchType: string;
    }> = [];

    for (const center of centers) {
      // Add type-based searches
      for (const type of types.slice(0, 3)) { // Limit types to avoid quota issues
        searchQueries.push({
          center,
          type,
          searchType: `type:${type}`
        });
      }

      // Add keyword-based searches
      for (const keyword of keywords.slice(0, 2)) { // Limit keywords
        searchQueries.push({
          center,
          keyword,
          searchType: `keyword:${keyword}`
        });
      }
    }

    console.log('🔍 Executing', searchQueries.length, 'search queries');

    // Execute searches in batches
    for (let i = 0; i < searchQueries.length; i += concurrencyLimit) {
      const batch = searchQueries.slice(i, i + concurrencyLimit);
      
      const batchResults = await Promise.allSettled(
        batch.map(query => this.executeNearbySearch(query, filters))
      );

      for (let j = 0; j < batchResults.length; j++) {
        const result = batchResults[j];
        const query = batch[j];
        
        if (result.status === 'fulfilled' && result.value) {
          for (const place of result.value) {
            allResults.push({
              place,
              centerName: query.center.name,
              searchType: query.searchType
            });
          }
        } else if (result.status === 'rejected') {
          console.warn('🔍 Search failed for', query.searchType, 'at', query.center.name, ':', result.reason);
        }
      }
    }

    return allResults;
  }

  /**
   * Execute a single nearby search query
   */
  private async executeNearbySearch(
    query: {
      center: { name: string; lat: number; lng: number };
      type?: string;
      keyword?: string;
    },
    filters: SearchFilters
  ): Promise<any[]> {
    try {
      const params: any = {
        location: { lat: query.center.lat, lng: query.center.lng },
        key: this.apiKey,
        // Field mask to optimize API usage and reduce billing
        fields: [
          'place_id',
          'name', 
          'geometry',
          'types',
          'rating',
          'user_ratings_total',
          'price_level',
          'vicinity',
          'opening_hours',
          'photos'
        ]
      };

      // Configure search parameters based on Google Places API requirements
      if (query.type) {
        params.type = query.type;
        params.radius = Math.min(filters.radiusMeters, 50000); // Max 50km for type searches
      } else if (query.keyword) {
        params.keyword = query.keyword;
        params.rankby = 'distance'; // When using rankby=distance, omit radius
      }

      console.log('🔍 Searching', query.center.name, 'for', query.type || query.keyword, 'with field mask');

      const response = await this.client.placesNearby({ params });
      
      if (response.data.results) {
        console.log('🔍 Found', response.data.results.length, 'places in', query.center.name);
        return response.data.results;
      }

      return [];

    } catch (error) {
      console.warn('🔍 Nearby search API error:', error);
      return [];
    }
  }

  /**
   * Merge results and deduplicate by place_id
   */
  private mergeAndDeduplicate(
    results: Array<{ place: any; centerName: string; searchType: string }>,
    origin: { lat: number; lng: number },
    filters: SearchFilters
  ): { places: VibePlace[]; deduplicationStats: any } {
    const placeMap = new Map<string, VibePlace>();
    const totalRaw = results.length;

    for (const result of results) {
      const place = result.place;
      
      if (!place.place_id) continue;

      // Calculate distance from origin
      const distance = this.calculateDistance(origin, place.geometry.location);
      
      // Skip if too far from origin (for local searches)
      if (!filters.nationwide && distance > filters.radiusMeters / 1000) {
        continue;
      }

      // Convert to VibePlace format
      const vibePlace: VibePlace = {
        placeId: place.place_id,
        name: place.name,
        types: place.types || [],
        rating: place.rating,
        userRatingsTotal: place.user_ratings_total,
        priceLevel: place.price_level,
        vicinity: place.vicinity,
        geometry: place.geometry,
        photos: place.photos?.map((photo: any) => ({
          photoReference: photo.photo_reference,
          width: photo.width,
          height: photo.height,
          htmlAttributions: photo.html_attributions
        })),
        openingHours: place.opening_hours,
        mapsUrl: `https://www.google.com/maps/search/?api=1&query_place_id=${place.place_id}`,
        walkingTime: Math.round(distance * 12), // Rough estimate: 12 min per km
        // Add search metadata
        vibeScore: 0.8, // Will be refined later
        vibeReasons: [`Found via ${result.searchType} in ${result.centerName}`],
        estimatedDuration: '1-3 hours', // Will be refined based on bucket
        energyLevel: 'medium',
        socialLevel: 'social'
      };

      // Only keep the best version of each place (highest rating or first found)
      if (!placeMap.has(place.place_id) || 
          (vibePlace.rating && vibePlace.rating > (placeMap.get(place.place_id)?.rating || 0))) {
        placeMap.set(place.place_id, vibePlace);
      }
    }

    const places = Array.from(placeMap.values());
    
    return {
      places,
      deduplicationStats: {
        totalRaw,
        duplicatesRemoved: totalRaw - places.length,
        finalCount: places.length
      }
    };
  }

  /**
   * Apply duration filtering and scoring
   */
  private applyDurationFiltering(
    places: VibePlace[],
    filters: SearchFilters,
    buckets?: string[]
  ): VibePlace[] {
    return places.map(place => {
      // Determine bucket from place types
      const bucket = this.inferBucketFromTypes(place.types, buckets);
      const durationHeuristic = BUCKET_DURATION_HEURISTICS[bucket];
      
      if (durationHeuristic) {
        // Score based on how well the typical duration fits the filter
        const durationFit = this.calculateDurationFit(durationHeuristic.typical, filters.durationHours);
        place.vibeScore = (place.vibeScore || 0.8) * durationFit;
        place.estimatedDuration = `${durationHeuristic.min}-${durationHeuristic.max} hours`;
      }

      return place;
    }).sort((a, b) => (b.vibeScore || 0) - (a.vibeScore || 0));
  }

  /**
   * Infer activity bucket from Google Places types
   */
  private inferBucketFromTypes(types: string[], preferredBuckets?: string[]): string {
    // Check preferred buckets first
    if (preferredBuckets) {
      for (const bucket of preferredBuckets) {
        const mapping = VIBE_TO_PLACES_MAPPING[bucket];
        if (mapping && types.some(type => mapping.types.includes(type))) {
          return bucket;
        }
      }
    }

    // Fallback to type-based inference
    if (types.includes('museum') || types.includes('art_gallery')) return 'culture';
    if (types.includes('park') || types.includes('natural_feature')) return 'nature';
    if (types.includes('amusement_park') || types.includes('gym')) return 'adrenaline';
    if (types.includes('spa') || types.includes('beauty_salon')) return 'wellness';
    if (types.includes('night_club') || types.includes('bar')) return 'nightlife';
    if (types.includes('restaurant') || types.includes('cafe')) return 'food';
    
    return 'entertainment'; // Default bucket
  }

  /**
   * Calculate how well a typical duration fits the requested duration
   */
  private calculateDurationFit(typical: number, requested: number): number {
    const ratio = Math.min(typical, requested) / Math.max(typical, requested);
    return 0.5 + (ratio * 0.5); // Score between 0.5 and 1.0
  }

  /**
   * Enrich places with photos and detailed information
   */
  private async enrichWithDetails(places: VibePlace[]): Promise<VibePlace[]> {
    const enrichedPlaces: VibePlace[] = [];
    const concurrencyLimit = 4;

    console.log('🔍 Enriching', places.length, 'places with details');

    for (let i = 0; i < places.length; i += concurrencyLimit) {
      const batch = places.slice(i, i + concurrencyLimit);
      
      const enrichedBatch = await Promise.allSettled(
        batch.map(place => this.enrichSinglePlace(place))
      );

      for (let j = 0; j < enrichedBatch.length; j++) {
        const result = enrichedBatch[j];
        if (result.status === 'fulfilled') {
          enrichedPlaces.push(result.value);
        } else {
          console.warn('🔍 Failed to enrich place:', batch[j].name);
          enrichedPlaces.push(batch[j]); // Use original place
        }
      }
    }

    return enrichedPlaces;
  }

  /**
   * Enrich a single place with Place Details API
   */
  private async enrichSinglePlace(place: VibePlace): Promise<VibePlace> {
    try {
      const response = await this.client.placeDetails({
        params: {
          place_id: place.placeId,
          fields: [
            'place_id', 'name', 'photos', 'geometry', 'types',
            'rating', 'user_ratings_total', 'price_level',
            'opening_hours', 'website', 'editorial_summary',
            'formatted_address'
          ],
          key: this.apiKey
        }
      });

      const details = response.data.result;
      
      // Build image URL from first photo
      let imageUrl: string | undefined;
      let photoAttribution: string | undefined;
      
      if (details.photos && details.photos.length > 0) {
        const photo = details.photos[0];
        const maxWidth = parseInt(process.env.PHOTOS_MAX_WIDTH || '800', 10);
        
        imageUrl = `/api/places/photo?ref=${encodeURIComponent(photo.photo_reference)}&maxwidth=${maxWidth}`;
        photoAttribution = photo.html_attributions?.[0] || undefined;
      }

      return {
        ...place,
        imageUrl,
        photoAttribution,
        rating: details.rating || place.rating,
        userRatingsTotal: details.user_ratings_total || place.userRatingsTotal,
        vicinity: details.formatted_address || place.vicinity,
        photos: details.photos?.map(photo => ({
          photoReference: photo.photo_reference,
          width: photo.width,
          height: photo.height,
          htmlAttributions: photo.html_attributions
        })) || place.photos
      };

    } catch (error) {
      console.warn('🔍 Place details failed for:', place.name, error);
      return place;
    }
  }

  /**
   * Calculate distance between two points using Haversine formula
   */
  private calculateDistance(
    point1: { lat: number; lng: number },
    point2: { lat: number; lng: number }
  ): number {
    const R = 6371; // Earth's radius in kilometers
    const dLat = this.toRadians(point2.lat - point1.lat);
    const dLng = this.toRadians(point2.lng - point1.lng);
    
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(this.toRadians(point1.lat)) * Math.cos(this.toRadians(point2.lat)) *
              Math.sin(dLng / 2) * Math.sin(dLng / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  /**
   * Convert degrees to radians
   */
  private toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  /**
   * Clear search cache (for debugging)
   */
  clearCache(): void {
    searchCache.clear();
    console.log('🔍 Nearby search cache cleared');
  }

  /**
   * Get cache statistics
   */
  getCacheStats(): any {
    const now = Date.now();
    const entries = Array.from(searchCache.entries());
    
    return {
      totalEntries: entries.length,
      validEntries: entries.filter(([, entry]) => (now - entry.timestamp) < CACHE_TTL).length,
      expiredEntries: entries.filter(([, entry]) => (now - entry.timestamp) >= CACHE_TTL).length,
      cacheTTL: CACHE_TTL / 1000 // in seconds
    };
  }
}
