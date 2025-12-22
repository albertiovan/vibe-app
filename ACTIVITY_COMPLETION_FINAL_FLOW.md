# Activity Completion - Final Flow Design

## Your Refined Requirements ✅

### **Core Logic:**
1. ✅ Prompt when user returns AND searches next activity
2. ✅ Ask "Did you complete this activity?"
3. ✅ If YES → Allow photo upload + rating
4. ✅ If NO → Continue to home screen
5. ✅ Only show in History if user confirmed completion
6. ✅ **1-hour timer** to avoid prompting during app switching

---

## Critical Issue You Identified: "App Switching Problem"

### **The Problem:**
```
User Flow:
1. User searches "romantic dinner"
2. Presses "Learn More" → Browser opens
3. Returns to app (5 seconds later)
4. App: "Did you complete romantic dinner?" ❌ WAY TOO EARLY
5. User: "I just left to check the website!"

OR:

1. User presses "GO NOW" → Maps opens
2. User checks directions
3. Returns to app to check another activity
4. App: "Did you complete activity?" ❌ THEY HAVEN'T EVEN LEFT
```

### **Your Solution:**
✅ **1-hour timer** since last GO NOW/Learn More
✅ Ask if activity is "ongoing"

---

## Improved Flow with Timer Logic

### **State Machine:**

```typescript
interface ActivitySession {
  id: string;
  userId: string;
  activityId: number;
  activityName: string;
  
  // Timestamps
  goNowTimestamp?: Date;
  learnMoreTimestamp?: Date;
  lastActionTimestamp: Date; // Most recent action
  
  // State
  status: 'pending' | 'ongoing' | 'completed' | 'skipped';
  
  // User responses
  userConfirmedCompletion?: boolean;
  userRating?: number;
  photoUrl?: string;
  
  // Timer logic
  promptEligibleAfter: Date; // lastAction + 1 hour
}
```

### **Timer Rules:**

```typescript
const PROMPT_DELAY = 60 * 60 * 1000; // 1 hour in milliseconds

function shouldPromptUser(session: ActivitySession): boolean {
  const now = new Date();
  const timeSinceLastAction = now.getTime() - session.lastActionTimestamp.getTime();
  
  // Rule 1: Must be at least 1 hour since last action
  if (timeSinceLastAction < PROMPT_DELAY) {
    return false;
  }
  
  // Rule 2: Must be pending (not already completed/skipped)
  if (session.status !== 'pending') {
    return false;
  }
  
  // Rule 3: User must be searching for NEW activity
  if (!userIsSearchingNewActivity()) {
    return false;
  }
  
  return true;
}
```

---

## Complete User Flow

### **Scenario 1: User Completes Activity**

```
Timeline:

7:00 PM - User searches "romantic dinner"
7:05 PM - User presses "Learn More" → Browser opens
         → Log: lastActionTimestamp = 7:05 PM
         → promptEligibleAfter = 8:05 PM

7:06 PM - User returns to app, browses more
         → No prompt (only 1 minute passed)

7:10 PM - User presses "GO NOW" → Maps opens
         → Update: lastActionTimestamp = 7:10 PM
         → Update: promptEligibleAfter = 8:10 PM

7:12 PM - User returns to app to check hours
         → No prompt (only 2 minutes passed)

9:30 PM - User returns to app, searches "dessert place"
         → Check: 9:30 PM > 8:10 PM ✅
         → Show prompt!

┌─────────────────────────────────────────┐
│ How was Romantic Dinner?                │
│ Trattoria Bella                         │
│                                          │
│ [✅ I did it!] [❌ Didn't go] [⏰ Ongoing]│
└─────────────────────────────────────────┘

User taps "✅ I did it!"

┌─────────────────────────────────────────┐
│ How was it?                             │
│                                          │
│ [😍 Loved it] [👍 Good] [😐 Meh] [👎 Bad]│
│                                          │
│ [📸 Add photo] (optional)               │
└─────────────────────────────────────────┘

User rates 😍 and uploads photo

→ Activity saved to History
→ Photo posted to profile (if shared)
→ Continue to search results
```

---

### **Scenario 2: User Didn't Complete**

