/**
 * Romania Activity Ontology
 * 
 * Comprehensive catalog of activities available in Romania, organized by category.
 * This is the single source of truth for all activities the system can recommend.
 * 
 * Each activity includes:
 * - Specific Romanian regions where it's available
 * - Seasonal constraints
 * - Energy/difficulty levels
 * - Duration estimates
 */

import { ActivityIntent, ActivityCategory } from './types.js';

/**
 * Adventure Activities - High-energy outdoor experiences
 */
const ADVENTURE_ACTIVITIES: ActivityIntent[] = [
  {
    id: 'mtb_downhill_brasov',
    label: 'Downhill Mountain Biking in Poiana Brașov',
    category: 'adventure',
    subtypes: ['mountain_biking', 'downhill', 'bike_park'],
    regions: ['Brașov', 'Poiana Brașov'],
    durationHintHrs: [2, 6],
    energy: 'high',
    indoorOutdoor: 'outdoor',
    seasonality: 'summer',
    difficulty: 4,
    requirements: ['mountain_bike', 'protective_gear']
  },
  {
    id: 'via_ferrata_omu',
    label: 'Via Ferrata on Omu Peak',
    category: 'adventure',
    subtypes: ['via_ferrata', 'climbing', 'mountain_adventure'],
    regions: ['Bucegi', 'Sinaia'],
    durationHintHrs: [4, 8],
    energy: 'high',
    indoorOutdoor: 'outdoor',
    seasonality: 'summer',
    difficulty: 5,
    requirements: ['climbing_gear', 'mountain_experience']
  },
  {
    id: 'rock_climbing_cheile_turzii',
    label: 'Rock Climbing in Cheile Turzii',
    category: 'adventure',
    subtypes: ['rock_climbing', 'sport_climbing'],
    regions: ['Cluj', 'Turda'],
    durationHintHrs: [3, 7],
    energy: 'high',
    indoorOutdoor: 'outdoor',
    seasonality: 'all',
    difficulty: 4
  },
  {
    id: 'paragliding_brasov',
    label: 'Paragliding from Postăvaru',
    category: 'adventure',
    subtypes: ['paragliding', 'aerial_sports'],
    regions: ['Brașov'],
    durationHintHrs: [2, 4],
    energy: 'medium',
    indoorOutdoor: 'outdoor',
    seasonality: 'summer',
    difficulty: 3
  },
  {
    id: 'whitewater_rafting_maramures',
    label: 'Whitewater Rafting on Tisa River',
    category: 'adventure',
    subtypes: ['rafting', 'whitewater', 'water_sports'],
    regions: ['Maramureș', 'Sighetu Marmației'],
    durationHintHrs: [3, 6],
    energy: 'high',
    indoorOutdoor: 'outdoor',
    seasonality: 'summer',
    difficulty: 3
  },
  {
    id: 'canyoning_apuseni',
    label: 'Canyoning in Apuseni Mountains',
    category: 'adventure',
    subtypes: ['canyoning', 'water_adventure'],
    regions: ['Alba', 'Apuseni'],
    durationHintHrs: [4, 7],
    energy: 'high',
    indoorOutdoor: 'outdoor',
    seasonality: 'summer',
    difficulty: 4
  },
  {
    id: 'ski_alpine_poiana_brasov',
    label: 'Alpine Skiing in Poiana Brașov',
    category: 'adventure',
    subtypes: ['ski_alpine', 'winter_sports'],
    regions: ['Brașov', 'Poiana Brașov'],
    durationHintHrs: [3, 8],
    energy: 'high',
    indoorOutdoor: 'outdoor',
    seasonality: 'winter',
    difficulty: 3
  }
];

/**
 * Nature Activities - Outdoor experiences focused on natural beauty
 */
