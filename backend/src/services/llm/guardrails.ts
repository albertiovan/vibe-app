/**
 * LLM Guardrails - Production-Grade Reliability
 * 
 * Ensures Claude behaves like a production cloud LLM with:
 * - Strict JSON schema validation (Zod)
 * - Zero hallucination enforcement
 * - Tool budget management
 * - Deterministic retry logic
 * - Comprehensive error recovery
 * - Telemetry and observability
 */

import { z } from 'zod';

// Error classification for intelligent retry logic
export enum ErrorType {
  PARSE_ERROR = 'parse_error',
  VALIDATION_ERROR = 'validation_error',
  TOOL_BUDGET_EXCEEDED = 'tool_budget_exceeded',
  TIMEOUT_ERROR = 'timeout_error',
  RATE_LIMIT_ERROR = 'rate_limit_error',
  NETWORK_ERROR = 'network_error',
  HALLUCINATION_ERROR = 'hallucination_error',
  UNKNOWN_ERROR = 'unknown_error'
}

export interface GuardrailError extends Error {
  type: ErrorType;
  retryable: boolean;
  context?: any;
  originalError?: Error;
}

export interface RetryConfig {
  maxRetries: number;
  baseDelayMs: number;
  maxDelayMs: number;
  backoffMultiplier: number;
  retryableErrors: ErrorType[];
}

export interface ToolBudget {
  totalCalls: number;
  remainingCalls: number;
  callsByProvider: Record<string, number>;
  maxCallsPerProvider: Record<string, number>;
  startTime: number;
  maxExecutionTimeMs: number;
}

export interface ValidationResult<T> {
  success: boolean;
  data?: T;
  error?: GuardrailError;
  warnings?: string[];
}

export interface TelemetryEvent {
  timestamp: number;
  event: string;
  data: any;
  level: 'info' | 'warn' | 'error';
}

/**
 * Strict Zod schemas for LLM outputs
 */
export const ActivityIntentSchema = z.object({
  id: z.string().min(1),
  label: z.string().min(1),
  category: z.enum(['adventure', 'nature', 'water', 'culture', 'wellness', 'nightlife', 'culinary', 'creative', 'sports', 'learning']),
  subtypes: z.array(z.string()).min(1),
  regions: z.array(z.string()).min(1),
  vibeAlignment: z.string().min(1),
  confidence: z.number().min(0).max(1)
});

export const ProposedActivitiesSchema = z.object({
  intents: z.array(ActivityIntentSchema).min(1).max(8),
  selectionRationale: z.string().min(10)
});

export const VerificationQuerySchema = z.object({
  intentId: z.string().min(1),
  provider: z.enum(['google', 'osm', 'otm']),
  priority: z.number().int().min(1).max(5),
  query: z.object({
    location: z.object({
      lat: z.number().min(-90).max(90),
      lon: z.number().min(-180).max(180)
    }),
    radiusMeters: z.number().int().min(100).max(200000).optional(),
    type: z.string().optional(),
    keywords: z.array(z.string()).optional(),
    textQuery: z.string().optional(),
    osmQL: z.string().optional(),
    otmKinds: z.array(z.string()).optional()
  }),
  expectedResultType: z.enum(['venues', 'routes', 'areas', 'points'])
});

export const VerificationPlanSchema = z.object({
  queries: z.array(VerificationQuerySchema).min(1).max(20),
  estimatedCalls: z.number().int().min(1).max(20),
  strategy: z.string().min(10)
});

export const VerifiedVenueSchema = z.object({
  placeId: z.string().min(1),
  name: z.string().min(1),
  rating: z.number().min(0).max(5).optional(),
  userRatingsTotal: z.number().int().min(0).optional(),
  coords: z.object({
    lat: z.number().min(-90).max(90),
    lon: z.number().min(-180).max(180)
  }),
  provider: z.enum(['google', 'osm', 'opentripmap']),
  mapsUrl: z.string().url().optional(),
  imageUrl: z.string().optional(),
  vicinity: z.string().optional(),
  evidence: z.object({
    types: z.array(z.string()).optional(),
    tags: z.record(z.string()).optional(),
    kinds: z.string().optional(),
    verificationMethod: z.string().min(1)
  })
});

export const ActivityRecommendationSchema = z.object({
  intent: ActivityIntentSchema,
  verifiedVenues: z.array(VerifiedVenueSchema).min(1).max(3), // MANDATORY: ≥1 verified venue
  weatherSuitability: z.enum(['good', 'ok', 'bad']),
  rationale: z.string().min(20), // Must reference specific venue data
  confidence: z.number().min(0).max(1),
  personalizationFactors: z.object({
    interestMatch: z.number().min(0).max(1),
    energyMatch: z.number().min(0).max(1),
    profileAlignment: z.number().min(0).max(1),
    mlWeightBoost: z.number().min(0).max(1).optional()
  })
});

