# Filter Pipeline Overhaul - Fixing Brittleness

## Executive Summary

**Problem:** The filter pipeline is too strict, causing:
- 0 results for reasonable queries ("restaurant within walking distance")
- Wrong results due to catastrophic fallbacks (painting class for "gym")
- NaN/broken distance stats
- Content gaps masked by over-filtering

**Root Cause:** Treating soft constraints as hard requirements + no graceful degradation.

---

## Priority 1: Fix Distance Propagation (IMMEDIATE)

### Issue
```
📊 Distances: avg NaNkm, max -Infinitykm
📊 Distances: avg 0.94km, max 0.94km (for 5 different activities)
```

### Root Cause
`distanceKm` is lost after weather filtering/deduplication because:
1. Weather filter creates new arrays without preserving `distanceKm`
2. Test script calculates from `distances.length === 0`

### Fix

**File:** `/backend/scripts/test-claude-distance-understanding.ts`

```typescript
// BEFORE (Line 219-220)
const avgDistance = distances.reduce((a, b) => a + b, 0) / distances.length;
const maxDistanceFound = Math.max(...distances);

// AFTER
const avgDistance = distances.length > 0 
  ? distances.reduce((a, b) => a + b, 0) / distances.length 
  : 0;
const maxDistanceFound = distances.length > 0 
  ? Math.max(...distances) 
  : 0;

// Also fix the log message for ANYWHERE mode
if (maxDistance) {
  console.log(`   ✅ All activities within ${maxDistance}km limit`);
} else {
  console.log(`   ✅ No distance limit (ANYWHERE mode)`);
}
```

**File:** `/backend/src/services/llm/mcpClaudeRecommender.ts`

Ensure `distanceKm` is preserved through weather filtering (Line 616-620):

```typescript
// Weather filtering already preserves the activity object
// Just verify distanceKm is not being stripped
weatherFilteredActivities = [
  ...goodWeatherActivities,  // These keep all properties including distanceKm
  ...okWeatherActivities,
  ...badWeatherActivities
];
```

---

## Priority 2: Relax "HIGH SPECIFICITY" Threshold (IMMEDIATE)

### Issue
Too many queries trigger MANDATORY keyword filtering (confidence >= 0.9):
- "I want sports" → confidence 0.95 → ONLY activities with "sport" in name
- "Need a restaurant" → confidence 0.95 → ONLY activities with "restaurant" in name

### Fix

**File:** `/backend/src/services/llm/semanticVibeAnalyzer.ts`

Already updated, but need to verify Claude is actually using the new guidance. Add explicit examples:

```typescript
**CRITICAL: Broad category requests should be MEDIUM confidence**

❌ WRONG:
- "I want sports" → confidence: 0.95 (HIGH)
- "Need a restaurant" → confidence: 0.95 (HIGH)
- "Looking for a gym" → confidence: 0.95 (HIGH)

✅ CORRECT:
- "I want sports" → confidence: 0.75-0.80 (MEDIUM)
- "Need a restaurant" → confidence: 0.75-0.80 (MEDIUM)
- "Looking for a gym" → confidence: 0.75-0.80 (MEDIUM)

Only use HIGH (0.9+) for SPECIFIC activity types:
- "rock climbing" → 0.95
- "pottery class" → 0.95
- "kayaking" → 0.95
```

---

## Priority 3: Implement Graceful Degradation (HIGH)

### Issue
When filters produce 0 results, fallback is too aggressive and loses user intent.

### Current Flow
```
1. Semantic match (tags + categories)
2. MANDATORY keywords (if confidence >= 0.9)
3. Required tags (indoor_outdoor, mode_of_transport, etc.)
4. Distance filter
5. If 0 results → Fallback to "anything nearby"
```

### New Flow (Graceful Degradation)

```typescript
// STEP 1: Try full pipeline
let results = applyFullPipeline(activities, filters, analysis);

if (results.length === 0) {
  console.log('⚠️ No results with full filters, degrading gracefully...');
  
  // STEP 2: Drop rarely-populated tags
  const relaxedFilters = {
    ...filters,
    dropTags: ['mode_of_transport', 'location', 'requirement:lesson-recommended']
  };
  results = applyPipeline(activities, relaxedFilters, analysis);
}

if (results.length === 0) {
  console.log('⚠️ Still no results, demoting mandatory keywords to boosting...');
  
  // STEP 3: Demote MANDATORY keywords to PREFERRED
  const boostedAnalysis = {
    ...analysis,
    confidence: 0.75  // Force MEDIUM confidence
  };
  results = applyPipeline(activities, relaxedFilters, boostedAnalysis);
}

if (results.length < 3 && maxDistanceKm && maxDistanceKm < 10) {
  console.log(`⚠️ Only ${results.length} results within ${maxDistanceKm}km, expanding to ${maxDistanceKm * 1.5}km...`);
  
  // STEP 4: Expand radius by 50%
  const expandedFilters = {
    ...relaxedFilters,
    maxDistanceKm: maxDistanceKm * 1.5
  };
  results = applyPipeline(activities, expandedFilters, boostedAnalysis);
  
  // Mark results as "expanded radius"
  results.forEach(r => r._expandedRadius = true);
}

if (results.length === 0) {
  console.log('⚠️ No results after degradation, showing popular nearby activities...');
  
  // STEP 5: Last resort - popular nearby (but still respect distance)
  results = getPopularNearby(activities, filters.maxDistanceKm);
}
```

