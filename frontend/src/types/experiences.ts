/**
 * Experience Types and Bucket Definitions
 * Shared types for the experience-first vibe matching system
 */

export type ExperienceBucket = 
  | 'trails'      // Hiking, MTB, cycling, outdoor routes
  | 'adrenaline'  // High-energy activities, sports, adventure
  | 'nature'      // Natural attractions, parks, scenic spots
  | 'culture'     // Museums, galleries, historical sites
  | 'wellness'    // Spas, relaxation, wellness centers
  | 'nightlife';  // Evening entertainment, social venues

export interface ExperienceBucketInfo {
  id: ExperienceBucket;
  name: string;
  description: string;
  icon: string;
  color: string;
  examples: string[];
}

export const EXPERIENCE_BUCKETS: Record<ExperienceBucket, ExperienceBucketInfo> = {
  trails: {
    id: 'trails',
    name: 'Trails & Outdoor',
    description: 'Hiking, mountain biking, cycling routes, and outdoor exploration',
    icon: '🥾',
    color: '#22c55e', // green
    examples: ['Hiking trails', 'MTB routes', 'Cycling paths', 'Nature walks']
  },
  adrenaline: {
    id: 'adrenaline',
    name: 'Adrenaline & Sports',
    description: 'High-energy activities, adventure sports, and thrilling experiences',
    icon: '⚡',
    color: '#ef4444', // red
    examples: ['Adventure parks', 'Rock climbing', 'Extreme sports', 'Racing']
  },
  nature: {
    id: 'nature',
    name: 'Nature & Serenity',
    description: 'Natural attractions, parks, gardens, and peaceful outdoor spaces',
    icon: '🌿',
    color: '#10b981', // emerald
    examples: ['Botanical gardens', 'National parks', 'Scenic viewpoints', 'Wildlife reserves']
  },
  culture: {
    id: 'culture',
    name: 'Culture & Arts',
    description: 'Museums, galleries, historical sites, and cultural experiences',
    icon: '🎨',
    color: '#8b5cf6', // violet
    examples: ['Art museums', 'Historical sites', 'Cultural centers', 'Galleries']
  },
  wellness: {
    id: 'wellness',
    name: 'Wellness & Relaxation',
    description: 'Spas, wellness centers, meditation spaces, and relaxation activities',
    icon: '🧘',
    color: '#06b6d4', // cyan
    examples: ['Spa retreats', 'Wellness centers', 'Meditation gardens', 'Thermal baths']
  },
  nightlife: {
    id: 'nightlife',
    name: 'Nightlife & Social',
    description: 'Evening entertainment, social venues, and nighttime activities',
    icon: '🌙',
    color: '#f59e0b', // amber
    examples: ['Rooftop bars', 'Live music venues', 'Night markets', 'Social clubs']
  }
};

export interface WeatherCondition {
  temperature: number;
  conditions: string;
  precipitation: number;
  windSpeed: number;
  visibility?: number;
  recommendation: 'indoor' | 'covered' | 'outdoor';
}

export interface LocationContext {
  lat: number;
  lng: number;
  city?: string;
  country?: string;
  timezone?: string;
}

export interface ActivityFilter {
  buckets: ExperienceBucket[];
  energy: 'chill' | 'medium' | 'high';
  timeOfDay?: 'morning' | 'afternoon' | 'evening';
  indoorOutdoor: 'indoor' | 'outdoor' | 'either';
  radiusKm: number;
  maxTravelMinutes: number;
  minRating: number;
  avoidFood: boolean;
}

export interface ExperienceSearchResult {
  id: string;
  name: string;
  description: string;
  bucket: ExperienceBucket;
  location: LocationContext;
  rating?: number;
  distance?: number;
  travelTime?: number;
  weatherSuitability: number;
  priceLevel?: number;
  highlights: string[];
  source: 'google_places' | 'overpass' | 'opentripmap';
}

/**
 * Get bucket info by ID
 */
export function getBucketInfo(bucket: ExperienceBucket): ExperienceBucketInfo {
  return EXPERIENCE_BUCKETS[bucket];
}

/**
 * Get all bucket IDs
 */
export function getAllBuckets(): ExperienceBucket[] {
  return Object.keys(EXPERIENCE_BUCKETS) as ExperienceBucket[];
}

/**
 * Check if a bucket is outdoor-focused
 */
export function isOutdoorBucket(bucket: ExperienceBucket): boolean {
  return ['trails', 'nature', 'adrenaline'].includes(bucket);
}

/**
 * Check if a bucket is indoor-friendly
 */
export function isIndoorBucket(bucket: ExperienceBucket): boolean {
  return ['culture', 'wellness', 'nightlife'].includes(bucket);
}

/**
 * Get weather-appropriate buckets
 */
export function getWeatherAppropriateBuckets(
  weather: WeatherCondition
): ExperienceBucket[] {
  if (weather.recommendation === 'indoor') {
    return ['culture', 'wellness', 'nightlife'];
  } else if (weather.recommendation === 'covered') {
    return ['culture', 'wellness', 'nightlife', 'nature'];
  } else {
    return getAllBuckets();
  }
}

/**
 * Calculate bucket diversity score
 */
export function calculateDiversityScore(
  selectedBuckets: ExperienceBucket[],
  targetBuckets: ExperienceBucket[]
): number {
  const uniqueSelected = new Set(selectedBuckets);
  return uniqueSelected.size / Math.max(targetBuckets.length, 5);
}
