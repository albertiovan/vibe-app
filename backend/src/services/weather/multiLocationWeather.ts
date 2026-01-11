/**
 * Multi-Location Weather Service
 * 
 * Fetches weather for multiple Romanian cities simultaneously
 * Caches results to avoid excessive API calls
 */

import { OpenMeteoService } from './openmeteo.js';

interface CityWeather {
  city: string;
  lat: number;
  lng: number;
  temperature: number;
  condition: string;
  precipitation: number;
  windSpeed: number;
  suitability: 'good' | 'ok' | 'bad';
  icon: string;
  description: string;
}

interface WeatherCache {
  data: Map<string, CityWeather>;
  timestamp: number;
}

/**
 * Major Romanian cities with coordinates
 */
export const ROMANIAN_CITIES = {
  'București': { lat: 44.4268, lng: 26.1025 },
  'Ilfov': { lat: 44.5500, lng: 26.1500 }, // Region around București
  'Brașov': { lat: 45.6427, lng: 25.5887 },
  'Cluj-Napoca': { lat: 46.7712, lng: 23.6236 },
  'Timișoara': { lat: 45.7489, lng: 21.2087 },
  'Iași': { lat: 47.1585, lng: 27.6014 },
  'Constanța': { lat: 44.1598, lng: 28.6348 },
  'Sibiu': { lat: 45.7983, lng: 24.1256 },
  'Sinaia': { lat: 45.3500, lng: 25.5500 },
  'Poiana Brașov': { lat: 45.5833, lng: 25.5667 },
  'Bucegi': { lat: 45.4000, lng: 25.4500 },
  'Danube Delta': { lat: 45.2500, lng: 29.0000 },
  'Apuseni': { lat: 46.5000, lng: 22.8000 },
  'Prahova': { lat: 45.1000, lng: 26.0000 },
  'Tulcea': { lat: 45.1667, lng: 28.8000 },
  'Argeș': { lat: 44.8500, lng: 24.8700 },
  'Dâmbovița': { lat: 44.9300, lng: 25.4500 },
  'Giurgiu': { lat: 43.9000, lng: 25.9700 },
  'Ialomița': { lat: 44.5700, lng: 27.3700 },
  'Călărași': { lat: 44.2000, lng: 27.3300 },
  'Timiș': { lat: 45.7489, lng: 21.2087 }, // Same as Timișoara
  'Bihor': { lat: 47.0500, lng: 21.9300 }, // Oradea region
  'Mureș': { lat: 46.5500, lng: 24.5600 }, // Târgu Mureș region
  'Alba': { lat: 46.0700, lng: 23.5800 }, // Alba Iulia region
  'Hunedoara': { lat: 45.7500, lng: 22.9000 }, // Deva region
  'Maramureș': { lat: 47.6600, lng: 23.5800 }, // Baia Mare region
  'Suceava': { lat: 47.6500, lng: 26.2500 }, // Suceava region
  'Neamț': { lat: 46.9300, lng: 26.3700 } // Piatra Neamț region
} as const;

export class MultiLocationWeatherService {
  private weatherService: OpenMeteoService;
  private cache: WeatherCache;
  private cacheDuration = 30 * 60 * 1000; // 30 minutes

  constructor() {
    this.weatherService = new OpenMeteoService();
    this.cache = {
      data: new Map(),
      timestamp: 0
    };
  }

  /**
   * Normalize city names to handle EN/RO variations
   * "Bucharest" → "București", "Brasov" → "Brașov", etc.
   */
  private normalizeCityName(cityName: string): string {
    const normalized = cityName.trim();
    
    // EN → RO mappings and region aliases
    const cityMappings: Record<string, string> = {
      // Bucharest variations
      'Bucharest': 'București',
      'bucharest': 'București',
      'BUCHAREST': 'București',
      
      // Brașov variations
      'Brasov': 'Brașov',
      'brasov': 'Brașov',
      'BRASOV': 'Brașov',
      'Poiana Brasov': 'Poiana Brașov',
      
      // Cluj variations
      'Cluj': 'Cluj-Napoca',
      'cluj': 'Cluj-Napoca',
      'Cluj Napoca': 'Cluj-Napoca',
      
      // Timișoara variations
      'Timisoara': 'Timișoara',
      'timisoara': 'Timișoara',
      'TIMISOARA': 'Timișoara',
      
      // Iași variations
      'Iasi': 'Iași',
      'iasi': 'Iași',
      'IASI': 'Iași',
      
      // Constanța variations
      'Constanta': 'Constanța',
      'constanta': 'Constanța',
      'CONSTANTA': 'Constanța',
      
      // Regions (use nearest major city for weather)
      'Balotești': 'Ilfov',
      'Balotesti': 'Ilfov',
      'Otopeni': 'Ilfov',
      'Voluntari': 'Ilfov',
      'Popești-Leordeni': 'Ilfov',
      'Popesti-Leordeni': 'Ilfov',
      'Buftea': 'Ilfov',
      'Chitila': 'Ilfov',
      
      // Prahova region
      'Busteni': 'Prahova',
      'Azuga': 'Prahova',
      'Predeal': 'Prahova',
      
      // Argeș variations
      'Arges': 'Argeș',
      'arges': 'Argeș',
      
      // Dâmbovița variations
      'Dambovita': 'Dâmbovița',
      'dambovita': 'Dâmbovița',
      
      // Ialomița variations
      'Ialomita': 'Ialomița',
      'ialomita': 'Ialomița',
      
      // Călărași variations
      'Calarasi': 'Călărași',
      'calarasi': 'Călărași'
    };
    
    return cityMappings[normalized] || normalized;
  }

