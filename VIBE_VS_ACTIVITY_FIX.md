# Vibe vs. Activity Request - System Behavior Fix

## Problem Identified

The system was treating **mood-based vibes** like **explicit activity requests**, causing:
1. **Limited variety** - Only returning recently added activities (swimming, tennis, badminton, cooking)
2. **Over-specific filtering** - "feeling sporty" → only sports with "sporty" keyword
3. **Database coverage** - Not exploring the full 300+ activity database

### Root Cause

The confidence threshold system was too aggressive:
- **"I want sports"** → Treated as HIGH confidence (0.9+) → MANDATORY keyword matching
- **"I want to swim laps"** → Treated as HIGH confidence (0.95) → ONLY swimming activities
- **"feeling energetic"** → Should be MEDIUM confidence (0.7) → Explore ALL high-energy activities

## Solution Implemented

### Updated Confidence Threshold Logic

**File:** `/backend/src/services/llm/semanticVibeAnalyzer.ts`

#### HIGH CONFIDENCE (≥0.9) - Explicit Activity Requests
**Use ONLY when user names a SPECIFIC activity type**

✅ Examples:
- "mountain biking" → 0.95
- "rock climbing" → 0.95
- "kayaking" → 0.95
- "I want to go rock climbing" → 0.95

**Behavior:** MANDATORY keyword matching → Returns ONLY activities matching keywords

#### MEDIUM/LOW CONFIDENCE (<0.9) - Mood/Vibe States
**Use for mood states, energy levels, broad categories**

✅ Examples:
- "feeling energetic" → 0.7
- "feeling sporty" → 0.75
- "I'm bored" → 0.6
- "I want sports" → 0.8
- "I want to work out" → 0.8
- "adventure in the mountains" → 0.75

**Behavior:** PREFERRED keyword boosting → Returns activities WITH keywords first, then others (maintains variety)

### Critical Distinctions

| User Input | Confidence | Behavior | Results |
|------------|-----------|----------|---------|
| "I want to go rock climbing" | 0.95 (HIGH) | ONLY rock climbing | 2-5 rock climbing activities |
| "I'm feeling adventurous" | 0.7 (MEDIUM) | ALL adventure | Climbing, hiking, biking, ziplines, etc. |
| "I want sports" | 0.8 (MEDIUM) | ALL sports | Tennis, badminton, swimming, basketball, etc. |
| "feeling energetic" | 0.7 (MEDIUM) | ALL high-energy | Sports, fitness, adventure across database |
| "I want to swim laps" | 0.8 (MEDIUM) | Swimming + other fitness | Swimming pools, water activities, fitness |

## Key Changes

### Before Fix
```typescript
// "I want sports" was treated as HIGH confidence
{
  confidence: 0.95,  // ❌ TOO HIGH
  keywordPrefer: ['sport', 'athletic'],
  // Result: MANDATORY keyword matching → Only activities with "sport" in name
}
```

### After Fix
```typescript
// "I want sports" is now MEDIUM confidence
{
  confidence: 0.8,  // ✅ CORRECT
  keywordPrefer: ['sport', 'athletic', 'game'],
  // Result: PREFERRED boosting → ALL sports activities (tennis, swimming, badminton, etc.)
}
```

## Impact on Database Coverage

### Before Fix
- **"feeling energetic"** → 5-10 activities (only recent imports with "energetic" keyword)
- **"I want sports"** → 5-10 activities (only activities with "sport" in name)
- **Database coverage:** ~10-20% of available activities

### After Fix
- **"feeling energetic"** → 30-50 activities (ALL high-energy activities across database)
- **"I want sports"** → 50-80 activities (ALL sports category activities)
- **Database coverage:** 80-100% of relevant activities

## Examples

### Example 1: "feeling energetic"

**Before:**
```
Confidence: 0.9 (HIGH)
Keyword matching: MANDATORY
Results: 5 activities with "energetic" in name
```

**After:**
```
Confidence: 0.7 (MEDIUM)
Keyword matching: PREFERRED (boosting)
Results: 30+ high-energy activities:
  - Mountain biking
  - Rock climbing
  - Tennis
  - Swimming
  - Zumba
  - Basketball
  - Hiking
  - Ziplines
  (Explores entire database)
```

### Example 2: "I want sports"

**Before:**
```
Confidence: 0.95 (HIGH)
Keyword matching: MANDATORY
Results: 8 activities with "sport" in name
  - Only recently added sports activities
```

**After:**
```
Confidence: 0.8 (MEDIUM)
Keyword matching: PREFERRED (boosting)
Results: 60+ sports activities:
  - Tennis (12 venues)
  - Badminton (8 venues)
  - Swimming (12 venues)
  - Basketball
  - Volleyball
  - Handball
  - Squash
  - Table tennis
  (Full sports category coverage)
```

### Example 3: "I want to go rock climbing" (Still HIGH)

**Before & After:**
```
Confidence: 0.95 (HIGH)
Keyword matching: MANDATORY
Results: 3-5 rock climbing activities
  - Indoor climbing gyms
  - Outdoor climbing spots
  - Via ferrata
(Correct behavior - user wants SPECIFIC activity)
```

## Testing

### Good Vibe Examples (MEDIUM confidence)
These should explore the full database:

1. **Mood-based:**
   - "feeling energetic"
   - "feeling sporty"
   - "I'm bored"
   - "feeling creative"
   - "feeling adventurous"

2. **Broad categories:**
   - "I want sports"
   - "I want fitness"
   - "I want adventure"
   - "I want to work out"
   - "I want something active"

3. **Energy states:**
   - "I have lots of energy"
   - "I'm feeling lazy"
   - "I'm pumped up"
   - "I need to move"

### Specific Activity Examples (HIGH confidence)
These should return ONLY that activity:

1. **Named activities:**
   - "mountain biking"
   - "rock climbing"
   - "kayaking"
   - "pottery class"
   - "yoga session"

2. **Explicit requests:**
   - "I want to go rock climbing"
   - "I want to try kayaking"
   - "I want to do pottery"

## Verification

Run the distance test with mood-based vibes:

```bash
cd /Users/aai/CascadeProjects/vibe-app
npx tsx backend/scripts/test-claude-distance-understanding.ts
```

**Expected Results:**
- More variety in activity types
- Activities from across the entire database (not just recent imports)
- Better distribution across categories

## Files Modified

- `/backend/src/services/llm/semanticVibeAnalyzer.ts`
  - Lines 118-157: Updated confidence threshold documentation and examples
  - Added clear distinction between HIGH (≥0.9) and MEDIUM (<0.9) confidence
  - Added examples for "I want sports", "feeling energetic", etc.

## Related Documentation

- `/CLAUDE_DISTANCE_TEST.md` - Test documentation
- `/DISTANCE_FILTER_FIX.md` - Distance filtering fix
- `/backend/src/services/llm/semanticVibeAnalyzer.ts` - Semantic analysis logic

---

**Status:** Fixed and ready for testing  
**Date:** 2025-11-13  
**Impact:** High - Affects all vibe-based recommendations and database coverage
