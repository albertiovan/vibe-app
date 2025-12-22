# Activity Completion System - FINALIZED SPEC

## Final User Flow (Approved)

### **Trigger: User Returns to App (Not Search)**

**Key Change:** Prompt shows immediately when app opens, NOT when user searches.

---

## Complete User Journey

### **Scenario 1: User Completes Activity**

```
Timeline:

7:00 PM - User searches "romantic dinner"
7:10 PM - User presses "GO NOW" for Trattoria Bella
         → App logs: instanceId=123, timestamp=7:10 PM
         → User leaves app (Maps opens)

9:30 PM - User opens app again
         → Check: 9:30 PM - 7:10 PM = 2h 20m > 1 hour ✅
         → IMMEDIATELY show prompt (before home screen)

┌─────────────────────────────────────────────┐
│                                              │
│  How was your activity?                     │
│                                              │
│  🍝 Romantic Dinner                         │
│  Trattoria Bella                            │
│                                              │
│  ┌──────────────────────────────────────┐  │
│  │ Did you complete this activity?      │  │
│  │                                       │  │
│  │  [✅ Yes, I did it!]                 │  │
│  │  [❌ No, didn't go]                  │  │
│  │  [⏰ Still ongoing]                  │  │
│  └──────────────────────────────────────┘  │
│                                              │
└─────────────────────────────────────────────┘

User taps "✅ Yes, I did it!"

┌─────────────────────────────────────────────┐
│                                              │
│  How would you rate it?                     │
│                                              │
│  🍝 Romantic Dinner                         │
│                                              │
│  ┌──────────────────────────────────────┐  │
│  │                                       │  │
│  │   😐  ────●──────────────────  😍    │  │
│  │  Not great            Amazing         │  │
│  │                                       │  │
│  │        Currently: Very Good           │  │
│  │                                       │  │
│  └──────────────────────────────────────┘  │
│                                              │
│  [Continue]                                 │
│                                              │
└─────────────────────────────────────────────┘

User slides to rating, taps Continue

┌─────────────────────────────────────────────┐
│                                              │
│  Add a photo? (optional)                    │
│                                              │
│  Share your experience with friends         │
│                                              │
│  ┌──────────────────────────────────────┐  │
│  │                                       │  │
│  │       [📸 Take Photo]                │  │
│  │                                       │  │
│  │       [🖼️  Choose Photo]             │  │
│  │                                       │  │
│  └──────────────────────────────────────┘  │
│                                              │
│  [Skip]                    [Continue]       │
│                                              │
└─────────────────────────────────────────────┘

User uploads photo or skips

→ Activity saved to History
→ Photo shared to profile (if uploaded)
→ Prompt dismisses
→ User sees normal home screen
```

---

### **Scenario 2: User Opens App Too Early**

```
Timeline:

7:00 PM - User presses "GO NOW"
7:15 PM - User opens app to check something
         → Check: 7:15 PM - 7:00 PM = 15 minutes < 1 hour ❌
         → NO PROMPT
         → User sees normal home screen immediately
```

---

### **Scenario 3: Activity Still Ongoing**

```
Timeline:

10:00 AM - User presses "GO NOW" for hiking trail
12:00 PM - User opens app (mid-hike)
          → Check: 2 hours > 1 hour ✅
          → Show prompt

User taps "⏰ Still ongoing"

→ Reset timer: lastActionTimestamp = 12:00 PM
→ Prompt dismisses
→ User sees home screen

2:00 PM - User opens app again
         → Check: 2:00 PM - 12:00 PM = 2 hours > 1 hour ✅
         → Show prompt AGAIN

User taps "✅ Yes, I did it!" → Rates → Done
```

---

### **Scenario 4: User Didn't Go**

```
Timeline:

3:00 PM - User presses "GO NOW" for museum
4:30 PM - User opens app (changed mind)
         → Check: 1.5 hours > 1 hour ✅
         → Show prompt

User taps "❌ No, didn't go"

→ Activity marked as 'skipped'
→ NOT added to History
→ Prompt dismisses
→ User sees home screen
→ Never prompted about this activity again
```

---

## Interactive Rating Slider Design

### **Visual Design:**

```
┌─────────────────────────────────────────────┐
│                                              │
│  How would you rate it?                     │
│                                              │
│  🍝 Romantic Dinner                         │
│  Trattoria Bella                            │
│                                              │
│  ┌──────────────────────────────────────┐  │
│  │                                       │  │
│  │   😐  ━━━━━━●━━━━━━━━━━━━━━  😍    │  │
│  │   Not great              Amazing      │  │
│  │                                       │  │
│  │   ┌─────────────────────────────┐   │  │
│  │   │   Rating: Very Good (8/10)  │   │  │
│  │   └─────────────────────────────┘   │  │
│  │                                       │  │
│  └──────────────────────────────────────┘  │
│                                              │
│            [Continue]                       │
│                                              │
└─────────────────────────────────────────────┘
```

