/**
 * OpenStreetMap (OSM) Tags Mapping
 * 
 * Maps activity subtypes to Overpass API query tags for finding venues in OSM data.
 * OSM is particularly good for outdoor activities, trails, and natural features.
 * 
 * This is the single source of truth for OSM/Overpass queries.
 */

export interface OSMTagsMapping {
  /** Primary OSM tags to query */
  tags: Record<string, string | string[]>;
  
  /** Additional filter conditions */
  filters?: {
    /** Minimum way length for routes (in meters) */
    minLength?: number;
    
    /** Required additional tags */
    requiredTags?: Record<string, string>;
    
    /** Excluded tag values */
    excludeTags?: Record<string, string[]>;
  };
  
  /** Search radius in meters */
  searchRadius?: number;
  
  /** OSM element types to include */
  elementTypes?: ('node' | 'way' | 'relation')[];
}

/**
 * Activity subtype to OSM tags mapping
 * Key: activity subtype from romania-ontology.ts
 * Value: OSM/Overpass query configuration
 */
export const OSM_TAGS_MAPPING: Record<string, OSMTagsMapping> = {
  // Adventure Activities
  mountain_biking: {
    tags: {
      'route': 'mtb',
      'highway': 'cycleway',
      'bicycle': 'designated',
      'mtb:scale': ['0', '1', '2', '3', '4', '5']
    },
    elementTypes: ['way', 'relation'],
    searchRadius: 50000,
    filters: {
      minLength: 1000
    }
  },
  
  downhill: {
    tags: {
      'route': 'mtb',
      'mtb:type': 'downhill',
      'piste:type': 'downhill',
      'sport': 'cycling'
    },
    elementTypes: ['way', 'relation'],
    searchRadius: 30000,
    filters: {
      minLength: 500
    }
  },
  
  via_ferrata: {
    tags: {
      'highway': 'via_ferrata',
      'climbing': 'via_ferrata',
      'sport': 'climbing'
    },
    elementTypes: ['way', 'node'],
    searchRadius: 100000
  },
  
  rock_climbing: {
    tags: {
      'sport': 'climbing',
      'climbing': ['sport', 'traditional', 'mixed'],
      'natural': 'cliff'
    },
    elementTypes: ['node', 'way'],
    searchRadius: 50000
  },
  
  paragliding: {
    tags: {
      'sport': 'paragliding',
      'aeroway': 'runway',
      'paragliding': 'takeoff'
    },
    elementTypes: ['node', 'way'],
    searchRadius: 100000
  },
  
  rafting: {
    tags: {
      'sport': 'canoe',
      'canoe': 'yes',
      'whitewater': ['grade_1', 'grade_2', 'grade_3', 'grade_4', 'grade_5'],
      'waterway': 'river'
    },
    elementTypes: ['way', 'relation'],
    searchRadius: 100000,
    filters: {
      minLength: 5000
    }
  },
  
  canyoning: {
    tags: {
      'sport': 'canyoning',
      'natural': 'canyon',
      'waterway': 'stream'
    },
    elementTypes: ['way', 'node'],
    searchRadius: 100000
  },
  
  ski_alpine: {
    tags: {
      'piste:type': 'downhill',
      'aerialway': ['cable_car', 'gondola', 'chair_lift', 't-bar'],
      'landuse': 'winter_sports'
    },
    elementTypes: ['way', 'node', 'relation'],
    searchRadius: 50000
  },
  
  // Nature Activities
  hiking: {
    tags: {
      'route': 'hiking',
      'highway': 'path',
      'foot': 'designated',
      'sac_scale': ['hiking', 'mountain_hiking', 'demanding_mountain_hiking']
    },
    elementTypes: ['way', 'relation'],
    searchRadius: 50000,
    filters: {
      minLength: 2000
    }
  },
  
  peak_bagging: {
    tags: {
      'natural': 'peak',
      'mountain_pass': 'yes'
    },
    elementTypes: ['node'],
    searchRadius: 100000
  },
  
  national_park: {
    tags: {
      'boundary': 'national_park',
      'leisure': 'nature_reserve',
      'protect_class': ['1', '2', '3']
    },
    elementTypes: ['relation', 'way'],
    searchRadius: 200000
  },
  
  wildlife_watching: {
    tags: {
      'tourism': 'zoo',
      'leisure': 'nature_reserve',
      'natural': 'wetland',
      'landuse': 'forest'
    },
    elementTypes: ['node', 'way', 'relation'],
    searchRadius: 100000
  },
  
  cave_exploration: {
    tags: {
      'natural': 'cave_entrance',
      'tourism': 'attraction',
      'cave': 'yes'
    },
    elementTypes: ['node'],
    searchRadius: 200000
  },
  
  waterfall: {
    tags: {
      'natural': 'waterfall',
      'waterway': 'waterfall'
    },
    elementTypes: ['node'],
    searchRadius: 100000
  },
  
  // Water Activities
  kayaking: {
    tags: {
      'sport': 'canoe',
      'canoe': 'yes',
      'waterway': ['river', 'canal'],
      'leisure': 'marina'
    },
    elementTypes: ['way', 'node'],
    searchRadius: 100000,
    filters: {
      minLength: 5000
    }
  },
  
  sup: {
    tags: {
      'natural': 'water',
      'leisure': 'marina',
      'sport': 'canoe',
      'water': 'lake'
    },
    elementTypes: ['way', 'node'],
    searchRadius: 50000
  },
  
  thermal_baths: {
    tags: {
      'amenity': 'public_bath',
      'leisure': 'swimming_pool',
      'natural': 'hot_spring',
      'spa': 'yes'
    },
    elementTypes: ['node', 'way'],
    searchRadius: 200000
  },
  
  boat_tour: {
    tags: {
      'waterway': ['river', 'canal'],
      'leisure': 'marina',
      'tourism': 'attraction'
    },
    elementTypes: ['way', 'node'],
    searchRadius: 100000
  },
  
  // Culture Activities
  castle_visit: {
    tags: {
      'historic': ['castle', 'fortress', 'palace'],
      'tourism': 'attraction',
      'castle_type': ['defensive', 'palace', 'manor']
    },
    elementTypes: ['node', 'way', 'relation'],
    searchRadius: 200000
  },
  
  fortified_churches: {
    tags: {
      'historic': 'church',
      'amenity': 'place_of_worship',
      'fortified': 'yes',
      'heritage': 'yes'
    },
    elementTypes: ['node', 'way'],
    searchRadius: 200000
  },
  
  street_art: {
    tags: {
      'tourism': 'artwork',
      'artwork_type': 'mural',
      'public_art': 'mural'
    },
    elementTypes: ['node'],
    searchRadius: 25000
  },
  
  museums: {
    tags: {
      'tourism': 'museum',
      'amenity': 'arts_centre',
      'museum': ['art', 'history', 'local', 'archaeology']
    },
    elementTypes: ['node', 'way'],
    searchRadius: 50000
  },
  
  // Wellness Activities
  spa: {
    tags: {
      'leisure': 'spa',
      'amenity': 'spa',
      'wellness': 'yes'
    },
    elementTypes: ['node', 'way'],
    searchRadius: 50000
  },
  
  yoga: {
    tags: {
      'leisure': 'fitness_centre',
      'sport': 'yoga',
      'amenity': 'studio'
    },
    elementTypes: ['node'],
    searchRadius: 25000
  },
  
  wellness_retreat: {
    tags: {
      'tourism': 'hotel',
      'leisure': 'spa',
      'wellness': 'retreat'
    },
    elementTypes: ['node', 'way'],
    searchRadius: 200000
  },
  
  // Sports Activities
  indoor_climbing: {
    tags: {
      'sport': 'climbing',
      'climbing': 'gym',
      'leisure': 'sports_centre'
    },
    elementTypes: ['node', 'way'],
    searchRadius: 50000
  },
  
  padel: {
    tags: {
      'sport': 'padel',
      'leisure': 'sports_centre',
      'amenity': 'court'
    },
    elementTypes: ['node', 'way'],
    searchRadius: 25000
  },
  
  skateboarding: {
    tags: {
      'sport': 'skateboard',
      'leisure': 'park',
      'skateboard': 'yes'
    },
    elementTypes: ['node', 'way'],
    searchRadius: 25000
  },
  
  // Learning Activities
  language_exchange: {
    tags: {
      'amenity': 'language_school',
      'amenity': 'community_centre',
      'social_facility': 'group_home'
    },
    elementTypes: ['node', 'way'],
    searchRadius: 25000
  },
  
  volunteer: {
    tags: {
      'amenity': 'community_centre',
      'office': 'ngo',
      'social_facility': 'group_home'
    },
    elementTypes: ['node', 'way'],
    searchRadius: 50000
  },
  
  educational_tour: {
    tags: {
      'tourism': ['attraction', 'museum'],
      'historic': 'yes',
      'heritage': 'yes'
    },
    elementTypes: ['node', 'way', 'relation'],
    searchRadius: 50000
  }
};

