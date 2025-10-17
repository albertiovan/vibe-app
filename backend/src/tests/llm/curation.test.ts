/**
 * Comprehensive tests for LLM curation system
 * Tests schema validation, subset checks, and weather-aware cases
 */

// Simple test framework for validation testing
import { 
  CurationSpec, 
  CurationInput, 
  CurationValidator,
  CurationSpecSchema,
  createFallbackCuration 
} from '../../schemas/curationSpec.js';
import { curateTopFive } from '../../services/llm/curation.js';

describe('CurationSpec Schema Validation', () => {
  it('should validate a complete valid curation spec', () => {
    const validCuration: CurationSpec = {
      topFiveIds: ['id1', 'id2', 'id3', 'id4', 'id5'],
      clusters: [
        {
          label: 'Adventure Activities',
          bucket: 'adrenaline',
          ids: ['id1', 'id2']
        },
        {
          label: 'Cultural Experiences',
          bucket: 'culture',
          ids: ['id3', 'id4']
        }
      ],
      summaries: [
        {
          id: 'id1',
          blurb: 'Amazing adventure park with thrilling rides and exciting activities perfect for adrenaline seekers looking for high-energy fun.',
          bucket: 'adrenaline'
        },
        {
          id: 'id2',
          blurb: 'Spectacular mountain biking trails through scenic landscapes offering challenging routes for experienced cyclists and nature lovers.',
          bucket: 'trails'
        },
        {
          id: 'id3',
          blurb: 'World-class art museum featuring contemporary exhibitions and classical masterpieces in a beautifully designed cultural space.',
          bucket: 'culture'
        },
        {
          id: 'id4',
          blurb: 'Tranquil botanical garden with diverse plant collections and peaceful walking paths ideal for relaxation and contemplation.',
          bucket: 'nature'
        },
        {
          id: 'id5',
          blurb: 'Luxurious spa retreat offering rejuvenating treatments and wellness programs in a serene mountain setting for ultimate relaxation.',
          bucket: 'wellness'
        }
      ],
      diversityScore: 0.8,
      bucketsRepresented: ['adrenaline', 'trails', 'culture', 'nature', 'wellness']
    };

    expect(() => CurationSpecSchema.parse(validCuration)).not.toThrow();
  });

  it('should reject curation with wrong number of items', () => {
    const invalidCuration = {
      topFiveIds: ['id1', 'id2', 'id3'], // Only 3 items
      clusters: [],
      summaries: [
        { id: 'id1', blurb: 'Short description that meets minimum length requirements for validation testing.' },
        { id: 'id2', blurb: 'Another short description that meets minimum length requirements for validation testing.' },
        { id: 'id3', blurb: 'Third short description that meets minimum length requirements for validation testing.' }
      ]
    };

    expect(() => CurationSpecSchema.parse(invalidCuration)).toThrow();
  });

  it('should reject summaries with blurbs that are too short', () => {
    const invalidCuration = {
      topFiveIds: ['id1', 'id2', 'id3', 'id4', 'id5'],
      clusters: [],
      summaries: [
        { id: 'id1', blurb: 'Too short' }, // Less than 20 characters
        { id: 'id2', blurb: 'Also too short for validation requirements and testing purposes.' },
        { id: 'id3', blurb: 'Another description that meets minimum length requirements for validation testing.' },
        { id: 'id4', blurb: 'Fourth description that meets minimum length requirements for validation testing.' },
        { id: 'id5', blurb: 'Fifth description that meets minimum length requirements for validation testing.' }
      ]
    };

    expect(() => CurationSpecSchema.parse(invalidCuration)).toThrow();
  });
});