### **Slider Behavior:**

**Scale:** 0-10 (continuous)
**Visual Feedback:**
- Slider color changes based on position
- Emoji on left changes based on rating
- Live text feedback below slider

**Color Gradient:**
```
0-3:   Red/Orange    (😞 Not great)
4-6:   Yellow        (😐 It was okay)
7-8:   Light Green   (😊 Good)
9-10:  Bright Green  (😍 Amazing!)
```

**Haptic Feedback:**
- Light haptic when crossing thresholds (3, 6, 9)
- Medium haptic when releasing slider

**Default Position:** 7/10 (optimistic default)

---

## Technical Implementation

### **1. App Launch Flow**

```typescript
// App.tsx or navigation root

function App() {
  const [showCompletionPrompt, setShowCompletionPrompt] = useState(false);
  const [pendingActivity, setPendingActivity] = useState(null);
  const [isCheckingPrompt, setIsCheckingPrompt] = useState(true);
  
  useEffect(() => {
    checkForPendingActivity();
  }, []);
  
  async function checkForPendingActivity() {
    try {
      const userId = await getUserId();
      const activity = await activityTrackingService.getPromptableActivity(userId);
      
      if (activity) {
        setPendingActivity(activity);
        setShowCompletionPrompt(true);
      }
    } catch (error) {
      console.error('Error checking pending activity:', error);
    } finally {
      setIsCheckingPrompt(false);
    }
  }
  
  // Show loading while checking
  if (isCheckingPrompt) {
    return <SplashScreen />;
  }
  
  return (
    <>
      {/* Normal app navigation */}
      <NavigationContainer>
        <Stack.Navigator>
          <Stack.Screen name="Home" component={HomeScreen} />
          {/* ... other screens */}
        </Stack.Navigator>
      </NavigationContainer>
      
      {/* Completion prompt modal (overlays everything) */}
      {showCompletionPrompt && (
        <ActivityCompletionModal
          activity={pendingActivity}
          onComplete={handleComplete}
          onSkip={handleSkip}
          onOngoing={handleOngoing}
        />
      )}
    </>
  );
}
```

---

### **2. Rating Slider Component**

```typescript
// components/RatingSlider.tsx

import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Slider from '@react-native-community/slider';
import * as Haptics from 'expo-haptics';

interface RatingSliderProps {
  onRatingChange: (rating: number) => void;
  initialRating?: number;
}

export function RatingSlider({ 
  onRatingChange, 
  initialRating = 7 
}: RatingSliderProps) {
  const [rating, setRating] = useState(initialRating);
  const [lastThreshold, setLastThreshold] = useState(getThreshold(initialRating));
  
  function getThreshold(value: number): number {
    if (value <= 3) return 0;
    if (value <= 6) return 1;
    if (value <= 9) return 2;
    return 3;
  }
  
  function getRatingLabel(value: number): string {
    if (value <= 3) return 'Not great';
    if (value <= 5) return 'It was okay';
    if (value <= 7) return 'Good';
    if (value <= 9) return 'Very good';
    return 'Amazing!';
  }
  
  function getRatingEmoji(value: number): string {
    if (value <= 3) return '😞';
    if (value <= 5) return '😐';
    if (value <= 7) return '😊';
    if (value <= 9) return '😄';
    return '😍';
  }
  
  function getSliderColor(value: number): string {
    if (value <= 3) return '#FF6B6B'; // Red
    if (value <= 6) return '#FFD93D'; // Yellow
    if (value <= 8) return '#6BCF7F'; // Light green
    return '#4CAF50'; // Bright green
  }
  
  function handleValueChange(value: number) {
    const rounded = Math.round(value);
    setRating(rounded);
    onRatingChange(rounded);
    
    // Haptic feedback on threshold crossing
    const currentThreshold = getThreshold(rounded);
    if (currentThreshold !== lastThreshold) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      setLastThreshold(currentThreshold);
    }
  }
  
  function handleSlidingComplete(value: number) {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  }
  
  return (
    <View style={styles.container}>
      <View style={styles.sliderContainer}>
        {/* Left emoji */}
        <Text style={styles.emojiLeft}>😐</Text>
        
        {/* Slider */}
        <Slider
          style={styles.slider}
          minimumValue={0}
          maximumValue={10}
          step={1}
          value={rating}
          onValueChange={handleValueChange}
          onSlidingComplete={handleSlidingComplete}
          minimumTrackTintColor={getSliderColor(rating)}
          maximumTrackTintColor="rgba(255, 255, 255, 0.2)"
          thumbTintColor={getSliderColor(rating)}
        />
        
        {/* Right emoji */}
        <Text style={styles.emojiRight}>😍</Text>
      </View>
      
      {/* Labels */}
      <View style={styles.labels}>
        <Text style={styles.labelLeft}>Not great</Text>
        <Text style={styles.labelRight}>Amazing</Text>
      </View>
      
      {/* Current rating display */}
      <View style={styles.ratingDisplay}>
        <Text style={styles.ratingEmoji}>{getRatingEmoji(rating)}</Text>
        <Text style={styles.ratingText}>
          {getRatingLabel(rating)} ({rating}/10)
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 20,
    paddingHorizontal: 16,
  },
  sliderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  emojiLeft: {
    fontSize: 24,
  },
  emojiRight: {
    fontSize: 24,
  },
  slider: {
    flex: 1,
    height: 40,
  },
  labels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 40,
    marginTop: 8,
  },
  labelLeft: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.6)',
  },
  labelRight: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.6)',
  },
  ratingDisplay: {
    alignItems: 'center',
    marginTop: 20,
    padding: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
  },
  ratingEmoji: {
    fontSize: 32,
    marginBottom: 8,
  },
  ratingText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
```

