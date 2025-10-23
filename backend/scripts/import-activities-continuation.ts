/**
 * Import new activities and venues from continuation CSVs
 * Run: npx tsx backend/scripts/import-activities-continuation.ts
 */

import { Pool } from 'pg';
import { readFileSync } from 'fs';
import { parse } from 'csv-parse/sync';
import { join } from 'path';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: join(__dirname, '../.env') });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://localhost/vibe_app',
});

interface ActivityRow {
  slug: string;
  name: string;
  category: string;
  subtypes: string;
  description: string;
  city: string;
  region: string;
  latitude: string;
  longitude: string;
  duration_min: string;
  duration_max: string;
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
  latitude: string;
  longitude: string;
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

/**
 * Parse comma-separated tags into array format
 */
function parseTags(tagString: string): string[] {
  if (!tagString || tagString.trim() === '') return [];
  return tagString.split(',').map(t => t.trim()).filter(t => t);
}

/**
 * Combine all tags into the format expected by the database
 */
function buildTagsArray(row: ActivityRow): string[] {
  const allTags: string[] = [];
  
  // Category tag
  allTags.push(`category:${row.category}`);
  
  // Add prefixed tags from each column
  const tagMapping = {
    tags_experience_level: 'experience_level',
    tags_mood: 'mood',
    tags_terrain: 'terrain',
    tags_equipment: 'equipment',
    tags_context: 'context',
    tags_requirement: 'requirement',
    tags_risk_level: 'risk_level',
    tags_weather_fit: 'weather_fit',
    tags_time_of_day: 'time_of_day',
    tags_travel_time_band: 'travel_time_band',
    tags_skills: 'skills',
    tags_cost_band: 'cost_band',
  };
  
  for (const [csvColumn, prefix] of Object.entries(tagMapping)) {
    const value = (row as any)[csvColumn];
    if (value && value.trim()) {
      const tags = parseTags(value);
      tags.forEach(tag => {
        allTags.push(`${prefix}:${tag}`);
      });
    }
  }
  
  // Energy level
  if (row.energy_level) {
    allTags.push(`energy:${row.energy_level}`);
  }
  
  // Indoor/outdoor
  if (row.indoor_outdoor) {
    allTags.push(`indoor_outdoor:${row.indoor_outdoor}`);
  }
  
  // Seasonality
  if (row.seasonality) {
    const seasons = parseTags(row.seasonality);
    seasons.forEach(s => {
      if (s === 'all') {
        allTags.push('seasonality:all');
      } else {
        allTags.push(`seasonality:${s}`);
      }
    });
  }
  
  return [...new Set(allTags)]; // Remove duplicates
}

/**
 * Parse seasonality into array
 */
function parseSeasonality(seasonality: string): string[] {
  if (!seasonality || seasonality.trim() === '' || seasonality === 'all') {
    return ['spring', 'summer', 'fall', 'winter', 'year-round'];
  }
  
  if (seasonality === 'shoulder') {
    return ['spring', 'summer', 'fall'];
  }
  
  return parseTags(seasonality);
}

async function importActivities() {
  console.log('🔄 Starting import of continuation activities...\n');
  
  try {
    // Read activities CSV
    const activitiesCSV = readFileSync(
      join(__dirname, '../../activities_continuation.csv'),
      'utf-8'
    );
    
    const activities: ActivityRow[] = parse(activitiesCSV, {
      columns: true,
      skip_empty_lines: true,
      trim: true,
    });
    
    console.log(`📊 Found ${activities.length} activities to import\n`);
    
    let imported = 0;
    let skipped = 0;
    let errors = 0;
    
    for (const activity of activities) {
      try {
        // Check if activity already exists
        const existingCheck = await pool.query(
          'SELECT id FROM activities WHERE slug = $1',
          [activity.slug]
        );
        
        if (existingCheck.rows.length > 0) {
          console.log(`⏭️  Skipping ${activity.slug} (already exists)`);
          skipped++;
          continue;
        }
        
        // Parse subtypes
        const subtypes = parseTags(activity.subtypes);
        
        // Build tags array
        const tags = buildTagsArray(activity);
        
        // Parse seasonality
        const seasonality = parseSeasonality(activity.seasonality);
        
        // Insert activity
        const insertQuery = `
          INSERT INTO activities (
            slug, name, description, category, subtypes, seasonality,
            indoor_outdoor, energy_level, duration_min, duration_max,
            city, region, latitude, longitude, tags, hero_image_url,
            created_at, updated_at
          ) VALUES (
            $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, NOW(), NOW()
          )
          RETURNING id
        `;
        
        const result = await pool.query(insertQuery, [
          activity.slug,
          activity.name,
          activity.description,
          activity.category,
          subtypes,
          seasonality,
          activity.indoor_outdoor,
          activity.energy_level || null,
          parseInt(activity.duration_min) || null,
          parseInt(activity.duration_max) || null,
          activity.city,
          activity.region,
          parseFloat(activity.latitude) || null,
          parseFloat(activity.longitude) || null,
          tags,
          activity.hero_image_url || null,
        ]);
        
        console.log(`✅ Imported: ${activity.name} (${activity.category})`);
        imported++;
        
      } catch (error: any) {
        console.error(`❌ Error importing ${activity.slug}:`, error.message);
        errors++;
      }
    }
    
    console.log('\n📊 Import Summary:');
    console.log(`   ✅ Imported: ${imported}`);
    console.log(`   ⏭️  Skipped: ${skipped}`);
    console.log(`   ❌ Errors: ${errors}`);
    console.log(`   📈 Total: ${activities.length}`);
    
    // Update statistics
    const stats = await pool.query(`
      SELECT 
        COUNT(*) as total_activities,
        COUNT(DISTINCT category) as unique_categories,
        COUNT(*) FILTER (WHERE region = 'București') as bucharest_activities
      FROM activities
    `);
    
    console.log('\n🎯 Database Statistics:');
    console.log(`   Total activities: ${stats.rows[0].total_activities}`);
    console.log(`   Unique categories: ${stats.rows[0].unique_categories}`);
    console.log(`   Bucharest activities: ${stats.rows[0].bucharest_activities}`);
    
  } catch (error) {
    console.error('❌ Import failed:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

// Run import
importActivities()
  .then(() => {
    console.log('\n✅ Import completed successfully!');
    process.exit(0);
  })
  .catch(error => {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  });
