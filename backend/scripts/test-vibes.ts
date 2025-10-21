#!/usr/bin/env tsx
/**
 * CLI Vibe Tester
 * Test the recommendation engine with different vibes from the terminal
 */

import { Pool } from 'pg';
import * as readline from 'readline';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://localhost/vibe_app'
});

// Test vibe scenarios
const TEST_VIBES = {
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

async function searchByCategory(category: string, limit = 10) {
  const query = `
    SELECT 
      a.name,
      a.category,
      a.description,
      a.city,
      a.duration_min,
      a.duration_max,
      a.energy_level,
      a.indoor_outdoor,
      a.tags as all_tags
    FROM activities a
    WHERE a.category = $1
    ORDER BY name ASC
    LIMIT $2;
  `;

  const result = await pool.query(query, [category, limit]);
  return result.rows;
}

async function getStats() {
  const queries = await Promise.all([
    pool.query('SELECT COUNT(*) as total FROM activities'),
    pool.query('SELECT COUNT(*) as total FROM venues'),
    pool.query('SELECT category, COUNT(*) as count FROM activities GROUP BY category ORDER BY count DESC'),
  ]);

  return {
    totalActivities: parseInt(queries[0].rows[0].total),
    totalVenues: parseInt(queries[1].rows[0].total),
    byCategory: queries[2].rows,
  };
}

function displayActivity(activity: any, index: number) {
  const duration = activity.duration_min === activity.duration_max 
    ? `${activity.duration_min} min`
    : `${activity.duration_min}-${activity.duration_max} min`;

  console.log(`\n${index + 1}. 📍 ${activity.name}`);
  console.log(`   Category: ${activity.category.toUpperCase()} | ${activity.city}`);
  console.log(`   Duration: ${duration} | Energy: ${activity.energy_level} | ${activity.indoor_outdoor}`);
  console.log(`   ${activity.description.substring(0, 150)}${activity.description.length > 150 ? '...' : ''}`);
  
  if (activity.tag_matches) {
    console.log(`   ✨ Matched ${activity.tag_matches} vibe tags`);
  }
}

async function testVibe(vibeKey: string) {
  const vibe = TEST_VIBES[vibeKey as keyof typeof TEST_VIBES];
  if (!vibe) {
    console.log('❌ Invalid vibe selection');
    return;
  }

  console.log(`\n${'='.repeat(80)}`);
  console.log(`🎭 Testing Vibe: ${vibe.name}`);
  console.log(`🏷️  Tags: ${vibe.tags.join(', ')}`);
  console.log(`${'='.repeat(80)}`);

  const activities = await searchByTags(vibe.tags, 10);

  if (activities.length === 0) {
    console.log('\n❌ No activities found matching this vibe');
  } else {
    console.log(`\n✅ Found ${activities.length} matching activities:\n`);
    activities.forEach((activity, idx) => displayActivity(activity, idx));
  }

  console.log(`\n${'='.repeat(80)}\n`);
}

async function browseByCategory(category: string) {
  console.log(`\n${'='.repeat(80)}`);
  console.log(`📂 Browsing Category: ${category.toUpperCase()}`);
  console.log(`${'='.repeat(80)}`);

  const activities = await searchByCategory(category, 15);

  if (activities.length === 0) {
    console.log('\n❌ No activities found in this category');
  } else {
    console.log(`\n✅ Found ${activities.length} activities:\n`);
    activities.forEach((activity, idx) => displayActivity(activity, idx));
  }

  console.log(`\n${'='.repeat(80)}\n`);
}

async function showMenu() {
  const stats = await getStats();

  console.clear();
  console.log('\n' + '═'.repeat(80));
  console.log('  🎭  VIBE APP - CLI TESTER');
  console.log('═'.repeat(80));
  console.log(`\n📊 Database: ${stats.totalActivities} activities | ${stats.totalVenues} venues\n`);
  
  console.log('📂 Categories:');
  stats.byCategory.forEach(cat => {
    console.log(`   ${cat.category.padEnd(15)} (${cat.count})`);
  });

  console.log('\n🎭 Test Vibes:');
  Object.entries(TEST_VIBES).forEach(([key, vibe]) => {
    console.log(`   [${key}] ${vibe.name}`);
  });

  console.log('\n📂 Browse by Category:');
  console.log('   [c] Choose a category to browse');

  console.log('\n⚙️  Options:');
  console.log('   [s] Show database stats');
  console.log('   [q] Quit');
  console.log('\n' + '═'.repeat(80));
}

async function main() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  const question = (prompt: string): Promise<string> => {
    return new Promise((resolve) => {
      rl.question(prompt, resolve);
    });
  };

  try {
    await pool.query('SELECT 1'); // Test connection
    
    while (true) {
      await showMenu();
      const choice = await question('\nYour choice: ');

      if (choice.toLowerCase() === 'q') {
        console.log('\n👋 Goodbye!\n');
        break;
      }

      if (choice.toLowerCase() === 's') {
        const stats = await getStats();
        console.log('\n📊 Database Statistics:');
        console.log(`   Total Activities: ${stats.totalActivities}`);
        console.log(`   Total Venues: ${stats.totalVenues}`);
        console.log('\n   By Category:');
        stats.byCategory.forEach(cat => {
          console.log(`   ${cat.category.padEnd(15)}: ${cat.count} activities`);
        });
        await question('\nPress Enter to continue...');
        continue;
      }

      if (choice.toLowerCase() === 'c') {
        const stats = await getStats();
        console.log('\nAvailable categories:');
        stats.byCategory.forEach((cat, idx) => {
          console.log(`   [${idx + 1}] ${cat.category} (${cat.count})`);
        });
        const catChoice = await question('\nSelect category number: ');
        const catIndex = parseInt(catChoice) - 1;
        if (catIndex >= 0 && catIndex < stats.byCategory.length) {
          await browseByCategory(stats.byCategory[catIndex].category);
          await question('\nPress Enter to continue...');
        }
        continue;
      }

      if (choice in TEST_VIBES) {
        await testVibe(choice);
        await question('Press Enter to continue...');
      }
    }
  } catch (error) {
    console.error('❌ Error:', (error as Error).message);
  } finally {
    rl.close();
    await pool.end();
  }
}

main();
