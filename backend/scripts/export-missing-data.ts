import { Pool } from 'pg';
import * as fs from 'fs';
import * as path from 'path';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

async function exportMissingData() {
  const client = await pool.connect();
  
  try {
    // Get activities without venues or coordinates
    const missingVenuesResult = await client.query(`
      SELECT 
        a.id,
        a.name,
        a.category,
        a.energy_level,
        a.description,
        v.name as venue_name,
        v.city,
        v.latitude,
        v.longitude,
        v.website
      FROM activities a
      LEFT JOIN venues v ON v.activity_id = a.id
      WHERE v.id IS NULL OR v.latitude IS NULL OR v.longitude IS NULL
      ORDER BY a.category, a.name
    `);

    // Get venues without websites
    const missingWebsitesResult = await client.query(`
      SELECT 
        a.id as activity_id,
        a.name as activity_name,
        a.category,
        v.id as venue_id,
        v.name as venue_name,
        v.city,
        v.latitude,
        v.longitude,
        v.website
      FROM activities a
      INNER JOIN venues v ON v.activity_id = a.id
      WHERE v.website IS NULL OR v.website = ''
      ORDER BY a.category, a.name
    `);

    console.log(`\n📊 DATA GAPS ANALYSIS:`);
    console.log(`Activities without venues/coordinates: ${missingVenuesResult.rows.length}`);
    console.log(`Venues without websites: ${missingWebsitesResult.rows.length}`);

    // Export missing venues/coordinates
    const venuesOutput = missingVenuesResult.rows.map(row => ({
      activity_id: row.id,
      activity_name: row.name,
      category: row.category,
      energy_level: row.energy_level,
      description: row.description,
      current_venue_name: row.venue_name || 'N/A',
      current_city: row.city || 'N/A',
      has_coordinates: !!(row.latitude && row.longitude),
      // Fields to fill
      venue_name_to_add: '',
      full_address: '',
      city: '',
      latitude: '',
      longitude: '',
      website: ''
    }));

    fs.writeFileSync(
      path.join(__dirname, '../../ACTIVITIES_MISSING_VENUES.json'),
      JSON.stringify(venuesOutput, null, 2)
    );

    // Export missing websites
    const websitesOutput = missingWebsitesResult.rows.map(row => ({
      activity_id: row.activity_id,
      activity_name: row.activity_name,
      category: row.category,
      venue_id: row.venue_id,
      venue_name: row.venue_name,
      city: row.city,
      latitude: row.latitude,
      longitude: row.longitude,
      // Field to fill
      website: ''
    }));

    fs.writeFileSync(
      path.join(__dirname, '../../VENUES_MISSING_WEBSITES.json'),
      JSON.stringify(websitesOutput, null, 2)
    );

    console.log(`\n✅ Exported files:`);
    console.log(`   - ACTIVITIES_MISSING_VENUES.json (${venuesOutput.length} activities)`);
    console.log(`   - VENUES_MISSING_WEBSITES.json (${websitesOutput.length} venues)`);

  } finally {
    client.release();
    await pool.end();
  }
}

exportMissingData().catch(console.error);
