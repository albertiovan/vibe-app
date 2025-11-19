# Debug Swipeable Cards Issue

## 🐛 Problem
The activity suggestions screen shows a black screen with no cards visible.

## ✅ Debug Changes Added

### 1. Added Logging to SuggestionsScreenShell
- Logs when activities are fetched from API
- Logs the raw response
- Logs each activity's details
- Logs when state is set

### 2. Added Logging to SwipeableCardStack
- Logs when component renders
- Logs activities count
- Shows first activity name

### 3. Added Empty State Fallback
- Shows debug message if no activities received
- Helps identify if the issue is data loading or rendering

## 🔍 How to Debug

### Step 1: Reload the App
In the iOS Simulator:
- Press **Cmd+R** to reload
- Or shake (**Cmd+Ctrl+Z**) → Tap "Reload"

### Step 2: Navigate to Suggestions
1. Enter a vibe (e.g., "fun outdoor activities")
2. Submit the query
3. Watch the console logs

### Step 3: Check Console Logs

Look for these log messages:

```
📊 RANKED ACTIVITIES:
Total activities: X
Raw response: {...}
#1 (100% match): {...}
...
🎯 Setting activities state: X
✅ Activities state set
🏁 Loading complete. Activities count: X

🎴 SwipeableCardStack render:
  activitiesCount: X
  currentIndex: 0
  firstActivity: "Activity Name"
```

## 🎯 Possible Issues & Solutions

### Issue 1: No Activities Loaded (count = 0)
**Symptoms:** Logs show "Total activities: 0"

**Causes:**
- Backend not running
- API call failing
- No activities match the query

**Solutions:**
```bash
# Check if backend is running
cd backend
npm run dev

# Check backend logs for errors
# Make sure database has activities
```

### Issue 2: Activities Loaded But Not Rendering
**Symptoms:** Logs show activities but screen is black

**Causes:**
- SwipeableCardStack not receiving activities
- Rendering issue with cards
- Z-index or positioning problem

**Solutions:**
- Check if SwipeableCardStack logs show activities
- Check for React errors in console
- Verify card styling isn't hiding cards

### Issue 3: Backend API Error
**Symptoms:** "❌ Failed to load activities" in logs

**Causes:**
- Backend server not running
- Wrong API URL
- Network error

**Solutions:**
```bash
# Start backend
cd backend
npm run dev

# Check API URL in chatApi.ts
# Should be http://localhost:3001 or your backend URL
```

## 🔧 Quick Fixes

### Fix 1: Restart Everything
```bash
# Terminal 1: Restart backend
cd backend
npm run dev

# Terminal 2: Restart Metro
npx expo start --clear

# Simulator: Reload app (Cmd+R)
```

### Fix 2: Check Backend Connection
```bash
# Test backend is running
curl http://localhost:3001/health

# Should return: {"status":"ok"}
```

### Fix 3: Simplify for Testing
Temporarily use mock data to isolate the issue:

In `SuggestionsScreenShell.tsx`, replace the API call with:
```typescript
// Temporary mock data for testing
const swipeableActivities: SwipeableActivity[] = [
  {
    id: 1,
    name: 'Test Activity 1',
    simplifiedName: 'Test 1',
    description: 'This is a test activity',
    category: 'test',
    matchScore: 1.0,
  },
  {
    id: 2,
    name: 'Test Activity 2',
    simplifiedName: 'Test 2',
    description: 'This is another test',
    category: 'test',
    matchScore: 0.85,
  },
];
```

If mock data works, the issue is with the API call.
If mock data doesn't work, the issue is with rendering.

## 📊 Expected Console Output

When working correctly, you should see:

```
📊 RANKED ACTIVITIES:
Total activities: 5
Raw response: {
  "activities": [...]
}
#1 (100% match): {
  name: "Therme București Wellness Day",
  simplified: "Thermal Spa",
  category: "wellness",
  hasImage: true,
  imageUrl: "https://..."
}
...

🎯 Setting activities state: 5
✅ Activities state set
🏁 Loading complete. Activities count: 5

🎴 SwipeableCardStack render: {
  activitiesCount: 5,
  currentIndex: 0,
  firstActivity: "Thermal Spa"
}
```

## 🚀 Next Steps

1. **Reload the app** (Cmd+R in simulator)
2. **Enter a vibe** and submit
3. **Check console logs** in Metro terminal
4. **Share the logs** with me if you see errors

The debug logs will tell us exactly where the problem is!
