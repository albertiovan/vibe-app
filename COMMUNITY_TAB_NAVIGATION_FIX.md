# Community Tab Navigation Fix

## Issue
The Community tab in the bottom navigation was showing "Community content coming soon..." placeholder instead of the actual CommunityScreen.

## Root Cause
The app uses `NewHomeScreen.tsx` as the initial route, which has its own internal tab system. When the community tab was tapped, it was showing a placeholder instead of navigating to the actual `CommunityScreen` component.

## Solution
Added a `useEffect` hook in `NewHomeScreen.tsx` that:
1. Watches for changes to `activeTab` state
2. When `activeTab === 'community'`, navigates to the `Community` screen
3. Resets the tab back to 'home' after navigation starts

## Changes Made

### `/screens/NewHomeScreen.tsx`

**Added Community to navigation types:**
```typescript
type RootStackParamList = {
  ActivityDetailScreenShell: {
    activity: any;
    userLocation?: { latitude: number; longitude: number };
  };
  Community: undefined; // Added
};
```

**Added navigation effect:**
```typescript
// Navigate to Community screen when community tab is selected
useEffect(() => {
  if (activeTab === 'community' && showMainContent) {
    navigation.navigate('Community');
    // Reset to home tab after navigation starts
    setTimeout(() => setActiveTab('home'), 100);
  }
}, [activeTab, showMainContent]);
```

## How It Works Now

1. User taps Community icon (👥) in bottom navigation
2. `activeTab` state changes to 'community'
3. useEffect detects the change and calls `navigation.navigate('Community')`
4. App navigates to the full `CommunityScreen` with Feed, Leaderboard, and My Activity tabs
5. Tab resets to 'home' so when user returns, they're back on the home screen

## Testing

1. **Restart the app** (important - reload to pick up the changes)
2. Tap the Community icon (👥) in the bottom navigation
3. Should see the Community screen with:
   - Feed tab with 15 posts
   - Leaderboard tab with rankings
   - My Activity tab with stats
   - Floating ✨ button to create posts

## Alternative Approaches Considered

1. **Render CommunityScreen inline** - Would work but breaks the navigation pattern
2. **Replace NewHomeScreen** - Too disruptive to existing flow
3. **Current solution** - Clean navigation that preserves existing UX

## Next Steps

If you want the Community tab to stay highlighted when on the Community screen, you'll need to:
1. Pass navigation state to BottomNavBar
2. Update BottomNavBar to check current route
3. Highlight community tab when on Community screen

For now, the tab resets to home which is acceptable UX.
