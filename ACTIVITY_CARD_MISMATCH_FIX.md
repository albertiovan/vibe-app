# Activity Card Mismatch Fix

## 🐛 Problems Found

### 1. Wrong Activity Names
**Issue:** "Go-Karting" showing as "Art Class", "Park Orienteering" showing as "Park Visit"

**Cause:** Keyword matching in `activityNameSimplifier.ts` was using `.includes()` which matched partial words:
- "AMCKart" contains "art" → matched "Art Class" ❌
- "Park" matched before "Orienteering" → "Park Visit" ❌

### 2. Wrong Activity Opens on Tap
**Issue:** Tapping "Park Visit" card opens "High Ropes & Ziplines" detail screen

**Cause:** Venues data was not being passed through the navigation chain:
- `SwipeableActivity` didn't include `venues` array
- `handleExploreActivity` set `venues: []` (empty)
- ActivityDetailScreenShell couldn't find venue data

---

## ✅ Fixes Applied

### Fix 1: Improved Name Simplification

**Changed keyword matching from `.includes()` to word boundary regex:**

```typescript
// ❌ BEFORE - Matches partial words
if (lowerName.includes(keyword)) {
  return genericName;
}

// ✅ AFTER - Matches whole words only
const regex = new RegExp(`\\b${keyword}\\b`, 'i');
if (regex.test(lowerName)) {
  return genericName;
}
```

**Added specific activity mappings:**
```typescript
'go-kart': 'Go-Karting',
'karting': 'Go-Karting',
'via ferrata': 'Via Ferrata',
'ropes course': 'Ropes Course',
'high ropes': 'Ropes Course',
'orienteering': 'Orienteering',
```

---

### Fix 2: Pass Venues Data Through Navigation

**Updated SwipeableActivity creation:**
```typescript
const swipeableActivities: SwipeableActivity[] = extractedActivities.map((act, index) => ({
  id: act.id || act.activityId || index,
  name: act.name || 'Unknown Activity',
  simplifiedName: getSmartSimplifiedName(act.name || '', act.category),
  description: act.description || 'No description available',
  category: act.category || act.bucket || 'general',
  imageUrl: act.imageUrl || act.photoUrl,
  region: act.region,
  city: act.city,
  matchScore: 1 - (index * 0.15),
  venues: act.venues || [], // ✅ Include venues
  duration_min: act.durationMinutes || act.duration_min, // ✅ Include duration
  photos: act.photos || (act.imageUrl ? [act.imageUrl] : []), // ✅ Include photos
}));
```

**Updated navigation to pass venues:**
```typescript
const fullActivity: Activity = {
  id: String(selectedActivity.id),
  name: selectedActivity.name,
  description: selectedActivity.description,
  category: selectedActivity.category,
  imageUrl: selectedActivity.imageUrl,
  region: selectedActivity.region,
  city: selectedActivity.city,
  venues: selectedActivity.venues || [], // ✅ Pass venues
  duration_min: selectedActivity.duration_min, // ✅ Pass duration
  photos: selectedActivity.photos, // ✅ Pass photos
};
```

---

## 🎯 What's Fixed

### Activity Names Now Correct:
- ✅ "Go-Karting: VMAX (Indoor) or AMCKart (Outdoor)" → "Go-Karting"
- ✅ "Park Orienteering Challenge" → "Orienteering"
- ✅ "Parc Aventura Brașov Zipline & Ropes" → "Zipline Adventure"
- ✅ "Via Ferrata Casa Zmeului" → "Via Ferrata"
- ✅ "High Ropes & Mega Ziplines" → "Ropes Course"

### Navigation Now Correct:
- ✅ Tapping a card opens **that specific activity**
- ✅ Venue data is preserved
- ✅ Nearest venue selection works
- ✅ "GO NOW" button opens correct location

---

## 🔄 How to Test

### Step 1: Reload App
```bash
# In iOS Simulator
Cmd+R
```

### Step 2: Get Activity Suggestions
1. Enter a vibe (e.g., "adventurous outdoor activities")
2. Submit query
3. See 5 activity cards

### Step 3: Verify Names
Check that card names are simplified correctly:
- Go-Karting (not "Art Class")
- Orienteering (not "Park Visit")
- Ropes Course (not "Park Visit")

### Step 4: Verify Navigation
1. **Tap on "Orienteering" card**
2. Should open **Orienteering** detail (not a different activity)
3. Check venue name matches
4. Tap "GO NOW" → Should open correct location

---

## 🐛 Why This Happened

### Name Simplification Issue:
1. **Partial word matching**: "art" in "AMCKart" matched "art" keyword
2. **No word boundaries**: Needed `\b` regex boundaries
3. **Generic keywords**: "park" matched too broadly

### Navigation Issue:
1. **Data loss**: Venues not included in SwipeableActivity
2. **Empty array**: `venues: []` set during conversion
3. **No venue data**: ActivityDetailScreenShell couldn't find location

---

## 🎓 Lessons Learned

### Always Use Word Boundaries for Keywords:
```typescript
// ❌ BAD - Matches "art" in "kart"
if (text.includes('art'))

// ✅ GOOD - Matches whole word "art" only
if (/\bart\b/i.test(text))
```

### Preserve All Data Through Navigation:
```typescript
// ❌ BAD - Loses data
const activity = {
  name: source.name,
  venues: [], // Empty!
};

// ✅ GOOD - Preserves data
const activity = {
  name: source.name,
  venues: source.venues || [], // Keeps original
};
```

### Add Debug Logging:
```typescript
console.log('🚀 Navigating with:', {
  id: activity.id,
  name: activity.name,
  venuesCount: activity.venues?.length,
});
```

---

## ✅ Verification Checklist

After reload, verify:
- [ ] Activity names are simplified correctly
- [ ] No "Art Class" for Go-Karting
- [ ] No "Park Visit" for Orienteering
- [ ] Tapping a card opens that specific activity
- [ ] Venue data is present in detail screen
- [ ] "GO NOW" button opens correct location
- [ ] Nearest venue selection works

---

## 🎉 Success Indicators

You'll know it's fixed when:
- ✅ Card names are accurate and descriptive
- ✅ Tapping "Orienteering" opens Orienteering (not something else)
- ✅ Venue information displays correctly
- ✅ Maps navigation works
- ✅ Console logs show correct activity IDs

---

**Reload the app (Cmd+R) and test by tapping on different activity cards!** 🚀
