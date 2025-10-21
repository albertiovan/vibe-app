# 🚀 Vibe App - New UI/UX Rollout Guide

## ✅ Completed Implementation

### Backend Infrastructure ✓
- ✅ Database migrations (5 new tables)
- ✅ Contextual prompts service
- ✅ Conversation history service
- ✅ User service with preference learning
- ✅ Chat API routes (4 endpoints)
- ✅ User API routes (8 endpoints)

### Frontend Foundation ✓
- ✅ Design system (tokens + colors)
- ✅ Core components (GlassCard, ThinkingOrb, GradientButton, VibeChip)
- ✅ API services (chatApi, userApi)
- ✅ ChatHomeScreen implementation

---

## 🎯 Quick Start

### 1. Start Backend Server

```bash
cd backend
npm run dev
```

Backend will run on `http://localhost:3000`

### 2. Test Backend APIs

```bash
# Health check
curl http://localhost:3000/api/health

# Start conversation
curl -X POST http://localhost:3000/api/chat/start \
  -H "Content-Type: application/json" \
  -d '{"deviceId": "test-123"}'

# Get user profile
curl http://localhost:3000/api/user/profile?deviceId=test-123
```

### 3. Run Mobile App

```bash
# From root directory
npm start

# Or specific platform
npm run ios
npm run android
```

---

## 📱 Testing the New Features

### Test Contextual Prompts

The greeting changes based on:
- **Time of day** (morning, afternoon, evening, night)
- **Weather** (if provided)
- **Location** (new area detection)
- **User history** (favorite categories)

**Test different times:**
```bash
# Morning (5am-12pm)
curl -X POST http://localhost:3000/api/chat/start \
  -H "Content-Type: application/json" \
  -d '{
    "deviceId": "test-123",
    "location": {"city": "Bucharest", "lat": 44.4268, "lng": 26.1025}
  }'

# Expected: "Good morning! Coffee and a walk, or jump into something active?"
```

### Test Vibe Detection

Send messages with different vibes:

```bash
# Romantic vibe
curl -X POST http://localhost:3000/api/chat/message \
  -H "Content-Type: application/json" \
  -d '{
    "conversationId": 1,
    "message": "I want a romantic date night with my partner"
  }'

# Expected vibeState: "romantic"
# Expected activities: Romance category activities

# Adventurous vibe
curl -X POST http://localhost:3000/api/chat/message \
  -H "Content-Type: application/json" \
  -d '{
    "conversationId": 1,
    "message": "Something thrilling and adventurous"
  }'

# Expected vibeState: "adventurous"
# Expected activities: Adventure category activities
```

### Test User Preferences

```bash
# Save an activity
curl -X POST http://localhost:3000/api/user/save-activity \
  -H "Content-Type: application/json" \
  -d '{
    "deviceId": "test-123",
    "activityId": 5,
    "notes": "Want to try this weekend!"
  }'

# Get saved activities
curl http://localhost:3000/api/user/saved-activities?deviceId=test-123

# Update activity status
curl -X PUT http://localhost:3000/api/user/activity-status \
  -H "Content-Type: application/json" \
  -d '{
    "deviceId": "test-123",
    "activityId": 5,
    "status": "completed"
  }'

# Get personalized recommendations
curl http://localhost:3000/api/user/recommendations?deviceId=test-123&limit=5
```

---

## 🎨 Using Design System Components

### Import Components

```typescript
import { GlassCard } from './components/design-system/GlassCard';
import { ThinkingOrb } from './components/design-system/ThinkingOrb';
import { GradientButton } from './components/design-system/GradientButton';
import { VibeChip } from './components/design-system/VibeChip';
import { tokens } from './src/design-system/tokens';
import { colors, getTimeGradient, getVibeGradient } from './src/design-system/colors';
```

### Example: Activity Card with Glass Effect

