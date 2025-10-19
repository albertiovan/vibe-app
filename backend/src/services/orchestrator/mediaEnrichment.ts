/**
 * Media & Enrichment Orchestrator
 * 
 * Coordinates Unsplash, YouTube, Tavily, and Wikipedia services
 * to enrich activity recommendations without replacing Places data
 */

import { youtubeService, type YouTubeVideo } from '../media/youtube.js';
import { tavilyService, type TavilyResponse } from '../enrichment/tavily.js';
import { wikipediaService, type WikipediaSummary } from '../enrichment/wikipedia.js';
import { features } from '../../config/integrations.js';

export interface EnrichedActivity {
  // Original activity data
  id: string;
  name: string;
  category: string;
  description?: string;
  
  // Places data (preserved)
  places: any[];
  
  // Media enrichments
  tutorialVideos?: YouTubeVideo[];
  
  // Context enrichments
  activityInfo?: WikipediaSummary;
  webContext?: {
    suggestions: string[];
    tips: string[];
  };
  
  // Metadata
  enrichmentSources: string[];
  enrichedAt: number;
}

export interface EnrichmentOptions {
  includeTutorialVideos?: boolean;
  includeActivityInfo?: boolean;
  useWebSearchFallback?: boolean;
  maxConcurrency?: number;
}

export class MediaEnrichmentOrchestrator {
  
  /**
   * Enrich a single activity with media and context
   */
  async enrichActivity(
    activity: {
      id: string;
      name: string;
      category: string;
      description?: string;
      places: any[];
      region?: string;
    },
    options: EnrichmentOptions = {}
  ): Promise<EnrichedActivity> {
    const {
      includeTutorialVideos = true,
      includeActivityInfo = true,
      useWebSearchFallback = true,
      maxConcurrency = 3
    } = options;

    console.log(`🎨 Enriching activity: ${activity.name}`);
    
    const enriched: EnrichedActivity = {
      id: activity.id,
      name: activity.name,
      category: activity.category,
      description: activity.description,
      places: activity.places,
      enrichmentSources: [],
      enrichedAt: Date.now()
    };

    // Determine if we need web search fallback
    const needsWebSearch = useWebSearchFallback && activity.places.length < 2;

    // Prepare enrichment tasks
    const tasks: Promise<void>[] = [];

    // Task 1: Tutorial videos
    if (includeTutorialVideos) {
      tasks.push(this.addTutorialVideos(enriched, activity.region));
    }

    // Task 2: Activity information
    if (includeActivityInfo) {
      tasks.push(this.addActivityInfo(enriched));
    }

    // Task 3: Web search context (if needed)
    if (needsWebSearch) {
      tasks.push(this.addWebContext(enriched, activity.region));
    }

    // Execute tasks with concurrency limit
    await this.executeConcurrently(tasks, maxConcurrency);

    console.log(`✅ Enriched ${activity.name} with sources: ${enriched.enrichmentSources.join(', ')}`);
    return enriched;
  }

  /**
   * Enrich multiple activities in batch
   */
  async enrichActivities(
    activities: Array<{
      id: string;
      name: string;
      category: string;
      description?: string;
      places: any[];
      region?: string;
    }>,
    options: EnrichmentOptions = {}
  ): Promise<EnrichedActivity[]> {
    console.log(`🎨 Batch enriching ${activities.length} activities`);
    
    const { maxConcurrency = 2 } = options; // Lower concurrency for batch processing
    
    // Process activities with concurrency control
    const enrichmentTasks = activities.map(activity => 
      () => this.enrichActivity(activity, { ...options, maxConcurrency: 3 })
    );

    const results = await this.executeConcurrently(
      enrichmentTasks.map(task => task()), 
      maxConcurrency
    );

    return results.filter(result => result !== undefined) as EnrichedActivity[];
  }


