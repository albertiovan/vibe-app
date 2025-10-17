/**
 * Claude-First Experience Discovery Pipeline
 * Uses Claude as primary intelligence, then validates/enriches with APIs
 */

import { ClaudeRecommendationEngine, ClaudeRecommendation, EnrichedRecommendation } from '../llm/claudeRecommendationEngine.js';
import { RecommendationVerifier } from '../verification/recommendationVerifier.js';
import { OpenMeteoService } from '../weather/openMeteo.js';

export interface ClaudeFirstResult {
  vibe: string;
  location: {
    lat: number;
    lng: number;
    city: string;
    country: string;
  };
  recommendations: EnrichedRecommendation[];
  metadata: {
    claudeRecommendations: number;
    verifiedRecommendations: number;
    weatherAware: boolean;
    processingTime: number;
  };
  context: {
    weather?: any;
    reasoning: string;
  };
}

export class ClaudeFirstPipeline {
  private claudeEngine = new ClaudeRecommendationEngine();
  private verifier = new RecommendationVerifier();
  private weatherService = new OpenMeteoService();

  /**
   * Execute Claude-first recommendation pipeline
   */
  async execute(
    vibe: string,
    location: { lat: number; lng: number; city: string; country: string }
  ): Promise<ClaudeFirstResult> {
    const startTime = Date.now();
    
    console.log('🧠 Starting Claude-first pipeline:', {
      vibe: vibe.slice(0, 50),
      location: `${location.city}, ${location.country}`
    });

    try {
      // Step 1: Get current weather for context
      const weather = await this.getWeatherContext(location);
      
      // Step 2: Ask Claude for recommendations based on vibe + weather
      const claudeRecs = await this.claudeEngine.getClaudeRecommendations(
        vibe,
        location,
        weather
      );

      if (claudeRecs.length === 0) {
        throw new Error('Claude generated no recommendations');
      }

      // Step 3: Verify and enrich Claude's recommendations with real data
      const enrichedRecs = await this.verifier.verifyRecommendations(
        claudeRecs,
        { lat: location.lat, lng: location.lng }
      );

      // Step 4: Rank and select top 5 diverse recommendations
      const finalRecs = this.selectTopRecommendations(enrichedRecs, 5);

      const processingTime = Date.now() - startTime;

      console.log('✅ Claude-first pipeline completed:', {
        duration: processingTime,
        claudeRecs: claudeRecs.length,
        verified: enrichedRecs.filter(r => r.verified).length,
        final: finalRecs.length
      });

      return {
        vibe,
        location,
        recommendations: finalRecs,
        metadata: {
          claudeRecommendations: claudeRecs.length,
          verifiedRecommendations: enrichedRecs.filter(r => r.verified).length,
          weatherAware: !!weather,
          processingTime
        },
        context: {
          weather,
          reasoning: `Claude generated ${claudeRecs.length} recommendations, ${enrichedRecs.filter(r => r.verified).length} verified with real data`
        }
      };

    } catch (error) {
      console.error('❌ Claude-first pipeline failed:', error);
      throw error;
    }
  }

  /**
   * Get weather context for recommendations
   */
  private async getWeatherContext(location: { lat: number; lng: number }): Promise<any> {
    try {
      const weather = await this.weatherService.getCurrentWeather(location.lat, location.lng);
      console.log('🌤️ Weather context:', {
        temperature: weather.temperature,
        conditions: this.getWeatherCondition(weather.weathercode || 0)
      });
      return weather;
    } catch (error) {
      console.warn('⚠️ Weather fetch failed, continuing without weather context');
      return null;
    }
  }

  /**
   * Select top recommendations with diversity
   */
  private selectTopRecommendations(
    recommendations: EnrichedRecommendation[],
    count: number
  ): EnrichedRecommendation[] {
    
    // Sort by verification status, then by rating/weather suitability
    const sorted = recommendations.sort((a, b) => {
      // Prioritize verified recommendations
      if (a.verified && !b.verified) return -1;
      if (!a.verified && b.verified) return 1;

      // Then by rating if available
      const aRating = a.realData?.rating || 0;
      const bRating = b.realData?.rating || 0;
      if (aRating !== bRating) return bRating - aRating;

      // Then by weather suitability
      const aWeather = a.weather?.suitability || 0.5;
      const bWeather = b.weather?.suitability || 0.5;
      return bWeather - aWeather;
    });

    // Apply category diversity
    const selected: EnrichedRecommendation[] = [];
    const usedCategories = new Set<string>();

    for (const rec of sorted) {
      if (selected.length >= count) break;

      // Prefer diverse categories, but don't be too strict
      if (!usedCategories.has(rec.category) || selected.length < count - 2) {
        selected.push(rec);
        usedCategories.add(rec.category);
      }
    }

    // Fill remaining slots if needed
    for (const rec of sorted) {
      if (selected.length >= count) break;
      if (!selected.includes(rec)) {
        selected.push(rec);
      }
    }

    console.log('🎯 Selected recommendations by category:', 
      selected.map(r => `${r.name} (${r.category})`).join(', ')
    );

    return selected.slice(0, count);
  }

  /**
   * Convert weather code to condition string
   */
  private getWeatherCondition(code: number): string {
    if (code === 0) return 'sunny';
    if (code <= 3) return 'cloudy';
    if (code <= 67) return 'rainy';
    if (code <= 77) return 'snowy';
    return 'stormy';
  }

  /**
   * Format recommendations for API response
   */
  formatForAPI(result: ClaudeFirstResult) {
    return {
      success: true,
      data: {
        vibe: result.vibe,
        location: result.location,
        topFive: result.recommendations.map(rec => ({
          id: rec.realData?.placeId || `claude-${rec.name.replace(/\s+/g, '-').toLowerCase()}`,
          name: rec.name,
          rating: rec.realData?.rating || 0,
          location: rec.realData?.coordinates || { lat: 0, lng: 0 },
          region: rec.location.area,
          distance: rec.distance || 0,
          travelTime: rec.travelTime || 0,
          weatherSuitability: rec.weather?.suitability || 0.7,
          weatherHint: rec.weather ? 
            `${rec.weather.current.recommendation} weather • ${rec.weather.current.temperature}°C` : 
            'Weather info unavailable',
          bucket: rec.category,
          source: rec.verified ? 'claude+places' : 'claude',
          description: rec.description,
          reasoning: rec.reasoning,
          verified: rec.verified,
          highlights: [
            ...(rec.realData?.rating ? [`${rec.realData.rating}⭐ rated`] : []),
            ...(rec.distance && rec.distance < 5 ? ['Nearby'] : []),
            ...(rec.weather?.suitability && rec.weather.suitability > 0.8 ? ['Perfect weather'] : []),
            ...(rec.verified ? ['Verified location'] : ['Claude recommendation'])
          ]
        })),
        curation: {
          approach: 'claude-first',
          claudeRecommendations: result.metadata.claudeRecommendations,
          verifiedRecommendations: result.metadata.verifiedRecommendations,
          reasoning: result.context.reasoning
        },
        context: {
          weather: result.context.weather ? {
            temperature: result.context.weather.temperature,
            conditions: this.getWeatherCondition(result.context.weather.weathercode || 0),
            recommendation: 'claude-aware'
          } : null,
          processingTime: result.metadata.processingTime
        }
      }
    };
  }
}
