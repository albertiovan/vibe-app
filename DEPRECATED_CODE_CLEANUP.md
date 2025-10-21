# 🧹 Deprecated Code Cleanup - October 2025

## Overview

Removed all external API dependencies (YouTube, Google Places, Tavily, Wikipedia) in favor of the **Tag-First PostgreSQL MCP Architecture**.

---

## 🗑️ **Files Removed**

### External API Services
```
✅ src/services/media/youtube.ts
✅ src/services/enrichment/tavily.ts
✅ src/services/enrichment/wikipedia.ts
✅ src/services/enrichment/ (entire directory)
```

### Google Places Integration
```
✅ src/services/googlePlacesService.ts
✅ src/services/enhancedGooglePlacesService.ts
✅ src/services/placesOrchestrator.ts
✅ src/services/llm/vibeToPlacesMapper.ts
✅ src/services/activity/enrichment.ts
✅ src/services/orchestrator/mediaEnrichment.ts
✅ src/services/placeDetailsFetcher.ts (if exists)
✅ src/config/places.types.ts
✅ src/domain/activities/mapping/google-places-mapping.ts
✅ src/domain/activities/ontology/mappings/google_places.json
```

### API Routes
```
✅ src/routes/places.ts
✅ src/routes/mediaEnrichment.ts
```

### Configuration Files
```
✅ src/config/integrations.ts (YouTube/Tavily/Wikipedia config)
✅ docs/integrations/google-places.md
```

### Test Files
```
✅ scripts/test-media-enrichment.ts
```

### Build Artifacts
```
✅ dist/services/googlePlaces* (compiled JS)
```

---

## 📝 **Files Modified**

### src/server.ts
**Removed:**
- Import: `placesRoutes`
- Import: `mediaEnrichmentRoutes`
- Route: `app.use('/api/places', placesRoutes)`
- Route: `app.use('/api/enrichment', mediaEnrichmentRoutes)`

**Kept:**
- All other routes (vibe, llm, weather, mcp-vibe, etc.)
- MCP architecture endpoints

---

## 🔴 **Legacy Code Remaining** (For Review/Removal Later)

### Old Ontology System
These files are from the pre-PostgreSQL era with Google Places mappings:
```
⚠️ src/domain/activities/ontology/activities.json (22 activities with Google Places types)
⚠️ src/domain/activities/ontology/vibe_lexicon.json
⚠️ src/domain/activities/ontology/micro_vibes.json
⚠️ src/domain/activities/ontology/backups/ (8 backup files)
⚠️ src/domain/activities/ontology/proposals/ (9 proposal files)
⚠️ src/domain/activities/ontology/reports/ (2 coverage reports)
⚠️ src/domain/activities/ontology/snapshots/ (2 snapshot files)
⚠️ src/domain/activities/ontology/mappings/osm_tags.json
⚠️ src/domain/activities/ontology/mappings/otm_kinds.json
```

**Used by:**
- `src/services/ontology/semanticFallback.ts`
- `src/services/vibeDetection/enhancedVibeDetector.ts`

**Recommendation:** Migrate to PostgreSQL tag system, then remove.

### Old Service Files
These may still reference Google Places or external APIs:
```
⚠️ src/services/llm/realClaudeRecommender.ts
⚠️ src/services/vibe/improvedVibeMatcher.ts
⚠️ src/services/feasibility/feasibilityRanker.ts
⚠️ src/services/places/nearbyOrchestrator.ts
⚠️ src/services/places/challengeSelector.ts
⚠️ src/services/verification/recommendationVerifier.ts
⚠️ src/services/ontology/semanticFallback.ts
⚠️ src/services/vibeDetection/enhancedVibeDetector.ts
```

**Recommendation:** Review each file to determine if it's needed with the new MCP architecture.

---

## ✅ **New Architecture (Kept)**

