/**
 * Challenge Weather Service
 * Weather-aware scoring for outside-the-box destination suggestions
 */

export interface WeatherForecast {
  location: { lat: number; lng: number; city: string };
  forecast: {
    date: string;
    temperature: { min: number; max: number };
    conditions: string;
    precipitation: number;
    windSpeed: number;
    suitability: number; // 0-1 score
    badge: string; // "Perfect weather", "Light rain", etc.
  }[];
}

export interface TravelEstimate {
  distanceKm: number;
  estimatedMinutes: number;
  travelMode: 'drive' | 'transit';
  feasible: boolean;
}

export class ChallengeWeatherService {
  private readonly MAX_TRAVEL_DISTANCE = 200; // km
  private readonly AVG_DRIVING_SPEED = 80; // km/h for highway travel

  /**
   * Get weather forecast and suitability for challenge destinations
   */
  async getDestinationWeather(
    destinations: Array<{ lat: number; lng: number; city: string }>
  ): Promise<WeatherForecast[]> {
    const forecasts: WeatherForecast[] = [];

    for (const destination of destinations) {
      try {
        console.log('🌤️ Fetching weather for challenge destination:', destination.city);
        
        const forecast = await this.fetchOpenMeteoForecast(destination);
        forecasts.push(forecast);
        
      } catch (error) {
        console.warn('🌤️ Weather fetch failed for:', destination.city, error);
        
        // Fallback forecast
        forecasts.push({
          location: destination,
          forecast: [{
            date: new Date().toISOString().split('T')[0],
            temperature: { min: 10, max: 20 },
            conditions: 'unknown',
            precipitation: 0,
            windSpeed: 5,
            suitability: 0.7,
            badge: 'Weather unknown'
          }]
        });
      }
    }

    return forecasts;
  }

  /**
   * Calculate travel estimate between two points
   */
  calculateTravelEstimate(
    origin: { lat: number; lng: number },
    destination: { lat: number; lng: number }
  ): TravelEstimate {
    const distanceKm = this.calculateDistance(origin, destination);
    const estimatedMinutes = Math.round((distanceKm / this.AVG_DRIVING_SPEED) * 60);
    
    return {
      distanceKm: Math.round(distanceKm),
      estimatedMinutes,
      travelMode: 'drive',
      feasible: distanceKm <= this.MAX_TRAVEL_DISTANCE && estimatedMinutes <= 180 // Max 3h travel
    };
  }

  /**
   * Score weather suitability for activities
   */
  scoreWeatherSuitability(
    forecast: WeatherForecast['forecast'][0],
    activityType: string
  ): number {
    let score = 0.5; // Base score

    // Temperature suitability
    const avgTemp = (forecast.temperature.min + forecast.temperature.max) / 2;
    
    if (activityType.includes('outdoor') || activityType.includes('adventure')) {
      // Outdoor activities prefer moderate temperatures
      if (avgTemp >= 15 && avgTemp <= 25) score += 0.3;
      else if (avgTemp >= 10 && avgTemp <= 30) score += 0.1;
      else score -= 0.2;
    }

    if (activityType.includes('ski') || activityType.includes('winter')) {
      // Winter activities prefer cold weather
      if (avgTemp <= 5) score += 0.4;
      else if (avgTemp <= 10) score += 0.2;
      else score -= 0.3;
    }

    // Precipitation impact
    if (forecast.precipitation > 5) {
      if (activityType.includes('indoor') || activityType.includes('cultural')) {
        score += 0.1; // Rain is good for indoor activities
      } else {
        score -= 0.3; // Rain is bad for outdoor activities
      }
    } else if (forecast.precipitation === 0) {
      if (activityType.includes('outdoor')) {
        score += 0.2; // Clear weather is great for outdoor
      }
    }

    // Wind impact
    if (forecast.windSpeed > 20) {
      score -= 0.2; // High wind is generally bad
    } else if (forecast.windSpeed < 10) {
      score += 0.1; // Calm weather is generally good
    }

    return Math.max(0, Math.min(1, score));
  }

  /**
   * Generate weather badge for display
   */
  generateWeatherBadge(forecast: WeatherForecast['forecast'][0]): string {
    const avgTemp = Math.round((forecast.temperature.min + forecast.temperature.max) / 2);
    
    if (forecast.precipitation > 10) {
      return `🌧️ Rain ${avgTemp}°C`;
    } else if (forecast.precipitation > 0) {
      return `🌦️ Light rain ${avgTemp}°C`;
    } else if (forecast.conditions.includes('cloud')) {
      return `☁️ Cloudy ${avgTemp}°C`;
    } else {
      return `☀️ Clear ${avgTemp}°C`;
    }
  }

  /**
   * Fetch weather from OpenMeteo API
   */
  private async fetchOpenMeteoForecast(
    location: { lat: number; lng: number; city: string }
  ): Promise<WeatherForecast> {
    const url = `https://api.open-meteo.com/v1/forecast?` +
      `latitude=${location.lat}&longitude=${location.lng}` +
      `&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,windspeed_10m_max,weathercode` +
      `&forecast_days=3&timezone=auto`;

    const response = await fetch(url);
    const data = await response.json() as any;

    if (!data.daily) {
      throw new Error('No forecast data available');
    }

    const forecast = data.daily.time.slice(0, 3).map((date: string, index: number) => {
      const dayForecast = {
        date,
        temperature: {
          min: Math.round(data.daily.temperature_2m_min[index]),
          max: Math.round(data.daily.temperature_2m_max[index])
        },
        conditions: this.weatherCodeToCondition(data.daily.weathercode[index]),
        precipitation: data.daily.precipitation_sum[index] || 0,
        windSpeed: data.daily.windspeed_10m_max[index] || 0,
        suitability: 0.7, // Will be calculated based on activity
        badge: ''
      };

      dayForecast.badge = this.generateWeatherBadge(dayForecast);
      return dayForecast;
    });

    return {
      location,
      forecast
    };
  }

  /**
   * Convert OpenMeteo weather code to condition string
   */
  private weatherCodeToCondition(code: number): string {
    if (code === 0) return 'clear';
    if (code <= 3) return 'partly_cloudy';
    if (code <= 48) return 'cloudy';
    if (code <= 67) return 'rain';
    if (code <= 77) return 'snow';
    if (code <= 82) return 'showers';
    if (code <= 99) return 'thunderstorm';
    return 'unknown';
  }

  /**
   * Calculate distance between two points using Haversine formula
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