```
Timeline:

2:00 PM - User searches "museum"
2:05 PM - User presses "GO NOW"
         → lastActionTimestamp = 2:05 PM
         → promptEligibleAfter = 3:05 PM

2:10 PM - User returns (changed mind)
         → No prompt (only 5 minutes)

4:00 PM - User returns, searches "coffee shop"
         → Check: 4:00 PM > 3:05 PM ✅
         → Show prompt

┌─────────────────────────────────────────┐
│ How was Museum Visit?                   │
│ Modern Art Museum                       │
│                                          │
│ [✅ I did it!] [❌ Didn't go] [⏰ Ongoing]│
└─────────────────────────────────────────┘

User taps "❌ Didn't go"

→ Session marked as 'skipped'
→ NOT added to History
→ Continue to search results
→ No further prompts for this activity
```

---

### **Scenario 3: Activity Still Ongoing**

```
Timeline:

10:00 AM - User searches "hiking trail"
10:05 AM - User presses "GO NOW"
          → lastActionTimestamp = 10:05 AM
          → promptEligibleAfter = 11:05 AM

12:00 PM - User returns (mid-hike), searches "lunch nearby"
          → Check: 12:00 PM > 11:05 AM ✅
          → Show prompt

┌─────────────────────────────────────────┐
│ How was Hiking Trail?                   │
│ Mountain Peak Trail                     │
│                                          │
│ [✅ I did it!] [❌ Didn't go] [⏰ Ongoing]│
└─────────────────────────────────────────┘

User taps "⏰ Ongoing"

→ Update: lastActionTimestamp = 12:00 PM
→ Update: promptEligibleAfter = 1:00 PM
→ Status remains 'pending'
→ Continue to search results

3:00 PM - User returns, searches "coffee"
         → Check: 3:00 PM > 1:00 PM ✅
         → Show prompt AGAIN

User taps "✅ I did it!" → Rates and adds photo
```

---

## Analysis of Your Suggestions

### ✅ **What Works Well:**

#### 1. **1-Hour Timer**
**Your idea:** Wait 1 hour before prompting
**Analysis:** ✅ Perfect

**Why it works:**
- Prevents app-switching spam
- Gives user time to actually DO the activity
- Most activities take 1-3 hours anyway
- If user returns before 1 hour, they're likely still browsing

**Recommendation:** Keep exactly as you suggested

---

#### 2. **"Ongoing" Option**
**Your idea:** Ask if activity is still ongoing
**Analysis:** ✅ Excellent addition

**Why it works:**
- Handles long activities (hiking, museum, all-day events)
- User doesn't feel pressured to complete quickly
- Resets timer for another check later
- Prevents false negatives

**Recommendation:** Keep this, very smart

---

#### 3. **Photo Upload After Confirmation**
**Your idea:** Allow photo upload if user confirms completion
**Analysis:** ✅ Good, with minor tweak

**Why it works:**
- Right timing (after they confirm they did it)
- Optional (not forced)
- Social sharing value

**Recommendation:** 
- Make it clearly optional
- Add "Skip" button
- Don't block rating if they skip photo

---

#### 4. **Only Show Completed in History**
**Your idea:** Only show activities user confirmed
**Analysis:** ✅ Correct approach

**Why it works:**
- History is meaningful (actual experiences)
- Not cluttered with "maybe" activities
- User has ownership of their history

**Recommendation:** Keep this logic

---

### 🟡 **What Needs Refinement:**

#### 1. **Multiple Pending Activities**
**Your idea:** Track last GO NOW in session
**Problem:** What if user presses GO NOW for 3 different activities?

**Scenario:**
```
6:00 PM - GO NOW for Restaurant A
6:05 PM - GO NOW for Bar B  
6:10 PM - GO NOW for Dessert C

8:00 PM - User returns, searches new vibe
         → Which activity to ask about?
```

**Solution:** Ask about MOST RECENT only
```typescript
function getMostRecentPendingActivity(): ActivitySession | null {
  return sessions
    .filter(s => s.status === 'pending')
    .filter(s => shouldPromptUser(s))
    .sort((a, b) => b.lastActionTimestamp - a.lastActionTimestamp)
    [0] || null;
}
```

