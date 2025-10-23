/**
 * Test Filter System
 * Comprehensive testing of all filter combinations
 */

import { Pool } from 'pg';
import * as dotenv from 'dotenv';
import * as path from 'path';
import { 
  FilterOptions, 
  buildFilterClause, 
  filterByDistance,
  calculateDistance,
  getFilterSummary 
} from '../src/services/filters/activityFilters.js';

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://localhost/vibe_app',
});

// Bucharest city center coordinates
const BUCHAREST_CENTER = {
  latitude: 44.4268,
  longitude: 26.1025,
  name: 'Piața Universității'
};

async function testFilter(filters: FilterOptions, testName: string) {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`🧪 TEST: ${testName}`);
  console.log(`${'='.repeat(60)}`);
  
  const summary = getFilterSummary(filters);
  if (summary.length > 0) {
    console.log(`📋 Filters: ${summary.join(' | ')}`);
  }
  
  try {
    const startTime = Date.now();
    
    // Build base query
    let query = `
      SELECT a.id, a.name, a.category, a.city, a.region, 
             a.duration_min, a.duration_max, a.crowd_size, a.crowd_type,
             a.group_suitability, a.price_tier, a.latitude, a.longitude
      FROM activities a
      WHERE a.region = 'București'
    `;
    
    const params: any[] = [];
    
    // Apply filters
    const filterResult = buildFilterClause(filters, 1);
    query += filterResult.clause;
    params.push(...filterResult.params);
    
    query += ' LIMIT 50';
    
    const queryTime = Date.now();
    const { rows: activities } = await pool.query(query, params);
    const queryDuration = Date.now() - queryTime;
    
    console.log(`\n⏱️  Database query: ${queryDuration}ms`);
    console.log(`📊 Found ${activities.length} activities matching filters`);
    
    // Apply distance filtering if location provided
    let filteredActivities = activities;
    if (filters.userLatitude && filters.userLongitude) {
      const distanceTime = Date.now();
      filteredActivities = filterByDistance(
        activities,
        filters.userLatitude,
        filters.userLongitude,
        filters.maxDistanceKm || null
      );
      const distanceDuration = Date.now() - distanceTime;
      
      console.log(`📍 Distance filtering: ${distanceDuration}ms`);
      console.log(`📊 ${filteredActivities.length} activities within ${filters.maxDistanceKm || '∞'}km`);
    }
    
    const totalDuration = Date.now() - startTime;
    console.log(`⏱️  Total time: ${totalDuration}ms`);
    
    // Show sample results
    if (filteredActivities.length > 0) {
      console.log(`\n✨ Sample Results (top 5):\n`);
      filteredActivities.slice(0, 5).forEach((activity, i) => {
        console.log(`${i + 1}. ${activity.name}`);
        console.log(`   Category: ${activity.category}`);
        if (activity.distanceKm !== undefined) {
          console.log(`   Distance: ${activity.distanceKm}km away`);
        }
        console.log(`   Duration: ${activity.duration_min || '?'}-${activity.duration_max || '?'} min`);
        console.log(`   Crowd: ${activity.crowd_size} (${activity.crowd_type})`);
        console.log(`   Group: ${activity.group_suitability}`);
        console.log(`   Price: ${activity.price_tier}`);
        console.log('');
      });
    } else {
      console.log('\n⚠️  No activities matched these filters');
      console.log('💡 Try relaxing some filter constraints');
    }
    
    // Statistics
    if (filteredActivities.length > 0) {
      const avgDistance = filteredActivities
        .filter(a => a.distanceKm !== undefined)
        .reduce((sum, a) => sum + a.distanceKm, 0) / 
        filteredActivities.filter(a => a.distanceKm !== undefined).length;
      
      const categories = [...new Set(filteredActivities.map(a => a.category))];
      const crowdSizes = [...new Set(filteredActivities.map(a => a.crowd_size))];
      const priceTiers = [...new Set(filteredActivities.map(a => a.price_tier))];
      
      console.log(`📈 Statistics:`);
      if (!isNaN(avgDistance)) {
        console.log(`   Avg Distance: ${avgDistance.toFixed(1)}km`);
      }
      console.log(`   Categories: ${categories.join(', ')}`);
      console.log(`   Crowd Sizes: ${crowdSizes.join(', ')}`);
      console.log(`   Price Tiers: ${priceTiers.join(', ')}`);
    }
    
    return filteredActivities.length;
    
  } catch (error) {
    console.error('❌ Test failed:', error);
    return 0;
  }
}

