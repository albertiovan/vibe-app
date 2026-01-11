/**
 * Fix outdoor activities that were incorrectly tagged
 * Run with: npx tsx backend/scripts/fix-tours-outdoor.ts
 */

import { Pool } from 'pg';
import * as dotenv from 'dotenv';

// Load environment variables - use production if --prod flag passed
const isProd = process.argv.includes('--prod');
dotenv.config({ path: isProd ? './backend/.env.production' : './backend/.env' });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://localhost/vibe_app'
});

console.log(`🔌 Connecting to: ${isProd ? 'PRODUCTION (RDS)' : 'LOCAL'} database`);

async function fixOutdoorActivities() {
  console.log('🔧 Fixing outdoor activities...\n');
  
  try {
    // Fix walking tours, ghost tours, food tours, etc.
    const tourFix = await pool.query(`
      UPDATE activities 
      SET indoor_outdoor = 'outdoor'
      WHERE (
        LOWER(name) LIKE '%walking tour%' OR
        LOWER(name) LIKE '%ghost tour%' OR
        LOWER(name) LIKE '%food tour%' OR
        LOWER(name) LIKE '%history tour%' OR
        LOWER(name) LIKE '%heritage tour%' OR
        LOWER(name) LIKE '%shopping tour%' OR
        LOWER(name) LIKE '%monasteries tour%' OR
        LOWER(name) LIKE '%street food tour%'
      )
      AND indoor_outdoor != 'outdoor'
      RETURNING id, name
    `);
    console.log(`✅ Fixed ${tourFix.rowCount} tours to outdoor`);
    
    // Fix castles to 'both' (outdoor grounds + indoor rooms)
    const castleFix = await pool.query(`
      UPDATE activities 
      SET indoor_outdoor = 'both'
      WHERE LOWER(name) LIKE '%castle%'
      AND indoor_outdoor != 'both'
      RETURNING id, name
    `);
    console.log(`✅ Fixed ${castleFix.rowCount} castles to both`);
    
    // Fix museums to indoor (except village museums which are outdoor)
    const museumFix = await pool.query(`
      UPDATE activities 
      SET indoor_outdoor = 'indoor'
      WHERE LOWER(name) LIKE '%museum%'
      AND LOWER(name) NOT LIKE '%village museum%'
      AND indoor_outdoor != 'indoor'
      RETURNING id, name
    `);
    console.log(`✅ Fixed ${museumFix.rowCount} museums to indoor`);
    
    // Fix village museum to outdoor
    const villageMuseumFix = await pool.query(`
      UPDATE activities 
      SET indoor_outdoor = 'outdoor'
      WHERE LOWER(name) LIKE '%village museum%'
      AND indoor_outdoor != 'outdoor'
      RETURNING id, name
    `);
    console.log(`✅ Fixed ${villageMuseumFix.rowCount} village museums to outdoor`);
    
    // Fix rooftop romance activities to outdoor
    const rooftopFix = await pool.query(`
      UPDATE activities 
      SET indoor_outdoor = 'outdoor'
      WHERE LOWER(name) LIKE '%rooftop%'
      AND indoor_outdoor != 'outdoor'
      RETURNING id, name
    `);
    console.log(`✅ Fixed ${rooftopFix.rowCount} rooftop activities to outdoor`);
    
    // Fix ski touring to outdoor
    const skiTourFix = await pool.query(`
      UPDATE activities 
      SET indoor_outdoor = 'outdoor'
      WHERE (LOWER(name) LIKE '%ski tour%' OR LOWER(name) LIKE '%skiing%')
      AND indoor_outdoor != 'outdoor'
      RETURNING id, name
    `);
    console.log(`✅ Fixed ${skiTourFix.rowCount} ski activities to outdoor`);
    
    // Fix winery tours to 'both' (indoor tasting + outdoor vineyards)
    const wineryFix = await pool.query(`
      UPDATE activities 
      SET indoor_outdoor = 'both'
      WHERE LOWER(name) LIKE '%winery%'
      AND indoor_outdoor != 'both'
      RETURNING id, name
    `);
    console.log(`✅ Fixed ${wineryFix.rowCount} winery tours to both`);
    
    // Final distribution
    const finalCounts = await pool.query(`
      SELECT indoor_outdoor, COUNT(*) as count
      FROM activities
      GROUP BY indoor_outdoor
      ORDER BY count DESC
    `);
    
    console.log('\n📊 Final indoor_outdoor distribution:');
    for (const row of finalCounts.rows) {
      console.log(`   ${row.indoor_outdoor || 'NULL'}: ${row.count}`);
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await pool.end();
  }
}

fixOutdoorActivities();
