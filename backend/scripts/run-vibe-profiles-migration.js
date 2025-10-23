/**
 * Run Vibe Profiles Migration
 */

import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import pg from 'pg';

const { Pool } = pg;
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function runMigration() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL || 'postgresql://localhost/vibe_app',
  });

  try {
    console.log('📦 Running Vibe Profiles migration...');
    
    // Read migration file
    const migrationPath = join(__dirname, '../database/migrations/013_custom_vibe_profiles.sql');
    const sql = readFileSync(migrationPath, 'utf8');
    
    // Execute migration
    await pool.query(sql);
    
    console.log('✅ Vibe Profiles table created successfully!');
    console.log('   - vibe_profiles');
    
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

runMigration();
