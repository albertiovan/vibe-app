/**
 * Wikipedia REST API Service
 * 
 * Provides factual mini-summaries of activity types for "What you'll do" sections
 */

import { makeRequest } from '../shared/httpClient.js';
import { sharedCache, generateCacheKey } from '../shared/cache.js';
import { features, rateLimits, cacheTTL } from '../../config/integrations.js';

export interface WikipediaSummary {
  title: string;
  extract: string;
  thumbnail?: {
    source: string;
    width: number;
    height: number;
  };
  url: string;
  lang: string;
}

interface WikipediaApiResponse {
  type: string;
  title: string;
  displaytitle: string;
  extract: string;
  extract_html?: string;
  thumbnail?: {
    source: string;
    width: number;
    height: number;
  };
  originalimage?: {
    source: string;
    width: number;
    height: number;
  };
  lang: string;
  content_urls: {
    desktop: {
      page: string;
    };
    mobile: {
      page: string;
    };
  };
}

export class WikipediaService {
  private baseUrl = 'https://en.wikipedia.org/api/rest_v1';
  private isEnabled: boolean;

  constructor() {
    this.isEnabled = features.enrichment.wikipedia;
  }

  /**
   * Get activity summary from Wikipedia
   */
  async getSummary(
    activityTitle: string,
    options: {
      language?: string;
      maxLength?: number;
    } = {}
  ): Promise<{ ok: true; summary: WikipediaSummary } | { ok: false; error: string }> {
    if (!this.isEnabled) {
      return { ok: false, error: 'Wikipedia service not enabled' };
    }

    const { language = 'en', maxLength = 320 } = options;
    
    // Normalize activity title for Wikipedia search
    const normalizedTitle = this.normalizeActivityTitle(activityTitle);
    const cacheKey = generateCacheKey('wikipedia', 'summary', { title: normalizedTitle, language });
    
    // Check cache first
    const cached = sharedCache.get<WikipediaSummary>(cacheKey);
    if (cached) {
      console.log('📚 Wikipedia cache hit for:', normalizedTitle);
      return { ok: true, summary: cached };
    }

    console.log('📚 Fetching Wikipedia summary for:', normalizedTitle);

    // Try multiple title variations
    const titleVariations = this.generateTitleVariations(normalizedTitle);
    
    for (const title of titleVariations) {
      const result = await this.fetchSummaryByTitle(title, language);
      
      if (result.ok) {
        // Truncate extract if needed
        let extract = result.summary.extract;
        if (extract.length > maxLength) {
          extract = extract.substring(0, maxLength);
          // Try to end at a sentence boundary
          const lastPeriod = extract.lastIndexOf('.');
          if (lastPeriod > maxLength * 0.7) {
            extract = extract.substring(0, lastPeriod + 1);
          } else {
            extract += '...';
          }
        }

        const summary: WikipediaSummary = {
          ...result.summary,
          extract
        };

        // Cache successful result
        sharedCache.set(cacheKey, summary, cacheTTL.wikipedia);
        
        console.log(`✅ Found Wikipedia summary for "${title}"`);
        return { ok: true, summary };
      }
    }

    const error = `No Wikipedia article found for "${normalizedTitle}" or its variations`;
    console.log('📚', error);
    return { ok: false, error };
  }

  /**
   * Get multiple activity summaries in batch
   */
  async getBatchSummaries(
    activityTitles: string[],
    options: {
      language?: string;
      maxLength?: number;
    } = {}
  ): Promise<{
    successful: Array<{ title: string; summary: WikipediaSummary }>;
    failed: Array<{ title: string; error: string }>;
  }> {
    const successful: Array<{ title: string; summary: WikipediaSummary }> = [];
    const failed: Array<{ title: string; error: string }> = [];

    // Process in parallel but respect rate limits
    const promises = activityTitles.map(async (title) => {
      const result = await this.getSummary(title, options);
      
      if (result.ok) {
        successful.push({ title, summary: result.summary });
      } else {
        failed.push({ title, error: result.error });
      }
    });

    await Promise.all(promises);

    return { successful, failed };
  }

  /**
   * Search for activity-related articles
   */
  async searchActivities(
    searchTerm: string,
    options: {
      limit?: number;
      language?: string;
    } = {}
  ): Promise<{ ok: true; results: string[] } | { ok: false; error: string }> {
    const { limit = 10, language = 'en' } = options;
    
    const cacheKey = generateCacheKey('wikipedia', 'search', { term: searchTerm, limit, language });
    
    // Check cache first
    const cached = sharedCache.get<string[]>(cacheKey);
    if (cached) {
      console.log('🔍 Wikipedia search cache hit for:', searchTerm);
      return { ok: true, results: cached };
    }

    console.log('🔍 Searching Wikipedia for:', searchTerm);

    const searchUrl = `https://${language}.wikipedia.org/w/api.php?` + new URLSearchParams({
      action: 'opensearch',
      search: searchTerm,
      limit: limit.toString(),
      namespace: '0',
      format: 'json',
      origin: '*'
    }).toString();

    const response = await makeRequest<[string, string[], string[], string[]]>(
      'wikipedia',
      {
        url: searchUrl,
        method: 'GET'
      },
      rateLimits.wikipedia
    );

    if (!response.ok) {
      return { ok: false, error: `Wikipedia search failed: ${response.error}` };
    }

    const [, titles] = response.data;
    
    // Cache results
    sharedCache.set(cacheKey, titles, cacheTTL.wikipedia);

    console.log(`✅ Found ${titles.length} Wikipedia search results for "${searchTerm}"`);
    return { ok: true, results: titles };
  }

