/**
 * Google Places Service
 * Experiences-first place discovery and curation service
 */

import { Client, PlaceInputType } from '@googlemaps/google-maps-services-js';
import { UserVibe, VibePlace, VibeMatch, VIBE_TO_GOOGLE_TYPES, GOOGLE_TYPES_TO_VIBE } from '../types/vibe.js';
import { diversifyResults, shouldEnableCulinary, FOOD_POLICY } from '../config/app.experiences.js';
import { features } from '../config/features.js';
import { OutdoorActivitiesOrchestrator } from './outdoor/orchestrator.js';
import { LocationService } from './location/index.js';
import { curateTopFive } from './llm/curation.js';
import { CurationInput } from '../schemas/curationSpec.js';

export class GooglePlacesService {
  private client: Client;
  private apiKey: string;

  constructor() {
    this.apiKey = process.env.GOOGLE_MAPS_API_KEY || '';
    if (!this.apiKey) {
      throw new Error('Google Maps API key not configured');
    }
    
    this.client = new Client({});
    console.log('🗺️ Google Places Service initialized');
  }

  /**
   * Main method: Find experiences based on user's vibe
   */
  async findExperiencesByVibe(vibe: UserVibe): Promise<VibeMatch> {
    try {
      console.log('🎭 Finding experiences for vibe:', vibe);
      
      // 1. Analyze vibe to determine search strategy
      const searchTypes = this.analyzeVibeToSearchTypes(vibe);
      const location = vibe.location || { lat: 44.4268, lng: 26.1025, radius: 10 }; // Default to Bucharest
      
      // 2. Search Google Places with multiple type queries
      const allPlaces = await this.searchMultipleTypes(location, searchTypes, vibe);
      
      // 3. Score and rank places based on vibe compatibility
      const scoredPlaces = this.scoreAndRankPlaces(allPlaces, vibe);
      
      // 4. Apply filters and limits
      const filteredPlaces = this.applyVibeFilters(scoredPlaces, vibe);
      
      // 5. Apply experiences-first diversity and cap at exactly 5 results
      const diversifiedPlaces = this.applyExperiencesDiversity(filteredPlaces, vibe);
      
      // 6. Generate insights and suggestions
      const vibeAnalysis = this.generateVibeAnalysis(vibe, diversifiedPlaces);
      
      return {
        places: diversifiedPlaces, // Exactly 5 diverse results
        totalFound: allPlaces.length,
        vibeAnalysis,
        suggestions: this.generateSuggestions(vibe, diversifiedPlaces)
      };
      
    } catch (error) {
      console.error('❌ Google Places vibe search error:', error);
      throw error;
    }
  }

  /**
   * Convert user vibe into Google Places search types
   */
  private analyzeVibeToSearchTypes(vibe: UserVibe): string[] {
    const types = new Set<string>();
    
    // PRIORITY: Use Claude's intelligent types if available
    if ((vibe as any).claudeTypes && Array.isArray((vibe as any).claudeTypes)) {
      console.log('🧠 Using Claude-parsed types:', (vibe as any).claudeTypes);
      (vibe as any).claudeTypes.forEach((type: string) => types.add(type));
      
      // For exercise/fitness, add additional comprehensive types
      if ((vibe as any).claudeKeywords && Array.isArray((vibe as any).claudeKeywords)) {
        const keywords = (vibe as any).claudeKeywords.join(' ').toLowerCase();
        if (keywords.includes('exercise') || keywords.includes('fitness') || keywords.includes('workout') || keywords.includes('sport')) {
          console.log('🏃‍♂️ Detected exercise request, adding comprehensive sports types');
          // Add all possible exercise-related types
          ['gym', 'stadium', 'park', 'tourist_attraction', 'bowling_alley', 'amusement_park', 'spa'].forEach(type => types.add(type));
        }
      }
      
      // If Claude provided types, use them (now expanded for exercise)
      if (types.size > 0) {
        return Array.from(types);
      }
    }
    
    console.log('🔄 Falling back to rule-based type mapping');
    
    // FALLBACK: Add types based on energy level
    const energyTypes = VIBE_TO_GOOGLE_TYPES[`${vibe.energy}_energy`] || [];
    energyTypes.forEach(type => types.add(type));
    
    // Add types based on social preference
    const socialTypes = VIBE_TO_GOOGLE_TYPES[vibe.social] || [];
    socialTypes.forEach(type => types.add(type));
    
    // Add types based on mood
    const moodTypes = VIBE_TO_GOOGLE_TYPES[vibe.mood] || [];
    moodTypes.forEach(type => types.add(type));
    
    // Add types based on budget
    const budgetTypes = VIBE_TO_GOOGLE_TYPES[vibe.budget] || [];
    budgetTypes.forEach(type => types.add(type));
    
    // Add types based on weather preference
    const weatherTypes = VIBE_TO_GOOGLE_TYPES[vibe.weatherPreference] || [];
    weatherTypes.forEach(type => types.add(type));
    
    // Add types based on time available
    const timeTypes = VIBE_TO_GOOGLE_TYPES[vibe.timeAvailable] || [];
    timeTypes.forEach(type => types.add(type));
    
    const result = Array.from(types);
    console.log('🔍 Search types for vibe:', result);
    return result;
  }

