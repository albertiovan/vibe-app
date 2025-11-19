# Location Filtering Implementation Guide

## Status
⚠️ **PARTIAL IMPLEMENTATION** - Core logic added, needs completion

## Changes Made

### 1. ✅ FilterOptions Interface Updated
**File:** `/backend/src/services/filters/activityFilters.ts`

```typescript
export interface FilterOptions {
  // Location filters
  userLatitude?: number;
  userLongitude?: number;
  userCity?: string; // NEW: User's current city
  maxDistanceKm?: number | null; // NEW: Three-state system
  // ... rest of interface
}
```

### 2. ✅ Core Location Logic Added
**File:** `/backend/src/services/llm/mcpClaudeRecommender.ts` (line 245-282)

```typescript
// Three states: undefined (variety), 20 (in city only), null (explore outside)
const userCity = request.filters?.userCity || region;
const locationFilter = request.filters?.maxDistanceKm;

let locationMode: 'variety' | 'in-city' | 'explore-outside';
let whereClause: string;

if (locationFilter === undefined) {
  // NO FILTER: Variety mode
  locationMode = 'variety';
  whereClause = '1=1';
  console.log(`🌍 Location Mode: VARIETY (mix of ${userCity} + outside)`);
} else if (locationFilter === 20) {
  // IN CITY: Only user's city
  locationMode = 'in-city';
  whereClause = `a.region = $1`;
  console.log(`📍 Location Mode: IN CITY ONLY (${userCity})`);
} else if (locationFilter === null) {
  // EXPLORE: Exclude user's city
  locationMode = 'explore-outside';
  whereClause = `a.region != $1`;
  console.log(`🗺️  Location Mode: EXPLORE OUTSIDE (exclude ${userCity})`);
}
```

## Remaining Work

### 3. ⚠️ Replace `searchEverywhere` Variable
**File:** `/backend/src/services/llm/mcpClaudeRecommender.ts`

The old `searchEverywhere` boolean needs to be replaced with `locationMode` checks:

**Line 343:** Filter builder call
```typescript
// OLD:
const filterResult = buildFilterClause(request.filters, paramIndex, searchEverywhere);

// NEW:
const filterResult = buildFilterClause(request.filters, paramIndex, locationMode === 'explore-outside');
```

**Line 348:** Travel-aware duration
```typescript
// OLD:
if (searchEverywhere && request.filters.durationRange === 'full-day') {

// NEW:
if (locationMode === 'explore-outside' && request.filters.durationRange === 'full-day') {
```

**Lines 356-392:** Smart ranking ORDER BY
```typescript
// OLD:
if (searchEverywhere) {
  // Prefer activities OUTSIDE current city
  activitiesQuery += `ORDER BY CASE WHEN a.region != $1 THEN 0 ELSE 1 END, ...`;
} else {
  // Prefer LOCAL activities
  activitiesQuery += `ORDER BY CASE WHEN a.region = $1 THEN 0 ELSE 1 END, ...`;
}

// NEW:
if (locationMode === 'explore-outside') {
  // Prefer activities OUTSIDE current city
  activitiesQuery += `ORDER BY CASE WHEN a.region != $1 THEN 0 ELSE 1 END, ...`;
} else if (locationMode === 'in-city') {
  // Only local activities (already filtered in WHERE)
  activitiesQuery += `ORDER BY ...`;
} else {
  // Variety mode: balanced mix
  activitiesQuery += `ORDER BY RANDOM()`;
}
```

**Line 395:** Query limit
```typescript
// OLD:
const queryLimit = searchEverywhere ? 50 : 20;

// NEW:
const queryLimit = locationMode === 'explore-outside' ? 50 : 30;
```

**Line 646:** Fallback query
```typescript
// OLD:
WHERE ${searchEverywhere ? '1=1' : '(a.region = \'București\' OR ...)'}

// NEW:
WHERE ${locationMode === 'explore-outside' ? 'a.region != $1' : 
       locationMode === 'in-city' ? 'a.region = $1' : '1=1'}
```

### 4. ⚠️ Add Variety Enforcement
**File:** `/backend/src/services/llm/mcpClaudeRecommender.ts`

After line 700 (after scoring activities), add variety enforcement:

