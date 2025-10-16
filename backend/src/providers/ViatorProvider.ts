/**
 * Viator Provider Implementation
 * TripAdvisor Experiences API integration
 * 
 * TODO: Implement based on openapi.json specification
 */

import {
  ActivitiesProvider,
  ProviderErrorCode
} from '../interfaces/ActivitiesProvider.js';
import {
  ActivityProviderId,
  ActivitySummary,
  ActivityDetails,
  ActivitySearchFilters,
  ActivitySearchResult,
  ActivityAvailability,
  ActivityReview,
  ProviderCapabilities,
  ProviderError,
  ProviderResponse
} from '../domain/activities.js';
import { getProviderConfig } from '../config/providers.js';

export class ViatorProvider implements ActivitiesProvider {
  readonly providerId: ActivityProviderId = 'viator';
  readonly name: string = 'Viator (TripAdvisor Experiences)';
  
  private config = getProviderConfig('viator');
  private baseUrl: string;
  private apiKey: string;
  private partnerId?: string;

  constructor() {
    if (!this.config?.enabled) {
      throw new Error('Viator provider is not enabled or configured');
    }
    
    // Use sandbox for development, production for live
    const isProduction = process.env.NODE_ENV === 'production';
    this.baseUrl = isProduction 
      ? 'https://api.viator.com/partner'
      : 'https://api.sandbox.viator.com/partner';
    
    this.apiKey = this.config.apiKey || '';
    this.partnerId = this.config.providerSpecific?.partnerId;
    
    if (!this.apiKey) {
      console.warn('⚠️ Viator API key not configured');
    }
    
    console.log(`🔌 Viator Provider initialized: ${isProduction ? 'Production' : 'Sandbox'} mode`);
  }

  getCapabilities(): ProviderCapabilities {
    return {
      providerId: 'viator',
      name: 'Viator (TripAdvisor Experiences)',
      features: {
        search: true,
        details: true,
        availability: true,
        reviews: true,
        booking: this.config?.features?.booking || false,
        realTimeAvailability: true
      },
      coverage: {
        global: true,
        countries: ['US', 'GB', 'FR', 'IT', 'ES', 'DE', 'RO'], // Romania included
        cities: ['bucharest', 'paris', 'london', 'rome', 'barcelona']
      },
      supportedTypes: [
        'tour',
        'experience',
        'attraction',
        'outdoor',
        'cultural',
        'food',
        'adventure',
        'entertainment',
        'transportation'
      ],
      rateLimit: {
        requestsPerMinute: this.config?.rateLimit?.requestsPerMinute || 60,
        requestsPerDay: this.config?.rateLimit?.requestsPerDay || 10000
      },
      dataQuality: {
        averagePhotosPerActivity: 8,
        reviewCoverage: 85, // percentage
        realTimeData: true
      }
    };
  }

  isAvailable(): boolean {
    return Boolean(this.config?.enabled && this.apiKey);
  }

