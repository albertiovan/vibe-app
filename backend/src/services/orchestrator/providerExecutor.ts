/**
 * Provider Executor - Tool Call Engine
 * 
 * Executes verification queries across multiple providers with:
 * - Concurrency controls and timeouts
 * - Budget enforcement
 * - Error handling and retries
 * - Result normalization
 */

import { ProviderResults, ToolBudget } from '../llm/schemas.js';
import { GooglePlacesService } from '../googlePlacesService.js';

export interface ProviderQuery {
  intentId: string;
  provider: 'google' | 'osm' | 'otm';
  priority: number;
  query: {
    location: { lat: number; lon: number };
    radiusMeters?: number;
    type?: string;
    keywords?: string[];
    textQuery?: string;
    osmQL?: string;
    otmKinds?: string[];
    filters?: Record<string, any>;
  };
  expectedResultType: 'venues' | 'routes' | 'areas' | 'points';
}

export class ProviderExecutor {
  private googlePlacesService: GooglePlacesService;
  
  constructor() {
    this.googlePlacesService = new GooglePlacesService();
  }
  
  /**
   * Execute all provider queries with concurrency and budget controls
   */
  async executeQueries(
    queries: ProviderQuery[],
    budget: ToolBudget
  ): Promise<ProviderResults> {
    const startTime = Date.now();
    const results: ProviderResults = {
      resultsByIntent: {},
      executionStats: {
        totalCalls: 0,
        successfulCalls: 0,
        failedCalls: 0,
        executionTimeMs: 0
      }
    };
    
    // Sort queries by priority and enforce budget limits
    const prioritizedQueries = this.prioritizeAndLimitQueries(queries, budget);
    
    console.log(`⚡ Executing ${prioritizedQueries.length} provider queries with concurrency ${budget.maxConcurrentCalls}`);
    
    // Execute queries in batches with concurrency control
    const batches = this.createBatches(prioritizedQueries, budget.maxConcurrentCalls);
    
    for (const batch of batches) {
      // Check timeout
      if (Date.now() - startTime > budget.maxTotalExecutionTime) {
        console.log('⏰ Execution timeout reached, stopping');
        break;
      }
      
      // Execute batch concurrently
      const batchPromises = batch.map(query => 
        this.executeQuery(query, budget.timeoutPerCall)
      );
      
      const batchResults = await Promise.allSettled(batchPromises);
      
      // Process batch results
      batchResults.forEach((result, index) => {
        const query = batch[index];
        results.executionStats.totalCalls++;
        
        if (result.status === 'fulfilled' && result.value) {
          results.executionStats.successfulCalls++;
          this.addResultToIntent(results, query.intentId, query.provider, result.value);
        } else {
          results.executionStats.failedCalls++;
          console.log(`❌ Query failed for ${query.intentId} (${query.provider}):`, 
            result.status === 'rejected' ? result.reason : 'No results');
        }
      });
    }
    
    results.executionStats.executionTimeMs = Date.now() - startTime;
    
    console.log(`✅ Provider execution complete: ${results.executionStats.successfulCalls}/${results.executionStats.totalCalls} successful`);
    
    return results;
  }
  
  /**
   * Execute a single provider query
   */
  private async executeQuery(
    query: ProviderQuery,
    timeout: number
  ): Promise<any[] | null> {
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Query timeout')), timeout)
    );
    