  /**
   * Search Google Places for multiple types
   */
  private async searchMultipleTypes(
    location: { lat: number; lng: number; radius?: number },
    types: string[],
    vibe: UserVibe
  ): Promise<any[]> {
    const allPlaces: any[] = [];
    const radius = (location.radius || 10) * 1000; // Convert km to meters
    const maxRadius = Math.min(radius, 50000); // Google Places max radius is 50km
    
    // First, try text search with Claude's keywords if available
    if ((vibe as any).claudeKeywords && Array.isArray((vibe as any).claudeKeywords)) {
      console.log('🔍 Performing text search with Claude keywords:', (vibe as any).claudeKeywords);
      await this.performTextSearch(location, (vibe as any).claudeKeywords, allPlaces, vibe);
    }
    
    // Then search for each type
    for (const type of types.slice(0, 5)) { // Limit to 5 types to avoid rate limits
      try {
        const response = await this.client.placesNearby({
          params: {
            location: { lat: location.lat, lng: location.lng },
            radius: maxRadius,
            type: type as any,
            key: this.apiKey,
            ...(vibe.budget !== 'free' && { minprice: this.budgetToPriceLevel(vibe.budget).min }),
            ...(vibe.budget !== 'splurge' && { maxprice: this.budgetToPriceLevel(vibe.budget).max }),
          }
        });
        
        if (response.data.results) {
          // Add type context to each place
          const placesWithType = response.data.results.map(place => ({
            ...place,
            searchType: type,
            vibeCategories: GOOGLE_TYPES_TO_VIBE[type] || []
          }));
          
          allPlaces.push(...placesWithType);
        }
        
        // Small delay to respect rate limits
        await new Promise(resolve => setTimeout(resolve, 100));
        
      } catch (error) {
        console.warn(`⚠️ Failed to search type ${type}:`, error);
      }
    }
    
    // Remove duplicates based on place_id
    const uniquePlaces = allPlaces.filter((place, index, self) => 
      index === self.findIndex(p => p.place_id === place.place_id)
    );
    
    console.log(`📍 Found ${uniquePlaces.length} unique places`);
    return uniquePlaces;
  }

