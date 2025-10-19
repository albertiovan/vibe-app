/**
 * Core Vibe Profile System
 * Static personality foundation + dynamic ML learning
 */

// Core Personality Profile (Static Layer - collected once during onboarding)
export interface CorePersonalityProfile {
  userId: string;
  
  // Primary interests (3-7 categories from animated tiles)
  interests: string[]; // ['adventure', 'nature', 'culture', 'wellness']
  
  // Core personality dimensions
  energyLevel: 'chill' | 'medium' | 'high';
  indoorOutdoor: 'indoor' | 'outdoor' | 'either';
  socialStyle: 'solo' | 'group' | 'either';
  
  // Exploration preferences
  opennessScore: number; // 1-5 scale, controls "Challenge Me" behavior
  
  // System metadata
  mlProfileVersion: number; // Track retraining checkpoints
  onboardingComplete: boolean;
  createdAt: Date;
  lastUpdated: Date;
}

// Machine Learning Profile (Dynamic Layer - continuously refined)
export interface UserMLProfile {
  userId: string;
  
  // Dynamic interest weights (0-1 per category)
  interestWeights: Record<string, number>; // { "adventure": 0.9, "culture": 0.3 }
  
  // Exploration vs exploitation balance
  explorationBias: number; // 0-1 controls how often to push "new" ideas
  
  // Challenge acceptance learning
  challengeHistory: {
    totalChallengesOffered: number;
    totalChallengesAccepted: number;
    recentAcceptanceRate: number; // Last 10 challenges
    lastChallengeDate?: Date;
  };
  
  // Behavioral patterns
  feedbackHistory: {
    liked: string[]; // Place IDs or activity types
    disliked: string[];
    ignored: string[]; // Viewed but no interaction
  };
  
  // Contextual preferences learned over time
  timePreferences: Record<string, number>; // morning, afternoon, evening, night
  weatherPreferences: Record<string, number>; // clear, cloudy, rainy
  distancePatterns: {
    averageDistance: number;
    maxDistance: number;
    preferredRange: [number, number];
  };
  
  // ML metadata
  lastModelUpdate: Date;
  totalInteractions: number;
  confidenceScore: number; // 0-1 how confident we are in the profile
  
  // Version tracking
  profileVersion: number;
}

// Event tracking for ML learning
export interface UserEvent {
  id: string;
  userId: string;
  eventType: 'activity_view' | 'feedback' | 'challenge_accept' | 'challenge_decline' | 'challenge_offered' | 'map_open' | 'search' | 'dismiss' | 'onboarding_complete';
  timestamp: Date;
  
  // Event data
  data: {
    itemId?: string;
    itemName?: string;
    bucket?: string;
    region?: string;
    result?: 'like' | 'dislike' | 'ignore';
    searchVibe?: string;
    location?: { lat: number; lng: number };
    weatherConditions?: string;
    timeOfDay?: string;
    sessionId?: string;
    interests?: string[]; // For onboarding events
    energyLevel?: string;
    opennessScore?: number;
    
    // Challenge-specific data
    challengeId?: string;
    challengeLevel?: number; // 1-5 difficulty
    destinationCity?: string;
    travelDistanceKm?: number;
  };
  
  // Context
  context: {
    deviceType?: string;
    appVersion?: string;
    userAgent?: string;
  };
}

