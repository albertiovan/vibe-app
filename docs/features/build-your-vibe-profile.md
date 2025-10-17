# Build Your Vibe Profile: Core Personality + Adaptive ML Learning

## Overview

A Spotify-inspired onboarding system that creates a foundational personality profile and continuously learns from user behavior through machine learning. The system balances personal familiarity with adventurous exploration to provide increasingly personalized recommendations.

## Architecture

### Two-Layer Personality System

#### 1. Core Personality Profile (Static Foundation)
Collected once during animated onboarding, rarely changed manually:

```typescript
interface CorePersonalityProfile {
  userId: string;
  interests: string[]; // 3-7 categories from animated tiles
  energyLevel: 'chill' | 'medium' | 'high';
  indoorOutdoor: 'indoor' | 'outdoor' | 'either';
  socialStyle: 'solo' | 'group' | 'either';
  opennessScore: number; // 1-5 scale for exploration behavior
  onboardingComplete: boolean;
  mlProfileVersion: number; // Track retraining checkpoints
}
```

#### 2. Machine Learning Profile (Dynamic Learning)
Continuously refined through app usage and feedback:

```typescript
interface UserMLProfile {
  userId: string;
  interestWeights: Record<string, number>; // 0-1 per category
  explorationBias: number; // 0-1 controls new vs familiar
  feedbackHistory: {
    liked: string[];
    disliked: string[];
    ignored: string[];
  };
  confidenceScore: number; // 0-1 how confident we are
  totalInteractions: number;
  profileVersion: number;
}
```

## Animated Onboarding Flow

### Step 1: Interest Selection (3-7 required)
**"What sparks your curiosity?"**

8 animated tiles with gradients and emojis:
- 🎢 **Adventure & Thrills** - Adrenaline, extreme sports, exciting challenges
- 🌲 **Nature & Outdoors** - Hiking, parks, natural beauty, fresh air  
- 🎨 **Culture & Arts** - Museums, galleries, history, local traditions
- 🧘 **Wellness & Relaxation** - Spa, meditation, peaceful moments
- 🍽️ **Food & Culinary** - Restaurants, local cuisine, cooking experiences
- 🌃 **Nightlife & Social** - Bars, clubs, social events, entertainment
- 🛍️ **Shopping & Markets** - Markets, boutiques, local crafts
- 📸 **Photography & Views** - Scenic spots, Instagram-worthy locations

### Step 2: Energy Level
**"What's your energy style?"**
- 😌 **Chill & Relaxed** - Low-key, peaceful, easy-going activities
- ⚖️ **Balanced Mix** - Variety of calm and active experiences  
- 🚀 **High Energy** - Active, intense, challenging adventures

### Step 3: Environment Preference
**"Where do you feel most alive?"**
- 🏛️ **Indoor Spaces** - Museums, galleries, cozy cafes, cultural venues
- 🌤️ **Great Outdoors** - Parks, trails, open spaces, nature activities
- 🌈 **Both Appeal** - Enjoy variety of indoor and outdoor experiences

### Step 4: Social Style
**"How do you like to explore?"**
- 🚶 **Solo Adventures** - Personal time, self-reflection, independent exploration
- 👥 **Group Experiences** - Social activities, shared moments, group adventures
- 🤝 **Flexible** - Enjoy both solo and group activities

### Step 5: Openness Score (1-5 slider)
**"How adventurous are you?"**
- 1: 🏠 **Comfort Zone** - Prefer familiar experiences
- 2: 🚶 **Cautious Explorer** - Small steps outside comfort zone
- 3: 🧭 **Balanced** - Mix of familiar and new
- 4: 🎒 **Adventure Seeker** - Love trying new things
- 5: 🚀 **Fearless Explorer** - Always seeking the unknown

## Machine Learning Engine

### Learning Algorithm
```typescript
const ML_CONFIG = {
  LEARNING_RATE: 0.05,
  FEEDBACK_IMPACT: {
    like: 0.1,        // +10% weight increase
    dislike: -0.05,   // -5% weight decrease  
    ignore: -0.01     // -1% for viewed but ignored
  },
  EXPLORATION_DECAY: 0.95, // Gradually reduce exploration
  MIN_EXPLORATION: 0.1,
  MAX_EXPLORATION: 0.8
};
```

### Weight Updates
```typescript
// Feedback learning
if (event.result === 'like') {
  weights[bucket] += 0.1; // Boost liked categories
} else if (event.result === 'dislike') {
  weights[bucket] -= 0.05; // Penalize disliked categories
}

// Exploration adjustment
explorationBias *= 0.95; // Gradually prefer familiar as confidence grows
```

### Retraining Triggers
- **Interaction Threshold**: Every 50 interactions
- **Time Threshold**: Weekly retraining
- **Confidence Building**: 20+ interactions for reliable patterns

## Event Tracking System

### Tracked Events
```typescript
// User behavior events for ML learning
trackEvent('activity_view', { itemId, bucket, region });
trackEvent('feedback', { itemId, result: 'like', bucket });
trackEvent('challenge_accept', { itemId, challengeType });
trackEvent('map_open', { itemId, bucket });
trackEvent('search', { vibe, results });
trackEvent('dismiss', { itemId, reason });
```

### Contextual Data
- **Location**: User's current position
- **Weather**: Current conditions affecting preferences
- **Time**: Morning, afternoon, evening, night patterns
- **Session**: App usage patterns and duration

## AI Integration with Claude

### Dynamic Context Injection
```typescript
const aiContext = `User Profile Context:
CORE PERSONALITY:
- Primary interests: adventure, nature, culture
- Energy level: high
- Environment preference: outdoor
- Social style: group
- Openness to new experiences: 4/5

