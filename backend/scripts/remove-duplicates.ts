import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

async function removeDuplicates() {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');

    // Find all duplicates
    const duplicatesResult = await client.query(`
      SELECT 
        name,
        category,
        ARRAY_AGG(id ORDER BY id) as ids
      FROM activities
      GROUP BY name, category
      HAVING COUNT(*) > 1
      ORDER BY name
    `);

    console.log(`Found ${duplicatesResult.rows.length} duplicate activity groups`);

    let totalDeleted = 0;

    for (const duplicate of duplicatesResult.rows) {
      const ids = duplicate.ids;
      const keepId = ids[0]; // Keep the first (lowest) ID
      const deleteIds = ids.slice(1); // Delete all others

      console.log(`\n"${duplicate.name}" (${duplicate.category})`);
      console.log(`  Keeping ID: ${keepId}`);
      console.log(`  Deleting IDs: ${deleteIds.join(', ')}`);

      // First, delete associated venues for the duplicate activities
      const venuesDeleted = await client.query(
        'DELETE FROM venues WHERE activity_id = ANY($1) RETURNING id',
        [deleteIds]
      );
      
      if (venuesDeleted.rows.length > 0) {
        console.log(`  Deleted ${venuesDeleted.rows.length} associated venues`);
      }

      // Then delete the duplicate activities
      const activitiesDeleted = await client.query(
        'DELETE FROM activities WHERE id = ANY($1) RETURNING id',
        [deleteIds]
      );

      totalDeleted += activitiesDeleted.rows.length;
    }

    await client.query('COMMIT');

    console.log(`\n✅ Successfully removed ${totalDeleted} duplicate activities`);
    
    // Get final count
    const finalCount = await client.query('SELECT COUNT(*) FROM activities');
    console.log(`📊 Total activities remaining: ${finalCount.rows[0].count}`);

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Error removing duplicates:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

removeDuplicates().catch(console.error);
