/**
 * Fix indoor_outdoor tags for all activities in the database
 * Run with: npx tsx backend/scripts/fix-indoor-outdoor-tags.ts
 */

import { Pool } from 'pg';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: './backend/.env' });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://localhost/vibe_app'
});

// Keywords that indicate OUTDOOR activities
const OUTDOOR_KEYWORDS = [
  'rooftop', 'terrace', 'beach', 'outdoor', 'garden', 'park', 'lake', 'river',
  'hiking', 'hike', 'trail', 'mountain', 'peak', 'canyon', 'waterfall',
  'kayak', 'canoe', 'rafting', 'sup', 'paddle', 'boat tour', 'cruise',
  'cycling', 'bike', 'biking', 'segway', 'walking tour', 'food tour',
  'sky bar', 'sundowner', 'open-air', 'al fresco', 'patio',
  'zoo', 'botanical', 'aqua park', 'water park', 'beach club',
  'golf', 'tennis court', 'football', 'soccer field',
  'paragliding', 'skydiving', 'bungee', 'zip line', 'via ferrata',
  'skiing', 'snowboard', 'sled', 'ice skating outdoor',
  'market', 'bazaar', 'fair', 'festival outdoor'
];

// Keywords that indicate INDOOR activities
const INDOOR_KEYWORDS = [
  'museum', 'gallery', 'exhibition', 'theater', 'theatre', 'cinema', 'opera',
  'escape room', 'vr', 'virtual reality', 'gaming', 'arcade',
  'spa', 'massage', 'sauna', 'hammam', 'thermal', 'wellness center',
  'restaurant', 'cafe', 'bar', 'pub', 'club', 'lounge', 'nightclub',
  'bowling', 'billiard', 'pool hall', 'darts',
  'workshop', 'class', 'cooking class', 'pottery', 'art class', 'painting',
  'gym', 'fitness', 'yoga studio', 'pilates', 'climbing gym', 'indoor climbing',
  'swimming pool', 'pool', 'aqua', 'lanes',
  'concert hall', 'live music venue', 'jazz club', 'comedy club',
  'casino', 'karaoke', 'hookah', 'shisha',
  'library', 'coworking', 'board game cafe', 'board game',
  'mall', 'shopping', 'store'
];

// Keywords that indicate BOTH (can be indoor or outdoor)
const BOTH_KEYWORDS = [
  'therme', 'hot spring', 'thermal bath', // Can have indoor and outdoor sections
  'resort', 'hotel', // Usually have both options
  'adventure park', // Mix of activities
  'country club', // Mix of indoor/outdoor
];

// Category-based defaults (if no keyword match)
const CATEGORY_DEFAULTS: Record<string, 'indoor' | 'outdoor' | 'both'> = {
  // Mostly indoor
  'wellness': 'indoor',
  'creative': 'indoor',
  'culinary': 'indoor',
  'learning': 'indoor',
  'nightlife': 'indoor',
  'social': 'indoor',
  'culture': 'indoor',
  'mindfulness': 'indoor',
  
  // Mostly outdoor
  'adventure': 'outdoor',
  'nature': 'outdoor',
  'water': 'outdoor',
  'sports': 'outdoor',
  
  // Seasonal/varies
  'seasonal': 'both',
  'romance': 'both',
  'fitness': 'both',
};

function determineIndoorOutdoor(name: string, category: string, tags: string[]): 'indoor' | 'outdoor' | 'both' {
  const nameLower = name.toLowerCase();
  const tagsList = (tags || []).map(t => t.toLowerCase());
  
  // FIRST: Check if tags already have explicit indoor_outdoor value - trust these!
  const explicitIndoor = tagsList.some(t => t === 'indoor_outdoor:indoor');
  const explicitOutdoor = tagsList.some(t => t === 'indoor_outdoor:outdoor');
  const explicitBoth = tagsList.some(t => t === 'indoor_outdoor:both');
  
  if (explicitIndoor) return 'indoor';
  if (explicitOutdoor) return 'outdoor';
  if (explicitBoth) return 'both';
  
  // Only check name for keywords (not tags, to avoid false matches)
  
  // Check for BOTH keywords first (most specific)
  for (const keyword of BOTH_KEYWORDS) {
    if (nameLower.includes(keyword)) {
      return 'both';
    }
  }
  
  // Check for OUTDOOR keywords in name
  for (const keyword of OUTDOOR_KEYWORDS) {
    if (nameLower.includes(keyword)) {
      return 'outdoor';
    }
  }
  
  // Check for INDOOR keywords in name
  for (const keyword of INDOOR_KEYWORDS) {
    if (nameLower.includes(keyword)) {
      return 'indoor';
    }
  }
  
  // Fall back to category default
  return CATEGORY_DEFAULTS[category] || 'both';
}

