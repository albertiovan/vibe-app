/**
 * Personalization Service
 * Handles user profiles, feedback learning, and personalized scoring
 */

import { 
  UserProfile, 
  UserInteraction, 
  PersonalizationWeights,
  OnboardingData,
  calculateInterestMatch,
  getDefaultWeights,
  LEARNING_CONFIG
} from '../../types/personalization.js';
import { VibePlace } from '../../types/vibe.js';

// Simple in-memory storage (replace with database in production)
const userProfiles = new Map<string, UserProfile>();
const userInteractions = new Map<string, UserInteraction[]>();
const personalizationWeights = new Map<string, PersonalizationWeights>();

export class PersonalizationService {
  
  /**
   * Create user profile from onboarding data
   */
  async createUserProfile(userId: string, onboardingData: OnboardingData): Promise<UserProfile> {
    const profile: UserProfile = {
      id: userId,
      homeCity: onboardingData.homeCity,
      homeLat: onboardingData.homeLocation?.lat,
      homeLng: onboardingData.homeLocation?.lng,
      interests: onboardingData.interests,
      riskTolerance: onboardingData.riskTolerance,
      travelWillingnessKm: onboardingData.travelWillingness,
      createdAt: new Date(),
      updatedAt: new Date(),
      dataProcessingConsent: onboardingData.dataConsent,
      feedbackOptIn: onboardingData.feedbackOptIn,
      bucketWeights: {},
      keywordAffinities: {}
    };

    // Store profile and initialize weights
    userProfiles.set(userId, profile);
    personalizationWeights.set(userId, getDefaultWeights(profile));
    
    console.log('👤 Created user profile:', {
      userId,
      interests: profile.interests,
      riskTolerance: profile.riskTolerance,
      travelWillingness: profile.travelWillingnessKm
    });

    return profile;
  }

  /**
   * Get user profile by ID
   */
  async getUserProfile(userId: string): Promise<UserProfile | null> {
    return userProfiles.get(userId) || null;
  }

  /**
   * Update user profile
   */
  async updateUserProfile(userId: string, updates: Partial<UserProfile>): Promise<UserProfile | null> {
    const profile = userProfiles.get(userId);
    if (!profile) return null;

    const updatedProfile = {
      ...profile,
      ...updates,
      updatedAt: new Date()
    };

    userProfiles.set(userId, updatedProfile);
    return updatedProfile;
  }

  /**
   * Record user interaction (view, like, dislike, etc.)
   */
  async recordInteraction(interaction: Omit<UserInteraction, 'id' | 'timestamp'>): Promise<void> {
    const fullInteraction: UserInteraction = {
      ...interaction,
      id: `${interaction.userId}_${interaction.itemId}_${Date.now()}`,
      timestamp: new Date()
    };

    // Store interaction
    const userInteractionList = userInteractions.get(interaction.userId) || [];
    userInteractionList.push(fullInteraction);
    userInteractions.set(interaction.userId, userInteractionList);

    console.log('📊 Recorded interaction:', {
      userId: interaction.userId,
      outcome: interaction.outcome,
      bucket: interaction.bucket,
      tags: interaction.tags
    });

    // Check if we should update personalization weights
    await this.maybeUpdateWeights(interaction.userId);
  }

  /**
   * Get personalized scoring for places
   */
  async getPersonalizedScores(
    userId: string,
    places: VibePlace[],
    context: {
      weatherConditions?: string;
      timeOfDay?: string;
      userLocation?: { lat: number; lng: number };
    }
  ): Promise<Array<VibePlace & { personalizedScore: number }>> {
    const profile = await this.getUserProfile(userId);
    const weights = personalizationWeights.get(userId);

    if (!profile || !weights) {
      // Return original scores for users without profiles
      return places.map(place => ({
        ...place,
        personalizedScore: place.vibeScore || 0.5
      }));
    }

    return places.map(place => {
      const personalizedScore = this.calculatePersonalizedScore(
        place,
        profile,
        weights,
        context
      );

      return {
        ...place,
        personalizedScore
      };
    });
  }

  /**
   * Calculate personalized score for a single place
   */
  private calculatePersonalizedScore(
    place: VibePlace,
    profile: UserProfile,
    weights: PersonalizationWeights,
    context: {
      weatherConditions?: string;
      timeOfDay?: string;
      userLocation?: { lat: number; lng: number };
    }
  ): number {
    // Base components
    const weatherSuitability = this.getWeatherSuitability(place, context.weatherConditions);
    const ratingScore = this.getRatingScore(place);
    const interestMatch = this.getInterestMatch(place, profile);
    const noveltyScore = this.getNoveltyScore(place, profile.id);
    const distancePenalty = this.getDistancePenalty(place, profile, context.userLocation);
    const durationPenalty = this.getDurationPenalty(place, profile);
    const feedbackBoost = this.getFeedbackBoost(place, profile.id, weights);

    // Apply personalized weights
    const score = 
      weights.weatherWeight * weatherSuitability +
      weights.ratingWeight * ratingScore +
      weights.interestWeight * interestMatch +
      weights.noveltyWeight * noveltyScore -
      weights.distancePenalty * distancePenalty -
      weights.durationPenalty * durationPenalty +
      feedbackBoost;

    return Math.max(0, Math.min(1, score / 5)); // Normalize to 0-1
  }

