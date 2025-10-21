/**
 * CSV to Seed JSON Converter
 * 
 * Converts activities.csv and venues.csv from ChatGPT research
 * into the activities-seed.json format for database seeding
 */

import { readFileSync, writeFileSync } from 'fs';
import { parse } from 'csv-parse/sync';
import { join } from 'path';

interface ActivityCSV {
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
  hero_image_url?: string;
  source_url: string;
  notes?: string;
}

interface VenueCSV {
  activity_slug: string;
  name: string;
  address: string;
  city: string;
  region: string;
  latitude: string;
  longitude: string;
  booking_url?: string;
  website?: string;
  phone?: string;
  price_tier: string;
  seasonality?: string;
  blurb: string;
  tags_equipment: string;
  tags_requirement: string;
  tags_context: string;
  tags_cost_band: string;
  opening_hours_monday?: string;
  opening_hours_tuesday?: string;
  opening_hours_wednesday?: string;
  opening_hours_thursday?: string;
  opening_hours_friday?: string;
  opening_hours_saturday?: string;
  opening_hours_sunday?: string;
  source_url: string;
  notes?: string;
}

interface Tag {
  facet: string;
  value: string;
}

interface ActivitySeed {
  slug: string;
  name: string;
  category: string;
  subtypes: string[];
  description: string;
  seasonality: string[];
  indoor_outdoor: string;
  energy_level: string;
  duration_min: number;
  duration_max: number;
  tags_faceted: Tag[];
  tags: string[];
  city: string;
  region: string;
  latitude?: number | null;
  longitude?: number | null;
  hero_image_url?: string | null;
  youtube_video_ids: string[];
}

interface VenueSeed {
  activity_slug: string;
  name: string;
  address: string;
  city: string;
  region: string;
  latitude?: number | null;
  longitude?: number | null;
  booking_url?: string | null;
  website?: string | null;
  phone?: string | null;
  price_tier: string;
  seasonality?: string[] | null;
  tags_faceted: Tag[];
  tags: string[];
  image_urls: string[];
  opening_hours_json: Record<string, string> | null;
  blurb: string;
  maps_url?: string | null;
}

/**
 * Parse comma-separated tags into array
 */
function parseTags(value: string): string[] {
  if (!value || value.trim() === '') return [];
  return value.split(',').map(t => t.trim()).filter(t => t.length > 0);
}

/**
 * Build faceted tags from CSV columns
 */
function buildFacetedTags(row: ActivityCSV | VenueCSV, isActivity: boolean): Tag[] {
  const tags: Tag[] = [];
  
  // Activity-specific tags
  if (isActivity) {
    const activityRow = row as ActivityCSV;
    
    // Category (required)
    if (activityRow.category) {
      tags.push({ facet: 'category', value: activityRow.category });
    }
    
    // Subtypes
    parseTags(activityRow.subtypes).forEach(subtype => {
      tags.push({ facet: 'subtype', value: subtype });
    });
    
    // Experience level
    parseTags(activityRow.tags_experience_level).forEach(level => {
      tags.push({ facet: 'experience_level', value: level });
    });
    
    // Energy
    if (activityRow.energy_level) {
      tags.push({ facet: 'energy', value: activityRow.energy_level });
    }
    
    // Indoor/outdoor
    if (activityRow.indoor_outdoor) {
      tags.push({ facet: 'indoor_outdoor', value: activityRow.indoor_outdoor });
    }
    
    // Seasonality
    parseTags(activityRow.seasonality).forEach(season => {
      tags.push({ facet: 'seasonality', value: season });
    });
    
    // Mood tags
    parseTags(activityRow.tags_mood).forEach(mood => {
      tags.push({ facet: 'mood', value: mood });
    });
    
    // Terrain tags
    parseTags(activityRow.tags_terrain).forEach(terrain => {
      tags.push({ facet: 'terrain', value: terrain });
    });
    
    // Risk level
    parseTags(activityRow.tags_risk_level).forEach(risk => {
      tags.push({ facet: 'risk_level', value: risk });
    });
    
    // Weather fit
    parseTags(activityRow.tags_weather_fit).forEach(weather => {
      tags.push({ facet: 'weather_fit', value: weather });
    });
    
    // Time of day
    parseTags(activityRow.tags_time_of_day).forEach(time => {
      tags.push({ facet: 'time_of_day', value: time });
    });
    
    // Travel time band
    parseTags(activityRow.tags_travel_time_band).forEach(travel => {
      tags.push({ facet: 'travel_time_band', value: travel });
    });
    
    // Skills
    parseTags(activityRow.tags_skills).forEach(skill => {
      tags.push({ facet: 'skills', value: skill });
    });
  }
  
  // Common tags (both activities and venues)
  const commonRow = row as any;
  
  // Equipment
  parseTags(commonRow.tags_equipment || '').forEach(equip => {
    tags.push({ facet: 'equipment', value: equip });
  });
  
  // Context
  parseTags(commonRow.tags_context || '').forEach(ctx => {
    tags.push({ facet: 'context', value: ctx });
  });
  
  // Requirements
  parseTags(commonRow.tags_requirement || '').forEach(req => {
    tags.push({ facet: 'requirement', value: req });
  });
  
  // Cost band
  parseTags(commonRow.tags_cost_band || '').forEach(cost => {
    tags.push({ facet: 'cost_band', value: cost });
  });
  
  return tags;
}

