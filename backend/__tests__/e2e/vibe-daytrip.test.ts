/**
 * E2E Test: Vibe Day-Trip Diversity & Blurbs
 * 
 * Validates the complete day-trip scenario with diversity enforcement
 * and venue-specific blurbs as specified in the requirements.
 */

import { describe, test, expect, beforeAll, afterAll } from '@jest/globals';
import { validateDiversity } from '../../src/selectors/diversityTopFive';
import { generateVenueBlurb, clearBlurbCache } from '../../src/services/llm/venueBlurbs';

// Mock data for testing
const mockVibeContext = {
  userProfile: {
    interests: ['adventure & thrills', 'nature & outdoors', 'photography & views'],
    energyLevel: 'high',
    socialStyle: 'small_group'
  },
  vibe: 'I want to try something new',
  duration: 10, // Day trip (8-12h)
  location: { lat: 44.4268, lng: 26.1025 }, // Bucharest
  willingToTravel: true
};

describe('Vibe Day-Trip E2E Test', () => {
  beforeAll(() => {
    // Clear any cached blurbs for clean testing
    clearBlurbCache();
  });

  afterAll(() => {
    clearBlurbCache();
  });

  test('should return exactly 5 diverse activity cards', async () => {
    const response = await fetch('http://localhost:3000/api/activities/search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        vibe: mockVibeContext.vibe,
        location: mockVibeContext.location,
        filters: {
          durationHours: mockVibeContext.duration,
          willingToTravel: mockVibeContext.willingToTravel
        },
        userId: 'e2e_test_user'
      })
    });

    expect(response.ok).toBe(true);
    const data = await response.json();
    
    expect(data.success).toBe(true);
    expect(data.data).toBeDefined();
    
    const cards = data.data.topFive;
    
    // Requirement: Exactly 5 results
    expect(cards).toHaveLength(5);
    
    // Requirement: Distinct buckets (≥4 unique buckets for good diversity)
    const buckets = cards.map((c: any) => c.bucket);
    const uniqueBuckets = new Set(buckets);
    expect(uniqueBuckets.size).toBeGreaterThanOrEqual(4);
    
    // Requirement: Each card has required fields
    cards.forEach((card: any) => {
      expect(card.id).toBeDefined();
      expect(card.name).toBeDefined();
      expect(card.bucket).toBeDefined();
      expect(card.blurb).toBeDefined();
      expect(card.blurb.length).toBeGreaterThan(5);
    });

    console.log('✅ Diversity test results:', {
      totalCards: cards.length,
      uniqueBuckets: uniqueBuckets.size,
      buckets: Array.from(uniqueBuckets),
      diversityScore: data.data.searchStats?.diversity?.diversityScore
    });
  });

  test('should include cross-region results for day trips', async () => {
    const response = await fetch('http://localhost:3000/api/activities/search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        vibe: 'mountain adventure and fresh air',
        location: mockVibeContext.location,
        filters: {
          durationHours: 10,
          willingToTravel: true
        }
      })
    });

    const data = await response.json();
    const cards = data.data.topFive;
    
    // Requirement: ≥1 result outside Bucharest for day trips
    const crossRegionCards = cards.filter((card: any) => {
      const vicinity = card.vicinity?.toLowerCase() || '';
      return !vicinity.includes('bucurești') && !vicinity.includes('bucharest');
    });
    
    expect(crossRegionCards.length).toBeGreaterThanOrEqual(1);
    
    console.log('✅ Cross-region test results:', {
      totalCards: cards.length,
      crossRegionCards: crossRegionCards.length,
      regions: crossRegionCards.map((c: any) => c.vicinity)
    });
  });

  test('should generate unique venue blurbs', async () => {
    // Test venue blurb generation directly
    const testVenues = [
      {
        name: 'National Museum of Art',
        types: ['museum', 'tourist_attraction'],
        bucket: 'culture',
        rating: 4.5,
        user_ratings_total: 1200
      },
      {
        name: 'Adventure Park Brasov',
        types: ['amusement_park', 'tourist_attraction'],
        bucket: 'adventure',
        rating: 4.3,
        user_ratings_total: 890
      },
      {
        name: 'Herastrau Park',
        types: ['park', 'tourist_attraction'],
        bucket: 'nature',
        rating: 4.6,
        user_ratings_total: 2100
      }
    ];

    const blurbs = await Promise.all(
      testVenues.map(venue => generateVenueBlurb(venue))
    );

    // Requirement: Each venue blurb is unique
    const blurbTexts = blurbs.map(b => b.blurb);
    const uniqueBlurbs = new Set(blurbTexts);
    expect(uniqueBlurbs.size).toBe(blurbTexts.length);

    // Requirement: Blurbs are ≤22 words
    blurbs.forEach((blurb, index) => {
      const wordCount = blurb.blurb.split(/\s+/).length;
      expect(wordCount).toBeLessThanOrEqual(22);
      expect(blurb.blurb.length).toBeGreaterThan(5);
      
      console.log(`✅ Blurb ${index + 1}: "${blurb.blurb}" (${wordCount} words, ${blurb.method})`);
    });

    // Requirement: Blurbs are factual (no hallucinations)
    blurbs.forEach((blurb, index) => {
      const venue = testVenues[index];
      const blurbText = blurb.blurb.toLowerCase();
      
      // Should not contain made-up adjectives or facts
      const hallucinations = ['amazing', 'incredible', 'stunning', 'breathtaking', 'world-class'];
      const hasHallucination = hallucinations.some(word => blurbText.includes(word));
      expect(hasHallucination).toBe(false);
    });
  });

  test('should validate diversity requirements', () => {
    // Test the diversity validation function
    const mockResults = [
      { id: '1', name: 'Museum', bucket: 'culture', subtype: 'museum', region: 'Bucharest', score: 0.9 },
      { id: '2', name: 'Park', bucket: 'nature', subtype: 'park', region: 'Bucharest', score: 0.8 },
      { id: '3', name: 'Climbing Gym', bucket: 'adventure', subtype: 'gym', region: 'Bucharest', score: 0.85 },
      { id: '4', name: 'Cafe', bucket: 'social', subtype: 'cafe', region: 'Brașov', score: 0.7 },
      { id: '5', name: 'Spa', bucket: 'wellness', subtype: 'spa', region: 'Sinaia', score: 0.75 }
    ];

    const validation = validateDiversity(mockResults, {
      exactCount: 5,
      minBuckets: 4,
      minSubtypes: 4,
      minRegions: 2
    });

    expect(validation.isValid).toBe(true);
    expect(validation.violations).toHaveLength(0);
    expect(validation.metrics.buckets).toBe(5);
    expect(validation.metrics.subtypes).toBe(5);
    expect(validation.metrics.regions).toBe(3);

    console.log('✅ Diversity validation:', validation.metrics);
  });

  test('should handle edge cases gracefully', async () => {
    // Test with minimal input
    const response = await fetch('http://localhost:3000/api/activities/search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        vibe: 'fun',
        location: { lat: 44.4268, lng: 26.1025 },
        filters: { durationHours: 2 }
      })
    });

    expect(response.ok).toBe(true);
    const data = await response.json();
    
    // Should still return results even with minimal input
    expect(data.data.topFive.length).toBeGreaterThan(0);
    expect(data.data.topFive.length).toBeLessThanOrEqual(5);

    // All results should have blurbs
    data.data.topFive.forEach((card: any) => {
      expect(card.blurb).toBeDefined();
      expect(typeof card.blurb).toBe('string');
      expect(card.blurb.length).toBeGreaterThan(0);
    });
  });

  test('should provide Google Maps integration', async () => {
    const response = await fetch('http://localhost:3000/api/activities/search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        vibe: 'explore museums',
        location: { lat: 44.4268, lng: 26.1025 },
        filters: { durationHours: 4 }
      })
    });

    const data = await response.json();
    const cards = data.data.topFive;

    // Requirement: "Open in Google Maps" CTA works
    cards.forEach((card: any) => {
      if (card.verifiedVenues && card.verifiedVenues.length > 0) {
        const venue = card.verifiedVenues[0];
        expect(venue.mapsUrl).toBeDefined();
        expect(venue.mapsUrl).toContain('google.com/maps');
        expect(venue.mapsUrl).toContain('place_id');
      }
    });

    console.log('✅ Google Maps integration verified for', cards.length, 'cards');
  });
});

