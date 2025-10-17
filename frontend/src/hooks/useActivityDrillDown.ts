/**
 * Activity Drill-Down Hook
 * Fetches related trails, venues, and operators for detailed activity view
 */

import { useState, useCallback, useRef } from 'react';
import { ExperienceCard } from './useVibeSearchPipeline';

export interface TrailData {
  id: string;
  name: string;
  type: 'hiking' | 'mtb' | 'cycling' | 'ski';
  difficulty: 'easy' | 'moderate' | 'difficult' | 'expert';
  distance?: number; // km
  elevation?: number; // meters
  surface?: string;
  description?: string;
  location: {
    lat: number;
    lng: number;
  };
}

export interface VenueData {
  id: string;
  name: string;
  types: string[];
  rating?: number;
  priceLevel?: number;
  address?: string;
  description?: string;
  distance?: number;
  location: {
    lat: number;
    lng: number;
  };
  photos?: Array<{ url: string }>;
}

export interface OperatorData {
  id: string;
  name: string;
  rating?: number;
  services?: string[];
  phone?: string;
  website?: string;
  hours?: string;
  address?: string;
  distance?: number;
  location: {
    lat: number;
    lng: number;
  };
}

export interface DrillDownState {
  trails: TrailData[];
  venues: VenueData[];
  operators: OperatorData[];
  loading: boolean;
  error: string | null;
}

/**
 * Hook for managing activity drill-down data
 */
export function useActivityDrillDown() {
  const [state, setState] = useState<DrillDownState>({
    trails: [],
    venues: [],
    operators: [],
    loading: false,
    error: null
  });

  const abortControllerRef = useRef<AbortController | null>(null);

  /**
   * Search for related content based on the selected experience card
   */
  const searchRelated = useCallback(async (card: ExperienceCard): Promise<void> => {
    // Cancel any ongoing search
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    setState(prev => ({
      ...prev,
      loading: true,
      error: null
    }));

    try {
      console.log('🔍 Searching related content for:', card.title);

      const searchPromises: Promise<any>[] = [];

      // Search based on drill-down data type
      if (card.drillDownData.type === 'trails' || card.drillDownData.type === 'mixed') {
        searchPromises.push(searchTrails(card, abortController.signal));
      } else {
        searchPromises.push(Promise.resolve([]));
      }

      // Always search for venues
      searchPromises.push(searchVenues(card, abortController.signal));

      // Search for operators/services
      if (card.bucket === 'adrenaline' || card.bucket === 'trails') {
        searchPromises.push(searchOperators(card, abortController.signal));
      } else {
        searchPromises.push(Promise.resolve([]));
      }

      const [trails, venues, operators] = await Promise.all(searchPromises);

      if (abortController.signal.aborted) return;

      setState(prev => ({
        ...prev,
        trails: trails || [],
        venues: venues || [],
        operators: operators || [],
        loading: false
      }));

      console.log('✅ Related content loaded:', {
        trails: trails?.length || 0,
        venues: venues?.length || 0,
        operators: operators?.length || 0
      });

    } catch (error) {
      console.error('❌ Related content search failed:', error);
      
      if (!abortController.signal.aborted) {
        setState(prev => ({
          ...prev,
          loading: false,
          error: error instanceof Error ? error.message : 'Failed to load related content'
        }));
      }
    }
  }, []);

  /**
   * Clear all results
   */
  const clearResults = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    setState({
      trails: [],
      venues: [],
      operators: [],
      loading: false,
      error: null
    });
  }, []);

  return {
    ...state,
    searchRelated,
    clearResults
  };
}

/**
 * Search for trails near the activity
 */
async function searchTrails(card: ExperienceCard, signal: AbortSignal): Promise<TrailData[]> {
  try {
    const params = new URLSearchParams({
      lat: card.location.lat.toString(),
      lng: card.location.lng.toString(),
      radius: '10', // 10km radius
      types: getTrailTypes(card.bucket).join(',')
    });

    const response = await fetch(`/api/trails/search?${params}`, { signal });

    if (!response.ok) {
      throw new Error(`Trails search failed: ${response.statusText}`);
    }

    const data = await response.json();
    
    return data.trails?.map((trail: any) => ({
      id: trail.id,
      name: trail.name || 'Unnamed Trail',
      type: trail.type || 'hiking',
      difficulty: trail.difficulty || 'moderate',
      distance: trail.distance,
      elevation: trail.elevation,
      surface: trail.surface,
      description: trail.description,
      location: {
        lat: trail.location.lat,
        lng: trail.location.lng
      }
    })) || [];
  } catch (error) {
    console.warn('Trails search failed:', error);
    return [];
  }
}

/**
 * Search for venues related to the activity
 */
