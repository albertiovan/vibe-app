import { Pool } from 'pg';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env') });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Missing activities with their venue data
const missingActivities = [
  // From batch 4-5
  {
    activity_id: 107,
    activity_name: "Bucharest Trivia Night at a Craft Beer Bar",
    description: "Test your knowledge at a fun trivia night in one of Bucharest's best craft beer bars. Gather your team, enjoy local brews, and compete for prizes in a lively atmosphere.",
    category: "social",
    energy_level: "medium",
    duration_min: 120,
    duration_max: 180,
    indoor_outdoor: "indoor",
    tags: ["trivia", "pub", "craft-beer", "social", "team-activity"],
    venue: {
      name: "Hop Hooligans Taproom",
      address: "Strada Jean Louis Calderon 49, București 030167, Romania",
      city: "Bucharest",
      region: "Bucharest",
      latitude: 44.4379,
      longitude: 26.1066,
      website: "https://www.hophooligans.ro/pages/taproom"
    }
  },
  {
    activity_id: 109,
    activity_name: "Pottery Wheel Taster (Bucharest)",
    description: "Get hands-on with clay at this beginner-friendly pottery wheel session. Learn basic techniques, create your own piece, and discover the meditative art of ceramics.",
    category: "creative",
    energy_level: "low",
    duration_min: 120,
    duration_max: 180,
    indoor_outdoor: "indoor",
    tags: ["pottery", "ceramics", "workshop", "creative", "hands-on"],
    venue: {
      name: "ArtTime Atelier de Creatie",
      address: "Strada Popa Nan 10, Sector 2, București 021178, Romania",
      city: "Bucharest",
      region: "Bucharest",
      latitude: 44.435,
      longitude: 26.119,
      website: "https://arttime.ro/olarit/"
    }
  },
  {
    activity_id: 110,
    activity_name: "Candle-Making Workshop (Bucharest)",
    description: "Create your own custom scented candles in this hands-on workshop. Learn about wax types, fragrance blending, and candle-making techniques while crafting beautiful candles to take home.",
    category: "creative",
    energy_level: "low",
    duration_min: 90,
    duration_max: 150,
    indoor_outdoor: "indoor",
    tags: ["candle-making", "workshop", "creative", "crafts", "aromatherapy"],
    venue: {
      name: "Odyssée Candles – The Fragrant Garden",
      address: "Strada Silvestru 63A, Sector 2, București 020736, Romania",
      city: "Bucharest",
      region: "Bucharest",
      latitude: 44.447,
      longitude: 26.1205,
      website: "https://www.odysseecandles.com"
    }
  },
  
  // From batch 8-9
  {
    activity_id: 113,
    activity_name: "Sunset Picnic in Herăstrău Park",
    description: "Enjoy a romantic sunset picnic in Bucharest's largest park. Bring your favorite foods, a blanket, and watch the sky transform into beautiful colors over the lake.",
    category: "romance",
    energy_level: "low",
    duration_min: 90,
    duration_max: 180,
    indoor_outdoor: "outdoor",
    tags: ["picnic", "sunset", "park", "romantic", "nature"],
    venue: {
      name: "Parcul Regele Mihai I al României (Herăstrău Park)",
      address: "Parcul Regele Mihai I al României, Sector 1, București, Romania",
      city: "Bucharest",
      region: "Bucharest",
      latitude: 44.480621,
      longitude: 26.083762,
      website: "https://herastrauparc.ro"
    }
  },
  {
    activity_id: 114,
    activity_name: "Rooftop Dinner with City Views (Bucharest)",
    description: "Dine 36 floors above Bucharest with spectacular panoramic city views. Enjoy contemporary cuisine in an elegant setting at one of the city's highest restaurants.",
    category: "romance",
    energy_level: "low",
    duration_min: 120,
    duration_max: 180,
    indoor_outdoor: "indoor",
    tags: ["rooftop", "dinner", "fine-dining", "romantic", "city-views"],
    venue: {
      name: "NOR Sky Casual Restaurant (SkyTower)",
      address: "SkyTower, Calea Floreasca 246C, Etaj 36, București 014476, Romania",
      city: "Bucharest",
      region: "Bucharest",
      latitude: 44.447924,
      longitude: 26.097879,
      website: "https://www.norbucharest.ro"
    }
  },
  {
    activity_id: 115,
    activity_name: "Private Cooking Class for Two (Bucharest)",
    description: "Learn to cook together in an intimate private cooking class. Master new recipes, cooking techniques, and enjoy the meal you create in a romantic setting.",
    category: "romance",
    energy_level: "medium",
    duration_min: 150,
    duration_max: 210,
    indoor_outdoor: "indoor",
    tags: ["cooking-class", "couples", "romantic", "culinary", "private"],
    venue: {
      name: "Société Gourmet – Cooking Classes & Event House",
      address: "Strada Marcel Iancu 9, București 020757, Romania",
      city: "Bucharest",
      region: "Bucharest",
      latitude: 44.4505,
      longitude: 26.118,
      website: "https://societegourmet.ro"
    }
  },
  {
    activity_id: 116,
    activity_name: "Stargazing Night near Bucharest",
    description: "Escape the city lights for an evening of stargazing by Snagov Lake. Bring a telescope or just lie back and marvel at the night sky in peaceful surroundings.",
    category: "romance",
    energy_level: "low",
    duration_min: 120,
    duration_max: 240,
    indoor_outdoor: "outdoor",
    tags: ["stargazing", "astronomy", "romantic", "nature", "night"],
    venue: {
      name: "Snagov Club – Lakeside Hotel & Gardens",
      address: "Aleea Nufărului 1B, Snagov 077165, Romania",
      city: "Snagov",
      region: "Ilfov",
      latitude: 44.712,
      longitude: 26.19,
      website: "https://snagovclub.ro/en/"
    }
  },
  {
    activity_id: 117,
    activity_name: "Bucharest Ghost Tour (Old Town)",
    description: "Explore Bucharest's haunted history on this spine-tingling walking tour. Hear tales of legends, mysteries, and supernatural encounters in the atmospheric Old Town.",
    category: "culture",
    energy_level: "medium",
    duration_min: 90,
    duration_max: 120,
    indoor_outdoor: "outdoor",
    tags: ["ghost-tour", "walking-tour", "history", "old-town", "spooky"],
    venue: {
      name: "Ion Luca Caragiale National Theatre – Ghost Tour Meeting Point",
      address: "Bulevardul Nicolae Bălcescu 2, București 010051, Romania",
      city: "Bucharest",
      region: "Bucharest",
      latitude: 44.4354,
      longitude: 26.1019,
      website: "https://bucharestfreewalkingtour.com"
    }
  },
  {
    activity_id: 118,
    activity_name: "Bucharest Food Market Tour (Obor/Dorobanți)",
    description: "Discover authentic Romanian flavors at Bucharest's largest traditional market. Sample local products, meet vendors, and learn about Romanian culinary traditions.",
    category: "culinary",
    energy_level: "medium",
    duration_min: 120,
    duration_max: 180,
    indoor_outdoor: "indoor",
    tags: ["food-tour", "market", "local-cuisine", "tasting", "cultural"],
    venue: {
      name: "Piața Obor (Obor Market)",
      address: "Strada Ziduri Moși 4, Sector 2, București 077085, Romania",
      city: "Bucharest",
      region: "Bucharest",
      latitude: 44.449911,
      longitude: 26.124169,
      website: "https://piataoborbucuresti.ro"
    }
  },
  {
    activity_id: 119,
    activity_name: "Bucharest Vintage Shopping Tour",
    description: "Hunt for unique treasures on a curated vintage shopping tour. Visit the best vintage stores, antique shops, and concept stores in Bucharest's most charming neighborhoods.",
    category: "culture",
    energy_level: "medium",
    duration_min: 120,
    duration_max: 180,
    indoor_outdoor: "indoor",
    tags: ["shopping", "vintage", "antiques", "fashion", "culture"],
    venue: {
      name: "Cărturești Carusel – Concept Store & Bookshop",
      address: "Strada Lipscani 55, București 030033, Romania",
      city: "Bucharest",
      region: "Bucharest",
      latitude: 44.4312,
      longitude: 26.102,
      website: "https://carturesti.ro"
    }
  },
  {
    activity_id: 120,
    activity_name: "Bucharest Architectural Walking Tour",
    description: "Explore Bucharest's architectural gems from Belle Époque to Communist era. Learn about the city's fascinating architectural evolution with an expert guide.",
    category: "culture",
    energy_level: "medium",
    duration_min: 120,
    duration_max: 180,
    indoor_outdoor: "outdoor",
    tags: ["architecture", "walking-tour", "history", "culture", "guided"],
    venue: {
      name: "Starbucks – Hanul lui Manuc (Bucharest Architecture Tour Meeting Point)",
      address: "Strada Franceză 62–64, București 030106, Romania",
      city: "Bucharest",
      region: "Bucharest",
      latitude: 44.4303,
      longitude: 26.104,
      website: "https://romaniastepbystep.com/bucharest-architecture-tour/"
    }
  },
  {
    activity_id: 121,
    activity_name: "Bucharest Communist History Tour",
    description: "Step back into Romania's communist past with a visit to Ceaușescu's opulent mansion. Discover the lavish lifestyle of the dictator and learn about this pivotal period in Romanian history.",
    category: "culture",
    energy_level: "low",
    duration_min: 90,
    duration_max: 120,
    indoor_outdoor: "indoor",
    tags: ["history", "museum", "communist-era", "guided-tour", "educational"],
    venue: {
      name: "Palatul Primăverii (Ceaușescu Mansion)",
      address: "Bulevardul Primăverii 50, București 011975, Romania",
      city: "Bucharest",
      region: "Bucharest",
      latitude: 44.4726,
      longitude: 26.0979,
      website: "https://palatulprimaverii.ro"
    }
  },
  {
    activity_id: 122,
    activity_name: "Bucharest Jewish Heritage Tour",
    description: "Explore Bucharest's rich Jewish heritage and history. Visit historic synagogues, learn about the community's contributions, and discover stories of resilience and culture.",
    category: "culture",
    energy_level: "low",
    duration_min: 120,
    duration_max: 180,
    indoor_outdoor: "both",
    tags: ["heritage", "history", "synagogue", "cultural", "guided-tour"],
    venue: {
      name: "Great Synagogue (Sinagoga Mare)",
      address: "Strada Vasile Adamache 11, București 030167, Romania",
      city: "Bucharest",
      region: "Bucharest",
      latitude: 44.429983,
      longitude: 26.108321,
      website: "https://religiana.com/great-synagogue-bucharest"
    }
  },
  {
    activity_id: 126,
    activity_name: "Pilates Class (Bucharest)",
    description: "Strengthen your core and improve flexibility in a professional Pilates class. Suitable for all levels, with expert instructors guiding you through mat and equipment exercises.",
    category: "fitness",
    energy_level: "medium",
    duration_min: 60,
    duration_max: 90,
    indoor_outdoor: "indoor",
    tags: ["pilates", "fitness", "wellness", "core-strength", "flexibility"],
    venue: {
      name: "MYB Pilates",
      address: "Strada Vasile Alecsandri 12, București 010639, Romania",
      city: "Bucharest",
      region: "Bucharest",
      latitude: 44.4440,
      longitude: 26.0975,
      website: "https://www.mybpilates.ro"
    }
  }
];

