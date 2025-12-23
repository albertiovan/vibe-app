// Quick script to check and create community tables
const { Pool } = require('pg');
require('dotenv').config({ path: '.env.production' });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function checkAndCreateTables() {
  try {
    console.log('Checking if community_posts table exists...');
    
    const result = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'community_posts'
      );
    `);
    
    if (result.rows[0].exists) {
      console.log('✅ Community tables already exist!');
      process.exit(0);
    }
    
    console.log('❌ Community tables do not exist. Creating them...');
    console.log('Please run the migration manually:');
    console.log('cat database/migrations/014_community_features.sql | psql $DATABASE_URL');
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await pool.end();
  }
}

checkAndCreateTables();
