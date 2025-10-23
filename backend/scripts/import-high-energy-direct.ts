/**
 * Direct import of high-energy activities
 * Run: npx tsx backend/scripts/import-high-energy-direct.ts
 */

import { Pool } from 'pg';
import dotenv from 'dotenv';
import { resolve } from 'path';

dotenv.config({ path: resolve(process.cwd(), '.env') });

// Sample activities - add all 40+ from your data
const SAMPLE_ACTIVITIES = [
  {
    slug: 'bucharest-basketball-court-rau',
    name: 'Basketball Court Booking (Full Court Run)',
    category: 'sports',
    description: "Call your friends, lace up, and run full-court games with a scoreboard and glass backboards. You'll sprint, cut, box-out, and feel that competitive buzz when the net snaps. Book the slot, warm up with layup lines, then rotate runs—winner stays. Perfect for groups who want real game intensity without waiting for a free hoop.",
    city: 'Bucharest',
    region: 'București',
    latitude: 44.472,
    longitude: 26.071,
    duration_min: 60,
    duration_max: 120,
    seasonality: ['all'],
    indoor_outdoor: 'indoor',
    energy_level: 'high',
    tags: ['category:sports', 'experience_level:mixed', 'mood:adrenaline', 'mood:social', 'mood:focused', 'terrain:urban', 'equipment:rental-gear', 'context:friends', 'context:team', 'context:group', 'requirement:booking-required', 'risk_level:low', 'weather_fit:all_weather', 'time_of_day:evening', 'time_of_day:daytime', 'travel_time_band:in-city', 'skills:technique', 'cost_band:$$'],
    source_url: 'https://www.facebook.com/rausportscenter/'
  },
  {
    slug: 'bucharest-indoor-volleyball-iris',
    name: 'Indoor Volleyball Session',
    category: 'sports',
    description: "Bump, set, spike on a proper court with fixed nets and marked lines. Expect fast defensive reads and explosive jumps at the net. Book a court, split into 6-a-side, rotate servers, and chase that satisfying clean contact. Great for mixed levels—warm-up drills first, then games until your legs feel springy.",
    city: 'Bucharest',
    region: 'București',
    latitude: 44.428,
    longitude: 26.154,
    duration_min: 60,
    duration_max: 120,
    seasonality: ['all'],
    indoor_outdoor: 'indoor',
    energy_level: 'high',
    tags: ['category:sports', 'experience_level:mixed', 'mood:adrenaline', 'mood:social', 'terrain:urban', 'equipment:rental-gear', 'context:friends', 'context:team', 'context:group', 'requirement:booking-required', 'risk_level:low', 'weather_fit:all_weather', 'time_of_day:evening', 'time_of_day:daytime', 'travel_time_band:in-city', 'skills:technique', 'cost_band:$$'],
    source_url: 'https://irisarena.ro/'
  },
  {
    slug: 'bucharest-boxing-gym-session',
    name: 'Boxing Gym Session (Pads & Bag)',
    category: 'sports',
    description: "Wrap your hands, learn stance, guard and footwork. You'll work jab-cross-hook on pads and heavy bag rounds that burn lungs and sharpen focus. It's a mental and physical reset: you leave sweaty, proud, and a little calmer because you hit something—on purpose and with form.",
    city: 'Bucharest',
    region: 'București',
    latitude: 44.440,
    longitude: 26.161,
    duration_min: 60,
    duration_max: 90,
    seasonality: ['all'],
    indoor_outdoor: 'indoor',
    energy_level: 'high',
    tags: ['category:sports', 'experience_level:beginner', 'mood:adrenaline', 'mood:focused', 'terrain:urban', 'equipment:provided', 'context:solo', 'context:small-group', 'context:friends', 'requirement:booking-required', 'risk_level:moderate', 'weather_fit:all_weather', 'time_of_day:daytime', 'time_of_day:evening', 'travel_time_band:in-city', 'skills:technique', 'cost_band:$$'],
    source_url: 'https://stanboxacademy.ro/'
  },
];

async function importActivities() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL || 'postgresql://localhost/vibe_app'
  });
  
  console.log('🚀 Importing high-energy activities...\n');
  
  try {
    let imported = 0;
    
    for (const activity of SAMPLE_ACTIVITIES) {
      const result = await pool.query(`
        INSERT INTO activities (
          slug, name, category, description, city, region,
          latitude, longitude, duration_min, duration_max,
          seasonality, indoor_outdoor, energy_level, tags,
          maps_url
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15
        )
        ON CONFLICT (slug) DO UPDATE SET
          name = EXCLUDED.name,
          description = EXCLUDED.description,
          tags = EXCLUDED.tags,
          energy_level = EXCLUDED.energy_level
        RETURNING id
      `, [
        activity.slug,
        activity.name,
        activity.category,
        activity.description,
        activity.city,
        activity.region,
        activity.latitude,
        activity.longitude,
        activity.duration_min,
        activity.duration_max,
        activity.seasonality,
        activity.indoor_outdoor,
        activity.energy_level,
        activity.tags,
        `https://www.google.com/maps?q=${activity.latitude},${activity.longitude}`
      ]);
      
      console.log(`✅ ${activity.name} (${activity.category}, energy:${activity.energy_level})`);
      imported++;
    }
    
    console.log(`\n📊 Imported ${imported} sample activities`);
    console.log(`\n⚠️  This is just 3 samples!`);
    console.log(`   To import all 40+, add them to the SAMPLE_ACTIVITIES array\n`);
    
    // Show stats
    const stats = await pool.query(`
      SELECT energy_level, COUNT(*) as count
      FROM activities
      GROUP BY energy_level
      ORDER BY energy_level
    `);
    
    console.log(`📊 Current Energy Distribution:`);
    stats.rows.forEach(row => {
      console.log(`   ${row.energy_level}: ${row.count} activities`);
    });
    
  } catch (error) {
    console.error('❌ Import failed:', error);
    throw error;
  } finally {
    await pool.end();
  }
}

importActivities()
  .then(() => {
    console.log('\n✅ Sample import complete!\n');
    console.log('📝 To import all activities:');
    console.log('   1. Add all your activity objects to SAMPLE_ACTIVITIES array');
    console.log('   2. Run this script again\n');
    process.exit(0);
  })
  .catch(error => {
    console.error('\n❌ Fatal error:', error);
    process.exit(1);
  });
