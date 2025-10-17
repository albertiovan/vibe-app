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