export const ActivityCurationSchema = z.object({
  recommendations: z.array(ActivityRecommendationSchema).max(5),
  topFive: z.array(z.string()).max(5),
  rationale: z.string().min(20),
  metadata: z.object({
    totalIntentsProposed: z.number().int().min(0),
    totalIntentsVerified: z.number().int().min(0),
    totalVenuesFound: z.number().int().min(0),
    weatherConstraintsApplied: z.number().int().min(0),
    diversityScore: z.number().min(0).max(1)
  })
});

/**
 * Production-grade LLM Guardrails
 */
export class LLMGuardrails {
  private telemetryEvents: TelemetryEvent[] = [];
  private defaultRetryConfig: RetryConfig = {
    maxRetries: 2,
    baseDelayMs: 1000,
    maxDelayMs: 10000,
    backoffMultiplier: 2,
    retryableErrors: [
      ErrorType.PARSE_ERROR,
      ErrorType.TIMEOUT_ERROR,
      ErrorType.RATE_LIMIT_ERROR,
      ErrorType.NETWORK_ERROR
    ]
  };

  /**
   * Validate JSON output against strict Zod schema
   */
  validateJSON<T>(
    schema: z.ZodSchema<T>,
    jsonText: string,
    context?: string
  ): ValidationResult<T> {
    this.logTelemetry('validation_attempt', { context, textLength: jsonText.length });

    try {
      // Step 1: Parse JSON
      let parsed: any;
      try {
        parsed = JSON.parse(jsonText);
      } catch (parseError) {
        const error = this.createGuardrailError(
          ErrorType.PARSE_ERROR,
          `Invalid JSON: ${parseError}`,
          true,
          { jsonText: jsonText.substring(0, 200), context }
        );
        this.logTelemetry('validation_failed', { error: 'parse_error', context });
        return { success: false, error };
      }

      // Step 2: Validate against schema
      const result = schema.safeParse(parsed);
      
      if (!result.success) {
        const error = this.createGuardrailError(
          ErrorType.VALIDATION_ERROR,
          `Schema validation failed: ${result.error.message}`,
          true,
          { 
            zodErrors: result.error.errors,
            context,
            parsedData: parsed
          }
        );
        this.logTelemetry('validation_failed', { error: 'schema_error', context, zodErrors: result.error.errors });
        return { success: false, error };
      }

      // Step 3: Additional anti-hallucination checks
      const warnings = this.performAntiHallucinationChecks(result.data, context);

      this.logTelemetry('validation_success', { context, warningsCount: warnings.length });
      return { 
        success: true, 
        data: result.data,
        warnings: warnings.length > 0 ? warnings : undefined
      };

    } catch (error) {
      const guardrailError = this.createGuardrailError(
        ErrorType.UNKNOWN_ERROR,
        `Validation error: ${error}`,
        false,
        { context, originalError: error }
      );
      this.logTelemetry('validation_failed', { error: 'unknown_error', context });
      return { success: false, error: guardrailError };
    }
  }

  /**
   * Assert that selected IDs are subset of candidates (prevent hallucination)
   */
  assertSubsetIds(
    selectedIds: string[],
    candidateIds: string[],
    context: string
  ): ValidationResult<string[]> {
    this.logTelemetry('subset_check', { 
      selectedCount: selectedIds.length, 
      candidateCount: candidateIds.length, 
      context 
    });

    const candidateSet = new Set(candidateIds);
    const invalidIds = selectedIds.filter(id => !candidateSet.has(id));

    if (invalidIds.length > 0) {
      const error = this.createGuardrailError(
        ErrorType.HALLUCINATION_ERROR,
        `Hallucinated IDs detected: ${invalidIds.join(', ')}`,
        false,
        { invalidIds, selectedIds, candidateIds, context }
      );
      this.logTelemetry('subset_check_failed', { invalidIds, context });
      return { success: false, error };
    }

    this.logTelemetry('subset_check_passed', { context });
    return { success: true, data: selectedIds };
  }

  /**
   * Tool budget management with strict enforcement
   */
  createToolBudget(
    maxTotalCalls: number,
    maxCallsPerProvider: Record<string, number>,
    maxExecutionTimeMs: number
  ): ToolBudget {
    const budget: ToolBudget = {
      totalCalls: maxTotalCalls,
      remainingCalls: maxTotalCalls,
      callsByProvider: {},
      maxCallsPerProvider,
      startTime: Date.now(),
      maxExecutionTimeMs
    };

    // Initialize provider counters
    Object.keys(maxCallsPerProvider).forEach(provider => {
      budget.callsByProvider[provider] = 0;
    });

    this.logTelemetry('tool_budget_created', { 
      maxTotalCalls, 
      maxCallsPerProvider, 
      maxExecutionTimeMs 
    });

    return budget;
  }

