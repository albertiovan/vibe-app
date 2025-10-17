/**
 * Weather-Aware Activity Gating
 * Filters and prioritizes activities based on weather conditions
 */

import { WeatherCondition, WeatherGating } from '../../types/trails.js';
import { SECTOR_BUCKETS } from '../../config/app.experiences.js';

export class WeatherGatingService {
  /**
   * Apply weather-based filtering to activities
   */
  static applyWeatherGating(
    places: any[],
    weather: WeatherCondition | null
  ): { filtered: any[]; weatherAdvice: string } {
    if (!weather) {
      return {
        filtered: places,
        weatherAdvice: 'Weather data unavailable - showing all activities'
      };
    }

    const gating = this.analyzeWeatherGating(weather);
    const filteredPlaces = this.filterPlacesByWeather(places, gating);
    const weatherAdvice = this.generateWeatherAdvice(gating, weather);

    console.log('🌤️ Weather gating applied:', {
      originalCount: places.length,
      filteredCount: filteredPlaces.length,
      recommendation: gating.recommendation,
      conditions: weather.conditions
    });

    return { filtered: filteredPlaces, weatherAdvice };
  }

  /**
   * Analyze weather conditions for activity recommendations
   */
  static analyzeWeatherGating(weather: WeatherCondition): WeatherGating {
    const heavyRain = weather.precipitation > 5; // > 5mm/hour
    const strongWind = weather.windSpeed > 30; // > 30km/h  
    const extremeTemp = weather.temperature < -5 || weather.temperature > 35;
    const poorVisibility = (weather.visibility || 10) < 2; // < 2km

    let recommendation: WeatherGating['recommendation'] = 'outdoor';

    // Determine recommendation based on conditions
    if (heavyRain || poorVisibility) {
      recommendation = 'indoor';
    } else if (strongWind || extremeTemp || weather.precipitation > 2) {
      recommendation = 'covered';
    }

    return {
      heavyRain,
      strongWind,
      extremeTemp,
      poorVisibility,
      recommendation
    };
  }

  /**
   * Filter places based on weather conditions
   */
  private static filterPlacesByWeather(
    places: any[],
    gating: WeatherGating
  ): any[] {
    return places
      .map(place => ({
        ...place,
        weatherSuitability: this.calculateWeatherSuitability(place, gating)
      }))
      .filter(place => place.weatherSuitability > 0.3) // Filter out very unsuitable
      .sort((a, b) => b.weatherSuitability - a.weatherSuitability); // Sort by suitability
  }

  /**
   * Calculate weather suitability score for a place
   */
  private static calculateWeatherSuitability(
    place: any,
    gating: WeatherGating
  ): number {
    const types = place.types || [];
    const name = (place.name || '').toLowerCase();
    const sector = this.classifyPlaceWeatherSector(place);

    let suitability = 1.0; // Start with full suitability

    // Indoor places are always suitable
    if (this.isIndoorPlace(types, name)) {
      return 1.0;
    }

    // Apply weather-based penalties
    if (gating.recommendation === 'indoor') {
      // Heavily penalize outdoor activities in bad weather
      if (this.isOutdoorPlace(types, name)) {
        suitability *= 0.2;
      } else if (this.isCoveredPlace(types, name)) {
        suitability *= 0.6;
      }
    } else if (gating.recommendation === 'covered') {
      // Moderately penalize fully outdoor activities
      if (this.isOutdoorPlace(types, name)) {
        suitability *= 0.5;
      }
    }

    // Sector-specific weather adjustments
    suitability *= this.getSectorWeatherMultiplier(sector, gating);

    // Specific weather condition adjustments
    if (gating.heavyRain && this.isWaterSensitive(types, name)) {
      suitability *= 0.3;
    }

    if (gating.strongWind && this.isWindSensitive(types, name)) {
      suitability *= 0.4;
    }

    if (gating.extremeTemp && this.isTemperatureSensitive(types, name)) {
      suitability *= 0.4;
    }

    return Math.max(0, Math.min(1, suitability));
  }

