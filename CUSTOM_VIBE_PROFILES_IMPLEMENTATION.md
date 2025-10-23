

# Custom Vibe Profiles - Complete Implementation Guide

## Overview

**Custom Vibe Profiles** allow users to create and save personalized filter presets for their common moods and situations. Instead of re-configuring filters every time, users can quickly switch between saved profiles like "Date Night", "Solo Adventure", or "Party Mode".

## ✅ Backend Implementation (COMPLETE)

### Database Table: `vibe_profiles`

**Fields:**
- `id` - Profile ID
- `user_identifier` - deviceId or userId
- `name` - Profile name (e.g., "Date Night")
- `emoji` - Optional emoji (e.g., ❤️)
- `description` - Optional description
- `filters` - JSONB containing all filter preferences
- `times_used` - Usage counter for sorting
- `last_used_at` - Last usage timestamp
- `created_at` - Creation timestamp
- `updated_at` - Update timestamp

###  API Endpoints (All Working)

#### GET `/api/vibe-profiles?deviceId={id}`
Get all profiles for a user, sorted by usage

**Response:**
```json
{
  "profiles": [
    {
      "id": 1,
      "name": "Date Night",
      "emoji": "❤️",
      "description": "Romantic activities for two",
      "filters": {
        "groupSize": "couple",
        "mood": "romantic",
        "categories": ["romantic", "culinary"],
        "energyLevel": "medium"
      },
      "times_used": 15,
      "last_used_at": "2025-10-20T19:00:00Z"
    }
  ]
}
```

#### POST `/api/vibe-profiles`
Create a new profile

**Body:**
```json
{
  "deviceId": "device123",
  "name": "Date Night",
  "emoji": "❤️",
  "description": "Romantic activities",
  "filters": {
    "groupSize": "couple",
    "mood": "romantic",
    "categories": ["romantic", "culinary"],
    "energyLevel": "medium",
    "timeOfDay": "evening"
  }
}
```

#### PUT `/api/vibe-profiles/:id`
Update existing profile

#### DELETE `/api/vibe-profiles/:id?deviceId={id}`
Delete a profile

#### POST `/api/vibe-profiles/:id/use`
Mark profile as used (tracks usage)

#### GET `/api/vibe-profiles/templates`
Get suggested profile templates

**8 Pre-built Templates:**
1. ❤️ **Date Night** - Romantic activities for couples
2. 🧭 **Solo Adventure** - Explore alone
3. 🎉 **Party Mode** - High energy with friends
4. ☕ **Chill Sunday** - Relaxed, low-key
5. 💪 **Fitness Focus** - Active and energizing
6. 🎨 **Cultural Explorer** - Museums, galleries
7. 🍽️ **Foodie Tour** - Culinary adventures
8. ⚡ **Quick Break** - Short, nearby activities

## Profile Structure

### Filter Options

Users can configure these when creating a profile:

```typescript
interface VibeProfileFilters {
  // Energy & Environment
  energyLevel?: 'low' | 'medium' | 'high';
  indoorOutdoor?: 'indoor' | 'outdoor' | 'both';
  
  // Time & Distance
  durationRange?: 'quick' | 'short' | 'medium' | 'long' | 'full-day';
  maxDistanceKm?: number | null;
  timeOfDay?: 'morning' | 'afternoon' | 'evening' | 'night' | 'any';
  
  // Social Context
  groupSize?: 'solo' | 'couple' | 'small-group' | 'large-group';
  whoWith?: 'solo' | 'date' | 'friends' | 'family' | 'colleagues';
  
  // Activity Type
  categories?: string[]; // ['adventure', 'culture', 'culinary', etc.]
  mood?: string; // 'romantic', 'adventurous', 'relaxed', etc.
  specificTags?: string[]; // Specific activity tags
  
  // Budget
  budget?: 'free' | 'budget' | 'moderate' | 'premium';
  
  // Free-form
  vibeText?: string; // Optional text description
}
```

## Frontend Components (To Implement)

### 1. Profile Creation Modal

**Component:** `CreateVibeProfileModal.tsx`

**Features:**
- Modal/sheet that opens from filter dropdown
- Step-by-step wizard or single form
- Fields:
  - Profile name (required, max 50 chars)
  - Emoji picker (optional)
  - Description (optional, short)
  - Filter configuration (reuse existing ActivityFilters component)
  - Additional questions:
    - "Who's joining?" → groupSize
    - "What's your mood?" → mood
    - "What vibe?" → vibeText
    - "Time preference?" → timeOfDay
    - "Budget?" → budget
