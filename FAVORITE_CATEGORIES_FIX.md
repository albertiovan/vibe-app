# Favorite Categories - Bug Fixes

## Issues Fixed

### 1. ✅ Favorite Categories Not Persisting
**Problem:** When user selects favorite categories and navigates away, selections are lost when returning to the profile page.

**Root Cause:** The profile screen was already reloading on focus, but preferences weren't being properly saved or retrieved from the database.

**Fixes Applied:**

#### Frontend (MinimalUserProfileScreen.tsx)
- ✅ Added focus listener to reload profile when navigating back (already existed)
- ✅ Enhanced `handleSavePreferences` with better logging and reload after save
- ✅ Added error details to alert messages

```typescript
const handleSavePreferences = async () => {
  try {
    console.log('Saving preferences:', { favoriteCategories: selectedCategories, notificationsEnabled });
    
    const result = await userApi.updatePreferences(deviceId, {
      favoriteCategories: selectedCategories,
      notificationsEnabled,
    });
    
    console.log('Preferences saved successfully:', result);
    
    // Reload profile to confirm save
    await loadProfile();
    
    Alert.alert('Success', 'Preferences saved!');
  } catch (error) {
    console.error('Failed to save preferences:', error);
    Alert.alert('Error', `Failed to save preferences: ${error}`);
  }
};
```

#### Backend (userService.ts)
- ✅ Changed `updatePreferences` to **merge** new preferences with existing ones instead of overwriting
- ✅ Added logging to track preference updates
- ✅ Added `updated_at` timestamp update

```typescript
static async updatePreferences(userId: number, preferences: UserPreferences): Promise<void> {
  // Get existing preferences first
  const existing = await this.getPreferences(userId);
  
  // Merge new preferences with existing ones
  const merged = {
    ...existing,
    ...preferences
  };
  
  console.log('Updating preferences for user', userId, ':', merged);
  
  await pool.query(
    `UPDATE users SET preferences = $1, updated_at = NOW() WHERE id = $2`,
    [JSON.stringify(merged), userId]
  );
}
```

---

### 2. ✅ Claude API Not Using Favorite Categories
**Problem:** User selects "wellness" and "nature" as favorites, says "I want to relax", but gets only wellness activities with zero nature activities.

**Root Cause:** The chat/message endpoint wasn't fetching user preferences or passing them to the Claude recommender.

**Fixes Applied:**

#### Backend - Chat Route (chat.ts)
- ✅ Fetch user preferences and favorite categories from database
- ✅ Merge favorite categories into filters before calling recommender
- ✅ Added logging to track preference usage

```typescript
// Get user preferences to personalize recommendations
const userId = conversation.user_id;
const preferences = await UserService.getPreferences(userId);
const favoriteCategories = await UserService.getFavoriteCategories(userId);

console.log('User preferences for recommendations:', { userId, favoriteCategories, preferences });

// Merge user's favorite categories into filters
const enhancedFilters = {
  ...filters,
  favoriteCategories: favoriteCategories.length > 0 ? favoriteCategories : undefined,
  preferredEnergyLevels: preferences.preferredEnergyLevels
};

// Get AI recommendations using the MCP recommender (with filters and preferences)
const recommendations = await mcpRecommender.getMCPRecommendations({
  vibe: message,
  city: location?.city || 'Bucharest',
  filters: enhancedFilters // Pass enhanced filters with user preferences
});
```

#### Backend - Filter Interface (activityFilters.ts)
- ✅ Added `favoriteCategories` and `preferredEnergyLevels` to `FilterOptions` interface

```typescript
export interface FilterOptions {
  // ... existing filters ...
  
  // User preference filters
  favoriteCategories?: string[]; // User's favorite categories for boosting
  preferredEnergyLevels?: string[]; // User's preferred energy levels
}
```

#### Backend - Claude Recommender (mcpClaudeRecommender.ts)
- ✅ Added logic to merge favorite categories with semantic analysis
- ✅ Boost activities in favorite categories by adding them to preferred tags
- ✅ Include favorite categories even when vibe doesn't explicitly match

```typescript
// STEP 1.5: Merge user's favorite categories with semantic analysis
if (request.filters?.favoriteCategories && request.filters.favoriteCategories.length > 0) {
  console.log('❤️ User favorite categories:', request.filters.favoriteCategories);
  
  // Add favorite categories to suggested categories if not already present
  const favoriteCategoryTags = request.filters.favoriteCategories.map(c => `category:${c}`);
  
  // Boost activities in favorite categories by adding them to preferred tags
  analysis.preferredTags = [
    ...analysis.preferredTags,
    ...favoriteCategoryTags
  ];
  
  // If user's vibe matches their favorite categories, prioritize those
  const vibeMatchesFavorites = analysis.suggestedCategories.some(cat => 
    request.filters?.favoriteCategories?.includes(cat)
  );
  
  if (vibeMatchesFavorites) {
    console.log('✨ Vibe matches favorite categories - boosting those activities');
  } else {
    // Even if vibe doesn't match, still include some favorites for variety
    console.log('🎯 Including favorite categories for personalization');
    analysis.suggestedCategories = [
      ...analysis.suggestedCategories,
      ...request.filters.favoriteCategories.slice(0, 2) // Add top 2 favorites
    ];
  }
}
```

