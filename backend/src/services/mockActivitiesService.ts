/**
 * Mock Activities Service
 * Provides realistic Bucharest attractions data until real TripAdvisor attractions API is available
 */

import { ActivitySummary, ActivityDetails, ActivityPhoto, ActivityReview, PriceLevel } from '../types/index.js';
import { rapidApiConfig } from '../config/rapidapi.js';
import NodeCache from 'node-cache';

// Cache for 10 minutes to simulate API behavior
const cache = new NodeCache({ stdTTL: 600 });

export class MockActivitiesService {
  private bucharestActivities: ActivityDetails[] = [
    {
      id: 'attraction-294458-palace-parliament',
      name: 'Palace of Parliament',
      description: 'The Palace of Parliament is the seat of the Parliament of Romania, located on Dealul Spirii in Bucharest. It is the heaviest building in the world and the second largest administrative building in the world.',
      category: 'historical',
      priceTier: 'moderate',
      rating: 4.2,
      reviewCount: 15420,
      coordinates: {
        lat: 44.4276,
        lng: 26.0876
      },
      address: 'Strada Izvor 2-4, București 050563, Romania',
      primaryPhoto: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800',
      photos: [
        'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800',
        'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800'
      ],
      tags: ['architecture', 'history', 'guided_tours', 'government', 'landmark'],
      openingHours: 'Mon-Sun: 9:00 AM - 5:00 PM',
      duration: '2-3 hours',
      website: 'http://www.cdep.ro/pls/parlam/structura2015.mp?idm=7',
      phone: '+40 21 414 1611',
      bestTimeToVisit: 'Morning hours for better lighting',
      accessibility: ['wheelchair_accessible', 'guided_tours_available'],
      bookingLinks: ['https://www.cdep.ro/pls/parlam/structura2015.mp?idm=7']
    },
    {
      id: 'attraction-294458-old-town',
      name: 'Old Town (Centrul Vechi)',
      description: 'Bucharest\'s historic center, featuring cobblestone streets, medieval buildings, vibrant nightlife, and traditional Romanian restaurants.',
      category: 'cultural',
      priceTier: 'free',
      rating: 4.5,
      reviewCount: 8932,
      coordinates: {
        lat: 44.4301,
        lng: 26.1020
      },
      address: 'Centrul Vechi, București, Romania',
      primaryPhoto: 'https://images.unsplash.com/photo-1555993539-1732b0258235?w=800',
      photos: [
        'https://images.unsplash.com/photo-1555993539-1732b0258235?w=800',
        'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800'
      ],
      tags: ['historic', 'walking', 'nightlife', 'restaurants', 'cobblestone', 'medieval'],
      openingHours: '24/7 (individual venues vary)',
      duration: '2-4 hours',
      bestTimeToVisit: 'Evening for nightlife, afternoon for sightseeing',
      accessibility: ['some_cobblestone_areas', 'mixed_accessibility']
    },
    {
      id: 'attraction-294458-herastrau-park',
      name: 'Herăstrău Park',
      description: 'The largest park in Bucharest, featuring a beautiful lake, walking paths, outdoor activities, and the Village Museum.',
      category: 'outdoor',
      priceTier: 'free',
      rating: 4.4,
      reviewCount: 12156,
      coordinates: {
        lat: 44.4672,
        lng: 26.0824
      },
      address: 'Șoseaua Nordului 7-9, București 014104, Romania',
      primaryPhoto: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800',
      photos: [
        'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800',
        'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800'
      ],
      tags: ['park', 'lake', 'walking', 'cycling', 'boating', 'family_friendly'],
      openingHours: '24/7',
      duration: '1-3 hours',
      bestTimeToVisit: 'Morning or late afternoon',
      accessibility: ['wheelchair_accessible', 'paved_paths', 'family_friendly']
    },
    {
      id: 'attraction-294458-romanian-athenaeum',
      name: 'Romanian Athenaeum',
      description: 'A stunning concert hall and landmark of Romanian architecture, home to the George Enescu Philharmonic Orchestra.',
      category: 'cultural',
      priceTier: 'moderate',
      rating: 4.6,
      reviewCount: 6789,
      coordinates: {
        lat: 44.4412,
        lng: 26.0973
      },
      address: 'Strada Benjamin Franklin 1-3, București 030167, Romania',
      primaryPhoto: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800',
      photos: [
        'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800',
        'https://images.unsplash.com/photo-1465821185615-20b3c2fbf41b?w=800'
      ],
      tags: ['concert_hall', 'architecture', 'classical_music', 'landmark', 'cultural'],
      openingHours: 'Event dependent (check schedule)',
      duration: '1-2 hours',
      website: 'https://www.fge.org.ro/',
      phone: '+40 21 315 6875',
      bestTimeToVisit: 'During concert performances',
      accessibility: ['wheelchair_accessible', 'hearing_assistance_available']
    },
    {
      id: 'attraction-294458-village-museum',
      name: 'Dimitrie Gusti National Village Museum',
      description: 'An open-air ethnographic museum showcasing traditional Romanian village life with authentic houses and artifacts.',
      category: 'cultural',
      priceTier: 'budget',
      rating: 4.3,
      reviewCount: 4521,
      coordinates: {
        lat: 44.4719,
        lng: 26.0758
      },
      address: 'Șoseaua Pavel Kiseleff 28-30, București 011347, Romania',
      primaryPhoto: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800',
      photos: [
        'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800',
        'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800'
      ],
      tags: ['museum', 'traditional', 'outdoor', 'ethnographic', 'village', 'cultural_heritage'],
      openingHours: 'Tue-Sun: 9:00 AM - 5:00 PM (Closed Mondays)',
      duration: '2-3 hours',
      website: 'http://www.muzeul-satului.ro/',
      phone: '+40 21 317 9103',
      bestTimeToVisit: 'Spring and summer for outdoor experience',
      accessibility: ['partially_accessible', 'outdoor_terrain']
    },
    {
      id: 'attraction-294458-calea-victoriei',
      name: 'Calea Victoriei',
      description: 'Bucharest\'s most famous avenue, lined with historic buildings, shops, cafes, and important landmarks.',
      category: 'cultural',
      priceTier: 'free',
      rating: 4.1,
      reviewCount: 3892,
      coordinates: {
        lat: 44.4378,
        lng: 26.0969
      },
      address: 'Calea Victoriei, București, Romania',
      primaryPhoto: 'https://images.unsplash.com/photo-1555993539-1732b0258235?w=800',
      photos: [
        'https://images.unsplash.com/photo-1555993539-1732b0258235?w=800',
        'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800'
      ],
      tags: ['avenue', 'shopping', 'historic', 'walking', 'architecture', 'landmarks'],
      openingHours: '24/7 (shops and venues vary)',
      duration: '1-2 hours walking',
      bestTimeToVisit: 'Afternoon for shopping and sightseeing',
      accessibility: ['wheelchair_accessible', 'paved_sidewalks']
    },
    {
      id: 'attraction-294458-cismigiu-gardens',
      name: 'Cișmigiu Gardens',
      description: 'The oldest public garden in Bucharest, featuring beautiful landscaping, a lake, and peaceful walking paths.',
      category: 'outdoor',
      priceTier: 'free',
      rating: 4.2,
      reviewCount: 5634,
      coordinates: {
        lat: 44.4370,
        lng: 26.0914
      },
      address: 'Bulevardul Regina Elisabeta, București, Romania',
      primaryPhoto: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800',
      photos: [
        'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800',
        'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800'
      ],
      tags: ['garden', 'lake', 'walking', 'peaceful', 'historic', 'family_friendly'],
      openingHours: '6:00 AM - 10:00 PM',
      duration: '1-2 hours',
      bestTimeToVisit: 'Morning or late afternoon',
      accessibility: ['wheelchair_accessible', 'paved_paths']
    }
  ];

