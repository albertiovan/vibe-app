import { Pool } from 'pg';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env') });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const venueData = [
  // Batch 2: Activities 24-35
  {
    activity_id: 24,
    activity_name: "Oradea Thermal Aqua Day",
    venue_name: "Aquapark Nymphaea Oradea",
    full_address: "Aleea Ștrandului 13B, Oradea 410051, Bihor, Romania",
    city: "Oradea",
    region: "Bihor",
    latitude: 47.052948,
    longitude: 21.952224,
    website: "https://aquapark-nymphaea.ro"
  },
  {
    activity_id: 25,
    activity_name: "Sovata Bear Lake & Spa Day",
    venue_name: "Ensana Sovata Health Spa Hotel",
    full_address: "Strada Trandafirilor 111, Sovata 545500, Mureș, Romania",
    city: "Sovata",
    region: "Mureș",
    latitude: 46.60209,
    longitude: 25.087767,
    website: "https://www.ensanahotels.com/sovata"
  },
  {
    activity_id: 26,
    activity_name: "Balvanyos Forest Spa Ritual",
    venue_name: "Balvanyos Resort – Grand Santerra Spa",
    full_address: "DN11C, km 23, Băile Balvanyos, Covasna, Romania",
    city: "Băile Balvanyos",
    region: "Covasna",
    latitude: 46.11711,
    longitude: 25.94357,
    website: "https://www.balvanyosresort.ro"
  },
  {
    activity_id: 27,
    activity_name: "Black Sea Coastal Kayaking Coaching",
    venue_name: "JT Watersports Mamaia",
    full_address: "Bulevardul Mamaia, Stațiunea Mamaia, Constanța, Romania",
    city: "Constanța",
    region: "Constanța",
    latitude: 44.225428,
    longitude: 28.627764,
    website: "https://jtwatersports.ro"
  },
  {
    activity_id: 28,
    activity_name: "Wakeboarding Session near Bucharest",
    venue_name: "iWake Romania – Wakeboard & Wakesurf Snagov",
    full_address: "Strada Hanul Vlasiei 1, Snagov 077165, Ilfov, Romania",
    city: "Snagov",
    region: "Ilfov",
    latitude: 44.510454,
    longitude: 26.202101,
    website: "https://www.iwake.ro"
  },
  {
    activity_id: 29,
    activity_name: "Intro to Golf in Transylvania",
    venue_name: "Transilvania Golf Club",
    full_address: "DN1/E81, Comuna Sânpaul, Cluj County, Romania",
    city: "Sânpaul",
    region: "Cluj",
    latitude: 46.880568,
    longitude: 23.397172,
    website: "https://transilvaniagolfclub.ro"
  },
  {
    activity_id: 30,
    activity_name: "Romantic Boat Ride on Herăstrău Lake",
    venue_name: "Debarcader Central Herăstrău – Miorița (ALPAB Boat Rental)",
    full_address: "Șoseaua Nordului 114–140, Sector 1, București, Romania",
    city: "Bucharest",
    region: "Bucharest",
    latitude: 44.47566,
    longitude: 26.07723,
    website: "https://alpab.ro/servicii-agrement/"
  },
  {
    activity_id: 31,
    activity_name: "Hot Air Balloon Flight near Cluj",
    venue_name: "Wonderland Cluj Resort – Hot Air Balloon",
    full_address: "Feleacu 5A–H, Cluj-Napoca 407270, Cluj County, Romania",
    city: "Cluj-Napoca",
    region: "Cluj",
    latitude: 46.72163,
    longitude: 23.58983,
    website: "https://wonderland.ro"
  },
  {
    activity_id: 32,
    activity_name: "Christmas Market Sibiu (Piața Mare)",
    venue_name: "Târgul de Crăciun din Sibiu – Piața Mare",
    full_address: "Piața Mare, Sibiu 550182, Romania",
    city: "Sibiu",
    region: "Sibiu",
    latitude: 45.796522,
    longitude: 24.151827,
    website: "https://targuldecraciun.ro"
  },
  {
    activity_id: 33,
    activity_name: "Christmas Market Cluj-Napoca (Piața Unirii)",
    venue_name: "Târgul de Crăciun Cluj-Napoca – Piața Unirii",
    full_address: "Piața Unirii, Cluj-Napoca 400113, Romania",
    city: "Cluj-Napoca",
    region: "Cluj",
    latitude: 46.769539,
    longitude: 23.589831,
    website: "https://www.targuldecraciuncluj.ro"
  },
  {
    activity_id: 34,
    activity_name: "Christmas Market Bucharest (Constitution Square)",
    venue_name: "Bucharest Christmas Market – Piața Constituției",
    full_address: "Piața Constituției, Sector 5, București, Romania",
    city: "Bucharest",
    region: "Bucharest",
    latitude: 44.42741,
    longitude: 26.09171,
    website: "https://www.bucharestchristmasmarket.ro"
  },
  {
    activity_id: 35,
    activity_name: "Christmas Market Timișoara (Victory Square)",
    venue_name: "Târgul de Crăciun Timișoara – Piața Victoriei",
    full_address: "Piața Victoriei, Timișoara, Romania",
    city: "Timișoara",
    region: "Timiș",
    latitude: 45.75385,
    longitude: 21.225808,
    website: "https://www.facebook.com/craciunTimisoara"
  },
  
  // Batch 3: Activities 38-55
  {
    activity_id: 38,
    activity_name: "Cluj-Napoca Street Food & Market Tasting",
    venue_name: "Piata Agroalimentara Mihai Viteazul",
    full_address: "Strada Ploiesti 8, Cluj-Napoca 400157, Romania",
    city: "Cluj-Napoca",
    region: "Cluj",
    latitude: 46.7726,
    longitude: 23.5943,
    website: "https://cluj.com/locatii/piata-agroalimentara-mihai-viteazul/"
  },
  {
    activity_id: 39,
    activity_name: "Sibiu Old Town Food Tour",
    venue_name: "Piața Mare (Grand Square) Sibiu",
    full_address: "Piața Mare, Sibiu 550163, Romania",
    city: "Sibiu",
    region: "Sibiu",
    latitude: 45.7973,
    longitude: 24.1516,
    website: "https://turism.sibiu.ro"
  },
  {
    activity_id: 40,
    activity_name: "Timișoara Craft Beer Tasting Crawl",
    venue_name: "Berăria 700",
    full_address: "Strada Piața 700, Timișoara 300080, Romania",
    city: "Timișoara",
    region: "Timiș",
    latitude: 45.7552,
    longitude: 21.227,
    website: "https://www.beraria700.ro"
  },
  {
    activity_id: 41,
    activity_name: "Gramma Winery Visit & Tasting (Iași)",
    venue_name: "Gramma Winery",
    full_address: "Strada Sfântul Ilie 95, Vișan 707041, Comuna Bârnova, Județul Iași, Romania",
    city: "Vișan",
    region: "Iași",
    latitude: 47.0949,
    longitude: 27.6076,
    website: "https://grammawines.ro"
  },
  {
    activity_id: 42,
    activity_name: "Domeniul Bogdan Organic Winery Tour",
    venue_name: "Crama Domeniul Bogdan",
    full_address: "Strada Triumfului 1, Medgidia 905600, Județul Constanța, Romania",
    city: "Medgidia",
    region: "Constanța",
    latitude: 44.25,
    longitude: 28.2833,
    website: "https://domeniulbogdan.ro"
  },
  {
    activity_id: 43,
    activity_name: "Dealu Mare Winery Trio (Lacerta/Serve/Budureasca)",
    venue_name: "Lacerta Winery",
    full_address: "Fintesti 127022, Comuna Tătaru, Județul Buzău, Romania",
    city: "Fințești",
    region: "Buzău",
    latitude: 45.0759,
    longitude: 26.3389,
    website: "https://lacertawinery.ro"
  },
  {
    activity_id: 45,
    activity_name: "Improvisation Theatre Workshop (Bucharest)",
    venue_name: "Teatrul Național București I.L. Caragiale",
    full_address: "Bulevardul Nicolae Bălcescu 2, București 010051, Romania",
    city: "Bucharest",
    region: "Bucharest",
    latitude: 44.4355,
    longitude: 26.1012,
    website: "https://www.tnb.ro"
  },
  {
    activity_id: 47,
    activity_name: "Cyanotype & Alternative Photography Workshop",
    venue_name: "Muzeul Național de Artă Contemporană (MNAC București)",
    full_address: "Strada Izvor 2-4, București 050563, Romania",
    city: "Bucharest",
    region: "Bucharest",
    latitude: 44.4275,
    longitude: 26.0875,
    website: "https://www.mnac.ro"
  },
  {
    activity_id: 48,
    activity_name: "Screen Printing Basics (Bucharest)",
    venue_name: "Muzeul Național de Artă Contemporană (MNAC București)",
    full_address: "Strada Izvor 2-4, București 050563, Romania",
    city: "Bucharest",
    region: "Bucharest",
    latitude: 44.4275,
    longitude: 26.0875,
    website: "https://www.mnac.ro"
  },
  {
    activity_id: 49,
    activity_name: "Icon on Glass Workshop (ASTRA Museum)",
    venue_name: "Muzeul Civilizației Populare Tradiționale ASTRA",
    full_address: "Strada Pădurea Dumbrava 16-20, Sibiu 550399, Romania",
    city: "Sibiu",
    region: "Sibiu",
    latitude: 45.7581,
    longitude: 24.1218,
    website: "https://muzeulastra.ro"
  },
  {
    activity_id: 50,
    activity_name: "Weaving on the Loom (ASTRA Museum)",
    venue_name: "Muzeul Civilizației Populare Tradiționale ASTRA",
    full_address: "Strada Pădurea Dumbrava 16-20, Sibiu 550399, Romania",
    city: "Sibiu",
    region: "Sibiu",
    latitude: 45.7581,
    longitude: 24.1218,
    website: "https://muzeulastra.ro"
  },
  {
    activity_id: 52,
    activity_name: "Specialty Coffee Brewing Class (Bucharest)",
    venue_name: "Origo Coffee Shop",
    full_address: "Strada Lipscani 9, București 030031, Romania",
    city: "Bucharest",
    region: "Bucharest",
    latitude: 44.4313,
    longitude: 26.0981,
    website: "https://origocoffee.ro"
  },
  {
    activity_id: 55,
    activity_name: "Intro to Romanian Wine (Bucharest)",
    venue_name: "Abel's Wine Bar & Shop",
    full_address: "Strada Nicolae Tonitza 10, București 030113, Romania",
    city: "Bucharest",
    region: "Bucharest",
    latitude: 44.4304,
    longitude: 26.0999,
    website: "https://abelswinebar.com"
  }
];

async function importVenues() {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    console.log('🚀 Starting venue import for batches 2 & 3 (25 venues)...\n');
    
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
