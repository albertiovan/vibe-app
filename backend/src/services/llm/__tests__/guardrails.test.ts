/**
 * LLM Guardrails Unit Tests
 * 
 * Comprehensive tests for production-grade reliability:
 * - Malformed JSON handling
 * - Zero-venue scenario enforcement
 * - Tool budget management
 * - Retry logic with backoff
 * - Anti-hallucination validation
 */

import { describe, test, expect, beforeEach, jest } from '@jest/globals';
import { LLMGuardrails, ErrorType, guardrails } from '../guardrails.js';
import { 
  ProposedActivitiesSchema, 
  VerificationPlanSchema, 
  ActivityCurationSchema 
} from '../guardrails.js';

describe('LLM Guardrails', () => {
  let testGuardrails: LLMGuardrails;

  beforeEach(() => {
    testGuardrails = new LLMGuardrails();
    testGuardrails.clearTelemetry();
  });

  describe('JSON Validation', () => {
    test('should validate correct ProposedActivities JSON', () => {
      const validJSON = JSON.stringify({
        intents: [{
          id: 'hiking_omu_peak',
          label: 'Hiking to Omu Peak',
          category: 'nature',
          subtypes: ['hiking', 'mountain_hiking'],
          regions: ['Bucegi', 'Sinaia'],
          vibeAlignment: 'Perfect for adventure seekers',
          confidence: 0.9
        }],
        selectionRationale: 'Selected based on user preference for high-energy outdoor activities'
      });

      const result = testGuardrails.validateJSON(ProposedActivitiesSchema, validJSON, 'test');
      
      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data?.intents).toHaveLength(1);
      expect(result.warnings).toBeUndefined();
    });

    test('should reject malformed JSON', () => {
      const malformedJSON = '{ "intents": [ invalid json }';
      
      const result = testGuardrails.validateJSON(ProposedActivitiesSchema, malformedJSON, 'test');
      
      expect(result.success).toBe(false);
      expect(result.error?.type).toBe(ErrorType.PARSE_ERROR);
      expect(result.error?.retryable).toBe(true);
    });

    test('should reject JSON with missing required fields', () => {
      const invalidJSON = JSON.stringify({
        intents: [{
          id: 'hiking_omu_peak',
          // Missing required fields: label, category, subtypes, regions, vibeAlignment, confidence
        }],
        selectionRationale: 'Test rationale'
      });

      const result = testGuardrails.validateJSON(ProposedActivitiesSchema, invalidJSON, 'test');
      
      expect(result.success).toBe(false);
      expect(result.error?.type).toBe(ErrorType.VALIDATION_ERROR);
      expect(result.error?.retryable).toBe(true);
    });

    test('should reject JSON with invalid enum values', () => {
      const invalidJSON = JSON.stringify({
        intents: [{
          id: 'hiking_omu_peak',
          label: 'Hiking to Omu Peak',
          category: 'invalid_category', // Invalid enum value
          subtypes: ['hiking'],
          regions: ['Bucegi'],
          vibeAlignment: 'Perfect for adventure seekers',
          confidence: 0.9
        }],
        selectionRationale: 'Test rationale'
      });

      const result = testGuardrails.validateJSON(ProposedActivitiesSchema, invalidJSON, 'test');
      
      expect(result.success).toBe(false);
      expect(result.error?.type).toBe(ErrorType.VALIDATION_ERROR);
    });

    test('should reject JSON with out-of-range confidence values', () => {
      const invalidJSON = JSON.stringify({
        intents: [{
          id: 'hiking_omu_peak',
          label: 'Hiking to Omu Peak',
          category: 'nature',
          subtypes: ['hiking'],
          regions: ['Bucegi'],
          vibeAlignment: 'Perfect for adventure seekers',
          confidence: 1.5 // Out of range (0-1)
        }],
        selectionRationale: 'Test rationale'
      });

      const result = testGuardrails.validateJSON(ProposedActivitiesSchema, invalidJSON, 'test');
      
      expect(result.success).toBe(false);
      expect(result.error?.type).toBe(ErrorType.VALIDATION_ERROR);
    });
  });

  describe('Anti-Hallucination Checks', () => {
    test('should detect recommendations without verified venues', () => {
      const curationWithoutVenues = JSON.stringify({
        recommendations: [{
          intent: {
            id: 'hiking_omu_peak',
            label: 'Hiking to Omu Peak',
            category: 'nature',
            subtypes: ['hiking'],
            regions: ['Bucegi'],
            vibeAlignment: 'Perfect match',
            confidence: 0.9
          },
          verifiedVenues: [], // Empty venues - should trigger warning
          weatherSuitability: 'good',
          rationale: 'Great hiking opportunity',
          confidence: 0.8,
          personalizationFactors: {
            interestMatch: 0.9,
            energyMatch: 0.8,
            profileAlignment: 0.7
          }
        }],
        topFive: ['hiking_omu_peak'],
        rationale: 'Selected based on preferences',
        metadata: {
          totalIntentsProposed: 1,
          totalIntentsVerified: 0,
          totalVenuesFound: 0,
          weatherConstraintsApplied: 0,
          diversityScore: 1.0
        }
      });

      const result = testGuardrails.validateJSON(ActivityCurationSchema, curationWithoutVenues, 'curation');
      
      expect(result.success).toBe(false); // Should fail schema validation (min 1 venue required)
      expect(result.error?.type).toBe(ErrorType.VALIDATION_ERROR);
    });

    test('should detect generic rationales', () => {
      const curationWithGenericRationale = JSON.stringify({
        recommendations: [{
          intent: {
            id: 'hiking_omu_peak',
            label: 'Hiking to Omu Peak',
            category: 'nature',
            subtypes: ['hiking'],
            regions: ['Bucegi'],
            vibeAlignment: 'Perfect match',
            confidence: 0.9
          },
          verifiedVenues: [{
            placeId: 'test_place_id',
            name: 'Test Venue',
            coords: { lat: 45.4, lon: 25.5 },
            provider: 'google',
            evidence: {
              verificationMethod: 'Google Places API'
            }
          }],
          weatherSuitability: 'good',
          rationale: 'great place', // Generic rationale - should trigger warning
          confidence: 0.8,
          personalizationFactors: {
            interestMatch: 0.9,
            energyMatch: 0.8,
            profileAlignment: 0.7
          }
        }],
        topFive: ['hiking_omu_peak'],
        rationale: 'Selected based on preferences',
        metadata: {
          totalIntentsProposed: 1,
          totalIntentsVerified: 1,
          totalVenuesFound: 1,
          weatherConstraintsApplied: 0,
          diversityScore: 1.0
        }
      });

      const result = testGuardrails.validateJSON(ActivityCurationSchema, curationWithGenericRationale, 'curation');
      
      expect(result.success).toBe(true); // Valid schema but should have warnings
      expect(result.warnings).toBeDefined();
      expect(result.warnings?.some(w => w.includes('generic rationale'))).toBe(true);
    });

    test('should detect topFive inconsistency', () => {
      const curationWithInconsistentTopFive = JSON.stringify({
        recommendations: [{
          intent: {
            id: 'hiking_omu_peak',
            label: 'Hiking to Omu Peak',
            category: 'nature',
            subtypes: ['hiking'],
            regions: ['Bucegi'],
            vibeAlignment: 'Perfect match',
            confidence: 0.9
          },
          verifiedVenues: [{
            placeId: 'test_place_id',
            name: 'Test Venue',
            coords: { lat: 45.4, lon: 25.5 },
            provider: 'google',
            evidence: {
              verificationMethod: 'Google Places API'
            }
          }],
          weatherSuitability: 'good',
          rationale: 'Based on Test Venue with excellent reviews and high rating',
          confidence: 0.8,
          personalizationFactors: {
            interestMatch: 0.9,
            energyMatch: 0.8,
            profileAlignment: 0.7
          }
        }],
        topFive: ['hiking_omu_peak', 'nonexistent_activity'], // Contains ID not in recommendations
        rationale: 'Selected based on preferences',
        metadata: {
          totalIntentsProposed: 1,
          totalIntentsVerified: 1,
          totalVenuesFound: 1,
          weatherConstraintsApplied: 0,
          diversityScore: 1.0
        }
      });

      const result = testGuardrails.validateJSON(ActivityCurationSchema, curationWithInconsistentTopFive, 'curation');
      
      expect(result.success).toBe(true); // Valid schema but should have warnings
      expect(result.warnings).toBeDefined();
      expect(result.warnings?.some(w => w.includes('TopFive contains IDs not in recommendations'))).toBe(true);
    });
  });

  describe('Subset ID Validation', () => {
    test('should pass when selected IDs are subset of candidates', () => {
      const candidates = ['activity_1', 'activity_2', 'activity_3'];
      const selected = ['activity_1', 'activity_3'];

      const result = testGuardrails.assertSubsetIds(selected, candidates, 'test');
      
      expect(result.success).toBe(true);
      expect(result.data).toEqual(selected);
    });

    test('should fail when selected IDs contain hallucinated entries', () => {
      const candidates = ['activity_1', 'activity_2', 'activity_3'];
      const selected = ['activity_1', 'hallucinated_activity', 'activity_3'];

      const result = testGuardrails.assertSubsetIds(selected, candidates, 'test');
      
      expect(result.success).toBe(false);
      expect(result.error?.type).toBe(ErrorType.HALLUCINATION_ERROR);
      expect(result.error?.retryable).toBe(false);
      expect(result.error?.context.invalidIds).toContain('hallucinated_activity');
    });

    test('should handle empty selections', () => {
      const candidates = ['activity_1', 'activity_2'];
      const selected: string[] = [];

      const result = testGuardrails.assertSubsetIds(selected, candidates, 'test');
      
      expect(result.success).toBe(true);
      expect(result.data).toEqual([]);
    });
  });

  describe('Tool Budget Management', () => {
    test('should create tool budget correctly', () => {
      const budget = testGuardrails.createToolBudget(
        20,
        { google: 12, osm: 5, otm: 8 },
        60000
      );

      expect(budget.totalCalls).toBe(20);
      expect(budget.remainingCalls).toBe(20);
      expect(budget.maxCallsPerProvider.google).toBe(12);
      expect(budget.callsByProvider.google).toBe(0);
      expect(budget.startTime).toBeGreaterThan(0);
    });

    test('should decrement budget correctly', () => {
      const budget = testGuardrails.createToolBudget(
        20,
        { google: 12, osm: 5, otm: 8 },
        60000
      );

      const result = testGuardrails.checkAndDecrementBudget(budget, 'google', 3);
      
      expect(result.success).toBe(true);
      expect(result.data?.remainingCalls).toBe(17);
      expect(result.data?.callsByProvider.google).toBe(3);
    });

    test('should reject when total budget exceeded', () => {
      const budget = testGuardrails.createToolBudget(
        5,
        { google: 12, osm: 5, otm: 8 },
        60000
      );

      const result = testGuardrails.checkAndDecrementBudget(budget, 'google', 6);
      
      expect(result.success).toBe(false);
      expect(result.error?.type).toBe(ErrorType.TOOL_BUDGET_EXCEEDED);
    });

    test('should reject when provider budget exceeded', () => {
      const budget = testGuardrails.createToolBudget(
        20,
        { google: 3, osm: 5, otm: 8 },
        60000
      );

      const result = testGuardrails.checkAndDecrementBudget(budget, 'google', 4);
      
      expect(result.success).toBe(false);
      expect(result.error?.type).toBe(ErrorType.TOOL_BUDGET_EXCEEDED);
      expect(result.error?.context.provider).toBe('google');
    });

    test('should reject when time budget exceeded', () => {
      const budget = testGuardrails.createToolBudget(
        20,
        { google: 12, osm: 5, otm: 8 },
        100 // Very short time budget
      );

      // Wait longer than budget
      setTimeout(() => {
        const result = testGuardrails.checkAndDecrementBudget(budget, 'google', 1);
        
        expect(result.success).toBe(false);
        expect(result.error?.type).toBe(ErrorType.TIMEOUT_ERROR);
      }, 150);
    });
  });

  describe('Retry Logic', () => {
    test('should succeed on first attempt', async () => {
      const operation = jest.fn().mockResolvedValue('success');

      const result = await testGuardrails.safeRetry(operation, {}, 'test');
      
      expect(result).toBe('success');
      expect(operation).toHaveBeenCalledTimes(1);
    });

    test('should retry on retryable errors', async () => {
      const operation = jest.fn()
        .mockRejectedValueOnce(new Error('timeout'))
        .mockRejectedValueOnce(new Error('network error'))
        .mockResolvedValue('success');

      const result = await testGuardrails.safeRetry(
        operation, 
        { maxRetries: 2, baseDelayMs: 10 }, 
        'test'
      );
      
      expect(result).toBe('success');
      expect(operation).toHaveBeenCalledTimes(3);
    });

    test('should not retry on non-retryable errors', async () => {
      const operation = jest.fn().mockRejectedValue(new Error('validation failed'));

      await expect(
        testGuardrails.safeRetry(
          operation, 
          { maxRetries: 2, retryableErrors: [ErrorType.TIMEOUT_ERROR] }, 
          'test'
        )
      ).rejects.toThrow();
      
      expect(operation).toHaveBeenCalledTimes(1);
    });

    test('should exhaust retries and throw last error', async () => {
      const operation = jest.fn().mockRejectedValue(new Error('persistent timeout'));

      await expect(
        testGuardrails.safeRetry(
          operation, 
          { maxRetries: 2, baseDelayMs: 10 }, 
          'test'
        )
      ).rejects.toThrow('persistent timeout');
      
      expect(operation).toHaveBeenCalledTimes(3); // Initial + 2 retries
    });
  });

  describe('Error Classification', () => {
    test('should classify JSON parse errors correctly', () => {
      const error = new Error('Unexpected token in JSON');
      const classified = (testGuardrails as any).classifyError(error);
      
      expect(classified.type).toBe(ErrorType.PARSE_ERROR);
      expect(classified.retryable).toBe(true);
    });

    test('should classify timeout errors correctly', () => {
      const error = new Error('Request timeout');
      const classified = (testGuardrails as any).classifyError(error);
      
      expect(classified.type).toBe(ErrorType.TIMEOUT_ERROR);
      expect(classified.retryable).toBe(true);
    });

    test('should classify rate limit errors correctly', () => {
      const error = new Error('Rate limit exceeded (429)');
      const classified = (testGuardrails as any).classifyError(error);
      
      expect(classified.type).toBe(ErrorType.RATE_LIMIT_ERROR);
      expect(classified.retryable).toBe(true);
    });

    test('should classify unknown errors as non-retryable by default', () => {
      const error = new Error('Unknown system error');
      const classified = (testGuardrails as any).classifyError(error);
      
      expect(classified.type).toBe(ErrorType.UNKNOWN_ERROR);
      expect(classified.retryable).toBe(false);
    });
  });

  describe('Telemetry', () => {
    test('should record telemetry events', () => {
      testGuardrails.validateJSON(ProposedActivitiesSchema, '{"invalid": "json"}', 'test');
      
      const summary = testGuardrails.getTelemetrySummary();
      
      expect(summary.totalEvents).toBeGreaterThan(0);
      expect(summary.eventCounts.validation_attempt).toBe(1);
      expect(summary.eventCounts.validation_failed).toBe(1);
    });

    test('should track error counts separately', () => {
      // Trigger some errors
      testGuardrails.validateJSON(ProposedActivitiesSchema, 'invalid json', 'test');
      testGuardrails.assertSubsetIds(['invalid'], ['valid'], 'test');
      
      const summary = testGuardrails.getTelemetrySummary();
      
      expect(summary.errorCounts).toBeDefined();
      expect(Object.keys(summary.errorCounts).length).toBeGreaterThan(0);
    });

    test('should limit telemetry events to prevent memory issues', () => {
      // Generate more than 100 events
      for (let i = 0; i < 150; i++) {
        testGuardrails.validateJSON(ProposedActivitiesSchema, '{}', `test_${i}`);
      }
      
      const summary = testGuardrails.getTelemetrySummary();
      
      expect(summary.totalEvents).toBeLessThanOrEqual(100);
    });

    test('should clear telemetry correctly', () => {
      testGuardrails.validateJSON(ProposedActivitiesSchema, '{}', 'test');
      testGuardrails.clearTelemetry();
      
      const summary = testGuardrails.getTelemetrySummary();
      
      expect(summary.totalEvents).toBe(0);
      expect(Object.keys(summary.eventCounts)).toHaveLength(0);
    });
  });

  describe('Zero-Venue Scenarios', () => {
    test('should enforce minimum venue requirement in schema', () => {
      const curationWithoutVenues = {
        recommendations: [{
          intent: {
            id: 'test_activity',
            label: 'Test Activity',
            category: 'nature',
            subtypes: ['hiking'],
            regions: ['Test Region'],
            vibeAlignment: 'Perfect match',
            confidence: 0.9
          },
          verifiedVenues: [], // Empty - should fail schema validation
          weatherSuitability: 'good',
          rationale: 'Test rationale with sufficient length',
          confidence: 0.8,
          personalizationFactors: {
            interestMatch: 0.9,
            energyMatch: 0.8,
            profileAlignment: 0.7
          }
        }],
        topFive: ['test_activity'],
        rationale: 'Test curation rationale',
        metadata: {
          totalIntentsProposed: 1,
          totalIntentsVerified: 0,
          totalVenuesFound: 0,
          weatherConstraintsApplied: 0,
          diversityScore: 1.0
        }
      };

      const result = testGuardrails.validateJSON(
        ActivityCurationSchema, 
        JSON.stringify(curationWithoutVenues), 
        'curation'
      );
      
      expect(result.success).toBe(false);
      expect(result.error?.type).toBe(ErrorType.VALIDATION_ERROR);
      expect(result.error?.context.zodErrors).toBeDefined();
    });

    test('should accept valid curation with verified venues', () => {
      const validCuration = {
        recommendations: [{
          intent: {
            id: 'test_activity',
            label: 'Test Activity',
            category: 'nature',
            subtypes: ['hiking'],
            regions: ['Test Region'],
            vibeAlignment: 'Perfect match',
            confidence: 0.9
          },
          verifiedVenues: [{
            placeId: 'test_place_123',
            name: 'Test Hiking Trail',
            rating: 4.5,
            userRatingsTotal: 150,
            coords: { lat: 45.0, lon: 25.0 },
            provider: 'google',
            mapsUrl: 'https://maps.google.com/test',
            evidence: {
              types: ['tourist_attraction', 'park'],
              verificationMethod: 'Google Places API'
            }
          }],
          weatherSuitability: 'good',
          rationale: 'Based on Test Hiking Trail with 4.5 rating and 150 reviews, perfect for outdoor activities',
          confidence: 0.8,
          personalizationFactors: {
            interestMatch: 0.9,
            energyMatch: 0.8,
            profileAlignment: 0.7
          }
        }],
        topFive: ['test_activity'],
        rationale: 'Selected based on verified venue data and user preferences',
        metadata: {
          totalIntentsProposed: 1,
          totalIntentsVerified: 1,
          totalVenuesFound: 1,
          weatherConstraintsApplied: 0,
          diversityScore: 1.0
        }
      };

      const result = testGuardrails.validateJSON(
        ActivityCurationSchema, 
        JSON.stringify(validCuration), 
        'curation'
      );
      
      expect(result.success).toBe(true);
      expect(result.data?.recommendations).toHaveLength(1);
      expect(result.data?.recommendations[0].verifiedVenues).toHaveLength(1);
    });
  });
});

describe('Singleton Guardrails Instance', () => {
  test('should provide global guardrails instance', () => {
    expect(guardrails).toBeInstanceOf(LLMGuardrails);
  });

  test('should maintain state across calls', () => {
    guardrails.clearTelemetry();
    guardrails.validateJSON(ProposedActivitiesSchema, '{}', 'test');
    
    const summary = guardrails.getTelemetrySummary();
    expect(summary.totalEvents).toBeGreaterThan(0);
  });
});
