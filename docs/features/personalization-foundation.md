# Personalization Foundation: Onboarding + Feedback Learning Loop

## Overview

The personalization system learns from each user through interest collection at signup and feedback-based ranking adjustments. It's privacy-respecting, starts simple with heuristic rules, and has room to evolve into more sophisticated ML approaches.

## Architecture

### Data Models

#### UserProfile
```typescript
interface UserProfile {
  id: string;
  homeCity?: string;
  homeLat?: number;
  homeLng?: number;
  interests: string[]; // Interest IDs from taxonomy
  riskTolerance?: 'chill' | 'medium' | 'high';
  travelWillingnessKm?: number;
  
  // Learned preferences (updated by feedback)
  bucketWeights?: Record<string, number>;
  keywordAffinities?: Record<string, number>;
  
  // Privacy settings
  dataProcessingConsent: boolean;
  feedbackOptIn: boolean;
}
```

#### UserInteraction
```typescript
interface UserInteraction {
  userId: string;
  itemId: string; // Place ID
  itemName: string;
  bucket: string; // Activity bucket
  timestamp: Date;
  outcome: 'view' | 'open_maps' | 'like' | 'dislike';
  tags?: string[]; // Reason tags for feedback
  
  // Context at time of interaction
  searchVibe?: string;
  userLocation?: { lat: number; lng: number };
  weatherConditions?: string;
  timeOfDay?: 'morning' | 'afternoon' | 'evening' | 'night';
}
```

### Interest Taxonomy

#### Categories & Interests
```typescript
const INTEREST_TAXONOMY = {
  outdoor: {
    label: 'Outdoor & Adventure',
    interests: [
      { id: 'trails', label: 'Hiking & Trails', keywords: ['hiking', 'trail', 'nature walk'] },
      { id: 'climbing', label: 'Rock Climbing', keywords: ['climbing', 'bouldering'] },
      { id: 'ski', label: 'Skiing & Winter Sports', keywords: ['ski', 'snowboard'] },
      { id: 'water', label: 'Water Activities', keywords: ['swimming', 'kayak', 'rafting'] },
      { id: 'cycling', label: 'Cycling & Biking', keywords: ['bike', 'cycling'] },
      { id: 'adrenaline', label: 'Extreme Sports', keywords: ['adrenaline', 'extreme'] }
    ]
  },
  culture: {
    label: 'Culture & Learning',
    interests: [
      { id: 'history', label: 'History & Heritage', keywords: ['history', 'heritage'] },
      { id: 'art', label: 'Art & Museums', keywords: ['art', 'museum', 'gallery'] },
      { id: 'architecture', label: 'Architecture', keywords: ['architecture', 'castle'] },
      { id: 'photography', label: 'Photography', keywords: ['photography', 'scenic'] },
      { id: 'local_culture', label: 'Local Culture', keywords: ['local', 'traditional'] }
    ]
  },
  // ... wellness, social categories
};
```

## Personalized Scoring Algorithm

### Weighted Scoring Function
```typescript
score = 1.5 * weatherSuitability +
        1.2 * rating * ln(1 + reviews) +
        0.8 * interestMatch +
        0.6 * noveltyScore -
        0.5 * distancePenalty -
        0.4 * durationPenalty +
        feedbackBoost(itemId, bucket, similarTags)
```

### Component Calculations

#### Weather Suitability (0-1)
```typescript
// Rain benefits indoor activities
if (weatherConditions.includes('rain')) {
  if (placeTypes.includes('museum')) return 0.9;
  if (placeTypes.includes('park')) return 0.3;
}

// Clear weather benefits outdoor activities
if (weatherConditions.includes('clear')) {
  if (placeTypes.includes('park')) return 0.9;
}
```

#### Interest Match (0-1)
```typescript
// Direct interest match
if (userInterests.includes(placeBucket)) {
  score += 0.3; // EXACT_MATCH_BONUS
}

// Keyword overlap
const userKeywords = getInterestKeywords(userInterests);
const overlap = placeKeywords.filter(keyword => 
  userKeywords.some(userKeyword => 
    keyword.toLowerCase().includes(userKeyword.toLowerCase())
  )
);
score += overlap.length * 0.1; // PARTIAL_MATCH_BONUS
```

#### Novelty Score (0-1)
```typescript
// Check if user has seen this place recently
const daysSince = (Date.now() - lastInteraction.timestamp) / (1000 * 60 * 60 * 24);

if (daysSince < 30) { // NOVELTY_DECAY_DAYS
  const noveltyFactor = daysSince / 30;
  return Math.max(0.2, noveltyFactor);
}
return 1.0; // Full novelty after decay period
```

#### Feedback Boost
```typescript
// Bucket-based learning
boost += weights.bucketBoosts[placeBucket] || 0;

// Keyword-based learning  
for (const keyword of placeKeywords) {
  boost += weights.keywordBoosts[keyword] || 0;
}
```

## Learning Algorithm

### Feedback Impact
```typescript
const LEARNING_CONFIG = {
  LIKE_BOOST: 0.1,        // Increase weight by 10% for liked items
  DISLIKE_PENALTY: -0.05, // Decrease weight by 5% for disliked items
  MIN_INTERACTIONS: 5,    // Minimum interactions before learning
  UPDATE_THRESHOLD: 10,   // Update weights after every 10 interactions
  MAX_WEIGHT_CHANGE: 0.5  // Maximum weight change per update
};
```