  /**
   * List activities for a given location
   */
  public async listActivities(options: {
    locationId?: string;
    limit?: number;
    sort?: 'rating' | 'popularity' | 'distance';
    categories?: string[];
  } = {}): Promise<ActivitySummary[]> {
    try {
      const { locationId = rapidApiConfig.defaultLocationId, limit = 10, sort = 'rating', categories } = options;
      
      console.log(`🎭 Mock Activities: Fetching activities for location ${locationId}`);
      
      // For now, we only have Bucharest data
      if (locationId !== rapidApiConfig.defaultLocationId) {
        console.log(`⚠️ Mock Activities: No data for location ${locationId}, returning empty array`);
        return [];
      }

      let activities = [...this.bucharestActivities];

      // Filter by categories if specified
      if (categories && categories.length > 0) {
        activities = activities.filter(activity => 
          categories.some(cat => 
            activity.category === cat || 
            activity.tags.some(tag => tag.includes(cat.toLowerCase()))
          )
        );
        console.log(`🔍 Filtered to ${activities.length} activities matching categories: ${categories.join(', ')}`);
      }

      // Sort activities
      switch (sort) {
        case 'rating':
          activities.sort((a, b) => (b.rating || 0) - (a.rating || 0));
          break;
        case 'popularity':
          activities.sort((a, b) => (b.reviewCount || 0) - (a.reviewCount || 0));
          break;
        case 'distance':
          // For mock data, we'll just use the existing order
          break;
      }

      // Limit results
      const limitedActivities = activities.slice(0, limit);
      
      console.log(`✅ Mock Activities: Returning ${limitedActivities.length} activities`);
      
      return limitedActivities.map(activity => ({
        id: activity.id,
        name: activity.name,
        primaryPhoto: activity.primaryPhoto,
        rating: activity.rating,
        reviewCount: activity.reviewCount,
        priceTier: activity.priceTier,
        tags: activity.tags,
        coordinates: activity.coordinates,
        category: activity.category,
        distance: activity.distance
      }));

    } catch (error) {
      console.error('Mock Activities error:', error);
      return [];
    }
  }

