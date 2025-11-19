/**
 * Run energy level SQL updates
 * Usage: npx tsx backend/scripts/run-energy-updates.ts
 */

import { Pool } from 'pg';
import { readFileSync } from 'fs';
import { join } from 'path';
import dotenv from 'dotenv';

dotenv.config({ path: join(__dirname, '../.env') });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://localhost/vibe_app',
});

async function runUpdates() {
  try {
    console.log('📊 Reading SQL file...');
    const sqlPath = join(__dirname, 'energy-updates.sql');
    const sql = readFileSync(sqlPath, 'utf-8');
    
    console.log('🔄 Running energy level updates...');
    await pool.query(sql);
    
    console.log('✅ All energy levels updated successfully!');
    
    // Verify
    const result = await pool.query(
      'SELECT energy_level, COUNT(*) FROM activities GROUP BY energy_level ORDER BY energy_level'
    );
    
    console.log('\n📈 Energy level distribution:');
    result.rows.forEach(row => {
      console.log(`  ${row.energy_level || 'NULL'}: ${row.count} activities`);
    });
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await pool.end();
  }
}

runUpdates();
