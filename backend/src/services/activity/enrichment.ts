/**
 * Activity Enrichment Service
 * 
 * Enriches place data with activity-first blurbs, reviews, and enhanced details
 * for the activity-focused user experience.
 */

import { GooglePlacesService } from '../googlePlacesService.js';
import { getBlurbGenerator } from '../llm/blurb.js';
import { CardActivityView, BucketId, ACTIVITY_CONFIG } from '../../types/activity.js';
import { VIBE_TO_PLACES_MAPPING } from '../../types/vibe.js';

export interface PlaceEnrichmentInput {
  placeId: string;
  name: string;
  types?: string[];
  rating?: number;
  userRatingsTotal?: number;
  location?: { lat: number; lng: number };
  vicinity?: string;
  bucket?: BucketId;
  imageUrl?: string;
}

export class ActivityEnrichmentService {
  private googlePlacesService: GooglePlacesService;
  private blurbGenerator = getBlurbGenerator();

  constructor() {
    this.googlePlacesService = new GooglePlacesService();
  }

  /**
   * Enrich a single place with activity-first blurb and details
   */
  async enrichPlace(input: PlaceEnrichmentInput): Promise<CardActivityView> {
    try {
      console.log('🎯 Enriching place with activity details:', input.name);

      // Get enhanced details from Google Places
      const enhancedDetails = await this.googlePlacesService.getEnhancedPlaceDetails(input.placeId);
      
      // Determine activity subtype and bucket
      const activityMapping = this.mapTypesToActivity(enhancedDetails.types || input.types || []);
      
      // Generate activity-first blurb
      const blurb = await this.blurbGenerator.generateBlurb({
        name: input.name,
        types: enhancedDetails.types || input.types,
        editorialSummary: enhancedDetails.editorialSummary,
        rating: enhancedDetails.rating || input.rating,
        userRatingsTotal: enhancedDetails.userRatingsTotal || input.userRatingsTotal,
        activitySubtype: activityMapping.subtype,
        bucket: activityMapping.bucket,
        indoorOutdoor: activityMapping.indoorOutdoor,
        durationHintHrs: activityMapping.durationHintHrs,
        keywords: activityMapping.keywords
      });

      // Build the enriched activity view
      const enrichedPlace: CardActivityView = {
        // Core identification
        id: input.placeId,
        name: input.name,
        bucket: activityMapping.bucket,
        activitySubtype: activityMapping.subtype,
        
        // Visual & Navigation
        imageUrl: input.imageUrl,
        mapsUrl: `https://www.google.com/maps/search/?api=1&query_place_id=${input.placeId}`,
        
        // Ratings & Social Proof
        rating: enhancedDetails.rating || input.rating,
        userRatingsTotal: enhancedDetails.userRatingsTotal || input.userRatingsTotal,
        
        // Activity-first content
        blurb,
        
        // Location & Practical Info
        address: enhancedDetails.address,
        vicinity: enhancedDetails.vicinity || input.vicinity,
        location: enhancedDetails.location || input.location,
        
        // Operational Details
        openingHours: enhancedDetails.openingHours,
        priceLevel: enhancedDetails.priceLevel,
        website: enhancedDetails.website,
        
        // Reviews for detail page
        reviews: enhancedDetails.reviews || [],
        
        // Activity Metadata
        indoorOutdoor: activityMapping.indoorOutdoor,
        durationHintHrs: activityMapping.durationHintHrs,
        difficulty: activityMapping.difficulty,
        
        // Google Places raw data
        types: enhancedDetails.types || input.types,
        editorialSummary: enhancedDetails.editorialSummary,
        keywords: activityMapping.keywords
      };

      console.log('✅ Place enriched with blurb:', blurb.slice(0, 50) + '...');
      return enrichedPlace;

    } catch (error) {
      console.error('❌ Place enrichment error:', error);
      
      // Return minimal enriched place on error
      return this.createFallbackActivityView(input);
    }
  }

