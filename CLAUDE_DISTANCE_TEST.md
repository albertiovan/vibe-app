# Claude API Distance Understanding Test

## Overview

Comprehensive test suite that validates Claude's ability to correctly respect distance filters across 50 different vibe queries.

## Test Configuration

**User Location:** Strada Herăstrău nr. 20, București  
**Coordinates:** 44.4676, 26.0857 (near Herăstrău Park)

## Test Structure

### 50 Vibe Queries Across 5 Distance Categories

| Category | Distance Limit | Test Count | Example Vibes |
|----------|---------------|------------|---------------|
| **Nearby** | 5km | 10 | "I want to grab coffee nearby", "Looking for a quick workout close by" |
| **Walking** | 2km | 10 | "I want to walk to a café", "Need a bookstore I can walk to" |
| **Biking** | 10km | 10 | "I want to bike to a coffee shop", "Looking for a gym I can bike to" |
| **In City** | 25km | 10 | "I want to explore cafés in Bucharest", "Looking for the best gyms in the city" |
| **Anywhere** | No limit | 10 | "I want to try the best coffee in Romania", "Looking for premium fitness facilities" |

## Running the Test

```bash
cd /Users/aai/CascadeProjects/vibe-app
npx tsx backend/scripts/test-claude-distance-understanding.ts
```

**Estimated Duration:** ~1 minute (50 queries with 1s delay between each)

## What It Tests

### 1. Distance Filter Compliance
- Verifies Claude returns only activities within specified distance
- Identifies violations where activities exceed distance limit
- Calculates violation percentage per filter type

### 2. Activity Distribution
- Measures average distance of returned activities
- Analyzes distance distribution across all queries
- Compares expected vs actual distance ranges

### 3. Query Understanding
- Tests natural language distance expressions:
  - "nearby" → 5km
  - "walking distance" → 2km
  - "biking distance" → 10km
  - "in the city" → 25km
  - "anywhere" → no limit

### 4. Consistency
- Validates consistent behavior across similar queries
- Checks if distance filter works regardless of vibe content
- Measures success rate per distance category

## Expected Results

### Perfect Scenario (100% Pass Rate)
```
Total Tests: 50
✅ Passed: 50 (100.0%)
❌ Failed: 0 (0.0%)

NEARBY (5km limit):
  Tests: 10 | Passed: 10 | Failed: 0
  Avg distance: 2.5km

WALKING (2km limit):
  Tests: 10 | Passed: 10 | Failed: 0
  Avg distance: 1.2km

BIKING (10km limit):
  Tests: 10 | Passed: 10 | Failed: 0
  Avg distance: 5.8km

IN_CITY (25km limit):
  Tests: 10 | Passed: 10 | Failed: 0
  Avg distance: 12.3km

ANYWHERE (No limit):
  Tests: 10 | Passed: 10 | Failed: 0
  Avg distance: 45.7km
```

### Acceptable Scenario (>90% Pass Rate)
- Minor violations due to edge cases
- Activities just slightly over limit (e.g., 5.2km for 5km filter)
- Rare failures in specific vibe categories

### Problem Scenario (<90% Pass Rate)
- Systematic violations across multiple categories
- Large distance overruns (e.g., 15km for 5km filter)
- Indicates system prompt or filter implementation issues

## Output Format

### Per-Query Results
```
1. "I want to grab coffee and relax nearby"
   Filter: 5km
   ✅ Returned: 5 activities
   📊 Distances: avg 2.34km, max 4.87km
   ✅ All activities within 5km limit
```

### Violation Report (if any)
```
⚠️  DETAILED VIOLATIONS REPORT

Vibe: "I want to swim laps somewhere nearby"
Filter: nearby (5km limit)
Violations: 2
  - Olympic Lanes at Complex Sportiv Otopeni: 15.23km (10.23km over)
  - Coastal Training at World Class Constanța: 185.45km (180.45km over)
```

### Distance Distribution
```
DISTANCE DISTRIBUTION ANALYSIS

All activities returned across all tests:
  0-2km     :   45 activities (18.0%)
  2-5km     :   78 activities (31.2%)
  5-10km    :   62 activities (24.8%)
  10-25km   :   48 activities (19.2%)
  25-50km   :   12 activities (4.8%)
  50km+     :    5 activities (2.0%)
```

## Troubleshooting

### High Failure Rate

**Possible Causes:**
1. System prompt doesn't emphasize distance filtering
2. MCP query doesn't include distance constraint
3. Database coordinates are incorrect
4. Haversine calculation has bugs

**Actions:**
- Review system prompt in `mcpClaudeRecommender.ts`
- Check MCP query construction
- Verify venue coordinates with `test-distance-filtering.ts`
- Test Haversine formula with known coordinates

### No Activities Returned

**Possible Causes:**
1. Distance filter too restrictive
2. No activities in database for that category
3. Claude misunderstood the vibe

**Actions:**
- Check database has activities in distance range
- Try broader vibes
- Review Claude's interpretation in logs

### Inconsistent Results

**Possible Causes:**
1. Claude API variability
2. Database state changing during test
3. Race conditions in parallel queries

**Actions:**
- Run test multiple times
- Check for concurrent imports
- Increase delay between queries

## Integration with Other Tests

### Prerequisite Tests
1. ✅ `test-distance-filtering.ts` - Validates database coordinates
2. ✅ `check-imported-activities.ts` - Confirms activities exist

### Follow-up Tests
1. ⏳ Mobile app distance filter integration
2. ⏳ User location accuracy testing
3. ⏳ Real-world usage validation

## Success Criteria

| Metric | Target | Critical |
|--------|--------|----------|
| Overall Pass Rate | >95% | >85% |
| Nearby (5km) Pass Rate | >98% | >90% |
| Walking (2km) Pass Rate | >98% | >90% |
| Biking (10km) Pass Rate | >95% | >85% |
| In City (25km) Pass Rate | >95% | >85% |
| Anywhere Pass Rate | 100% | 100% |

## Files

- **Test Script:** `/backend/scripts/test-claude-distance-understanding.ts`
- **Documentation:** `/CLAUDE_DISTANCE_TEST.md` (this file)
- **Related:** `/backend/src/services/llm/mcpClaudeRecommender.ts`
- **Filters:** `/backend/src/services/filters/activityFilters.ts`

## Next Steps After Running

1. **Review Results** - Check pass rate and violations
2. **Analyze Patterns** - Look for systematic failures
3. **Update System Prompt** - If needed, refine distance instructions
4. **Iterate** - Re-run test after changes
5. **Document** - Record findings and improvements

---

**Status:** Ready to run  
**Last Updated:** 2025-11-13  
**Purpose:** Validate Claude API distance filter compliance