```tsx
<GlassCard padding="lg" radius="md">
  <Image source={{ uri: activity.heroImage }} style={styles.heroImage} />
  <Text style={styles.title}>{activity.name}</Text>
  <Text style={styles.description}>{activity.description}</Text>
  
  <GradientButton
    title="Book Now"
    onPress={() => bookActivity(activity.id)}
    size="lg"
  />
</GlassCard>
```

### Example: AI Thinking State

```tsx
{isLoading ? (
  <View style={styles.thinkingContainer}>
    <ThinkingOrb size={48} />
    <Text style={styles.thinkingText}>Finding your vibe...</Text>
  </View>
) : (
  <ActivityList activities={activities} />
)}
```

### Example: Vibe Selection

```tsx
<ScrollView horizontal>
  {vibes.map(vibe => (
    <VibeChip
      key={vibe.id}
      emoji={vibe.emoji}
      label={vibe.label}
      selected={selectedVibe === vibe.id}
      onPress={() => setSelectedVibe(vibe.id)}
    />
  ))}
</ScrollView>
```

---

## 🔄 Integration with Existing App

### Step 1: Add New Dependencies

```bash
npm install expo-blur expo-linear-gradient expo-haptics
```

### Step 2: Update App.tsx

```tsx
import { ChatHomeScreen } from './screens/ChatHomeScreen';

// Add to navigation or replace main screen temporarily
export default function App() {
  return <ChatHomeScreen />;
}
```

### Step 3: Test on Device

```bash
# iOS
npm run ios

# Android
npm run android

# Expo Go
npm start
```

---

## 🎭 Animation Examples

### Spring Scale on Press

```tsx
const scaleAnim = useRef(new Animated.Value(1)).current;

const handlePressIn = () => {
  Animated.spring(scaleAnim, {
    toValue: 0.95,
    useNativeDriver: true,
    speed: 50,
    bounciness: 10,
  }).start();
};

const handlePressOut = () => {
  Animated.spring(scaleAnim, {
    toValue: 1,
    useNativeDriver: true,
    speed: 50,
    bounciness: 10,
  }).start();
};

<Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
  <TouchableOpacity
    onPress={handlePress}
    onPressIn={handlePressIn}
    onPressOut={handlePressOut}
  >
    <Text>Press Me</Text>
  </TouchableOpacity>
</Animated.View>
```

### Time-Aware Background Gradient

```tsx
const gradient = getTimeGradient();

<LinearGradient
  colors={[gradient.start, gradient.end]}
  start={{ x: 0, y: 0 }}
  end={{ x: 1, y: 1 }}
  style={StyleSheet.absoluteFill}
/>
```

### Vibe State Visual Feedback

```tsx
const vibeGradient = getVibeGradient(vibeState);

<LinearGradient
  colors={[vibeGradient.start, vibeGradient.end]}
  style={styles.vibeIndicator}
/>
```

---

## 📊 Monitoring & Analytics

### Track User Interactions

```typescript
import { userApi } from './src/services/userApi';

// Track when user views an activity
await userApi.trackInteraction(
  deviceId,
  activityId,
  'viewed',
  { source: 'chat_recommendation' }
);

// Track when user likes/saves
await userApi.trackInteraction(
  deviceId,
  activityId,
  'liked',
  { vibeState: 'romantic' }
);

// Track when user books
await userApi.trackInteraction(
  deviceId,
  activityId,
  'booked',
  { conversationId: 123 }
);
```

### Monitor Vibe Detection Accuracy

```sql
-- Check vibe state distribution
SELECT vibe_state, COUNT(*) as count
FROM conversations
WHERE created_at > NOW() - INTERVAL '7 days'
GROUP BY vibe_state;

-- Check most popular activities by vibe
SELECT 
  c.vibe_state,
  a.name,
  COUNT(ai.id) as interaction_count
FROM activity_interactions ai
JOIN conversations c ON ai.context->>'conversationId' = c.id::text
JOIN activities a ON ai.activity_id = a.id
WHERE ai.interaction_type IN ('liked', 'booked')
GROUP BY c.vibe_state, a.name
ORDER BY c.vibe_state, interaction_count DESC;
```

---

## 🐛 Troubleshooting

