# Activity Completion Verification System

## Problem Statement
Need to verify users actually completed activities for:
1. Personal activity history/journal
2. Future reward/challenge systems
3. Better recommendations based on actual behavior
4. Social proof (if we add social features)

## Proposed Multi-Level Verification System

### Level 1: Self-Reported (Immediate) ⭐
**When:** Right after user presses "GO NOW"
**How:** Simple confirmation prompt after returning to app

```
User Flow:
1. User presses "GO NOW" → Opens Maps
2. User returns to app (later)
3. App shows: "Did you complete [Activity Name]?"
   - ✅ Yes, I did it!
   - ⏰ I'm doing it now
   - ❌ No, maybe later
```

**Pros:**
- Simple, non-intrusive
- Immediate feedback
- Builds activity history

**Cons:**
- Relies on honesty
- Can be gamed

**Verification Level:** 🟡 Low (50% confidence)

---

### Level 2: Time-Based Verification ⭐⭐
**When:** Track time between "GO NOW" and return
**How:** Compare against expected activity duration

```typescript
interface ActivityCompletion {
  activityId: number;
  expectedDuration: number; // minutes
  goNowTimestamp: Date;
  returnTimestamp: Date;
  actualDuration: number;
  verificationScore: number; // 0-100
}

// Example logic
if (actualDuration >= expectedDuration * 0.7) {
  verificationScore = 80; // Likely completed
} else if (actualDuration >= expectedDuration * 0.3) {
  verificationScore = 50; // Possibly completed
} else {
  verificationScore = 20; // Unlikely completed
}
```

**Pros:**
- Automatic, no user action needed
- Hard to fake (requires actual time investment)
- Works in background

**Cons:**
- User might do activity but not return to app
- Doesn't account for travel time

**Verification Level:** 🟢 Medium (70% confidence)

---

### Level 3: Location-Based Verification ⭐⭐⭐
**When:** Optional, with explicit user permission
**How:** Verify user was at/near venue location

```typescript
interface LocationVerification {
  venueLocation: { lat: number; lng: number };
  userLocation: { lat: number; lng: number };
  distance: number; // meters
  timestamp: Date;
  verified: boolean;
}

// Verification logic
const VERIFICATION_RADIUS = 100; // meters
if (distance <= VERIFICATION_RADIUS) {
  verified = true;
  verificationScore = 95;
}
```

**Implementation:**
- Request location permission ONLY when user presses "GO NOW"
- Check location once after expected duration
- Clear explanation: "We'll check you arrived to award completion badge"

**Pros:**
- High confidence verification
- Enables location-based rewards
- Proves physical presence

**Cons:**
- Privacy concerns
- Requires permission
- Battery usage
- Doesn't work for "anywhere" activities

**Verification Level:** 🟢 High (95% confidence)

---

### Level 4: Photo/Receipt Verification ⭐⭐⭐⭐
**When:** For high-value rewards/challenges
**How:** User uploads proof of completion

```
User Flow:
1. User completes activity
2. App prompts: "Upload a photo to verify completion"
3. User takes photo at venue or uploads receipt
4. Optional: AI verification of photo content
5. Manual review for reward-eligible activities
```

**Use Cases:**
- Challenge completions worth rewards
- Leaderboard activities
- Social sharing ("I did this!")
- Premium features

**Pros:**
- Highest confidence
- Creates shareable content
- Builds community
- Enables social features

**Cons:**
- Requires user effort
- Privacy concerns (photos)
- Needs moderation for rewards

**Verification Level:** 🟢 Very High (98% confidence)

---

## Recommended Implementation Strategy

### Phase 1: MVP (Launch) ✅
**Implement:** Level 1 (Self-Reported) + Level 2 (Time-Based)

```typescript
// Database schema
CREATE TABLE activity_completions (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL,
  activity_id INTEGER NOT NULL,
  go_now_timestamp TIMESTAMP NOT NULL,
  return_timestamp TIMESTAMP,
  self_reported BOOLEAN,
  expected_duration_minutes INTEGER,
  actual_duration_minutes INTEGER,
  verification_score INTEGER, -- 0-100
  verification_level VARCHAR(50), -- 'self_reported', 'time_based', 'location', 'photo'
  created_at TIMESTAMP DEFAULT NOW()
);
```

**UX Flow:**
1. User presses "GO NOW" → Log timestamp
2. User returns to app → Show gentle prompt
3. Calculate time-based score automatically
4. Store in "My Activities" history

---

### Phase 2: Gamification (Month 2) 🎮
**Add:** Level 3 (Location-Based) for challenges

```typescript
// Challenge system
interface Challenge {
  id: number;
  name: string;
  description: string;
  activities: number[]; // Activity IDs
  requiredCompletions: number;
  verificationRequired: 'time_based' | 'location' | 'photo';
  reward: {
    type: 'badge' | 'points' | 'discount';
    value: string;
  };
}
```

