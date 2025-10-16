/**
 * Google Places Multi-Query Orchestrator
 * Handles Text Search + Nearby Search coordination with deduplication
 */

import { Client } from '@googlemaps/google-maps-services-js';
import { 
  ACTIVITY_TYPES_ALLOWLIST, 
  FOOD_TYPES_BLOCKLIST, 
  ACTIVITY_KEYWORDS,
  PLACES_CONFIG,
  hasFoodType,
  hasActivityType
} from '../config/places.types.js';

export interface SearchLocation {
  lat: number;
  lng: number;
  radius?: number;
  city?: string;
}

export interface SearchOptions {
  includeFoodTypes?: boolean;
  maxResults?: number;
  minRating?: number;
  prioritizeActivities?: boolean;
}

export interface RawPlaceResult {
  place_id: string;
  name: string;
  types: string[];
  geometry: {
    location: { lat: number; lng: number };
  };
  rating?: number;
  user_ratings_total?: number;
  vicinity?: string;
  formatted_address?: string;
  photos?: Array<{
    photo_reference: string;
    width: number;
    height: number;
  }>;
  opening_hours?: {
    open_now?: boolean;
  };
  source: 'text_search' | 'nearby_search';
  search_query?: string;
}

export class PlacesOrchestrator {
  private client: Client;
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
    this.client = new Client({});
  }

  /**
   * Main orchestration method - runs all search strategies and deduplicates
   */
  async searchActivities(
    location: SearchLocation,
    options: SearchOptions = {}
  ): Promise<RawPlaceResult[]> {
    const {
      includeFoodTypes = false,
      maxResults = 50,
      prioritizeActivities = true
    } = options;

    console.log('🔍 Starting multi-query orchestration:', {
      location: location.city || `${location.lat},${location.lng}`,
      includeFoodTypes,
      maxResults,
      prioritizeActivities
    });

    // Run all search strategies in parallel
    const [
      primaryResults,
      nearbyResults,
      keywordResults
    ] = await Promise.allSettled([
      this.runPrimaryTextSearch(location),
      this.runNearbyFanoutSearches(location),
      this.runKeywordExpandedSearches(location)
    ]);

    // Collect all results
    const allResults: RawPlaceResult[] = [];
    
    if (primaryResults.status === 'fulfilled') {
      allResults.push(...primaryResults.value);
    } else {
      console.warn('⚠️ Primary text search failed:', primaryResults.reason);
    }

    if (nearbyResults.status === 'fulfilled') {
      allResults.push(...nearbyResults.value);
    } else {
      console.warn('⚠️ Nearby searches failed:', nearbyResults.reason);
    }

    if (keywordResults.status === 'fulfilled') {
      allResults.push(...keywordResults.value);
    } else {
      console.warn('⚠️ Keyword searches failed:', keywordResults.reason);
    }

    console.log(`📊 Raw results collected: ${allResults.length}`);

    // Deduplicate by place_id
    const deduplicatedResults = this.deduplicateResults(allResults);
    console.log(`🔄 After deduplication: ${deduplicatedResults.length}`);

    // Apply filtering
    const filteredResults = this.filterResults(deduplicatedResults, {
      includeFoodTypes,
      prioritizeActivities,
      minRating: options.minRating
    });
    console.log(`🎯 After filtering: ${filteredResults.length}`);

    // Sort and limit results
    const sortedResults = this.sortResults(filteredResults, prioritizeActivities);
    const finalResults = sortedResults.slice(0, maxResults);

    console.log(`✅ Final results: ${finalResults.length}`);
    return finalResults;
  }

  /**
   * Primary text search: "things to do in {CITY}"
   */
  private async runPrimaryTextSearch(location: SearchLocation): Promise<RawPlaceResult[]> {
    const query = location.city ? 
      `things to do in ${location.city}` : 
      `things to do near ${location.lat},${location.lng}`;

    try {
      const response = await this.client.textSearch({
        params: {
          query,
          type: 'tourist_attraction',
          location: { lat: location.lat, lng: location.lng },
          radius: location.radius || PLACES_CONFIG.search.defaultRadius,
          key: this.apiKey
        }
      });

      const results = (response.data.results || []).map(place => ({
        ...place,
        source: 'text_search' as const,
        search_query: query,
        place_id: place.place_id ?? undefined
      }));

      console.log(`🎯 Primary text search: ${results.length} results`);
      return results;

    } catch (error) {
      console.error('❌ Primary text search failed:', error);
      return [];
    }
  }

  /**
   * Nearby fan-out searches for each activity type
   */
  private async runNearbyFanoutSearches(location: SearchLocation): Promise<RawPlaceResult[]> {
    const radius = location.radius || PLACES_CONFIG.search.defaultRadius;
    const maxConcurrency = PLACES_CONFIG.search.maxConcurrency;
    
    // Limit to top activity types to avoid rate limits
    const typesToSearch = ACTIVITY_TYPES_ALLOWLIST.slice(0, 8);
    const allResults: RawPlaceResult[] = [];

    // Process in batches to respect concurrency limits
    for (let i = 0; i < typesToSearch.length; i += maxConcurrency) {
      const batch = typesToSearch.slice(i, i + maxConcurrency);
      
      const batchPromises = batch.map(async (type) => {
        try {
          await this.delay(50); // Rate limiting
          
          const response = await this.client.placesNearby({
            params: {
              location: { lat: location.lat, lng: location.lng },
              radius,
              type: type as any,
              key: this.apiKey
            }
          });

          const results = (response.data.results || [])
            .filter(place => place.place_id) // Filter out places without place_id
            .map(place => ({
              ...place,
              place_id: place.place_id!, // Assert non-null since we filtered
              source: 'nearby_search' as const,
              search_query: `nearby:${type}`
            }));

          console.log(`📍 Nearby search [${type}]: ${results.length} results`);
          return results;

        } catch (error) {
          console.warn(`⚠️ Nearby search failed for type ${type}:`, error);
          return [];
        }
      });

      const batchResults = await Promise.all(batchPromises);
      allResults.push(...batchResults.flat());
    }

    console.log(`📍 Total nearby results: ${allResults.length}`);
    return allResults;
  }

  /**
   * Keyword-expanded text searches
   */
  private async runKeywordExpandedSearches(location: SearchLocation): Promise<RawPlaceResult[]> {
    const keywords = ACTIVITY_KEYWORDS.slice(0, 6); // Limit to avoid rate limits
    const allResults: RawPlaceResult[] = [];

    for (const keyword of keywords) {
      try {
        await this.delay(100); // Rate limiting

        const query = location.city ? 
          `${keyword} in ${location.city}` : 
          `${keyword} near ${location.lat},${location.lng}`;

        const response = await this.client.textSearch({
          params: {
            query,
            location: { lat: location.lat, lng: location.lng },
            radius: location.radius || PLACES_CONFIG.search.defaultRadius,
            key: this.apiKey
          }
        });

        const results = (response.data.results || [])
          .filter(place => place.place_id) // Filter out places without place_id
          .map(place => ({
            ...place,
            place_id: place.place_id!, // Assert non-null since we filtered
            source: 'text_search' as const,
            search_query: query
          }));

        console.log(`🔍 Keyword search [${keyword}]: ${results.length} results`);
        allResults.push(...results);

      } catch (error) {
        console.warn(`⚠️ Keyword search failed for "${keyword}":`, error);
      }
    }

    console.log(`🔍 Total keyword results: ${allResults.length}`);
    return allResults;
  }

  /**
   * Deduplicate results by place_id, preserving highest quality data
   */
  private deduplicateResults(results: RawPlaceResult[]): RawPlaceResult[] {
    const placeMap = new Map<string, RawPlaceResult>();

    for (const place of results) {
      const existing = placeMap.get(place.place_id);
      
      if (!existing) {
        placeMap.set(place.place_id, place);
      } else {
        // Merge data, preferring more complete information
        const merged = this.mergePlace(existing, place);
        placeMap.set(place.place_id, merged);
      }
    }

    return Array.from(placeMap.values());
  }

  /**
   * Merge two place results, preserving the best data from each
   */
  private mergePlace(existing: RawPlaceResult, newPlace: RawPlaceResult): RawPlaceResult {
    return {
      ...existing,
      // Prefer more complete data
      rating: newPlace.rating || existing.rating,
      user_ratings_total: newPlace.user_ratings_total || existing.user_ratings_total,
      formatted_address: newPlace.formatted_address || existing.formatted_address,
      vicinity: newPlace.vicinity || existing.vicinity,
      photos: newPlace.photos || existing.photos,
      opening_hours: newPlace.opening_hours || existing.opening_hours,
      // Combine types arrays
      types: [...new Set([...existing.types, ...newPlace.types])],
      // Keep track of search sources
      search_query: existing.search_query + '; ' + (newPlace.search_query || '')
    };
  }

  /**
   * Filter results based on food types and quality criteria
   */
  private filterResults(
    results: RawPlaceResult[], 
    options: {
      includeFoodTypes?: boolean;
      prioritizeActivities?: boolean;
      minRating?: number;
    }
  ): RawPlaceResult[] {
    return results.filter(place => {
      // Filter by food types
      if (!options.includeFoodTypes && hasFoodType(place.types)) {
        return false;
      }

      // Filter by minimum rating
      if (options.minRating && place.rating && place.rating < options.minRating) {
        return false;
      }

      // If prioritizing activities, require at least one activity type
      if (options.prioritizeActivities && !hasActivityType(place.types)) {
        // Allow if it's not a food type (could be a general point of interest)
        return !hasFoodType(place.types);
      }

      return true;
    });
  }

  /**
   * Sort results prioritizing activities and quality
   */
  private sortResults(results: RawPlaceResult[], prioritizeActivities: boolean): RawPlaceResult[] {
    return results.sort((a, b) => {
      // Priority 1: Activity types over others (if prioritizing)
      if (prioritizeActivities) {
        const aIsActivity = hasActivityType(a.types);
        const bIsActivity = hasActivityType(b.types);
        
        if (aIsActivity && !bIsActivity) return -1;
        if (!aIsActivity && bIsActivity) return 1;
      }

      // Priority 2: Rating (higher is better)
      const aRating = a.rating || 0;
      const bRating = b.rating || 0;
      if (aRating !== bRating) return bRating - aRating;

      // Priority 3: Number of reviews (more is better)
      const aReviews = a.user_ratings_total || 0;
      const bReviews = b.user_ratings_total || 0;
      if (aReviews !== bReviews) return bReviews - aReviews;

      // Priority 4: Alphabetical by name
      return a.name.localeCompare(b.name);
    });
  }

  /**
   * Utility method for rate limiting
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
