#!/usr/bin/env tsx
/**
 * Quick Vibe Test - Non-interactive version
 * Usage: npx tsx scripts/quick-vibe-test.ts <vibe-number>
 * Example: npx tsx scripts/quick-vibe-test.ts 1
 */

import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://localhost/vibe_app'
});

const TEST_VIBES: Record<string, { name: string; tags: string[] }> = {
  '1': { name: '🌅 Post-work unwind', tags: ['mood:relaxed', 'mood:cozy', 'energy:chill', 'time_of_day:evening', 'travel_time_band:in-city'] },
  '2': { name: '🎨 Creative spark', tags: ['mood:creative', 'subtype:workshop', 'experience_level:beginner', 'indoor_outdoor:indoor', 'time_of_day:daytime'] },
  '3': { name: '🍷 Romantic date night', tags: ['mood:romantic', 'context:date', 'mood:cozy', 'time_of_day:evening', 'subtype:fine_dining'] },
  '4': { name: '⛰️ Adventure seeker', tags: ['mood:adventurous', 'indoor_outdoor:outdoor', 'mood:adrenaline', 'travel_time_band:day-trip', 'energy:high'] },
  '5': { name: '🍜 Foodie explorer', tags: ['category:culinary', 'mood:explorer', 'mood:social', 'subtype:food_tour', 'time_of_day:daytime'] },
  '6': { name: '🧘 Mindful reset', tags: ['mood:mindful', 'mood:relaxed', 'energy:chill', 'category:wellness', 'indoor_outdoor:indoor'] },
  '7': { name: '🎯 Social butterfly', tags: ['mood:social', 'context:friends', 'context:group', 'energy:medium', 'time_of_day:evening'] },
  '8': { name: '🏔️ Nature escape', tags: ['mood:explorer', 'category:nature', 'indoor_outdoor:outdoor', 'mood:relaxed', 'travel_time_band:day-trip'] },
  '9': { name: '🎓 Learn something new', tags: ['mood:creative', 'category:learning', 'experience_level:beginner', 'subtype:class', 'indoor_outdoor:indoor'] },
  '10': { name: '🌙 Late night fun', tags: ['mood:social', 'category:nightlife', 'time_of_day:evening', 'time_of_day:night', 'terrain:urban'] },
};

async function searchByTags(tags: string[], limit = 10) {
  const query = `
    WITH activity_scores AS (
      SELECT 
        a.id,
        a.name,
        a.category,
        a.description,
        a.city,
        a.duration_min,
        a.duration_max,
        a.energy_level,
        a.indoor_outdoor,
        a.tags,
        -- Count matching tags by checking array overlap
        (
          SELECT COUNT(*)
          FROM unnest(a.tags) tag
          WHERE tag = ANY($1::text[])
        ) as tag_matches
      FROM activities a
    )
    SELECT 
      name,
      category,
      description,
      city,
      duration_min,
      duration_max,
      energy_level,
      indoor_outdoor,
      tag_matches,
      tags as all_tags
    FROM activity_scores
    WHERE tag_matches > 0
    ORDER BY tag_matches DESC, name ASC
    LIMIT $2;
  `;

  const result = await pool.query(query, [tags, limit]);
  return result.rows;
}

async function main() {
  const vibeNum = process.argv[2];

  if (!vibeNum) {
    console.log('\n🎭 Available Test Vibes:\n');
    Object.entries(TEST_VIBES).forEach(([key, vibe]) => {
      console.log(`   [${key}] ${vibe.name}`);
      console.log(`       Tags: ${vibe.tags.join(', ')}\n`);
    });
    console.log('Usage: npx tsx scripts/quick-vibe-test.ts <1-10>');
    console.log('Example: npx tsx scripts/quick-vibe-test.ts 3\n');
    process.exit(0);
  }

  const vibe = TEST_VIBES[vibeNum];
  if (!vibe) {
    console.error(`❌ Invalid vibe number: ${vibeNum}`);
    console.log('Please choose a number between 1 and 10\n');
    process.exit(1);
  }

  try {
    console.log(`\n${'='.repeat(80)}`);
    console.log(`🎭 Testing Vibe: ${vibe.name}`);
    console.log(`🏷️  Tags: ${vibe.tags.join(', ')}`);
    console.log(`${'='.repeat(80)}\n`);

    const activities = await searchByTags(vibe.tags, 10);

    if (activities.length === 0) {
      console.log('❌ No activities found matching this vibe\n');
    } else {
      console.log(`✅ Found ${activities.length} matching activities:\n`);
      
      activities.forEach((activity, idx) => {
        const duration = activity.duration_min === activity.duration_max 
          ? `${activity.duration_min} min`
          : `${activity.duration_min}-${activity.duration_max} min`;

        console.log(`${idx + 1}. 📍 ${activity.name}`);
        console.log(`   Category: ${activity.category.toUpperCase()} | ${activity.city}`);
        console.log(`   Duration: ${duration} | Energy: ${activity.energy_level} | ${activity.indoor_outdoor}`);
        console.log(`   ${activity.description.substring(0, 150)}${activity.description.length > 150 ? '...' : ''}`);
        console.log(`   ✨ Matched ${activity.tag_matches} vibe tags\n`);
      });
    }

    console.log(`${'='.repeat(80)}\n`);
  } catch (error) {
    console.error('❌ Error:', (error as Error).message);
  } finally {
    await pool.end();
  }
}

main();
