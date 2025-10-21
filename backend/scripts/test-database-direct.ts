/**
 * Test Direct Database Access
 * 
 * Tests the database service without MCP (direct PostgreSQL queries)
 */

import dotenv from 'dotenv';
import { 
  searchActivities, 
  getVenuesForActivity, 
  getDatabaseStats,
  getActivityById,
  searchByKeyword
} from '../src/services/database/mcpDatabase.js';

dotenv.config();

async function main() {
  console.log('🧪 Testing Direct Database Access\n');

  // Test 1: Database Stats
  console.log('📊 Test 1: Database Statistics');
  try {
    const stats = await getDatabaseStats();
    console.log('✅ Stats retrieved:');
    console.log(`   Total Activities: ${stats.totalActivities}`);
    console.log(`   Total Venues: ${stats.totalVenues}`);
    console.log(`   Categories: ${stats.categoryCounts.map(c => c.category).join(', ')}`);
    console.log(`   Top regions: ${stats.regionCounts.slice(0, 5).map(r => `${r.region} (${r.count})`).join(', ')}`);
  } catch (error) {
    console.error('❌ Stats error:', error);
  }

  console.log('\n' + '='.repeat(60) + '\n');

  // Test 2: Search Wellness Activities
  console.log('🧘 Test 2: Search Wellness Activities');
  try {
    const activities = await searchActivities({
      category: 'wellness',
      limit: 3
    });
    
    console.log(`✅ Found ${activities.length} wellness activities:`);
    activities.forEach(activity => {
      console.log(`   - ${activity.name} (${activity.region})`);
      console.log(`     Energy: ${activity.energy_level}, Indoor/Outdoor: ${activity.indoor_outdoor}`);
    });
  } catch (error) {
    console.error('❌ Search error:', error);
  }

  console.log('\n' + '='.repeat(60) + '\n');

  // Test 3: Get Activity by ID
  console.log('🔍 Test 3: Get Activity by ID');
  try {
    const activity = await getActivityById(1);
    if (activity) {
      console.log('✅ Activity found:');
      console.log(`   Name: ${activity.name}`);
      console.log(`   Category: ${activity.category}`);
      console.log(`   Description: ${activity.description}`);
      console.log(`   Tags: ${activity.tags.slice(0, 5).join(', ')}`);
    } else {
      console.log('❌ Activity not found');
    }
  } catch (error) {
    console.error('❌ Get activity error:', error);
  }

  console.log('\n' + '='.repeat(60) + '\n');

  // Test 4: Get Venues for Activity
  console.log('📍 Test 4: Get Venues for Activity #1');
  try {
    const venues = await getVenuesForActivity(1);
    console.log(`✅ Found ${venues.length} venues:`);
    venues.forEach(venue => {
      console.log(`   - ${venue.name}`);
      console.log(`     City: ${venue.city}, Region: ${venue.region}`);
      console.log(`     Price: ${venue.price_tier}${venue.rating ? `, Rating: ${venue.rating}⭐` : ''}`);
    });
  } catch (error) {
    console.error('❌ Venues error:', error);
  }

  console.log('\n' + '='.repeat(60) + '\n');

  // Test 5: Search by Keyword
  console.log('🔎 Test 5: Search by Keyword "climbing"');
  try {
    const activities = await searchByKeyword('climbing', 5);
    console.log(`✅ Found ${activities.length} activities matching "climbing":`);
    activities.forEach(activity => {
      console.log(`   - ${activity.name} (${activity.category})`);
    });
  } catch (error) {
    console.error('❌ Keyword search error:', error);
  }

  console.log('\n' + '='.repeat(60) + '\n');

  // Test 6: Filter by Multiple Criteria
  console.log('🎯 Test 6: Filter Activities (outdoor + high energy + București)');
  try {
    const activities = await searchActivities({
      indoorOutdoor: 'outdoor',
      energyLevel: 'high',
      region: 'București',
      limit: 5
    });
    
    console.log(`✅ Found ${activities.length} matching activities:`);
    activities.forEach(activity => {
      console.log(`   - ${activity.name}`);
      console.log(`     Category: ${activity.category}, Energy: ${activity.energy_level}`);
    });
  } catch (error) {
    console.error('❌ Filter error:', error);
  }

  console.log('\n✨ Database Testing Complete\n');
  process.exit(0);
}

main().catch((error) => {
  console.error('💥 Test failed:', error);
  process.exit(1);
});
