#!/usr/bin/env tsx
/**
 * Test Sports Vibe Matching
 * 
 * Specifically tests that sports-related vibes return actual sports venues
 */

import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

async function testSportsVibe() {
  console.log('🏃 Testing Sports Vibe Matching\n');

  const sportsVibes = [
    'I want to try a new sport',
    'looking for gym and fitness',
    'tennis or basketball courts',
    'martial arts training',
    'swimming pool nearby',
    'yoga and pilates classes'
  ];

  for (const vibe of sportsVibes) {
    console.log(`🎯 Testing vibe: "${vibe}"`);

    try {
      const response = await fetch('http://localhost:3000/api/activities/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          vibe: vibe,
          location: { lat: 44.4268, lng: 26.1025 },
          filters: { durationHours: 3 },
          userId: 'sports_test_user'
        })
      });

      const data = await response.json();
      const topFive = data.data?.topFive || [];

      console.log(`   ✅ Results: ${topFive.length} suggestions`);

      // Analyze results for sports relevance
      let sportsCount = 0;
      let fitnessCount = 0;
      let irrelevantCount = 0;

      topFive.forEach((place: any, index: number) => {
        const name = place.name?.toLowerCase() || '';
        const types = (place.types || []).join(' ').toLowerCase();
        const vicinity = place.vicinity?.toLowerCase() || '';
        const allText = `${name} ${types} ${vicinity}`;

        // Check for sports/fitness keywords
        const sportsKeywords = ['gym', 'fitness', 'sport', 'tennis', 'basketball', 'football', 'swimming', 'pool', 'martial', 'karate', 'boxing', 'yoga', 'pilates', 'stadium', 'court'];
        const fitnessKeywords = ['health', 'wellness', 'spa', 'physiotherapist'];
        const irrelevantKeywords = ['museum', 'restaurant', 'cafe', 'bar', 'shop', 'mall', 'hotel'];

        const hasSports = sportsKeywords.some(keyword => allText.includes(keyword));
        const hasFitness = fitnessKeywords.some(keyword => allText.includes(keyword));
        const hasIrrelevant = irrelevantKeywords.some(keyword => allText.includes(keyword));

        if (hasSports) sportsCount++;
        else if (hasFitness) fitnessCount++;
        else if (hasIrrelevant) irrelevantCount++;

        const relevance = hasSports ? '🏃 SPORTS' : hasFitness ? '💪 FITNESS' : hasIrrelevant ? '❌ IRRELEVANT' : '❓ UNCLEAR';
        
        console.log(`      ${index + 1}. ${place.name} ${relevance}`);
        console.log(`         Types: ${place.types?.slice(0, 3).join(', ') || 'None'}`);
        console.log(`         Vibe Score: ${place.vibeScore?.toFixed(2) || 'N/A'}`);
        
        if (place.vibeReasons && place.vibeReasons.length > 0) {
          console.log(`         Match Reason: ${place.vibeReasons[0]}`);
        }
      });

      const sportsRelevance = ((sportsCount + fitnessCount) / topFive.length) * 100;
      console.log(`   📊 Sports Relevance: ${sportsCount} sports + ${fitnessCount} fitness = ${sportsRelevance.toFixed(0)}%`);
      console.log(`   ❌ Irrelevant: ${irrelevantCount}/${topFive.length} (${((irrelevantCount / topFive.length) * 100).toFixed(0)}%)`);

      // Check if vibe matching worked
      if (sportsCount === 0 && fitnessCount === 0) {
        console.log('   🚨 PROBLEM: No sports/fitness venues found for sports vibe!');
      } else if (sportsRelevance >= 60) {
        console.log('   ✅ GOOD: Majority of results are sports/fitness related');
      } else {
        console.log('   ⚠️ MIXED: Some sports venues but also irrelevant results');
      }

    } catch (error) {
      console.log(`   ❌ Error: ${error}`);
    }

    console.log('');
  }

  console.log('🏁 Sports Vibe Testing Complete!');
  console.log('');
  console.log('📋 **Expected Results for Sports Vibes:**');
  console.log('   ✅ Gyms and fitness centers');
  console.log('   ✅ Sports complexes and stadiums');
  console.log('   ✅ Swimming pools and aquatic centers');
  console.log('   ✅ Martial arts studios');
  console.log('   ✅ Tennis/basketball courts');
  console.log('   ✅ Yoga and pilates studios');
  console.log('   ❌ NOT: Museums, restaurants, entertainment venues');
}

if (import.meta.url === `file://${process.argv[1]}`) {
  testSportsVibe().catch(console.error);
}
