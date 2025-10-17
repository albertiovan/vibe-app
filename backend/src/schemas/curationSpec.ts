/**
 * CurationSpec Schema
 * Zod schema for LLM curation output with strict validation
 */

import { z } from 'zod';
import { ExperienceBucketSchema } from './filterSpec.js';

/**
 * Cluster specification for grouping curated items
 */
export const ClusterSchema = z.object({
  label: z.string().min(1).max(50),
  bucket: ExperienceBucketSchema.optional(),
  ids: z.array(z.string()).min(1).max(5) // Max 5 items per cluster (can be all items)
});

export type Cluster = z.infer<typeof ClusterSchema>;

/**
 * Summary specification for individual items
 */
export const SummarySchema = z.object({
  id: z.string().min(1),
  blurb: z.string().min(40).max(300), // 40-60 words ≈ 200-300 characters
  highlights: z.array(z.string()).max(3).optional(),
  bucket: ExperienceBucketSchema.optional()
});

export type Summary = z.infer<typeof SummarySchema>;

/**
 * Complete curation specification - LLM output for exactly 5 picks
 */
export const CurationSpecSchema = z.object({
  // Exactly 5 items - hard constraint
  topFiveIds: z.array(z.string()).length(5),
  
  // Clustering for thematic organization
  clusters: z.array(ClusterSchema).min(1).max(5),
  
  // Rich summaries for each item
  summaries: z.array(SummarySchema).length(5),
  
  // Diversity metrics
  diversityScore: z.number().min(0).max(1).optional(),
  bucketsRepresented: z.array(ExperienceBucketSchema).min(1).max(6).optional(),
  
  // Reasoning (for debugging/transparency)
  reasoning: z.string().max(200).optional()
});

export type CurationSpec = z.infer<typeof CurationSpecSchema>;

/**
 * Input specification for curation process
 */
export const CurationInputSchema = z.object({
  items: z.array(z.object({
    id: z.string().min(1),
    name: z.string().min(1),
    rating: z.number().min(0).max(5).optional(),
    types: z.array(z.string()).optional(),
    description: z.string().optional(),
    distance: z.number().min(0).optional(),
    weatherSuitability: z.number().min(0).max(1).optional(),
    bucket: ExperienceBucketSchema.optional()
  })).min(5).max(50), // Need at least 5 to pick from, max 50 for performance
  
  filterSpec: z.object({
    buckets: z.array(ExperienceBucketSchema),
    energy: z.enum(['chill', 'medium', 'high']),
    avoidFood: z.boolean().optional()
  }),
  
  weather: z.object({
    conditions: z.string(),
    temperature: z.number(),
    precipitation: z.number(),
    recommendation: z.enum(['indoor', 'covered', 'outdoor'])
  }).optional(),
  
  context: z.object({
    timeOfDay: z.enum(['morning', 'afternoon', 'evening']).optional(),
    userPreferences: z.array(z.string()).optional()
  }).optional()
});

export type CurationInput = z.infer<typeof CurationInputSchema>;

/**
 * Validation guards for curation output
 */
export class CurationValidator {
  /**
   * Validate that all topFiveIds exist in input items
   */
  static validateSubset(curation: CurationSpec, inputIds: string[]): boolean {
    const inputIdSet = new Set(inputIds);
    return curation.topFiveIds.every(id => inputIdSet.has(id));
  }

  /**
   * Validate exactly 5 results
   */
  static validateSize(curation: CurationSpec): boolean {
    return curation.topFiveIds.length === 5 && 
           curation.summaries.length === 5;
  }

  /**
   * Validate summary IDs match topFiveIds
   */
  static validateSummaryConsistency(curation: CurationSpec): boolean {
    const topFiveSet = new Set(curation.topFiveIds);
    return curation.summaries.every(summary => topFiveSet.has(summary.id));
  }

  /**
   * Validate cluster IDs are subset of topFiveIds
   */
  static validateClusterConsistency(curation: CurationSpec): boolean {
    const topFiveSet = new Set(curation.topFiveIds);
    return curation.clusters.every(cluster => 
      cluster.ids.every(id => topFiveSet.has(id))
    );
  }

