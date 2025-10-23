/**
 * Run migration 010: Invalidate old training data
 */

import { readFileSync } from 'fs';
import { Pool } from 'pg';
import dotenv from 'dotenv';
import { resolve } from 'path';

// Load environment
dotenv.config({ path: resolve(process.cwd(), '.env') });

async function runMigration() {
  console.log('🔄 Running migration 010: Invalidate old training data\n');
  
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL || 'postgresql://localhost/vibe_app'
  });
  
  try {
    // Execute individual statements
    console.log('📝 Step 1: Add semantic_version column...');
    try {
      await pool.query(`
        ALTER TABLE training_sessions 
        ADD COLUMN IF NOT EXISTS semantic_version TEXT DEFAULT 'v2-semantic'
      `);
      console.log('✅ semantic_version column added\n');
    } catch (error: any) {
      if (error.code === '42701') {
        console.log('⏭️  semantic_version already exists\n');
      } else {
        throw error;
      }
    }
    
    console.log('📝 Step 2: Add is_valid column...');
    try {
      await pool.query(`
        ALTER TABLE training_sessions
        ADD COLUMN IF NOT EXISTS is_valid BOOLEAN DEFAULT true
      `);
      console.log('✅ is_valid column added\n');
    } catch (error: any) {
      if (error.code === '42701') {
        console.log('⏭️  is_valid already exists\n');
      } else {
        throw error;
      }
    }
    
    console.log('📝 Step 3: Mark old sessions as invalid...');
    const updateResult = await pool.query(`
      UPDATE training_sessions 
      SET 
        is_valid = false, 
        semantic_version = 'v1-random'
      WHERE created_at < NOW()
        AND (semantic_version IS NULL OR semantic_version = 'v2-semantic')
    `);
    console.log(`✅ Marked ${updateResult.rowCount} old sessions as INVALID (v1-random)\n`);
    
    // Get summary
    console.log('\n📊 Migration Summary:\n');
    
    const summary = await pool.query(`
      SELECT 
        semantic_version,
        is_valid,
        COUNT(*) as session_count
      FROM training_sessions
      GROUP BY semantic_version, is_valid
      ORDER BY semantic_version
    `);
    
    console.log('Training sessions by version:');
    summary.rows.forEach(row => {
      const status = row.is_valid ? '✅ VALID' : '❌ INVALID';
      console.log(`  ${row.semantic_version || 'null'}: ${row.session_count} sessions ${status}`);
    });
    
    console.log('\n✅ Migration complete!');
    console.log('\nNext steps:');
    console.log('1. Start backend server');
    console.log('2. Verify semantic analysis in logs');
    console.log('3. Test "I want sports" returns sports activities');
    console.log('4. Redo 100 training sessions\n');
    
  } catch (error: any) {
    console.error('\n❌ Migration failed:', error.message);
    throw error;
  } finally {
    await pool.end();
  }
}

runMigration()
  .then(() => process.exit(0))
  .catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
