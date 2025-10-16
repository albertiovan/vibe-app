// Legacy types - kept for compatibility with existing services
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

// AI mood parsing result
export interface MoodAnalysis {
  primaryMood: Mood;
  secondaryMoods: Mood[];
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