async function searchVenues(card: ExperienceCard, signal: AbortSignal): Promise<VenueData[]> {
  try {
    const searchTerms = [
      ...card.drillDownData.searchTerms,
      card.title.split(' ').slice(0, 2).join(' ') // First two words of title
    ];

    const params = new URLSearchParams({
      lat: card.location.lat.toString(),
      lng: card.location.lng.toString(),
      radius: '15000', // 15km radius in meters
      query: searchTerms.join(' '),
      types: getVenueTypes(card.bucket).join(',')
    });

    const response = await fetch(`/api/places/search?${params}`, { signal });

    if (!response.ok) {
      throw new Error(`Venues search failed: ${response.statusText}`);
    }

    const data = await response.json();
    
    return data.places?.map((place: any) => ({
      id: place.place_id,
      name: place.name,
      types: place.types || [],
      rating: place.rating,
      priceLevel: place.price_level,
      address: place.formatted_address,
      description: place.editorial_summary?.overview,
      distance: calculateDistance(
        card.location.lat,
        card.location.lng,
        place.geometry?.location?.lat || card.location.lat,
        place.geometry?.location?.lng || card.location.lng
      ),
      location: {
        lat: place.geometry?.location?.lat || card.location.lat,
        lng: place.geometry?.location?.lng || card.location.lng
      },
      photos: place.photos?.slice(0, 3).map((photo: any) => ({
        url: `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${photo.photo_reference}&key=${process.env.REACT_APP_GOOGLE_MAPS_API_KEY}`
      }))
    })).filter((venue: VenueData) => venue.id !== card.id) || []; // Exclude the original card
  } catch (error) {
    console.warn('Venues search failed:', error);
    return [];
  }
}

/**
 * Search for operators and service providers
 */
async function searchOperators(card: ExperienceCard, signal: AbortSignal): Promise<OperatorData[]> {
  try {
    const operatorTerms = getOperatorSearchTerms(card.bucket);
    
    const params = new URLSearchParams({
      lat: card.location.lat.toString(),
      lng: card.location.lng.toString(),
      radius: '20000', // 20km radius in meters
      query: operatorTerms.join(' '),
      types: 'store,establishment'
    });

    const response = await fetch(`/api/places/search?${params}`, { signal });

    if (!response.ok) {
      throw new Error(`Operators search failed: ${response.statusText}`);
    }

    const data = await response.json();
    
    return data.places?.map((place: any) => ({
      id: place.place_id,
      name: place.name,
      rating: place.rating,
      services: extractServices(place.name, place.types),
      phone: place.formatted_phone_number,
      website: place.website,
      hours: place.opening_hours?.weekday_text?.[new Date().getDay()],
      address: place.formatted_address,
      distance: calculateDistance(
        card.location.lat,
        card.location.lng,
        place.geometry?.location?.lat || card.location.lat,
        place.geometry?.location?.lng || card.location.lng
      ),
      location: {
        lat: place.geometry?.location?.lat || card.location.lat,
        lng: place.geometry?.location?.lng || card.location.lng
      }
    })) || [];
  } catch (error) {
    console.warn('Operators search failed:', error);
    return [];
  }
}

/**
 * Get trail types based on experience bucket
 */
function getTrailTypes(bucket: string): string[] {
  switch (bucket) {
    case 'trails':
      return ['hiking', 'mtb', 'cycling'];
    case 'adrenaline':
      return ['mtb', 'cycling'];
    case 'nature':
      return ['hiking'];
    default:
      return ['hiking'];
  }
}

/**
 * Get venue types based on experience bucket
 */
function getVenueTypes(bucket: string): string[] {
  switch (bucket) {
    case 'trails':
      return ['park', 'tourist_attraction', 'natural_feature'];
    case 'adrenaline':
      return ['amusement_park', 'stadium', 'tourist_attraction'];
    case 'nature':
      return ['park', 'zoo', 'aquarium', 'botanical_garden'];
    case 'culture':
      return ['museum', 'art_gallery', 'library', 'church'];
    case 'wellness':
      return ['spa', 'beauty_salon', 'gym'];
    case 'nightlife':
      return ['night_club', 'bar', 'casino'];
    default:
      return ['tourist_attraction'];
  }
}

/**
 * Get operator search terms based on experience bucket
 */
function getOperatorSearchTerms(bucket: string): string[] {
  switch (bucket) {
    case 'trails':
      return ['bike rental', 'hiking gear', 'outdoor equipment', 'trail guides'];
    case 'adrenaline':
      return ['adventure tours', 'equipment rental', 'extreme sports', 'activity operators'];
    case 'nature':
      return ['nature tours', 'wildlife guides', 'eco tours'];
    case 'culture':
      return ['cultural tours', 'art supplies', 'museum shop'];
    case 'wellness':
      return ['wellness center', 'spa services', 'massage therapy'];
    case 'nightlife':
      return ['entertainment', 'event venues', 'nightlife'];
    default:
      return ['tours', 'services'];
  }
}

/**
 * Extract services from place name and types
 */
function extractServices(name: string, types: string[]): string[] {
  const services: string[] = [];
  const nameLower = name.toLowerCase();
  
  // Common service keywords
  const serviceMap: Record<string, string> = {
    'rental': 'Equipment Rental',
    'rent': 'Equipment Rental',
    'tour': 'Guided Tours',
    'guide': 'Tour Guide',
    'lesson': 'Lessons',
    'school': 'Training',
    'shop': 'Retail',
    'store': 'Retail',
    'repair': 'Repair Services',
    'service': 'Services'
  };

  // Extract from name
  Object.entries(serviceMap).forEach(([keyword, service]) => {
    if (nameLower.includes(keyword)) {
      services.push(service);
    }
  });

  // Extract from types
  if (types.includes('bicycle_store')) services.push('Bike Sales & Rental');
  if (types.includes('gym')) services.push('Fitness Training');
  if (types.includes('spa')) services.push('Spa Services');
  if (types.includes('travel_agency')) services.push('Tour Booking');

  return [...new Set(services)]; // Remove duplicates
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