async function importActivitiesAndVenues() {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    console.log(`🚀 Starting import of ${missingActivities.length} missing activities and their venues...\n`);
    
    let activitiesCreated = 0;
    let venuesCreated = 0;
    
    for (const data of missingActivities) {
      // Insert activity
      const activityResult = await client.query(
        `INSERT INTO activities (
          id, name, description, category, energy_level, 
          duration_min, duration_max, indoor_outdoor, tags,
          city, region, latitude, longitude, website,
          created_at, updated_at
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, NOW(), NOW())
        RETURNING id`,
        [
          data.activity_id,
          data.activity_name,
          data.description,
          data.category,
          data.energy_level,
          data.duration_min,
          data.duration_max,
          data.indoor_outdoor,
          data.tags,
          data.venue.city,
          data.venue.region,
          data.venue.latitude,
          data.venue.longitude,
          data.venue.website
        ]
      );
      
      console.log(`✅ Created activity: ${data.activity_name} (ID: ${activityResult.rows[0].id})`);
      activitiesCreated++;
      
      // Insert venue
      const venueResult = await client.query(
        `INSERT INTO venues (
          activity_id, name, address, city, region, 
          latitude, longitude, website,
          created_at, updated_at
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW())
        RETURNING id`,
        [
          data.activity_id,
          data.venue.name,
          data.venue.address,
          data.venue.city,
          data.venue.region,
          data.venue.latitude,
          data.venue.longitude,
          data.venue.website
        ]
      );
      
      console.log(`   📍 Created venue: ${data.venue.name} (ID: ${venueResult.rows[0].id})`);
      venuesCreated++;
      console.log('');
    }
    
    await client.query('COMMIT');
    
    console.log('✨ Import complete!');
    console.log(`   Activities created: ${activitiesCreated}`);
    console.log(`   Venues created: ${venuesCreated}`);
    
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Error importing activities and venues:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

importActivitiesAndVenues().catch(console.error);
