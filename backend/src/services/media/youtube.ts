/**
 * YouTube Data API v3 Service
 * 
 * Provides tutorial/inspiration videos for activity detail pages
 */

import { makeRequest } from '../shared/httpClient.js';
import { sharedCache, generateCacheKey } from '../shared/cache.js';
import { features, getIntegrationKeys, rateLimits, cacheTTL } from '../../config/integrations.js';

export interface YouTubeVideo {
  id: string;
  title: string;
  description: string;
  thumbnail: {
    url: string;
    width: number;
    height: number;
  };
  channel: {
    name: string;
    id: string;
  };
  duration: string; // ISO 8601 duration (PT4M13S)
  viewCount: number;
  publishedAt: string;
  url: string;
  relevanceScore: number;
}

interface YouTubeSearchResponse {
  items: Array<{
    id: {
      videoId: string;
    };
    snippet: {
      title: string;
      description: string;
      thumbnails: {
        medium: {
          url: string;
          width: number;
          height: number;
        };
      };
      channelTitle: string;
      channelId: string;
      publishedAt: string;
    };
  }>;
}

interface YouTubeVideosResponse {
  items: Array<{
    id: string;
    snippet: {
      title: string;
      description: string;
      channelTitle: string;
      channelId: string;
      publishedAt: string;
    };
    contentDetails: {
      duration: string;
    };
    statistics: {
      viewCount: string;
    };
  }>;
}

export class YouTubeService {
  private baseUrl = 'https://www.googleapis.com/youtube/v3';
  private isEnabled: boolean;

  constructor() {
    // Always enable the service - check keys at runtime
    this.isEnabled = features.media.youtube;
  }

  /**
   * Search for activity tutorial/inspiration videos
   */
  async searchActivityVideos(
    activitySubtype: string,
    region?: string,
    options: {
      maxResults?: number;
      language?: string;
    } = {}
  ): Promise<{ ok: true; videos: YouTubeVideo[] } | { ok: false; error: string }> {
    if (!this.isEnabled) {
      return { ok: false, error: 'YouTube service not enabled' };
    }

    const apiKey = getIntegrationKeys().YOUTUBE_API_KEY;
    if (!apiKey) {
      return { ok: false, error: 'YouTube API key not configured' };
    }

    const { maxResults = 6, language = 'en' } = options;
    
    // Build search query
    const query = this.buildSearchQuery(activitySubtype, region);
    const cacheKey = generateCacheKey('youtube', 'search', { query, maxResults, language });
    
    // Check cache first
    const cached = sharedCache.get<YouTubeVideo[]>(cacheKey);
    if (cached) {
      console.log('🎥 YouTube cache hit for:', query);
      return { ok: true, videos: cached };
    }

    console.log('🎥 Searching YouTube for:', query);

    // Step 1: Search for videos
    const searchResponse = await makeRequest<YouTubeSearchResponse>(
      'youtube',
      {
        url: `${this.baseUrl}/search?` + new URLSearchParams({
          part: 'snippet',
          q: query,
          type: 'video',
          safeSearch: 'strict',
          maxResults: maxResults.toString(),
          relevanceLanguage: language,
          key: apiKey
        }).toString(),
        method: 'GET'
      },
      rateLimits.youtube
    );

    if (!searchResponse.ok) {
      return { ok: false, error: `YouTube search failed: ${searchResponse.error}` };
    }

    if (searchResponse.data.items.length === 0) {
      console.log('📹 No YouTube videos found for:', query);
      return { ok: true, videos: [] };
    }

    // Step 2: Get detailed video information
    const videoIds = searchResponse.data.items.map(item => item.id.videoId);
    const videosResponse = await makeRequest<YouTubeVideosResponse>(
      'youtube',
      {
        url: `${this.baseUrl}/videos?` + new URLSearchParams({
          part: 'snippet,contentDetails,statistics',
          id: videoIds.join(','),
          key: apiKey
        }).toString(),
        method: 'GET'
      },
      rateLimits.youtube
    );

    if (!videosResponse.ok) {
      return { ok: false, error: `YouTube videos fetch failed: ${videosResponse.error}` };
    }

    // Combine search and video data
    const videos: YouTubeVideo[] = videosResponse.data.items.map(video => {
      const searchItem = searchResponse.data.items.find(item => item.id.videoId === video.id);
      const viewCount = parseInt(video.statistics.viewCount) || 0;
      const relevanceScore = this.calculateRelevanceScore(video.snippet.title, query, viewCount, video.snippet.publishedAt);

      return {
        id: video.id,
        title: video.snippet.title,
        description: video.snippet.description,
        thumbnail: {
          url: searchItem?.snippet.thumbnails.medium.url || '',
          width: searchItem?.snippet.thumbnails.medium.width || 320,
          height: searchItem?.snippet.thumbnails.medium.height || 180
        },
        channel: {
          name: video.snippet.channelTitle,
          id: video.snippet.channelId
        },
        duration: video.contentDetails.duration,
        viewCount,
        publishedAt: video.snippet.publishedAt,
        url: `https://www.youtube.com/watch?v=${video.id}`,
        relevanceScore
      };
    });

    // Sort by relevance score and take top results
    const sortedVideos = videos
      .sort((a, b) => b.relevanceScore - a.relevanceScore)
      .slice(0, Math.min(3, maxResults)); // Limit to top 3 for detail pages

    // Cache results
    sharedCache.set(cacheKey, sortedVideos, cacheTTL.youtube);

    console.log(`✅ Found ${sortedVideos.length} YouTube videos for "${query}"`);
    return { ok: true, videos: sortedVideos };
  }

