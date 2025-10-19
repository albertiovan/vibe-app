/**
 * Activities-First Domain Model
 * 
 * Core principle: An Activity is WHAT to do, a Venue is WHERE to do it.
 * Activities have intent and requirements, Venues are verified locations that support those activities.
 */

export type ActivityCategory = 
  | 'adventure' 
  | 'nature' 
  | 'water' 
  | 'culture' 
  | 'wellness' 
  | 'nightlife' 
  | 'culinary' 
  | 'creative' 
  | 'sports' 
  | 'learning';

export type EnergyLevel = 'chill' | 'medium' | 'high';
export type IndoorOutdoor = 'indoor' | 'outdoor' | 'either';
export type Seasonality = 'summer' | 'winter' | 'all';
export type WeatherSuitability = 'good' | 'ok' | 'bad';
export type Provider = 'google' | 'osm' | 'opentripmap';

/**
 * ActivityIntent represents a specific activity that can be performed
 * Examples: 'mtb_downhill_brasov', 'wine_tasting_dealu_mare', 'hiking_omu_peak'
 */
export interface ActivityIntent {
  /** Stable, unique activity identifier */
  id: string;
  
  /** Human-readable activity name */
  label: string;
  
  /** Primary category for this activity */
  category: ActivityCategory;
  
  /** Specific subtypes that define this activity */
  subtypes: string[];
  
  /** Romanian regions where this activity is available */
  regions: string[];
  
  /** Estimated duration range in hours */
  durationHintHrs?: [number, number];
  
  /** Energy/intensity level required */
  energy: EnergyLevel;
  
  /** Indoor/outdoor preference */
  indoorOutdoor: IndoorOutdoor;
  
  /** Seasonal availability */
  seasonality?: Seasonality;
  
  /** Prerequisites or requirements */
  requirements?: string[];
  
  /** Difficulty level (1-5) */
  difficulty?: number;
  
  /** Group size recommendations */
  groupSize?: {
    min?: number;
    max?: number;
    ideal?: number;
  };
}

/**
 * VerifiedVenue represents a real location where an activity can be performed
 * Verified through external providers (Google Places, OSM, etc.)
 */
export interface VerifiedVenue {
  /** Provider-specific place identifier */
  placeId: string;
  
  /** Venue name */
  name: string;
  
  /** Direct maps URL for navigation */
  mapsUrl: string;
  
  /** Photo URL if available */
  imageUrl?: string;
  
  /** User rating (1-5) */
  rating?: number;
  
  /** Number of user ratings */
  userRatingsTotal?: number;
  
  /** Precise coordinates */
  coords: { 
    lat: number; 
    lon: number; 
  };
  
  /** Data source provider */
  provider: Provider;
  
  /** Provider-specific metadata */
  metadata?: {
    types?: string[];
    priceLevel?: number;
    openingHours?: any;
    website?: string;
    phoneNumber?: string;
  };
  
  /** Distance from search origin in km */
  distanceKm?: number;
  
  /** Estimated travel time in minutes */
  travelTimeMin?: number;
}

/**
 * ActivityRecommendation combines an activity intent with verified venues
 * This is what gets returned to users as a complete recommendation
 */
export interface ActivityRecommendation {
  /** The activity being recommended */
  intent: ActivityIntent;
  
  /** Real venues where this activity can be performed */
  verifiedVenues: VerifiedVenue[];
  
  /** Weather suitability for current conditions */
  weatherSuitability: WeatherSuitability;
  
  /** AI-generated explanation of why this fits the user's vibe */
  rationale: string;
  
  /** Confidence score (0-1) for this recommendation */
  confidence: number;
  
  /** Personalization factors that influenced this recommendation */
  personalizationFactors?: {
    userInterests: string[];
    pastPreferences: string[];
    energyMatch: number;
    locationPreference: number;
  };
  
  /** Contextual factors */
  context?: {
    weather?: string;
    timeOfDay?: string;
    seasonality?: string;
    crowdLevel?: 'low' | 'medium' | 'high';
  };
}

/**
 * ActivityQuery represents a user's intent to find activities
 */
export interface ActivityQuery {
  /** User's vibe/mood description */
  vibe: string;
  
  /** Geographic constraints */
  location: {
    lat: number;
    lng: number;
    radiusKm?: number;
  };
  
  /** Time constraints */
  timeConstraints?: {
    durationHours?: number;
    startTime?: string;
    endTime?: string;
  };
  
  /** Category preferences */
  categories?: ActivityCategory[];
  
  /** Energy level preference */
  energyLevel?: EnergyLevel;
  
  /** Indoor/outdoor preference */
  indoorOutdoor?: IndoorOutdoor;
  
  /** User ID for personalization */
  userId?: string;
  
  /** Current weather conditions */
  weather?: {
    condition: string;
    temperature: number;
    precipitation: number;
  };
}

/**
 * ActivitySearchResult represents the complete response to an activity query
 */
export interface ActivitySearchResult {
  /** Recommended activities with venues */
  recommendations: ActivityRecommendation[];
  
  /** Search metadata */
  searchMetadata: {
    query: ActivityQuery;
    totalActivitiesConsidered: number;
    totalVenuesVerified: number;
    processingTimeMs: number;
    providers: Provider[];
  };
  
  /** Alternative suggestions if primary results are limited */
  alternatives?: {
    nearbyRegions: string[];
    alternativeCategories: ActivityCategory[];
    weatherAlternatives: ActivityRecommendation[];
  };
}
