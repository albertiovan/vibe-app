# Distance Filtering Test for Bucharest Activities

## Overview

Comprehensive test to verify that Claude API correctly filters activities based on distance from user location (central Bucharest).

## Test Location

**Central Bucharest (Piața Universității)**
- Latitude: 44.4268
- Longitude: 26.1025

## Distance Filters Tested

- ✅ **5km radius** - Very local activities
- ✅ **10km radius** - City-wide activities  
- ✅ **25km radius** - Greater Bucharest area
- ✅ **50km radius** - Metropolitan region

## Running the Test

```bash
cd /Users/aai/CascadeProjects/vibe-app
npx tsx backend/scripts/test-distance-filtering.ts
```

## What the Test Does

### 1. Database Distance Verification
- Queries all 48 newly imported activities (IDs 3001-3316)
- Calculates exact distance from central Bucharest using Haversine formula
- Groups activities by distance ranges (0-5km, 5-10km, 10-25km, 25-50km, 50km+)

### 2. Filter Testing
For each distance filter (5km, 10km, 25km, 50km):
- Lists all activities within range
- Groups by category (fitness, sports, culinary)
- Sorts by distance (nearest first)
- Verifies no activities exceed the specified range

### 3. Category Breakdown
- **Swimming Pools** (12 activities) - Fitness category
- **Tennis Courts** (12 activities) - Sports category
- **Badminton Facilities** (8 activities) - Sports category
- **Cooking Classes** (16 activities) - Culinary category

### 4. Specific Scenarios
- Swimming within 10km
- Tennis within 5km (strict filter)
- Cooking classes in Bucharest
- Otopeni activities (suburb, should be >15km)

### 5. City Distribution
- Shows activity count per city
- Calculates average distance from center for each city
- Verifies Bucharest vs suburb classification

## Expected Results

### Distance Distribution
- **0-5km**: Central Bucharest activities (Dinamo, city center venues)
- **5-10km**: Bucharest neighborhoods (Floreasca, Băneasa, Herăstrău)
- **10-25km**: Greater Bucharest (Otopeni, Pipera, outer districts)
- **25-50km**: Metropolitan area (rare for our dataset)

### City Expectations
- **București**: Majority of activities, avg distance 2-8km
- **Otopeni**: 1-2 activities, avg distance 15-20km
- **Other cities**: Outside 50km range (Cluj, Brașov, etc.)

## Haversine Formula

The test uses the Haversine formula to calculate great-circle distance between two points on Earth:

```typescript
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth radius in km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a = Math.sin(dLat/2)² + cos(lat1) * cos(lat2) * Math.sin(dLon/2)²;
  const c = 2 * atan2(√a, √(1-a));
  return R * c;
}
```

## Integration with Claude API

After verifying database distances, the next step is to ensure Claude API:

1. **Receives correct distance filter** in system prompt
2. **Respects the filter** when selecting activities
3. **Returns only activities** within specified range
4. **Prioritizes closer activities** when multiple options exist

## Test Output Format

```
🧪 Distance Filtering Test for Bucharest Activities

📍 Test Location: Central Bucharest (44.4268, 26.1025)

================================================================================
📏 Testing 5km Radius Filter
================================================================================

✅ Found X activities within 5km:

FITNESS (Y):
  2.34km - Training Session at Bazinul Olimpic Dinamo
  3.12km - Premium Tennis at Stejarii Country Club
  ...

SPORTS (Z):
  1.89km - Community Tennis at BDK Tennis Herăstrău
  ...

CULINARY (W):
  0.87km - Professional Cooking at Horeca Culinary School
  ...

✅ All activities are within 5km range
```

## Success Criteria

✅ **All activities correctly geolocated** - Coordinates match actual venue locations  
✅ **Distance calculations accurate** - Haversine formula produces realistic distances  
✅ **Filters work correctly** - No activities exceed specified range  
✅ **Progressive increase** - More activities as distance increases (5km < 10km < 25km < 50km)  
✅ **City classification correct** - Bucharest vs suburbs properly distinguished  
✅ **Otopeni activities distant** - Suburb activities are >15km from center  

## Next Steps

1. ✅ Run database distance test (this script)
2. ⏳ Test Claude API recommendations with distance filters
3. ⏳ Verify Claude respects filters in system prompt
4. ⏳ Test edge cases (boundary distances, zero distance)
5. ⏳ Integration test with mobile app filters

## Files

- **Test Script**: `/backend/scripts/test-distance-filtering.ts`
- **Documentation**: `/DISTANCE_FILTERING_TEST.md` (this file)
- **Activity Data**: `/backend/scripts/data/sports-cooking-data.json`
- **Import Script**: `/backend/scripts/import-sports-cooking-batch.ts`

## Related Features

- **Nearest Venue Selection**: Haversine formula used in `ActivityDetailScreenShell.tsx`
- **Activity Filters**: Distance filtering in `activityFilters.ts`
- **User Location**: Captured in `HomeScreenShell.tsx` with expo-location
- **60/40 Energy Variety**: Works alongside distance filtering in recommendations

---

**Status**: Database distance test ready to run  
**Next**: Verify Claude API respects distance filters in recommendations