  /**
   * Get weather suitability score
   */
  private getWeatherSuitability(place: VibePlace, weatherConditions?: string): number {
    // Simple heuristic - can be enhanced with weather service integration
    if (!weatherConditions) return 0.7; // Default neutral score

    const placeTypes = place.types.join(' ').toLowerCase();
    
    if (weatherConditions.includes('rain')) {
      // Indoor places benefit from rain
      if (placeTypes.includes('museum') || placeTypes.includes('mall') || placeTypes.includes('restaurant')) {
        return 0.9;
      }
      // Outdoor places suffer from rain
      if (placeTypes.includes('park') || placeTypes.includes('outdoor')) {
        return 0.3;
      }
    }

    if (weatherConditions.includes('clear') || weatherConditions.includes('sunny')) {
      // Outdoor places benefit from clear weather
      if (placeTypes.includes('park') || placeTypes.includes('outdoor')) {
        return 0.9;
      }
    }

    return 0.7; // Default
  }

  /**
   * Get rating-based score with review count consideration
   */
  private getRatingScore(place: VibePlace): number {
    if (!place.rating) return 0.5;
    
    const reviewCount = place.userRatingsTotal || 1;
    const reviewBonus = Math.log(1 + reviewCount) / 10; // Logarithmic bonus for review count
    
    return (place.rating / 5) + reviewBonus;
  }

  /**
   * Get interest match score
   */
  private getInterestMatch(place: VibePlace, profile: UserProfile): number {
    const placeKeywords = [
      place.name.toLowerCase(),
      ...place.types,
      ...(place.vibeReasons || [])
    ];

    // Determine place bucket from types
    const placeBucket = this.inferPlaceBucket(place);
    
    return calculateInterestMatch(profile.interests, placeKeywords, placeBucket);
  }

  /**
   * Get novelty score (lower for recently seen places)
   */
  private getNoveltyScore(place: VibePlace, userId: string): number {
    const interactions = userInteractions.get(userId) || [];
    
    // Check if user has seen this place recently
    const recentInteraction = interactions
      .filter(i => i.itemId === place.placeId)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())[0];

    if (!recentInteraction) return 1.0; // Completely novel

    const daysSince = (Date.now() - recentInteraction.timestamp.getTime()) / (1000 * 60 * 60 * 24);
    
    if (daysSince < LEARNING_CONFIG.NOVELTY_DECAY_DAYS) {
      // Apply novelty decay
      const noveltyFactor = daysSince / LEARNING_CONFIG.NOVELTY_DECAY_DAYS;
      return Math.max(0.2, noveltyFactor); // Minimum 0.2 novelty
    }

