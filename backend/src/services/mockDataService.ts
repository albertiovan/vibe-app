import { Activity, ActivityCategory, PriceLevel } from '../types';

export class MockDataService {
  public async searchActivities(
    location: string,
    categories?: ActivityCategory[],
    limit: number = 10
  ): Promise<Activity[]> {
    
    // Mock activities for Sinaia, Romania (adventure focused)
    const mockActivities: Activity[] = [
      {
        id: 'sinaia-1',
        name: 'Peles Castle Tour',
        description: 'Explore the stunning Neo-Renaissance castle built by King Carol I. Marvel at the ornate rooms, beautiful architecture, and mountain views.',
        category: 'cultural' as ActivityCategory,
        location: {
          address: 'Aleea Peleșului 2, Sinaia 106100, Romania',
          city: 'Sinaia',
          coordinates: {
            lat: 45.3599,
            lng: 25.5425
          }
        },
        rating: 4.6,
        priceLevel: 'moderate' as PriceLevel,
        imageUrl: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400',
        website: 'https://peles.ro',
        phone: '+40 244 310 918',
        tags: ['castle', 'history', 'architecture', 'royal', 'cultural']
      },
      {
        id: 'sinaia-2',
        name: 'Cable Car to Bucegi Mountains',
        description: 'Take the cable car up to 2000m altitude for breathtaking mountain views, hiking trails, and fresh mountain air.',
        category: 'adventure' as ActivityCategory,
        location: {
          address: 'Platoul Bucegi, Sinaia, Romania',
          city: 'Sinaia',
          coordinates: {
            lat: 45.3833,
            lng: 25.5167
          }
        },
        rating: 4.8,
        priceLevel: 'moderate' as PriceLevel,
        imageUrl: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400',
        website: 'https://telecabinabucegi.ro',
        phone: '+40 244 315 611',
        tags: ['cable_car', 'mountains', 'hiking', 'adventure', 'nature', 'outdoor']
      },
      {
        id: 'sinaia-3',
        name: 'Sinaia Monastery',
        description: 'Visit the peaceful 17th-century monastery that gave the town its name. Beautiful frescoes and serene atmosphere.',
        category: 'cultural' as ActivityCategory,
        location: {
          address: 'Mănăstirea Sinaia, Sinaia 106100, Romania',
          city: 'Sinaia',
          coordinates: {
            lat: 45.3508,
            lng: 25.5497
          }
        },
        rating: 4.4,
        priceLevel: 'free' as PriceLevel,
        imageUrl: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400',
        website: 'https://manastirea-sinaia.ro',
        phone: '+40 244 315 926',
        tags: ['monastery', 'religious', 'history', 'peaceful', 'cultural']
      },
      {
        id: 'sinaia-4',
        name: 'Bucegi Natural Park Hiking',
        description: 'Explore pristine mountain trails, see the famous Sphinx rock formation, and enjoy spectacular alpine scenery.',
        category: 'adventure' as ActivityCategory,
        location: {
          address: 'Parcul Natural Bucegi, Sinaia, Romania',
          city: 'Sinaia',
          coordinates: {
            lat: 45.4167,
            lng: 25.4667
          }
        },
        rating: 4.9,
        priceLevel: 'free' as PriceLevel,
        imageUrl: 'https://images.unsplash.com/photo-1551632811-561732d1e306?w=400',
        website: 'https://bucegi-park.ro',
        phone: '+40 244 315 001',
        tags: ['hiking', 'nature', 'mountains', 'sphinx', 'adventure', 'outdoor', 'park']
      },
      {
        id: 'sinaia-5',
        name: 'Pelisor Castle',
        description: 'Discover the Art Nouveau style castle built for King Ferdinand. Smaller but equally beautiful as Peles Castle.',
        category: 'cultural' as ActivityCategory,
        location: {
          address: 'Aleea Peleșului, Sinaia 106100, Romania',
          city: 'Sinaia',
          coordinates: {
            lat: 45.3594,
            lng: 25.5431
          }
        },
        rating: 4.3,
        priceLevel: 'moderate' as PriceLevel,
        imageUrl: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400',
        website: 'https://peles.ro',
        phone: '+40 244 310 918',
        tags: ['castle', 'art_nouveau', 'history', 'royal', 'cultural']
      },
      {
        id: 'sinaia-6',
        name: 'Mountain Biking Trails',
        description: 'Exciting mountain biking trails through forests and mountain paths. Equipment rental available.',
        category: 'adventure' as ActivityCategory,
        location: {
          address: 'Sinaia Mountain Trails, Sinaia, Romania',
          city: 'Sinaia',
          coordinates: {
            lat: 45.3667,
            lng: 25.5333
          }
        },
        rating: 4.5,
        priceLevel: 'moderate' as PriceLevel,
        imageUrl: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400',
        website: 'https://sinaia-biking.ro',
        phone: '+40 244 315 777',
        tags: ['biking', 'mountain_biking', 'adventure', 'outdoor', 'forest', 'trails']
      }
    ];

    // Filter by categories if specified
    let filteredActivities = mockActivities;
    if (categories && categories.length > 0) {
      filteredActivities = mockActivities.filter(activity => 
        categories.some(cat => 
          activity.category === cat || 
          activity.tags.some(tag => tag.includes(cat))
        )
      );
    }

    // Apply limit
    return filteredActivities.slice(0, limit);
  }
}
