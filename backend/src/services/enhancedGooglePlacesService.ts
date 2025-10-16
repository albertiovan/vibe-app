/**
 * Enhanced Google Places Service
 * Uses the new orchestrator and details fetcher for activity-focused results
 */

import { UserVibe, VibePlace, VibeMatch } from '../types/vibe.js';
import { PlacesOrchestrator, RawPlaceResult } from './placesOrchestrator.js';
import { PlaceDetailsFetcher, DetailedPlace } from './placeDetailsFetcher.js';
import { features } from '../config/features.js';
import { PLACES_CONFIG, hasFoodType, hasActivityType } from '../config/places.types.js';

export class EnhancedGooglePlacesService {
  private orchestrator: PlacesOrchestrator;
  private detailsFetcher: PlaceDetailsFetcher;
  private apiKey: string;

  constructor() {
    this.apiKey = process.env.GOOGLE_MAPS_API_KEY || '';
    if (!this.apiKey) {
      throw new Error('Google Maps API key not configured');
    }
    
    this.orchestrator = new PlacesOrchestrator(this.apiKey);
    this.detailsFetcher = new PlaceDetailsFetcher(this.apiKey);
    
    console.log('🗺️ Enhanced Google Places Service initialized');
    console.log('🎯 Activities-first mode:', features.activitiesFirst ? 'enabled' : 'disabled');
  }

  /**
   * Main method: Find experiences based on user's vibe with activity focus
   */
  async findExperiencesByVibe(vibe: UserVibe): Promise<VibeMatch> {
    try {
      console.log('🎭 Finding experiences for vibe:', vibe);
      
      // 1. Prepare search location
      const location = {
        lat: vibe.location?.lat || 44.4268, // Default to Bucharest
        lng: vibe.location?.lng || 26.1025,
        radius: (vibe.location?.radius || 10) * 1000, // Convert km to meters
        city: 'Bucharest, Romania' // TODO: Make this dynamic
      };

      // 2. Determine search options based on vibe and feature flags
      const searchOptions = {
        includeFoodTypes: this.shouldIncludeFoodTypes(vibe),
        maxResults: 20,
        minRating: this.getMinRating(vibe),
        prioritizeActivities: features.activitiesFirst
      };

      console.log('🔍 Search options:', searchOptions);

      // 3. Run multi-query orchestration
      const rawResults = await this.orchestrator.searchActivities(location, searchOptions);
      
      if (rawResults.length === 0) {
        console.warn('⚠️ No raw results found');
        return this.createEmptyMatch(vibe);
      }

      // 4. Fetch detailed information for top results
      const topResults = rawResults.slice(0, 15); // Limit for details fetching
      const placeIds = topResults.map(place => place.place_id);
      
      console.log(`📋 Fetching details for ${placeIds.length} places`);
      
      const detailsResponse = await this.detailsFetcher.fetchWithFallback(placeIds, {
        userLocation: { lat: location.lat, lng: location.lng },
        minSuccessRate: 0.6
      });

      // 5. Convert to vibe places and score them
      const vibePlaces = await this.convertToVibePlaces(
        detailsResponse.results.filter(p => p.fetch_success),
        vibe,
        location
      );

      // 6. Apply final vibe-based filtering and sorting
      const filteredPlaces = this.applyVibeFilters(vibePlaces, vibe);
      const finalPlaces = filteredPlaces.slice(0, 10);

      // 7. Generate analysis and suggestions
      const vibeAnalysis = this.generateVibeAnalysis(vibe, finalPlaces, rawResults.length);
      const suggestions = this.generateSuggestions(vibe, finalPlaces);

      console.log(`✅ Returning ${finalPlaces.length} vibe-matched places`);

      return {
        places: finalPlaces,
        totalFound: rawResults.length,
        vibeAnalysis,
        suggestions
      };

    } catch (error) {
      console.error('❌ Enhanced Google Places vibe search error:', error);
      throw error;
    }
  }

