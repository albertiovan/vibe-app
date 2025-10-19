/**
 * Enrichment API Service
 * 
 * Handles YouTube videos, Wikipedia context, and Tavily web search
 */

// Get API base URL - detect environment properly
const getApiBaseUrl = () => {
  // Check for explicit environment variable
  if (process.env.EXPO_PUBLIC_API_BASE_URL) {
    return process.env.EXPO_PUBLIC_API_BASE_URL;
  }
  
  // Check if we're in a web environment
  if (typeof window !== 'undefined' && window.location) {
    const hostname = window.location.hostname;
    
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return '/api';
    }
    
    if (hostname.startsWith('10.') || hostname.startsWith('192.168.')) {
      return `http://10.103.30.198:3000/api`;
    }
    
    return '/api';
  }
  
  // Mobile/native fallback
  return 'http://10.103.30.198:3000/api';
};

const API_BASE_URL = getApiBaseUrl();

export interface YouTubeVideo {
  id: string;
  title: string;
  channel: string;
  duration: string;
  viewCount: number;
  relevanceScore: number;
  url: string;
  thumbnail: {
    url: string;
    width: number;
    height: number;
  };
}

export interface WikipediaSummary {
  title: string;
  extract: string;
  url: string;
  thumbnail?: {
    source: string;
    width: number;
    height: number;
  };
}

export interface TavilySearchResult {
  title: string;
  url: string;
  content: string;
  score: number;
}

export interface ActivityEnrichment {
  tutorialVideos?: YouTubeVideo[];
  activityInfo?: WikipediaSummary;
  webContext?: {
    suggestions: string[];
    tips: string[];
  };
  enrichmentSources: string[];
}

class EnrichmentApiService {
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
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Enrichment API request failed:', {
        url,
        error,
        message: error instanceof Error ? error.message : 'Unknown error'
      });
      
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Network request failed');
    }
  }

  /**
   * Get YouTube tutorial videos for an activity
   */
  async getYouTubeVideos(activity: string, region?: string): Promise<YouTubeVideo[]> {
    try {
      const response: any = await this.request('/enrichment/test/youtube', {
        method: 'POST',
        body: JSON.stringify({ activity, region }),
      });

      if (response.success && response.data?.videos) {
        return response.data.videos;
      }
      
      return [];
    } catch (error) {
      console.warn('Failed to get YouTube videos:', error);
      return [];
    }
  }

  /**
   * Get Wikipedia summary for an activity
   */
  async getWikipediaSummary(activity: string): Promise<WikipediaSummary | null> {
    try {
      const response: any = await this.request('/enrichment/test/wikipedia', {
        method: 'POST',
        body: JSON.stringify({ activity }),
      });

      if (response.success && response.data?.summary) {
        return response.data.summary;
      }
      
      return null;
    } catch (error) {
      console.warn('Failed to get Wikipedia summary:', error);
      return null;
    }
  }

  /**
   * Get Tavily web search results for an activity
   */
  async getTavilySearch(query: string, maxResults: number = 3): Promise<{
    results: TavilySearchResult[];
    extracted: {
      venues: string[];
      keywords: string[];
      tips: string[];
    };
  }> {
    try {
      const response: any = await this.request('/enrichment/test/tavily', {
        method: 'POST',
        body: JSON.stringify({ query, maxResults }),
      });

      if (response.success && response.data) {
        return {
          results: response.data.results || [],
          extracted: response.data.extracted || { venues: [], keywords: [], tips: [] }
        };
      }
      
      return { results: [], extracted: { venues: [], keywords: [], tips: [] } };
    } catch (error) {
      console.warn('Failed to get Tavily search results:', error);
      return { results: [], extracted: { venues: [], keywords: [], tips: [] } };
    }
  }

  /**
   * Get full enrichment for an activity
   */
  async getActivityEnrichment(activityName: string, region?: string): Promise<ActivityEnrichment> {
    try {
      const testActivity = {
        name: activityName,
        category: 'general',
        places: [] // Empty to trigger enrichment
      };

      const response: any = await this.request('/enrichment/test/enrich', {
        method: 'POST',
        body: JSON.stringify({
          activity: testActivity,
          options: {
            includeTutorialVideos: true,
            includeActivityInfo: true,
            useWebSearchFallback: true
          }
        }),
      });

      if (response.success && response.data?.enriched) {
        const enriched = response.data.enriched;
        
        return {
          tutorialVideos: enriched.tutorialVideos || [],
          activityInfo: enriched.activityInfo || null,
          webContext: enriched.webContext || null,
          enrichmentSources: enriched.enrichmentSources || []
        };
      }
      
      return { enrichmentSources: [] };
    } catch (error) {
      console.warn('Failed to get activity enrichment:', error);
      return { enrichmentSources: [] };
    }
  }

  /**
   * Check enrichment services status
   */
  async getEnrichmentStatus(): Promise<{
    youtube: { enabled: boolean; configured: boolean };
    tavily: { enabled: boolean; configured: boolean };
    wikipedia: { enabled: boolean; configured: boolean };
  }> {
    try {
      const response: any = await this.request('/enrichment/status');
      
      if (response.success && response.data?.services) {
        return response.data.services;
      }
      
      return {
        youtube: { enabled: false, configured: false },
        tavily: { enabled: false, configured: false },
        wikipedia: { enabled: false, configured: false }
      };
    } catch (error) {
      console.warn('Failed to get enrichment status:', error);
      return {
        youtube: { enabled: false, configured: false },
        tavily: { enabled: false, configured: false },
        wikipedia: { enabled: false, configured: false }
      };
    }
  }
}

export const enrichmentApiService = new EnrichmentApiService();
export default enrichmentApiService;
