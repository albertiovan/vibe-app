import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://localhost/vibe_app'
});

async function deleteGeneratedVenues() {
  const client = await pool.connect();
  
  try {
    console.log('\n🗑️  Deleting auto-generated venues...');
    
    // Delete venues created in the last 15 minutes (the ones we just generated)
    const result = await client.query(`
      DELETE FROM venues 
      WHERE created_at > NOW() - INTERVAL '15 minutes'
      RETURNING activity_id, name
    `);

    console.log(`✅ Deleted ${result.rows.length} auto-generated venues\n`);
    
    if (result.rows.length > 0) {
      console.log('Sample deleted venues:');
      result.rows.slice(0, 5).forEach(row => {
        console.log(`  - Activity ${row.activity_id}: ${row.name}`);
      });
    }

    // Verify deletion
    const check = await client.query(`
      SELECT COUNT(*) as missing_venues
      FROM activities a
      LEFT JOIN venues v ON v.activity_id = a.id
      WHERE v.id IS NULL
    `);

    console.log(`\n📊 Activities without venues: ${check.rows[0].missing_venues}`);
    console.log('\n🎉 Cleanup complete! Ready for real venue data.\n');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    client.release();
    await pool.end();
  }
}

deleteGeneratedVenues().catch(console.error);
