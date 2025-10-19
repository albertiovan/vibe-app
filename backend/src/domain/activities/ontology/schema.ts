/**
 * Canonical Activity Ontology Schema
 * 
 * Defines the structure for activity subtypes, provider mappings,
 * and vibe lexicon entries for the autonomic expansion system.
 */

import { z } from 'zod';

// Core enums
export type Energy = 'chill' | 'medium' | 'high';
export type Env = 'indoor' | 'outdoor' | 'either';
export type Season = 'summer' | 'winter' | 'all';
export type Category = 'adventure' | 'nature' | 'water' | 'culture' | 'wellness' | 'nightlife' | 'culinary' | 'creative' | 'sports' | 'learning';

// Zod schemas for validation
export const EnergySchema = z.enum(['chill', 'medium', 'high']);
export const EnvSchema = z.enum(['indoor', 'outdoor', 'either']);
export const SeasonSchema = z.enum(['summer', 'winter', 'all']);
export const CategorySchema = z.enum(['adventure', 'nature', 'water', 'culture', 'wellness', 'nightlife', 'culinary', 'creative', 'sports', 'learning']);

// Multilingual keywords/synonyms
export const MultilingualStringsSchema = z.object({
  en: z.array(z.string()).min(1),
  ro: z.array(z.string()).min(1)
});

export interface MultilingualStrings {
  en: string[];
  ro: string[];
}

// Provider mapping schemas
export const GoogleMappingSchema = z.object({
  types: z.array(z.string()).min(0),
  keywords: z.array(z.string()).min(0)
}).refine(data => data.types.length > 0 || data.keywords.length > 0, {
  message: "At least one Google type or keyword must be provided"
});

export const OSMMappingSchema = z.object({
  ql: z.string().optional(),
  tags: z.record(z.union([z.string(), z.array(z.string())])).optional()
}).optional();

export const OTMMappingSchema = z.object({
  kinds: z.array(z.string()).optional()
}).optional();

// Main activity subtype schema
export const ActivitySubtypeSchema = z.object({
  id: z.string().regex(/^[a-z0-9-]+$/, "ID must be kebab-case"),
  label: z.string().min(1),
  category: CategorySchema,
  verbs: z.array(z.string()).min(1, "At least one action verb required"),
  examples: z.array(z.string()).optional(),
  energy: EnergySchema,
  indoorOutdoor: EnvSchema,
  seasonality: SeasonSchema,
  durationHintHrs: z.tuple([z.number().min(0), z.number().min(0)]).optional(),
  keywords: MultilingualStringsSchema,
  synonyms: MultilingualStringsSchema,
  google: GoogleMappingSchema,
  osm: OSMMappingSchema,
  otm: OTMMappingSchema,
  experimental: z.boolean().optional().default(false),
  notes: z.string().optional()
});

export interface ActivitySubtype {
  id: string;
  label: string;
  category: Category;
  verbs: string[];
  examples?: string[];
  energy: Energy;
  indoorOutdoor: Env;
  seasonality: Season;
  durationHintHrs?: [number, number];
  keywords: MultilingualStrings;
  synonyms: MultilingualStrings;
  google: {
    types: string[];
    keywords: string[];
  };
  osm?: {
    ql?: string;
    tags?: Record<string, string | string[]>;
  };
  otm?: {
    kinds?: string[];
  };
  experimental?: boolean;
  notes?: string;
}

// Vibe lexicon schema
export const VibeEntrySchema = z.object({
  id: z.string().regex(/^[a-z0-9-]+$/, "ID must be kebab-case"),
  cues: MultilingualStringsSchema,
  preferredCategories: z.array(z.string()).min(1),
  disallowedCategories: z.array(z.string()).optional(),
  weights: z.record(z.number()).optional()
});

export interface VibeEntry {
  id: string;
  cues: MultilingualStrings;
  preferredCategories: string[];
  disallowedCategories?: string[];
  weights?: Record<string, number>;
}

// Proposal bundle schema (for LLM output)
export const ProposalBundleSchema = z.object({
  newSubtypes: z.array(ActivitySubtypeSchema),
  updatedSubtypes: z.array(ActivitySubtypeSchema),
  vibeLexiconAdditions: z.array(VibeEntrySchema),
  rationale: z.string().min(50)
});

export interface ProposalBundle {
  newSubtypes: ActivitySubtype[];
  updatedSubtypes: ActivitySubtype[];
  vibeLexiconAdditions: VibeEntry[];
  rationale: string;
}

// Validation utilities
export class OntologyValidator {
  static validateActivitySubtype(data: unknown): ActivitySubtype {
    return ActivitySubtypeSchema.parse(data);
  }

  static validateVibeEntry(data: unknown): VibeEntry {
    return VibeEntrySchema.parse(data);
  }

  static validateProposalBundle(data: unknown): ProposalBundle {
    return ProposalBundleSchema.parse(data);
  }

  static checkUniqueIds(subtypes: ActivitySubtype[]): string[] {
    const ids = subtypes.map(s => s.id);
    const duplicates = ids.filter((id, index) => ids.indexOf(id) !== index);
    return [...new Set(duplicates)];
  }

  static checkProviderMappings(subtype: ActivitySubtype): {
    hasGoogleMapping: boolean;
    hasOSMMapping: boolean;
    hasOTMMapping: boolean;
    isVerifiable: boolean;
  } {
    const hasGoogleMapping = subtype.google.types.length > 0 || subtype.google.keywords.length > 0;
    const hasOSMMapping = !!(subtype.osm?.ql || subtype.osm?.tags);
    const hasOTMMapping = !!(subtype.otm?.kinds && subtype.otm.kinds.length > 0);
    
    return {
      hasGoogleMapping,
      hasOSMMapping,
      hasOTMMapping,
      isVerifiable: hasGoogleMapping || hasOSMMapping || hasOTMMapping
    };
  }
}

// Common Google Places types for reference
export const COMMON_GOOGLE_PLACES_TYPES = [
  'amusement_park', 'aquarium', 'art_gallery', 'bakery', 'bar', 'beauty_salon',
  'bicycle_store', 'book_store', 'bowling_alley', 'cafe', 'campground', 'casino',
  'church', 'clothing_store', 'convenience_store', 'dentist', 'department_store',
  'doctor', 'drugstore', 'electronics_store', 'florist', 'furniture_store',
  'gas_station', 'gym', 'hair_care', 'hardware_store', 'hospital', 'jewelry_store',
  'laundry', 'library', 'liquor_store', 'lodging', 'meal_delivery', 'meal_takeaway',
  'movie_theater', 'museum', 'natural_feature', 'night_club', 'painter', 'park',
  'pet_store', 'pharmacy', 'physiotherapist', 'police', 'post_office', 'restaurant',
  'school', 'shoe_store', 'shopping_mall', 'spa', 'stadium', 'storage', 'store',
  'supermarket', 'tourist_attraction', 'train_station', 'travel_agency',
  'university', 'veterinary_care', 'zoo'
] as const;
