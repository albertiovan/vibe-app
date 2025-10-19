#!/usr/bin/env tsx
/**
 * Test API Keys and Connections
 * 
 * Quick script to verify Claude and Google Places APIs are working
 */

import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../.env') });

async function testClaudeAPI() {
  console.log('🤖 Testing Claude API...');
  
  try {
    const { getLLMProvider } = await import('../src/services/llm/index.js');
    const llm = getLLMProvider();
    
    // Import zod for schema
    const { z } = await import('zod');
    
    const testSchema = z.object({
      message: z.string()
    });
    
    const result = await llm.completeJSON({
      system: "You are a helpful assistant. Respond with valid JSON only.",
      user: "Generate a simple test object with a message field saying 'Hello from Claude!'",
      schema: testSchema,
      maxTokens: 100
    });
    
    if (result.ok) {
      console.log('✅ Claude API working!');
      console.log('Response:', result.data);
      return true;
    } else {
      console.log('❌ Claude API failed:', result.error);
      return false;
    }
  } catch (error) {
    console.log('❌ Claude API error:', error instanceof Error ? error.message : error);
    return false;
  }
}

async function testGooglePlacesAPI() {
  console.log('🗺️ Testing Google Places API...');
  
  try {
    const { Client } = await import('@googlemaps/google-maps-services-js');
    const client = new Client({});
    const apiKey = process.env.GOOGLE_MAPS_API_KEY;
    
    if (!apiKey) {
      console.log('❌ Google Maps API key not configured');
      return false;
    }
    
    // Simple nearby search test
    const response = await client.placesNearby({
      params: {
        key: apiKey,
        location: '44.4268,26.1025', // Bucharest
        radius: 1000,
        type: 'cafe'
      }
    });
    
    const results = response.data.results || [];
    console.log(`✅ Google Places API working! Found ${results.length} cafes in Bucharest`);
    
    if (results.length > 0) {
      console.log(`Sample result: ${results[0].name}`);
    }
    
    return true;
  } catch (error) {
    console.log('❌ Google Places API error:', error instanceof Error ? error.message : error);
    return false;
  }
}

async function main() {
  console.log('🔍 Testing API connections...\n');
  
  // Check environment variables
  console.log('📋 Environment check:');
  console.log(`  CLAUDE_API_KEY: ${process.env.CLAUDE_API_KEY ? '✅ Set' : '❌ Missing'}`);
  console.log(`  GOOGLE_MAPS_API_KEY: ${process.env.GOOGLE_MAPS_API_KEY ? '✅ Set' : '❌ Missing'}`);
  console.log('');
  
  const claudeWorking = await testClaudeAPI();
  console.log('');
  const googleWorking = await testGooglePlacesAPI();
  
  console.log('\n📊 Summary:');
  console.log(`  Claude API: ${claudeWorking ? '✅ Working' : '❌ Failed'}`);
  console.log(`  Google Places API: ${googleWorking ? '✅ Working' : '❌ Failed'}`);
  
  if (claudeWorking && googleWorking) {
    console.log('\n🎉 All APIs are working! You can now run the ontology expansion system.');
    console.log('\nNext steps:');
    console.log('  npm run ontology:propose');
    console.log('  npm run ontology:check proposals/latest.json --live');
  } else {
    console.log('\n⚠️ Some APIs are not working. Please check your API keys in the .env file.');
    
    if (!claudeWorking) {
      console.log('\nClaude API setup:');
      console.log('1. Get your API key from https://console.anthropic.com/');
      console.log('2. Add to .env file: CLAUDE_API_KEY=sk-ant-api03-...');
    }
    
    if (!googleWorking) {
      console.log('\nGoogle Places API setup:');
      console.log('1. Get your API key from https://console.cloud.google.com/');
      console.log('2. Enable Places API');
      console.log('3. Add to .env file: GOOGLE_MAPS_API_KEY=AIza...');
    }
    
    process.exit(1);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}
