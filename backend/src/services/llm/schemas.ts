/**
 * LLM Orchestrator Schemas
 * 
 * Strict JSON schemas for the propose → plan → verify → recommend pipeline.
 * All LLM interactions must conform to these schemas to prevent hallucinations.
 */

import { z, ZodSchema } from 'zod';
import { ActivityIntent, ActivityRecommendation } from '../../domain/activities/types.js';

/**
 * Input context provided to the LLM for activity recommendation
 */
export interface VibeContext {
  /** User's static profile from onboarding */
  userProfile: {
    interests: string[];
    energyLevel: 'chill' | 'medium' | 'high';
    indoorOutdoor: 'indoor' | 'outdoor' | 'either';
    opennessScore: number; // 1-5 scale
  };
  
  /** Dynamic ML weights (optional, learned from user behavior) */
  mlWeights?: Record<string, number>; // 0-1 scale
  
  /** User's vibe/mood description */
  vibeText: string;
  
  /** Session-specific filters and constraints */
  sessionFilters: {
    radiusKm: number;
    durationHours: number;
    startCity: string;
    lat: number;
    lon: number;
    willingToTravel: boolean;
  };
  
  /** Suggested regions to consider (with distances) */
  regionsSeed: Array<{
    name: string;
    lat: number;
    lon: number;
    distanceKmFromStart?: number;
  }>;
  
  /** Available activities from the Romania ontology */
  activityOntology: ActivityIntent[];
  
  /** Provider mapping hints for tool calls */
  mappingHints: {
    google: Record<string, any>;
    osm: Record<string, any>;
    otm: Record<string, any>;
  };
  
  /** Weather forecasts for relevant regions */
  weather: Array<{
    region: string;
    forecastDaily: Array<{
      date: string;
      tMax: number;
      precipMm: number;
      windMps: number;
      condition: string;
    }>;
  }>;
  
  /** Current time context */
  timeContext: {
    currentTime: string;
    dayOfWeek: string;
    season: 'spring' | 'summer' | 'autumn' | 'winter';
  };
}

// Zod schema for ProposedActivities validation
export const ProposedActivitiesSchema = z.object({
  intents: z.array(z.object({
    id: z.string(),
    label: z.string(),
    category: z.string(),
    subtypes: z.array(z.string()),
    regions: z.array(z.string()),
    vibeAlignment: z.string(),
    confidence: z.number().min(0).max(1)
  })),
  selectionRationale: z.string()
});

// Zod schema for VerificationPlan validation
export const VerificationPlanSchema = z.object({
  queries: z.array(z.object({
    intentId: z.string(),
    provider: z.enum(['google', 'osm', 'otm']),
    priority: z.number().min(1).max(5),
    query: z.object({
      location: z.object({
        lat: z.number(),
        lon: z.number()
      }),
      radiusMeters: z.number().optional(),
      type: z.string().optional(),
      keywords: z.array(z.string()).optional(),
      textQuery: z.string().optional(),
      osmQL: z.string().optional(),
      otmKinds: z.array(z.string()).optional(),
      filters: z.record(z.any()).optional()
    }),
    expectedResultType: z.enum(['venues', 'routes', 'areas', 'points'])
  })),
  estimatedCalls: z.number(),
  strategy: z.string()
});

// Zod schema for ActivityCuration validation
export const ActivityCurationSchema = z.object({
  recommendations: z.array(z.object({
    intent: z.object({
      id: z.string(),
      label: z.string(),
      category: z.string(),
      subtypes: z.array(z.string()),
      regions: z.array(z.string()),
      energy: z.string(),
      indoorOutdoor: z.string()
    }),
    verifiedVenues: z.array(z.object({
      placeId: z.string(),
      name: z.string(),
      rating: z.number().optional(),
      userRatingsTotal: z.number().optional(),
      coords: z.object({
        lat: z.number(),
        lon: z.number()
      }),
      provider: z.string(),
      mapsUrl: z.string().optional(),
      vicinity: z.string().optional(),
      evidence: z.object({
        types: z.array(z.string()).optional(),
        verificationMethod: z.string()
      })
    })).optional(),
    weatherSuitability: z.enum(['good', 'ok', 'bad']),
    rationale: z.string(),
    confidence: z.number().min(0).max(1),
    personalizationFactors: z.object({
      interestMatch: z.number(),
      energyMatch: z.number(),
      profileAlignment: z.number()
    })
  })),
  curationRationale: z.string()
});

