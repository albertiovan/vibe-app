#!/usr/bin/env tsx
/**
 * Test Multi-Region Search Fan-Out
 * 
 * Tests the new multi-region search functionality for day trips
 * Validates cross-region activities (Sinaia ski, Brașov museums)
 */

import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

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

async function testMultiRegionFanOut() {
  console.log('🗺️  Testing Multi-Region Search Fan-Out\n');

  const testCases = [
    {
      name: 'Local Search (No Travel)',
      vibe: 'coffee and culture',
      location: { lat: 44.4268, lng: 26.1025 }, // Bucharest
      filters: {
        durationHours: 3,
        willingToTravel: false
      },
      expectedRegions: ['Origin'],
      expectCrossRegion: false
    },
    {
      name: 'Day Trip - Mountain Activities',
      vibe: 'mountain adventure skiing',
      location: { lat: 44.4268, lng: 26.1025 }, // Bucharest
      filters: {
        durationHours: 10,
        willingToTravel: true
      },
      expectedRegions: ['Origin', 'Brașov', 'Sinaia', 'Predeal'],
      expectCrossRegion: true,
      expectSinaia: true
    },
    {
      name: 'Cultural Day Trip',
      vibe: 'historic castles and museums',
      location: { lat: 44.4268, lng: 26.1025 }, // Bucharest
      filters: {
        durationHours: 12,
        willingToTravel: true
      },
      expectedRegions: ['Origin', 'Brașov', 'Sinaia', 'Sibiu'],
      expectCrossRegion: true,
      expectBrasov: true
    },
    {
      name: 'Beach Day Trip',
      vibe: 'beach and summer fun',
      location: { lat: 44.4268, lng: 26.1025 }, // Bucharest
      filters: {
        durationHours: 8,
        willingToTravel: true
      },
      expectedRegions: ['Origin', 'Constanța', 'Mamaia'],
      expectCrossRegion: true,
      expectConstanta: true
    }
  ];

  for (const testCase of testCases) {
    console.log(`🎯 ${testCase.name}`);
    console.log(`   Vibe: "${testCase.vibe}"`);
    console.log(`   Duration: ${testCase.filters.durationHours}h`);
    console.log(`   Willing to travel: ${testCase.filters.willingToTravel}`);
    
    try {
      const response = await fetch('http://localhost:3000/api/activities/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          vibe: testCase.vibe,
          location: testCase.location,
          filters: testCase.filters,
          userId: 'test_multi_region_user',
          timeOfDay: 'morning'
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      const places = data.data?.places || [];
      const searchCenters = data.data?.searchCenters || [];
      
      console.log(`   ✅ Results: ${places.length} places found`);
      console.log(`   🗺️  Search centers: ${searchCenters.length}`);
      
      // Analyze search centers
      if (searchCenters.length > 0) {
        console.log(`   📍 Centers searched:`);
        searchCenters.forEach((center: any) => {
          console.log(`      • ${center.name}: ${center.resultsCount} places`);
        });
      }

      // Analyze regional distribution
      const regionalPlaces = new Map<string, any[]>();
      const bucharest = { lat: 44.4268, lng: 26.1025 };
      
      places.forEach((place: any) => {
        if (place.location) {
          const distance = calculateDistance(bucharest, place.location);
          let region = 'Bucharest';
          
          if (distance > 150 && distance < 200) {
            if (place.vicinity?.toLowerCase().includes('brașov') || 
                place.vicinity?.toLowerCase().includes('brasov')) {
              region = 'Brașov';
            } else if (place.vicinity?.toLowerCase().includes('sinaia')) {
              region = 'Sinaia';
            } else {
              region = 'Mountain Region';
            }
          } else if (distance > 200) {
            if (place.vicinity?.toLowerCase().includes('constanța') || 
                place.vicinity?.toLowerCase().includes('constanta') ||
                place.vicinity?.toLowerCase().includes('mamaia')) {
              region = 'Coast';
            } else {
              region = 'Other Region';
            }
          }
          
          if (!regionalPlaces.has(region)) {
            regionalPlaces.set(region, []);
          }
          regionalPlaces.get(region)!.push(place);
        }
      });

      console.log(`   🌍 Regional distribution:`);
      for (const [region, regionPlaces] of regionalPlaces) {
        console.log(`      • ${region}: ${regionPlaces.length} places`);
        
        // Show sample places from each region
        if (regionPlaces.length > 0) {
          const sample = regionPlaces.slice(0, 2);
          sample.forEach(place => {
            const distance = calculateDistance(bucharest, place.location);
            console.log(`        - ${place.name} (${Math.round(distance)}km)`);
          });
        }
      }

      // Check specific expectations
      if (testCase.expectSinaia) {
        const sinaiaPlaces = places.filter((p: any) => 
          p.vicinity?.toLowerCase().includes('sinaia')
        );
        console.log(`   🏔️  Sinaia places: ${sinaiaPlaces.length > 0 ? '✅ FOUND' : '❌ NOT FOUND'}`);
      }

      if (testCase.expectBrasov) {
        const brasovPlaces = places.filter((p: any) => 
          p.vicinity?.toLowerCase().includes('brașov') || 
          p.vicinity?.toLowerCase().includes('brasov')
        );
        console.log(`   🏰 Brașov places: ${brasovPlaces.length > 0 ? '✅ FOUND' : '❌ NOT FOUND'}`);
      }

      if (testCase.expectConstanta) {
        const coastPlaces = places.filter((p: any) => 
          p.vicinity?.toLowerCase().includes('constanța') || 
          p.vicinity?.toLowerCase().includes('constanta') ||
          p.vicinity?.toLowerCase().includes('mamaia')
        );
        console.log(`   🏖️  Coast places: ${coastPlaces.length > 0 ? '✅ FOUND' : '❌ NOT FOUND'}`);
      }

      // Check cross-region coverage
      const crossRegionPlaces = places.filter((p: any) => {
        if (p.location) {
          const distance = calculateDistance(bucharest, p.location);
          return distance > 100; // More than 100km from Bucharest
        }
        return false;
      });

      if (testCase.expectCrossRegion) {
        console.log(`   🚗 Cross-region places: ${crossRegionPlaces.length > 0 ? '✅ FOUND' : '❌ NOT FOUND'} (${crossRegionPlaces.length})`);
      }

    } catch (error) {
      console.log(`   ❌ Error: ${error}`);
    }
    
    console.log('');
  }

  console.log('🎉 Multi-region fan-out testing complete!');
  console.log('');
  console.log('📊 Expected Improvements:');
  console.log('   ✅ Multi-region search centers identified');
  console.log('   ✅ Parallel queries across feasible regions');
  console.log('   ✅ Cross-region activities (ski in Sinaia, museums in Brașov)');
  console.log('   ✅ Deduplication by place_id across regions');
  console.log('   ✅ Travel time feasibility filtering');
}

if (import.meta.url === `file://${process.argv[1]}`) {
  testMultiRegionFanOut().catch(console.error);
}
