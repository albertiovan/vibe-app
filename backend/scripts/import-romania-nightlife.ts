/**
 * Import Romania Regional Nightlife (14 activities)
 */
import { Pool } from 'pg';
import dotenv from 'dotenv';
import { resolve } from 'path';

dotenv.config({ path: resolve(__dirname, '../.env') });

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

const activities = [
  {
    slug: 'cluj-flying-circus-alt-nights',
    name: 'Flying Circus Alt Nights',
    category: 'nightlife',
    description: "Cluj's cult alt venue lives above Union Square's cobbles, with big sash windows that leak neon onto the street and a sound system that swings from jangly indie to drum & bass and live Balkan brass. Inside it's brick arches, flyers from a thousand gigs, and a stage that's close enough to touch. Weeknights skew artsy—open mics, niche cinema, vinyl sessions—while weekends turn sweaty with DJs pushing breakbeat, house, and pop-punk singalongs until the lights come up. The crowd blends students, expats, and locals who know every chorus; cheap beers fuel the chorus of clinks at the bar while strobes ripple across the low ceiling. Expect spontaneous dance circles, a friendly door, and a safe, social vibe that welcomes solo wanderers and big groups alike. It's the kind of place you arrive for 'one drink' and leave at sunrise, hoarse and happy.",
    city: 'Cluj-Napoca',
    region: 'Centru',
    latitude: 46.769539,
    longitude: 23.589831,
    duration_min: 180,
    duration_max: 360,
    tags: ['category:nightlife','energy:high','mood:party','mood:social','mood:underground','mood:energetic','context:friends','context:small-group','context:solo','context:large-group','time_of_day:evening','time_of_day:night','time_of_day:late-night','cost_band:$']
  },
  {
    slug: 'cluj-joben-steampunk-cocktails',
    name: 'Steampunk Cocktails at Joben',
    category: 'nightlife',
    description: "All brass fittings, copper coils, and glowing gauges, Joben is a whimsical, steampunk-themed hideout where bartenders in suspenders shake crystal-clear highballs and smoky, aromatic signatures built on Romanian spirits. The room hums at a conversational volume—vinyl soul and electro-swing under low amber lighting—while couples tuck into velvet booths and small groups orbit the long wood bar for bartender's choice riffs. Expect a mixed, well-dressed crowd: creatives, date-nighters, visiting foodies. The menu runs from refined sours and clarified classics to zero-ABV spritzes; glassware is theatrical, but service stays warm and unpretentious. It's a classy staging post before a big night, or a destination if you prefer sophistication over decibels. Reservations help on weekends; dress smart-casual and let the bar team narrate the build of your drink.",
    city: 'Cluj-Napoca',
    region: 'Centru',
    latitude: 46.767080,
    longitude: 23.593750,
    duration_min: 120,
    duration_max: 210,
    tags: ['category:nightlife','energy:medium','mood:sophisticated','mood:romantic','mood:luxe','mood:social','context:date','context:small-group','context:friends','time_of_day:evening','time_of_day:night','cost_band:$$']
  },
  {
    slug: 'timisoara-darc-unirii-sessions',
    name: "D'Arc Unirii Sessions",
    category: 'nightlife',
    description: "One of Timișoara's longest-running nightlife anchors sits right on baroque Piața Unirii. Early evening, the terrace is the city's living room; late, a compact, black-box interior kicks into house, disco edits, hip-hop and throwback rock. The mood is friendly and unpolished in the best way—workshop lights over brick, a tight bar pouring easy beer and classic mixed drinks, and a floor that fills fast when the DJ teases a 90s banger. Students mingle with professionals, pre-gaming expats, and weekenders city-tripping from Serbia and Hungary. Security is chill, staff are quick, and prices are gentle for a prime-square address. Dress code is whatever feels good; energy builds from 22:00 and often peaks around 01:30. If you want the full experience, start with golden-hour on the square and drift inside when the bassline thickens.",
    city: 'Timișoara',
    region: 'Cetate',
    latitude: 45.757527,
    longitude: 21.229330,
    duration_min: 180,
    duration_max: 330,
    tags: ['category:nightlife','energy:high','mood:party','mood:social','mood:energetic','context:friends','context:small-group','context:large-group','context:solo','time_of_day:evening','time_of_day:night','time_of_day:late-night','cost_band:$']
  },
  {
    slug: 'timisoara-scart-loc-lejer-lounge',
    name: 'Scârț Loc Lejer Living-Room Lounge',
    category: 'social',
    description: "Part living-room, part time capsule, this beloved house-turned-hangout wraps you in retro couches, kitschy lamps, and the adjoining Museum of the Communist Consumer. The soundtrack is warm—soul, funk, old Romanian pop at talk-friendly volume—and the bar pours simple cocktails, local craft beers, and herbal teas until late. Board games slide across the coffee tables; conversations spark between artists, students, and curious travelers. There's no rush culture here: you settle in, sip slowly, and watch the room glow soft as evening deepens. Perfect for dates that start shy and end giggly, or for decompressing after a high-energy night elsewhere. It's a safe, inclusive crowd; staff are sweet and prices kind. Expect full tables on weekends and a wholesome, creative Timișoara vibe all week long.",
    city: 'Timișoara',
    region: 'Elisabetin',
    latitude: 45.743234,
    longitude: 21.224252,
    duration_min: 120,
    duration_max: 210,
    tags: ['category:social','energy:low','mood:chill','mood:social','mood:romantic','context:date','context:small-group','context:solo','time_of_day:evening','time_of_day:night','cost_band:$']
  },
  {
    slug: 'timisoara-viniloteca-wine-and-wax',
    name: 'Viniloteca: Wine & Wax Nights',
    category: 'nightlife',
    description: "A hybrid record shop and bar, Viniloteca smells like cork and cardboard sleeves. Wooden crates brim with jazz, post-punk, afrobeat and local releases; staff spin mellow sets while guests swirl Romanian Fetească and international pours. By 21:00, the room is a low murmur of clinking stems and needle crackle; conversations arc from album nerdery to weekend plans. Expect tasting flights, occasional listening parties, and pop-up DJ takeovers that lift the energy without drowning talk. Seating is close, lighting soft, and the clientele mixed—vinyl heads, designers, curious tourists, couples on their second date. If beer's your lane, a small but sharp craft list keeps hop fans happy. It's intimate, unpretentious, and very Timișoara—culture first, buzz second.",
    city: 'Timișoara',
    region: 'Central',
    latitude: 45.748030,
    longitude: 21.219760,
    duration_min: 120,
    duration_max: 210,
    tags: ['category:nightlife','energy:medium','mood:sophisticated','mood:chill','mood:social','context:date','context:small-group','context:friends','context:solo','time_of_day:evening','time_of_day:night','cost_band:$$']
  },
  {
    slug: 'oradea-moszkva-alt-scene',
    name: 'Moszkva Oradea Alt Scene',
    category: 'nightlife',
    description: "In an Art Nouveau courtyard just off the historic center, Moszkva is Oradea's HQ for indie bands, poetry slams, and stubbornly alternative DJ nights. Inside the rambling rooms you'll find murals, vintage chairs, and a small stage where everything from shoegaze to jazz trios squeezes in. The bar pours straightforward beers and long drinks; prices are friendly and the crowd is too—students, artists, and locals who'll pull you into a conversation about the next festival. Friday ramps up with post-punk, techno, or Balkan mashups that spill energy onto the patio in summer. It's the kind of place where you come for a gig and stay because the community feels like family. Dress however, bring cash for the door on concert nights, and expect your TBR list (and your heart) to grow.",
    city: 'Oradea',
    region: 'Centru',
    latitude: 47.055240,
    longitude: 21.930460,
    duration_min: 150,
    duration_max: 300,
    tags: ['category:nightlife','energy:medium','mood:underground','mood:rebellious','mood:social','context:friends','context:small-group','context:solo','time_of_day:evening','time_of_day:night','cost_band:$']
  },
  {
    slug: 'oradea-lokal-rooftop-sundowners',
    name: 'Lokal Oradea Rooftop Sundowners',
    category: 'nightlife',
    description: "High above Oradea's ornate facades, Lokal's roof deck catches the last gold of sunset and a breeze off the Crișul Repede. The bar team leans bright and spritzy—seasonal highballs, citrusy Collins, fresh-herb garnishes—while a DJ teases nu-disco and deep house at a conversational thump. Seating mixes banquettes and skyline-facing rail stools; heaters and blankets stretch the season well into autumn. Guests skew well-dressed but relaxed: locals on date night, travelers orbiting the nearby Black Eagle arcade, small groups celebrating. The vibe nudges from chill to lively come 22:00, and weekends can feel downright celebratory. Expect waitlists in midsummer; elevate the look (smart casual) and book if you can. Perfect as a glide path into a bigger night or as a soft-landing finale with lights twinkling below.",
    city: 'Oradea',
    region: 'Centru',
    latitude: 47.056243,
    longitude: 21.929569,
    duration_min: 120,
    duration_max: 210,
    tags: ['category:nightlife','energy:medium','mood:sophisticated','mood:romantic','mood:luxe','mood:social','context:date','context:small-group','context:friends','time_of_day:evening','time_of_day:night','cost_band:$$$']
  },
  {
    slug: 'sibiu-music-pub-rock-nights',
    name: 'Music Pub Sibiu Rock Nights',
    category: 'nightlife',
    description: "Down a vaulted brick cellar just off Piața Mare, Music Pub packs in guitar covers, rock karaoke, and weekend bands belting 80s anthems. It's candle jars on tables, scuffed floors, and a stage so close you can feel the kick drum. The mix is students, craft-beer dads, and travelers ducking the tourist trail for something rowdier. Drinks are simple and cheap; service is fast and friendly; the set lists jump genres as the night deepens. If you've got pipes, open mic welcomes you; if not, the crowd will sing along for you. Expect a warm, zero-attitude room where strangers clink glasses and exchange festival tips. This is Sibiu when it lets its hair down—unbuttoned, melodic, and joyfully loud.",
    city: 'Sibiu',
    region: 'Centru',
    latitude: 45.798820,
    longitude: 24.151600,
    duration_min: 150,
    duration_max: 300,
    tags: ['category:nightlife','energy:high','mood:party','mood:social','mood:energetic','context:friends','context:small-group','context:solo','time_of_day:evening','time_of_day:night','time_of_day:late-night','cost_band:$']
  },
  {
    slug: 'iasi-underground-the-pub-rock',
    name: 'Underground The Pub: Iași Rock Cellar',
    category: 'nightlife',
    description: "Beneath the city center, this low-ceilinged basement thrums with guitars and grunge nostalgia. Posters peel artfully from brick; the bar slings cold lagers and no-nonsense shots, and the stage hosts everything from local rockers to tribute nights that pack the room. It's sweaty, friendly, and gloriously unpretentious—students and nine-to-fivers elbow-to-elbow, yelling choruses and swapping set-list predictions. Sound is punchy for the size; lights are moody reds and blues; the dance floor dissolves into a mass of head-nods when the drummer drops the fill. A dependable after-exam blow-off or weekend catharsis. Wear sneakers, budget for a small cover, and expect to leave with a raspy voice and two new friends.",
    city: 'Iași',
    region: 'Centru',
    latitude: 47.163177,
    longitude: 27.581203,
    duration_min: 150,
    duration_max: 300,
    tags: ['category:nightlife','energy:high','mood:party','mood:underground','mood:rebellious','context:friends','context:small-group','context:solo','time_of_day:evening','time_of_day:night','time_of_day:late-night','cost_band:$']
  },
  {
    slug: 'targu-mures-jazz-and-blues-club',
    name: 'Jazz & Blues Club Târgu Mureș',
    category: 'nightlife',
    description: "Tables dressed in warm lamplight, brick walls close enough to bounce a trumpet's glow—this intimate club is Transylvania's living room for swing, bebop, and slow-burn blues. On band nights, the room hushes to a murmur between solos; during jam sessions, it sparks into call-and-response whoops. The cocktail list leans classic—Manhattans, highballs, smoky old fashioneds—and the staff know when to slide in and when to vanish. The crowd is mixed ages: music students tuned to every note, couples on anniversaries, and travelers who wandered in and stayed for two sets. Dress smart-casual, snag a table near the pillar for best sightlines, and let the drummer's brushes slow your breathing. After midnight, expect a looser second set where standards stretch and chatter rises with the bass.",
    city: 'Târgu Mureș',
    region: 'Centru',
    latitude: 46.542964,
    longitude: 24.557858,
    duration_min: 120,
    duration_max: 210,
    tags: ['category:nightlife','energy:medium','mood:sophisticated','mood:romantic','mood:chill','context:date','context:small-group','context:friends','time_of_day:evening','time_of_day:night','cost_band:$$']
  },
  {
    slug: 'mamaia-ego-beach-club-nights',
    name: 'EGO Mamaia Beach Club Nights',
    category: 'nightlife',
    description: "When the coast heats up, EGO is a midnight carnival—open-air terraces, lasers slicing the sea mist, and a crowd that arrives perfumed and camera-ready. The soundtrack is big-room house, Romanian chart crossovers, and summer guest DJs; bottle service glows under LED ice buckets while dancers toss confetti from the balcony. Expect a high-energy, dress-to-impress scene—Bucharest weekender crews, VIP tables, and holiday-mode travelers. Drinks run pricey, but service is swift; security is visible and the production is slick. Come late (after 23:30), book if you want a table, and bring light layers for the sea breeze. On peak weekends, sunrise departures are common and cab queues long—plan your exit. If you're chasing the Romanian Riviera's maximum wattage, this is your bullseye.",
    city: 'Constanța (Mamaia)',
    region: 'Mamaia',
    latitude: 44.233786,
    longitude: 28.625567,
    duration_min: 180,
    duration_max: 360,
    tags: ['category:nightlife','energy:high','mood:party','mood:luxe','mood:energetic','context:friends','context:large-group','context:small-group','time_of_day:night','time_of_day:late-night','cost_band:$$$']
  },
  {
    slug: 'vama-veche-expirat-beach-sessions',
    name: 'Expirat Vama Veche Beach Sessions',
    category: 'nightlife',
    description: "Vama's bohemian legend lives here: a wooden beach stage, salty air, and a barefoot dance floor where indie bands, alt rock, and electronic live sets roll straight into sunrise. Early evening is lazy—burgers, cold beer, and seagulls—then the PA roars and the deck becomes a small festival, complete with sand underfoot and a friendly, anything-goes crowd. You'll meet students on road trips, Bucharest creatives, and travelers who planned one night and stayed three. Expect creative lineups, fair prices, and a vibe that's inclusive and unpolished in all the right ways. Dress code? Swimsuit and hoodie. Bring cash, hydrate, and stash sandals—you'll be dancing on sand. On long weekends, expect packed nights and cathartic sunrise applause when the final track lands.",
    city: 'Vama Veche',
    region: 'Beachfront',
    latitude: 43.750000,
    longitude: 28.570000,
    duration_min: 180,
    duration_max: 360,
    tags: ['category:nightlife','energy:high','mood:party','mood:underground','mood:social','mood:rebellious','context:friends','context:small-group','context:solo','context:large-group','time_of_day:evening','time_of_day:night','time_of_day:late-night','cost_band:$']
  },
  {
    slug: 'brasov-tipografia-culture-bar',
    name: 'Tipografia Culture Bar',
    category: 'nightlife',
    description: "A creative hub steps from Council Square, Tipografia pours daytime specialty coffee that flips to aperitivi, craft lagers, and spritzes after dark. The space is all bookish charm—poster-lined walls, mismatched chairs, and readings or micro-gigs that warm the room—before the playlist nudges into indie, electronica, or chilled hip-hop. The crowd leans locals and in-the-know visitors escaping tourist traps; conversation is the headliner, but the small hours can get unexpectedly lively. Expect thoughtful bar staff, fair prices, and a cozy urban patio in season. Start here for a low-key pregame before climbing toward livelier bars on Republicii—or stay for the unhurried, intelligent hum Brasov does best at night.",
    city: 'Brașov',
    region: 'Centru',
    latitude: 45.642900,
    longitude: 25.590800,
    duration_min: 120,
    duration_max: 210,
    tags: ['category:nightlife','energy:medium','mood:chill','mood:social','mood:sophisticated','context:date','context:small-group','context:friends','context:solo','time_of_day:evening','time_of_day:night','cost_band:$$']
  },
  {
    slug: 'cluj-yolka-skybar-sundowners',
    name: 'Yolka Skybar Sundowners',
    category: 'nightlife',
    description: "Perched above Unirii Square's cathedral spires, Yolka is a leafy terrace with panoramic Cluj views and a cocktail list that loves bright acids and garden-fresh infusions. Early evening is golden hour with light downtempo; later, the energy lifts as crowd chatter stacks against a gentle house groove. Expect a stylish but friendly mix—locals, visiting creatives, couples taking in the skyline. Heaters, blankets, and greenhouse corners keep the season long. It's a polished service experience without stiffness, and the ideal bridge between dinner and a louder club. Dress smart-casual, book at weekends, and time your arrival for the moment the square's lights flick on below.",
    city: 'Cluj-Napoca',
    region: 'Centru',
    latitude: 46.769337,
    longitude: 23.589726,
    duration_min: 90,
    duration_max: 180,
    tags: ['category:nightlife','energy:medium','mood:romantic','mood:sophisticated','mood:luxe','mood:chill','context:date','context:small-group','context:friends','time_of_day:evening','time_of_day:night','cost_band:$$$']
  }
];

async function importRomanianNightlife() {
  console.log('🎸 Importing Romania Regional Nightlife: 14 activities...\n');
  
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
  console.log('\n🎉 ALL ROMANIA REGIONAL NIGHTLIFE IMPORTED!');
  console.log('📍 Cities: Cluj-Napoca, Timișoara, Oradea, Sibiu, Iași, Târgu Mureș, Mamaia, Vama Veche, Brașov');
}

importRomanianNightlife();
