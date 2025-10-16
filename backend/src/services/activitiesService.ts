/**
 * Activities Service
 * Unified interface for attractions/activities data
 * Currently uses mock data, ready to integrate with real TripAdvisor attractions API
 */

import { ActivitySummary, ActivityDetails, ActivityPhoto, ActivityReview } from '../types/index.js';
import { mockActivitiesService } from './mockActivitiesService.js';
import { rapidApiConfig } from '../config/rapidapi.js';
import NodeCache from 'node-cache';

// Cache for 5 minutes
const cache = new NodeCache({ stdTTL: 300 });

export interface ActivitiesListOptions {
  locationId?: string;
  limit?: number;
  sort?: 'rating' | 'popularity' | 'distance';
  categories?: string[];
}

export interface ActivityReviewsOptions {
  limit?: number;
  sort?: 'recent' | 'helpful' | 'rating';
}

export class ActivitiesService {
  private useRealAPI: boolean = false; // Feature flag for real API

  constructor() {
    // For now, we always use mock data since TripAdvisor16 doesn't have attractions
    this.useRealAPI = false;
    
    if (!this.useRealAPI) {
      console.log('🎭 Activities Service: Using mock data (TripAdvisor16 attractions not available)');
    }
  }

  /**
   * List activities/attractions for a location
   */
  public async listActivities(options: ActivitiesListOptions = {}): Promise<ActivitySummary[]> {
    try {
      // Use default location if none provided
      const searchOptions = {
        locationId: rapidApiConfig.defaultLocationId,
        limit: 10,
        sort: 'rating' as const,
        ...options
      };

      // Create cache key
      const cacheKey = `activities_${searchOptions.locationId}_${searchOptions.limit}_${searchOptions.sort}_${searchOptions.categories?.join(',') || 'all'}`;
      
      // Check cache first
      const cached = cache.get<ActivitySummary[]>(cacheKey);
      if (cached) {
        console.log(`📦 Using cached activities for location ${searchOptions.locationId}`);
        return cached;
      }

      let activities: ActivitySummary[];

      if (this.useRealAPI) {
        // TODO: Implement real TripAdvisor attractions API when available
        activities = await this.fetchRealActivities(searchOptions);
      } else {
        // Use mock service
        activities = await mockActivitiesService.listActivities(searchOptions);
      }

      // Cache the results
      cache.set(cacheKey, activities);
      
      console.log(`✅ Activities Service: Returned ${activities.length} activities`);
      return activities;

    } catch (error) {
      console.error('Activities Service error:', error);
      return [];
    }
  }

  /**
   * Get detailed information for a specific activity
   */
  public async getActivityDetails(activityId: string): Promise<ActivityDetails | null> {
    try {
      const cacheKey = `activity_details_${activityId}`;
      
      // Check cache first
      const cached = cache.get<ActivityDetails>(cacheKey);
      if (cached) {
        console.log(`📦 Using cached details for activity ${activityId}`);
        return cached;
      }

      let details: ActivityDetails | null;

      if (this.useRealAPI) {
        // TODO: Implement real API call
        details = await this.fetchRealActivityDetails(activityId);
      } else {
        // Use mock service
        details = await mockActivitiesService.getActivityDetails(activityId);
      }

      if (details) {
        // Cache the results
        cache.set(cacheKey, details);
        console.log(`✅ Activities Service: Found details for ${details.name}`);
      }

      return details;

    } catch (error) {
      console.error('Activities Service details error:', error);
      return null;
    }
  }

  /**
   * Get photos for a specific activity
   */
  public async getActivityPhotos(activityId: string, limit: number = 10): Promise<ActivityPhoto[]> {
    try {
      const cacheKey = `activity_photos_${activityId}_${limit}`;
      
      // Check cache first
      const cached = cache.get<ActivityPhoto[]>(cacheKey);
      if (cached) {
        return cached;
      }

      let photos: ActivityPhoto[];

      if (this.useRealAPI) {
        // TODO: Implement real API call
        photos = await this.fetchRealActivityPhotos(activityId, limit);
      } else {
        // Use mock service
        photos = await mockActivitiesService.getActivityPhotos(activityId, limit);
      }

      // Cache the results
      cache.set(cacheKey, photos);
      
      return photos;

    } catch (error) {
      console.error('Activities Service photos error:', error);
      return [];
    }
  }

  /**
   * Get reviews for a specific activity
   */
  public async getActivityReviews(activityId: string, options: ActivityReviewsOptions = {}): Promise<ActivityReview[]> {
    try {
      const { limit = 5, sort = 'helpful' } = options;
      const cacheKey = `activity_reviews_${activityId}_${limit}_${sort}`;
      
      // Check cache first
      const cached = cache.get<ActivityReview[]>(cacheKey);
      if (cached) {
        return cached;
      }

      let reviews: ActivityReview[];

      if (this.useRealAPI) {
        // TODO: Implement real API call
        reviews = await this.fetchRealActivityReviews(activityId, options);
      } else {
        // Use mock service
        reviews = await mockActivitiesService.getActivityReviews(activityId, options);
      }

      // Cache the results
      cache.set(cacheKey, reviews);
      
      return reviews;

    } catch (error) {
      console.error('Activities Service reviews error:', error);
      return [];
    }
  }

  /**
   * Get service status and availability
   */
  public getStatus(): { available: boolean; provider: string; dataSource: string; realAPI: boolean } {
    if (this.useRealAPI) {
      return {
        available: true, // TODO: Check real API availability
        provider: 'TripAdvisor16',
        dataSource: 'Live TripAdvisor data',
        realAPI: true
      };
    } else {
      return {
        available: mockActivitiesService.isAvailable(),
        provider: 'Mock Service',
        dataSource: 'Curated Bucharest attractions',
        realAPI: false
      };
    }
  }

  /**
   * Enable or disable real API usage (feature flag)
   */
  public setRealAPIEnabled(enabled: boolean): void {
    this.useRealAPI = enabled;
    console.log(`🔄 Activities Service: Real API ${enabled ? 'enabled' : 'disabled'}`);
  }

  // Private methods for future real API implementation

  private async fetchRealActivities(options: ActivitiesListOptions): Promise<ActivitySummary[]> {
    // TODO: Implement when TripAdvisor attractions API becomes available
    // This would use rapidApiClient to call the real attractions endpoint
    throw new Error('Real TripAdvisor attractions API not yet implemented');
  }

  private async fetchRealActivityDetails(activityId: string): Promise<ActivityDetails | null> {
    // TODO: Implement when TripAdvisor attractions API becomes available
    throw new Error('Real TripAdvisor attractions API not yet implemented');
  }

  private async fetchRealActivityPhotos(activityId: string, limit: number): Promise<ActivityPhoto[]> {
    // TODO: Implement when TripAdvisor attractions API becomes available
    throw new Error('Real TripAdvisor attractions API not yet implemented');
  }

  private async fetchRealActivityReviews(activityId: string, options: ActivityReviewsOptions): Promise<ActivityReview[]> {
    // TODO: Implement when TripAdvisor attractions API becomes available
    throw new Error('Real TripAdvisor attractions API not yet implemented');
  }
}

// Export singleton instance
export const activitiesService = new ActivitiesService();