describe('Diversity Selector Unit Tests', () => {
  test('should enforce bucket diversity', () => {
    const candidates = [
      { id: '1', name: 'Museum 1', bucket: 'culture', score: 0.9 },
      { id: '2', name: 'Museum 2', bucket: 'culture', score: 0.85 },
      { id: '3', name: 'Park 1', bucket: 'nature', score: 0.8 },
      { id: '4', name: 'Gym 1', bucket: 'adventure', score: 0.75 },
      { id: '5', name: 'Cafe 1', bucket: 'social', score: 0.7 },
      { id: '6', name: 'Spa 1', bucket: 'wellness', score: 0.65 }
    ];

    const { pickDiverseFiveWithRegions } = require('../../src/selectors/diversityTopFive');
    const result = pickDiverseFiveWithRegions(candidates);

    expect(result.selected).toHaveLength(5);
    
    // Should prefer one from each bucket over multiple from same bucket
    const buckets = result.selected.map(r => r.bucket);
    const uniqueBuckets = new Set(buckets);
    expect(uniqueBuckets.size).toBe(5); // All 5 should be different buckets
    
    // Should include the highest scoring museum (Museum 1, not Museum 2)
    const selectedMuseum = result.selected.find(r => r.bucket === 'culture');
    expect(selectedMuseum?.name).toBe('Museum 1');
  });
});