  /**
   * Score places based on vibe compatibility
   */
  private scoreAndRankPlaces(places: any[], vibe: UserVibe): VibePlace[] {
    return places.map(place => {
      const vibePlace: VibePlace = {
        placeId: place.place_id,
        name: place.name,
        types: place.types || [],
        rating: place.rating,
        userRatingsTotal: place.user_ratings_total,
        priceLevel: place.price_level,
        vicinity: place.vicinity,
        geometry: place.geometry,
        photos: place.photos,
        openingHours: place.opening_hours,
        vibeCategories: place.vibeCategories || [],
        vibeScore: this.calculateVibeScore(place, vibe),
        vibeReasons: this.generateVibeReasons(place, vibe),
        estimatedDuration: this.estimateDuration(place, vibe),
        energyLevel: this.inferEnergyLevel(place),
        socialLevel: this.inferSocialLevel(place),
        walkingTime: this.calculateWalkingTime(place.geometry.location, vibe.location)
      };
      
      return vibePlace;
    }).sort((a, b) => (b.vibeScore || 0) - (a.vibeScore || 0));
  }

  /**
   * Calculate vibe compatibility score (0-1)
   */
  private calculateVibeScore(place: any, vibe: UserVibe): number {
    let score = 0;
    let factors = 0;
    
    // Energy level compatibility
    const placeEnergyLevel = this.inferEnergyLevel(place);
    if (placeEnergyLevel === vibe.energy) {
      score += 0.3;
    } else if (Math.abs(['low', 'medium', 'high'].indexOf(placeEnergyLevel) - ['low', 'medium', 'high'].indexOf(vibe.energy)) === 1) {
      score += 0.15;
    }
    factors += 0.3;
    
    // Social level compatibility
    const placeSocialLevel = this.inferSocialLevel(place);
    const socialCompatibility = this.getSocialCompatibility(placeSocialLevel, vibe.social);
    score += socialCompatibility * 0.25;
    factors += 0.25;
    
    // Mood compatibility based on place types
    const moodScore = this.getMoodCompatibility(place.types, vibe.mood);
    score += moodScore * 0.2;
    factors += 0.2;
    
    // Budget compatibility
    const budgetScore = this.getBudgetCompatibility(place.price_level, vibe.budget);
    score += budgetScore * 0.15;
    factors += 0.15;
    
    // Rating boost (quality factor)
    if (place.rating && place.rating >= 4.0) {
      score += 0.1;
    }
    factors += 0.1;
    
    return Math.min(score / factors, 1);
  }

  /**
   * Generate reasons why this place matches the vibe
   */
  private generateVibeReasons(place: any, vibe: UserVibe): string[] {
    const reasons: string[] = [];
    
    const placeEnergyLevel = this.inferEnergyLevel(place);
    if (placeEnergyLevel === vibe.energy) {
      reasons.push(`Perfect ${vibe.energy} energy match`);
    }
    
    const placeSocialLevel = this.inferSocialLevel(place);
    if (this.getSocialCompatibility(placeSocialLevel, vibe.social) > 0.7) {
      reasons.push(`Great for ${vibe.social} experiences`);
    }
    
    if (place.rating && place.rating >= 4.5) {
      reasons.push(`Highly rated (${place.rating}⭐)`);
    }
    
    if (vibe.budget === 'free' && (!place.price_level || place.price_level === 0)) {
      reasons.push('Free to visit');
    }
    
    if (place.opening_hours?.open_now) {
      reasons.push('Open now');
    }
    
    // Add type-specific reasons
    const typeReasons = this.getTypeSpecificReasons(place.types, vibe);
    reasons.push(...typeReasons);
    
    return reasons.slice(0, 3); // Limit to top 3 reasons
  }

  /**
   * Apply final filters based on vibe preferences
   */
  private applyVibeFilters(places: VibePlace[], vibe: UserVibe): VibePlace[] {
    let filtered = places;
    
    // Filter by opening hours if it's a time-sensitive search
    if (vibe.timeOfDay) {
      filtered = filtered.filter(place => {
        // For now, just check if open_now is available
        // In a full implementation, you'd check specific hours
        return !place.openingHours || place.openingHours.openNow !== false;
      });
    }
    
    // Filter by exploration preference
    if (vibe.exploration === 'new') {
      // Prefer places with fewer reviews (less discovered)
      filtered = filtered.filter(place => !place.userRatingsTotal || place.userRatingsTotal < 100);
    } else if (vibe.exploration === 'familiar') {
      // Prefer well-established places
      filtered = filtered.filter(place => place.userRatingsTotal && place.userRatingsTotal > 50);
    }
    
    // Filter by minimum vibe score
    filtered = filtered.filter(place => (place.vibeScore || 0) > 0.3);
    
    return filtered;
  }

