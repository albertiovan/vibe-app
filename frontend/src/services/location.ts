/**
 * Location and Weather Services
 * Handles geolocation, weather data, and location context
 */

export interface LocationData {
  lat: number;
  lng: number;
  city?: string;
  country?: string;
  accuracy?: number;
}

export interface WeatherData {
  temperature: number;
  conditions: string;
  precipitation: number;
  windSpeed: number;
  visibility: number;
  recommendation: 'indoor' | 'covered' | 'outdoor';
}

export interface LocationOptions {
  enableHighAccuracy?: boolean;
  timeout?: number;
  maximumAge?: number;
}

/**
 * Get current user location with fallbacks
 */
export async function getCurrentLocation(options: LocationOptions = {}): Promise<LocationData> {
  const {
    enableHighAccuracy = true,
    timeout = 10000,
    maximumAge = 5 * 60 * 1000 // 5 minutes
  } = options;

  try {
    // Try browser geolocation first
    if ('geolocation' in navigator) {
      console.log('📍 Attempting browser geolocation...');
      
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(
          resolve,
          reject,
          { enableHighAccuracy, timeout, maximumAge }
        );
      });

      const location: LocationData = {
        lat: position.coords.latitude,
        lng: position.coords.longitude,
        accuracy: position.coords.accuracy
      };

      // Enrich with city/country info
      try {
        const enriched = await enrichLocationData(location);
        console.log('✅ Browser geolocation successful:', enriched);
        return enriched;
      } catch (error) {
        console.warn('⚠️ Location enrichment failed, using basic data');
        return location;
      }
    }
  } catch (error) {
    console.warn('⚠️ Browser geolocation failed:', error);
  }

  // Fallback to IP-based location
  try {
    console.log('📍 Falling back to IP-based location...');
    const ipLocation = await getIPLocation();
    console.log('✅ IP-based location successful:', ipLocation);
    return ipLocation;
  } catch (error) {
    console.warn('⚠️ IP-based location failed:', error);
  }

  // Final fallback to default location (Bucharest)
  console.log('📍 Using default location (Bucharest)');
  return {
    lat: 44.4268,
    lng: 26.1025,
    city: 'Bucharest',
    country: 'Romania'
  };
}

/**
 * Get weather data for location
 */
export async function getWeatherData(lat: number, lng: number): Promise<WeatherData | null> {
  try {
    console.log('🌤️ Fetching weather data...');
    
    const response = await fetch(`/api/weather/current?lat=${lat}&lng=${lng}`);
    
    if (!response.ok) {
      throw new Error(`Weather API failed: ${response.statusText}`);
    }

    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.error || 'Weather data unavailable');
    }

    const weather: WeatherData = {
      temperature: data.current.temperature,
      conditions: data.current.conditions,
      precipitation: data.current.precipitation,
      windSpeed: data.current.windSpeed,
      visibility: data.current.visibility,
      recommendation: determineWeatherRecommendation(data.current)
    };

    console.log('✅ Weather data retrieved:', weather);
    return weather;
  } catch (error) {
    console.error('❌ Weather data failed:', error);
    return null;
  }
}

/**
 * Enrich location data with city/country information
 */
async function enrichLocationData(location: LocationData): Promise<LocationData> {
  try {
    const response = await fetch(
      `/api/location/reverse?lat=${location.lat}&lng=${location.lng}`
    );

    if (!response.ok) {
      throw new Error('Reverse geocoding failed');
    }

    const data = await response.json();
    
    return {
      ...location,
      city: data.city,
      country: data.country
    };
  } catch (error) {
    console.warn('Location enrichment failed:', error);
    return location;
  }
}

/**
 * Get location from IP address
 */
async function getIPLocation(): Promise<LocationData> {
  try {
    const response = await fetch('/api/location/ip');
    
    if (!response.ok) {
      throw new Error('IP location failed');
    }

    const data = await response.json();
    
    return {
      lat: data.lat,
      lng: data.lng,
      city: data.city,
      country: data.country
    };
  } catch (error) {
    // Fallback to European cities
    const fallbackCities = [
      { lat: 44.4268, lng: 26.1025, city: 'Bucharest', country: 'Romania' },
      { lat: 52.5200, lng: 13.4050, city: 'Berlin', country: 'Germany' },
      { lat: 48.8566, lng: 2.3522, city: 'Paris', country: 'France' },
      { lat: 51.5074, lng: -0.1278, city: 'London', country: 'UK' },
      { lat: 41.9028, lng: 12.4964, city: 'Rome', country: 'Italy' }
    ];

    const randomCity = fallbackCities[Math.floor(Math.random() * fallbackCities.length)];
    console.log('📍 Using random European city fallback:', randomCity.city);
    
    return randomCity;
  }
}

/**
 * Determine weather recommendation based on conditions
 */
function determineWeatherRecommendation(weather: any): 'indoor' | 'covered' | 'outdoor' {
  const { temperature, precipitation, windSpeed, visibility } = weather;

  // Heavy rain or poor visibility
  if (precipitation > 5 || (visibility && visibility < 1000)) {
    return 'indoor';
  }

  // Light rain or strong wind
  if (precipitation > 1 || windSpeed > 25) {
    return 'covered';
  }

  // Extreme temperatures
  if (temperature < -5 || temperature > 35) {
    return 'indoor';
  }

  // Cold weather
  if (temperature < 5) {
    return 'covered';
  }

  // Good weather
  return 'outdoor';
}

/**
 * Calculate travel time estimate
 */
export function estimateTravelTime(distance: number, mode: 'walking' | 'driving' | 'transit' = 'driving'): number {
  const speeds = {
    walking: 5, // km/h
    driving: 30, // km/h in city
    transit: 20 // km/h average
  };

  return Math.round((distance / speeds[mode]) * 60); // minutes
}

/**
 * Check if location is within bounds
 */
export function isLocationWithinBounds(
  location: { lat: number; lng: number },
  center: { lat: number; lng: number },
  radiusKm: number
): boolean {
  const distance = calculateDistance(
    location.lat,
    location.lng,
    center.lat,
    center.lng
  );
  
  return distance <= radiusKm;
}

/**
 * Calculate distance between two points
 */
function calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLng/2) * Math.sin(dLng/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}
