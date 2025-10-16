/**
 * Query Understanding Service
 * LLM-powered vibe-to-filter mapping with fallback logic
 */

import { getLLMProvider } from './index.js';
import { FilterSpec, FilterSpecSchema, DEFAULT_FILTER_SPEC, mergeWithDefaults } from '../../schemas/filterSpec.js';
import { ACTIVITY_TYPES_ALLOWLIST, FOOD_TYPES_BLOCKLIST } from '../../config/places.types.js';

/**
 * System prompt for vibe-to-filter mapping (copied verbatim from requirements)
 */
const VIBE_TO_FILTER_SYSTEM_PROMPT = `You are a strict JSON generator that maps a user's "vibe" into Google Places filters.

Rules:
- Output ONLY valid JSON matching the provided schema.
- Use ONLY place types from the provided allowlist (activities, not food).
- If the user explicitly asks for food, include food types; otherwise exclude them.
- If uncertain, leave fields null/empty rather than guessing.
- Never invent places or facts. You only produce filters.

FilterSpec JSON Schema (TypeScript for reference):
{
  types?: string[];              // must be subset of ACTIVITY_TYPES_ALLOWLIST unless user asks for food
  keywords?: string[];           // e.g. ["viewpoint","live music","indoor climbing"]
  radiusMeters?: number | null;  // prefer 3000–10000 if unspecified
  timeOfDay?: 'morning'|'afternoon'|'evening'|'late'|null;
  indoorOutdoor?: 'indoor'|'outdoor'|'either'|null;
  energy?: 'chill'|'medium'|'high'|null;
  minRating?: number | null;     // 0–5
  maxPriceLevel?: 0|1|2|3|4|null;// Google price_level
  avoid?: string[] | null;       // e.g. ["crowded","food"]
}

Available Activity Types (ONLY use these unless user explicitly asks for food):
${ACTIVITY_TYPES_ALLOWLIST.join(', ')}

IMPORTANT: For exercise/fitness requests, think broadly:
- gym, stadium, sports_complex (traditional fitness)
- park (running, outdoor workouts, sports fields)
- tourist_attraction (sports venues, recreational facilities)
- bowling_alley, amusement_park (active entertainment)
- Use keywords like: fitness, sports, outdoor, recreation, tennis, golf, swimming, running, cycling

Food Types (ONLY include if user explicitly mentions food/eating/dining):
${FOOD_TYPES_BLOCKLIST.join(', ')}`;

/**
 * Parse user vibe text into Google Places filter specification
 */
export async function parseVibeToFilterSpec(vibeText: string): Promise<FilterSpec> {
  const startTime = Date.now();
  
  console.log('🧠 Parsing vibe to filter spec:', {
    vibeText: vibeText.slice(0, 100) + (vibeText.length > 100 ? '...' : ''),
    length: vibeText.length
  });

  try {
    const provider = getLLMProvider();
    
    const userPrompt = `User vibe: "${vibeText}"

Generate a FilterSpec JSON that captures this vibe for Google Places search. Remember:
- Focus on activities/attractions unless food is explicitly mentioned
- Use specific place types from the allowlist
- Include relevant keywords for text search
- Set appropriate radius (3000-10000 meters typically)
- Match energy level and indoor/outdoor preference
- Set reasonable rating and price constraints

Output only the JSON object:`;

    const result = await provider.completeJSON({
      system: VIBE_TO_FILTER_SYSTEM_PROMPT,
      user: userPrompt,
      schema: FilterSpecSchema,
      maxTokens: 1000
    });

    if (result.ok) {
      const filterSpec = mergeWithDefaults(result.data);
      
      console.log('✅ Vibe parsing successful:', {
        duration: Date.now() - startTime,
        types: filterSpec.types?.length || 0,
        keywords: filterSpec.keywords?.length || 0,
        energy: filterSpec.energy,
        radiusMeters: filterSpec.radiusMeters
      });

      return filterSpec;
    } else {
      console.warn('⚠️ LLM vibe parsing failed, using fallback:', result.error);
      return createVibeBasedFallback(vibeText);
    }

  } catch (error) {
    console.error('❌ Vibe parsing error:', error);
    return createVibeBasedFallback(vibeText);
  }
}

