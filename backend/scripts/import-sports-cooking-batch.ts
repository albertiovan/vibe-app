/**
 * Import Sports & Cooking Activities Batch
 * Total: 48 activities (12 swimming + 12 tennis + 8 badminton + 16 cooking)
 * 
 * RUN: npx tsx backend/scripts/import-sports-cooking-batch.ts
 */
import { Pool } from 'pg';
import dotenv from 'dotenv';
import { resolve } from 'path';
import { readFileSync } from 'fs';

dotenv.config({ path: resolve(__dirname, '../.env') });

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

// Load activity data from JSON file
const dataPath = resolve(__dirname, 'data/sports-cooking-data.json');
const activities = JSON.parse(readFileSync(dataPath, 'utf-8'));

// Description templates for each activity type
const descriptions: Record<string, string> = {
  // Swimming pools - high energy fitness
  'otopeni-olympic-swimming': "Just north of Bucharest, Otopeni's Olympic complex delivers serious lap swimming in a clean, well-maintained 50-meter basin. Eight lanes with electronic timing, bright overhead lighting, and a no-nonsense training atmosphere attract club swimmers, triathletes, and fitness enthusiasts. Expect regimented lane etiquette, cool water temps ideal for sustained effort, and a crowd that respects the pace. Changing facilities are functional, showers are hot, and the staff keeps things running smoothly. Peak hours (18:00–20:30) see full lanes; arrive slightly earlier or later for clearer water. Day passes available; perfect for structured interval work or long endurance sets.",
  
  'bucharest-dinamo-olympic': "Dinamo's legendary 50-meter Olympic pool sits in the heart of Bucharest's sports district, offering a professional training environment for serious swimmers. Eight crisp lanes, electronic timing boards, and attentive lifeguards maintain a focused atmosphere. The gallery above hums with club energy while the water stays cool and clear. Expect a mixed crowd of competitive swimmers, triathletes, and after-work lap enthusiasts—serious but welcoming. Fluorescent lighting keeps visibility high, and the old-school Bucharest sport culture means practical changing rooms and efficient service. Lane discipline is strong, making it ideal for interval training or long sets.",
  
  'brasov-mihai-mitrofan-olympic': "Brașov's premier Olympic pool combines alpine air with serious swimming infrastructure. The 50-meter basin hosts club training, masters sessions, and public lap swim with clear lane markings and professional timing systems. Water quality is excellent, lighting is bright, and the mountain city vibe brings a slightly more relaxed energy than Bucharest's competitive pools. Expect a mix of local athletes, students, and fitness swimmers maintaining steady pace. Facilities include modern changing rooms, hot showers, and a small spectator area.",
  
  'cluj-ubb-swimming': "Cluj's Babeș-Bolyai University swimming complex opens to the public for structured lap sessions in a modern, well-lit facility. The pool serves both student athletes and community members, creating a friendly yet focused training environment. Eight lanes accommodate various pace groups, with lifeguards managing flow during busy periods. Water temperature is set for performance, and the facility includes saunas and modern changing areas. The academic setting brings a studious energy—expect coaches timing sets, steady whistles, and swimmers who respect lane discipline.",
  
  'cluj-utcn-swimming': "The Technical University's swimming complex offers another excellent training option in Cluj, with a semi-Olympic pool and modern facilities. The atmosphere balances academic structure with community access—students, faculty, and locals share lanes during public hours. Expect clear water, good lighting, and lane ropes that stay taut. The facility includes changing rooms, showers, and a small gym area. Peak hours see organized training groups, while mid-day and late evening offer more relaxed swimming.",
  
  'oradea-ioan-alexandrescu-olympic': "Oradea's Olympic pool serves as the training hub for western Romania's swimming community. The 50-meter basin features eight lanes with electronic timing, professional coaching stations, and spectator seating that fills during competitions. Public sessions offer structured lap swimming with clear pace lanes—fast, medium, and recreational. Water quality is consistently high, and the facility's recent renovations bring modern changing rooms and improved ventilation.",
  
  'targu-mures-olympic': "Târgu Mureș maintains a proud swimming tradition at its Olympic pool, where local clubs train alongside public lap swimmers. The 50-meter facility offers professional-grade infrastructure: timing systems, lane ropes, and clear depth markings. The atmosphere is welcoming yet serious—expect swimmers who know their intervals and respect the pace. Facilities include adequate changing rooms, hot showers, and a small café area.",
  
  'ploiesti-complex-sportiv-city': "Ploiești's Complex Sportiv City brings modern sports infrastructure to the oil capital, featuring a well-maintained swimming pool alongside other athletic facilities. The pool serves both competitive training and recreational swimming, with designated lane times for serious lap work. Expect clean water, good lighting, and a crowd that ranges from club swimmers to fitness enthusiasts. The complex's comprehensive facilities include changing rooms, showers, and a gym area.",
  
  'ploiesti-bazinul-vega': "A Ploiești institution, Bazinul Vega offers straightforward access to quality lap swimming in a no-frills environment. The pool maintains steady lane turnover with clear pace designations, allowing swimmers to find their rhythm without congestion. Facilities are practical—functional changing rooms, hot showers, and attentive lifeguards who keep things moving. The crowd blends competitive swimmers, adult learners, and budget-minded fitness enthusiasts.",
  
  'sibiu-aria-aqua-park': "Sibiu's Aria complex offers indoor pool facilities that operate year-round, providing a reliable training option in Transylvania's cultural capital. While the complex is known for its summer aqua park, the indoor section maintains serious lap swimming lanes with good water quality and proper lane management. The atmosphere is more relaxed than pure Olympic training facilities, but dedicated swimmers find clear water and adequate space for structured workouts.",
  
  'iasi-world-class-mall-moldova': "Iași's World Class facility in Mall Moldova delivers premium swimming infrastructure with a semi-Olympic pool, modern filtration, and professional lane management. The club atmosphere adds saunas, steam rooms, and a full gym, making it easy to combine swimming with comprehensive training. Expect clean, warm water, bright lighting, and a crowd of members doing serious cardio work. Peak hours attract professionals squeezing in workouts before or after office hours.",
  
  'constanta-world-class-city-park': "Constanța's World Class brings premium fitness standards to the Black Sea coast, featuring a well-maintained swimming pool with professional lane setup. The facility caters to year-round training despite the coastal location, with climate control and modern filtration systems. Members enjoy access to saunas, steam rooms, and a comprehensive gym alongside the pool. The atmosphere balances serious training with resort-city energy.",
  
  // Tennis courts - high energy sports
  'bucharest-stejarii-tennis': "Hidden in the greenery north of Herăstrău, Stejarii delivers Bucharest's most refined tennis experience. Immaculate clay and hard courts sit within a luxury wellness complex, where members enjoy professional coaching, pristine court maintenance, and attentive service. The atmosphere is executive and polished—expect well-groomed courts, quality lighting for evening play, and a clubhouse that blends sport with lifestyle. Pro shop, locker rooms, and post-match spa access complete the package.",
  
  'cluj-winners-sports-tennis': "Cluj's Winners Sports Club offers comprehensive tennis facilities with both indoor and outdoor courts, professional coaching, and a community of regular players. The modern complex features well-maintained surfaces, good lighting, and a pro shop with equipment rental. Expect a friendly but competitive atmosphere—members range from recreational players to tournament participants. The club hosts regular social events, leagues, and coaching clinics.",
  
  'mamaia-tenis-club-idu': "Mamaia's premier tennis facility combines Black Sea breezes with professional-grade courts. Multiple outdoor surfaces host everything from casual rallies to competitive matches, while the coastal location adds a resort atmosphere. The club attracts both local players and summer visitors, creating a social, energetic vibe. Expect quality court maintenance, equipment rental, and coaching available by appointment.",
  
  'bucharest-pescariu-tennis': "Pescariu combines serious tennis with comprehensive wellness facilities in a modern Bucharest complex. Professional courts with excellent surfaces and lighting serve players of all levels, while the attached spa and fitness center make it easy to build a full training day. Expect quality coaching, regular tournaments, and a community of committed players. The atmosphere balances competitive play with lifestyle amenities.",
  
  'bucharest-north-tennis-herastrau': "Set beside Herăstrău Park, North Tennis offers quality courts in one of Bucharest's most pleasant locations. Multiple outdoor surfaces with professional maintenance serve a mix of recreational and competitive players. The parkside setting brings fresh air and green views, while the facility maintains serious tennis standards—good lighting, net quality, and surface care. Coaching is available, and the club hosts regular social events and leagues.",
  
  'bucharest-bdk-tennis-herastrau': "Another excellent option near Herăstrău Park, BDK Tennis maintains quality courts with a welcoming, community-focused atmosphere. The facility serves regular players with well-maintained surfaces, reliable booking systems, and a friendly staff who know the regulars. Expect a mix of skill levels, from beginners taking lessons to experienced players in competitive matches. The club organizes social events, round-robins, and coaching clinics.",
  
  'bucharest-centrul-national-tenis': "Romania's national tennis center opens to the public for court bookings, offering professional-grade facilities where national team players train. Multiple indoor and outdoor courts feature excellent surfaces, professional lighting, and tournament-standard maintenance. The atmosphere is serious and focused—expect quality play and well-organized operations. Coaching from experienced professionals is available, and the facility hosts regular tournaments and events.",
  
  'timisoara-tenis-mosnita': "Just outside Timișoara in Moșnița Nouă, this tennis complex offers quality courts in a quieter setting. Multiple outdoor surfaces with good maintenance serve both casual players and competitive members. The facility provides coaching, equipment rental, and organized leagues. The atmosphere is relaxed yet focused—expect friendly matches and regular players who appreciate the less urban setting.",
  
  'brasov-tenis-arena': "Brașov's Tenis Arena brings quality tennis infrastructure to the mountain city, with multiple courts serving both recreational and competitive players. The facility offers indoor and outdoor options, making year-round play possible despite the alpine climate. Expect well-maintained surfaces, professional coaching, and a community of regular players. The mountain setting adds fresh air and pleasant views.",
  
  'timisoara-tenis-club-as': "Timișoara's Tenis Club AS maintains quality courts in a convenient urban location. The facility serves a loyal community of players with well-kept surfaces, reliable booking systems, and a welcoming atmosphere. Expect a mix of recreational and competitive play, with coaching available for all levels. The club organizes regular social events, round-robins, and friendly tournaments.",
  
  'iasi-tenis-club-leo': "Iași's Tenis Club Leo offers quality tennis facilities in Moldova's cultural capital. Multiple courts with good maintenance serve a community of regular players and visitors. The facility provides coaching, equipment rental, and organized play opportunities. Expect a friendly, social atmosphere where players of various levels find matches. The club hosts leagues, tournaments, and social events throughout the season.",
  
  'iasi-itenis': "iTENIS brings contemporary tennis facilities to Iași with modern courts, professional coaching, and a tech-forward approach to bookings and member services. The facility features well-maintained surfaces, quality lighting for evening play, and a growing community of players. Expect organized leagues, coaching clinics, and social events that build community. The atmosphere balances competitive play with accessibility for recreational players.",
  
  // Badminton - high energy sports
  'brasov-weplay-badminton': "WePlay brings modern badminton facilities to Brașov with quality courts, equipment rental, and a welcoming atmosphere for all skill levels. The facility hosts drop-in sessions, organized leagues, and coaching clinics. Expect well-maintained courts with proper flooring, good lighting, and net tension. The crowd mixes recreational players with competitive enthusiasts, creating a social yet focused environment. Staff help organize matches between players of similar levels.",
  
  'cluj-badminton-club': "Cluj's dedicated badminton club offers professional-grade courts and a community of serious players. The facility hosts regular tournaments, training sessions, and social play. Expect quality equipment, proper court maintenance, and players who know the game. Coaching is available for all levels, and the club organizes leagues and events throughout the year. The atmosphere is competitive yet welcoming to newcomers.",
  
  'bucharest-acs-pro-badminton': "Bucharest's ACS Pro Badminton combines competitive play with structured coaching programs. The facility offers quality courts, equipment rental, and experienced coaches who work with all skill levels. Expect organized training sessions, drop-in play, and a community of players ranging from beginners to advanced competitors. The focus is on skill development alongside social play.",
  
  'bucharest-aerosquash-badminton': "AeroSquash's Băneasa location offers badminton courts alongside squash facilities, creating a vibrant racquet sports community. The facility features quality courts, equipment rental, and a social atmosphere. Expect well-maintained surfaces, good lighting, and a mix of players enjoying both competitive matches and casual rallies. The multi-sport environment adds variety and energy.",
  
  'timisoara-banu-sport-badminton': "Timișoara's Banu Sport offers accessible badminton facilities with a welcoming community atmosphere. The facility provides quality courts, equipment rental, and organized play sessions. Expect a mix of skill levels, friendly matches, and staff who help organize games between players. A solid option for regular badminton in western Romania with straightforward pricing.",
  
  'iasi-stomart-badminton': "Iași's STOMART facility offers badminton courts in a multi-purpose sports hall. The venue hosts regular badminton sessions with court rental and equipment available. Expect a practical, no-frills environment focused on play, with a community of regular players and welcoming atmosphere for newcomers. The sports hall setting provides adequate space and proper court setup.",
  
  'timisoara-csm-badminton': "CSM Timișoara's badminton section offers club-level facilities with organized training and competitive opportunities. The facility serves both recreational players and those interested in tournament play. Expect structured coaching, regular practice sessions, and a community of committed players. The club atmosphere provides motivation and progression opportunities.",
  
  'bucharest-sportul-studentesc-badminton': "Sportul Studențesc's badminton facilities offer accessible play in a historic sports club setting. The venue provides quality courts, equipment rental, and a friendly atmosphere. Expect a mix of students, recreational players, and club members. The facility maintains good standards while keeping pricing reasonable, making it a solid option for regular badminton in Bucharest.",
  
  // Cooking classes - medium energy culinary
  'bucharest-horeca-culinary-school': "Horeca Culinary School brings professional chef training to Bucharest with comprehensive cooking courses. Learn fundamental techniques, knife skills, and recipe execution in a fully-equipped teaching kitchen. Instructors are working chefs who balance demonstration with hands-on practice. Expect structured lessons, quality ingredients, and a focus on both technique and flavor. Classes range from beginner fundamentals to advanced culinary methods. You'll leave with practical skills and confidence to recreate dishes at home.",
  
  'bucharest-cooking-studio': "Cooking Studio offers hands-on cooking classes in a warm, social atmosphere. Small groups work through recipes together, with instructors providing guidance and tips throughout. Expect interactive sessions where you prep, cook, and plate complete meals, then sit down to enjoy your creations. The focus is on accessible techniques and crowd-pleasing dishes. Perfect for date nights, friend groups, or solo learners seeking a fun, practical cooking experience.",
  
  'bucharest-ilbah-amateur-cooking': "Atelierele ILBAH's amateur cooking course teaches home cooks essential techniques in a supportive environment. Over multiple sessions, you'll master knife skills, cooking methods, and recipe building. Instructors demonstrate each technique before you practice, with close attention to detail and safety. Expect a structured curriculum that builds confidence, from basic preparations to complete multi-course meals. You'll leave with a solid foundation for everyday cooking.",
  
  'bucharest-dallesgo-cooking-beginners': "DallesGO's beginner cooking course breaks down intimidating techniques into simple, achievable steps. Small classes ensure personalized attention as you learn to prep ingredients, manage heat, and build flavors. Instructors emphasize practical skills you'll use regularly—sautéing, roasting, sauce-making. Expect a relaxed pace, clear demonstrations, and plenty of hands-on practice. Perfect for building confidence in the kitchen from scratch.",
  
  'bucharest-societe-gourmet': "Société Gourmet elevates home cooking with refined techniques and sophisticated flavor combinations. Classes focus on French-inspired methods—emulsions, reductions, proper seasoning—taught in a polished teaching kitchen. Expect smaller class sizes, premium ingredients, and instructors who explain the 'why' behind each technique. The atmosphere is focused yet approachable, perfect for cooks ready to level up their skills.",
  
  'bucharest-culinaryon': "CulinaryOn România offers modern cooking classes that blend international techniques with local ingredients. Instructors guide you through contemporary recipes, emphasizing plating, texture, and flavor balance. Expect hands-on sessions with quality equipment, clear demonstrations, and a social atmosphere. Classes cover diverse cuisines and dietary approaches, making it easy to explore new cooking styles.",
  
  'bucharest-cluj-artisan-cooking': "Artisan Cooking Classes focus on traditional techniques and quality ingredients. Learn to make pasta from scratch, ferment vegetables, or bake artisan bread in small, focused workshops. Instructors emphasize craftsmanship and patience, teaching methods that develop flavor through time and technique. Expect a slower pace, tactile learning, and the satisfaction of creating something truly handmade.",
  
  'cluj-grill-expert-academy': "Grill Expert Academy teaches outdoor cooking mastery—from fire management to smoke control and perfect searing. Classes cover charcoal and gas grilling, smoking techniques, and temperature control. Instructors demonstrate professional methods, then you practice on quality equipment. Expect hands-on sessions, meat selection guidance, and tips for consistent results. Perfect for elevating your backyard grilling game.",
  
  'transylvania-mytransylvania-eat-local': "My Transylvania's culinary workshops connect you with traditional Romanian cooking in authentic settings. Learn to make mămăligă, sarmale, or cozonac from local cooks who've perfected these recipes over generations. Expect storytelling alongside cooking, with insights into regional ingredients and family traditions. The pace is relaxed, the atmosphere warm, and you'll leave with recipes and cultural context.",
  
  'bucharest-kuxa-studio': "KUXA Studio offers creative culinary workshops in a modern, design-forward space. Classes blend cooking with food styling, plating, and presentation. Instructors encourage experimentation and personal expression while teaching solid techniques. Expect a social, collaborative atmosphere where aesthetics meet flavor. Perfect for cooks interested in the visual and creative aspects of food.",
  
  'turda-casa-ratiu-cookery': "Casa Ratiu's cookery lessons teach traditional Transylvanian recipes in a historic setting. Learn regional specialties using local ingredients and time-tested methods. Instructors share family recipes and cultural context alongside cooking techniques. Expect a warm, intimate atmosphere, hands-on preparation, and the chance to taste authentic regional cuisine. A unique opportunity to connect with culinary heritage.",
  
  'bucharest-disciples-escoffier': "Disciples Escoffier brings classical French technique to Bucharest with rigorous, detail-oriented instruction. Classes emphasize precision, proper knife work, and the foundations of French cuisine. Instructors are trained in classical methods and expect focus and practice. The atmosphere is serious and skill-building—perfect for cooks committed to mastering fundamental techniques and culinary discipline.",
  
  'bucharest-icep-chef-courses': "ICEP Hotel School's chef courses offer professional-level culinary training for serious students. The curriculum covers knife skills, cooking methods, kitchen organization, and menu development. Instructors are working chefs who teach industry standards and professional practices. Expect intensive, hands-on sessions with high expectations. Ideal for those considering culinary careers or seeking comprehensive skill development.",
  
  'bucharest-icep-chef-bucharest': "ICEP București's chef course provides structured culinary education in a professional teaching kitchen. Over multiple sessions, you'll master fundamental techniques, ingredient knowledge, and recipe execution. Instructors emphasize consistency, efficiency, and professional standards. Expect demanding but rewarding training that builds a solid foundation for advanced cooking or career development.",
  
  'bucharest-horeca-masterclass': "Horeca School's masterclasses bring specialized culinary topics to experienced home cooks and professionals. Each session focuses on a specific technique or cuisine—pastry, butchery, molecular gastronomy. Expert instructors demonstrate advanced methods, then guide hands-on practice. Expect small groups, premium ingredients, and deep dives into culinary craftsmanship. Perfect for continuing education and skill refinement.",
  
  'sibiu-simpa-pastry': "SIMPA Sibiu's pastry courses teach baking fundamentals and advanced techniques in a dedicated pastry kitchen. Learn to make laminated doughs, work with chocolate, and create elegant desserts. Instructors emphasize precision, timing, and the science of baking. Expect structured lessons, quality ingredients, and the satisfaction of mastering delicate pastry work. Classes suit both beginners and experienced bakers seeking refinement."
};

