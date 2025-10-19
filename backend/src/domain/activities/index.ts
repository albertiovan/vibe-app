/**
 * Activities Domain - Main Export
 * 
 * Central hub for all activity-related functionality including:
 * - Type definitions
 * - Romania activity ontology
 * - Provider mappings (Google Places, OSM, OpenTripMap)
 * - Helper functions for activity discovery and venue resolution
 */

// Core types
export * from './types.js';

// Romania activity ontology
export * from './romania-ontology.js';

// Provider mappings
export * from './mapping/google-places-mapping.js';
export * from './mapping/osm-tags-mapping.js';
export * from './mapping/opentripmap-mapping.js';

// Re-export key types for convenience
export type {
  ActivityIntent,
  ActivityRecommendation,
  VerifiedVenue,
  ActivityQuery,
  ActivitySearchResult,
  ActivityCategory,
  EnergyLevel,
  IndoorOutdoor,
  WeatherSuitability,
  Provider
} from './types.js';

import {
  ROMANIA_ACTIVITY_ONTOLOGY,
  ALL_ROMANIA_ACTIVITIES,
  ACTIVITY_BY_ID,
  ACTIVITIES_BY_REGION,
  ALL_SUBTYPES,
  ALL_REGIONS
} from './romania-ontology.js';

import {
  getGooglePlacesMapping,
  buildGooglePlacesQuery
} from './mapping/google-places-mapping.js';

import {
  getOSMTagsMapping,
  buildOverpassQuery
} from './mapping/osm-tags-mapping.js';

import {
  getOpenTripMapMapping,
  buildOpenTripMapQuery,
  buildOpenTripMapDetailsQuery
} from './mapping/opentripmap-mapping.js';

import type { ActivityCategory, ActivityIntent } from './types.js';

/**
 * Helper Functions for Activity Discovery
 */

/**
 * Get all activity subtypes for a given category
 */
export function listSubtypesByCategory(category: ActivityCategory): string[] {
  const activities = ROMANIA_ACTIVITY_ONTOLOGY[category] || [];
  return [...new Set(activities.flatMap(activity => activity.subtypes))];
}

/**
 * Get all activities for a given category
 */
export function getActivitiesByCategory(category: ActivityCategory): ActivityIntent[] {
  return ROMANIA_ACTIVITY_ONTOLOGY[category] || [];
}

/**
 * Get all activities available in a specific region
 */
export function getActivitiesByRegion(region: string): ActivityIntent[] {
  return ACTIVITIES_BY_REGION[region] || [];
}

/**
 * Find activities by energy level
 */
export function getActivitiesByEnergyLevel(energyLevel: 'chill' | 'medium' | 'high'): ActivityIntent[] {
  return ALL_ROMANIA_ACTIVITIES.filter(activity => activity.energy === energyLevel);
}

/**
 * Find activities by indoor/outdoor preference
 */
export function getActivitiesByIndoorOutdoor(preference: 'indoor' | 'outdoor' | 'either'): ActivityIntent[] {
  return ALL_ROMANIA_ACTIVITIES.filter(activity => 
    activity.indoorOutdoor === preference || activity.indoorOutdoor === 'either'
  );
}

/**
 * Find activities by seasonality
 */
export function getActivitiesBySeason(season: 'summer' | 'winter' | 'all'): ActivityIntent[] {
  return ALL_ROMANIA_ACTIVITIES.filter(activity => 
    !activity.seasonality || activity.seasonality === season || activity.seasonality === 'all'
  );
}

/**
 * Find activities by difficulty level
 */
export function getActivitiesByDifficulty(maxDifficulty: number): ActivityIntent[] {
  return ALL_ROMANIA_ACTIVITIES.filter(activity => 
    !activity.difficulty || activity.difficulty <= maxDifficulty
  );
}

/**
 * Find activities by duration range
 */
