/**
 * Complete Vibe Search Pipeline Hook
 * Orchestrates: location → weather → vibe parsing → provider search → LLM curation → 5 cards
 */

import { useState, useCallback, useRef } from 'react';
import { parseVibeToFilterSpec } from '../services/llm/vibeParser';
import { searchProviders } from '../services/providers/orchestrator';
import { curateTopFive } from '../services/llm/curation';
import { getCurrentLocation, getWeatherData } from '../services/location';
import { ExperienceBucket } from '../types/experiences';

export interface ExperienceCard {
  id: string;
  title: string;
  description: string;
  bucket: ExperienceBucket;
  location: {
    lat: number;
    lng: number;
    address?: string;
  };
  rating?: number;
  distance?: number; // km
  travelTime?: number; // minutes
  weatherSuitability: number; // 0-1
  imageUrl?: string;
  priceLevel?: number;
  highlights: string[];
  drillDownData: {
    type: 'trails' | 'venues' | 'mixed';
    relatedIds: string[];
    searchTerms: string[];
  };
}

export interface PipelineState {
  cards: ExperienceCard[];
  loading: boolean;
  error: string | null;
  weather: {
    temperature: number;
    conditions: string;
    recommendation: 'indoor' | 'covered' | 'outdoor';
  } | null;
  location: {
    lat: number;
    lng: number;
    city?: string;
  } | null;
  telemetry: {
    weatherGatingApplied: boolean;
    fallbacksTriggered: string[];
    constraintsRelaxed: number;
    totalResults: number;
    processingTime: number;
  };
}

export interface SearchOptions {
  radiusKm?: number;
  maxTravelMinutes?: number;
  forceRefresh?: boolean;
  enableWeatherGating?: boolean;
}

/**
 * Main pipeline hook orchestrating the complete vibe → 5 cards flow
 */
export function useVibeSearchPipeline() {
  const [state, setState] = useState<PipelineState>({
    cards: [],
    loading: false,
    error: null,
    weather: null,
    location: null,
    telemetry: {
      weatherGatingApplied: false,
      fallbacksTriggered: [],
      constraintsRelaxed: 0,
      totalResults: 0,
      processingTime: 0
    }
  });

  const abortControllerRef = useRef<AbortController | null>(null);

  /**
   * Execute the complete vibe search pipeline
   */
  const searchExperiences = useCallback(async (
    vibe: string,
    options: SearchOptions = {}
  ): Promise<void> => {
    const startTime = Date.now();
    
    // Cancel any ongoing search
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    
    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    setState(prev => ({
      ...prev,
      loading: true,
      error: null,
      telemetry: {
        weatherGatingApplied: false,
        fallbacksTriggered: [],
        constraintsRelaxed: 0,
        totalResults: 0,
        processingTime: 0
      }
    }));

    try {
      console.log('🚀 Starting vibe search pipeline:', { vibe, options });

      // Step 1: Get current location
      console.log('📍 Step 1: Getting location...');
      const location = await getCurrentLocation({
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 5 * 60 * 1000 // 5 minutes
      });

      if (abortController.signal.aborted) return;

      setState(prev => ({ ...prev, location }));

      // Step 2: Get weather data
      console.log('🌤️ Step 2: Getting weather...');
      const weather = options.enableWeatherGating !== false 
        ? await getWeatherData(location.lat, location.lng)
        : null;

      if (abortController.signal.aborted) return;

      setState(prev => ({ ...prev, weather }));

      // Step 3: Parse vibe to filter spec
      console.log('🧠 Step 3: Parsing vibe...');
      const filterSpec = await parseVibeToFilterSpec(vibe, {
        location,
        weather,
        radiusKm: options.radiusKm || 15,
        maxTravelMinutes: options.maxTravelMinutes || 60
      });

      if (abortController.signal.aborted) return;

      // Step 4: Search providers with progressive relaxation
      console.log('🔍 Step 4: Searching providers...');
      const searchResults = await searchProvidersWithRelaxation(
        filterSpec,
        location,
        weather,
        abortController.signal
      );

      if (abortController.signal.aborted) return;

      // Step 5: LLM curation to exactly 5 cards
      console.log('🎯 Step 5: Curating top 5...');
      const curation = await curateTopFive({
        items: searchResults.items,
        filterSpec,
        weather,
        context: {
          timeOfDay: getTimeOfDay(),
          userPreferences: extractPreferencesFromVibe(vibe)
        }
      });

      if (abortController.signal.aborted) return;

      // Step 6: Transform to experience cards
      console.log('🎨 Step 6: Creating experience cards...');
      const cards = await transformToExperienceCards(
        curation,
        searchResults.items,
        location,
        weather
      );

      const processingTime = Date.now() - startTime;

      setState(prev => ({
        ...prev,
        cards,
        loading: false,
        telemetry: {
          weatherGatingApplied: searchResults.weatherGatingApplied,
          fallbacksTriggered: searchResults.fallbacksTriggered,
          constraintsRelaxed: searchResults.constraintsRelaxed,
          totalResults: searchResults.totalResults,
          processingTime
        }
      }));

      console.log('✅ Pipeline completed:', {
        cards: cards.length,
        processingTime,
        telemetry: state.telemetry
      });

    } catch (error) {
      console.error('❌ Pipeline error:', error);
      
      if (!abortController.signal.aborted) {
        setState(prev => ({
          ...prev,
          loading: false,
          error: error instanceof Error ? error.message : 'Search failed',
          telemetry: {
            ...prev.telemetry,
            processingTime: Date.now() - startTime,
            fallbacksTriggered: [...prev.telemetry.fallbacksTriggered, 'pipeline_error']
          }
        }));
      }
    }
  }, []);

  /**
   * Clear search results
   */
  const clearResults = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    
    setState({
      cards: [],
      loading: false,
      error: null,
      weather: null,
      location: null,
      telemetry: {
        weatherGatingApplied: false,
        fallbacksTriggered: [],
        constraintsRelaxed: 0,
        totalResults: 0,
        processingTime: 0
      }
    });
  }, []);

  /**
   * Retry search with relaxed constraints
   */
  const retryWithRelaxedConstraints = useCallback(async (vibe: string) => {
    const relaxedOptions: SearchOptions = {
      radiusKm: 25, // Increase radius
      maxTravelMinutes: 90, // Increase travel time
      enableWeatherGating: false // Disable weather filtering
    };

    await searchExperiences(vibe, relaxedOptions);
  }, [searchExperiences]);

  return {
    ...state,
    searchExperiences,
    clearResults,
    retryWithRelaxedConstraints,
    isSearching: state.loading
  };
}

