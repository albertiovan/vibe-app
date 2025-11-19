/**
 * Claude API Distance Understanding Test
 * 
 * Tests Claude's ability to respect distance filters across 50 different vibe queries.
 * User location: Strada Herăstrău nr. 20, București (near Herăstrău Park)
 * 
 * Distance filters tested:
 * - 10 queries with "nearby" (5km)
 * - 10 queries with "walking" (2km)
 * - 10 queries with "biking" (10km)
 * - 10 queries with "in city" (25km)
 * - 10 queries with "anywhere" (no limit)
 * 
 * RUN: npx tsx backend/scripts/test-claude-distance-understanding.ts
 */

import mcpRecommender from '../src/services/llm/mcpClaudeRecommender';
import { Pool } from 'pg';
import dotenv from 'dotenv';
import { resolve } from 'path';

dotenv.config({ path: resolve(__dirname, '../.env') });

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

// User location: Strada Herăstrău nr. 20, București (near Herăstrău Park)
const USER_LOCATION = {
  latitude: 44.4676,
  longitude: 26.0857,
  address: 'Strada Herăstrău nr. 20, București'
};

// Haversine formula
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(degrees: number): number {
  return degrees * (Math.PI / 180);
}

// Test vibes for each distance category
const TEST_VIBES = {
  nearby: [
    "I want to grab coffee and relax nearby",
    "Looking for a quick workout close by",
    "Need to buy groceries nearby",
    "Want to play tennis somewhere close",
    "Looking for a restaurant nearby for dinner",
    "Need a spa treatment close to home",
    "Want to take a walk in a park nearby",
    "Looking for badminton courts nearby",
    "Need a cooking class close by",
    "Want to swim laps somewhere nearby"
  ],
  walking: [
    "I want to walk to a café for breakfast",
    "Looking for a gym within walking distance",
    "Need a bookstore I can walk to",
    "Want to walk to a tennis court",
    "Looking for a restaurant within walking distance",
    "Need a yoga studio I can walk to",
    "Want to walk to a park",
    "Looking for a badminton place within walking distance",
    "Need a cooking workshop I can walk to",
    "Want to walk to a swimming pool"
  ],
  biking: [
    "I want to bike to a coffee shop",
    "Looking for a gym I can bike to",
    "Need a shopping area within biking distance",
    "Want to bike to play tennis",
    "Looking for a restaurant I can bike to",
    "Need a wellness center within biking distance",
    "Want to bike to a scenic spot",
    "Looking for badminton within biking distance",
    "Need a culinary class I can bike to",
    "Want to bike to a pool for swimming"
  ],
  in_city: [
    "I want to explore cafés in Bucharest",
    "Looking for the best gyms in the city",
    "Need to visit a market in Bucharest",
    "Want to play tennis somewhere in the city",
    "Looking for top restaurants in Bucharest",
    "Need a spa day somewhere in the city",
    "Want to visit parks in Bucharest",
    "Looking for badminton facilities in the city",
    "Need a professional cooking class in Bucharest",
    "Want to find Olympic pools in the city"
  ],
  anywhere: [
    "I want to try the best coffee in Romania",
    "Looking for premium fitness facilities anywhere",
    "Need unique shopping experiences",
    "Want to play tennis at top facilities",
    "Looking for Michelin-worthy restaurants",
    "Need luxury spa experiences",
    "Want to visit famous landmarks",
    "Looking for competitive badminton clubs",
    "Need professional chef training programs",
    "Want to train at Olympic swimming facilities"
  ]
};

interface TestResult {
  vibe: string;
  filter: string;
  maxDistance: number | null;
  activitiesReturned: number;
  distances: number[];
  avgDistance: number;
  maxDistanceFound: number;
  withinLimit: boolean;
  violationCount: number;
  violations: Array<{ name: string; distance: number }>;
}

