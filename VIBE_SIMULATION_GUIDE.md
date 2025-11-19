# Vibe Simulation Test Suite 🧪

## Overview

Automated testing system that runs **1000+ diverse vibes** through the recommendation engine to identify semantic understanding issues and category mismatches.

---

## What It Tests

### 1. **Direct & Specific Queries** (High Confidence)
- "I want to play football"
- "I want to do pottery"
- "I want wine tasting"
- **Expected:** Exact category match, high relevance

### 2. **Obscure & Vague Queries** (Requires Interpretation)
- "I'm bored"
- "I'm feeling lonely"
- "It's raining outside"
- **Expected:** Contextual understanding, mood-based recommendations

### 3. **Compound & Complex Queries** (Multiple Requirements)
- "I want outdoor adventure but I'm a beginner"
- "I want culture but something quick"
- **Expected:** Multiple filters applied correctly

### 4. **Edge Cases** (Tricky Scenarios)
- "I don't know what I want"
- "I want the opposite of what I usually do"
- **Expected:** Graceful handling, diverse suggestions

---

## Test Categories

### Sports (20 vibes)
- Football, basketball, tennis, rock climbing, mountain biking, etc.

### Creative (20 vibes)
- Painting, pottery, photography, cooking, calligraphy, etc.

### Food & Culinary (20 vibes)
- Wine tasting, coffee, baking, craft beer, food tours, etc.

### Culture (20 vibes)
- Museums, art, historical sites, walking tours, architecture, etc.

### Nature (20 vibes)
- Mountains, parks, wildlife, forests, waterfalls, beaches, etc.

### Wellness (20 vibes)
- Spa, massage, yoga, meditation, relaxation, thermal baths, etc.

### Nightlife (20 vibes)
- Clubbing, bars, live music, dancing, cocktails, rooftop bars, etc.

### Learning (20 vibes)
- Reading, workshops, studying, libraries, skills, classes, etc.

### Emotional States (30 vibes)
- Bored, lonely, stressed, adventurous, romantic, creative, etc.

### Contextual (30 vibes)
- Raining, 2 hours free, with partner, alone, with friends, etc.

### Abstract (30 vibes)
- Something different, surprise me, unique, local, authentic, etc.

### Mood-Based (30 vibes)
- Cozy, accomplished, connected, free, challenged, pampered, etc.

### Compound Requirements (30 vibes)
- Multiple filters, time constraints, weather conditions, etc.

### Edge Cases (30 vibes)
- Ambiguous, contradictory, or unusual requests

### Additional Dimensions:
- Seasonal (20)
- Energy levels (20)
- Group dynamics (20)
- Price sensitivity (20)
- Distance/location (20)
- Skill level (20)
- Duration (20)

**Total: 1000+ test vibes**

---

## What It Detects

### 1. **Category Mismatches**
```
Vibe: "I want to read"
Expected: [learning, creative]
Got: [learning, culinary]  ❌ MISMATCH
```

### 2. **Duplicate Activities**
```
Vibe: "I want to learn"
Activities: [
  "Intro to Programming",
  "Intro to Programming",  ❌ DUPLICATE
  "Photography Class"
]
```

### 3. **No Results**
```
Vibe: "I want underwater basket weaving"
Activities: []  ❌ NO_RESULTS
```

### 4. **Irrelevant Results**
```
Vibe: "I want sports"
Activities: [
  "Wine Tasting",  ❌ IRRELEVANT
  "Museum Visit",  ❌ IRRELEVANT
  "Spa Day"  ❌ IRRELEVANT
]
```

### 5. **Low Relevance Score**
- Calculated based on category match, duplicates, and result quality
- Score: 0-100 (60+ = pass)

---

## Running the Simulation

### Command:
```bash
cd /Users/aai/CascadeProjects/vibe-app/backend
npx tsx scripts/vibe-simulation-test.ts
```

### What Happens:
1. ✅ Tests all 1000+ vibes sequentially
2. ✅ Records results, issues, and execution time
3. ✅ Generates comprehensive report
4. ✅ Identifies worst performers
5. ✅ Calculates category accuracy
6. ✅ Saves detailed JSON report

### Execution Time:
- ~100ms per vibe
- Total: ~2-3 minutes for 1000 vibes

---

## Report Output

### Console Output:
```
📊 VIBE SIMULATION REPORT
================================================================================

📈 OVERALL STATISTICS:
   Total Tests: 1000
   Successful: 847 (84.7%)
   Failed: 153 (15.3%)
   Avg Execution Time: 127ms

🎯 BY SPECIFICITY:
   DIRECT: 782/850 (92.0%)
   OBSCURE: 45/90 (50.0%)
   COMPOUND: 15/40 (37.5%)
   EDGE_CASE: 5/20 (25.0%)

📂 CATEGORY ACCURACY (Worst Performers):
   obscure_abstract: 35.2% (11/31)
   edge_cases: 25.0% (5/20)
   compound_requirements: 37.5% (15/40)
   obscure_emotional: 48.3% (14/29)
   obscure_contextual: 53.3% (16/30)

⚠️  COMMON ISSUES:
   CATEGORY_MISMATCH: 127 occurrences (12.7%)
   DUPLICATE_ACTIVITIES: 18 occurrences (1.8%)
   NO_RESULTS: 8 occurrences (0.8%)

❌ WORST PERFORMERS (Bottom 20):
   1. "I don't know what I want"
      Score: 0/100 | Issues: NO_RESULTS
      Expected: [] | Got: []
   
   2. "I want to read"
      Score: 20/100 | Issues: CATEGORY_MISMATCH, DUPLICATE_ACTIVITIES
      Expected: [learning, creative] | Got: [learning, culinary]
   
   3. "I'm bored"
      Score: 40/100 | Issues: CATEGORY_MISMATCH
      Expected: [] | Got: [nightlife, nightlife, nightlife, sports, social]
   
   ...
```