/**
 * Search providers with progressive constraint relaxation
 */
async function searchProvidersWithRelaxation(
  filterSpec: any,
  location: any,
  weather: any,
  signal: AbortSignal
): Promise<{
  items: any[];
  weatherGatingApplied: boolean;
  fallbacksTriggered: string[];
  constraintsRelaxed: number;
  totalResults: number;
}> {
  const fallbacksTriggered: string[] = [];
  let constraintsRelaxed = 0;
  let weatherGatingApplied = false;

  // Initial search
  let searchResults = await searchProviders({
    filterSpec,
    location,
    weather,
    signal
  });

  let totalResults = searchResults.length;

  // Apply weather gating if enabled
  if (weather && searchResults.length > 0) {
    const originalCount = searchResults.length;
    searchResults = applyWeatherGating(searchResults, weather);
    
    if (searchResults.length < originalCount) {
      weatherGatingApplied = true;
      console.log(`🌧️ Weather gating: ${originalCount} → ${searchResults.length} results`);
    }
  }

  // Progressive relaxation if we have < 5 results
  const relaxationSteps = [
    {
      name: 'radius_increase',
      apply: (spec: any) => ({ ...spec, radiusKm: spec.radiusKm * 1.5 })
    },
    {
      name: 'rating_decrease',
      apply: (spec: any) => ({ ...spec, minRating: Math.max(3.0, spec.minRating - 0.5) })
    },
    {
      name: 'travel_time_increase',
      apply: (spec: any) => ({ ...spec, maxTravelMinutes: spec.maxTravelMinutes * 1.5 })
    },
    {
      name: 'disable_weather_gating',
      apply: (spec: any) => spec // Weather gating disabled in this step
    }
  ];

  for (const step of relaxationSteps) {
    if (signal.aborted) break;
    
    if (searchResults.length >= 5) break;

    console.log(`🔄 Relaxing constraints: ${step.name}`);
    constraintsRelaxed++;
    fallbacksTriggered.push(step.name);

    const relaxedSpec = step.apply(filterSpec);
    const additionalResults = await searchProviders({
      filterSpec: relaxedSpec,
      location,
      weather: step.name === 'disable_weather_gating' ? null : weather,
      signal
    });

    // Merge results, avoiding duplicates
    const existingIds = new Set(searchResults.map(r => r.id));
    const newResults = additionalResults.filter(r => !existingIds.has(r.id));
    
    searchResults = [...searchResults, ...newResults];
    totalResults += additionalResults.length;

    console.log(`📈 After ${step.name}: ${searchResults.length} total results`);
  }

  return {
    items: searchResults,
    weatherGatingApplied,
    fallbacksTriggered,
    constraintsRelaxed,
    totalResults
  };
}

