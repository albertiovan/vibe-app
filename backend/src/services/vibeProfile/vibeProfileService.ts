/**
 * Vibe Profile Service
 * Core personality + adaptive ML learning system
 */

import { 
  CorePersonalityProfile, 
  UserMLProfile, 
  UserEvent,
  initializeMLProfile,
  updateMLWeights,
  buildClaudeContext,
  ML_CONFIG
} from '../../types/vibeProfile.js';

// In-memory storage (replace with Supabase/database in production)
const coreProfiles = new Map<string, CorePersonalityProfile>();
const mlProfiles = new Map<string, UserMLProfile>();
const userEvents = new Map<string, UserEvent[]>();

export class VibeProfileService {
  
  /**
   * Complete onboarding and create core personality profile
   */
  async completeOnboarding(onboardingData: {
    userId: string;
    interests: string[];
    energyLevel: 'chill' | 'medium' | 'high';
    indoorOutdoor: 'indoor' | 'outdoor' | 'either';
    socialStyle: 'solo' | 'group' | 'either';
    opennessScore: number;
  }): Promise<{ coreProfile: CorePersonalityProfile; mlProfile: UserMLProfile }> {
    
    console.log('🧠 Creating vibe profile for user:', onboardingData.userId);
    
    // Create core personality profile
    const coreProfile: CorePersonalityProfile = {
      userId: onboardingData.userId,
      interests: onboardingData.interests,
      energyLevel: onboardingData.energyLevel,
      indoorOutdoor: onboardingData.indoorOutdoor,
      socialStyle: onboardingData.socialStyle,
      opennessScore: onboardingData.opennessScore,
      mlProfileVersion: 1,
      onboardingComplete: true,
      createdAt: new Date(),
      lastUpdated: new Date()
    };
    
    // Initialize ML profile based on core profile
    const mlProfile = initializeMLProfile(coreProfile);
    
    // Store profiles
    coreProfiles.set(onboardingData.userId, coreProfile);
    mlProfiles.set(onboardingData.userId, mlProfile);
    
    // Track onboarding completion event
    await this.trackEvent({
      userId: onboardingData.userId,
      eventType: 'onboarding_complete',
      data: {
        interests: onboardingData.interests,
        energyLevel: onboardingData.energyLevel,
        opennessScore: onboardingData.opennessScore
      },
      context: {}
    });
    
    console.log('🧠 Vibe profile created:', {
      interests: coreProfile.interests,
      energyLevel: coreProfile.energyLevel,
      explorationBias: mlProfile.explorationBias,
      topWeights: Object.entries(mlProfile.interestWeights)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 3)
    });
    
