#!/usr/bin/env tsx
/**
 * Simple Claude API Test
 * Tests if Claude can generate a basic JSON response
 */

import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { getLLMProvider } from '../src/services/llm/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../.env') });

async function testClaudeSimple() {
  console.log('🤖 Testing Claude with simple request...');
  
  try {
    const llm = getLLMProvider();
    
    // Import zod for simple schema
    const { z } = await import('zod');
    
    const simpleSchema = z.object({
      message: z.string(),
      success: z.boolean()
    });
    
    const result = await llm.completeJSON({
      system: "You are a helpful assistant. Respond with valid JSON only.",
      user: "Generate a simple test response with message 'Hello from Claude!' and success true",
      schema: simpleSchema,
      maxTokens: 50
    });
    
    if (result.ok) {
      console.log('✅ Claude working!');
      console.log('Response:', result.data);
      return true;
    } else {
      console.log('❌ Claude failed:', result.error);
      return false;
    }
  } catch (error) {
    console.log('❌ Error:', error instanceof Error ? error.message : error);
    return false;
  }
}

async function main() {
  const success = await testClaudeSimple();
  
  if (success) {
    console.log('\n🎉 Claude API is working! The timeout might be due to complex requests.');
    console.log('💡 Try reducing the ontology proposal complexity or check network connection.');
  } else {
    console.log('\n⚠️ Claude API has issues. Check your API key and network connection.');
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}
