# Energy Variety in Recommendations

## Overview

Implemented **gentle energy variety** in regular recommendations to push users slightly outside their comfort zone, even when they onboard with "chill" or "low energy" preferences.

## Problem Solved

Previously, if a user indicated they preferred "low energy" or "chill vibes" during onboarding:
- They would only get low-energy recommendations
- No variety or gentle challenges
- Risk of being stuck in an echo chamber

Now, we balance their preference with gentle exploration:
- **60% match** their stated preference
- **40% stretch** to gently push boundaries
- Less aggressive than Challenge Me, but still encouraging growth

## How It Works

### Energy Level Mapping
```typescript
low energy    = 1
medium energy = 2
high energy   = 3
```

### Target Distribution (for 5 activities)

**If user prefers LOW energy:**
- 3 activities: Low energy (60% - matches preference)
- 2 activities: Medium/High energy (40% - gentle stretch)
  - Prioritizes Medium first (gentle, 1 level up)
  - Then High if needed (bigger stretch, 2 levels up)

**If user prefers MEDIUM energy:**
- 3 activities: Medium energy (60% - matches preference)
- 2 activities: Low/High energy (40% - explore both directions)
  - Balanced mix of lower and higher energy

**If user prefers HIGH energy:**
- 3 activities: High energy (60% - matches preference)
- 2 activities: Low/Medium energy (40% - balance)
  - Prioritizes Medium first (gentle, 1 level down)
  - Then Low if needed

### Selection Algorithm

1. **Categorize activities:**
   - `matchingEnergy`: Activities that match user's stated preference
   - `gentleStretch`: Activities 1 energy level away (gentle push)
   - `extremeStretch`: Activities 2 energy levels away

2. **Fill matching energy slots (60%):**
   - Pick from activities matching user's preference
   - Ensure category diversity

3. **Add gentle stretch (40%):**
   - Prefer activities that are only 1 energy level different
   - Example: If user wants "low", prefer "medium" over "high"
   - This is the gentle push

4. **Log final distribution:**
   - Shows how many of each energy level were selected
   - Helps verify variety is working

## Example Scenarios

### Scenario 1: Chill User
**User Onboarding:**
- Name: "Sarah"
- Energy: Low
- Interests: Wellness, Nature, Culinary

**Recommendations (5 total):**
1. 🧘 Spa Day - Low energy ✓
2. 🌳 Park Walk - Low energy ✓
3. ☕ Coffee Tasting - Low energy ✓
4. 🎨 Pottery Workshop - Medium energy (gentle stretch)
5. 🚴 Bike Tour - High energy (stretch)

**Result:** User gets mostly chill activities but is gently exposed to more active options.

### Scenario 2: High Energy User
**User Onboarding:**
- Name: "Alex"
- Energy: High
- Interests: Adventure, Sports, Nature

**Recommendations (5 total):**
1. 🧗 Rock Climbing - High energy ✓
2. ⛰️ Mountain Hiking - High energy ✓
3. 🏄 Surfing - High energy ✓
4. 🚶 Nature Walk - Medium energy (gentle balance)
5. 🧘 Yoga Session - Low energy (stretch)

**Result:** User gets exciting activities but is encouraged to try calmer experiences too.

### Scenario 3: Medium Energy User
**User Onboarding:**
- Name: "Jordan"
- Energy: Medium
- Interests: Culture, Social, Learning

**Recommendations (5 total):**
1. 🏛️ Museum Tour - Medium energy ✓
2. 🎭 Theater Show - Medium energy ✓
3. 🍷 Wine Tasting - Medium energy ✓
4. 🚶 City Walk - Low energy (explore lower)
5. 🎪 Escape Room - High energy (explore higher)

**Result:** User gets balanced activities and explores both directions.

## Benefits

### For Users
- ✅ **Still respects their preference** (60% matching)
- ✅ **Gently challenges them** (40% variety)
- ✅ **Prevents comfort zone lock-in**
- ✅ **Encourages discovery**
- ✅ **Less aggressive than Challenge Me**

### For the App
- ✅ **More engagement** - Users try new things
- ✅ **Better retention** - Variety keeps it interesting
- ✅ **Personalized growth** - Adapts to user's starting point
- ✅ **Data collection** - Learn what stretches work

## Difference from Challenge Me

### Regular Recommendations (This Feature)
- **Goal:** Gentle variety within comfort zone
- **Ratio:** 60% match / 40% stretch
- **Stretch:** Prefer 1 energy level away
- **Use Case:** Every search, every time
- **Philosophy:** "Here's mostly what you like, plus some interesting options"

### Challenge Me
- **Goal:** Explicit discomfort zone exploration
- **Ratio:** 100% opposite/different
- **Stretch:** Intentionally opposite patterns
- **Use Case:** Opt-in feature when user wants to be challenged
- **Philosophy:** "Try something completely different from your usual"

## Implementation Details

### File Modified
- `/backend/src/services/llm/mcpClaudeRecommender.ts`
- Function: `selectDiverseActivities()`

### Changes Made
1. Added energy level mapping (low=1, medium=2, high=3)
2. Calculate 60/40 split for matching vs stretch
3. Categorize activities by energy relative to user preference
4. Prioritize gentle stretch (1 level away) over extreme (2 levels)
5. Log final energy distribution for debugging

### Console Output
```
⚡ User energy preference: low (1)
🎯 Target: 3 matching energy, 2 stretch activities
   Available: 15 matching energy, 20 stretch
   ✓ Added Spa Day (low energy, matches preference)
   ✓ Added Park Walk (low energy, matches preference)
   ✓ Added Coffee Tour (low energy, matches preference)
   ⚡ Added Pottery Class (medium energy, gentle stretch)
   ⚡ Added Bike Ride (high energy, variety)
✅ Selected 5 diverse activities with energy distribution: { low: 3, medium: 1, high: 1 }
```

## Future Enhancements

### Adaptive Stretching
- Track which stretch activities users actually try
- Gradually increase stretch percentage if they engage well
- Decrease if they always skip stretch activities

### User Feedback Loop
- If user consistently picks medium energy when they said low:
  - Update their profile to medium
  - Adjust future recommendations

### Contextual Stretching
- Weekend: More aggressive stretch (people try new things)
- Weekday: Less stretch (people stick to routine)
- With friends: More stretch (social encouragement)
- Solo: Match preference more

## Summary

✅ **Implemented gentle energy variety**
- 60% activities match user's stated energy preference
- 40% activities gently stretch outside comfort zone
- Prefers gradual steps (1 level) over extreme jumps
- Works for all energy levels: low, medium, high

🎯 **Goal achieved:**
Even "chill vibe" users now get exposed to slightly more energetic activities, without overwhelming them. This encourages exploration while respecting preferences!
