/**
 * Shared TypeScript type definitions
 */

export interface RecommendationRequest {
  vibe: string;
  location?: {
    latitude: number;
    longitude: number;
  };
  filters?: {
    distanceKm?: number;
    durationHours?: number;
    energyLevel?: string;
    groupSize?: string;
    mood?: string;
    categories?: string[];
    timeOfDay?: string;
    budget?: string;
  };
  deviceId?: string;
  userId?: string;
}

export interface Activity {
  id: number;
  name: string;
  category: string;
  description: string;
  energyLevel: string;
  groupSize: string;
  mood: string;
  timeOfDay: string;
  budget: string;
  estimatedDuration: string;
  imageUrl?: string;
  venues?: Venue[];
}

export interface Venue {
  id: number;
  name: string;
  city: string;
  latitude: number;
  longitude: number;
  website?: string;
  distance?: number;
}

export interface RecommendationResponse {
  success: boolean;
  activities: Activity[];
  conversationId?: number;
  message?: string;
}

export interface ApiError {
  message: string;
  code?: string;
  details?: any;
}
