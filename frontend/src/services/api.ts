import Constants from 'expo-constants';
import { RecommendationRequest, RecommendationResponse, ApiError } from '../types';

// Get API base URL from environment or default to localhost
const API_BASE_URL = Constants.expoConfig?.extra?.apiBaseUrl || 
                     process.env.EXPO_PUBLIC_API_BASE_URL || 
                     'http://localhost:3000/api';

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
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        const error: ApiError = data;
        throw new Error(error.message || `HTTP ${response.status}`);
      }

      return data;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Network request failed');
    }
  }

  async getRecommendations(request: RecommendationRequest): Promise<RecommendationResponse> {
    return this.request<RecommendationResponse>('/recommendations', {
      method: 'POST',
      body: JSON.stringify(request),
    });
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
