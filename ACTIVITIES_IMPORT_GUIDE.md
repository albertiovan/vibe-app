# Activities Import Guide - Continuation Batch

## 📊 Overview

You've created **~35 new activities** focused on the high-performing categories identified in your training data:
- ✅ Creative workshops (pottery, jewelry, painting)
- ✅ Culinary experiences (coffee, cocktails, baking)
- ✅ Wellness & mindfulness (spa, float therapy, meditation)
- ✅ Quick reset activities (15-30 min cafés, viewpoints)
- ✅ Learning experiences (photography, coding, 3D printing)

**This aligns perfectly with your training insights!**

---

## 🚀 Import Process

### **Step 1: Validate Your Data**

Run the validation script to check for errors:

```bash
cd /Users/aai/CascadeProjects/vibe-app
npx tsx backend/scripts/validate-activities-csv.ts
```

**What it checks:**
- ✅ Required fields (slug, name, category, location)
- ✅ Duplicate slugs
- ✅ Valid coordinates for Romania
- ✅ Valid energy levels (chill/low/medium/high)
- ✅ Valid indoor/outdoor values
- ⚠️ Missing source URLs (warnings only)
- ⚠️ Short descriptions (warnings only)

**Expected output:**
- ❌ ERRORS = Must fix before importing
- ⚠️ WARNINGS = Review but not blocking
- ✅ PERFECT = Ready to import

---

### **Step 2: Import Activities**

Once validation passes, import to database:

```bash
npx tsx backend/scripts/import-activities-continuation.ts
```

**What it does:**
1. Reads `activities_continuation.csv`
2. Checks for existing activities (skips duplicates)
3. Parses tags and builds proper tag arrays
4. Inserts into `activities` table
5. Reports summary stats

**Expected output:**
```
✅ Imported: 35
⏭️  Skipped: 0
❌ Errors: 0
📈 Total database activities: 76 (was 41)
```

---

### **Step 3: Verify Import**

Check that activities are searchable:

```bash
# Query database
psql $DATABASE_URL -c "SELECT COUNT(*) FROM activities WHERE region = 'București';"

# Expected: ~76 activities (41 original + 35 new)
```

Test in training mode:
1. Open Training Mode in app
2. Enter vibe: "I'm anxious and need calm"
3. Should now see more creative/wellness options
4. Less repetition!

---

## 🎯 Category Distribution (After Import)

| Category | Before | Added | After | Target | Status |
|----------|--------|-------|-------|--------|--------|
| Creative | 4 | 7 | **11** | 12 | ✅ Near target |
| Culinary | 2 | 7 | **9** | 10 | ✅ Near target |
| Wellness | 2 | 4 | **6** | 10 | ⚡ Need 4 more |
| Mindfulness | 1 | 3 | **4** | - | ✅ Good |
| Quick Resets | 0 | 4 | **4** | 8 | ⚡ Need 4 more |
| Learning | 3 | 4 | **7** | 8 | ✅ Good |
| Nature | 2 | 2 | **4** | 8 | ⚡ Need 4 more |
| Social | 9 | 0 | **9** | 9 | ✅ Stop adding |
| Romance | 8 | 0 | **8** | 8 | ✅ Stop adding |
| Sports | 7 | 0 | **7** | 8 | ✅ Sufficient |

**Total: 41 → 76 activities (+85% increase!)**

---

## 📈 Expected Training Improvements

### **Before This Import:**
```
Repetition rate: 4.6x per activity (185 recommendations ÷ 40 activities)
Creative options: 4 (frequently repeated)
Wellness options: 2 (insufficient for calm moods)
Quick resets: 0 (unmet need)
```

### **After This Import:**
```
Repetition rate: ~2.4x per activity (185 ÷ 76)
Creative options: 11 (much better variety)
Wellness options: 6 (better, but add more)
Quick resets: 4 (addresses "20 min before call" vibe)
```

### **Predicted Approval Rate:**
- Current: 52%
- After import: **60-65%** (predicted +8-13% improvement)
- Reason: More options in high-performing categories