  /**
   * Generate vibe analysis and insights
   */
  private generateVibeAnalysis(vibe: UserVibe, places: VibePlace[]) {
    const primaryVibe = `${vibe.energy} energy, ${vibe.social}, ${vibe.mood}`;
    const secondaryVibes = [vibe.budget, vibe.weatherPreference, vibe.timeAvailable];
    
    let matchingStrategy = 'Multi-factor vibe matching';
    if (places.length === 0) {
      matchingStrategy = 'No matches found - try adjusting preferences';
    } else if (places.length < 3) {
      matchingStrategy = 'Limited matches - consider expanding search radius';
    }
    
    const avgScore = places.reduce((sum, place) => sum + (place.vibeScore || 0), 0) / places.length;
    
    return {
      primaryVibe,
      secondaryVibes,
      matchingStrategy,
      confidence: avgScore || 0
    };
  }

  /**
   * Generate helpful suggestions
   */
  private generateSuggestions(vibe: UserVibe, places: VibePlace[]) {
    const suggestions: any = {};
    
    // Time optimization
    if (vibe.timeAvailable === 'quick' && places.some(p => p.estimatedDuration && p.estimatedDuration.includes('hour'))) {
      suggestions.timeOptimization = 'Consider cafes or quick activities for your short timeframe';
    }
    
    // Budget tips
    if (vibe.budget === 'free' && places.length < 5) {
      suggestions.budgetTips = 'Try parks, libraries, or free museums for more options';
    }
    
    // Weather alternatives
    if (vibe.weatherPreference === 'outdoor' && vibe.timeOfDay === 'evening') {
      suggestions.weatherAlternatives = 'Consider indoor backup options as it gets dark';
    }
    
    // Sequencing for multiple places
    if (places.length > 3) {
      suggestions.sequencing = 'Start with the highest-rated place, then explore nearby options';
    }
    
    return suggestions;
  }

  // Helper methods
  private budgetToPriceLevel(budget: string): { min?: number; max?: number } {
    switch (budget) {
      case 'free': return { max: 0 };
      case 'budget': return { min: 0, max: 2 };
      case 'moderate': return { min: 1, max: 3 };
      case 'splurge': return { min: 2 };
      default: return {};
    }
  }

  private inferEnergyLevel(place: any): 'low' | 'medium' | 'high' {
    const types = place.types || [];
    
    if (types.some((t: string) => ['gym', 'amusement_park', 'night_club', 'stadium'].includes(t))) {
      return 'high';
    }
    if (types.some((t: string) => ['spa', 'library', 'park', 'museum'].includes(t))) {
      return 'low';
    }
    return 'medium';
  }