    try {
      const queryPromise = this.executeProviderQuery(query);
      const results = await Promise.race([queryPromise, timeoutPromise]) as any[];
      
      return results && results.length > 0 ? results : null;
      
    } catch (error) {
      console.log(`❌ Query error for ${query.intentId} (${query.provider}):`, error);
      return null;
    }
  }
  
  /**
   * Execute query for specific provider
   */
  private async executeProviderQuery(query: ProviderQuery): Promise<any[]> {
    switch (query.provider) {
      case 'google':
        return this.executeGoogleQuery(query);
      
      case 'osm':
        return this.executeOSMQuery(query);
      
      case 'otm':
        return this.executeOpenTripMapQuery(query);
      
      default:
        throw new Error(`Unknown provider: ${query.provider}`);
    }
  }
  
  /**
   * Execute Google Places query (mock implementation)
   */
  private async executeGoogleQuery(query: ProviderQuery): Promise<any[]> {
    const { location, radiusMeters, type, keywords, textQuery } = query.query;
    
    try {
      let results: any[] = [];
      
      // Try text search first if we have a specific query
      if (textQuery) {
        console.log(`🔍 Google text search: "${textQuery}"`);
        // Use Google Places text search
        results = await this.googlePlacesService.textSearch({
          query: textQuery,
          location: `${location.lat},${location.lon}`,
          radius: radiusMeters || 10000,
          type: type
        });
      }
      
      // If text search didn't yield results, try nearby search
      if (results.length === 0 && (type || keywords?.length)) {
        console.log(`🔍 Google nearby search: type=${type}, keywords=${keywords?.join(',')}`);
        
        results = await this.googlePlacesService.nearbySearch({
          location: `${location.lat},${location.lon}`,
          radius: radiusMeters || 10000,
          type: type,
          keyword: keywords?.join(' ')
        });
      }
      
      // Enhance results with place details if we have good candidates
      if (results.length > 0) {
        const topResults = results.slice(0, 5); // Limit to top 5 for details
        const enhancedResults = await Promise.all(
          topResults.map(async (place) => {
            try {
              const details = await this.googlePlacesService.getPlaceDetails(place.place_id, {
                fields: ['name', 'rating', 'user_ratings_total', 'geometry', 'types', 'vicinity', 'price_level', 'opening_hours', 'photos', 'website']
              });
              
              return {
                placeId: place.place_id,
                name: details.name || place.name,
                rating: details.rating,
                userRatingsTotal: details.user_ratings_total,
                location: {
                  lat: details.geometry?.location?.lat || place.geometry?.location?.lat,
                  lng: details.geometry?.location?.lng || place.geometry?.location?.lng
                },
                types: details.types || place.types || [],
                vicinity: details.vicinity || place.vicinity,
                priceLevel: details.price_level,
                openingHours: details.opening_hours,
                photos: details.photos?.map((photo: any) => ({
                  photoReference: photo.photo_reference
                })) || []
              };
            } catch (detailError) {
              console.log(`⚠️ Failed to get details for ${place.place_id}:`, detailError);
              // Return basic place info
              return {
                placeId: place.place_id,
                name: place.name,
                rating: place.rating,
                location: {
                  lat: place.geometry?.location?.lat,
                  lng: place.geometry?.location?.lng
                },
                types: place.types || [],
                vicinity: place.vicinity
              };
            }
          })
        );
        
        return enhancedResults.filter(result => result.location.lat && result.location.lng);
      }
      
      return [];
      
    } catch (error) {
      console.error(`❌ Google Places query failed:`, error);
      return [];
    }
  }
  
  /**
   * Execute OSM/Overpass query
   */
  private async executeOSMQuery(query: ProviderQuery): Promise<any[]> {
    const { location, radiusMeters, osmQL } = query.query;
    
    if (!osmQL) {
      console.log('⚠️ No OSM query provided');
      return [];
    }
    
    try {
      console.log(`🔍 OSM Overpass query: ${osmQL.substring(0, 100)}...`);
      
      // Execute Overpass query
      const overpassUrl = 'https://overpass-api.de/api/interpreter';
      const response = await fetch(overpassUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain' },
        body: osmQL
      });
      
      if (!response.ok) {
        throw new Error(`Overpass API error: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Process OSM results
      const results = data.elements?.map((element: any) => ({
        id: element.id.toString(),
        type: element.type,
        lat: element.lat || element.center?.lat,
        lon: element.lon || element.center?.lon,
        tags: element.tags || {},
        geometry: element.geometry
      })).filter((result: any) => result.lat && result.lon) || [];
      
      console.log(`✅ OSM returned ${results.length} results`);
      return results;
      
    } catch (error) {
      console.error(`❌ OSM query failed:`, error);
      return [];
    }
  }
  
  /**
   * Execute OpenTripMap query
   */
  private async executeOpenTripMapQuery(query: ProviderQuery): Promise<any[]> {
    const { location, radiusMeters, otmKinds } = query.query;
    
    if (!otmKinds?.length) {
      console.log('⚠️ No OpenTripMap kinds provided');
      return [];
    }
    
    try {
      const kinds = otmKinds.join(',');
      const radius = Math.min(radiusMeters || 10000, 50000); // OTM has radius limits
      
      console.log(`🔍 OpenTripMap query: kinds=${kinds}, radius=${radius}`);
      
      // Note: In production, you'd need an OpenTripMap API key
      const otmUrl = `https://api.opentripmap.com/0.1/en/places/radius`;
      const params = new URLSearchParams({
        lon: location.lon.toString(),
        lat: location.lat.toString(),
        radius: radius.toString(),
        kinds: kinds,
        format: 'json',
        limit: '20'
      });
      
      const response = await fetch(`${otmUrl}?${params}`);
      
      if (!response.ok) {
        throw new Error(`OpenTripMap API error: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Process OTM results
      const results = data.features?.map((feature: any) => ({
        xid: feature.properties.xid,
        name: feature.properties.name,
        rate: feature.properties.rate,
        kinds: feature.properties.kinds,
        point: {
          lat: feature.geometry.coordinates[1],
          lon: feature.geometry.coordinates[0]
        },
        dist: feature.properties.dist
      })) || [];
      
      console.log(`✅ OpenTripMap returned ${results.length} results`);
      return results;
      
    } catch (error) {
      console.error(`❌ OpenTripMap query failed:`, error);
      return [];
    }
  }
  
  /**
   * Prioritize queries and enforce budget limits
   */
  private prioritizeAndLimitQueries(
    queries: ProviderQuery[],
    budget: ToolBudget
  ): ProviderQuery[] {
    // Sort by priority (higher first)
    const sorted = queries.sort((a, b) => b.priority - a.priority);
    
    // Apply budget limits
    const limited: ProviderQuery[] = [];
    const providerCounts = { google: 0, osm: 0, otm: 0 };
    
    for (const query of sorted) {
      if (limited.length >= budget.maxTotalCalls) break;
      
      const currentCount = providerCounts[query.provider];
      const maxForProvider = budget.maxCallsPerProvider[query.provider];
      
      if (currentCount < maxForProvider) {
        limited.push(query);
        providerCounts[query.provider]++;
      }
    }
    
    return limited;
  }
  
  /**
   * Create batches for concurrent execution
   */
  private createBatches(queries: ProviderQuery[], batchSize: number): ProviderQuery[][] {
    const batches: ProviderQuery[][] = [];
    
    for (let i = 0; i < queries.length; i += batchSize) {
      batches.push(queries.slice(i, i + batchSize));
    }
    
    return batches;
  }
  
  /**
   * Add result to intent in the results object
   */
  private addResultToIntent(
    results: ProviderResults,
    intentId: string,
    provider: string,
    providerResults: any[]
  ): void {
    if (!results.resultsByIntent[intentId]) {
      results.resultsByIntent[intentId] = {};
    }
    
    results.resultsByIntent[intentId][provider as keyof typeof results.resultsByIntent[string]] = providerResults;
  }
}
