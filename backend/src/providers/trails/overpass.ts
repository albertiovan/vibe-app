/**
 * Overpass API Provider for Trails and Outdoor Routes
 * Fetches hiking, MTB, cycling, and ski routes from OpenStreetMap
 */

import { TrailSummary, TrailDetails, OVERPASS_QUERIES } from '../../types/trails.js';

export class OverpassProvider {
  private baseUrl = 'https://overpass-api.de/api/interpreter';
  private timeout = 25000; // 25 seconds

  /**
   * Search for trails by geographic bounding box
   */
  async searchTrails(
    bbox: { north: number; south: number; east: number; west: number },
    types: Array<'hiking' | 'mtb' | 'cycling' | 'ski'> = ['hiking', 'mtb']
  ): Promise<TrailSummary[]> {
    const trails: TrailSummary[] = [];
    
    for (const type of types) {
      try {
        const typeTrails = await this.fetchTrailsByType(bbox, type);
        trails.push(...typeTrails);
      } catch (error) {
        console.warn(`⚠️ Failed to fetch ${type} trails:`, error);
      }
    }
    
    return this.deduplicateTrails(trails);
  }

  /**
   * Get detailed information for a specific trail
   */
  async getTrailDetails(trailId: string): Promise<TrailDetails | null> {
    try {
      // For Overpass, we need to re-query with the specific ID
      const query = `
        [out:json][timeout:25];
        (
          relation(${trailId});
          way(${trailId});
        );
        out geom;
      `;
      
      const response = await this.executeQuery(query);
      const elements = response.elements || [];
      
      if (elements.length === 0) {
        return null;
      }
      
      return this.parseTrailDetails(elements[0]);
    } catch (error) {
      console.error('❌ Failed to fetch trail details:', error);
      return null;
    }
  }

  /**
   * Fetch trails by specific type
   */
  private async fetchTrailsByType(
    bbox: { north: number; south: number; east: number; west: number },
    type: 'hiking' | 'mtb' | 'cycling' | 'ski'
  ): Promise<TrailSummary[]> {
    const bboxString = `${bbox.south},${bbox.west},${bbox.north},${bbox.east}`;
    
    let query: string;
    switch (type) {
      case 'hiking':
        query = OVERPASS_QUERIES.HIKING_TRAILS.replace('{bbox}', bboxString);
        break;
      case 'mtb':
        query = OVERPASS_QUERIES.MTB_TRAILS.replace('{bbox}', bboxString);
        break;
      case 'cycling':
        query = OVERPASS_QUERIES.CYCLING_ROUTES.replace('{bbox}', bboxString);
        break;
      case 'ski':
        query = OVERPASS_QUERIES.SKI_PISTES.replace('{bbox}', bboxString);
        break;
      default:
        throw new Error(`Unsupported trail type: ${type}`);
    }
    
    const response = await this.executeQuery(query);
    return this.parseTrails(response.elements || [], type);
  }

