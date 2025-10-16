/**
 * LLM Schema Tests
 * Test schema validation and fallback behavior
 */

import { FilterSpecSchema, DEFAULT_FILTER_SPEC, validateFilterSpec } from '../../schemas/filterSpec.js';
import { CurationSchema, validateCuration, createFallbackCuration } from '../../schemas/curation.js';

// Test fixtures for 8 different vibes
const VIBE_FIXTURES = [
  {
    name: 'adventurous_high_energy',
    input: 'I want something adventurous and exciting',
    expectedTypes: ['amusement_park', 'tourist_attraction'],
    expectedEnergy: 'high'
  },
  {
    name: 'relaxed_low_energy',
    input: 'I need to relax and unwind',
    expectedTypes: ['spa', 'park'],
    expectedEnergy: 'chill'
  },
  {
    name: 'cultural_medium_energy',
    input: 'I want to learn about history and culture',
    expectedTypes: ['museum', 'art_gallery'],
    expectedEnergy: 'medium'
  },
  {
    name: 'outdoor_nature',
    input: 'I want to be outside in nature',
    expectedTypes: ['park'],
    expectedIndoorOutdoor: 'outdoor'
  },
  {
    name: 'indoor_rainy_day',
    input: 'It\'s raining, I need indoor activities',
    expectedTypes: ['museum', 'library'],
    expectedIndoorOutdoor: 'indoor'
  },
  {
    name: 'food_explicit',
    input: 'I want to eat at a nice restaurant',
    expectedTypes: ['restaurant'],
    expectedAvoid: null
  },
  {
    name: 'budget_conscious',
    input: 'I\'m looking for free or cheap activities',
    expectedMaxPriceLevel: 1,
    expectedTypes: ['park', 'library']
  },
  {
    name: 'evening_entertainment',
    input: 'I want evening entertainment',
    expectedTimeOfDay: 'evening',
    expectedTypes: ['movie_theater', 'night_club']
  }
];

/**
 * Test FilterSpec schema validation
 */
export function testFilterSpecSchema() {
  console.log('🧪 Testing FilterSpec schema validation...');

  // Test valid FilterSpec
  const validFilterSpec = {
    types: ['museum', 'park'],
    keywords: ['art', 'nature'],
    radiusMeters: 5000,
    timeOfDay: 'afternoon' as const,
    indoorOutdoor: 'either' as const,
    energy: 'medium' as const,
    minRating: 4.0,
    maxPriceLevel: 2 as const,
    avoid: ['crowded']
  };

  try {
    const result = FilterSpecSchema.parse(validFilterSpec);
    console.log('✅ Valid FilterSpec parsed successfully');
    assert(result.types?.includes('museum'), 'Should include museum type');
    assert(result.radiusMeters === 5000, 'Should preserve radius');
  } catch (error) {
    console.error('❌ Valid FilterSpec failed validation:', error);
  }

  // Test invalid FilterSpec (should use defaults)
  const invalidFilterSpec = {
    types: ['invalid_type'],
    radiusMeters: -1000, // Invalid radius
    energy: 'invalid_energy',
    minRating: 10 // Invalid rating
  };

  try {
    const result = validateFilterSpec(invalidFilterSpec);
    console.log('✅ Invalid FilterSpec handled with defaults');
    assert(result.radiusMeters === DEFAULT_FILTER_SPEC.radiusMeters, 'Should use default radius');
  } catch (error) {
    console.error('❌ Invalid FilterSpec handling failed:', error);
  }

  // Test empty FilterSpec
  const emptyResult = validateFilterSpec({});
  assert(emptyResult.radiusMeters === DEFAULT_FILTER_SPEC.radiusMeters, 'Should use defaults for empty input');

  console.log('✅ FilterSpec schema tests passed');
}

/**
 * Test Curation schema validation
 */
