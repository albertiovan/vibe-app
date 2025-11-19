/**
 * Activity Filtering Service
 * 
 * Comprehensive filtering for activities including:
 * - Distance from user location
 * - Duration/time commitment
 * - Crowd size and type
 * - Group suitability
 * - Price tier
 */

export interface FilterOptions {
  // Location filters
  userLatitude?: number;
  userLongitude?: number;
  userCity?: string; // User's current city for location filtering
  maxDistanceKm?: number | null; // undefined = variety mode, 20 = in city only, null = explore outside city
  
  // Duration filters
  durationRange?: 'quick' | 'short' | 'medium' | 'long' | 'full-day' | 'any';
  maxDurationMinutes?: number; // null = no limit
  minDurationMinutes?: number; // null = no limit
  
  // Crowd filters
  crowdSize?: ('intimate' | 'small' | 'medium' | 'large' | 'massive')[];
  crowdType?: ('locals' | 'mixed' | 'tourists' | 'expats' | 'international')[];
  
  // Group suitability
  groupSuitability?: ('solo-only' | 'solo-friendly' | 'couples' | 'small-group' | 'large-group' | 'any')[];
  
  // Price filters
  priceTier?: ('free' | 'budget' | 'moderate' | 'premium' | 'luxury')[];
  maxPrice?: number; // in RON
  
  // Other filters
  energyLevel?: ('low' | 'medium' | 'high')[];
  indoorOutdoor?: ('indoor' | 'outdoor' | 'both')[];
  categories?: string[];
  
  // User preference filters
  favoriteCategories?: string[]; // User's favorite categories for boosting
  preferredEnergyLevels?: string[]; // User's preferred energy levels
}

export interface DurationPreset {
  label: string;
  minMinutes: number;
  maxMinutes: number | null;
}

export const DURATION_PRESETS: Record<string, DurationPreset> = {
  'quick': { label: 'Quick (< 1h)', minMinutes: 0, maxMinutes: 60 },
  'short': { label: 'Short (1-2h)', minMinutes: 60, maxMinutes: 120 },
  'medium': { label: 'Medium (2-4h)', minMinutes: 120, maxMinutes: 240 },
  'long': { label: 'Long (4-6h)', minMinutes: 240, maxMinutes: 360 },
  'full-day': { label: 'Full Day (6h+)', minMinutes: 360, maxMinutes: null },
  'any': { label: 'Any Duration', minMinutes: 0, maxMinutes: null },
};

export const DISTANCE_PRESETS = [
  { label: 'Nearby (< 2km)', value: 2 },
  { label: 'Walking (< 5km)', value: 5 },
  { label: 'Biking (< 10km)', value: 10 },
  { label: 'In City (< 20km)', value: 20 },
  { label: 'Day Trip (< 50km)', value: 50 },
  { label: 'Anywhere', value: null },
];

/**
 * Calculate distance between two points using Haversine formula
 * Returns distance in kilometers
 */
export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth's radius in km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  
  return Math.round(distance * 100) / 100; // Round to 2 decimals
}

function toRad(degrees: number): number {
  return degrees * (Math.PI / 180);
}

/**
 * Build SQL filter clause from FilterOptions
 * Returns { clause, params } for parameterized query
 */