**Example Challenges:**
- "Weekend Explorer" - Complete 3 activities this weekend (time-based)
- "Culture Vulture" - Visit 5 museums this month (location-based)
- "Foodie Tour" - Try 10 new restaurants (photo verification)

---

### Phase 3: Social & Rewards (Month 3+) 🏆
**Add:** Level 4 (Photo Verification) + Social features

**Features:**
- Activity feed with photos
- Friend challenges
- Leaderboards
- Partner rewards (discounts, free entries)
- "Proof of Adventure" badges

---

## Technical Implementation

### 1. Activity Completion Service

```typescript
// backend/src/services/activityCompletion.ts

interface CompletionData {
  userId: string;
  activityId: number;
  venueId?: number;
  goNowTimestamp: Date;
  returnTimestamp?: Date;
  selfReported?: boolean;
  userLocation?: { lat: number; lng: number };
  photoUrl?: string;
}

class ActivityCompletionService {
  // Log when user presses GO NOW
  async logGoNow(userId: string, activityId: number, venueId?: number) {
    return db.query(`
      INSERT INTO activity_completions 
      (user_id, activity_id, venue_id, go_now_timestamp, verification_level)
      VALUES ($1, $2, $3, NOW(), 'pending')
      RETURNING id
    `, [userId, activityId, venueId]);
  }

  // Calculate verification score
  async calculateVerificationScore(completionId: number): Promise<number> {
    const completion = await this.getCompletion(completionId);
    let score = 0;

    // Time-based verification (40 points)
    if (completion.actual_duration_minutes >= completion.expected_duration_minutes * 0.7) {
      score += 40;
    } else if (completion.actual_duration_minutes >= completion.expected_duration_minutes * 0.3) {
      score += 20;
    }

    // Self-reported (20 points)
    if (completion.self_reported) {
      score += 20;
    }

    // Location-based (30 points)
    if (completion.location_verified) {
      score += 30;
    }

    // Photo verification (10 points)
    if (completion.photo_url) {
      score += 10;
    }

    return score;
  }

  // Get user's completion history
  async getUserCompletions(userId: string) {
    return db.query(`
      SELECT 
        ac.*,
        a.name as activity_name,
        a.category,
        v.name as venue_name
      FROM activity_completions ac
      JOIN activities a ON ac.activity_id = a.id
      LEFT JOIN venues v ON ac.venue_id = v.id
      WHERE ac.user_id = $1
      AND ac.verification_score >= 50
      ORDER BY ac.created_at DESC
    `, [userId]);
  }
}
```

### 2. Frontend Components

```typescript
// components/ActivityCompletionPrompt.tsx

interface ActivityCompletionPromptProps {
  activity: Activity;
  onComplete: (completed: boolean) => void;
}

export function ActivityCompletionPrompt({ activity, onComplete }: Props) {
  return (
    <Modal visible={true} animationType="slide">
      <View style={styles.container}>
        <Text style={styles.title}>Did you complete this activity?</Text>
        <Text style={styles.activityName}>{activity.name}</Text>
        
        <View style={styles.buttons}>
          <TouchableOpacity 
            style={styles.yesButton}
            onPress={() => onComplete(true)}
          >
            <Text>✅ Yes, I did it!</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.laterButton}
            onPress={() => onComplete(false)}
          >
            <Text>⏰ Maybe later</Text>
          </TouchableOpacity>
        </View>
        
        {/* Optional: Add photo upload for extra verification */}
        <TouchableOpacity style={styles.photoButton}>
          <Text>📸 Add photo for verification</Text>
        </TouchableOpacity>
      </View>
    </Modal>
  );
}
```

### 3. Background Tracking

```typescript
// src/services/completionTracker.ts

class CompletionTracker {
  private pendingCompletions: Map<number, CompletionData> = new Map();

  // Start tracking when user presses GO NOW
  async startTracking(activityId: number, expectedDuration: number) {
    const completionId = await activityCompletionService.logGoNow(
      userId, 
      activityId
    );
    
    this.pendingCompletions.set(completionId, {
      activityId,
      startTime: Date.now(),
      expectedDuration,
    });

    // Schedule check after expected duration
    setTimeout(() => {
      this.checkCompletion(completionId);
    }, expectedDuration * 60 * 1000);
  }

  // Check completion when user returns
  async checkCompletion(completionId: number) {
    const data = this.pendingCompletions.get(completionId);
    if (!data) return;

    const actualDuration = (Date.now() - data.startTime) / 60000; // minutes
    
    // Show prompt to user
    navigation.navigate('CompletionPrompt', {
      activityId: data.activityId,
      completionId,
      actualDuration,
    });
  }
}
```

---

## Privacy & Trust Considerations

