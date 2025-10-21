/**
 * Test MCP Recommendations
 * 
 * Tests the new MCP-based recommendation system
 */

import dotenv from 'dotenv';
import { getMCPRecommendations, testMCPConnection } from '../src/services/llm/mcpClaudeRecommender.js';

dotenv.config();

async function main() {
  console.log('🧪 Testing MCP Claude Recommender\n');
  
  // Test 1: MCP Connection
  console.log('📡 Test 1: MCP Connection');
  try {
    const connectionTest = await testMCPConnection();
    if (connectionTest.success) {
      console.log('✅ MCP connection successful');
      console.log('📊 Database stats:', JSON.stringify(connectionTest.stats, null, 2));
    } else {
      console.log('❌ MCP connection failed:', connectionTest.error);
      console.log('\n⚠️  Note: MCP requires PostgreSQL MCP server to be configured in Windsurf');
      console.log('   Claude needs direct database access through MCP tools\n');
    }
  } catch (error) {
    console.error('❌ Connection test error:', error);
  }

  console.log('\n' + '='.repeat(60) + '\n');

  // Test 2: Relaxing Activity Recommendation
  console.log('📝 Test 2: Relaxing Activity Recommendation');
  try {
    const result = await getMCPRecommendations({
      vibe: 'I want something relaxing and peaceful',
      region: 'București',
      durationHours: 3,
      indoorOutdoor: 'both'
    });
    
    console.log('✅ Recommendations received');
    console.log(`📍 Found ${result.ideas.length} activities\n`);
    
    result.ideas.forEach((idea, index) => {
      console.log(`${index + 1}. ${idea.name} (${idea.bucket})`);
      console.log(`   Region: ${idea.region}`);
      console.log(`   Venues: ${idea.venues.length}`);
      idea.venues.forEach(venue => {
        console.log(`     - ${venue.name} (${venue.city})${venue.rating ? ` ⭐ ${venue.rating}` : ''}`);
      });
      console.log('');
    });
  } catch (error) {
    console.error('❌ Recommendation error:', error);
  }

  console.log('\n' + '='.repeat(60) + '\n');

  // Test 3: Adventurous Activity Recommendation
  console.log('📝 Test 3: Adventurous Activity Recommendation');
  try {
    const result = await getMCPRecommendations({
      vibe: 'I feel adventurous and want an adrenaline rush',
      region: 'Brașov',
      energyLevel: 'high',
      indoorOutdoor: 'outdoor'
    });
    
    console.log('✅ Recommendations received');
    console.log(`📍 Found ${result.ideas.length} activities\n`);
    
    result.ideas.forEach((idea, index) => {
      console.log(`${index + 1}. ${idea.name} (${idea.bucket})`);
      console.log(`   Region: ${idea.region}`);
      console.log(`   Venues: ${idea.venues.length}`);
      idea.venues.forEach(venue => {
        console.log(`     - ${venue.name} (${venue.city})`);
      });
      console.log('');
    });
  } catch (error) {
    console.error('❌ Recommendation error:', error);
  }

  console.log('\n' + '='.repeat(60) + '\n');

  // Test 4: Cultural Experience
  console.log('📝 Test 4: Cultural Experience');
  try {
    const result = await getMCPRecommendations({
      vibe: 'I want to explore Romanian culture and history',
      city: 'Cluj-Napoca',
      durationHours: 4
    });
    
    console.log('✅ Recommendations received');
    console.log(`📍 Found ${result.ideas.length} activities\n`);
    
    result.ideas.forEach((idea, index) => {
      console.log(`${index + 1}. ${idea.name} (${idea.bucket})`);
      console.log(`   Region: ${idea.region}`);
      console.log(`   Venues: ${idea.venues.length}`);
      console.log('');
    });
  } catch (error) {
    console.error('❌ Recommendation error:', error);
  }

  console.log('\n✨ MCP Testing Complete\n');
}

main().catch(console.error);
