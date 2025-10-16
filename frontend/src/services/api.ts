import Constants from 'expo-constants';
import { RecommendationRequest, RecommendationResponse, ApiError } from '../types';

// Get API base URL - detect environment properly
const getApiBaseUrl = () => {
  // Check if we have explicit configuration
  if (Constants.expoConfig?.extra?.apiBaseUrl) {
    return Constants.expoConfig.extra.apiBaseUrl;
  }
  
  if (process.env.EXPO_PUBLIC_API_BASE_URL) {
    return process.env.EXPO_PUBLIC_API_BASE_URL;
  }
  
  // Auto-detect based on environment
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    
    // If accessing from localhost, use proxy
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return '/api';
    }
    
    // If accessing from network IP, use direct connection to backend
    if (hostname.startsWith('10.') || hostname.startsWith('192.168.')) {
      return `http://10.103.30.198:3000/api`;
    }
    
    // Fallback for web
    return '/api';
  }
  
  // Mobile/native fallback
  return 'http://127.0.0.1:3000/api';
};

const API_BASE_URL = getApiBaseUrl();

// Debug logging
console.log('=== API Configuration Debug ===');
console.log('Window hostname:', typeof window !== 'undefined' ? window.location.hostname : 'N/A');
console.log('Window href:', typeof window !== 'undefined' ? window.location.href : 'N/A');
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