### 1. Transparency
- Clear explanation of why we track
- Show user their verification score
- Let them see their data

### 2. Opt-In for Location
```
"To verify you completed this activity and earn rewards, 
we'll check your location once. This helps prevent fraud 
and ensures fair rewards for everyone."

[ ] Allow location verification for this activity
```

### 3. Data Minimization
- Only store: timestamp, duration, verification score
- Don't store continuous GPS tracking
- Delete location data after verification

### 4. User Control
- Let users delete completion history
- Option to complete activities "privately" (no verification)
- Clear data retention policy

---

## Reward System Design

### Verification Requirements by Reward Value

| Reward Value | Required Verification | Example |
|--------------|----------------------|---------|
| Low (Badges, Points) | Time-based (70%) | "Completed 10 activities" |
| Medium (Discounts) | Location-based (90%) | "15% off next booking" |
| High (Free entries, Cash) | Photo + Manual review (98%) | "Free museum entry" |

### Anti-Gaming Measures
1. **Rate limiting:** Max 5 completions per day
2. **Pattern detection:** Flag suspicious timing patterns
3. **Venue verification:** Check if venue is actually open
4. **Duplicate prevention:** Can't complete same activity twice in 24h
5. **Manual review:** Random audits of high-value completions

---

## Database Schema

```sql
-- Activity completions table
CREATE TABLE activity_completions (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL,
  activity_id INTEGER NOT NULL REFERENCES activities(id),
  venue_id INTEGER REFERENCES venues(id),
  
  -- Timestamps
  go_now_timestamp TIMESTAMP NOT NULL,
  return_timestamp TIMESTAMP,
  completed_at TIMESTAMP,
  
  -- Verification data
  expected_duration_minutes INTEGER,
  actual_duration_minutes INTEGER,
  self_reported BOOLEAN DEFAULT FALSE,
  location_verified BOOLEAN DEFAULT FALSE,
  photo_url TEXT,
  
  -- Scoring
  verification_score INTEGER DEFAULT 0, -- 0-100
  verification_level VARCHAR(50), -- 'pending', 'time_based', 'location', 'photo'
  
  -- Metadata
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  -- Indexes
  INDEX idx_user_completions (user_id, created_at),
  INDEX idx_activity_completions (activity_id),
  INDEX idx_verification_score (verification_score)
);

-- Challenges table
CREATE TABLE challenges (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  challenge_type VARCHAR(50), -- 'count', 'streak', 'category', 'time_bound'
  required_activities JSONB, -- Array of activity IDs or categories
  required_completions INTEGER,
  verification_threshold INTEGER DEFAULT 70, -- Minimum verification score
  reward_type VARCHAR(50),
  reward_value TEXT,
  active BOOLEAN DEFAULT TRUE,
  start_date TIMESTAMP,
  end_date TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

-- User challenge progress
CREATE TABLE user_challenge_progress (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL,
  challenge_id INTEGER REFERENCES challenges(id),
  completions_count INTEGER DEFAULT 0,
  completed BOOLEAN DEFAULT FALSE,
  reward_claimed BOOLEAN DEFAULT FALSE,
  started_at TIMESTAMP DEFAULT NOW(),
  completed_at TIMESTAMP,
  
  UNIQUE(user_id, challenge_id)
);
```

---

## Metrics to Track

### Engagement Metrics
- % of "GO NOW" clicks that result in completion
- Average time between GO NOW and return
- Completion rate by activity type
- Completion rate by verification level

### Fraud Detection
- Completions with score < 30%
- Users with suspicious patterns
- Same-day duplicate completions
- Completions outside venue hours

### Reward System
- Challenges completed per user
- Rewards claimed vs earned
- Most popular challenge types
- ROI on reward partnerships

---

## Next Steps

### Immediate (Week 1)
1. ✅ Design database schema
2. ✅ Create completion tracking service
3. ✅ Build completion prompt UI
4. ✅ Implement time-based verification

### Short-term (Week 2-4)
1. Add "My Activities" history screen
2. Implement basic challenge system
3. Add location-based verification (opt-in)
4. Create admin dashboard for monitoring

### Long-term (Month 2+)
1. Photo verification system
2. Partner reward integrations
3. Social features (share completions)
4. Advanced fraud detection
5. Gamification (levels, streaks, leaderboards)

---

## Conclusion

**Recommended Approach:**
Start with **Level 1 (Self-Reported) + Level 2 (Time-Based)** for MVP. This provides:
- ✅ Good enough verification (70% confidence)
- ✅ No privacy concerns
- ✅ Simple implementation
- ✅ Foundation for future features

Add **Level 3 (Location)** when launching challenges/rewards.
Add **Level 4 (Photo)** for high-value rewards and social features.

This creates a trust-based system that respects privacy while enabling gamification and rewards.
