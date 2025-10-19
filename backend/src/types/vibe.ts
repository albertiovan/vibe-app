/**
 * Vibe-to-Experience Data Structures
 * Core types for AI-powered experience matching
 */

// User's current vibe/mood input
export interface UserVibe {
  // Energy & Activity Level
  energy: 'low' | 'medium' | 'high';
  
  // Social Preference
  social: 'alone' | 'intimate' | 'small_group' | 'crowd';
  
  // Current Mood
  mood: 'adventurous' | 'relaxed' | 'creative' | 'productive' | 'social' | 'contemplative' | 'playful';
  
  // Time Available
  timeAvailable: 'quick' | 'moderate' | 'extended' | 'all_day'; // 15min, 1-2h, 3-5h, 6h+
  
  // Budget Comfort
  budget: 'free' | 'budget' | 'moderate' | 'splurge'; // $0, $1-20, $21-50, $50+
  
  // Weather Preference
  weatherPreference: 'indoor' | 'outdoor' | 'either';
  
  // Discovery vs Familiar
  exploration: 'familiar' | 'mixed' | 'new'; // Known places vs new discoveries
  
  // Optional: Free-text vibe description
  description?: string;
  
  // Context
  location?: {
    lat: number;
    lng: number;
    radius?: number; // km, default 10
  };
  
  // Time of day context
  timeOfDay?: 'morning' | 'afternoon' | 'evening' | 'night';
  
  // Day of week context
  dayType?: 'weekday' | 'weekend';
}

// Search filters for place discovery
export interface SearchFilters {
  radiusMeters: number;
  durationHours: number;
  travelMode?: 'drive' | 'transit' | 'walk';
  nationwide?: boolean;
  willingToTravel?: boolean; // Enable multi-region search for day trips
}

// Enhanced place data from Google Places
export interface VibePlace {
  // Google Places data
  placeId: string;
  name: string;
  types: string[]; // Google Place types
  rating?: number;
  userRatingsTotal?: number;
  priceLevel?: number; // 0-4 scale
  vicinity?: string;
  geometry: {
    location: {
      lat: number;
      lng: number;
    };
  };
  photos?: Array<{
    photoReference: string;
    width: number;
    height: number;
    htmlAttributions?: string[];
  }>;
  openingHours?: {
    openNow?: boolean;
    weekdayText?: string[];
  };
  
  // New: Images & Maps Integration
  imageUrl?: string;        // proxied photo url
  photoAttribution?: string;// from Places photos[].html_attributions
  mapsUrl: string;          // Google Maps deep link
  
  // Our vibe-specific enhancements
  vibeScore?: number; // 0-1 compatibility with user's vibe
  vibeReasons?: string[]; // Why this matches the vibe
  estimatedDuration?: string; // How long to spend here
  bestTimeToVisit?: string; // When this place shines
  vibeCategories?: VibeCategory[]; // Our custom categorization
  energyLevel?: 'low' | 'medium' | 'high';
  socialLevel?: 'solitary' | 'intimate' | 'social' | 'crowded';
  
  // Practical info
  walkingTime?: number; // minutes from user location
  currentBusyness?: 'quiet' | 'moderate' | 'busy' | 'very_busy';
}

// Our custom vibe-based categorization
export type VibeCategory = 
  // Energy-based
  | 'energizing' | 'calming' | 'stimulating' | 'peaceful'
  // Social-based
  | 'social_hub' | 'intimate_spot' | 'solo_friendly' | 'group_activity'
  // Mood-based
  | 'creative_space' | 'adventure_spot' | 'comfort_zone' | 'discovery_place'
  // Activity-based
  | 'active_experience' | 'contemplative_space' | 'learning_opportunity' | 'entertainment'
  // Sensory
  | 'visual_feast' | 'taste_adventure' | 'nature_connection' | 'urban_energy';

// Vibe matching result
export interface VibeMatch {
  places: VibePlace[];
  totalFound: number;
  vibeAnalysis: {
    primaryVibe: string;
    secondaryVibes: string[];
    matchingStrategy: string;
    confidence: number; // 0-1
  };
  suggestions?: {
    timeOptimization?: string;
    budgetTips?: string;
    weatherAlternatives?: string;
    sequencing?: string; // If multiple places, suggested order
  };
}

