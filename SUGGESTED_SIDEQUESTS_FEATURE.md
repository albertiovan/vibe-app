# Suggested Sidequests Feature

## Overview
Added a scrollable home screen with personalized "Suggested Sidequests" - activity recommendations that align with user preferences while gently pushing them outside their comfort zone.

## Features Implemented

### 1. Scrollable Home Screen
**File:** `/screens/HomeScreenMinimal.tsx`

- **Hero Section:** Main vibe input remains centered and prominent (70% viewport height)
- **Sidequests Section:** Appears below when user scrolls down
- **Smooth Scrolling:** Vertical scroll with `showsVerticalScrollIndicator={false}`
- **Keyboard Handling:** `keyboardShouldPersistTaps="handled"` for better UX

### 2. SuggestedSidequests Component
**File:** `/components/SuggestedSidequests.tsx`

**Design:**
- Horizontal scrolling cards (75% screen width each)
- 3 personalized activity suggestions
- Monochrome aesthetic matching app design
- Snap-to-interval scrolling for smooth UX

**Card Features:**
- Category emoji or image placeholder
- Activity name and description
- Energy level badge (🌙 low, ☀️ medium, ⚡ high)
- Estimated duration
- Category label
- Tap to view full activity details

**Loading States:**
- Shimmer loading: "Finding adventures..."
- Error handling: Section hides if API fails
- Mock data fallback for development

### 3. Backend API - Sidequests
**File:** `/backend/src/routes/sidequests.ts`

**Endpoint:** `GET /api/sidequests?deviceId={deviceId}`

**Personalization Algorithm:**

**Step 1: Analyze User Preferences**
- Query `activity_interactions` table for user history
- Weight interactions: completed (3), saved (2), viewed (1), dismissed (-0.5)
- Calculate favorite categories (top 3)
- Determine primary energy level
- Track recent activities to avoid duplicates

**Step 2: Generate 3 Sidequests**

1. **Sidequest 1: Comfort Zone** (60% alignment)
   - Same category as user's favorite
   - Same energy level as primary
   - Familiar but fresh

2. **Sidequest 2: Gentle Exploration** (30% stretch)
   - Adjacent category (thematically related)
   - Same energy level
   - Example: wellness → mindfulness, nature → adventure

3. **Sidequest 3: Energy Variety** (10% stretch)
   - Any category
   - Different energy level
   - Example: if user prefers low → suggest medium

**Adjacent Categories Map:**
```typescript
wellness → mindfulness, fitness, nature
nature → adventure, water, seasonal
culture → learning, creative, social
adventure → nature, sports, water
culinary → social, culture, romance
// ... and more
```

**Database Queries:**
- Joins `activities` and `venues` tables
- Filters by category, energy level
- Excludes recently viewed activities
- Random selection within constraints

## User Experience Flow

### Initial Load
1. User opens app
2. Hero section loads with main vibe input
3. Sidequests load in background
4. Loading indicator: "Finding adventures..."

### Discovery
1. User scrolls down past main input
2. Sees "Suggested Sidequests" section
3. Subtitle: "Personalized picks to expand your horizons"
4. 3 cards in horizontal scroll

### Interaction
1. User swipes through sidequest cards
2. Taps a card
3. Navigates to `ActivityDetailScreenShell`
4. Can view full details, venues, and "GO NOW"

### Personalization Over Time
- More interactions → Better recommendations
- System learns favorite categories
- Balances comfort with exploration
- Never shows same activity twice in short period

## Design System

### Colors (Monochrome)
- **Background:** `#000000` (black)
- **Card Background:** `rgba(255, 255, 255, 0.05)` (5% white)
- **Borders:** `rgba(255, 255, 255, 0.1)` (10% white)
- **Primary Text:** `#FFFFFF` (white)
- **Secondary Text:** `rgba(255, 255, 255, 0.6)` (60% white)
- **Tertiary Text:** `rgba(255, 255, 255, 0.5)` (50% white)

### Typography
- **Section Title:** 20px, Bold (700)
- **Section Subtitle:** 13px, Regular, 60% white
- **Card Title:** 18px, Semibold (600)
- **Card Description:** 14px, Regular, 70% white
- **Card Category:** 11px, Semibold (600), Uppercase, 60% white
- **Duration:** 12px, Regular, 50% white

### Spacing
- **Section Margin:** 24px vertical
- **Card Width:** 75% of screen width
- **Card Spacing:** 16px between cards
- **Card Padding:** 16px
- **Image Height:** 140px

