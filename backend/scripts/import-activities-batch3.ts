/**
 * Import batch 2 activities
 * Run: npx tsx backend/scripts/import-activities-batch3.ts
 */

import { Pool } from 'pg';
import { readFileSync } from 'fs';
import { parse } from 'csv-parse/sync';
import { join } from 'path';
import dotenv from 'dotenv';

dotenv.config({ path: join(__dirname, '../.env') });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://localhost/vibe_app',
});

function parseTags(tagString: string): string[] {
  if (!tagString || tagString.trim() === '') return [];
  return tagString.split(',').map(t => t.trim()).filter(t => t);
}

function buildTagsArray(row: any): string[] {
  const allTags: string[] = [];
  
  allTags.push(`category:${row.category}`);
  
  const tagMapping: Record<string, string> = {
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
    const value = row[csvColumn];
    if (value && value.trim()) {
      const tags = parseTags(value);
      tags.forEach(tag => allTags.push(`${prefix}:${tag}`));
    }
  }
  
  if (row.energy_level) allTags.push(`energy:${row.energy_level}`);
  if (row.indoor_outdoor) allTags.push(`indoor_outdoor:${row.indoor_outdoor}`);
  
  const seasonality = row.seasonality;
  if (!seasonality || seasonality === 'all') {
    allTags.push('seasonality:all');
  } else if (seasonality === 'shoulder') {
    ['spring', 'summer', 'fall'].forEach(s => allTags.push(`seasonality:${s}`));
  } else {
    parseTags(seasonality).forEach(s => allTags.push(`seasonality:${s}`));
  }
  
  return [...new Set(allTags)];
}

async function importBatch2() {
  console.log('🔄 Starting import of batch 2 activities...\n');
  
  try {
    const csvContent = readFileSync(
      join(__dirname, '../../activities_batch3.csv'),
      'utf-8'
    );
    
    const activities = parse(csvContent, {
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
        const existingCheck = await pool.query(
          'SELECT id FROM activities WHERE slug = $1',
          [activity.slug]
        );
        
        if (existingCheck.rows.length > 0) {
          console.log(`⏭️  Skipping ${activity.slug} (already exists)`);
          skipped++;
          continue;
        }
        
        const subtypes = parseTags(activity.subtypes);
        const tags = buildTagsArray(activity);
        const seasonality = activity.seasonality === 'all' || !activity.seasonality
          ? ['spring', 'summer', 'fall', 'winter', 'year-round']
          : activity.seasonality === 'shoulder'
            ? ['spring', 'summer', 'fall']
            : parseTags(activity.seasonality);
        
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
        
        await pool.query(insertQuery, [
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
    
    const stats = await pool.query(`
      SELECT 
        COUNT(*) as total_activities,
        COUNT(DISTINCT category) as unique_categories,
        COUNT(*) FILTER (WHERE region = 'București' OR region = 'Ilfov') as bucharest_area_activities
      FROM activities
    `);
    
    console.log('\n🎯 Database Statistics:');
    console.log(`   Total activities: ${stats.rows[0].total_activities}`);
    console.log(`   Unique categories: ${stats.rows[0].unique_categories}`);
    console.log(`   Bucharest area: ${stats.rows[0].bucharest_area_activities}`);
    
  } catch (error: any) {
    console.error('❌ Import failed:', error.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

importBatch2()
  .then(() => {
    console.log('\n✅ Import completed successfully!');
    process.exit(0);
  })
  .catch(error => {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  });
