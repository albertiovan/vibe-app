/**
 * Quick database verification script
 */

import { Pool } from 'pg';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment
dotenv.config({ path: join(__dirname, '..', '.env') });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

async function verify() {
  try {
    console.log('📊 Database Verification\n');

    // Count activities
    const activitiesResult = await pool.query('SELECT COUNT(*) FROM activities');
    console.log(`✅ Total Activities: ${activitiesResult.rows[0].count}`);

    // Count venues
    const venuesResult = await pool.query('SELECT COUNT(*) FROM venues');
    console.log(`✅ Total Venues: ${venuesResult.rows[0].count}`);

    // Count tags
    const tagsResult = await pool.query('SELECT COUNT(*) FROM activity_tags');
    console.log(`✅ Total Activity Tags: ${tagsResult.rows[0].count}`);

    // Activities by category
    const categoryResult = await pool.query(`
      SELECT category, COUNT(*) 
      FROM activities 
      GROUP BY category 
      ORDER BY count DESC
    `);
    console.log('\n📂 Activities by Category:');
    categoryResult.rows.forEach(row => {
      console.log(`   ${row.category}: ${row.count}`);
    });

    // Sample activities
    const sampleResult = await pool.query(`
      SELECT name, category, region, array_length(tags, 1) as tag_count 
      FROM activities 
      ORDER BY id 
      LIMIT 8
    `);
    console.log('\n🎯 Sample Activities:');
    sampleResult.rows.forEach(row => {
      console.log(`   • ${row.name} (${row.category}, ${row.region}) - ${row.tag_count} tags`);
    });

    // Venues with maps
    const mapsResult = await pool.query(`
      SELECT COUNT(*) 
      FROM venues 
      WHERE maps_url IS NOT NULL
    `);
    console.log(`\n🗺️  Venues with Maps URLs: ${mapsResult.rows[0].count}/${venuesResult.rows[0].count}`);

    // Sample venues
    const venuesSample = await pool.query(`
      SELECT v.name, v.city, a.name as activity_name
      FROM venues v
      JOIN activities a ON a.slug = v.activity_slug
      LIMIT 5
    `);
    console.log('\n🏢 Sample Venues:');
    venuesSample.rows.forEach(row => {
      console.log(`   • ${row.name} (${row.city}) → ${row.activity_name}`);
    });

    console.log('\n✅ Database verification complete!\n');

  } catch (error) {
    console.error('❌ Verification failed:', error);
  } finally {
    await pool.end();
  }
}

verify();
