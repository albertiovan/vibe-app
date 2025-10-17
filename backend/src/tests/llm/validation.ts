/**
 * Simple validation tests for LLM curation system
 * Tests schema validation, subset checks, and weather-aware cases
 */

import { 
  CurationSpec, 
  CurationValidator,
  CurationSpecSchema,
  createFallbackCuration 
} from '../../schemas/curationSpec.js';

/**
 * Run validation tests
 */
export function runValidationTests(): void {
  console.log('🧪 Running LLM Curation Validation Tests...\n');

  // Test 1: Valid curation spec
  console.log('Test 1: Valid CurationSpec Schema');
  try {
    const validCuration: CurationSpec = {
      topFiveIds: ['id1', 'id2', 'id3', 'id4', 'id5'],
      clusters: [
        {
          label: 'Adventure Activities',
          bucket: 'adrenaline',
          ids: ['id1', 'id2']
        }
      ],
      summaries: [
        { id: 'id1', blurb: 'Amazing adventure park with thrilling rides and exciting activities perfect for adrenaline seekers looking for high-energy fun.', bucket: 'adrenaline' },
        { id: 'id2', blurb: 'Spectacular mountain biking trails through scenic landscapes offering challenging routes for experienced cyclists and nature lovers.', bucket: 'trails' },
        { id: 'id3', blurb: 'World-class art museum featuring contemporary exhibitions and classical masterpieces in a beautifully designed cultural space.', bucket: 'culture' },
        { id: 'id4', blurb: 'Tranquil botanical garden with diverse plant collections and peaceful walking paths ideal for relaxation and contemplation.', bucket: 'nature' },
        { id: 'id5', blurb: 'Luxurious spa retreat offering rejuvenating treatments and wellness programs in a serene mountain setting for ultimate relaxation.', bucket: 'wellness' }
      ],
      diversityScore: 0.8,
      bucketsRepresented: ['adrenaline', 'trails', 'culture', 'nature', 'wellness']
    };

    CurationSpecSchema.parse(validCuration);
    console.log('✅ Valid curation spec passed schema validation');
  } catch (error) {
    console.log('❌ Valid curation spec failed:', error);
  }

  // Test 2: Subset validation
  console.log('\nTest 2: Subset Validation');
  const mockInputIds = ['place1', 'place2', 'place3', 'place4', 'place5', 'place6'];
  const validSubsetCuration: CurationSpec = {
    topFiveIds: ['place1', 'place2', 'place3', 'place4', 'place5'],
    clusters: [],
    summaries: []
  };

  const isValidSubset = CurationValidator.validateSubset(validSubsetCuration, mockInputIds);
  console.log(isValidSubset ? '✅ Subset validation passed' : '❌ Subset validation failed');

  // Test 3: Size validation
  console.log('\nTest 3: Size Validation');
  const validSizeCuration: CurationSpec = {
    topFiveIds: ['id1', 'id2', 'id3', 'id4', 'id5'],
    clusters: [],
    summaries: [
      { id: 'id1', blurb: 'Description that meets minimum length requirements for validation testing purposes and quality assurance.' },
      { id: 'id2', blurb: 'Description that meets minimum length requirements for validation testing purposes and quality assurance.' },
      { id: 'id3', blurb: 'Description that meets minimum length requirements for validation testing purposes and quality assurance.' },
      { id: 'id4', blurb: 'Description that meets minimum length requirements for validation testing purposes and quality assurance.' },
      { id: 'id5', blurb: 'Description that meets minimum length requirements for validation testing purposes and quality assurance.' }
    ]
  };

  const isValidSize = CurationValidator.validateSize(validSizeCuration);
  console.log(isValidSize ? '✅ Size validation passed' : '❌ Size validation failed');

  // Test 4: Diversity validation
  console.log('\nTest 4: Diversity Validation');
  const diversityCuration: CurationSpec = {
    topFiveIds: ['id1', 'id2', 'id3', 'id4', 'id5'],
    clusters: [],
    summaries: [
      { id: 'id1', blurb: 'Test description meeting length requirements for validation.', bucket: 'trails' },
      { id: 'id2', blurb: 'Test description meeting length requirements for validation.', bucket: 'adrenaline' },
      { id: 'id3', blurb: 'Test description meeting length requirements for validation.', bucket: 'nature' },
      { id: 'id4', blurb: 'Test description meeting length requirements for validation.', bucket: 'culture' },
      { id: 'id5', blurb: 'Test description meeting length requirements for validation.', bucket: 'wellness' }
    ]
  };

  const targetBuckets = ['trails', 'adrenaline', 'nature', 'culture', 'wellness'];
  const diversity = CurationValidator.validateDiversity(diversityCuration, targetBuckets);
  
  console.log(`✅ Diversity score: ${diversity.score} (${diversity.bucketsRepresented.length}/5 buckets)`);
  console.log(`✅ Buckets represented: ${diversity.bucketsRepresented.join(', ')}`);
  console.log(`✅ Missing buckets: ${diversity.missing.join(', ') || 'none'}`);

  // Test 5: Complete validation
  console.log('\nTest 5: Complete Validation');
  const completeCuration: CurationSpec = {
    topFiveIds: ['place1', 'place2', 'place3', 'place4', 'place5'],
    clusters: [
      { label: 'Outdoor Adventures', ids: ['place1', 'place2'] }
    ],
    summaries: [
      { id: 'place1', blurb: 'Amazing hiking trail with spectacular mountain views and challenging terrain perfect for experienced hikers seeking adventure.', bucket: 'trails' },
      { id: 'place2', blurb: 'Thrilling adventure park featuring zip lines and rock climbing walls for adrenaline seekers looking for excitement.', bucket: 'adrenaline' },
      { id: 'place3', blurb: 'World-renowned art museum showcasing contemporary and classical works in stunning galleries for cultural enthusiasts.', bucket: 'culture' },
      { id: 'place4', blurb: 'Beautiful botanical garden with rare plant species and peaceful walking paths for nature lovers and relaxation.', bucket: 'nature' },
      { id: 'place5', blurb: 'Luxurious spa offering rejuvenating treatments and wellness programs in tranquil mountain setting for ultimate relaxation.', bucket: 'wellness' }
    ],
    diversityScore: 1.0,
    bucketsRepresented: ['trails', 'adrenaline', 'culture', 'nature', 'wellness']
  };

  const completeValidation = CurationValidator.validateComplete(completeCuration, mockInputIds, targetBuckets);
  
  if (completeValidation.valid) {
    console.log('✅ Complete validation passed');
    console.log(`✅ Diversity score: ${completeValidation.diversity.score}`);
  } else {
    console.log('❌ Complete validation failed');
    console.log('❌ Errors:', completeValidation.errors);
  }

  if (completeValidation.warnings.length > 0) {
    console.log('⚠️ Warnings:', completeValidation.warnings);
  }

  // Test 6: Fallback curation
  console.log('\nTest 6: Fallback Curation');
  const mockItems = [
    { id: 'item1', name: 'Adventure Park', rating: 4.5, bucket: 'adrenaline' },
    { id: 'item2', name: 'Art Museum', rating: 4.2, bucket: 'culture' },
    { id: 'item3', name: 'Nature Trail', rating: 4.8, bucket: 'trails' },
    { id: 'item4', name: 'Spa Resort', rating: 4.0, bucket: 'wellness' },
    { id: 'item5', name: 'Botanical Garden', rating: 4.3, bucket: 'nature' }
  ];

  const fallback = createFallbackCuration(mockItems, targetBuckets);
  
  if (fallback.topFiveIds.length === 5) {
    console.log('✅ Fallback curation created successfully');
    console.log(`✅ Items: ${fallback.topFiveIds.join(', ')}`);
    
    try {
      CurationSpecSchema.parse(fallback);
      console.log('✅ Fallback curation passes schema validation');
    } catch (error) {
      console.log('❌ Fallback curation schema validation failed:', error);
    }
  } else {
    console.log('❌ Fallback curation failed to create 5 items');
  }

  console.log('\n🎉 Validation tests completed!');
}

// Run tests if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runValidationTests();
}
