import { Pool } from 'pg';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env') });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const venueData = [
  // Batch 8: Activities 113-122
  {
    activity_id: 113,
    activity_name: "Sunset Picnic in Herăstrău Park",
    venue_name: "Parcul Regele Mihai I al României (Herăstrău Park)",
    full_address: "Parcul Regele Mihai I al României, Sector 1, București, Romania",
    city: "Bucharest",
    region: "Bucharest",
    latitude: 44.480621,
    longitude: 26.083762,
    website: "https://herastrauparc.ro"
  },
  {
    activity_id: 114,
    activity_name: "Rooftop Dinner with City Views (Bucharest)",
    venue_name: "NOR Sky Casual Restaurant (SkyTower)",
    full_address: "SkyTower, Calea Floreasca 246C, Etaj 36, București 014476, Romania",
    city: "Bucharest",
    region: "Bucharest",
    latitude: 44.447924,
    longitude: 26.097879,
    website: "https://www.norbucharest.ro"
  },
  {
    activity_id: 115,
    activity_name: "Private Cooking Class for Two (Bucharest)",
    venue_name: "Société Gourmet – Cooking Classes & Event House",
    full_address: "Strada Marcel Iancu 9, București 020757, Romania",
    city: "Bucharest",
    region: "Bucharest",
    latitude: 44.4505,
    longitude: 26.118,
    website: "https://societegourmet.ro"
  },
  {
    activity_id: 116,
    activity_name: "Stargazing Night near Bucharest",
    venue_name: "Snagov Club – Lakeside Hotel & Gardens",
    full_address: "Aleea Nufărului 1B, Snagov 077165, Romania",
    city: "Snagov",
    region: "Ilfov",
    latitude: 44.712,
    longitude: 26.19,
    website: "https://snagovclub.ro/en/"
  },
  {
    activity_id: 117,
    activity_name: "Bucharest Ghost Tour (Old Town)",
    venue_name: "Ion Luca Caragiale National Theatre – Ghost Tour Meeting Point",
    full_address: "Bulevardul Nicolae Bălcescu 2, București 010051, Romania",
    city: "Bucharest",
    region: "Bucharest",
    latitude: 44.4354,
    longitude: 26.1019,
    website: "https://bucharestfreewalkingtour.com"
  },
  {
    activity_id: 118,
    activity_name: "Bucharest Food Market Tour (Obor/Dorobanți)",
    venue_name: "Piața Obor (Obor Market)",
    full_address: "Strada Ziduri Moși 4, Sector 2, București 077085, Romania",
    city: "Bucharest",
    region: "Bucharest",
    latitude: 44.449911,
    longitude: 26.124169,
    website: "https://piataoborbucuresti.ro"
  },
  {
    activity_id: 119,
    activity_name: "Bucharest Vintage Shopping Tour",
    venue_name: "Cărturești Carusel – Concept Store & Bookshop",
    full_address: "Strada Lipscani 55, București 030033, Romania",
    city: "Bucharest",
    region: "Bucharest",
    latitude: 44.4312,
    longitude: 26.102,
    website: "https://carturesti.ro"
  },
  {
    activity_id: 120,
    activity_name: "Bucharest Architectural Walking Tour",
    venue_name: "Starbucks – Hanul lui Manuc (Bucharest Architecture Tour Meeting Point)",
    full_address: "Strada Franceză 62–64, București 030106, Romania",
    city: "Bucharest",
    region: "Bucharest",
    latitude: 44.4303,
    longitude: 26.104,
    website: "https://romaniastepbystep.com/bucharest-architecture-tour/"
  },
  {
    activity_id: 121,
    activity_name: "Bucharest Communist History Tour",
    venue_name: "Palatul Primăverii (Ceaușescu Mansion)",
    full_address: "Bulevardul Primăverii 50, București 011975, Romania",
    city: "Bucharest",
    region: "Bucharest",
    latitude: 44.4726,
    longitude: 26.0979,
    website: "https://palatulprimaverii.ro"
  },
  {
    activity_id: 122,
    activity_name: "Bucharest Jewish Heritage Tour",
    venue_name: "Great Synagogue (Sinagoga Mare)",
    full_address: "Strada Vasile Adamache 11, București 030167, Romania",
    city: "Bucharest",
    region: "Bucharest",
    latitude: 44.429983,
    longitude: 26.108321,
    website: "https://religiana.com/great-synagogue-bucharest"
  },
  
  // Batch 9: Activities 123-126, 133-135
  {
    activity_id: 123,
    activity_name: "Bucharest Bike Tour (Parks & Landmarks)",
    venue_name: "Bike The City",
    full_address: "Strada Operetei 12, București 030167, Romania",
    city: "Bucharest",
    region: "Bucharest",
    latitude: 44.4300,
    longitude: 26.1000,
    website: "https://www.bikethecity.ro"
  },
  {
    activity_id: 124,
    activity_name: "Bucharest Running Club Meetup",
    venue_name: "Bucharest RUNNING CLUB",
    full_address: "Strada Armenească 23, Sector 2, București 021042, Romania",
    city: "Bucharest",
    region: "Bucharest",
    latitude: 44.4372,
    longitude: 26.1101,
    website: "https://runinbucharest.com"
  },
  {
    activity_id: 125,
    activity_name: "Outdoor Bootcamp in Herăstrău Park",
    venue_name: "Roaba de Cultură – King Michael I Park (Herăstrău)",
    full_address: "Bd. Aviatorilor 106, Parcul Regele Mihai I (Herăstrău), Pajiștea Pescăruș, București 014192, Romania",
    city: "Bucharest",
    region: "Bucharest",
    latitude: 44.4708,
    longitude: 26.0882,
    website: "https://greenrevolution.ro/roaba-de-cultura/"
  },
  {
    activity_id: 126,
    activity_name: "Pilates Class (Bucharest)",
    venue_name: "MYB Pilates",
    full_address: "Strada Vasile Alecsandri 12, București 010639, Romania",
    city: "Bucharest",
    region: "Bucharest",
    latitude: 44.4440,
    longitude: 26.0975,
    website: "https://www.mybpilates.ro"
  },
  {
    activity_id: 133,
    activity_name: "Bucharest Climbing Gym Session",
    venue_name: "Climb Again Climbing Centre (Berceni)",
    full_address: "Șoseaua Berceni 8, Sector 4, București 041914, Romania",
    city: "Bucharest",
    region: "Bucharest",
    latitude: 44.3865,
    longitude: 26.1240,
    website: "https://www.climbagain.ro"
  },
  {
    activity_id: 134,
    activity_name: "Trampoline Park Session (Bucharest)",
    venue_name: "Cyberjump ParkLake",
    full_address: "Strada Liviu Rebreanu 4, ParkLake Shopping Center (Level -2), București 031749, Romania",
    city: "Bucharest",
    region: "Bucharest",
    latitude: 44.4175,
    longitude: 26.1664,
    website: "https://parklake.cyberjump.ro/"
  },
  {
    activity_id: 135,
    activity_name: "Ice Skating at Bucharest Mall",
    venue_name: "București Mall – Seasonal Ice Rink",
    full_address: "Calea Vitan 55–59, București 031282, Romania",
    city: "Bucharest",
    region: "Bucharest",
    latitude: 44.4160,
    longitude: 26.1350,
    website: "https://www.bucurestimall.ro"
  }
];

async function importVenues() {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    console.log('🚀 Starting venue import for batches 8 & 9 (17 venues)...\n');
    
    let venuesInserted = 0;
    let activitiesUpdated = 0;
    let skipped = 0;
    
    for (const venue of venueData) {
      // Check if activity exists
      const activityCheck = await client.query(
        'SELECT id FROM activities WHERE id = $1',
        [venue.activity_id]
      );
      
      if (activityCheck.rows.length === 0) {
        console.log(`⚠️  Skipped activity ${venue.activity_id} - does not exist in activities table`);
        skipped++;
        continue;
      }
      
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
    if (skipped > 0) {
      console.log(`   Skipped (activity not found): ${skipped}`);
    }
    
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