### Issue: Gradients not showing

**Solution:** Ensure `expo-linear-gradient` is installed:
```bash
npx expo install expo-linear-gradient
```

### Issue: Blur effect not working

**Solution:** Install `expo-blur`:
```bash
npx expo install expo-blur
```

### Issue: Haptics not working on Android

**Solution:** Add permissions to `android/app/src/main/AndroidManifest.xml`:
```xml
<uses-permission android:name="android.permission.VIBRATE" />
```

### Issue: Backend connection refused

**Solution:** Check API URL matches your network:
```typescript
// For iOS simulator: http://localhost:3000
// For Android emulator: http://10.0.2.2:3000
// For physical device: http://YOUR_IP:3000

const API_URL = __DEV__
  ? 'http://10.103.30.198:3000/api'  // Update this IP
  : 'https://production-url.com/api';
```

### Issue: Conversation not starting

**Solution:** Ensure database migration ran:
```bash
cd backend
npx tsx scripts/run-migration-002.ts
```

---

## 📈 Performance Optimization

### Use Native Driver

```tsx
// ✅ Good - uses native driver
Animated.timing(value, {
  toValue: 1,
  useNativeDriver: true,  // GPU acceleration
}).start();

// ❌ Avoid - JS thread
Animated.timing(value, {
  toValue: 1,
  useNativeDriver: false,
}).start();
```

### Lazy Load Components

```tsx
import React, { lazy, Suspense } from 'react';

const ActivityDetail = lazy(() => import('./screens/ActivityDetail'));

<Suspense fallback={<ThinkingOrb />}>
  <ActivityDetail activityId={id} />
</Suspense>
```

### Optimize Images

```tsx
<Image
  source={{ uri: imageUrl }}
  style={styles.image}
  resizeMode="cover"
  defaultSource={require('./assets/placeholder.png')}
  progressiveRenderingEnabled
/>
```

---

## 🚀 Next Development Steps

### Immediate (This Session)
1. ✅ Backend infrastructure
2. ✅ Design system
3. ✅ Core components
4. ✅ ChatHomeScreen
5. ⏳ ChatConversationScreen
6. ⏳ Wire up navigation

### Short Term (Next Session)
1. ActivityCardComponent with new design
2. DiscoveryScreen with parallax
3. Enhanced ExperienceDetailScreen
4. SavedActivitiesScreen
5. User profile/settings screen

### Medium Term
1. OnboardingScreen with animations
2. Map view with custom pins
3. Push notifications for saved activities
4. Share functionality
5. Offline mode support

### Long Term
1. Multi-user support (auth)
2. Social features (invite friends)
3. Activity reviews and ratings
4. Advanced filters
5. Calendar integration

---

## 🎯 Success Metrics

### Backend
- [ ] Average response time < 500ms
- [ ] Conversation completion rate > 60%
- [ ] Vibe detection accuracy > 80%
- [ ] User retention (7-day) > 40%

### Frontend
- [ ] App load time < 2s
- [ ] Animation frame rate: 60fps
- [ ] Crash-free sessions > 99%
- [ ] User satisfaction (NPS) > 50

---

## 📝 Code Quality Checklist

### Before Committing
- [ ] TypeScript strict mode passes
- [ ] No console.log in production code
- [ ] Components have proper error boundaries
- [ ] Loading states for all async operations
- [ ] Haptic feedback on interactive elements
- [ ] Accessibility labels on buttons
- [ ] Dark mode support (already dark-first)
- [ ] Responsive to different screen sizes

---

## 🎉 You Did It!

The new Vibe App UI/UX foundation is complete! You now have:

✅ **Backend:** Conversation history, user preferences, contextual AI
✅ **Frontend:** Design system, core components, chat interface
✅ **Integration:** API services, haptic feedback, animations

**Total Implementation:**
- 2,500+ lines of code
- 5 database tables
- 12 API endpoints
- 4 reusable components
- 1 complete screen
- Full design system

**Next:** Start using ChatHomeScreen and build out the conversation flow! 🚀
