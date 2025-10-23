/**
 * Import Extended Bucharest Nightlife Batch 2 (10 activities)
 */
import { Pool } from 'pg';
import dotenv from 'dotenv';
import { resolve } from 'path';

dotenv.config({ path: resolve(__dirname, '../.env') });

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

const activities = [
  {
    slug: 'bucharest-linea-closer-to-the-moon-rooftop',
    name: 'LINEA / Closer to the Moon Rooftop',
    category: 'nightlife',
    description: "A staple rooftop right by Old Town, LINEA is all about twinkle-light skyline, relaxed couches, and crowd-pleasing mixes. Expect summer queues, winter domes, and a soundtrack that leans feel-good rather than niche. Ideal for groups, out-of-towners, and anyone who wants the 'Bucharest from above' moment without a dress code.",
    city: 'Bucharest',
    region: 'Old Town',
    latitude: 44.4327,
    longitude: 26.0993,
    duration_min: 90,
    duration_max: 150,
    tags: ['category:nightlife','energy:medium','mood:social','mood:romantic','mood:chill','context:friends','context:large-group','context:date','time_of_day:evening','time_of_day:night','cost_band:$$']
  },
  {
    slug: 'bucharest-mojo-karaoke-live',
    name: 'Mojo: Karaoke & Live Band Nights',
    category: 'nightlife',
    description: "Old Town's karaoke institution stacks a sports bar, live stage, and a late-night karaoke room into one buzzing vertical space. Early doors, it's pints and matches on TV; later, expect a warm-hearted karaoke crowd where support is loud and the queue moves. Weekends bring full-band covers and theme parties. It's unpretentious, friendly, and reliably open late—perfect for mixed groups.",
    city: 'Bucharest',
    region: 'Lipscani',
    latitude: 44.4323,
    longitude: 26.1020,
    duration_min: 150,
    duration_max: 240,
    tags: ['category:nightlife','energy:high','mood:party','mood:social','mood:energetic','context:friends','context:large-group','context:small-group','time_of_day:night','time_of_day:late-night','cost_band:$$']
  },
  {
    slug: 'bucharest-shoteria-old-town-shots',
    name: 'SHOTERIA Old Town: Rapid-Fire Shots',
    category: 'nightlife',
    description: "Neon, lab coats, and trays of technicolor shots—SHOTERIA is pure party theatre. The menu riffs on classics (think B-52s, picklebacks, boozy sorbets) and the bartenders keep the tempo as high as the music. It's a pre-game launchpad that often becomes the whole night. Expect a young, international crowd and a floor that's rarely still.",
    city: 'Bucharest',
    region: 'Old Town',
    latitude: 44.4318,
    longitude: 26.1010,
    duration_min: 60,
    duration_max: 120,
    tags: ['category:nightlife','energy:high','mood:party','mood:energetic','mood:rebellious','context:friends','context:small-group','time_of_day:evening','time_of_day:night','time_of_day:late-night','cost_band:$']
  },
  {
    slug: 'bucharest-beluga-music-cocktails',
    name: 'Beluga: Music & Cocktails (Old Town)',
    category: 'nightlife',
    description: "Glam chandelier bar where cocktails share billing with a resident DJ. Think commercial house and sing-along edits with a fashionable crowd—birthday booths, dressy dates, and weekend visitors. Service is polished; photo moments abound. If you want Old Town energy but in a velvet-rope wrapper, Beluga's your pick.",
    city: 'Bucharest',
    region: 'Lipscani',
    latitude: 44.4322,
    longitude: 26.1015,
    duration_min: 120,
    duration_max: 210,
    tags: ['category:nightlife','energy:high','mood:luxe','mood:party','mood:social','context:date','context:friends','context:large-group','time_of_day:evening','time_of_day:night','time_of_day:late-night','cost_band:$$$']
  },
  {
    slug: 'bucharest-fire-club-rock-alt',
    name: 'Fire Club: Rock & Alternative',
    category: 'nightlife',
    description: "One of Lipscani's old-guard rock bars—brick arches, posters, and a stage that sweats. Expect punk, metal, indie, and tribute nights, plus karaoke mid-week. Beer's cheap, shots fly, and the pit wakes up when guitars get crunchy. It's the honest, noisy side of Old Town.",
    city: 'Bucharest',
    region: 'Lipscani',
    latitude: 44.4325,
    longitude: 26.1022,
    duration_min: 150,
    duration_max: 240,
    tags: ['category:nightlife','energy:high','mood:underground','mood:rebellious','mood:party','context:friends','context:small-group','context:solo','time_of_day:night','time_of_day:late-night','cost_band:$']
  },
  {
    slug: 'bucharest-st-patrick-irish-pub-sports',
    name: 'St. Patrick Irish Pub: Sports & Pints',
    category: 'nightlife',
    description: "Split-level Irish pub with plenty of screens, Guinness poured right, and hearty pub grub. Match nights are loud and friendly; off-nights run quizzes and live tunes. It's a crowd-pleaser for mixed groups wanting pints and a seat without the club crush.",
    city: 'Bucharest',
    region: 'Lipscani',
    latitude: 44.4320,
    longitude: 26.1008,
    duration_min: 120,
    duration_max: 210,
    tags: ['category:nightlife','energy:medium','mood:social','mood:chill','mood:party','context:friends','context:large-group','context:small-group','time_of_day:evening','time_of_day:night','cost_band:$$']
  },
  {
    slug: 'bucharest-beer-oclock-craft-bar',
    name: 'Beer O\'Clock: Craft & Imports',
    category: 'nightlife',
    description: "A narrow, always-buzzing craft bar stacking Romanian microbrews beside Belgian staples and seasonal specials. Staff are happy to guide you through taps and fridges; prices stay friendly. Expect stand-and-chat energy with spillover to the street in summer.",
    city: 'Bucharest',
    region: 'Lipscani',
    latitude: 44.4320,
    longitude: 26.1026,
    duration_min: 90,
    duration_max: 150,
    tags: ['category:nightlife','energy:medium','mood:social','mood:chill','context:friends','context:small-group','context:solo','time_of_day:evening','time_of_day:night','cost_band:$']
  },
  {
    slug: 'bucharest-bruno-wine-bar',
    name: 'Bruno Wine Bar: Cellar Vibes',
    category: 'nightlife',
    description: "Intimate cellar bar with a broad Euro-Romanian bottle list and staff who steer you to something new without fuss. Candlelit corners and low chatter make it ideal for long catch-ups, first dates, or a pre-dinner glass before Old Town gets rowdy.",
    city: 'Bucharest',
    region: 'Lipscani',
    latitude: 44.4324,
    longitude: 26.1018,
    duration_min: 90,
    duration_max: 150,
    tags: ['category:nightlife','energy:low','mood:romantic','mood:chill','mood:sophisticated','context:date','context:small-group','context:solo','time_of_day:evening','time_of_day:night','cost_band:$$']
  },
  {
    slug: 'bucharest-club-surubelnita-underground',
    name: 'Club Șurubelnița: Underground Party Bar',
    category: 'nightlife',
    description: "A beloved, rough-around-the-edges night bar near Universitate: cheap drinks, friendly bartenders, and a dance floor that wakes up after midnight. Expect alternative/indie playlists with forays into pop guilty pleasures. It's chaotic in the best way—great for big nights that don't need bottle service.",
    city: 'Bucharest',
    region: 'Universitate',
    latitude: 44.4365,
    longitude: 26.1015,
    duration_min: 150,
    duration_max: 300,
    tags: ['category:nightlife','energy:high','mood:underground','mood:party','mood:rebellious','mood:social','context:friends','context:large-group','context:small-group','time_of_day:night','time_of_day:late-night','cost_band:$']
  },
  {
    slug: 'bucharest-quantic-rock-metal',
    name: 'Quantic: Rock & Metal Live',
    category: 'nightlife',
    description: "Grozăvești's concert workhorse hosts everything from folk-rock to extreme metal, with a big beer garden for pre-show hangs. Indoors, the stage, pits, and sound are dialed for guitars; outdoors, summer nights stretch with food stalls and chill tables. Expect passionate crowds and fair ticket prices.",
    city: 'Bucharest',
    region: 'Cotroceni',
    latitude: 44.4380,
    longitude: 26.0450,
    duration_min: 180,
    duration_max: 300,
    tags: ['category:nightlife','energy:high','mood:underground','mood:energetic','mood:social','context:friends','context:small-group','time_of_day:evening','time_of_day:night','cost_band:$$']
  }
];

async function importBatch2() {
  console.log('🌙 Extended Nightlife Batch 2: 10 activities...\n');
  
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
  console.log('\n✅ Batch 2 complete!');
}

importBatch2();
