/**
 * Location Service
 * Handles geolocation, fallbacks, and distance calculations
 */

import { LocationContext } from '../../types/trails.js';

export class LocationService {
  // Default fallback locations for major cities
  private static readonly CITY_FALLBACKS: Record<string, { lat: number; lng: number; city: string; country: string }> = {
    bucharest: { lat: 44.4268, lng: 26.1025, city: 'Bucharest', country: 'Romania' },
    london: { lat: 51.5074, lng: -0.1278, city: 'London', country: 'UK' },
    paris: { lat: 48.8566, lng: 2.3522, city: 'Paris', country: 'France' },
    berlin: { lat: 52.5200, lng: 13.4050, city: 'Berlin', country: 'Germany' },
    madrid: { lat: 40.4168, lng: -3.7038, city: 'Madrid', country: 'Spain' },
    rome: { lat: 41.9028, lng: 12.4964, city: 'Rome', country: 'Italy' },
    amsterdam: { lat: 52.3676, lng: 4.9041, city: 'Amsterdam', country: 'Netherlands' },
    vienna: { lat: 48.2082, lng: 16.3738, city: 'Vienna', country: 'Austria' },
    prague: { lat: 50.0755, lng: 14.4378, city: 'Prague', country: 'Czech Republic' },
    budapest: { lat: 47.4979, lng: 19.0402, city: 'Budapest', country: 'Hungary' }
  };

  /**
   * Get user location with fallback strategy
   */
  static async getUserLocation(
    preferredCity?: string,
    requestGeolocation: boolean = true
  ): Promise<LocationContext> {
    // Try geolocation first if requested
    if (requestGeolocation) {
      try {
        const gpsLocation = await this.getGPSLocation();
        if (gpsLocation) {
          return gpsLocation;
        }
      } catch (error) {
        console.warn('⚠️ GPS location failed:', error);
      }
    }

    // Try IP-based location
    try {
      const ipLocation = await this.getIPLocation();
      if (ipLocation) {
        return ipLocation;
      }
    } catch (error) {
      console.warn('⚠️ IP location failed:', error);
    }

    // Fallback to preferred city or default
    const fallbackCity = preferredCity || 'bucharest';
    const fallback = this.CITY_FALLBACKS[fallbackCity.toLowerCase()] || this.CITY_FALLBACKS.bucharest;
    
    console.log('📍 Using fallback location:', fallback.city);
    
    return {
      coordinates: {
        lat: fallback.lat,
        lng: fallback.lng
      },
      source: 'fallback',
      city: fallback.city,
      country: fallback.country
    };
  }

  /**
   * Get GPS location (browser-based)
   * Note: This would typically be called from frontend, but included for completeness
   */
  private static async getGPSLocation(): Promise<LocationContext | null> {
    // This would be implemented on the frontend using navigator.geolocation
    // Backend version would need to be passed coordinates from frontend
    return null;
  }

