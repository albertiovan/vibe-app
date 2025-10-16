/**
 * Feature Flags Configuration
 * Controls which features are enabled in the application
 */

export interface FeatureFlags {
  activities: boolean;
  restaurants: boolean;
  activitiesFirst: boolean; // Whether activities should be the default tab
  locationFilter: boolean; // Whether to enforce Bucharest-only results
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
    locationFilter: process.env.FEATURE_LOCATION_FILTER !== 'false'
  };
}

export const features = loadFeatureFlags();

// Log feature flags on startup
console.log('🚩 Feature Flags:', {
  activities: features.activities ? '✅' : '❌',
  restaurants: features.restaurants ? '✅' : '❌',
  activitiesFirst: features.activitiesFirst ? '✅' : '❌',
  locationFilter: features.locationFilter ? '✅' : '❌'
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
