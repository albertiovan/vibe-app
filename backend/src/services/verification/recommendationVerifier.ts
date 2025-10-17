/**
 * Recommendation Verification Service
 * Takes Claude's recommendations and verifies/enriches them with real API data
 */

import { GooglePlacesService } from '../googlePlacesService.js';
import { OpenMeteoService } from '../weather/openmeteo.js';
import { ClaudeRecommendation, EnrichedRecommendation } from '../llm/claudeRecommendationEngine.js';

export class RecommendationVerifier {
  private placesService = new GooglePlacesService();
  private weatherService = new OpenMeteoService();

  /**
   * Verify and enrich Claude's recommendations with real data
   */
  async verifyRecommendations(
    claudeRecs: ClaudeRecommendation[],
    userLocation: { lat: number; lng: number }
  ): Promise<EnrichedRecommendation[]> {
    console.log('🔍 Verifying', claudeRecs.length, 'Claude recommendations with real data');

    const enrichedRecs: EnrichedRecommendation[] = [];

    for (const rec of claudeRecs) {
      try {
        const enriched = await this.verifyAndEnrichRecommendation(rec, userLocation);
        if (enriched) {
          enrichedRecs.push(enriched);
        }
      } catch (error) {
        console.warn('⚠️ Failed to verify recommendation:', rec.name, error);
        // Include unverified recommendation as fallback
        enrichedRecs.push({
          ...rec,
          verified: false
        });
      }
    }

    console.log('✅ Verified', enrichedRecs.filter(r => r.verified).length, 'of', claudeRecs.length, 'recommendations');
    return enrichedRecs;
  }

  /**
   * Verify a single recommendation with Google Places
   */
  private async verifyAndEnrichRecommendation(
    rec: ClaudeRecommendation,
    userLocation: { lat: number; lng: number }
  ): Promise<EnrichedRecommendation | null> {
    
    // Search for the specific place Claude recommended
    const searchQueries = [
      rec.name, // Exact name
      `${rec.name} ${rec.location.city}`, // Name + city
      `${rec.category} ${rec.location.area} ${rec.location.city}`, // Category + area
      rec.description.split(' ').slice(0, 3).join(' ') // First few words of description
    ];

    let bestMatch: any = null;
    let bestScore = 0;

    for (const query of searchQueries) {
      try {
        console.log('🔍 Searching Google Places for:', query);
        
        // Use nearby search instead of textSearch for now
        const results = await this.placesService.nearbySearch({
          location: userLocation,
          radius: 50000,
          keyword: query,
          type: this.mapCategoryToPlaceType(rec.category)
        });

        if (results && results.length > 0) {
          // Find best match based on name similarity and rating
          for (const place of results.slice(0, 3)) { // Check top 3 results
            const score = this.calculateMatchScore(rec, place);
            if (score > bestScore) {
              bestMatch = place;
              bestScore = score;
            }
          }
        }
      } catch (error) {
        console.warn('Search failed for query:', query, error);
      }
    }

    if (bestMatch && bestScore > 0.3) { // Minimum confidence threshold
      console.log('✅ Found match for', rec.name, '→', bestMatch.name, `(${Math.round(bestScore * 100)}% confidence)`);
      
      return await this.enrichWithRealData(rec, bestMatch, userLocation);
    } else {
      console.log('❌ No good match found for', rec.name);
      return {
        ...rec,
        verified: false
      };
    }
  }

  /**
   * Calculate match score between Claude recommendation and Google Place
   */
  private calculateMatchScore(rec: ClaudeRecommendation, place: any): number {
    let score = 0;

    // Name similarity (most important)
    const nameSimilarity = this.stringSimilarity(
      rec.name.toLowerCase(),
      place.name.toLowerCase()
    );
    score += nameSimilarity * 0.6;

    // Location similarity
    if (place.vicinity && rec.location.area) {
      const locationSimilarity = this.stringSimilarity(
        rec.location.area.toLowerCase(),
        place.vicinity.toLowerCase()
      );
      score += locationSimilarity * 0.2;
    }

    // Type/category match
    if (place.types && this.typesMatchCategory(place.types, rec.category)) {
      score += 0.2;
    }

    // Boost score for highly rated places
    if (place.rating && place.rating >= 4.0) {
      score += 0.1;
    }

    return Math.min(score, 1.0);
  }