const NATURE_ACTIVITIES: ActivityIntent[] = [
  {
    id: 'hiking_omu_peak',
    label: 'Hiking to Omu Peak',
    category: 'nature',
    subtypes: ['hiking', 'peak_bagging', 'mountain_hiking'],
    regions: ['Bucegi', 'Sinaia', 'Bușteni'],
    durationHintHrs: [6, 10],
    energy: 'high',
    indoorOutdoor: 'outdoor',
    seasonality: 'summer',
    difficulty: 4
  },
  {
    id: 'piatra_craiului_national_park',
    label: 'Explore Piatra Craiului National Park',
    category: 'nature',
    subtypes: ['national_park', 'wildlife_watching', 'nature_photography'],
    regions: ['Brașov', 'Argeș'],
    durationHintHrs: [4, 8],
    energy: 'medium',
    indoorOutdoor: 'outdoor',
    seasonality: 'all',
    difficulty: 2
  },
  {
    id: 'danube_delta_birdwatching',
    label: 'Birdwatching in Danube Delta',
    category: 'nature',
    subtypes: ['birdwatching', 'wildlife', 'boat_tour'],
    regions: ['Tulcea', 'Danube Delta'],
    durationHintHrs: [4, 8],
    energy: 'chill',
    indoorOutdoor: 'outdoor',
    seasonality: 'summer',
    difficulty: 1
  },
  {
    id: 'scarisoara_ice_cave',
    label: 'Visit Scărișoara Ice Cave',
    category: 'nature',
    subtypes: ['cave_exploration', 'underground', 'geological'],
    regions: ['Alba', 'Apuseni'],
    durationHintHrs: [2, 4],
    energy: 'medium',
    indoorOutdoor: 'indoor',
    seasonality: 'all',
    difficulty: 2
  },
  {
    id: 'bigar_waterfall',
    label: 'Visit Bigăr Waterfall',
    category: 'nature',
    subtypes: ['waterfall', 'nature_photography', 'short_hike'],
    regions: ['Caraș-Severin'],
    durationHintHrs: [1, 3],
    energy: 'chill',
    indoorOutdoor: 'outdoor',
    seasonality: 'all',
    difficulty: 1
  }
];

/**
 * Water Activities - Water-based recreation and sports
 */
const WATER_ACTIVITIES: ActivityIntent[] = [
  {
    id: 'kayaking_danube_delta',
    label: 'Kayaking in Danube Delta',
    category: 'water',
    subtypes: ['kayaking', 'flatwater', 'nature_exploration'],
    regions: ['Tulcea', 'Danube Delta'],
    durationHintHrs: [3, 7],
    energy: 'medium',
    indoorOutdoor: 'outdoor',
    seasonality: 'summer',
    difficulty: 2
  },
  {
    id: 'sup_herastrau',
    label: 'Stand-Up Paddleboarding on Herăstrău Lake',
    category: 'water',
    subtypes: ['sup', 'paddleboarding', 'urban_water'],
    regions: ['București'],
    durationHintHrs: [1, 3],
    energy: 'medium',
    indoorOutdoor: 'outdoor',
    seasonality: 'summer',
    difficulty: 1
  },
  {
    id: 'thermal_baths_baile_felix',
    label: 'Thermal Baths in Băile Felix',
    category: 'water',
    subtypes: ['thermal_baths', 'spa', 'wellness'],
    regions: ['Bihor', 'Oradea'],
    durationHintHrs: [2, 6],
    energy: 'chill',
    indoorOutdoor: 'indoor',
    seasonality: 'all',
    difficulty: 1
  },
  {
    id: 'boat_tour_iron_gates',
    label: 'Boat Tour through Iron Gates',
    category: 'water',
    subtypes: ['boat_tour', 'sightseeing', 'danube'],
    regions: ['Mehedinți', 'Caraș-Severin'],
    durationHintHrs: [3, 6],
    energy: 'chill',
    indoorOutdoor: 'outdoor',
    seasonality: 'summer',
    difficulty: 1
  }
];

/**
 * Culture Activities - Historical, artistic, and cultural experiences
 */
