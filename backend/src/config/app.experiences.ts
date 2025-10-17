/**
 * Experiences Configuration
 * Defines the "Vibes → Experiences" domain model and policies
 */

export interface ExperienceSector {
  id: string;
  name: string;
  description: string;
  placeTypes: string[];
  keywords: string[];
  priority: number; // Higher = more likely to be selected for diversity
}

/**
 * Core experience sectors for diversified recommendations
 * Each vibe match should ideally span multiple sectors
 */
export const SECTOR_BUCKETS: ExperienceSector[] = [
  {
    id: 'trails',
    name: 'Trails & Outdoor',
    description: 'Hiking, walking trails, outdoor exploration',
    placeTypes: ['park', 'tourist_attraction', 'natural_feature'],
    keywords: ['trail', 'hike', 'nature', 'outdoor', 'walk', 'forest', 'mountain'],
    priority: 9
  },
  {
    id: 'adrenaline',
    name: 'Adrenaline & Sports',
    description: 'High-energy activities, sports, adventure',
    placeTypes: ['amusement_park', 'stadium', 'gym', 'bowling_alley'],
    keywords: ['adrenaline', 'sports', 'adventure', 'extreme', 'thrill', 'active', 'energy'],
    priority: 8
  },
  {
    id: 'nature',
    name: 'Nature & Serenity',
    description: 'Peaceful natural settings, gardens, scenic spots',
    placeTypes: ['park', 'zoo', 'aquarium', 'botanical_garden'],
    keywords: ['nature', 'peaceful', 'garden', 'scenic', 'tranquil', 'wildlife', 'green'],
    priority: 8
  },
  {
    id: 'culture',
    name: 'Culture & Arts',
    description: 'Museums, galleries, historical sites, cultural experiences',
    placeTypes: ['museum', 'art_gallery', 'library', 'church', 'synagogue', 'hindu_temple'],
    keywords: ['culture', 'art', 'history', 'museum', 'gallery', 'heritage', 'learn'],
    priority: 7
  },
  {
    id: 'wellness',
    name: 'Wellness & Relaxation',
    description: 'Spas, wellness centers, relaxation activities',
    placeTypes: ['spa', 'beauty_salon', 'gym', 'park'],
    keywords: ['wellness', 'spa', 'relax', 'massage', 'meditation', 'health', 'rejuvenate'],
    priority: 6
  },
  {
    id: 'nightlife',
    name: 'Nightlife & Social',
    description: 'Evening entertainment, social venues, nightlife',
    placeTypes: ['night_club', 'bar', 'casino', 'movie_theater'],
    keywords: ['nightlife', 'party', 'social', 'evening', 'drinks', 'entertainment', 'music'],
    priority: 5
  }
];

/**
 * Food/Culinary Policy Configuration
 */
export const FOOD_POLICY = {
  // Food is OFF by default - only premium culinary experiences
  defaultEnabled: false,
  
  // Minimum price level for culinary experiences (Google Places scale 0-4)
  minimumPriceLevel: 3,
  
  // Premium culinary place types (only these when food is enabled)
  premiumTypes: [
    'restaurant' // Will be filtered by price level and ratings
  ],
  
  // Curated allowlist for exceptional culinary experiences
  curatedAllowlist: [
    // Michelin starred or equivalent high-end restaurants
    // This would be populated with specific place_ids
  ],
  
  // Keywords that trigger culinary mode
  culinaryTriggers: [
    'michelin', 'starred', 'tasting menu', 'fine dining', 'culinary experience',
    'chef', 'gourmet', 'wine pairing', 'degustation', 'omakase'
  ],
  
  // Minimum rating for culinary experiences
  minimumRating: 4.3
} as const;

/**
 * Experience Selection Rules
 */
export const SELECTION_RULES = {
  // Hard cap on number of results
  maxResults: 5,
  
  // Minimum diversity - try to get results from at least this many sectors
  minSectorDiversity: 3,
  
  // Maximum results per sector (to ensure diversity)
  maxPerSector: 2,
  
  // Fallback if not enough diverse results
  fallbackToTopRated: true
} as const;

/**
 * Check if a vibe/query should enable culinary experiences
 */
export function shouldEnableCulinary(query: string, keywords: string[] = []): boolean {
  const allText = [query, ...keywords].join(' ').toLowerCase();
  
  return FOOD_POLICY.culinaryTriggers.some(trigger => 
    allText.includes(trigger.toLowerCase())
  );
}

/**
 * Get sector for a place based on its types and characteristics
 */
export function classifyPlaceToSector(place: any): string | null {
  const placeTypes = place.types || [];
  const placeName = (place.name || '').toLowerCase();
  
  // Check each sector for matches
  for (const sector of SECTOR_BUCKETS) {
    // Check place types
    if (sector.placeTypes.some(type => placeTypes.includes(type))) {
      return sector.id;
    }
    
    // Check keywords in name
    if (sector.keywords.some(keyword => placeName.includes(keyword))) {
      return sector.id;
    }
  }
  
  return null;
}

/**
 * Diversify results across sectors with max 5 results
 */
export function diversifyResults(places: any[]): any[] {
  // Group places by sector
  const sectorGroups: Record<string, any[]> = {};
  const unclassified: any[] = [];
  
  for (const place of places) {
    const sector = classifyPlaceToSector(place);
    if (sector) {
      if (!sectorGroups[sector]) sectorGroups[sector] = [];
      sectorGroups[sector].push(place);
    } else {
      unclassified.push(place);
    }
  }
  
  // Sort sectors by priority (higher priority first)
  const sortedSectors = Object.keys(sectorGroups).sort((a, b) => {
    const sectorA = SECTOR_BUCKETS.find(s => s.id === a);
    const sectorB = SECTOR_BUCKETS.find(s => s.id === b);
    return (sectorB?.priority || 0) - (sectorA?.priority || 0);
  });
  
  const selectedPlaces: any[] = [];
  
  // Select up to maxPerSector from each sector
  for (const sectorId of sortedSectors) {
    const sectorPlaces = sectorGroups[sectorId]
      .sort((a, b) => (b.rating || 0) - (a.rating || 0)) // Sort by rating
      .slice(0, SELECTION_RULES.maxPerSector);
    
    selectedPlaces.push(...sectorPlaces);
    
    if (selectedPlaces.length >= SELECTION_RULES.maxResults) {
      break;
    }
  }
  
  // Fill remaining slots with unclassified or top-rated
  if (selectedPlaces.length < SELECTION_RULES.maxResults) {
    const remaining = SELECTION_RULES.maxResults - selectedPlaces.length;
    const fillPlaces = unclassified
      .sort((a, b) => (b.rating || 0) - (a.rating || 0))
      .slice(0, remaining);
    
    selectedPlaces.push(...fillPlaces);
  }
  
  // Final cap at exactly 5 results
  return selectedPlaces.slice(0, SELECTION_RULES.maxResults);
}