export function getActivitiesByDuration(maxHours: number): ActivityIntent[] {
  return ALL_ROMANIA_ACTIVITIES.filter(activity => {
    if (!activity.durationHintHrs) return true;
    const [minHours] = activity.durationHintHrs;
    return minHours <= maxHours;
  });
}

/**
 * Search activities by text query (name, subtypes, regions)
 */
export function searchActivities(query: string): ActivityIntent[] {
  const searchTerm = query.toLowerCase();
  
  return ALL_ROMANIA_ACTIVITIES.filter(activity => 
    activity.label.toLowerCase().includes(searchTerm) ||
    activity.subtypes.some(subtype => subtype.toLowerCase().includes(searchTerm)) ||
    activity.regions.some(region => region.toLowerCase().includes(searchTerm)) ||
    activity.category.toLowerCase().includes(searchTerm)
  );
}

/**
 * Get activity by ID with error handling
 */
export function getActivityById(id: string): ActivityIntent | null {
  return ACTIVITY_BY_ID[id] || null;
}

/**
 * Provider Query Resolution
 */

/**
 * Resolve provider queries for an activity subtype
 * Returns query configurations for all available providers
 */
export function resolveProviderQueries(
  activitySubtype: string,
  location: { lat: number; lng: number },
  region?: string
): {
  google?: ReturnType<typeof buildGooglePlacesQuery>;
  osm?: string;
  openTripMap?: ReturnType<typeof buildOpenTripMapQuery>;
} {
  const result: any = {};
  
  // Google Places query
  const googleMapping = getGooglePlacesMapping(activitySubtype);
  if (googleMapping && region) {
    result.google = buildGooglePlacesQuery(activitySubtype, region, location);
  }
  
  // OSM/Overpass query
  const osmMapping = getOSMTagsMapping(activitySubtype);
  if (osmMapping) {
    result.osm = buildOverpassQuery(activitySubtype, location);
  }
  
  // OpenTripMap query
  const otmMapping = getOpenTripMapMapping(activitySubtype);
  if (otmMapping) {
    result.openTripMap = buildOpenTripMapQuery(activitySubtype, location);
  }
  
  return result;
}

/**
 * Get all provider mappings for an activity subtype
 */
export function getProviderMappings(activitySubtype: string): {
  google: ReturnType<typeof getGooglePlacesMapping>;
  osm: ReturnType<typeof getOSMTagsMapping>;
  openTripMap: ReturnType<typeof getOpenTripMapMapping>;
} {
  return {
    google: getGooglePlacesMapping(activitySubtype),
    osm: getOSMTagsMapping(activitySubtype),
    openTripMap: getOpenTripMapMapping(activitySubtype)
  };
}

/**
 * Activity Filtering and Recommendation Helpers
 */

/**
 * Filter activities based on multiple criteria
 */
export function filterActivities(criteria: {
  categories?: ActivityCategory[];
  regions?: string[];
  energyLevel?: 'chill' | 'medium' | 'high';
  indoorOutdoor?: 'indoor' | 'outdoor' | 'either';
  seasonality?: 'summer' | 'winter' | 'all';
  maxDifficulty?: number;
  maxDurationHours?: number;
  subtypes?: string[];
}): ActivityIntent[] {
  let activities = ALL_ROMANIA_ACTIVITIES;
  
  if (criteria.categories?.length) {
    activities = activities.filter(activity => 
      criteria.categories!.includes(activity.category)
    );
  }
  
  if (criteria.regions?.length) {
    activities = activities.filter(activity =>
      activity.regions.some(region => criteria.regions!.includes(region))
    );
  }
  
  if (criteria.energyLevel) {
    activities = activities.filter(activity => 
      activity.energy === criteria.energyLevel
    );
  }
  
  if (criteria.indoorOutdoor) {
    activities = activities.filter(activity =>
      activity.indoorOutdoor === criteria.indoorOutdoor || 
      activity.indoorOutdoor === 'either'
    );
  }
  
  if (criteria.seasonality) {
    activities = activities.filter(activity =>
      !activity.seasonality || 
      activity.seasonality === criteria.seasonality || 
      activity.seasonality === 'all'
    );
  }
  
  if (criteria.maxDifficulty !== undefined) {
    activities = activities.filter(activity =>
      !activity.difficulty || activity.difficulty <= criteria.maxDifficulty!
    );
  }
  
  if (criteria.maxDurationHours !== undefined) {
    activities = activities.filter(activity => {
      if (!activity.durationHintHrs) return true;
      const [minHours] = activity.durationHintHrs;
      return minHours <= criteria.maxDurationHours!;
    });
  }
  
  if (criteria.subtypes?.length) {
    activities = activities.filter(activity =>
      activity.subtypes.some(subtype => criteria.subtypes!.includes(subtype))
    );
  }
  
  return activities;
}