```typescript
// STEP 4.6: Enforce variety for undefined filter mode
if (locationMode === 'variety' && activities.length > 0) {
  console.log('🎯 Enforcing variety: ensuring mix of local + outside activities');
  
  const localActivities = activities.filter(a => a.region === userCity);
  const outsideActivities = activities.filter(a => a.region !== userCity);
  
  console.log(`   Local: ${localActivities.length}, Outside: ${outsideActivities.length}`);
  
  // Ensure at least 1 local AND 1 outside (if available)
  if (localActivities.length === 0 && outsideActivities.length > 0) {
    console.log('⚠️ No local activities found, fetching some...');
    // Query for local activities
    const localQuery = `
      SELECT a.id, a.name, a.category, a.city, a.region, a.description, a.tags,
             a.energy_level, a.indoor_outdoor, a.latitude, a.longitude,
             a.duration_min, a.duration_max, a.crowd_size, a.crowd_type,
             a.group_suitability, a.price_tier
      FROM activities a
      WHERE a.region = $1
      ORDER BY RANDOM()
      LIMIT 2
    `;
    const { rows: localResults } = await pool.query(localQuery, [userCity]);
    activities = [...localResults, ...activities.slice(0, 3)]; // 2 local + 3 outside
    console.log(`✅ Added ${localResults.length} local activities for variety`);
  } else if (outsideActivities.length === 0 && localActivities.length > 0) {
    console.log('⚠️ No outside activities found, fetching some...');
    // Query for outside activities
    const outsideQuery = `
      SELECT a.id, a.name, a.category, a.city, a.region, a.description, a.tags,
             a.energy_level, a.indoor_outdoor, a.latitude, a.longitude,
             a.duration_min, a.duration_max, a.crowd_size, a.crowd_type,
             a.group_suitability, a.price_tier
      FROM activities a
      WHERE a.region != $1
      ORDER BY RANDOM()
      LIMIT 2
    `;
    const { rows: outsideResults } = await pool.query(outsideQuery, [userCity]);
    activities = [...activities.slice(0, 3), ...outsideResults]; // 3 local + 2 outside
    console.log(`✅ Added ${outsideResults.length} outside activities for variety`);
  }
  
  // Final mix: aim for 60% local, 40% outside (or best available ratio)
  const targetLocal = Math.ceil(5 * 0.6); // 3 local
  const targetOutside = Math.floor(5 * 0.4); // 2 outside
  
  const finalLocal = localActivities.slice(0, targetLocal);
  const finalOutside = outsideActivities.slice(0, targetOutside);
  
  // If we don't have enough of one type, fill with the other
  if (finalLocal.length < targetLocal) {
    const needed = targetLocal - finalLocal.length;
    finalOutside.push(...outsideActivities.slice(targetOutside, targetOutside + needed));
  } else if (finalOutside.length < targetOutside) {
    const needed = targetOutside - finalOutside.length;
    finalLocal.push(...localActivities.slice(targetLocal, targetLocal + needed));
  }
  
  activities = [...finalLocal, ...finalOutside];
  console.log(`✅ Variety enforced: ${finalLocal.length} local + ${finalOutside.length} outside`);
}
```

### 5. ⚠️ Update Chat Route
**File:** `/backend/src/routes/chat.ts` (line 122-126)

```typescript
// OLD:
const recommendations = await mcpRecommender.getMCPRecommendations({
  vibe: message,
  city: location?.city || 'Bucharest',
  filters: enhancedFilters
});

// NEW:
const recommendations = await mcpRecommender.getMCPRecommendations({
  vibe: message,
  city: location?.city || 'Bucharest',
  filters: {
    ...enhancedFilters,
    userCity: location?.city || 'București', // Pass user's city
    userLatitude: location?.lat,
    userLongitude: location?.lng
  }
});
```

### 6. ⚠️ Frontend Already Done
The frontend filter component already uses the three-state system (undefined/20/null).

## Testing Plan

### Test Case 1: No Filter (Variety Mode)
```
User in Cluj-Napoca, no distance filter selected
Expected: 3 Cluj activities + 2 outside activities (or similar mix)
```

### Test Case 2: In City Filter
```
User in Cluj-Napoca, "In City" filter selected
Expected: 5 Cluj activities only, 0 from other cities
```

### Test Case 3: Explore Romania Filter
```
User in Cluj-Napoca, "Explore Romania" filter selected
Expected: 0 Cluj activities, 5 from Brașov/Sibiu/etc.
```

### Test Case 4: No Location Permission
```
User hasn't granted location, defaults to București
Expected: System works with București as default city
```

## Quick Implementation Steps

1. **Search & Replace in mcpClaudeRecommender.ts:**
   - Find: `searchEverywhere`
   - Replace with appropriate `locationMode` check

2. **Add variety enforcement logic** after line 700

3. **Update chat route** to pass `userCity`

4. **Test all three modes** with different user cities

5. **Deploy and monitor** console logs for correct behavior

## Console Log Patterns to Look For

```
✅ Good:
🌍 Location Mode: VARIETY (mix of Cluj-Napoca + outside)
✅ Variety enforced: 3 local + 2 outside

📍 Location Mode: IN CITY ONLY (Cluj-Napoca)
✅ Found 5 activities in Cluj-Napoca

🗺️  Location Mode: EXPLORE OUTSIDE (exclude Cluj-Napoca)
✅ Found 5 activities outside Cluj-Napoca

❌ Bad:
⚠️ No local activities found (in variety mode)
⚠️ No outside activities found (in variety mode)
```

## Rollback Plan

If issues arise, revert to old behavior:
```typescript
const searchEverywhere = !request.filters?.maxDistanceKm || request.filters.maxDistanceKm >= 50;
```

## Status Summary

- ✅ Interface updated
- ✅ Core logic added
- ⚠️ Variable replacements needed (6 locations)
- ⚠️ Variety enforcement needed (1 section)
- ⚠️ Chat route update needed (1 location)
- ⚠️ Testing needed (4 test cases)

**Estimated completion time:** 30-45 minutes
