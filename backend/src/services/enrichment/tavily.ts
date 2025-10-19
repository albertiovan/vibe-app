/**
 * Tavily Web Search Service
 * 
 * Low-latency web search for rare/long-tail activities when Google Places is sparse
 */

import { makeRequest } from '../shared/httpClient.js';
import { sharedCache, generateCacheKey } from '../shared/cache.js';
import { features, getIntegrationKeys, rateLimits, cacheTTL } from '../../config/integrations.js';

export interface TavilySearchResult {
  title: string;
  url: string;
  content: string;
  score: number;
  publishedDate?: string;
}

export interface TavilyResponse {
  query: string;
  results: TavilySearchResult[];
  answer?: string;
  images?: string[];
  followUpQuestions?: string[];
}

interface TavilyApiResponse {
  query: string;
  follow_up_questions?: string[];
  answer?: string;
  images?: string[];
  results: Array<{
    title: string;
    url: string;
    content: string;
    score: number;
    published_date?: string;
  }>;
}

export class TavilyService {
  private baseUrl = 'https://api.tavily.com';
  private isEnabled: boolean;

  constructor() {
    // Always enable the service - check keys at runtime
    this.isEnabled = features.enrichment.tavily;
  }

  /**
   * Search web for activity information (used when Places is sparse)
   */
  async webSearch(
    query: string,
    options: {
      maxResults?: number;
      searchDepth?: 'basic' | 'advanced';
      includeAnswer?: boolean;
      includeImages?: boolean;
      includeDomains?: string[];
      excludeDomains?: string[];
    } = {}
  ): Promise<{ ok: true; data: TavilyResponse } | { ok: false; error: string }> {
    if (!this.isEnabled) {
      return { ok: false, error: 'Tavily service not enabled' };
    }

    const apiKey = getIntegrationKeys().TAVILY_API_KEY;
    if (!apiKey) {
      return { ok: false, error: 'Tavily API key not configured' };
    }

    const {
      maxResults = 5,
      searchDepth = 'basic',
      includeAnswer = true,
      includeImages = false,
      includeDomains = [],
      excludeDomains = []
    } = options;

    const cacheKey = generateCacheKey('tavily', 'search', { 
      query, 
      maxResults, 
      searchDepth, 
      includeAnswer,
      includeDomains: includeDomains.join(','),
      excludeDomains: excludeDomains.join(',')
    });
    
    // Check cache first
    const cached = sharedCache.get<TavilyResponse>(cacheKey);
    if (cached) {
      console.log('🔍 Tavily cache hit for:', query);
      return { ok: true, data: cached };
    }

    console.log('🔍 Searching Tavily for:', query);

    const requestBody = {
      api_key: apiKey,
      query,
      search_depth: searchDepth,
      max_results: maxResults,
      include_answer: includeAnswer,
      include_images: includeImages,
      ...(includeDomains.length > 0 && { include_domains: includeDomains }),
      ...(excludeDomains.length > 0 && { exclude_domains: excludeDomains })
    };

    const response = await makeRequest<TavilyApiResponse>(
      'tavily',
      {
        url: `${this.baseUrl}/search`,
        method: 'POST',
        body: requestBody
      },
      rateLimits.tavily
    );

    if (!response.ok) {
      return { ok: false, error: `Tavily search failed: ${response.error}` };
    }

    // Transform response
    const tavilyResponse: TavilyResponse = {
      query: response.data.query,
      results: response.data.results.map(result => ({
        title: result.title,
        url: result.url,
        content: result.content,
        score: result.score,
        publishedDate: result.published_date
      })),
      answer: response.data.answer,
      images: response.data.images,
      followUpQuestions: response.data.follow_up_questions
    };

    // Cache results
    sharedCache.set(cacheKey, tavilyResponse, cacheTTL.tavily);

    console.log(`✅ Found ${tavilyResponse.results.length} Tavily results for "${query}"`);
    return { ok: true, data: tavilyResponse };
  }

  /**
   * Search for activity venues in a specific location (when Places is sparse)
   */
  async searchActivityVenues(
    activityType: string,
    location: string,
    options: {
      experienceLevel?: 'beginner' | 'intermediate' | 'advanced';
      maxResults?: number;
    } = {}
  ): Promise<{ ok: true; data: TavilyResponse } | { ok: false; error: string }> {
    const { experienceLevel = 'beginner', maxResults = 5 } = options;
    
    const query = this.buildVenueSearchQuery(activityType, location, experienceLevel);
    
    return this.webSearch(query, {
      maxResults,
      searchDepth: 'basic',
      includeAnswer: true,
      excludeDomains: [
        'facebook.com', 
        'instagram.com', 
        'twitter.com',
        'tiktok.com'
      ] // Exclude social media for venue searches
    });
  }

