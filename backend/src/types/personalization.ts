/**
 * Personalization Data Models
 * User profiles, interests, and feedback for AI learning
 */

// Interest taxonomy for onboarding
export const INTEREST_TAXONOMY = {
  // Outdoor & Adventure
  outdoor: {
    label: 'Outdoor & Adventure',
    interests: [
      { id: 'trails', label: 'Hiking & Trails', keywords: ['hiking', 'trail', 'nature walk', 'trekking'] },
      { id: 'climbing', label: 'Rock Climbing', keywords: ['climbing', 'bouldering', 'via ferrata'] },
      { id: 'ski', label: 'Skiing & Winter Sports', keywords: ['ski', 'snowboard', 'winter sports'] },
      { id: 'water', label: 'Water Activities', keywords: ['swimming', 'kayak', 'rafting', 'water sports'] },
      { id: 'cycling', label: 'Cycling & Biking', keywords: ['bike', 'cycling', 'mountain bike'] },
      { id: 'adrenaline', label: 'Extreme Sports', keywords: ['adrenaline', 'extreme', 'bungee', 'paragliding'] }
    ]
  },
  
  // Culture & Learning
  culture: {
    label: 'Culture & Learning',
    interests: [
      { id: 'history', label: 'History & Heritage', keywords: ['history', 'heritage', 'historical', 'ancient'] },
      { id: 'art', label: 'Art & Museums', keywords: ['art', 'museum', 'gallery', 'exhibition'] },
      { id: 'architecture', label: 'Architecture', keywords: ['architecture', 'building', 'castle', 'church'] },
      { id: 'photography', label: 'Photography', keywords: ['photography', 'photo', 'scenic', 'viewpoint'] },
      { id: 'local_culture', label: 'Local Culture', keywords: ['local', 'traditional', 'authentic', 'cultural'] }
    ]
  },
  
  // Social & Entertainment
  social: {
    label: 'Social & Entertainment',
    interests: [
      { id: 'nightlife', label: 'Nightlife & Bars', keywords: ['nightlife', 'bar', 'club', 'party'] },
      { id: 'music', label: 'Music & Concerts', keywords: ['music', 'concert', 'live music', 'festival'] },
      { id: 'food', label: 'Food & Dining', keywords: ['food', 'restaurant', 'cuisine', 'culinary'] },
      { id: 'shopping', label: 'Shopping', keywords: ['shopping', 'market', 'boutique', 'souvenir'] },
      { id: 'festivals', label: 'Events & Festivals', keywords: ['festival', 'event', 'celebration'] }
    ]
  },
  
  // Wellness & Relaxation
  wellness: {
    label: 'Wellness & Relaxation',
    interests: [
      { id: 'spa', label: 'Spa & Wellness', keywords: ['spa', 'wellness', 'massage', 'thermal'] },
      { id: 'meditation', label: 'Meditation & Mindfulness', keywords: ['meditation', 'mindfulness', 'peaceful', 'zen'] },
      { id: 'nature', label: 'Nature & Parks', keywords: ['nature', 'park', 'garden', 'peaceful'] },
      { id: 'yoga', label: 'Yoga & Fitness', keywords: ['yoga', 'fitness', 'exercise', 'health'] }
    ]
  }
};

// User profile interface
export interface UserProfile {
  id: string;
  homeCity?: string;
  homeLat?: number;
  homeLng?: number;
  interests: string[]; // Array of interest IDs
  riskTolerance?: 'chill' | 'medium' | 'high';
  travelWillingnessKm?: number;
  createdAt: Date;
  updatedAt: Date;
  
  // Learned preferences (updated by feedback)
  bucketWeights?: Record<string, number>; // e.g., { "adventure": 1.2, "culture": 0.8 }
  keywordAffinities?: Record<string, number>; // e.g., { "hiking": 1.5, "museum": 0.7 }
  
  // Privacy settings
  dataProcessingConsent: boolean;
  feedbackOptIn: boolean;
}

// User interaction tracking
export interface UserInteraction {
  id: string;
  userId: string;
  itemId: string; // Place ID or recommendation ID
  itemName: string;
  bucket: string; // Activity bucket (adventure, culture, etc.)
  timestamp: Date;
  outcome: 'view' | 'open_maps' | 'like' | 'dislike';
  tags?: string[]; // Reason tags for feedback
  
  // Context at time of interaction
  searchVibe?: string;
  userLocation?: { lat: number; lng: number };
  weatherConditions?: string;
  timeOfDay?: 'morning' | 'afternoon' | 'evening' | 'night';
}

