import { Pool } from 'pg';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../../.env.production') });

console.log('🔍 DATABASE_URL:', process.env.DATABASE_URL ? 'Loaded' : 'Missing');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function ensureCommunityTables() {
  try {
    console.log('🔌 Connecting to database...');
    
    // Check if community_posts table exists
    const result = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'community_posts'
      );
    `);
    
    if (result.rows[0].exists) {
      console.log('✅ Community tables already exist');
      return;
    }
    
    console.log('📦 Creating community tables...');
    
    // Read and execute the migration file
    const migrationPath = path.join(__dirname, '../../database/migrations/014_community_features.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
    
    await pool.query(migrationSQL);
    
    console.log('✅ Community tables created successfully');
  } catch (error) {
    console.error('❌ Error ensuring community tables:', error);
    throw error;
  } finally {
    await pool.end();
  }
}

ensureCommunityTables();