  /**
   * Check and decrement tool budget
   */
  checkAndDecrementBudget(
    budget: ToolBudget,
    provider: string,
    callCount: number = 1
  ): ValidationResult<ToolBudget> {
    const elapsed = Date.now() - budget.startTime;

    // Check time budget
    if (elapsed > budget.maxExecutionTimeMs) {
      const error = this.createGuardrailError(
        ErrorType.TIMEOUT_ERROR,
        `Execution time budget exceeded: ${elapsed}ms > ${budget.maxExecutionTimeMs}ms`,
        false,
        { elapsed, maxTime: budget.maxExecutionTimeMs }
      );
      this.logTelemetry('budget_exceeded', { type: 'time', elapsed });
      return { success: false, error };
    }

    // Check total call budget
    if (budget.remainingCalls < callCount) {
      const error = this.createGuardrailError(
        ErrorType.TOOL_BUDGET_EXCEEDED,
        `Total call budget exceeded: ${callCount} calls requested, ${budget.remainingCalls} remaining`,
        false,
        { requested: callCount, remaining: budget.remainingCalls }
      );
      this.logTelemetry('budget_exceeded', { type: 'total_calls', requested: callCount, remaining: budget.remainingCalls });
      return { success: false, error };
    }

    // Check provider-specific budget
    const currentProviderCalls = budget.callsByProvider[provider] || 0;
    const maxProviderCalls = budget.maxCallsPerProvider[provider] || 0;
    
    if (currentProviderCalls + callCount > maxProviderCalls) {
      const error = this.createGuardrailError(
        ErrorType.TOOL_BUDGET_EXCEEDED,
        `Provider ${provider} call budget exceeded: ${currentProviderCalls + callCount} > ${maxProviderCalls}`,
        false,
        { provider, currentCalls: currentProviderCalls, maxCalls: maxProviderCalls, requested: callCount }
      );
      this.logTelemetry('budget_exceeded', { type: 'provider_calls', provider, currentCalls: currentProviderCalls, maxCalls: maxProviderCalls });
      return { success: false, error };
    }

    // Decrement budget
    const updatedBudget = {
      ...budget,
      remainingCalls: budget.remainingCalls - callCount,
      callsByProvider: {
        ...budget.callsByProvider,
        [provider]: currentProviderCalls + callCount
      }
    };

    this.logTelemetry('budget_decremented', { 
      provider, 
      callCount, 
      remainingCalls: updatedBudget.remainingCalls,
      providerCalls: updatedBudget.callsByProvider[provider]
    });

    return { success: true, data: updatedBudget };
  }

  /**
   * Safe retry with exponential backoff and error classification
   */
  async safeRetry<T>(
    operation: () => Promise<T>,
    config: Partial<RetryConfig> = {},
    context?: string
  ): Promise<T> {
    const retryConfig = { ...this.defaultRetryConfig, ...config };
    let lastError: GuardrailError | undefined;

    this.logTelemetry('retry_started', { context, maxRetries: retryConfig.maxRetries });

    for (let attempt = 0; attempt <= retryConfig.maxRetries; attempt++) {
      try {
        const result = await operation();
        
        if (attempt > 0) {
          this.logTelemetry('retry_succeeded', { context, attempt, totalAttempts: attempt + 1 });
        }
        
        return result;

      } catch (error) {
        const guardrailError = this.classifyError(error);
        lastError = guardrailError;

        this.logTelemetry('retry_attempt_failed', { 
          context, 
          attempt, 
          errorType: guardrailError.type,
          retryable: guardrailError.retryable
        });

        // Don't retry if error is not retryable
        if (!guardrailError.retryable || !retryConfig.retryableErrors.includes(guardrailError.type)) {
          this.logTelemetry('retry_aborted', { context, reason: 'non_retryable_error', errorType: guardrailError.type });
          throw guardrailError;
        }

        // Don't retry on last attempt
        if (attempt === retryConfig.maxRetries) {
          this.logTelemetry('retry_exhausted', { context, totalAttempts: attempt + 1 });
          break;
        }

        // Calculate delay with exponential backoff
        const delay = Math.min(
          retryConfig.baseDelayMs * Math.pow(retryConfig.backoffMultiplier, attempt),
          retryConfig.maxDelayMs
        );

        this.logTelemetry('retry_delay', { context, attempt, delayMs: delay });
        await this.sleep(delay);
      }
    }

    throw lastError || new Error('Retry failed with unknown error');
  }