    return 1.0; // Full novelty after decay period
  }

  /**
   * Get distance penalty based on user preferences
   */
  private getDistancePenalty(
    place: VibePlace, 
    profile: UserProfile, 
    userLocation?: { lat: number; lng: number }
  ): number {
    if (!userLocation) return 0; // No penalty if location unknown

    const distance = place.walkingTime ? place.walkingTime / 12 : 5; // Rough km estimate
    const maxDistance = profile.travelWillingnessKm || 50;
    
    if (distance <= maxDistance * 0.5) return 0; // No penalty for close places
    if (distance > maxDistance) return 1; // Full penalty for too far
    
    return (distance - maxDistance * 0.5) / (maxDistance * 0.5); // Linear penalty
  }

  /**
   * Get duration penalty based on typical activity duration
   */
  private getDurationPenalty(place: VibePlace, profile: UserProfile): number {
    // Simple heuristic - can be enhanced with duration preferences
    const riskTolerance = profile.riskTolerance || 'medium';
    
    if (riskTolerance === 'chill') {
      // Prefer shorter, easier activities
      if (place.energyLevel === 'high') return 0.3;
    } else if (riskTolerance === 'high') {
      // Prefer longer, more challenging activities
      if (place.energyLevel === 'low') return 0.2;
    }
    
    return 0; // No penalty for medium risk tolerance
  }

  /**
   * Get feedback-based boost from learned preferences
   */
  private getFeedbackBoost(place: VibePlace, userId: string, weights: PersonalizationWeights): number {
    let boost = 0;

    // Bucket-based boost
    const placeBucket = this.inferPlaceBucket(place);
    boost += weights.bucketBoosts[placeBucket] || 0;

    // Keyword-based boost
    const placeKeywords = [place.name.toLowerCase(), ...place.types];
    for (const keyword of placeKeywords) {
      boost += weights.keywordBoosts[keyword] || 0;
    }

    return boost;
  }

  /**
   * Infer place bucket from types and characteristics
   */
  private inferPlaceBucket(place: VibePlace): string {
    const types = place.types.join(' ').toLowerCase();
    
    if (types.includes('museum') || types.includes('art_gallery')) return 'culture';
    if (types.includes('park') || types.includes('natural_feature')) return 'nature';
    if (types.includes('amusement_park') || types.includes('gym')) return 'adventure';
    if (types.includes('spa') || types.includes('beauty_salon')) return 'wellness';
    if (types.includes('night_club') || types.includes('bar')) return 'nightlife';
    if (types.includes('restaurant') || types.includes('cafe')) return 'food';
    
    return 'entertainment'; // Default
  }

  /**
   * Maybe update personalization weights based on recent interactions
   */
  private async maybeUpdateWeights(userId: string): Promise<void> {
    const interactions = userInteractions.get(userId) || [];
    const weights = personalizationWeights.get(userId);
    
    if (!weights || interactions.length < LEARNING_CONFIG.MIN_INTERACTIONS) {
      return; // Not enough data to learn
    }

    // Check if we should update (every N interactions or weekly)
    const lastUpdate = weights.lastUpdated;
    const daysSinceUpdate = (Date.now() - lastUpdate.getTime()) / (1000 * 60 * 60 * 24);
    const recentInteractions = interactions.filter(i => 
      i.timestamp.getTime() > lastUpdate.getTime()
    );

    const shouldUpdate = 
      recentInteractions.length >= LEARNING_CONFIG.UPDATE_THRESHOLD ||
      daysSinceUpdate >= LEARNING_CONFIG.MAX_DAYS_BETWEEN_UPDATES;

    if (shouldUpdate) {
      await this.updatePersonalizationWeights(userId);
    }
  }

  /**
   * Update personalization weights based on user feedback
   */
  private async updatePersonalizationWeights(userId: string): Promise<void> {
    const interactions = userInteractions.get(userId) || [];
    const currentWeights = personalizationWeights.get(userId);
    
    if (!currentWeights) return;

    console.log('🧠 Updating personalization weights for user:', userId);

    const newWeights = { ...currentWeights };

    // Analyze feedback interactions
    const feedbackInteractions = interactions.filter(i => 
      i.outcome === 'like' || i.outcome === 'dislike'
    );

    for (const interaction of feedbackInteractions) {
      const isPositive = interaction.outcome === 'like';
      const boost = isPositive ? LEARNING_CONFIG.LIKE_BOOST : LEARNING_CONFIG.DISLIKE_PENALTY;

      // Update bucket weights
      const currentBucketWeight = newWeights.bucketBoosts[interaction.bucket] || 0;
      newWeights.bucketBoosts[interaction.bucket] = Math.max(
        -LEARNING_CONFIG.MAX_WEIGHT_CHANGE,
        Math.min(
          LEARNING_CONFIG.MAX_WEIGHT_CHANGE,
          currentBucketWeight + boost
        )
      );

      // Update keyword weights based on tags
      if (interaction.tags) {
        for (const tag of interaction.tags) {
          const currentKeywordWeight = newWeights.keywordBoosts[tag] || 0;
          newWeights.keywordBoosts[tag] = Math.max(
            -LEARNING_CONFIG.MAX_WEIGHT_CHANGE,
            Math.min(
              LEARNING_CONFIG.MAX_WEIGHT_CHANGE,
              currentKeywordWeight + boost
            )
          );
        }
      }
    }

    // Update timestamp
    newWeights.lastUpdated = new Date();

    // Store updated weights
    personalizationWeights.set(userId, newWeights);

    console.log('🧠 Updated weights:', {
      userId,
      bucketBoosts: Object.keys(newWeights.bucketBoosts).length,
      keywordBoosts: Object.keys(newWeights.keywordBoosts).length,
      feedbackCount: feedbackInteractions.length
    });
  }

  /**
   * Get user statistics for debugging
   */
  async getUserStats(userId: string): Promise<any> {
    const profile = await this.getUserProfile(userId);
    const interactions = userInteractions.get(userId) || [];
    const weights = personalizationWeights.get(userId);

    return {
      profile: profile ? {
        interests: profile.interests,
        riskTolerance: profile.riskTolerance,
        travelWillingness: profile.travelWillingnessKm
      } : null,
      interactions: {
        total: interactions.length,
        likes: interactions.filter(i => i.outcome === 'like').length,
        dislikes: interactions.filter(i => i.outcome === 'dislike').length,
        views: interactions.filter(i => i.outcome === 'view').length,
        mapOpens: interactions.filter(i => i.outcome === 'open_maps').length
      },
      weights: weights ? {
        bucketBoosts: weights.bucketBoosts,
        keywordBoosts: weights.keywordBoosts,
        lastUpdated: weights.lastUpdated
      } : null
    };
  }

  /**
   * Clear all user data (for privacy compliance)
   */
  async deleteUserData(userId: string): Promise<void> {
    userProfiles.delete(userId);
    userInteractions.delete(userId);
    personalizationWeights.delete(userId);
    
    console.log('🗑️ Deleted all data for user:', userId);
  }
}