async function fixIndoorOutdoorTags() {
  console.log('🔧 Starting indoor_outdoor tag fix...\n');
  
  try {
    // Get all activities
    const result = await pool.query(`
      SELECT id, name, category, indoor_outdoor, tags
      FROM activities
      ORDER BY id
    `);
    
    const activities = result.rows;
    console.log(`📊 Total activities: ${activities.length}\n`);
    
    // Track changes
    const changes: { id: number; name: string; oldValue: string | null; newValue: string }[] = [];
    const alreadyCorrect: number[] = [];
    
    for (const activity of activities) {
      const newValue = determineIndoorOutdoor(activity.name, activity.category, activity.tags);
      
      if (activity.indoor_outdoor !== newValue) {
        changes.push({
          id: activity.id,
          name: activity.name,
          oldValue: activity.indoor_outdoor,
          newValue
        });
      } else {
        alreadyCorrect.push(activity.id);
      }
    }
    
    console.log(`✅ Already correct: ${alreadyCorrect.length}`);
    console.log(`🔄 Need updating: ${changes.length}\n`);
    
    // Show sample changes
    console.log('📝 Sample changes (first 20):');
    for (const change of changes.slice(0, 20)) {
      console.log(`   ${change.id}: "${change.name.substring(0, 50)}..." | ${change.oldValue || 'NULL'} → ${change.newValue}`);
    }
    
    if (changes.length > 20) {
      console.log(`   ... and ${changes.length - 20} more\n`);
    }
    
    // Group changes by type
    const nullToIndoor = changes.filter(c => c.oldValue === null && c.newValue === 'indoor');
    const nullToOutdoor = changes.filter(c => c.oldValue === null && c.newValue === 'outdoor');
    const nullToBoth = changes.filter(c => c.oldValue === null && c.newValue === 'both');
    const indoorToOutdoor = changes.filter(c => c.oldValue === 'indoor' && c.newValue === 'outdoor');
    const outdoorToIndoor = changes.filter(c => c.oldValue === 'outdoor' && c.newValue === 'indoor');
    const otherChanges = changes.filter(c => 
      !nullToIndoor.includes(c) && 
      !nullToOutdoor.includes(c) && 
      !nullToBoth.includes(c) &&
      !indoorToOutdoor.includes(c) &&
      !outdoorToIndoor.includes(c)
    );
    
    console.log('\n📊 Change breakdown:');
    console.log(`   NULL → indoor: ${nullToIndoor.length}`);
    console.log(`   NULL → outdoor: ${nullToOutdoor.length}`);
    console.log(`   NULL → both: ${nullToBoth.length}`);
    console.log(`   indoor → outdoor: ${indoorToOutdoor.length}`);
    console.log(`   outdoor → indoor: ${outdoorToIndoor.length}`);
    console.log(`   Other: ${otherChanges.length}`);
    
    // Apply changes
    console.log('\n🚀 Applying changes...');
    
    let updated = 0;
    for (const change of changes) {
      await pool.query(
        'UPDATE activities SET indoor_outdoor = $1 WHERE id = $2',
        [change.newValue, change.id]
      );
      updated++;
    }
    
    console.log(`\n✅ Updated ${updated} activities`);
    
    // Verify final counts
    const finalCounts = await pool.query(`
      SELECT indoor_outdoor, COUNT(*) as count
      FROM activities
      GROUP BY indoor_outdoor
      ORDER BY count DESC
    `);
    
    console.log('\n📊 Final indoor_outdoor distribution:');
    for (const row of finalCounts.rows) {
      console.log(`   ${row.indoor_outdoor || 'NULL'}: ${row.count}`);
    }
    
    // Show some examples that might need manual review
    console.log('\n⚠️ Activities that might need manual review (rooftop/terrace marked outdoor):');
    const reviewNeeded = await pool.query(`
      SELECT id, name, indoor_outdoor
      FROM activities
      WHERE (LOWER(name) LIKE '%rooftop%' OR LOWER(name) LIKE '%terrace%' OR LOWER(name) LIKE '%sky bar%')
      AND indoor_outdoor = 'outdoor'
      LIMIT 10
    `);
    for (const row of reviewNeeded.rows) {
      console.log(`   ${row.id}: ${row.name} (${row.indoor_outdoor})`);
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await pool.end();
  }
}

fixIndoorOutdoorTags();
