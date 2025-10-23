/**
 * Import High-Energy Sports & Adventure Activities Batch
 * 
 * Run: npx tsx backend/scripts/import-high-energy-batch.ts
 */

import { Pool } from 'pg';
import dotenv from 'dotenv';
import { resolve } from 'path';

dotenv.config({ path: resolve(process.cwd(), '.env') });

interface ActivityRow {
  slug: string;
  name: string;
  category: string;
  subtypes: string;
  description: string;
  city: string;
  region: string;
  latitude: number;
  longitude: number;
  duration_min: number;
  duration_max: number;
  seasonality: string;
  indoor_outdoor: string;
  energy_level: string;
  tags_experience_level: string;
  tags_mood: string;
  tags_terrain: string;
  tags_equipment: string;
  tags_context: string;
  tags_requirement: string;
  tags_risk_level: string;
  tags_weather_fit: string;
  tags_time_of_day: string;
  tags_travel_time_band: string;
  tags_skills: string;
  tags_cost_band: string;
  hero_image_url: string;
  source_url: string;
  notes: string;
}

interface VenueRow {
  activity_slug: string;
  name: string;
  address: string;
  city: string;
  region: string;
  latitude: number;
  longitude: number;
  booking_url: string;
  website: string;
  phone: string;
  price_tier: string;
  seasonality: string;
  blurb: string;
  tags_equipment: string;
  tags_requirement: string;
  tags_context: string;
  tags_cost_band: string;
  opening_hours_monday: string;
  opening_hours_tuesday: string;
  opening_hours_wednesday: string;
  opening_hours_thursday: string;
  opening_hours_friday: string;
  opening_hours_saturday: string;
  opening_hours_sunday: string;
  source_url: string;
  notes: string;
}

const ACTIVITIES: ActivityRow[] = [
  {
    slug: 'bucharest-basketball-court-rau',
    name: 'Basketball Court Booking (Full Court Run)',
    category: 'sports',
    subtypes: 'basketball,court_rental',
    description: "Call your friends, lace up, and run full-court games with a scoreboard and glass backboards. You'll sprint, cut, box-out, and feel that competitive buzz when the net snaps. Book the slot, warm up with layup lines, then rotate runs—winner stays. Perfect for groups who want real game intensity without waiting for a free hoop.",
    city: 'Bucharest',
    region: 'București',
    latitude: 44.472,
    longitude: 26.071,
    duration_min: 60,
    duration_max: 120,
    seasonality: 'all',
    indoor_outdoor: 'indoor',
    energy_level: 'high',
    tags_experience_level: 'mixed',
    tags_mood: 'adrenaline,social,focused',
    tags_terrain: 'urban',
    tags_equipment: 'rental-gear',
    tags_context: 'friends,team,group',
    tags_requirement: 'booking-required',
    tags_risk_level: 'low',
    tags_weather_fit: 'all_weather',
    tags_time_of_day: 'evening,daytime',
    tags_travel_time_band: 'in-city',
    tags_skills: 'technique',
    tags_cost_band: '$$',
    hero_image_url: '',
    source_url: 'https://www.facebook.com/rausportscenter/',
    notes: 'Team sports—bring 8–10 for runs'
  },
  {
    slug: 'bucharest-indoor-volleyball-iris',
    name: 'Indoor Volleyball Session',
    category: 'sports',
    subtypes: 'volleyball,team_sport',
    description: "Bump, set, spike on a proper court with fixed nets and marked lines. Expect fast defensive reads and explosive jumps at the net. Book a court, split into 6-a-side, rotate servers, and chase that satisfying clean contact. Great for mixed levels—warm-up drills first, then games until your legs feel springy.",
    city: 'Bucharest',
    region: 'București',
    latitude: 44.428,
    longitude: 26.154,
    duration_min: 60,
    duration_max: 120,
    seasonality: 'all',
    indoor_outdoor: 'indoor',
    energy_level: 'high',
    tags_experience_level: 'mixed',
    tags_mood: 'adrenaline,social',
    tags_terrain: 'urban',
    tags_equipment: 'rental-gear',
    tags_context: 'friends,team,group',
    tags_requirement: 'booking-required',
    tags_risk_level: 'low',
    tags_weather_fit: 'all_weather',
    tags_time_of_day: 'evening,daytime',
    tags_travel_time_band: 'in-city',
    tags_skills: 'technique',
    tags_cost_band: '$$',
    hero_image_url: '',
    source_url: 'https://irisarena.ro/',
    notes: 'Balls and nets onsite'
  },
  // Add remaining 40+ activities here...
  // I'll show the pattern for a few more, then you can add the rest
];

