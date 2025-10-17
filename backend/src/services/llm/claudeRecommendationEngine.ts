/**
 * Claude-First Recommendation Engine
 * Uses Claude's knowledge as primary intelligence, then validates/enriches with APIs
 */

import { getLLMProvider } from './index.js';

export interface ClaudeRecommendation {
  name: string;
  type: 'activity' | 'attraction' | 'experience' | 'venue';
  category: string;
  description: string;
  location: {
    area: string;
    city: string;
    coordinates?: {
      lat: number;
      lng: number;
    };
  };
  reasoning: string;
  suitability: {
    weather: string[];
    timeOfDay: string[];
    energy: 'low' | 'medium' | 'high';
  };
}

export interface EnrichedRecommendation extends ClaudeRecommendation {
  verified: boolean;
  realData?: {
    placeId: string;
    rating: number;
    address: string;
    coordinates: {
      lat: number;
      lng: number;
    };
    photos?: string[];
    reviews?: number;
  };
  weather?: {
    current: any;
    suitability: number;
  };
  distance?: number;
  travelTime?: number;
}

const CLAUDE_RECOMMENDATION_PROMPT = `You are an expert local guide with deep knowledge of activities and experiences worldwide. 

Given a user's vibe and location, recommend 8-10 specific, real places or activities that match their mood perfectly.

IMPORTANT GUIDELINES:
- Recommend REAL, SPECIFIC places (not generic categories)
- Focus on EXPERIENCES and ACTIVITIES, not just restaurants
- Include outdoor activities, cultural sites, adventure spots, nature areas, entertainment venues
- For each recommendation, provide the specific name and area/neighborhood
- Consider weather suitability and time of day
- Vary the energy levels and types of experiences
- Prioritize unique, memorable experiences over generic options

Location: {location}
User Vibe: {vibe}
Weather: {weather}

Return a JSON array of recommendations with this exact structure:
[
  {
    "name": "Specific place/activity name",
    "type": "activity|attraction|experience|venue", 
    "category": "adventure|culture|nature|entertainment|wellness|nightlife",
    "description": "Brief description of what makes this special",
    "location": {
      "area": "Specific neighborhood/area",
      "city": "City name"
    },
    "reasoning": "Why this matches the user's vibe",
    "suitability": {
      "weather": ["sunny", "cloudy", "rainy"],
      "timeOfDay": ["morning", "afternoon", "evening", "night"],
      "energy": "low|medium|high"
    }
  }
]

Focus on diverse, real experiences that Claude knows exist in the area.`;

export class ClaudeRecommendationEngine {
  private llm = getLLMProvider();

  /**
   * Get Claude's recommendations for a vibe and location
   */
  async getClaudeRecommendations(
    vibe: string,
    location: { city: string; country: string; lat: number; lng: number },
    weather?: any
  ): Promise<ClaudeRecommendation[]> {
    try {
      console.log('🧠 Asking Claude for recommendations:', {
        vibe: vibe.slice(0, 50),
        location: `${location.city}, ${location.country}`,
        weather: weather?.conditions || 'unknown'
      });

      const prompt = CLAUDE_RECOMMENDATION_PROMPT
        .replace('{location}', `${location.city}, ${location.country}`)
        .replace('{vibe}', vibe)
        .replace('{weather}', weather ? `Current: ${weather.temperature}°C, ${weather.conditions}` : 'Unknown');

      const response = await this.llm.generateText(prompt, {
        maxTokens: 2000,
        temperature: 0.7
      });

      // Parse Claude's response
      const recommendations = this.parseClaudeResponse(response);
      
      console.log('🧠 Claude generated', recommendations.length, 'recommendations');
      return recommendations;

    } catch (error) {
      console.error('❌ Claude recommendation error:', error);
      return this.getFallbackRecommendations(vibe, location);
    }
  }

  /**
   * Parse Claude's JSON response
   */
  private parseClaudeResponse(response: string): ClaudeRecommendation[] {
    try {
      // Extract JSON from response (Claude sometimes adds explanation text)
      const jsonMatch = response.match(/\[[\s\S]*\]/);
      if (!jsonMatch) {
        throw new Error('No JSON array found in response');
      }

      const parsed = JSON.parse(jsonMatch[0]);
      
      if (!Array.isArray(parsed)) {
        throw new Error('Response is not an array');
      }

      return parsed.filter(rec => 
        rec.name && rec.type && rec.category && rec.description
      );

    } catch (error) {
      console.error('❌ Failed to parse Claude response:', error);
      console.log('Raw response:', response.slice(0, 500));
      return [];
    }
  }

  /**
   * Fallback recommendations if Claude fails
   */
  private getFallbackRecommendations(
    vibe: string,
    location: { city: string; country: string }
  ): ClaudeRecommendation[] {
    const text = vibe.toLowerCase();
    
    // Basic fallback based on vibe keywords
    const fallbacks: ClaudeRecommendation[] = [];
    
    if (text.includes('adventure') || text.includes('mountain') || text.includes('bike')) {
      fallbacks.push({
        name: `${location.city} Adventure Park`,
        type: 'activity',
        category: 'adventure',
        description: 'Outdoor adventure activities and sports',
        location: { area: 'City Center', city: location.city },
        reasoning: 'Matches adventure vibe',
        suitability: { weather: ['sunny', 'cloudy'], timeOfDay: ['morning', 'afternoon'], energy: 'high' }
      });
    }

    if (text.includes('culture') || text.includes('art') || text.includes('museum')) {
      fallbacks.push({
        name: `${location.city} National Museum`,
        type: 'attraction',
        category: 'culture',
        description: 'Cultural exhibits and historical artifacts',
        location: { area: 'Historic District', city: location.city },
        reasoning: 'Matches cultural interests',
        suitability: { weather: ['sunny', 'cloudy', 'rainy'], timeOfDay: ['morning', 'afternoon'], energy: 'medium' }
      });
    }

    return fallbacks;
  }
}