/**
 * Step 1: LLM proposes candidate activities based on user vibe and profile
 */
export interface ProposedActivities {
  /** Selected activity intents from ontology or composed variants */
  intents: Array<{
    /** Activity ID from ontology or generated ID for composed activities */
    id: string;
    
    /** Human-readable label */
    label: string;
    
    /** Primary category */
    category: string;
    
    /** Activity subtypes for provider mapping */
    subtypes: string[];
    
    /** Target regions for this activity */
    regions: string[];
    
    /** Why this activity matches the user's vibe */
    vibeAlignment: string;
    
    /** Confidence score (0-1) for this proposal */
    confidence: number;
  }>;
  
  /** Overall reasoning for the selection */
  selectionRationale: string;
}

/**
 * Step 2: LLM creates verification plan - which provider calls to make
 */
export interface VerificationPlan {
  /** Tool queries to execute for venue discovery */
  queries: Array<{
    /** Activity intent ID being verified */
    intentId: string;
    
    /** Provider to query */
    provider: 'google' | 'osm' | 'otm';
    
    /** Priority (1-5, 5 being highest) */
    priority: number;
    
    /** Query parameters for the provider */
    query: {
      /** Search location */
      location: { lat: number; lon: number };
      
      /** Search radius in meters */
      radiusMeters?: number;
      
      /** Google Places specific */
      type?: string;
      keywords?: string[];
      textQuery?: string;
      
      /** OSM/Overpass specific */
      osmQL?: string;
      
      /** OpenTripMap specific */
      otmKinds?: string[];
      
      /** Additional filters */
      filters?: Record<string, any>;
    };
    
    /** Expected result type for validation */
    expectedResultType: 'venues' | 'routes' | 'areas' | 'points';
  }>;
  
  /** Total estimated tool calls */
  estimatedCalls: number;
  
  /** Verification strategy explanation */
  strategy: string;
}

/**
 * Provider results returned to LLM after executing verification plan
 */
export interface ProviderResults {
  /** Results grouped by intent ID */
  resultsByIntent: Record<string, {
    /** Google Places results */
    google?: Array<{
      placeId: string;
      name: string;
      rating?: number;
      userRatingsTotal?: number;
      location: { lat: number; lng: number };
      types: string[];
      vicinity?: string;
      priceLevel?: number;
      openingHours?: any;
      photos?: Array<{ photoReference: string }>;
    }>;
    
    /** OSM/Overpass results */
    osm?: Array<{
      id: string;
      type: 'node' | 'way' | 'relation';
      lat?: number;
      lon?: number;
      tags: Record<string, string>;
      geometry?: any;
    }>;
    
    /** OpenTripMap results */
    otm?: Array<{
      xid: string;
      name: string;
      rate: number;
      kinds: string;
      point: { lat: number; lon: number };
      dist: number;
    }>;
  }>;
  
  /** Execution metadata */
  executionStats: {
    totalCalls: number;
    successfulCalls: number;
    failedCalls: number;
    executionTimeMs: number;
  };
}

/**
 * Step 3: LLM curates final recommendations with verified venues
 */
export interface ActivityCuration {
  /** Final activity recommendations with verified venues */
  recommendations: Array<{
    /** Activity intent */
    intent: {
      id: string;
      label: string;
      category: string;
      subtypes: string[];
      regions: string[];
      energy: string;
      indoorOutdoor: string;
      difficulty?: number;
      durationHintHrs?: [number, number];
    };
    
    /** Verified venues (1-3 per activity) */
    verifiedVenues: Array<{
      placeId: string;
      name: string;
      rating?: number;
      userRatingsTotal?: number;
      coords: { lat: number; lon: number };
      provider: 'google' | 'osm' | 'opentripmap';
      mapsUrl?: string;
      imageUrl?: string;
      vicinity?: string;
      distanceKm?: number;
      travelTimeMin?: number;
      
      /** Evidence from provider API */
      evidence: {
        types?: string[];
        tags?: Record<string, string>;
        kinds?: string;
        verificationMethod: string;
      };
    }>;
    
    /** Weather suitability assessment */
    weatherSuitability: 'good' | 'ok' | 'bad';
    
    /** AI-generated rationale grounded in API data */
    rationale: string;
    
    /** Confidence score (0-1) */
    confidence: number;
    
    /** Personalization factors */
    personalizationFactors: {
      interestMatch: number; // 0-1
      energyMatch: number; // 0-1
      profileAlignment: number; // 0-1
      mlWeightBoost?: number; // 0-1
    };
  }>;
  
