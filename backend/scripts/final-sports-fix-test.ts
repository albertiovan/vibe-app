#!/usr/bin/env tsx
/**
 * Final Sports Fix Test
 * 
 * Comprehensive test to validate that sports vibes return actual sports venues
 */

import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

async function finalSportsFixTest() {
  console.log('🏃‍♂️ FINAL SPORTS FIX TEST\n');

  // Test the exact vibe from the user's complaint
  const userVibe = "I want to try a new sport";
  
  console.log(`🎯 Testing user's exact vibe: "${userVibe}"`);
  console.log('   Expected: Gyms, sports facilities, fitness centers');
  console.log('   NOT Expected: Museums, parks, entertainment venues\n');

  try {
    const response = await fetch('http://localhost:3000/api/activities/search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        vibe: userVibe,
        location: { lat: 44.4268, lng: 26.1025 },
        filters: { durationHours: 3 },
        userId: 'final_sports_test'
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    const topFive = data.data?.topFive || [];
    const allPlaces = data.data?.places || [];

    console.log(`📊 Results Summary:`);
    console.log(`   Total places found: ${allPlaces.length}`);
    console.log(`   Top 5 suggestions: ${topFive.length}`);

    // Analyze each result
    console.log(`\n🔍 Detailed Analysis:`);
    
    let sportsCount = 0;
    let fitnessCount = 0;
    let irrelevantCount = 0;
    let unclearCount = 0;

    topFive.forEach((place: any, index: number) => {
      const name = place.name?.toLowerCase() || '';
      const types = place.types || [];
      const typesText = types.join(' ').toLowerCase();
      
      // Determine relevance
      let relevance = '❓ UNCLEAR';
      let category = 'unclear';
      
      // Check for sports/fitness venues
      if (types.includes('gym') || typesText.includes('fitness') || typesText.includes('sport')) {
        relevance = '🏃‍♂️ SPORTS/FITNESS';
        category = 'sports';
        sportsCount++;
      }
      // Check for health/wellness (somewhat relevant)
      else if (types.includes('health') || types.includes('spa') || typesText.includes('wellness')) {
        relevance = '💪 HEALTH/WELLNESS';
        category = 'fitness';
        fitnessCount++;
      }
      // Check for clearly irrelevant
      else if (types.includes('museum') || types.includes('restaurant') || types.includes('cafe') || 
               types.includes('bar') || types.includes('shopping_mall') || types.includes('hotel')) {
        relevance = '❌ IRRELEVANT';
        category = 'irrelevant';
        irrelevantCount++;
      }
      // Everything else is unclear
      else {
        unclearCount++;
      }

      console.log(`   ${index + 1}. ${place.name} ${relevance}`);
      console.log(`      Types: ${types.slice(0, 4).join(', ')}`);
      console.log(`      Vibe Score: ${place.vibeScore?.toFixed(2) || 'N/A'}`);
      console.log(`      Feasibility: ${place.feasibilityScore?.toFixed(2) || 'N/A'}`);
      
      if (place.vibeReasons && place.vibeReasons.length > 0) {
        console.log(`      Match Reason: ${place.vibeReasons[0]}`);
      }
      console.log('');
    });

    // Calculate success metrics
    const totalRelevant = sportsCount + fitnessCount;
    const successRate = (totalRelevant / topFive.length) * 100;
    const sportsRate = (sportsCount / topFive.length) * 100;

    console.log(`📈 Success Metrics:`);
    console.log(`   🏃‍♂️ Sports/Fitness venues: ${sportsCount}/5 (${sportsRate.toFixed(0)}%)`);
    console.log(`   💪 Health/Wellness venues: ${fitnessCount}/5 (${(fitnessCount/5*100).toFixed(0)}%)`);
    console.log(`   ✅ Total relevant: ${totalRelevant}/5 (${successRate.toFixed(0)}%)`);
    console.log(`   ❌ Irrelevant: ${irrelevantCount}/5 (${(irrelevantCount/5*100).toFixed(0)}%)`);
    console.log(`   ❓ Unclear: ${unclearCount}/5 (${(unclearCount/5*100).toFixed(0)}%)`);

    // Determine overall result
    console.log(`\n🎯 FINAL VERDICT:`);
    
    if (sportsCount >= 3) {
      console.log(`   ✅ SUCCESS: ${sportsCount}/5 results are sports/fitness venues!`);
      console.log(`   🎉 User will find relevant sports options`);
    } else if (totalRelevant >= 3) {
      console.log(`   ⚠️  PARTIAL SUCCESS: ${totalRelevant}/5 results are somewhat relevant`);
      console.log(`   🔧 Could be improved but user has some options`);
    } else {
      console.log(`   ❌ FAILURE: Only ${totalRelevant}/5 results are relevant to sports`);
      console.log(`   🚨 User complaint is valid - needs immediate fix!`);
    }

    // Check if we have actual gyms in the broader results
    const allGyms = allPlaces.filter((place: any) => 
      place.types?.includes('gym') || 
      place.name?.toLowerCase().includes('gym') ||
      place.name?.toLowerCase().includes('fitness')
    );

    console.log(`\n🏋️‍♂️ Gym Availability Check:`);
    console.log(`   Total gyms found in area: ${allGyms.length}`);
    
    if (allGyms.length > 0) {
      console.log(`   📍 Sample gyms available:`);
      allGyms.slice(0, 3).forEach((gym: any, index: number) => {
        console.log(`      ${index + 1}. ${gym.name} (${gym.rating || 'No rating'}★)`);
      });
      
      if (sportsCount === 0) {
        console.log(`   🔧 ISSUE: Gyms exist but aren't being prioritized in top 5!`);
        console.log(`   💡 SOLUTION: Improve vibe matching and feasibility ranking`);
      }
    } else {
      console.log(`   ⚠️  No gyms found in the area - this might be a data issue`);
    }

    // Recommendations
    console.log(`\n💡 RECOMMENDATIONS:`);
    
    if (sportsCount < 3) {
      console.log(`   1. 🎯 Improve vibe matching for "sport" keywords`);
      console.log(`   2. 🏋️‍♂️ Boost gym/fitness venues in feasibility ranking`);
      console.log(`   3. 📍 Ensure Google Places returns sports venues for the area`);
      console.log(`   4. 🔄 Test with different sports-related vibes`);
    } else {
      console.log(`   ✅ Sports vibe matching is working correctly!`);
      console.log(`   🎯 User should now get relevant sports suggestions`);
    }

  } catch (error) {
    console.log(`❌ Test failed with error: ${error}`);
  }

  console.log(`\n🏁 Final Sports Fix Test Complete!`);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  finalSportsFixTest().catch(console.error);
}
