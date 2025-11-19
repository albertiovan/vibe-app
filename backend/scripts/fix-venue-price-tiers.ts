/**
 * Fix Venue Price Tiers and Link to Activities
 * 
 * This script will:
 * 1. Fix the price tiers in the venues table
 * 2. Link venues to activities with proper price tier conversion
 */

import { Pool } from 'pg';
import * as fs from 'fs';
import * as path from 'path';
import { parse } from 'csv-parse/sync';
import dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://localhost/vibe_app'
});

// Map symbol price tiers to text values
const PRICE_TIER_MAP: Record<string, string> = {
  '$': 'budget',
  '$$': 'moderate',
  '$$$': 'premium',
  '$$$$': 'luxury'
};

async function fixExistingVenues() {
  console.log('🔧 Fixing existing venue price tiers...');
  
  // First, update any existing venues with symbol price tiers
  const updateResult = await pool.query(`
    UPDATE venues 
    SET price_tier = CASE 
      WHEN price_tier = '$' THEN 'budget'
      WHEN price_tier = '$$' THEN 'moderate'
      WHEN price_tier = '$$$' THEN 'premium'
      WHEN price_tier = '$$$$' THEN 'luxury'
      ELSE price_tier
    END
    WHERE price_tier IN ('$', '$$', '$$$', '$$$$')
    RETURNING id, name, price_tier as old_tier, 
      CASE 
        WHEN price_tier = '$' THEN 'budget'
        WHEN price_tier = '$$' THEN 'moderate'
        WHEN price_tier = '$$$' THEN 'premium'
        WHEN price_tier = '$$$$' THEN 'luxury'
        ELSE price_tier
      END as new_tier
  `);
  
  console.log(`✅ Updated ${updateResult.rowCount} venue price tiers`);
  
  // Now update the price_tier column to have a check constraint
  try {
    await pool.query(`
      ALTER TABLE venues 
      ADD CONSTRAINT valid_price_tier 
      CHECK (price_tier IS NULL OR price_tier IN ('budget', 'moderate', 'premium', 'luxury'))
    `);
    console.log('✅ Added check constraint for price_tier');
  } catch (error) {
    console.log('ℹ️ Price tier constraint already exists or could not be added');
  }
}

async function linkVenuesToActivities() {
  console.log('\n🔗 Linking venues to activities...');
  
  // Read venues CSV
  const venuesPath = path.join(__dirname, '../data/venues.csv');
  console.log('📄 Reading venues.csv...');
  const venuesCSV = fs.readFileSync(venuesPath, 'utf-8');
  const venues = parse(venuesCSV, {
    columns: true,
    skip_empty_lines: true,
    relax_quotes: true,
    relax_column_count: true
  });

  console.log(`✅ Found ${venues.length} venues in CSV`);

  // Get all activities
  const activitiesResult = await pool.query('SELECT id, name FROM activities ORDER BY id');
  console.log(`📊 Database has ${activitiesResult.rows.length} activities`);

  let linked = 0;
  let skipped = 0;
  let failed = 0;

  for (const venue of venues) {
    try {
      // Try to find matching activity by partial name match
      const activitySlugWords = (venue.activity_slug || '').split('-').filter((w: string) => w.length > 3);
      
      // Try multiple matching strategies
      let activityId = null;
      let matchedActivity = null;
      
      // Strategy 1: Exact name match with venue name
      matchedActivity = activitiesResult.rows.find(a => 
        a.name.toLowerCase() === venue.name.toLowerCase()
      );
      
      // Strategy 2: Activity name contains venue name or vice versa
      if (!matchedActivity) {
        matchedActivity = activitiesResult.rows.find(a => 
          a.name.toLowerCase().includes(venue.name.toLowerCase()) ||
          venue.name.toLowerCase().includes(a.name.toLowerCase())
        );
      }
      
      // Strategy 3: Match by slug keywords
      if (!matchedActivity && activitySlugWords.length > 0) {
        matchedActivity = activitiesResult.rows.find(a => {
          const activityWords = a.name.toLowerCase().split(/\s+/);
          return activitySlugWords.some((slugWord: string) => 
            activityWords.some(actWord => 
              actWord.includes(slugWord) || slugWord.includes(actWord)
            )
          );
        });
      }

      if (!matchedActivity) {
        console.log(`⚠️  Could not match venue: ${venue.name} (slug: ${venue.activity_slug})`);
        failed++;
        continue;
      }

      activityId = matchedActivity.id;

      // Check if this venue already exists
      const existing = await pool.query(
        'SELECT id FROM venues WHERE name = $1 AND activity_id = $2',
        [venue.name, activityId]
      );

      if (existing.rows.length > 0) {
        console.log(`⏭️  Skipping existing venue: ${venue.name}`);
        skipped++;
        continue;
      }

      // Convert price tier
      const priceTier = PRICE_TIER_MAP[venue.price_tier] || 'moderate';

      // Insert venue with proper price tier
      await pool.query(`
        INSERT INTO venues (
          activity_id, name, address, city, region,
          latitude, longitude, phone, website, price_tier
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      `, [
        activityId,
        venue.name,
        venue.address || null,
        venue.city,
        venue.region,
        parseFloat(venue.latitude) || null,
        parseFloat(venue.longitude) || null,
        venue.phone || null,
        venue.website || venue.source_url || venue.booking_url || null,
        priceTier
      ]);

      linked++;
      console.log(`✅ Linked: ${venue.name} → Activity ${activityId} (${matchedActivity.name})`);
      
      if (venue.website) {
        console.log(`   🌐 Website: ${venue.website}`);
      }

    } catch (error: any) {
      console.error(`❌ Error linking venue ${venue.name}:`, error.message);
      failed++;
    }
  }

  console.log(`\n📊 LINKING SUMMARY:`);
  console.log(`   Linked: ${linked}`);
  console.log(`   Skipped (already exist): ${skipped}`);
  console.log(`   Failed: ${failed}`);
}

async function main() {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    // Fix existing venue price tiers
    await fixExistingVenues();
    
    // Link venues to activities
    await linkVenuesToActivities();
    
    // Get final stats
    const stats = await client.query(`
      SELECT 
        (SELECT COUNT(*) FROM activities) as total_activities,
        (SELECT COUNT(*) FROM venues) as total_venues,
        (SELECT COUNT(*) FROM venues WHERE website IS NOT NULL) as venues_with_websites,
        (SELECT COUNT(DISTINCT activity_id) FROM venues) as activities_with_venues
    `);

    const s = stats.rows[0];
    console.log('\n📊 FINAL DATABASE STATUS:');
    console.log(`   Total activities: ${s.total_activities}`);
    console.log(`   Total venues: ${s.total_venues}`);
    console.log(`   Venues with websites: ${s.venues_with_websites}`);
    console.log(`   Activities with venues: ${s.activities_with_venues}`);
    
    await client.query('COMMIT');
    console.log('\n✅ All changes committed successfully!');
    
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Error during database operations:', error);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

main();
