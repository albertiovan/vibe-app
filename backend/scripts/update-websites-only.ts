import { Pool } from 'pg';
import * as fs from 'fs';
import * as path from 'path';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

interface WebsiteUpdate {
  activity_id: number;
  website: string;
}

async function updateWebsitesOnly() {
  const client = await pool.connect();
  
  try {
    const filePath = path.join(__dirname, '../WEBSITE_UPDATES_BATCH_ALL.json');
    
    if (!fs.existsSync(filePath)) {
      console.error('❌ File not found: WEBSITE_UPDATES_BATCH_ALL.json');
      return;
    }

    const rawData = fs.readFileSync(filePath, 'utf-8');
    const updates: WebsiteUpdate[] = JSON.parse(rawData);

    console.log(`\n📊 Found ${updates.length} activities to update with website data`);

    await client.query('BEGIN');

    let updated = 0;
    let notFound = 0;
    let errors = 0;

    for (const item of updates) {
      try {
        const result = await client.query(`
          UPDATE activities 
          SET 
            website = $1,
            updated_at = NOW()
          WHERE id = $2
          RETURNING id, name
        `, [
          item.website,
          item.activity_id
        ]);

        if (result.rows.length > 0) {
          updated++;
          console.log(`✅ Updated activity ${item.activity_id}: ${result.rows[0].name}`);
        } else {
          notFound++;
          console.log(`⚠️  Activity ${item.activity_id} not found`);
        }

      } catch (error) {
        console.error(`❌ Error updating activity ${item.activity_id}:`, error);
        errors++;
      }
    }

    await client.query('COMMIT');

    console.log(`\n📊 UPDATE SUMMARY:`);
    console.log(`   ✅ Updated: ${updated} activities`);
    console.log(`   ⚠️  Not found: ${notFound} activities`);
    console.log(`   ❌ Errors: ${errors}`);
    console.log(`\n🎉 Website data import complete!`);

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Update failed:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

updateWebsitesOnly().catch(console.error);
