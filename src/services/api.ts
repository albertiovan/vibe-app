import { RecommendationRequest, RecommendationResponse, ApiError } from '../types';

// Get API base URL - detect environment properly
const getApiBaseUrl = () => {
  // Check for explicit environment variable
  if (process.env.EXPO_PUBLIC_API_BASE_URL) {
    return process.env.EXPO_PUBLIC_API_BASE_URL;
  }
  
  // Check if we're in a web environment
  if (typeof window !== 'undefined' && window.location) {
    const hostname = window.location.hostname;
    
    // If accessing from localhost, use proxy
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return '/api';
    }
    
    // If accessing from network IP, use direct connection to backend
    if (hostname.startsWith('10.') || hostname.startsWith('192.168.')) {
      return process.platform === 'ios' ? 'http://localhost:3000/api' : 'http://10.103.30.198:3000/api';
    }
    
    // Fallback for web
    return '/api';
  }
  
  // Mobile/native fallback - use localhost for iOS Simulator
  return 'http://localhost:3000/api';
};

const API_BASE_URL = getApiBaseUrl();

// Debug logging
console.log('=== API Configuration Debug ===');
console.log('Platform:', typeof window !== 'undefined' ? 'Web' : 'Mobile');
console.log('Window available:', typeof window !== 'undefined' && !!window.location);
console.log('Detected API_BASE_URL:', API_BASE_URL);
console.log('================================');

class ApiService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = API_BASE_URL;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    
    const config: RequestInit = {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    };

    try {
      console.log('=== API Request Debug ===');
      console.log('Base URL:', this.baseUrl);
      console.log('Endpoint:', endpoint);
      console.log('Full URL:', url);
      console.log('Request config:', config);
      console.log('========================');
      
      const response = await fetch(url, config);
      console.log('Response status:', response.status);
      console.log('Response ok:', response.ok);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error response text:', errorText);
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }
      
      const data = await response.json();
      console.log('Response data:', data);
      
      return data;
    } catch (error) {
      console.error('API request failed:', {
        url,
        error,
        message: error instanceof Error ? error.message : 'Unknown error',
        type: typeof error
      });
      
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Network request failed');
    }
  }

  async getRecommendations(request: RecommendationRequest): Promise<RecommendationResponse> {
    console.log('🚀 NEW API SERVICE CALLED! Using vibe endpoint');
    console.log('🚀 Request:', request);
    
    // Convert old request format to new vibe format
    const vibeRequest = {
      mood: this.extractMoodFromVibe(request.vibe),
      energy: 'medium', // Default energy level
      social: 'intimate', // Default social preference
      timeAvailable: 'moderate', // Default time
      budget: 'moderate', // Default budget
      weatherPreference: 'either', // Default weather
      exploration: 'mixed', // Default exploration
      location: {
        lat: 44.4268, // Bucharest coordinates
        lng: 26.1025,
        radius: 10
      }
    };

    // Call the new vibe API
    const vibeResponse: any = await this.request('/vibe/quick-match', {
      method: 'POST',
      body: JSON.stringify(vibeRequest),
    });

    console.log('🎭 Raw Vibe API Response:', vibeResponse);
    console.log('🔍 Response structure check:', {
      success: vibeResponse.success,
      hasData: !!vibeResponse.data,
      hasMatch: !!vibeResponse.data?.match,
      hasPlaces: !!vibeResponse.data?.match?.places,
      placesLength: vibeResponse.data?.match?.places?.length
    });

    // Convert the new vibe response back to old format
    if (vibeResponse.success && vibeResponse.data?.match?.places) {
      const activities = vibeResponse.data.match.places.map((place: any) => ({
        id: place.placeId,
        name: place.name,
        description: place.vibeReasons?.join(', ') || 'Great place to visit',
        category: 'entertainment' as any,
        location: {
          address: place.vicinity || 'Bucharest, Romania',
          city: 'Bucharest',
          coordinates: place.geometry?.location
        },
        rating: place.rating,
        priceLevel: place.priceLevel === 0 ? 'free' : 
                   place.priceLevel === 1 ? 'budget' :
                   place.priceLevel === 2 ? 'moderate' : 'expensive',
        imageUrl: place.primaryImage,
        distance: place.walkingTime ? place.walkingTime / 60 : undefined,
        tags: place.vibeCategories || []
      }));

      console.log('🔄 Converted Activities:', activities);

      return {
        success: true,
        data: {
          activities,
          moodAnalysis: {
            primaryMood: this.extractMoodFromVibe(request.vibe) as any,
            secondaryMoods: [],
            suggestedCategories: ['entertainment' as any],
            confidence: vibeResponse.data.match.vibeAnalysis?.confidence || 0.8
          },
          meta: {
            totalResults: activities.length,
            timestamp: new Date().toISOString()
          }
        }
      };
    }

    // Return error response if no places found
    return {
      success: false,
      data: {
        activities: [],
        moodAnalysis: {
          primaryMood: 'relaxed' as any,
          secondaryMoods: [],
          suggestedCategories: [],
          confidence: 0
        },
        meta: {
          totalResults: 0,
          timestamp: new Date().toISOString()
        }
      }
    };
  }

  // Helper method to extract mood from vibe text
  private extractMoodFromVibe(vibe: string): string {
    const lowerVibe = vibe.toLowerCase();
    
    if (lowerVibe.includes('adventurous') || lowerVibe.includes('adventure') || lowerVibe.includes('exciting')) {
      return 'adventurous';
    }
    if (lowerVibe.includes('relaxed') || lowerVibe.includes('chill') || lowerVibe.includes('calm')) {
      return 'relaxed';
    }
    if (lowerVibe.includes('creative') || lowerVibe.includes('artistic') || lowerVibe.includes('art')) {
      return 'creative';
    }
    if (lowerVibe.includes('social') || lowerVibe.includes('people') || lowerVibe.includes('friends')) {
      return 'social';
    }
    if (lowerVibe.includes('productive') || lowerVibe.includes('work') || lowerVibe.includes('focus')) {
      return 'productive';
    }
    if (lowerVibe.includes('contemplative') || lowerVibe.includes('think') || lowerVibe.includes('reflect')) {
      return 'contemplative';
    }
    if (lowerVibe.includes('playful') || lowerVibe.includes('fun') || lowerVibe.includes('silly')) {
      return 'playful';
    }
    
    // Default fallback
    return 'relaxed';
  }

  async parseMood(vibe: string): Promise<{ success: boolean; data: any }> {
    return this.request('/parse-mood', {
      method: 'POST',
      body: JSON.stringify({ vibe }),
    });
  }

  async healthCheck(): Promise<{ status: string; timestamp: string }> {
    return this.request('/health');
  }
}

export const apiService = new ApiService();
export default apiService;