const CULTURE_ACTIVITIES: ActivityIntent[] = [
  {
    id: 'bran_castle_tour',
    label: 'Explore Bran Castle (Dracula\'s Castle)',
    category: 'culture',
    subtypes: ['castle_visit', 'historical_site', 'dracula_tourism'],
    regions: ['Brașov', 'Bran'],
    durationHintHrs: [2, 4],
    energy: 'chill',
    indoorOutdoor: 'indoor',
    seasonality: 'all',
    difficulty: 1
  },
  {
    id: 'peles_castle_sinaia',
    label: 'Visit Peleș Castle in Sinaia',
    category: 'culture',
    subtypes: ['castle_visit', 'royal_history', 'architecture'],
    regions: ['Prahova', 'Sinaia'],
    durationHintHrs: [2, 4],
    energy: 'chill',
    indoorOutdoor: 'indoor',
    seasonality: 'all',
    difficulty: 1
  },
  {
    id: 'fortified_churches_transylvania',
    label: 'Tour Fortified Churches of Transylvania',
    category: 'culture',
    subtypes: ['fortified_churches', 'unesco_heritage', 'medieval'],
    regions: ['Sibiu', 'Brașov', 'Mureș'],
    durationHintHrs: [4, 8],
    energy: 'medium',
    indoorOutdoor: 'indoor',
    seasonality: 'all',
    difficulty: 1
  },
  {
    id: 'bucharest_street_art_tour',
    label: 'Street Art Tour in Bucharest',
    category: 'culture',
    subtypes: ['street_art', 'urban_exploration', 'contemporary_art'],
    regions: ['București'],
    durationHintHrs: [2, 4],
    energy: 'medium',
    indoorOutdoor: 'outdoor',
    seasonality: 'all',
    difficulty: 1
  },
  {
    id: 'sighisoara_medieval_festival',
    label: 'Medieval Festival in Sighișoara',
    category: 'culture',
    subtypes: ['medieval_festival', 'historical_reenactment', 'unesco_site'],
    regions: ['Mureș', 'Sighișoara'],
    durationHintHrs: [4, 8],
    energy: 'medium',
    indoorOutdoor: 'outdoor',
    seasonality: 'summer',
    difficulty: 1
  }
];

/**
 * Wellness Activities - Health, relaxation, and rejuvenation
 */
const WELLNESS_ACTIVITIES: ActivityIntent[] = [
  {
    id: 'spa_retreat_sovata',
    label: 'Spa Retreat in Sovata',
    category: 'wellness',
    subtypes: ['spa', 'salt_lake_therapy', 'wellness_retreat'],
    regions: ['Mureș', 'Sovata'],
    durationHintHrs: [4, 8],
    energy: 'chill',
    indoorOutdoor: 'indoor',
    seasonality: 'all',
    difficulty: 1
  },
  {
    id: 'yoga_retreat_maramures',
    label: 'Yoga Retreat in Maramureș',
    category: 'wellness',
    subtypes: ['yoga', 'meditation', 'mountain_retreat'],
    regions: ['Maramureș'],
    durationHintHrs: [6, 24],
    energy: 'chill',
    indoorOutdoor: 'either',
    seasonality: 'summer',
    difficulty: 1
  },
  {
    id: 'thermal_spa_herculane',
    label: 'Thermal Spa in Băile Herculane',
    category: 'wellness',
    subtypes: ['thermal_spa', 'balneotherapy', 'roman_baths'],
    regions: ['Caraș-Severin'],
    durationHintHrs: [3, 8],
    energy: 'chill',
    indoorOutdoor: 'indoor',
    seasonality: 'all',
    difficulty: 1
  }
];

/**
 * Nightlife Activities - Evening entertainment and social experiences
 */
const NIGHTLIFE_ACTIVITIES: ActivityIntent[] = [
  {
    id: 'live_music_bucharest',
    label: 'Live Music in Bucharest Old Town',
    category: 'nightlife',
    subtypes: ['live_music', 'jazz_club', 'old_town'],
    regions: ['București'],
    durationHintHrs: [2, 5],
    energy: 'medium',
    indoorOutdoor: 'indoor',
    seasonality: 'all',
    difficulty: 1
  },
  {
    id: 'club_night_cluj',
    label: 'Club Night in Cluj-Napoca',
    category: 'nightlife',
    subtypes: ['nightclub', 'electronic_music', 'student_city'],
    regions: ['Cluj-Napoca'],
    durationHintHrs: [3, 8],
    energy: 'high',
    indoorOutdoor: 'indoor',
    seasonality: 'all',
    difficulty: 1
  },
  {
    id: 'standup_comedy_timisoara',
    label: 'Stand-up Comedy in Timișoara',
    category: 'nightlife',
    subtypes: ['standup_comedy', 'entertainment', 'cultural_capital'],
    regions: ['Timișoara'],
    durationHintHrs: [2, 3],
    energy: 'chill',
    indoorOutdoor: 'indoor',
    seasonality: 'all',
    difficulty: 1
  }
];