  /** Top 5 diverse recommendations (activity IDs) */
  topFive: string[];
  
  /** Overall curation rationale */
  rationale: string;
  
  /** Curation metadata */
  metadata: {
    totalIntentsProposed: number;
    totalIntentsVerified: number;
    totalVenuesFound: number;
    weatherConstraintsApplied: number;
    diversityScore: number; // 0-1, higher = more category diversity
  };
}

/**
 * Weather suitability hints (computed before LLM, passed as context)
 */
export interface WeatherHints {
  /** Weather suitability by activity subtype */
  suitabilityBySubtype: Record<string, {
    suitability: 'good' | 'ok' | 'bad';
    reason: string;
    alternativeConditions?: string;
  }>;
  
  /** Regional weather summaries */
  regionalSummaries: Record<string, {
    overallCondition: string;
    suitableFor: string[];
    notSuitableFor: string[];
    bestDays: string[];
  }>;
}

/**
 * Tool execution budget and limits
 */
export interface ToolBudget {
  /** Maximum total provider calls per search */
  maxTotalCalls: number;
  
  /** Maximum calls per provider */
  maxCallsPerProvider: {
    google: number;
    osm: number;
    otm: number;
  };
  
  /** Maximum concurrent calls */
  maxConcurrentCalls: number;
  
  /** Timeout per call (ms) */
  timeoutPerCall: number;
  
  /** Maximum total execution time (ms) */
  maxTotalExecutionTime: number;
}

/**
 * LLM configuration for deterministic behavior
 */
export interface LLMConfig {
  /** Temperature (0-0.3 for deterministic) */
  temperature: number;
  
  /** Maximum tokens for response */
  maxTokens: number;
  
  /** Number of retries on invalid JSON */
  retries: number;
  
  /** Timeout for LLM call (ms) */
  timeout: number;
  
  /** Model to use */
  model: string;
}

/**
 * Complete orchestrator response
 */
export interface OrchestratorResponse {
  /** Final curated recommendations */
  curation: ActivityCuration;
  
  /** Challenge recommendations (max 2) */
  challenges?: Array<{
    intent: any;
    verifiedVenues: any[];
    weatherSuitability: 'good' | 'ok' | 'bad';
    rationale: string;
    confidence: number;
    challenge: {
      destinationCity: string;
      travelEstimate: {
        distanceKm: number;
        drivingTimeHours: number;
        feasible: boolean;
        transportMode: 'drive' | 'train' | 'flight';
      };
      forecastBadge: {
        condition: string;
        suitability: 'perfect' | 'good' | 'challenging';
        nextBestDays?: string[];
      };
      safetyHint?: string;
      whyNow: string;
      challengeLevel: number;
      comfortZoneStretch: string[];
    };
  }>;
  
  /** Execution metadata */
  execution: {
    /** Total processing time */
    totalTimeMs: number;
    
    /** LLM call statistics */
    llmStats: {
      proposeCalls: number;
      planCalls: number;
      curateCalls: number;
      totalTokensUsed: number;
    };
    
    /** Provider call statistics */
    providerStats: {
      totalCalls: number;
      successRate: number;
      averageLatency: number;
    };
    
    /** Quality metrics */
    quality: {
      verificationRate: number; // % of activities with verified venues
      diversityScore: number; // category diversity
      confidenceScore: number; // average confidence
    };
  };
  
  /** Debug information (if enabled) */
  debug?: {
    proposedActivities: ProposedActivities;
    verificationPlan: VerificationPlan;
    providerResults: ProviderResults;
    weatherHints: WeatherHints;
  };
}
