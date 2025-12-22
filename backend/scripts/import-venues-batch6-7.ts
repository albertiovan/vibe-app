import { Pool } from 'pg';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env') });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const venueData = [
  // Batch 6: Activities 99, 107, 109, 110
  {
    activity_id: 99,
    activity_name: "Stained Glass (Tiffany Technique) Workshop",
    venue_name: "Tiffany Art – Atelier vitralii",
    full_address: "Strada Matei Voievod 20A, Sector 2, București 021455, Romania",
    city: "Bucharest",
    region: "Bucharest",
    latitude: 44.438464,
    longitude: 26.125336,
    website: "https://tiffany-art.ro"
  },
  {
    activity_id: 107,
    activity_name: "Bucharest Trivia Night at a Craft Beer Bar",
    venue_name: "Hop Hooligans Taproom",
    full_address: "Strada Jean Louis Calderon 49, București 030167, Romania",
    city: "Bucharest",
    region: "Bucharest",
    latitude: 44.4379,
    longitude: 26.1066,
    website: "https://www.hophooligans.ro/pages/taproom"
  },
  {
    activity_id: 109,
    activity_name: "Pottery Wheel Taster (Bucharest)",
    venue_name: "ArtTime Atelier de Creatie",
    full_address: "Strada Popa Nan 10, Sector 2, București 021178, Romania",
    city: "Bucharest",
    region: "Bucharest",
    latitude: 44.435,
    longitude: 26.119,
    website: "https://arttime.ro/olarit/"
  },
  {
    activity_id: 110,
    activity_name: "Candle-Making Workshop (Bucharest)",
    venue_name: "Odyssée Candles – The Fragrant Garden",
    full_address: "Strada Silvestru 63A, Sector 2, București 020736, Romania",
    city: "Bucharest",
    region: "Bucharest",
    latitude: 44.447,
    longitude: 26.1205,
    website: "https://www.odysseecandles.com"
  },
  
  // Batch 7: Activities 1953-1972
  {
    activity_id: 1953,
    activity_name: "Viniloteca: Wine & Wax Nights",
    venue_name: "Viniloteca",
    full_address: "Strada General Henri Berthelot 6, Timișoara 300195, Romania",
    city: "Timișoara",
    region: "Timiș",
    latitude: 45.748111,
    longitude: 21.219889,
    website: "https://www.facebook.com/viniloteca"
  },
  {
    activity_id: 1954,
    activity_name: "Moszkva Oradea Alt Scene",
    venue_name: "Moszkva Cafe Oradea",
    full_address: "Strada Moscovei 12, Oradea 410001, Romania",
    city: "Oradea",
    region: "Bihor",
    latitude: 47.0535,
    longitude: 21.928,
    website: "https://restaurantguru.com/Moszkva-Kavezo-Oradea"
  },
  {
    activity_id: 1955,
    activity_name: "Lokal Oradea Rooftop Sundowners",
    venue_name: "Lokal Oradea",
    full_address: "Strada Aurel Lazăr 1, Oradea 410043, Romania",
    city: "Oradea",
    region: "Bihor",
    latitude: 47.0568,
    longitude: 21.934,
    website: "https://theeuropeanbarguide.com/lokal-oradea/"
  },
  {
    activity_id: 1956,
    activity_name: "Music Pub Sibiu Rock Nights",
    venue_name: "Music Pub Sibiu",
    full_address: "Piața Mică 23, Sibiu 550182, Romania",
    city: "Sibiu",
    region: "Sibiu",
    latitude: 45.7971,
    longitude: 24.1519,
    website: "https://www.facebook.com/MusicPubSibiu/"
  },
  {
    activity_id: 1957,
    activity_name: "Underground The Pub: Iași Rock Cellar",
    venue_name: "Underground Pub Iași",
    full_address: "Bulevardul Ștefan cel Mare și Sfânt 69, Iași 700259, Romania",
    city: "Iași",
    region: "Iași",
    latitude: 47.1605,
    longitude: 27.586,
    website: "https://hiphopkulture.ro/evenimente/king-of-the-hills-iii-concert-phunk-b-underground-pub-iasi/"
  },
  {
    activity_id: 1958,
    activity_name: "Jazz & Blues Club Târgu Mureș",
    venue_name: "Jazz & Blues Club Târgu Mureș",
    full_address: "Strada Sinaia 3, Târgu Mureș 540042, Romania",
    city: "Târgu Mureș",
    region: "Mureș",
    latitude: 46.55219,
    longitude: 24.55707,
    website: "https://jazzandblues.ro/"
  },
  {
    activity_id: 1959,
    activity_name: "EGO Mamaia Beach Club Nights",
    venue_name: "Ego Club Mamaia",
    full_address: "Aleea Lamia 2, Mamaia 900001, Romania",
    city: "Constanța (Mamaia)",
    region: "Constanța",
    latitude: 44.2645,
    longitude: 28.6197,
    website: "https://www.facebook.com/EgoClubMamaia/"
  },
  {
    activity_id: 1960,
    activity_name: "Expirat Vama Veche Beach Sessions",
    venue_name: "Expirat Vama Veche",
    full_address: "Strada Falezei 32, Vama Veche 907163, Romania",
    city: "Vama Veche",
    region: "Constanța",
    latitude: 43.74955,
    longitude: 28.57692,
    website: "https://www.facebook.com/expiratvama/"
  },
  {
    activity_id: 1961,
    activity_name: "Tipografia Culture Bar",
    venue_name: "Tipografia",
    full_address: "Strada Postăvarului 1, Brașov 500024, Romania",
    city: "Brașov",
    region: "Brașov",
    latitude: 45.643,
    longitude: 25.589,
    website: "https://www.facebook.com/tipografia/"
  },
  {
    activity_id: 1962,
    activity_name: "Yolka Skybar Sundowners",
    venue_name: "Yolka Bar",
    full_address: "Piața Unirii 22, Cluj-Napoca 400015, Romania",
    city: "Cluj-Napoca",
    region: "Cluj",
    latitude: 46.7709,
    longitude: 23.5924,
    website: "https://www.facebook.com/YolkaCluj/"
  },
  {
    activity_id: 1963,
    activity_name: "VIP Glam Night at BOA - Beat of Angels",
    venue_name: "BOA – Beat of Angels Bucharest",
    full_address: "Șoseaua Pavel D. Kiseleff 32, București 011347, Romania",
    city: "Bucharest",
    region: "Bucharest",
    latitude: 44.4713,
    longitude: 26.0808,
    website: "https://boa-beatofangels.com/"
  },
  {
    activity_id: 1964,
    activity_name: "Premium Party at NOA – Nest of Angels",
    venue_name: "Club NOA – Nest of Angels",
    full_address: "Strada Republicii 109, Cluj-Napoca 400489, Romania",
    city: "Cluj-Napoca",
    region: "Cluj",
    latitude: 46.7597,
    longitude: 23.5853,
    website: "https://cluj.com/locatii/club-noa-nest-angels/"
  },
  {
    activity_id: 1965,
    activity_name: "High-End Night at Epic Society",
    venue_name: "Epic Society",
    full_address: "Strada Miresei 1, Timișoara 300642, Romania",
    city: "Timișoara",
    region: "Timiș",
    latitude: 45.7582,
    longitude: 21.2415,
    website: "https://www.epicsociety.ro/"
  },
  {
    activity_id: 1966,
    activity_name: "Metal Nights at Rockstadt",
    venue_name: "Rockstadt Club",
    full_address: "Strada Nicolae Titulescu 2P, Brașov 500010, Romania",
    city: "Brașov",
    region: "Brașov",
    latitude: 45.647,
    longitude: 25.6072,
    website: "https://rockstadt.ro/"
  },
  {
    activity_id: 1967,
    activity_name: "Live Jazz at Jazz & Blues Club",
    venue_name: "Jazz & Blues Club Târgu Mureș",
    full_address: "Strada Sinaia 3, Târgu Mureș 540042, Romania",
    city: "Târgu Mureș",
    region: "Mureș",
    latitude: 46.55219,
    longitude: 24.55707,
    website: "https://jazzandblues.ro/"
  },
  {
    activity_id: 1968,
    activity_name: "Concert Night at Doors Club",
    venue_name: "Doors Club",
    full_address: "Strada Traian 68A, Constanța 900725, Romania",
    city: "Constanța",
    region: "Constanța",
    latitude: 44.1803,
    longitude: 28.6405,
    website: "https://doorsclub.ro/"
  },
  {
    activity_id: 1969,
    activity_name: "Beach Club Night at EGO Mamaia",
    venue_name: "Ego Club Mamaia",
    full_address: "Aleea Lamia 2, Mamaia 900001, Romania",
    city: "Mamaia",
    region: "Constanța",
    latitude: 44.2645,
    longitude: 28.6197,
    website: "https://www.facebook.com/EgoClubMamaia/"
  },
  {
    activity_id: 1970,
    activity_name: "Fratelli Beach & Club – House by the Sea",
    venue_name: "Fratelli Beach & Club Mamaia",
    full_address: "Mamaia Nord, Mamaia 900001, Constanța, Romania",
    city: "Mamaia (Constanța)",
    region: "Constanța",
    latitude: 44.2726,
    longitude: 28.6383,
    website: "https://fratelli.ro/the-new-beginning-has-come-in-mamaia/"
  },
  {
    activity_id: 1971,
    activity_name: "Fratelli Iași – Luxe Mixed Music Night",
    venue_name: "Fratelli Lounge & Club Iași",
    full_address: "Strada Palas 5D, Iași 700045, Romania",
    city: "Iași",
    region: "Iași",
    latitude: 47.15568,
    longitude: 27.588694,
    website: "http://www.fratelli-iasi.ro/clubs/fratelli-lounge-club/"
  },
  {
    activity_id: 1972,
    activity_name: "Euphoria Music Hall – Big-Room Live & Party",
    venue_name: "Euphoria Music Hall",
    full_address: "Calea Mănăștur 2–6, Cluj-Napoca 400372, Romania",
    city: "Cluj-Napoca",
    region: "Cluj",
    latitude: 46.7726,
    longitude: 23.58,
    website: "https://euphoria.ro/restaurante-cluj/music-hall/"
  }
];

async function importVenues() {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    console.log('🚀 Starting venue import for batches 6 & 7 (24 venues)...\n');
    
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
    console.log(`   Skipped (activity not found): ${skipped}`);
    
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
