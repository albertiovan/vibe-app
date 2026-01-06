/**
 * Copy database data from local PostgreSQL to RDS
 */

import pg from 'pg';
const { Pool } = pg;

const localPool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://localhost/vibe_app'
});

const rdsPool = new Pool({
  connectionString: 'postgresql://vibeadmin:zyprif-2cuQxa-jowgoc@vibe-app-db.cnwak0ga4cbg.eu-north-1.rds.amazonaws.com:5432/vibe_app?sslmode=require'
});

async function copyTable(tableName, columns) {
  console.log(`\n📋 Copying ${tableName}...`);
  
  try {
    // Get data from local
    const { rows } = await localPool.query(`SELECT * FROM ${tableName}`);
    console.log(`  Found ${rows.length} rows in local database`);
    
    if (rows.length === 0) {
      console.log(`  ⏭️  Skipping empty table`);
      return;
    }
    
    // Clear RDS table first
    await rdsPool.query(`DELETE FROM ${tableName}`);
    console.log(`  🗑️  Cleared RDS table`);
    
    // Insert in batches of 100
    const batchSize = 100;
    for (let i = 0; i < rows.length; i += batchSize) {
      const batch = rows.slice(i, i + batchSize);
      
      for (const row of batch) {
        const cols = Object.keys(row).join(', ');
        const values = Object.values(row);
        const placeholders = values.map((_, idx) => `$${idx + 1}`).join(', ');
        
        await rdsPool.query(
          `INSERT INTO ${tableName} (${cols}) VALUES (${placeholders}) ON CONFLICT DO NOTHING`,
          values
        );
      }
      
      console.log(`  ✅ Inserted ${Math.min(i + batchSize, rows.length)}/${rows.length} rows`);
    }
    
    console.log(`  ✅ Completed ${tableName}`);
  } catch (error) {
    console.error(`  ❌ Error copying ${tableName}:`, error.message);
    throw error;
  }
}

async function main() {
  console.log('🚀 Starting database copy from local to RDS...\n');
  
  try {
    // Test connections
    console.log('🔌 Testing connections...');
    await localPool.query('SELECT 1');
    console.log('  ✅ Local database connected');
    await rdsPool.query('SELECT 1');
    console.log('  ✅ RDS database connected');
    
    // Copy tables in order (respecting foreign keys)
    await copyTable('activities');
    await copyTable('venues');
    await copyTable('activity_venues');
    await copyTable('users');
    await copyTable('conversations');
    await copyTable('messages');
    await copyTable('challenges');
    await copyTable('challenge_responses');
    await copyTable('activity_feedback');
    await copyTable('activity_completions');
    await copyTable('vibe_profiles');
    await copyTable('user_vibe_profiles');
    
    console.log('\n✅ Database copy completed successfully!');
    
    // Verify
    const { rows } = await rdsPool.query('SELECT COUNT(*) FROM activities');
    console.log(`\n📊 RDS now has ${rows[0].count} activities`);
    
  } catch (error) {
    console.error('\n❌ Copy failed:', error);
    process.exit(1);
  } finally {
    await localPool.end();
    await rdsPool.end();
  }
}

main();
