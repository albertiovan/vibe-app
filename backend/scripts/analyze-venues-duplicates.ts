/**
 * Analyze venues_continuation.csv for duplicate venues
 * Run: npx tsx backend/scripts/analyze-venues-duplicates.ts
 */

import { readFileSync } from 'fs';
import { parse } from 'csv-parse/sync';
import { join } from 'path';

interface VenueRow {
  activity_slug: string;
  name: string;
  address: string;
  city: string;
  region: string;
  latitude: string;
  longitude: string;
  booking_url: string;
  website: string;
  phone: string;
  price_tier: string;
  seasonality: string;
  blurb: string;
  tags_equipment: string;
  tags_requirement: string;
  tags_context: string;
  tags_cost_band: string;
  opening_hours_monday: string;
  opening_hours_tuesday: string;
  opening_hours_wednesday: string;
  opening_hours_thursday: string;
  opening_hours_friday: string;
  opening_hours_saturday: string;
  opening_hours_sunday: string;
  source_url: string;
  notes: string;
}

function analyzeVenues() {
  console.log('🔍 Analyzing venues for duplicates...\n');
  
  try {
    // Check if venues CSV exists
    const venuesPath = join(__dirname, '../../venues_continuation.csv');
    let csvContent: string;
    
    try {
      csvContent = readFileSync(venuesPath, 'utf-8');
    } catch {
      console.log('ℹ️  No venues_continuation.csv found.');
      console.log('   Your current data model embeds venue info in activities (embedded approach).');
      console.log('   This is fine! No venue normalization needed.\n');
      console.log('✅ Current approach: Activities include venue details directly');
      console.log('   - Simpler queries (no joins)');
      console.log('   - Works well for most use cases\n');
      console.log('💡 If you want to normalize venues in the future, create a venues table and migration.\n');
      return;
    }
    
    const venues: VenueRow[] = parse(csvContent, {
      columns: true,
      skip_empty_lines: true,
      trim: true,
    });
    
    console.log(`📊 Found ${venues.length} venue entries\n`);
    
    // Group by venue name
    const venueGroups = new Map<string, VenueRow[]>();
    
    venues.forEach(venue => {
      if (!venueGroups.has(venue.name)) {
        venueGroups.set(venue.name, []);
      }
      venueGroups.get(venue.name)!.push(venue);
    });
    
    // Find duplicates
    const duplicates = Array.from(venueGroups.entries()).filter(([_, rows]) => rows.length > 1);
    
    if (duplicates.length === 0) {
      console.log('✅ No duplicate venues found!\n');
      console.log('   Each venue appears only once.\n');
      return;
    }
    
    console.log(`⚠️  Found ${duplicates.length} venues with duplicate entries:\n`);
    console.log('═══════════════════════════════════════════════════════════\n');
    
    let totalDuplicateRows = 0;
    
    duplicates.forEach(([venueName, rows]) => {
      console.log(`📍 **${venueName}**`);
      console.log(`   Appears ${rows.length} times for activities:`);
      rows.forEach(row => {
        console.log(`   - ${row.activity_slug}`);
      });
      
      // Check if info is identical
      const addresses = new Set(rows.map(r => r.address));
      const coords = new Set(rows.map(r => `${r.latitude},${r.longitude}`));
      const phones = new Set(rows.map(r => r.phone).filter(p => p));
      
      if (addresses.size > 1) {
        console.log(`   ⚠️  Different addresses: ${Array.from(addresses).join(' vs ')}`);
      }
      if (coords.size > 1) {
        console.log(`   ⚠️  Different coordinates!`);
      }
      if (phones.size > 1) {
        console.log(`   ⚠️  Different phone numbers!`);
      }
      
      console.log();
      totalDuplicateRows += rows.length - 1; // Count extras
    });
    
    console.log('═══════════════════════════════════════════════════════════\n');
    console.log('📊 Summary:\n');
    console.log(`   Total venue entries: ${venues.length}`);
    console.log(`   Unique venues: ${venueGroups.size}`);
    console.log(`   Duplicate entries: ${totalDuplicateRows}`);
    console.log(`   Venues with duplicates: ${duplicates.length}\n`);
    
    console.log('💡 Recommendations:\n');
    console.log('   **Option 1: Keep Current Model (Embedded Venues)**');
    console.log('   - Activities embed venue info directly');
    console.log('   - Simpler queries, no joins needed');
    console.log('   - Accept duplicate venue data across activities');
    console.log('   - ✅ Best for current scale (73 activities)\n');
    
    console.log('   **Option 2: Normalize Venues (Separate Table)**');
    console.log('   - Create venues table with unique venues');
    console.log('   - Activities reference venue_id');
    console.log('   - No duplicate venue data');
    console.log('   - Requires migration and schema change');
    console.log('   - 📊 Better for scale (1000+ activities)\n');
    
    console.log('🎯 Current Recommendation: **Keep embedded approach**\n');
    console.log('   Your 73 activities with some shared venues is manageable.');
    console.log('   The complexity of normalization outweighs benefits at this scale.\n');
    
  } catch (error: any) {
    console.error('❌ Analysis failed:', error.message);
    process.exit(1);
  }
}

// Run analysis
analyzeVenues();
