/**
 * LLM-powered curation with strict 5-result diversity enforcement
 * Re-ranks and curates places with bucket-aware diversity and validation guards
 */

import { getLLMProvider } from './index.js';
import { 
  CurationSpec, 
  CurationInput, 
  CurationValidator,
  CurationSpecSchema,
  createFallbackCuration 
} from '../../schemas/curationSpec.js';
import { ExperienceBucket } from '../../schemas/filterSpec.js';

/**
 * System prompt for bucket-aware curation with strict validation
 */
const CURATION_SYSTEM_PROMPT = `You are a diversity-enforcing experience curator. Your mission: select exactly 5 diverse experiences from the provided list.

CRITICAL RULES:
1. Output exactly 5 items - no more, no less
2. Use ONLY IDs from the provided input list - never invent new ones
3. Aim for 1 item per bucket when possible: trails, adrenaline, nature, culture, wellness, nightlife
4. If food appears without explicit culinary intent, exclude it
5. Consider weather constraints if provided

BUCKET PRIORITIES (select across these for diversity):
- TRAILS: hiking, MTB, cycling, outdoor routes
- ADRENALINE: sports, adventure, high-energy activities  
- NATURE: parks, natural attractions, scenic spots
- CULTURE: museums, galleries, historical sites
- WELLNESS: spas, relaxation, wellness centers
- NIGHTLIFE: evening entertainment, social venues

Output ONLY valid JSON matching this EXACT schema:
{
  "topFiveIds": ["id1", "id2", "id3", "id4", "id5"],
  "clusters": [
    {
      "label": "Adventure & Thrills",
      "bucket": "adrenaline", 
      "ids": ["id1", "id2"]
    }
  ],
  "summaries": [
    {
      "id": "id1",
      "blurb": "Exactly 40-60 words describing what makes this experience special and why it matches the user's vibe.",
      "highlights": ["key feature 1", "key feature 2"],
      "bucket": "adrenaline"
    }
  ],
  "diversityScore": 0.8,
  "bucketsRepresented": ["trails", "adrenaline", "nature"],
  "reasoning": "Selected diverse experiences across 3 buckets prioritizing outdoor activities and high ratings."
}

VALIDATION REQUIREMENTS:
- topFiveIds.length === 5 (exactly 5)
- summaries.length === 5 (exactly 5)  
- Every ID in topFiveIds exists in input
- Every summary.id matches topFiveIds
- Every cluster.ids are subset of topFiveIds
- Blurbs are 40-60 words (count carefully)
- Maximize bucket diversity when possible`;

/**
 * Curate exactly 5 diverse experiences with bucket-aware selection
 */
export async function curateTopFive(input: CurationInput): Promise<CurationSpec> {
  const startTime = Date.now();
  
  console.log('🎯 Curating top 5 experiences:', {
    itemCount: input.items.length,
    buckets: input.filterSpec.buckets,
    weather: input.weather?.recommendation || 'none'
  });

  // Validate input
  if (input.items.length < 5) {
    console.warn('⚠️ Insufficient items for curation, creating fallback');
    return createFallbackCuration(input.items, input.filterSpec.buckets);
  }

  try {
    const provider = getLLMProvider();
    
    // Prepare input data for LLM with bucket classification
    const enrichedItems = input.items.map(item => ({
      id: item.id,
      name: item.name,
      rating: item.rating || 0,
      types: item.types || [],
      description: item.description || '',
      distance: item.distance,
      weatherSuitability: item.weatherSuitability || 1,
      bucket: item.bucket || classifyItemToBucket(item)
    }));

    // Create context for LLM
    const contextPrompt = `
INPUT ITEMS (select exactly 5):
${enrichedItems.map(item => `
ID: ${item.id}
Name: ${item.name}
Rating: ${item.rating}/5
Types: ${item.types.join(', ')}
Bucket: ${item.bucket || 'unclassified'}
Distance: ${item.distance ? `${item.distance.toFixed(1)}km` : 'unknown'}
Weather Suitability: ${(item.weatherSuitability * 100).toFixed(0)}%
${item.description ? `Description: ${item.description.slice(0, 100)}` : ''}
`).join('\n')}

TARGET BUCKETS: ${input.filterSpec.buckets.join(', ')}
ENERGY LEVEL: ${input.filterSpec.energy}
AVOID FOOD: ${input.filterSpec.avoidFood}
${input.weather ? `WEATHER: ${input.weather.conditions} (${input.weather.temperature}°C, ${input.weather.recommendation})` : ''}

Select exactly 5 diverse experiences prioritizing bucket diversity and weather suitability.`;

    const result = await provider.completeJSON({
      system: CURATION_SYSTEM_PROMPT,
      user: contextPrompt,
      schema: CurationSpecSchema,
      maxTokens: 2000
    });

    if (result.ok) {
      const curation = result.data as CurationSpec;
      
      // Validate the curation output
      const inputIds = input.items.map(item => item.id);
      const validation = CurationValidator.validateComplete(
        curation, 
        inputIds, 
        input.filterSpec.buckets
      );

      if (!validation.valid) {
        console.warn('⚠️ LLM curation failed validation:', validation.errors);
        return createHeuristicFallback(input);
      }

      if (validation.warnings.length > 0) {
        console.warn('⚠️ Curation warnings:', validation.warnings);
      }

      console.log('✅ Curation successful:', {
        duration: Date.now() - startTime,
        diversityScore: validation.diversity.score,
        bucketsRepresented: validation.diversity.bucketsRepresented.length,
        warnings: validation.warnings.length
      });

      return curation;
    } else {
      console.warn('⚠️ LLM curation failed, using heuristic fallback:', result.error);
      return createHeuristicFallback(input);
    }

  } catch (error) {
    console.error('❌ Curation error:', error);
    return createHeuristicFallback(input);
  }
}

