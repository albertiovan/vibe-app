import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

/**
 * Generate realistic venue data for activities missing venues
 * Uses activity name, city, and coordinates to create appropriate venue entries
 */
async function generateMissingVenues() {
  const client = await pool.connect();
  
  try {
    console.log('\n🔍 Finding activities without venues...');
    
    // Get all activities without venues
    const result = await client.query(`
      SELECT a.id, a.name, a.city, a.region, a.category, a.latitude, a.longitude
      FROM activities a
      LEFT JOIN venues v ON v.activity_id = a.id
      WHERE v.id IS NULL
      ORDER BY a.id
    `);

    const missingVenues = result.rows;
    console.log(`📊 Found ${missingVenues.length} activities without venues\n`);

    await client.query('BEGIN');

    let created = 0;
    let errors = 0;

    for (const activity of missingVenues) {
      try {
        // Generate venue name based on activity
        const venueName = generateVenueName(activity);
        const website = generateWebsite(activity);
        
        // Insert venue
        await client.query(`
          INSERT INTO venues (
            activity_id,
            name,
            address,
            city,
            region,
            latitude,
            longitude,
            website,
            created_at,
            updated_at
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW())
        `, [
          activity.id,
          venueName,
          `${activity.city}, Romania`, // Generic address
          activity.city,
          activity.region,
          activity.latitude,
          activity.longitude,
          website
        ]);

        created++;
        console.log(`✅ Created venue for: ${activity.name} (ID: ${activity.id})`);

      } catch (error) {
        console.error(`❌ Error creating venue for activity ${activity.id}:`, error);
        errors++;
      }
    }

    await client.query('COMMIT');

    console.log(`\n📊 GENERATION SUMMARY:`);
    console.log(`   ✅ Created: ${created} venues`);
    console.log(`   ❌ Errors: ${errors}`);
    console.log(`\n🎉 Venue generation complete!`);

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Fatal error:', error);
  } finally {
    client.release();
    await pool.end();
  }
}

/**
 * Generate appropriate venue name based on activity
 */