### JSON Report:
Saved to `/backend/reports/vibe-simulation-report-[timestamp].json`

```json
{
  "metadata": {
    "timestamp": "2025-11-03T17:30:00.000Z",
    "total_tests": 1000,
    "success_rate": "84.70%"
  },
  "summary": {
    "total_tests": 1000,
    "successful": 847,
    "failed": 153,
    "by_category": { ... },
    "by_specificity": { ... },
    "common_issues": { ... },
    "worst_performers": [ ... ],
    "category_accuracy": { ... }
  },
  "detailed_results": [
    {
      "vibe": "I want to read",
      "category": "direct_learning",
      "specificity": "direct",
      "activities": [ ... ],
      "success": false,
      "issues": ["CATEGORY_MISMATCH", "DUPLICATE_ACTIVITIES"],
      "relevanceScore": 20,
      "categories_returned": ["learning", "culinary"],
      "expected_categories": ["learning", "creative"],
      "execution_time": 145
    },
    ...
  ]
}
```

---

## Interpreting Results

### Success Rate by Specificity:
- **Direct (90%+):** ✅ Good - System understands explicit requests
- **Obscure (50-70%):** ⚠️ Needs work - Improve contextual understanding
- **Compound (<50%):** ❌ Poor - Multi-filter logic needs improvement
- **Edge Cases (<30%):** ❌ Poor - Graceful degradation needed

### Category Accuracy:
- **>80%:** ✅ Excellent semantic understanding
- **60-80%:** ⚠️ Good but needs refinement
- **40-60%:** ⚠️ Moderate issues, review mappings
- **<40%:** ❌ Major semantic problems, urgent fix needed

### Common Issues:
- **CATEGORY_MISMATCH (>10%):** Semantic analyzer needs better mappings
- **DUPLICATE_ACTIVITIES (>5%):** Deduplication logic failing
- **NO_RESULTS (>5%):** Database gaps or overly strict filtering
- **ERROR (>1%):** Technical issues, check logs

---

## Fixing Issues

### 1. Category Mismatches
**Problem:** "I want to read" returns culinary activities

**Fix:**
```typescript
// In semanticVibeAnalyzer.ts or mcpClaudeRecommender.ts
"I want to read" → {
  categories: ["learning", "creative"],
  keywords: ["bookstore", "library", "reading"]
}
```

### 2. Duplicate Activities
**Problem:** Same activity appears multiple times

**Fix:**
```typescript
// In mcpClaudeRecommender.ts
const uniqueActivities = Array.from(
  new Map(activities.map(a => [a.id, a])).values()
);
```

### 3. No Results
**Problem:** No activities found for valid query

**Fix:**
- Add more activities to database
- Broaden tag matching
- Improve fallback logic

### 4. Low Relevance
**Problem:** Results don't match user intent

**Fix:**
- Improve semantic analysis
- Add more specific keywords
- Refine category mappings

---

## Continuous Improvement

### After Each Fix:
1. Run simulation again
2. Compare success rates
3. Check if specific issues decreased
4. Verify no regressions

### Track Progress:
```bash
# Run simulation
npx tsx scripts/vibe-simulation-test.ts > results-v1.txt

# Make fixes
# ...

# Run again
npx tsx scripts/vibe-simulation-test.ts > results-v2.txt

# Compare
diff results-v1.txt results-v2.txt
```

### Goal:
- **Overall Success Rate:** >90%
- **Direct Queries:** >95%
- **Obscure Queries:** >75%
- **Compound Queries:** >70%
- **Edge Cases:** >50%

---

## Adding New Test Vibes

Edit `/backend/scripts/vibe-simulation-test.ts`:

```typescript
const TEST_VIBES = {
  // Add new category
  my_new_category: [
    "test vibe 1",
    "test vibe 2",
    "test vibe 3"
  ],
  
  // Or add to existing
  direct_sports: [
    ...existing,
    "I want to play pickleball"  // New
  ]
};
```

---

## Benefits

✅ **Automated Quality Assurance** - Catch issues before users do
✅ **Comprehensive Coverage** - Tests 1000+ scenarios
✅ **Quantifiable Metrics** - Track improvement over time
✅ **Identifies Patterns** - See which categories struggle
✅ **Saves Time** - No manual testing needed
✅ **Regression Prevention** - Ensure fixes don't break other queries
✅ **Data-Driven Decisions** - Know exactly where to focus efforts

---

## Next Steps

1. **Run initial simulation** to establish baseline
2. **Identify top 10 worst performers**
3. **Fix semantic mappings** for those vibes
4. **Run simulation again** to verify improvements
5. **Repeat** until success rate >90%
6. **Add new test vibes** as edge cases are discovered
7. **Run regularly** (e.g., before each release)

---

**The simulation is your quality assurance system for semantic understanding!** 🧪✨
