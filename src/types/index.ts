// Shared types between frontend and backend
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
  distance?: number;
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

export interface RecommendationRequest {
  vibe: string;
  location?: {
    lat: number;
    lng: number;
  };
  city?: string;
  maxDistance?: number;
  priceLevel?: PriceLevel[];
  categories?: ActivityCategory[];
}

export interface MoodAnalysis {
  primaryMood: Mood;
  secondaryMoods: Mood[];
  suggestedCategories: ActivityCategory[];
  confidence: number;
}

export interface RecommendationResponse {
  success: boolean;
  data: {
    activities: Activity[];
    moodAnalysis: MoodAnalysis;
    meta: {
      totalResults: number;
      timestamp: string;
    };
  };
}

export interface ApiError {
  error: string;
  message: string;
  timestamp?: string;
  path?: string;
  details?: Array<{
    field: string;
    message: string;
  }>;
}

// Navigation types
export type RootStackParamList = {
  Home: undefined;
  Results: {
    activities: Activity[];
    moodAnalysis: MoodAnalysis;
    vibe: string;
  };
};

// Component props
export interface VibeInputProps {
  onSubmit: (vibe: string) => void;
  loading?: boolean;
  placeholder?: string;
}

export interface ActivityCardProps {
  activity: Activity;
  onPress?: () => void;
}

export interface LoadingShimmerProps {
  count?: number;
  height?: number;
}