  /**
   * Get weather for a specific city
   */
  async getWeatherForCity(cityName: string): Promise<CityWeather | null> {
    // Normalize city name to handle EN/RO variations
    const normalizedName = this.normalizeCityName(cityName);
    
    const city = ROMANIAN_CITIES[normalizedName as keyof typeof ROMANIAN_CITIES];
    if (!city) {
      console.warn(`⚠️ Unknown city: ${cityName} (normalized: ${normalizedName})`);
      return null;
    }

    // Check cache first (use normalized name for cache key)
    const cached = this.getCachedWeather(normalizedName);
    if (cached) {
      console.log(`✅ Using cached weather for ${normalizedName}`);
      return cached;
    }

    // Fetch fresh weather
    console.log(`🌤️ Fetching weather for ${normalizedName}...`);
    const weather = await this.weatherService.getCurrentWeather(city.lat, city.lng);
    
    if (!weather) {
      return null;
    }

    const cityWeather: CityWeather = {
      city: normalizedName, // Use normalized name consistently
      lat: city.lat,
      lng: city.lng,
      temperature: Math.round(weather.temperature),
      condition: weather.conditions,
      precipitation: weather.precipitation,
      windSpeed: weather.windSpeed,
      suitability: this.determineSuitability(weather),
      icon: this.getWeatherIcon(weather.conditions),
      description: this.formatWeatherDescription(weather)
    };

    // Cache the result (use normalized name for cache key)
    this.cache.data.set(normalizedName, cityWeather);
    this.cache.timestamp = Date.now();

    return cityWeather;
  }

  /**
   * Get weather for multiple cities
   */
  async getWeatherForCities(cityNames: string[]): Promise<Map<string, CityWeather>> {
    const results = new Map<string, CityWeather>();

    // Fetch all cities in parallel
    const promises = cityNames.map(async (cityName) => {
      const weather = await this.getWeatherForCity(cityName);
      if (weather) {
        results.set(cityName, weather);
      }
    });

    await Promise.all(promises);

    console.log(`✅ Fetched weather for ${results.size}/${cityNames.length} cities`);
    return results;
  }

  /**
   * Get weather for user location + all activity venue locations
   */
  async getWeatherForActivities(
    userCity: string,
    activityCities: string[]
  ): Promise<Map<string, CityWeather>> {
    // Combine user city with activity cities (remove duplicates)
    const allCities = Array.from(new Set([userCity, ...activityCities]));
    
    console.log(`🌍 Fetching weather for ${allCities.length} locations:`, allCities);
    return await this.getWeatherForCities(allCities);
  }

  /**
   * Get cached weather if still valid
   */
  private getCachedWeather(cityName: string): CityWeather | null {
    const now = Date.now();
    const cacheAge = now - this.cache.timestamp;

    if (cacheAge > this.cacheDuration) {
      // Cache expired
      this.cache.data.clear();
      return null;
    }

    return this.cache.data.get(cityName) || null;
  }

  /**
   * Determine weather suitability for outdoor activities
   */
  private determineSuitability(weather: any): 'good' | 'ok' | 'bad' {
    const gating = this.weatherService.analyzeWeatherGating(weather);
    
    if (gating.recommendation === 'outdoor') {
      return 'good';
    } else if (gating.recommendation === 'covered') {
      return 'ok';
    } else {
      return 'bad';
    }
  }

  /**
   * Get weather icon emoji
   */
  private getWeatherIcon(condition: string): string {
    const icons: Record<string, string> = {
      'clear': '☀️',
      'mainly_clear': '🌤️',
      'partly_cloudy': '⛅',
      'overcast': '☁️',
      'fog': '🌫️',
      'drizzle': '🌦️',
      'rain': '🌧️',
      'heavy_rain': '⛈️',
      'snow': '🌨️',
      'thunderstorm': '⛈️'
    };

    // Find matching icon
    for (const [key, icon] of Object.entries(icons)) {
      if (condition.toLowerCase().includes(key)) {
        return icon;
      }
    }

    return '🌤️'; // Default
  }

  /**
   * Format weather description for display
   */
  private formatWeatherDescription(weather: any): string {
    const temp = Math.round(weather.temperature);
    const condition = weather.conditions.replace(/_/g, ' ');
    
    let description = `${temp}°C`;
    
    if (weather.precipitation > 0) {
      description += `, ${weather.precipitation.toFixed(1)}mm rain`;
    } else {
      description += `, ${condition}`;
    }
    
    return description;
  }

  /**
   * Clear cache (useful for testing)
   */
  clearCache(): void {
    this.cache.data.clear();
    this.cache.timestamp = 0;
    console.log('🗑️ Weather cache cleared');
  }

  /**
   * Get cache status
   */
  getCacheStatus(): { size: number; age: number; valid: boolean } {
    const now = Date.now();
    const age = now - this.cache.timestamp;
    const valid = age <= this.cacheDuration;

    return {
      size: this.cache.data.size,
      age: Math.round(age / 1000), // seconds
      valid
    };
  }
}

// Singleton instance
export const multiLocationWeather = new MultiLocationWeatherService();
