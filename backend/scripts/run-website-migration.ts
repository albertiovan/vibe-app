import { Pool } from 'pg';
import { readFileSync } from 'fs';
import { join } from 'path';
import dotenv from 'dotenv';

dotenv.config({ path: join(__dirname, '../.env') });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://localhost/vibe_app'
});

async function runMigration() {
  try {
    console.log('🌐 Adding website column...\n');

    // First, add the website column
    const addColumnPath = join(__dirname, '../database/migrations/007_add_website_column.sql');
    const addColumnSQL = readFileSync(addColumnPath, 'utf-8');
    await pool.query(addColumnSQL);
    console.log('✅ Website column added\n');

    console.log('🌐 Updating activity websites...\n');

    // Then, update the websites
    const updateWebsitesPath = join(__dirname, '../database/migrations/008_update_websites.sql');
    const updateWebsitesSQL = readFileSync(updateWebsitesPath, 'utf-8');
    await pool.query(updateWebsitesSQL);

    // Count updated activities
    const result = await pool.query(`
      SELECT COUNT(*) as count 
      FROM activities 
      WHERE website IS NOT NULL AND website != ''
    `);

    console.log(`✅ Migration complete!`);
    console.log(`📊 Total activities with websites: ${result.rows[0].count}\n`);

  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

runMigration();
