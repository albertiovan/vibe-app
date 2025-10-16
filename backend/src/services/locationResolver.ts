/**
 * Location Resolver Service
 * Converts human-readable city names to TripAdvisor location IDs
 */

import { rapidApiClient } from '../clients/rapidapi.js';
import { rapidApiConfig } from '../config/rapidapi.js';
import NodeCache from 'node-cache';

// Cache for 24 hours (86400 seconds)
const locationCache = new NodeCache({ stdTTL: 86400 });

export interface LocationSearchResult {
  locationId: string;
  name: string;
  placeType: string;
  latitude: number;
  longitude: number;
  hierarchy?: string;
}

export interface LocationSearchResponse {
  status: boolean;
  message: string;
  timestamp: number;
  data: Array<{
    locationId: number;
    localizedName: string;
    placeType: string;
    latitude: number;
    longitude: number;
    localizedAdditionalNames?: {
      longOnlyHierarchy?: string;
    };
  }>;
}

export class LocationResolver {
  /**
   * Resolve a city name to TripAdvisor location ID
   * Uses caching to avoid repeated API calls
   */
  public async resolveCityToLocationId(city: string): Promise<string> {
    try {
      // Normalize city name for cache key
      const normalizedCity = city.toLowerCase().trim();
      const cacheKey = `location_id_${normalizedCity}`;
      
      // Check cache first
      const cached = locationCache.get<string>(cacheKey);
      if (cached) {
        console.log(`📍 Using cached location ID for ${city}: ${cached}`);
        return cached;
      }

      // If no RapidAPI client, return default
      if (!rapidApiClient) {
        console.warn('⚠️ RapidAPI client not available, using default location ID');
        return rapidApiConfig.defaultLocationId;
      }

      console.log(`🔍 Resolving location ID for: ${city}`);

      // Call TripAdvisor16 location search endpoint
      const response = await rapidApiClient.get<LocationSearchResponse>('/api/v1/restaurant/searchLocation', {
        query: city,
        language: 'en',
        limit: '5'
      });

      console.log(`📡 Location search response status: ${response.status}`);
      
      if (response.data?.data && response.data.data.length > 0) {
        // Find the best match (prefer exact city matches)
        const locations = response.data.data;
        const bestMatch = this.findBestLocationMatch(locations, city);
        
        if (bestMatch) {
          const locationId = bestMatch.locationId.toString();
          console.log(`✅ Resolved ${city} to location ID: ${locationId} (${bestMatch.localizedName})`);
          
          // Cache the result
          locationCache.set(cacheKey, locationId);
          
          return locationId;
        }
      }

      console.log(`⚠️ No location found for ${city}, using default: ${rapidApiConfig.defaultLocationId}`);
      return rapidApiConfig.defaultLocationId;

    } catch (error) {
      console.error(`❌ Error resolving location for ${city}:`, error);
      console.log(`🔄 Falling back to default location ID: ${rapidApiConfig.defaultLocationId}`);
      return rapidApiConfig.defaultLocationId;
    }
  }

  /**
   * Find the best matching location from search results
   * Prioritizes cities over other place types
   */
  private findBestLocationMatch(
    locations: LocationSearchResponse['data'], 
    searchCity: string
  ): LocationSearchResponse['data'][0] | null {
    if (locations.length === 0) return null;

    const searchCityLower = searchCity.toLowerCase();

    // First, try to find exact city name matches
    const cityMatches = locations.filter(loc => 
      loc.placeType === 'CITY' && 
      loc.localizedName.toLowerCase().includes(searchCityLower.split(',')[0].trim())
    );

    if (cityMatches.length > 0) {
      return cityMatches[0];
    }

    // If no city matches, return the first result
    return locations[0];
  }

  /**
   * Get location details for a given location ID
   */
  public async getLocationDetails(locationId: string): Promise<LocationSearchResult | null> {
    try {
      // For now, we'll use the cached data or make a reverse lookup
      // This could be enhanced with a dedicated endpoint if available
      
      const cacheKey = `location_details_${locationId}`;
      const cached = locationCache.get<LocationSearchResult>(cacheKey);
      
      if (cached) {
        return cached;
      }

      // If it's the default location, return known details
      if (locationId === rapidApiConfig.defaultLocationId) {
        const details: LocationSearchResult = {
          locationId: rapidApiConfig.defaultLocationId,
          name: 'Bucharest',
          placeType: 'CITY',
          latitude: 44.42677,
          longitude: 26.103397,
          hierarchy: 'Romania, Europe'
        };
        
        locationCache.set(cacheKey, details);
        return details;
      }

      return null;
    } catch (error) {
      console.error(`Error getting location details for ${locationId}:`, error);
      return null;
    }
  }

  /**
   * Clear location cache (useful for testing)
   */
  public clearCache(): void {
    locationCache.flushAll();
    console.log('🗑️ Location cache cleared');
  }

  /**
   * Get cache statistics
   */
  public getCacheStats(): { keys: number; hits: number; misses: number } {
    const stats = locationCache.getStats();
    return {
      keys: locationCache.keys().length,
      hits: stats.hits,
      misses: stats.misses
    };
  }
}

// Export singleton instance
export const locationResolver = new LocationResolver();
