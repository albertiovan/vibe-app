/**
 * Import Romania Premium Clubs & Venues (10 activities)
 */
import { Pool } from 'pg';
import dotenv from 'dotenv';
import { resolve } from 'path';

dotenv.config({ path: resolve(__dirname, '../.env') });

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

const activities = [
  {
    slug: 'romania-bucharest-boa-glam-night',
    name: 'VIP Glam Night at BOA - Beat of Angels',
    category: 'nightlife',
    description: "BOA is Bucharest's glossy, high-energy temple to late-night glamour, where confetti cannons and synchronized light rigs pulse to chart-topping house, commercial EDM, and hip-hop. Expect a polished, fashion-forward crowd, dancers on podiums, and a crisp sound system that thumps without muddiness. The main room feels like a stage set—LED walls, mirror accents, and sweeping beams that slice the haze—while bottle parades and theatrical shows keep the tempo peaking past 3am. Security runs a strict door (smart chic over sneakers), and the vibe tilts international: locals mixing with visiting DJs, pro athletes, and weekend city-breakers. Drinks skew premium—think magnums and signatures poured table-side—yet the bar team is quick with classics if you're just dropping in. Book a table for the full spectacle, or float between the bar rail and the dancefloor when the headliner comes on. It's loud, lavish, and laser-cut for those who want a capital-city blowout.",
    city: 'Bucharest',
    region: 'Herăstrău / Kiseleff',
    latitude: 44.468723,
    longitude: 26.080179,
    duration_min: 240,
    duration_max: 420,
    tags: ['category:nightlife','energy:high','mood:party','mood:energetic','mood:luxe','context:date','context:friends','context:small-group','context:large-group','time_of_day:night','time_of_day:late-night','cost_band:$$$$']
  },
  {
    slug: 'romania-cluj-noa-nest-of-angels',
    name: 'Premium Party at NOA – Nest of Angels',
    category: 'nightlife',
    description: "NOA is Cluj's flagship big-room experience—an elevated, glossy box of light and sound where commercial house, EDM and pop remixes surge through a packed main floor. The booth is high and centered; strobes chase across a sea of hands while CO₂ bursts kiss the drop. It's an upscale scene with Transylvanian edge: students, creators, visiting artists and tech teams out celebrating wins. Expect VIP islands and quick bottle service, plus a bar that moves efficiently on classics. The programming swings from resident crowd-pleasers to costumed theme nights; when the room hits its stride around 1am, it feels like a small festival indoors. Security is courteous but firm (ID, dress code). If you want Euro-club theatrics without losing the friendly Cluj vibe, this is the sweet spot—slick, social, and designed for a sunrise exit.",
    city: 'Cluj-Napoca',
    region: 'Republicii / Zorilor',
    latitude: 46.75678,
    longitude: 23.595085,
    duration_min: 240,
    duration_max: 420,
    tags: ['category:nightlife','energy:high','mood:party','mood:energetic','mood:luxe','mood:social','context:date','context:friends','context:small-group','context:large-group','time_of_day:night','time_of_day:late-night','cost_band:$$$']
  },
  {
    slug: 'romania-timisoara-epic-society',
    name: 'High-End Night at Epic Society',
    category: 'nightlife',
    description: "Timisoara's most polished dance room pairs crisp LEDs, clean low-end and a crowd that dresses to impress. Epic Society leans glossy: commercial dance, festival-flavored house, and a late set that often flips into hip-hop edits. The space is compact enough to feel electric but planned for flow—fast bars, raised VIP platforms, and a booth that keeps the floor glued to the drops. It's the place to celebrate—birthdays, promotions, 'we shipped'—with bottle sparklers tracing arcs in the haze. The door is selective but friendly if you look the part; inside, the vibe is international-meets-Banat, with students and founders mixing with weekenders from Serbia and Hungary. Go for a full table if you want the parade; roll in after midnight if you just want the peak-time rush.",
    city: 'Timișoara',
    region: 'Cetate / Str. Miresei',
    latitude: 45.76823,
    longitude: 21.22248,
    duration_min: 240,
    duration_max: 420,
    tags: ['category:nightlife','energy:high','mood:party','mood:energetic','mood:luxe','context:date','context:friends','context:small-group','context:large-group','time_of_day:night','time_of_day:late-night','cost_band:$$$']
  },
  {
    slug: 'romania-brasov-rockstadt-metal',
    name: 'Metal Nights at Rockstadt',
    category: 'nightlife',
    description: "Rockstadt is Romania's metal heartland: a black-walled, poster-plastered den where riffs rule and the beer is cold. The room hums with anticipation before doors—patches, leather, and band tees—then detonates when the first kick drum hits. Sightlines are strong, sound is loud but dialed, and the bar serves fast between sets. Expect a calendar heavy on heavy: death, black, thrash, stoner, plus alt-rock and punk weeknights, with touring acts and cult local heroes. It's inclusive, unpretentious, and cathartic—mosh at the edge, headbang from the rail, or talk gear at the merch table. If your luxury is authenticity and a stage five meters away, this is premium.",
    city: 'Brașov',
    region: 'Centru (Nicolae Titulescu)',
    latitude: 45.657974,
    longitude: 25.601198,
    duration_min: 180,
    duration_max: 300,
    tags: ['category:nightlife','energy:high','mood:rebellious','mood:underground','mood:party','mood:social','context:friends','context:small-group','context:solo','time_of_day:evening','time_of_day:night','time_of_day:late-night','cost_band:$$']
  },
  {
    slug: 'romania-targu-mures-jazz-blues',
    name: 'Live Jazz at Jazz & Blues Club',
    category: 'nightlife',
    description: "A veteran room with candlelit tables and a stage barely an arm's length away, Jazz & Blues Club is all about sound, nuance and late conversations. Horns glow under amber spots, cymbals shimmer, and the PA treats vocals with warmth—perfect for standards, bebop, and bluesy detours. The crowd is mixed—students, doctors fresh off shift, couples on a third date—united by an appetite for live music. Bartenders lean classic (Manhattan, Old Fashioned) with local labels for beer and wine. On jam nights, the energy softens into community: solos passed, smiles traded, time stretching. It's an old-school cultural anchor that still swings.",
    city: 'Târgu Mureș',
    region: 'Str. Sinaia',
    latitude: 46.55219,
    longitude: 24.55707,
    duration_min: 120,
    duration_max: 210,
    tags: ['category:nightlife','energy:medium','mood:sophisticated','mood:chill','mood:romantic','mood:social','context:date','context:friends','context:small-group','context:solo','time_of_day:evening','time_of_day:night','cost_band:$$']
  },
  {
    slug: 'romania-constanta-doors-club',
    name: 'Concert Night at Doors Club',
    category: 'nightlife',
    description: "Constanța's most reliable stage for rock, alt-pop and singer-songwriter tours, Doors feels like a seaside home base: warm wood, good sightlines, and a sound tech who likes it punchy but clear. The calendar swings from indie darlings to cult Romanian legends; between sets the room softens into a friendly pub—locals swapping stories, students comparing playlists, travelers chasing one more song before the Black Sea breeze. It's social more than scene: affordable drinks, fair tickets, and staff who'll tip you to the next show.",
    city: 'Constanța',
    region: 'Str. Traian / Centru',
    latitude: 44.168333,
    longitude: 28.638611,
    duration_min: 150,
    duration_max: 240,
    tags: ['category:nightlife','energy:medium','mood:social','mood:chill','mood:party','context:friends','context:small-group','context:solo','time_of_day:evening','time_of_day:night','cost_band:$']
  },
  {
    slug: 'romania-mamaia-ego-club-beach',
    name: 'Beach Club Night at EGO Mamaia',
    category: 'nightlife',
    description: "When summer lands on the Black Sea, EGO turns into a white-on-sand playground of champagne, sax-over-house sets, and sunrise selfies on the pier. The sound is glossy—melodic house into commercial peaks—with roaming performers and the occasional beach fireworks. Expect designer resortwear, lots of table service, and a soundtrack that refuses to quit as the sky goes pink. It's a scene—arrive early for seamless entry, later for that 'the night found us' energy.",
    city: 'Mamaia (Constanța)',
    region: 'Mamaia Nord',
    latitude: 44.271,
    longitude: 28.636,
    duration_min: 240,
    duration_max: 420,
    tags: ['category:nightlife','energy:high','mood:luxe','mood:party','mood:romantic','mood:energetic','context:date','context:friends','context:small-group','context:large-group','time_of_day:night','time_of_day:late-night','cost_band:$$$$']
  },
  {
    slug: 'romania-mamaia-fratelli-beach',
    name: 'Fratelli Beach & Club – House by the Sea',
    category: 'nightlife',
    description: "An all-day, all-night compound—private beach, restaurant, and club—Fratelli Mamaia is the classic Black Sea luxury night out. Early evening is rosé on daybeds as the DJ warms with deep house; by midnight the dancefloor swells and the lighting rig takes the lid off, with live vocal features and sax flourishes popping over the drop. The crowd is glossy coastal: locals, Bucharest weekender crews, and visitors in linen, all moving between terrace breezes and the main room's thunder. It's a 'book ahead, dress well, stay late' kind of night.",
    city: 'Mamaia (Constanța)',
    region: 'Mamaia Nord',
    latitude: 44.264,
    longitude: 28.633,
    duration_min: 240,
    duration_max: 420,
    tags: ['category:nightlife','energy:high','mood:luxe','mood:party','mood:romantic','context:date','context:friends','context:small-group','context:large-group','time_of_day:night','time_of_day:late-night','cost_band:$$$$']
  },
  {
    slug: 'romania-iasi-fratelli',
    name: 'Fratelli Iași – Luxe Mixed Music Night',
    category: 'nightlife',
    description: "Palas-side glamour with a Romanian-meets-international playlist: commercial dance, pop edits, hip-hop interludes, and occasional live features. The room's lighting is architectural—beams sketch across the ceiling, making even the back bar feel in the show. It's a dress-up crowd (smart casual into sharp), where birthdays and reunions collide with conference after-parties. Drinks lean premium with competent classics, and staff keep tables humming. If you want a capital-style VIP night in Moldavia, this is the move.",
    city: 'Iași',
    region: 'Palas / Morilor',
    latitude: 47.160,
    longitude: 27.595,
    duration_min: 240,
    duration_max: 420,
    tags: ['category:nightlife','energy:high','mood:luxe','mood:party','mood:social','context:date','context:friends','context:small-group','context:large-group','time_of_day:night','time_of_day:late-night','cost_band:$$$']
  },
  {
    slug: 'romania-cluj-euphoria-live',
    name: 'Euphoria Music Hall – Big-Room Live & Party',
    category: 'nightlife',
    description: "A cavernous Cluj institution that flips between concert hall and giant party, Euphoria packs students and alumni into a space built for sing-alongs and big drops. Live nights deliver Romanian rock staples and touring acts; weekends tilt to retro themes and high-energy club sets under an LED ceiling and a tight, chest-thumping low end. Bars are long and quick, security is visible but chill, and the mood is 'best friend's graduation, but every night.' It's the city's easiest way to end up shouting the chorus with strangers.",
    city: 'Cluj-Napoca',
    region: 'Bulgaria / 1 Decembrie 1918',
    latitude: 46.774,
    longitude: 23.585,
    duration_min: 180,
    duration_max: 360,
    tags: ['category:nightlife','energy:high','mood:party','mood:social','mood:energetic','context:friends','context:large-group','context:small-group','time_of_day:evening','time_of_day:night','time_of_day:late-night','cost_band:$$']
  }
];

async function importPremiumClubs() {
  console.log('💎 Importing Premium Clubs & Venues: 10 activities...\n');
  
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
  console.log('\n🎉 ALL PREMIUM CLUBS & VENUES IMPORTED!');
  console.log('💎 Luxury clubs, live music venues & beach clubs added');
}

importPremiumClubs();