/**
 * Culinary Activities - Food and wine experiences (experience-tier only)
 */
const CULINARY_ACTIVITIES: ActivityIntent[] = [
  {
    id: 'wine_tasting_dealu_mare',
    label: 'Wine Tasting in Dealu Mare',
    category: 'culinary',
    subtypes: ['wine_tasting', 'vineyard_tour', 'romanian_wine'],
    regions: ['Prahova', 'Buzău'],
    durationHintHrs: [3, 6],
    energy: 'chill',
    indoorOutdoor: 'either',
    seasonality: 'all',
    difficulty: 1
  },
  {
    id: 'cooking_class_traditional',
    label: 'Traditional Romanian Cooking Class',
    category: 'culinary',
    subtypes: ['cooking_class', 'traditional_cuisine', 'cultural_experience'],
    regions: ['București', 'Brașov', 'Cluj-Napoca'],
    durationHintHrs: [3, 5],
    energy: 'medium',
    indoorOutdoor: 'indoor',
    seasonality: 'all',
    difficulty: 2
  },
  {
    id: 'michelin_dining_bucharest',
    label: 'Michelin-starred Dining in Bucharest',
    category: 'culinary',
    subtypes: ['fine_dining', 'michelin_star', 'tasting_menu'],
    regions: ['București'],
    durationHintHrs: [2, 4],
    energy: 'chill',
    indoorOutdoor: 'indoor',
    seasonality: 'all',
    difficulty: 1
  }
];

/**
 * Creative Activities - Artistic and maker experiences
 */
const CREATIVE_ACTIVITIES: ActivityIntent[] = [
  {
    id: 'photography_walk_brasov',
    label: 'Photography Walk in Brașov',
    category: 'creative',
    subtypes: ['photography', 'urban_exploration', 'medieval_architecture'],
    regions: ['Brașov'],
    durationHintHrs: [2, 4],
    energy: 'medium',
    indoorOutdoor: 'outdoor',
    seasonality: 'all',
    difficulty: 1
  },
  {
    id: 'ceramics_workshop_horezu',
    label: 'Ceramics Workshop in Horezu',
    category: 'creative',
    subtypes: ['ceramics', 'traditional_crafts', 'unesco_heritage'],
    regions: ['Vâlcea', 'Horezu'],
    durationHintHrs: [3, 6],
    energy: 'medium',
    indoorOutdoor: 'indoor',
    seasonality: 'all',
    difficulty: 2
  },
  {
    id: 'maker_space_bucharest',
    label: 'Maker Space Workshop in Bucharest',
    category: 'creative',
    subtypes: ['maker_space', '3d_printing', 'woodworking'],
    regions: ['București'],
    durationHintHrs: [2, 6],
    energy: 'medium',
    indoorOutdoor: 'indoor',
    seasonality: 'all',
    difficulty: 2
  }
];

/**
 * Sports Activities - Recreational and competitive sports
 */