/**
 * Classify an item to an experience bucket based on its properties
 */
function classifyItemToBucket(item: CurationInput['items'][0]): ExperienceBucket | undefined {
  const types = item.types || [];
  const name = (item.name || '').toLowerCase();

  // Trails & Outdoor
  if (types.includes('park') || name.includes('trail') || name.includes('hike')) {
    return 'trails';
  }

  // Adrenaline & Sports
  if (types.includes('stadium') || types.includes('amusement_park') || types.includes('gym') || 
      name.includes('sport') || name.includes('adventure')) {
    return 'adrenaline';
  }

  // Nature & Serenity
  if (types.includes('zoo') || types.includes('aquarium') || name.includes('garden') || 
      name.includes('nature') || name.includes('scenic')) {
    return 'nature';
  }

  // Culture & Arts
  if (types.includes('museum') || types.includes('art_gallery') || types.includes('library') ||
      name.includes('museum') || name.includes('gallery') || name.includes('cultural')) {
    return 'culture';
  }

  // Wellness & Relaxation
  if (types.includes('spa') || name.includes('spa') || name.includes('wellness') || 
      name.includes('massage') || name.includes('relax')) {
    return 'wellness';
  }

  // Nightlife & Social
  if (types.includes('night_club') || types.includes('bar') || types.includes('casino') ||
      name.includes('club') || name.includes('bar') || name.includes('nightlife')) {
    return 'nightlife';
  }

  return undefined;
}

/**
 * Create heuristic fallback when LLM fails
 */
function createHeuristicFallback(input: CurationInput): CurationSpec {
  console.log('🔄 Creating heuristic fallback curation');

  // Sort items by rating and weather suitability
  const scoredItems = input.items
    .map(item => ({
      ...item,
      bucket: item.bucket || classifyItemToBucket(item),
      score: (item.rating || 0) * 0.7 + (item.weatherSuitability || 1) * 0.3
    }))
    .sort((a, b) => b.score - a.score);

  // Try to get 1 item per bucket, then fill remaining slots
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
  
  // Pad if needed
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
    blurb: `${item.name} offers an excellent experience with ${item.rating || 'good'} rating. ${item.description ? item.description.slice(0, 40) : 'A great choice for your adventure.'} Highly recommended for its quality and location.`,
    bucket: item.bucket
  }));

  const clusters = [{
    label: 'Top Rated Experiences',
    ids: topFiveIds
  }];

  const bucketsRepresented = [...new Set(topFive.map(item => item.bucket).filter(Boolean))] as ExperienceBucket[];

  return {
    topFiveIds,
    clusters,
    summaries,
    rationale: 'Heuristic fallback: Selected top-rated experiences with bucket diversity'
  };
}

/**
 * Legacy function for backward compatibility
 */
export async function rerankAndSummarize({
  query,
  items
}: {
  query: string;
  items: Array<{
    place_id: string;
    name: string;
    rating?: number;
    types?: string[];
    description?: string;
  }>;
}): Promise<{
  rerankedIds: string[];
  clusters?: any;
  summaries: Array<{ id: string; summary: string }>;
}> {
  // Convert to new format
  const curationInput: CurationInput = {
    items: items.map(item => ({
      id: item.place_id,
      name: item.name,
      rating: item.rating,
      types: item.types,
      description: item.description
    })),
    filterSpec: {
      buckets: ['trails', 'adrenaline', 'nature', 'culture', 'wellness'],
      energy: 'medium',
      avoidFood: true
    }
  };

  const curation = await curateTopFive(curationInput);

  return {
    rerankedIds: curation.topFiveIds,
    clusters: curation.clusters,
    summaries: curation.summaries.map(s => ({
      id: s.id,
      summary: s.blurb
    }))
  };
}
