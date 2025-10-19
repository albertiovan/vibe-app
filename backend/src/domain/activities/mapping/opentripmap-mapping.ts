/**
 * OpenTripMap API Mapping
 * 
 * Maps activity subtypes to OpenTripMap API kinds filters for finding POIs.
 * OpenTripMap is excellent for tourist attractions, cultural sites, and natural features.
 * 
 * This is the single source of truth for OpenTripMap queries.
 */

export interface OpenTripMapMapping {
  /** OpenTripMap kinds to filter by */
  kinds: string[];
  
  /** Additional API parameters */
  params?: {
    /** Minimum rate (1-3, 3 being highest) */
    rate?: number;
    
    /** Format for response */
    format?: 'json' | 'geojson';
    
    /** Limit number of results */
    limit?: number;
    
    /** Minimum distance between objects in meters */
    minDistance?: number;
  };
  
  /** Search radius in meters */
  searchRadius?: number;
}

/**
 * Activity subtype to OpenTripMap mapping
 * Key: activity subtype from romania-ontology.ts
 * Value: OpenTripMap API configuration
 */
export const OPENTRIPMAP_MAPPING: Record<string, OpenTripMapMapping> = {
  // Adventure Activities
  mountain_biking: {
    kinds: ['sport', 'other_sport', 'climbing', 'outdoor_activities'],
    searchRadius: 50000,
    params: {
      rate: 2,
      limit: 50,
      minDistance: 1000
    }
  },
  
  downhill: {
    kinds: ['sport', 'other_sport', 'ski_resorts', 'outdoor_activities'],
    searchRadius: 30000,
    params: {
      rate: 2,
      limit: 20,
      minDistance: 2000
    }
  },
  
  via_ferrata: {
    kinds: ['climbing', 'sport', 'natural', 'mountains'],
    searchRadius: 100000,
    params: {
      rate: 2,
      limit: 20,
      minDistance: 5000
    }
  },
  
  rock_climbing: {
    kinds: ['climbing', 'sport', 'natural', 'geological_formations'],
    searchRadius: 50000,
    params: {
      rate: 2,
      limit: 30,
      minDistance: 2000
    }
  },
  
  paragliding: {
    kinds: ['sport', 'other_sport', 'natural', 'mountains'],
    searchRadius: 100000,
    params: {
      rate: 2,
      limit: 10,
      minDistance: 5000
    }
  },
  
  rafting: {
    kinds: ['sport', 'water_sport', 'natural', 'water'],
    searchRadius: 100000,
    params: {
      rate: 2,
      limit: 20,
      minDistance: 10000
    }
  },
  
  canyoning: {
    kinds: ['sport', 'water_sport', 'natural', 'geological_formations'],
    searchRadius: 100000,
    params: {
      rate: 2,
      limit: 15,
      minDistance: 5000
    }
  },
  
  ski_alpine: {
    kinds: ['ski_resorts', 'sport', 'winter_sports'],
    searchRadius: 50000,
    params: {
      rate: 2,
      limit: 20,
      minDistance: 2000
    }
  },
  
  // Nature Activities
  hiking: {
    kinds: ['natural', 'mountains', 'forests', 'national_parks', 'nature_reserves'],
    searchRadius: 50000,
    params: {
      rate: 2,
      limit: 100,
      minDistance: 1000
    }
  },
  
  peak_bagging: {
    kinds: ['natural', 'mountains', 'peaks', 'geological_formations'],
    searchRadius: 100000,
    params: {
      rate: 3,
      limit: 50,
      minDistance: 2000
    }
  },
  
  national_park: {
    kinds: ['national_parks', 'nature_reserves', 'natural', 'forests'],
    searchRadius: 200000,
    params: {
      rate: 3,
      limit: 20,
      minDistance: 10000
    }
  },
  
  wildlife_watching: {
    kinds: ['zoos', 'natural', 'nature_reserves', 'water', 'forests'],
    searchRadius: 100000,
    params: {
      rate: 2,
      limit: 30,
      minDistance: 5000
    }
  },
  
  cave_exploration: {
    kinds: ['natural', 'caves', 'geological_formations', 'interesting_places'],
    searchRadius: 200000,
    params: {
      rate: 3,
      limit: 30,
      minDistance: 5000
    }
  },
  
  waterfall: {
    kinds: ['natural', 'water', 'waterfalls', 'geological_formations'],
    searchRadius: 100000,
    params: {
      rate: 3,
      limit: 50,
      minDistance: 2000
    }
  },
  
  // Water Activities
  kayaking: {
    kinds: ['water_sport', 'sport', 'natural', 'water', 'rivers'],
    searchRadius: 100000,
    params: {
      rate: 2,
      limit: 40,
      minDistance: 5000
    }
  },
  
  sup: {
    kinds: ['water_sport', 'sport', 'natural', 'water', 'lakes'],
    searchRadius: 50000,
    params: {
      rate: 2,
      limit: 30,
      minDistance: 2000
    }
  },
  
  thermal_baths: {
    kinds: ['thermal_springs', 'natural', 'water', 'health_resorts', 'spas'],
    searchRadius: 200000,
    params: {
      rate: 3,
      limit: 20,
      minDistance: 10000
    }
  },
  
  boat_tour: {
    kinds: ['water', 'rivers', 'lakes', 'tourist_facilities', 'interesting_places'],
    searchRadius: 100000,
    params: {
      rate: 2,
      limit: 30,
      minDistance: 5000
    }
  },
  
  // Culture Activities
  castle_visit: {
    kinds: ['castles', 'fortifications', 'historic', 'architecture', 'museums'],
    searchRadius: 200000,
    params: {
      rate: 3,
      limit: 50,
      minDistance: 5000
    }
  },
  
  fortified_churches: {
    kinds: ['churches', 'fortifications', 'historic', 'architecture', 'religion'],
    searchRadius: 200000,
    params: {
      rate: 3,
      limit: 40,
      minDistance: 2000
    }
  },
  
  street_art: {
    kinds: ['art', 'monuments_and_memorials', 'urban_environment', 'cultural'],
    searchRadius: 25000,
    params: {
      rate: 2,
      limit: 100,
      minDistance: 500
    }
  },
  
  museums: {
    kinds: ['museums', 'cultural', 'art', 'historic', 'interesting_places'],
    searchRadius: 50000,
    params: {
      rate: 3,
      limit: 50,
      minDistance: 1000
    }
  },
  
  // Wellness Activities
  spa: {
    kinds: ['spas', 'health_resorts', 'thermal_springs', 'wellness'],
    searchRadius: 50000,
    params: {
      rate: 3,
      limit: 30,
      minDistance: 2000
    }
  },
  
  yoga: {
    kinds: ['sport', 'wellness', 'health_resorts', 'cultural'],
    searchRadius: 25000,
    params: {
      rate: 2,
      limit: 20,
      minDistance: 1000
    }
  },
  
  wellness_retreat: {
    kinds: ['health_resorts', 'spas', 'thermal_springs', 'natural', 'wellness'],
    searchRadius: 200000,
    params: {
      rate: 3,
      limit: 15,
      minDistance: 10000
    }
  },
  
  // Nightlife Activities (limited in OpenTripMap)
  live_music: {
    kinds: ['cultural', 'entertainment', 'urban_environment'],
    searchRadius: 25000,
    params: {
      rate: 2,
      limit: 30,
      minDistance: 500
    }
  },
  
  nightclub: {
    kinds: ['entertainment', 'urban_environment', 'cultural'],
    searchRadius: 15000,
    params: {
      rate: 1,
      limit: 20,
      minDistance: 500
    }
  },
  
  standup_comedy: {
    kinds: ['entertainment', 'cultural', 'urban_environment'],
    searchRadius: 25000,
    params: {
      rate: 2,
      limit: 15,
      minDistance: 1000
    }
  },
  
  // Culinary Activities
  wine_tasting: {
    kinds: ['wineries', 'cultural', 'interesting_places', 'tourist_facilities'],
    searchRadius: 100000,
    params: {
      rate: 3,
      limit: 30,
      minDistance: 5000
    }
  },
  
  cooking_class: {
    kinds: ['cultural', 'tourist_facilities', 'interesting_places'],
    searchRadius: 50000,
    params: {
      rate: 2,
      limit: 20,
      minDistance: 2000
    }
  },
  
  fine_dining: {
    kinds: ['cultural', 'interesting_places', 'tourist_facilities'],
    searchRadius: 25000,
    params: {
      rate: 3,
      limit: 20,
      minDistance: 1000
    }
  },
  
  // Creative Activities
  photography: {
    kinds: ['natural', 'architecture', 'interesting_places', 'monuments_and_memorials'],
    searchRadius: 50000,
    params: {
      rate: 3,
      limit: 100,
      minDistance: 1000
    }
  },
  
  ceramics: {
    kinds: ['cultural', 'art', 'interesting_places', 'historic'],
    searchRadius: 100000,
    params: {
      rate: 2,
      limit: 20,
      minDistance: 5000
    }
  },
  
  maker_space: {
    kinds: ['cultural', 'urban_environment', 'interesting_places'],
    searchRadius: 25000,
    params: {
      rate: 2,
      limit: 10,
      minDistance: 2000
    }
  },
  
  // Sports Activities (limited in OpenTripMap)
  indoor_climbing: {
    kinds: ['sport', 'climbing', 'urban_environment'],
    searchRadius: 50000,
    params: {
      rate: 2,
      limit: 20,
      minDistance: 2000
    }
  },
  
  padel: {
    kinds: ['sport', 'other_sport', 'urban_environment'],
    searchRadius: 25000,
    params: {
      rate: 1,
      limit: 15,
      minDistance: 1000
    }
  },
  
  skateboarding: {
    kinds: ['sport', 'other_sport', 'urban_environment'],
    searchRadius: 25000,
    params: {
      rate: 1,
      limit: 15,
      minDistance: 1000
    }
  },
  
  // Learning Activities
  language_exchange: {
    kinds: ['cultural', 'urban_environment', 'interesting_places'],
    searchRadius: 25000,
    params: {
      rate: 1,
      limit: 10,
      minDistance: 1000
    }
  },
  
  volunteer: {
    kinds: ['cultural', 'urban_environment', 'interesting_places'],
    searchRadius: 50000,
    params: {
      rate: 1,
      limit: 15,
      minDistance: 2000
    }
  },
  
  educational_tour: {
    kinds: ['museums', 'historic', 'cultural', 'architecture', 'interesting_places'],
    searchRadius: 50000,
    params: {
      rate: 3,
      limit: 50,
      minDistance: 1000
    }
  }
};