### Interactions
- **Scroll:** Horizontal snap-to-interval
- **Tap:** Navigate to activity detail
- **Active Opacity:** 0.8

## Difference from Challenge Me

| Feature | Challenge Me | Suggested Sidequests |
|---------|-------------|---------------------|
| **Goal** | Push boundaries | Gentle exploration |
| **Alignment** | 0% (opposite) | 60-70% (personalized) |
| **Energy** | Opposite level | Mostly same, some variety |
| **Category** | Random/opposite | Favorite + adjacent |
| **Frequency** | On-demand (button) | Always visible (scroll) |
| **Intensity** | High discomfort | Low discomfort |
| **User Control** | Explicit opt-in | Passive discovery |

## Technical Details

### API Response Format
```json
{
  "sidequests": [
    {
      "id": 123,
      "name": "Morning Yoga Session",
      "category": "wellness",
      "energyLevel": "low",
      "description": "Start your day with mindful movement",
      "imageUrl": "https://...",
      "estimatedDuration": "1 hour",
      "venues": [
        {
          "name": "Zen Studio",
          "address": "Str. Yoga 1",
          "latitude": 44.4268,
          "longitude": 26.1025
        }
      ]
    }
  ],
  "generated": "2024-01-15T10:30:00.000Z"
}
```

### Database Schema Requirements

**Tables Used:**
- `activities` - Activity catalog
- `venues` - Venue locations
- `activity_interactions` - User interaction history

**Required Columns:**
- `activity_interactions.device_id` - User identifier
- `activity_interactions.interaction_type` - completed, saved, viewed, dismissed
- `activity_interactions.created_at` - Timestamp
- `activities.category` - Activity category
- `activities.energy_level` - low, medium, high

### Performance Considerations

**Caching:**
- Sidequests cached for 1 hour per user
- Reduces database load
- Updates after new interactions

**Query Optimization:**
- Indexed on `device_id`, `created_at`
- Limit to last 50 interactions
- Single query with joins

**Loading:**
- Async loading (doesn't block main UI)
- Graceful degradation if API fails
- Mock data fallback for development

## Future Enhancements

### Phase 2: Advanced Personalization
- Time-of-day recommendations (morning yoga, evening drinks)
- Weather-based suggestions (rainy day activities)
- Social context (solo vs. group activities)
- Budget awareness (free vs. paid activities)

### Phase 3: Social Features
- "Friends also liked" recommendations
- Shared sidequests with friends
- Group sidequest challenges
- Activity completion badges

### Phase 4: Gamification
- "Complete 3 sidequests this week" challenges
- Exploration badges (tried 5 new categories)
- Energy diversity rewards
- Streak tracking

### Phase 5: Smart Timing
- Push notifications for sidequests
- "Perfect time for..." suggestions
- Calendar integration
- Reminder system

## Testing Checklist

### Functional
- [ ] Sidequests load on home screen
- [ ] Horizontal scroll works smoothly
- [ ] Tap card navigates to detail screen
- [ ] Loading state shows correctly
- [ ] Error handling works (no crash)
- [ ] Mock data displays when API fails

### Personalization
- [ ] New users get random sidequests
- [ ] Users with history get personalized picks
- [ ] Favorite categories appear more often
- [ ] Energy variety is present
- [ ] No duplicate activities in short period

### UI/UX
- [ ] Cards match monochrome design
- [ ] Text is readable
- [ ] Images load correctly
- [ ] Snap-to-interval feels smooth
- [ ] Section title and subtitle visible
- [ ] Loading indicator is clear

### Performance
- [ ] Doesn't slow down home screen load
- [ ] Scrolling is smooth (60fps)
- [ ] API calls don't block UI
- [ ] Memory usage is reasonable

## Files Created/Modified

### Created
- `/components/SuggestedSidequests.tsx` - Frontend component
- `/backend/src/routes/sidequests.ts` - Backend API
- `/SUGGESTED_SIDEQUESTS_FEATURE.md` - This documentation

### Modified
- `/screens/HomeScreenMinimal.tsx` - Added scrollable layout and sidequests section

## Dependencies

**No new dependencies required!**
- Uses existing React Native components
- Uses existing navigation setup
- Uses existing database connection
- Uses existing design system

## Status

✅ **Complete** - Suggested Sidequests feature is fully implemented and ready for testing.

## Next Steps

1. **Test on device** - Verify scrolling and interactions
2. **Populate database** - Ensure activity_interactions table has data
3. **Monitor usage** - Track which sidequests users tap
4. **Iterate** - Refine personalization algorithm based on data
5. **Add more sections** - Build additional discoverable features below sidequests
