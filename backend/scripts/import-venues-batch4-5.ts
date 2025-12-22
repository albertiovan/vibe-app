import { Pool } from 'pg';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env') });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const venueData = [
  // Batch 4: Activities 44, 46, 51, 53-59, 66, 76, 98, 100, 103, 112
  {
    activity_id: 44,
    activity_name: "Constanța Seafood Tasting Experience",
    venue_name: "Juicy Crab Constanța",
    full_address: "Strada Mircea cel Bătrân 39, Constanța 900178, Romania",
    city: "Constanța",
    region: "Constanța",
    latitude: 44.1775,
    longitude: 28.6544,
    website: "https://constanta.juicycrab.ro"
  },
  {
    activity_id: 46,
    activity_name: "Salsa/Bachata Beginner Class (Bucharest)",
    venue_name: "Ginga – Cursuri Kizomba, Bachata, Salsa",
    full_address: "Calea Victoriei 21, București, Romania",
    city: "Bucharest",
    region: "Bucharest",
    latitude: 44.4359,
    longitude: 26.0973,
    website: "https://ginga.ro"
  },
  {
    activity_id: 51,
    activity_name: "Romanian Language Crash Course (Bucharest)",
    venue_name: "ROLANG School – Romanian Courses",
    full_address: "Strada Ion Brezoianu 4, București 050023, Romania",
    city: "Bucharest",
    region: "Bucharest",
    latitude: 44.4353,
    longitude: 26.0955,
    website: "https://rolang.ro"
  },
  {
    activity_id: 53,
    activity_name: "Barista Basics Workshop (Cluj)",
    venue_name: "Il Caffé – Barista Course by Bartending Institute",
    full_address: "Strada Constantin Brâncuși 12A, Cluj-Napoca, Romania",
    city: "Cluj-Napoca",
    region: "Cluj",
    latitude: 46.758,
    longitude: 23.616,
    website: "https://bartendinginstitute.ro"
  },
  {
    activity_id: 54,
    activity_name: "Sibiu Traditional Cooking Class",
    venue_name: "Sibiu Tour Guide – Cooking Lessons (Oak Tree Travel)",
    full_address: "Aleea Sibiel 2, Sibiu 550148, Romania",
    city: "Sibiu",
    region: "Sibiu",
    latitude: 45.7879,
    longitude: 24.1422,
    website: "https://sibiutourguide.com"
  },
  {
    activity_id: 56,
    activity_name: "Sound Bath & Breathwork (Bucharest)",
    venue_name: "Narandi Yoga Studio",
    full_address: "Strada Grâului 21, Sector 4, București 041273, Romania",
    city: "Bucharest",
    region: "Bucharest",
    latitude: 44.392,
    longitude: 26.112,
    website: "https://narandi.ro"
  },
  {
    activity_id: 57,
    activity_name: "Halotherapy & Mindful Walk – Turda Salt Mine",
    venue_name: "Salina Turda",
    full_address: "Aleea Durgăului 7, Turda 401106, Romania",
    city: "Turda",
    region: "Cluj",
    latitude: 46.588833,
    longitude: 23.787632,
    website: "https://www.salinaturda.eu"
  },
  {
    activity_id: 58,
    activity_name: "Salt Mine Wellness Session – Praid",
    venue_name: "Salina Praid",
    full_address: "Strada Minei 44, Praid 537240, Romania",
    city: "Praid",
    region: "Harghita",
    latitude: 46.552,
    longitude: 25.129,
    website: "https://www.salinapraid.ro"
  },
  {
    activity_id: 59,
    activity_name: "Therme Sauna Rituals & Mindful Heat",
    venue_name: "Therme București",
    full_address: "Calea București 1K, Balotești 077015, Romania",
    city: "Balotești",
    region: "Ilfov",
    latitude: 44.5859,
    longitude: 26.0668,
    website: "https://therme.ro"
  },
  {
    activity_id: 66,
    activity_name: "Retezat National Park Day Hike",
    venue_name: "Cabana Pietrele – Retezat National Park",
    full_address: "Cabana Pietrele, Parcul Național Retezat, Nucșoara, Județul Hunedoara, Romania",
    city: "Nucșoara",
    region: "Hunedoara",
    latitude: 45.40563,
    longitude: 22.87772,
    website: "http://www.pietrele.ro"
  },
  {
    activity_id: 76,
    activity_name: "Couples' Photoshoot in Old Town",
    venue_name: "Strada Lipscani – Old Town Bucharest",
    full_address: "Strada Lipscani 27, București 030167, Romania",
    city: "Bucharest",
    region: "Bucharest",
    latitude: 44.43217,
    longitude: 26.100057,
    website: "https://en.wikipedia.org/wiki/Lipscani"
  },
  {
    activity_id: 98,
    activity_name: "Contemporary Jewelry Making (Assamblage Institute)",
    venue_name: "Assamblage – Institutul de Artă și Design",
    full_address: "Strada Dimitrie Racoviță 18, București, Romania",
    city: "Bucharest",
    region: "Bucharest",
    latitude: 44.4398,
    longitude: 26.114,
    website: "https://www.assamblage.ro"
  },
  {
    activity_id: 100,
    activity_name: "Intro to Woodworking (NOD Makerspace)",
    venue_name: "NOD Makerspace",
    full_address: "Splaiul Unirii 160, Industria Bumbacului, Sector 4, București, Romania",
    city: "Bucharest",
    region: "Bucharest",
    latitude: 44.4179,
    longitude: 26.1159,
    website: "https://nodmakerspace.ro"
  },
  {
    activity_id: 103,
    activity_name: "Specialty Coffee Cupping Session",
    venue_name: "Origo Coffee Shop",
    full_address: "Strada Lipscani 9, București 050971, Romania",
    city: "Bucharest",
    region: "Bucharest",
    latitude: 44.4323,
    longitude: 26.0995,
    website: "https://www.origocoffee.ro"
  },
  
  // Batch 5: Activities 71, 104-106 (Note: 108, 111, 112 don't exist in activities table)
  {
    activity_id: 71,
    activity_name: "Bucharest Language Exchange Social",
    venue_name: "Pardon Pub & More",
    full_address: "Strada C. A. Rosetti 10, București 030167, Romania",
    city: "Bucharest",
    region: "Bucharest",
    latitude: 44.4404,
    longitude: 26.0985,
    website: "https://www.tripadvisor.co.uk/Restaurant_Review-g294458-d26822254-Reviews-Pardon_Pub_More-Bucharest.html"
  },
  {
    activity_id: 104,
    activity_name: "Bucharest Pub Quiz Night",
    venue_name: "Mojo Music Club",
    full_address: "Strada Lipscani 69, București 030167, Romania",
    city: "Bucharest",
    region: "Bucharest",
    latitude: 44.4324,
    longitude: 26.0989,
    website: "http://mojomusic.ro/"
  },
  {
    activity_id: 105,
    activity_name: "Karaoke Night in Bucharest",
    venue_name: "Mojo Music Club",
    full_address: "Strada Lipscani 69, București 030167, Romania",
    city: "Bucharest",
    region: "Bucharest",
    latitude: 44.4324,
    longitude: 26.0989,
    website: "http://mojomusic.ro/"
  },
  {
    activity_id: 106,
    activity_name: "Board Game Café Evening (Bucharest)",
    venue_name: "Snakes & Wizards Board Game Cafe",
    full_address: "Strada Ilarie Chendi 5, București 021504, Romania",
    city: "Bucharest",
    region: "Bucharest",
    latitude: 44.439677,
    longitude: 26.13094,
    website: "https://www.facebook.com/SnakesandWizards"
  }
];

async function importVenues() {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    console.log('🚀 Starting venue import for batches 4 & 5 (18 venues)...\n');
    
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