  /**
   * Simple string similarity calculation
   */
  private stringSimilarity(str1: string, str2: string): number {
    const words1 = str1.split(' ');
    const words2 = str2.split(' ');
    
    let matches = 0;
    for (const word1 of words1) {
      if (word1.length > 2 && words2.some(word2 => 
        word2.includes(word1) || word1.includes(word2)
      )) {
        matches++;
      }
    }
    
    return matches / Math.max(words1.length, words2.length);
  }

  /**
   * Check if Google Place types match Claude's category
   */
  private typesMatchCategory(types: string[], category: string): boolean {
    const categoryMap: Record<string, string[]> = {
      'adventure': ['amusement_park', 'tourist_attraction', 'park', 'gym'],
      'culture': ['museum', 'art_gallery', 'library', 'university', 'church'],
      'nature': ['park', 'zoo', 'aquarium', 'natural_feature'],
      'entertainment': ['movie_theater', 'bowling_alley', 'casino', 'night_club'],
      'wellness': ['spa', 'gym', 'beauty_salon', 'hospital'],
      'nightlife': ['bar', 'night_club', 'restaurant', 'cafe']
    };

    const expectedTypes = categoryMap[category] || [];
    return types.some(type => expectedTypes.includes(type));
  }

  /**
   * Map category to Google Places type
   */
  private mapCategoryToPlaceType(category: string): string {
    const typeMap: Record<string, string> = {
      'adventure': 'tourist_attraction',
      'culture': 'museum',
      'nature': 'park',
      'entertainment': 'amusement_park',
      'wellness': 'spa',
      'nightlife': 'bar'
    };

    return typeMap[category] || 'tourist_attraction';
  }

  /**
   * Enrich recommendation with real Google Places data
   */
  private async enrichWithRealData(
    rec: ClaudeRecommendation,
    place: any,
    userLocation: { lat: number; lng: number }
  ): Promise<EnrichedRecommendation> {
    
    // Calculate distance and travel time
    const distance = place.geometry?.location ? 
      this.calculateDistance(
        userLocation,
        {
          lat: place.geometry.location.lat,
          lng: place.geometry.location.lng
        }
      ) : undefined;

    const travelTime = distance ? Math.round(distance * 3) : undefined; // Rough estimate: 3 min per km

    // Get weather suitability if location is available
    let weatherSuitability;
    if (place.geometry?.location) {
      try {
        const weather = await this.weatherService.getCurrentWeather(
          place.geometry.location.lat,
          place.geometry.location.lng
        );
        weatherSuitability = this.calculateWeatherSuitability(rec, weather);
      } catch (error) {
        console.warn('Weather fetch failed for', place.name);
      }
    }

    return {
      ...rec,
      verified: true,
      realData: {
        placeId: place.place_id,
        rating: place.rating || 0,
        address: place.formatted_address || place.vicinity || '',
        coordinates: place.geometry?.location ? {
          lat: place.geometry.location.lat,
          lng: place.geometry.location.lng
        } : { lat: 0, lng: 0 },
        photos: place.photos?.slice(0, 3).map((p: any) => p.photo_reference) || [],
        reviews: place.user_ratings_total || 0
      },
      weather: weatherSuitability ? {
        current: weatherSuitability.weather,
        suitability: weatherSuitability.score
      } : undefined,
      distance,
      travelTime
    };
  }

  /**
   * Calculate weather suitability score
   */
  private calculateWeatherSuitability(rec: ClaudeRecommendation, weather: any): { weather: any; score: number } {
    let score = 0.5; // Base score

    const conditions = weather.weathercode ? this.getWeatherCondition(weather.weathercode) : 'unknown';
    
    // Check if current conditions match recommendation's weather suitability
    if (rec.suitability.weather.includes(conditions)) {
      score += 0.3;
    }

    // Temperature considerations
    if (weather.temperature) {
      if (rec.category === 'adventure' && weather.temperature > 10 && weather.temperature < 30) {
        score += 0.2;
      }
      if (rec.category === 'culture' && weather.temperature > -5 && weather.temperature < 35) {
        score += 0.1; // Indoor activities less weather dependent
      }
    }

    return {
      weather: {
        temperature: weather.temperature,
        conditions,
        recommendation: score > 0.7 ? 'perfect' : score > 0.5 ? 'good' : 'okay'
      },
      score: Math.min(score, 1.0)
    };
  }

  /**
   * Convert weather code to condition string
   */
  private getWeatherCondition(code: number): string {
    if (code === 0) return 'sunny';
    if (code <= 3) return 'cloudy';
    if (code <= 67) return 'rainy';
    if (code <= 77) return 'snowy';
    return 'stormy';
  }
}