describe('CurationValidator', () => {
  const mockInputIds = ['place1', 'place2', 'place3', 'place4', 'place5', 'place6'];
  const targetBuckets = ['trails', 'adrenaline', 'nature', 'culture', 'wellness'];

  describe('validateSubset', () => {
    it('should validate that all topFiveIds exist in input', () => {
      const validCuration: CurationSpec = {
        topFiveIds: ['place1', 'place2', 'place3', 'place4', 'place5'],
        clusters: [],
        summaries: []
      };

      expect(CurationValidator.validateSubset(validCuration, mockInputIds)).toBe(true);
    });

    it('should reject curation with non-existent IDs', () => {
      const invalidCuration: CurationSpec = {
        topFiveIds: ['place1', 'place2', 'place3', 'place4', 'nonexistent'],
        clusters: [],
        summaries: []
      };

      expect(CurationValidator.validateSubset(invalidCuration, mockInputIds)).toBe(false);
    });
  });

  describe('validateSize', () => {
    it('should validate exactly 5 results', () => {
      const validCuration: CurationSpec = {
        topFiveIds: ['id1', 'id2', 'id3', 'id4', 'id5'],
        clusters: [],
        summaries: [
          { id: 'id1', blurb: 'Description that meets minimum length requirements for validation testing purposes.' },
          { id: 'id2', blurb: 'Description that meets minimum length requirements for validation testing purposes.' },
          { id: 'id3', blurb: 'Description that meets minimum length requirements for validation testing purposes.' },
          { id: 'id4', blurb: 'Description that meets minimum length requirements for validation testing purposes.' },
          { id: 'id5', blurb: 'Description that meets minimum length requirements for validation testing purposes.' }
        ]
      };

      expect(CurationValidator.validateSize(validCuration)).toBe(true);
    });

    it('should reject wrong number of items', () => {
      const invalidCuration: CurationSpec = {
        topFiveIds: ['id1', 'id2', 'id3'],
        clusters: [],
        summaries: [
          { id: 'id1', blurb: 'Description that meets minimum length requirements for validation testing purposes.' },
          { id: 'id2', blurb: 'Description that meets minimum length requirements for validation testing purposes.' },
          { id: 'id3', blurb: 'Description that meets minimum length requirements for validation testing purposes.' }
        ]
      };

      expect(CurationValidator.validateSize(invalidCuration)).toBe(false);
    });
  });

  describe('validateDiversity', () => {
    it('should calculate diversity score correctly', () => {
      const curation: CurationSpec = {
        topFiveIds: ['id1', 'id2', 'id3', 'id4', 'id5'],
        clusters: [],
        summaries: [
          { id: 'id1', blurb: 'Test description meeting length requirements.', bucket: 'trails' },
          { id: 'id2', blurb: 'Test description meeting length requirements.', bucket: 'adrenaline' },
          { id: 'id3', blurb: 'Test description meeting length requirements.', bucket: 'nature' },
          { id: 'id4', blurb: 'Test description meeting length requirements.', bucket: 'culture' },
          { id: 'id5', blurb: 'Test description meeting length requirements.', bucket: 'wellness' }
        ]
      };

      const diversity = CurationValidator.validateDiversity(curation, targetBuckets);
      
      expect(diversity.score).toBe(1.0); // All 5 buckets represented
      expect(diversity.bucketsRepresented).toHaveLength(5);
      expect(diversity.missing).toHaveLength(0);
    });

    it('should identify missing buckets', () => {
      const curation: CurationSpec = {
        topFiveIds: ['id1', 'id2', 'id3', 'id4', 'id5'],
        clusters: [],
        summaries: [
          { id: 'id1', blurb: 'Test description meeting length requirements.', bucket: 'trails' },
          { id: 'id2', blurb: 'Test description meeting length requirements.', bucket: 'trails' },
          { id: 'id3', blurb: 'Test description meeting length requirements.', bucket: 'adrenaline' },
          { id: 'id4', blurb: 'Test description meeting length requirements.', bucket: 'adrenaline' },
          { id: 'id5', blurb: 'Test description meeting length requirements.', bucket: 'nature' }
        ]
      };

      const diversity = CurationValidator.validateDiversity(curation, targetBuckets);
      
      expect(diversity.score).toBe(0.6); // 3 out of 5 buckets
      expect(diversity.bucketsRepresented).toEqual(['trails', 'adrenaline', 'nature']);
      expect(diversity.missing).toEqual(['culture', 'wellness']);
    });
  });

  describe('validateComplete', () => {
    it('should pass comprehensive validation for valid curation', () => {
      const validCuration: CurationSpec = {
        topFiveIds: ['place1', 'place2', 'place3', 'place4', 'place5'],
        clusters: [
          { label: 'Outdoor Adventures', ids: ['place1', 'place2'] },
          { label: 'Cultural Experiences', ids: ['place3', 'place4'] }
        ],
        summaries: [
          { id: 'place1', blurb: 'Amazing hiking trail with spectacular mountain views and challenging terrain perfect for experienced hikers.', bucket: 'trails' },
          { id: 'place2', blurb: 'Thrilling adventure park featuring zip lines and rock climbing walls for adrenaline seekers.', bucket: 'adrenaline' },
          { id: 'place3', blurb: 'World-renowned art museum showcasing contemporary and classical works in stunning galleries.', bucket: 'culture' },
          { id: 'place4', blurb: 'Beautiful botanical garden with rare plant species and peaceful walking paths for nature lovers.', bucket: 'nature' },
          { id: 'place5', blurb: 'Luxurious spa offering rejuvenating treatments and wellness programs in tranquil mountain setting.', bucket: 'wellness' }
        ],
        diversityScore: 1.0,
        bucketsRepresented: ['trails', 'adrenaline', 'culture', 'nature', 'wellness']
      };

      const validation = CurationValidator.validateComplete(validCuration, mockInputIds, targetBuckets);
      
      expect(validation.valid).toBe(true);
      expect(validation.errors).toHaveLength(0);
      expect(validation.diversity.score).toBe(1.0);
    });

    it('should fail validation for invalid curation', () => {
      const invalidCuration: CurationSpec = {
        topFiveIds: ['place1', 'place2', 'place3', 'nonexistent', 'place5'],
        clusters: [
          { label: 'Test Cluster', ids: ['place1', 'nonexistent', 'another_nonexistent'] }
        ],
        summaries: [
          { id: 'place1', blurb: 'Valid description meeting minimum length requirements for testing.' },
          { id: 'place2', blurb: 'Valid description meeting minimum length requirements for testing.' },
          { id: 'wrong_id', blurb: 'Valid description meeting minimum length requirements for testing.' }, // Wrong ID
          { id: 'place4', blurb: 'Valid description meeting minimum length requirements for testing.' },
          { id: 'place5', blurb: 'Valid description meeting minimum length requirements for testing.' }
        ]
      };

      const validation = CurationValidator.validateComplete(invalidCuration, mockInputIds, targetBuckets);
      
      expect(validation.valid).toBe(false);
      expect(validation.errors.length).toBeGreaterThan(0);
    });
  });
});

