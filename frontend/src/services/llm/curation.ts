/**
 * Frontend LLM Curation Service
 * Calls backend curation service for 5-result diversity selection
 */

export interface CurationResult {
  topFiveIds: string[];
  clusters: Array<{
    label: string;
    bucket?: string;
    ids: string[];
  }>;
  summaries: Array<{
    id: string;
    blurb: string;
    highlights?: string[];
    bucket?: string;
  }>;
  diversityScore?: number;
  bucketsRepresented?: string[];
  reasoning?: string;
}

export interface CurationInput {
  items: Array<{
    id: string;
    name: string;
    rating?: number;
    types?: string[];
    description?: string;
    distance?: number;
    weatherSuitability?: number;
    bucket?: string;
  }>;
  filterSpec: {
    buckets: string[];
    energy: 'chill' | 'medium' | 'high';
    avoidFood?: boolean;
  };
  weather?: {
    conditions: string;
    temperature: number;
    precipitation: number;
    recommendation: 'indoor' | 'covered' | 'outdoor';
  };
  context?: {
    timeOfDay?: 'morning' | 'afternoon' | 'evening';
    userPreferences?: string[];
  };
}

/**
 * Curate exactly 5 diverse experiences using LLM
 */
export async function curateTopFive(input: CurationInput): Promise<CurationResult> {
  try {
    console.log('🎯 Requesting LLM curation:', {
      items: input.items.length,
      buckets: input.filterSpec.buckets,
      weather: input.weather?.recommendation
    });

    const response = await fetch('/api/llm/curate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(input),
    });

    if (!response.ok) {
      throw new Error(`Curation failed: ${response.statusText}`);
    }

    const result = await response.json();
    
    if (!result.success) {
      throw new Error(result.error || 'Curation failed');
    }

    const curation = result.data;

    // Validate curation result
    if (!curation.topFiveIds || curation.topFiveIds.length !== 5) {
      throw new Error('Invalid curation: must have exactly 5 results');
    }

    if (!curation.summaries || curation.summaries.length !== 5) {
      throw new Error('Invalid curation: must have exactly 5 summaries');
    }

    // Verify all IDs exist in input
    const inputIds = new Set(input.items.map(item => item.id));
    const invalidIds = curation.topFiveIds.filter((id: string) => !inputIds.has(id));
    
    if (invalidIds.length > 0) {
      throw new Error(`Invalid curation: unknown IDs ${invalidIds.join(', ')}`);
    }

    console.log('✅ LLM curation successful:', {
      topFive: curation.topFiveIds.length,
      diversityScore: curation.diversityScore,
      buckets: curation.bucketsRepresented?.length || 0
    });

    return curation;
  } catch (error) {
    console.error('❌ LLM curation failed:', error);
    
    // Fallback to heuristic curation
    return createFallbackCuration(input);
  }
}

/**
 * Create fallback curation when LLM fails
 */
function createFallbackCuration(input: CurationInput): CurationResult {
  console.log('🔄 Creating fallback curation');

  // Score items based on rating and weather suitability
  const scoredItems = input.items
    .map(item => ({
      ...item,
      score: (item.rating || 0) * 0.7 + (item.weatherSuitability || 1) * 0.3
    }))
    .sort((a, b) => b.score - a.score);

  // Try to get one item per bucket for diversity
  const selectedItems: typeof scoredItems = [];
  const usedBuckets = new Set<string>();

  // First pass: one per bucket
  for (const item of scoredItems) {
    if (selectedItems.length >= 5) break;
    
    if (item.bucket && !usedBuckets.has(item.bucket)) {
      selectedItems.push(item);
      usedBuckets.add(item.bucket);
    }
  }

  // Second pass: fill remaining slots with highest rated
  for (const item of scoredItems) {
    if (selectedItems.length >= 5) break;
    
    if (!selectedItems.some(selected => selected.id === item.id)) {
      selectedItems.push(item);
    }
  }

  // Ensure exactly 5 items
  const topFive = selectedItems.slice(0, 5);
  
  // Pad if needed (shouldn't happen if we have enough input)
  while (topFive.length < 5 && scoredItems.length > topFive.length) {
    const remaining = scoredItems.find(item => 
      !topFive.some(selected => selected.id === item.id)
    );
    if (remaining) {
      topFive.push(remaining);
    } else {
      break;
    }
  }

  const topFiveIds = topFive.map(item => item.id);
  
  const summaries = topFive.map(item => ({
    id: item.id,
    blurb: `${item.name} offers an excellent experience with ${item.rating || 'good'} rating. ${item.description ? item.description.slice(0, 60) : 'A great choice for your adventure.'} Perfect for your current mood and weather conditions.`,
    bucket: item.bucket,
    highlights: generateHighlights(item)
  }));

  const clusters = [{
    label: 'Top Rated Experiences',
    ids: topFiveIds
  }];

  const bucketsRepresented = [...new Set(topFive.map(item => item.bucket).filter(Boolean))];

  return {
    topFiveIds,
    clusters,
    summaries,
    diversityScore: bucketsRepresented.length / Math.max(input.filterSpec.buckets.length, 5),
    bucketsRepresented,
    reasoning: 'Fallback curation based on ratings and weather suitability'
  };
}

/**
 * Generate highlights for an item
 */
function generateHighlights(item: any): string[] {
  const highlights: string[] = [];
  
  if (item.rating && item.rating >= 4.5) {
    highlights.push('Highly rated');
  }
  
  if (item.distance && item.distance < 2) {
    highlights.push('Nearby');
  }
  
  if (item.weatherSuitability && item.weatherSuitability > 0.8) {
    highlights.push('Weather suitable');
  }
  
  return highlights.slice(0, 3);
}
