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
        return cached;
      }

      const response = await fetch(
        `${this.baseUrl}/locations/search?query=${encodeURIComponent(location)}&limit=1&offset=0&units=km&lang=en_US&currency=USD`,
        {
          method: 'GET',
          headers: {
            'X-RapidAPI-Key': this.apiKey,
            'X-RapidAPI-Host': this.apiHost
          }
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json() as TripAdvisorResponse;
      
      if (data.data && data.data.length > 0) {
        const locationId = data.data[0]!.location_id;
        cache.set(cacheKey, locationId, 3600); // Cache for 1 hour
        return locationId;
      }

      return null;
    } catch (error) {
      console.error('Error getting location ID:', error);
      return null;
    }
  }

  private async getAttractions(locationId: string, limit: number): Promise<Activity[]> {
    try {
      const response = await fetch(
        `${this.baseUrl}/attractions/list?location_id=${locationId}&currency=USD&lang=en_US&lunit=km&limit=${limit}&offset=0`,
        {
          method: 'GET',
          headers: {
            'X-RapidAPI-Key': this.apiKey,
            'X-RapidAPI-Host': this.apiHost
          }
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json() as TripAdvisorResponse;
      
      return data.data?.map(location => this.normalizeActivity(location)) || [];
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
      name: location.name,
      description: location.description || '',
      category,
      location: {
        address: location.address,
        city: this.extractCity(location.address),
        coordinates: {
          lat: parseFloat(location.latitude),
          lng: parseFloat(location.longitude)
        }
      },
      rating: location.rating ? parseFloat(location.rating) : undefined,
      priceLevel,
      imageUrl: location.photo?.images?.medium?.url,
      website: location.website,
      phone: location.phone,
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

  private generateTags(location: TripAdvisorLocation): string[] {
    const tags: string[] = [];
    
    // Add subcategory tags
    location.subcategory?.forEach(sub => {
      tags.push(sub.name.toLowerCase().replace(/\s+/g, '_'));
    });

    // Add tags based on name and description
    const text = `${location.name} ${location.description || ''}`.toLowerCase();
    
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