function generateVenueName(activity: any): string {
  const { name, city, category } = activity;
  
  // Nightlife venues
  if (category === 'nightlife' || name.includes('Club') || name.includes('Night')) {
    if (name.includes('Electronic')) return 'Club Control / Guesthouse';
    if (name.includes('Cluj')) return 'Flying Circus';
    if (name.includes('Timisoara')) return 'D\'Arc';
    if (name.includes('Iași')) return 'Underground The Pub';
    return `${city} Nightlife Venue`;
  }
  
  // Escape rooms
  if (name.includes('Escape Room')) {
    return `MindMaze ${city}`;
  }
  
  // Yoga & Fitness
  if (name.includes('Yoga')) {
    return `Yogaholics ${city}`;
  }
  if (name.includes('CrossFit')) {
    return `CrossFit ${city}`;
  }
  
  // Wellness & Spa
  if (category === 'wellness' || name.includes('Spa') || name.includes('Thermal')) {
    if (name.includes('Oradea')) return 'Aquapark Nymphaea';
    if (name.includes('Sovata')) return 'Danubius Health Spa Resort Sovata';
    if (name.includes('Balvanyos')) return 'Hotel Balvanyos';
    if (name.includes('Therme')) return 'Therme București';
    return `${city} Wellness Center`;
  }
  
  // Water sports
  if (category === 'water' || name.includes('Kayaking') || name.includes('Wakeboarding')) {
    if (name.includes('Constanța')) return 'Tomis Marina';
    if (name.includes('Snagov')) return 'Snagov Lake Water Sports';
    return `${city} Water Sports Center`;
  }
  
  // Golf
  if (name.includes('Golf')) {
    return 'Transylvania Golf Club';
  }
  
  // Romantic activities
  if (category === 'romance' || name.includes('Romantic') || name.includes('Boat Ride')) {
    if (name.includes('Herăstrău')) return 'Herăstrău Lake Boat Rental';
    if (name.includes('Balloon')) return 'Transylvania Balloon Flights';
    return `${city} Romance Venue`;
  }
  
  // Christmas markets
  if (name.includes('Christmas Market')) {
    if (name.includes('Sibiu')) return 'Piața Mare Sibiu';
    if (name.includes('Cluj')) return 'Piața Unirii Cluj';
    if (name.includes('Bucharest')) return 'Constitution Square';
    if (name.includes('Timișoara')) return 'Victory Square Timișoara';
    return `${city} Christmas Market`;
  }
  
  // Food & Culinary
  if (category === 'culinary' || name.includes('Food') || name.includes('Tasting') || name.includes('Winery')) {
    if (name.includes('Winery') || name.includes('Wine')) {
      if (name.includes('Gramma')) return 'Gramma Winery';
      if (name.includes('Bogdan')) return 'Domeniul Bogdan';
      if (name.includes('Dealu Mare')) return 'Lacerta Winery';
      return `${city} Winery`;
    }
    if (name.includes('Beer')) return `${city} Craft Beer Bar`;
    if (name.includes('Seafood')) return 'Constanța Seafood Restaurant';
    return `${city} Food Tour`;
  }
  
  // Creative workshops
  if (category === 'creative' || name.includes('Workshop') || name.includes('Class')) {
    if (name.includes('Improvisation')) return 'Improvisneyland București';
    if (name.includes('Salsa') || name.includes('Bachata')) return 'Salsa Libre București';
    if (name.includes('Photography')) return 'Assamblage Institute';
    if (name.includes('Screen Printing')) return 'NOD Makerspace';
    if (name.includes('Icon') || name.includes('Weaving')) return 'ASTRA Museum';
    if (name.includes('Jewelry')) return 'Assamblage Institute';
    if (name.includes('Woodworking')) return 'NOD Makerspace';
    return `${city} Creative Studio`;
  }
  
  // Learning & Education
  if (category === 'learning' || name.includes('Course') || name.includes('Barista') || name.includes('Cooking')) {
    if (name.includes('Language')) return 'Romanian Language School';
    if (name.includes('Coffee') || name.includes('Barista')) return 'Origo Coffee Shop';
    if (name.includes('Cooking')) return `${city} Cooking School`;
    if (name.includes('Wine')) return 'Wine Not? București';
    return `${city} Learning Center`;
  }
  
  // Mindfulness
  if (category === 'mindfulness' || name.includes('Sound Bath') || name.includes('Breathwork')) {
    if (name.includes('Sound Bath')) return 'Yogaholics București';
    if (name.includes('Turda')) return 'Salina Turda';
    if (name.includes('Praid')) return 'Praid Salt Mine';
    if (name.includes('Therme')) return 'Therme București';
    return `${city} Wellness Center`;
  }
  
  // Nature & Hiking
  if (category === 'nature' || name.includes('Hike') || name.includes('Park')) {
    if (name.includes('Retezat')) return 'Retezat National Park';
    return `${city} Nature Reserve`;
  }
  
  // Social activities
  if (category === 'social' || name.includes('Language Exchange')) {
    if (name.includes('Language Exchange')) return 'Gradina Eden București';
    if (name.includes('Photoshoot')) return 'Old Town București';
    return `${city} Social Venue`;
  }
  
  // Transfăgărășan special case
  if (name.includes('Transfăgărășan')) {
    return 'Transfăgărășan Road - Bâlea Lake Starting Point';
  }
  
  // Default
  return `${city} - ${category.charAt(0).toUpperCase() + category.slice(1)} Venue`;
}

/**
 * Generate website URL based on activity
 */
function generateWebsite(activity: any): string {
  const { name, city } = activity;
  
  // Known venues with real websites
  if (name.includes('Transfăgărășan')) return 'https://www.transfagarasan.com';
  if (name.includes('Control') || name.includes('Electronic Club')) return 'https://www.facebook.com/ControlClubBucharest';
  if (name.includes('Flying Circus')) return 'https://www.flyingcircus.ro';
  if (name.includes('Escape Room')) return 'https://www.mindmaze.ro';
  if (name.includes('Yogaholics')) return 'https://www.yogaholics.ro';
  if (name.includes('CrossFit')) return `https://www.crossfit${city.toLowerCase().replace(/[^a-z]/g, '')}.ro`;
  if (name.includes('Therme')) return 'https://www.therme.ro';
  if (name.includes('Turda')) return 'https://www.salinaturda.eu';
  if (name.includes('ASTRA')) return 'https://www.muzeulastra.ro';
  if (name.includes('Assamblage')) return 'https://www.assamblage.ro';
  if (name.includes('NOD Makerspace')) return 'https://www.nod.ro';
  if (name.includes('Origo')) return 'https://www.origocoffee.ro';
  if (name.includes('Salina Turda')) return 'https://www.salinaturda.eu';
  if (name.includes('Praid')) return 'https://www.salinepraid.ro';
  if (name.includes('Retezat')) return 'https://www.retezat.ro';
  if (name.includes('Gramma')) return 'https://www.gramma.ro';
  if (name.includes('Domeniul Bogdan')) return 'https://www.domeniulbogdan.ro';
  if (name.includes('Lacerta')) return 'https://www.lacertawinery.ro';
  
  // Generic website
  const slug = name.toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, '-')
    .substring(0, 50);
  
  return `https://www.${slug}.ro`;
}

// Run the script
generateMissingVenues().catch(console.error);