async function runAllTests() {
  console.log('\n🚀 COMPREHENSIVE FILTER SYSTEM TESTING\n');
  console.log(`Testing from: ${BUCHAREST_CENTER.name}`);
  console.log(`Coordinates: ${BUCHAREST_CENTER.latitude}, ${BUCHAREST_CENTER.longitude}\n`);
  
  const results: { test: string; count: number }[] = [];
  
  // Test 1: Distance filters
  results.push({
    test: 'Distance: Nearby (< 2km)',
    count: await testFilter({
      userLatitude: BUCHAREST_CENTER.latitude,
      userLongitude: BUCHAREST_CENTER.longitude,
      maxDistanceKm: 2
    }, 'Distance: Nearby (< 2km)')
  });
  
  results.push({
    test: 'Distance: Walking (< 5km)',
    count: await testFilter({
      userLatitude: BUCHAREST_CENTER.latitude,
      userLongitude: BUCHAREST_CENTER.longitude,
      maxDistanceKm: 5
    }, 'Distance: Walking (< 5km)')
  });
  
  // Test 2: Duration filters
  results.push({
    test: 'Duration: Quick (< 1h)',
    count: await testFilter({
      durationRange: 'quick'
    }, 'Duration: Quick (< 1h)')
  });
  
  results.push({
    test: 'Duration: Medium (2-4h)',
    count: await testFilter({
      durationRange: 'medium'
    }, 'Duration: Medium (2-4h)')
  });
  
  // Test 3: Crowd preferences
  results.push({
    test: 'Crowd: Intimate & Locals',
    count: await testFilter({
      crowdSize: ['intimate', 'small'],
      crowdType: ['locals']
    }, 'Crowd: Intimate & Locals')
  });
  
  results.push({
    test: 'Crowd: Large & Mixed',
    count: await testFilter({
      crowdSize: ['large', 'massive'],
      crowdType: ['mixed', 'tourists']
    }, 'Crowd: Large & Mixed')
  });
  
  // Test 4: Group suitability
  results.push({
    test: 'Group: Solo-friendly',
    count: await testFilter({
      groupSuitability: ['solo-friendly']
    }, 'Group: Solo-friendly')
  });
  
  results.push({
    test: 'Group: Large groups',
    count: await testFilter({
      groupSuitability: ['large-group', 'any']
    }, 'Group: Large groups')
  });
  
  // Test 5: Price filters
  results.push({
    test: 'Price: Free & Budget',
    count: await testFilter({
      priceTier: ['free', 'budget']
    }, 'Price: Free & Budget')
  });
  
  results.push({
    test: 'Price: Premium & Luxury',
    count: await testFilter({
      priceTier: ['premium', 'luxury']
    }, 'Price: Premium & Luxury')
  });
  
  // Test 6: Combined filters
  results.push({
    test: 'Combined: Close + Quick + Cheap',
    count: await testFilter({
      userLatitude: BUCHAREST_CENTER.latitude,
      userLongitude: BUCHAREST_CENTER.longitude,
      maxDistanceKm: 3,
      durationRange: 'quick',
      priceTier: ['free', 'budget']
    }, 'Combined: Close + Quick + Cheap')
  });
  
  results.push({
    test: 'Combined: Close + Medium + Solo + Moderate',
    count: await testFilter({
      userLatitude: BUCHAREST_CENTER.latitude,
      userLongitude: BUCHAREST_CENTER.longitude,
      maxDistanceKm: 5,
      durationRange: 'medium',
      groupSuitability: ['solo-friendly'],
      priceTier: ['moderate']
    }, 'Combined: Close + Medium + Solo + Moderate')
  });
  
  results.push({
    test: 'Combined: Premium + Intimate + Locals',
    count: await testFilter({
      crowdSize: ['intimate', 'small'],
      crowdType: ['locals'],
      priceTier: ['premium', 'luxury']
    }, 'Combined: Premium + Intimate + Locals')
  });
  
  // Test 7: Edge cases
  results.push({
    test: 'Edge: Very restrictive (might return 0)',
    count: await testFilter({
      userLatitude: BUCHAREST_CENTER.latitude,
      userLongitude: BUCHAREST_CENTER.longitude,
      maxDistanceKm: 1,
      durationRange: 'quick',
      crowdSize: ['intimate'],
      crowdType: ['locals'],
      groupSuitability: ['solo-only'],
      priceTier: ['free']
    }, 'Edge: Very restrictive (might return 0)')
  });
  
  // Summary
  console.log(`\n${'='.repeat(60)}`);
  console.log('📊 TEST SUMMARY');
  console.log(`${'='.repeat(60)}\n`);
  
  results.forEach(r => {
    const status = r.count > 0 ? '✅' : '⚠️';
    console.log(`${status} ${r.test.padEnd(45)} ${r.count} results`);
  });
  
  const totalTests = results.length;
  const passedTests = results.filter(r => r.count > 0).length;
  
  console.log(`\n📈 Results: ${passedTests}/${totalTests} tests returned activities`);
  console.log(`\n✅ Filter system testing complete!\n`);
  
  await pool.end();
}

// Test distance calculation accuracy
async function testDistanceCalculation() {
  console.log('\n🧪 Testing Distance Calculation Accuracy\n');
  
  const testCases = [
    { 
      from: 'Piața Universității', 
      to: 'Piața Victoriei',
      lat1: 44.4268, lon1: 26.1025,
      lat2: 44.4514, lon2: 26.0839,
      expected: 3.2
    },
    { 
      from: 'Piața Universității', 
      to: 'Piața Romană',
      lat1: 44.4268, lon1: 26.1025,
      lat2: 44.4465, lon2: 26.1001,
      expected: 2.2
    },
  ];
  
  testCases.forEach(test => {
    const calculated = calculateDistance(test.lat1, test.lon1, test.lat2, test.lon2);
    const error = Math.abs(calculated - test.expected);
    const errorPercent = (error / test.expected) * 100;
    
    console.log(`📍 ${test.from} → ${test.to}`);
    console.log(`   Expected: ${test.expected}km`);
    console.log(`   Calculated: ${calculated.toFixed(2)}km`);
    console.log(`   Error: ${errorPercent.toFixed(1)}%`);
    console.log('');
  });
}

// Run tests
(async () => {
  try {
    await testDistanceCalculation();
    await runAllTests();
  } catch (error) {
    console.error('Fatal error:', error);
    process.exit(1);
  }
})();
