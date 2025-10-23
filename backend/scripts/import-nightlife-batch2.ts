/**
 * Import Bucharest Nightlife Batch 2 (6 activities)
 */
import { Pool } from 'pg';
import dotenv from 'dotenv';
import { resolve } from 'path';

dotenv.config({ path: resolve(__dirname, '../.env') });

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

const activities = [
  {
    slug: 'bucharest-rooftop-linea-closer-moon',
    name: 'Rooftop Sundowners at Linea / Closer to the Moon',
    category: 'nightlife',
    description: "A photogenic terrace perched on Lipscani 17, Linea is sunset central—golden light, skyline views, and a soundtrack cruising from nu-disco to easy house. Seating clusters around planters and a sleek bar; heaters and canopies stretch the season, but on clear nights the terrace sparkles. The crowd is mixed but style-conscious: couples shooting golden-hour selfies, small groups clinking spritzes, and birthday tables leaning into celebratory energy. It's lively without being chaotic. Cocktails are polished and modern; reservations recommended for prime times. Perfect for a chic pregame that often becomes the main event.",
    city: 'Bucharest',
    region: 'Lipscani',
    latitude: 44.4327,
    longitude: 26.0993,
    duration_min: 120,
    duration_max: 210,
    tags: ['category:nightlife','energy:medium','mood:romantic','mood:sophisticated','mood:social','context:date','context:friends','context:small-group','time_of_day:evening','time_of_day:night','cost_band:$$$']
  },
  {
    slug: 'bucharest-mojo-live-karaoke',
    name: 'Live Band & Karaoke at Mojo Music Club',
    category: 'nightlife',
    description: "Mojo is Old Town's three-floor funhouse: a cavernous karaoke stage where strangers become duet partners, a live-band floor smashing rock/pop covers, and a chill pub level for regrouping between sets. Expect colored spotlights, thumping but friendly sound, and a buoyant, mixed crowd—students, office crews, visiting stag parties, and locals who know the staff on a first-name basis. Drinks are straightforward, prices fair, and the energy contagious. It's the kind of place you wander into for 'one song' and leave at 3am with a hoarse voice and ten new videos on your phone.",
    city: 'Bucharest',
    region: 'Old Town',
    latitude: 44.4323,
    longitude: 26.1020,
    duration_min: 180,
    duration_max: 300,
    tags: ['category:nightlife','energy:high','mood:party','mood:social','mood:energetic','context:friends','context:large-group','context:small-group','time_of_day:night','time_of_day:late-night','cost_band:$']
  },
  {
    slug: 'bucharest-green-hours-jazz-night',
    name: 'Intimate Jazz Night at Green Hours',
    category: 'nightlife',
    description: "Bucharest's legendary jazz café hides behind a leafy garden on Calea Victoriei. Inside, it's all candlelit tables, compact stage, and discreet service; outside, a bohemian terrace hums when the weather's kind. Expect modern jazz trios, singer-songwriters, and theater/alternative events. The room's acoustics flatter warm horns and brushed drums; conversation is possible between sets. Crowd skews artsy and local with visiting jazz heads in the mix. It's a slower, more soulful slice of the city—perfect for dates or a decompression night after heavy clubbing.",
    city: 'Bucharest',
    region: 'Obor & Romana',
    latitude: 44.4429,
    longitude: 26.0965,
    duration_min: 120,
    duration_max: 180,
    tags: ['category:nightlife','energy:medium','mood:sophisticated','mood:chill','mood:romantic','context:date','context:small-group','context:solo','time_of_day:evening','time_of_day:night','cost_band:$$']
  },
  {
    slug: 'bucharest-the-fool-standup',
    name: 'Stand-Up Night at The Fool Comedy Club',
    category: 'nightlife',
    description: "The city's dedicated stand-up hub sits just off University Square. Inside: a low stage, tight seating, and a room designed for punchlines—spotlit faces, crisp vocal clarity, and a bar primed for drink refills between sets. Bills mix Romanian comics (often in Romanian) with occasional English-friendly shows; the crowd is students, office crews, and couples on a low-pressure date night. Energy ramps with late shows and weekend specials. If you want a laugh-forward night that still leaves time for post-show drinks nearby, this is your anchor.",
    city: 'Bucharest',
    region: 'Universitate',
    latitude: 44.4359,
    longitude: 26.1000,
    duration_min: 90,
    duration_max: 150,
    tags: ['category:nightlife','energy:medium','mood:social','mood:chill','mood:romantic','context:date','context:friends','context:small-group','time_of_day:evening','time_of_day:night','cost_band:$$']
  },
  {
    slug: 'bucharest-kiki-lounge-romana',
    name: 'KIKI Lounge & Bar (LGBTQ+ friendly) Cocktails',
    category: 'social',
    description: "A cozy, neon-lit nest on Bulevardul Dacia where the LGBTQ+ community and allies gather over well-made cocktails and pop/house playlists. The space is intimate—soft banquettes, mirrors, low lighting—and the staff keep the tone welcoming; think flirty eye contact across the room and easy chats at the bar. Weekends can shift from lounge-y to dance-y as the night deepens. It's a safe, stylish spot to warm up before a bigger club night or to settle in for conversation-heavy rounds.",
    city: 'Bucharest',
    region: 'Obor & Romana',
    latitude: 44.4477,
    longitude: 26.1016,
    duration_min: 90,
    duration_max: 180,
    tags: ['category:social','energy:medium','mood:social','mood:romantic','mood:sophisticated','context:date','context:friends','context:small-group','context:solo','time_of_day:evening','time_of_day:night','cost_band:$$']
  },
  {
    slug: 'bucharest-queens-club-universitate',
    name: 'Queens Club LGBTQ+ Night',
    category: 'nightlife',
    description: "A lively LGBTQ+-friendly club near Carol/Universitate that leans into camp and pop: drag shows, throwback divas, and high-gloss dance anthems. The room is intimate but spirited—tight dance floor, glittering lights, and a crowd that turns up the moment the chorus hits. Expect zero-attitude vibes, lots of sing-alongs, and quick bar service. For a colorful, welcoming night that's heavy on community and light on pretense, Queens is a great call.",
    city: 'Bucharest',
    region: 'Universitate',
    latitude: 44.43724,
    longitude: 26.10949,
    duration_min: 180,
    duration_max: 300,
    tags: ['category:nightlife','energy:high','mood:party','mood:energetic','mood:romantic','context:friends','context:small-group','context:solo','time_of_day:night','time_of_day:late-night','cost_band:$$']
  }
];

async function importBatch2() {
  console.log('🌙 Importing Nightlife Batch 2: 6 activities...\n');
  
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
  console.log('\n✅ Batch 2 complete!');
}

importBatch2();