// Animated onboarding tiles configuration
export const PERSONALITY_DIMENSIONS = {
  interests: {
    title: "What sparks your curiosity?",
    subtitle: "Choose 3-7 interests that define your ideal experiences",
    minSelection: 3,
    maxSelection: 7,
    tiles: [
      {
        id: 'adventure',
        label: 'Adventure & Thrills',
        emoji: '🎢',
        description: 'Adrenaline, extreme sports, exciting challenges',
        keywords: ['adrenaline', 'extreme', 'adventure', 'thrills', 'exciting'],
        gradient: ['#FF6B6B', '#FF8E53']
      },
      {
        id: 'nature',
        label: 'Nature & Outdoors',
        emoji: '🌲',
        description: 'Hiking, parks, natural beauty, fresh air',
        keywords: ['nature', 'hiking', 'outdoors', 'parks', 'natural'],
        gradient: ['#4ECDC4', '#44A08D']
      },
      {
        id: 'culture',
        label: 'Culture & Arts',
        emoji: '🎨',
        description: 'Museums, galleries, history, local traditions',
        keywords: ['culture', 'art', 'museum', 'history', 'heritage'],
        gradient: ['#A8E6CF', '#7FCDCD']
      },
      {
        id: 'wellness',
        label: 'Wellness & Relaxation',
        emoji: '🧘',
        description: 'Spa, meditation, peaceful moments, self-care',
        keywords: ['wellness', 'spa', 'relaxation', 'meditation', 'peaceful'],
        gradient: ['#FFB6C1', '#FFA0AC']
      },
      {
        id: 'food',
        label: 'Food & Culinary',
        emoji: '🍽️',
        description: 'Restaurants, local cuisine, cooking experiences',
        keywords: ['food', 'restaurant', 'cuisine', 'culinary', 'dining'],
        gradient: ['#FFEAA7', '#FDCB6E']
      },
      {
        id: 'nightlife',
        label: 'Nightlife & Social',
        emoji: '🌃',
        description: 'Bars, clubs, social events, evening entertainment',
        keywords: ['nightlife', 'bar', 'club', 'social', 'entertainment'],
        gradient: ['#6C5CE7', '#A29BFE']
      },
      {
        id: 'shopping',
        label: 'Shopping & Markets',
        emoji: '🛍️',
        description: 'Markets, boutiques, local crafts, shopping districts',
        keywords: ['shopping', 'market', 'boutique', 'crafts', 'retail'],
        gradient: ['#FD79A8', '#E84393']
      },
      {
        id: 'photography',
        label: 'Photography & Views',
        emoji: '📸',
        description: 'Scenic spots, Instagram-worthy locations, viewpoints',
        keywords: ['photography', 'scenic', 'views', 'instagram', 'photo'],
        gradient: ['#00B894', '#00CEC9']
      }
    ]
  },
  
  energyLevel: {
    title: "What's your energy style?",
    subtitle: "How intense do you like your experiences?",
    options: [
      {
        id: 'chill',
        label: 'Chill & Relaxed',
        emoji: '😌',
        description: 'Low-key, peaceful, easy-going activities',
        gradient: ['#A8E6CF', '#88D8A3']
      },
      {
        id: 'medium',
        label: 'Balanced Mix',
        emoji: '⚖️',
        description: 'Variety of calm and active experiences',
        gradient: ['#FFD93D', '#6BCF7F']
      },
      {
        id: 'high',
        label: 'High Energy',
        emoji: '🚀',
        description: 'Active, intense, challenging adventures',
        gradient: ['#FF6B6B', '#FF8E53']
      }
    ]
  },
  
  indoorOutdoor: {
    title: "Where do you feel most alive?",
    subtitle: "Choose your preferred environment",
    options: [
      {
        id: 'indoor',
        label: 'Indoor Spaces',
        emoji: '🏛️',
        description: 'Museums, galleries, cozy cafes, cultural venues',
        gradient: ['#A29BFE', '#6C5CE7']
      },
      {
        id: 'outdoor',
        label: 'Great Outdoors',
        emoji: '🌤️',
        description: 'Parks, trails, open spaces, nature activities',
        gradient: ['#00B894', '#00CEC9']
      },
      {
        id: 'either',
        label: 'Both Appeal',
        emoji: '🌈',
        description: 'Enjoy variety of indoor and outdoor experiences',
        gradient: ['#FFEAA7', '#FDCB6E']
      }
    ]
  },
  
  socialStyle: {
    title: "How do you like to explore?",
    subtitle: "What's your ideal social setting?",
    options: [
      {
        id: 'solo',
        label: 'Solo Adventures',
        emoji: '🚶',
        description: 'Personal time, self-reflection, independent exploration',
        gradient: ['#81ECEC', '#74B9FF']
      },
      {
        id: 'group',
        label: 'Group Experiences',
        emoji: '👥',
        description: 'Social activities, shared moments, group adventures',
        gradient: ['#FD79A8', '#E84393']
      },
      {
        id: 'either',
        label: 'Flexible',
        emoji: '🤝',
        description: 'Enjoy both solo and group activities',
        gradient: ['#00B894', '#55A3FF']
      }
    ]
  },
  
  opennessScore: {
    title: "How adventurous are you?",
    subtitle: "Rate your openness to new experiences",
    type: 'slider',
    min: 1,
    max: 5,
    labels: {
      1: { emoji: '🏠', label: 'Comfort Zone', description: 'Prefer familiar experiences' },
      2: { emoji: '🚶', label: 'Cautious Explorer', description: 'Small steps outside comfort zone' },
      3: { emoji: '🧭', label: 'Balanced', description: 'Mix of familiar and new' },
      4: { emoji: '🎒', label: 'Adventure Seeker', description: 'Love trying new things' },
      5: { emoji: '🚀', label: 'Fearless Explorer', description: 'Always seeking the unknown' }
    }
  }
};

// ML Learning Configuration
export const ML_CONFIG = {
  // Weight update parameters
  LEARNING_RATE: 0.05,
  FEEDBACK_IMPACT: {
    like: 0.1,
    dislike: -0.05,
    ignore: -0.01
  },
  
  // Exploration parameters
  EXPLORATION_DECAY: 0.95, // Gradually reduce exploration as confidence grows
  MIN_EXPLORATION: 0.1,
  MAX_EXPLORATION: 0.8,
  
  // Confidence building
  MIN_INTERACTIONS_FOR_CONFIDENCE: 20,
  CONFIDENCE_GROWTH_RATE: 0.02,
  
  // Retraining thresholds
  RETRAIN_INTERACTION_THRESHOLD: 50,
  RETRAIN_TIME_THRESHOLD_DAYS: 7,
  
  // Weight bounds
  MIN_WEIGHT: 0.05,
  MAX_WEIGHT: 1.0,
  
  // Default weights for new interests
  DEFAULT_INTEREST_WEIGHT: 0.2,
  ONBOARDING_INTEREST_WEIGHT: 0.8
};

