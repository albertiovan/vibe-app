/**
 * Run Challenge System Migration
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
    console.log('📦 Running Challenge System migration...');
    
    // Read migration file
    const migrationPath = join(__dirname, '../database/migrations/012_challenge_system.sql');
    const sql = readFileSync(migrationPath, 'utf8');
    
    // Execute migration
    await pool.query(sql);
    
    console.log('✅ Challenge System tables created successfully!');
    console.log('   - challenge_responses');
    console.log('   - user_challenges');
    
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

runMigration();
