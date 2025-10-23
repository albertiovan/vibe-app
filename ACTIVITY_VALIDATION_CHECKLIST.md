# ✅ Activity Validation Checklist

**Use this BEFORE importing ChatGPT-generated activities to ensure semantic quality**

---

## 🎯 Quick Validation (30 seconds per activity)

For EACH activity, check these 7 items:

### 1. ✅ Description is SEMANTIC-RICH

**Ask:** Does it explain the EXPERIENCE, not just what it is?

❌ **FAIL:** "Pottery class where you make bowls on a wheel"
✅ **PASS:** "Center clay on a spinning wheel, pull walls upward with wet hands, shape a bowl through patient technique. Leave with something you built - that proud feeling of physical creation."

**Semantic elements to look for:**
- [ ] Physical actions (what you DO with hands/body)
- [ ] Emotional outcome (how you FEEL)
- [ ] Tangible results (what you GET/make)
- [ ] Process nature (step-by-step vs freeform)

---

### 2. ✅ Energy Level is HONEST

**Common mistakes:**

❌ Pottery = "low" (WRONG! Requires focus + arm strength)
✅ Pottery = "medium" (CORRECT)

❌ Gentle yoga = "medium" (WRONG! It's stretching)
✅ Gentle yoga = "low" (CORRECT)

❌ CrossFit = "medium" (WRONG! It's intense!)
✅ CrossFit = "high" (CORRECT)

**Energy Guidelines:**
- **low** (0-3 METs): Spa, massage, meditation, gentle walks, reading
- **medium** (3-6 METs): Pottery, painting, casual cycling, badminton, yoga
- **high** (6+ METs): CrossFit, running, climbing, intense sports, HIIT

---

### 3. ✅ Mood Tags MATCH the Feeling

**Ask:** What FEELING does this activity create?

Building/crafting activities should have:
- ✅ `creative` (always)
- ✅ `mindful` or `focused` (concentration)
- ✅ `cozy` or `explorer` (depending on vibe)

Sports activities should have:
- ✅ `adrenaline` (if competitive/intense)
- ✅ `social` (if team/group)
- ✅ `adventurous` (if challenging/new)

Wellness activities should have:
- ✅ `relaxed` (always)
- ✅ `cozy` or `mindful` (calm feeling)

---

### 4. ✅ All Required Tags Present

**Must have:**
- [ ] `tags_experience_level` (beginner/intermediate/advanced/mixed)
- [ ] `tags_mood` (at least 2-3 moods)
- [ ] `tags_context` (solo/date/friends/family/group)
- [ ] `tags_equipment` (provided/rental-gear/none)
- [ ] `tags_requirement` (booking-required/optional)
- [ ] `tags_cost_band` ($, $$, $$$, $$$$)

**If outdoor, must also have:**
- [ ] `tags_terrain` (urban/forest/mountain/coast/lake)
- [ ] `tags_weather_fit` (all_weather/ok_in_rain/wind_sensitive)

---

### 5. ✅ Tag Format is CORRECT

**Common mistakes:**

❌ `"creative, mindful, cozy"` (spaces after commas!)
✅ `"creative,mindful,cozy"` (no spaces!)

❌ `"solo date friends"` (missing commas!)
✅ `"solo,date,friends"` (commas between!)

❌ `"context:solo,context:date"` (prefixes in CSV!)
✅ `"solo,date"` (no prefixes - import adds them!)

---

### 6. ✅ Indoor/Outdoor is ACCURATE

**Common mistakes:**

❌ Pottery = "outdoor" (NO! Studios are indoors)
✅ Pottery = "indoor"

❌ Park walk = "indoor" (NO!)
✅ Park walk = "outdoor"

❌ Yoga = "indoor" (MAYBE! Can be outdoor too)
✅ Yoga = "both" (can do inside or outside)

---

### 7. ✅ Duration is REALISTIC

**Common mistakes:**

❌ Pottery workshop = 30 min (TOO SHORT!)
✅ Pottery workshop = 120-180 min

❌ CrossFit class = 180 min (TOO LONG!)
✅ CrossFit class = 60-90 min

❌ Coffee break = 120 min (TOO LONG!)
✅ Coffee break = 15-30 min

**Guidelines:**
- Quick resets: 15-30 min
- Classes: 60-120 min
- Workshops: 120-240 min
- Full-day: 240-480 min

---

## 🔍 Deep Validation (2 minutes per activity)

### Semantic Understanding Test

**Question:** If someone says "I miss legos", would this activity match?

**Look for these semantic signals:**

✅ **Building/Creating activities** (pottery, woodworking, jewelry):
- Description mentions: "build", "create", "make", "craft", "assemble"
- Description mentions: "step-by-step", "process", "instructions"
- Description mentions: "tangible", "physical object", "finished piece"
- Description mentions: "proud", "accomplishment", "made it yourself"
- Mood tags include: `creative`, `mindful`, `focused`

✅ **Sports/Fitness activities** (for "I want sports"):
- Description mentions: "physical", "exertion", "movement", "cardio"
- Description mentions: "competitive", "challenge", "test yourself"
- Description mentions: "social", "team", "group" (if applicable)
- Mood tags include: `adrenaline`, `social`, `adventurous`
- Energy level is: `high` (usually)

✅ **Wellness activities** (for "I'm exhausted"):
- Description mentions: "relax", "unwind", "calm", "gentle"
- Description mentions: "release tension", "soothe", "peaceful"
- Description mentions: "reset", "recharge", "restore"
- Mood tags include: `relaxed`, `cozy`, `mindful`
- Energy level is: `low` (always!)

---

## 📋 Batch Validation Script

For validating multiple activities at once:

```bash
# Count activities
wc -l activities_new.csv

# Check for spaces after commas (BAD!)
grep -n ', ' activities_new.csv

# Check all have required columns
head -1 activities_new.csv | tr ',' '\n' | nl

# Verify energy levels
cut -d',' -f14 activities_new.csv | sort | uniq -c

# Verify categories
cut -d',' -f3 activities_new.csv | sort | uniq -c
```

---

## ✅ Final Checklist Before Import

- [ ] All descriptions are 150-250 chars
- [ ] All descriptions reveal EXPERIENCE (not just "what it is")
- [ ] Energy levels are HONEST (pottery = medium, not low!)
- [ ] Mood tags match the FEELING created
- [ ] NO spaces after commas in any tag field
- [ ] All required tags present (experience_level, mood, context, equipment, requirement, cost)
- [ ] Indoor/outdoor is accurate
- [ ] Duration is realistic
- [ ] Coordinates are in Bucharest/target city
- [ ] No duplicate slugs

---

## 🚨 Common Fixes

### Fix 1: Add semantic richness to description

Before:
```
"Pottery class where you make a bowl on the wheel"
```

After:
```
"Center wet clay on a spinning wheel, pull walls upward with steady hands, shape a bowl through patient technique. Leave with something tangible you built from scratch - that proud feeling of physical creation."
```

### Fix 2: Correct energy level

Before:
```csv
pottery-class,Pottery Wheel,creative,...,low,beginner,...
```

After:
```csv
pottery-class,Pottery Wheel,creative,...,medium,beginner,...
```

### Fix 3: Remove spaces from tags

Before:
```csv
...,beginner,"creative, mindful, cozy","urban",provided,"solo, small-group",...
```

After:
```csv
...,beginner,"creative,mindful,cozy","urban",provided,"solo,small-group",...
```

### Fix 4: Add missing mood tags

Before:
```csv
...,medium,beginner,"","urban",provided,...
```

After:
```csv
...,medium,beginner,"creative,mindful,focused","urban",provided,...
```

---

## 🎯 Quality Score

Rate each activity on semantic quality (1-5):

**5 stars** ⭐⭐⭐⭐⭐
- Description reveals deep EXPERIENCE
- Energy level is perfect
- Mood tags capture exact FEELING
- All tags present and correct
- Ready for semantic matching!

**4 stars** ⭐⭐⭐⭐
- Good description, minor improvements possible
- Energy level correct
- Most mood tags present
- Minor tag fixes needed

**3 stars** ⭐⭐⭐
- Description is okay but surface-level
- Energy level might be slightly off
- Missing some mood tags
- Needs improvement before import

**2 stars** ⭐⭐
- Description is just "what it is", no experience
- Energy level wrong
- Many missing tags
- Needs major rewrite

**1 star** ⭐
- No semantic value
- Tags wrong or missing
- Don't import until fixed

**Only import 4-5 star activities!**

---

## 🚀 Ready to Import

Once validated:

```bash
cd backend
npx tsx scripts/import-activities-batch[N].ts
```

Check logs for:
```
✅ Imported: Activity Name (category)
✅ Found 20 semantically matched activities
```

Test with semantic analyzer:
```
User: "I miss legos"
Should match: ✅ Your woodworking/pottery/jewelry activities
Should NOT match: ❌ Sports or spa activities
```

---

## 📊 Post-Import Verification

Test these vibes in Training Mode:

1. "I miss legos" → Should get your new building/creating activities
2. "I want sports" → Should get sports/fitness (not new crafts)
3. "I'm exhausted" → Should get wellness (not high-energy sports)

If semantic matching works correctly, you'll see:
- ✅ 80%+ approval for activities that match vibe
- ✅ Category accuracy 95%+
- ✅ Energy level matches 90%+

**Your activities are now optimized for intelligent semantic matching!** 🎯