  private inferSocialLevel(place: any): 'solitary' | 'intimate' | 'social' | 'crowded' {
    const types = place.types || [];
    
    if (types.some((t: string) => ['stadium', 'amusement_park', 'shopping_mall'].includes(t))) {
      return 'crowded';
    }
    if (types.some((t: string) => ['restaurant', 'bar', 'bowling_alley'].includes(t))) {
      return 'social';
    }
    if (types.some((t: string) => ['cafe', 'movie_theater', 'art_gallery'].includes(t))) {
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

  private getMoodCompatibility(placeTypes: string[], mood: string): number {
    const moodTypes = VIBE_TO_GOOGLE_TYPES[mood] || [];
    const matches = placeTypes.filter(type => moodTypes.includes(type));
    return matches.length / Math.max(moodTypes.length, 1);
  }

  private getBudgetCompatibility(priceLevel: number | undefined, budget: string): number {
    if (!priceLevel) return budget === 'free' ? 1 : 0.8; // Unknown price, assume moderate
    
    const budgetRanges: Record<string, number[]> = {
      'free': [0],
      'budget': [0, 1],
      'moderate': [1, 2, 3],
      'splurge': [3, 4]
    };
    
    return budgetRanges[budget]?.includes(priceLevel) ? 1 : 0.3;
  }

  private getTypeSpecificReasons(types: string[], vibe: UserVibe): string[] {
    const reasons: string[] = [];
    
    if (types.includes('park') && vibe.mood === 'relaxed') {
      reasons.push('Perfect for relaxing in nature');
    }
    if (types.includes('restaurant') && vibe.social !== 'alone') {
      reasons.push('Great for social dining');
    }
    if (types.includes('museum') && vibe.mood === 'contemplative') {
      reasons.push('Ideal for thoughtful exploration');
    }
    
    return reasons;
  }

  private estimateDuration(place: any, vibe: UserVibe): string {
    const types = place.types || [];
    
    // Quick activities
    if (types.some((t: string) => ['cafe', 'convenience_store', 'gas_station'].includes(t))) {
      return '15-30 minutes';
    }
    
    // Medium activities
    if (types.some((t: string) => ['restaurant', 'movie_theater', 'museum'].includes(t))) {
      return '1-2 hours';
    }
    
    // Long activities
    if (types.some((t: string) => ['amusement_park', 'zoo', 'aquarium'].includes(t))) {
      return '3-6 hours';
    }
    
    // All day activities
    if (types.some((t: string) => ['beach', 'national_park'].includes(t))) {
      return 'Half or full day';
    }
    
    return '1-2 hours'; // Default
  }

  private calculateWalkingTime(placeLocation: any, userLocation?: any): number | undefined {
    if (!userLocation || !placeLocation) return undefined;
    
    // Simple distance calculation (Haversine formula would be more accurate)
    const lat1 = userLocation.lat;
    const lon1 = userLocation.lng;
    const lat2 = placeLocation.lat;
    const lon2 = placeLocation.lng;
    
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const distance = R * c; // Distance in km
    
    // Convert to walking time (assume 5 km/h walking speed)
    return Math.round(distance / 5 * 60); // Minutes
  }

  /**
   * Perform text search using Claude's keywords
   */
  private async performTextSearch(
    location: { lat: number; lng: number; radius?: number },
    keywords: string[],
    allPlaces: any[],
    vibe: UserVibe
  ): Promise<void> {
    const radius = (location.radius || 10) * 1000;
    const maxRadius = Math.min(radius, 50000);
    
    // Try each keyword combination
    const searchQueries = [
      ...keywords, // Individual keywords
      keywords.join(' '), // Combined keywords
      // Add location-specific searches for better results
      ...keywords.map(k => `${k} Bucharest`),
      ...keywords.map(k => `${k} București`)
    ];
    
    for (const query of searchQueries.slice(0, 3)) { // Limit searches to avoid rate limits
      try {
        console.log(`🔍 Text searching for: "${query}"`);
        
        const response = await this.client.textSearch({
          params: {
            query: query,
            location: { lat: location.lat, lng: location.lng },
            radius: maxRadius,
            key: this.apiKey,
            ...(vibe.budget !== 'free' && { minprice: this.budgetToPriceLevel(vibe.budget).min }),
            ...(vibe.budget !== 'splurge' && { maxprice: this.budgetToPriceLevel(vibe.budget).max }),
          }
        });
        
        if (response.data.results) {
          const placesWithContext = response.data.results.map(place => ({
            ...place,
            searchType: 'text_search',
            searchQuery: query,
            vibeCategories: this.inferVibeCategories(place, keywords)
          }));
          
          allPlaces.push(...placesWithContext);
          console.log(`📍 Found ${response.data.results.length} places for "${query}"`);
        }
        
        // Small delay to avoid rate limits
        await new Promise(resolve => setTimeout(resolve, 100));
        
      } catch (error) {
        console.warn(`⚠️ Text search failed for "${query}":`, error);
      }
    }
  }

  /**
   * Infer vibe categories from place data and keywords
   */
  private inferVibeCategories(place: any, keywords: string[]): string[] {
    const categories: string[] = [];
    const name = (place.name || '').toLowerCase();
    const types = place.types || [];
    
    // Infer categories based on keywords and place types
    if (keywords.some(k => ['exercise', 'fitness', 'workout', 'gym'].includes(k.toLowerCase()))) {
      categories.push('energizing', 'health_focused', 'active');
    }
    
    if (keywords.some(k => ['sport', 'tennis', 'golf', 'swimming'].includes(k.toLowerCase()))) {
      categories.push('competitive', 'skill_building', 'recreational');
    }
    
    if (types.includes('park')) {
      categories.push('nature_connection', 'outdoor', 'peaceful');
    }
    
    if (types.includes('gym') || name.includes('gym') || name.includes('fitness')) {
      categories.push('fitness_focused', 'equipment_based', 'structured');
    }
    
    return categories;
  }

  /**
   * Apply experiences-first diversity and food policy
   */
  private applyExperiencesDiversity(places: any[], vibe: UserVibe): any[] {
    console.log('🎯 Applying experiences diversity to', places.length, 'places');
    
    // Check if culinary experiences should be enabled
    const enableCulinary = features.food || this.shouldEnableCulinaryForVibe(vibe);
    
    let filteredPlaces = places;
    
    // Apply food policy if culinary is not enabled
    if (!enableCulinary) {
      filteredPlaces = places.filter(place => {
        const types = place.types || [];
        const isFood = types.some((type: string) => 
          ['restaurant', 'food', 'meal_takeaway', 'meal_delivery', 'cafe', 'bakery'].includes(type)
        );
        
        // If it's food-related, only include if it meets premium criteria
        if (isFood) {
          return this.isPremiumCulinaryExperience(place);
        }
        
        return true; // Include non-food places
      });
      
      console.log('🍽️ Food policy applied:', places.length, '→', filteredPlaces.length, 'places');
    }
    
    // Apply sector diversity and cap at 5 results
    const diversifiedPlaces = diversifyResults(filteredPlaces);
    
    console.log('🎨 Diversity applied:', filteredPlaces.length, '→', diversifiedPlaces.length, 'places');
    
    return diversifiedPlaces;
  }

  /**
   * Check if culinary experiences should be enabled for this vibe
   */
  private shouldEnableCulinaryForVibe(vibe: UserVibe): boolean {
    const description = vibe.description || '';
    const claudeKeywords = (vibe as any).claudeKeywords || [];
    
    return shouldEnableCulinary(description, claudeKeywords);
  }

  /**
   * Check if a place meets premium culinary experience criteria
   */
  private isPremiumCulinaryExperience(place: any): boolean {
    const priceLevel = place.priceLevel || place.price_level || 0;
    const rating = place.rating || 0;
    const name = (place.name || '').toLowerCase();
    
    // Check minimum price level
    if (priceLevel < FOOD_POLICY.minimumPriceLevel) {
      return false;
    }
    
    // Check minimum rating
    if (rating < FOOD_POLICY.minimumRating) {
      return false;
    }
    
    // Check for premium culinary keywords
    const premiumKeywords = ['michelin', 'starred', 'fine dining', 'tasting', 'chef'];
    const hasPremiumKeywords = premiumKeywords.some(keyword => name.includes(keyword));
    
    return hasPremiumKeywords || (priceLevel >= 3 && rating >= 4.5);
  }
}

// Export lazy-loaded singleton instance
let _googlePlacesService: GooglePlacesService | null = null;

export const googlePlacesService = {
  getInstance(): GooglePlacesService {
    if (!_googlePlacesService) {
      _googlePlacesService = new GooglePlacesService();
    }
    return _googlePlacesService;
  },
  
  // Proxy methods for easier usage
  async findExperiencesByVibe(vibe: UserVibe) {
    return this.getInstance().findExperiencesByVibe(vibe);
  }
};