  /**
   * Execute Overpass API query
   */
  private async executeQuery(query: string): Promise<any> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);
    
    try {
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: `data=${encodeURIComponent(query)}`,
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new Error(`Overpass API error: ${response.status} ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      clearTimeout(timeoutId);
      throw error;
    }
  }

  /**
   * Parse Overpass response into TrailSummary objects
   */
  private parseTrails(elements: any[], type: TrailSummary['type']): TrailSummary[] {
    return elements
      .filter(element => element.tags && (element.tags.name || element.tags.ref))
      .map(element => this.parseTrailSummary(element, type))
      .filter(trail => trail !== null) as TrailSummary[];
  }

  /**
   * Parse individual trail element
   */
  private parseTrailSummary(element: any, type: TrailSummary['type']): TrailSummary | null {
    const tags = element.tags || {};
    
    // Extract basic info
    const name = tags.name || tags.ref || `${type} trail ${element.id}`;
    const difficulty = this.parseDifficulty(tags, type);
    const distance = this.parseDistance(tags);
    const surface = tags.surface || 'unknown';
    
    // Calculate center point and bbox
    const geometry = this.extractGeometry(element);
    if (!geometry.center) {
      return null;
    }
    
    return {
      id: `overpass_${element.type}_${element.id}`,
      name,
      type,
      difficulty,
      distance,
      location: geometry.center,
      bbox: geometry.bbox,
      surface,
      tags: this.extractTags(tags),
      source: 'overpass'
    };
  }

  /**
   * Parse trail details with full geometry
   */
  private parseTrailDetails(element: any): TrailDetails {
    const summary = this.parseTrailSummary(element, this.inferTrailType(element.tags));
    if (!summary) {
      throw new Error('Failed to parse trail summary');
    }
    
    const waypoints = this.extractWaypoints(element);
    const amenities = this.extractAmenities(element.tags);
    const restrictions = this.extractRestrictions(element.tags);
    
    return {
      ...summary,
      waypoints,
      amenities,
      restrictions,
      description: element.tags?.description,
      lastUpdated: new Date()
    };
  }

  /**
   * Extract geometry from Overpass element
   */
  private extractGeometry(element: any): { center: { lat: number; lng: number } | null; bbox?: any } {
    if (element.type === 'node') {
      return {
        center: { lat: element.lat, lng: element.lon }
      };
    }
    
    if (element.type === 'way' && element.geometry) {
      const coords = element.geometry;
      if (coords.length === 0) return { center: null };
      
      // Calculate center and bounding box
      const lats = coords.map((c: any) => c.lat);
      const lngs = coords.map((c: any) => c.lon);
      
      const center = {
        lat: (Math.min(...lats) + Math.max(...lats)) / 2,
        lng: (Math.min(...lngs) + Math.max(...lngs)) / 2
      };
      
      const bbox = {
        north: Math.max(...lats),
        south: Math.min(...lats),
        east: Math.max(...lngs),
        west: Math.min(...lngs)
      };
      
      return { center, bbox };
    }
    
    if (element.type === 'relation' && element.members) {
      // For relations, use the first way's geometry as approximation
      const firstWay = element.members.find((m: any) => m.type === 'way' && m.geometry);
      if (firstWay) {
        return this.extractGeometry(firstWay);
      }
    }
    
    return { center: null };
  }

  /**
   * Extract waypoints from element geometry
   */
  private extractWaypoints(element: any): Array<{ lat: number; lng: number; elevation?: number }> {
    if (element.type === 'way' && element.geometry) {
      return element.geometry.map((coord: any) => ({
        lat: coord.lat,
        lng: coord.lon,
        elevation: coord.elevation
      }));
    }
    
    return [];
  }

  /**
   * Parse difficulty from tags
   */
  private parseDifficulty(tags: any, type: TrailSummary['type']): TrailSummary['difficulty'] {
    // Check various difficulty tags
    const difficulty = tags.difficulty || tags['mtb:scale'] || tags['sac_scale'] || tags['piste:difficulty'];
    
    if (!difficulty) return 'moderate';
    
    const difficultyLower = difficulty.toLowerCase();
    
    // MTB scale (0-6)
    if (tags['mtb:scale']) {
      const scale = parseInt(tags['mtb:scale']);
      if (scale <= 1) return 'easy';
      if (scale <= 3) return 'moderate';
      if (scale <= 5) return 'difficult';
      return 'expert';
    }
    
    // SAC scale for hiking (T1-T6)
    if (tags['sac_scale']) {
      if (tags['sac_scale'].includes('T1')) return 'easy';
      if (tags['sac_scale'].includes('T2') || tags['sac_scale'].includes('T3')) return 'moderate';
      if (tags['sac_scale'].includes('T4') || tags['sac_scale'].includes('T5')) return 'difficult';
      return 'expert';
    }
    
    // Ski piste difficulty
    if (tags['piste:difficulty']) {
      const pisteDiff = tags['piste:difficulty'].toLowerCase();
      if (pisteDiff.includes('novice') || pisteDiff.includes('green')) return 'easy';
      if (pisteDiff.includes('easy') || pisteDiff.includes('blue')) return 'easy';
      if (pisteDiff.includes('intermediate') || pisteDiff.includes('red')) return 'moderate';
      if (pisteDiff.includes('advanced') || pisteDiff.includes('black')) return 'difficult';
      if (pisteDiff.includes('expert') || pisteDiff.includes('double_black')) return 'expert';
    }
    
    // Generic difficulty mapping
    if (difficultyLower.includes('easy') || difficultyLower.includes('beginner')) return 'easy';
    if (difficultyLower.includes('moderate') || difficultyLower.includes('intermediate')) return 'moderate';
    if (difficultyLower.includes('difficult') || difficultyLower.includes('hard') || difficultyLower.includes('advanced')) return 'difficult';
    if (difficultyLower.includes('expert') || difficultyLower.includes('extreme')) return 'expert';
    
    return 'moderate';
  }

  /**
   * Parse distance from tags
   */
  private parseDistance(tags: any): number | undefined {
    const distance = tags.distance || tags.length;
    if (!distance) return undefined;
    
    // Parse various distance formats
    const distanceStr = distance.toString().toLowerCase();
    const match = distanceStr.match(/(\d+(?:\.\d+)?)\s*(km|m|mi)?/);
    
    if (match) {
      const value = parseFloat(match[1]);
      const unit = match[2] || 'm';
      
      switch (unit) {
        case 'km': return value;
        case 'm': return value / 1000;
        case 'mi': return value * 1.60934;
        default: return value / 1000; // assume meters
      }
    }
    
    return undefined;
  }

  /**
   * Extract relevant tags
   */
  private extractTags(tags: any): string[] {
    const relevantTags = [];
    
    if (tags.surface) relevantTags.push(`surface:${tags.surface}`);
    if (tags.trail_visibility) relevantTags.push(`visibility:${tags.trail_visibility}`);
    if (tags.bicycle) relevantTags.push(`bicycle:${tags.bicycle}`);
    if (tags.foot) relevantTags.push(`foot:${tags.foot}`);
    if (tags.horse) relevantTags.push(`horse:${tags.horse}`);
    if (tags.motor_vehicle) relevantTags.push(`motor_vehicle:${tags.motor_vehicle}`);
    
    return relevantTags;
  }

  /**
   * Extract amenities from tags
   */
  private extractAmenities(tags: any): string[] {
    const amenities = [];
    
    if (tags.parking) amenities.push('parking');
    if (tags.toilets) amenities.push('toilets');
    if (tags.drinking_water) amenities.push('water');
    if (tags.shelter) amenities.push('shelter');
    if (tags.information) amenities.push('information');
    
    return amenities;
  }

  /**
   * Extract restrictions from tags
   */
  private extractRestrictions(tags: any): string[] {
    const restrictions = [];
    
    if (tags.access === 'private') restrictions.push('private_access');
    if (tags.fee === 'yes') restrictions.push('fee_required');
    if (tags.seasonal) restrictions.push(`seasonal:${tags.seasonal}`);
    if (tags.opening_hours) restrictions.push(`hours:${tags.opening_hours}`);
    
    return restrictions;
  }

  /**
   * Infer trail type from tags
   */
  private inferTrailType(tags: any): TrailSummary['type'] {
    if (tags.route === 'mtb' || tags['mtb:scale']) return 'mtb';
    if (tags.route === 'hiking' || tags['sac_scale']) return 'hiking';
    if (tags.route === 'bicycle') return 'cycling';
    if (tags['piste:type']) return 'ski';
    return 'hiking'; // default
  }

  /**
   * Remove duplicate trails based on name and location proximity
   */
  private deduplicateTrails(trails: TrailSummary[]): TrailSummary[] {
    const unique: TrailSummary[] = [];
    const seen = new Set<string>();
    
    for (const trail of trails) {
      // Create a key based on name and approximate location
      const locationKey = `${Math.round(trail.location.lat * 1000)},${Math.round(trail.location.lng * 1000)}`;
      const key = `${trail.name.toLowerCase()}_${locationKey}`;
      
      if (!seen.has(key)) {
        seen.add(key);
        unique.push(trail);
      }
    }
    
    return unique;
  }
}
