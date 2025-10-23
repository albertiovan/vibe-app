/**
 * Run training feedback migration
 */

import { Pool } from 'pg';
import { readFileSync } from 'fs';
import { join } from 'path';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: join(__dirname, '../.env') });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function runMigration() {
  try {
    console.log('🔄 Running training feedback migration...');
    
    const migrationSQL = readFileSync(
      join(__dirname, '../database/migrations/009_training_feedback.sql'),
      'utf-8'
    );
    
    await pool.query(migrationSQL);
    
    console.log('✅ Training feedback tables created successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

runMigration();
