import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

// Manual research for 5 venues missing websites
const fixes = [
  {
    venue_id: 240,
    activity_name: "Cluj Tandem Paragliding at Feleacu",
    venue_name: "Skyrush Paragliding",
    website: "https://www.skyrush.ro"
  },
  {
    venue_id: 293,
    activity_name: "Adult Ceramics Starter (Școala Populară de Arte Cluj)",
    venue_name: "Școala Populară de Arte Tudor Jarda",
    city: "Cluj-Napoca",
    latitude: 46.7877,
    longitude: 23.6385,
    website: "https://www.scoaladearte.ro"
  },
  {
    venue_id: 174,
    activity_name: "Track Day Laps at MotorPark Romania",
    venue_name: "MotorPark Romania",
    website: "https://www.motorparkromania.ro"
  },
  {
    venue_id: 340,
    activity_name: "Green Hours Live Jazz Night",
    venue_name: "Green Hours 22 Jazz-Café",
    website: "https://www.greenhours.ro"
  },
  {
    venue_id: 300,
    activity_name: "Runners Club Cluj – Social Run",
    venue_name: "Runners Club Cluj",
    city: "Cluj-Napoca",
    latitude: 46.7712,
    longitude: 23.6236,
    website: "https://www.facebook.com/runnersclubcluj"
  }
];

async function fixMissingWebsites() {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');

    console.log(`\n🔧 Fixing ${fixes.length} venues with missing data...\n`);

    for (const fix of fixes) {
      // Update venue with website and any missing data
      const updateFields = ['website = $1'];
      const values: any[] = [fix.website];
      let paramCount = 2;

      if (fix.city) {
        updateFields.push(`city = $${paramCount}`);
        values.push(fix.city);
        paramCount++;
      }

      if (fix.latitude && fix.longitude) {
        updateFields.push(`latitude = $${paramCount}`);
        values.push(fix.latitude);
        paramCount++;
        updateFields.push(`longitude = $${paramCount}`);
        values.push(fix.longitude);
        paramCount++;
      }

      values.push(fix.venue_id);

      await client.query(
        `UPDATE venues SET ${updateFields.join(', ')}, updated_at = NOW() WHERE id = $${paramCount}`,
        values
      );

      console.log(`✅ ${fix.activity_name}`);
      console.log(`   Venue: ${fix.venue_name}`);
      console.log(`   Website: ${fix.website}`);
      if (fix.city) console.log(`   City: ${fix.city}`);
      if (fix.latitude) console.log(`   Coordinates: ${fix.latitude}, ${fix.longitude}`);
      console.log('');
    }

    await client.query('COMMIT');

    console.log(`✅ Successfully fixed all ${fixes.length} venues!`);

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Error fixing venues:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

fixMissingWebsites().catch(console.error);