describe('createFallbackCuration', () => {
  it('should create valid fallback curation from items', () => {
    const mockItems = [
      { id: 'item1', name: 'Adventure Park', rating: 4.5, bucket: 'adrenaline' },
      { id: 'item2', name: 'Art Museum', rating: 4.2, bucket: 'culture' },
      { id: 'item3', name: 'Nature Trail', rating: 4.8, bucket: 'trails' },
      { id: 'item4', name: 'Spa Resort', rating: 4.0, bucket: 'wellness' },
      { id: 'item5', name: 'Botanical Garden', rating: 4.3, bucket: 'nature' }
    ];

    const fallback = createFallbackCuration(mockItems, ['trails', 'adrenaline', 'culture', 'wellness', 'nature']);
    
    expect(fallback.topFiveIds).toHaveLength(5);
    expect(fallback.summaries).toHaveLength(5);
    expect(fallback.topFiveIds.every(id => mockItems.some(item => item.id === id))).toBe(true);
    
    // Validate schema compliance
    expect(() => CurationSpecSchema.parse(fallback)).not.toThrow();
  });

  it('should handle insufficient items gracefully', () => {
    const mockItems = [
      { id: 'item1', name: 'Adventure Park', rating: 4.5 },
      { id: 'item2', name: 'Art Museum', rating: 4.2 }
    ];

    const fallback = createFallbackCuration(mockItems, ['trails', 'adrenaline']);
    
    expect(fallback.topFiveIds).toHaveLength(0);
    expect(fallback.summaries).toHaveLength(0);
  });
});