### Tag-First PostgreSQL System
```
✅ backend/data/taxonomy.json
✅ backend/database/migrations/003_tags_and_maps.sql
✅ backend/src/taxonomy/taxonomy.ts
✅ backend/src/taxonomy/tagValidator.ts
✅ backend/src/taxonomy/inferFacets.ts
✅ backend/src/utils/mapsUrl.ts
✅ backend/src/services/database/tagQueries.ts
✅ backend/src/services/database/mcpDatabase.ts
✅ backend/src/services/llm/mcpClaudeRecommender.ts
✅ backend/src/routes/mcpVibe.ts
✅ backend/database/activities-seed.json
✅ backend/database/seed.ts
```

### Core Routes (Kept)
```
✅ /api/health
✅ /api/ping
✅ /api/vibe
✅ /api/llm
✅ /api/weather
✅ /api/mcp-vibe (PRIMARY ENDPOINT)
✅ /api/nearby
✅ /api/activities
✅ /api/autonomous
✅ /api/personalization
✅ /api/vibe-profile
```

---

## 📊 **Cleanup Impact**

### Code Reduction
- **~15+ service files removed**
- **~3+ route files removed**
- **~5+ config/type files removed**
- **~20+ JSON mapping files deprecated**

### Dependency Cleanup Needed
Check `package.json` for unused dependencies:
```json
{
  "@googlemaps/google-maps-services-js": "...",  // Can remove
  "youtube-api-client": "...",                    // Can remove (if exists)
  "tavily-api": "...",                            // Can remove (if exists)
}
```

### Environment Variables No Longer Needed
```bash
GOOGLE_MAPS_API_KEY=...      # Remove (replaced by curated PostgreSQL data)
YOUTUBE_API_KEY=...          # Remove
TAVILY_API_KEY=...           # Remove
ENABLE_YOUTUBE=...           # Remove
ENABLE_TAVILY=...            # Remove
ENABLE_WIKIPEDIA=...         # Remove
```

### Environment Variables Still Needed
```bash
DATABASE_URL=postgresql://localhost/vibe_app  # Required for MCP
CLAUDE_API_KEY=...                            # Required for recommendations
PORT=3000                                     # Required for server
NODE_ENV=development                          # Required for env
CORS_ORIGINS=...                              # Optional for CORS
```

---

## 🎯 **Next Steps**

### Phase 1: Immediate (Complete ✅)
- ✅ Remove external API service files
- ✅ Remove deprecated routes
- ✅ Update server.ts imports
- ✅ Clean up config files

### Phase 2: Review & Migrate (Next Session)
- ⏳ Review old service files for Google Places references
- ⏳ Migrate any useful logic to tag-based queries
- ⏳ Remove old ontology JSON files once fully migrated
- ⏳ Update package.json dependencies
- ⏳ Clean up .env files

### Phase 3: Final Cleanup
- ⏳ Remove `src/domain/activities/ontology` folder
- ⏳ Remove deprecated service files
- ⏳ Update all route handlers to use MCP exclusively
- ⏳ Remove old vibe detection services
- ⏳ Archive or delete backup/proposal folders

---

## 🚀 **Migration Path**

**Old Flow:**
```
User Vibe → Claude → Google Places API → External venues → Response
```

**New Flow:**
```
User Vibe → Tag Mapping → PostgreSQL Query (MCP) → Curated venues → Response
```

**Benefits:**
- ✅ No external API costs
- ✅ 100% deterministic prefiltering
- ✅ Offline-capable
- ✅ Complete data control
- ✅ Faster response times
- ✅ Easier to test and debug

---

## 📝 **Notes**

- All removed code is in git history if needed
- Frontend may still reference old enrichment endpoints - update mobile app
- Monitor logs for any 404s on removed endpoints
- PostgreSQL database is now the single source of truth

---

**Cleanup Date:** October 20, 2025  
**Completed By:** Cascade AI  
**Architecture:** Tag-First PostgreSQL MCP
