/**
 * Test Semantic Vibe Analysis
 * 
 * Run: npx tsx backend/scripts/test-semantic-vibe-analysis.ts
 */

import { getMCPRecommendations } from '../src/services/llm/mcpClaudeRecommender.js';

const TEST_VIBES = [
  {
    name: 'Direct sports request',
    vibe: 'I want sports',
    expectedCategories: ['sports', 'fitness'],
    expectedEnergy: 'medium-high'
  },
  {
    name: 'Lego nostalgia (DEEP TEST)',
    vibe: 'I miss legos',
    expectedCategories: ['creative', 'learning'],
    expectedKeywords: ['building', 'making', 'hands-on', 'physical', 'craft']
  },
  {
    name: 'High energy fitness',
    vibe: 'I need an intense workout to blow off steam',
    expectedCategories: ['fitness', 'sports'],
    expectedEnergy: 'high'
  },
  {
    name: 'Relaxation after work',
    vibe: 'Just finished a long day, need to unwind',
    expectedCategories: ['wellness', 'mindfulness'],
    expectedEnergy: 'low'
  },
  {
    name: 'Creative exploration',
    vibe: 'I want to make something beautiful with my hands',
    expectedCategories: ['creative'],
    expectedKeywords: ['pottery', 'painting', 'craft', 'art']
  }
];

async function runTests() {
  console.log('🧪 Testing Semantic Vibe Analysis System\n');
  console.log('═'.repeat(80));
  
  for (const test of TEST_VIBES) {
    console.log(`\n\n📝 TEST: ${test.name}`);
    console.log(`   Vibe: "${test.vibe}"`);
    console.log('─'.repeat(80));
    
    try {
      const startTime = Date.now();
      
      const result = await getMCPRecommendations({
        vibe: test.vibe,
        city: 'Bucharest'
      });
      
      const duration = Date.now() - startTime;
      
      console.log(`\n✅ Success! (${duration}ms)`);
      console.log(`\n🎯 Recommendations (${result.ideas.length}):`);
      
      const categories = new Set<string>();
      
      result.ideas.forEach((idea, i) => {
        categories.add(idea.bucket);
        console.log(`\n   ${i + 1}. ${idea.name}`);
        console.log(`      Category: ${idea.bucket}`);
        console.log(`      Region: ${idea.region}`);
        if (idea.venues.length > 0) {
          console.log(`      Venues: ${idea.venues.map(v => v.name).join(', ')}`);
        }
      });
      
      console.log(`\n📊 Analysis:`);
      console.log(`   Categories returned: ${Array.from(categories).join(', ')}`);
      console.log(`   Expected categories: ${test.expectedCategories.join(', ')}`);
      
      const hasExpectedCategory = test.expectedCategories.some(cat => categories.has(cat));
      
      if (hasExpectedCategory) {
        console.log(`   ✅ PASS: Found expected category`);
      } else {
        console.log(`   ❌ FAIL: No expected categories found`);
      }
      
    } catch (error: any) {
      console.log(`\n❌ ERROR: ${error.message}`);
      console.error(error);
    }
    
    console.log('─'.repeat(80));
  }
  
  console.log('\n\n═'.repeat(80));
  console.log('🎉 Testing complete!\n');
}

// Run tests
runTests()
  .then(() => process.exit(0))
  .catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
