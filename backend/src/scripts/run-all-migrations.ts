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

const migrations = [
  '001_create_activities_and_venues.sql',
  '002_user_preferences_and_history.sql',
  '003_tags_and_maps.sql',
  '006_activity_feedback.sql',
  '007_add_website_column.sql',
  '009_training_feedback.sql',
  '011_add_filter_fields.sql',
  '012_challenge_system.sql',
  '013_custom_vibe_profiles.sql',
  '014_romanian_translations.sql',
  '014_community_features.sql',
  '014_friends_system.sql',
  '015_activity_completion_tracking.sql',
];

async function runAllMigrations() {
  try {
    console.log('🔌 Connecting to database...');
    
    for (const migrationFile of migrations) {
      console.log(`\n📦 Running migration: ${migrationFile}`);
      
      const migrationPath = path.join(__dirname, '../../database/migrations', migrationFile);
      
      if (!fs.existsSync(migrationPath)) {
        console.log(`⚠️  Migration file not found: ${migrationFile}, skipping...`);
        continue;
      }
      
      const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
      
      try {
        await pool.query(migrationSQL);
        console.log(`✅ ${migrationFile} completed successfully`);
      } catch (error: any) {
        if (error.code === '42P07' || error.message?.includes('already exists')) {
          console.log(`⏭️  ${migrationFile} - tables already exist, skipping...`);
        } else {
          console.error(`❌ Error in ${migrationFile}:`, error.message);
          throw error;
        }
      }
    }
    
    console.log('\n✅ All migrations completed successfully!');
  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  } finally {
    await pool.end();
  }
}

runAllMigrations();