/**
 * Convert activity CSV row to seed format
 */
function convertActivity(row: ActivityCSV): ActivitySeed {
  const tags_faceted = buildFacetedTags(row, true);
  const tags = tags_faceted.map(t => `${t.facet}:${t.value}`);
  
  return {
    slug: row.slug,
    name: row.name,
    category: row.category,
    subtypes: parseTags(row.subtypes),
    description: row.description,
    seasonality: parseTags(row.seasonality),
    indoor_outdoor: row.indoor_outdoor,
    energy_level: row.energy_level,
    duration_min: parseInt(row.duration_min) || 60,
    duration_max: parseInt(row.duration_max) || 120,
    tags_faceted,
    tags,
    city: row.city,
    region: row.region,
    latitude: row.latitude ? parseFloat(row.latitude) : null,
    longitude: row.longitude ? parseFloat(row.longitude) : null,
    hero_image_url: row.hero_image_url || null,
    youtube_video_ids: []
  };
}

/**
 * Build opening hours JSON
 */
function buildOpeningHours(row: VenueCSV): Record<string, string> | null {
  const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
  const hours: Record<string, string> = {};
  let hasHours = false;
  
  days.forEach(day => {
    const key = `opening_hours_${day}` as keyof VenueCSV;
    const value = row[key];
    if (value && value.trim() !== '') {
      hours[day] = value;
      hasHours = true;
    }
  });
  
  return hasHours ? hours : null;
}

/**
 * Generate Google Maps URL from coordinates or address
 */
function generateMapsUrl(row: VenueCSV): string | null {
  if (row.latitude && row.longitude) {
    return `https://www.google.com/maps?q=${row.latitude},${row.longitude}`;
  }
  if (row.address) {
    const query = encodeURIComponent(`${row.address}, ${row.city}, ${row.region}, Romania`);
    return `https://www.google.com/maps/search/?api=1&query=${query}`;
  }
  return null;
}

/**
 * Convert venue CSV row to seed format
 */
function convertVenue(row: VenueCSV): VenueSeed {
  const tags_faceted = buildFacetedTags(row, false);
  const tags = tags_faceted.map(t => `${t.facet}:${t.value}`);
  
  return {
    activity_slug: row.activity_slug,
    name: row.name,
    address: row.address,
    city: row.city,
    region: row.region,
    latitude: row.latitude ? parseFloat(row.latitude) : null,
    longitude: row.longitude ? parseFloat(row.longitude) : null,
    booking_url: row.booking_url || null,
    website: row.website || null,
    phone: row.phone || null,
    price_tier: row.price_tier,
    seasonality: row.seasonality ? parseTags(row.seasonality) : null,
    tags_faceted,
    tags,
    image_urls: [],
    opening_hours_json: buildOpeningHours(row),
    blurb: row.blurb,
    maps_url: generateMapsUrl(row)
  };
}

/**
 * Main conversion function
 */
export function convertCSVToSeedJSON(
  activitiesCSVPath: string,
  venuesCSVPath: string,
  outputPath: string
) {
  console.log('📊 Reading CSV files...');
  
  // Read CSV files
  const activitiesCSV = readFileSync(activitiesCSVPath, 'utf-8');
  const venuesCSV = readFileSync(venuesCSVPath, 'utf-8');
  
  // Parse CSV
  const activityRows: ActivityCSV[] = parse(activitiesCSV, {
    columns: true,
    skip_empty_lines: true,
    trim: true
  });
  
  const venueRows: VenueCSV[] = parse(venuesCSV, {
    columns: true,
    skip_empty_lines: true,
    trim: true
  });
  
  console.log(`✅ Found ${activityRows.length} activities`);
  console.log(`✅ Found ${venueRows.length} venues`);
  
  // Convert to seed format
  const activities = activityRows.map(convertActivity);
  const venues = venueRows.map(convertVenue);
  
  // Create seed JSON
  const seedData = {
    activities,
    venues
  };
  
  // Write output
  writeFileSync(outputPath, JSON.stringify(seedData, null, 2));
  
  console.log(`\n🎉 Successfully converted data!`);
  console.log(`   Output: ${outputPath}`);
  console.log(`   Activities: ${activities.length}`);
  console.log(`   Venues: ${venues.length}`);
  console.log(`   Average tags per activity: ${(activities.reduce((sum, a) => sum + a.tags_faceted.length, 0) / activities.length).toFixed(1)}`);
  console.log(`   Average venues per activity: ${(venues.length / activities.length).toFixed(1)}`);
  
  // Stats by category
  const byCategory = activities.reduce((acc, a) => {
    acc[a.category] = (acc[a.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  console.log(`\n📊 Activities by category:`);
  Object.entries(byCategory)
    .sort((a, b) => b[1] - a[1])
    .forEach(([cat, count]) => {
      console.log(`   ${cat}: ${count}`);
    });
}

// CLI usage
if (import.meta.url === `file://${process.argv[1]}`) {
  const activitiesPath = process.argv[2] || join(process.cwd(), 'data', 'activities.csv');
  const venuesPath = process.argv[3] || join(process.cwd(), 'data', 'venues.csv');
  const outputPath = process.argv[4] || join(process.cwd(), 'database', 'activities-seed.json');
  
  try {
    convertCSVToSeedJSON(activitiesPath, venuesPath, outputPath);
  } catch (error) {
    console.error('❌ Conversion failed:', error);
    process.exit(1);
  }
}