// Google Places API types mapping to vibe categories
export const GOOGLE_TYPES_TO_VIBE: Record<string, VibeCategory[]> = {
  // Calming & Peaceful
  'park': ['calming', 'peaceful', 'nature_connection', 'solo_friendly'],
  'spa': ['calming', 'peaceful', 'contemplative_space'],
  'library': ['calming', 'contemplative_space', 'solo_friendly', 'learning_opportunity'],
  'museum': ['contemplative_space', 'learning_opportunity', 'visual_feast'],
  'art_gallery': ['creative_space', 'contemplative_space', 'visual_feast'],
  'botanical_garden': ['calming', 'peaceful', 'nature_connection', 'visual_feast'],
  
  // Energizing & Stimulating
  'gym': ['energizing', 'active_experience', 'solo_friendly'],
  'amusement_park': ['energizing', 'stimulating', 'adventure_spot', 'group_activity'],
  'night_club': ['energizing', 'stimulating', 'social_hub', 'entertainment'],
  'stadium': ['energizing', 'stimulating', 'social_hub', 'entertainment'],
  'bowling_alley': ['energizing', 'social_hub', 'group_activity', 'entertainment'],
  
  // Social Hubs
  'restaurant': ['social_hub', 'taste_adventure', 'intimate_spot'],
  'bar': ['social_hub', 'intimate_spot', 'urban_energy'],
  'cafe': ['social_hub', 'intimate_spot', 'comfort_zone', 'solo_friendly'],
  'shopping_mall': ['social_hub', 'stimulating', 'urban_energy'],
  'market': ['social_hub', 'taste_adventure', 'discovery_place', 'urban_energy'],
  
  // Creative & Learning
  'book_store': ['creative_space', 'contemplative_space', 'solo_friendly', 'discovery_place'],
  'movie_theater': ['entertainment', 'intimate_spot', 'contemplative_space'],
  'aquarium': ['contemplative_space', 'visual_feast', 'learning_opportunity'],
  'zoo': ['active_experience', 'visual_feast', 'learning_opportunity', 'group_activity'],
  
  // Adventure & Discovery
  'tourist_attraction': ['adventure_spot', 'discovery_place', 'visual_feast'],
  'hiking_area': ['active_experience', 'adventure_spot', 'nature_connection'],
  'beach': ['calming', 'active_experience', 'nature_connection', 'social_hub'],
  'campground': ['adventure_spot', 'nature_connection', 'group_activity'],
  
  // Urban Energy
  'store': ['discovery_place', 'urban_energy'],
  'gas_station': [], // Usually not a destination
  'atm': [], // Utility, not destination
  'pharmacy': [], // Utility, not destination
};

// Vibe-to-Google-Places-Types mapping for search
export const VIBE_TO_GOOGLE_TYPES: Record<string, string[]> = {
  // Energy levels
  'low_energy': ['cafe', 'library', 'spa', 'park', 'museum', 'art_gallery'],
  'medium_energy': ['restaurant', 'shopping_mall', 'movie_theater', 'book_store', 'aquarium'],
  'high_energy': ['gym', 'amusement_park', 'night_club', 'stadium', 'bowling_alley', 'hiking_area'],
  
  // Social preferences
  'alone': ['library', 'cafe', 'park', 'museum', 'book_store', 'spa'],
  'intimate': ['restaurant', 'cafe', 'bar', 'movie_theater', 'art_gallery'],
  'small_group': ['restaurant', 'bowling_alley', 'movie_theater', 'escape_room', 'mini_golf'],
  'crowd': ['amusement_park', 'stadium', 'night_club', 'concert_hall', 'festival'],
  
  // Moods
  'adventurous': ['amusement_park', 'hiking_area', 'tourist_attraction', 'escape_room'],
  'relaxed': ['spa', 'park', 'cafe', 'beach', 'botanical_garden'],
  'creative': ['art_gallery', 'museum', 'book_store', 'pottery_studio', 'music_venue'],
  'productive': ['library', 'cafe', 'coworking_space', 'study_hall'],
  'social': ['restaurant', 'bar', 'bowling_alley', 'karaoke', 'dance_club'],
  'contemplative': ['museum', 'art_gallery', 'library', 'park', 'church'],
  'playful': ['amusement_park', 'arcade', 'mini_golf', 'bowling_alley', 'trampoline_park'],
  
  // Budget levels
  'budget_free': ['park', 'library', 'beach', 'hiking_area', 'church', 'market'],
  'budget_low': ['cafe', 'fast_food', 'thrift_store', 'public_pool', 'community_center'],
  'budget_moderate': ['restaurant', 'movie_theater', 'museum', 'bowling_alley', 'mini_golf'],
  'budget_high': ['fine_dining', 'spa', 'theater', 'luxury_shopping', 'wine_tasting'],
  
  // Weather preferences
  'indoor': ['museum', 'library', 'shopping_mall', 'movie_theater', 'restaurant', 'spa'],
  'outdoor': ['park', 'beach', 'hiking_area', 'botanical_garden', 'outdoor_market'],
  
  // Time available
  'time_quick': ['cafe', 'fast_food', 'convenience_store', 'atm', 'gas_station'],
  'time_moderate': ['restaurant', 'movie_theater', 'museum', 'shopping_mall', 'bowling_alley'],
  'time_extended': ['amusement_park', 'hiking_area', 'beach', 'zoo', 'aquarium'],
  'time_all_day': ['amusement_park', 'beach', 'national_park', 'festival', 'tourist_attraction']
};

// Duration heuristics per activity bucket (in hours)
export const BUCKET_DURATION_HEURISTICS: Record<string, { min: number; max: number; typical: number }> = {
  'trails': { min: 1, max: 8, typical: 3 },
  'adrenaline': { min: 1, max: 6, typical: 2.5 },
  'culture': { min: 0.5, max: 4, typical: 1.5 },
  'nature': { min: 1, max: 6, typical: 2 },
  'wellness': { min: 0.5, max: 4, typical: 1.5 },
  'nightlife': { min: 2, max: 8, typical: 4 },
  'food': { min: 0.5, max: 3, typical: 1.5 },
  'adventure': { min: 1, max: 8, typical: 3 },
  'entertainment': { min: 1, max: 4, typical: 2 }
};