/**
 * Get activity statistics
 */
export function getActivityStatistics(): {
  totalActivities: number;
  activitiesByCategory: Record<ActivityCategory, number>;
  activitiesByRegion: Record<string, number>;
  activitiesByEnergyLevel: Record<string, number>;
  totalSubtypes: number;
  totalRegions: number;
} {
  const activitiesByCategory = Object.entries(ROMANIA_ACTIVITY_ONTOLOGY).reduce(
    (acc, [category, activities]) => ({
      ...acc,
      [category]: activities.length
    }),
    {} as Record<ActivityCategory, number>
  );
  
  const activitiesByRegion = Object.entries(ACTIVITIES_BY_REGION).reduce(
    (acc, [region, activities]) => ({
      ...acc,
      [region]: activities.length
    }),
    {} as Record<string, number>
  );
  
  const activitiesByEnergyLevel = ALL_ROMANIA_ACTIVITIES.reduce(
    (acc, activity) => ({
      ...acc,
      [activity.energy]: (acc[activity.energy] || 0) + 1
    }),
    {} as Record<string, number>
  );
  
  return {
    totalActivities: ALL_ROMANIA_ACTIVITIES.length,
    activitiesByCategory,
    activitiesByRegion,
    activitiesByEnergyLevel,
    totalSubtypes: ALL_SUBTYPES.length,
    totalRegions: ALL_REGIONS.length
  };
}

/**
 * Validate activity data integrity
 */
export function validateActivityOntology(): {
  isValid: boolean;
  errors: string[];
  warnings: string[];
} {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  // Check for duplicate IDs
  const ids = new Set<string>();
  ALL_ROMANIA_ACTIVITIES.forEach(activity => {
    if (ids.has(activity.id)) {
      errors.push(`Duplicate activity ID: ${activity.id}`);
    }
    ids.add(activity.id);
  });
  
  // Check for missing required fields
  ALL_ROMANIA_ACTIVITIES.forEach(activity => {
    if (!activity.id) errors.push(`Activity missing ID: ${activity.label}`);
    if (!activity.label) errors.push(`Activity missing label: ${activity.id}`);
    if (!activity.category) errors.push(`Activity missing category: ${activity.id}`);
    if (!activity.subtypes?.length) errors.push(`Activity missing subtypes: ${activity.id}`);
    if (!activity.regions?.length) errors.push(`Activity missing regions: ${activity.id}`);
    if (!activity.energy) errors.push(`Activity missing energy level: ${activity.id}`);
    if (!activity.indoorOutdoor) errors.push(`Activity missing indoor/outdoor: ${activity.id}`);
  });
  
  // Check for activities without provider mappings
  ALL_SUBTYPES.forEach(subtype => {
    const hasGoogle = getGooglePlacesMapping(subtype) !== null;
    const hasOSM = getOSMTagsMapping(subtype) !== null;
    const hasOTM = getOpenTripMapMapping(subtype) !== null;
    
    if (!hasGoogle && !hasOSM && !hasOTM) {
      warnings.push(`Subtype has no provider mappings: ${subtype}`);
    }
  });
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}