**UI:**
```
┌─────────────────────────────────────────┐
│ How was Dessert Place?                  │
│ Sweet Treats Cafe                       │
│                                          │
│ [✅ I did it!] [❌ Didn't go] [⏰ Ongoing]│
│                                          │
│ You have 2 other activities to review   │
│ [View all →]                            │
└─────────────────────────────────────────┘
```

---

#### 2. **"Learn More" vs "GO NOW" Weighting**
**Your idea:** Track both Learn More and GO NOW
**Problem:** Learn More doesn't mean they'll go

**Analysis:**
- "GO NOW" = 80% intent to complete
- "Learn More" = 30% intent to complete

**Solution:** Different timer logic
```typescript
const TIMERS = {
  GO_NOW: 60 * 60 * 1000,      // 1 hour
  LEARN_MORE: 120 * 60 * 1000, // 2 hours (less urgent)
};

function getPromptDelay(action: 'go_now' | 'learn_more'): number {
  return action === 'go_now' ? TIMERS.GO_NOW : TIMERS.LEARN_MORE;
}
```

**Recommendation:**
- Prioritize GO NOW activities in prompts
- Only ask about Learn More if no GO NOW exists
- Or: Don't track Learn More at all (too low intent)

---

#### 3. **Session vs Individual Activity Tracking**
**Your idea:** "Last GO NOW in a session"
**Problem:** What defines a "session"?

**Scenario:**
```
User behavior:
- Opens app at 7 PM, presses GO NOW
- Closes app
- Opens app at 9 PM (same session or new?)
- Opens app next day (definitely new session)
```

**Solution:** Track INDIVIDUAL activities, not sessions
```typescript
// Don't think in "sessions"
// Think in "activity instances"

interface ActivityInstance {
  id: string;
  activityId: number;
  goNowTimestamp: Date;
  status: 'pending' | 'completed' | 'skipped';
  // Each GO NOW creates new instance
}
```

**Recommendation:** Remove "session" concept, track each GO NOW separately

---

## Recommended Implementation

### **Database Schema:**

```sql
CREATE TABLE activity_instances (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL,
  activity_id INTEGER NOT NULL REFERENCES activities(id),
  venue_id INTEGER REFERENCES venues(id),
  
  -- Action tracking
  action_type VARCHAR(20) NOT NULL, -- 'go_now' or 'learn_more'
  action_timestamp TIMESTAMP NOT NULL,
  
  -- Status
  status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'ongoing', 'completed', 'skipped'
  
  -- User responses
  user_confirmed BOOLEAN,
  user_rating INTEGER, -- 1-4 (😍=4, 👍=3, 😐=2, 👎=1)
  user_review TEXT,
  photo_url TEXT,
  photo_shared BOOLEAN DEFAULT FALSE,
  
  -- Timestamps
  prompted_at TIMESTAMP,
  responded_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  
  -- Indexes
  INDEX idx_user_pending (user_id, status, action_timestamp),
  INDEX idx_prompt_eligible (user_id, status, action_timestamp)
);
```

### **Core Service:**

