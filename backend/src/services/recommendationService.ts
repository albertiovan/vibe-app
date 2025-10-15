import { Activity, RecommendationRequest, MoodAnalysis, ActivityCategory } from '../types';
import { MoodParser } from './moodParser';
import { TripAdvisorService } from './tripAdvisorService';

export class RecommendationService {
  private moodParser: MoodParser;
  private tripAdvisorService: TripAdvisorService;

  constructor() {
    this.moodParser = new MoodParser();
    this.tripAdvisorService = new TripAdvisorService();
  }

  public async getRecommendations(request: RecommendationRequest): Promise<{
    activities: Activity[];
    moodAnalysis: MoodAnalysis;
    totalResults: number;
  }> {
    try {
      // Parse the user's vibe to understand their mood
      const moodAnalysis = this.moodParser.parseMood(request.vibe);
      
      // Determine search location
      const searchLocation = this.getSearchLocation(request);
      
      // Combine suggested categories with user-specified categories
      const searchCategories = this.combineCategories(
        moodAnalysis.suggestedCategories,
        request.categories
      );

      // Search for activities
      let activities = await this.tripAdvisorService.searchActivities(
        searchLocation,
        searchCategories,
        15 // Get more results for better filtering
      );

      // Apply additional filters
      activities = this.applyFilters(activities, request, moodAnalysis);

      // Sort by relevance to mood and user preferences
      activities = this.sortByRelevance(activities, moodAnalysis, request);

      // Limit to final result count (10-15 as per PRD)
      const finalActivities = activities.slice(0, 12);

      return {
        activities: finalActivities,
        moodAnalysis,
        totalResults: activities.length
      };
    } catch (error) {
      console.error('Recommendation service error:', error);
      
      // Return empty results with basic mood analysis on error
      const moodAnalysis = this.moodParser.parseMood(request.vibe);
      return {
        activities: [],
        moodAnalysis,
        totalResults: 0
      };
    }
  }

  private getSearchLocation(request: RecommendationRequest): string {
    // Use provided city or default to major Romanian cities
    if (request.city) {
      return request.city;
    }

    // Default to Bucharest if no location provided
    // In a real app, this could be based on user's IP geolocation
    return 'Bucharest, Romania';
  }

  private combineCategories(
    suggestedCategories: ActivityCategory[],
    userCategories?: ActivityCategory[]
  ): ActivityCategory[] {
    const combined = new Set<ActivityCategory>();
    
    // Add suggested categories from mood analysis
    suggestedCategories.forEach(cat => combined.add(cat));
    
    // Add user-specified categories (higher priority)
    userCategories?.forEach(cat => combined.add(cat));
    
    return Array.from(combined);
  }

  private applyFilters(
    activities: Activity[],
    request: RecommendationRequest,
    moodAnalysis: MoodAnalysis
  ): Activity[] {
    let filtered = activities;

    // Filter by price level if specified
    if (request.priceLevel && request.priceLevel.length > 0) {
      filtered = filtered.filter(activity => 
        !activity.priceLevel || request.priceLevel!.includes(activity.priceLevel)
      );
    }

    // Filter by distance if location and maxDistance provided
    if (request.location && request.maxDistance) {
      filtered = filtered.filter(activity => {
        if (!activity.location.coordinates) return true;
        
        const distance = this.calculateDistance(
          request.location!.lat,
          request.location!.lng,
          activity.location.coordinates.lat,
          activity.location.coordinates.lng
        );
        
        activity.distance = distance;
        return distance <= request.maxDistance!;
      });
    }

    // Filter by mood-relevant tags
    const relevantTags = moodAnalysis.suggestedTags;
    if (relevantTags.length > 0) {
      // Boost activities that match mood tags, but don't exclude others entirely
      filtered = filtered.map(activity => ({
        ...activity,
        moodRelevance: this.calculateMoodRelevance(activity, relevantTags)
      }));
    }

    return filtered;
  }

  private sortByRelevance(
    activities: Activity[],
    moodAnalysis: MoodAnalysis,
    request: RecommendationRequest
  ): Activity[] {
    return activities.sort((a, b) => {
      let scoreA = 0;
      let scoreB = 0;

      // Factor 1: Mood relevance (highest weight)
      const moodRelevanceA = (a as any).moodRelevance || 0;
      const moodRelevanceB = (b as any).moodRelevance || 0;
      scoreA += moodRelevanceA * 3;
      scoreB += moodRelevanceB * 3;

      // Factor 2: Rating (medium weight)
      if (a.rating) scoreA += a.rating * 0.5;
      if (b.rating) scoreB += b.rating * 0.5;

      // Factor 3: Distance (lower is better, medium weight)
      if (a.distance) scoreA -= a.distance * 0.1;
      if (b.distance) scoreB -= b.distance * 0.1;

      // Factor 4: Category match (low weight)
      if (request.categories) {
        if (request.categories.includes(a.category)) scoreA += 1;
        if (request.categories.includes(b.category)) scoreB += 1;
      }

      return scoreB - scoreA;
    });
  }

  private calculateMoodRelevance(activity: Activity, relevantTags: string[]): number {
    let relevance = 0;
    
    // Check if activity tags match mood tags
    activity.tags.forEach(tag => {
      if (relevantTags.some(moodTag => 
        tag.includes(moodTag) || moodTag.includes(tag)
      )) {
        relevance += 1;
      }
    });

    // Check if activity name/description contains mood-relevant terms
    const activityText = `${activity.name} ${activity.description}`.toLowerCase();
    relevantTags.forEach(tag => {
      if (activityText.includes(tag.toLowerCase())) {
        relevance += 0.5;
      }
    });

    return relevance;
  }

  private calculateDistance(
    lat1: number,
    lng1: number,
    lat2: number,
    lng2: number
  ): number {
    // Haversine formula for calculating distance between two points
    const R = 6371; // Earth's radius in kilometers
    const dLat = this.toRadians(lat2 - lat1);
    const dLng = this.toRadians(lng2 - lng1);
    
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(this.toRadians(lat1)) * Math.cos(this.toRadians(lat2)) *
              Math.sin(dLng / 2) * Math.sin(dLng / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    
    return R * c;
  }

  private toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }
}