/**
 * Helper function to get OpenTripMap mapping for an activity subtype
 */
export function getOpenTripMapMapping(subtype: string): OpenTripMapMapping | null {
  return OPENTRIPMAP_MAPPING[subtype] || null;
}

/**
 * Helper function to build OpenTripMap API query parameters
 */
export function buildOpenTripMapQuery(
  subtype: string,
  location: { lat: number; lng: number },
  radiusMeters?: number,
  apiKey?: string
): {
  url: string;
  params: Record<string, any>;
} | null {
  const mapping = getOpenTripMapMapping(subtype);
  if (!mapping) return null;
  
  const radius = radiusMeters || mapping.searchRadius || 25000;
  const kinds = mapping.kinds.join(',');
  
  const params = {
    lon: location.lng,
    lat: location.lat,
    radius: radius,
    kinds: kinds,
    format: 'json',
    ...(mapping.params || {}),
    ...(apiKey ? { apikey: apiKey } : {})
  };
  
  return {
    url: 'https://api.opentripmap.com/0.1/en/places/radius',
    params
  };
}

/**
 * Helper function to get place details from OpenTripMap
 */
export function buildOpenTripMapDetailsQuery(
  xid: string,
  apiKey?: string
): {
  url: string;
  params: Record<string, any>;
} | null {
  if (!xid) return null;
  
  const params = {
    ...(apiKey ? { apikey: apiKey } : {})
  };
  
  return {
    url: `https://api.opentripmap.com/0.1/en/places/xid/${xid}`,
    params
  };
}