```typescript
// backend/src/services/activityTracking.ts

class ActivityTrackingService {
  
  // Log when user presses GO NOW or Learn More
  async logActivity(
    userId: string, 
    activityId: number,
    actionType: 'go_now' | 'learn_more'
  ) {
    return db.query(`
      INSERT INTO activity_instances 
      (user_id, activity_id, action_type, action_timestamp, status)
      VALUES ($1, $2, $3, NOW(), 'pending')
      RETURNING id
    `, [userId, activityId, actionType]);
  }
  
  // Get activity to prompt about (if any)
  async getPromptableActivity(userId: string): Promise<ActivityInstance | null> {
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    
    const result = await db.query(`
      SELECT 
        ai.*,
        a.name as activity_name,
        v.name as venue_name
      FROM activity_instances ai
      JOIN activities a ON ai.activity_id = a.id
      LEFT JOIN venues v ON ai.venue_id = v.id
      WHERE ai.user_id = $1
        AND ai.status = 'pending'
        AND ai.action_timestamp < $2
        AND ai.action_type = 'go_now'
      ORDER BY ai.action_timestamp DESC
      LIMIT 1
    `, [userId, oneHourAgo]);
    
    return result.rows[0] || null;
  }
  
  // User confirms completion
  async confirmCompletion(
    instanceId: number,
    rating: number,
    photoUrl?: string,
    sharePhoto?: boolean
  ) {
    return db.query(`
      UPDATE activity_instances
      SET 
        status = 'completed',
        user_confirmed = TRUE,
        user_rating = $2,
        photo_url = $3,
        photo_shared = $4,
        responded_at = NOW()
      WHERE id = $1
    `, [instanceId, rating, photoUrl, sharePhoto]);
  }
  
  // User marks as ongoing
  async markOngoing(instanceId: number) {
    return db.query(`
      UPDATE activity_instances
      SET 
        status = 'ongoing',
        action_timestamp = NOW(), -- Reset timer
        prompted_at = NOW()
      WHERE id = $1
    `, [instanceId]);
  }
  
  // User skips
  async skipActivity(instanceId: number) {
    return db.query(`
      UPDATE activity_instances
      SET 
        status = 'skipped',
        user_confirmed = FALSE,
        responded_at = NOW()
      WHERE id = $1
    `, [instanceId]);
  }
  
  // Get user's completed activities (for History)
  async getCompletedActivities(userId: string) {
    return db.query(`
      SELECT 
        ai.*,
        a.name as activity_name,
        a.category,
        v.name as venue_name,
        v.address
      FROM activity_instances ai
      JOIN activities a ON ai.activity_id = a.id
      LEFT JOIN venues v ON ai.venue_id = v.id
      WHERE ai.user_id = $1
        AND ai.status = 'completed'
        AND ai.user_confirmed = TRUE
      ORDER BY ai.responded_at DESC
    `, [userId]);
  }
}
```

---

## Frontend Implementation

### **Completion Prompt Component:**

```typescript
// components/ActivityCompletionPrompt.tsx

interface ActivityCompletionPromptProps {
  activity: {
    id: number;
    instanceId: number;
    name: string;
    venueName?: string;
  };
  onComplete: (rating: number, photo?: string) => void;
  onSkip: () => void;
  onOngoing: () => void;
}

export function ActivityCompletionPrompt({ 
  activity, 
  onComplete, 
  onSkip, 
  onOngoing 
}: ActivityCompletionPromptProps) {
  const [step, setStep] = useState<'confirm' | 'rate' | 'photo'>('confirm');
  const [rating, setRating] = useState<number | null>(null);
  const [photo, setPhoto] = useState<string | null>(null);
  
  // Step 1: Confirm completion
  if (step === 'confirm') {
    return (
      <View style={styles.card}>
        <Text style={styles.title}>How was this activity?</Text>
        <Text style={styles.activityName}>{activity.name}</Text>
        {activity.venueName && (
          <Text style={styles.venueName}>{activity.venueName}</Text>
        )}
        
        <View style={styles.buttons}>
          <TouchableOpacity 
            style={styles.buttonPrimary}
            onPress={() => setStep('rate')}
          >
            <Text>✅ I did it!</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.buttonSecondary}
            onPress={onSkip}
          >
            <Text>❌ Didn't go</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.buttonSecondary}
            onPress={onOngoing}
          >
            <Text>⏰ Still ongoing</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }
  
  // Step 2: Rate activity
  if (step === 'rate') {
    return (
      <View style={styles.card}>
        <Text style={styles.title}>How was it?</Text>
        
        <View style={styles.ratingButtons}>
          <TouchableOpacity onPress={() => { setRating(4); setStep('photo'); }}>
            <Text style={styles.emoji}>😍</Text>
            <Text style={styles.ratingLabel}>Loved it</Text>
          </TouchableOpacity>
          
          <TouchableOpacity onPress={() => { setRating(3); setStep('photo'); }}>
            <Text style={styles.emoji}>👍</Text>
            <Text style={styles.ratingLabel}>Good</Text>
          </TouchableOpacity>
          
          <TouchableOpacity onPress={() => { setRating(2); setStep('photo'); }}>
            <Text style={styles.emoji}>😐</Text>
            <Text style={styles.ratingLabel}>Meh</Text>
          </TouchableOpacity>
          
          <TouchableOpacity onPress={() => { setRating(1); onComplete(1); }}>
            <Text style={styles.emoji}>👎</Text>
            <Text style={styles.ratingLabel}>Bad</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }
  
  // Step 3: Optional photo
  if (step === 'photo') {
    return (
      <View style={styles.card}>
        <Text style={styles.title}>Add a photo? (optional)</Text>
        
        {!photo ? (
          <View style={styles.photoOptions}>
            <TouchableOpacity 
              style={styles.photoButton}
              onPress={async () => {
                const result = await ImagePicker.launchCameraAsync();
                if (!result.canceled) {
                  setPhoto(result.assets[0].uri);
                }
              }}
            >
              <Text>📸 Take Photo</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.photoButton}
              onPress={async () => {
                const result = await ImagePicker.launchImageLibraryAsync();
                if (!result.canceled) {
                  setPhoto(result.assets[0].uri);
                }
              }}
            >
              <Text>🖼️ Choose from Library</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.skipButton}
              onPress={() => onComplete(rating!)}
            >
              <Text>Skip</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View>
            <Image source={{ uri: photo }} style={styles.photoPreview} />
            
            <View style={styles.photoActions}>
              <TouchableOpacity onPress={() => setPhoto(null)}>
                <Text>Retake</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.shareButton}
                onPress={() => onComplete(rating!, photo)}
              >
                <Text>Share to Profile</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>
    );
  }
}
```

