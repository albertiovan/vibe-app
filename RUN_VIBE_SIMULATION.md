# Run Vibe Simulation 🚀

## Quick Start

```bash
cd /Users/aai/CascadeProjects/vibe-app/backend
npx tsx scripts/vibe-simulation-test.ts
```

## What You'll See

```
🚀 Starting Vibe Simulation Test Suite
================================================================================
📊 Total test vibes: 1000

[1/1000] Testing: "I want to play football"
   ✓ 5 activities | sports, fitness | 145ms

[2/1000] Testing: "I want to read"
   ✓ 5 activities | learning, creative | 132ms
   ⚠️  Issues: CATEGORY_MISMATCH

[3/1000] Testing: "I'm bored"
   ✓ 5 activities | nightlife, social, creative | 156ms

...

================================================================================
📈 Generating Report...

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
      Expected: [] | Got: [nightlife, nightlife, nightlife]

...

✅ Simulation complete!
```

## Execution Time

- **Per vibe:** ~100-150ms
- **Total (1000 vibes):** ~2-3 minutes

## Report Location

Detailed JSON report saved to:
```
/backend/reports/vibe-simulation-report-[timestamp].json
```

## What to Look For

### 🔴 **Critical Issues (Fix First)**
- Success rate <80%
- Direct queries failing
- Common issues >10%
- Duplicate activities

### 🟡 **Medium Priority**
- Obscure queries <60%
- Category mismatches in specific areas
- Edge cases failing

### 🟢 **Nice to Have**
- Compound queries >70%
- Edge cases >50%
- Execution time <150ms

## After Running

1. **Review worst performers** - These need immediate attention
2. **Check category accuracy** - Which categories struggle most?
3. **Analyze common issues** - What's the most frequent problem?
4. **Fix semantic mappings** - Update mcpClaudeRecommender.ts
5. **Run again** - Verify improvements

## Example Fixes

### If "I want to read" fails:
```typescript
// In mcpClaudeRecommender.ts system prompt
"I want to read" → category:creative + keywords:["bookstore", "library"]
```

### If duplicates appear:
```typescript
// In mcpClaudeRecommender.ts
const uniqueActivities = Array.from(
  new Map(activities.map(a => [a.id, a])).values()
);
```

### If category mismatches are high:
- Review semantic analyzer
- Add more keyword mappings
- Improve tag-based filtering

## Success Criteria

✅ **Overall:** >90% success rate
✅ **Direct:** >95% success rate
✅ **Obscure:** >75% success rate
✅ **Duplicates:** <2% occurrence
✅ **Category Match:** >85% accuracy

---

**Run this after every major change to the recommendation engine!** 🧪
