/**
 * Trail and Outdoor Activity Types
 * Defines interfaces for trails, outdoor activities, and related data structures
 */

export interface TrailSummary {
  id: string;
  name: string;
  type: 'hiking' | 'mtb' | 'cycling' | 'ski' | 'running';
  difficulty: 'easy' | 'moderate' | 'difficult' | 'expert';
  distance?: number; // in kilometers
  elevation?: number; // elevation gain in meters
  duration?: number; // estimated duration in minutes
  location: {
    lat: number;
    lng: number;
  };
  bbox?: {
    north: number;
    south: number;
    east: number;
    west: number;
  };
  surface?: string; // paved, gravel, dirt, snow, etc.
  tags: string[];
  source: 'overpass' | 'opentripmap';
}

export interface TrailDetails extends TrailSummary {
  description?: string;
  waypoints: Array<{
    lat: number;
    lng: number;
    elevation?: number;
  }>;
  amenities?: string[]; // parking, restrooms, water, etc.
  restrictions?: string[]; // seasonal closures, permits required, etc.
  lastUpdated?: Date;
  rating?: number;
  reviews?: number;
}

export interface OutdoorPOI {
  id: string;
  name: string;
  category: 'natural' | 'park' | 'viewpoint' | 'recreation' | 'adventure';
  subcategory?: string;
  location: {
    lat: number;
    lng: number;
  };
  description?: string;
  rating?: number;
  tags: string[];
  amenities?: string[];
  source: 'opentripmap' | 'overpass';
}

export interface WeatherCondition {
  timestamp: Date;
  temperature: number; // Celsius
  precipitation: number; // mm/hour
  windSpeed: number; // km/h
  windDirection?: number; // degrees
  humidity?: number; // percentage
  visibility?: number; // km
  conditions: string; // clear, cloudy, rain, snow, etc.
  uvIndex?: number;
}

export interface WeatherForecast {
  current: WeatherCondition;
  hourly: WeatherCondition[]; // next 24 hours
  location: {
    lat: number;
    lng: number;
  };
  source: 'openmeteo';
}

export interface LocationContext {
  coordinates: {
    lat: number;
    lng: number;
  };
  accuracy?: number; // meters
  source: 'gps' | 'network' | 'fallback';
  city?: string;
  country?: string;
  timezone?: string;
}

export interface ActivityFilter {
  location: LocationContext;
  maxDistance?: number; // km from location
  weather?: WeatherCondition;
  difficulty?: TrailSummary['difficulty'][];
  types?: TrailSummary['type'][];
  minDuration?: number; // minutes
  maxDuration?: number; // minutes
}

export interface WeatherGating {
  heavyRain: boolean; // > 5mm/hour
  strongWind: boolean; // > 30km/h
  extremeTemp: boolean; // < -10°C or > 35°C
  poorVisibility: boolean; // < 1km
  recommendation: 'indoor' | 'covered' | 'outdoor' | 'any';
}

/**
 * Overpass API query templates
 */
export const OVERPASS_QUERIES = {
  MTB_TRAILS: `
    [out:json][timeout:25];
    (
      relation["route"="mtb"](bbox:{bbox});
      way["route"="mtb"](bbox:{bbox});
    );
    out geom;
  `,
  
  HIKING_TRAILS: `
    [out:json][timeout:25];
    (
      relation["route"="hiking"](bbox:{bbox});
      way["route"="hiking"](bbox:{bbox});
    );
    out geom;
  `,
  
  CYCLING_ROUTES: `
    [out:json][timeout:25];
    (
      relation["route"="bicycle"](bbox:{bbox});
      way["route"="bicycle"](bbox:{bbox});
    );
    out geom;
  `,
  
  SKI_PISTES: `
    [out:json][timeout:25];
    (
      way["piste:type"](bbox:{bbox});
      relation["piste:type"](bbox:{bbox});
    );
    out geom;
  `,
  
  OUTDOOR_AMENITIES: `
    [out:json][timeout:25];
    (
      node["amenity"~"^(parking|toilets|drinking_water|shelter)$"](bbox:{bbox});
      node["tourism"~"^(viewpoint|picnic_site|camp_site)$"](bbox:{bbox});
    );
    out;
  `
} as const;

/**
 * OpenTripMap categories for outdoor activities
 */
export const OPENTRIPMAP_KINDS = {
  NATURAL: 'natural',
  PARKS: 'parks',
  VIEWPOINTS: 'other_hotels', // viewpoints are often categorized here
  AMUSEMENTS: 'amusements',
  SPORT: 'sport',
  MUSEUMS: 'museums',
  HISTORIC: 'historic'
} as const;
