/**
 * Import Bucharest Nightlife Batch 1 (6 activities)
 */
import { Pool } from 'pg';
import dotenv from 'dotenv';
import { resolve } from 'path';

dotenv.config({ path: resolve(__dirname, '../.env') });

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

const activities = [
  {
    slug: 'bucharest-alternative-electronic-control-club',
    name: 'Alt & Electronic Nights at Control Club',
    category: 'nightlife',
    description: "A Bucharest institution for the city's indie and electronic scenes, Control's two rooms swing from guitar-forward live sets to late-night DJ takeovers. Sound is crisp and loud without getting harsh; lights stay moody—neon washes, minimal strobes, and a hazy edge that makes the concrete-and-brick interior feel underground. Expect a smart, mixed crowd of students, creatives, and travelers who came for music first and small talk second. Weeknights bring concerts and listening parties; weekends dial up techno/house in Sala Berlin while the front room hums with social energy at the bar. Jeans-and-sneakers are standard; cover varies by lineup and it's cash/QR friendly at the bar. If you want a quintessential 'new Bucharest' night—unpretentious, culture-forward, and genuinely local—this is it.",
    city: 'Bucharest',
    region: 'Universitate',
    latitude: 44.4356,
    longitude: 26.0970,
    duration_min: 180,
    duration_max: 360,
    tags: ['category:nightlife','energy:high','mood:party','mood:energetic','mood:underground','mood:rebellious','context:friends','context:small-group','context:solo','time_of_day:evening','time_of_day:night','time_of_day:late-night','cost_band:$$']
  },
  {
    slug: 'bucharest-kristal-techno-mainroom',
    name: 'Tech-House Marathon at Kristal Glam Club',
    category: 'nightlife',
    description: "Kristal is the big-room Bucharest experience: a dark, polished box built for low-end pressure and long blends. International headliners and local heroes push house/tech-house to minimal/rominimal without losing warmth—the subs are deep, the tops are silky, and the light rig does elegant sweeps rather than chaotic blasts. The vibe is dressy but not stiff: fashion-forward locals, expats, and weekenders on a proper night out. You'll find VIP rails around a dense main floor, efficient bars, and a production team that treats every Saturday like a mini-festival. Expect a cover and bouncer-managed entry; tables book out quickly. If you want a 'capital city' club moment—laser canopies, cheers at the drop, sunrise exits—this is your stop.",
    city: 'Bucharest',
    region: 'Universitate',
    latitude: 44.4352,
    longitude: 26.0979,
    duration_min: 240,
    duration_max: 420,
    tags: ['category:nightlife','energy:high','mood:party','mood:energetic','mood:luxe','context:friends','context:large-group','context:small-group','time_of_day:night','time_of_day:late-night','cost_band:$$$']
  },
  {
    slug: 'bucharest-student-warehouse-kulturhaus',
    name: 'Student Night at Kulturhaus Bucharest',
    category: 'nightlife',
    description: "Budget-friendly, high-energy nights in the heart of Old Town. Kulturhaus is a sprawling multi-room student club where commercial, EDM, and throwback hits roll until morning. Inside the historic building, expect brick vaults, basic lighting, and a 'no frills, all fun' attitude—the kind of place where you lose your friends and make new ones by the bar. Drinks are cheap, the dress code is relaxed, and the crowd skews young, local, and social. It's a great starter club if you're new to Bucharest's nightlife: easy entry, big dance floors, and a party-first atmosphere that doesn't take itself too seriously.",
    city: 'Bucharest',
    region: 'Old Town',
    latitude: 44.4319,
    longitude: 26.1025,
    duration_min: 210,
    duration_max: 360,
    tags: ['category:nightlife','energy:high','mood:party','mood:energetic','mood:rebellious','context:friends','context:large-group','context:small-group','time_of_day:night','time_of_day:late-night','cost_band:$']
  },
  {
    slug: 'bucharest-boa-herastrau-hiphop-glam',
    name: 'BOA (Beat of Angels) Hip-Hop & R&B Night',
    category: 'nightlife',
    description: "A glamorous, showy Herăstrău staple where hip-hop, R&B, and commercial hits soundtrack a fashion parade. Inside, BOA is all mirrors, LEDs, and tight table layouts—the floor gets packed around midnight as dancers, performers, and a sharply dressed crowd lift the energy. Think bottle service, sparklers, and immaculate fits; DJs keep transitions fast so the room never dips. If the techno basements are Bucharest's soul, BOA is its sparkle: upscale, social, and unapologetically extra. Book a table if you're in a group; expect a firm door, a cover on prime nights, and a late peak (1–3am).",
    city: 'Bucharest',
    region: 'Herăstrău Park area',
    latitude: 44.4765,
    longitude: 26.0802,
    duration_min: 240,
    duration_max: 360,
    tags: ['category:nightlife','energy:high','mood:party','mood:luxe','mood:energetic','context:friends','context:large-group','context:date','time_of_day:night','time_of_day:late-night','cost_band:$$$$']
  },
  {
    slug: 'bucharest-fratelli-herastrau-house-lounge',
    name: 'House Night at Fratelli Lounge & Club',
    category: 'nightlife',
    description: "Fratelli blends a chic lounge aesthetic with a lively club floor set to house, vocal house, and polished party sets. The Herăstrău venue draws a glossy mix of locals and expats—groups celebrating, couples flirting at the bar, and a sea of tables buzzing with bottle service. Lighting is warm and cinematic with bursts of confetti on big hooks; the sound is punchy and pleasantly loud. Come late and plan to linger—the room really unlocks post-1am. Dress is upscale casual; reservations help. If you want a celebratory, sociable night with fewer elbows than a student club and more glamour than a pub crawl, this is it.",
    city: 'Bucharest',
    region: 'Herăstrău Park area',
    latitude: 44.47247,
    longitude: 26.11297,
    duration_min: 210,
    duration_max: 360,
    tags: ['category:nightlife','energy:high','mood:party','mood:luxe','mood:social','context:friends','context:large-group','context:date','time_of_day:night','time_of_day:late-night','cost_band:$$$']
  },
  {
    slug: 'bucharest-rooftop-nomad-skybar',
    name: 'Rooftop Cocktails at NOMAD Skybar',
    category: 'nightlife',
    description: "Set above Lipscani's cobbles, Nomad's glass-ceilinged rooftop frames Old Town's rooftops in warm light. By day it's brunch and breezy cocktails; by night, the music climbs from feel-good house to sing-along classics, and the vibe turns social—dates sharing plates under hanging greenery, crews posted up at high-tops, tourists and locals mingling at the bar. It's more 'party restaurant' than club: you'll sip mezcal sours and, before you know it, be dancing between tables. Entry is easy if you're early; later, door staff meter capacity. It's a great place to start (or end) an Old Town circuit.",
    city: 'Bucharest',
    region: 'Lipscani',
    latitude: 44.4321,
    longitude: 26.1001,
    duration_min: 120,
    duration_max: 240,
    tags: ['category:nightlife','energy:medium','mood:social','mood:romantic','mood:sophisticated','context:date','context:friends','context:small-group','time_of_day:evening','time_of_day:night','cost_band:$$$']
  }
];

async function importBatch1() {
  console.log('🌙 Importing Nightlife Batch 1: 6 activities...\n');
  
  for (const activity of activities) {
    try {
      await pool.query(`
        INSERT INTO activities (slug, name, category, description, city, region, latitude, longitude, duration_min, duration_max, tags)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
        ON CONFLICT (slug) DO UPDATE SET
          name = EXCLUDED.name,
          description = EXCLUDED.description,
          tags = EXCLUDED.tags
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
  console.log('\n✅ Batch 1 complete!');
}

importBatch1();
