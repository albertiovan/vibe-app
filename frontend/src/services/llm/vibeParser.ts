/**
 * Frontend LLM Vibe Parser Service
 * Calls backend LLM service for vibe → filter spec parsing
 */

export interface FilterSpec {
  types: string[];
  keywords: string[];
  buckets: string[];
  radiusKm: number;
  maxTravelMinutes: number;
  timeOfDay?: string | null;
  indoorOutdoor: 'indoor' | 'outdoor' | 'either';
  energy: 'chill' | 'medium' | 'high';
  minRating: number;
  maxPriceLevel?: number | null;
  avoidFood: boolean;
  avoid?: string[] | null;
}

export interface VibeParseContext {
  location: {
    lat: number;
    lng: number;
    city?: string;
  };
  weather?: {
    temperature: number;
    conditions: string;
    recommendation: 'indoor' | 'covered' | 'outdoor';
  } | null;
  radiusKm: number;
  maxTravelMinutes: number;
}

/**
 * Parse user vibe into structured filter specification
 */
export async function parseVibeToFilterSpec(
  vibe: string,
  context: VibeParseContext
): Promise<FilterSpec> {
  try {
    const response = await fetch('/api/llm/parse-vibe', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        vibe,
        context: {
          location: context.location,
          weather: context.weather,
          constraints: {
            radiusKm: context.radiusKm,
            maxTravelMinutes: context.maxTravelMinutes
          }
        }
      }),
    });

    if (!response.ok) {
      throw new Error(`Vibe parsing failed: ${response.statusText}`);
    }

    const result = await response.json();
    
    if (!result.success) {
      throw new Error(result.error || 'Vibe parsing failed');
    }

    return result.data.filterSpec;
  } catch (error) {
    console.error('❌ Vibe parsing error:', error);
    
    // Fallback to rule-based parsing
    return createFallbackFilterSpec(vibe, context);
  }
}

/**
 * Create fallback filter spec when LLM fails
 */
function createFallbackFilterSpec(vibe: string, context: VibeParseContext): FilterSpec {
  const text = vibe.toLowerCase();
  
  // Default spec
  const spec: FilterSpec = {
    types: ['tourist_attraction', 'park', 'museum'],
    keywords: ['activity', 'experience'],
    buckets: ['trails', 'adrenaline', 'nature', 'culture', 'wellness'],
    radiusKm: context.radiusKm,
    maxTravelMinutes: context.maxTravelMinutes,
    indoorOutdoor: 'either',
    energy: 'medium',
    minRating: 4.0,
    avoidFood: true
  };

  // Detect outdoor preferences
  if (text.includes('outdoor') || text.includes('nature') || text.includes('hiking')) {
    spec.indoorOutdoor = 'outdoor';
    spec.buckets = ['trails', 'nature', 'adrenaline'];
    spec.types = ['park', 'tourist_attraction', 'natural_feature'];
    spec.keywords = ['outdoor', 'nature', 'hiking', 'adventure'];
  }

  // Detect indoor preferences
  if (text.includes('indoor') || text.includes('museum') || text.includes('gallery')) {
    spec.indoorOutdoor = 'indoor';
    spec.buckets = ['culture', 'wellness', 'nightlife'];
    spec.types = ['museum', 'art_gallery', 'spa', 'shopping_mall'];
    spec.keywords = ['indoor', 'culture', 'art', 'relaxation'];
  }

  // Detect energy level
  if (text.includes('adventure') || text.includes('thrill') || text.includes('exciting')) {
    spec.energy = 'high';
    spec.buckets = ['adrenaline', 'trails', 'nature'];
  } else if (text.includes('relax') || text.includes('calm') || text.includes('peaceful')) {
    spec.energy = 'chill';
    spec.buckets = ['wellness', 'nature', 'culture'];
  }

  // Weather adaptation
  if (context.weather?.recommendation === 'indoor') {
    spec.indoorOutdoor = 'indoor';
    spec.buckets = ['culture', 'wellness', 'nightlife'];
  }

  return spec;
}
