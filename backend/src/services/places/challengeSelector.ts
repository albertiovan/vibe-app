/**
 * Challenge Selector
 * Outside-the-box destination suggestions with weather and travel awareness
 */

import { VibePlace, ROMANIA_REGIONAL_CENTERS } from '../../types/vibe.js';
import { ChallengeWeatherService, WeatherForecast, TravelEstimate } from '../weather/challengeWeatherService.js';

export interface ChallengePlace extends VibePlace {
  challengeScore: number;
  travelEstimate: TravelEstimate;
  weatherForecast: WeatherForecast['forecast'][0];
  challengeReason: string;
  riskNote?: string;
  seasonalPerks?: string[];
}

export interface ChallengeResult {
  challenges: ChallengePlace[];
  totalCandidates: number;
  weatherChecked: number;
  reasoning: string;
}

export class ChallengeSelector {
  private weatherService = new ChallengeWeatherService();

  /**
   * Select outside-the-box challenge destinations (max 2)
   */
  async selectChallenges(
    allPlaces: VibePlace[],
    userOrigin: { lat: number; lng: number },
    userFilters: { radiusMeters: number; durationHours: number },
    vibe: string
  ): Promise<ChallengeResult> {
    try {
      console.log('🎯 Selecting challenge destinations outside comfort zone');

      // Step 1: Filter candidates outside user's radius but within travel limits
      const candidates = this.filterChallengeCandidates(allPlaces, userOrigin, userFilters);
      console.log('🎯 Found', candidates.length, 'challenge candidates');

      if (candidates.length === 0) {
        return {
          challenges: [],
          totalCandidates: 0,
          weatherChecked: 0,
          reasoning: 'No suitable challenge destinations found outside your radius'
        };
      }

      // Step 2: Get weather forecasts for candidate destinations
      const destinationCities = this.extractDestinationCities(candidates);
      const weatherForecasts = await this.weatherService.getDestinationWeather(destinationCities);
      console.log('🎯 Checked weather for', weatherForecasts.length, 'destinations');

      // Step 3: Score and rank challenge places
      const scoredChallenges = await this.scoreChallenges(
        candidates,
        userOrigin,
        weatherForecasts,
        vibe
      );

      // Step 4: Apply safety filters and select top 2
      const safeChallenges = this.applySafetyFilters(scoredChallenges);
      const topChallenges = safeChallenges
        .sort((a, b) => b.challengeScore - a.challengeScore)
        .slice(0, 2);

      console.log('🎯 Selected', topChallenges.length, 'challenge destinations');

      return {
        challenges: topChallenges,
        totalCandidates: candidates.length,
        weatherChecked: weatherForecasts.length,
        reasoning: `Found ${topChallenges.length} weather-safe challenges outside your ${Math.round(userFilters.radiusMeters / 1000)}km radius`
      };

    } catch (error) {
      console.error('🎯 Challenge selection failed:', error);
      return {
        challenges: [],
        totalCandidates: 0,
        weatherChecked: 0,
        reasoning: 'Challenge selection temporarily unavailable'
      };
    }
  }

  /**
   * Filter places outside user radius but within travel limits
   */
  private filterChallengeCandidates(
    places: VibePlace[],
    origin: { lat: number; lng: number },
    filters: { radiusMeters: number; durationHours: number }
  ): VibePlace[] {
    return places.filter(place => {
      const travelEstimate = this.weatherService.calculateTravelEstimate(
        origin,
        place.geometry.location
      );

      // Must be outside user's radius but within travel limits
      const outsideRadius = travelEstimate.distanceKm > (filters.radiusMeters / 1000);
      const withinTravelLimits = Boolean(travelEstimate.feasible);
      
      // Prefer places with higher ratings and interesting types
      const hasGoodRating = !place.rating || place.rating >= 4.0;
      const isInteresting = this.isInterestingDestination(place);

      return outsideRadius && withinTravelLimits && hasGoodRating && isInteresting;
    });
  }

  /**
   * Check if place is an interesting challenge destination
   */
  private isInterestingDestination(place: VibePlace): boolean {
    const name = place.name.toLowerCase();
    const types = place.types.join(' ').toLowerCase();

    // Seasonal/special attractions
    const seasonalKeywords = ['ski', 'thermal', 'castle', 'mountain', 'resort', 'spa', 'adventure'];
    const hasSeasonalKeyword = seasonalKeywords.some(keyword => 
      name.includes(keyword) || types.includes(keyword)
    );

    // Tourist attractions and unique experiences
    const isAttraction = place.types.includes('tourist_attraction') || 
                        place.types.includes('amusement_park') ||
                        place.types.includes('natural_feature');

    // High-rated experiences
    const isHighRated = place.rating && place.rating >= 4.3;

    return hasSeasonalKeyword || isAttraction || isHighRated;
  }

