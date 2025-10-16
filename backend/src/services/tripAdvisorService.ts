import { Activity, TripAdvisorResponse, TripAdvisorLocation, ActivityCategory, PriceLevel } from '../types';
import NodeCache from 'node-cache';

// Cache for 5 minutes to reduce API calls
const cache = new NodeCache({ stdTTL: 300 });

export class TripAdvisorService {
  private apiKey: string;
  private apiHost: string;
  private baseUrl: string;

  constructor() {
    this.apiKey = process.env.RAPIDAPI_KEY || '';
    this.apiHost = process.env.RAPIDAPI_HOST || 'travel-advisor.p.rapidapi.com';
    this.baseUrl = `https://${this.apiHost}`;
    
    if (!this.apiKey) {
      console.warn('RAPIDAPI_KEY not configured - TripAdvisor API will not work');
    }
  }

  public async searchActivities(
    location: string,
    categories?: ActivityCategory[],
    limit: number = 10
  ): Promise<Activity[]> {
    try {
      // Create cache key
      const cacheKey = `activities_${location}_${categories?.join(',') || 'all'}_${limit}`;
      const cached = cache.get<Activity[]>(cacheKey);
      
      if (cached) {
        return cached;
      }

      // First, get location ID
      const locationId = await this.getLocationId(location);
      if (!locationId) {
        return [];
      }

      // Then search for attractions/activities
      const activities = await this.getAttractions(locationId, limit);
      
      // Filter by categories if specified
      const filteredActivities = categories && categories.length > 0 
        ? activities.filter(activity => 
            categories.some(cat => activity.category === cat || activity.tags.includes(cat))
          )
        : activities;

      // Cache the results
      cache.set(cacheKey, filteredActivities);
      
      return filteredActivities.slice(0, limit);
    } catch (error) {
      console.error('TripAdvisor API error:', error);
      return [];
    }
  }

