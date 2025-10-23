/**
 * Import Bucharest Nightlife Batch 3 (6 activities - FINAL)
 */
import { Pool } from 'pg';
import dotenv from 'dotenv';
import { resolve } from 'path';

dotenv.config({ path: resolve(__dirname, '../.env') });

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

const activities = [
  {
    slug: 'bucharest-berariah-beerhall-live',
    name: 'Berăria H Beer Hall & Live Shows',
    category: 'nightlife',
    description: "One of Eastern Europe's largest beer halls sits by Herăstrău Park—vast wooden tables, a stage built for everything from tribute bands to pop stars, and a raucous, happy energy. Expect towers of lager, hearty platters, and a mixed crowd of families early and revellers later. The sound is big but clean for the size; lighting runs concert-style on show nights. It's not a club—it's a beer arena where you can sing, clink, and soak up a very Bucharest kind of spectacle.",
    city: 'Bucharest',
    region: 'Herăstrău Park area',
    latitude: 44.4764,
    longitude: 26.0809,
    duration_min: 150,
    duration_max: 240,
    tags: ['category:nightlife','energy:medium','mood:social','mood:party','mood:energetic','context:large-group','context:friends','context:small-group','time_of_day:evening','time_of_day:night','cost_band:$$']
  },
  {
    slug: 'bucharest-hugo-macca-hookah',
    name: 'Hookah & Lounge at Macca-Villacrosse (Hugo)',
    category: 'social',
    description: "Under the yellow-glass canopy of Macca-Villacrosse Passage sits Hugo, a hookah-forward lounge with Middle Eastern touches, low sofas, and a steady pulse of chart hits. The air smells of double apple and mint, staff swap hoses with practiced rhythm, and the vibe leans social: couples sharing a narghile, friends people-watching the arcade, tourists drifting in from Lipscani. Drinks are simple—long cocktails, highballs, fresh juices—and service keeps the rotation smooth. It's relaxed, atmospheric, and perfect for a conversational night with color.",
    city: 'Bucharest',
    region: 'Old Town',
    latitude: 44.43313,
    longitude: 26.09860,
    duration_min: 90,
    duration_max: 150,
    tags: ['category:social','energy:low','mood:chill','mood:romantic','mood:social','context:date','context:friends','context:small-group','context:solo','time_of_day:evening','time_of_day:night','cost_band:$']
  },
  {
    slug: 'bucharest-snakes-wizards-boardgames',
    name: 'Board-Game Evening at Snakes & Wizards',
    category: 'social',
    description: "A gamer's hideout right off Covaci with shelves of classics and new releases, Snakes & Wizards turns drinks + dice into a genuinely social night. Staff help you pick a game that fits your group and time; tables are big, lighting is even, and the soundtrack stays low enough to strategize. Expect student groups, date-night duos, and friend circles trading banter over cards and craft sodas/beer. It's cozy, low-stakes fun that still feels 'night out' without the hangover.",
    city: 'Bucharest',
    region: 'Lipscani',
    latitude: 44.4325,
    longitude: 26.1044,
    duration_min: 120,
    duration_max: 180,
    tags: ['category:social','energy:low','mood:chill','mood:social','mood:romantic','context:date','context:small-group','context:friends','time_of_day:evening','time_of_day:night','cost_band:$']
  },
  {
    slug: 'bucharest-craft-beer-oclock',
    name: 'Craft Beers at Beer O\'Clock',
    category: 'nightlife',
    description: "Tucked on Băcani near Lipscani's bustle, Beer O'Clock is a trusty craft stop with rotating taps and a back-bar of Romanian and international bottles. Inside is wood, chalkboards, and easy conversations; music stays background, letting hop nerds and casual drinkers compare notes. Prices are fair and the staff know their styles, steering you from crisp pilsners to punchy IPAs. It's a refreshing pause between louder stops—or a whole evening if you're in the mood for pints and talk.",
    city: 'Bucharest',
    region: 'Lipscani',
    latitude: 44.4320,
    longitude: 26.1026,
    duration_min: 120,
    duration_max: 210,
    tags: ['category:nightlife','energy:low','mood:chill','mood:social','mood:sophisticated','context:friends','context:small-group','context:solo','time_of_day:evening','time_of_day:night','cost_band:$']
  },
  {
    slug: 'bucharest-oldtown-sports-stpatrick',
    name: 'Sports & Pints at St. Patrick Irish Pub',
    category: 'nightlife',
    description: "Old Town's classic Irish pub with big screens, cold Guinness, and a warm wood-and-brass interior. Match nights pack the rooms with fans trading chants and rounds; off-nights feel like a social living room with hearty pub fare and friendly servers. Expect playlists that swing from rock to trad, plenty of standing space by the bar, and a tourist-meets-local mix that makes striking up conversation effortless. Great central base to start or finish an Old Town route.",
    city: 'Bucharest',
    region: 'Old Town',
    latitude: 44.4320,
    longitude: 26.1008,
    duration_min: 120,
    duration_max: 210,
    tags: ['category:nightlife','energy:medium','mood:social','mood:party','mood:chill','context:friends','context:large-group','context:small-group','context:solo','time_of_day:evening','time_of_day:night','cost_band:$$']
  }
];

async function importBatch3() {
  console.log('🌙 Importing Nightlife Batch 3 (FINAL): 5 activities...\n');
  
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
  console.log('\n🎉 All nightlife activities imported successfully!');
}

importBatch3();
