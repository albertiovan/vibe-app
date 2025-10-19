#!/usr/bin/env tsx
/**
 * Test Rate Limiting System
 * 
 * Tests the rate-limited LLM provider with multiple concurrent requests
 * to verify it handles rate limits gracefully.
 */

import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { rateLimitedLLM } from '../src/services/llm/rateLimitedProvider.js';
import { z } from 'zod';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../.env') });

// Simple test schema
const TestSchema = z.object({
  category: z.string(),
  confidence: z.number(),
  reasoning: z.string()
});

async function testRateLimiting() {
  console.log('🚀 Testing Rate Limited LLM Provider\n');

  const testPrompts = [
    "I want to relax and unwind",
    "I need some adventure in my life", 
    "I'm feeling creative today",
    "I want to meet new people",
    "I need to get some exercise"
  ];

  console.log(`📊 Sending ${testPrompts.length} concurrent requests to test rate limiting...\n`);

  const startTime = Date.now();
  const promises = testPrompts.map((prompt, index) => 
    rateLimitedLLM.completeJSON({
      system: "You are a vibe categorizer. Categorize the user's mood into wellness, adventure, creative, social, or fitness.",
      user: `User says: "${prompt}". Respond with JSON containing category, confidence (0-1), and reasoning.`,
      schema: TestSchema,
      maxTokens: 200,
      priority: index + 1 // Different priorities to test queue ordering
    }).then(result => ({
      prompt,
      result,
      index
    })).catch(error => ({
      prompt,
      error: error.message,
      index
    }))
  );

  try {
    const results = await Promise.all(promises);
    const totalTime = Date.now() - startTime;

    console.log(`✅ All requests completed in ${totalTime}ms\n`);

    // Show results
    results.forEach(({ prompt, result, error, index }) => {
      console.log(`🎯 Request ${index + 1}: "${prompt}"`);
      if (result?.ok) {
        console.log(`   ✅ Success: ${result.data.category} (${Math.round(result.data.confidence * 100)}%)`);
        console.log(`   💭 Reasoning: ${result.data.reasoning}`);
      } else if (result?.error) {
        console.log(`   ❌ LLM Error: ${result.error}`);
      } else if (error) {
        console.log(`   ❌ Request Error: ${error}`);
      }
      console.log('');
    });

    // Show queue status
    const queueStatus = rateLimitedLLM.getQueueStatus();
    console.log('📊 Final Queue Status:');
    console.log(`   Queue Length: ${queueStatus.queueLength}`);
    console.log(`   Is Processing: ${queueStatus.isProcessing}`);
    console.log(`   In Cooldown: ${queueStatus.inCooldown}`);
    if (queueStatus.inCooldown) {
      console.log(`   Cooldown Until: ${new Date(queueStatus.rateLimitUntil).toLocaleTimeString()}`);
    }

    // Calculate success rate
    const successCount = results.filter(r => r.result?.ok).length;
    const successRate = Math.round((successCount / results.length) * 100);
    
    console.log(`\n🎯 Results Summary:`);
    console.log(`   Success Rate: ${successRate}% (${successCount}/${results.length})`);
    console.log(`   Total Time: ${totalTime}ms`);
    console.log(`   Average Time per Request: ${Math.round(totalTime / results.length)}ms`);

    if (successRate >= 80) {
      console.log('\n🎉 Rate limiting system is working well!');
    } else {
      console.log('\n⚠️ Rate limiting system needs improvement');
    }

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Test with different scenarios
async function testRateLimitScenarios() {
  console.log('\n🧪 Testing Rate Limit Scenarios...\n');

  // Test 1: Single request (should work)
  console.log('Test 1: Single Request');
  try {
    const result = await rateLimitedLLM.completeJSON({
      system: "You are helpful.",
      user: "Say hello in JSON format with a greeting field.",
      schema: z.object({ greeting: z.string() }),
      maxTokens: 50
    });
    
    if (result.ok) {
      console.log(`✅ Single request success: ${result.data.greeting}`);
    } else {
      console.log(`❌ Single request failed: ${result.error}`);
    }
  } catch (error) {
    console.log(`❌ Single request error: ${error}`);
  }

  // Test 2: Queue status monitoring
  console.log('\nTest 2: Queue Status Monitoring');
  const status = rateLimitedLLM.getQueueStatus();
  console.log(`📊 Current Status:`, status);

  console.log('\n✅ Rate limiting tests complete!');
}

if (import.meta.url === `file://${process.argv[1]}`) {
  testRateLimiting()
    .then(() => testRateLimitScenarios())
    .catch(console.error);
}
