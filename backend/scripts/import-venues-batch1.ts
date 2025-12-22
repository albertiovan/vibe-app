import { Pool } from 'pg';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env') });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const venueData = [
  {
    activity_id: 8,
    activity_name: "Transfăgărășan Scenic Day Tour",
    venue_name: "Cabana Bâlea Lac",
    full_address: "Bâlea Lac, Transfăgărășan (DN7C), Cârțișoara 557075, Sibiu County, Romania",
    city: "Bâlea Lac",
    region: "Sibiu",
    latitude: 45.6042,
    longitude: 24.6182,
    website: "https://balealac.ro"
  },
  {
    activity_id: 15,
    activity_name: "Electronic Club Night in Bucharest",
    venue_name: "Control Club",
    full_address: "Strada Constantin Mille 4, București 010142, Romania",
    city: "Bucharest",
    region: "Bucharest",
    latitude: 44.4329,
    longitude: 26.1063,
    website: "http://www.control-club.ro"
  },
  {
    activity_id: 16,
    activity_name: "Cluj Live Music & Club Night",
    venue_name: "FORM Space",
    full_address: "Aleea Stadionului 2, Cluj-Napoca 400000, Romania",
    city: "Cluj-Napoca",
    region: "Cluj",
    latitude: 46.7675,
    longitude: 23.5727,
    website: "https://www.formspace.ro"
  },
  {
    activity_id: 17,
    activity_name: "Timisoara Club Night",
    venue_name: "Database Club Timișoara",
    full_address: "Calea Circumvalațiunii 8-10, Timișoara 300012, Romania",
    city: "Timișoara",
    region: "Timiș",
    latitude: 45.7570,
    longitude: 21.2201,
    website: "https://clubdatabase.ro"
  },
  {
    activity_id: 18,
    activity_name: "Iași Night Out (Bars & Clubs)",
    venue_name: "Fratelli Lounge & Club Iași",
    full_address: "Strada Palas 5D, Iași 700259, Romania",
    city: "Iași",
    region: "Iași",
    latitude: 47.1557,
    longitude: 27.5887,
    website: "https://fratelli.ro/fratelli-iasi/"
  },
  {
    activity_id: 19,
    activity_name: "Bucharest Escape Room Challenge",
    venue_name: "Mystery Rooms Escape București",
    full_address: "Bulevardul Schitu Măgureanu 45, București 010184, Romania",
    city: "Bucharest",
    region: "Bucharest",
    latitude: 44.4355,
    longitude: 26.0815,
    website: "https://www.mysteryrooms.ro"
  },
  {
    activity_id: 20,
    activity_name: "Cluj Escape Room Adventure",
    venue_name: "The Dungeon Escape Room",
    full_address: "Strada Observatorului 90, Cluj-Napoca 400352, Romania",
    city: "Cluj-Napoca",
    region: "Cluj",
    latitude: 46.7570,
    longitude: 23.5840,
    website: "https://thedungeon.ro"
  },
  {
    activity_id: 21,
    activity_name: "Bucharest Yoga Class (Vinyasa/Hatha)",
    venue_name: "Cub Yoga Studio",
    full_address: "Bulevardul Pache Protopopescu 43A, București 021401, Romania",
    city: "Bucharest",
    region: "Bucharest",
    latitude: 44.4395,
    longitude: 26.1231,
    website: "https://www.cubyogastudio.com"
  },
  {
    activity_id: 22,
    activity_name: "CrossFit Session in Cluj",
    venue_name: "Smart Move CrossFit Berăriei",
    full_address: "Strada Berăriei 6, Cluj-Napoca 400380, Romania",
    city: "Cluj-Napoca",
    region: "Cluj",
    latitude: 46.7636,
    longitude: 23.5701,
    website: "https://www.smartmovecrossfit.ro"
  },
  {
    activity_id: 23,
    activity_name: "CrossFit Session in Bucharest",
    venue_name: "Replay CrossFit",
    full_address: "Iride Business Park, Clădirea 13, Bulevardul Dimitrie Pompeiu 9-9A, București 020335, Romania",
    city: "Bucharest",
    region: "Bucharest",
    latitude: 44.4841,
    longitude: 26.1187,
    website: "http://www.replaycrossfit.ro"
  }
];

async function importVenues() {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    console.log('🚀 Starting venue import for batch 1 (10 venues)...\n');
    
    let venuesInserted = 0;
    let activitiesUpdated = 0;
    
    for (const venue of venueData) {
      // Insert venue
      const venueResult = await client.query(
        `INSERT INTO venues (activity_id, name, address, city, region, latitude, longitude, website, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW())
         RETURNING id`,
        [venue.activity_id, venue.venue_name, venue.full_address, venue.city, venue.region, venue.latitude, venue.longitude, venue.website]
      );
      
      console.log(`✅ Inserted venue: ${venue.venue_name} (ID: ${venueResult.rows[0].id}) for activity ${venue.activity_id}`);
      venuesInserted++;
      
      // Update activity with website and location
      const activityResult = await client.query(
        `UPDATE activities 
         SET website = $1, 
             city = $2, 
             latitude = $3, 
             longitude = $4, 
             updated_at = NOW()
         WHERE id = $5 
         AND (website IS NULL OR website = '' OR city IS NULL OR city = '')
         RETURNING id`,
        [venue.website, venue.city, venue.latitude, venue.longitude, venue.activity_id]
      );
      
      if (activityResult.rows.length > 0) {
        console.log(`   📝 Updated activity ${venue.activity_id} with location and website data`);
        activitiesUpdated++;
      }
      
      console.log('');
    }
    
    await client.query('COMMIT');
    
    console.log('✨ Import complete!');
    console.log(`   Venues inserted: ${venuesInserted}`);
    console.log(`   Activities updated: ${activitiesUpdated}`);
    
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Error importing venues:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

importVenues().catch(console.error);
