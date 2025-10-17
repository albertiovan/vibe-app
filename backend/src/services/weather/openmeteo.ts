/**
 * OpenMeteo Weather Service
 * Provides current weather and hourly forecasts with no API key required
 */

import { WeatherCondition, WeatherForecast, WeatherGating } from '../../types/trails.js';

export class OpenMeteoService {
  private baseUrl = 'https://api.open-meteo.com/v1';
  private timeout = 8000; // 8 seconds

  /**
   * Get current weather for location
   */
  async getCurrentWeather(lat: number, lng: number): Promise<WeatherCondition | null> {
    try {
      const url = `${this.baseUrl}/forecast?latitude=${lat}&longitude=${lng}&current=temperature_2m,precipitation,wind_speed_10m,wind_direction_10m,relative_humidity_2m,visibility,weather_code&timezone=auto`;
      
      console.log('🌤️ Fetching current weather:', { lat, lng });
      
      const response = await this.fetchWithTimeout(url);
      const data = await response.json();
      
      if (!data.current) {
        throw new Error('No current weather data available');
      }
      
      return this.parseCurrentWeather(data.current);
    } catch (error) {
      console.error('❌ Failed to fetch current weather:', error);
      return null;
    }
  }

  /**
   * Get hourly forecast for next 24 hours
   */
  async getHourlyForecast(lat: number, lng: number): Promise<WeatherCondition[]> {
    try {
      const url = `${this.baseUrl}/forecast?latitude=${lat}&longitude=${lng}&hourly=temperature_2m,precipitation,wind_speed_10m,wind_direction_10m,relative_humidity_2m,visibility,weather_code&forecast_days=1&timezone=auto`;
      
      const response = await this.fetchWithTimeout(url);
      const data = await response.json();
      
      if (!data.hourly) {
        throw new Error('No hourly forecast data available');
      }
      
      return this.parseHourlyForecast(data.hourly);
    } catch (error) {
      console.error('❌ Failed to fetch hourly forecast:', error);
      return [];
    }
  }

  /**
   * Get complete weather forecast (current + hourly)
   */
  async getWeatherForecast(lat: number, lng: number): Promise<WeatherForecast | null> {
    try {
      const [current, hourly] = await Promise.all([
        this.getCurrentWeather(lat, lng),
        this.getHourlyForecast(lat, lng)
      ]);
      
      if (!current) {
        return null;
      }
      
      return {
        current,
        hourly,
        location: { lat, lng },
        source: 'openmeteo'
      };
    } catch (error) {
      console.error('❌ Failed to fetch weather forecast:', error);
      return null;
    }
  }

