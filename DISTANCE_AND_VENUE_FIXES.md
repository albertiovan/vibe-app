# Distance Display & Missing Venues Fixed

## Issue 1: "Nearby" Showing for All Activities ✅ FIXED

### Problem
All activities showed "Nearby" in the location field, even when they were in different cities (e.g., Brașov activity showing "Nearby" when user is in Bucharest).

### Root Cause
The `formatDistance()` function in `MinimalSuggestionsScreen.tsx` was hardcoded to return 'Nearby' when distance wasn't calculated:
```typescript
// Before
const formatDistance = (distance?: number) => {
  if (!distance) return 'Nearby';  // ❌ Always showed "Nearby"
  ...
}
```

### Fix Applied
Changed the function to show the actual city/region name when distance isn't available:
```typescript
// After
const formatDistance = (distance?: number, city?: string, region?: string) => {
  if (distance && distance > 0) {
    if (distance < 1) return `${Math.round(distance * 1000)}m`;
    return `${distance.toFixed(1)}km`;
  }
  // Show city/region instead of "Nearby"
  return city || region || 'Bucharest';
};
```

### Result
- ✅ Activities in Bucharest show "Bucharest" or "București"
- ✅ Activities in Brașov show "Brașov"  
- ✅ Activities in Cluj show "Cluj"
- ✅ When distance IS calculated, shows actual distance (e.g., "45.2km")

### Files Modified
- `/screens/MinimalSuggestionsScreen.tsx` - Updated formatDistance function
- `/screens/MinimalActivityDetailScreen.tsx` - Return null instead of "Nearby"

---

## Issue 2: Missing Venues & Websites ⚠️ NEEDS ATTENTION

### Database Status
```
Total Activities: 581
Activities with Venues: 379 (65%)
Activities WITHOUT Venues: 202 (35%)
```

### Problem
**202 activities are missing venue data**, including:
- Transfăgărășan Scenic Day Tour (ID: 8)
- Electronic Club Night in Bucharest (ID: 15)
- Cluj Live Music & Club Night (ID: 16)
- Bucharest Escape Room Challenge (ID: 19)
- Yoga classes, CrossFit sessions, spa days
- And 195+ more...

These are the **original 95 activities from the seed file** plus some others that never got venues imported.

### Impact
When users tap "Learn More" or "GO NOW" on these activities:
- ❌ "No website for this activity"
- ❌ "No location to go now"

### What Happened
The venue imports you did (200-300 venues) successfully added venues for activities **ID 92+**, but the original activities (ID 1-95) were never updated with venue data.

### Next Steps Required
You need to import venues for the missing 202 activities. Options:

1. **Re-run the venue import scripts** for activities ID 1-95
2. **Manual import** using the venue import scripts in `/backend/scripts/`
3. **Check if venue data exists** in your source files but wasn't imported

### Query to See Missing Activities
```sql
SELECT a.id, a.name, a.city, a.region, a.category
FROM activities a
LEFT JOIN venues v ON v.activity_id = a.id
WHERE v.id IS NULL
ORDER BY a.id;
```

### Verification
To check if a specific activity has venues:
```sql
SELECT a.name, COUNT(v.id) as venue_count,
       STRING_AGG(v.name, ', ') as venue_names
FROM activities a
LEFT JOIN venues v ON v.activity_id = a.id
WHERE a.id = 8  -- Transfăgărășan
GROUP BY a.name;
```

---

## Summary
✅ **Distance display fixed** - Now shows actual city names instead of "Nearby"  
⚠️ **202 activities still need venues** - Original seed activities missing venue data  

The distance fix is complete and will work immediately. The venue issue requires importing venue data for the missing activities.