async function testClaudeDistanceUnderstanding() {
  console.log('🧪 Claude API Distance Understanding Test\n');
  console.log(`📍 User Location: ${USER_LOCATION.address}`);
  console.log(`   Coordinates: ${USER_LOCATION.latitude}, ${USER_LOCATION.longitude}\n`);
  console.log('='.repeat(100));

  const results: TestResult[] = [];
  let totalTests = 0;
  let passedTests = 0;
  let failedTests = 0;

  // Test each distance category
  for (const [filterName, vibes] of Object.entries(TEST_VIBES)) {
    console.log(`\n${'='.repeat(100)}`);
    console.log(`📏 Testing: ${filterName.toUpperCase()} (${vibes.length} vibes)`);
    console.log('='.repeat(100));

    let maxDistance: number | null = null;
    switch (filterName) {
      case 'nearby': maxDistance = 5; break;
      case 'walking': maxDistance = 2; break;
      case 'biking': maxDistance = 10; break;
      case 'in_city': maxDistance = 25; break;
      case 'anywhere': maxDistance = null; break;
    }

    for (let i = 0; i < vibes.length; i++) {
      const vibe = vibes[i];
      totalTests++;

      console.log(`\n${i + 1}. "${vibe}"`);
      console.log(`   Filter: ${maxDistance ? `${maxDistance}km` : 'No limit'}`);

      try {
        // Call Claude API with distance filter
        const response = await mcpRecommender.getMCPRecommendations({
          vibe,
          filters: {
            maxDistanceKm: maxDistance ?? undefined,
            userLatitude: USER_LOCATION.latitude,
            userLongitude: USER_LOCATION.longitude
          }
        });

        if (!response.ideas || response.ideas.length === 0) {
          console.log('   ⚠️  No activities returned');
          results.push({
            vibe,
            filter: filterName,
            maxDistance,
            activitiesReturned: 0,
            distances: [],
            avgDistance: 0,
            maxDistanceFound: 0,
            withinLimit: true,
            violationCount: 0,
            violations: []
          });
          continue;
        }

        // Calculate distances for returned activities
        const distances: number[] = [];
        const violations: Array<{ name: string; distance: number }> = [];

        for (const activity of response.ideas) {
          // Get coordinates from first venue
          if (!activity.venues || activity.venues.length === 0) continue;
          
          // Query database for venue coordinates
          const venueQuery = await pool.query(
            'SELECT latitude, longitude FROM venues WHERE id = $1',
            [activity.venues[0].venueId]
          );
          
          if (venueQuery.rows.length === 0) continue;
          const venue = venueQuery.rows[0];
          
          const distance = calculateDistance(
            USER_LOCATION.latitude,
            USER_LOCATION.longitude,
            venue.latitude,
            venue.longitude
          );
          distances.push(distance);

          // Check if within limit
          if (maxDistance && distance > maxDistance) {
            violations.push({ name: activity.name, distance });
          }
        }

        const avgDistance = distances.length > 0 
          ? distances.reduce((a, b) => a + b, 0) / distances.length 
          : 0;
        const maxDistanceFound = distances.length > 0 
          ? Math.max(...distances) 
          : 0;
        const withinLimit = violations.length === 0;

        console.log(`   ✅ Returned: ${response.ideas.length} activities`);
        console.log(`   📊 Distances: avg ${avgDistance.toFixed(2)}km, max ${maxDistanceFound.toFixed(2)}km`);

        if (withinLimit) {
          console.log(`   ✅ All activities within ${maxDistance}km limit`);
          passedTests++;
        } else {
          console.log(`   ❌ ${violations.length} activities exceed ${maxDistance}km limit:`);
          violations.forEach(v => {
            console.log(`      - ${v.name}: ${v.distance.toFixed(2)}km`);
          });
          failedTests++;
        }

        results.push({
          vibe,
          filter: filterName,
          maxDistance,
          activitiesReturned: response.ideas.length,
          distances,
          avgDistance,
          maxDistanceFound,
          withinLimit,
          violationCount: violations.length,
          violations
        });

      } catch (error: any) {
        console.log(`   ❌ Error: ${error.message}`);
        failedTests++;
      }

      // Small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }

  // Generate summary report
  console.log(`\n${'='.repeat(100)}`);
  console.log('📊 TEST SUMMARY');
  console.log('='.repeat(100));

  console.log(`\nTotal Tests: ${totalTests}`);
  console.log(`✅ Passed: ${passedTests} (${((passedTests / totalTests) * 100).toFixed(1)}%)`);
  console.log(`❌ Failed: ${failedTests} (${((failedTests / totalTests) * 100).toFixed(1)}%)`);

  // Summary by filter type
  console.log(`\n${'='.repeat(100)}`);
  console.log('📈 RESULTS BY DISTANCE FILTER');
  console.log('='.repeat(100));

  for (const filterName of Object.keys(TEST_VIBES)) {
    const filterResults = results.filter(r => r.filter === filterName);
    const passed = filterResults.filter(r => r.withinLimit).length;
    const failed = filterResults.filter(r => !r.withinLimit).length;
    const avgActivities = filterResults.reduce((sum, r) => sum + r.activitiesReturned, 0) / filterResults.length;
    const avgDistance = filterResults.reduce((sum, r) => sum + r.avgDistance, 0) / filterResults.length;
    const maxDistanceLimit = filterResults[0]?.maxDistance;

    console.log(`\n${filterName.toUpperCase()} (${maxDistanceLimit ? `${maxDistanceLimit}km limit` : 'No limit'}):`);
    console.log(`  Tests: ${filterResults.length}`);
    console.log(`  Passed: ${passed} | Failed: ${failed}`);
    console.log(`  Avg activities returned: ${avgActivities.toFixed(1)}`);
    console.log(`  Avg distance: ${avgDistance.toFixed(2)}km`);

    if (failed > 0) {
      const totalViolations = filterResults.reduce((sum, r) => sum + r.violationCount, 0);
      console.log(`  ⚠️  Total violations: ${totalViolations}`);
    }
  }

  // Detailed violations report
  const allViolations = results.filter(r => r.violationCount > 0);
  if (allViolations.length > 0) {
    console.log(`\n${'='.repeat(100)}`);
    console.log('⚠️  DETAILED VIOLATIONS REPORT');
    console.log('='.repeat(100));

    for (const result of allViolations) {
      console.log(`\nVibe: "${result.vibe}"`);
      console.log(`Filter: ${result.filter} (${result.maxDistance}km limit)`);
      console.log(`Violations: ${result.violationCount}`);
      result.violations.forEach(v => {
        console.log(`  - ${v.name}: ${v.distance.toFixed(2)}km (${(v.distance - result.maxDistance!).toFixed(2)}km over)`);
      });
    }
  }

  // Distance distribution analysis
  console.log(`\n${'='.repeat(100)}`);
  console.log('📊 DISTANCE DISTRIBUTION ANALYSIS');
  console.log('='.repeat(100));

  const allDistances = results.flatMap(r => r.distances);
  const ranges = [
    { label: '0-2km', min: 0, max: 2 },
    { label: '2-5km', min: 2, max: 5 },
    { label: '5-10km', min: 5, max: 10 },
    { label: '10-25km', min: 10, max: 25 },
    { label: '25-50km', min: 25, max: 50 },
    { label: '50km+', min: 50, max: Infinity }
  ];

  console.log('\nAll activities returned across all tests:');
  ranges.forEach(range => {
    const count = allDistances.filter(d => d > range.min && d <= range.max).length;
    const percentage = (count / allDistances.length * 100).toFixed(1);
    console.log(`  ${range.label.padEnd(10)}: ${count.toString().padStart(4)} activities (${percentage}%)`);
  });

  console.log(`\n${'='.repeat(100)}`);
  console.log('✅ Test Complete!');
  console.log('='.repeat(100));

  console.log(`\n💡 Key Insights:`);
  console.log(`   - Claude ${passedTests === totalTests ? 'PERFECTLY' : 'mostly'} respects distance filters`);
  console.log(`   - Success rate: ${((passedTests / totalTests) * 100).toFixed(1)}%`);
  console.log(`   - Total activities tested: ${allDistances.length}`);
  console.log(`   - Average distance: ${(allDistances.reduce((a, b) => a + b, 0) / allDistances.length).toFixed(2)}km`);

  if (failedTests > 0) {
    console.log(`\n⚠️  Action Required:`);
    console.log(`   - Review system prompt distance instructions`);
    console.log(`   - Check if MCP query includes distance filter`);
    console.log(`   - Verify activity coordinates in database`);
  }

  await pool.end();
}

testClaudeDistanceUnderstanding().catch(console.error);
