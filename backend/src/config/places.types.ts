/**
 * Google Places API Type Configuration
 * Defines allowlists and blocklists for activity vs food establishment filtering
 */

// Non-food activities prioritized in searches
export const ACTIVITY_TYPES_ALLOWLIST = [
  'tourist_attraction',
  'museum',
  'art_gallery',
  'park',
  'amusement_park',
  'zoo',
  'aquarium',
  'stadium',
  'movie_theater',
  'bowling_alley',
  'spa',
  'campground',
  'church',
  'hindu_temple',
  'mosque',
  'synagogue',
  'library',
  'night_club',
  'point_of_interest'
] as const;

// Food establishments filtered out by default (unless explicitly requested)
export const FOOD_TYPES_BLOCKLIST = [
  'restaurant',
  'cafe',
  'bar',
  'bakery',
  'meal_takeaway',
  'meal_delivery'
] as const;

// Curated keywords for expanded text searches
export const ACTIVITY_KEYWORDS = [
  'museum',
  'art gallery',
  'indoor climbing',
  'escape room',
  'thermal bath',
  'live music',
  'theater',
  'concert hall',
  'sports complex',
  'adventure park',
  'cultural center',
  'exhibition',
  'observatory',
  'botanical garden',
  'historic site'
] as const;

// Type definitions for TypeScript
export type ActivityType = typeof ACTIVITY_TYPES_ALLOWLIST[number];
export type FoodType = typeof FOOD_TYPES_BLOCKLIST[number];
export type ActivityKeyword = typeof ACTIVITY_KEYWORDS[number];

// Configuration object for easy access
export const PLACES_CONFIG = {
  activities: {
    allowlist: ACTIVITY_TYPES_ALLOWLIST,
    keywords: ACTIVITY_KEYWORDS
  },
  food: {
    blocklist: FOOD_TYPES_BLOCKLIST
  },
  search: {
    defaultRadius: 8000, // 8km in meters
    maxConcurrency: 6,
    requestDelay: 100, // ms between requests
    maxRetries: 3,
    timeout: 10000 // 10 seconds
  },
  cache: {
    searchResultsTtl: 3600, // 1 hour
    placeDetailsTtl: 86400, // 24 hours
    locationQueriesTtl: 1800 // 30 minutes
  }
} as const;

// Helper functions
export function isActivityType(type: string): type is ActivityType {
  return ACTIVITY_TYPES_ALLOWLIST.includes(type as ActivityType);
}

export function isFoodType(type: string): type is FoodType {
  return FOOD_TYPES_BLOCKLIST.includes(type as FoodType);
}

export function filterFoodTypes(types: string[]): string[] {
  return types.filter(type => !isFoodType(type));
}

export function hasActivityType(types: string[]): boolean {
  return types.some(type => isActivityType(type));
}

export function hasFoodType(types: string[]): boolean {
  return types.some(type => isFoodType(type));
}
