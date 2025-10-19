/**
 * LLM-powered Vibe to Places Mapping
 * Maps user vibes to Google Places types and keywords (never invents places)
 */

import { z } from 'zod';
import { getLLMProvider } from './index.js';
import { VIBE_TO_PLACES_MAPPING, VibeMapping } from '../../types/vibe.js';
import { shouldEnableCulinary } from '../../config/app.experiences.js';

export interface VibeToPlacesResult {
  types: string[];
  keywords: string[];
  buckets: string[];
  reasoning: string;
  confidence: number;
}

// Zod schema for LLM response validation
const VibeToPlacesSchema = z.object({
  types: z.array(z.string()).min(1).max(6),
  keywords: z.array(z.string()).min(1).max(6),
  buckets: z.array(z.string()).min(1).max(4),
  reasoning: z.string().min(10).max(500),
  confidence: z.number().min(0).max(1)
});

const VIBE_MAPPING_PROMPT = `You are an expert at mapping user emotions and vibes to Google Places API search parameters. Your job is to translate a user's emotional state, mood, or desired experience into specific place types and keywords that will find real places via Google Places API.

IMPORTANT CONSTRAINTS:
- Only use Google Places API types (cafe, library, museum, park, community_center, art_gallery, etc.)
- Focus on EXPERIENCES and EMOTIONAL NEEDS, not just physical activities
- For emotional states like "lonely", "sad", "need connection" - suggest social spaces like cafes, libraries, community centers
- For "adventurous" - suggest adventure parks, outdoor activities, unique attractions
- Only suggest keywords that describe place categories, not specific venue names
- Never invent or suggest specific place names
- Prioritize places that match the EMOTIONAL INTENT behind the vibe

Available activity buckets: adventure, adrenaline, trails, culture, art, nature, outdoor, wellness, relaxation, nightlife, entertainment, lonely, social, connection, creative, peaceful

EMOTIONAL VIBE EXAMPLES:
- "I feel lonely" → cafe, library, community_center (social spaces where people gather)
- "I need adventure" → amusement_park, tourist_attraction, park (exciting experiences)
- "I want to be creative" → art_gallery, museum, craft_store (inspiring creative spaces)
- "I need peace" → park, library, spa (calm, quiet environments)

User's vibe: "{vibe}"

Return a JSON object with:
{
  "types": ["google_place_type1", "google_place_type2"],
  "keywords": ["search_keyword1", "search_keyword2"],
  "buckets": ["bucket1", "bucket2"],
  "reasoning": "Why these types/keywords match the emotional intent of the vibe",
  "confidence": 0.85
}

Focus on 2-4 types, 2-4 keywords, and 1-3 buckets that best capture the user's EMOTIONAL INTENT and desired EXPERIENCE.`;

export class VibeToPlacesMapper {
  private llm = getLLMProvider();
  private static failureCount = 0;
  private static lastFailureTime = 0;
  private static readonly MAX_FAILURES = 3;
  private static readonly CIRCUIT_BREAKER_TIMEOUT = 60000; // 1 minute

  /**
   * Map user vibe to Google Places search parameters
   */
  async parseVibeToPlacesSpec(vibe: string): Promise<VibeToPlacesResult> {
    try {
      console.log('🧠 Mapping vibe to places:', vibe.slice(0, 50));

      // Try LLM-powered mapping first
      const llmResult = await this.tryLLMMapping(vibe);
      if (llmResult) {
        console.log('🧠 LLM mapping successful:', {
          types: llmResult.types.slice(0, 3),
          keywords: llmResult.keywords.slice(0, 3),
          buckets: llmResult.buckets,
          confidence: llmResult.confidence
        });
        return llmResult;
      }

      // Fallback to rule-based mapping
      console.log('🧠 Using fallback rule-based mapping');
      return this.ruleBasedMapping(vibe);

    } catch (error) {
      console.error('🧠 Vibe mapping failed:', error);
      return this.ruleBasedMapping(vibe);
    }
  }

  /**
   * Check if circuit breaker is open (too many recent failures)
   */
  private isCircuitBreakerOpen(): boolean {
    const now = Date.now();
    if (VibeToPlacesMapper.failureCount >= VibeToPlacesMapper.MAX_FAILURES) {
      if (now - VibeToPlacesMapper.lastFailureTime < VibeToPlacesMapper.CIRCUIT_BREAKER_TIMEOUT) {
        console.warn('🚫 LLM circuit breaker is OPEN - too many recent failures, using fallback');
        return true;
      } else {
        // Reset after timeout
        console.log('🔄 LLM circuit breaker timeout expired, resetting failure count');
        VibeToPlacesMapper.failureCount = 0;
      }
    }
    return false;
  }