const SPORTS_ACTIVITIES: ActivityIntent[] = [
  {
    id: 'climbing_gym_bucharest',
    label: 'Indoor Climbing in Bucharest',
    category: 'sports',
    subtypes: ['indoor_climbing', 'bouldering', 'sport_climbing'],
    regions: ['București'],
    durationHintHrs: [1, 3],
    energy: 'high',
    indoorOutdoor: 'indoor',
    seasonality: 'all',
    difficulty: 2
  },
  {
    id: 'padel_cluj',
    label: 'Padel Tennis in Cluj-Napoca',
    category: 'sports',
    subtypes: ['padel', 'racquet_sports', 'social_sport'],
    regions: ['Cluj-Napoca'],
    durationHintHrs: [1, 2],
    energy: 'high',
    indoorOutdoor: 'outdoor',
    seasonality: 'all',
    difficulty: 2
  },
  {
    id: 'skatepark_timisoara',
    label: 'Skateboarding in Timișoara',
    category: 'sports',
    subtypes: ['skateboarding', 'skatepark', 'urban_sports'],
    regions: ['Timișoara'],
    durationHintHrs: [1, 4],
    energy: 'high',
    indoorOutdoor: 'outdoor',
    seasonality: 'all',
    difficulty: 3
  }
];

/**
 * Learning Activities - Educational and volunteer experiences
 */
const LEARNING_ACTIVITIES: ActivityIntent[] = [
  {
    id: 'language_exchange_bucharest',
    label: 'Language Exchange in Bucharest',
    category: 'learning',
    subtypes: ['language_exchange', 'social_learning', 'cultural_exchange'],
    regions: ['București'],
    durationHintHrs: [2, 3],
    energy: 'medium',
    indoorOutdoor: 'indoor',
    seasonality: 'all',
    difficulty: 1
  },
  {
    id: 'community_cleanup_brasov',
    label: 'Community Cleanup in Brașov',
    category: 'learning',
    subtypes: ['volunteer', 'environmental', 'community_service'],
    regions: ['Brașov'],
    durationHintHrs: [2, 4],
    energy: 'medium',
    indoorOutdoor: 'outdoor',
    seasonality: 'all',
    difficulty: 1
  },
  {
    id: 'history_workshop_alba_iulia',
    label: 'History Workshop in Alba Iulia',
    category: 'learning',
    subtypes: ['history', 'educational_tour', 'fortress'],
    regions: ['Alba', 'Alba Iulia'],
    durationHintHrs: [2, 4],
    energy: 'chill',
    indoorOutdoor: 'either',
    seasonality: 'all',
    difficulty: 1
  }
];

/**
 * Complete Romania Activity Ontology
 * Organized by category for easy access and filtering
 */
export const ROMANIA_ACTIVITY_ONTOLOGY: Record<ActivityCategory, ActivityIntent[]> = {
  adventure: ADVENTURE_ACTIVITIES,
  nature: NATURE_ACTIVITIES,
  water: WATER_ACTIVITIES,
  culture: CULTURE_ACTIVITIES,
  wellness: WELLNESS_ACTIVITIES,
  nightlife: NIGHTLIFE_ACTIVITIES,
  culinary: CULINARY_ACTIVITIES,
  creative: CREATIVE_ACTIVITIES,
  sports: SPORTS_ACTIVITIES,
  learning: LEARNING_ACTIVITIES
};

/**
 * Flattened list of all activities for easy searching
 */
export const ALL_ROMANIA_ACTIVITIES: ActivityIntent[] = Object.values(ROMANIA_ACTIVITY_ONTOLOGY).flat();

/**
 * Activity lookup by ID
 */
export const ACTIVITY_BY_ID: Record<string, ActivityIntent> = ALL_ROMANIA_ACTIVITIES.reduce(
  (acc, activity) => ({ ...acc, [activity.id]: activity }),
  {}
);

/**
 * Activities grouped by region
 */
export const ACTIVITIES_BY_REGION: Record<string, ActivityIntent[]> = ALL_ROMANIA_ACTIVITIES.reduce(
  (acc, activity) => {
    activity.regions.forEach(region => {
      if (!acc[region]) acc[region] = [];
      acc[region].push(activity);
    });
    return acc;
  },
  {} as Record<string, ActivityIntent[]>
);

/**
 * All unique subtypes across all activities
 */
export const ALL_SUBTYPES: string[] = [...new Set(ALL_ROMANIA_ACTIVITIES.flatMap(a => a.subtypes))];

/**
 * All unique regions across all activities
 */
export const ALL_REGIONS: string[] = [...new Set(ALL_ROMANIA_ACTIVITIES.flatMap(a => a.regions))];