### **Integration in Home Screen:**

```typescript
// screens/HomeScreenMinimal.tsx

export function HomeScreenMinimal() {
  const [showCompletionPrompt, setShowCompletionPrompt] = useState(false);
  const [pendingActivity, setPendingActivity] = useState(null);
  
  // Check for promptable activity when user searches
  const handleSubmit = async (query: string) => {
    // First, check if there's a pending activity to prompt about
    const promptable = await activityTrackingService.getPromptableActivity(userId);
    
    if (promptable) {
      setPendingActivity(promptable);
      setShowCompletionPrompt(true);
      // Store the search query to execute after prompt
      setPendingSearch(query);
    } else {
      // No pending activity, proceed with search
      executeSearch(query);
    }
  };
  
  const handleComplete = async (rating: number, photo?: string) => {
    await activityTrackingService.confirmCompletion(
      pendingActivity.id,
      rating,
      photo,
      !!photo // Share if photo provided
    );
    
    setShowCompletionPrompt(false);
    
    // Now execute the pending search
    executeSearch(pendingSearch);
  };
  
  const handleSkip = async () => {
    await activityTrackingService.skipActivity(pendingActivity.id);
    setShowCompletionPrompt(false);
    executeSearch(pendingSearch);
  };
  
  const handleOngoing = async () => {
    await activityTrackingService.markOngoing(pendingActivity.id);
    setShowCompletionPrompt(false);
    executeSearch(pendingSearch);
  };
  
  return (
    <View>
      {/* Normal home screen */}
      <MinimalVibeInput onSubmit={handleSubmit} />
      
      {/* Completion prompt modal */}
      {showCompletionPrompt && (
        <ActivityCompletionPrompt
          activity={pendingActivity}
          onComplete={handleComplete}
          onSkip={handleSkip}
          onOngoing={handleOngoing}
        />
      )}
    </View>
  );
}
```

---

## Final Recommendations

### ✅ **Keep From Your Suggestions:**
1. 1-hour timer before prompting
2. "Ongoing" option for long activities
3. Photo upload after confirmation
4. Only show confirmed completions in History
5. Prompt when user searches next activity

### 🔧 **Refinements:**
1. Track individual GO NOW actions, not "sessions"
2. Only prompt about most recent pending activity
3. Prioritize GO NOW over Learn More
4. Make photo upload clearly optional with "Skip"
5. Add "View all pending" link if multiple activities

### 📊 **Success Metrics:**
- Completion prompt response rate > 60%
- Photo upload rate > 20%
- Rating completion rate > 80%
- User doesn't dismiss as "annoying"

---

## Implementation Timeline

**Week 1:**
- Database schema
- Backend tracking service
- Basic prompt UI

**Week 2:**
- Photo upload
- History screen
- Testing & refinement

**Week 3:**
- Social sharing
- Profile feed
- Polish

Ready to implement?