LEARNED PREFERENCES (ML):
- Top interests by engagement: nature (90%), adventure (80%), culture (80%)
- Exploration bias: 60%
- Profile confidence: 85%
- Total interactions: 47

RECOMMENDATION STRATEGY:
- Focus primarily on: nature and adventure
- Exploration rate: 60% new suggestions
- Energy matching: Prefer high energy activities
- Environment: Lean towards outdoor settings`;
```

### Adaptive Recommendations
Claude receives updated ML weights each session:
- **Exploitation**: Recommend based on proven preferences (high weights)
- **Exploration**: Introduce new categories based on openness score
- **Balance**: Adjust mix based on confidence and exploration bias

## API Endpoints

### Onboarding
```http
POST /api/vibe-profile/onboarding
{
  "userId": "user_123",
  "interests": ["adventure", "nature", "culture"],
  "energyLevel": "high",
  "indoorOutdoor": "outdoor", 
  "socialStyle": "group",
  "opennessScore": 4
}

Response:
{
  "success": true,
  "data": {
    "profile": { /* core profile */ },
    "mlProfile": {
      "interestWeights": { "adventure": 0.8, "nature": 0.8, "culture": 0.8 },
      "explorationBias": 0.68,
      "confidenceScore": 0.1
    }
  }
}
```

### Event Tracking
```http
POST /api/vibe-profile/track-event
{
  "userId": "user_123",
  "eventType": "feedback",
  "data": {
    "itemId": "place_123",
    "itemName": "Herastrau Park",
    "bucket": "nature",
    "result": "like"
  }
}
```

### ML Weights
```http
GET /api/vibe-profile/user_123/weights

Response:
{
  "success": true,
  "data": {
    "weights": { "nature": 0.9, "adventure": 0.8, "culture": 0.8 },
    "topInterests": [
      { "interest": "nature", "weight": 0.9 },
      { "interest": "adventure", "weight": 0.8 },
      { "interest": "culture", "weight": 0.8 }
    ]
  }
}
```

### AI Context
```http
GET /api/vibe-profile/user_123/ai-context?timeOfDay=afternoon&weatherConditions=clear

Response:
{
  "success": true,
  "data": {
    "aiContext": "User Profile Context: ...",
    "sessionContext": { /* current context */ }
  }
}
```

## Learning Examples

### Example User Journey
1. **Onboarding**: User selects [adventure, nature, culture], high energy, outdoor preference
2. **Initial Weights**: All selected interests start at 0.8, others at 0.2
3. **Feedback Learning**:
   - Likes nature activity → nature: 0.8 → 0.9
   - Dislikes culture activity → culture: 0.8 → 0.75
   - Ignores shopping → shopping: 0.2 → 0.19
4. **Adaptation**: System learns user prefers nature > adventure > culture
5. **Recommendations**: Future suggestions weighted toward nature activities

### Exploration vs Exploitation
```typescript
// High openness (4-5): More exploration
explorationBias = 0.6-0.8; // 60-80% new suggestions

// Low openness (1-2): More exploitation  
explorationBias = 0.2-0.4; // 20-40% new suggestions

// Confidence growth: Exploration decreases over time
explorationBias *= 0.95; // 5% reduction per interaction
```

## Privacy & Data Protection

### GDPR Compliance
- **Explicit Consent**: Required during onboarding
- **Data Minimization**: Only collect necessary behavioral data
- **Right to Export**: Complete profile and event data
- **Right to Deletion**: Remove all user data
- **Transparency**: Clear explanation of data usage

### Data Retention
- **Core Profile**: Until user deletion
- **ML Profile**: Continuously updated, versioned
- **Events**: 1-year retention for learning
- **Analytics**: Aggregated, anonymized insights

## Performance Metrics

### User Engagement
- **Profile Completion Rate**: % who finish onboarding
- **Interaction Growth**: Events per user over time
- **Satisfaction**: Like/dislike ratios
- **Retention**: Return usage patterns

### ML Effectiveness
- **Learning Speed**: How quickly preferences adapt
- **Prediction Accuracy**: Recommendation success rate
- **Exploration Balance**: New vs familiar content ratio
- **Confidence Growth**: Profile certainty over time

## Implementation Status

### ✅ Completed
- Core personality profile system
- ML learning engine with weight updates
- Event tracking and analytics
- API endpoints for all operations
- GDPR-compliant data management
- Claude AI context integration

### 🔧 In Progress
- Animated onboarding UI components
- Real-time ML weight visualization
- Advanced retraining algorithms

### 📋 TODO
- PostHog/Segment analytics integration
- TensorFlow.js ML model training
- Collaborative filtering for similar users
- A/B testing framework for algorithm optimization

## Testing Results

### ✅ API Functionality
```bash
curl /api/vibe-profile/onboarding-config → Onboarding tiles loaded
curl /api/vibe-profile/onboarding → Profile created successfully
curl /api/vibe-profile/track-event → Event tracked and weights updated
curl /api/vibe-profile/user_123/weights → ML weights: nature (90%), adventure (80%)
```

### ✅ Learning Validation
- **Initial State**: Selected interests at 0.8 weight
- **After Like**: Nature boosted from 0.8 → 0.9 (+10%)
- **Confidence Growth**: From 0.1 → 0.12 after interaction
- **Exploration Decay**: From 0.68 → 0.646 (-5%)

### ✅ AI Integration
- **Context Generation**: Dynamic profile injection into Claude
- **Recommendation Weighting**: ML weights influence suggestion ranking
- **Exploration Control**: Openness score affects new content ratio

The "Build Your Vibe Profile" system provides a sophisticated foundation for personalized recommendations that continuously improves through user interaction while maintaining privacy and transparency.
