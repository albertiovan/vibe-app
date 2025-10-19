#!/usr/bin/env tsx
/**
 * Comprehensive System Audit
 * 
 * Tests all claimed features to find what's actually working vs what's broken
 */

import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

async function comprehensiveSystemAudit() {
  console.log('🔍 COMPREHENSIVE SYSTEM AUDIT');
  console.log('Testing all claimed features vs reality\n');

  const testResults: any[] = [];

  // Test 1: Basic Vibe Matching
  console.log('1️⃣ TESTING: Basic Vibe Matching');
  try {
    const response = await fetch('http://localhost:3000/api/activities/search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        vibe: 'I want to try a new sport',
        location: { lat: 44.4268, lng: 26.1025 },
        filters: { durationHours: 3 }
      })
    });

    const data = await response.json();
    const topFive = data.data?.topFive || [];
    
    const sportsRelevant = topFive.filter((place: any) => 
      place.types?.includes('gym') || 
      place.name?.toLowerCase().includes('gym') ||
      place.name?.toLowerCase().includes('fitness') ||
      place.name?.toLowerCase().includes('sport')
    ).length;

    const result = {
      test: 'Vibe Matching (Sports)',
      claimed: 'Returns relevant sports venues for sports vibes',
      actual: `${sportsRelevant}/5 results are sports-related`,
      status: sportsRelevant >= 3 ? '✅ PASS' : '❌ FAIL',
      details: topFive.map((p: any) => ({ name: p.name, types: p.types?.slice(0, 2) }))
    };
    testResults.push(result);
    console.log(`   ${result.status}: ${result.actual}`);
  } catch (error) {
    testResults.push({
      test: 'Vibe Matching (Sports)',
      status: '❌ ERROR',
      actual: `Error: ${error}`
    });
    console.log(`   ❌ ERROR: ${error}`);
  }

  // Test 2: Diversity Selection
  console.log('\n2️⃣ TESTING: Top-5 Diversity');
  try {
    const response = await fetch('http://localhost:3000/api/activities/search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        vibe: 'I want diverse activities',
        location: { lat: 44.4268, lng: 26.1025 },
        filters: { durationHours: 4 }
      })
    });

    const data = await response.json();
    const topFive = data.data?.topFive || [];
    const buckets = topFive.map((p: any) => p.bucket || p.category);
    const uniqueBuckets = new Set(buckets).size;

    const result = {
      test: 'Top-5 Diversity',
      claimed: 'Guarantees 5 distinct activity buckets',
      actual: `${uniqueBuckets}/5 unique buckets: ${Array.from(new Set(buckets)).join(', ')}`,
      status: uniqueBuckets >= 4 ? '✅ PASS' : '❌ FAIL'
    };
    testResults.push(result);
    console.log(`   ${result.status}: ${result.actual}`);
  } catch (error) {
    testResults.push({
      test: 'Top-5 Diversity',
      status: '❌ ERROR',
      actual: `Error: ${error}`
    });
    console.log(`   ❌ ERROR: ${error}`);
  }

  // Test 3: Feasibility Ranking
  console.log('\n3️⃣ TESTING: Feasibility Ranking');
  try {
    const response = await fetch('http://localhost:3000/api/activities/search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        vibe: 'popular restaurants',
        location: { lat: 44.4268, lng: 26.1025 },
        filters: { durationHours: 2 }
      })
    });

    const data = await response.json();
    const topFive = data.data?.topFive || [];
    const avgRating = topFive.reduce((sum: number, p: any) => sum + (p.rating || 0), 0) / topFive.length;
    const withRatings = topFive.filter((p: any) => p.rating && p.rating > 0).length;

    const result = {
      test: 'Feasibility Ranking',
      claimed: 'Prioritizes high-rated, popular venues',
      actual: `${withRatings}/5 have ratings, avg: ${avgRating.toFixed(1)}★`,
      status: avgRating >= 4.0 && withRatings >= 3 ? '✅ PASS' : '❌ FAIL'
    };
    testResults.push(result);
    console.log(`   ${result.status}: ${result.actual}`);
  } catch (error) {
    testResults.push({
      test: 'Feasibility Ranking',
      status: '❌ ERROR',
      actual: `Error: ${error}`
    });
    console.log(`   ❌ ERROR: ${error}`);
  }

  // Test 4: Day-Trip Multi-Region
  console.log('\n4️⃣ TESTING: Day-Trip Multi-Region');
  try {
    const response = await fetch('http://localhost:3000/api/activities/search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        vibe: 'mountain adventure',
        location: { lat: 44.4268, lng: 26.1025 },
        filters: { durationHours: 10, willingToTravel: true }
      })
    });

    const data = await response.json();
    const topFive = data.data?.topFive || [];
    
    // Calculate distances from Bucharest
    const bucharest = { lat: 44.4268, lng: 26.1025 };
    const distances = topFive.map((place: any) => {
      if (place.location?.lat && place.location?.lng) {
        const R = 6371;
        const dLat = (place.location.lat - bucharest.lat) * Math.PI / 180;
        const dLng = (place.location.lng - bucharest.lng) * Math.PI / 180;
        const a = Math.sin(dLat/2) * Math.sin(dLat/2) + Math.cos(bucharest.lat * Math.PI / 180) * Math.cos(place.location.lat * Math.PI / 180) * Math.sin(dLng/2) * Math.sin(dLng/2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        return R * c;
      }
      return 0;
    });

    const maxDistance = Math.max(...distances);
    const longDistance = distances.filter(d => d > 100).length;

    const result = {
      test: 'Day-Trip Multi-Region',
      claimed: 'Extends to 250km, includes Brașov/Sinaia',
      actual: `Max distance: ${Math.round(maxDistance)}km, ${longDistance}/5 results >100km`,
      status: maxDistance >= 150 && longDistance >= 1 ? '✅ PASS' : '❌ FAIL'
    };
    testResults.push(result);
    console.log(`   ${result.status}: ${result.actual}`);
  } catch (error) {
    testResults.push({
      test: 'Day-Trip Multi-Region',
      status: '❌ ERROR',
      actual: `Error: ${error}`
    });
    console.log(`   ❌ ERROR: ${error}`);
  }

  // Test 5: Venue-Specific Blurbs
  console.log('\n5️⃣ TESTING: Venue-Specific Blurbs');
  try {
    const response = await fetch('http://localhost:3000/api/activities/search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        vibe: 'museums and culture',
        location: { lat: 44.4268, lng: 26.1025 },
        filters: { durationHours: 3 }
      })
    });

    const data = await response.json();
    const topFive = data.data?.topFive || [];
    const withBlurbs = topFive.filter((p: any) => p.blurb && p.blurb.length > 10).length;
    const uniqueBlurbs = new Set(topFive.map((p: any) => p.blurb)).size;

    const result = {
      test: 'Venue-Specific Blurbs',
      claimed: 'Unique, factual blurbs ≤22 words each',
      actual: `${withBlurbs}/5 have blurbs, ${uniqueBlurbs}/5 unique`,
      status: withBlurbs >= 4 && uniqueBlurbs >= 4 ? '✅ PASS' : '❌ FAIL'
    };
    testResults.push(result);
    console.log(`   ${result.status}: ${result.actual}`);
  } catch (error) {
    testResults.push({
      test: 'Venue-Specific Blurbs',
      status: '❌ ERROR',
      actual: `Error: ${error}`
    });
    console.log(`   ❌ ERROR: ${error}`);
  }

  // Test 6: Google Maps Integration
  console.log('\n6️⃣ TESTING: Google Maps Integration');
  try {
    const response = await fetch('http://localhost:3000/api/activities/search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        vibe: 'restaurants',
        location: { lat: 44.4268, lng: 26.1025 },
        filters: { durationHours: 2 }
      })
    });

    const data = await response.json();
    const topFive = data.data?.topFive || [];
    const withMapsUrl = topFive.filter((p: any) => p.mapsUrl && p.mapsUrl.includes('google.com/maps')).length;
    const withImages = topFive.filter((p: any) => p.imageUrl).length;

    const result = {
      test: 'Google Maps Integration',
      claimed: 'Maps URLs and images for all venues',
      actual: `${withMapsUrl}/5 have Maps URLs, ${withImages}/5 have images`,
      status: withMapsUrl >= 4 && withImages >= 3 ? '✅ PASS' : '❌ FAIL'
    };
    testResults.push(result);
    console.log(`   ${result.status}: ${result.actual}`);
  } catch (error) {
    testResults.push({
      test: 'Google Maps Integration',
      status: '❌ ERROR',
      actual: `Error: ${error}`
    });
    console.log(`   ❌ ERROR: ${error}`);
  }

  // Summary
  console.log('\n📊 AUDIT SUMMARY:');
  console.log('================');
  
  const passed = testResults.filter(r => r.status.includes('✅')).length;
  const failed = testResults.filter(r => r.status.includes('❌')).length;
  const total = testResults.length;

  console.log(`\n🎯 OVERALL SCORE: ${passed}/${total} tests passed (${Math.round(passed/total*100)}%)`);
  
  if (passed < total * 0.7) {
    console.log('\n🚨 CRITICAL ISSUES FOUND:');
    console.log('The system is NOT working as claimed!');
  } else if (passed < total) {
    console.log('\n⚠️ SOME ISSUES FOUND:');
    console.log('The system partially works but needs fixes');
  } else {
    console.log('\n✅ ALL SYSTEMS WORKING:');
    console.log('The system works as claimed');
  }

  console.log('\n📋 DETAILED RESULTS:');
  testResults.forEach((result, index) => {
    console.log(`\n${index + 1}. ${result.test}: ${result.status}`);
    console.log(`   Claimed: ${result.claimed}`);
    console.log(`   Actual: ${result.actual}`);
    if (result.details) {
      console.log(`   Sample: ${JSON.stringify(result.details.slice(0, 2), null, 2)}`);
    }
  });

  console.log('\n🔧 PRIORITY FIXES NEEDED:');
  const failedTests = testResults.filter(r => r.status.includes('❌'));
  if (failedTests.length > 0) {
    failedTests.forEach((test, index) => {
      console.log(`   ${index + 1}. Fix ${test.test}: ${test.actual}`);
    });
  } else {
    console.log('   ✅ No critical fixes needed');
  }

  console.log('\n🎯 CONCLUSION:');
  if (failed > 0) {
    console.log(`   The user's complaint is VALID - ${failed} major features are broken!`);
    console.log(`   We need to fix these issues before claiming the system works.`);
  } else {
    console.log(`   The system is working as claimed - user issue might be elsewhere.`);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  comprehensiveSystemAudit().catch(console.error);
}