- Preview of selected filters
- Save/Cancel buttons

**Design:**
```
┌─────────────────────────────────────┐
│ Create Custom Vibe Profile     [X] │
├─────────────────────────────────────┤
│                                     │
│ Profile Name *                      │
│ [___________________________]       │
│                                     │
│ Emoji (optional)                    │
│ [❤️] [🧭] [🎉] [☕] [💪] [⚡]    │
│                                     │
│ Description                         │
│ [___________________________]       │
│                                     │
│ ──── Filter Your Vibe ────          │
│                                     │
│ Energy Level                        │
│ ( ) Low  (•) Medium  ( ) High       │
│                                     │
│ Indoor/Outdoor                      │
│ ( ) Indoor  ( ) Outdoor  (•) Both   │
│                                     │
│ Duration                            │
│ [▼ Medium (2-4h)        ]           │
│                                     │
│ Who's joining?                      │
│ (•) Solo  ( ) Couple  ( ) Friends   │
│                                     │
│ Mood                                │
│ [Romantic ▼]                        │
│                                     │
│ Categories                          │
│ [x] Culture  [x] Culinary  [ ] ...  │
│                                     │
│ Budget                              │
│ ( ) Free  (•) Moderate  ( ) Premium │
│                                     │
│           [Cancel]  [Save Profile]  │
└─────────────────────────────────────┘
```

### 2. Profile Selector Dropdown

**Component:** `VibeProfileSelector.tsx`

**Location:** On ChatHomeScreen, as a dropdown/submenu above filters

**Features:**
- Collapsed by default, expandable
- Shows "Quick Profiles" or "Your Vibes"
- Lists user's saved profiles
- Each profile shows: emoji, name, times used
- Tap to apply → loads filters and navigates to chat
- "+ Create New Profile" button at bottom
- Edit/Delete options (swipe or long-press)

**Design:**
```
┌─────────────────────────────────────┐
│ Your Vibe Profiles          ▼       │
├─────────────────────────────────────┤
│ ❤️  Date Night              (15x)  │
│ 🧭  Solo Adventure          (8x)   │
│ 🎉  Party Mode              (12x)  │
│ ☕  Chill Sunday            (20x)  │
│                                     │
│ [+ Create New Profile]              │
└─────────────────────────────────────┘
```

### 3. Profile Management Page

**Component:** `ProfileManagementScreen.tsx`

**Location:** In User Profile → Vibe Profiles

**Features:**
- List all profiles with edit/delete options
- Reorder profiles (drag & drop)
- View usage statistics
- Tap profile to edit
- "Start from template" option
- Import/export profiles (future)

**Design:**
```
┌─────────────────────────────────────┐
│ ← My Vibe Profiles                  │
├─────────────────────────────────────┤
│                                     │
│ ❤️  Date Night                 [✏️] │
│     Romantic activities for two     │
│     Used 15 times                   │
│                                     │
│ 🧭  Solo Adventure             [✏️] │
│     Explore on your own             │
│     Used 8 times                    │
│                                     │
│ 🎉  Party Mode                 [✏️] │
│     Fun with friends                │
│     Used 12 times                   │
│                                     │
│ [+ Create New Profile]              │
│ [Browse Templates]                  │
└─────────────────────────────────────┘
```

### 4. Template Gallery

**Component:** `ProfileTemplatesScreen.tsx`

**Features:**
- Grid/list of 8 pre-built templates
- Preview template details
- "Use This Template" → creates profile
- Customizable after creation

## Integration Points

### With ChatHomeScreen

**Add dropdown ABOVE filters:**
```tsx
{/* Vibe Profile Selector */}
<VibeProfileSelector
  deviceId={deviceId}
  onProfileSelect={(profile) => {
    // Apply profile filters
    setFilters(profile.filters);
    // Optionally add vibe text to input
    if (profile.filters.vibeText) {
      setInputText(profile.filters.vibeText);
    }
    // Track usage
    markProfileAsUsed(profile.id);
  }}
/>

{/* Existing Filters */}
<ActivityFilters
  onFiltersChange={setFilters}
  userLocation={userLocation}
  onCreateProfile={() => setShowCreateModal(true)}
/>
```

### With ActivityFilters

**Add "Create Profile" button in filter dropdown:**