  /**
   * Record LLM failure for circuit breaker
   */
  private recordFailure(): void {
    VibeToPlacesMapper.failureCount++;
    VibeToPlacesMapper.lastFailureTime = Date.now();
    console.warn(`⚠️ LLM failure recorded (${VibeToPlacesMapper.failureCount}/${VibeToPlacesMapper.MAX_FAILURES})`);
  }

  /**
   * Record LLM success for circuit breaker
   */
  private recordSuccess(): void {
    if (VibeToPlacesMapper.failureCount > 0) {
      console.log('✅ LLM success - resetting failure count');
      VibeToPlacesMapper.failureCount = 0;
    }
  }

  /**
   * Try LLM-powered vibe mapping
   */
  private async tryLLMMapping(vibe: string): Promise<VibeToPlacesResult | null> {
    // Check circuit breaker
    if (this.isCircuitBreakerOpen()) {
      return null;
    }

    try {
      const prompt = VIBE_MAPPING_PROMPT.replace('{vibe}', vibe);
      
      console.log('🧠 Calling LLM with vibe mapping prompt...');
      
      const result = await this.llm.completeJSON({
        system: "You are an expert at mapping user vibes to Google Places search parameters. You MUST respond with valid JSON only.",
        user: prompt,
        schema: VibeToPlacesSchema,
        maxTokens: 800
      });

      if (!result.ok) {
        console.warn('🧠 LLM mapping failed:', result.error);
        this.recordFailure();
        return null;
      }

      console.log('✅ LLM mapping successful, validating result...');
      this.recordSuccess();
      
      // The result is already validated by the schema, but we still sanitize for safety
      const validated = result.data;
      
      return {
        types: this.validateTypes(validated.types),
        keywords: this.validateKeywords(validated.keywords),
        buckets: this.validateBuckets(validated.buckets),
        reasoning: validated.reasoning,
        confidence: Math.max(0, Math.min(1, validated.confidence))
      };

    } catch (error) {
      console.warn('🧠 LLM mapping error:', error);
      this.recordFailure();
      return null;
    }
  }

  /**
   * Rule-based fallback mapping
   */
  private ruleBasedMapping(vibe: string): VibeToPlacesResult {
    const text = vibe.toLowerCase();
    const matchedBuckets: string[] = [];
    const allTypes: string[] = [];
    const allKeywords: string[] = [];

    // Check for explicit bucket matches
    for (const [bucket, mapping] of Object.entries(VIBE_TO_PLACES_MAPPING)) {
      if (text.includes(bucket) || 
          mapping.keywords.some(keyword => text.includes(keyword.toLowerCase()))) {
        matchedBuckets.push(bucket);
        allTypes.push(...mapping.types);
        allKeywords.push(...mapping.keywords);
      }
    }

    // If no explicit matches, infer from common words and emotional states
    if (matchedBuckets.length === 0) {
      // Cozy/Comfort vibes (map to social spaces)
      if (text.includes('cozy') || text.includes('warm') || text.includes('comfortable') || text.includes('inviting')) {
        matchedBuckets.push('social');
        allTypes.push(...VIBE_TO_PLACES_MAPPING.social.types);
        allKeywords.push(...VIBE_TO_PLACES_MAPPING.social.keywords);
      }
      
      // Emotional/Social vibes (prioritize these for better experience matching)
      if (text.includes('lonely') || text.includes('alone') || text.includes('isolated') || text.includes('need people')) {
        matchedBuckets.push('lonely');
        allTypes.push(...VIBE_TO_PLACES_MAPPING.lonely.types);
        allKeywords.push(...VIBE_TO_PLACES_MAPPING.lonely.keywords);
      }
      
      if (text.includes('social') || text.includes('meet people') || text.includes('connect') || text.includes('friends')) {
        matchedBuckets.push('social');
        allTypes.push(...VIBE_TO_PLACES_MAPPING.social.types);
        allKeywords.push(...VIBE_TO_PLACES_MAPPING.social.keywords);
      }
      
      if (text.includes('creative') || text.includes('artistic') || text.includes('make') || text.includes('craft')) {
        matchedBuckets.push('creative');
        allTypes.push(...VIBE_TO_PLACES_MAPPING.creative.types);
        allKeywords.push(...VIBE_TO_PLACES_MAPPING.creative.keywords);
      }
      
      if (text.includes('peaceful') || text.includes('calm') || text.includes('quiet') || text.includes('meditat')) {
        matchedBuckets.push('peaceful');
        allTypes.push(...VIBE_TO_PLACES_MAPPING.peaceful.types);
        allKeywords.push(...VIBE_TO_PLACES_MAPPING.peaceful.keywords);
      }
      
      // Physical activity vibes
      if (text.includes('adventure') || text.includes('exciting') || text.includes('thrill')) {
        matchedBuckets.push('adventure');
        allTypes.push(...VIBE_TO_PLACES_MAPPING.adventure.types);
        allKeywords.push(...VIBE_TO_PLACES_MAPPING.adventure.keywords);
      }
      
      if (text.includes('culture') || text.includes('art') || text.includes('museum')) {
        matchedBuckets.push('culture');
        allTypes.push(...VIBE_TO_PLACES_MAPPING.culture.types);
        allKeywords.push(...VIBE_TO_PLACES_MAPPING.culture.keywords);
      }
      
      if (text.includes('nature') || text.includes('park') || text.includes('outdoor')) {
        matchedBuckets.push('nature');
        allTypes.push(...VIBE_TO_PLACES_MAPPING.nature.types);
        allKeywords.push(...VIBE_TO_PLACES_MAPPING.nature.keywords);
      }
      
      if (text.includes('relax') || text.includes('spa') || text.includes('wellness')) {
        matchedBuckets.push('wellness');
        allTypes.push(...VIBE_TO_PLACES_MAPPING.wellness.types);
        allKeywords.push(...VIBE_TO_PLACES_MAPPING.wellness.keywords);
      }
      
      if (text.includes('night') || text.includes('party') || text.includes('bar')) {
        matchedBuckets.push('nightlife');
        allTypes.push(...VIBE_TO_PLACES_MAPPING.nightlife.types);
        allKeywords.push(...VIBE_TO_PLACES_MAPPING.nightlife.keywords);
      }
    }

    // Default fallback
    if (matchedBuckets.length === 0) {
      matchedBuckets.push('entertainment');
      allTypes.push(...VIBE_TO_PLACES_MAPPING.entertainment.types);
      allKeywords.push(...VIBE_TO_PLACES_MAPPING.entertainment.keywords);
    }

    // Remove duplicates and limit results
    const uniqueTypes = [...new Set(allTypes)].slice(0, 4);
    const uniqueKeywords = [...new Set(allKeywords)].slice(0, 4);
    const uniqueBuckets = [...new Set(matchedBuckets)].slice(0, 3);

    return {
      types: uniqueTypes,
      keywords: uniqueKeywords,
      buckets: uniqueBuckets,
      reasoning: `Rule-based mapping found ${uniqueBuckets.length} matching activity buckets`,
      confidence: 0.7
    };
  }

