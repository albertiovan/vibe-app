import { Pool } from 'pg';
import * as dotenv from 'dotenv';
import * as path from 'path';
import * as fs from 'fs';

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://localhost/vibe_app',
});

async function runMigration() {
  try {
    console.log('🔄 Running filter fields migration...\n');
    
    const migrationPath = path.resolve(__dirname, '../database/migrations/011_add_filter_fields.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
    
    await pool.query(migrationSQL);
    
    console.log('✅ Migration completed successfully!\n');
    
    // Verify new columns
    const { rows } = await pool.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'activities' 
      AND column_name IN ('crowd_size', 'crowd_type', 'group_suitability', 'price_tier')
      ORDER BY column_name
    `);
    
    console.log('📊 New columns added:');
    rows.forEach(row => {
      console.log(`   - ${row.column_name}: ${row.data_type}`);
    });
    
    // Check sample data
    const { rows: sampleRows } = await pool.query(`
      SELECT name, category, crowd_size, crowd_type, group_suitability, price_tier
      FROM activities
      LIMIT 5
    `);
    
    console.log('\n📝 Sample data:');
    sampleRows.forEach(row => {
      console.log(`   ${row.name}`);
      console.log(`      Category: ${row.category}`);
      console.log(`      Crowd: ${row.crowd_size} (${row.crowd_type})`);
      console.log(`      Group: ${row.group_suitability}`);
      console.log(`      Price: ${row.price_tier}`);
      console.log('');
    });
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
  } finally {
    await pool.end();
  }
}

runMigration();
