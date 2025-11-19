import { Pool } from 'pg';
import * as fs from 'fs';
import * as path from 'path';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

interface ChatGPTVenueData {
  activity_id: number;
  activity_name: string;
  venue_name: string;
  full_address: string;
  city: string;
  latitude: number;
  longitude: number;
  website: string;
}

async function importVenuesFromChatGPT() {
  const client = await pool.connect();
  
  try {
    // Read the JSON file with ChatGPT's research
    const filePath = path.join(__dirname, '../../CHATGPT_VENUES_DATA.json');
    
    if (!fs.existsSync(filePath)) {
      console.error('❌ File not found: CHATGPT_VENUES_DATA.json');
      console.log('📝 Please create this file with ChatGPT\'s venue research data');
      return;
    }

    const rawData = fs.readFileSync(filePath, 'utf-8');
    const venuesData: ChatGPTVenueData[] = JSON.parse(rawData);

    console.log(`\n📊 Found ${venuesData.length} venues to import`);

    await client.query('BEGIN');

    let created = 0;
    let updated = 0;
    let errors = 0;

    for (const venue of venuesData) {
      try {
        // Check if activity exists
        const activityCheck = await client.query(
          'SELECT id FROM activities WHERE id = $1',
          [venue.activity_id]
        );

        if (activityCheck.rows.length === 0) {
          console.log(`⚠️  Activity ${venue.activity_id} not found, skipping`);
          errors++;
          continue;
        }

        // Check if venue already exists for this activity
        const existingVenue = await client.query(
          'SELECT id FROM venues WHERE activity_id = $1',
          [venue.activity_id]
        );

        if (existingVenue.rows.length > 0) {
          // Update existing venue
          await client.query(`
            UPDATE venues 
            SET 
              name = $1,
              address = $2,
              city = $3,
              latitude = $4,
              longitude = $5,
              website = $6,
              updated_at = NOW()
            WHERE activity_id = $7
          `, [
            venue.venue_name,
            venue.full_address,
            venue.city,
            venue.latitude,
            venue.longitude,
            venue.website,
            venue.activity_id
          ]);
          updated++;
          console.log(`✏️  Updated venue for: ${venue.activity_name}`);
        } else {
          // Create new venue
          await client.query(`
            INSERT INTO venues (
              activity_id,
              name,
              address,
              city,
              latitude,
              longitude,
              website,
              created_at,
              updated_at
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW())
          `, [
            venue.activity_id,
            venue.venue_name,
            venue.full_address,
            venue.city,
            venue.latitude,
            venue.longitude,
            venue.website
          ]);
          created++;
          console.log(`✅ Created venue for: ${venue.activity_name}`);
        }

      } catch (error) {
        console.error(`❌ Error processing ${venue.activity_name}:`, error);
        errors++;
      }
    }

    await client.query('COMMIT');

    console.log(`\n📊 IMPORT SUMMARY:`);
    console.log(`   ✅ Created: ${created} venues`);
    console.log(`   ✏️  Updated: ${updated} venues`);
    console.log(`   ❌ Errors: ${errors}`);
    console.log(`   📍 Total processed: ${created + updated} venues`);

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Import failed:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

importVenuesFromChatGPT().catch(console.error);