  /**
   * Get detailed information for a specific activity
   */
  public async getActivityDetails(activityId: string): Promise<ActivityDetails | null> {
    try {
      console.log(`🎭 Mock Activities: Fetching details for activity ${activityId}`);
      
      const activity = this.bucharestActivities.find(a => a.id === activityId);
      
      if (!activity) {
        console.log(`❌ Mock Activities: Activity ${activityId} not found`);
        return null;
      }

      console.log(`✅ Mock Activities: Found details for ${activity.name}`);
      return activity;

    } catch (error) {
      console.error('Mock Activities details error:', error);
      return null;
    }
  }

  /**
   * Get photos for a specific activity
   */
  public async getActivityPhotos(activityId: string, limit: number = 10): Promise<ActivityPhoto[]> {
    try {
      const activity = this.bucharestActivities.find(a => a.id === activityId);
      
      if (!activity || !activity.photos) {
        return [];
      }

      return activity.photos.slice(0, limit).map((url, index) => ({
        id: `${activityId}-photo-${index}`,
        url,
        caption: `${activity.name} - Photo ${index + 1}`,
        width: 800,
        height: 600
      }));

    } catch (error) {
      console.error('Mock Activities photos error:', error);
      return [];
    }
  }

  /**
   * Get reviews for a specific activity
   */
  public async getActivityReviews(activityId: string, options: {
    limit?: number;
    sort?: 'recent' | 'helpful' | 'rating';
  } = {}): Promise<ActivityReview[]> {
    try {
      const { limit = 5, sort = 'helpful' } = options;
      const activity = this.bucharestActivities.find(a => a.id === activityId);
      
      if (!activity) {
        return [];
      }

      // Generate mock reviews
      const mockReviews: ActivityReview[] = [
        {
          id: `${activityId}-review-1`,
          rating: 5,
          title: 'Amazing experience!',
          text: `Visited ${activity.name} and it was absolutely wonderful. Highly recommend to anyone visiting Bucharest.`,
          author: 'TravelLover123',
          date: '2024-10-10',
          helpful: 15,
          language: 'en'
        },
        {
          id: `${activityId}-review-2`,
          rating: 4,
          title: 'Great place to visit',
          text: `${activity.name} is definitely worth a visit. The architecture and history are fascinating.`,
          author: 'HistoryBuff',
          date: '2024-10-08',
          helpful: 8,
          language: 'en'
        }
      ];

      return mockReviews.slice(0, limit);

    } catch (error) {
      console.error('Mock Activities reviews error:', error);
      return [];
    }
  }

  /**
   * Check if the service is available
   */
  public isAvailable(): boolean {
    return true; // Mock service is always available
  }

  /**
   * Get service status
   */
  public getStatus(): { available: boolean; provider: string; dataSource: string } {
    return {
      available: true,
      provider: 'Mock Service',
      dataSource: 'Curated Bucharest attractions'
    };
  }
}

// Export singleton instance
export const mockActivitiesService = new MockActivitiesService();