  /**
   * Extract unique destination cities from places
   */
  private extractDestinationCities(places: VibePlace[]): Array<{ lat: number; lng: number; city: string }> {
    const cityMap = new Map<string, { lat: number; lng: number; city: string }>();

    for (const place of places) {
      // Try to match with known regional centers
      const nearestCity = this.findNearestRegionalCenter(place.geometry.location);
      
      if (!cityMap.has(nearestCity.name)) {
        cityMap.set(nearestCity.name, {
          lat: nearestCity.lat,
          lng: nearestCity.lng,
          city: nearestCity.name
        });
      }
    }

    return Array.from(cityMap.values());
  }

  /**
   * Find nearest regional center for weather lookup
   */
  private findNearestRegionalCenter(location: { lat: number; lng: number }) {
    let nearest = ROMANIA_REGIONAL_CENTERS[0];
    let minDistance = this.calculateDistance(location, nearest);

    for (const center of ROMANIA_REGIONAL_CENTERS) {
      const distance = this.calculateDistance(location, center);
      if (distance < minDistance) {
        minDistance = distance;
        nearest = center;
      }
    }

    return nearest;
  }

  /**
   * Score challenge places with weather and travel factors
   */
  private async scoreChallenges(
    candidates: VibePlace[],
    origin: { lat: number; lng: number },
    weatherForecasts: WeatherForecast[],
    vibe: string
  ): Promise<ChallengePlace[]> {
    const challenges: ChallengePlace[] = [];

    for (const place of candidates) {
      const travelEstimate = this.weatherService.calculateTravelEstimate(
        origin,
        place.geometry.location
      );

      // Find weather for this place's region
      const nearestCity = this.findNearestRegionalCenter(place.geometry.location);
      const weatherForecast = weatherForecasts.find(f => f.location.city === nearestCity.name);
      
      if (!weatherForecast) continue;

      // Use tomorrow's forecast (index 1) for planning
      const forecast = weatherForecast.forecast[1] || weatherForecast.forecast[0];

      // Calculate challenge score
      let challengeScore = 0.5; // Base score

      // Weather suitability (0.4 weight)
      const activityType = this.inferActivityType(place, vibe);
      const weatherScore = this.weatherService.scoreWeatherSuitability(forecast, activityType);
      challengeScore += weatherScore * 0.4;

      // Novelty bonus (0.3 weight)
      const noveltyScore = this.calculateNoveltyScore(place, vibe);
      challengeScore += noveltyScore * 0.3;

      // Seasonal perks (0.2 weight)
      const seasonalPerks = this.identifySeasonalPerks(place, forecast);
      const seasonalScore = seasonalPerks.length > 0 ? 0.2 : 0;
      challengeScore += seasonalScore;

      // Distance penalty (0.1 weight) - closer is better for challenges
      const distancePenalty = Math.min(0.1, travelEstimate.distanceKm / 2000); // Max 0.1 penalty
      challengeScore -= distancePenalty;

      const challengePlace: ChallengePlace = {
        ...place,
        challengeScore: Math.max(0, Math.min(1, challengeScore)),
        travelEstimate,
        weatherForecast: forecast,
        challengeReason: this.generateChallengeReason(place, forecast, seasonalPerks),
        seasonalPerks,
        riskNote: this.generateRiskNote(forecast, travelEstimate)
      };

      challenges.push(challengePlace);
    }

    return challenges;
  }

  /**
   * Infer activity type for weather scoring
   */
  private inferActivityType(place: VibePlace, vibe: string): string {
    const name = place.name.toLowerCase();
    const types = place.types.join(' ').toLowerCase();
    const vibeText = vibe.toLowerCase();

    if (name.includes('ski') || vibeText.includes('ski')) return 'ski winter';
    if (types.includes('amusement_park') || vibeText.includes('adventure')) return 'outdoor adventure';
    if (types.includes('museum') || types.includes('art_gallery')) return 'indoor cultural';
    if (types.includes('park') || types.includes('natural_feature')) return 'outdoor nature';
    if (name.includes('thermal') || name.includes('spa')) return 'outdoor wellness';
    
    return 'outdoor'; // Default
  }

