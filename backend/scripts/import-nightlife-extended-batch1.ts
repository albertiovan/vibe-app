/**
 * Import Extended Bucharest Nightlife Batch 1 (10 activities)
 */
import { Pool } from 'pg';
import dotenv from 'dotenv';
import { resolve } from 'path';

dotenv.config({ path: resolve(__dirname, '../.env') });

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

const activities = [
  {
    slug: 'bucharest-expirat-alt-rock-nights',
    name: 'Alt-Rock & Indie Nights at Expirat',
    category: 'nightlife',
    description: "A Bucharest institution, Expirat hums with that warehouse-meets-art-space energy: concrete, murals, and a system that hits crisp without frying your ears. Early evening starts with beers on the terrace; later, the main room swells with guitar-driven indie, alt-rock and crossover electronic bookings. The crowd is mixed—students, creatives, longtime regulars—who come for dancing, stage-diving energy near the front, and smoke-and-strobe silhouettes at the back. Expect themed parties, live sets from local heroes, and touring bands mid-week, with weekend lineups running until late. Drinks are fair-priced; door policies are relaxed; vibe is emphatically local. If you want Bucharest's alternative heart, this is it.",
    city: 'Bucharest',
    region: 'Universitate',
    latitude: 44.4350,
    longitude: 26.0931,
    duration_min: 180,
    duration_max: 300,
    tags: ['category:nightlife','energy:high','mood:party','mood:underground','mood:energetic','mood:social','context:friends','context:small-group','context:solo','time_of_day:evening','time_of_day:night','time_of_day:late-night','cost_band:$$']
  },
  {
    slug: 'bucharest-jazz-book-cotroceni-sessions',
    name: 'Live Jazz Sessions at The JAZZ BOOK',
    category: 'nightlife',
    description: "Hidden on a leafy Cotroceni street, The JAZZ BOOK feels like stepping into someone's living room—vinyl stacked on shelves, low lamps, and a tiny stage that puts you in arm's reach of the band. Expect straight-ahead jazz, bossa detours, and improvisational nights that drift from mellow to spirited as the room fills. The audience is intimate—date-night couples, musicians, and locals who know when to hush and when to cheer. Cocktails lean classic; wines are thoughtful; service is unhurried. It's the rare spot where conversation and music coexist, so you can sip, listen, and still talk without shouting. Grab a seat early; the best tables go fast.",
    city: 'Bucharest',
    region: 'Cotroceni',
    latitude: 44.4350,
    longitude: 26.0500,
    duration_min: 120,
    duration_max: 210,
    tags: ['category:nightlife','energy:medium','mood:romantic','mood:sophisticated','mood:chill','mood:social','context:date','context:small-group','context:solo','time_of_day:evening','time_of_day:night','cost_band:$$']
  },
  {
    slug: 'bucharest-hard-rock-cafe-live-sets',
    name: 'Live Anthems at Hard Rock Cafe Bucharest',
    category: 'nightlife',
    description: "Classic rock memorabilia, big stage, bigger sound—Hard Rock's Herăstrău location doubles as a dependable live venue. Expect tribute nights, touring acts, and local covers that turn into full-room singalongs. The crowd spans office crews to visiting fans; staff keep service fast even when the floor packs. Plenty of seating, standing room by the stage, and a patio when weather's kind. Drinks land mid-range; burgers and wings keep the energy up. It's polished, loud, and friendly—ideal when you want concert vibes without hunting down a one-off gig.",
    city: 'Bucharest',
    region: 'Herăstrău Park area',
    latitude: 44.4764,
    longitude: 26.0802,
    duration_min: 150,
    duration_max: 240,
    tags: ['category:nightlife','energy:medium','mood:party','mood:social','mood:energetic','context:friends','context:large-group','context:small-group','time_of_day:evening','time_of_day:night','cost_band:$$']
  },
  {
    slug: 'bucharest-face-club-herastrau-party',
    name: 'Peak Weekend at FACE Club',
    category: 'nightlife',
    description: "Mirroring, LEDs, and a precision sound system make FACE a magnet for late-night crews who want glossy production and chart-to-house crossovers. Expect dancers, confetti pops, and a VIP-friendly layout in the Herăstrău club belt. Dress codes skew sharp—heels, shirts, and a bit of sparkle get you waved in quicker. It's crowded and kinetic past 1am, with high-energy sets that bounce between mainstream house, hits, and Romanian favorites. If you want 'big night out' photos, this is where they're taken.",
    city: 'Bucharest',
    region: 'Herăstrău Park area',
    latitude: 44.4765,
    longitude: 26.0810,
    duration_min: 210,
    duration_max: 360,
    tags: ['category:nightlife','energy:high','mood:party','mood:luxe','mood:energetic','context:friends','context:large-group','context:small-group','time_of_day:night','time_of_day:late-night','cost_band:$$$']
  },
  {
    slug: 'bucharest-fix-me-a-drink-foraged-cocktails',
    name: 'Foraged Cocktails at FIX Me a Drink',
    category: 'nightlife',
    description: "Bucharest's cult cocktail address lives in a mid-century lobby bar, dimly lit and heavy on botanicals. Drinks lean Nordic-meets-Carpathian: spruce tips, sea buckthorn, pine cones, and hyper-seasonal syrups underpin elegant, low-waste recipes served in beautiful glassware. The room is hushed without being stiff; bartenders guide you gently into the interesting stuff. The crowd is design-savvy—chefs, creatives, and travelers who plan itineraries around bars. Expect a seat-only experience at peak hours and a playlist that keeps conversation centered. It's a masterclass in Romanian terroir, poured.",
    city: 'Bucharest',
    region: 'Obor & Romana',
    latitude: 44.4429,
    longitude: 26.0968,
    duration_min: 90,
    duration_max: 150,
    tags: ['category:nightlife','energy:low','mood:sophisticated','mood:romantic','mood:chill','context:date','context:small-group','context:solo','time_of_day:evening','time_of_day:night','cost_band:$$$']
  },
  {
    slug: 'bucharest-origo-cocktail-lab-nights',
    name: 'Origo Cocktail Evenings (Old Town)',
    category: 'nightlife',
    description: "By day, Origo is Bucharest's coffee benchmark; by night, its cocktail side turns the same precision to spirits. Expect a tight list executed perfectly—sours that balance, highballs that actually sparkle, and signatures that steer clear of gimmicks. The space is minimalist and warm: concrete, wood, and bar seating that lets you chat with the team while they work. Crowd is mixed and international, with plenty of locals who've been coming for years. If you want high quality without the velvet rope, start here.",
    city: 'Bucharest',
    region: 'Lipscani',
    latitude: 44.4320,
    longitude: 26.1020,
    duration_min: 90,
    duration_max: 150,
    tags: ['category:nightlife','energy:medium','mood:sophisticated','mood:social','mood:chill','context:date','context:friends','context:solo','context:small-group','time_of_day:evening','time_of_day:night','cost_band:$$']
  },
  {
    slug: 'bucharest-e3-entourage-floreasca-club',
    name: 'High-Gloss Nights at E3 by Entourage',
    category: 'nightlife',
    description: "Floreasca's E3 by Entourage mixes lounge polish with club punch: soft banquettes, theatrical lighting, and a crowd dressed for photos. Music trends commercial-house and high-energy edits with vocal hooks; expect sax or percussion cameos on busy nights. Bottle service is common; walk-ins possible earlier. It's the upscale side of Bucharest nightlife—less underground, more champagne pops and birthday sparklers.",
    city: 'Bucharest',
    region: 'Floreasca',
    latitude: 44.4700,
    longitude: 26.1050,
    duration_min: 180,
    duration_max: 330,
    tags: ['category:nightlife','energy:high','mood:luxe','mood:party','mood:energetic','context:friends','context:large-group','context:small-group','time_of_day:night','time_of_day:late-night','cost_band:$$$']
  },
  {
    slug: 'bucharest-uanderful-floreasca-lounge',
    name: 'Uanderful: Floreasca Lounge & Late Drinks',
    category: 'nightlife',
    description: "Dimly lit, smooth, and photogenic—Uanderful is where Floreasca winds down in velvet and wood. Think premium spirits, balanced classics, and a DJ who keeps it groovy not blaring. The crowd is well-heeled but friendly; conversations flow at tables while couples orbit the bar. Great pre-club warm-up or late-night wind-down when you want style without the crush.",
    city: 'Bucharest',
    region: 'Floreasca',
    latitude: 44.4705,
    longitude: 26.1048,
    duration_min: 90,
    duration_max: 180,
    tags: ['category:nightlife','energy:medium','mood:sophisticated','mood:luxe','mood:romantic','context:date','context:small-group','context:friends','time_of_day:evening','time_of_day:night','cost_band:$$$']
  },
  {
    slug: 'bucharest-nor-skytower-rooftop-cocktails',
    name: 'City-High Cocktails at NOR Sky (SkyTower)',
    category: 'nightlife',
    description: "Perched atop SkyTower, NOR frames Bucharest in floor-to-ceiling glass: sunset over Barbu Văcărescu, highways threading neon, planes blinking out by Otopeni. Drinks are polished—classics, spritzes, and elegant signatures—with a kitchen that holds its own. The vibe is 'date night meets business dinner,' morphing later into clinking glasses and photo-ops against the skyline. Smart-casual dress works; reservations strongly advised.",
    city: 'Bucharest',
    region: 'Floreasca',
    latitude: 44.4850,
    longitude: 26.0820,
    duration_min: 90,
    duration_max: 150,
    tags: ['category:nightlife','energy:medium','mood:romantic','mood:luxe','mood:sophisticated','context:date','context:small-group','time_of_day:evening','time_of_day:night','cost_band:$$$']
  },
  {
    slug: 'bucharest-18-lounge-sunset-rooftop',
    name: 'Sunset Rooftops at 18 Lounge (City Gate)',
    category: 'nightlife',
    description: "Above Piața Presei, 18 Lounge wraps a sleek dining room around postcard views of Herăstrău and the Arc's traffic ballet. Expect smooth service, balanced cocktails, and a DJ who keeps tempo classy. It's an elegant kickoff for upscale club nights nearby—or a full evening if you want to linger over courses. Dress smart; book for golden hour.",
    city: 'Bucharest',
    region: 'Herăstrău Park area',
    latitude: 44.4795,
    longitude: 26.0780,
    duration_min: 90,
    duration_max: 150,
    tags: ['category:nightlife','energy:medium','mood:sophisticated','mood:romantic','mood:luxe','context:date','context:small-group','time_of_day:evening','time_of_day:night','cost_band:$$$']
  }
];

async function importBatch1() {
  console.log('🌙 Extended Nightlife Batch 1: 10 activities...\n');
  
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
  console.log('\n✅ Batch 1 complete!');
}

importBatch1();
