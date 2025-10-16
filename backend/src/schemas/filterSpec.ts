/**
 * FilterSpec Schema
 * Zod schema for vibe-to-Google-Places filter mapping
 */

import { z } from 'zod';

/**
 * FilterSpec schema matching the TypeScript interface from requirements
 */
export const FilterSpecSchema = z.object({
  types: z.array(z.string()).optional(),
  keywords: z.array(z.string()).optional(),
  radiusMeters: z.number().min(100).max(50000).nullable().optional(),
  timeOfDay: z.enum(['morning', 'afternoon', 'evening', 'late']).nullable().optional(),
  indoorOutdoor: z.enum(['indoor', 'outdoor', 'either']).nullable().optional(),
  energy: z.enum(['chill', 'medium', 'high']).nullable().optional(),
  minRating: z.number().min(0).max(5).nullable().optional(),
  maxPriceLevel: z.union([z.literal(0), z.literal(1), z.literal(2), z.literal(3), z.literal(4)]).nullable().optional(),
  avoid: z.array(z.string()).nullable().optional()
});

export type FilterSpec = z.infer<typeof FilterSpecSchema>;

/**
 * Default FilterSpec for fallback scenarios
 */
export const DEFAULT_FILTER_SPEC: FilterSpec = {
  types: undefined,
  keywords: undefined,
  radiusMeters: 5000,
  timeOfDay: null,
  indoorOutdoor: 'either',
  energy: 'medium',
  minRating: 3.5,
  maxPriceLevel: null,
  avoid: null
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