  /**
   * Validate Google Places types
   */
  private validateTypes(types: string[]): string[] {
    const validTypes = [
      'amusement_park', 'aquarium', 'art_gallery', 'bakery', 'bank', 'bar', 'beauty_salon',
      'bicycle_store', 'book_store', 'bowling_alley', 'bus_station', 'cafe', 'campground',
      'car_dealer', 'car_rental', 'car_repair', 'car_wash', 'casino', 'cemetery', 'church',
      'city_hall', 'clothing_store', 'convenience_store', 'courthouse', 'dentist', 'department_store',
      'doctor', 'drugstore', 'electrician', 'electronics_store', 'embassy', 'fire_station',
      'florist', 'funeral_home', 'furniture_store', 'gas_station', 'gym', 'hair_care',
      'hardware_store', 'hindu_temple', 'home_goods_store', 'hospital', 'insurance_agency',
      'jewelry_store', 'laundry', 'lawyer', 'library', 'light_rail_station', 'liquor_store',
      'local_government_office', 'locksmith', 'lodging', 'meal_delivery', 'meal_takeaway',
      'mosque', 'movie_rental', 'movie_theater', 'moving_company', 'museum', 'natural_feature',
      'night_club', 'painter', 'park', 'parking', 'pet_store', 'pharmacy', 'physiotherapist',
      'plumber', 'police', 'post_office', 'primary_school', 'real_estate_agency', 'restaurant',
      'roofing_contractor', 'rv_park', 'school', 'secondary_school', 'shoe_store', 'shopping_mall',
      'spa', 'stadium', 'storage', 'store', 'subway_station', 'supermarket', 'synagogue',
      'taxi_stand', 'tourist_attraction', 'train_station', 'transit_station', 'travel_agency',
      'university', 'veterinary_care', 'zoo'
    ];

    return types.filter(type => validTypes.includes(type)).slice(0, 4);
  }

  /**
   * Validate search keywords
   */
  private validateKeywords(keywords: string[]): string[] {
    return keywords
      .filter(keyword => keyword && keyword.length > 2 && keyword.length < 50)
      .slice(0, 4);
  }

  /**
   * Validate activity buckets
   */
  private validateBuckets(buckets: string[]): string[] {
    const validBuckets = Object.keys(VIBE_TO_PLACES_MAPPING);
    
    // Filter out food-related buckets if culinary is not enabled
    const filteredBuckets = buckets.filter(bucket => {
      if ((bucket === 'food' || bucket === 'culinary') && !shouldEnableCulinary('')) {
        return false;
      }
      return validBuckets.includes(bucket);
    });

    return filteredBuckets.slice(0, 3);
  }
}