---

### **3. Complete Modal Component**

```typescript
// components/ActivityCompletionModal.tsx

import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  Image,
  StyleSheet,
  Animated,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { RatingSlider } from './RatingSlider';
import { GlassButton } from '../ui/components/GlassButton';

type Step = 'confirm' | 'rate' | 'photo';

interface ActivityCompletionModalProps {
  activity: {
    id: number;
    instanceId: number;
    name: string;
    venueName?: string;
    category?: string;
  };
  onComplete: (rating: number, photoUrl?: string) => void;
  onSkip: () => void;
  onOngoing: () => void;
}

export function ActivityCompletionModal({
  activity,
  onComplete,
  onSkip,
  onOngoing,
}: ActivityCompletionModalProps) {
  const [step, setStep] = useState<Step>('confirm');
  const [rating, setRating] = useState(7);
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const fadeAnim = useState(new Animated.Value(0))[0];
  
  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, []);
  
  // Step 1: Confirm completion
  if (step === 'confirm') {
    return (
      <Modal
        visible={true}
        transparent={true}
        animationType="fade"
        onRequestClose={onSkip}
      >
        <View style={styles.overlay}>
          <Animated.View style={[styles.modal, { opacity: fadeAnim }]}>
            <Text style={styles.title}>How was your activity?</Text>
            
            <View style={styles.activityInfo}>
              <Text style={styles.activityName}>{activity.name}</Text>
              {activity.venueName && (
                <Text style={styles.venueName}>{activity.venueName}</Text>
              )}
            </View>
            
            <View style={styles.confirmButtons}>
              <GlassButton
                label="✅ Yes, I did it!"
                kind="primary"
                onPress={() => setStep('rate')}
                style={styles.button}
              />
              
              <GlassButton
                label="❌ No, didn't go"
                kind="secondary"
                onPress={onSkip}
                style={styles.button}
              />
              
              <GlassButton
                label="⏰ Still ongoing"
                kind="secondary"
                onPress={onOngoing}
                style={styles.button}
              />
            </View>
          </Animated.View>
        </View>
      </Modal>
    );
  }
  
  // Step 2: Rate with slider
  if (step === 'rate') {
    return (
      <Modal
        visible={true}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setStep('confirm')}
      >
        <View style={styles.overlay}>
          <View style={styles.modal}>
            <Text style={styles.title}>How would you rate it?</Text>
            
            <View style={styles.activityInfo}>
              <Text style={styles.activityName}>{activity.name}</Text>
              {activity.venueName && (
                <Text style={styles.venueName}>{activity.venueName}</Text>
              )}
            </View>
            
            <RatingSlider
              initialRating={rating}
              onRatingChange={setRating}
            />
            
            <GlassButton
              label="Continue"
              kind="primary"
              onPress={() => setStep('photo')}
              style={styles.continueButton}
            />
          </View>
        </View>
      </Modal>
    );
  }
  
  // Step 3: Optional photo
  if (step === 'photo') {
    return (
      <Modal
        visible={true}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setStep('rate')}
      >
        <View style={styles.overlay}>
          <View style={styles.modal}>
            <Text style={styles.title}>Add a photo?</Text>
            <Text style={styles.subtitle}>Share your experience with friends</Text>
            
            {!photoUri ? (
              <View style={styles.photoOptions}>
                <TouchableOpacity
                  style={styles.photoButton}
                  onPress={async () => {
                    const result = await ImagePicker.launchCameraAsync({
                      allowsEditing: true,
                      aspect: [4, 3],
                      quality: 0.8,
                    });
                    if (!result.canceled) {
                      setPhotoUri(result.assets[0].uri);
                    }
                  }}
                >
                  <Text style={styles.photoButtonText}>📸 Take Photo</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={styles.photoButton}
                  onPress={async () => {
                    const result = await ImagePicker.launchImageLibraryAsync({
                      allowsEditing: true,
                      aspect: [4, 3],
                      quality: 0.8,
                    });
                    if (!result.canceled) {
                      setPhotoUri(result.assets[0].uri);
                    }
                  }}
                >
                  <Text style={styles.photoButtonText}>🖼️  Choose Photo</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.photoPreviewContainer}>
                <Image source={{ uri: photoUri }} style={styles.photoPreview} />
                <TouchableOpacity
                  style={styles.retakeButton}
                  onPress={() => setPhotoUri(null)}
                >
                  <Text style={styles.retakeText}>Retake</Text>
                </TouchableOpacity>
              </View>
            )}
            
            <View style={styles.photoActions}>
              <TouchableOpacity
                style={styles.skipButton}
                onPress={() => onComplete(rating)}
              >
                <Text style={styles.skipText}>Skip</Text>
              </TouchableOpacity>
              
              <GlassButton
                label={photoUri ? "Share to Profile" : "Continue"}
                kind="primary"
                onPress={() => onComplete(rating, photoUri || undefined)}
                style={styles.continueButton}
              />
            </View>
          </View>
        </View>
      </Modal>
    );
  }
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modal: {
    backgroundColor: '#1A1A1A',
    borderRadius: 24,
    padding: 24,
    width: '100%',
    maxWidth: 400,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.6)',
    textAlign: 'center',
    marginBottom: 24,
  },
  activityInfo: {
    alignItems: 'center',
    marginBottom: 24,
    paddingBottom: 24,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  activityName: {
    fontSize: 20,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  venueName: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.6)',
  },
  confirmButtons: {
    gap: 12,
  },
  button: {
    width: '100%',
  },
  continueButton: {
    marginTop: 24,
  },
  photoOptions: {
    gap: 12,
    marginVertical: 20,
  },
  photoButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
  },
  photoButtonText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '500',
  },
  photoPreviewContainer: {
    marginVertical: 20,
  },
  photoPreview: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    marginBottom: 12,
  },
  retakeButton: {
    alignSelf: 'center',
    padding: 8,
  },
  retakeText: {
    color: 'rgba(253, 221, 16, 1)',
    fontSize: 14,
    fontWeight: '500',
  },
  photoActions: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
  },
  skipButton: {
    padding: 12,
  },
  skipText: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 14,
  },
});
```