  /**
   * Perform anti-hallucination checks on validated data
   */
  private performAntiHallucinationChecks(data: any, context?: string): string[] {
    const warnings: string[] = [];

    // Check for ActivityCuration specific hallucination patterns
    if (context === 'curation' && data.recommendations) {
      for (const rec of data.recommendations) {
        // Ensure every recommendation has verified venues
        if (!rec.verifiedVenues || rec.verifiedVenues.length === 0) {
          warnings.push(`Recommendation ${rec.intent.id} has no verified venues - potential hallucination`);
        }

        // Check for generic/template rationales
        if (rec.rationale && (
          rec.rationale.includes('great place') ||
          rec.rationale.includes('perfect for') ||
          rec.rationale.length < 30
        )) {
          warnings.push(`Recommendation ${rec.intent.id} has generic rationale - may lack venue-specific details`);
        }

        // Ensure venue evidence exists
        for (const venue of rec.verifiedVenues || []) {
          if (!venue.evidence || !venue.evidence.verificationMethod) {
            warnings.push(`Venue ${venue.name} lacks verification evidence`);
          }
        }
      }

      // Check topFive consistency
      if (data.topFive && data.recommendations) {
        const recIds = new Set(data.recommendations.map((r: any) => r.intent.id));
        const invalidTopFive = data.topFive.filter((id: string) => !recIds.has(id));
        if (invalidTopFive.length > 0) {
          warnings.push(`TopFive contains IDs not in recommendations: ${invalidTopFive.join(', ')}`);
        }
      }
    }

    return warnings;
  }

  /**
   * Classify errors for intelligent retry logic
   */
  private classifyError(error: any): GuardrailError {
    // Already a GuardrailError
    if (error.type && error.retryable !== undefined) {
      return error as GuardrailError;
    }

    let errorType = ErrorType.UNKNOWN_ERROR;
    let retryable = false;

    // Classify based on error message/type
    const errorMessage = error.message || error.toString();

    if (errorMessage.includes('JSON') || errorMessage.includes('parse')) {
      errorType = ErrorType.PARSE_ERROR;
      retryable = true;
    } else if (errorMessage.includes('timeout') || errorMessage.includes('TIMEOUT')) {
      errorType = ErrorType.TIMEOUT_ERROR;
      retryable = true;
    } else if (errorMessage.includes('rate limit') || errorMessage.includes('429')) {
      errorType = ErrorType.RATE_LIMIT_ERROR;
      retryable = true;
    } else if (errorMessage.includes('network') || errorMessage.includes('ECONNRESET')) {
      errorType = ErrorType.NETWORK_ERROR;
      retryable = true;
    } else if (errorMessage.includes('validation') || errorMessage.includes('schema')) {
      errorType = ErrorType.VALIDATION_ERROR;
      retryable = true;
    }

    return this.createGuardrailError(errorType, errorMessage, retryable, { originalError: error });
  }

  /**
   * Create standardized GuardrailError
   */
  private createGuardrailError(
    type: ErrorType,
    message: string,
    retryable: boolean,
    context?: any
  ): GuardrailError {
    const error = new Error(message) as GuardrailError;
    error.type = type;
    error.retryable = retryable;
    error.context = context;
    return error;
  }

  /**
   * Log telemetry event
   */
  private logTelemetry(event: string, data: any, level: 'info' | 'warn' | 'error' = 'info'): void {
    const telemetryEvent: TelemetryEvent = {
      timestamp: Date.now(),
      event,
      data,
      level
    };

    this.telemetryEvents.push(telemetryEvent);

    // Console logging for development
    const logPrefix = `[GUARDRAILS:${event.toUpperCase()}]`;
    switch (level) {
      case 'error':
        console.error(logPrefix, data);
        break;
      case 'warn':
        console.warn(logPrefix, data);
        break;
      default:
        console.log(logPrefix, data);
    }

    // Keep only last 100 events to prevent memory issues
    if (this.telemetryEvents.length > 100) {
      this.telemetryEvents = this.telemetryEvents.slice(-100);
    }
  }

  /**
   * Get telemetry summary for debugging
   */
  getTelemetrySummary(): {
    totalEvents: number;
    eventCounts: Record<string, number>;
    errorCounts: Record<string, number>;
    recentEvents: TelemetryEvent[];
  } {
    const eventCounts: Record<string, number> = {};
    const errorCounts: Record<string, number> = {};

    this.telemetryEvents.forEach(event => {
      eventCounts[event.event] = (eventCounts[event.event] || 0) + 1;
      
      if (event.level === 'error') {
        errorCounts[event.event] = (errorCounts[event.event] || 0) + 1;
      }
    });

    return {
      totalEvents: this.telemetryEvents.length,
      eventCounts,
      errorCounts,
      recentEvents: this.telemetryEvents.slice(-10)
    };
  }

  /**
   * Clear telemetry (for testing)
   */
  clearTelemetry(): void {
    this.telemetryEvents = [];
  }

  /**
   * Sleep utility for retry delays
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Singleton instance for global use
export const guardrails = new LLMGuardrails();