// Helper functions for ML profile management
export function initializeMLProfile(coreProfile: CorePersonalityProfile): UserMLProfile {
  const interestWeights: Record<string, number> = {};
  
  // Initialize all possible interests with default weights
  PERSONALITY_DIMENSIONS.interests.tiles.forEach(tile => {
    interestWeights[tile.id] = coreProfile.interests.includes(tile.id) 
      ? ML_CONFIG.ONBOARDING_INTEREST_WEIGHT 
      : ML_CONFIG.DEFAULT_INTEREST_WEIGHT;
  });
  
  // Set exploration bias based on openness score
  const explorationBias = Math.min(
    ML_CONFIG.MAX_EXPLORATION,
    (coreProfile.opennessScore / 5) * 0.6 + 0.2
  );
  
  return {
    userId: coreProfile.userId,
    interestWeights,
    explorationBias,
    challengeHistory: {
      totalChallengesOffered: 0,
      totalChallengesAccepted: 0,
      recentAcceptanceRate: 0.5, // Start neutral
      lastChallengeDate: undefined
    },
    feedbackHistory: {
      liked: [],
      disliked: [],
      ignored: []
    },
    timePreferences: {},
    weatherPreferences: {},
    distancePatterns: {
      averageDistance: 0,
      maxDistance: 0,
      preferredRange: [0, 50]
    },
    lastModelUpdate: new Date(),
    totalInteractions: 0,
    confidenceScore: 0.1, // Start with low confidence
    profileVersion: 1
  };
}

export function updateMLWeights(
  profile: UserMLProfile, 
  event: UserEvent
): UserMLProfile {
  const updated = { ...profile };
  
  if (event.eventType === 'feedback' && event.data.bucket && event.data.result) {
    const bucket = event.data.bucket;
    const result = event.data.result;
    
    // Update interest weight
    const currentWeight = updated.interestWeights[bucket] || ML_CONFIG.DEFAULT_INTEREST_WEIGHT;
    const impact = ML_CONFIG.FEEDBACK_IMPACT[result] || 0;
    
    updated.interestWeights[bucket] = Math.max(
      ML_CONFIG.MIN_WEIGHT,
      Math.min(ML_CONFIG.MAX_WEIGHT, currentWeight + impact)
    );
    
    // Update feedback history
    if (event.data.itemId) {
      if (result === 'like') {
        updated.feedbackHistory.liked.push(event.data.itemId);
      } else if (result === 'dislike') {
        updated.feedbackHistory.disliked.push(event.data.itemId);
      }
    }
  }
  
  // Update interaction count and confidence
  updated.totalInteractions += 1;
  updated.confidenceScore = Math.min(
    1.0,
    updated.totalInteractions * ML_CONFIG.CONFIDENCE_GROWTH_RATE / ML_CONFIG.MIN_INTERACTIONS_FOR_CONFIDENCE
  );
  
  // Adjust exploration bias based on confidence
  updated.explorationBias = Math.max(
    ML_CONFIG.MIN_EXPLORATION,
    updated.explorationBias * ML_CONFIG.EXPLORATION_DECAY
  );
  
  updated.lastModelUpdate = new Date();
  
  return updated;
}

// Context for Claude AI integration
export interface AIContext {
  coreProfile: CorePersonalityProfile;
  mlProfile: UserMLProfile;
  sessionContext: {
    timeOfDay: string;
    weatherConditions: string;
    location: { lat: number; lng: number };
    searchHistory: string[];
  };
}

export function buildClaudeContext(
  coreProfile: CorePersonalityProfile,
  mlProfile: UserMLProfile,
  sessionContext: any
): string {
  const topInterests = Object.entries(mlProfile.interestWeights)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 3)
    .map(([interest, weight]) => `${interest} (${(weight * 100).toFixed(0)}%)`);
  
  return `User Profile Context:
CORE PERSONALITY:
- Primary interests: ${coreProfile.interests.join(', ')}
- Energy level: ${coreProfile.energyLevel}
- Environment preference: ${coreProfile.indoorOutdoor}
- Social style: ${coreProfile.socialStyle}
- Openness to new experiences: ${coreProfile.opennessScore}/5

LEARNED PREFERENCES (ML):
- Top interests by engagement: ${topInterests.join(', ')}
- Exploration bias: ${(mlProfile.explorationBias * 100).toFixed(0)}%
- Profile confidence: ${(mlProfile.confidenceScore * 100).toFixed(0)}%
- Total interactions: ${mlProfile.totalInteractions}

RECOMMENDATION STRATEGY:
- Focus primarily on: ${topInterests.slice(0, 2).map(i => i.split(' ')[0]).join(' and ')}
- Exploration rate: ${(mlProfile.explorationBias * 100).toFixed(0)}% new suggestions
- Energy matching: Prefer ${coreProfile.energyLevel} energy activities
- Environment: Lean towards ${coreProfile.indoorOutdoor === 'either' ? 'varied' : coreProfile.indoorOutdoor} settings`;
}