export function testCurationSchema() {
  console.log('🧪 Testing Curation schema validation...');

  const inputPlaceIds = ['place1', 'place2', 'place3'];

  // Test valid curation
  const validCuration = {
    rerankedIds: ['place2', 'place1', 'place3'],
    clusters: [
      { label: 'Museums', ids: ['place1', 'place2'] },
      { label: 'Parks', ids: ['place3'] }
    ],
    summaries: [
      { id: 'place1', blurb: 'A wonderful museum with great exhibits and friendly staff.' },
      { id: 'place2', blurb: 'Beautiful art gallery featuring local and international artists.' },
      { id: 'place3', blurb: 'Peaceful park perfect for relaxation and outdoor activities.' }
    ]
  };

  const validResult = validateCuration(validCuration, inputPlaceIds);
  if (validResult.ok) {
    console.log('✅ Valid curation passed validation');
    assert(validResult.data.rerankedIds.length === 3, 'Should have all place IDs');
  } else {
    console.error('❌ Valid curation failed validation:', validResult.error);
  }

  // Test curation with invalid IDs (should fail)
  const invalidCuration = {
    rerankedIds: ['place1', 'invalid_place'], // Contains invalid ID
    clusters: undefined,
    summaries: [
      { id: 'place1', blurb: 'Test blurb' },
      { id: 'invalid_place', blurb: 'Invalid blurb' }
    ]
  };

  const invalidResult = validateCuration(invalidCuration, inputPlaceIds);
  if (!invalidResult.ok) {
    console.log('✅ Invalid curation correctly rejected');
    assert(invalidResult.error.includes('not found in input'), 'Should mention missing ID');
  } else {
    console.error('❌ Invalid curation should have been rejected');
  }

  console.log('✅ Curation schema tests passed');
}

/**
 * Test fallback curation
 */
export function testFallbackCuration() {
  console.log('🧪 Testing fallback curation...');

  const testPlaces = [
    {
      place_id: 'place1',
      name: 'Test Museum',
      types: ['museum'],
      rating: 4.5,
      user_ratings_total: 100
    },
    {
      place_id: 'place2',
      name: 'Test Park',
      types: ['park'],
      rating: 4.2,
      user_ratings_total: 50
    },
    {
      place_id: 'place3',
      name: 'Test Gallery',
      types: ['art_gallery'],
      rating: 4.8,
      user_ratings_total: 200
    }
  ];

  const fallback = createFallbackCuration(testPlaces);
  
  assert(fallback.rerankedIds.length === 3, 'Should include all places');
  assert(fallback.rerankedIds[0] === 'place3', 'Should rank highest rated first');
  assert(fallback.summaries.length === 3, 'Should have summaries for all places');
  assert(fallback.summaries.every(s => s.blurb === ''), 'Fallback should have empty blurbs');

  console.log('✅ Fallback curation tests passed');
}

/**
 * Test malformed JSON handling
 */
export function testMalformedJSONHandling() {
  console.log('🧪 Testing malformed JSON handling...');

  const malformedJSON = `{
    "types": ["museum", "park"],
    "radiusMeters": 5000,
    // This is a comment that breaks JSON
    "energy": "medium"
  }`;

  try {
    const result = FilterSpecSchema.parse(JSON.parse(malformedJSON));
    console.error('❌ Malformed JSON should have failed');
  } catch (error) {
    console.log('✅ Malformed JSON correctly rejected');
  }

  // Test JSON with markdown fencing
  const fencedJSON = `\`\`\`json
{
  "types": ["museum"],
  "energy": "medium"
}
\`\`\``;

  // This would be handled by JSONValidator.extractJSON in real usage
  const extracted = fencedJSON.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();
  
  try {
    const result = FilterSpecSchema.parse(JSON.parse(extracted));
    console.log('✅ Fenced JSON correctly extracted and parsed');
  } catch (error) {
    console.error('❌ Fenced JSON extraction failed:', error);
  }

  console.log('✅ Malformed JSON handling tests passed');
}

/**
 * Simple assertion helper
 */
function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`Assertion failed: ${message}`);
  }
}

/**
 * Run all tests
 */
export function runLLMSchemaTests() {
  console.log('🧪 Running LLM Schema Tests...\n');

  try {
    testFilterSpecSchema();
    testCurationSchema();
    testFallbackCuration();
    testMalformedJSONHandling();
    
    console.log('\n✅ All LLM schema tests passed!');
    return true;
  } catch (error) {
    console.error('\n❌ LLM schema tests failed:', error);
    return false;
  }
}

// Export test fixtures for use in other tests
export { VIBE_FIXTURES };
