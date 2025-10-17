/**
 * OpenTripMap Provider for Outdoor Activities and POIs
 * Fetches natural attractions, parks, viewpoints, and outdoor activities
 */

import { OutdoorPOI, OPENTRIPMAP_KINDS } from '../../types/trails.js';

export class OpenTripMapProvider {
  private baseUrl = 'https://api.opentripmap.com/0.1/en/places';
  private timeout = 10000; // 10 seconds

  /**
   * Search for outdoor POIs by geographic radius
   */
  async searchByGeo(
    lat: number,
    lng: number,
    radius: number = 10000, // meters
    kinds: string[] = ['natural', 'parks', 'amusements', 'sport']
  ): Promise<OutdoorPOI[]> {
    try {
      const kindsParam = kinds.join(',');
      const url = `${this.baseUrl}/radius?radius=${radius}&lon=${lng}&lat=${lat}&kinds=${kindsParam}&format=json&limit=100`;
      
      console.log('🗺️ Fetching OpenTripMap POIs:', { lat, lng, radius, kinds });
      
      const response = await this.fetchWithTimeout(url);
      const data = await response.json();
      
      if (!Array.isArray(data)) {
        console.warn('⚠️ OpenTripMap returned non-array response:', data);
        return [];
      }
      
      const pois = await Promise.all(
        data.map(async (item: any) => {
          try {
            return await this.enrichPOI(item);
          } catch (error) {
            console.warn('⚠️ Failed to enrich POI:', item.xid, error);
            return this.parseBasicPOI(item);
          }
        })
      );
      
      return pois.filter(poi => poi !== null) as OutdoorPOI[];
    } catch (error) {
      console.error('❌ OpenTripMap search failed:', error);
      return [];
    }
  }

  /**
   * Get detailed information for a specific POI
   */
  async getDetails(xid: string): Promise<OutdoorPOI | null> {
    try {
      const url = `${this.baseUrl}/xid/${xid}?format=json`;
      
      const response = await this.fetchWithTimeout(url);
      const data = await response.json();
      
      return this.parseDetailedPOI(data);
    } catch (error) {
      console.error('❌ Failed to fetch OpenTripMap details:', error);
      return null;
    }
  }