  /**
   * Check if place is primarily indoor
   */
  private static isIndoorPlace(types: string[], name: string): boolean {
    const indoorTypes = [
      'museum', 'art_gallery', 'library', 'shopping_mall', 'movie_theater',
      'gym', 'spa', 'casino', 'bowling_alley', 'escape_room', 'arcade'
    ];

    const indoorKeywords = [
      'museum', 'gallery', 'mall', 'cinema', 'theater', 'gym', 'spa',
      'indoor', 'covered', 'inside', 'center', 'centre'
    ];

    return types.some(type => indoorTypes.includes(type)) ||
           indoorKeywords.some(keyword => name.includes(keyword));
  }

  /**
   * Check if place is primarily outdoor
   */
  private static isOutdoorPlace(types: string[], name: string): boolean {
    const outdoorTypes = [
      'park', 'tourist_attraction', 'natural_feature', 'beach', 'trail'
    ];

    const outdoorKeywords = [
      'park', 'trail', 'hike', 'outdoor', 'nature', 'garden', 'beach',
      'mountain', 'forest', 'lake', 'river', 'viewpoint'
    ];

    return types.some(type => outdoorTypes.includes(type)) ||
           outdoorKeywords.some(keyword => name.includes(keyword));
  }

  /**
   * Check if place has covered areas
   */
  private static isCoveredPlace(types: string[], name: string): boolean {
    const coveredTypes = [
      'restaurant', 'cafe', 'bar', 'church', 'synagogue', 'hindu_temple'
    ];

    const coveredKeywords = [
      'restaurant', 'cafe', 'bar', 'pub', 'church', 'temple', 'covered',
      'rooftop', 'terrace', 'pavilion'
    ];

    return types.some(type => coveredTypes.includes(type)) ||
           coveredKeywords.some(keyword => name.includes(keyword));
  }

  /**
   * Classify place into weather-relevant sector
   */
  private static classifyPlaceWeatherSector(place: any): string {
    const types = place.types || [];
    const name = (place.name || '').toLowerCase();

    // Trails & Outdoor (most weather sensitive)
    if (types.includes('park') || name.includes('trail') || name.includes('hike')) {
      return 'trails';
    }

    // Adrenaline & Sports (weather sensitive for outdoor)
    if (types.includes('stadium') || types.includes('amusement_park') || name.includes('sport')) {
      return 'adrenaline';
    }

    // Nature & Serenity (very weather sensitive)
    if (types.includes('zoo') || types.includes('aquarium') || name.includes('garden')) {
      return 'nature';
    }

    // Culture & Arts (mostly indoor, weather resistant)
    if (types.includes('museum') || types.includes('art_gallery') || types.includes('library')) {
      return 'culture';
    }

    // Wellness & Relaxation (mixed indoor/outdoor)
    if (types.includes('spa') || name.includes('wellness') || name.includes('massage')) {
      return 'wellness';
    }

    // Nightlife & Social (mostly indoor/covered)
    if (types.includes('night_club') || types.includes('bar') || types.includes('casino')) {
      return 'nightlife';
    }

    return 'unknown';
  }

  /**
   * Get weather multiplier for different sectors
   */
  private static getSectorWeatherMultiplier(
    sector: string,
    gating: WeatherGating
  ): number {
    const multipliers: Record<string, Record<string, number>> = {
      trails: {
        indoor: 0.2,    // Trails are very unsuitable in bad weather
        covered: 0.4,
        outdoor: 1.0
      },
      nature: {
        indoor: 0.3,    // Nature activities prefer good weather
        covered: 0.6,
        outdoor: 1.0
      },
      adrenaline: {
        indoor: 0.7,    // Some adrenaline activities can be indoor
        covered: 0.8,
        outdoor: 1.0
      },
      culture: {
        indoor: 1.2,    // Culture activities are great in bad weather
        covered: 1.1,
        outdoor: 1.0
      },
      wellness: {
        indoor: 1.1,    // Wellness is good for bad weather
        covered: 1.0,
        outdoor: 0.9
      },
      nightlife: {
        indoor: 1.0,    // Nightlife is weather-independent
        covered: 1.0,
        outdoor: 0.8
      }
    };

    const sectorMultipliers = multipliers[sector];
    if (!sectorMultipliers) return 1.0;

    return sectorMultipliers[gating.recommendation] || 1.0;
  }