// Feedback reason tags
export const FEEDBACK_TAGS = {
  positive: [
    { id: 'perfect_match', label: 'Perfect match!', emoji: '🎯' },
    { id: 'great_weather', label: 'Great for weather', emoji: '🌤️' },
    { id: 'good_distance', label: 'Perfect distance', emoji: '📍' },
    { id: 'interesting', label: 'Really interesting', emoji: '✨' },
    { id: 'good_timing', label: 'Good for time available', emoji: '⏰' }
  ],
  negative: [
    { id: 'too_far', label: 'Too far away', emoji: '🚗' },
    { id: 'bad_weather', label: 'Bad for weather', emoji: '🌧️' },
    { id: 'not_my_style', label: 'Not my style', emoji: '🤷' },
    { id: 'too_expensive', label: 'Too expensive', emoji: '💰' },
    { id: 'wrong_time', label: 'Wrong time/duration', emoji: '⏱️' },
    { id: 'boring', label: 'Seems boring', emoji: '😴' }
  ]
};

// Personalized scoring weights
export interface PersonalizationWeights {
  userId: string;
  
  // Base scoring weights (can be tuned per user)
  weatherWeight: number; // Default: 1.5
  ratingWeight: number; // Default: 1.2
  interestWeight: number; // Default: 0.8
  noveltyWeight: number; // Default: 0.6
  distancePenalty: number; // Default: 0.5
  durationPenalty: number; // Default: 0.4
  
  // Learned bucket preferences
  bucketBoosts: Record<string, number>; // Positive/negative boosts per bucket
  
  // Learned keyword preferences  
  keywordBoosts: Record<string, number>; // Positive/negative boosts per keyword
  
  // Context preferences
  weatherPreferences: Record<string, number>; // Preference for different weather conditions
  timePreferences: Record<string, number>; // Preference for different times of day
  
  lastUpdated: Date;
}

// Onboarding data collection
export interface OnboardingData {
  interests: string[];
  homeCity?: string;
  homeLocation?: { lat: number; lng: number };
  travelWillingness: number; // km
  riskTolerance: 'chill' | 'medium' | 'high';
  dataConsent: boolean;
  feedbackOptIn: boolean;
}

// Learning algorithm configuration
export const LEARNING_CONFIG = {
  // Feedback impact on weights
  LIKE_BOOST: 0.1, // Increase weight by 10% for liked items
  DISLIKE_PENALTY: -0.05, // Decrease weight by 5% for disliked items
  
  // Learning rate decay
  MIN_INTERACTIONS: 5, // Minimum interactions before learning kicks in
  MAX_WEIGHT_CHANGE: 0.5, // Maximum weight change per update
  DECAY_FACTOR: 0.95, // Decay old interactions over time
  
  // Update frequency
  UPDATE_THRESHOLD: 10, // Update weights after every 10 interactions
  MAX_DAYS_BETWEEN_UPDATES: 7, // Force update at least weekly
  
  // Interest matching
  EXACT_MATCH_BONUS: 0.3, // Bonus for exact interest match
  PARTIAL_MATCH_BONUS: 0.1, // Bonus for keyword overlap
  
  // Novelty calculation
  NOVELTY_DECAY_DAYS: 30, // How long before something becomes "familiar"
  REPEAT_PENALTY: -0.2 // Penalty for suggesting same place again
};

// Helper functions for interest matching
export function getInterestKeywords(interestIds: string[]): string[] {
  const keywords: string[] = [];
  
  for (const categoryKey of Object.keys(INTEREST_TAXONOMY)) {
    const category = INTEREST_TAXONOMY[categoryKey as keyof typeof INTEREST_TAXONOMY];
    for (const interest of category.interests) {
      if (interestIds.includes(interest.id)) {
        keywords.push(...interest.keywords);
      }
    }
  }
  
  return keywords;
}

export function calculateInterestMatch(
  userInterests: string[],
  placeKeywords: string[],
  placeBucket: string
): number {
  let score = 0;
  
  // Direct interest match
  if (userInterests.includes(placeBucket)) {
    score += LEARNING_CONFIG.EXACT_MATCH_BONUS;
  }
  
  // Keyword overlap
  const userKeywords = getInterestKeywords(userInterests);
  const overlap = placeKeywords.filter(keyword => 
    userKeywords.some(userKeyword => 
      keyword.toLowerCase().includes(userKeyword.toLowerCase()) ||
      userKeyword.toLowerCase().includes(keyword.toLowerCase())
    )
  );
  
  score += overlap.length * LEARNING_CONFIG.PARTIAL_MATCH_BONUS;
  
  return Math.min(1, score); // Cap at 1.0
}

// Default personalization weights for new users
export function getDefaultWeights(userProfile: UserProfile): PersonalizationWeights {
  return {
    userId: userProfile.id,
    weatherWeight: 1.5,
    ratingWeight: 1.2,
    interestWeight: 0.8,
    noveltyWeight: 0.6,
    distancePenalty: 0.5,
    durationPenalty: 0.4,
    bucketBoosts: {},
    keywordBoosts: {},
    weatherPreferences: {},
    timePreferences: {},
    lastUpdated: new Date()
  };
}
