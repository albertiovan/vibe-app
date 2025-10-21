/**
 * Weather Service (Frontend)
 * Fetches current weather for user's location
 */

const API_URL = __DEV__
  ? 'http://10.103.30.198:3000/api'
  : 'https://your-production-api.com/api';

export interface WeatherData {
  condition: string;
  temperature: number;
  precipitation?: number;
  windSpeed?: number;
  humidity?: number;
}

class WeatherService {
  /**
   * Get current weather using OpenMeteo (via our backend or directly)
   */
  async getCurrentWeather(lat: number, lng: number): Promise<WeatherData | null> {
    try {
      // Call OpenMeteo API directly (free, no key needed)
      const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current=temperature_2m,precipitation,wind_speed_10m,relative_humidity_2m,weather_code&timezone=auto`;
      
      // Use AbortController for timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      
      const response = await fetch(url, { signal: controller.signal });
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new Error('Weather API request failed');
      }
      
      const data = await response.json();
      
      if (!data.current) {
        return null;
      }
      
      return {
        condition: this.parseWeatherCode(data.current.weather_code),
        temperature: Math.round(data.current.temperature_2m || 0),
        precipitation: data.current.precipitation || 0,
        windSpeed: data.current.wind_speed_10m || 0,
        humidity: data.current.relative_humidity_2m || 0,
      };
    } catch (error) {
      console.error('Failed to fetch weather:', error);
      return null; // Graceful degradation - app still works without weather
    }
  }

  /**
   * Parse OpenMeteo weather codes into readable conditions
   */
  private parseWeatherCode(code: number): string {
    if (!code) return 'unknown';
    
    const weatherCodes: Record<number, string> = {
      0: 'clear',
      1: 'mainly_clear',
      2: 'partly_cloudy',
      3: 'overcast',
      45: 'fog',
      48: 'fog',
      51: 'drizzle',
      53: 'drizzle',
      55: 'drizzle',
      61: 'rain',
      63: 'rain',
      65: 'rain',
      71: 'snow',
      73: 'snow',
      75: 'snow',
      80: 'rain',
      81: 'rain',
      82: 'rain',
      95: 'thunderstorm',
      96: 'thunderstorm',
      99: 'thunderstorm',
    };
    
    return weatherCodes[code] || 'unknown';
  }
}

export const weatherService = new WeatherService();