  /**
   * Validate bucket diversity (prefer 1 per bucket when possible)
   */
  static validateDiversity(curation: CurationSpec, targetBuckets: string[]): {
    score: number;
    bucketsRepresented: string[];
    missing: string[];
  } {
    const representedBuckets = new Set<string>();
    
    // Extract buckets from summaries
    curation.summaries.forEach(summary => {
      if (summary.bucket) {
        representedBuckets.add(summary.bucket);
      }
    });

    const bucketsArray = Array.from(representedBuckets);
    const missing = targetBuckets.filter(bucket => !representedBuckets.has(bucket));
    const score = bucketsArray.length / Math.max(targetBuckets.length, 5);

    return {
      score,
      bucketsRepresented: bucketsArray,
      missing
    };
  }

  /**
   * Comprehensive validation of curation output
   */
  static validateComplete(
    curation: CurationSpec, 
    inputIds: string[], 
    targetBuckets: string[] = []
  ): {
    valid: boolean;
    errors: string[];
    warnings: string[];
    diversity: ReturnType<typeof CurationValidator.validateDiversity>;
  } {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Schema validation
    try {
      CurationSpecSchema.parse(curation);
    } catch (error) {
      errors.push(`Schema validation failed: ${error}`);
    }

    // Size validation
    if (!this.validateSize(curation)) {
      errors.push('Must have exactly 5 results');
    }

    // Subset validation
    if (!this.validateSubset(curation, inputIds)) {
      errors.push('All topFiveIds must exist in input items');
    }

    // Consistency validation
    if (!this.validateSummaryConsistency(curation)) {
      errors.push('Summary IDs must match topFiveIds');
    }

    if (!this.validateClusterConsistency(curation)) {
      errors.push('Cluster IDs must be subset of topFiveIds');
    }

    // Diversity validation
    const diversity = this.validateDiversity(curation, targetBuckets);
    if (diversity.score < 0.6 && targetBuckets.length > 0) {
      warnings.push(`Low diversity score: ${diversity.score.toFixed(2)}`);
    }

    if (diversity.missing.length > 0) {
      warnings.push(`Missing buckets: ${diversity.missing.join(', ')}`);
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
      diversity
    };
  }
}

/**
 * Default empty curation for fallback scenarios
 */
export const EMPTY_CURATION: CurationSpec = {
  topFiveIds: [],
  clusters: [],
  summaries: [],
  diversityScore: 0,
  bucketsRepresented: [],
  reasoning: 'Fallback: No valid curation available'
};

/**
 * Validate and sanitize CurationSpec
 */
export function validateCurationSpec(input: unknown): CurationSpec {
  try {
    return CurationSpecSchema.parse(input);
  } catch (error) {
    console.warn('CurationSpec validation failed:', error);
    return EMPTY_CURATION;
  }
}

/**
 * Create fallback curation from input items
 */
export function createFallbackCuration(
  items: Array<{ id: string; name: string; rating?: number; bucket?: string }>,
  targetBuckets: string[] = []
): CurationSpec {
  // Sort by rating and take top 5
  const sortedItems = items
    .filter(item => item.id && item.name)
    .sort((a, b) => (b.rating || 0) - (a.rating || 0))
    .slice(0, 5);

  if (sortedItems.length === 0) {
    return EMPTY_CURATION;
  }

  // Pad to exactly 5 if needed
  while (sortedItems.length < 5 && items.length > 0) {
    const remaining = items.filter(item => 
      !sortedItems.some(selected => selected.id === item.id)
    );
    if (remaining.length > 0) {
      sortedItems.push(remaining[0]);
    } else {
      break;
    }
  }

  const topFiveIds = sortedItems.map(item => item.id);
  
  const summaries: Summary[] = sortedItems.map(item => ({
    id: item.id,
    blurb: `${item.name} - Highly rated experience with ${item.rating || 'good'} rating. Great choice for your adventure.`,
    bucket: item.bucket as any
  }));

  const clusters: Cluster[] = [{
    label: 'Top Rated Experiences',
    ids: topFiveIds
  }];

  return {
    topFiveIds,
    clusters,
    summaries,
    diversityScore: 0.5,
    bucketsRepresented: [...new Set(sortedItems.map(item => item.bucket).filter(Boolean))] as any,
    reasoning: 'Fallback curation based on ratings'
  };
}
