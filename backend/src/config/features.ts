/**
 * Feature Flags Configuration
 * Controls which features are enabled in the application
 */

export interface FeatureFlags {
  activities: boolean;
  restaurants: boolean;
  activitiesFirst: boolean; // Whether activities should be the default tab
  locationFilter: boolean; // Whether to enforce Bucharest-only results
  
  // Experiences-first configuration
  experiencesDefault: boolean; // Default to experiences over restaurants
  food: boolean; // Whether food/restaurants are enabled by default
  
  // New provider features
  realTimeProviders: boolean; // Whether to use real activity providers
  pois: boolean; // Points of Interest (OpenTripMap)
  events: boolean; // Events (Eventbrite)
  booking: boolean; // Booking capabilities
  multiProvider: boolean; // Aggregate results from multiple providers
}

/**
 * Load feature flags from environment or use defaults
 */
function loadFeatureFlags(): FeatureFlags {
  return {
    // Activities feature - enabled by default
    activities: process.env.FEATURE_ACTIVITIES !== 'false',
    
    // Restaurants feature - always enabled for now
    restaurants: process.env.FEATURE_RESTAURANTS !== 'false',
    
    // Activities-first experience - enabled by default
    activitiesFirst: process.env.FEATURE_ACTIVITIES_FIRST !== 'false',
    
    // Location filtering to Bucharest only - enabled by default
    locationFilter: process.env.FEATURE_LOCATION_FILTER !== 'false',
    
    // Experiences-first configuration - NEW
    experiencesDefault: process.env.FEATURE_EXPERIENCES_DEFAULT !== 'false', // Default TRUE
    food: process.env.FEATURE_FOOD === 'true', // Default FALSE
    
    // Real-time providers - disabled by default (use mock data)
    realTimeProviders: process.env.FEATURE_REAL_TIME_PROVIDERS === 'true',
    
    // Points of Interest - disabled by default
    pois: process.env.FEATURE_POIS === 'true',
    
    // Events - disabled by default
    events: process.env.FEATURE_EVENTS === 'true',
    
    // Booking capabilities - disabled by default
    booking: process.env.FEATURE_BOOKING === 'true',
    
    // Multi-provider aggregation - disabled by default
    multiProvider: process.env.FEATURE_MULTI_PROVIDER === 'true'
  };
}

export const features = loadFeatureFlags();

// Log feature flags on startup
console.log('🚩 Feature Flags:', {
  activities: features.activities ? '✅' : '❌',
  restaurants: features.restaurants ? '✅' : '❌',
  activitiesFirst: features.activitiesFirst ? '✅' : '❌',
  locationFilter: features.locationFilter ? '✅' : '❌',
  experiencesDefault: features.experiencesDefault ? '✅' : '❌',
  food: features.food ? '✅' : '❌',
  realTimeProviders: features.realTimeProviders ? '✅' : '❌',
  pois: features.pois ? '✅' : '❌',
  events: features.events ? '✅' : '❌',
  booking: features.booking ? '✅' : '❌',
  multiProvider: features.multiProvider ? '✅' : '❌'
});

/**
 * Check if a feature is enabled
 */
export function isFeatureEnabled(feature: keyof FeatureFlags): boolean {
  return features[feature];
}

/**
 * Get the default data source based on feature flags
 */
export function getDefaultDataSource(): 'activities' | 'restaurants' {
  if (features.activities && features.activitiesFirst) {
    return 'activities';
  }
  return 'restaurants';
}

/**
 * Get available data sources based on feature flags
 */
export function getAvailableDataSources(): Array<'activities' | 'restaurants'> {
  const sources: Array<'activities' | 'restaurants'> = [];
  
  if (features.activities) {
    sources.push('activities');
  }
  
  if (features.restaurants) {
    sources.push('restaurants');
  }
  
  return sources;
}
