/**
 * Curation Schema
 * Zod schema for LLM-powered place curation and summarization
 */

import { z } from 'zod';

/**
 * Cluster schema for thematic groupings
 */
export const ClusterSchema = z.object({
  label: z.string().min(1).max(50),
  ids: z.array(z.string()).min(1)
});

/**
 * Summary schema for place blurbs
 */
export const SummarySchema = z.object({
  id: z.string(),
  blurb: z.string().max(300) // 40-60 words ≈ 200-300 chars
});

/**
 * Main curation output schema
 */
export const CurationSchema = z.object({
  rerankedIds: z.array(z.string()).min(0),
  clusters: z.array(ClusterSchema).optional(),
  summaries: z.array(SummarySchema)
});

export type Cluster = z.infer<typeof ClusterSchema>;
export type Summary = z.infer<typeof SummarySchema>;
export type Curation = z.infer<typeof CurationSchema>;

/**
 * Input place data for curation
 */
export const PlaceForCurationSchema = z.object({
  place_id: z.string(),
  name: z.string(),
  types: z.array(z.string()),
  rating: z.number().optional(),
  user_ratings_total: z.number().optional(),
  vicinity: z.string().optional(),
  formatted_address: z.string().optional(),
  opening_hours: z.object({
    open_now: z.boolean().optional(),
    weekday_text: z.array(z.string()).optional()
  }).optional(),
  photos: z.array(z.object({
    photo_reference: z.string(),
    width: z.number(),
    height: z.number()
  })).optional(),
  editorial_summary: z.object({
    overview: z.string().optional()
  }).optional(),
  vibeScore: z.number().optional(),
  vibeReasons: z.array(z.string()).optional()
});

export type PlaceForCuration = z.infer<typeof PlaceForCurationSchema>;

/**
 * Validate curation output and ensure ID subset constraint
 */
export function validateCuration(
  output: unknown, 
  inputPlaceIds: string[]
): { ok: true; data: Curation } | { ok: false; error: string } {
  try {
    const parsed = CurationSchema.parse(output);
    
    // Validate that all output IDs are subset of input IDs
    const inputIdSet = new Set(inputPlaceIds);
    
    // Check reranked IDs
    for (const id of parsed.rerankedIds) {
      if (!inputIdSet.has(id)) {
        return { 
          ok: false, 
          error: `Reranked ID '${id}' not found in input places` 
        };
      }
    }
    
    // Check cluster IDs
    if (parsed.clusters) {
      for (const cluster of parsed.clusters) {
        for (const id of cluster.ids) {
          if (!inputIdSet.has(id)) {
            return { 
              ok: false, 
              error: `Cluster ID '${id}' not found in input places` 
            };
          }
        }
      }
    }
    
    // Check summary IDs
    for (const summary of parsed.summaries) {
      if (!inputIdSet.has(summary.id)) {
        return { 
          ok: false, 
          error: `Summary ID '${summary.id}' not found in input places` 
        };
      }
    }
    
    return { ok: true, data: parsed };
    
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown validation error';
    return { ok: false, error: `Curation validation failed: ${errorMessage}` };
  }
}

/**
 * Create fallback curation (rating-based sort, empty blurbs)
 */
export function createFallbackCuration(places: PlaceForCuration[]): Curation {
  // Sort by rating descending, then by review count
  const sortedPlaces = [...places].sort((a, b) => {
    const ratingA = a.rating || 0;
    const ratingB = b.rating || 0;
    
    if (ratingA !== ratingB) {
      return ratingB - ratingA;
    }
    
    const reviewsA = a.user_ratings_total || 0;
    const reviewsB = b.user_ratings_total || 0;
    return reviewsB - reviewsA;
  });
  
  return {
    rerankedIds: sortedPlaces.map(p => p.place_id),
    clusters: undefined,
    summaries: places.map(p => ({
      id: p.place_id,
      blurb: '' // Empty blurbs for fallback
    }))
  };
}