/**
 * Apply weather-based filtering to results
 */
function applyWeatherGating(results: any[], weather: any): any[] {
  if (!weather || weather.recommendation === 'outdoor') {
    return results;
  }

  // Filter based on weather recommendation
  return results.filter(result => {
    const isIndoor = result.types?.some((type: string) => 
      ['museum', 'art_gallery', 'shopping_mall', 'spa', 'gym', 'library'].includes(type)
    );
    
    const isCovered = result.types?.some((type: string) => 
      ['restaurant', 'cafe', 'bar', 'church', 'synagogue'].includes(type)
    );

    if (weather.recommendation === 'indoor') {
      return isIndoor;
    } else if (weather.recommendation === 'covered') {
      return isIndoor || isCovered;
    }

    return true;
  });
}

/**
 * Transform curation results to experience cards
 */
async function transformToExperienceCards(
  curation: any,
  allItems: any[],
  location: any,
  weather: any
): Promise<ExperienceCard[]> {
  const cards: ExperienceCard[] = [];

  for (const summary of curation.summaries) {
    const item = allItems.find(i => i.id === summary.id);
    if (!item) continue;

    const card: ExperienceCard = {
      id: item.id,
      title: item.name,
      description: summary.blurb,
      bucket: summary.bucket || 'nature',
      location: {
        lat: item.location?.lat || location.lat,
        lng: item.location?.lng || location.lng,
        address: item.address
      },
      rating: item.rating,
      distance: item.distance,
      travelTime: estimateTravelTime(item.distance),
      weatherSuitability: calculateWeatherSuitability(item, weather),
      imageUrl: item.photos?.[0]?.url,
      priceLevel: item.priceLevel,
      highlights: summary.highlights || extractHighlights(item),
      drillDownData: generateDrillDownData(item, summary.bucket)
    };

    cards.push(card);
  }

  return cards;
}

/**
 * Generate drill-down data for detailed view
 */
function generateDrillDownData(item: any, bucket: ExperienceBucket): ExperienceCard['drillDownData'] {
  const searchTerms: string[] = [];
  let type: 'trails' | 'venues' | 'mixed' = 'venues';

  if (bucket === 'trails') {
    type = 'trails';
    searchTerms.push('hiking trails', 'mountain biking', 'cycling routes');
  } else if (bucket === 'adrenaline') {
    type = 'mixed';
    searchTerms.push('adventure sports', 'outdoor activities', 'equipment rental');
  } else if (bucket === 'nature') {
    type = 'venues';
    searchTerms.push('nature reserves', 'parks', 'botanical gardens');
  } else {
    type = 'venues';
    searchTerms.push(item.name, item.types?.[0] || 'attractions');
  }

  return {
    type,
    relatedIds: [item.id],
    searchTerms
  };
}

/**
 * Utility functions
 */
function getTimeOfDay(): 'morning' | 'afternoon' | 'evening' {
  const hour = new Date().getHours();
  if (hour < 12) return 'morning';
  if (hour < 18) return 'afternoon';
  return 'evening';
}

function extractPreferencesFromVibe(vibe: string): string[] {
  const preferences: string[] = [];
  const text = vibe.toLowerCase();
  
  if (text.includes('outdoor') || text.includes('nature')) preferences.push('outdoor');
  if (text.includes('adventure') || text.includes('thrill')) preferences.push('adventure');
  if (text.includes('relax') || text.includes('calm')) preferences.push('relaxation');
  if (text.includes('culture') || text.includes('art')) preferences.push('culture');
  
  return preferences;
}

function estimateTravelTime(distance?: number): number | undefined {
  if (!distance) return undefined;
  // Rough estimate: 30 km/h average speed in city
  return Math.round(distance * 2);
}

function calculateWeatherSuitability(item: any, weather: any): number {
  if (!weather) return 1.0;

  const isIndoor = item.types?.some((type: string) => 
    ['museum', 'art_gallery', 'shopping_mall', 'spa'].includes(type)
  );

  if (isIndoor) return 1.0;

  // Outdoor suitability based on weather
  if (weather.recommendation === 'indoor') return 0.3;
  if (weather.recommendation === 'covered') return 0.6;
  return 1.0;
}

function extractHighlights(item: any): string[] {
  const highlights: string[] = [];
  
  if (item.rating && item.rating >= 4.5) highlights.push('Highly rated');
  if (item.priceLevel === 0) highlights.push('Free');
  if (item.distance && item.distance < 2) highlights.push('Nearby');
  
  return highlights.slice(0, 3);
}
