/**
 * Enhanced Database Seed Script
 * 
 * Loads curated activities and venues from JSON
 * Supports slugs, subtypes, and rich metadata
 */

import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { Client } from 'pg';
import { facetLegacyTags } from '../src/taxonomy/inferFacets.js';
import { validateActivityTags, validateVenueTags } from '../src/taxonomy/tagValidator.js';
import { formatTag } from '../src/taxonomy/taxonomy.js';
import { buildMapsUrl } from '../src/utils/mapsUrl.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Helper functions
function mapSeasonality(seasons: string[]): string[] {
  const mapping: Record<string, string[]> = {
    'all': ['spring', 'summer', 'fall', 'winter', 'year-round'],
    'winter': ['winter'],
    'summer': ['spring', 'summer', 'fall'],
    'shoulder': ['spring', 'fall']
  };
  
  const result = new Set<string>();
  seasons.forEach(s => {
    const mapped = mapping[s] || ['year-round'];
    mapped.forEach(m => result.add(m));
  });
  return Array.from(result);
}

function mapEnergy(energy: string): string {
  const mapping: Record<string, string> = {
    'chill': 'low',
    'medium': 'medium',
    'high': 'high'
  };
  return mapping[energy] || 'medium';
}

function mapPriceTier(tier: string | null): string {
  if (!tier) return 'moderate';
  const mapping: Record<string, string> = {
    '$': 'budget',
    '$$': 'moderate',
    '$$$': 'premium',
    '$$$$': 'luxury'
  };
  return mapping[tier] || 'moderate';
}

interface OntologyActivity {
  id: string;
  label: string;
  category: string;
  verbs: string[];
  energy: string;
  indoorOutdoor: string;
  seasonality: string;
  keywords: {
    en: string[];
    ro: string[];
  };
  synonyms: {
    en: string[];
    ro: string[];
  };
  google: {
    types: string[];
    keywords: string[];
  };
  durationHintHrs?: [number, number];
  examples?: string[];
  notes?: string;
}

interface OntologyData {
  subtypes: OntologyActivity[];
  version: string;
  lastUpdated: string;
}

// Sample venue data by activity category
const VENUE_TEMPLATES: Record<string, Array<{
  name: string;
  city: string;
  region: string;
  lat: number;
  lng: number;
  priceTier?: string;
  website?: string;
}>> = {
  'thermal-baths': [
    { name: 'Băile Felix', city: 'Băile Felix', region: 'Bihor', lat: 47.0516, lng: 22.0972, priceTier: 'moderate' },
    { name: 'Herculane Spa', city: 'Băile Herculane', region: 'Caraș-Severin', lat: 44.8833, lng: 22.4167, priceTier: 'moderate' }
  ],
  'indoor-climbing': [
    { name: 'Climb Again', city: 'București', region: 'București', lat: 44.4268, lng: 26.1025, priceTier: 'moderate' },
    { name: 'Aventura Park', city: 'Brașov', region: 'Brașov', lat: 45.6427, lng: 25.5887, priceTier: 'budget' }
  ],
  'escape-rooms': [
    { name: 'MindMaze', city: 'București', region: 'București', lat: 44.4361, lng: 26.0969, priceTier: 'moderate' },
    { name: 'Exit Games', city: 'Cluj-Napoca', region: 'Cluj', lat: 46.7712, lng: 23.6236, priceTier: 'moderate' }
  ],
  'wine-tasting': [
    { name: 'Cramele Recaș', city: 'Recaș', region: 'Timiș', lat: 45.7500, lng: 21.4500, priceTier: 'premium' },
    { name: 'Domeniile Sâmbureşti', city: 'Odobești', region: 'Vrancea', lat: 45.7667, lng: 27.0833, priceTier: 'premium' }
  ],
  'hiking': [
    { name: 'Transfăgărășan Highway Trails', city: 'Transfăgărășan', region: 'Argeș', lat: 45.5996, lng: 24.6189, priceTier: 'free' },
    { name: 'Bucegi Mountains Trails', city: 'Sinaia', region: 'Prahova', lat: 45.3500, lng: 25.5500, priceTier: 'free' }
  ]
};

// Default venues for activities without specific templates
const DEFAULT_VENUES = [
  { city: 'București', region: 'București', lat: 44.4268, lng: 26.1025, priceTier: 'moderate' },
  { city: 'Cluj-Napoca', region: 'Cluj', lat: 46.7712, lng: 23.6236, priceTier: 'moderate' },
  { city: 'Brașov', region: 'Brașov', lat: 45.6427, lng: 25.5887, priceTier: 'moderate' }
];

