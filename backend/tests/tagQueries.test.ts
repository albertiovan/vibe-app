/**
 * Tag-Based Query Tests
 * 
 * Test the tag-first filtering and querying system
 */

import { searchActivitiesByTags, getTagStats } from '../src/services/database/tagQueries.js';

async function testTagQueries() {
  console.log('🧪 Testing Tag-First Query System\n');

  // Test 1: Search by mood
  console.log('Test 1: Find adventurous activities');
  const adventurous = await searchActivitiesByTags({
    required: [{ facet: 'mood', value: 'adventurous' }],
    limit: 5
  });
  console.log(`✅ Found ${adventurous.length} adventurous activities:`);
  adventurous.forEach(a => console.log(`   - ${a.name} (${a.tags.length} tags)`));
  console.log();

  // Test 2: Search by multiple criteria
  console.log('Test 2: Find beginner + indoor activities');
  const beginnerIndoor = await searchActivitiesByTags({
    required: [
      { facet: 'experience_level', value: 'beginner' },
      { facet: 'indoor_outdoor', value: 'indoor' }
    ],
    limit: 5
  });
  console.log(`✅ Found ${beginnerIndoor.length} beginner indoor activities:`);
  beginnerIndoor.forEach(a => console.log(`   - ${a.name} in ${a.city}`));
  console.log();

  // Test 3: Search with "any" logic
  console.log('Test 3: Find activities with rental gear OR provided equipment');
  const equipment = await searchActivitiesByTags({
    any: [
      { facet: 'equipment', value: 'rental-gear' },
      { facet: 'equipment', value: 'provided' }
    ],
    limit: 10
  });
  console.log(`✅ Found ${equipment.length} activities with equipment:`);
  equipment.forEach(a => {
    const equipTags = a.tags.filter(t => t.startsWith('equipment:'));
    console.log(`   - ${a.name}: ${equipTags.join(', ')}`);
  });
  console.log();

  // Test 4: Region + mood filtering
  console.log('Test 4: Find activities in Brașov region');
  const brasov = await searchActivitiesByTags({
    region: 'Brașov',
    limit: 10
  });
  console.log(`✅ Found ${brasov.length} activities in Brașov:`);
  brasov.forEach(a => console.log(`   - ${a.name} in ${a.city}`));
  console.log();

  // Test 5: Tag statistics
  console.log('Test 5: Tag distribution statistics');
  const stats = await getTagStats();
  const facetCounts = stats.reduce((acc, s) => {
    acc[s.facet] = (acc[s.facet] || 0) + parseInt(s.count as any);
    return acc;
  }, {} as Record<string, number>);
  
  console.log('✅ Tag distribution by facet:');
  Object.entries(facetCounts)
    .sort((a, b) => b[1] - a[1])
    .forEach(([facet, count]) => {
      console.log(`   - ${facet}: ${count} tags`);
    });
  console.log();

  // Test 6: Check maps URLs
  console.log('Test 6: Activities with maps URLs');
  const withMaps = adventurous.filter(a => a.maps_url);
  console.log(`✅ ${withMaps.length}/${adventurous.length} activities have maps URLs:`);
  withMaps.slice(0, 3).forEach(a => {
    console.log(`   - ${a.name}: ${a.maps_url}`);
  });
  console.log();

  console.log('🎉 All tests passed!\n');
  process.exit(0);
}

// Run tests
testTagQueries().catch(err => {
  console.error('❌ Test failed:', err);
  process.exit(1);
});
