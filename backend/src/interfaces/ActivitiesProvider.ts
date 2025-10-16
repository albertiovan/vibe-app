/**
 * Activities Provider Interface
 * Provider-agnostic interface for activities, experiences, and events
 */

import {
  ActivityProviderId,
  ActivitySummary,
  ActivityDetails,
  ActivitySearchFilters,
  ActivitySearchResult,
  ActivityAvailability,
  ActivityReview,
  ProviderCapabilities,
  ProviderResponse
} from '../domain/activities.js';

/**
 * Base interface that all activity providers must implement
 */
export interface ActivitiesProvider {
  readonly providerId: ActivityProviderId;
  readonly name: string;
  
  /**
   * Get provider capabilities and supported features
   */
  getCapabilities(): ProviderCapabilities;
  
  /**
   * Check if provider is available and configured
   */
  isAvailable(): boolean;
  
  /**
   * Search for activities by city, location, or text query
   */
  searchActivitiesByCity(
    cityQuery: string | { lat: number; lng: number } | { cityId: string },
    filters?: ActivitySearchFilters
  ): Promise<ProviderResponse<ActivitySearchResult>>;
  
  /**
   * Get detailed information for a specific activity
   */
  getActivityDetails(
    activityId: string
  ): Promise<ProviderResponse<ActivityDetails>>;
  
  /**
   * Get real-time availability for an activity
   * Optional - not all providers support this
   */
  getActivityAvailability?(
    activityId: string,
    dateRange?: {
      startDate: string; // ISO date
      endDate: string;   // ISO date
    }
  ): Promise<ProviderResponse<ActivityAvailability>>;
  
  /**
   * Get reviews for a specific activity
   */
  getActivityReviews(
    activityId: string,
    options?: {
      limit?: number;
      offset?: number;
      sort?: 'newest' | 'oldest' | 'rating_high' | 'rating_low' | 'helpful';
      language?: string;
    }
  ): Promise<ProviderResponse<ActivityReview[]>>;
  
  /**
   * Get popular/featured activities for a city
   * Useful for homepage recommendations
   */
  getFeaturedActivities?(
    cityQuery: string | { lat: number; lng: number },
    limit?: number
  ): Promise<ProviderResponse<ActivitySummary[]>>;
  
  /**
   * Get activity categories supported by this provider
   */
  getCategories?(): Promise<ProviderResponse<{
    id: string;
    name: string;
    description?: string;
    activityCount?: number;
  }[]>>;
  
  /**
   * Health check for the provider
   */
  healthCheck(): Promise<ProviderResponse<{
    status: 'healthy' | 'degraded' | 'unhealthy';
    responseTime?: number;
    lastSuccessfulCall?: string;
    errorRate?: number;
  }>>;
}

/**
 * Extended interface for providers that support booking
 */
export interface BookableActivitiesProvider extends ActivitiesProvider {
  /**
   * Check availability and pricing for specific dates/times
   */
  checkAvailabilityAndPricing(
    activityId: string,
    options: {
      date: string; // ISO date
      timeSlot?: string; // HH:MM
      participants: {
        adults: number;
        children?: number;
        seniors?: number;
      };
    }
  ): Promise<ProviderResponse<{
    available: boolean;
    pricing: {
      totalPrice: number;
      currency: string;
      breakdown: {
        type: 'adult' | 'child' | 'senior';
        quantity: number;
        unitPrice: number;
        totalPrice: number;
      }[];
    };
    bookingToken?: string; // For holding the reservation
  }>>;
  
  /**
   * Create a booking reservation
   */
  createBooking?(
    bookingToken: string,
    customerInfo: {
      firstName: string;
      lastName: string;
      email: string;
      phone?: string;
      specialRequests?: string;
    }
  ): Promise<ProviderResponse<{
    bookingId: string;
    confirmationCode: string;
    status: 'confirmed' | 'pending' | 'failed';
    totalPrice: number;
    currency: string;
  }>>;
}

/**
 * Provider factory interface
 */
export interface ActivitiesProviderFactory {
  /**
   * Create a provider instance
   */
  createProvider(providerId: ActivityProviderId): ActivitiesProvider | null;
  
  /**
   * Get all available providers
   */
  getAvailableProviders(): ActivityProviderId[];
  
  /**
   * Get the best provider for a specific location
   */
  getBestProviderForLocation(
    location: string | { lat: number; lng: number }
  ): ActivityProviderId | null;
}

/**
 * Provider registry for managing multiple providers
 */