  /**
   * Fetch summary by exact title
   */
  private async fetchSummaryByTitle(
    title: string,
    language: string
  ): Promise<{ ok: true; summary: WikipediaSummary } | { ok: false; error: string }> {
    const encodedTitle = encodeURIComponent(title);
    const url = `https://${language}.wikipedia.org/api/rest_v1/page/summary/${encodedTitle}`;

    const response = await makeRequest<WikipediaApiResponse>(
      'wikipedia',
      {
        url,
        method: 'GET',
        headers: {
          'User-Agent': 'VibeApp/1.0 (https://vibe-app.com)'
        }
      },
      rateLimits.wikipedia
    );

    if (!response.ok) {
      return { ok: false, error: response.error };
    }

    const data = response.data;
    
    // Check if it's a disambiguation page or redirect
    if (data.type === 'disambiguation') {
      return { ok: false, error: 'Disambiguation page' };
    }

    const summary: WikipediaSummary = {
      title: data.title,
      extract: data.extract,
      thumbnail: data.thumbnail,
      url: data.content_urls.desktop.page,
      lang: data.lang
    };

    return { ok: true, summary };
  }

  /**
   * Normalize activity title for Wikipedia lookup
   */
  private normalizeActivityTitle(activityTitle: string): string {
    // Convert to title case and clean up
    return activityTitle
      .toLowerCase()
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')
      .replace(/[^\w\s-]/g, '') // Remove special characters except hyphens
      .trim();
  }

  /**
   * Generate title variations for better Wikipedia matching
   */
  private generateTitleVariations(activityTitle: string): string[] {
    const variations: string[] = [activityTitle];
    
    // Activity-specific variations
    const activityMappings: Record<string, string[]> = {
      'Rock Climbing': ['Rock climbing', 'Climbing', 'Sport climbing'],
      'Indoor Climbing': ['Indoor climbing', 'Climbing wall', 'Bouldering'],
      'Bouldering': ['Bouldering', 'Rock climbing'],
      'Yoga': ['Yoga', 'Hatha yoga', 'Vinyasa yoga'],
      'Pilates': ['Pilates', 'Pilates method'],
      'Martial Arts': ['Martial arts', 'Combat sport'],
      'Karate': ['Karate', 'Martial arts'],
      'Judo': ['Judo', 'Martial arts'],
      'Boxing': ['Boxing', 'Combat sport'],
      'Swimming': ['Swimming', 'Swimming (sport)'],
      'Kayaking': ['Kayaking', 'Canoeing', 'Paddling'],
      'Hiking': ['Hiking', 'Walking', 'Trekking'],
      'Pottery': ['Pottery', 'Ceramic art', 'Ceramics'],
      'Painting': ['Painting', 'Art'],
      'Photography': ['Photography', 'Digital photography'],
      'Cooking': ['Cooking', 'Culinary arts'],
      'Dancing': ['Dance', 'Social dance'],
      'Salsa': ['Salsa (dance)', 'Latin dance'],
      'Tango': ['Tango', 'Argentine tango'],
      'Museum': ['Museum', 'Art museum'],
      'Theater': ['Theatre', 'Drama'],
      'Concert': ['Concert', 'Musical performance']
    };

    // Add specific mappings if available
    if (activityMappings[activityTitle]) {
      variations.push(...activityMappings[activityTitle]);
    }

    // Add generic variations
    const words = activityTitle.split(' ');
    if (words.length > 1) {
      // Try just the main word
      variations.push(words[0]);
      // Try without common prefixes/suffixes
      const mainWord = words.find(word => 
        !['indoor', 'outdoor', 'beginner', 'advanced', 'class', 'classes', 'lesson', 'lessons'].includes(word.toLowerCase())
      );
      if (mainWord && mainWord !== activityTitle) {
        variations.push(mainWord);
      }
    }

    // Remove duplicates and return
    return [...new Set(variations)];
  }

  /**
   * Extract key information from Wikipedia summary for activity context
   */
  static extractActivityInfo(summary: WikipediaSummary): {
    definition: string;
    benefits?: string[];
    equipment?: string[];
    difficulty?: string;
  } {
    const extract = summary.extract.toLowerCase();
    
    // Extract definition (first sentence)
    const sentences = summary.extract.split('.');
    const definition = sentences[0] + (sentences.length > 1 ? '.' : '');

    // Look for benefits
    const benefits: string[] = [];
    if (extract.includes('benefit') || extract.includes('improve')) {
      const benefitKeywords = ['strength', 'flexibility', 'balance', 'cardio', 'mental', 'stress', 'fitness'];
      benefitKeywords.forEach(keyword => {
        if (extract.includes(keyword)) {
          benefits.push(keyword);
        }
      });
    }

    // Look for equipment mentions
    const equipment: string[] = [];
    const equipmentKeywords = ['equipment', 'gear', 'mat', 'shoes', 'rope', 'harness', 'gloves'];
    equipmentKeywords.forEach(keyword => {
      if (extract.includes(keyword)) {
        equipment.push(keyword);
      }
    });

    // Assess difficulty
    let difficulty: string | undefined;
    if (extract.includes('beginner') || extract.includes('easy')) {
      difficulty = 'beginner';
    } else if (extract.includes('advanced') || extract.includes('difficult') || extract.includes('challenging')) {
      difficulty = 'advanced';
    } else if (extract.includes('moderate') || extract.includes('intermediate')) {
      difficulty = 'intermediate';
    }

    return {
      definition,
      benefits: benefits.length > 0 ? benefits : undefined,
      equipment: equipment.length > 0 ? equipment : undefined,
      difficulty
    };
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
      enabled: features.enrichment.wikipedia,
      configured: true, // No API key required
      cacheStats: sharedCache.getStats()
    };
  }
}

// Singleton instance
export const wikipediaService = new WikipediaService();