export function buildFilterClause(
  filters: FilterOptions,
  startParamIndex: number = 1,
  searchEverywhere: boolean = false
): { clause: string; params: any[] } {
  const clauses: string[] = [];
  const params: any[] = [];
  let paramIndex = startParamIndex;
  
  // Smart duration filtering - context-aware based on activity type
  if (filters.durationRange && filters.durationRange !== 'any') {
    const preset = DURATION_PRESETS[filters.durationRange];
    
    if (preset.maxMinutes) {
      // Bounded ranges (quick, short, medium, long): check if activity fits within time
      // Only filter out activities that are TOO LONG
      clauses.push(`(duration_max <= $${paramIndex} OR duration_max IS NULL)`);
      params.push(preset.maxMinutes);
      paramIndex += 1;
    } else {
      // Open-ended ranges (full-day): smart filtering based on activity flexibility
      // 
      // CRITICAL: When searchEverywhere=true (Anywhere filter), be VERY RELAXED
      // Because: Activity time + Travel time = Full day
      // Example: Mountain biking in Sinaia (3h) + 2h drive each way = 7h total ✓
      //
      // STRICT for fixed-duration activities (classes, workshops, lessons):
      // - Creative activities (pottery, painting, crafts)
      // - Learning activities (cooking classes, workshops)
      // - Structured lessons (dance, music, language)
      // These have FIXED durations and can't be extended
      //
      // RELAXED for flexible activities:
      // - Adventure (hiking, biking, climbing) - can do 2h or all day
      // - Nature (parks, walks, trails) - stay as long as you want
      // - Sports (most outdoor sports) - flexible duration
      // - Water activities - flexible
      // - Fitness - can extend workout
      //
      if (searchEverywhere) {
        // VERY RELAXED: Accept almost everything when "Anywhere" is selected
        // User is willing to travel → travel time counts toward their day
        // Only filter out obviously wrong short fixed-duration activities
        clauses.push(`(
          -- Accept all flexible categories (travel time makes them full-day)
          category IN ('adventure', 'nature', 'sports', 'water', 'fitness', 'wellness', 'mindfulness', 'romance', 'seasonal')
          OR
          -- Accept activities without fixed structure
          (category NOT IN ('learning', 'creative') AND NOT ('requirement:lesson-recommended' = ANY(tags)))
          OR
          -- Accept learning/creative if reasonably long (3h+) - with travel = full day
          (duration_max >= 180 OR duration_max IS NULL)
        )`);
      } else {
        // MODERATE: For local activities, use normal flexible vs fixed logic
        clauses.push(`(
          -- Accept flexible categories
          category IN ('adventure', 'nature', 'sports', 'water', 'fitness', 'wellness', 'mindfulness', 'romance')
          OR
          -- Accept activities without fixed structure
          (category NOT IN ('learning', 'creative', 'culture') AND NOT ('requirement:lesson-recommended' = ANY(tags)))
          OR
          -- Accept any activity with long enough duration
          (duration_max >= $${paramIndex} OR duration_max IS NULL)
        )`);
        params.push(preset.minMinutes);
        paramIndex += 1;
      }
    }
  }
  
  if (filters.minDurationMinutes !== undefined) {
    clauses.push(`duration_min >= $${paramIndex}`);
    params.push(filters.minDurationMinutes);
    paramIndex += 1;
  }
  
  if (filters.maxDurationMinutes !== undefined) {
    clauses.push(`duration_max <= $${paramIndex}`);
    params.push(filters.maxDurationMinutes);
    paramIndex += 1;
  }
  
  // Crowd size filter
  if (filters.crowdSize && filters.crowdSize.length > 0) {
    clauses.push(`crowd_size = ANY($${paramIndex}::text[])`);
    params.push(filters.crowdSize);
    paramIndex += 1;
  }
  
  // Crowd type filter
  if (filters.crowdType && filters.crowdType.length > 0) {
    clauses.push(`crowd_type = ANY($${paramIndex}::text[])`);
    params.push(filters.crowdType);
    paramIndex += 1;
  }
  
  // Group suitability filter
  if (filters.groupSuitability && filters.groupSuitability.length > 0) {
    clauses.push(`group_suitability = ANY($${paramIndex}::text[])`);
    params.push(filters.groupSuitability);
    paramIndex += 1;
  }
  
  // Price tier filter
  if (filters.priceTier && filters.priceTier.length > 0) {
    clauses.push(`price_tier = ANY($${paramIndex}::text[])`);
    params.push(filters.priceTier);
    paramIndex += 1;
  }
  
  // Energy level filter
  if (filters.energyLevel && filters.energyLevel.length > 0) {
    clauses.push(`energy_level = ANY($${paramIndex}::text[])`);
    params.push(filters.energyLevel);
    paramIndex += 1;
  }
  
  // Indoor/outdoor filter
  if (filters.indoorOutdoor && filters.indoorOutdoor.length > 0) {
    clauses.push(`indoor_outdoor = ANY($${paramIndex}::text[])`);
    params.push(filters.indoorOutdoor);
    paramIndex += 1;
  }
  
  // Category filter
  if (filters.categories && filters.categories.length > 0) {
    clauses.push(`category = ANY($${paramIndex}::text[])`);
    params.push(filters.categories);
    paramIndex += 1;
  }
  
  // Distance filter (handled separately in application layer after query)
  // Location-based filtering requires lat/lon in results
  if (filters.userLatitude !== undefined && filters.userLongitude !== undefined) {
    clauses.push(`latitude IS NOT NULL AND longitude IS NOT NULL`);
  }
  
  const clause = clauses.length > 0 ? ' AND ' + clauses.join(' AND ') : '';
  
  return { clause, params };
}