### Weight Updates
```typescript
// Update bucket weights
const boost = isPositive ? LIKE_BOOST : DISLIKE_PENALTY;
newWeights.bucketBoosts[bucket] = Math.max(
  -MAX_WEIGHT_CHANGE,
  Math.min(MAX_WEIGHT_CHANGE, currentWeight + boost)
);

// Update keyword weights based on feedback tags
for (const tag of interaction.tags) {
  newWeights.keywordBoosts[tag] = clamp(currentWeight + boost);
}
```

## API Endpoints

### Onboarding
```http
POST /api/personalization/onboarding
{
  "userId": "user_123",
  "interests": ["trails", "history", "photography"],
  "travelWillingness": 50,
  "riskTolerance": "medium",
  "dataConsent": true,
  "feedbackOptIn": true,
  "homeCity": "Bucharest"
}
```

### Feedback Recording
```http
POST /api/personalization/feedback
{
  "userId": "user_123",
  "itemId": "ChIJN1t_tDeuEmsRUsoyG83frY4",
  "itemName": "Romanian Athenaeum",
  "bucket": "culture",
  "outcome": "like",
  "tags": ["perfect_match", "interesting"],
  "searchVibe": "cultural experiences",
  "weatherConditions": "clear",
  "timeOfDay": "afternoon"
}
```

### Personalized Search
```http
POST /api/nearby/search
{
  "vibe": "cultural experiences",
  "location": {"lat": 44.4268, "lng": 26.1025},
  "filters": {"radiusMeters": 10000, "durationHours": 2},
  "userId": "user_123",
  "timeOfDay": "afternoon",
  "weatherConditions": "clear"
}
```

## Feedback System

### Feedback Tags
```typescript
const FEEDBACK_TAGS = {
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
    { id: 'wrong_time', label: 'Wrong time/duration', emoji: '⏱️' }
  ]
};
```

### UI Integration
```jsx
// Feedback buttons on each recommendation card
<View style={styles.feedbackSection}>
  <TouchableOpacity onPress={() => recordFeedback('like')}>
    <Text>👍</Text>
  </TouchableOpacity>
  <TouchableOpacity onPress={() => recordFeedback('dislike')}>
    <Text>👎</Text>
  </TouchableOpacity>
</View>

// Reason picker modal
{showReasonPicker && (
  <Modal>
    <Text>Why did you {outcome} this suggestion?</Text>
    {FEEDBACK_TAGS[outcome].map(tag => (
      <TouchableOpacity key={tag.id} onPress={() => selectTag(tag.id)}>
        <Text>{tag.emoji} {tag.label}</Text>
      </TouchableOpacity>
    ))}
  </Modal>
)}
```

## Privacy & Data Protection

### Privacy-First Design
- **Explicit Consent**: Users must opt-in to data processing and feedback collection
- **Data Minimization**: Only collect necessary data for personalization
- **Local Processing**: Scoring happens server-side but no personal data leaves system
- **Right to Deletion**: Complete user data deletion via API endpoint

### GDPR Compliance
```typescript
// Data deletion endpoint
DELETE /api/personalization/profile/:userId
// Removes all user data: profile, interactions, weights

// Data export (can be added)
GET /api/personalization/export/:userId
// Returns all user data in portable format
```

### Data Retention
- **User Profiles**: Retained until user deletion request
- **Interactions**: 1-year retention for learning, then anonymized
- **Weights**: Updated continuously, no historical versions stored
- **Consent Records**: Retained for legal compliance (3 years)

## Learning Evolution Path

### Phase 1: Heuristic Rules (Current)
- Simple weighted scoring with feedback adjustments
- Rule-based interest matching
- Basic novelty decay
- Manual weight updates

### Phase 2: Statistical Learning
- Collaborative filtering for similar users
- Bayesian updating of preferences
- Seasonal and temporal pattern recognition
- A/B testing for algorithm improvements

### Phase 3: Machine Learning
- Neural networks for complex preference modeling
- Real-time learning from implicit feedback
- Multi-armed bandit for exploration/exploitation
- Federated learning for privacy preservation

## Testing & Validation

### Personalization Metrics
- **Engagement**: Click-through rates on personalized vs. non-personalized results
- **Satisfaction**: Like/dislike ratios over time
- **Diversity**: Variety of buckets and types in recommendations
- **Learning Speed**: How quickly preferences adapt to feedback

### A/B Testing Framework
```typescript
// Test personalized vs. non-personalized results
const testGroup = userId.hashCode() % 100 < 50 ? 'personalized' : 'control';

if (testGroup === 'personalized' && userProfile) {
  results = await getPersonalizedScores(userId, places, context);
} else {
  results = places; // Control group gets non-personalized results
}
```

### Quality Assurance
- **Cold Start**: New users get reasonable recommendations
- **Feedback Loop**: Positive feedback improves future suggestions
- **Bias Prevention**: Avoid filter bubbles through novelty injection
- **Privacy Audit**: Regular checks for data minimization compliance

## Implementation Status

### ✅ Completed
- Interest taxonomy with 20+ categories
- User profile creation and management
- Feedback recording with contextual tags
- Personalized scoring algorithm
- Privacy-compliant data handling
- API endpoints for all operations

### 🔧 In Progress
- Mobile UI for onboarding flow
- Feedback collection interface
- Learning algorithm optimization
- Performance monitoring

### 📋 TODO
- A/B testing framework
- Advanced ML algorithms
- Collaborative filtering
- Real-time learning updates

The personalization foundation provides a privacy-respecting, scalable system for learning user preferences and improving recommendation quality through continuous feedback.