    return { coreProfile, mlProfile };
  }
  
  /**
   * Get user's complete vibe profile
   */
  async getVibeProfile(userId: string): Promise<{
    coreProfile: CorePersonalityProfile | null;
    mlProfile: UserMLProfile | null;
  }> {
    const coreProfile = coreProfiles.get(userId) || null;
    const mlProfile = mlProfiles.get(userId) || null;
    
    return { coreProfile, mlProfile };
  }
  
  /**
   * Track user event for ML learning
   */
  async trackEvent(eventData: Omit<UserEvent, 'id' | 'timestamp'>): Promise<void> {
    const event: UserEvent = {
      id: `${eventData.userId}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      ...eventData
    };
    
    // Store event
    const userEventList = userEvents.get(eventData.userId) || [];
    userEventList.push(event);
    userEvents.set(eventData.userId, userEventList);
    
    console.log('📊 Event tracked:', {
      userId: eventData.userId,
      eventType: eventData.eventType,
      data: eventData.data
    });
    
    // Update ML profile if this is a learning event
    if (this.isLearningEvent(event)) {
      await this.updateMLProfile(eventData.userId, event);
    }
  }
  
  /**
   * Update ML profile based on user behavior
   */
  private async updateMLProfile(userId: string, event: UserEvent): Promise<void> {
    const currentMLProfile = mlProfiles.get(userId);
    if (!currentMLProfile) return;
    
    console.log('🤖 Updating ML profile for user:', userId);
    
    // Update weights based on event
    const updatedProfile = updateMLWeights(currentMLProfile, event);
    
    // Store updated profile
    mlProfiles.set(userId, updatedProfile);
    
    // Check if we should retrain (simplified version)
    if (this.shouldRetrain(updatedProfile)) {
      await this.retrainModel(userId);
    }
    
    console.log('🤖 ML profile updated:', {
      userId,
      totalInteractions: updatedProfile.totalInteractions,
      confidenceScore: updatedProfile.confidenceScore,
      explorationBias: updatedProfile.explorationBias,
      topInterests: Object.entries(updatedProfile.interestWeights)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 3)
        .map(([interest, weight]) => `${interest}: ${(weight * 100).toFixed(0)}%`)
    });
  }
  
  /**
   * Check if event should trigger ML learning
   */
  private isLearningEvent(event: UserEvent): boolean {
    return ['feedback', 'activity_view', 'challenge_accept', 'map_open'].includes(event.eventType);
  }
  
  /**
   * Check if model should be retrained
   */
  private shouldRetrain(mlProfile: UserMLProfile): boolean {
    const daysSinceUpdate = (Date.now() - mlProfile.lastModelUpdate.getTime()) / (1000 * 60 * 60 * 24);
    
    return (
      mlProfile.totalInteractions % ML_CONFIG.RETRAIN_INTERACTION_THRESHOLD === 0 ||
      daysSinceUpdate >= ML_CONFIG.RETRAIN_TIME_THRESHOLD_DAYS
    );
  }
  
  /**
   * Retrain ML model (simplified version)
   */
  private async retrainModel(userId: string): Promise<void> {
    console.log('🔄 Retraining model for user:', userId);
    
    const mlProfile = mlProfiles.get(userId);
    if (!mlProfile) return;
    
    const events = userEvents.get(userId) || [];
    const recentEvents = events.filter(e => 
      Date.now() - e.timestamp.getTime() < 30 * 24 * 60 * 60 * 1000 // Last 30 days
    );
    
    // Simple retraining: analyze recent feedback patterns
    const bucketFeedback: Record<string, { likes: number; dislikes: number }> = {};
    
    for (const event of recentEvents) {
      if (event.eventType === 'feedback' && event.data.bucket && event.data.result) {
        const bucket = event.data.bucket;
        if (!bucketFeedback[bucket]) {
          bucketFeedback[bucket] = { likes: 0, dislikes: 0 };
        }
        
        if (event.data.result === 'like') {
          bucketFeedback[bucket].likes++;
        } else if (event.data.result === 'dislike') {
          bucketFeedback[bucket].dislikes++;
        }
      }
    }
    
    // Update weights based on feedback patterns
    const updatedWeights = { ...mlProfile.interestWeights };
    
    for (const [bucket, feedback] of Object.entries(bucketFeedback)) {
      const total = feedback.likes + feedback.dislikes;
      if (total >= 3) { // Minimum feedback threshold
        const likeRatio = feedback.likes / total;
        const targetWeight = Math.max(ML_CONFIG.MIN_WEIGHT, Math.min(ML_CONFIG.MAX_WEIGHT, likeRatio));
        
        // Gradual adjustment towards target
        updatedWeights[bucket] = updatedWeights[bucket] * 0.7 + targetWeight * 0.3;
      }
    }
    
    // Update ML profile
    const updatedProfile: UserMLProfile = {
      ...mlProfile,
      interestWeights: updatedWeights,
      profileVersion: mlProfile.profileVersion + 1,
      lastModelUpdate: new Date()
    };
    
    mlProfiles.set(userId, updatedProfile);
    
    console.log('🔄 Model retrained:', {
      userId,
      version: updatedProfile.profileVersion,
      bucketUpdates: Object.keys(bucketFeedback).length,
      newWeights: Object.entries(updatedWeights)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 5)
        .map(([bucket, weight]) => `${bucket}: ${(weight * 100).toFixed(0)}%`)
    });
  }
  
  /**
   * Get Claude AI context with user profile
   */
  async getAIContext(userId: string, sessionContext: any): Promise<string | null> {
    const { coreProfile, mlProfile } = await this.getVibeProfile(userId);
    
    if (!coreProfile || !mlProfile) {
      return null;
    }
    
    return buildClaudeContext(coreProfile, mlProfile, sessionContext);
  }
  
  /**
   * Get personalized recommendations using ML weights
   */
  async getPersonalizedWeights(userId: string): Promise<Record<string, number> | null> {
    const mlProfile = mlProfiles.get(userId);
    return mlProfile ? mlProfile.interestWeights : null;
  }
  
  /**
   * Get user analytics and insights
   */
  async getUserAnalytics(userId: string): Promise<any> {
    const { coreProfile, mlProfile } = await this.getVibeProfile(userId);
    const events = userEvents.get(userId) || [];
    
    if (!coreProfile || !mlProfile) {
      return null;
    }
    
    // Calculate engagement metrics
    const feedbackEvents = events.filter(e => e.eventType === 'feedback');
    const likes = feedbackEvents.filter(e => e.data.result === 'like').length;
    const dislikes = feedbackEvents.filter(e => e.data.result === 'dislike').length;
    
    // Calculate interest evolution
    const interestTrends = Object.entries(mlProfile.interestWeights)
      .sort(([,a], [,b]) => b - a)
      .map(([interest, weight]) => ({
        interest,
        weight: Math.round(weight * 100),
        isCore: coreProfile.interests.includes(interest)
      }));
    
    return {
      profile: {
        onboardingDate: coreProfile.createdAt,
        totalInteractions: mlProfile.totalInteractions,
        confidenceScore: Math.round(mlProfile.confidenceScore * 100),
        explorationBias: Math.round(mlProfile.explorationBias * 100),
        profileVersion: mlProfile.profileVersion
      },
      engagement: {
        totalEvents: events.length,
        feedbackEvents: feedbackEvents.length,
        likeRate: feedbackEvents.length > 0 ? Math.round((likes / feedbackEvents.length) * 100) : 0,
        likes,
        dislikes
      },
      interests: {
        core: coreProfile.interests,
        learned: interestTrends.slice(0, 5),
        evolution: `${interestTrends.filter(i => !i.isCore && i.weight > 30).length} new interests discovered`
      },
      personality: {
        energyLevel: coreProfile.energyLevel,
        indoorOutdoor: coreProfile.indoorOutdoor,
        socialStyle: coreProfile.socialStyle,
        opennessScore: coreProfile.opennessScore
      }
    };
  }
  
  /**
   * Export user data (GDPR compliance)
   */
  async exportUserData(userId: string): Promise<any> {
    const { coreProfile, mlProfile } = await this.getVibeProfile(userId);
    const events = userEvents.get(userId) || [];
    
    return {
      coreProfile,
      mlProfile,
      events: events.map(e => ({
        ...e,
        // Remove sensitive context data
        context: undefined
      }))
    };
  }
  
  /**
   * Delete all user data (GDPR compliance)
   */
  async deleteUserData(userId: string): Promise<void> {
    coreProfiles.delete(userId);
    mlProfiles.delete(userId);
    userEvents.delete(userId);
    
    console.log('🗑️ Deleted all vibe profile data for user:', userId);
  }
  
  /**
   * Get system-wide analytics (for admin dashboard)
   */
  async getSystemAnalytics(): Promise<any> {
    const totalUsers = coreProfiles.size;
    const totalEvents = Array.from(userEvents.values()).reduce((sum, events) => sum + events.length, 0);
    
    // Calculate average profile metrics
    const mlProfilesArray = Array.from(mlProfiles.values());
    const avgConfidence = mlProfilesArray.reduce((sum, p) => sum + p.confidenceScore, 0) / mlProfilesArray.length;
    const avgInteractions = mlProfilesArray.reduce((sum, p) => sum + p.totalInteractions, 0) / mlProfilesArray.length;
    
    // Interest popularity
    const interestCounts: Record<string, number> = {};
    Array.from(coreProfiles.values()).forEach(profile => {
      profile.interests.forEach(interest => {
        interestCounts[interest] = (interestCounts[interest] || 0) + 1;
      });
    });
    
    const popularInterests = Object.entries(interestCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([interest, count]) => ({ interest, count, percentage: Math.round((count / totalUsers) * 100) }));
    
    return {
      users: {
        total: totalUsers,
        withMLProfiles: mlProfilesArray.length,
        avgConfidence: Math.round(avgConfidence * 100),
        avgInteractions: Math.round(avgInteractions)
      },
      events: {
        total: totalEvents,
        avgPerUser: Math.round(totalEvents / totalUsers)
      },
      interests: {
        popular: popularInterests,
        total: Object.keys(interestCounts).length
      }
    };
  }
}