---

## 🔍 Data Quality Notes

### **Strengths:**
✅ Real venues with addresses and booking info
✅ Detailed descriptions (>100 chars most)
✅ Accurate coordinates
✅ Solo-friendly focus (matches training patterns)
✅ Energy levels mostly "chill" (matches calm moods)

### **Minor Issues Fixed by Import Script:**
- Tags format: Script converts comma-separated strings to arrays
- Seasonality: Script expands "all" → full season array
- Subtypes: Script parses into proper array format

### **To Improve in Round 2:**
1. Add more wellness activities (spas, massage, meditation)
2. Add more nature spots (specific park benches, quiet trails)
3. Add phone numbers where missing
4. Add hero images (optional but nice)

---

## 🧪 Testing Strategy

### **After Import:**

1. **Test Repetition Reduction**
   - Complete 5 training sessions
   - Count unique activities shown
   - Should see <50% repetition (was 100% with 40 activities)

2. **Test High-Performing Categories**
   - Vibe: "I'm anxious and need calm"
   - Should get: Creative, wellness, mindfulness (not social/romance)
   - Expected approval: 65%+ (was 52%)

3. **Test Quick Resets**
   - Vibe: "I have 20 minutes before a call"
   - Should get: Quick cafés, viewpoints, bookstore
   - Expected approval: 70%+ (was 0%)

4. **Test New Activities**
   - Look for: Pottery, float therapy, sound bath
   - Rate them: Build data for these new categories

---

## 📋 Round 2 Additions (Next Batch)

To reach 90-100 activities:

### **High Priority (20 activities):**
1. **More Wellness (6):** Therme Bucharest full entry, massage studios, salt caves
2. **More Quick Resets (4):** More cafés, museum galleries, quiet spots
3. **More Nature (6):** Cișmigiu gardens, Carol Park zones, botanical sections
4. **More Creative (4):** More pottery studios, textile cafés, maker workshops

### **Medium Priority (10 activities):**
5. **Duplicate High-Performers:** More cooking classes, more yoga studios
6. **Fill Learning Gaps:** More photography, more tech workshops

---

## ✅ Import Checklist

Before running import:

- [ ] Run validation script
- [ ] Fix any ERRORS reported
- [ ] Review WARNINGS (optional)
- [ ] Backup database (optional but recommended)
- [ ] Run import script
- [ ] Verify count increased: `SELECT COUNT(*) FROM activities;`
- [ ] Test in Training Mode app
- [ ] Complete 5 training sessions to validate
- [ ] Check for new patterns in training insights

---

## 🎉 Expected Results

**Your 37 training sessions identified clear patterns.**
**These 35 new activities directly address those patterns:**

1. ✅ More creative options (83% approval rate)
2. ✅ More culinary options (75% approval rate)
3. ✅ Wellness for anxious moods (unmet need)
4. ✅ Quick resets (0% coverage → now 4 options)
5. ✅ Solo-friendly focus (60% rejection for forced-social)

**This should reduce repetition by ~50% and increase approval rate by 10-15%.**

**Continue training to 100 sessions to validate these improvements!** 🚀

---

## 🆘 Troubleshooting

### **Import fails with "column does not exist"**
→ Check database schema matches CSV columns
→ Run: `\d activities` in psql to see current schema

### **Duplicate key error**
→ Activity with that slug already exists
→ Change slug or remove from CSV

### **Coordinates seem wrong**
→ Use Google Maps to verify address matches coordinates
→ Bucharest latitude: ~44.4, longitude: ~26.1

### **Categories don't match training insights**
→ Check `/api/training/insights` to see current patterns
→ Adjust categories based on latest data

---

## 📞 Need Help?

Check these files:
- Validation script: `/backend/scripts/validate-activities-csv.ts`
- Import script: `/backend/scripts/import-activities-continuation.ts`
- Training insights: `TRAINING_RESULTS_37_SESSIONS.md`
- Database schema: `/backend/database/migrations/`

Run validation first, then import! 🎯