---

### **4. Backend Service (Updated)**

```typescript
// backend/src/services/activityTracking.ts

class ActivityTrackingService {
  
  // Get activity to prompt about when app opens
  async getPromptableActivity(userId: string): Promise<ActivityInstance | null> {
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    
    const result = await db.query(`
      SELECT 
        ai.*,
        a.name as activity_name,
        a.category,
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
  
  // Log GO NOW action
  async logGoNow(userId: string, activityId: number, venueId?: number) {
    return db.query(`
      INSERT INTO activity_instances 
      (user_id, activity_id, venue_id, action_type, action_timestamp, status)
      VALUES ($1, $2, $3, 'go_now', NOW(), 'pending')
      RETURNING id
    `, [userId, activityId, venueId]);
  }
  
  // User confirms completion with rating and optional photo
  async confirmCompletion(
    instanceId: number,
    rating: number,
    photoUrl?: string
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
      RETURNING *
    `, [instanceId, rating, photoUrl, !!photoUrl]);
  }
  
  // User marks as ongoing (resets timer)
  async markOngoing(instanceId: number) {
    return db.query(`
      UPDATE activity_instances
      SET 
        action_timestamp = NOW(),
        prompted_at = NOW()
      WHERE id = $1
    `, [instanceId]);
  }
  
  // User skips (didn't complete)
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
}
```

---

## Summary of Final Spec

### ✅ **Confirmed Features:**

1. **Trigger:** Prompt shows when user OPENS app (not when searching)
2. **Timer:** 1 hour minimum since GO NOW
3. **Rating:** Interactive slider (0-10) with emoji feedback
4. **Photo:** Optional, after rating
5. **History:** Only confirmed completions shown
6. **Ongoing:** Option to reset timer for long activities

### **User Flow:**
```
1. User presses GO NOW → Silent log
2. [1+ hour passes]
3. User opens app → IMMEDIATE prompt (before home screen)
4. User confirms → Slide to rate → Optional photo → Done
5. Activity saved to History with rating & photo
```

### **Technical Stack:**
- `@react-native-community/slider` for rating
- `expo-image-picker` for photos
- `expo-haptics` for feedback
- Modal overlay (blocks app until dismissed)
- Database tracking per instance

### **Next Steps:**
1. Install dependencies
2. Create database migration
3. Build components
4. Integrate into app launch
5. Test flow

Ready to implement?