  /**
   * Enrich multiple places in parallel
   */
  async enrichPlaces(inputs: PlaceEnrichmentInput[]): Promise<CardActivityView[]> {
    console.log(`🎯 Enriching ${inputs.length} places with activity details...`);
    
    // Process in batches to avoid overwhelming the APIs
    const batchSize = 5;
    const results: CardActivityView[] = [];
    
    for (let i = 0; i < inputs.length; i += batchSize) {
      const batch = inputs.slice(i, i + batchSize);
      const batchPromises = batch.map(input => this.enrichPlace(input));
      
      try {
        const batchResults = await Promise.all(batchPromises);
        results.push(...batchResults);
        
        // Small delay between batches to be respectful to APIs
        if (i + batchSize < inputs.length) {
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      } catch (error) {
        console.error('❌ Batch enrichment error:', error);
        // Add fallback results for failed batch
        const fallbackResults = batch.map(input => this.createFallbackActivityView(input));
        results.push(...fallbackResults);
      }
    }
    
    console.log(`✅ Enriched ${results.length} places with activity details`);
    return results;
  }

  /**
   * Map Google Places types to activity metadata
   */
  private mapTypesToActivity(types: string[]): {
    subtype: string;
    bucket: BucketId;
    indoorOutdoor: 'indoor' | 'outdoor' | 'either';
    durationHintHrs?: [number, number];
    difficulty?: number;
    keywords: string[];
  } {
    // Try to find the best matching activity type
    for (const type of types) {
      // Check direct type mappings
      if (this.isNightlifeType(type)) {
        return {
          subtype: type,
          bucket: 'nightlife',
          indoorOutdoor: 'indoor',
          durationHintHrs: [2, 6],
          difficulty: 2,
          keywords: ['nightlife', 'entertainment', 'social']
        };
      }
      
      if (this.isAdventureType(type)) {
        return {
          subtype: type,
          bucket: 'adventure',
          indoorOutdoor: 'either',
          durationHintHrs: [1, 4],
          difficulty: 3,
          keywords: ['adventure', 'excitement', 'activity']
        };
      }
      
      if (this.isCultureType(type)) {
        return {
          subtype: type,
          bucket: 'culture',
          indoorOutdoor: 'indoor',
          durationHintHrs: [1, 3],
          difficulty: 1,
          keywords: ['culture', 'learning', 'history']
        };
      }
      
      if (this.isNatureType(type)) {
        return {
          subtype: type,
          bucket: 'nature',
          indoorOutdoor: 'outdoor',
          durationHintHrs: [1, 6],
          difficulty: 2,
          keywords: ['nature', 'outdoor', 'fresh air']
        };
      }
      
      if (this.isSocialType(type)) {
        return {
          subtype: type,
          bucket: 'social',
          indoorOutdoor: 'either',
          durationHintHrs: [1, 3],
          difficulty: 1,
          keywords: ['social', 'connection', 'community']
        };
      }
    }
    
    // Default fallback
    return {
      subtype: types[0] || 'establishment',
      bucket: 'entertainment',
      indoorOutdoor: 'either',
      durationHintHrs: [1, 3],
      difficulty: 2,
      keywords: ['experience', 'activity']
    };
  }

  private isNightlifeType(type: string): boolean {
    return ['night_club', 'bar', 'casino', 'live_music_venue'].includes(type);
  }

  private isAdventureType(type: string): boolean {
    return ['amusement_park', 'climbing_gym', 'escape_room', 'adventure_park'].includes(type);
  }

  private isCultureType(type: string): boolean {
    return ['museum', 'art_gallery', 'library', 'tourist_attraction', 'church', 'historical_landmark'].includes(type);
  }

  private isNatureType(type: string): boolean {
    return ['park', 'natural_feature', 'zoo', 'aquarium', 'botanical_garden'].includes(type);
  }

  private isSocialType(type: string): boolean {
    return ['cafe', 'restaurant', 'community_center', 'book_store', 'shopping_mall'].includes(type);
  }

  /**
   * Create fallback activity view when enrichment fails
   */
  private createFallbackActivityView(input: PlaceEnrichmentInput): CardActivityView {
    const fallbackMapping = this.mapTypesToActivity(input.types || []);
    
    return {
      id: input.placeId,
      name: input.name,
      bucket: input.bucket || fallbackMapping.bucket,
      activitySubtype: fallbackMapping.subtype,
      imageUrl: input.imageUrl,
      mapsUrl: `https://www.google.com/maps/search/?api=1&query_place_id=${input.placeId}`,
      rating: input.rating,
      userRatingsTotal: input.userRatingsTotal,
      blurb: 'Experience something new and exciting at this location',
      vicinity: input.vicinity,
      location: input.location,
      reviews: [],
      indoorOutdoor: fallbackMapping.indoorOutdoor,
      durationHintHrs: fallbackMapping.durationHintHrs,
      difficulty: fallbackMapping.difficulty,
      types: input.types,
      keywords: fallbackMapping.keywords
    };
  }
}

// Singleton instance
let enrichmentService: ActivityEnrichmentService | null = null;

export function getActivityEnrichmentService(): ActivityEnrichmentService {
  if (!enrichmentService) {
    enrichmentService = new ActivityEnrichmentService();
  }
  return enrichmentService;
}