```tsx
<TouchableOpacity
  style={styles.createProfileButton}
  onPress={() => navigation.navigate('CreateVibeProfile', {
    currentFilters: filters
  })}
>
  <Icon name="bookmark" />
  <Text>Save as Profile</Text>
</TouchableOpacity>
```

### With Chat API

When profile is selected, combine its filters with chat message:

```typescript
// Send message with profile filters
await chatApi.sendMessage({
  conversationId,
  message: inputText,
  filters: selectedProfile.filters, // Use profile filters
  location: userLocation
});
```

## User Workflows

### Create New Profile

1. User opens filters
2. Configures desired settings
3. Taps "Save as Profile" button
4. Names the profile ("Friday Night Out")
5. Picks an emoji 🎉
6. Saves → Profile now available in quick selector

### Use Existing Profile

1. User opens app
2. Sees "Your Vibe Profiles" dropdown
3. Taps "❤️ Date Night"
4. Filters auto-apply
5. Types message: "something romantic"
6. Gets perfect date recommendations

### Edit Profile

1. User goes to User Profile → Vibe Profiles
2. Taps edit icon on "Date Night"
3. Changes filters (budget: moderate → premium)
4. Saves → Profile updated

### Start from Template

1. User taps "Create New Profile"
2. Sees "Start from Template" option
3. Browses templates (Date Night, Solo Adventure, etc.)
4. Picks "Party Mode" 🎉
5. Customizes name/filters
6. Saves as personal profile

## API Usage Examples

### Fetch User Profiles
```typescript
const response = await fetch(
  `${API_URL}/api/vibe-profiles?deviceId=${deviceId}`
);
const { profiles } = await response.json();
```

### Create Profile
```typescript
await fetch(`${API_URL}/api/vibe-profiles`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    deviceId,
    name: 'Date Night',
    emoji: '❤️',
    filters: {
      groupSize: 'couple',
      mood: 'romantic',
      categories: ['romantic', 'culinary'],
      energyLevel: 'medium'
    }
  })
});
```

### Apply Profile
```typescript
// Mark as used
await fetch(`${API_URL}/api/vibe-profiles/${profile.id}/use`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ deviceId })
});

// Apply filters
setFilters(profile.filters);
```

## Benefits

### For Users
- ✅ Save time - no re-configuring filters
- ✅ Quick access to common moods
- ✅ Discover new activity combinations
- ✅ Share profiles with friends (future)
- ✅ Track favorite vibes

### For App
- ✅ Learn user patterns faster
- ✅ Increase engagement
- ✅ Reduce friction in discovery
- ✅ Data on popular profile types
- ✅ Personalization opportunities

## Future Enhancements

- **Social Profiles**: Share profiles with friends
- **Smart Suggestions**: AI-suggested profiles based on history
- **Seasonal Profiles**: Auto-suggest winter/summer profiles
- **Location-based**: Profiles that adapt to current city
- **Time-based**: Auto-switch profiles (morning/evening)
- **Group Profiles**: Shared profiles for friend groups

## Files Structure

### Backend (✅ Complete)
```
backend/
├── src/routes/vibeProfiles.ts          ← API routes
├── database/migrations/
│   └── 013_custom_vibe_profiles.sql    ← Database schema
└── scripts/
    └── run-vibe-profiles-migration.js  ← Migration runner
```

### Frontend (To Implement)
```
components/
├── VibeProfileSelector.tsx        ← Dropdown on homepage
├── CreateVibeProfileModal.tsx     ← Profile creation form
└── ProfileCard.tsx                ← Individual profile display

screens/
├── ProfileManagementScreen.tsx    ← Manage all profiles
└── ProfileTemplatesScreen.tsx     ← Browse templates

services/
└── vibeProfilesApi.ts            ← API client functions
```

## Summary

**✅ Backend: 100% Complete**
- Database table created
- Full CRUD API endpoints
- 8 pre-built templates
- Usage tracking
- Ready for production

**⏳ Frontend: Ready to Implement**
- Clear component structure
- Integration points defined
- UX flows documented
- Design patterns established

**Next Steps:**
1. Create `VibeProfileSelector` component
2. Add to ChatHomeScreen above filters
3. Create `CreateVibeProfileModal` with form
4. Add "Save as Profile" button to filters
5. Test end-to-end workflow

**The feature is designed for maximum user value with minimal friction!** 🎯✨