  private async getLocationId(location: string): Promise<string | null> {
    try {
      const cacheKey = `location_id_${location}`;
      const cached = cache.get<string>(cacheKey);
      
      if (cached) {
        console.log(`Using cached location ID for ${location}:`, cached);
        return cached;
      }

      const url = `${this.baseUrl}/locations/search?query=${encodeURIComponent(location)}&limit=1&offset=0&units=km&lang=en_US&currency=USD`;
      console.log('Searching for location:', location);
      console.log('TripAdvisor search URL:', url);

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'X-RapidAPI-Key': this.apiKey,
          'X-RapidAPI-Host': this.apiHost
        }
      });

      console.log('Location search response status:', response.status);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await this.safeJsonParse(response) as TripAdvisorResponse;
      console.log('Location search response data:', JSON.stringify(data, null, 2));
      
      if (data.data && data.data.length > 0) {
        const locationId = data.data[0]!.location_id;
        console.log(`Found location ID for ${location}:`, locationId);
        cache.set(cacheKey, locationId, 3600); // Cache for 1 hour
        return locationId;
      }

      console.log(`No location found for: ${location}`);
      return null;
    } catch (error) {
      console.error('Error getting location ID:', error);
      return null;
    }
  }

  private async getAttractions(locationId: string, limit: number): Promise<Activity[]> {
    try {
      const url = `${this.baseUrl}/attractions/list?location_id=${locationId}&currency=USD&lang=en_US&lunit=km&limit=${limit}&offset=0`;
      console.log('Fetching attractions for location ID:', locationId);
      console.log('TripAdvisor attractions URL:', url);

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'X-RapidAPI-Key': this.apiKey,
          'X-RapidAPI-Host': this.apiHost
        }
      });

      console.log('Attractions response status:', response.status);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await this.safeJsonParse(response) as TripAdvisorResponse;
      console.log('Attractions response data:', JSON.stringify(data, null, 2));
      
      const activities = data.data?.map(location => this.normalizeActivity(location)) || [];
      console.log(`Found ${activities.length} activities`);
      
      return activities;
    } catch (error) {
      console.error('Error getting attractions:', error);
      return [];
    }
  }

  private normalizeActivity(location: TripAdvisorLocation): Activity {
    // Map TripAdvisor data to our Activity interface
    const category = this.mapToCategory(location.subcategory);
    const priceLevel = this.mapPriceLevel(location.price_level);
    
    return {
      id: location.location_id,
      name: this.sanitizeString(location.name),
      description: this.sanitizeString(location.description || ''),
      category,
      location: {
        address: this.sanitizeString(location.address),
        city: this.extractCity(this.sanitizeString(location.address)),
        coordinates: {
          lat: parseFloat(location.latitude),
          lng: parseFloat(location.longitude)
        }
      },
      rating: location.rating ? parseFloat(location.rating) : undefined,
      priceLevel,
      imageUrl: location.photo?.images?.medium?.url,
      website: location.website,
      phone: this.sanitizeString(location.phone || ''),
      tags: this.generateTags(location)
    };
  }

  private mapToCategory(subcategories?: Array<{ name: string }>): ActivityCategory {
    if (!subcategories || subcategories.length === 0) {
      return 'entertainment';
    }

    const subcategoryName = subcategories[0]!.name.toLowerCase();
    
    // Map TripAdvisor subcategories to our categories
    if (subcategoryName.includes('museum') || subcategoryName.includes('historic')) {
      return 'cultural';
    }
    if (subcategoryName.includes('outdoor') || subcategoryName.includes('park')) {
      return 'outdoor';
    }
    if (subcategoryName.includes('food') || subcategoryName.includes('restaurant')) {
      return 'food';
    }
    if (subcategoryName.includes('spa') || subcategoryName.includes('wellness')) {
      return 'wellness';
    }
    if (subcategoryName.includes('adventure') || subcategoryName.includes('sport')) {
      return 'adventure';
    }
    if (subcategoryName.includes('art') || subcategoryName.includes('creative')) {
      return 'creative';
    }
    if (subcategoryName.includes('bar') || subcategoryName.includes('nightlife')) {
      return 'social';
    }
    
    return 'entertainment';
  }

  private mapPriceLevel(priceLevel?: string): PriceLevel | undefined {
    if (!priceLevel) return undefined;
    
    switch (priceLevel) {
      case '$': return 'budget';
      case '$$': return 'moderate';
      case '$$$':
      case '$$$$': return 'expensive';
      default: return 'budget';
    }
  }

  private extractCity(address: string): string {
    // Simple city extraction - take the part before the first comma
    const parts = address.split(',');
    return parts[parts.length - 2]?.trim() || parts[0]?.trim() || '';
  }

  private async safeJsonParse(response: Response): Promise<any> {
    try {
      // Get response as text first to handle potential UTF-8 issues
      const text = await response.text();
      
      // Check for invalid UTF-8 characters and log if found
      const invalidChars = text.match(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F-\u009F\uFFFD]/g);
      if (invalidChars) {
        console.warn('Invalid UTF-8 characters detected in API response:', invalidChars.length, 'characters');
      }
      
      // Sanitize invalid UTF-8 characters
      const sanitizedText = text.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F-\u009F]/g, '');
      
      // Parse the sanitized JSON
      return JSON.parse(sanitizedText);
    } catch (error) {
      console.error('JSON parsing error:', error);
      console.error('Response URL:', response.url);
      console.error('Response status:', response.status);
      throw new Error('Invalid JSON response from external API');
    }
  }

  private sanitizeString(str: string): string {
    if (!str) return '';
    // Remove invalid UTF-8 characters and normalize
    return str.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F-\u009F]/g, '')
              .replace(/[\uFFFD]/g, '') // Remove replacement characters
              .trim();
  }

  private generateTags(location: TripAdvisorLocation): string[] {
    const tags: string[] = [];
    
    // Add subcategory tags
    location.subcategory?.forEach(sub => {
      const sanitizedName = this.sanitizeString(sub.name);
      if (sanitizedName) {
        tags.push(sanitizedName.toLowerCase().replace(/\s+/g, '_'));
      }
    });

    // Add tags based on name and description
    const sanitizedName = this.sanitizeString(location.name);
    const sanitizedDesc = this.sanitizeString(location.description || '');
    const text = `${sanitizedName} ${sanitizedDesc}`.toLowerCase();
    
    const tagKeywords = [
      'museum', 'park', 'restaurant', 'bar', 'cafe', 'theater', 'gallery',
      'outdoor', 'indoor', 'historic', 'modern', 'family', 'romantic',
      'adventure', 'relaxing', 'cultural', 'artistic', 'scenic'
    ];

    tagKeywords.forEach(keyword => {
      if (text.includes(keyword)) {
        tags.push(keyword);
      }
    });

    return [...new Set(tags)].slice(0, 5); // Remove duplicates and limit
  }
}
