# Smart Duration Filtering

## The Problem You Identified

**Not all activities have the same flexibility:**
- ❌ Pottery class: Fixed 1-2 hours (can't extend)
- ✅ Mountain biking: 2 hours OR all day (flexible)
- ❌ Cooking workshop: Fixed 2-3 hours (structured lesson)
- ✅ Hiking: 1 hour OR 8 hours (go as long as you want)

**Old system was treating everything the same** - "Full Day" filter excluded short activities even if they're flexible.

## The Solution: Context-Aware Filtering

The system now intelligently categorizes activities into **FIXED** vs **FLEXIBLE** duration types.

### Fixed-Duration Activities (STRICT filtering)

These have structured timelines and can't be extended:

**Categories:**
- **Learning** - Cooking classes, workshops, courses
  - Example: "Cooking Workshop" (2h) → Can't extend, needs instructor
- **Creative** - Pottery, painting, crafts
  - Example: "Pottery Class" (1.5h) → Fixed kiln schedule, instructor time
- **Culture** - Museum tours, guided experiences
  - Example: "Museum Guided Tour" (1h) → Fixed tour schedule

**Tags that indicate fixed duration:**
- `requirement:lesson-recommended` - Structured lesson
- `requirement:guide-required` - Guide has schedule

**Behavior with "Full Day" filter:**
```
User selects: Full Day (6h+)
Pottery class (1.5h): ❌ FILTERED OUT (too short, can't extend)
Cooking workshop (3h): ❌ FILTERED OUT (too short, can't extend)
Art workshop (6h+): ✅ INCLUDED (meets duration)
```

### Flexible-Duration Activities (RELAXED filtering)

These can be done for ANY duration - you control how long:

**Categories:**
- **Adventure** - Hiking, biking, climbing, kayaking
  - Example: "Mountain Biking" (2-4h listed) → Can do 2h OR all day
- **Nature** - Parks, walks, trails, gardens
  - Example: "Botanical Garden" (1h listed) → Can stay 10 minutes or 4 hours
- **Sports** - Most outdoor sports
  - Example: "Tennis" (1h listed) → Can play 1 set or all day
- **Water** - Swimming, boating, beach
  - Example: "Lake Swimming" (2h listed) → Can swim for 30 min or stay all day
- **Fitness** - Gym, running, yoga
  - Example: "Gym Session" (1h listed) → Can work out 30 min or 3 hours
- **Wellness** - Spa, massage, relaxation
  - Example: "Spa Day" - Choose your services
- **Mindfulness** - Meditation, quiet time
  - Example: "Park Bench" - Stay as long as you want
- **Romance** - Dates, walks, dinners
  - Example: "Sunset Walk" - Can be 30 min or 3 hours

**Behavior with "Full Day" filter:**
```
User selects: Full Day (6h+)
Mountain biking (2-4h): ✅ INCLUDED (can extend to full day)
Hiking trail (3h): ✅ INCLUDED (can hike all day)
Park walk (1h): ✅ INCLUDED (can stay in park all day)
Beach day (4h): ✅ INCLUDED (can stay all day)
```

## The Logic

### For Bounded Ranges (Quick, Short, Medium, Long)

**Simple rule:** Activity must FIT within the time available

```
User selects: Short (1-2h)
Mountain biking (2-4h): ❌ FILTERED OUT (too long, won't fit)
Park walk (1h): ✅ INCLUDED (fits perfectly)
Pottery class (1.5h): ✅ INCLUDED (fits in 2h window)
```

**Logic:** `duration_max <= range_max`

### For Open-Ended Ranges (Full Day)

**Smart rule:** Accept if:
1. **Category is flexible** (adventure, nature, sports, water, fitness, wellness, mindfulness, romance), OR
2. **No fixed structure** (not learning/creative/culture AND no lesson requirement), OR
3. **Long enough duration** (duration_max >= 6 hours)

```sql
(
  -- Flexible categories: always accept
  category IN ('adventure', 'nature', 'sports', 'water', 'fitness', 'wellness', 'mindfulness', 'romance')
  OR
  -- Not structured AND no lesson requirement
  (category NOT IN ('learning', 'creative', 'culture') 
   AND NOT ('requirement:lesson-recommended' = ANY(tags)))
  OR
  -- Meets duration requirement
  (duration_max >= 360 OR duration_max IS NULL)
)
```

## Examples

### Example 1: "Full Day" filter

**Input:** User selects "Full Day (6h+)"

**Results:**

| Activity | Category | Duration | Result | Reason |
|----------|----------|----------|--------|--------|
| Mountain Biking | adventure | 2-4h | ✅ INCLUDED | Adventure category = flexible |
| Hiking Trail | nature | 3h | ✅ INCLUDED | Nature category = flexible |
| Beach Day | water | 4h | ✅ INCLUDED | Water category = flexible |
| Spa Visit | wellness | 2-3h | ✅ INCLUDED | Wellness category = flexible |
| Park Walk | nature | 1h | ✅ INCLUDED | Nature category = flexible |
| Tennis Match | sports | 1-2h | ✅ INCLUDED | Sports category = flexible |
| Pottery Class | creative | 1.5h | ❌ FILTERED OUT | Creative + too short |
| Cooking Class | learning | 2h | ❌ FILTERED OUT | Learning + too short |
| Museum Tour | culture | 1h | ❌ FILTERED OUT | Culture + too short |
| Day Hike | adventure | 6-8h | ✅ INCLUDED | Meets duration + flexible |

### Example 2: "Short (1-2h)" filter

**Input:** User selects "Short (1-2h)"

**Results:**

| Activity | Duration | Result | Reason |
|----------|----------|--------|--------|
| Mountain Biking | 2-4h | ❌ FILTERED OUT | Too long (max 4h > 2h) |
| Park Walk | 1h | ✅ INCLUDED | Fits within 2h |
| Pottery Class | 1.5h | ✅ INCLUDED | Fits within 2h |
| Gym Session | 1h | ✅ INCLUDED | Fits within 2h |
| Full Day Hike | 6h | ❌ FILTERED OUT | Too long |

### Example 3: Mountain Biking Request

**User:** "I want to do mountain biking, I miss that feeling of adrenaline"
**Filter:** Full Day + Anywhere

**Before (BROKEN):**
```
Query finds: Mountain Biking (2-4h)
Duration filter: Requires 6h+
Result: ❌ Filtered out
User gets: Ice skating, benches (wrong!)
```

**After (FIXED):**
```
Query finds: Mountain Biking (2-4h)
Duration filter: Category = adventure → flexible → ACCEPT
Result: ✅ Included
User gets: 3 mountain biking activities ✓
```

### Example 4: Pottery Class Request

**User:** "I want to try pottery"
**Filter:** Full Day

**Expected (CORRECT):**
```
Query finds: Pottery Class (1.5h)
Duration filter: Category = creative + too short → REJECT
Alternative finds: Full-day pottery workshop (6h) → ACCEPT
Result: Only shows long pottery workshops
```

This is correct because:
- Standard pottery class (1.5h) can't be extended
- If user wants full day of pottery, they need a full-day workshop
- System correctly filters out short fixed-duration classes

## Category Classification

### Always Flexible (Relaxed)
- `adventure` - Hiking, biking, climbing, kayaking
- `nature` - Parks, gardens, trails, viewpoints
- `sports` - Tennis, basketball, swimming, cycling
- `water` - Beach, lake, river activities
- `fitness` - Gym, running, cycling, yoga
- `wellness` - Spa, massage, sauna
- `mindfulness` - Meditation, quiet time
- `romance` - Dates, walks, picnics

### Always Fixed (Strict)
- `learning` - Classes, courses, workshops
- `creative` - Pottery, painting, crafts (when structured)
- `culture` - Guided tours, museum visits (when guided)

### Sometimes Fixed (Check tags)
- `culinary` - Cooking class (fixed) vs. restaurant (flexible)
- `nightlife` - Concert (fixed time) vs. bar hopping (flexible)
- `social` - Event (fixed) vs. hanging out (flexible)
- `seasonal` - Depends on activity type

## Benefits

### For Users
- ✅ "Full day" filter doesn't exclude short flexible activities
- ✅ Mountain biking shows up even though it's 2-4h
- ✅ Park walks included (can extend duration naturally)
- ✅ Classes correctly filtered (can't extend fixed lessons)

### For System
- ✅ Intelligent, context-aware filtering
- ✅ Respects activity nature (fixed vs flexible)
- ✅ More relevant results
- ✅ Better user experience

## Technical Implementation

**File:** `/backend/src/services/filters/activityFilters.ts`

**Key Logic:**
```typescript
if (preset.maxMinutes) {
  // Bounded ranges: simple check
  clauses.push(`duration_max <= $${maxMinutes}`);
} else {
  // Open-ended ranges: smart check
  clauses.push(`(
    category IN ('adventure', 'nature', 'sports', ...) -- Flexible
    OR
    (category NOT IN ('learning', 'creative', 'culture') 
     AND NOT ('requirement:lesson-recommended' = ANY(tags))) -- No structure
    OR
    (duration_max >= ${minMinutes}) -- Long enough
  )`);
}
```

## Testing

### Test Case 1: Mountain Biking + Full Day
```bash
curl -X POST http://localhost:3000/api/chat/message \
  -d '{"message":"mountain biking","filters":{"durationRange":"full-day"}}'
```

**Expected:** ✅ Shows mountain biking activities (2-4h duration)

### Test Case 2: Pottery + Full Day
```bash
curl -X POST http://localhost:3000/api/chat/message \
  -d '{"message":"pottery","filters":{"durationRange":"full-day"}}'
```

**Expected:** ❌ Filters out short pottery classes, shows only full-day workshops

### Test Case 3: Hiking + Short
```bash
curl -X POST http://localhost:3000/api/chat/message \
  -d '{"message":"hiking","filters":{"durationRange":"short"}}'
```

**Expected:** ❌ Filters out long hikes (4h+), shows only quick trails

## Summary

**The system is now intelligent:**
- ✅ Understands which activities are time-flexible
- ✅ Relaxed filtering for adventure/nature/sports
- ✅ Strict filtering for classes/workshops
- ✅ Context-aware based on category and tags
- ✅ Better results for users

**Mountain biking + Full Day now works perfectly!** 🚵‍♂️