  /**
   * Add tutorial videos for activity
   */
  private async addTutorialVideos(enriched: EnrichedActivity, region?: string): Promise<void> {
    if (!features.media.youtube) return;

    try {
      const result = await youtubeService.searchActivityVideos(enriched.name, region, { maxResults: 3 });
      
      if (result.ok && result.videos.length > 0) {
        enriched.tutorialVideos = result.videos;
        enriched.enrichmentSources.push('youtube');
        console.log(`🎥 Added ${result.videos.length} YouTube videos for ${enriched.name}`);
      }
    } catch (error) {
      console.warn(`⚠️ Failed to get tutorial videos for ${enriched.name}:`, error);
    }
  }

  /**
   * Add Wikipedia activity information
   */
  private async addActivityInfo(enriched: EnrichedActivity): Promise<void> {
    if (!features.enrichment.wikipedia) return;

    try {
      const result = await wikipediaService.getSummary(enriched.name);
      
      if (result.ok) {
        enriched.activityInfo = result.summary;
        enriched.enrichmentSources.push('wikipedia');
        console.log(`📚 Added Wikipedia info for ${enriched.name}`);
      }
    } catch (error) {
      console.warn(`⚠️ Failed to get Wikipedia info for ${enriched.name}:`, error);
    }
  }

  /**
   * Add web search context when Places is sparse
   */
  private async addWebContext(enriched: EnrichedActivity, region?: string): Promise<void> {
    if (!features.enrichment.tavily) return;

    try {
      const locationQuery = region || 'Romania';
      const result = await tavilyService.searchActivityVenues(enriched.name, locationQuery);
      
      if (result.ok) {
        const extracted = tavilyService.extractVenueSuggestions(result.data.results);
        
        enriched.webContext = {
          suggestions: extracted.keywords,
          tips: extracted.tips
        };
        enriched.enrichmentSources.push('tavily');
        console.log(`🔍 Added web context for ${enriched.name}`);
      }
    } catch (error) {
      console.warn(`⚠️ Failed to get web context for ${enriched.name}:`, error);
    }
  }


  /**
   * Execute tasks with concurrency limit
   */
  private async executeConcurrently<T>(tasks: Promise<T>[], maxConcurrency: number): Promise<T[]> {
    const results: T[] = [];
    
    for (let i = 0; i < tasks.length; i += maxConcurrency) {
      const batch = tasks.slice(i, i + maxConcurrency);
      const batchResults = await Promise.allSettled(batch);
      
      batchResults.forEach((result, index) => {
        if (result.status === 'fulfilled') {
          results[i + index] = result.value;
        } else {
          console.warn(`Task ${i + index} failed:`, result.reason);
        }
      });
    }
    
    return results;
  }

  /**
   * Get enrichment statistics
   */
  async getEnrichmentStats(): Promise<{
    services: Record<string, any>;
    features: Record<string, boolean>;
  }> {
    return {
      services: {
        youtube: youtubeService.getStatus(),
        tavily: tavilyService.getStatus(),
        wikipedia: wikipediaService.getStatus()
      },
      features: {
        youtube: features.media.youtube,
        tavily: features.enrichment.tavily,
        wikipedia: features.enrichment.wikipedia
      }
    };
  }

  /**
   * Validate all services are properly configured
   */
  async validateServices(): Promise<{
    valid: boolean;
    issues: string[];
    warnings: string[];
  }> {
    const issues: string[] = [];
    const warnings: string[] = [];

    // Check each service
    const services = {
      youtube: youtubeService.getStatus(),
      tavily: tavilyService.getStatus(),
      wikipedia: wikipediaService.getStatus()
    };

    Object.entries(services).forEach(([name, status]) => {
      if (status.enabled && !status.configured) {
        issues.push(`${name} is enabled but not configured`);
      }
      if (!status.enabled) {
        warnings.push(`${name} service is disabled`);
      }
    });

    return {
      valid: issues.length === 0,
      issues,
      warnings
    };
  }
}

// Singleton instance
export const mediaEnrichmentOrchestrator = new MediaEnrichmentOrchestrator();