  /**
   * Get tutorial videos specifically for beginners
   */
  async getTutorialVideos(
    activitySubtype: string,
    region?: string
  ): Promise<{ ok: true; videos: YouTubeVideo[] } | { ok: false; error: string }> {
    const tutorialQuery = `${activitySubtype} tutorial beginner how to`;
    return this.searchActivityVideos(tutorialQuery, region, { maxResults: 3 });
  }

  /**
   * Build search query optimized for tutorials and inspiration
   */
  private buildSearchQuery(activitySubtype: string, region?: string): string {
    let query = activitySubtype.toLowerCase();
    
    // Add tutorial/how-to terms for better results
    const tutorialTerms = this.getTutorialTerms(query);
    if (tutorialTerms.length > 0) {
      query = `${query} ${tutorialTerms.join(' ')}`;
    }

    // Add region context if relevant
    if (region && this.shouldIncludeRegion(query)) {
      query += ` ${region}`;
    }

    return query.replace(/\s+/g, ' ').trim();
  }

  /**
   * Get tutorial-specific terms for activities
   */
  private getTutorialTerms(activity: string): string[] {
    const terms: string[] = [];

    // Sports activities
    if (activity.includes('climbing')) {
      terms.push('beginner', 'basics', 'technique');
    }
    if (activity.includes('yoga')) {
      terms.push('beginner', 'poses', 'flow');
    }
    if (activity.includes('gym') || activity.includes('fitness')) {
      terms.push('workout', 'beginner', 'routine');
    }
    if (activity.includes('swimming')) {
      terms.push('technique', 'strokes', 'beginner');
    }

    // Creative activities
    if (activity.includes('pottery') || activity.includes('ceramic')) {
      terms.push('tutorial', 'beginner', 'wheel');
    }
    if (activity.includes('painting')) {
      terms.push('tutorial', 'techniques', 'beginner');
    }

    // Outdoor activities
    if (activity.includes('hiking')) {
      terms.push('tips', 'beginner', 'guide');
    }
    if (activity.includes('kayaking')) {
      terms.push('beginner', 'technique', 'basics');
    }

    // Default terms if no specific ones found
    if (terms.length === 0) {
      terms.push('tutorial', 'beginner');
    }

    return terms;
  }

  /**
   * Check if region should be included in search
   */
  private shouldIncludeRegion(activity: string): boolean {
    // Include region for location-specific activities
    const locationSpecific = [
      'hiking', 'trail', 'mountain', 'beach', 'park',
      'restaurant', 'cafe', 'museum', 'gallery'
    ];
    
    return locationSpecific.some(term => activity.includes(term));
  }

  /**
   * Calculate relevance score based on title match, views, and recency
   */
  private calculateRelevanceScore(title: string, query: string, viewCount: number, publishedAt: string): number {
    const titleLower = title.toLowerCase();
    const queryTerms = query.toLowerCase().split(' ');
    
    // Title match score (0-1)
    const titleMatchScore = queryTerms.reduce((score, term) => {
      if (titleLower.includes(term)) {
        return score + (1 / queryTerms.length);
      }
      return score;
    }, 0);

    // View count score (logarithmic scale, 0-1)
    const viewScore = Math.min(Math.log10(viewCount + 1) / 7, 1); // Cap at 10M views

    // Recency score (0-1, with 1 being most recent)
    const publishDate = new Date(publishedAt);
    const now = new Date();
    const daysSincePublish = (now.getTime() - publishDate.getTime()) / (1000 * 60 * 60 * 24);
    const recencyScore = Math.max(0, 1 - (daysSincePublish / 365)); // Decay over 1 year

    // Weighted combination
    return (titleMatchScore * 0.5) + (viewScore * 0.3) + (recencyScore * 0.2);
  }

  /**
   * Parse ISO 8601 duration to human readable format
   */
  static parseDuration(isoDuration: string): string {
    const match = isoDuration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
    if (!match) return 'Unknown';

    const hours = parseInt(match[1] || '0');
    const minutes = parseInt(match[2] || '0');
    const seconds = parseInt(match[3] || '0');

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    } else {
      return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    }
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
      enabled: features.media.youtube,
      configured: !!getIntegrationKeys().YOUTUBE_API_KEY,
      cacheStats: sharedCache.getStats()
    };
  }
}

// Lazy singleton instance
let _youtubeService: YouTubeService | null = null;

export function getYouTubeService(): YouTubeService {
  if (!_youtubeService) {
    _youtubeService = new YouTubeService();
  }
  return _youtubeService;
}

// For backward compatibility - but this will still instantiate immediately
// The key fix is using getIntegrationKeys() for runtime evaluation
export const youtubeService = getYouTubeService();
