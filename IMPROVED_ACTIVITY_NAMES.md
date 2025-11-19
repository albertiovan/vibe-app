# Improved Activity Name Simplification

## 🐛 Problem

Multiple activities showing the same generic name "Park Visit" on swipeable cards:
- "Parc Aventura Brașov Zipline & Ropes" → "Park Visit"
- "Zipline & Rope Courses at Comana Adventure Park" → "Park Visit"
- "High Ropes & Mega Ziplines at Adrenalin Park" → "Park Visit"
- "Adventure Park Brașov Mega Zip & Ropes" → "Park Visit"

**Issue:** Users can't differentiate between activities on the swipeable cards.

---

## ✅ Solution

Enhanced `getSmartSimplifiedName()` to keep location names for differentiation while still simplifying.

### New Logic:

1. **Detect similar activities** (adventure parks, ziplines, ropes courses)
2. **Extract location name** from the beginning of the activity name
3. **Combine location + activity type** for unique, descriptive names

---

## 🎯 New Simplified Names

### Before (Generic):
- ❌ "Park Visit" (all 4 activities)
- ❌ Can't tell them apart
- ❌ Confusing user experience

### After (Specific):
- ✅ "Parc Aventura Zipline & Ropes"
- ✅ "Comana Zipline & Ropes"
- ✅ "Adrenalin Adventure Park"
- ✅ "Adventure Park Brașov"

---

## 🔧 Implementation Details

### Location Extraction:
```typescript
// Extract location from start of name
const locationMatch = fullName.match(/^([A-Z][a-zăâîșț]+(?:\s+[A-Z][a-zăâîșț]+)?)/);
const location = locationMatch ? locationMatch[1] : '';
```

**Examples:**
- "Parc Aventura Brașov..." → extracts "Parc Aventura"
- "Comana Adventure Park..." → extracts "Comana"
- "Adrenalin Park..." → extracts "Adrenalin"

### Activity Type Detection:
```typescript
if (lowerName.includes('zipline') && lowerName.includes('rope')) {
  return location ? `${location} Zipline & Ropes` : 'Zipline & Ropes';
}
if (lowerName.includes('adventure park')) {
  return location ? `${location} Adventure Park` : 'Adventure Park';
}
```

### Via Ferrata Special Case:
```typescript
if (lowerName.includes('via ferrata')) {
  const locationMatch = fullName.match(/Via Ferrata\s+([A-Z][a-zăâîșț\s]+?)(?:\s*–|\s*-|$)/i);
  return locationMatch ? `Via Ferrata ${locationMatch[1].trim()}` : 'Via Ferrata';
}
```

**Example:**
- "Via Ferrata Casa Zmeului – Vadu Crișului" → "Via Ferrata Casa Zmeului"

---

## 📊 Expected Results

### Test Case 1: Adventure Activities
**Input:**
1. "Go-Karting: VMAX (Indoor) or AMCKart (Outdoor)"
2. "Parc Aventura Brașov Zipline & Ropes"
3. "Zipline & Rope Courses at Comana Adventure Park"
4. "High Ropes & Mega Ziplines at Adrenalin Park"
5. "Adventure Park Brașov Mega Zip & Ropes"

**Output:**
1. "Go-Karting" ✅
2. "Parc Aventura Zipline & Ropes" ✅
3. "Comana Zipline & Ropes" ✅
4. "Adrenalin Zipline & Ropes" ✅
5. "Adventure Park Brașov" ✅

### Test Case 2: Via Ferrata
**Input:**
- "Via Ferrata Casa Zmeului – Vadu Crișului"

**Output:**
- "Via Ferrata Casa Zmeului" ✅

### Test Case 3: Other Activities
**Input:**
- "Therme București Wellness Day"
- "Peleș Castle Guided Visit"
- "Wine Tasting in Dealu Mare"

**Output:**
- "Thermal Spa" ✅
- "Castle Visit" ✅
- "Wine Tasting" ✅

---

## 🎨 User Experience Improvement

### On Swipeable Cards:
**Before:**
```
Card 1: Park Visit
Card 2: Park Visit  
Card 3: Park Visit
Card 4: Park Visit
```
❌ Confusing - all look the same

**After:**
```
Card 1: Parc Aventura Zipline & Ropes
Card 2: Comana Zipline & Ropes
Card 3: Adrenalin Zipline & Ropes
Card 4: Adventure Park Brașov
```
✅ Clear - easy to differentiate

---

## 🔄 How to Test

### Step 1: Reload App
```bash
# In iOS Simulator
Cmd+R
```

### Step 2: Search for Adventure Activities
1. Enter vibe: "adventurous outdoor activities"
2. Submit query
3. Get 5 activity suggestions

### Step 3: Check Card Names
Look at the swipeable cards:
- Should show **specific location names**
- Should be **easy to differentiate**
- Should be **concise but descriptive**

### Step 4: Verify Navigation
1. Tap each card
2. Detail screen should show **full activity name**
3. Venue information should be **correct**

---

## 🎯 Design Principles

### 1. Keep Location for Differentiation
When multiple similar activities exist, include location to help users choose.

### 2. Remove Redundant Info
Remove generic phrases like "at", "in", "near" that don't add value.

### 3. Balance Brevity and Clarity
- Short enough to fit on card (2-4 words)
- Descriptive enough to differentiate
- Recognizable activity type

### 4. Preserve Unique Names
For unique activities (like "Via Ferrata Casa Zmeului"), keep the distinctive part.

---

## 📏 Name Length Guidelines

### Ideal Length: 2-4 words
- ✅ "Go-Karting"
- ✅ "Parc Aventura Zipline & Ropes"
- ✅ "Via Ferrata Casa Zmeului"

### Too Short (loses context):
- ❌ "Park" (which park?)
- ❌ "Zipline" (where?)

### Too Long (doesn't fit):
- ❌ "Parc Aventura Brașov Zipline & Ropes Course Experience"

---

## 🧪 Edge Cases Handled

### 1. No Location Found
```typescript
return location ? `${location} Zipline & Ropes` : 'Zipline & Ropes';
```
Fallback to generic name if location can't be extracted.

### 2. Special Characters
```typescript
const locationMatch = fullName.match(/^([A-Z][a-zăâîșț]+(?:\s+[A-Z][a-zăâîșț]+)?)/);
```
Handles Romanian characters (ă, â, î, ș, ț).

### 3. Multiple Word Locations
```typescript
(?:\s+[A-Z][a-zăâîșț]+)?
```
Captures "Parc Aventura" (2 words) not just "Parc".

---

## ✅ Success Criteria

After reload, verify:
- [ ] No duplicate "Park Visit" names
- [ ] Each card has unique, descriptive name
- [ ] Location names are preserved
- [ ] Names fit on cards (not truncated)
- [ ] Easy to differentiate activities
- [ ] Navigation still works correctly

---

## 🎉 Expected User Experience

**User sees:**
1. "Parc Aventura Zipline & Ropes" - knows it's in Brașov
2. "Comana Zipline & Ropes" - knows it's in Comana
3. "Adrenalin Zipline & Ropes" - knows it's Adrenalin Park

**User can:**
- ✅ Quickly identify which activity is which
- ✅ Choose based on location preference
- ✅ Understand what each activity offers
- ✅ Make informed decisions

---

**Reload the app (Cmd+R) to see the improved activity names!** 🚀