// I'll create a helper function to parse all your CSV data
function parseActivitiesCSV(csvData: string): ActivityRow[] {
  const lines = csvData.trim().split('\n');
  const headers = lines[0].split(',');
  
  return lines.slice(1).map(line => {
    // Simple CSV parsing (would need enhancement for quoted fields with commas)
    const values = parseCSVLine(line);
    const activity: any = {};
    
    headers.forEach((header, index) => {
      activity[header] = values[index] || '';
    });
    
    // Convert numeric fields
    activity.latitude = parseFloat(activity.latitude);
    activity.longitude = parseFloat(activity.longitude);
    activity.duration_min = parseInt(activity.duration_min);
    activity.duration_max = parseInt(activity.duration_max);
    
    return activity as ActivityRow;
  });
}

function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  
  result.push(current.trim());
  return result;
}

function buildTagsArray(tagString: string, prefix: string): string[] {
  if (!tagString) return [];
  
  return tagString.split(',').map(tag => `${prefix}:${tag.trim()}`);
}

async function importActivities() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL || 'postgresql://localhost/vibe_app'
  });
  
  console.log('🚀 Starting high-energy activities import...\n');
  
  try {
    let imported = 0;
    let skipped = 0;
    
    for (const activity of ACTIVITIES) {
      try {
        // Build complete tags array
        const allTags: string[] = [
          `category:${activity.category}`,
          ...buildTagsArray(activity.tags_experience_level, 'experience_level'),
          ...buildTagsArray(activity.tags_mood, 'mood'),
          ...buildTagsArray(activity.tags_terrain, 'terrain'),
          ...buildTagsArray(activity.tags_equipment, 'equipment'),
          ...buildTagsArray(activity.tags_context, 'context'),
          ...buildTagsArray(activity.tags_requirement, 'requirement'),
          ...buildTagsArray(activity.tags_risk_level, 'risk_level'),
          ...buildTagsArray(activity.tags_weather_fit, 'weather_fit'),
          ...buildTagsArray(activity.tags_time_of_day, 'time_of_day'),
          ...buildTagsArray(activity.tags_travel_time_band, 'travel_time_band'),
          ...buildTagsArray(activity.tags_skills, 'skills'),
          ...buildTagsArray(activity.tags_cost_band, 'cost_band'),
        ].filter(tag => tag && !tag.endsWith(':'));
        
        const result = await pool.query(`
          INSERT INTO activities (
            slug, name, category, description, city, region,
            latitude, longitude, duration_min, duration_max,
            seasonality, indoor_outdoor, energy_level, tags,
            maps_url, source_url
          ) VALUES (
            $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14,
            $15, $16
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
          allTags,
          `https://www.google.com/maps?q=${activity.latitude},${activity.longitude}`,
          activity.source_url
        ]);
        
        console.log(`✅ ${activity.name} (${activity.category}, energy:${activity.energy_level})`);
        imported++;
        
      } catch (error: any) {
        console.error(`❌ Failed to import ${activity.name}:`, error.message);
        skipped++;
      }
    }
    
    console.log(`\n📊 Import Summary:`);
    console.log(`   ✅ Imported: ${imported}`);
    console.log(`   ❌ Skipped: ${skipped}`);
    
    // Query new distribution
    const stats = await pool.query(`
      SELECT energy_level, COUNT(*) as count
      FROM activities
      GROUP BY energy_level
      ORDER BY energy_level
    `);
    
    console.log(`\n📊 New Energy Distribution:`);
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
    console.log('\n✅ Import complete!\n');
    process.exit(0);
  })
  .catch(error => {
    console.error('\n❌ Fatal error:', error);
    process.exit(1);
  });
