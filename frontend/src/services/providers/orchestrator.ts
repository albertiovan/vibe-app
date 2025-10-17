/**
 * Provider Search Orchestrator
 * Coordinates Google Places, Overpass, and OpenTripMap searches
 */

export interface SearchItem {
  id: string;
  name: string;
  types: string[];
  location: {
    lat: number;
    lng: number;
  };
  rating?: number;
  priceLevel?: number;
  distance?: number;
  address?: string;
  photos?: Array<{ url: string }>;
  description?: string;
  source: 'google_places' | 'overpass' | 'opentripmap';
  bucket?: string;
}

export interface SearchParams {
  filterSpec: any;
  location: {
    lat: number;
    lng: number;
  };
  weather?: any;
  signal?: AbortSignal;
}

/**
 * Search all providers and combine results
 */
export async function searchProviders(params: SearchParams): Promise<SearchItem[]> {
  const { filterSpec, location, weather, signal } = params;
  
  console.log('🔍 Orchestrating provider search:', {
    buckets: filterSpec.buckets,
    types: filterSpec.types?.slice(0, 3),
    radius: filterSpec.radiusKm
  });

  const searchPromises: Promise<SearchItem[]>[] = [];

  // Google Places search
  searchPromises.push(
    searchGooglePlaces(filterSpec, location, signal)
      .catch(error => {
        console.warn('⚠️ Google Places search failed:', error);
        return [];
      })
  );

  // Outdoor providers (if outdoor buckets requested)
  const hasOutdoorBuckets = filterSpec.buckets?.some((bucket: string) => 
    ['trails', 'nature', 'adrenaline'].includes(bucket)
  );

  if (hasOutdoorBuckets) {
    // Overpass trails search
    searchPromises.push(
      searchOverpassTrails(filterSpec, location, signal)
        .catch(error => {
          console.warn('⚠️ Overpass search failed:', error);
          return [];
        })
    );

    // OpenTripMap POIs search
    searchPromises.push(
      searchOpenTripMapPOIs(filterSpec, location, signal)
        .catch(error => {
          console.warn('⚠️ OpenTripMap search failed:', error);
          return [];
        })
    );
  }

  // Execute searches in parallel
  const results = await Promise.all(searchPromises);
  
  // Combine and deduplicate results
  const allItems = results.flat();
  const uniqueItems = deduplicateItems(allItems);
  
  // Filter by distance and rating
  const filteredItems = uniqueItems
    .filter(item => {
      // Distance filter
      if (item.distance && filterSpec.radiusKm) {
        return item.distance <= filterSpec.radiusKm;
      }
      
      // Rating filter
      if (item.rating && filterSpec.minRating) {
        return item.rating >= filterSpec.minRating;
      }
      
      return true;
    })
    .sort((a, b) => {
      // Sort by rating and distance
      const ratingDiff = (b.rating || 0) - (a.rating || 0);
      if (Math.abs(ratingDiff) > 0.1) return ratingDiff;
      
      return (a.distance || 0) - (b.distance || 0);
    });

  console.log('📊 Provider search results:', {
    google: results[0]?.length || 0,
    overpass: results[1]?.length || 0,
    opentripmap: results[2]?.length || 0,
    total: filteredItems.length
  });

  return filteredItems;
}

/**
 * Search Google Places
 */
async function searchGooglePlaces(
  filterSpec: any,
  location: { lat: number; lng: number },
  signal?: AbortSignal
): Promise<SearchItem[]> {
  const params = new URLSearchParams({
    lat: location.lat.toString(),
    lng: location.lng.toString(),
    radius: (filterSpec.radiusKm * 1000).toString(), // Convert to meters
    types: filterSpec.types?.join(',') || 'tourist_attraction',
    minRating: filterSpec.minRating?.toString() || '4.0'
  });

  if (filterSpec.keywords?.length > 0) {
    params.set('keywords', filterSpec.keywords.join(' '));
  }

  const response = await fetch(`/api/places/search?${params}`, { signal });
  
  if (!response.ok) {
    throw new Error(`Google Places search failed: ${response.statusText}`);
  }

  const data = await response.json();
  
  return data.places?.map((place: any) => ({
    id: place.place_id,
    name: place.name,
    types: place.types || [],
    location: {
      lat: place.geometry?.location?.lat || location.lat,
      lng: place.geometry?.location?.lng || location.lng
    },
    rating: place.rating,
    priceLevel: place.price_level,
    distance: calculateDistance(
      location.lat,
      location.lng,
      place.geometry?.location?.lat || location.lat,
      place.geometry?.location?.lng || location.lng
    ),
    address: place.formatted_address,
    photos: place.photos?.slice(0, 1).map((photo: any) => ({
      url: `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${photo.photo_reference}&key=${process.env.REACT_APP_GOOGLE_MAPS_API_KEY}`
    })),
    source: 'google_places' as const,
    bucket: classifyToBucket(place.types)
  })) || [];
}