async function importActivities() {
  console.log('🏊 🎾 🏸 👨‍🍳 Importing 48 Sports & Cooking Activities...\n');
  
  let successCount = 0;
  let errorCount = 0;
  
  for (const activity of activities) {
    try {
      const description = descriptions[activity.slug] || `Experience ${activity.name} in ${activity.city}.`;
      
      const activityResult = await pool.query(`
        INSERT INTO activities (
          name, category, description, city, region, 
          latitude, longitude, duration_min, duration_max, 
          tags, indoor_outdoor, energy_level, seasonality
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
        RETURNING id
      `, [
        activity.name,
        activity.category,
        description,
        activity.city,
        activity.region,
        activity.lat,
        activity.lng,
        activity.duration[0],
        activity.duration[1],
        activity.tags,
        activity.indoor_outdoor,
        activity.energy,
        activity.seasonality
      ]);
      
      const activityId = activityResult.rows[0].id;
      
      // Insert venue with website
      await pool.query(`
        INSERT INTO venues (
          activity_id, name, website, city, region, 
          latitude, longitude, seasonality, tags
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      `, [
        activityId,
        activity.name,
        activity.website,
        activity.city,
        activity.region,
        activity.lat,
        activity.lng,
        activity.seasonality,
        activity.tags
      ]);
      
      successCount++;
      console.log(`✅ ${activity.id}: ${activity.name}`);
    } catch (error: any) {
      errorCount++;
      console.error(`❌ ${activity.id}: ${activity.name} - ${error.message}`);
    }
  }
  
  await pool.end();
  console.log(`\n🎉 Import Complete!`);
  console.log(`✅ Success: ${successCount}`);
  console.log(`❌ Errors: ${errorCount}`);
  console.log(`📊 Total: ${activities.length} activities`);
}

importActivities().catch(console.error);
