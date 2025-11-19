import { Pool } from 'pg';
import * as fs from 'fs';
import * as path from 'path';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

interface VenueUpdate {
  activity_id: number;
  latitude: number;
  longitude: number;
  city: string;
  website: string;
}

async function updateMissingVenueData() {
  const client = await pool.connect();
  
  try {
    const filePath = path.join(__dirname, '../VENUE_UPDATES.json');
    
    if (!fs.existsSync(filePath)) {
      console.error('❌ File not found: VENUE_UPDATES.json');
      return;
    }

    const rawData = fs.readFileSync(filePath, 'utf-8');
    const updates: VenueUpdate[] = JSON.parse(rawData);

    console.log(`\n📊 Found ${updates.length} activities to update with venue data`);

    await client.query('BEGIN');

    let updated = 0;
    let notFound = 0;
    let errors = 0;

    for (const venue of updates) {
      try {
        const result = await client.query(`
          UPDATE activities 
          SET 
            latitude = $1,
            longitude = $2,
            city = $3,
            website = $4,
            updated_at = NOW()
          WHERE id = $5
          RETURNING id, name
        `, [
          venue.latitude,
          venue.longitude,
          venue.city,
          venue.website,
          venue.activity_id
        ]);

        if (result.rows.length > 0) {
          updated++;
          console.log(`✅ Updated activity ${venue.activity_id}: ${result.rows[0].name}`);
        } else {
          notFound++;
          console.log(`⚠️  Activity ${venue.activity_id} not found`);
        }

      } catch (error) {
        console.error(`❌ Error updating activity ${venue.activity_id}:`, error);
        errors++;
      }
    }

    await client.query('COMMIT');

    console.log(`\n📊 UPDATE SUMMARY:`);
    console.log(`   ✅ Updated: ${updated} activities`);
    console.log(`   ⚠️  Not found: ${notFound} activities`);
    console.log(`   ❌ Errors: ${errors}`);
    console.log(`\n🎉 Venue data import complete!`);

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Update failed:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

updateMissingVenueData().catch(console.error);