/**
 * Filter activities by distance after database query
 */
export function filterByDistance(
  activities: any[],
  userLat: number,
  userLon: number,
  maxDistanceKm: number | null
): any[] {
  const activitiesWithDistance = activities
    .filter(a => a.latitude && a.longitude)
    .map(activity => ({
      ...activity,
      distanceKm: calculateDistance(userLat, userLon, activity.latitude, activity.longitude),
    }));
  
  if (maxDistanceKm === null) {
    return activitiesWithDistance.sort((a, b) => a.distanceKm - b.distanceKm);
  }
  
  return activitiesWithDistance
    .filter(a => a.distanceKm <= maxDistanceKm)
    .sort((a, b) => a.distanceKm - b.distanceKm);
}

/**
 * Get user-friendly filter summary
 */
export function getFilterSummary(filters: FilterOptions): string[] {
  const summary: string[] = [];
  
  if (filters.maxDistanceKm) {
    summary.push(`Within ${filters.maxDistanceKm}km`);
  }
  
  if (filters.durationRange && filters.durationRange !== 'any') {
    summary.push(DURATION_PRESETS[filters.durationRange].label);
  }
  
  if (filters.crowdSize && filters.crowdSize.length > 0) {
    summary.push(`Crowd: ${filters.crowdSize.join(', ')}`);
  }
  
  if (filters.crowdType && filters.crowdType.length > 0) {
    summary.push(`Vibe: ${filters.crowdType.join(', ')}`);
  }
  
  if (filters.groupSuitability && filters.groupSuitability.length > 0) {
    summary.push(`Good for: ${filters.groupSuitability.join(', ')}`);
  }
  
  if (filters.priceTier && filters.priceTier.length > 0) {
    summary.push(`Price: ${filters.priceTier.join(', ')}`);
  }
  
  return summary;
}

/**
 * Validate filter options
 */
export function validateFilters(filters: FilterOptions): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  // Validate distance parameters
  if (filters.maxDistanceKm !== undefined && filters.maxDistanceKm < 0) {
    errors.push('maxDistanceKm must be positive');
  }
  
  // Validate location completeness
  if ((filters.userLatitude !== undefined) !== (filters.userLongitude !== undefined)) {
    errors.push('Both userLatitude and userLongitude must be provided together');
  }
  
  // Validate latitude range
  if (filters.userLatitude !== undefined && (filters.userLatitude < -90 || filters.userLatitude > 90)) {
    errors.push('userLatitude must be between -90 and 90');
  }
  
  // Validate longitude range
  if (filters.userLongitude !== undefined && (filters.userLongitude < -180 || filters.userLongitude > 180)) {
    errors.push('userLongitude must be between -180 and 180');
  }
  
  // Validate duration
  if (filters.minDurationMinutes !== undefined && filters.minDurationMinutes < 0) {
    errors.push('minDurationMinutes must be non-negative');
  }
  
  if (filters.maxDurationMinutes !== undefined && filters.maxDurationMinutes < 0) {
    errors.push('maxDurationMinutes must be non-negative');
  }
  
  if (
    filters.minDurationMinutes !== undefined &&
    filters.maxDurationMinutes !== undefined &&
    filters.minDurationMinutes > filters.maxDurationMinutes
  ) {
    errors.push('minDurationMinutes must be less than maxDurationMinutes');
  }
  
  return {
    valid: errors.length === 0,
    errors,
  };
}