async function seedDatabase() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL || 'postgresql://localhost/vibe_app'
  });

  try {
    await client.connect();
    console.log('✅ Connected to PostgreSQL database');

    // Load seed data from JSON
    const seedPath = join(__dirname, 'activities-seed.json');
    const seedData = JSON.parse(readFileSync(seedPath, 'utf-8'));
    const ACTIVITIES = seedData.activities;
    const VENUES = seedData.venues;

    console.log(`\n📚 Found ${ACTIVITIES.length} activities to seed`);
    console.log(`📍 Found ${VENUES.length} venues to seed`);

    // Clear existing data
    await client.query('TRUNCATE TABLE venues CASCADE');
    await client.query('TRUNCATE TABLE activities RESTART IDENTITY CASCADE');
    console.log('🧹 Cleared existing data');

    const activityIdMap = new Map<string, number>();
    let activityCount = 0;
    let venueCount = 0;

    // Insert activities
    for (const activity of ACTIVITIES) {
      const seasonality = mapSeasonality(activity.seasonality);
      const energyLevel = mapEnergy(activity.energy_level);
      const indoorOutdoor = activity.indoor_outdoor === 'either' ? 'both' : activity.indoor_outdoor;

      // Handle faceted tags (prefer tags_faceted, fallback to auto-faceting legacy tags)
      let facetedTags = activity.tags_faceted || [];
      if (facetedTags.length === 0 && activity.tags) {
        console.log(`  ⚠️  Auto-faceting legacy tags for: ${activity.name}`);
        facetedTags = facetLegacyTags(activity.tags);
      }

      // Validate tags
      const validation = validateActivityTags(facetedTags);
      if (!validation.valid) {
        console.error(`  ❌ Invalid tags for ${activity.name}:`, validation.errors);
        continue;
      }
      if (validation.warnings.length > 0) {
        console.warn(`  ⚠️  Warnings for ${activity.name}:`, validation.warnings);
      }

      // Generate maps URL if we have location data
      const mapsUrl = buildMapsUrl({
        lat: activity.latitude,
        lng: activity.longitude,
        address: activity.city ? `${activity.city}, ${activity.region}, Romania` : null,
        name: activity.name
      });

      // Convert faceted tags to array strings for denormalized column
      const tagStrings = facetedTags.map(formatTag);

      const activityInsert = await client.query(`
        INSERT INTO activities (
          slug, name, description, category, subtypes, seasonality, indoor_outdoor,
          energy_level, duration_min, duration_max, tags, city, region, 
          latitude, longitude, hero_image_url, youtube_video_ids, maps_url
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)
        RETURNING id
      `, [
        activity.slug,
        activity.name,
        activity.description,
        activity.category,
        activity.subtypes,
        seasonality,
        indoorOutdoor,
        energyLevel,
        activity.duration_min,
        activity.duration_max,
        tagStrings,
        activity.city,
        activity.region,
        activity.latitude,
        activity.longitude,
        activity.hero_image_url,
        activity.youtube_video_ids,
        mapsUrl
      ]);

      const activityId = activityInsert.rows[0].id;
      activityIdMap.set(activity.slug, activityId);

      // Insert normalized tags
      for (const tag of facetedTags) {
        await client.query(`
          INSERT INTO activity_tags (activity_id, facet, value)
          VALUES ($1, $2, $3)
          ON CONFLICT (activity_id, facet, value) DO NOTHING
        `, [activityId, tag.facet, tag.value]);
      }

      activityCount++;
    }

    // Insert venues
    for (const venue of VENUES) {
      const activityId = activityIdMap.get(venue.activity_slug);
      if (!activityId) {
        console.warn(`⚠️  Skipping venue "${venue.name}" - activity slug "${venue.activity_slug}" not found`);
        continue;
      }

      const priceTier = mapPriceTier(venue.price_tier);
      const seasonality = venue.seasonality ? mapSeasonality(venue.seasonality) : null;

      // Handle faceted tags
      let facetedTags = venue.tags_faceted || [];
      if (facetedTags.length === 0 && venue.tags) {
        facetedTags = facetLegacyTags(venue.tags);
      }

      // Validate tags
      const validation = validateVenueTags(facetedTags);
      if (!validation.valid) {
        console.error(`  ❌ Invalid tags for venue ${venue.name}:`, validation.errors);
        continue;
      }

      // Generate maps URL
      const mapsUrl = venue.maps_url || buildMapsUrl({
        lat: venue.latitude,
        lng: venue.longitude,
        address: venue.address,
        name: venue.name
      });

      // Convert faceted tags to array strings
      const tagStrings = facetedTags.map(formatTag);

      const venueInsert = await client.query(`
        INSERT INTO venues (
          activity_id, name, address, city, region, latitude, longitude, 
          booking_url, website, phone, price_tier, seasonality, tags, 
          image_urls, opening_hours_json, blurb, maps_url
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
        RETURNING id
      `, [
        activityId,
        venue.name,
        venue.address,
        venue.city,
        venue.region,
        venue.latitude,
        venue.longitude,
        venue.booking_url,
        venue.website,
        venue.phone,
        priceTier,
        seasonality,
        tagStrings,
        venue.image_urls,
        venue.opening_hours_json ? JSON.stringify(venue.opening_hours_json) : null,
        venue.blurb,
        mapsUrl
      ]);

      const venueId = venueInsert.rows[0].id;

      // Insert normalized tags
      for (const tag of facetedTags) {
        await client.query(`
          INSERT INTO venue_tags (venue_id, facet, value)
          VALUES ($1, $2, $3)
          ON CONFLICT (venue_id, facet, value) DO NOTHING
        `, [venueId, tag.facet, tag.value]);
      }

      venueCount++;
    }

    console.log(`\n✅ Seeding complete!`);
    console.log(`   - ${activityCount} activities inserted`);
    console.log(`   - ${venueCount} venues inserted`);
    console.log(`   - Average ${(venueCount / activityCount).toFixed(1)} venues per activity\n`);

  } catch (error) {
    console.error('❌ Seeding error:', error);
    throw error;
  } finally {
    await client.end();
  }
}

// Run if executed directly
if (require.main === module) {
  seedDatabase()
    .then(() => {
      console.log('🎉 Database seeded successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Seed failed:', error);
      process.exit(1);
    });
}

export { seedDatabase };
