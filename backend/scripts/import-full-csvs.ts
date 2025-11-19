/**
 * Import Full Activities and Venues from CSV Files
 * 
 * This script imports the complete activities.csv and venues.csv files
 * INCLUDING all website/URL data.
 * 
 * USAGE:
 * npx tsx backend/scripts/import-full-csvs.ts
 */

import { Pool } from 'pg';
import * as fs from 'fs';
import * as path from 'path';
import { parse } from 'csv-parse/sync';
import dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/vibe_db'
});

async function main() {
  try {
    console.log('🚀 Starting CSV import...\n');

    // Read CSV files
    const activitiesPath = path.join(__dirname, '../data/activities.csv');
    const venuesPath = path.join(__dirname, '../data/venues.csv');

    console.log('📄 Reading activities.csv...');
    const activitiesCSV = fs.readFileSync(activitiesPath, 'utf-8');
    const activities = parse(activitiesCSV, {
      columns: true,
      skip_empty_lines: true,
      relax_quotes: true,
      relax_column_count: true
    });

    console.log(`✅ Found ${activities.length} activities\n`);

    console.log('📄 Reading venues.csv...');
    const venuesCSV = fs.readFileSync(venuesPath, 'utf-8');
    const venues = parse(venuesCSV, {
      columns: true,
      skip_empty_lines: true,
      relax_quotes: true,
      relax_column_count: true
    });

    console.log(`✅ Found ${venues.length} venues\n`);

    // Import activities
    console.log('📥 Importing activities...');
    let activitiesImported = 0;
    let activitiesSkipped = 0;

    for (const act of activities) {
      try {
        // Check if activity already exists
        const existing = await pool.query(
          'SELECT id FROM activities WHERE name = $1',
          [act.name]
        );

        if (existing.rows.length > 0) {
          console.log(`⏭️  Skipping existing activity: ${act.name}`);
          activitiesSkipped++;
          continue;
        }

        // Insert activity
        await pool.query(`
          INSERT INTO activities (
            name, description, category, region, city,
            latitude, longitude, duration_min, duration_max,
            indoor_outdoor, energy_level, seasonality, price_tier,
            crowd_size, group_suitability, tags
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
        `, [
          act.name,
          act.description,
          act.category,
          act.region,
          act.city,
          parseFloat(act.latitude) || null,
          parseFloat(act.longitude) || null,
          parseInt(act.duration_min) || null,
          parseInt(act.duration_max) || null,
          act.indoor_outdoor || 'both',
          act.energy_level || 'medium',
          act.seasonality ? act.seasonality.split(',') : ['all'],
          act.tags_cost_band || 'moderate',
          act.crowdSize || 'medium',
          act.groupSuitability || 'any',
          [] // tags array
        ]);

        activitiesImported++;
        console.log(`✅ Imported: ${act.name}`);
      } catch (error) {
        console.error(`❌ Failed to import activity ${act.name}:`, error);
      }
    }

    console.log(`\n📊 Activities: ${activitiesImported} imported, ${activitiesSkipped} skipped\n`);

    // Import venues
    console.log('📥 Importing venues...');
    let venuesImported = 0;
    let venuesSkipped = 0;
    let venuesWithWebsite = 0;

    for (const venue of venues) {
      try {
        // Find the activity ID by slug
        const activitySlug = venue.activity_slug;
        
        // Try to find activity by name matching
        const activityResult = await pool.query(
          `SELECT id FROM activities 
           WHERE LOWER(name) LIKE LOWER($1) 
           OR LOWER(name) = LOWER($2)
           LIMIT 1`,
          [`%${activitySlug}%`, venue.name]
        );

        if (activityResult.rows.length === 0) {
          console.log(`⚠️  No activity found for venue: ${venue.name} (slug: ${activitySlug})`);
          venuesSkipped++;
          continue;
        }

        const activityId = activityResult.rows[0].id;

        // Check if venue already exists
        const existing = await pool.query(
          'SELECT id FROM venues WHERE name = $1 AND activity_id = $2',
          [venue.name, activityId]
        );

        if (existing.rows.length > 0) {
          console.log(`⏭️  Skipping existing venue: ${venue.name}`);
          venuesSkipped++;
          continue;
        }

        // Insert venue WITH WEBSITE!
        await pool.query(`
          INSERT INTO venues (
            activity_id, name, address, city, region,
            latitude, longitude, phone, website, price_tier, rating
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
        `, [
          activityId,
          venue.name,
          venue.address || null,
          venue.city,
          venue.region,
          parseFloat(venue.latitude) || null,
          parseFloat(venue.longitude) || null,
          venue.phone || null,
          venue.website || venue.source_url || null, // WEBSITE HERE!
          venue.price_tier || 'moderate',
          null // rating
        ]);

        venuesImported++;
        if (venue.website) {
          venuesWithWebsite++;
          console.log(`✅ Imported venue with website: ${venue.name} → ${venue.website}`);
        } else {
          console.log(`✅ Imported venue (no website): ${venue.name}`);
        }
      } catch (error) {
        console.error(`❌ Failed to import venue ${venue.name}:`, error);
      }
    }

    console.log(`\n📊 Venues: ${venuesImported} imported, ${venuesSkipped} skipped`);
    console.log(`🌐 Venues with websites: ${venuesWithWebsite}/${venuesImported}\n`);

    // Summary query
    const summary = await pool.query(`
      SELECT 
        (SELECT COUNT(*) FROM activities) as total_activities,
        (SELECT COUNT(*) FROM venues) as total_venues,
        (SELECT COUNT(*) FROM venues WHERE website IS NOT NULL) as venues_with_websites
    `);

    console.log('📊 FINAL DATABASE STATUS:');
    console.log(`   Total activities: ${summary.rows[0].total_activities}`);
    console.log(`   Total venues: ${summary.rows[0].total_venues}`);
    console.log(`   Venues with websites: ${summary.rows[0].venues_with_websites}\n`);

    console.log('✅ Import complete!');

  } catch (error) {
    console.error('❌ Import failed:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

main();
