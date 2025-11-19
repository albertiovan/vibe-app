# Cleanup: Remove Unused API Providers

## 🎯 **Goal**
Remove all unused external API provider code since the app now uses its own database.

**Keep:** Google Maps deep linking (for "GO NOW" button)
**Remove:** Google Places API, OpenTripMap, OpenStreetMap/Overpass providers

---

## 📋 **Files to Delete**

### **Provider Files:**
1. `/backend/src/providers/activities/opentripmap.ts`
2. `/backend/src/providers/trails/overpass.ts`
3. `/backend/dist/providers/` (entire compiled directory)

### **Mapping Files (if they exist):**
- Any `*-mapping.ts` files for Google Places, OSM, OpenTripMap

---

## 🔧 **Files to Modify**

### **1. Environment Configuration**
**File:** `/backend/src/config/env.ts`

**Remove:**
- `OPENTRIPMAP_API_KEY` validation
- `GOOGLE_PLACES_API_KEY` validation (if exists)
- Any OSM/Overpass API key checks

**Keep:**
- `CLAUDE_API_KEY`
- `DATABASE_URL`
- `NODE_ENV`
- `PORT`

---

### **2. Remove Provider References**
**Files to check:**
- `/backend/src/routes/activitiesSearch.ts`
- `/backend/src/services/orchestrator/activitiesAgent.ts`

**Remove:**
- Import statements for provider mappings
- `mappingHints` objects with `google`, `osm`, `otm`
- Any provider instantiation code

---

### **3. Type Definitions**
**File:** `/backend/src/types/trails.ts`

**Remove:**
- `OPENTRIPMAP_KINDS`
- `OVERPASS_QUERIES`
- Any provider-specific types

---

## ✅ **What to Keep**

### **Google Maps Deep Linking (Frontend)**
**Files:** 
- `/screens/ActivityDetailScreenShell.tsx`
- Any component with "GO NOW" button

**Keep this code:**
```typescript
// Google Maps deep linking
const mapsUrl = venue.mapsUrl || 
  `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;

// Deep link format for mobile
const deepLink = `comgooglemaps://?q=${name}&center=${lat},${lng}`;
```

**This is NOT an API call** - it's just opening Google Maps app/website with coordinates.

---

## 🔍 **Search & Replace Patterns**

### **Remove Import Statements:**
```typescript
// DELETE these lines:
import { GOOGLE_PLACES_MAPPING } from '...';
import { OSM_TAGS_MAPPING } from '...';
import { OPENTRIPMAP_MAPPING } from '...';
import { OpenTripMapProvider } from '...';
import { OverpassProvider } from '...';
```

### **Remove Mapping Hints:**
```typescript
// DELETE this object:
mappingHints: {
  google: GOOGLE_PLACES_MAPPING,
  osm: OSM_TAGS_MAPPING,
  otm: OPENTRIPMAP_MAPPING
}
```

---

## 📊 **Impact Analysis**

### **Before Cleanup:**
- 3 external API providers (unused)
- API key validations for services not used
- Mapping files for external providers
- Compiled provider code in dist/

### **After Cleanup:**
- 0 external API providers
- Only database queries
- Cleaner codebase
- Smaller bundle size
- Faster startup (no provider initialization)

---

## ⚠️ **Important Notes**

1. **Google Maps is NOT an API** - We're just creating URLs to open Google Maps. No API key needed.

2. **Database is the source** - All activity and venue data comes from PostgreSQL.

3. **Weather still works** - OpenMeteo (weather) is separate and still needed.

4. **No functionality loss** - These providers weren't being used anyway.

---

## 🧪 **Testing After Cleanup**

### **Test 1: Activity Recommendations**
```bash
# Search for activities
curl "http://localhost:3000/api/chat/message" \
  -H "Content-Type: application/json" \
  -d '{"conversationId": 1, "message": "adventure activities"}'
```
**Expected:** Returns activities from database (not external APIs)

### **Test 2: Google Maps Deep Link**
1. Open activity detail screen
2. Tap "GO NOW" button
3. **Expected:** Opens Google Maps with venue location

### **Test 3: No API Key Errors**
```bash
# Start backend
npm run dev
```
**Expected:** No warnings about missing OPENTRIPMAP_API_KEY or GOOGLE_PLACES_API_KEY

---

## 🚀 **Execution Steps**

1. ✅ Delete provider files
2. ✅ Remove API key validations from env.ts
3. ✅ Remove provider imports from routes
4. ✅ Remove mapping hints from agent
5. ✅ Remove provider types from trails.ts
6. ✅ Test recommendations still work
7. ✅ Test Google Maps deep linking works
8. ✅ Verify no console errors

---

**Ready to execute cleanup?** 🧹