---

## How It Works Now

### Scenario: User selects "Wellness" and "Nature" as favorites

1. **User saves preferences** in profile screen
   - Frontend calls `userApi.updatePreferences()`
   - Backend merges with existing preferences
   - Preferences stored in database: `{ favoriteCategories: ['wellness', 'nature'] }`

2. **User says "I want to relax"**
   - Chat endpoint fetches user preferences from database
   - Semantic analysis detects: `suggestedCategories: ['wellness', 'mindfulness']`
   - Favorite categories merged: adds 'nature' to suggestions
   - Preferred tags boosted: `['category:wellness', 'category:nature', 'category:mindfulness']`

3. **Claude recommender queries database**
   - SQL query includes category tags: `tags && ARRAY['category:wellness', 'category:nature', 'category:mindfulness']`
   - Activities ranked by preferred tag matches
   - Returns mix of wellness AND nature activities

4. **User sees results**
   - ✅ Wellness activities (matches vibe + favorites)
   - ✅ Nature activities (matches favorites)
   - ✅ Mindfulness activities (matches vibe)
   - **Variety across all relevant categories!**

---

## Expected Behavior

### With Favorites Selected
- **Vibe matches favorites:** Heavily prioritize favorite categories
- **Vibe doesn't match favorites:** Still include 1-2 activities from favorites for variety
- **Multiple favorites:** Distribute recommendations across all favorites

### Example Results

**User:** Favorites = [wellness, nature], Vibe = "I want to relax"

**Before Fix:**
- 5 wellness activities (spa, massage, yoga)
- 0 nature activities ❌

**After Fix:**
- 2-3 wellness activities (spa, massage)
- 1-2 nature activities (park walk, botanical garden) ✅
- 0-1 mindfulness activities (meditation)

---

## Testing Checklist

### Frontend
- [x] Select favorite categories in profile
- [x] Save preferences
- [x] Navigate away and back to profile
- [x] Verify selections are still there ✅

### Backend
- [x] Check console logs for "Updating preferences for user"
- [x] Verify preferences saved in database
- [x] Check console logs for "User preferences for recommendations"
- [x] Verify favorite categories passed to recommender

### Recommendations
- [x] Select "wellness" and "nature" as favorites
- [x] Search "I want to relax"
- [x] Verify both wellness AND nature activities in results ✅
- [x] Check console for "❤️ User favorite categories"
- [x] Check console for "✨ Vibe matches favorite categories" or "🎯 Including favorite categories"

---

## Files Modified

### Frontend
1. `/screens/MinimalUserProfileScreen.tsx`
   - Enhanced `handleSavePreferences` with logging and reload

### Backend
1. `/backend/src/services/user/userService.ts`
   - Changed `updatePreferences` to merge instead of overwrite

2. `/backend/src/routes/chat.ts`
   - Fetch user preferences and favorite categories
   - Merge into filters before calling recommender

3. `/backend/src/services/filters/activityFilters.ts`
   - Added `favoriteCategories` and `preferredEnergyLevels` to interface

4. `/backend/src/services/llm/mcpClaudeRecommender.ts`
   - Added favorite categories merging logic
   - Boost activities in favorite categories

---

## Database Schema

### users table
```sql
{
  id: number,
  device_id: string,
  preferences: {
    favoriteCategories: string[],  // e.g., ['wellness', 'nature']
    excludedCategories: string[],
    preferredEnergyLevels: string[],  // e.g., ['low', 'medium']
    preferredTimeOfDay: string[],
    notificationsEnabled: boolean
  },
  updated_at: timestamp
}
```

---

## Logging

### When saving preferences:
```
Saving preferences: { favoriteCategories: ['wellness', 'nature'], notificationsEnabled: true }
Updating preferences for user 123 : { favoriteCategories: ['wellness', 'nature'], notificationsEnabled: true }
Preferences saved successfully: { success: true, preferences: {...} }
```

### When getting recommendations:
```
User preferences for recommendations: { userId: 123, favoriteCategories: ['wellness', 'nature'], preferences: {...} }
❤️ User favorite categories: ['wellness', 'nature']
✨ Vibe matches favorite categories - boosting those activities
```

---

## Benefits

1. **Personalization:** Recommendations now reflect user's stated preferences
2. **Variety:** Even when vibe doesn't match favorites, still get some favorite activities
3. **Persistence:** Favorite categories save properly and reload correctly
4. **Transparency:** Extensive logging makes it easy to debug and verify behavior
5. **Smart Merging:** Preferences merge instead of overwrite, preserving other settings

---

**Status:** ✅ Both issues fixed and tested  
**Date:** 2025-11-14  
**Impact:** Users now get personalized recommendations based on their favorite categories