  /**
   * Check if place is sensitive to water/rain
   */
  private static isWaterSensitive(types: string[], name: string): boolean {
    const waterSensitive = ['park', 'tourist_attraction', 'amusement_park'];
    const waterKeywords = ['outdoor', 'trail', 'hike', 'garden', 'terrace'];

    return types.some(type => waterSensitive.includes(type)) ||
           waterKeywords.some(keyword => name.includes(keyword));
  }

  /**
   * Check if place is sensitive to wind
   */
  private static isWindSensitive(types: string[], name: string): boolean {
    const windSensitive = ['amusement_park', 'tourist_attraction'];
    const windKeywords = ['outdoor', 'rooftop', 'terrace', 'viewpoint', 'tower'];

    return types.some(type => windSensitive.includes(type)) ||
           windKeywords.some(keyword => name.includes(keyword));
  }

  /**
   * Check if place is sensitive to extreme temperatures
   */
  private static isTemperatureSensitive(types: string[], name: string): boolean {
    const tempSensitive = ['park', 'zoo', 'amusement_park'];
    const tempKeywords = ['outdoor', 'trail', 'hike', 'garden', 'beach'];

    return types.some(type => tempSensitive.includes(type)) ||
           tempKeywords.some(keyword => name.includes(keyword));
  }

  /**
   * Generate weather advice for users
   */
  private static generateWeatherAdvice(
    gating: WeatherGating,
    weather: WeatherCondition
  ): string {
    const temp = Math.round(weather.temperature);
    const conditions = weather.conditions.replace(/_/g, ' ');

    if (gating.recommendation === 'indoor') {
      if (gating.heavyRain) {
        return `Heavy rain (${weather.precipitation.toFixed(1)}mm/h) - indoor activities recommended`;
      }
      if (gating.poorVisibility) {
        return `Poor visibility - indoor activities recommended`;
      }
      return `Severe weather (${temp}°C, ${conditions}) - indoor activities recommended`;
    }

    if (gating.recommendation === 'covered') {
      if (gating.strongWind) {
        return `Strong winds (${Math.round(weather.windSpeed)}km/h) - covered areas recommended`;
      }
      if (gating.extremeTemp) {
        return `Extreme temperature (${temp}°C) - covered areas recommended`;
      }
      if (weather.precipitation > 2) {
        return `Light rain (${weather.precipitation.toFixed(1)}mm/h) - covered areas recommended`;
      }
      return `Moderate weather conditions - covered areas recommended`;
    }

    // Good weather
    if (temp > 20 && temp < 28 && weather.precipitation < 0.5) {
      return `Perfect weather (${temp}°C, ${conditions}) - great for outdoor activities!`;
    }

    return `Good weather (${temp}°C, ${conditions}) - suitable for outdoor activities`;
  }

  /**
   * Get weather-appropriate activity suggestions
   */
  static getWeatherActivitySuggestions(weather: WeatherCondition): {
    prioritize: string[];
    avoid: string[];
    message: string;
  } {
    const gating = this.analyzeWeatherGating(weather);
    const prioritize: string[] = [];
    const avoid: string[] = [];

    if (gating.recommendation === 'indoor') {
      prioritize.push('museums', 'galleries', 'shopping', 'cinemas', 'gyms', 'spas');
      avoid.push('parks', 'trails', 'outdoor sports', 'sightseeing');
    } else if (gating.recommendation === 'covered') {
      prioritize.push('restaurants', 'cafes', 'covered markets', 'churches', 'bars');
      avoid.push('hiking', 'cycling', 'outdoor adventures');
    } else {
      prioritize.push('parks', 'trails', 'outdoor sports', 'sightseeing', 'nature');
      
      // Temperature-specific suggestions
      if (weather.temperature > 25) {
        prioritize.push('water activities', 'shaded areas', 'swimming');
      } else if (weather.temperature < 10) {
        prioritize.push('warm indoor spaces', 'hot drinks', 'cozy venues');
      }
    }

    const message = this.generateWeatherAdvice(gating, weather);

    return { prioritize, avoid, message };
  }
}