  /**
   * Get activity tips and information for planning
   */
  async getActivityInfo(
    activityType: string,
    location?: string
  ): Promise<{ ok: true; data: TavilyResponse } | { ok: false; error: string }> {
    const query = this.buildInfoSearchQuery(activityType, location);
    
    return this.webSearch(query, {
      maxResults: 3,
      searchDepth: 'basic',
      includeAnswer: true,
      includeDomains: [
        'wikipedia.org',
        'wikihow.com',
        'rei.com',
        'outdoors.org',
        'timeout.com'
      ] // Prefer authoritative sources
    });
  }

  /**
   * Extract venue suggestions from search results for Claude processing
   */
  extractVenueSuggestions(searchResults: TavilySearchResult[]): {
    venueNames: string[];
    keywords: string[];
    locations: string[];
    tips: string[];
  } {
    const venueNames: string[] = [];
    const keywords: string[] = [];
    const locations: string[] = [];
    const tips: string[] = [];

    searchResults.forEach(result => {
      // Extract potential venue names (simple heuristics)
      const content = result.content.toLowerCase();
      const title = result.title.toLowerCase();
      
      // Look for venue patterns
      const venuePatterns = [
        /(\w+\s+(?:gym|studio|center|centre|club|academy|school))/gi,
        /(\w+\s+(?:climbing|yoga|fitness|martial arts|dance))/gi
      ];
      
      venuePatterns.forEach(pattern => {
        const matches = [...content.matchAll(pattern), ...title.matchAll(pattern)];
        matches.forEach(match => {
          if (match[1] && match[1].length > 3) {
            venueNames.push(match[1].trim());
          }
        });
      });

      // Extract keywords for better Places searches
      const keywordPatterns = [
        /(?:best|top|recommended|popular)\s+(\w+(?:\s+\w+){0,2})/gi,
        /(\w+(?:\s+\w+){0,1})\s+(?:classes|lessons|training|courses)/gi
      ];
      
      keywordPatterns.forEach(pattern => {
        const matches = [...content.matchAll(pattern)];
        matches.forEach(match => {
          if (match[1] && match[1].length > 3) {
            keywords.push(match[1].trim());
          }
        });
      });

      // Extract location mentions
      const locationPatterns = [
        /in\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/g,
        /near\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/g
      ];
      
      locationPatterns.forEach(pattern => {
        const matches = [...content.matchAll(pattern)];
        matches.forEach(match => {
          if (match[1] && match[1].length > 2) {
            locations.push(match[1].trim());
          }
        });
      });

      // Extract tips (first sentence of content)
      const firstSentence = result.content.split('.')[0];
      if (firstSentence && firstSentence.length > 20 && firstSentence.length < 200) {
        tips.push(firstSentence.trim());
      }
    });

    return {
      venueNames: [...new Set(venueNames)].slice(0, 10),
      keywords: [...new Set(keywords)].slice(0, 15),
      locations: [...new Set(locations)].slice(0, 5),
      tips: [...new Set(tips)].slice(0, 5)
    };
  }

  /**
   * Build venue search query
   */
  private buildVenueSearchQuery(activityType: string, location: string, experienceLevel: string): string {
    const levelTerms = {
      beginner: 'beginner friendly classes lessons',
      intermediate: 'intermediate training courses',
      advanced: 'advanced expert training'
    };

    return `${levelTerms[experienceLevel]} ${activityType} near ${location} venues studios gyms`;
  }

  /**
   * Build information search query
   */
  private buildInfoSearchQuery(activityType: string, location?: string): string {
    let query = `${activityType} guide tips what to expect beginner`;
    
    if (location) {
      query += ` ${location}`;
    }
    
    return query;
  }

  /**
   * Check if web search should be used (when Places results are sparse)
   */
  static shouldUseWebSearch(placesResults: any[], threshold: number = 2): boolean {
    return placesResults.length < threshold;
  }

  /**
   * Get service status and statistics
   */
  getStatus(): {
    enabled: boolean;
    configured: boolean;
    cacheStats?: any;
  } {
    return {
      enabled: features.enrichment.tavily,
      configured: !!getIntegrationKeys().TAVILY_API_KEY,
      cacheStats: sharedCache.getStats()
    };
  }
}

// Lazy singleton instance
let _tavilyService: TavilyService | null = null;

export function getTavilyService(): TavilyService {
  if (!_tavilyService) {
    _tavilyService = new TavilyService();
  }
  return _tavilyService;
}

// For backward compatibility - but this will still instantiate immediately  
// The key fix is using getIntegrationKeys() for runtime evaluation
export const tavilyService = getTavilyService();