/**
 * Helper function to get OSM tags mapping for an activity subtype
 */
export function getOSMTagsMapping(subtype: string): OSMTagsMapping | null {
  return OSM_TAGS_MAPPING[subtype] || null;
}

/**
 * Helper function to build Overpass API query for an activity
 */
export function buildOverpassQuery(
  subtype: string,
  location: { lat: number; lng: number },
  radiusMeters?: number
): string | null {
  const mapping = getOSMTagsMapping(subtype);
  if (!mapping) return null;
  
  const radius = radiusMeters || mapping.searchRadius || 25000;
  const bbox = calculateBoundingBox(location, radius);
  
  let query = `[out:json][timeout:25];\n(\n`;
  
  // Add queries for each element type
  const elementTypes = mapping.elementTypes || ['node', 'way', 'relation'];
  
  elementTypes.forEach(elementType => {
    Object.entries(mapping.tags).forEach(([key, values]) => {
      const valueArray = Array.isArray(values) ? values : [values];
      
      valueArray.forEach(value => {
        query += `  ${elementType}["${key}"="${value}"](${bbox.south},${bbox.west},${bbox.north},${bbox.east});\n`;
      });
    });
  });
  
  query += `);\nout geom;`;
  
  return query;
}

/**
 * Calculate bounding box from center point and radius
 */
function calculateBoundingBox(
  center: { lat: number; lng: number },
  radiusMeters: number
): { north: number; south: number; east: number; west: number } {
  const earthRadius = 6371000; // Earth's radius in meters
  const latDelta = (radiusMeters / earthRadius) * (180 / Math.PI);
  const lngDelta = latDelta / Math.cos(center.lat * Math.PI / 180);
  
  return {
    north: center.lat + latDelta,
    south: center.lat - latDelta,
    east: center.lng + lngDelta,
    west: center.lng - lngDelta
  };
}
