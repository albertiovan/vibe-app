/**
 * Pipeline Vibe Tests
 * Tests weather/travel-aware curation with exact 5-pick diversity
 */

import { WeatherTravelPipeline } from '../src/services/pipeline/weatherTravelPipeline.js';
import candidatesFixture from '../__fixtures__/candidates.bucharest.json';

describe('Weather/Travel-Aware Pipeline', () => {
  let pipeline: WeatherTravelPipeline;
  
  beforeEach(() => {
    pipeline = new WeatherTravelPipeline();
    
    // Mock the search methods to use fixtures
    jest.spyOn(pipeline as any, 'searchAllProviders').mockResolvedValue(candidatesFixture);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('Adventurous outdoors, travel ok', () => {
    it('should include at least one Brașov/Sinaia pick if destination forecast is better', async () => {
      const result = await pipeline.execute(
        'adventurous outdoors, travel ok',
        { lat: 44.4268, lng: 26.1025, city: 'Bucharest' },
        { willingToTravel: true, maxTravelMinutes: 180 }
      );

      // Exactly 5 results
      expect(result.topFive).toHaveLength(5);
      
      // IDs unique
      const ids = result.topFive.map(item => item.id);
      expect(new Set(ids)).toHaveLength(5);
      
      // At least one travel destination (Brașov/Sinaia) with better forecast
      const travelDestinations = result.topFive.filter(item => 
        item.regionName === 'Brașov' || item.regionName === 'Sinaia'
      );
      expect(travelDestinations.length).toBeGreaterThan(0);
      
      // Max one food and only if culinary premium
      const foodItems = result.topFive.filter(item => item.isFood);
      expect(foodItems.length).toBeLessThanOrEqual(1);
      if (foodItems.length > 0) {
        expect(foodItems[0].isCulinaryPremium).toBe(true);
      }
      
      // Should prioritize outdoor buckets
      const outdoorBuckets = result.topFive.filter(item => 
        ['trails', 'adrenaline', 'nature'].includes(item.bucket)
      );
      expect(outdoorBuckets.length).toBeGreaterThan(2);
    });

    it('should respect travel time constraints', async () => {
      const result = await pipeline.execute(
        'adventurous outdoors, travel ok',
        { lat: 44.4268, lng: 26.1025, city: 'Bucharest' },
        { willingToTravel: true, maxTravelMinutes: 60 }
      );

      // All results within travel time
      result.topFive.forEach(item => {
        expect(item.travelMinutes).toBeLessThanOrEqual(60);
      });
    });
  });

  describe('Rainy-day cozy', () => {
    it('should prioritize indoor buckets but still return 5 items', async () => {
      // Mock weather to simulate rainy conditions
      jest.spyOn(pipeline as any, 'buildPipelineContext').mockResolvedValue({
        userLocation: { lat: 44.4268, lng: 26.1025, city: 'Bucharest' },
        willingToTravel: false,
        maxTravelMinutes: 60,
        currentWeather: {
          temperature: 15,
          precipitation: 8.5, // Heavy rain
          windSpeed: 12,
          conditions: 'heavy_rain'
        },
        destinationForecasts: new Map()
      });

      const result = await pipeline.execute(
        'rainy-day cozy',
        { lat: 44.4268, lng: 26.1025, city: 'Bucharest' }
      );

      // Exactly 5 results
      expect(result.topFive).toHaveLength(5);
      
      // Mostly indoor buckets (culture, wellness, nightlife)
      const indoorBuckets = result.topFive.filter(item => 
        ['culture', 'wellness', 'nightlife'].includes(item.bucket)
      );
      expect(indoorBuckets.length).toBeGreaterThan(2);
      
      // High weather suitability scores for selected items
      const avgWeatherSuitability = result.topFive.reduce((sum, item) => 
        sum + item.weatherSuitabilityScore, 0
      ) / result.topFive.length;
      expect(avgWeatherSuitability).toBeGreaterThan(0.7);
    });
  });

  describe('Culture chill nearby + travel disabled', () => {
    it('should keep all results within radius and maintain diverse buckets', async () => {
      const result = await pipeline.execute(
        'culture chill nearby',
        { lat: 44.4268, lng: 26.1025, city: 'Bucharest' },
        { willingToTravel: false, maxTravelMinutes: 30 }
      );

      // Exactly 5 results
      expect(result.topFive).toHaveLength(5);
      
      // All within travel radius (30 minutes)
      result.topFive.forEach(item => {
        expect(item.travelMinutes).toBeLessThanOrEqual(30);
      });
      
      // All in local region (no travel destinations)
      result.topFive.forEach(item => {
        expect(item.regionName).toBe('Bucharest');
      });
      
      // Still diverse buckets despite constraints
      const buckets = [...new Set(result.topFive.map(item => item.bucket))];
      expect(buckets.length).toBeGreaterThan(2);
      
      // Should prioritize culture bucket
      const cultureItems = result.topFive.filter(item => item.bucket === 'culture');
      expect(cultureItems.length).toBeGreaterThan(0);
    });
  });

  describe('Food filtering', () => {
    it('should exclude non-premium food by default', async () => {
      const result = await pipeline.execute(
        'fun activities around town',
        { lat: 44.4268, lng: 26.1025, city: 'Bucharest' }
      );

      const foodItems = result.topFive.filter(item => item.isFood);
      
      // Either no food items, or only premium ones
      foodItems.forEach(item => {
        expect(item.isCulinaryPremium).toBe(true);
      });
    });

    it('should include premium food when vibe implies culinary', async () => {
      // Mock filterSpec to allow food
      jest.spyOn(pipeline as any, 'parseVibeToFilterSpec').mockResolvedValue({
        buckets: ['culture', 'wellness'],
        avoidFood: false, // Culinary vibe detected
        radiusKm: 10,
        maxTravelMinutes: 60
      });

      const result = await pipeline.execute(
        'culinary experience fine dining',
        { lat: 44.4268, lng: 26.1025, city: 'Bucharest' }
      );

      const foodItems = result.topFive.filter(item => item.isFood);
      
      // Should include premium food
      expect(foodItems.length).toBeGreaterThan(0);
      foodItems.forEach(item => {
        expect(item.isCulinaryPremium).toBe(true);
      });
    });
  });

  describe('Diversity enforcement', () => {
    it('should maximize bucket diversity when possible', async () => {
      const result = await pipeline.execute(
        'diverse experiences mix of everything',
        { lat: 44.4268, lng: 26.1025, city: 'Bucharest' },
        { willingToTravel: true, maxTravelMinutes: 180 }
      );

      // Exactly 5 results
      expect(result.topFive).toHaveLength(5);
      
      // Maximum bucket diversity
      const buckets = [...new Set(result.topFive.map(item => item.bucket))];
      expect(buckets.length).toBeGreaterThanOrEqual(4); // Aim for 5, accept 4+
      
      // No more than 2 items from same bucket
      buckets.forEach(bucket => {
        const itemsInBucket = result.topFive.filter(item => item.bucket === bucket);
        expect(itemsInBucket.length).toBeLessThanOrEqual(2);
      });
    });
  });

  describe('Guardrails validation', () => {
    it('should apply all guardrails correctly', async () => {
      const result = await pipeline.execute(
        'outdoor adventures',
        { lat: 44.4268, lng: 26.1025, city: 'Bucharest' },
        { willingToTravel: true, maxTravelMinutes: 120 }
      );

      // Guardrails applied
      expect(result.guardrailsApplied).toBeDefined();
      expect(result.guardrailsApplied.totalCandidates).toBeGreaterThan(0);
      
      // All results have required annotations
      result.topFive.forEach(item => {
        expect(item.regionName).toBeDefined();
        expect(item.distanceKm).toBeGreaterThanOrEqual(0);
        expect(item.travelMinutes).toBeGreaterThanOrEqual(0);
        expect(item.weatherSuitabilityScore).toBeGreaterThanOrEqual(0);
        expect(item.weatherSuitabilityScore).toBeLessThanOrEqual(1);
        expect(item.weatherHint).toBeDefined();
        expect(item.bucket).toBeDefined();
        expect(typeof item.isFood).toBe('boolean');
        expect(typeof item.isCulinaryPremium).toBe('boolean');
        expect(item.source).toBeDefined();
      });
    });

    it('should respect travel time limits strictly', async () => {
      const result = await pipeline.execute(
        'anything fun',
        { lat: 44.4268, lng: 26.1025, city: 'Bucharest' },
        { willingToTravel: true, maxTravelMinutes: 15 }
      );

      // All results within strict travel limit
      result.topFive.forEach(item => {
        expect(item.travelMinutes).toBeLessThanOrEqual(15);
      });
    });
  });

  describe('Weather suitability', () => {
    it('should calculate weather suitability correctly', async () => {
      const result = await pipeline.execute(
        'outdoor activities',
        { lat: 44.4268, lng: 26.1025, city: 'Bucharest' }
      );

      result.topFive.forEach(item => {
        // Indoor venues should have high suitability
        if (['culture', 'wellness', 'nightlife'].includes(item.bucket)) {
          expect(item.weatherSuitabilityScore).toBeGreaterThanOrEqual(0.8);
        }
        
        // Weather hint should be informative
        expect(item.weatherHint).toMatch(/\d+°C/); // Should contain temperature
      });
    });
  });
});
