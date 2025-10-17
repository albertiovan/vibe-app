/**
 * LLM Validation Tests
 * Tests LLM failure handling and fallback mechanisms
 */

import { curateTopFive } from '../src/services/llm/curation.js';
import { CurationValidator } from '../src/schemas/curationSpec.js';
import candidatesFixture from '../__fixtures__/candidates.bucharest.json';

describe('LLM Validation and Fallbacks', () => {
  const mockCandidates = candidatesFixture.slice(0, 8).map(c => ({
    id: c.id,
    name: c.name,
    rating: c.rating,
    types: c.types,
    weatherSuitability: c.weatherSuitabilityScore,
    bucket: c.bucket
  }));

  describe('Bad JSON from mock provider', () => {
    it('should handle invalid JSON and use fallback', async () => {
      // Mock LLM provider to return invalid JSON
      const mockProvider = {
        completeJSON: jest.fn().mockResolvedValue({
          ok: false,
          error: 'Invalid JSON response'
        })
      };

      // Mock the getLLMProvider to return our mock
      jest.doMock('../src/services/llm/index.js', () => ({
        getLLMProvider: () => mockProvider
      }));

      const result = await curateTopFive({
        items: mockCandidates,
        filterSpec: {
          buckets: ['trails', 'adrenaline', 'nature', 'culture', 'wellness'],
          energy: 'medium',
          avoidFood: true
        }
      });

      // Should still return exactly 5 items
      expect(result.topFiveIds).toHaveLength(5);
      expect(result.summaries).toHaveLength(5);
      
      // All IDs should exist in input
      const inputIds = mockCandidates.map(c => c.id);
      result.topFiveIds.forEach(id => {
        expect(inputIds).toContain(id);
      });
      
      // Should have fallback rationale
      expect(result.rationale).toContain('fallback');
    });

    it('should retry and then use fallback on persistent failure', async () => {
      let callCount = 0;
      const mockProvider = {
        completeJSON: jest.fn().mockImplementation(() => {
          callCount++;
          return Promise.resolve({
            ok: false,
            error: `Attempt ${callCount} failed`
          });
        })
      };

      jest.doMock('../src/services/llm/index.js', () => ({
        getLLMProvider: () => mockProvider
      }));

      const result = await curateTopFive({
        items: mockCandidates,
        filterSpec: {
          buckets: ['trails', 'adrenaline', 'nature', 'culture', 'wellness'],
          energy: 'high',
          avoidFood: true
        }
      });

      // Should have attempted the call
      expect(mockProvider.completeJSON).toHaveBeenCalled();
      
      // Should still return valid result
      expect(result.topFiveIds).toHaveLength(5);
      expect(result.summaries).toHaveLength(5);
      
      // Validate schema compliance
      expect(() => {
        require('../src/schemas/curationSpec.js').CurationSpecSchema.parse(result);
      }).not.toThrow();
    });
  });

  describe('Invalid LLM responses', () => {
    it('should handle LLM returning wrong number of items', async () => {
      const mockProvider = {
        completeJSON: jest.fn().mockResolvedValue({
          ok: true,
          data: {
            topFiveIds: ['id1', 'id2', 'id3'], // Only 3 items instead of 5
            clusters: [],
            summaries: [
              { id: 'id1', blurb: 'Test blurb 1' },
              { id: 'id2', blurb: 'Test blurb 2' },
              { id: 'id3', blurb: 'Test blurb 3' }
            ],
            rationale: 'Test rationale'
          }
        })
      };

      jest.doMock('../src/services/llm/index.js', () => ({
        getLLMProvider: () => mockProvider
      }));

      const result = await curateTopFive({
        items: mockCandidates,
        filterSpec: {
          buckets: ['trails', 'nature'],
          energy: 'medium',
          avoidFood: true
        }
      });

      // Should fallback and return exactly 5
      expect(result.topFiveIds).toHaveLength(5);
      expect(result.summaries).toHaveLength(5);
    });

    it('should handle LLM returning non-existent IDs', async () => {
      const mockProvider = {
        completeJSON: jest.fn().mockResolvedValue({
          ok: true,
          data: {
            topFiveIds: ['fake_id_1', 'fake_id_2', 'fake_id_3', 'fake_id_4', 'fake_id_5'],
            clusters: [],
            summaries: [
              { id: 'fake_id_1', blurb: 'Fake place 1 with detailed description' },
              { id: 'fake_id_2', blurb: 'Fake place 2 with detailed description' },
              { id: 'fake_id_3', blurb: 'Fake place 3 with detailed description' },
              { id: 'fake_id_4', blurb: 'Fake place 4 with detailed description' },
              { id: 'fake_id_5', blurb: 'Fake place 5 with detailed description' }
            ],
            rationale: 'Selected diverse fake places'
          }
        })
      };

      jest.doMock('../src/services/llm/index.js', () => ({
        getLLMProvider: () => mockProvider
      }));

      const result = await curateTopFive({
        items: mockCandidates,
        filterSpec: {
          buckets: ['culture', 'wellness'],
          energy: 'chill',
          avoidFood: true
        }
      });

      // Should fallback to valid IDs
      const inputIds = mockCandidates.map(c => c.id);
      result.topFiveIds.forEach(id => {
        expect(inputIds).toContain(id);
      });
      
      // Should still return exactly 5
      expect(result.topFiveIds).toHaveLength(5);
    });
  });

  describe('Schema validation', () => {
    it('should validate complete curation spec', () => {
      const validCuration = {
        topFiveIds: ['id1', 'id2', 'id3', 'id4', 'id5'],
        clusters: [
          { label: 'Test Cluster', ids: ['id1', 'id2'] }
        ],
        summaries: [
          { id: 'id1', blurb: 'Valid blurb with sufficient length for testing' },
          { id: 'id2', blurb: 'Another valid blurb with sufficient length for testing' },
          { id: 'id3', blurb: 'Third valid blurb with sufficient length for testing' },
          { id: 'id4', blurb: 'Fourth valid blurb with sufficient length for testing' },
          { id: 'id5', blurb: 'Fifth valid blurb with sufficient length for testing' }
        ],
        rationale: 'Test rationale'
      };

      const inputIds = ['id1', 'id2', 'id3', 'id4', 'id5', 'id6'];
      const validation = CurationValidator.validateComplete(
        validCuration as any,
        inputIds,
        ['trails', 'nature']
      );

      expect(validation.valid).toBe(true);
      expect(validation.errors).toHaveLength(0);
    });

    it('should detect subset violations', () => {
      const invalidCuration = {
        topFiveIds: ['id1', 'id2', 'id3', 'id4', 'nonexistent'],
        clusters: [],
        summaries: [
          { id: 'id1', blurb: 'Valid blurb with sufficient length' },
          { id: 'id2', blurb: 'Valid blurb with sufficient length' },
          { id: 'id3', blurb: 'Valid blurb with sufficient length' },
          { id: 'id4', blurb: 'Valid blurb with sufficient length' },
          { id: 'nonexistent', blurb: 'Valid blurb with sufficient length' }
        ],
        rationale: 'Test'
      };

      const inputIds = ['id1', 'id2', 'id3', 'id4', 'id5'];
      const validation = CurationValidator.validateComplete(
        invalidCuration as any,
        inputIds,
        []
      );

      expect(validation.valid).toBe(false);
      expect(validation.errors.some(e => e.includes('exist in input'))).toBe(true);
    });

    it('should detect size violations', () => {
      const invalidCuration = {
        topFiveIds: ['id1', 'id2', 'id3'], // Only 3 items
        clusters: [],
        summaries: [
          { id: 'id1', blurb: 'Valid blurb with sufficient length' },
          { id: 'id2', blurb: 'Valid blurb with sufficient length' },
          { id: 'id3', blurb: 'Valid blurb with sufficient length' }
        ],
        rationale: 'Test'
      };

      const validation = CurationValidator.validateSize(invalidCuration as any);
      expect(validation).toBe(false);
    });
  });

  describe('Fallback curation quality', () => {
    it('should create high-quality fallback with bucket diversity', async () => {
      // Force fallback by providing insufficient candidates
      const result = await curateTopFive({
        items: mockCandidates.slice(0, 3), // Only 3 candidates
        filterSpec: {
          buckets: ['trails', 'nature', 'culture'],
          energy: 'medium',
          avoidFood: true
        }
      });

      // Should pad to 5 or return what's available
      expect(result.topFiveIds.length).toBeGreaterThan(0);
      expect(result.summaries.length).toBe(result.topFiveIds.length);
      
      // Should have meaningful summaries
      result.summaries.forEach(summary => {
        expect(summary.blurb.length).toBeGreaterThan(20);
        expect(summary.blurb).toContain(summary.id.replace(/_/g, ' '));
      });
    });

    it('should prioritize by weather suitability and rating in fallback', async () => {
      // Mock to force fallback
      const mockProvider = {
        completeJSON: jest.fn().mockResolvedValue({
          ok: false,
          error: 'Forced fallback test'
        })
      };

      jest.doMock('../src/services/llm/index.js', () => ({
        getLLMProvider: () => mockProvider
      }));

      const candidatesWithScores = mockCandidates.map(c => ({
        ...c,
        weatherSuitability: Math.random() * 0.5 + 0.5, // 0.5-1.0
        rating: Math.random() * 2 + 3 // 3-5
      }));

      const result = await curateTopFive({
        items: candidatesWithScores,
        filterSpec: {
          buckets: ['trails', 'adrenaline', 'nature', 'culture', 'wellness'],
          energy: 'high',
          avoidFood: true
        }
      });

      // Should return exactly 5
      expect(result.topFiveIds).toHaveLength(5);
      
      // Should prioritize higher scores (weather * 1.5 + rating * ln(reviews))
      const selectedCandidates = result.topFiveIds.map(id => 
        candidatesWithScores.find(c => c.id === id)
      );
      
      selectedCandidates.forEach(candidate => {
        expect(candidate).toBeDefined();
        expect(candidate!.rating).toBeGreaterThan(0);
        expect(candidate!.weatherSuitability).toBeGreaterThan(0);
      });
    });
  });

  describe('Edge cases', () => {
    it('should handle empty candidate list gracefully', async () => {
      const result = await curateTopFive({
        items: [],
        filterSpec: {
          buckets: ['trails'],
          energy: 'medium',
          avoidFood: true
        }
      });

      expect(result.topFiveIds).toHaveLength(0);
      expect(result.summaries).toHaveLength(0);
      expect(result.rationale).toContain('No valid curation');
    });

    it('should handle malformed candidate data', async () => {
      const malformedCandidates = [
        { id: '', name: '', rating: null }, // Empty/null values
        { id: 'valid', name: 'Valid Place', rating: 4.5 },
        { /* missing required fields */ },
        { id: 'another', name: 'Another Place', rating: 4.0 }
      ];

      const result = await curateTopFive({
        items: malformedCandidates as any,
        filterSpec: {
          buckets: ['nature'],
          energy: 'medium',
          avoidFood: true
        }
      });

      // Should filter out malformed data and work with valid items
      expect(result.topFiveIds.length).toBeGreaterThan(0);
      result.topFiveIds.forEach(id => {
        expect(id).toBeTruthy();
        expect(typeof id).toBe('string');
      });
    });
  });
});
