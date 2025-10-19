#!/usr/bin/env tsx
/**
 * Test Day-Trip Range & Duration Expansion
 * 
 * Tests the new 8-12h day-trip preset with 250km radius
 * Validates Bucharest → Brașov suggestions appear
 */

import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../.env') });

// Haversine formula for distance calculation
function calculateDistance(point1: {lat: number, lng: number}, point2: {lat: number, lng: number}): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = (point2.lat - point1.lat) * Math.PI / 180;
  const dLng = (point2.lng - point1.lng) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(point1.lat * Math.PI / 180) * Math.cos(point2.lat * Math.PI / 180) *
    Math.sin(dLng/2) * Math.sin(dLng/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

async function testDayTripExpansion() {
  console.log('🚀 Testing Day-Trip Range & Duration Expansion\n');

  const testCases = [
    {
      name: 'Short Duration (3h) - Should stay local',
      vibe: 'adventure outdoors',
      location: { lat: 44.4268, lng: 26.1025 }, // Bucharest
      filters: {
        radiusMeters: 15000, // 15km
        durationHours: 3,
        willingToTravel: false
      },
      expectedRadius: 15,
      expectedMaxDistance: 20
    },
    {
      name: 'Day Trip (10h) - Should extend to 250km',
      vibe: 'mountain adventure day trip',
      location: { lat: 44.4268, lng: 26.1025 }, // Bucharest
      filters: {
        durationHours: 10,
        willingToTravel: true // Auto-enabled
        // radiusMeters will be auto-extended by backend to 250km for 8+ hours
      },
      expectedRadius: 250,
      expectedMaxDistance: 200, // Should include Brașov (~180km)
      expectBrasov: true
    },
    {
      name: 'Extended Day Trip (12h) - Maximum range',
      vibe: 'cultural exploration full day',
      location: { lat: 44.4268, lng: 26.1025 }, // Bucharest
      filters: {
        durationHours: 12,
        willingToTravel: true
        // radiusMeters will be auto-extended by backend to 250km for 8+ hours
      },
      expectedRadius: 250,
      expectedMaxDistance: 250,
      expectBrasov: true
    }
  ];

  for (const testCase of testCases) {
    console.log(`🎯 ${testCase.name}`);
    console.log(`   Vibe: "${testCase.vibe}"`);
    console.log(`   Duration: ${testCase.filters.durationHours}h`);
    console.log(`   Expected radius: ${testCase.expectedRadius}km`);
    
    try {
      const response = await fetch('http://localhost:3000/api/activities/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          vibe: testCase.vibe,
          location: testCase.location,
          filters: testCase.filters,
          userId: 'test_day_trip_user',
          timeOfDay: 'morning'
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      // Analyze results
      console.log(`   📊 Raw response keys:`, Object.keys(data));
      console.log(`   📊 Data structure:`, JSON.stringify(data, null, 2).substring(0, 500));
      
      const places = data.data?.places || data.places || [];
      
      // Check if radius was properly extended
      const actualRadius = data.data?.filters?.radiusMeters || 0;
      console.log(`   📏 Actual radius used: ${actualRadius/1000}km (expected: ${testCase.expectedRadius}km)`);
      console.log(`   🚗 Willing to travel: ${data.data?.filters?.willingToTravel}`);
      
      if (places.length === 0 && data.data) {
        console.log(`   📊 Data.data keys:`, Object.keys(data.data));
      }
      
      // Calculate distances from Bucharest
      const bucharest = { lat: 44.4268, lng: 26.1025 };
      places.forEach((p: any) => {
        if (p.location) {
          const distance = calculateDistance(bucharest, p.location);
          p.calculatedDistance = distance;
        }
      });
      
      const maxDistance = Math.max(...places.map((p: any) => p.calculatedDistance || 0));
      const hasBrasovArea = places.some((p: any) => 
        p.vicinity?.toLowerCase().includes('brașov') || 
        p.vicinity?.toLowerCase().includes('brasov') ||
        (p.distance && p.distance > 150) // Likely Brașov area
      );

      console.log(`   ✅ Results: ${places.length} places found`);
      console.log(`   📍 Max distance: ${Math.round(maxDistance)}km`);
      
      if (testCase.expectBrasov) {
        if (hasBrasovArea) {
          console.log(`   🏔️  Brașov area suggestions: ✅ FOUND`);
        } else {
          console.log(`   🏔️  Brașov area suggestions: ❌ NOT FOUND`);
        }
      }

      // Show sample long-distance results
      const longDistanceResults = places.filter((p: any) => (p.distance || 0) > 100);
      if (longDistanceResults.length > 0) {
        console.log(`   🚗 Long-distance results (>100km):`);
        longDistanceResults.slice(0, 3).forEach((p: any) => {
          const travelTime = Math.round((p.distance || 0) / 70 * 60); // ~70 km/h
          console.log(`      • ${p.name} - ${Math.round(p.distance)}km (~${travelTime}min)`);
        });
      }

      // Validate travel time calculations
      const samplePlace = places.find((p: any) => (p.distance || 0) > 50);
      if (samplePlace) {
        const expectedTravelTime = Math.round((samplePlace.distance / 70) * 60); // 70 km/h
        console.log(`   ⏱️  Travel time calculation: ${samplePlace.distance}km → ~${expectedTravelTime}min`);
      }

    } catch (error) {
      console.log(`   ❌ Error: ${error}`);
    }
    
    console.log('');
  }

  console.log('🎉 Day-trip expansion testing complete!');
  console.log('');
  console.log('📊 Expected Improvements:');
  console.log('   ✅ 8-12h preset visible in UI');
  console.log('   ✅ Auto-extends radius to 250km for day trips');
  console.log('   ✅ Auto-enables willingToTravel for 8+ hours');
  console.log('   ✅ Realistic travel time scoring (~70 km/h)');
  console.log('   ✅ Long-distance suggestions (Brașov, Sinaia) appear');
}

if (import.meta.url === `file://${process.argv[1]}`) {
  testDayTripExpansion().catch(console.error);
}
