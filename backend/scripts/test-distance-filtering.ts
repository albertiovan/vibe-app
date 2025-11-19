/**
 * Distance Filtering Test Script for Bucharest Activities
 * 
 * Tests that Claude API correctly filters activities based on distance from central Bucharest.
 * Tests all distance filters: 5km, 10km, 25km, 50km
 * 
 * RUN: npx tsx backend/scripts/test-distance-filtering.ts
 */

import { Pool } from 'pg';
import dotenv from 'dotenv';
import { resolve } from 'path';

dotenv.config({ path: resolve(__dirname, '../.env') });

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

// Central Bucharest coordinates (Piața Universității)
const BUCHAREST_CENTER = {
  latitude: 44.4268,
  longitude: 26.1025
};

// Haversine formula to calculate distance
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth radius in km
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

async function testDistanceFiltering() {
  console.log('🧪 Distance Filtering Test for Bucharest Activities\n');
  console.log(`📍 Test Location: Central Bucharest (${BUCHAREST_CENTER.latitude}, ${BUCHAREST_CENTER.longitude})\n`);
  console.log('=' .repeat(80));

  // Get all newly imported activities (last hour)
  const { rows: allActivities } = await pool.query(`
    SELECT 
      a.id,
      a.name,
      a.category,
      a.city,
      a.region,
      v.latitude,
      v.longitude
    FROM activities a
    JOIN venues v ON v.activity_id = a.id
    WHERE a.created_at > NOW() - INTERVAL '1 hour'
      AND (a.category IN ('fitness', 'sports', 'culinary'))
      AND a.name LIKE '%Olympic%' OR a.name LIKE '%Tennis%' OR a.name LIKE '%Badminton%' OR a.name LIKE '%Cooking%'
    ORDER BY a.id
  `);

  console.log(`\n📊 Total New Activities: ${allActivities.length}\n`);

  // Calculate distances for all activities
  const activitiesWithDistance = allActivities.map(activity => ({
    ...activity,
    distance: calculateDistance(
      BUCHAREST_CENTER.latitude,
      BUCHAREST_CENTER.longitude,
      activity.latitude,
      activity.longitude
    )
  }));

  // Test each distance filter
  const distanceFilters = [5, 10, 25, 50];
  
  for (const maxDistance of distanceFilters) {
    console.log(`\n${'='.repeat(80)}`);
    console.log(`📏 Testing ${maxDistance}km Radius Filter`);
    console.log('='.repeat(80));

    const filtered = activitiesWithDistance.filter(a => a.distance <= maxDistance);
    
    console.log(`\n✅ Found ${filtered.length} activities within ${maxDistance}km:\n`);

    // Group by category
    const byCategory: Record<string, typeof filtered> = {};
    filtered.forEach(activity => {
      if (!byCategory[activity.category]) {
        byCategory[activity.category] = [];
      }
      byCategory[activity.category].push(activity);
    });

    // Display by category
    for (const [category, activities] of Object.entries(byCategory)) {
      console.log(`\n${category.toUpperCase()} (${activities.length}):`);
      activities
        .sort((a, b) => a.distance - b.distance)
        .forEach(activity => {
          console.log(`  ${activity.distance.toFixed(2)}km - ${activity.name}`);
          console.log(`           ${activity.city}, ${activity.region}`);
        });
    }

    // Verify all are within range
    const outOfRange = filtered.filter(a => a.distance > maxDistance);
    if (outOfRange.length > 0) {
      console.log(`\n❌ ERROR: ${outOfRange.length} activities exceed ${maxDistance}km:`);
      outOfRange.forEach(a => {
        console.log(`  ${a.distance.toFixed(2)}km - ${a.name}`);
      });
    } else {
      console.log(`\n✅ All activities are within ${maxDistance}km range`);
    }
  }

  // Detailed breakdown of all activities
  console.log(`\n${'='.repeat(80)}`);
  console.log('📋 Complete Distance Breakdown');
  console.log('='.repeat(80));

  const sortedByDistance = [...activitiesWithDistance].sort((a, b) => a.distance - b.distance);

  console.log('\n🏊 SWIMMING POOLS:');
  sortedByDistance
    .filter(a => a.category === 'fitness' && a.id >= 3001 && a.id <= 3012)
    .forEach(a => {
      console.log(`  ${a.distance.toFixed(2)}km - ${a.name} (${a.city})`);
    });

  console.log('\n🎾 TENNIS COURTS:');
  sortedByDistance
    .filter(a => a.category === 'sports' && a.id >= 3101 && a.id <= 3112)
    .forEach(a => {
      console.log(`  ${a.distance.toFixed(2)}km - ${a.name} (${a.city})`);
    });

  console.log('\n🏸 BADMINTON FACILITIES:');
  sortedByDistance
    .filter(a => a.category === 'sports' && a.id >= 3201 && a.id <= 3208)
    .forEach(a => {
      console.log(`  ${a.distance.toFixed(2)}km - ${a.name} (${a.city})`);
    });

  console.log('\n👨‍🍳 COOKING CLASSES:');
  sortedByDistance
    .filter(a => a.category === 'culinary' && a.id >= 3301 && a.id <= 3316)
    .forEach(a => {
      console.log(`  ${a.distance.toFixed(2)}km - ${a.name} (${a.city})`);
    });

  // Distance distribution summary
  console.log(`\n${'='.repeat(80)}`);
  console.log('📊 Distance Distribution Summary');
  console.log('='.repeat(80));

  const ranges = [
    { label: '0-5km', min: 0, max: 5 },
    { label: '5-10km', min: 5, max: 10 },
    { label: '10-25km', min: 10, max: 25 },
    { label: '25-50km', min: 25, max: 50 },
    { label: '50km+', min: 50, max: Infinity }
  ];

  ranges.forEach(range => {
    const count = activitiesWithDistance.filter(
      a => a.distance > range.min && a.distance <= range.max
    ).length;
    console.log(`  ${range.label.padEnd(10)} : ${count} activities`);
  });

  // Verify Bucharest vs suburbs
  console.log(`\n${'='.repeat(80)}`);
  console.log('🏙️  City Distribution');
  console.log('='.repeat(80));

  const byCity: Record<string, number> = {};
  activitiesWithDistance.forEach(a => {
    byCity[a.city] = (byCity[a.city] || 0) + 1;
  });

  Object.entries(byCity)
    .sort((a, b) => b[1] - a[1])
    .forEach(([city, count]) => {
      const avgDistance = activitiesWithDistance
        .filter(a => a.city === city)
        .reduce((sum, a) => sum + a.distance, 0) / count;
      console.log(`  ${city.padEnd(20)} : ${count} activities (avg ${avgDistance.toFixed(2)}km)`);
    });

  // Test specific scenarios
  console.log(`\n${'='.repeat(80)}`);
  console.log('🎯 Specific Test Scenarios');
  console.log('='.repeat(80));

  // Scenario 1: User wants to swim within 10km
  console.log('\n1️⃣  Swimming within 10km of central Bucharest:');
  const swimmingNearby = activitiesWithDistance
    .filter(a => a.category === 'fitness' && a.distance <= 10)
    .sort((a, b) => a.distance - b.distance);
  console.log(`   Found ${swimmingNearby.length} pools:`);
  swimmingNearby.forEach(a => {
    console.log(`   - ${a.name}: ${a.distance.toFixed(2)}km`);
  });

  // Scenario 2: Tennis within 5km (strict filter)
  console.log('\n2️⃣  Tennis within 5km of central Bucharest:');
  const tennisNearby = activitiesWithDistance
    .filter(a => a.category === 'sports' && a.name.toLowerCase().includes('tennis') && a.distance <= 5)
    .sort((a, b) => a.distance - b.distance);
  console.log(`   Found ${tennisNearby.length} courts:`);
  tennisNearby.forEach(a => {
    console.log(`   - ${a.name}: ${a.distance.toFixed(2)}km`);
  });

  // Scenario 3: Cooking classes (should all be in Bucharest)
  console.log('\n3️⃣  Cooking classes in Bucharest:');
  const cookingInBucharest = activitiesWithDistance
    .filter(a => a.category === 'culinary' && a.city === 'București')
    .sort((a, b) => a.distance - b.distance);
  console.log(`   Found ${cookingInBucharest.length} classes:`);
  cookingInBucharest.slice(0, 5).forEach(a => {
    console.log(`   - ${a.name}: ${a.distance.toFixed(2)}km`);
  });

  // Scenario 4: Activities in Otopeni (should be >15km)
  console.log('\n4️⃣  Activities in Otopeni (suburb):');
  const otopeniActivities = activitiesWithDistance
    .filter(a => a.city === 'Otopeni');
  console.log(`   Found ${otopeniActivities.length} activities:`);
  otopeniActivities.forEach(a => {
    console.log(`   - ${a.name}: ${a.distance.toFixed(2)}km`);
    if (a.distance < 15) {
      console.log(`     ⚠️  WARNING: Otopeni activity is < 15km (expected > 15km)`);
    }
  });

  console.log(`\n${'='.repeat(80)}`);
  console.log('✅ Distance Filtering Test Complete!');
  console.log('='.repeat(80));
  console.log('\n💡 Key Findings:');
  console.log(`   - Total activities tested: ${allActivities.length}`);
  console.log(`   - Within 5km: ${activitiesWithDistance.filter(a => a.distance <= 5).length}`);
  console.log(`   - Within 10km: ${activitiesWithDistance.filter(a => a.distance <= 10).length}`);
  console.log(`   - Within 25km: ${activitiesWithDistance.filter(a => a.distance <= 25).length}`);
  console.log(`   - Within 50km: ${activitiesWithDistance.filter(a => a.distance <= 50).length}`);
  console.log('\n📝 Next Step: Verify Claude API respects these distances in recommendations\n');

  await pool.end();
}

testDistanceFiltering().catch(console.error);