  async searchActivitiesByCity(
    cityQuery: string | { lat: number; lng: number } | { cityId: string },
    filters?: ActivitySearchFilters
  ): Promise<ProviderResponse<ActivitySearchResult>> {
    try {
      console.log('🔍 Viator: Searching activities for', cityQuery);
      
      // First, search for attractions to get destination info
      const attractionsResponse = await this.searchAttractions(cityQuery);
      
      if (!attractionsResponse.success || !attractionsResponse.data?.length) {
        return {
          success: true,
          data: {
            activities: [],
            totalCount: 0,
            hasMore: false,
            filters: filters || {},
            providerId: 'viator'
          }
        };
      }
      
      // Use the first attraction's destination ID to search for products
      const destinationId = attractionsResponse.data[0].destinationId;
      
      // Build search request for products
      const searchRequest = {
        filtering: {
          destinations: [destinationId],
          ...(filters?.types && { productTypes: this.mapActivityTypesToViator(filters.types) }),
          ...(filters?.minPrice && { lowestPrice: filters.minPrice }),
          ...(filters?.maxPrice && { highestPrice: filters.maxPrice }),
          ...(filters?.minRating && { rating: { from: filters.minRating } })
        },
        sorting: {
          sort: this.mapSortToViator(filters?.sortBy || 'popularity'),
          order: 'DESC'
        },
        pagination: {
          start: filters?.offset || 0,
          count: Math.min(filters?.limit || 20, 100) // Viator max is 100
        }
      };
      
      const response = await this.makeRequest('/products/search', {
        method: 'POST',
        body: JSON.stringify(searchRequest)
      });
      
      if (!response.ok) {
        throw new Error(`Viator API error: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json() as any;
      
      // Transform Viator products to our ActivitySummary format
      const activities = data.products?.map((product: any) => this.transformProductToActivity(product)) || [];
      
      return {
        success: true,
        data: {
          activities,
          totalCount: data.totalCount || activities.length,
          hasMore: data.totalCount > (filters?.offset || 0) + activities.length,
          filters: filters || {},
          providerId: 'viator'
        },
        metadata: {
          requestId: response.headers.get('X-Unique-ID') || undefined,
          processingTime: Date.now() - Date.now(), // TODO: Track actual time
          quotaRemaining: parseInt(response.headers.get('RateLimit-Remaining') || '0')
        }
      };
      
    } catch (error) {
      return this.handleError(error, 'searchActivitiesByCity');
    }
  }

  async getActivityDetails(activityId: string): Promise<ProviderResponse<ActivityDetails>> {
    try {
      // TODO: Implement based on openapi.json
      // Expected endpoint: GET /v1/product/{productCode}
      
      console.log('📋 Viator: Getting details for activity', activityId);
      
      return {
        success: false,
        error: {
          providerId: 'viator',
          code: ProviderErrorCode.FEATURE_NOT_SUPPORTED,
          message: 'Viator provider not yet implemented - waiting for openapi.json analysis',
          retryable: false,
          timestamp: new Date().toISOString()
        }
      };
      
    } catch (error) {
      return this.handleError(error, 'getActivityDetails');
    }
  }

  async getActivityAvailability(
    activityId: string,
    dateRange?: { startDate: string; endDate: string }
  ): Promise<ProviderResponse<ActivityAvailability>> {
    try {
      // TODO: Implement based on openapi.json
      // Expected endpoint: GET /v1/booking/availability
      
      console.log('📅 Viator: Checking availability for', activityId, dateRange);
      
      return {
        success: false,
        error: {
          providerId: 'viator',
          code: ProviderErrorCode.FEATURE_NOT_SUPPORTED,
          message: 'Viator provider not yet implemented - waiting for openapi.json analysis',
          retryable: false,
          timestamp: new Date().toISOString()
        }
      };
      
    } catch (error) {
      return this.handleError(error, 'getActivityAvailability');
    }
  }

  async getActivityReviews(
    activityId: string,
    options?: {
      limit?: number;
      offset?: number;
      sort?: 'newest' | 'oldest' | 'rating_high' | 'rating_low' | 'helpful';
      language?: string;
    }
  ): Promise<ProviderResponse<ActivityReview[]>> {
    try {
      // TODO: Implement based on openapi.json
      // Expected endpoint: GET /v1/product/{productCode}/reviews
      
      console.log('💬 Viator: Getting reviews for', activityId, options);
      
      return {
        success: false,
        error: {
          providerId: 'viator',
          code: ProviderErrorCode.FEATURE_NOT_SUPPORTED,
          message: 'Viator provider not yet implemented - waiting for openapi.json analysis',
          retryable: false,
          timestamp: new Date().toISOString()
        }
      };
      
    } catch (error) {
      return this.handleError(error, 'getActivityReviews');
    }
  }

  async getFeaturedActivities(
    cityQuery: string | { lat: number; lng: number },
    limit?: number
  ): Promise<ProviderResponse<ActivitySummary[]>> {
    try {
      // TODO: Implement based on openapi.json
      // Expected endpoint: GET /v1/search/products with featured flag
      
      console.log('⭐ Viator: Getting featured activities for', cityQuery);
      
      return {
        success: false,
        error: {
          providerId: 'viator',
          code: ProviderErrorCode.FEATURE_NOT_SUPPORTED,
          message: 'Viator provider not yet implemented - waiting for openapi.json analysis',
          retryable: false,
          timestamp: new Date().toISOString()
        }
      };
      
    } catch (error) {
      return this.handleError(error, 'getFeaturedActivities');
    }
  }

  async getCategories(): Promise<ProviderResponse<{ id: string; name: string; description?: string; activityCount?: number; }[]>> {
    try {
      // TODO: Implement based on openapi.json
      // Expected endpoint: GET /v1/taxonomy/categories
      
      console.log('📂 Viator: Getting categories');
      
      return {
        success: false,
        error: {
          providerId: 'viator',
          code: ProviderErrorCode.FEATURE_NOT_SUPPORTED,
          message: 'Viator provider not yet implemented - waiting for openapi.json analysis',
          retryable: false,
          timestamp: new Date().toISOString()
        }
      };
      
    } catch (error) {
      return this.handleError(error, 'getCategories');
    }
  }

  async healthCheck(): Promise<ProviderResponse<{
    status: 'healthy' | 'degraded' | 'unhealthy';
    responseTime?: number;
    lastSuccessfulCall?: string;
    errorRate?: number;
  }>> {
    try {
      const startTime = Date.now();
      
      // TODO: Implement proper health check based on openapi.json
      // Could use a lightweight endpoint like GET /v1/taxonomy/destinations
      
      if (!this.isAvailable()) {
        return {
          success: true,
          data: {
            status: 'unhealthy',
            responseTime: Date.now() - startTime
          }
        };
      }
      
      return {
        success: true,
        data: {
          status: 'degraded', // Until properly implemented
          responseTime: Date.now() - startTime
        }
      };
      
    } catch (error) {
      return this.handleError(error, 'healthCheck');
    }
  }

  private handleError(error: any, operation: string): ProviderResponse<any> {
    console.error(`❌ Viator ${operation} error:`, error);
    
    const providerError: ProviderError = {
      providerId: 'viator',
      code: ProviderErrorCode.UNKNOWN_ERROR,
      message: error.message || 'Unknown error occurred',
      details: error,
      retryable: false,
      timestamp: new Date().toISOString()
    };

    // Determine error type and retryability
    if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
      providerError.code = ProviderErrorCode.NETWORK_ERROR;
      providerError.retryable = true;
    } else if (error.status === 401) {
      providerError.code = ProviderErrorCode.INVALID_API_KEY;
      providerError.retryable = false;
    } else if (error.status === 429) {
      providerError.code = ProviderErrorCode.RATE_LIMITED;
      providerError.retryable = true;
    } else if (error.status === 404) {
      providerError.code = ProviderErrorCode.NOT_FOUND;
      providerError.retryable = false;
    }

    return {
      success: false,
      error: providerError
    };
  }

  /**
   * Helper method to make authenticated requests to Viator API
   * Based on openapi.json authentication requirements
   */
  private async makeRequest(endpoint: string, options: RequestInit = {}): Promise<Response> {
    const url = `${this.baseUrl}${endpoint}`;
    
    const headers = {
      'Accept': 'application/json;version=2.0',
      'Content-Type': 'application/json;version=2.0',
      'exp-api-key': this.apiKey, // Based on openapi.json security scheme
      'Accept-Language': 'en-US',
      ...(options.headers || {})
    };

    const requestOptions: RequestInit = {
      ...options,
      headers
    };

    // Use AbortController for timeout instead of timeout property
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.config?.timeout || 15000);
    
    try {
      const response = await fetch(url, {
        ...requestOptions,
        signal: controller.signal
      });
      clearTimeout(timeoutId);
      return response;
    } catch (error) {
      clearTimeout(timeoutId);
      throw error;
    }
  }

  /**
   * Search for attractions to get destination IDs
   */
  private async searchAttractions(cityQuery: string | { lat: number; lng: number } | { cityId: string }): Promise<ProviderResponse<any[]>> {
    try {
      let searchRequest: any = {};
      
      if (typeof cityQuery === 'string') {
        searchRequest = { searchText: cityQuery };
      } else if ('lat' in cityQuery) {
        searchRequest = { 
          location: {
            latitude: cityQuery.lat,
            longitude: cityQuery.lng
          }
        };
      } else if ('cityId' in cityQuery) {
        searchRequest = { destinationId: parseInt(cityQuery.cityId) };
      }
      
      const response = await this.makeRequest('/attractions/search', {
        method: 'POST',
        body: JSON.stringify(searchRequest)
      });
      
      if (!response.ok) {
        throw new Error(`Viator attractions search error: ${response.status}`);
      }
      
      const data = await response.json() as any;
      
      return {
        success: true,
        data: data.attractions || []
      };
      
    } catch (error) {
      return this.handleError(error, 'searchAttractions');
    }
  }

  /**
   * Map our activity types to Viator product types
   */
  private mapActivityTypesToViator(types: string[]): string[] {
    const typeMap: Record<string, string> = {
      'tour': 'TOUR',
      'experience': 'EXPERIENCE',
      'attraction': 'ATTRACTION',
      'outdoor': 'OUTDOOR_ACTIVITIES',
      'cultural': 'CULTURAL',
      'food': 'FOOD_AND_DRINK',
      'adventure': 'ADVENTURE',
      'entertainment': 'ENTERTAINMENT',
      'transportation': 'TRANSPORTATION'
    };
    
    return types.map(type => typeMap[type] || type.toUpperCase()).filter(Boolean);
  }

  /**
   * Map our sort options to Viator sort options
   */
  private mapSortToViator(sortBy: string): string {
    const sortMap: Record<string, string> = {
      'popularity': 'TRAVELER_RATING',
      'rating': 'TRAVELER_RATING',
      'price_low': 'PRICE_FROM_LOW_TO_HIGH',
      'price_high': 'PRICE_FROM_HIGH_TO_LOW',
      'duration': 'DURATION',
      'distance': 'DISTANCE'
    };
    
    return sortMap[sortBy] || 'TRAVELER_RATING';
  }

  /**
   * Transform Viator product to our ActivitySummary format
   */
  private transformProductToActivity(product: any): ActivitySummary {
    return {
      id: product.productCode,
      providerId: 'viator',
      providerActivityId: product.productCode,
      title: product.title || 'Untitled Activity',
      shortDescription: product.shortDescription || '',
      type: this.mapViatorTypeToActivityType(product.productType),
      duration: this.mapViatorDuration(product.duration),
      location: {
        city: product.destination?.destinationName || 'Unknown',
        country: product.destination?.country || 'Unknown',
        coordinates: product.location ? {
          lat: product.location.latitude,
          lng: product.location.longitude
        } : undefined
      },
      pricing: {
        currency: product.pricing?.currency || 'USD',
        basePrice: product.pricing?.summary?.fromPrice || 0
      },
      rating: product.reviews?.combinedAverageRating,
      reviewCount: product.reviews?.totalReviews,
      primaryImage: product.images?.[0]?.variants?.find((v: any) => v.width >= 400)?.url,
      imageCount: product.images?.length || 0,
      instantConfirmation: product.bookingConfirmationType === 'INSTANT',
      categories: product.tags?.map((tag: any) => tag.text) || [],
      tags: product.tags?.map((tag: any) => tag.text.toLowerCase().replace(/\s+/g, '_')) || [],
      lastUpdated: new Date().toISOString(),
      featured: product.specialBadges?.includes('BESTSELLER') || false
    };
  }

  /**
   * Map Viator product type to our activity type
   */
  private mapViatorTypeToActivityType(viatorType: string): any {
    const typeMap: Record<string, string> = {
      'TOUR': 'tour',
      'EXPERIENCE': 'experience',
      'ATTRACTION': 'attraction',
      'OUTDOOR_ACTIVITIES': 'outdoor',
      'CULTURAL': 'cultural',
      'FOOD_AND_DRINK': 'food',
      'ADVENTURE': 'adventure',
      'ENTERTAINMENT': 'entertainment',
      'TRANSPORTATION': 'transportation'
    };
    
    return typeMap[viatorType] || 'experience';
  }

  /**
   * Map Viator duration to our duration format
   */
  private mapViatorDuration(viatorDuration: any): any {
    if (!viatorDuration) return 'flexible';
    
    const hours = viatorDuration.fixedDurationInMinutes ? viatorDuration.fixedDurationInMinutes / 60 : 0;
    
    if (hours < 1) return 'under_1h';
    if (hours <= 3) return '1_3h';
    if (hours <= 6) return '3_6h';
    if (hours <= 12) return '6_12h';
    return 'multi_day';
  }
}

// Export factory function
export function createViatorProvider(): ViatorProvider | null {
  try {
    return new ViatorProvider();
  } catch (error) {
    console.warn('⚠️ Failed to create Viator provider:', error);
    return null;
  }
}
