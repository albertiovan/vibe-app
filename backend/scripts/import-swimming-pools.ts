/**
 * Import Bucharest Swimming Pools (10 activities)
 */
import { Pool } from 'pg';
import dotenv from 'dotenv';
import { resolve } from 'path';

dotenv.config({ path: resolve(__dirname, '../.env') });

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

const activities = [
  {
    slug: 'bucharest-dinamo-evening-lanes',
    name: 'Evening Lanes at Dinamo Olympic Pool',
    category: 'social',
    description: "Under the echo of bleachers and the soft slap of water on tile, Dinamo's 50-meter Olympic basin feels purpose-built for mileage. Eight crisp lanes, electronic timing boards, and regimented lane etiquette keep things moving, while the gallery above hums with club energy. Expect a mixed crowd of club swimmers, triathletes, and after-work lap fans—serious but friendly, more performance than preening. Fluorescents run bright, water is on the cool side, and the lifeguards are attentive. It's old-school Bucharest sport culture: practical changing rooms, hot showers, and a schedule that favors training blocks over lounging. Grab a lane, set your intervals, and you'll forget you're in the middle of the city until you surface for air and hear the muffled whistle. Day passes available; peak lanes fill from 18:00 to 20:30, so come slightly before or after for clearer water.",
    city: 'Bucharest',
    region: 'Floreasca',
    latitude: 44.4550833,
    longitude: 26.1024444,
    duration_min: 60,
    duration_max: 120,
    tags: ['category:social','energy:medium','mood:energetic','mood:social','context:solo','context:friends','context:small-group','time_of_day:evening','cost_band:$$']
  },
  {
    slug: 'bucharest-magic-place-sunset-splash',
    name: 'Sunset Splash at Magic Place Aqua Park',
    category: 'social',
    description: "When the heat slips off the concrete and Lacul Morii glows, Magic Place turns into Bucharest's open-air swim playground. Big blue pools catch the last gold light, slides thrum with whoops, and the DJ line keeps a light, pop-leaning pulse. Families claim cabanas by day; after work, groups of friends drift between loungers, bars, and the water for an easy, social vibe. It's less training, more unwinding: float, snack, rinse, repeat. Expect queues on scorching weekends, and a lively, mixed crowd from across the city. Staff manage capacity well, lifeguards are visible, and there's plenty of deck space to sprawl. Ideal for a half-day of lazy laps and low-key fun.",
    city: 'Bucharest',
    region: 'Crângași',
    latitude: 44.456310,
    longitude: 26.044560,
    duration_min: 180,
    duration_max: 360,
    tags: ['category:social','energy:medium','mood:social','mood:party','mood:chill','context:friends','context:small-group','context:large-group','time_of_day:evening','cost_band:$$']
  },
  {
    slug: 'bucharest-stejarii-country-swim',
    name: 'Club Swim & Sun at Stejarii Country Club',
    category: 'social',
    description: "Hidden amidst the greenery north of Herăstrău, Stejarii is Bucharest's luxury wellness bubble. Morning steam rises over a sleek indoor pool; in summer the outdoor terraces hum with clinking glasses and soft lounge music as members drift from sunbeds to shaded daybeds. The water is immaculate, lighting is warm and diffuse, and the crowd leans executive and expat with a wellness bent. It's where laps meet lifestyle—saunas, hot/cold therapy, a pro gym, and attentive service fold into an all-day retreat. Expect discreet, polished energy rather than scene-y flash. Membership is required (limited day access may be offered via spa/packages).",
    city: 'Bucharest',
    region: 'Băneasa / Herăstrău',
    latitude: 44.492900,
    longitude: 26.075210,
    duration_min: 120,
    duration_max: 240,
    tags: ['category:social','energy:low','mood:sophisticated','mood:luxe','mood:chill','context:date','context:friends','context:small-group','time_of_day:evening','cost_band:$$$$']
  },
  {
    slug: 'bucharest-daimon-wellness-dip',
    name: 'After-Work Dip at Daimon Wellness (Tineretului)',
    category: 'social',
    description: "Set just off the park's leafy paths, Daimon's pool area draws a friendly neighborhood crowd for post-work swims and summer lounging. Expect a clean rectangular basin for easy laps earlier in the evening and a chill social atmosphere as the sun drops—low music, café service, and clusters of friends rotating between water, deck chairs, and chats. It's casual and accessible, with lifeguards on deck and straightforward facilities. Warm nights carry a soft breeze off Tineretului's trees, and the vibe stays relaxed rather than raucous. Great for a light workout followed by a terrace drink.",
    city: 'Bucharest',
    region: 'Tineretului',
    latitude: 44.413227,
    longitude: 26.107828,
    duration_min: 90,
    duration_max: 180,
    tags: ['category:social','energy:medium','mood:social','mood:chill','context:friends','context:small-group','context:large-group','time_of_day:evening','cost_band:$$']
  },
  {
    slug: 'bucharest-crowne-ana-spa-laps',
    name: 'Laps & Steam at Crowne Plaza ANA Spa',
    category: 'social',
    description: "North of the center by Romexpo, ANA Spa wraps a calm, modern pool in warm wood, soft down-lighting, and the hush of a hotel spa. It's a great 'reset' swim: unhurried lanes, good water quality, and an easy glide from pool to sauna/steam and a quiet relaxation zone. The clientele mixes hotel guests, conference travelers sneaking a session between meetings, and locals with wellness memberships; the tone is polite and low-key. Expect professional staff, towels on hand, and tidy locker rooms. Post-swim, the glass-walled lounge looks into green gardens—nice for a tea before heading back out.",
    city: 'Bucharest',
    region: 'Romexpo / Herăstrău',
    latitude: 44.479470,
    longitude: 26.064459,
    duration_min: 90,
    duration_max: 180,
    tags: ['category:social','energy:low','mood:chill','mood:sophisticated','context:solo','context:date','context:friends','time_of_day:evening','cost_band:$$$']
  },
  {
    slug: 'bucharest-novotel-city-centre-swim',
    name: 'City-Centre Swim at Novotel Wellness',
    category: 'social',
    description: "Right on Calea Victoriei, Novotel's wellness floor offers a compact, heated indoor pool that's more unwind than workout. Ambient lighting, a small wave feature, steam room, and loungers make it a convenient decompression stop after museum-hopping or meetings downtown. The atmosphere is civil and calm—couples, solo travelers, and a few locals who like the central convenience. It's not a lane-grind spot, but off-peak you can log easy lengths. Pair it with an evening stroll down Victoriei or a glass of wine nearby.",
    city: 'Bucharest',
    region: 'City Centre / Universitate',
    latitude: 44.436832,
    longitude: 26.097180,
    duration_min: 60,
    duration_max: 120,
    tags: ['category:social','energy:low','mood:chill','mood:romantic','mood:sophisticated','context:date','context:solo','context:friends','time_of_day:evening','cost_band:$$']
  },
  {
    slug: 'bucharest-carol-davila-campus-swim',
    name: 'Campus Swim at Carol Davila Pool (Cotroceni)',
    category: 'social',
    description: "In the academic enclave near Eroilor, the medical university's pool hosts structured classes and adult sessions in a no-nonsense, athletic setting. The vibe is studious: coaches timing sets, steady whistles, and lane discipline that keeps splits honest. Lighting is bright, water temp geared to training, and lanes rotate between lessons and free swim—check schedules. Expect students, club swimmers, and neighborhood regulars; facilities are functional more than fancy, but the value is excellent.",
    city: 'Bucharest',
    region: 'Cotroceni / Eroilor',
    latitude: 44.4353197,
    longitude: 26.0705778,
    duration_min: 60,
    duration_max: 120,
    tags: ['category:social','energy:medium','mood:energetic','mood:social','context:solo','context:friends','context:small-group','time_of_day:evening','cost_band:$']
  },
  {
    slug: 'bucharest-olimpia-iancului-lengths',
    name: 'Affordable Lengths at Olimpia (Iancului)',
    category: 'social',
    description: "A staple of Sector 2, Olimpia's covered pool is about straightforward access to water time—no frills, steady lane turnover, and friendly desk staff. The crowd blends families, adult learners, and budget-minded lap swimmers. Evenings see a gentle buzz as lessons wrap and lanes free up. Locker rooms are simple and serviceable; bring your own lock and cap. It's a neighborhood classic for routine fitness without the fee shock.",
    city: 'Bucharest',
    region: 'Iancului / Muncii',
    latitude: 44.442738,
    longitude: 26.148557,
    duration_min: 60,
    duration_max: 120,
    tags: ['category:social','energy:medium','mood:social','mood:chill','context:solo','context:friends','context:small-group','time_of_day:evening','cost_band:$']
  },
  {
    slug: 'bucharest-mega-mall-semiolympic',
    name: 'Semi-Olympic Session at World Class Mega Mall (Pantelimon)',
    category: 'social',
    description: "On the upper floors of Mega Mall, World Class runs a clean, semi-Olympic pool with proper lane lines, bright lighting, and pro lifeguards—ideal for structured after-work sets when you're in the east. The club ambience adds saunas, hot showers, and a full gym; the deck is wide and sightlines are open. Peak hours attract members doing serious cardio and strength before or after their swim, while later evenings soften into an easy cruise. Day passes may be offered; memberships get prime access.",
    city: 'Bucharest',
    region: 'Pantelimon / Arena Națională',
    latitude: 44.446767,
    longitude: 26.155519,
    duration_min: 60,
    duration_max: 120,
    tags: ['category:social','energy:medium','mood:energetic','mood:social','context:solo','context:friends','context:small-group','time_of_day:evening','cost_band:$$']
  },
  {
    slug: 'bucharest-jwmarriott-grand-lanes',
    name: 'Grand Lanes at World Class The Grand (JW Marriott)',
    category: 'social',
    description: "Inside the JW Marriott complex, The Grand's World Class pool delivers a polished, hotel-club experience: warm lighting, calm water, and the hush of soft-touch spa design. Lanes suit steady, recreational sets; afterwards, slide into sauna/steam or the weight floor. The crowd mixes hotel guests in robes with members in training mode, but the tone remains refined and unhurried. Service is professional, towels are ready, and you can wrap with a tea in the lobby's marble glow. A classy central-west option.",
    city: 'Bucharest',
    region: 'Cotroceni / 13 Septembrie',
    latitude: 44.425400,
    longitude: 26.077300,
    duration_min: 60,
    duration_max: 150,
    tags: ['category:social','energy:low','mood:chill','mood:sophisticated','mood:luxe','context:date','context:solo','context:friends','time_of_day:evening','cost_band:$$$']
  }
];

async function importSwimmingPools() {
  console.log('🏊 Importing Swimming Pool Activities: 10 locations...\n');
  
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
  console.log('\n🎉 ALL SWIMMING POOL ACTIVITIES IMPORTED!');
}

importSwimmingPools();
