/**
 * Quick Test: Cocktails & Pub Categorization
 * Tests the two specific issues from simulation
 */

import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Load environment variables
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, '../.env') });

import mcpRecommender from '../src/services/llm/mcpClaudeRecommender.js';

const testQueries = [
  {
    name: 'Cocktails Test',
    vibe: 'I want cocktails',
    expectedCategories: ['nightlife', 'social'],
    shouldNotError: true
  },
  {
    name: 'Pub Test',
    vibe: 'I want a pub',
    expectedCategories: ['nightlife', 'social'],
    shouldNotBe: ['culinary']
  },
  {
    name: 'Bar Test',
    vibe: 'I want to go to a bar',
    expectedCategories: ['nightlife', 'social'],
    shouldNotError: true
  }
];

async function runTests() {
  console.log('🧪 Testing Cocktails & Pub Categorization Fixes\n');
  console.log('='.repeat(80));
  
  let passed = 0;
  let failed = 0;
  
  for (const test of testQueries) {
    console.log(`\n[${test.name}] Testing: "${test.vibe}"`);
    
    try {
      const result = await mcpRecommender.getMCPRecommendations({
        vibe: test.vibe,
        city: 'Bucharest'
      });
      
      if (result.ideas.length === 0) {
        console.log('❌ FAILED: No activities returned');
        failed++;
        continue;
      }
      
      const categories = [...new Set(result.ideas.map((a: any) => a.bucket))];
      console.log(`✓ Returned ${result.ideas.length} activities`);
      console.log(`✓ Categories: ${categories.join(', ')}`);
      
      // Check expected categories
      if (test.expectedCategories) {
        const hasExpected = test.expectedCategories.some(cat => categories.includes(cat));
        if (hasExpected) {
          console.log(`✅ PASS: Contains expected category (${categories.join(', ')})`);
          passed++;
        } else {
          console.log(`❌ FAIL: Expected ${test.expectedCategories.join(' or ')}, got ${categories.join(', ')}`);
          failed++;
        }
      }
      
      // Check should not be categories
      if (test.shouldNotBe) {
        const hasUnwanted = test.shouldNotBe.some(cat => categories.includes(cat));
        if (hasUnwanted) {
          console.log(`❌ FAIL: Should not contain ${test.shouldNotBe.join(', ')}`);
          failed++;
        } else {
          console.log(`✅ PASS: Correctly avoids ${test.shouldNotBe.join(', ')}`);
        }
      }
      
      // Show top 3 activities
      console.log('\nTop 3 activities:');
      result.ideas.slice(0, 3).forEach((a: any, i: number) => {
        console.log(`  ${i + 1}. ${a.name} (${a.bucket})`);
      });
      
    } catch (error) {
      if (test.shouldNotError) {
        console.log(`❌ FAILED: Error thrown - ${error instanceof Error ? error.message : 'Unknown'}`);
        failed++;
      } else {
        console.log(`✓ Expected error occurred`);
      }
    }
  }
  
  console.log('\n' + '='.repeat(80));
  console.log(`\n📊 Results: ${passed} passed, ${failed} failed`);
  
  if (failed === 0) {
    console.log('✅ All tests passed! Cocktails & pub categorization fixed.\n');
  } else {
    console.log('❌ Some tests failed. Review the output above.\n');
  }
  
  process.exit(failed === 0 ? 0 : 1);
}

runTests().catch(error => {
  console.error('Test suite error:', error);
  process.exit(1);
});
