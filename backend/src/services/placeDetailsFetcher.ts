/**
 * Google Places Details Fetcher
 * Handles Place Details API calls with concurrency control and error handling
 */

import { Client } from '@googlemaps/google-maps-services-js';
import { PLACES_CONFIG } from '../config/places.types.js';

export interface PlaceDetailsRequest {
  placeId: string;
  fields?: string[];
}

export interface DetailedPlace {
  place_id: string;
  name: string;
  types: string[];
  geometry: {
    location: { lat: number; lng: number };
  };
  rating?: number;
  user_ratings_total?: number;
  formatted_address?: string;
  vicinity?: string;
  photos?: Array<{
    photo_reference: string;
    width: number;
    height: number;
  }>;
  opening_hours?: {
    open_now?: boolean;
    weekday_text?: string[];
  };
  website?: string;
  editorial_summary?: {
    overview?: string;
  };
  // Additional enriched data
  distance_meters?: number;
  fetch_timestamp: number;
  fetch_success: boolean;
  fetch_error?: string;
}

export class PlaceDetailsFetcher {
  private client: Client;
  private apiKey: string;
  private concurrencyLimit: number;
  private requestDelay: number;
  private maxRetries: number;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
    this.client = new Client({});
    this.concurrencyLimit = PLACES_CONFIG.search.maxConcurrency;
    this.requestDelay = PLACES_CONFIG.search.requestDelay;
    this.maxRetries = PLACES_CONFIG.search.maxRetries;
  }

  /**
   * Fetch details for multiple places with concurrency control
   */
  async fetchPlaceDetails(
    placeIds: string[],
    options: {
      fields?: string[];
      batchSize?: number;
      userLocation?: { lat: number; lng: number };
    } = {}
  ): Promise<DetailedPlace[]> {
    const {
      fields = this.getDefaultFields(),
      batchSize = 15,
      userLocation
    } = options;

    console.log(`📋 Fetching details for ${placeIds.length} places`);
    console.log(`⚙️ Concurrency: ${this.concurrencyLimit}, Batch size: ${batchSize}`);

    const allResults: DetailedPlace[] = [];
    
    // Process in batches to manage memory and rate limits
    for (let i = 0; i < placeIds.length; i += batchSize) {
      const batch = placeIds.slice(i, i + batchSize);
      console.log(`📦 Processing batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(placeIds.length / batchSize)}`);
      
      const batchResults = await this.processBatch(batch, fields, userLocation);
      allResults.push(...batchResults);
      
      // Delay between batches to respect rate limits
      if (i + batchSize < placeIds.length) {
        await this.delay(this.requestDelay * 2);
      }
    }

    const successCount = allResults.filter(r => r.fetch_success).length;
    console.log(`✅ Successfully fetched ${successCount}/${placeIds.length} place details`);

    return allResults;
  }

  /**
   * Process a batch of place IDs with controlled concurrency
   */
  private async processBatch(
    placeIds: string[],
    fields: string[],
    userLocation?: { lat: number; lng: number }
  ): Promise<DetailedPlace[]> {
    const results: DetailedPlace[] = [];
    
    // Process with concurrency limit
    for (let i = 0; i < placeIds.length; i += this.concurrencyLimit) {
      const chunk = placeIds.slice(i, i + this.concurrencyLimit);
      
      const chunkPromises = chunk.map(async (placeId, index) => {
        // Stagger requests to avoid rate limiting
        await this.delay(index * 50);
        return this.fetchSinglePlaceDetails(placeId, fields, userLocation);
      });

      const chunkResults = await Promise.allSettled(chunkPromises);
      
      for (const result of chunkResults) {
        if (result.status === 'fulfilled' && result.value) {
          results.push(result.value);
        }
      }
    }

    return results;
  }

  /**
   * Fetch details for a single place with retry logic
   */
  private async fetchSinglePlaceDetails(
    placeId: string,
    fields: string[],
    userLocation?: { lat: number; lng: number },
    retryCount = 0
  ): Promise<DetailedPlace | null> {
    try {
      const response = await this.client.placeDetails({
        params: {
          place_id: placeId,
          fields: fields.join(','),
          key: this.apiKey
        },
        timeout: PLACES_CONFIG.search.timeout
      });

      if (response.data.result) {
        const place = response.data.result;
        const detailedPlace: DetailedPlace = {
          place_id: placeId,
          name: place.name || 'Unknown',
          types: place.types || [],
          geometry: place.geometry || { location: { lat: 0, lng: 0 } },
          rating: place.rating,
          user_ratings_total: place.user_ratings_total,
          formatted_address: place.formatted_address,
          vicinity: place.vicinity,
          photos: place.photos,
          opening_hours: place.opening_hours,
          website: place.website,
          editorial_summary: place.editorial_summary,
          fetch_timestamp: Date.now(),
          fetch_success: true
        };

        // Calculate distance if user location provided
        if (userLocation && place.geometry?.location) {
          detailedPlace.distance_meters = this.calculateDistance(
            userLocation,
            place.geometry.location
          );
        }

        return detailedPlace;
      } else {
        console.warn(`⚠️ No result data for place ${placeId}`);
        return this.createErrorPlace(placeId, 'No result data');
      }

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.warn(`⚠️ Failed to fetch details for place ${placeId}:`, errorMessage);

      // Retry logic
      if (retryCount < this.maxRetries) {
        console.log(`🔄 Retrying place ${placeId} (attempt ${retryCount + 1}/${this.maxRetries})`);
        await this.delay(Math.pow(2, retryCount) * 1000); // Exponential backoff
        return this.fetchSinglePlaceDetails(placeId, fields, userLocation, retryCount + 1);
      }

      return this.createErrorPlace(placeId, errorMessage);
    }
  }

  /**
   * Create an error placeholder for failed requests
   */
  private createErrorPlace(placeId: string, error: string): DetailedPlace {
    return {
      place_id: placeId,
      name: 'Unknown Place',
      types: [],
      geometry: { location: { lat: 0, lng: 0 } },
      fetch_timestamp: Date.now(),
      fetch_success: false,
      fetch_error: error
    };
  }

  /**
   * Get default fields for Place Details API
   */
  private getDefaultFields(): string[] {
    return [
      'name',
      'place_id',
      'geometry',
      'photos',
      'rating',
      'user_ratings_total',
      'formatted_address',
      'opening_hours',
      'types',
      'website',
      'editorial_summary'
    ];
  }

  /**
   * Calculate distance between two points using Haversine formula
   */
  private calculateDistance(
    point1: { lat: number; lng: number },
    point2: { lat: number; lng: number }
  ): number {
    const R = 6371000; // Earth's radius in meters
    const lat1Rad = point1.lat * Math.PI / 180;
    const lat2Rad = point2.lat * Math.PI / 180;
    const deltaLatRad = (point2.lat - point1.lat) * Math.PI / 180;
    const deltaLngRad = (point2.lng - point1.lng) * Math.PI / 180;

    const a = Math.sin(deltaLatRad / 2) * Math.sin(deltaLatRad / 2) +
              Math.cos(lat1Rad) * Math.cos(lat2Rad) *
              Math.sin(deltaLngRad / 2) * Math.sin(deltaLngRad / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    
    return Math.round(R * c); // Distance in meters
  }

  /**
   * Utility method for delays
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Batch fetch with smart error handling and partial results
   */
  async fetchWithFallback(
    placeIds: string[],
    options: {
      fields?: string[];
      userLocation?: { lat: number; lng: number };
      minSuccessRate?: number;
    } = {}
  ): Promise<{
    results: DetailedPlace[];
    successRate: number;
    errors: string[];
  }> {
    const { minSuccessRate = 0.7 } = options;
    
    const results = await this.fetchPlaceDetails(placeIds, options);
    const successful = results.filter(r => r.fetch_success);
    const successRate = successful.length / placeIds.length;
    const errors = results
      .filter(r => !r.fetch_success)
      .map(r => r.fetch_error || 'Unknown error');

    console.log(`📊 Fetch summary: ${successful.length}/${placeIds.length} successful (${Math.round(successRate * 100)}%)`);

    if (successRate < minSuccessRate) {
      console.warn(`⚠️ Success rate ${Math.round(successRate * 100)}% below minimum ${Math.round(minSuccessRate * 100)}%`);
    }

    return {
      results,
      successRate,
      errors: [...new Set(errors)] // Deduplicate errors
    };
  }
}
