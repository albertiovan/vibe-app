/**
 * Query Helpers
 * Utilities for composing queries with default location settings
 */

import { rapidApiConfig } from '../config/rapidapi.js';

export interface BaseQueryOptions {
  locationId?: string;
  limit?: number;
}

export interface RestaurantQueryOptions extends BaseQueryOptions {
  // Restaurant-specific options can be added here
}

export interface ActivityQueryOptions extends BaseQueryOptions {
  sort?: 'rating' | 'popularity' | 'distance';
  categories?: string[];
}

/**
 * Ensures all queries use Bucharest as default location
 * This helper enforces consistent location filtering across the app
 */
export function withCity<T extends BaseQueryOptions>(options: T = {} as T): T {
  return {
    ...options,
    locationId: options.locationId || rapidApiConfig.defaultLocationId
  };
}

/**
 * Compose restaurant query with Bucharest default
 */
export function withBucharestRestaurants(options: RestaurantQueryOptions = {}): RestaurantQueryOptions {
  const baseOptions = withCity(options);
  
  return {
    ...baseOptions,
    limit: baseOptions.limit || 10
  };
}

/**
 * Compose activities query with Bucharest default
 */
export function withBucharestActivities(options: ActivityQueryOptions = {}): ActivityQueryOptions {
  const baseOptions = withCity(options);
  
  return {
    ...baseOptions,
    limit: baseOptions.limit || 10,
    sort: options.sort || 'rating'
  };
}

/**
 * Get the default city information
 */
export function getDefaultCity(): { name: string; locationId: string } {
  return {
    name: rapidApiConfig.defaultCity,
    locationId: rapidApiConfig.defaultLocationId
  };
}

/**
 * Validate that a location ID is for Bucharest (security check)
 */
export function isBucharestLocation(locationId: string): boolean {
  return locationId === rapidApiConfig.defaultLocationId;
}

/**
 * Ensure query only returns Bucharest results
 * This is a safety measure to prevent non-Romanian results
 */
export function enforceBucharestOnly<T extends BaseQueryOptions>(options: T): T {
  if (options.locationId && !isBucharestLocation(options.locationId)) {
    console.warn(`⚠️ Non-Bucharest location ID ${options.locationId} replaced with default`);
  }
  
  return {
    ...options,
    locationId: rapidApiConfig.defaultLocationId
  };
}
