/**
 * Google Places API Mapping Tables
 * 
 * Maps activity subtypes to Google Places API search parameters:
 * - place_type filters
 * - keyword searches
 * - text search queries
 * 
 * This is the single source of truth for how activities map to Google Places searches.
 */

export interface GooglePlacesMapping {
  /** Google Places API types to filter by */
  types?: string[];
  
  /** Keywords to include in search */
  keywords?: string[];
  
  /** Text search query templates (use {region} placeholder) */
  textQueries?: string[];
  
  /** Additional search parameters */
  searchParams?: {
    radius?: number;
    minRating?: number;
    priceLevel?: number[];
    openNow?: boolean;
  };
}

/**
 * Activity subtype to Google Places mapping
 * Key: activity subtype from romania-ontology.ts
 * Value: Google Places search configuration
 */
export const GOOGLE_PLACES_MAPPING: Record<string, GooglePlacesMapping> = {
  // Adventure Activities
  mountain_biking: {
    types: ['tourist_attraction', 'park'],
    keywords: ['mountain biking', 'bike park', 'MTB', 'cycling trails'],
    textQueries: ['mountain bike trails {region}', 'bike park {region}', 'MTB {region}'],
    searchParams: { radius: 25000 }
  },
  
  downhill: {
    types: ['tourist_attraction', 'amusement_park'],
    keywords: ['downhill', 'bike park', 'mountain bike', 'lift access'],
    textQueries: ['downhill mountain biking {region}', 'bike park lift {region}'],
    searchParams: { radius: 30000 }
  },
  
  via_ferrata: {
    types: ['tourist_attraction', 'natural_feature'],
    keywords: ['via ferrata', 'climbing route', 'mountain climbing'],
    textQueries: ['via ferrata {region}', 'climbing route {region}'],
    searchParams: { radius: 50000 }
  },
  
  rock_climbing: {
    types: ['tourist_attraction', 'natural_feature', 'gym'],
    keywords: ['rock climbing', 'climbing wall', 'climbing area', 'crag'],
    textQueries: ['rock climbing {region}', 'climbing area {region}', 'climbing gym {region}'],
    searchParams: { radius: 25000 }
  },
  
  paragliding: {
    types: ['tourist_attraction', 'establishment'],
    keywords: ['paragliding', 'paraglider', 'flying', 'takeoff'],
    textQueries: ['paragliding {region}', 'paraglider takeoff {region}'],
    searchParams: { radius: 30000 }
  },
  
  rafting: {
    types: ['tourist_attraction', 'travel_agency'],
    keywords: ['rafting', 'whitewater', 'river rafting', 'water sports'],
    textQueries: ['rafting {region}', 'whitewater rafting {region}'],
    searchParams: { radius: 50000 }
  },
  
  canyoning: {
    types: ['tourist_attraction', 'natural_feature'],
    keywords: ['canyoning', 'canyon', 'gorge', 'adventure'],
    textQueries: ['canyoning {region}', 'canyon adventure {region}'],
    searchParams: { radius: 50000 }
  },
  
  ski_alpine: {
    types: ['ski_resort', 'tourist_attraction'],
    keywords: ['ski resort', 'skiing', 'alpine skiing', 'ski lift'],
    textQueries: ['ski resort {region}', 'alpine skiing {region}'],
    searchParams: { radius: 50000 }
  },
  
  // Nature Activities
  hiking: {
    types: ['park', 'natural_feature', 'tourist_attraction'],
    keywords: ['hiking', 'trail', 'mountain trail', 'nature trail'],
    textQueries: ['hiking trails {region}', 'mountain hiking {region}', 'nature trails {region}'],
    searchParams: { radius: 30000 }
  },
  
  peak_bagging: {
    types: ['natural_feature', 'tourist_attraction'],
    keywords: ['peak', 'summit', 'mountain peak', 'hiking'],
    textQueries: ['mountain peak {region}', 'summit {region}', 'peak hiking {region}'],
    searchParams: { radius: 50000 }
  },
  
  national_park: {
    types: ['park', 'tourist_attraction'],
    keywords: ['national park', 'nature reserve', 'protected area'],
    textQueries: ['national park {region}', 'nature park {region}'],
    searchParams: { radius: 100000 }
  },
  
  wildlife_watching: {
    types: ['zoo', 'park', 'tourist_attraction'],
    keywords: ['wildlife', 'animals', 'nature watching', 'safari'],
    textQueries: ['wildlife watching {region}', 'nature reserve {region}'],
    searchParams: { radius: 50000 }
  },
  
  cave_exploration: {
    types: ['tourist_attraction', 'natural_feature'],
    keywords: ['cave', 'grotto', 'underground', 'spelunking'],
    textQueries: ['cave {region}', 'underground cave {region}'],
    searchParams: { radius: 100000 }
  },
  
  waterfall: {
    types: ['natural_feature', 'tourist_attraction'],
    keywords: ['waterfall', 'cascade', 'falls'],
    textQueries: ['waterfall {region}', 'cascade {region}'],
    searchParams: { radius: 50000 }
  },
  
  // Water Activities
  kayaking: {
    types: ['tourist_attraction', 'establishment'],
    keywords: ['kayaking', 'kayak rental', 'paddling', 'water sports'],
    textQueries: ['kayaking {region}', 'kayak rental {region}'],
    searchParams: { radius: 50000 }
  },
  
  sup: {
    types: ['establishment', 'tourist_attraction'],
    keywords: ['SUP', 'stand up paddle', 'paddleboard', 'water sports'],
    textQueries: ['SUP {region}', 'paddleboard {region}', 'stand up paddle {region}'],
    searchParams: { radius: 25000 }
  },
  
  thermal_baths: {
    types: ['spa', 'health', 'tourist_attraction'],
    keywords: ['thermal baths', 'hot springs', 'spa', 'thermal water'],
    textQueries: ['thermal baths {region}', 'hot springs {region}', 'thermal spa {region}'],
    searchParams: { radius: 100000, minRating: 4.0 }
  },
  
  boat_tour: {
    types: ['tourist_attraction', 'travel_agency'],
    keywords: ['boat tour', 'cruise', 'boat trip', 'sightseeing'],
    textQueries: ['boat tour {region}', 'river cruise {region}'],
    searchParams: { radius: 50000 }
  },
  
  // Culture Activities
  castle_visit: {
    types: ['tourist_attraction', 'museum'],
    keywords: ['castle', 'fortress', 'palace', 'medieval'],
    textQueries: ['castle {region}', 'fortress {region}', 'palace {region}'],
    searchParams: { radius: 100000, minRating: 4.0 }
  },
  
  fortified_churches: {
    types: ['church', 'tourist_attraction'],
    keywords: ['fortified church', 'medieval church', 'unesco', 'heritage'],
    textQueries: ['fortified church {region}', 'medieval church {region}'],
    searchParams: { radius: 100000 }
  },
  
  street_art: {
    types: ['tourist_attraction', 'art_gallery'],
    keywords: ['street art', 'murals', 'graffiti', 'urban art'],
    textQueries: ['street art {region}', 'murals {region}', 'urban art {region}'],
    searchParams: { radius: 15000 }
  },
  
  museums: {
    types: ['museum', 'tourist_attraction'],
    keywords: ['museum', 'gallery', 'exhibition', 'art'],
    textQueries: ['museum {region}', 'art gallery {region}'],
    searchParams: { radius: 25000, minRating: 4.0 }
  },
  
  // Wellness Activities
  spa: {
    types: ['spa', 'health', 'beauty_salon'],
    keywords: ['spa', 'wellness', 'massage', 'relaxation'],
    textQueries: ['spa {region}', 'wellness center {region}'],
    searchParams: { radius: 25000, minRating: 4.0 }
  },
  
  yoga: {
    types: ['gym', 'health', 'establishment'],
    keywords: ['yoga', 'meditation', 'yoga studio', 'wellness'],
    textQueries: ['yoga studio {region}', 'yoga class {region}'],
    searchParams: { radius: 25000 }
  },
  
  wellness_retreat: {
    types: ['lodging', 'spa', 'health'],
    keywords: ['wellness retreat', 'spa resort', 'health resort'],
    textQueries: ['wellness retreat {region}', 'spa resort {region}'],
    searchParams: { radius: 100000, minRating: 4.0 }
  },
  
  // Nightlife Activities
  live_music: {
    types: ['night_club', 'bar', 'establishment'],
    keywords: ['live music', 'concert', 'jazz', 'music venue'],
    textQueries: ['live music {region}', 'music venue {region}', 'jazz club {region}'],
    searchParams: { radius: 15000, openNow: true }
  },
  
  nightclub: {
    types: ['night_club', 'bar'],
    keywords: ['nightclub', 'club', 'dancing', 'DJ'],
    textQueries: ['nightclub {region}', 'dance club {region}'],
    searchParams: { radius: 15000, openNow: true }
  },
  
  standup_comedy: {
    types: ['establishment', 'night_club'],
    keywords: ['comedy', 'stand up', 'comedy club', 'entertainment'],
    textQueries: ['comedy club {region}', 'stand up comedy {region}'],
    searchParams: { radius: 25000 }
  },
  
  // Culinary Activities
  wine_tasting: {
    types: ['establishment', 'tourist_attraction'],
    keywords: ['winery', 'wine tasting', 'vineyard', 'cellar'],
    textQueries: ['winery {region}', 'wine tasting {region}', 'vineyard {region}'],
    searchParams: { radius: 50000, minRating: 4.0 }
  },
  
  cooking_class: {
    types: ['establishment', 'school'],
    keywords: ['cooking class', 'culinary', 'cooking school', 'chef'],
    textQueries: ['cooking class {region}', 'culinary school {region}'],
    searchParams: { radius: 25000 }
  },
  
  fine_dining: {
    types: ['restaurant'],
    keywords: ['fine dining', 'michelin', 'gourmet', 'upscale'],
    textQueries: ['fine dining {region}', 'michelin restaurant {region}', 'gourmet {region}'],
    searchParams: { radius: 25000, minRating: 4.5, priceLevel: [3, 4] }
  },
  
  // Creative Activities
  photography: {
    types: ['tourist_attraction', 'park', 'establishment'],
    keywords: ['photography', 'photo spot', 'scenic', 'viewpoint'],
    textQueries: ['photography spots {region}', 'scenic views {region}'],
    searchParams: { radius: 25000 }
  },
  
  ceramics: {
    types: ['establishment', 'store'],
    keywords: ['ceramics', 'pottery', 'workshop', 'traditional crafts'],
    textQueries: ['ceramics workshop {region}', 'pottery {region}'],
    searchParams: { radius: 50000 }
  },
  
  maker_space: {
    types: ['establishment', 'school'],
    keywords: ['maker space', 'workshop', 'DIY', 'fabrication'],
    textQueries: ['maker space {region}', 'workshop {region}', 'fab lab {region}'],
    searchParams: { radius: 25000 }
  },
  
  // Sports Activities
  indoor_climbing: {
    types: ['gym', 'establishment'],
    keywords: ['climbing gym', 'bouldering', 'indoor climbing', 'rock climbing'],
    textQueries: ['climbing gym {region}', 'bouldering {region}'],
    searchParams: { radius: 25000 }
  },
  
  padel: {
    types: ['establishment', 'gym'],
    keywords: ['padel', 'padel court', 'racquet sports'],
    textQueries: ['padel court {region}', 'padel {region}'],
    searchParams: { radius: 25000 }
  },
  
  skateboarding: {
    types: ['park', 'establishment'],
    keywords: ['skate park', 'skateboard', 'skating', 'bowl'],
    textQueries: ['skate park {region}', 'skateboarding {region}'],
    searchParams: { radius: 25000 }
  },
  
  // Learning Activities
  language_exchange: {
    types: ['establishment', 'school'],
    keywords: ['language exchange', 'language school', 'conversation'],
    textQueries: ['language exchange {region}', 'language school {region}'],
    searchParams: { radius: 15000 }
  },
  
  volunteer: {
    types: ['establishment'],
    keywords: ['volunteer', 'NGO', 'community', 'charity'],
    textQueries: ['volunteer opportunities {region}', 'NGO {region}'],
    searchParams: { radius: 25000 }
  },
  
  educational_tour: {
    types: ['tourist_attraction', 'museum'],
    keywords: ['guided tour', 'educational', 'history', 'cultural tour'],
    textQueries: ['guided tour {region}', 'educational tour {region}'],
    searchParams: { radius: 25000, minRating: 4.0 }
  }
};

/**
 * Helper function to get Google Places mapping for an activity subtype
 */
export function getGooglePlacesMapping(subtype: string): GooglePlacesMapping | null {
  return GOOGLE_PLACES_MAPPING[subtype] || null;
}

/**
 * Helper function to build Google Places search query for an activity
 */
export function buildGooglePlacesQuery(
  subtype: string, 
  region: string, 
  location: { lat: number; lng: number }
): {
  types?: string[];
  keywords?: string[];
  textQueries?: string[];
  searchParams?: any;
} | null {
  const mapping = getGooglePlacesMapping(subtype);
  if (!mapping) return null;
  
  return {
    types: mapping.types,
    keywords: mapping.keywords,
    textQueries: mapping.textQueries?.map(query => query.replace('{region}', region)),
    searchParams: {
      ...mapping.searchParams,
      location: `${location.lat},${location.lng}`
    }
  };
}
