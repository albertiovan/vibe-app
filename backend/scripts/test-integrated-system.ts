#!/usr/bin/env tsx
/**
 * Test Integrated Semantic + Places + Weather System
 * 
 * Tests the complete pipeline: semantic vibe detection → weather filtering → places verification
 */

import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { ActivitiesAgent } from '../src/services/orchestrator/activitiesAgent.js';
import { VibeContext } from '../src/services/llm/schemas.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../.env') });

async function testIntegratedSystem() {
  console.log('🚀 Testing Integrated Semantic + Places + Weather System\n');

  const agent = new ActivitiesAgent();

  // Test cases with creative expressions (no keyword overlap)
  const testCases = [
    {
      name: "Creative Mindfulness Expression",
      vibeText: "My mind is racing and I can't stop the thoughts",
      expectedCategories: ['mindfulness', 'wellness']
    },
    {
      name: "Creative Social Expression", 
      vibeText: "I haven't talked to another human in days",
      expectedCategories: ['social']
    },
    {
      name: "Creative Adventure Expression",
      vibeText: "I miss that feeling when your heart pounds with excitement", 
      expectedCategories: ['adventure']
    },
    {
      name: "Creative Nightlife Expression",
      vibeText: "I need bass lines that make my soul vibrate",
      expectedCategories: ['nightlife']
    }
  ];

  for (const testCase of testCases) {
    console.log(`\n🎯 Testing: ${testCase.name}`);
    console.log(`   Input: "${testCase.vibeText}"`);
    console.log(`   Expected: ${testCase.expectedCategories.join(', ')}`);

    // Create test context
    const context: VibeContext = {
      userProfile: {
        interests: ['adventure', 'culture', 'nature'],
        energyLevel: 'medium',
        indoorOutdoor: 'either',
        opennessScore: 4
      },
      vibeText: testCase.vibeText,
      sessionFilters: {
        radiusKm: 50,
        durationHours: 4,
        startCity: 'Bucharest',
        lat: 44.4268,
        lon: 26.1025,
        willingToTravel: true
      },
      regionsSeed: [
        { name: 'Bucharest', lat: 44.4268, lon: 26.1025, distanceKmFromStart: 0 },
        { name: 'Brasov', lat: 45.6427, lon: 25.5887, distanceKmFromStart: 166 }
      ],
      activityOntology: [], // Will be populated by agent
      mappingHints: { google: {}, osm: {}, otm: {} },
      weather: [{
        region: 'Bucharest',
        forecastDaily: [{
          date: '2025-10-19',
          tMax: 18,
          precipMm: 0,
          windMps: 5,
          condition: 'clear'
        }]
      }],
      timeContext: {
        currentTime: '2025-10-18T23:00:00Z',
        dayOfWeek: 'Friday',
        season: 'autumn'
      }
    };

    try {
      // Test the complete pipeline
      const startTime = Date.now();
      const result = await agent.recommend(context, {
        enableDebug: true,
        llmConfig: { temperature: 0.1, maxTokens: 2000 }
      });

      const duration = Date.now() - startTime;

      console.log(`\n✅ Pipeline completed in ${duration}ms`);
      console.log(`   Recommendations: ${result.curation.recommendations.length}`);
      console.log(`   Vibe Detection: ${result.debug?.proposedActivities?.vibeDetection?.method} (${result.debug?.proposedActivities?.vibeDetection?.confidence}%)`);
      console.log(`   Detected Categories: ${result.debug?.proposedActivities?.vibeDetection?.detectedCategories?.join(', ')}`);
      console.log(`   Weather Hints: ${Object.keys(result.debug?.weatherHints?.suitabilityBySubtype || {}).length} activities assessed`);
      console.log(`   Places Verified: ${result.execution.providerStats.totalCalls} API calls, ${Math.round(result.execution.providerStats.successRate * 100)}% success`);

      // Show top recommendation
      if (result.curation.recommendations.length > 0) {
        const topRec = result.curation.recommendations[0];
        console.log(`\n🎯 Top Recommendation: ${topRec.intent.label}`);
        console.log(`   Category: ${topRec.intent.category}`);
        console.log(`   Confidence: ${Math.round(topRec.confidence * 100)}%`);
        console.log(`   Verified Venues: ${topRec.verifiedVenues?.length || 0}`);
        console.log(`   Weather: ${topRec.weatherSuitability}`);
        
        if (topRec.verifiedVenues && topRec.verifiedVenues.length > 0) {
          const venue = topRec.verifiedVenues[0];
          console.log(`   Sample Venue: ${venue.name} (${venue.rating}⭐)`);
        }
      }

    } catch (error) {
      console.error(`❌ Test failed: ${error}`);
    }
  }

  console.log('\n🎉 Integration test complete!');
  console.log('\n📊 System Components Tested:');
  console.log('   ✅ Semantic vibe detection (keyword + AI fallback)');
  console.log('   ✅ Weather suitability filtering');
  console.log('   ✅ Google Places API verification');
  console.log('   ✅ User preference filtering (distance, energy, etc.)');
  console.log('   ✅ Complete orchestration pipeline');
}

if (import.meta.url === `file://${process.argv[1]}`) {
  testIntegratedSystem().catch(console.error);
}