export interface ProviderRegistry {
  /**
   * Register a provider
   */
  register(provider: ActivitiesProvider): void;
  
  /**
   * Get a provider by ID
   */
  getProvider(providerId: ActivityProviderId): ActivitiesProvider | null;
  
  /**
   * Get all registered providers
   */
  getAllProviders(): ActivitiesProvider[];
  
  /**
   * Get providers that support a specific feature
   */
  getProvidersWithFeature(feature: keyof ProviderCapabilities['features']): ActivitiesProvider[];
  
  /**
   * Get providers that cover a specific location
   */
  getProvidersForLocation(
    location: string | { lat: number; lng: number }
  ): ActivitiesProvider[];
}

/**
 * Aggregated provider that combines results from multiple providers
 */
export interface AggregatedActivitiesProvider extends ActivitiesProvider {
  /**
   * Search across multiple providers and merge results
   */
  searchActivitiesAcrossProviders(
    cityQuery: string | { lat: number; lng: number },
    filters?: ActivitySearchFilters & {
      providers?: ActivityProviderId[];
      mergeStrategy?: 'interleave' | 'provider_priority' | 'quality_score';
    }
  ): Promise<ProviderResponse<ActivitySearchResult & {
    providerBreakdown: {
      providerId: ActivityProviderId;
      count: number;
      responseTime: number;
    }[];
  }>>;
  
  /**
   * Get the same activity from multiple providers for comparison
   */
  getActivityFromMultipleProviders?(
    activityIdentifiers: {
      providerId: ActivityProviderId;
      activityId: string;
    }[]
  ): Promise<ProviderResponse<{
    activities: (ActivityDetails & { providerId: ActivityProviderId })[];
    canonical?: ActivityDetails; // Merged/best version
  }>>;
}

/**
 * Provider configuration interface
 */
export interface ProviderConfig {
  providerId: ActivityProviderId;
  enabled: boolean;
  priority: number; // Higher number = higher priority
  
  // API configuration
  apiKey?: string;
  apiSecret?: string;
  baseUrl?: string;
  timeout?: number; // milliseconds
  
  // Rate limiting
  rateLimit?: {
    requestsPerMinute: number;
    requestsPerDay?: number;
  };
  
  // Caching
  cache?: {
    searchTTL: number;    // seconds
    detailsTTL: number;   // seconds
    reviewsTTL: number;   // seconds
  };
  
  // Feature flags
  features?: {
    search?: boolean;
    details?: boolean;
    availability?: boolean;
    reviews?: boolean;
    booking?: boolean;
  };
  
  // Provider-specific configuration
  providerSpecific?: Record<string, any>;
}

/**
 * Error types for provider operations
 */
export enum ProviderErrorCode {
  // Configuration errors
  NOT_CONFIGURED = 'NOT_CONFIGURED',
  INVALID_API_KEY = 'INVALID_API_KEY',
  
  // Network errors
  NETWORK_ERROR = 'NETWORK_ERROR',
  TIMEOUT = 'TIMEOUT',
  
  // API errors
  RATE_LIMITED = 'RATE_LIMITED',
  QUOTA_EXCEEDED = 'QUOTA_EXCEEDED',
  API_ERROR = 'API_ERROR',
  
  // Data errors
  INVALID_REQUEST = 'INVALID_REQUEST',
  NOT_FOUND = 'NOT_FOUND',
  NO_RESULTS = 'NO_RESULTS',
  
  // Provider-specific errors
  PROVIDER_UNAVAILABLE = 'PROVIDER_UNAVAILABLE',
  FEATURE_NOT_SUPPORTED = 'FEATURE_NOT_SUPPORTED',
  
  // Unknown errors
  UNKNOWN_ERROR = 'UNKNOWN_ERROR'
}

/**
 * Utility type for provider method results
 */
export type ProviderResult<T> = Promise<ProviderResponse<T>>;

/**
 * Provider metrics interface for monitoring
 */
export interface ProviderMetrics {
  providerId: ActivityProviderId;
  
  // Performance metrics
  averageResponseTime: number; // milliseconds
  successRate: number;         // percentage
  errorRate: number;           // percentage
  
  // Usage metrics
  requestCount: number;
  lastRequestTime?: string;    // ISO datetime
  
  // Quality metrics
  dataFreshness: number;       // hours since last update
  coverageScore: number;       // 0-100
  
  // Rate limiting
  quotaUsed?: number;
  quotaRemaining?: number;
  quotaResetTime?: string;     // ISO datetime
}
