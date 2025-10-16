/**
 * Curation Service
 * LLM-powered place re-ranking, clustering, and summarization
 */

import { getLLMProvider } from './index.js';
import { 
  Curation, 
  CurationSchema, 
  PlaceForCuration, 
  validateCuration, 
  createFallbackCuration 
} from '../../schemas/curation.js';

/**
 * System prompt for curation (copied verbatim from requirements)
 */
const CURATION_SYSTEM_PROMPT = `You curate activities strictly from the provided items array.

Rules:
- Never add or remove items; any output IDs must be a subset of input IDs.
- Don't alter factual fields (ratings, addresses, times).
- Blurbs: 40–60 words, concise, no unsupported claims (no "best" unless provided).
- If insufficient info for a blurb, return an empty string.
- Output ONLY JSON matching the schema.

Curation Output Schema:
{
  rerankedIds: string[]; // ordered list of input place_ids
  clusters: { label: string; ids: string[] }[]; // optional thematic groupings
  summaries: { id: string; blurb: string }[];   // safe microcopy per id
}`;

/**
 * Re-rank and summarize places based on query context
 */
export async function rerankAndSummarize({
  query,
  items
}: {
  query: string;
  items: PlaceForCuration[];
}): Promise<Curation> {
  const startTime = Date.now();
  
  console.log('🎯 Curating places:', {
    query: query.slice(0, 100) + (query.length > 100 ? '...' : ''),
    itemCount: items.length,
    itemIds: items.map(item => item.place_id)
  });

  // Fallback for empty input
  if (items.length === 0) {
    return {
      rerankedIds: [],
      clusters: undefined,
      summaries: []
    };
  }

  try {
    const provider = getLLMProvider();
    
    // Prepare input data for LLM
    const inputData = items.map(item => ({
      place_id: item.place_id,
      name: item.name,
      types: item.types,
      rating: item.rating,
      user_ratings_total: item.user_ratings_total,
      vicinity: item.vicinity || item.formatted_address,
      opening_hours: item.opening_hours,
      editorial_summary: item.editorial_summary?.overview,
      vibeScore: item.vibeScore,
      vibeReasons: item.vibeReasons
    }));

    const userPrompt = `Query: "${query}"

Places to curate:
${JSON.stringify(inputData, null, 2)}

Instructions:
1. Rerank these places based on relevance to the query and overall appeal
2. Create 2-4 thematic clusters if there are natural groupings (optional)
3. Write concise 40-60 word blurbs for each place using only the provided information
4. Use only the place_ids from the input - never invent new ones
5. If you lack sufficient info for a good blurb, use an empty string

Output the JSON curation object:`;

    const result = await provider.completeJSON({
      system: CURATION_SYSTEM_PROMPT,
      user: userPrompt,
      schema: CurationSchema,
      maxTokens: 3000
    });

    if (result.ok) {
      // Validate that all IDs are from input
      const inputIds = items.map(item => item.place_id);
      const validationResult = validateCuration(result.data, inputIds);
      
      if (validationResult.ok) {
        console.log('✅ Curation successful:', {
          duration: Date.now() - startTime,
          rerankedCount: validationResult.data.rerankedIds.length,
          clusterCount: validationResult.data.clusters?.length || 0,
          summaryCount: validationResult.data.summaries.length
        });

        return validationResult.data;
      } else {
        console.warn('⚠️ Curation validation failed:', validationResult.error);
        return createFallbackCuration(items);
      }
    } else {
      console.warn('⚠️ LLM curation failed, using fallback:', result.error);
      return createFallbackCuration(items);
    }

  } catch (error) {
    console.error('❌ Curation error:', error);
    return createFallbackCuration(items);
  }
}

/**
 * Create clusters only (without full curation)
 */
export async function createClusters({
  items,
  maxClusters = 4
}: {
  items: PlaceForCuration[];
  maxClusters?: number;
}): Promise<{ label: string; ids: string[] }[]> {
  
  if (items.length < 3) {
    return []; // Not enough items to cluster meaningfully
  }

  try {
    const provider = getLLMProvider();
    
    const inputData = items.map(item => ({
      place_id: item.place_id,
      name: item.name,
      types: item.types
    }));

    const userPrompt = `Places to cluster:
${JSON.stringify(inputData, null, 2)}

Create ${maxClusters} thematic clusters from these places based on their types and characteristics. Each cluster should have a descriptive label and contain 2+ place IDs.

Output JSON format:
{
  "clusters": [
    {"label": "Cultural Attractions", "ids": ["id1", "id2"]},
    {"label": "Outdoor Activities", "ids": ["id3", "id4"]}
  ]
}`;

    const result = await provider.completeJSON({
      system: 'You create thematic clusters from place data. Output only valid JSON.',
      user: userPrompt,
      schema: CurationSchema.pick({ clusters: true }),
      maxTokens: 1000
    });

    if (result.ok && result.data.clusters) {
      // Validate cluster IDs
      const inputIds = new Set(items.map(item => item.place_id));
      const validClusters = result.data.clusters.filter(cluster =>
        cluster.ids.every(id => inputIds.has(id))
      );

      console.log('✅ Clustering successful:', {
        originalClusters: result.data.clusters.length,
        validClusters: validClusters.length
      });

      return validClusters;
    }

    return [];

  } catch (error) {
    console.warn('⚠️ Clustering failed:', error);
    return [];
  }
}

/**
 * Generate summaries only (without re-ranking)
 */
export async function generateSummaries(items: PlaceForCuration[]): Promise<{ id: string; blurb: string }[]> {
  if (items.length === 0) {
    return [];
  }

  try {
    const provider = getLLMProvider();
    
    const inputData = items.map(item => ({
      place_id: item.place_id,
      name: item.name,
      types: item.types,
      rating: item.rating,
      user_ratings_total: item.user_ratings_total,
      vicinity: item.vicinity || item.formatted_address,
      editorial_summary: item.editorial_summary?.overview
    }));

    const userPrompt = `Generate 40-60 word blurbs for these places:
${JSON.stringify(inputData, null, 2)}

Rules:
- Use only the provided information
- Be concise and engaging
- No unsupported claims
- If insufficient info, use empty string

Output JSON format:
{
  "summaries": [
    {"id": "place_id", "blurb": "40-60 word description"},
    {"id": "place_id", "blurb": ""}
  ]
}`;

    const result = await provider.completeJSON({
      system: 'You write concise place descriptions using only provided facts. Output only valid JSON.',
      user: userPrompt,
      schema: CurationSchema.pick({ summaries: true }),
      maxTokens: 2000
    });

    if (result.ok && result.data.summaries) {
      // Validate summary IDs
      const inputIds = new Set(items.map(item => item.place_id));
      const validSummaries = result.data.summaries.filter(summary =>
        inputIds.has(summary.id)
      );

      console.log('✅ Summary generation successful:', {
        requestedSummaries: items.length,
        generatedSummaries: validSummaries.length
      });

      return validSummaries;
    }

    // Fallback: empty summaries
    return items.map(item => ({
      id: item.place_id,
      blurb: ''
    }));

  } catch (error) {
    console.warn('⚠️ Summary generation failed:', error);
    
    // Fallback: empty summaries
    return items.map(item => ({
      id: item.place_id,
      blurb: ''
    }));
  }
}
