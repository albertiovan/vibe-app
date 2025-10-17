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
const VIBE_TO_FILTER_SYSTEM_PROMPT = `You are a bucket-aware experience curator that maps user vibes to exactly 5 diverse activities.

CORE MISSION: Transform vibes into structured filters that enable discovery of exactly 5 diverse experiences across different buckets.

EXPERIENCE BUCKETS (aim for 1 per bucket when possible):
- TRAILS: hiking, MTB, cycling, outdoor routes, nature walks
- ADRENALINE: high-energy sports, adventure activities, thrill experiences  
- NATURE: natural attractions, parks, scenic spots, wildlife, gardens
- CULTURE: museums, galleries, historical sites, art, heritage
- WELLNESS: spas, relaxation, wellness centers, meditation, rejuvenation
- NIGHTLIFE: evening entertainment, social venues, bars, clubs (non-food)

Output ONLY valid JSON matching this EXACT schema:
{
  "types": ["type1", "type2", ...],           // 3-15 Google Places types
  "keywords": ["keyword1", "keyword2", ...],  // 1-10 search keywords
  "buckets": ["trails", "adrenaline", ...],   // 1-6 target buckets for diversity
  "radiusKm": 10,                            // 1-50 km search radius
  "maxTravelMinutes": 60,                     // 5-120 max travel time
  "timeOfDay": "afternoon",                   // morning|afternoon|evening|null
  "indoorOutdoor": "outdoor",                 // indoor|outdoor|either
  "energy": "high",                          // chill|medium|high
  "minRating": 4.2,                          // 0-5 minimum rating
  "maxPriceLevel": 3,                        // 0-4 or null
  "avoidFood": true,                         // true unless explicit culinary request
  "avoid": ["crowded", "expensive"]          // things to avoid or null
}

ACTIVITY TYPES (use these for 'types' field):
${ACTIVITY_TYPES_ALLOWLIST.join(', ')}

BUCKET MAPPING RULES:
- TRAILS → park, tourist_attraction, natural_feature
- ADRENALINE → amusement_park, stadium, gym, bowling_alley  
- NATURE → park, zoo, aquarium, botanical_garden
- CULTURE → museum, art_gallery, library, church, synagogue
- WELLNESS → spa, beauty_salon, gym (wellness-focused)
- NIGHTLIFE → night_club, bar, casino, movie_theater

FOOD POLICY (avoidFood: true by default):
- Set avoidFood: false ONLY for explicit culinary requests
- Culinary triggers: "dining", "restaurant", "food", "michelin", "tasting menu", "culinary experience"
- When food enabled: focus on premium (price_level >= 3, rating >= 4.3)

DIVERSITY REQUIREMENTS:
- Select 3-6 buckets based on vibe complexity
- Prioritize buckets that match user's energy/mood
- Include outdoor buckets (trails/nature) for outdoor vibes
- Include culture/wellness for relaxed vibes
- Include adrenaline/nightlife for high-energy vibes`;

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
        buckets: filterSpec.buckets?.length || 0,
        energy: filterSpec.energy,
        radiusKm: filterSpec.radiusKm
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
    fallback.timeOfDay = 'evening';
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
    types: validTypes.length > 0 ? validTypes : ['tourist_attraction', 'park']
  };
}