/**
 * Create a simple rule-based fallback when LLM fails
 */
function createVibeBasedFallback(vibeText: string): FilterSpec {
  const text = vibeText.toLowerCase();
  const fallback = { ...DEFAULT_FILTER_SPEC };

  // Detect food mentions
  const foodKeywords = ['eat', 'food', 'restaurant', 'cafe', 'drink', 'bar', 'dining', 'meal'];
  const mentionsFood = foodKeywords.some(keyword => text.includes(keyword));

  // Energy level detection
  if (text.includes('relax') || text.includes('calm') || text.includes('peaceful') || text.includes('quiet')) {
    fallback.energy = 'chill';
    fallback.types = ['spa', 'park', 'library', 'museum'];
  } else if (text.includes('adventure') || text.includes('exciting') || text.includes('active') || text.includes('energy')) {
    fallback.energy = 'high';
    fallback.types = ['amusement_park', 'stadium', 'tourist_attraction'];
  } else {
    fallback.energy = 'medium';
    fallback.types = ['museum', 'art_gallery', 'park'];
  }

  // Indoor/outdoor preference
  if (text.includes('indoor') || text.includes('inside')) {
    fallback.indoorOutdoor = 'indoor';
  } else if (text.includes('outdoor') || text.includes('outside') || text.includes('nature')) {
    fallback.indoorOutdoor = 'outdoor';
  } else {
    fallback.indoorOutdoor = 'either';
  }

  // Time of day
  if (text.includes('morning')) {
    fallback.timeOfDay = 'morning';
  } else if (text.includes('afternoon')) {
    fallback.timeOfDay = 'afternoon';
  } else if (text.includes('evening')) {
    fallback.timeOfDay = 'evening';
  } else if (text.includes('night') || text.includes('late')) {
    fallback.timeOfDay = 'late';
  }

  // Budget considerations
  if (text.includes('free') || text.includes('cheap') || text.includes('budget')) {
    fallback.maxPriceLevel = 1;
  } else if (text.includes('expensive') || text.includes('luxury') || text.includes('splurge')) {
    fallback.maxPriceLevel = 4;
  }

  // Keywords extraction
  const keywords: string[] = [];
  if (text.includes('art')) keywords.push('art gallery', 'museum');
  if (text.includes('music')) keywords.push('live music', 'concert');
  if (text.includes('history')) keywords.push('museum', 'historic site');
  if (text.includes('nature')) keywords.push('park', 'botanical garden');
  if (text.includes('culture')) keywords.push('cultural center', 'museum');
  if (text.includes('sport')) keywords.push('stadium', 'sports complex');

  if (keywords.length > 0) {
    fallback.keywords = keywords;
  }

  // Include food types if explicitly mentioned
  if (mentionsFood) {
    fallback.types = [...(fallback.types || []), ...FOOD_TYPES_BLOCKLIST];
    fallback.avoid = null; // Don't avoid food if explicitly requested
  } else {
    fallback.avoid = ['food']; // Avoid food by default
  }

  console.log('🔄 Using rule-based fallback for vibe:', {
    originalText: vibeText.slice(0, 50) + '...',
    energy: fallback.energy,
    indoorOutdoor: fallback.indoorOutdoor,
    types: fallback.types?.length || 0,
    keywords: fallback.keywords?.length || 0,
    mentionsFood
  });

  return fallback;
}

/**
 * Validate that filter spec types are from allowlist
 */
export function validateFilterSpecTypes(filterSpec: FilterSpec): FilterSpec {
  if (!filterSpec.types) {
    return filterSpec;
  }

  const validTypes = filterSpec.types.filter(type => 
    ACTIVITY_TYPES_ALLOWLIST.includes(type as any) || 
    FOOD_TYPES_BLOCKLIST.includes(type as any)
  );

  if (validTypes.length !== filterSpec.types.length) {
    console.warn('⚠️ Filtered out invalid place types:', {
      original: filterSpec.types,
      filtered: validTypes
    });
  }

  return {
    ...filterSpec,
    types: validTypes.length > 0 ? validTypes : undefined
  };
}