// Regional centers for nationwide search across Romania
export const ROMANIA_REGIONAL_CENTERS = [
  { name: 'Bucharest', lat: 44.4268, lng: 26.1025, population: 1883425 },
  { name: 'Cluj-Napoca', lat: 46.7712, lng: 23.6236, population: 324576 },
  { name: 'Timișoara', lat: 45.7489, lng: 21.2087, population: 319279 },
  { name: 'Iași', lat: 47.1585, lng: 27.6014, population: 290422 },
  { name: 'Constanța', lat: 44.1598, lng: 28.6348, population: 283872 },
  { name: 'Craiova', lat: 44.3302, lng: 23.7949, population: 269506 },
  { name: 'Brașov', lat: 45.6427, lng: 25.5887, population: 253200 },
  { name: 'Galați', lat: 45.4353, lng: 28.0080, population: 249432 }
];

// Vibe to Google Places types and keywords mapping
export interface VibeMapping {
  types: string[];
  keywords: string[];
}

export const VIBE_TO_PLACES_MAPPING: Record<string, VibeMapping> = {
  // Adventure & Adrenaline
  'adventure': {
    types: ['amusement_park', 'tourist_attraction', 'park'],
    keywords: ['adventure park', 'zip line', 'climbing', 'escape room', 'karting']
  },
  'adrenaline': {
    types: ['amusement_park', 'gym', 'tourist_attraction'],
    keywords: ['extreme sports', 'bungee', 'paragliding', 'rock climbing', 'adventure']
  },
  'trails': {
    types: ['park', 'tourist_attraction', 'natural_feature'],
    keywords: ['hiking trail', 'nature trail', 'walking path', 'mountain trail']
  },
  
  // Culture & Learning
  'culture': {
    types: ['museum', 'art_gallery', 'tourist_attraction', 'church', 'library'],
    keywords: ['museum', 'gallery', 'cultural center', 'historic site', 'monument']
  },
  'art': {
    types: ['art_gallery', 'museum', 'tourist_attraction'],
    keywords: ['art gallery', 'contemporary art', 'sculpture', 'exhibition']
  },
  
  // Nature & Outdoor
  'nature': {
    types: ['park', 'natural_feature', 'tourist_attraction'],
    keywords: ['park', 'garden', 'nature reserve', 'botanical garden', 'lake']
  },
  'outdoor': {
    types: ['park', 'campground', 'tourist_attraction'],
    keywords: ['outdoor activities', 'picnic area', 'recreation area']
  },
  
  // Wellness & Relaxation
  'wellness': {
    types: ['spa', 'gym', 'beauty_salon'],
    keywords: ['spa', 'wellness center', 'massage', 'thermal baths', 'relaxation']
  },
  'relaxation': {
    types: ['spa', 'park', 'tourist_attraction'],
    keywords: ['peaceful', 'quiet', 'meditation', 'zen garden', 'retreat']
  },
  
  // Entertainment & Nightlife
  'nightlife': {
    types: ['night_club', 'bar', 'casino'],
    keywords: ['nightclub', 'bar', 'pub', 'live music', 'dancing']
  },
  
  // Social & Emotional Vibes
  'lonely': {
    types: ['cafe', 'library', 'community_center', 'book_store', 'art_gallery', 'museum'],
    keywords: ['coffee shop', 'bookstore', 'community events', 'art class', 'workshop', 'social space']
  },
  'social': {
    types: ['cafe', 'restaurant', 'bar', 'bowling_alley', 'movie_theater', 'shopping_mall'],
    keywords: ['social dining', 'group activities', 'meetup space', 'interactive', 'community']
  },
  'connection': {
    types: ['community_center', 'library', 'cafe', 'park', 'church'],
    keywords: ['community center', 'social events', 'group activities', 'volunteer', 'classes']
  },
  'creative': {
    types: ['art_gallery', 'museum', 'craft_store', 'library'],
    keywords: ['art studio', 'craft workshop', 'creative space', 'maker space', 'pottery']
  },
  'peaceful': {
    types: ['park', 'library', 'church', 'spa', 'garden'],
    keywords: ['quiet space', 'meditation', 'peaceful garden', 'sanctuary', 'contemplation']
  },
  'entertainment': {
    types: ['movie_theater', 'amusement_park', 'bowling_alley', 'tourist_attraction'],
    keywords: ['entertainment', 'cinema', 'theater', 'concert hall', 'arcade']
  },
  
  // Food (only when culinary flag enabled)
  'food': {
    types: ['restaurant', 'cafe', 'meal_takeaway'],
    keywords: ['restaurant', 'local cuisine', 'traditional food', 'fine dining']
  },
  'culinary': {
    types: ['restaurant', 'food', 'meal_delivery'],
    keywords: ['culinary experience', 'food tour', 'cooking class', 'wine tasting']
  }
};
