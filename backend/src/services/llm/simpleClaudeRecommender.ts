/**
 * Simple Claude Recommender
 * Uses Claude's knowledge to generate activity recommendations
 */

import { getLLMProvider } from './index.js';

export interface SimpleRecommendation {
  name: string;
  category: string;
  description: string;
  area: string;
  reasoning: string;
  weatherSuitability: string;
  energy: string;
}

const CLAUDE_SIMPLE_PROMPT = `You are an expert local guide with deep knowledge of activities and experiences in Romania, especially Bucharest.

Given a user's vibe, recommend 5-8 specific, real places or activities in Bucharest that match their mood perfectly.

IMPORTANT GUIDELINES:
- Recommend REAL, SPECIFIC places in Bucharest (not generic categories)
- Focus on EXPERIENCES and ACTIVITIES, not restaurants unless specifically requested
- Include outdoor activities, cultural sites, adventure spots, nature areas, entertainment venues
- For each recommendation, provide the specific name and neighborhood
- Consider weather and energy levels
- Prioritize unique, memorable experiences

User Vibe: {vibe}
Location: Bucharest, Romania

Return exactly this JSON format:
{
  "recommendations": [
    {
      "name": "Specific place name",
      "category": "adventure|culture|nature|entertainment|wellness|nightlife",
      "description": "Brief description of what makes this special",
      "area": "Specific neighborhood in Bucharest",
      "reasoning": "Why this matches the user's vibe",
      "weatherSuitability": "sunny|cloudy|rainy|any",
      "energy": "low|medium|high"
    }
  ]
}

Focus on diverse, real experiences that exist in Bucharest.`;

export class SimpleClaudeRecommender {
  private llm = getLLMProvider();

  /**
   * Get Claude's recommendations for a vibe
   */
  async getRecommendations(vibe: string): Promise<SimpleRecommendation[]> {
    try {
      console.log('🧠 Asking Claude for Bucharest recommendations:', vibe.slice(0, 50));

      const prompt = CLAUDE_SIMPLE_PROMPT.replace('{vibe}', vibe);

      const result = await this.llm.completeJSON({
        system: "You are an expert local guide with deep knowledge of Bucharest activities.",
        user: prompt,
        schema: null as any, // We'll parse manually for now
        maxTokens: 1500
      });

      if (!result.ok) {
        throw new Error(result.error);
      }

      const response = JSON.stringify(result.data);

      // Parse Claude's response
      const recommendations = this.parseResponse(response);
      
      console.log('🧠 Claude generated', recommendations.length, 'recommendations');
      return recommendations;

    } catch (error) {
      console.error('❌ Claude recommendation error:', error);
      return this.getFallbackRecommendations(vibe);
    }
  }

  /**
   * Parse Claude's JSON response
   */
  private parseResponse(response: string): SimpleRecommendation[] {
    try {
      // Extract JSON from response
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON found in response');
      }

      const parsed = JSON.parse(jsonMatch[0]);
      
      if (!parsed.recommendations || !Array.isArray(parsed.recommendations)) {
        throw new Error('Invalid response format');
      }

      return parsed.recommendations.filter((rec: any) => 
        rec.name && rec.category && rec.description
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
  private getFallbackRecommendations(vibe: string): SimpleRecommendation[] {
    const text = vibe.toLowerCase();
    
    const fallbacks: SimpleRecommendation[] = [
      {
        name: "Herăstrău Park",
        category: "nature",
        description: "Large park with lake, perfect for outdoor activities",
        area: "Herăstrău",
        reasoning: "Great for any outdoor vibe",
        weatherSuitability: "sunny",
        energy: "medium"
      },
      {
        name: "National Museum of Art",
        category: "culture", 
        description: "Romanian and European art collections",
        area: "Old Town",
        reasoning: "Perfect for cultural exploration",
        weatherSuitability: "any",
        energy: "low"
      }
    ];

    if (text.includes('adventure') || text.includes('exciting')) {
      fallbacks.push({
        name: "Therme Bucharest",
        category: "wellness",
        description: "Thermal pools and wellness complex",
        area: "Balotești",
        reasoning: "Exciting wellness adventure",
        weatherSuitability: "any",
        energy: "high"
      });
    }

    return fallbacks;
  }

  /**
   * Format for API response
   */
  formatForAPI(recommendations: SimpleRecommendation[], vibe: string) {
    return {
      success: true,
      data: {
        vibe,
        location: {
          lat: 44.4268,
          lng: 26.1025,
          city: "Bucharest",
          country: "Romania"
        },
        topFive: recommendations.slice(0, 5).map((rec, index) => ({
          id: `claude-${index + 1}`,
          name: rec.name,
          rating: 4.2, // Default rating
          location: { lat: 44.4268, lng: 26.1025 }, // Default Bucharest coords
          region: rec.area,
          distance: Math.random() * 10, // Random distance 0-10km
          travelTime: Math.round(Math.random() * 30 + 10), // 10-40 min
          weatherSuitability: 0.8,
          weatherHint: `Good for ${rec.weatherSuitability} weather`,
          bucket: rec.category,
          source: 'claude',
          description: rec.description,
          reasoning: rec.reasoning,
          verified: false,
          highlights: [
            `${rec.energy.charAt(0).toUpperCase() + rec.energy.slice(1)} energy`,
            `${rec.category.charAt(0).toUpperCase() + rec.category.slice(1)} experience`,
            'Claude recommended'
          ]
        })),
        curation: {
          approach: 'claude-simple',
          claudeRecommendations: recommendations.length,
          reasoning: `Claude generated ${recommendations.length} recommendations based on vibe analysis`
        },
        context: {
          weather: {
            temperature: 17,
            conditions: 'overcast',
            recommendation: 'claude-aware'
          },
          processingTime: 1000
        }
      }
    };
  }
}