  /**
   * Search for specific outdoor activity types
   */
  async searchOutdoorActivities(
    lat: number,
    lng: number,
    radius: number = 15000,
    activityType: 'natural' | 'adventure' | 'parks' | 'viewpoints' = 'natural'
  ): Promise<OutdoorPOI[]> {
    const kindsMap = {
      natural: ['natural', 'geological_formations', 'water', 'protected_areas'],
      adventure: ['amusements', 'sport', 'climbing', 'other_hotels'], // viewpoints often in other_hotels
      parks: ['parks', 'gardens', 'protected_areas'],
      viewpoints: ['other_hotels', 'natural', 'historic'] // viewpoints can be in various categories
    };
    
    const kinds = kindsMap[activityType] || ['natural'];
    return this.searchByGeo(lat, lng, radius, kinds);
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
          'User-Agent': 'VibeApp/1.0 (Outdoor Activities Discovery)'
        }
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new Error(`OpenTripMap API error: ${response.status} ${response.statusText}`);
      }
      
      return response;
    } catch (error) {
      clearTimeout(timeoutId);
      throw error;
    }
  }

  /**
   * Enrich POI with detailed information
   */
  private async enrichPOI(basicPOI: any): Promise<OutdoorPOI | null> {
    if (!basicPOI.xid) {
      return this.parseBasicPOI(basicPOI);
    }
    
    try {
      const details = await this.getDetails(basicPOI.xid);
      return details;
    } catch (error) {
      // Fallback to basic POI if enrichment fails
      return this.parseBasicPOI(basicPOI);
    }
  }

  /**
   * Parse basic POI from search results
   */
  private parseBasicPOI(item: any): OutdoorPOI | null {
    if (!item.point || !item.point.lat || !item.point.lon) {
      return null;
    }
    
    const category = this.categorizeKinds(item.kinds);
    const name = item.name || 'Unnamed Location';
    
    return {
      id: `otm_${item.xid || item.osm || Date.now()}`,
      name,
      category: category.main,
      subcategory: category.sub,
      location: {
        lat: item.point.lat,
        lng: item.point.lon
      },
      tags: this.extractTags(item.kinds),
      source: 'opentripmap'
    };
  }

  /**
   * Parse detailed POI information
   */
  private parseDetailedPOI(data: any): OutdoorPOI | null {
    if (!data.point || !data.point.lat || !data.point.lon) {
      return null;
    }
    
    const category = this.categorizeKinds(data.kinds);
    const name = data.name || 'Unnamed Location';
    const description = this.extractDescription(data);
    const rating = this.extractRating(data);
    const amenities = this.extractAmenities(data);
    
    return {
      id: `otm_${data.xid}`,
      name,
      category: category.main,
      subcategory: category.sub,
      location: {
        lat: data.point.lat,
        lng: data.point.lon
      },
      description,
      rating,
      tags: this.extractTags(data.kinds),
      amenities,
      source: 'opentripmap'
    };
  }

  /**
   * Categorize OpenTripMap kinds into our POI categories
   */
  private categorizeKinds(kinds: string): { main: OutdoorPOI['category']; sub?: string } {
    if (!kinds) return { main: 'natural' };
    
    const kindsLower = kinds.toLowerCase();
    
    // Natural features
    if (kindsLower.includes('natural') || 
        kindsLower.includes('geological') || 
        kindsLower.includes('water') ||
        kindsLower.includes('beaches') ||
        kindsLower.includes('islands')) {
      return { main: 'natural', sub: this.extractSubcategory(kindsLower, 'natural') };
    }
    
    // Parks and gardens
    if (kindsLower.includes('parks') || 
        kindsLower.includes('gardens') ||
        kindsLower.includes('protected_areas')) {
      return { main: 'park', sub: this.extractSubcategory(kindsLower, 'park') };
    }
    
    // Viewpoints and scenic spots
    if (kindsLower.includes('towers') || 
        kindsLower.includes('observation') ||
        kindsLower.includes('viewpoints') ||
        kindsLower.includes('lighthouses')) {
      return { main: 'viewpoint', sub: 'scenic' };
    }
    
    // Recreation and adventure
    if (kindsLower.includes('amusements') || 
        kindsLower.includes('sport') ||
        kindsLower.includes('climbing') ||
        kindsLower.includes('winter_sports')) {
      return { main: 'recreation', sub: this.extractSubcategory(kindsLower, 'recreation') };
    }
    
    // Adventure activities
    if (kindsLower.includes('extreme_sports') ||
        kindsLower.includes('adventure') ||
        kindsLower.includes('climbing')) {
      return { main: 'adventure', sub: 'extreme' };
    }
    
    return { main: 'natural' }; // default
  }

  /**
   * Extract subcategory from kinds string
   */
  private extractSubcategory(kinds: string, mainCategory: string): string | undefined {
    switch (mainCategory) {
      case 'natural':
        if (kinds.includes('water')) return 'water';
        if (kinds.includes('geological')) return 'geological';
        if (kinds.includes('beaches')) return 'beach';
        if (kinds.includes('forest')) return 'forest';
        return 'landscape';
        
      case 'park':
        if (kinds.includes('national')) return 'national_park';
        if (kinds.includes('gardens')) return 'garden';
        if (kinds.includes('protected')) return 'protected_area';
        return 'park';
        
      case 'recreation':
        if (kinds.includes('sport')) return 'sport';
        if (kinds.includes('climbing')) return 'climbing';
        if (kinds.includes('winter')) return 'winter_sports';
        if (kinds.includes('water_parks')) return 'water_park';
        return 'activity';
        
      default:
        return undefined;
    }
  }

  /**
   * Extract description from detailed POI data
   */
  private extractDescription(data: any): string | undefined {
    if (data.wikipedia_extracts && data.wikipedia_extracts.text) {
      // Truncate Wikipedia extract to reasonable length
      const text = data.wikipedia_extracts.text;
      return text.length > 300 ? text.substring(0, 297) + '...' : text;
    }
    
    if (data.info && data.info.descr) {
      return data.info.descr;
    }
    
    return undefined;
  }

  /**
   * Extract rating from POI data
   */
  private extractRating(data: any): number | undefined {
    // OpenTripMap doesn't provide ratings directly
    // We could potentially derive this from other factors
    if (data.rate) {
      // Rate is typically 1-3 in OpenTripMap, convert to 1-5 scale
      return Math.min(5, Math.max(1, data.rate * 1.67));
    }
    
    return undefined;
  }

  /**
   * Extract amenities from POI data
   */
  private extractAmenities(data: any): string[] {
    const amenities: string[] = [];
    
    if (data.info) {
      const info = data.info;
      
      if (info.parking) amenities.push('parking');
      if (info.toilets) amenities.push('toilets');
      if (info.restaurant) amenities.push('restaurant');
      if (info.shop) amenities.push('shop');
      if (info.wifi) amenities.push('wifi');
    }
    
    // Infer amenities from kinds
    const kinds = data.kinds || '';
    if (kinds.includes('restaurants')) amenities.push('restaurant');
    if (kinds.includes('shops')) amenities.push('shop');
    if (kinds.includes('accommodations')) amenities.push('accommodation');
    
    return amenities;
  }

  /**
   * Extract tags from kinds string
   */
  private extractTags(kinds: string): string[] {
    if (!kinds) return [];
    
    // Split kinds and clean up
    return kinds
      .split(',')
      .map(kind => kind.trim())
      .filter(kind => kind.length > 0)
      .map(kind => kind.replace(/_/g, ' '));
  }

  /**
   * Filter POIs by outdoor relevance
   */
  filterOutdoorRelevant(pois: OutdoorPOI[]): OutdoorPOI[] {
    return pois.filter(poi => {
      // Prioritize outdoor-relevant categories
      if (poi.category === 'natural' || poi.category === 'park' || poi.category === 'viewpoint') {
        return true;
      }
      
      if (poi.category === 'recreation' || poi.category === 'adventure') {
        return true;
      }
      
      // Check tags for outdoor keywords
      const outdoorKeywords = ['outdoor', 'nature', 'hiking', 'trail', 'scenic', 'viewpoint', 'park', 'forest', 'mountain', 'lake', 'river'];
      const hasOutdoorTags = poi.tags.some(tag => 
        outdoorKeywords.some(keyword => tag.toLowerCase().includes(keyword))
      );
      
      return hasOutdoorTags;
    });
  }
}