**Implementation Location:** `/backend/src/services/llm/mcpClaudeRecommender.ts` (after line 413)

---

## Priority 4: Fix Claude Error Fallback (HIGH)

### Issue
```
❌ Semantic analysis failed: InternalServerError: 529 ... overloaded
🧠 Semantic analysis: {
  intent: 'Looking for a gym I can bike to',
  categories: [ 'creative', 'nature' ],  // ❌ GARBAGE
  energy: 'medium',
  confidence: 0.5,
  keywordPrefer: []
}
```

### Fix

**File:** `/backend/src/services/llm/semanticVibeAnalyzer.ts`

```typescript
export async function analyzeVibeSemantically(vibe: string): Promise<SemanticVibeAnalysis> {
  try {
    const response = await anthropic.messages.create({...});
    return JSON.parse(response.content[0].text);
  } catch (error: any) {
    console.error('❌ Semantic analysis failed:', error.message);
    
    // Check if we should retry
    if (error.status === 529 || error.headers?.['x-should-retry'] === 'true') {
      console.log('🔄 Retrying semantic analysis...');
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      try {
        const response = await anthropic.messages.create({...});
        return JSON.parse(response.content[0].text);
      } catch (retryError) {
        console.error('❌ Retry failed, using local fallback');
      }
    }
    
    // LOCAL KEYWORD FALLBACK (not garbage)
    return localKeywordFallback(vibe);
  }
}

function localKeywordFallback(vibe: string): SemanticVibeAnalysis {
  const vibeLower = vibe.toLowerCase();
  
  // Keyword map for common intents
  const keywordMap: Record<string, Partial<SemanticVibeAnalysis>> = {
    'gym|workout|fitness|exercise': {
      suggestedCategories: ['fitness', 'sports'],
      energyLevel: 'high',
      preferredMoods: ['adrenaline'],
      keywordPrefer: ['gym', 'workout', 'fitness', 'exercise'],
      confidence: 0.7
    },
    'restaurant|food|dinner|lunch|eat': {
      suggestedCategories: ['culinary'],
      energyLevel: 'medium',
      preferredMoods: ['social'],
      keywordPrefer: ['restaurant', 'food', 'dining', 'meal'],
      confidence: 0.7
    },
    'coffee|café|cafe': {
      suggestedCategories: ['culinary', 'social'],
      energyLevel: 'low',
      preferredMoods: ['cozy', 'social'],
      keywordPrefer: ['coffee', 'café', 'cafe'],
      confidence: 0.7
    },
    'spa|massage|wellness|relax': {
      suggestedCategories: ['wellness', 'mindfulness'],
      energyLevel: 'low',
      preferredMoods: ['relaxed', 'cozy'],
      keywordPrefer: ['spa', 'massage', 'wellness'],
      confidence: 0.7
    },
    'pool|swim|swimming': {
      suggestedCategories: ['water', 'fitness'],
      energyLevel: 'medium',
      preferredMoods: ['adrenaline'],
      keywordPrefer: ['pool', 'swim', 'swimming', 'lap'],
      confidence: 0.7
    },
    'yoga|pilates': {
      suggestedCategories: ['wellness', 'fitness'],
      energyLevel: 'medium',
      preferredMoods: ['mindful', 'relaxed'],
      keywordPrefer: ['yoga', 'pilates'],
      confidence: 0.7
    },
    'book|bookstore|library|read': {
      suggestedCategories: ['culture', 'learning'],
      energyLevel: 'low',
      preferredMoods: ['mindful', 'cozy'],
      keywordPrefer: ['book', 'bookstore', 'library', 'reading'],
      confidence: 0.7
    },
    'market|shopping|shop|store': {
      suggestedCategories: ['shopping', 'culture'],
      energyLevel: 'medium',
      preferredMoods: ['explorer'],
      keywordPrefer: ['market', 'shopping', 'store'],
      confidence: 0.7
    }
  };
  
  // Find matching pattern
  for (const [pattern, config] of Object.entries(keywordMap)) {
    const regex = new RegExp(pattern, 'i');
    if (regex.test(vibeLower)) {
      return {
        primaryIntent: vibe,
        emotionalContext: 'Fallback analysis due to API error',
        underlyingNeeds: [],
        requiredTags: [],
        preferredTags: [],
        avoidTags: [],
        reasoning: 'Local keyword-based fallback (Claude API unavailable)',
        ...config
      } as SemanticVibeAnalysis;
    }
  }
  
  // Ultimate fallback - show popular nearby
  console.log('⚠️ No keyword match, using generic fallback');
  return {
    primaryIntent: vibe,
    emotionalContext: 'Generic fallback',
    underlyingNeeds: [],
    suggestedCategories: [],
    energyLevel: 'medium',
    preferredMoods: [],
    requiredTags: [],
    preferredTags: [],
    avoidTags: [],
    keywordPrefer: [],
    reasoning: 'Generic fallback - showing popular activities',
    confidence: 0.5
  };
}
```

