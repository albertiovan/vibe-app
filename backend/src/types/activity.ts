/**
 * Activity-Focused Data Structures
 * Enhanced interfaces for activity-first experience with blurbs and reviews
 */

export type BucketId = 'adventure' | 'adrenaline' | 'trails' | 'culture' | 'art' | 'nature' | 'outdoor' | 'wellness' | 'relaxation' | 'nightlife' | 'entertainment' | 'lonely' | 'social' | 'connection' | 'creative' | 'peaceful';

export interface GoogleReview {
  author?: string;
  rating?: number;
  time?: string;
  text?: string;
  profilePhotoUrl?: string;
  relativeTimeDescription?: string;
}

export interface OpeningHours {
  openNow?: boolean;
  weekdayText?: string[];
  periods?: Array<{
    open: { day: number; time: string };
    close?: { day: number; time: string };
  }>;
}

/**
 * Enhanced Activity Card View with activity-first blurbs and reviews
 */
export interface CardActivityView {
  // Core identification
  id: string;           // place_id
  name: string;
  bucket: BucketId;     // e.g., 'adrenaline'
  activitySubtype: string; // from mapping tables (e.g., 'live_music', 'climbing_gym')
  
  // Visual & Navigation
  imageUrl?: string;
  mapsUrl: string;
  
  // Ratings & Social Proof
  rating?: number;
  userRatingsTotal?: number;
  
  // NEW: Activity-first content
  blurb?: string;       // Short activity description (12-22 words)
  
  // Location & Practical Info
  address?: string;
  vicinity?: string;
  location?: {
    lat: number;
    lng: number;
  };
  
  // Operational Details
  openingHours?: OpeningHours;
  priceLevel?: number;  // 0-4 scale from Google Places
  website?: string;
  
  // NEW: Reviews for detail page
  reviews?: GoogleReview[];
  
  // Activity Metadata
  indoorOutdoor?: 'indoor' | 'outdoor' | 'either';
  durationHintHrs?: [number, number];
  difficulty?: number;  // 1-5 scale
  
  // Google Places raw data (for blurb generation)
  types?: string[];
  editorialSummary?: string;
  keywords?: string[];
}

/**
 * Configuration constants for activity blurbs and details
 */
export const ACTIVITY_CONFIG = {
  BLURB_MAX_WORDS: 22,
  DETAIL_MAX_REVIEWS: 3,
  BLURB_MIN_WORDS: 8,
  CACHE_TTL_HOURS: 24
} as const;

/**
 * Activity subtype to verb mapping for heuristic blurbs
 */
export const ACTIVITY_VERB_MAPPING: Record<string, string> = {
  // Nightlife & Entertainment
  'night_club': 'Dance to DJ sets and live music with a vibrant crowd',
  'live_music': 'Catch live performances and enjoy the music scene',
  'bar': 'Enjoy drinks and socialize in a lively atmosphere',
  'movie_theater': 'Watch the latest films on the big screen',
  'bowling_alley': 'Bowl strikes and spares with friends',
  
  // Adventure & Sports
  'climbing_gym': 'Boulder on beginner routes and challenge yourself',
  'amusement_park': 'Experience thrilling rides and attractions',
  'escape_room': 'Solve timed puzzles and escape challenging scenarios',
  'gym': 'Work out and stay active with modern equipment',
  'ski_resort': 'Ski groomed slopes and enjoy mountain views',
  
  // Culture & Learning
  'museum': 'Explore fascinating exhibits and learn something new',
  'art_gallery': 'Discover inspiring artworks and creative expressions',
  'library': 'Read quietly and access vast knowledge resources',
  'tourist_attraction': 'Explore unique sights and local landmarks',
  'church': 'Find peace and admire beautiful architecture',
  
  // Nature & Outdoor
  'park': 'Walk peaceful trails and enjoy natural surroundings',
  'zoo': 'Observe amazing animals and learn about wildlife',
  'aquarium': 'Marvel at marine life and underwater ecosystems',
  'botanical_garden': 'Stroll through beautiful plants and flowers',
  
  // Social & Connection
  'cafe': 'Sip coffee and connect with others in a cozy setting',
  'restaurant': 'Enjoy delicious meals and social dining experiences',
  'book_store': 'Browse books and discover new stories',
  'shopping_mall': 'Shop and explore various stores and boutiques',
  'community_center': 'Join activities and meet like-minded people',
  
  // Wellness & Relaxation
  'spa': 'Relax with massages and rejuvenating treatments',
  'beauty_salon': 'Pamper yourself with professional beauty services',
  
  // Default fallback
  'default': 'Experience something new and exciting at this location'
};

/**
 * Bucket to activity verb mapping for broader categories
 */
export const BUCKET_VERB_MAPPING: Record<BucketId, string> = {
  'adventure': 'Embark on exciting adventures and thrilling experiences',
  'adrenaline': 'Get your adrenaline pumping with extreme activities',
  'trails': 'Hike scenic trails and explore natural paths',
  'culture': 'Immerse yourself in rich cultural experiences',
  'art': 'Engage with inspiring art and creative expressions',
  'nature': 'Connect with nature and enjoy outdoor beauty',
  'outdoor': 'Enjoy fresh air and outdoor recreational activities',
  'wellness': 'Focus on wellbeing and personal care',
  'relaxation': 'Unwind and find peace in tranquil settings',
  'nightlife': 'Experience vibrant nightlife and social scenes',
  'entertainment': 'Enjoy fun entertainment and leisure activities',
  'lonely': 'Find connection and community in welcoming spaces',
  'social': 'Meet people and engage in social activities',
  'connection': 'Build meaningful connections with others',
  'creative': 'Express creativity and explore artistic pursuits',
  'peaceful': 'Find calm and serenity in quiet environments'
};
