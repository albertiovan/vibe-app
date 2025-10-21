#!/usr/bin/env tsx
import { Pool } from 'pg';
import { readFileSync } from 'fs';
import { join } from 'path';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://localhost/vibe_app'
});

async function runMigration() {
  try {
    console.log('📊 Running migration 002...');
    
    const sql = readFileSync(
      join(process.cwd(), 'database/migrations/002_user_preferences_and_history.sql'),
      'utf-8'
    );
    
    await pool.query(sql);
    
    console.log('✅ Migration 002 completed successfully!');
    console.log('\n📋 Created tables:');
    console.log('   - users');
    console.log('   - saved_activities');
    console.log('   - conversations');
    console.log('   - messages');
    console.log('   - activity_interactions');
    
  } catch (error) {
    console.error('❌ Migration failed:', (error as Error).message);
    throw error;
  } finally {
    await pool.end();
  }
}

runMigration();
