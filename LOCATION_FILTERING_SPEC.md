# Location Filtering Specification

## Overview
New intelligent location filtering system that adapts behavior based on user's filter selection and live location data.

## Three Filter States

### 1. **No Location Filter** (undefined)
**User Intent:** "Show me the best activities for my vibe, with variety"

**Backend Behavior:**
- Focus on vibe suitability as primary ranking factor
- **Variety Requirement:** Ensure at least 1 activity in user's city AND at least 1 activity outside user's city
- Can include more of either based on vibe match quality
- Sort by relevance score, not location
- Use live location data to calculate distances for display

**Example Results:**
- 3 activities in Cluj-Napoca (user's city)
- 2 activities in Brașov (outside city)
- All highly relevant to the vibe

### 2. **In City Filter** (maxDistanceKm = 20)
**User Intent:** "I want to stay local, show me only activities in my city"

**Backend Behavior:**
- **STRICT:** Only activities in user's current city (based on live location)
- Filter by city name match OR distance within 20km radius
- No activities from other cities
- Sort by vibe relevance within city

**Example Results:**
- 5 activities in Cluj-Napoca only
- All within 20km of user's location
- Zero activities from other cities

### 3. **Explore Romania Filter** (maxDistanceKm = null)
**User Intent:** "I want to explore beyond my city, show me adventures elsewhere"

**Backend Behavior:**
- **STRICT:** Only activities OUTSIDE user's current city
- Exclude user's city completely
- Show activities from all other Romanian cities/regions
- Prioritize closer destinations first (day-trip distance)
- Sort by vibe relevance + distance

**Example Results:**
- 0 activities in Cluj-Napoca (user's city)
- 5 activities from Brașov, Sibiu, Prahova, etc.
- All outside user's city

## Live Location Integration

### Location Permission Flow
1. **Onboarding:** App requests location permission during initial setup
2. **Permission Granted:** Store user's city and coordinates
3. **Permission Denied:** Prompt for location before each vibe query
4. **No Location:** Default to București, show warning message

### Location Data Structure
```typescript
{
  userLatitude: number;    // Live GPS coordinates
  userLongitude: number;   // Live GPS coordinates
  userCity: string;        // Detected city name (e.g., "Cluj-Napoca")
}
```

### City Detection
- Use reverse geocoding from coordinates
- Match to Romanian city names in database
- Normalize variations (Cluj → Cluj-Napoca, Bucharest → București)

## Backend Implementation

### Query Logic

**No Filter (undefined):**
```sql
SELECT * FROM activities 
WHERE <vibe_filters>
ORDER BY relevance_score DESC
LIMIT 30;

-- Post-processing:
-- 1. Ensure at least 1 activity WHERE city = user_city
-- 2. Ensure at least 1 activity WHERE city != user_city
-- 3. Fill remaining slots by relevance
```

**In City (20km):**
```sql
SELECT * FROM activities 
WHERE <vibe_filters>
  AND (
    city = $user_city 
    OR calculate_distance(lat, lng, $user_lat, $user_lng) <= 20
  )
ORDER BY relevance_score DESC
LIMIT 30;
```

**Explore Romania (null):**
```sql
SELECT * FROM activities 
WHERE <vibe_filters>
  AND city != $user_city
  AND calculate_distance(lat, lng, $user_lat, $user_lng) <= 200  -- Day-trip range
ORDER BY 
  relevance_score DESC,
  calculate_distance(lat, lng, $user_lat, $user_lng) ASC
LIMIT 30;
```

## Frontend Changes

### Filter Component
```typescript
// MinimalActivityFilters.tsx
const DISTANCE_OPTIONS = [
  { label: 'In City', value: 20 },           // Strict local
  { label: 'Explore Romania', value: null }, // Strict outside
];

// undefined = no filter (variety mode)
const [selectedDistance, setSelectedDistance] = useState<number | null | undefined>(undefined);
```

### API Call
```typescript
// Pass user location with every request
chatApi.sendMessage({
  conversationId,
  message: userVibe,
  location: {
    city: userCity,
    lat: userLatitude,
    lng: userLongitude
  },
  filters: {
    maxDistanceKm: selectedDistance,  // undefined | 20 | null
    userLatitude,
    userLongitude,
    userCity
  }
});
```

## UX Messaging

### No Filter
- No special message
- Results show mix of local and outside activities naturally

### In City
- Badge: "📍 In Cluj-Napoca"
- If no results: "No activities found in your city. Try 'Explore Romania' to see nearby options."

### Explore Romania
- Badge: "🗺️ Exploring Romania"
- Distance shown: "45km away in Brașov"
- If no results: "No activities found outside your city. Try removing the filter."

## Edge Cases

### No Location Permission
- Show warning: "Enable location for personalized results"
- Default to București
- All filters still work, just less accurate

### User in București
- "In City" shows București only
- "Explore Romania" shows Prahova, Brașov, Cluj, etc.

### No Activities in User's City
- "No Filter" mode: Show warning, include nearby cities
- "In City" mode: Show "No results" message
- "Explore Romania" mode: Works normally

### User Traveling
- Location updates in real-time
- Filters adapt to new city automatically
- "In City" shows current city, not home city

## Testing Scenarios

1. **User in Cluj, No Filter**
   - ✅ At least 1 Cluj activity
   - ✅ At least 1 non-Cluj activity
   - ✅ Sorted by vibe relevance

2. **User in Cluj, In City Filter**
   - ✅ Only Cluj activities
   - ✅ Zero activities from other cities
   - ✅ All within 20km

3. **User in Cluj, Explore Romania Filter**
   - ✅ Zero Cluj activities
   - ✅ Only activities from other cities
   - ✅ Sorted by relevance + distance

4. **No Location Permission**
   - ✅ Warning message shown
   - ✅ Defaults to București
   - ✅ Filters still functional

## Migration Notes

### Current Behavior
- `maxDistanceKm = undefined` → No filter, search everywhere
- `maxDistanceKm = 20` → Within 20km radius
- `maxDistanceKm = null` → Treated as "no limit", search everywhere

### New Behavior
- `maxDistanceKm = undefined` → Variety mode (at least 1 local + 1 outside)
- `maxDistanceKm = 20` → Strict local only
- `maxDistanceKm = null` → Strict outside only

### Breaking Changes
- "Explore Romania" now EXCLUDES user's city (previously included everything)
- "No Filter" now REQUIRES variety (previously could be all local)

## Implementation Checklist

Backend:
- [ ] Update `mcpClaudeRecommender.ts` with new location logic
- [ ] Add variety enforcement for undefined filter
- [ ] Add strict city exclusion for null filter
- [ ] Add strict city inclusion for 20km filter
- [ ] Update query building logic
- [ ] Add city detection from coordinates

Frontend:
- [ ] Already done - using undefined/20/null system
- [ ] Pass userCity in filters
- [ ] Show appropriate badges/messages

Testing:
- [ ] Test all three filter states
- [ ] Test with different user cities
- [ ] Test without location permission
- [ ] Test edge cases
