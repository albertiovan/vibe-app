// Core activity data structure normalized from external APIs
export interface Activity {
  id: string;
  name: string;
  description: string;
  category: ActivityCategory;
  location: {
    address: string;
    city: string;
    coordinates?: {
      lat: number;
      lng: number;
    };
  };
  rating?: number;
  priceLevel?: PriceLevel;
  imageUrl?: string;
  website?: string;
  phone?: string;
  distance?: number; // in km from user location
  tags: string[];
}

export type ActivityCategory = 
  | 'outdoor'
  | 'indoor'
  | 'cultural'
  | 'food'
  | 'entertainment'
  | 'wellness'
  | 'adventure'
  | 'social'
  | 'creative'
  | 'relaxation';

export type PriceLevel = 'free' | 'budget' | 'moderate' | 'expensive';

export type Mood = 
  | 'adventurous'
  | 'relaxed'
  | 'social'
  | 'creative'
  | 'energetic'
  | 'contemplative'
  | 'romantic'
  | 'curious'
  | 'playful'
  | 'peaceful';

// User input for recommendations
export interface RecommendationRequest {
  vibe: string;
  location?: {
    lat: number;
    lng: number;
  };
  city?: string;
  maxDistance?: number; // in km
  priceLevel?: PriceLevel[];
  categories?: ActivityCategory[];
}

// AI mood parsing result
export interface MoodAnalysis {
  primaryMood: Mood;
  secondaryMoods: Mood[];
  suggestedCategories: ActivityCategory[];
  suggestedTags: string[];
  confidence: number;
}

// Structured API error response
export interface ApiError {
  error: string;
  message: string;
  timestamp?: string;
  path?: string;
}

// External API response types (TripAdvisor)
export interface TripAdvisorLocation {
  location_id: string;
  name: string;
  description?: string;
  address: string;
  latitude: string;
  longitude: string;
  rating?: string;
  price_level?: string;
  photo?: {
    images: {
      small: { url: string };
      medium: { url: string };
      large: { url: string };
    };
  };
  website?: string;
  phone?: string;
  subcategory?: Array<{ name: string }>;
}

export interface TripAdvisorResponse {
  data: TripAdvisorLocation[];
  paging?: {
    total_results: string;
    results: string;
    offset: string;
  };
}
