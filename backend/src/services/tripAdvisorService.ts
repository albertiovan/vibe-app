import { Activity, TripAdvisorResponse, TripAdvisorLocation, ActivityCategory, PriceLevel } from '../types/index.js';
import { rapidApiClient, TripAdvisorPingResponse, TripAdvisorSearchResponse } from '../clients/rapidapi.js';
import { rapidApiConfig } from '../config/rapidapi.js';
import { locationResolver } from './locationResolver.js';
import NodeCache from 'node-cache';

// Cache for 5 minutes to reduce API calls
const cache = new NodeCache({ stdTTL: 300 });

export class TripAdvisorService {
  constructor() {
    if (!rapidApiConfig.isEnabled) {
      console.warn('RAPIDAPI_KEY not configured - TripAdvisor API will not work');
    }
  }

  /**
   * Health check / ping endpoint for TripAdvisor API connectivity
   * Uses a safe, read-only endpoint to verify API access
   */
  public async ping(): Promise<TripAdvisorPingResponse> {
    try {
      if (!rapidApiClient) {
        return {
          ok: false,
          provider: 'TripAdvisor (travel-advisor.p.rapidapi.com)',
          timestamp: new Date().toISOString(),
          quotaHeaders: {},
          sampleData: { error: 'RapidAPI client not configured' },
        };
      }

      // Try different endpoints based on the API provider
      // DataCrawler TripAdvisor uses different endpoints than Travel Advisor
      let response;
      const host = rapidApiConfig.tripAdvisorHost;
      
      if (host.includes('tripadvisor16')) {
        // DataCrawler TripAdvisor API - try a restaurant search endpoint
        response = await rapidApiClient.get<any>('/api/v1/restaurant/searchRestaurants', {
          locationId: '304554' // Paris location ID
        });
      } else {
        // Travel Advisor API - use location search
        response = await rapidApiClient.get<TripAdvisorSearchResponse>('/locations/search', {
          query: 'Paris',
          limit: '1',
          offset: '0',
          units: 'km',
          lang: 'en_US',
          currency: 'USD',
        });
      }

      // Extract quota information from headers
      const quotaHeaders: Record<string, string> = {};
      Object.entries(response.headers).forEach(([key, value]) => {
        if (key.toLowerCase().includes('ratelimit') || key.toLowerCase().includes('quota')) {
          quotaHeaders[key] = value;
        }
      });

      // Manually trigger quota monitoring with all available headers
      if (rapidApiClient) {
        rapidApiClient.monitorQuotaUsage(quotaHeaders);
      }

      return {
        ok: true,
        provider: 'TripAdvisor (travel-advisor.p.rapidapi.com)',
        timestamp: new Date().toISOString(),
        quotaHeaders,
        sampleData: {
          status: response.status,
          dataLength: response.data?.data?.length || 0,
          firstResult: response.data?.data?.[0]?.name || null,
        },
      };

    } catch (error: any) {
      console.error('TripAdvisor ping failed:', error);
      
      return {
        ok: false,
        provider: 'TripAdvisor (travel-advisor.p.rapidapi.com)',
        timestamp: new Date().toISOString(),
        quotaHeaders: {},
        sampleData: {
          error: error.message || 'Unknown error',
          status: error.status || 0,
        },
      };
    }
  }

  public async searchActivities(
    location: string,
    categories?: ActivityCategory[],
    limit: number = 10
  ): Promise<Activity[]> {
    try {
      // If no location provided, use default city
      const searchLocation = location || rapidApiConfig.defaultCity;
      
      // Create cache key
      const cacheKey = `activities_${searchLocation}_${categories?.join(',') || 'all'}_${limit}`;
      const cached = cache.get<Activity[]>(cacheKey);
      
      if (cached) {
        console.log(`📦 Using cached activities for ${searchLocation}`);
        return cached;
      }

      // First, get location ID
      const locationId = await this.getLocationId(searchLocation);
      if (!locationId) {
        console.log(`❌ Could not resolve location ID for ${searchLocation}`);
        return [];
      }

      // Then search for attractions/activities
      const activities = await this.getAttractions(locationId, limit);
      
      console.log(`🔍 Raw activities from API: ${activities.length}`);
      console.log(`📂 Requested categories: ${categories?.join(', ') || 'none'}`);
      console.log(`🏷️ Activity categories: ${activities.map(a => a.category).join(', ')}`);
      
      // Filter by categories if specified - but be more flexible
      // If no food category is requested but we only have restaurants, include them anyway
      const filteredActivities = categories && categories.length > 0 
        ? (() => {
            const matchingActivities = activities.filter(activity => 
              categories.some(cat => activity.category === cat || activity.tags.includes(cat))
            );
            
            // If no activities match the requested categories but we have food activities,
            // include some food activities as they can be adventurous/cultural experiences
            if (matchingActivities.length === 0 && activities.some(a => a.category === 'food')) {
              console.log('🍽️ No exact category matches, including food activities as cultural experiences');
              return activities.slice(0, Math.min(5, activities.length)); // Include some restaurants
            }
            
            return matchingActivities;
          })()
        : activities;

      console.log(`✅ Filtered activities: ${filteredActivities.length}`);

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
      // Use the location resolver to get proper location IDs
      // This will default to Bucharest if the location can't be resolved
      const locationId = await locationResolver.resolveCityToLocationId(location);
      
      console.log(`📍 Resolved location "${location}" to ID: ${locationId}`);
      return locationId;

    } catch (error) {
      console.error('Error getting location ID:', error);
      // Fallback to default Bucharest location
      console.log(`🔄 Using default location ID: ${rapidApiConfig.defaultLocationId}`);
      return rapidApiConfig.defaultLocationId;
    }
  }