  /**
   * Determine if food types should be included based on vibe
   */
  private shouldIncludeFoodTypes(vibe: UserVibe): boolean {
    // Include food if explicitly mentioned in description
    if (vibe.description) {
      const foodKeywords = ['eat', 'food', 'restaurant', 'cafe', 'drink', 'bar', 'dining'];
      const hasFood = foodKeywords.some(keyword => 
        vibe.description!.toLowerCase().includes(keyword)
      );
      if (hasFood) return true;
    }

    // Include food for social vibes during meal times
    if (vibe.social !== 'alone' && vibe.timeOfDay) {
      const mealTimes = ['morning', 'afternoon', 'evening'];
      if (mealTimes.includes(vibe.timeOfDay)) return true;
    }

    // Default: prioritize activities over food
    return !features.activitiesFirst;
  }

  /**
   * Get minimum rating threshold based on vibe
   */
  private getMinRating(vibe: UserVibe): number {
    // Higher standards for splurge budget
    if (vibe.budget === 'splurge') return 4.0;
    
    // Lower threshold for adventurous mood (willing to try new places)
    if (vibe.mood === 'adventurous') return 3.5;
    
    // Default good quality threshold
    return 3.8;
  }

  /**
   * Convert detailed places to vibe places with scoring
   */
  private async convertToVibePlaces(
    detailedPlaces: DetailedPlace[],
    vibe: UserVibe,
    location: { lat: number; lng: number }
  ): Promise<VibePlace[]> {
    return detailedPlaces.map(place => {
      const vibePlace: VibePlace = {
        placeId: place.place_id,
        name: place.name,
        types: place.types,
        rating: place.rating,
        userRatingsTotal: place.user_ratings_total,
        priceLevel: this.inferPriceLevel(place.types),
        vicinity: place.formatted_address || place.vicinity,
        geometry: place.geometry,
        photos: place.photos,
        openingHours: place.opening_hours ? {
          openNow: place.opening_hours.open_now,
          weekdayText: place.opening_hours.weekday_text
        } : undefined,
        
        // Enhanced vibe-specific data
        vibeScore: this.calculateEnhancedVibeScore(place, vibe),
        vibeReasons: this.generateEnhancedVibeReasons(place, vibe),
        estimatedDuration: this.estimateActivityDuration(place, vibe),
        energyLevel: this.inferEnergyLevel(place),
        socialLevel: this.inferSocialLevel(place),
        walkingTime: place.distance_meters ? Math.round(place.distance_meters / 83) : undefined, // 5km/h = 83m/min
        vibeCategories: this.categorizePlace(place)
      };
      
      return vibePlace;
    });
  }

  /**
   * Enhanced vibe scoring that considers activity types
   */
  private calculateEnhancedVibeScore(place: DetailedPlace, vibe: UserVibe): number {
    let score = 0;
    let factors = 0;

    // Major boost for activity types when prioritizing activities
    if (features.activitiesFirst && hasActivityType(place.types)) {
      score += 0.4;
      factors += 0.4;
    }

    // Penalty for food types when prioritizing activities
    if (features.activitiesFirst && hasFoodType(place.types)) {
      score -= 0.2;
    }

    // Energy level compatibility
    const placeEnergyLevel = this.inferEnergyLevel(place);
    if (placeEnergyLevel === vibe.energy) {
      score += 0.25;
    } else if (Math.abs(['low', 'medium', 'high'].indexOf(placeEnergyLevel) - ['low', 'medium', 'high'].indexOf(vibe.energy)) === 1) {
      score += 0.15;
    }
    factors += 0.25;

    // Social compatibility
    const placeSocialLevel = this.inferSocialLevel(place);
    const socialCompatibility = this.getSocialCompatibility(placeSocialLevel, vibe.social);
    score += socialCompatibility * 0.2;
    factors += 0.2;

    // Quality boost
    if (place.rating && place.rating >= 4.0) {
      score += 0.15;
    }
    factors += 0.15;

    return Math.max(0, Math.min(1, score / Math.max(factors, 1)));
  }

