/**
 * Link Venues to Existing Activities
 * 
 * Your database already has 420 activities and 250 venues,
 * but some activities don't have their venues linked.
 * 
 * This script fixes the linkage by matching venue names to activity names.
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

async function main() {
  try {
    console.log('🔗 Linking venues to existing activities...\n');

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

    console.log(`✅ Found ${venues.length} venues in CSV\n`);

    // Get all activities
    const activitiesResult = await pool.query('SELECT id, name FROM activities ORDER BY id');
    console.log(`📊 Database has ${activitiesResult.rows.length} activities\n`);

    let linked = 0;
    let skipped = 0;
    let failed = 0;

    for (const venue of venues) {
      try {
        // Try to find matching activity by partial name match
        const activitySlugWords = venue.activity_slug.split('-').filter(w => w.length > 3);
        
        // Try multiple matching strategies
        let activityId = null;
        
        // Strategy 1: Exact name match with venue name
        const exact = activitiesResult.rows.find(a => 
          a.name.toLowerCase() === venue.name.toLowerCase()
        );
        if (exact) {
          activityId = exact.id;
        }
        
        // Strategy 2: Activity name contains venue name
        if (!activityId) {
          const contains = activitiesResult.rows.find(a => 
            a.name.toLowerCase().includes(venue.name.toLowerCase()) ||
            venue.name.toLowerCase().includes(a.name.toLowerCase())
          );
          if (contains) {
            activityId = contains.id;
          }
        }
        
        // Strategy 3: Match by slug keywords
        if (!activityId && activitySlugWords.length > 0) {
          const slugMatch = activitiesResult.rows.find(a => {
            const activityWords = a.name.toLowerCase().split(/\s+/);
            return activitySlugWords.some(slugWord => 
              activityWords.some(actWord => actWord.includes(slugWord) || slugWord.includes(actWord))
            );
          });
          if (slugMatch) {
            activityId = slugMatch.id;
          }
        }

        if (!activityId) {
          console.log(`⚠️  Could not match venue: ${venue.name} (slug: ${venue.activity_slug})`);
          failed++;
          continue;
        }

        // Check if this venue already exists
        const existing = await pool.query(
          'SELECT id FROM venues WHERE name = $1 AND activity_id = $2',
          [venue.name, activityId]
        );

        if (existing.rows.length > 0) {
          skipped++;
          continue;
        }

        // Insert venue
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
          venue.price_tier || 'moderate'
        ]);

        linked++;
        console.log(`✅ Linked: ${venue.name} → Activity ${activityId} (${activitiesResult.rows.find(a => a.id === activityId)?.name})`);
        
        if (venue.website) {
          console.log(`   🌐 Website: ${venue.website}`);
        }

      } catch (error) {
        console.error(`❌ Error linking venue ${venue.name}:`, error);
        failed++;
      }
    }

    console.log(`\n📊 SUMMARY:`);
    console.log(`   Linked: ${linked}`);
    console.log(`   Skipped (already exist): ${skipped}`);
    console.log(`   Failed: ${failed}\n`);

    // Final stats
    const stats = await pool.query(`
      SELECT 
        (SELECT COUNT(*) FROM activities) as total_activities,
        (SELECT COUNT(*) FROM venues) as total_venues,
        (SELECT COUNT(*) FROM venues WHERE website IS NOT NULL) as venues_with_websites,
        (SELECT COUNT(DISTINCT activity_id) FROM venues) as activities_with_venues
    `);

    const s = stats.rows[0];
    console.log('📊 FINAL DATABASE STATUS:');
    console.log(`   Total activities: ${s.total_activities}`);
    console.log(`   Total venues: ${s.total_venues}`);
    console.log(`   Venues with websites: ${s.venues_with_websites}`);
    console.log(`   Activities with venues: ${s.activities_with_venues}\n`);

    console.log('✅ Linking complete!');

  } catch (error) {
    console.error('❌ Linking failed:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

main();