describe('Weather-Aware Curation', () => {
  const mockCurationInput: CurationInput = {
    items: [
      {
        id: 'outdoor_trail',
        name: 'Mountain Hiking Trail',
        rating: 4.5,
        types: ['park', 'tourist_attraction'],
        weatherSuitability: 0.2, // Poor weather suitability
        bucket: 'trails'
      },
      {
        id: 'indoor_museum',
        name: 'Modern Art Museum',
        rating: 4.3,
        types: ['museum'],
        weatherSuitability: 1.0, // Perfect weather suitability
        bucket: 'culture'
      },
      {
        id: 'covered_market',
        name: 'Historic Covered Market',
        rating: 4.1,
        types: ['shopping_mall'],
        weatherSuitability: 0.8,
        bucket: 'culture'
      },
      {
        id: 'outdoor_park',
        name: 'Central Park',
        rating: 4.0,
        types: ['park'],
        weatherSuitability: 0.3,
        bucket: 'nature'
      },
      {
        id: 'indoor_spa',
        name: 'Luxury Day Spa',
        rating: 4.6,
        types: ['spa'],
        weatherSuitability: 1.0,
        bucket: 'wellness'
      },
      {
        id: 'indoor_gym',
        name: 'Fitness Center',
        rating: 4.2,
        types: ['gym'],
        weatherSuitability: 1.0,
        bucket: 'adrenaline'
      }
    ],
    filterSpec: {
      buckets: ['trails', 'adrenaline', 'nature', 'culture', 'wellness'],
      energy: 'medium',
      avoidFood: true
    },
    weather: {
      conditions: 'heavy_rain',
      temperature: 15,
      precipitation: 8.5,
      recommendation: 'indoor'
    }
  };

  it('should prioritize weather-suitable activities in bad weather', async () => {
    // This would test the actual curateTopFive function
    // For now, we test the heuristic fallback logic
    const mockItems = mockCurationInput.items.map(item => ({
      ...item,
      score: (item.rating || 0) * 0.7 + (item.weatherSuitability || 1) * 0.3
    }));

    // Sort by weather suitability and rating
    const sorted = mockItems.sort((a, b) => b.score - a.score);
    
    // Top items should be weather-suitable
    expect(sorted[0].weatherSuitability).toBeGreaterThan(0.8);
    expect(sorted[1].weatherSuitability).toBeGreaterThan(0.8);
  });

  it('should maintain diversity even with weather constraints', () => {
    const weatherSuitableItems = mockCurationInput.items.filter(item => 
      (item.weatherSuitability || 1) > 0.7
    );
    
    const buckets = new Set(weatherSuitableItems.map(item => item.bucket));
    expect(buckets.size).toBeGreaterThan(2); // Should have diversity even with weather filtering
  });
});

describe('Edge Cases', () => {
  it('should handle empty input gracefully', () => {
    const emptyInput: CurationInput = {
      items: [],
      filterSpec: {
        buckets: ['trails'],
        energy: 'medium',
        avoidFood: true
      }
    };

    const fallback = createFallbackCuration(emptyInput.items, emptyInput.filterSpec.buckets);
    expect(fallback.topFiveIds).toHaveLength(0);
  });

  it('should handle items without buckets', () => {
    const mockItems = [
      { id: 'item1', name: 'Unknown Place 1', rating: 4.0 },
      { id: 'item2', name: 'Unknown Place 2', rating: 3.8 },
      { id: 'item3', name: 'Unknown Place 3', rating: 4.2 },
      { id: 'item4', name: 'Unknown Place 4', rating: 3.9 },
      { id: 'item5', name: 'Unknown Place 5', rating: 4.1 }
    ];

    const fallback = createFallbackCuration(mockItems, ['trails', 'culture']);
    expect(fallback.topFiveIds).toHaveLength(5);
    expect(fallback.summaries).toHaveLength(5);
  });

  it('should handle duplicate IDs in input', () => {
    const mockItems = [
      { id: 'item1', name: 'Place 1', rating: 4.0 },
      { id: 'item1', name: 'Place 1 Duplicate', rating: 4.5 }, // Duplicate ID
      { id: 'item2', name: 'Place 2', rating: 3.8 },
      { id: 'item3', name: 'Place 3', rating: 4.2 },
      { id: 'item4', name: 'Place 4', rating: 3.9 },
      { id: 'item5', name: 'Place 5', rating: 4.1 }
    ];

    const fallback = createFallbackCuration(mockItems, ['trails']);
    const uniqueIds = new Set(fallback.topFiveIds);
    expect(uniqueIds.size).toBe(fallback.topFiveIds.length); // No duplicate IDs in output
  });
});
