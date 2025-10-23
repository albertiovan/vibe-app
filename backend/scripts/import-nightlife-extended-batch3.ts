/**
 * Import Extended Bucharest Nightlife Batch 3 (9 activities - FINAL)
 */
import { Pool } from 'pg';
import dotenv from 'dotenv';
import { resolve } from 'path';

dotenv.config({ path: resolve(__dirname, '../.env') });

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

const activities = [
  {
    slug: 'bucharest-infinity-hookah-eminescu',
    name: 'Infinity Hookah Lounge (Eminescu)',
    category: 'social',
    description: "A sleek shisha lounge just off Piața Romană with cushy seating, moody LEDs, and a long hookah menu. Expect a relaxed, social pace—smoke, mocktails/cocktails, and low-conversation beats. Staff are attentive to flavor swaps and coal changes; groups linger late.",
    city: 'Bucharest',
    region: 'Obor & Romana',
    latitude: 44.4475,
    longitude: 26.1018,
    duration_min: 120,
    duration_max: 210,
    tags: ['category:social','energy:medium','mood:chill','mood:social','mood:sophisticated','context:friends','context:small-group','context:date','time_of_day:evening','time_of_day:night','time_of_day:late-night','cost_band:$$']
  },
  {
    slug: 'bucharest-nova-lounge-hookah',
    name: 'Nova Lounge & Hookah (Ferdinand)',
    category: 'social',
    description: "Bright, modern hookah bar on Bd. Ferdinand—clean lines, clubby lighting, and house/hip-hop playlists at a chat-friendly volume. Solid cocktails, welcoming staff, and easy taxi links make it a handy meet-up east of the center.",
    city: 'Bucharest',
    region: 'Obor & Romana',
    latitude: 44.4485,
    longitude: 26.1155,
    duration_min: 120,
    duration_max: 210,
    tags: ['category:social','energy:medium','mood:social','mood:chill','mood:energetic','context:friends','context:small-group','context:large-group','time_of_day:evening','time_of_day:night','cost_band:$$']
  },
  {
    slug: 'bucharest-trickshot-mega-mall-bowling-bar',
    name: 'Trickshot Mega Mall: Bowling & Bar',
    category: 'social',
    description: "Slick lanes, big screens, and proper cocktails—Trickshot is where you mix games with a night out. Mega Mall's outpost draws groups from Pantelimon and Iancului for leagues, after-work rolls, and weekend birthdays. Music's upbeat; service is quick; food's above-average for a bowling hall.",
    city: 'Bucharest',
    region: 'Pantelimon',
    latitude: 44.4250,
    longitude: 26.1550,
    duration_min: 120,
    duration_max: 180,
    tags: ['category:social','energy:medium','mood:social','mood:party','mood:energetic','context:friends','context:large-group','context:small-group','time_of_day:evening','time_of_day:night','cost_band:$$']
  },
  {
    slug: 'bucharest-trickshot-afi-cotroceni-bowling-bar',
    name: 'Trickshot AFI Cotroceni: Lanes & Cocktails',
    category: 'social',
    description: "In AFI Cotroceni, Trickshot pairs neon-lit lanes with a cocktail program and shareable snacks—perfect for team nights or low-stakes dates. Expect families earlier, friend groups later, and a soundtrack that stays lively without blasting.",
    city: 'Bucharest',
    region: 'Cotroceni',
    latitude: 44.4320,
    longitude: 26.0380,
    duration_min: 120,
    duration_max: 180,
    tags: ['category:social','energy:medium','mood:social','mood:party','mood:chill','context:friends','context:small-group','context:large-group','time_of_day:evening','time_of_day:night','cost_band:$$']
  },
  {
    slug: 'bucharest-trickshot-promenada-rooftop-bowling',
    name: 'Trickshot Promenada Rooftop',
    category: 'social',
    description: "A Floreasca favorite: rooftop lanes with skyline views over Barbu Văcărescu. Cocktails and pizzas round out the formula; it's as photogenic as it is fun. Expect corporate groups mid-week and party crews on weekends.",
    city: 'Bucharest',
    region: 'Floreasca',
    latitude: 44.4710,
    longitude: 26.1030,
    duration_min: 120,
    duration_max: 180,
    tags: ['category:social','energy:medium','mood:social','mood:energetic','mood:romantic','context:friends','context:large-group','context:small-group','time_of_day:evening','time_of_day:night','cost_band:$$']
  },
  {
    slug: 'bucharest-kladestin-ior-titan-lounge',
    name: 'KLANdestin: IOR Park View Drinks',
    category: 'social',
    description: "Overlooking Titan's IOR Park, KLANdestin trades club crush for panoramic calm—glass-lined seating, easy playlists, and a neighborhood crowd. Cocktails and wine lean accessible; it's ideal for catch-ups east of the center and a gentle start before a later night.",
    city: 'Bucharest',
    region: 'Titan',
    latitude: 44.4180,
    longitude: 26.1650,
    duration_min: 90,
    duration_max: 150,
    tags: ['category:social','energy:low','mood:chill','mood:romantic','mood:social','context:date','context:small-group','context:friends','time_of_day:evening','time_of_day:night','cost_band:$']
  },
  {
    slug: 'bucharest-sports-bar-titan-billiards',
    name: 'Sports Bar Titan: Billiards & Darts',
    category: 'social',
    description: "Local hangout built on pool tables, darts, and cold pints. Big games draw neighborhood regulars; off-nights are for rounds and jukebox picks. It's friendly, affordable, and perfect when you want to keep it simple.",
    city: 'Bucharest',
    region: 'Titan',
    latitude: 44.4185,
    longitude: 26.1655,
    duration_min: 120,
    duration_max: 180,
    tags: ['category:social','energy:medium','mood:social','mood:chill','context:friends','context:small-group','context:large-group','time_of_day:evening','time_of_day:night','cost_band:$']
  },
  {
    slug: 'bucharest-pura-vida-sky-bar-old-town',
    name: 'Pura Vida Sky Bar (Old Town)',
    category: 'nightlife',
    description: "Backpacker-friendly rooftop perched above Smârdan's bustle with beanbags, LEDs, and easygoing playlists. Sunset brings camera phones; later it's beers, spritzes, and new friends from five countries at the next table. Come for views, stay for people-watching.",
    city: 'Bucharest',
    region: 'Old Town',
    latitude: 44.4321,
    longitude: 26.1005,
    duration_min: 60,
    duration_max: 120,
    tags: ['category:nightlife','energy:medium','mood:social','mood:romantic','mood:party','context:friends','context:solo','context:small-group','time_of_day:evening','time_of_day:night','cost_band:$']
  },
  {
    slug: 'bucharest-halftime-sports-pub',
    name: 'Halftime Sports Pub (Gabroveni)',
    category: 'nightlife',
    description: "Old Town's reliable match-night HQ—multiple screens, pub grub, and beers that keep coming. Atmosphere swings from banter to full-on roar during derbies. Staff handle big groups well; bookings recommended for major fixtures.",
    city: 'Bucharest',
    region: 'Lipscani',
    latitude: 44.4323,
    longitude: 26.1022,
    duration_min: 120,
    duration_max: 210,
    tags: ['category:nightlife','energy:medium','mood:party','mood:social','mood:chill','context:friends','context:large-group','context:small-group','time_of_day:evening','time_of_day:night','cost_band:$$']
  }
];

async function importBatch3() {
  console.log('🌙 Extended Nightlife Batch 3 (FINAL): 9 activities...\n');
  
  for (const activity of activities) {
    try {
      await pool.query(`
        INSERT INTO activities (slug, name, category, description, city, region, latitude, longitude, duration_min, duration_max, tags)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
        ON CONFLICT (slug) DO NOTHING
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
        activity.tags
      ]);
      console.log(`✅ ${activity.name}`);
    } catch (error: any) {
      console.error(`❌ Failed: ${activity.name}`, error.message);
    }
  }
  
  await pool.end();
  console.log('\n🎉 ALL EXTENDED NIGHTLIFE ACTIVITIES IMPORTED!');
  console.log('📊 Total: 29 new activities added');
}

importBatch3();
