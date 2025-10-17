/**
 * FilterSpec Schema
 * Zod schema for vibe-to-Google-Places filter mapping
 */

import { z } from 'zod';

/**
 * Experience buckets for diversity enforcement
 */
export const ExperienceBucketSchema = z.enum([
  'trails',      // Hiking, MTB, cycling, outdoor routes
  'adrenaline',  // High-energy activities, sports, adventure
  'nature',      // Natural attractions, parks, scenic spots
  'culture',     // Museums, galleries, historical sites
  'wellness',    // Spas, relaxation, wellness centers
  'nightlife'    // Evening entertainment, social venues
]);

export type ExperienceBucket = z.infer<typeof ExperienceBucketSchema>;

/**
 * Final FilterSpec schema matching exact specification
 */
export const FilterSpecSchema = z.object({
  buckets: z.array(z.enum(['trails','adrenaline','nature','culture','wellness','nightlife'])).optional(),
  keywords: z.array(z.string()).optional(),
  radiusKm: z.number().min(1).max(200).nullable().optional(),
  timeOfDay: z.enum(['morning','afternoon','evening','late']).nullable().optional(),
  energy: z.enum(['chill','medium','high']).nullable().optional(),
  indoorOutdoor: z.enum(['indoor','outdoor','either']).nullable().optional(),
  minRating: z.number().min(0).max(5).nullable().optional(),
  avoidFood: z.boolean().optional(),
  maxTravelMinutes: z.number().min(5).max(240).nullable().optional()
});

export type FilterSpec = z.infer<typeof FilterSpecSchema>;

/**
 * Default FilterSpec for fallback scenarios
 */
export const DEFAULT_FILTER_SPEC: FilterSpec = {
  buckets: ['trails', 'adrenaline', 'nature', 'culture', 'wellness'],
  keywords: ['activity', 'experience'],
  radiusKm: 10,
  maxTravelMinutes: 60,
  timeOfDay: null,
  indoorOutdoor: 'either',
  energy: 'medium',
  minRating: 4.0,
  avoidFood: true
};

/**
 * Validate and sanitize FilterSpec
 */
export function validateFilterSpec(input: unknown): FilterSpec {
  try {
    return FilterSpecSchema.parse(input);
  } catch (error) {
    console.warn('FilterSpec validation failed, using defaults:', error);
    return DEFAULT_FILTER_SPEC;
  }
}

/**
 * Merge FilterSpec with defaults
 */
export function mergeWithDefaults(spec: Partial<FilterSpec>): FilterSpec {
  return {
    ...DEFAULT_FILTER_SPEC,
    ...spec
  };
}
