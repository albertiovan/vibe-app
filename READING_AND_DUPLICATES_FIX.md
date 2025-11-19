# Fix: Reading Activities & Duplicate Prevention

## Issues Found:

1. **"I want to read" returns programming/cooking** - Semantic analyzer doesn't map reading to bookstore/library
2. **Duplicate activities** - Same activity appearing multiple times in results
3. **No website button** - Website field not showing on cards

## Solutions:

### 1. Add Reading Semantic Mapping

Add to semantic analyzer prompt:
```
READING & BOOKS:
- "I want to read" → category:creative, keywords:["bookstore", "library", "reading"]
- "book shopping" → category:creative, keywords:["bookstore", "book"]
- "quiet reading space" → category:creative, mood:contemplative, keywords:["library", "bookstore", "cafe"]
```

### 2. Add Deduplication

In `mcpClaudeRecommender.ts`, add unique ID filtering:
```typescript
// Remove duplicates by activity ID
const uniqueActivities = Array.from(
  new Map(activities.map(a => [a.id, a])).values()
);
```

### 3. Ensure Website Field

The website column was just added in migration 007. Make sure it's included in SELECT queries.

## Quick Fix Commands:

```bash
# 1. Run website migration (if not done)
cd /Users/aai/CascadeProjects/vibe-app/backend
npx tsx scripts/run-website-migration.ts

# 2. Restart backend
npm run dev
```

## Files to Update:

1. `/backend/src/services/llm/semanticVibeAnalyzer.ts` - Add reading mappings
2. `/backend/src/services/llm/mcpClaudeRecommender.ts` - Add deduplication
3. `/ui/blocks/ActivitySuggestionCard.tsx` - Ensure website button shows