/**
 * Search Overpass for trails
 */
async function searchOverpassTrails(
  filterSpec: any,
  location: { lat: number; lng: number },
  signal?: AbortSignal
): Promise<SearchItem[]> {
  const params = new URLSearchParams({
    lat: location.lat.toString(),
    lng: location.lng.toString(),
    radius: filterSpec.radiusKm.toString(),
    types: 'hiking,mtb,cycling'
  });

  const response = await fetch(`/api/trails/search?${params}`, { signal });
  
  if (!response.ok) {
    throw new Error(`Overpass search failed: ${response.statusText}`);
  }

  const data = await response.json();
  
  return data.trails?.map((trail: any) => ({
    id: `overpass_${trail.id}`,
    name: trail.name || 'Unnamed Trail',
    types: ['trail', trail.type],
    location: {
      lat: trail.location.lat,
      lng: trail.location.lng
    },
    distance: trail.distance,
    description: `${trail.difficulty} ${trail.type} trail${trail.surface ? ` on ${trail.surface}` : ''}`,
    source: 'overpass' as const,
    bucket: 'trails'
  })) || [];
}

/**
 * Search OpenTripMap for POIs
 */
async function searchOpenTripMapPOIs(
  filterSpec: any,
  location: { lat: number; lng: number },
  signal?: AbortSignal
): Promise<SearchItem[]> {
  const params = new URLSearchParams({
    lat: location.lat.toString(),
    lng: location.lng.toString(),
    radius: (filterSpec.radiusKm * 1000).toString(), // Convert to meters
    categories: 'natural,parks,adventure'
  });

  const response = await fetch(`/api/pois/search?${params}`, { signal });
  
  if (!response.ok) {
    throw new Error(`OpenTripMap search failed: ${response.statusText}`);
  }

  const data = await response.json();
  
  return data.pois?.map((poi: any) => ({
    id: `otm_${poi.xid}`,
    name: poi.name || 'Unnamed Location',
    types: [poi.category, poi.subcategory].filter(Boolean),
    location: {
      lat: poi.location.lat,
      lng: poi.location.lng
    },
    rating: poi.rating,
    distance: poi.distance,
    description: poi.description,
    source: 'opentripmap' as const,
    bucket: classifyToBucket([poi.category])
  })) || [];
}

/**
 * Remove duplicate items based on name and location proximity
 */
function deduplicateItems(items: SearchItem[]): SearchItem[] {
  const unique: SearchItem[] = [];
  const seen = new Set<string>();

  for (const item of items) {
    // Create key based on name and approximate location
    const locationKey = `${Math.round(item.location.lat * 1000)},${Math.round(item.location.lng * 1000)}`;
    const nameKey = item.name.toLowerCase().replace(/\s+/g, '_');
    const key = `${nameKey}_${locationKey}`;

    if (!seen.has(key)) {
      seen.add(key);
      unique.push(item);
    }
  }

  return unique;
}

/**
 * Classify item to experience bucket
 */
function classifyToBucket(types: string[]): string {
  if (!types || types.length === 0) return 'nature';

  // Trails & Outdoor
  if (types.some(t => ['park', 'trail', 'natural_feature'].includes(t))) {
    return 'trails';
  }

  // Adrenaline & Sports
  if (types.some(t => ['amusement_park', 'stadium', 'gym', 'bowling_alley'].includes(t))) {
    return 'adrenaline';
  }

  // Culture & Arts
  if (types.some(t => ['museum', 'art_gallery', 'library', 'church', 'synagogue'].includes(t))) {
    return 'culture';
  }

  // Wellness & Relaxation
  if (types.some(t => ['spa', 'beauty_salon'].includes(t))) {
    return 'wellness';
  }

  // Nightlife & Social
  if (types.some(t => ['night_club', 'bar', 'casino'].includes(t))) {
    return 'nightlife';
  }

  // Default to nature
  return 'nature';
}

/**
 * Calculate distance between two points in kilometers
 */
function calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLng/2) * Math.sin(dLng/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}
