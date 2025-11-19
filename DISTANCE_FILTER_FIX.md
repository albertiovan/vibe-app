# Distance Filter Bug Fix

## Problem Identified

The Claude API distance understanding test revealed a **50% failure rate** with major violations:
- Activities from Brașov (137km away) returned for "nearby" (5km) queries
- Activities from Ploiești (54km away) returned for "walking distance" (2km) queries
- Success rate: **50.0%** (should be >95%)

## Root Cause

**File:** `/backend/src/services/llm/mcpClaudeRecommender.ts`

### Issue 1: Fallback Search Ignored Distance Filter (Line 465-497)
When fewer than 5 activities were found after initial filtering, the system performed a "broader search" that:
1. Fetched 30 random activities from the database
2. **Did NOT apply distance filtering** to these fallback results
3. Added them directly to the results

**Result:** Activities 137km away were returned for 5km "nearby" queries.

### Issue 2: Missing Columns in First Fallback (Line 423-436)
The first fallback query (when zero activities matched) was missing `latitude` and `longitude` columns, which are required for distance calculation.

**Result:** Distance filtering couldn't work on first fallback activities.

## Solution Implemented

### Fix 1: Apply Distance Filter to Fallback Activities
```typescript
// BEFORE (Line 481-496)
let { rows: fallbackActivities } = await pool.query(fallbackQuery);
console.log(`🔄 Fallback found ${fallbackActivities.length} additional activities`);

// Apply keyword matching to fallback too
if (analysis.keywordPrefer && analysis.keywordPrefer.length > 0) {
  const keywordMatches = fallbackActivities.filter(...);
  activities.push(...keywordMatches); // ❌ NO DISTANCE FILTERING
}

// AFTER (Line 481-507)
let { rows: fallbackActivities } = await pool.query(fallbackQuery);
console.log(`🔄 Fallback found ${fallbackActivities.length} additional activities`);

// CRITICAL: Apply distance filtering to fallback activities BEFORE adding them
if (request.filters?.userLatitude && request.filters?.userLongitude) {
  const beforeFallbackDistanceFilter = fallbackActivities.length;
  fallbackActivities = filterByDistance(
    fallbackActivities,
    request.filters.userLatitude,
    request.filters.userLongitude,
    request.filters.maxDistanceKm || null
  );
  console.log(`📍 Fallback distance filter: ${fallbackActivities.length} activities (removed ${beforeFallbackDistanceFilter - fallbackActivities.length})`);
}

// Apply keyword matching to fallback too
if (analysis.keywordPrefer && analysis.keywordPrefer.length > 0) {
  const keywordMatches = fallbackActivities.filter(...);
  activities.push(...keywordMatches); // ✅ NOW DISTANCE-FILTERED
}
```

### Fix 2: Add Missing Columns to First Fallback Query
```typescript
// BEFORE (Line 423-436)
const fallbackQuery = `
  SELECT a.id, a.name, a.category, a.city, a.region, a.description, a.tags
  FROM activities a
  ...
`;

// AFTER (Line 423-436)
const fallbackQuery = `
  SELECT a.id, a.name, a.category, a.city, a.region, a.description, a.tags,
         a.energy_level, a.indoor_outdoor, a.latitude, a.longitude,
         a.duration_min, a.duration_max, a.crowd_size, a.crowd_type,
         a.group_suitability, a.price_tier
  FROM activities a
  ...
`;
```

## Expected Impact

### Before Fix
```
Total Tests: 50
✅ Passed: 25 (50.0%)
❌ Failed: 25 (50.0%)

NEARBY (5km limit):
  Tests: 10 | Passed: 5 | Failed: 5
  ⚠️  Total violations: 17

WALKING (2km limit):
  Tests: 10 | Passed: 2 | Failed: 8
  ⚠️  Total violations: 29
```

### After Fix (Expected)
```
Total Tests: 50
✅ Passed: 48-50 (96-100%)
❌ Failed: 0-2 (0-4%)

NEARBY (5km limit):
  Tests: 10 | Passed: 10 | Failed: 0
  ⚠️  Total violations: 0

WALKING (2km limit):
  Tests: 10 | Passed: 10 | Failed: 0
  ⚠️  Total violations: 0
```

## Verification

Run the test again to verify the fix:

```bash
cd /Users/aai/CascadeProjects/vibe-app
npx tsx backend/scripts/test-claude-distance-understanding.ts
```

### What to Look For

1. **No Brașov Activities in Nearby Queries**
   - "Looking for a quick workout close by" (5km) should NOT return activities from Brașov (137km)
   
2. **No Ploiești Activities in Walking Distance**
   - "Looking for a gym within walking distance" (2km) should NOT return activities from Ploiești (54km)

3. **Fallback Distance Filtering Logs**
   - Look for: `📍 Fallback distance filter: X activities (removed Y)`
   - This confirms distance filtering is now applied to fallback results

4. **Success Rate >95%**
   - Overall pass rate should be 95-100%
   - Each distance category should have <5% failures

## Technical Details

### Distance Filtering Logic
The `filterByDistance()` function (in `activityFilters.ts`) uses the Haversine formula to calculate distances:

```typescript
function calculateDistance(lat1, lon1, lat2, lon2): number {
  const R = 6371; // Earth radius in km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a = Math.sin(dLat/2)² + cos(lat1)*cos(lat2)*Math.sin(dLon/2)²;
  const c = 2 * atan2(sqrt(a), sqrt(1-a));
  return R * c;
}
```

### Filter Application Order
1. **Initial Query** - Fetch activities matching tags, energy, category
2. **Keyword Filtering** - Match/boost by keywords
3. **Distance Filtering** - Apply Haversine formula, filter by maxDistanceKm
4. **Fallback (if <5 activities)** - Fetch broader set
5. **⚠️ CRITICAL: Distance Filtering on Fallback** - Apply same distance filter
6. **Scoring** - Rank by relevance
7. **Weather Filtering** - Remove bad weather activities
8. **Final Selection** - Return top 5

## Files Modified

- `/backend/src/services/llm/mcpClaudeRecommender.ts`
  - Line 423-436: Added missing columns to first fallback query
  - Line 484-494: Added distance filtering to second fallback results

## Related Files

- `/backend/src/services/filters/activityFilters.ts` - Distance calculation logic
- `/backend/scripts/test-claude-distance-understanding.ts` - Test script
- `/CLAUDE_DISTANCE_TEST.md` - Test documentation

## Next Steps

1. ✅ **Run Test** - Verify fix with 50-query test
2. ⏳ **Analyze Results** - Check for remaining violations
3. ⏳ **Mobile Testing** - Test in actual app with real user locations
4. ⏳ **Monitor Production** - Track distance filter accuracy in production

---

**Status:** Fixed and ready for testing  
**Date:** 2025-11-13  
**Impact:** Critical - Affects all distance-based recommendations
