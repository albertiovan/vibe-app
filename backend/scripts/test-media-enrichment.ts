#!/usr/bin/env tsx
/**
 * Test Media & Enrichment APIs
 * 
 * Comprehensive testing of Unsplash, YouTube, Tavily, and Wikipedia integrations
 */

import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

async function testMediaEnrichmentAPIs() {
  console.log('🎨 TESTING MEDIA & ENRICHMENT APIS\n');

  const testActivities = [
    { name: 'Indoor climbing', category: 'sports', region: 'Bucharest, Romania' },
    { name: 'Yoga classes', category: 'wellness', region: 'Romania' },
    { name: 'Pottery workshop', category: 'creative', region: 'Bucharest' },
    { name: 'Museum visit', category: 'culture', region: 'Romania' },
    { name: 'Hiking trails', category: 'nature', region: 'Brasov, Romania' }
  ];

  let totalTests = 0;
  let passedTests = 0;

  // Test 1: System Status
  console.log('🔍 Testing System Status...');
  totalTests++;
  try {
    const response = await fetch('http://localhost:3000/api/enrichment/status');
    const data = await response.json();
    
    if (data.success) {
      console.log('✅ System status check passed');
      console.log('   Services configured:', Object.keys(data.data.services).filter(s => 
        data.data.services[s].configured
      ).join(', '));
      console.log('   Features enabled:', Object.keys(data.data.features).filter(f => 
        data.data.features[f]
      ).join(', '));
      passedTests++;
    } else {
      console.log('❌ System status check failed:', data.error);
    }
  } catch (error) {
    console.log('❌ System status check failed:', error);
  }
  console.log('');


  // Test 2: YouTube Video Search
  console.log('🎥 Testing YouTube Video Search...');
  for (const activity of testActivities.slice(0, 3)) {
    totalTests++;
    try {
      const response = await fetch('http://localhost:3000/api/enrichment/test/youtube', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          activity: activity.name,
          region: activity.region
        })
      });

      const data = await response.json();
      
      if (data.success && data.data.videos.length > 0) {
        console.log(`✅ YouTube: ${activity.name} - ${data.data.videos.length} videos found`);
        console.log(`   Sample: "${data.data.videos[0].title}" by ${data.data.videos[0].channel}`);
        console.log(`   Relevance: ${data.data.videos[0].relevanceScore.toFixed(2)}`);
        passedTests++;
      } else {
        console.log(`⚠️ YouTube: ${activity.name} - ${data.error || 'No videos found'}`);
      }
    } catch (error) {
      console.log(`❌ YouTube: ${activity.name} - ${error}`);
    }
  }
  console.log('');

  // Test 4: Wikipedia Summaries
  console.log('📚 Testing Wikipedia Summaries...');
  for (const activity of testActivities) {
    totalTests++;
    try {
      const response = await fetch('http://localhost:3000/api/enrichment/test/wikipedia', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          activity: activity.name
        })
      });

      const data = await response.json();
      
      if (data.success) {
        console.log(`✅ Wikipedia: ${activity.name} - "${data.data.summary.title}"`);
        console.log(`   Extract: ${data.data.summary.extract.substring(0, 100)}...`);
        passedTests++;
      } else {
        console.log(`⚠️ Wikipedia: ${activity.name} - ${data.error}`);
      }
    } catch (error) {
      console.log(`❌ Wikipedia: ${activity.name} - ${error}`);
    }
  }
  console.log('');

  // Test 5: Tavily Web Search (if configured)
  console.log('🔍 Testing Tavily Web Search...');
  totalTests++;
  try {
    const response = await fetch('http://localhost:3000/api/enrichment/test/tavily', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: 'beginner rock climbing gyms Bucharest Romania',
        maxResults: 3
      })
    });

    const data = await response.json();
    
    if (data.success) {
      console.log(`✅ Tavily: Found ${data.data.results.length} search results`);
      console.log(`   Extracted venues: ${data.data.extracted.venues.join(', ')}`);
      console.log(`   Keywords: ${data.data.extracted.keywords.slice(0, 5).join(', ')}`);
      passedTests++;
    } else {
      console.log(`⚠️ Tavily: ${data.error}`);
    }
  } catch (error) {
    console.log(`❌ Tavily: ${error}`);
  }
  console.log('');

  // Test 6: Full Enrichment Pipeline
  console.log('🎨 Testing Full Enrichment Pipeline...');
  totalTests++;
  try {
    const testActivity = {
      name: 'Indoor climbing',
      category: 'sports',
      places: [] // Empty to trigger fallbacks
    };

    const response = await fetch('http://localhost:3000/api/enrichment/test/enrich', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        activity: testActivity,
        options: {
          includeHeroImage: true,
          includeTutorialVideos: true,
          includeActivityInfo: true,
          useWebSearchFallback: true
        }
      })
    });

    const data = await response.json();
    
    if (data.success) {
      const enriched = data.data.enriched;
      console.log(`✅ Full enrichment completed for ${testActivity.name}`);
      console.log(`   Sources used: ${enriched.enrichmentSources.join(', ')}`);
      console.log(`   Hero image: ${enriched.heroImage ? '✅' : '❌'}`);
      console.log(`   Tutorial videos: ${enriched.tutorialVideos?.length || 0}`);
      console.log(`   Activity info: ${enriched.activityInfo ? '✅' : '❌'}`);
      console.log(`   Web context: ${enriched.webContext ? '✅' : '❌'}`);
      console.log(`   Processing time: ${data.data.processingTime}ms`);
      passedTests++;
    } else {
      console.log(`❌ Full enrichment failed: ${data.error}`);
    }
  } catch (error) {
    console.log(`❌ Full enrichment failed: ${error}`);
  }
  console.log('');

  // Test 7: Cache Performance
  console.log('💾 Testing Cache Performance...');
  totalTests++;
  try {
    const response = await fetch('http://localhost:3000/api/enrichment/cache/stats');
    const data = await response.json();
    
    if (data.success) {
      console.log('✅ Cache statistics retrieved');
      console.log(`   Cache size: ${data.data.cache.size} entries`);
      console.log(`   Rate limiters: ${Object.keys(data.data.rateLimiters).length} active`);
      passedTests++;
    } else {
      console.log('❌ Cache statistics failed');
    }
  } catch (error) {
    console.log(`❌ Cache statistics failed: ${error}`);
  }
  console.log('');

  // Summary
  console.log('📊 MEDIA & ENRICHMENT TEST SUMMARY:');
  console.log('=====================================');
  console.log(`🎯 Tests Passed: ${passedTests}/${totalTests} (${Math.round(passedTests/totalTests*100)}%)`);
  
  if (passedTests === totalTests) {
    console.log('🎉 ALL TESTS PASSED!');
    console.log('✅ Media & Enrichment APIs are fully operational');
  } else if (passedTests >= totalTests * 0.8) {
    console.log('⚠️ MOST TESTS PASSED');
    console.log('🔧 Some services may need API keys or configuration');
  } else {
    console.log('❌ MULTIPLE FAILURES');
    console.log('🚨 Check API keys and service configuration');
  }

  console.log('\n🚀 SERVICES READY FOR:');
  console.log('   🎥 YouTube: Tutorial videos and inspiration content');
  console.log('   🔍 Tavily: Web search for rare activities (when configured)');
  console.log('   📚 Wikipedia: Activity context and information');
  console.log('   🎨 Full Pipeline: Comprehensive activity enrichment');

  console.log('\n💡 NEXT STEPS:');
  console.log('   1. Add API keys to .env file for enabled services');
  console.log('   2. Test individual services with: npm run test:enrichment');
  console.log('   3. Integration ready for activities search pipeline');
}

if (import.meta.url === `file://${process.argv[1]}`) {
  testMediaEnrichmentAPIs().catch(console.error);
}