  /**
   * Calculate novelty score based on uniqueness
   */
  private calculateNoveltyScore(place: VibePlace, vibe: string): number {
    let score = 0.5;

    // Unique place types get bonus
    const uniqueTypes = ['castle', 'fortress', 'thermal', 'cave', 'monastery', 'palace'];
    const hasUniqueType = uniqueTypes.some(type => 
      place.name.toLowerCase().includes(type) || 
      place.types.some(t => t.includes(type))
    );
    
    if (hasUniqueType) score += 0.3;

    // High ratings indicate special experiences
    if (place.rating && place.rating >= 4.5) score += 0.2;

    // Tourist attractions are often novel
    if (place.types.includes('tourist_attraction')) score += 0.1;

    return Math.min(1, score);
  }

  /**
   * Identify seasonal perks and special conditions
   */
  private identifySeasonalPerks(place: VibePlace, forecast: WeatherForecast['forecast'][0]): string[] {
    const perks: string[] = [];
    const name = place.name.toLowerCase();
    const avgTemp = (forecast.temperature.min + forecast.temperature.max) / 2;

    // Winter sports perks
    if (name.includes('ski') && avgTemp <= 5 && forecast.precipitation > 0) {
      perks.push('Fresh snow conditions');
    }

    // Thermal/spa perks
    if ((name.includes('thermal') || name.includes('spa')) && avgTemp <= 15) {
      perks.push('Perfect weather for thermal baths');
    }

    // Clear weather perks
    if (forecast.precipitation === 0 && forecast.windSpeed < 15) {
      if (name.includes('castle') || name.includes('fortress')) {
        perks.push('Clear views from heights');
      }
      if (place.types.includes('natural_feature')) {
        perks.push('Perfect hiking weather');
      }
    }

    // Seasonal timing
    const currentMonth = new Date().getMonth();
    if (currentMonth >= 11 || currentMonth <= 2) { // Winter
      if (name.includes('christmas') || name.includes('winter')) {
        perks.push('Winter season special');
      }
    }

    return perks;
  }

  /**
   * Generate human-readable challenge reason
   */
  private generateChallengeReason(
    place: VibePlace,
    forecast: WeatherForecast['forecast'][0],
    seasonalPerks: string[]
  ): string {
    if (seasonalPerks.length > 0) {
      return seasonalPerks[0]; // Use first seasonal perk as main reason
    }

    if (forecast.precipitation === 0) {
      return 'Perfect clear weather';
    }

    if (place.rating && place.rating >= 4.5) {
      return 'Highly rated destination';
    }

    if (place.types.includes('tourist_attraction')) {
      return 'Unique regional attraction';
    }

    return 'Worth the journey';
  }

  /**
   * Generate risk note for challenging conditions
   */
  private generateRiskNote(
    forecast: WeatherForecast['forecast'][0],
    travel: TravelEstimate
  ): string | undefined {
    const risks: string[] = [];

    if (forecast.precipitation > 10) {
      risks.push('Heavy rain expected');
    }

    if (forecast.windSpeed > 25) {
      risks.push('Strong winds');
    }

    if (travel.estimatedMinutes > 120) {
      risks.push('Long drive required');
    }

    const avgTemp = (forecast.temperature.min + forecast.temperature.max) / 2;
    if (avgTemp <= 0) {
      risks.push('Freezing temperatures');
    }

    return risks.length > 0 ? risks.join(', ') : undefined;
  }

  /**
   * Apply safety filters to remove unsafe challenges
   */
  private applySafetyFilters(challenges: ChallengePlace[]): ChallengePlace[] {
    return challenges.filter(challenge => {
      const forecast = challenge.weatherForecast;
      
      // Exclude dangerous weather conditions
      if (forecast.precipitation > 20) return false; // Heavy rain
      if (forecast.windSpeed > 30) return false; // Dangerous winds
      
      // Exclude extremely long travel times
      if (challenge.travelEstimate.estimatedMinutes > 180) return false; // > 3 hours
      
      // Must have reasonable challenge score
      if (challenge.challengeScore < 0.4) return false;

      return true;
    });
  }

  /**
   * Calculate distance between two points
   */
  private calculateDistance(
    point1: { lat: number; lng: number },
    point2: { lat: number; lng: number }
  ): number {
    const R = 6371; // Earth's radius in kilometers
    const dLat = this.toRadians(point2.lat - point1.lat);
    const dLng = this.toRadians(point2.lng - point1.lng);
    
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(this.toRadians(point1.lat)) * Math.cos(this.toRadians(point2.lat)) *
              Math.sin(dLng / 2) * Math.sin(dLng / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  /**
   * Convert degrees to radians
   */
  private toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }
}