  /**
   * Get approximate location from IP address
   */
  private static async getIPLocation(): Promise<LocationContext | null> {
    try {
      // Using a free IP geolocation service
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      
      const response = await fetch('https://ipapi.co/json/', {
        signal: controller.signal,
        headers: {
          'User-Agent': 'VibeApp/1.0'
        }
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new Error(`IP location API error: ${response.status}`);
      }
      
      const data = await response.json() as {
        latitude?: number;
        longitude?: number;
        city?: string;
        country_name?: string;
        timezone?: string;
      };
      
      if (data.latitude && data.longitude) {
        return {
          coordinates: {
            lat: data.latitude,
            lng: data.longitude
          },
          accuracy: 10000, // IP location is typically ~10km accurate
          source: 'network',
          city: data.city,
          country: data.country_name,
          timezone: data.timezone
        };
      }
    } catch (error) {
      console.warn('⚠️ IP geolocation failed:', error);
    }
    
    return null;
  }

  /**
   * Calculate distance between two points (Haversine formula)
   */
  static calculateDistance(
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
    return R * c; // Distance in kilometers
  }

  /**
   * Calculate travel time estimate
   */
  static estimateTravelTime(
    distance: number,
    mode: 'walking' | 'cycling' | 'driving' = 'walking'
  ): number {
    const speeds = {
      walking: 5, // km/h
      cycling: 15, // km/h
      driving: 30 // km/h in city
    };
    
    const speed = speeds[mode];
    return Math.round((distance / speed) * 60); // minutes
  }

  /**
   * Create bounding box around a point
   */
  static createBoundingBox(
    center: { lat: number; lng: number },
    radiusKm: number
  ): { north: number; south: number; east: number; west: number } {
    const latDelta = radiusKm / 111.32; // 1 degree lat ≈ 111.32 km
    const lngDelta = radiusKm / (111.32 * Math.cos(this.toRadians(center.lat)));
    
    return {
      north: center.lat + latDelta,
      south: center.lat - latDelta,
      east: center.lng + lngDelta,
      west: center.lng - lngDelta
    };
  }

  /**
   * Filter items by distance from location
   */
  static filterByDistance<T extends { location: { lat: number; lng: number } }>(
    items: T[],
    userLocation: { lat: number; lng: number },
    maxDistanceKm: number
  ): Array<T & { distance: number; travelTime: number }> {
    return items
      .map(item => {
        const distance = this.calculateDistance(userLocation, item.location);
        const travelTime = this.estimateTravelTime(distance);
        
        return {
          ...item,
          distance,
          travelTime
        };
      })
      .filter(item => item.distance <= maxDistanceKm)
      .sort((a, b) => a.distance - b.distance);
  }

  /**
   * Get nearby cities for fallback options
   */
  static getNearbyFallbacks(
    location: { lat: number; lng: number },
    maxDistanceKm: number = 200
  ): Array<{ city: string; country: string; distance: number }> {
    return Object.values(this.CITY_FALLBACKS)
      .map(fallback => ({
        city: fallback.city,
        country: fallback.country,
        distance: this.calculateDistance(location, fallback)
      }))
      .filter(fallback => fallback.distance <= maxDistanceKm)
      .sort((a, b) => a.distance - b.distance);
  }

  /**
   * Validate coordinates
   */
  static isValidCoordinates(lat: number, lng: number): boolean {
    return lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180;
  }

  /**
   * Get location context with enriched information
   */
  static async getEnrichedLocation(
    lat: number,
    lng: number,
    source: LocationContext['source'] = 'fallback'
  ): Promise<LocationContext> {
    if (!this.isValidCoordinates(lat, lng)) {
      throw new Error('Invalid coordinates provided');
    }

    // Try to get city/country information
    let city: string | undefined;
    let country: string | undefined;
    let timezone: string | undefined;

    try {
      // Use reverse geocoding to get location details
      const locationInfo = await this.reverseGeocode(lat, lng);
      city = locationInfo?.city;
      country = locationInfo?.country;
      timezone = locationInfo?.timezone;
    } catch (error) {
      console.warn('⚠️ Reverse geocoding failed:', error);
    }

    return {
      coordinates: { lat, lng },
      source,
      city,
      country,
      timezone
    };
  }

  /**
   * Reverse geocode coordinates to get location information
   */
  private static async reverseGeocode(
    lat: number,
    lng: number
  ): Promise<{ city?: string; country?: string; timezone?: string } | null> {
    try {
      // Using OpenStreetMap Nominatim for reverse geocoding (free)
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&addressdetails=1`,
        {
          headers: {
            'User-Agent': 'VibeApp/1.0 (Location Services)'
          }
        }
      );

      if (!response.ok) {
        throw new Error(`Nominatim API error: ${response.status}`);
      }

      const data = await response.json() as {
        address?: {
          city?: string;
          town?: string;
          village?: string;
          country?: string;
        };
      };
      
      if (data.address) {
        return {
          city: data.address.city || data.address.town || data.address.village,
          country: data.address.country,
          timezone: undefined // Nominatim doesn't provide timezone
        };
      }
    } catch (error) {
      console.warn('⚠️ Reverse geocoding failed:', error);
    }

    return null;
  }

  /**
   * Convert degrees to radians
   */
  private static toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  /**
   * Get default location for the app (Bucharest)
   */
  static getDefaultLocation(): LocationContext {
    const fallback = this.CITY_FALLBACKS.bucharest;
    return {
      coordinates: {
        lat: fallback.lat,
        lng: fallback.lng
      },
      source: 'fallback',
      city: fallback.city,
      country: fallback.country
    };
  }

  /**
   * Check if location is within supported region
   */
  static isSupportedRegion(location: { lat: number; lng: number }): boolean {
    // Define supported regions (Europe for now)
    const europeBounds = {
      north: 71.0,  // Northern Norway
      south: 35.0,  // Southern Spain/Greece
      east: 40.0,   // Eastern Europe
      west: -10.0   // Western Ireland/Portugal
    };

    return location.lat >= europeBounds.south &&
           location.lat <= europeBounds.north &&
           location.lng >= europeBounds.west &&
           location.lng <= europeBounds.east;
  }
}
