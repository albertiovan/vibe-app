/**
 * Quick check: Verify imported activities and venues
 */
import { Pool } from 'pg';
import dotenv from 'dotenv';
import { resolve } from 'path';

dotenv.config({ path: resolve(__dirname, '../.env') });

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function check() {
  // Check for recently imported activities (last hour)
  const activities = await pool.query(`
    SELECT COUNT(*) as count, MIN(id) as min_id, MAX(id) as max_id 
    FROM activities 
    WHERE created_at > NOW() - INTERVAL '1 hour'
  `);
  
  const minId = activities.rows[0].min_id;
  const maxId = activities.rows[0].max_id;
  
  const venues = await pool.query(`
    SELECT COUNT(*) as count 
    FROM venues v 
    JOIN activities a ON v.activity_id = a.id 
    WHERE a.created_at > NOW() - INTERVAL '1 hour'
  `);
  
  console.log(`Activities imported (last hour): ${activities.rows[0].count}/48`);
  console.log(`ID range: ${minId} - ${maxId}`);
  console.log(`Venues created: ${venues.rows[0].count}/48`);
  
  if (activities.rows[0].count === '0') {
    console.log('\n❌ No activities found! The import may have failed.');
  } else if (venues.rows[0].count === '0') {
    console.log('\n⚠️  Activities exist but no venues! Venue creation failed.');
  } else {
    console.log('\n✅ Import successful!');
    
    // Show sample
    const sample = await pool.query(`
      SELECT a.id, a.name, a.city, v.latitude, v.longitude
      FROM activities a
      JOIN venues v ON v.activity_id = a.id
      WHERE a.created_at > NOW() - INTERVAL '1 hour'
      LIMIT 5
    `);
    console.log('\nSample activities:');
    sample.rows.forEach(r => {
      console.log(`  ${r.id}: ${r.name} (${r.city}) - ${r.latitude}, ${r.longitude}`);
    });
  }
  
  await pool.end();
}

check();