---

## Priority 5: Drop Rarely-Populated Tags as Hard Requirements (MEDIUM)

### Issue
These tags don't exist in most activities, causing false "ACTIVITY GAP" warnings:
- `mode_of_transport:bicycle`
- `location:bucharest`
- `indoor_outdoor:both` (very narrow)
- `requirement:lesson-recommended`

### Fix

**File:** `/backend/src/services/llm/semanticVibeAnalyzer.ts`

Update the prompt to make these OPTIONAL:

```typescript
**TAG USAGE RULES:**

HARD REQUIREMENTS (must have):
- category:* (primary category)
- energy:* (if user specifies energy level)

SOFT PREFERENCES (boost ranking, don't filter):
- mood:*
- indoor_outdoor:* (except when explicitly requested)
- experience_level:*
- context:*
- equipment:*
- requirement:* (except when user explicitly asks for lessons)
- mode_of_transport:* (NEVER use as hard requirement)
- location:* (NEVER use as hard requirement)

EXAMPLE:
User: "Looking for a gym I can bike to"
WRONG: requiredTags: ['category:fitness', 'mode_of_transport:bicycle']
RIGHT: requiredTags: ['category:fitness'], preferredTags: ['mode_of_transport:bicycle']
```

---

## Priority 6: Content Gaps to Fill (MEDIUM-LONG TERM)

Based on test failures, add these activities around Herăstrău (2-5km radius):

### High Priority
1. **Bookstores/Libraries** (2-3 venues)
   - Carturesti, Humanitas, Anthony Frost
   - Tags: `category:culture`, `mood:mindful`, `indoor_outdoor:indoor`

2. **Restaurants** (5-10 venues)
   - Actual dining experiences, not just cooking classes
   - Tags: `category:culinary`, `keyword:restaurant`, `keyword:dining`

3. **Swimming Pools** (2-3 venues)
   - Olympic pools, lap swimming
   - Tags: `category:water`, `category:fitness`, `equipment:provided`

4. **Yoga/Pilates Studios** (2-3 venues)
   - Within 2km of Herăstrău
   - Tags: `category:wellness`, `category:fitness`, `requirement:lesson-recommended`

5. **Grocery/Markets** (2-3 venues)
   - Farmer's markets, local markets
   - Tags: `category:shopping`, `mood:explorer`

### Medium Priority
6. **Gyms** (3-5 venues)
   - Generic fitness centers
   - Tags: `category:fitness`, `indoor_outdoor:indoor`

7. **Badminton Courts** (2-3 venues)
   - Properly tagged with `indoor_outdoor:indoor`

8. **Shopping Areas** (2-3 venues)
   - Malls, shopping streets
   - Tags: `category:shopping`

---

## Implementation Priority

1. **IMMEDIATE (Today)**
   - Fix distance propagation (NaN issue)
   - Fix Claude error fallback (garbage categories)
   - Update semantic analyzer confidence examples

2. **HIGH (This Week)**
   - Implement graceful degradation pipeline
   - Drop rarely-populated tags as hard requirements
   - Add local keyword fallback map

3. **MEDIUM (Next Week)**
   - Add high-priority content (bookstores, restaurants, pools)
   - Retag existing culinary activities (distinguish restaurants vs classes)

4. **LONG TERM (Next Sprint)**
   - Add medium-priority content
   - Implement UI indicators for "expanded radius" results
   - Add user feedback loop for "no results" scenarios

---

## Success Metrics

### Before
- 50% test pass rate
- NaN/broken distance stats
- 0 results for common queries
- Wrong activities (painting for gym)

### After (Target)
- 95%+ test pass rate
- Clean distance stats
- <5% "0 results" scenarios
- Graceful degradation with clear UX messaging

---

**Status:** Action plan ready  
**Owner:** Implementation required  
**Impact:** Critical - affects all recommendations