  /**
   * Generate enhanced vibe reasons considering activity focus
   */
  private generateEnhancedVibeReasons(place: DetailedPlace, vibe: UserVibe): string[] {
    const reasons: string[] = [];

    // Activity-specific reasons
    if (hasActivityType(place.types)) {
      const activityType = place.types.find(type => 
        ['museum', 'art_gallery', 'park', 'amusement_park', 'zoo', 'aquarium'].includes(type)
      );
      if (activityType) {
        reasons.push(`Perfect ${activityType.replace('_', ' ')} experience`);
      } else {
        reasons.push('Great activity destination');
      }
    }

    // Energy matching
    const placeEnergyLevel = this.inferEnergyLevel(place);
    if (placeEnergyLevel === vibe.energy) {
      reasons.push(`Matches your ${vibe.energy} energy vibe`);
    }

    // Quality indicators
    if (place.rating && place.rating >= 4.5) {
      reasons.push(`Highly rated (${place.rating}⭐)`);
    }

    // Practical benefits
    if (place.opening_hours?.open_now) {
      reasons.push('Open now');
    }

    if (place.distance_meters && place.distance_meters < 1000) {
      reasons.push('Very close by');
    }

    // Editorial summary insights
    if (place.editorial_summary?.overview) {
      const summary = place.editorial_summary.overview.toLowerCase();
      if (summary.includes('popular') || summary.includes('famous')) {
        reasons.push('Popular destination');
      }
      if (summary.includes('unique') || summary.includes('special')) {
        reasons.push('Unique experience');
      }
    }

    return reasons.slice(0, 3);
  }

  /**
   * Estimate duration for activities vs restaurants
   */
  private estimateActivityDuration(place: DetailedPlace, vibe: UserVibe): string {
    const types = place.types;
    
    // Activity-specific durations
    if (types.includes('museum') || types.includes('art_gallery')) {
      return vibe.timeAvailable === 'quick' ? '45-60 minutes' : '1-3 hours';
    }
    
    if (types.includes('park') || types.includes('zoo') || types.includes('aquarium')) {
      return vibe.timeAvailable === 'quick' ? '1 hour' : '2-4 hours';
    }
    
    if (types.includes('amusement_park')) {
      return 'Half to full day';
    }
    
    if (types.includes('movie_theater')) {
      return '2-3 hours';
    }
    
    if (types.includes('spa')) {
      return '1-2 hours';
    }

    // Food establishment durations
    if (hasFoodType(types)) {
      if (types.includes('cafe')) return '30-60 minutes';
      if (types.includes('restaurant')) return '1-2 hours';
      if (types.includes('bar')) return '1-3 hours';
    }

    // Default based on time available
    switch (vibe.timeAvailable) {
      case 'quick': return '30-45 minutes';
      case 'moderate': return '1-2 hours';
      case 'extended': return '2-4 hours';
      case 'all_day': return 'Half to full day';
      default: return '1-2 hours';
    }
  }

  /**
   * Categorize places for better vibe matching
   */
  private categorizePlace(place: DetailedPlace): string[] {
    const categories: string[] = [];
    const types = place.types;

    // Activity categories
    if (types.includes('museum') || types.includes('art_gallery')) {
      categories.push('cultural', 'educational', 'indoor');
    }
    if (types.includes('park')) {
      categories.push('nature', 'outdoor', 'relaxing');
    }
    if (types.includes('amusement_park') || types.includes('zoo')) {
      categories.push('family', 'fun', 'outdoor');
    }
    if (types.includes('spa')) {
      categories.push('wellness', 'relaxing', 'indoor');
    }
    if (types.includes('movie_theater')) {
      categories.push('entertainment', 'indoor', 'social');
    }

    // Food categories
    if (hasFoodType(types)) {
      categories.push('dining', 'social');
      if (types.includes('cafe')) categories.push('casual', 'work-friendly');
      if (types.includes('restaurant')) categories.push('meal', 'experience');
      if (types.includes('bar')) categories.push('nightlife', 'drinks');
    }

    return categories;
  }

  // Helper methods (reuse from original service with enhancements)
  private inferPriceLevel(types: string[]): number | undefined {
    // Infer price level from place types
    if (types.includes('spa') || types.includes('fine_dining')) return 4;
    if (types.includes('restaurant')) return 2;
    if (types.includes('cafe')) return 1;
    if (types.includes('park') || types.includes('library')) return 0;
    return undefined;
  }

  private inferEnergyLevel(place: DetailedPlace): 'low' | 'medium' | 'high' {
    const types = place.types;
    
    if (types.some(t => ['amusement_park', 'stadium', 'night_club', 'bowling_alley'].includes(t))) {
      return 'high';
    }
    if (types.some(t => ['spa', 'library', 'park', 'museum'].includes(t))) {
      return 'low';
    }
    return 'medium';
  }