  private async getAttractions(locationId: string, limit: number): Promise<Activity[]> {
    try {
      if (!rapidApiClient) {
        console.warn('RapidAPI client not available');
        return [];
      }

      console.log('Fetching restaurants for location ID:', locationId);

      // Use the restaurant search endpoint that we know works
      const response = await rapidApiClient.get<any>('/api/v1/restaurant/searchRestaurants', {
        locationId: locationId,
      });

      console.log('Restaurant response status:', response.status);
      console.log('Restaurant response data length:', JSON.stringify(response.data).length);
      
      // Parse the restaurant data and convert to activities
      const restaurants = response.data?.data?.data || [];
      const activities = restaurants.slice(0, limit).map((restaurant: any) => this.normalizeRestaurantToActivity(restaurant));
      
      console.log(`Found ${activities.length} restaurant activities`);
      
      return activities;
    } catch (error) {
      console.error('Error getting restaurants:', error);
      return [];
    }
  }

  private normalizeRestaurantToActivity(restaurant: any): Activity {
    // Convert restaurant data from DataCrawler API to our Activity interface
    return {
      id: restaurant.location_id || restaurant.restaurantsId || Math.random().toString(),
      name: this.sanitizeString(restaurant.name || 'Restaurant'),
      description: this.sanitizeString(restaurant.description || restaurant.cuisine?.map((c: any) => c.name).join(', ') || 'Great dining experience'),
      category: 'food' as ActivityCategory,
      location: {
        address: this.sanitizeString(restaurant.address || restaurant.address_obj?.address_string || ''),
        city: this.extractCity(restaurant.address || restaurant.address_obj?.city || ''),
        coordinates: {
          lat: parseFloat(restaurant.latitude || '0'),
          lng: parseFloat(restaurant.longitude || '0')
        }
      },
      rating: restaurant.rating ? parseFloat(restaurant.rating) : undefined,
      priceLevel: this.mapPriceLevel(restaurant.price_level || restaurant.price),
      imageUrl: restaurant.photo?.images?.medium?.url || restaurant.heroImgUrl,
      website: restaurant.website,
      phone: this.sanitizeString(restaurant.phone || ''),
      tags: this.generateRestaurantTags(restaurant)
    };
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


  private sanitizeString(str: string): string {
    if (!str) return '';
    // Remove invalid UTF-8 characters and normalize
    return str.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F-\u009F]/g, '')
              .replace(/[\uFFFD]/g, '') // Remove replacement characters
              .trim();
  }

  private generateRestaurantTags(restaurant: any): string[] {
    const tags: string[] = [];
    
    // Add cuisine tags
    if (restaurant.cuisine) {
      restaurant.cuisine.forEach((cuisine: any) => {
        const cuisineName = this.sanitizeString(cuisine.name || cuisine);
        if (cuisineName) {
          tags.push(cuisineName.toLowerCase().replace(/\s+/g, '_'));
        }
      });
    }

    // Add tags based on name and description
    const sanitizedName = this.sanitizeString(restaurant.name || '');
    const sanitizedDesc = this.sanitizeString(restaurant.description || '');
    const text = `${sanitizedName} ${sanitizedDesc}`.toLowerCase();
    
    const tagKeywords = [
      'restaurant', 'bar', 'cafe', 'bistro', 'fine_dining', 'casual',
      'family', 'romantic', 'outdoor', 'terrace', 'traditional', 'modern'
    ];

    tagKeywords.forEach(keyword => {
      if (text.includes(keyword)) {
        tags.push(keyword);
      }
    });

    // Add price level as tag
    if (restaurant.price_level || restaurant.price) {
      tags.push('price_' + (restaurant.price_level || restaurant.price).toLowerCase());
    }

    return [...new Set(tags)].slice(0, 5); // Remove duplicates and limit
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
