#!/usr/bin/env tsx
/**
 * Debug Vibe Mapping
 * 
 * Shows exactly what Google Places types are being requested for different vibes
 */

import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

async function debugVibeMapping() {
  console.log('🔍 DEBUG: Vibe to Google Places Mapping\n');

  const testVibes = [
    'I want to try a new sport',
    'gym and fitness',
    'looking for sports facilities',
    'tennis courts',
    'swimming pool'
  ];

  for (const vibe of testVibes) {
    console.log(`🎯 Testing vibe: "${vibe}"`);
    
    try {
      // Make a request and capture the logs to see what types are being used
      const response = await fetch('http://localhost:3000/api/activities/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          vibe: vibe,
          location: { lat: 44.4268, lng: 26.1025 },
          filters: { durationHours: 3 },
          userId: 'debug_vibe_mapping'
        })
      });

      const data = await response.json();
      const topFive = data.data?.topFive || [];
      
      console.log(`   📊 Results: ${topFive.length} places`);
      
      // Analyze what types of places were returned
      const typeCounts = new Map<string, number>();
      topFive.forEach((place: any) => {
        const types = place.types || [];
        types.forEach((type: string) => {
          typeCounts.set(type, (typeCounts.get(type) || 0) + 1);
        });
      });

      console.log(`   📋 Place types returned:`);
      Array.from(typeCounts.entries())
        .sort(([,a], [,b]) => b - a)
        .slice(0, 5)
        .forEach(([type, count]) => {
          console.log(`      ${type}: ${count} places`);
        });

      // Show sample places
      console.log(`   🏢 Sample places:`);
      topFive.slice(0, 3).forEach((place: any, index: number) => {
        const relevantTypes = place.types?.filter((t: string) => 
          ['gym', 'health', 'stadium', 'spa', 'physiotherapist'].includes(t)
        ) || [];
        console.log(`      ${index + 1}. ${place.name}`);
        console.log(`         Types: ${place.types?.slice(0, 3).join(', ') || 'None'}`);
        console.log(`         Sports types: ${relevantTypes.join(', ') || 'None'}`);
        console.log(`         Vibe Score: ${place.vibeScore?.toFixed(2) || 'N/A'}`);
      });

    } catch (error) {
      console.log(`   ❌ Error: ${error}`);
    }
    
    console.log('');
  }

  console.log('🎯 ANALYSIS:');
  console.log('If "I want to try a new sport" returns stadiums instead of gyms,');
  console.log('the issue is in the vibe-to-places mapping logic.');
  console.log('The system should map "sport" → "gym" not "sport" → "stadium"');
}

if (import.meta.url === `file://${process.argv[1]}`) {
  debugVibeMapping().catch(console.error);
}