  private inferSocialLevel(place: DetailedPlace): 'solitary' | 'intimate' | 'social' | 'crowded' {
    const types = place.types;
    
    if (types.some(t => ['stadium', 'amusement_park', 'night_club'].includes(t))) {
      return 'crowded';
    }
    if (types.some(t => ['restaurant', 'bar', 'bowling_alley'].includes(t))) {
      return 'social';
    }
    if (types.some(t => ['cafe', 'movie_theater', 'art_gallery'].includes(t))) {
      return 'intimate';
    }
    return 'solitary';
  }

  private getSocialCompatibility(placeLevel: string, vibeLevel: string): number {
    const compatibility: Record<string, Record<string, number>> = {
      'alone': { 'solitary': 1, 'intimate': 0.7, 'social': 0.3, 'crowded': 0.1 },
      'intimate': { 'solitary': 0.5, 'intimate': 1, 'social': 0.8, 'crowded': 0.2 },
      'small_group': { 'solitary': 0.2, 'intimate': 0.8, 'social': 1, 'crowded': 0.6 },
      'crowd': { 'solitary': 0.1, 'intimate': 0.2, 'social': 0.7, 'crowded': 1 }
    };
    
    return compatibility[vibeLevel]?.[placeLevel] || 0.5;
  }

  private applyVibeFilters(places: VibePlace[], vibe: UserVibe): VibePlace[] {
    return places
      .filter(place => (place.vibeScore || 0) > 0.2) // Minimum vibe compatibility
      .sort((a, b) => (b.vibeScore || 0) - (a.vibeScore || 0)); // Sort by vibe score
  }

  private generateVibeAnalysis(vibe: UserVibe, places: VibePlace[], totalFound: number) {
    const primaryVibe = `${vibe.energy} energy, ${vibe.social}, ${vibe.mood}`;
    const secondaryVibes = [vibe.budget, vibe.weatherPreference, vibe.timeAvailable];
    
    let matchingStrategy = features.activitiesFirst ? 
      'Activity-focused multi-query search' : 
      'Balanced activity and dining search';
    
    if (places.length === 0) {
      matchingStrategy = 'No matches found - try adjusting preferences';
    } else if (places.length < 3) {
      matchingStrategy = 'Limited matches - consider expanding search criteria';
    }
    
    const avgScore = places.reduce((sum, place) => sum + (place.vibeScore || 0), 0) / places.length;
    
    return {
      primaryVibe,
      secondaryVibes,
      matchingStrategy,
      confidence: avgScore || 0
    };
  }

  private generateSuggestions(vibe: UserVibe, places: VibePlace[]) {
    const suggestions: any = {};
    
    // Activity-specific suggestions
    const activityPlaces = places.filter(p => hasActivityType(p.types));
    const foodPlaces = places.filter(p => hasFoodType(p.types));
    
    if (activityPlaces.length > foodPlaces.length) {
      suggestions.focus = 'Great activity options found - perfect for exploration';
    }
    
    if (vibe.timeAvailable === 'quick' && places.some(p => p.estimatedDuration?.includes('hour'))) {
      suggestions.timeOptimization = 'Consider shorter activities like cafes or quick visits';
    }
    
    if (vibe.budget === 'free' && places.length < 5) {
      suggestions.budgetTips = 'Try parks, libraries, or free cultural sites for more options';
    }
    
    return suggestions;
  }

  private createEmptyMatch(vibe: UserVibe): VibeMatch {
    return {
      places: [],
      totalFound: 0,
      vibeAnalysis: {
        primaryVibe: `${vibe.energy} energy, ${vibe.social}, ${vibe.mood}`,
        secondaryVibes: [vibe.budget, vibe.weatherPreference || 'any', vibe.timeAvailable],
        matchingStrategy: 'No results found',
        confidence: 0
      },
      suggestions: {
        timeOptimization: 'Try expanding your search radius or adjusting preferences'
      }
    };
  }
}

// Export singleton instance
let _enhancedGooglePlacesService: EnhancedGooglePlacesService | null = null;

export const enhancedGooglePlacesService = {
  getInstance(): EnhancedGooglePlacesService {
    if (!_enhancedGooglePlacesService) {
      _enhancedGooglePlacesService = new EnhancedGooglePlacesService();
    }
    return _enhancedGooglePlacesService;
  },
  
  async findExperiencesByVibe(vibe: UserVibe) {
    return this.getInstance().findExperiencesByVibe(vibe);
  }
};
