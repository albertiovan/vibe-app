# How to Reset User & See Onboarding

## Quick Reset (Recommended)

### Using Dev Menu 🐛

1. **Open the app** (in development mode)
2. **Look for the floating bug icon** 🐛 in the bottom-right corner
3. **Tap the bug icon** → Dev Menu opens
4. **Tap "Clear All User Data"** → Confirmation dialog
5. **Confirm** → All data cleared
6. **App reloads** → Onboarding screen appears

That's it! You now see the complete account creation flow.

## What Gets Cleared

When you clear user data, the following is deleted:
- ✅ User account (name, email, userId)
- ✅ User preferences (interests, energy level, etc.)
- ✅ Device ID
- ✅ Custom Vibe Profiles
- ✅ Challenge responses
- ✅ All user-specific data

## The Onboarding Flow

After clearing data, you'll see this beautiful 4-step experience:

### Step 1: Welcome 👋
- Enter your name (required)
- Enter email (optional)
- Creates your account

### Step 2: Interests 🎯
- Select 8 interest categories:
  - 🎢 Adventure & Thrills
  - 🎨 Culture & Arts
  - 🍽️ Food & Drinks
  - 🌲 Nature & Outdoors
  - ⚽ Sports & Fitness
  - 🧘 Wellness & Spa
  - 🌃 Nightlife & Social
  - 🖌️ Arts & Crafts
- Choose as many as you like

### Step 3: Your Vibe ⚡
- **Energy Level**: Low / Medium / High
- **Environment**: Indoor / Outdoor / Both

### Step 4: Adventurousness 🌟
- Rate 1-5: "Play it safe" to "Always exploring!"
- Determines challenge difficulty

## After Onboarding

Once complete, you'll see:
- ✅ Personalized greeting
- ✅ Challenge Me suggestions based on your profile
- ✅ Custom Vibe Profiles you can create
- ✅ All features using your userId

## Features That Learn From You

These features now track patterns per user:

### 1. Challenge Me
- Analyzes your past 90 days of activities
- Suggests 3 challenges based on YOUR patterns
- **Local Challenge** - Different from your usual in your city
- **Travel Challenge** - Adventure outside city
- **Extreme Challenge** - Opposite of your comfort zone

### 2. Custom Vibe Profiles
- Save filter presets per user
- Quick profiles like "Date Night", "Party Mode"
- Sorted by how often YOU use them

### 3. Training Mode
- Collect feedback on recommendations
- Build user-specific patterns
- LLM learns what YOU like

### 4. Conversation History
- All chats saved per userId
- Personalized suggestions
- Remembers your preferences

## Testing Different User Personas

Want to test how the app behaves for different types of users?

### Persona 1: Adventure Seeker
- Name: "Alex"
- Interests: Adventure, Sports, Nature
- Energy: High
- Openness: 5/5

**Result:** Gets extreme challenges, outdoor activities, high-energy suggestions

### Persona 2: Culture Lover
- Name: "Sofia"
- Interests: Culture, Learning, Creative
- Energy: Medium
- Openness: 3/5

**Result:** Gets museum suggestions, workshops, moderate challenges

### Persona 3: Chill Vibes
- Name: "Max"
- Interests: Wellness, Culinary, Nature
- Energy: Low
- Openness: 2/5

**Result:** Gets spa recommendations, calm activities, safe challenges

## Development Workflow

### Daily Testing
```
1. Start app
2. Test features as current user
3. Want fresh start?
4. Tap bug icon → Clear data
5. Go through onboarding
6. Test with new persona
```

### Demo Preparation
```
1. Clear data before demo
2. Create impressive persona
3. Show onboarding flow
4. Demonstrate personalization
5. Show Challenge Me learning
```

## Other Dev Menu Features

### Show User Info
- Displays current user details
- Name, userId, interests
- Quick reference

### Show All Storage Keys
- Debug AsyncStorage
- See what's stored
- Verify data structure

## Troubleshooting

### Bug icon not showing?
- Only appears in `__DEV__` mode
- Make sure you're running dev build
- Check bottom-right corner

### Data not clearing?
- Try restarting app after clear
- Check console for errors
- Manually delete app and reinstall

### Onboarding not showing?
- Check AsyncStorage keys
- Look for `@vibe_user_account`
- Delete manually if needed

## Technical Details

### Storage Keys
```typescript
@vibe_user_account - User account data
@vibe_user_preferences - User preferences
@device_id - Device identifier
```

### User ID Format
```typescript
user_1730000000000_abc123
// user_[timestamp]_[random]
```

### API Integration
All features now use userId:
```typescript
/api/challenges/me?userId={userId}
/api/vibe-profiles?userId={userId}
/api/training/feedback (userId in body)
```

## Benefits of This System

### For Development
- ✅ Easy to test different user types
- ✅ Quick reset for demos
- ✅ See full onboarding flow anytime
- ✅ Debug user-specific issues

### For Users
- ✅ Personalized from day one
- ✅ Beautiful first impression
- ✅ Data saved per account
- ✅ Features improve over time

### For Features
- ✅ User-specific learning
- ✅ Pattern recognition
- ✅ Personalized challenges
- ✅ Custom recommendations

## Summary

🎯 **To reset and see onboarding:**
1. Tap bug icon 🐛 (bottom-right)
2. "Clear All User Data"
3. Confirm
4. Enjoy the onboarding flow!

✨ **Every feature now learns from YOUR specific patterns and preferences!**

Ready to create your first test account! 🚀