  /**
   * Analyze weather conditions for activity recommendations
   */
  analyzeWeatherGating(weather: WeatherCondition): WeatherGating {
    const heavyRain = weather.precipitation > 5; // > 5mm/hour
    const strongWind = weather.windSpeed > 30; // > 30km/h
    const extremeTemp = weather.temperature < -10 || weather.temperature > 35;
    const poorVisibility = (weather.visibility || 10) < 1; // < 1km
    
    let recommendation: WeatherGating['recommendation'] = 'outdoor';
    
    if (heavyRain || strongWind || extremeTemp || poorVisibility) {
      if (heavyRain || poorVisibility) {
        recommendation = 'indoor';
      } else if (strongWind || extremeTemp) {
        recommendation = 'covered';
      }
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
   * Get weather-appropriate activity suggestions
   */
  getWeatherBasedSuggestions(weather: WeatherCondition): {
    recommended: string[];
    avoid: string[];
    conditions: string;
  } {
    const gating = this.analyzeWeatherGating(weather);
    const recommended: string[] = [];
    const avoid: string[] = [];
    
    if (gating.recommendation === 'indoor') {
      recommended.push('museums', 'galleries', 'shopping', 'indoor_climbing', 'escape_rooms');
      avoid.push('hiking', 'cycling', 'outdoor_sports', 'picnics');
    } else if (gating.recommendation === 'covered') {
      recommended.push('covered_markets', 'indoor_activities', 'cafes', 'libraries');
      avoid.push('water_activities', 'mountain_activities', 'long_hikes');
    } else {
      recommended.push('hiking', 'cycling', 'parks', 'outdoor_sports', 'sightseeing');
      
      // Weather-specific recommendations
      if (weather.temperature > 25) {
        recommended.push('water_activities', 'swimming', 'shaded_areas');
      }
      if (weather.temperature < 5) {
        recommended.push('winter_sports', 'hot_drinks', 'indoor_warmth');
      }
    }
    
    const conditions = this.describeWeatherConditions(weather);
    
    return { recommended, avoid, conditions };
  }

  /**
   * Fetch with timeout
   */
  private async fetchWithTimeout(url: string): Promise<Response> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);
    
    try {
      const response = await fetch(url, {
        signal: controller.signal,
        headers: {
          'User-Agent': 'VibeApp/1.0 (Weather-Aware Activity Recommendations)'
        }
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new Error(`OpenMeteo API error: ${response.status} ${response.statusText}`);
      }
      
      return response;
    } catch (error) {
      clearTimeout(timeoutId);
      throw error;
    }
  }

  /**
   * Parse current weather data
   */
  private parseCurrentWeather(current: any): WeatherCondition {
    return {
      timestamp: new Date(current.time || Date.now()),
      temperature: current.temperature_2m || 0,
      precipitation: current.precipitation || 0,
      windSpeed: current.wind_speed_10m || 0,
      windDirection: current.wind_direction_10m,
      humidity: current.relative_humidity_2m,
      visibility: current.visibility,
      conditions: this.parseWeatherCode(current.weather_code),
      uvIndex: current.uv_index
    };
  }

  /**
   * Parse hourly forecast data
   */
  private parseHourlyForecast(hourly: any): WeatherCondition[] {
    const times = hourly.time || [];
    const temperatures = hourly.temperature_2m || [];
    const precipitation = hourly.precipitation || [];
    const windSpeeds = hourly.wind_speed_10m || [];
    const windDirections = hourly.wind_direction_10m || [];
    const humidity = hourly.relative_humidity_2m || [];
    const visibility = hourly.visibility || [];
    const weatherCodes = hourly.weather_code || [];
    
    const forecast: WeatherCondition[] = [];
    
    for (let i = 0; i < Math.min(24, times.length); i++) {
      forecast.push({
        timestamp: new Date(times[i]),
        temperature: temperatures[i] || 0,
        precipitation: precipitation[i] || 0,
        windSpeed: windSpeeds[i] || 0,
        windDirection: windDirections[i],
        humidity: humidity[i],
        visibility: visibility[i],
        conditions: this.parseWeatherCode(weatherCodes[i])
      });
    }
    
    return forecast;
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
      48: 'depositing_rime_fog',
      51: 'light_drizzle',
      53: 'moderate_drizzle',
      55: 'dense_drizzle',
      56: 'light_freezing_drizzle',
      57: 'dense_freezing_drizzle',
      61: 'slight_rain',
      63: 'moderate_rain',
      65: 'heavy_rain',
      66: 'light_freezing_rain',
      67: 'heavy_freezing_rain',
      71: 'slight_snow',
      73: 'moderate_snow',
      75: 'heavy_snow',
      77: 'snow_grains',
      80: 'slight_rain_showers',
      81: 'moderate_rain_showers',
      82: 'violent_rain_showers',
      85: 'slight_snow_showers',
      86: 'heavy_snow_showers',
      95: 'thunderstorm',
      96: 'thunderstorm_with_hail',
      99: 'thunderstorm_with_heavy_hail'
    };
    
    return weatherCodes[code] || 'unknown';
  }

  /**
   * Describe weather conditions in human-readable format
   */
  private describeWeatherConditions(weather: WeatherCondition): string {
    const temp = Math.round(weather.temperature);
    const conditions = weather.conditions.replace(/_/g, ' ');
    
    let description = `${temp}°C, ${conditions}`;
    
    if (weather.precipitation > 0) {
      description += `, ${weather.precipitation.toFixed(1)}mm rain`;
    }
    
    if (weather.windSpeed > 15) {
      description += `, windy (${Math.round(weather.windSpeed)}km/h)`;
    }
    
    return description;
  }

  /**
   * Check if weather is suitable for outdoor activities
   */
  isOutdoorFriendly(weather: WeatherCondition): boolean {
    const gating = this.analyzeWeatherGating(weather);
    return gating.recommendation === 'outdoor';
  }

  /**
   * Get weather summary for the next few hours
   */
  getWeatherSummary(forecast: WeatherCondition[]): {
    trend: 'improving' | 'worsening' | 'stable';
    nextHours: string;
    recommendation: string;
  } {
    if (forecast.length < 3) {
      return {
        trend: 'stable',
        nextHours: 'Limited forecast data',
        recommendation: 'Check current conditions'
      };
    }
    
    const current = forecast[0];
    const next3Hours = forecast.slice(1, 4);
    
    // Analyze trend
    const avgTemp = next3Hours.reduce((sum, w) => sum + w.temperature, 0) / next3Hours.length;
    const avgPrecip = next3Hours.reduce((sum, w) => sum + w.precipitation, 0) / next3Hours.length;
    
    let trend: 'improving' | 'worsening' | 'stable' = 'stable';
    
    if (avgPrecip < current.precipitation * 0.5 && avgTemp > current.temperature - 2) {
      trend = 'improving';
    } else if (avgPrecip > current.precipitation * 1.5 || avgTemp < current.temperature - 5) {
      trend = 'worsening';
    }
    
    const nextHours = `Next 3h: ${Math.round(avgTemp)}°C, ${avgPrecip.toFixed(1)}mm rain`;
    
    let recommendation = 'Good for outdoor activities';
    if (avgPrecip > 2) {
      recommendation = 'Consider indoor activities';
    } else if (trend === 'improving') {
      recommendation = 'Weather improving - good time for outdoor plans';
    } else if (trend === 'worsening') {
      recommendation = 'Weather may worsen - plan accordingly';
    }
    
    return { trend, nextHours, recommendation };
  }
}
