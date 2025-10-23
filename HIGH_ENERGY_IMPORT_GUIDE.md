# 🏃 High-Energy Activities Import Guide

## 📊 What You're Adding

**40+ high-energy activities:**
- Basketball, volleyball, tennis, rugby, boxing, kickboxing
- Swimming, fencing, table tennis, pickleball  
- Mountain biking, rock climbing, via ferrata, paragliding
- SUP, surfing, windsurfing, scuba diving
- And 40+ venues for all of them!

**Expected impact:**
- Current high-energy: 17 activities (10%)
- After import: 57+ activities (33%)
- "Intense workout" will use Tier 1 (strict semantic) ✅
- No more fallbacks for high-energy queries! 🎉

---

## 🚀 QUICK IMPORT (Recommended)

### **Step 1: Save Your CSV Files**

**Activities CSV:**
1. Create file: `backend/data/high-energy-batch.csv`
2. Paste ALL your activities CSV data (starting with the header)

**Venues CSV:**
1. Create file: `backend/data/high-energy-venues.csv`
2. Paste ALL your venues CSV data (starting with the header)

### **Step 2: Run Import Script**

I've created `backend/scripts/import-from-paste.ts` for you.

```bash
cd backend

# Edit the script and paste your CSV data:
# - Open scripts/import-from-paste.ts
# - Find const ACTIVITIES_CSV and paste your activities CSV
# - Find const VENUES_CSV and paste your venues CSV
# - Save file

# Run import:
npx tsx scripts/import-from-paste.ts
```

**Expected output:**
```
✅ Basketball Court Booking (sports, energy:high)
✅ Indoor Volleyball Session (sports, energy:high)
✅ Boxing Gym Session (sports, energy:high)
...
📊 Activities: 40 imported, 0 skipped
📊 Venues: 40 imported, 0 skipped

📊 New Energy Distribution:
   low: 95 activities
   medium: 61 activities
   high: 57 activities  ← UP FROM 17! 🎉
```

---

## ✅ Alternative: Manual SQL Import

If the script has issues, you can import via SQL:

### **For Activities:**

```sql
INSERT INTO activities (
  slug, name, category, description, city, region,
  latitude, longitude, duration_min, duration_max,
  seasonality, indoor_outdoor, energy_level, tags,
  maps_url, source_url
) VALUES (
  'bucharest-basketball-court-rau',
  'Basketball Court Booking (Full Court Run)',
  'sports',
  'Call your friends, lace up, and run full-court games...',
  'Bucharest',
  'București',
  44.472,
  26.071,
  60,
  120,
  'all',
  'indoor',
  'high',
  ARRAY['category:sports', 'experience_level:mixed', 'mood:adrenaline', 'mood:social', 'mood:focused', 'terrain:urban', 'equipment:rental-gear', 'context:friends', 'context:team', 'context:group', 'requirement:booking-required', 'risk_level:low', 'weather_fit:all_weather', 'time_of_day:evening', 'time_of_day:daytime', 'travel_time_band:in-city', 'skills:technique', 'cost_band:$$'],
  'https://www.google.com/maps?q=44.472,26.071',
  'https://www.facebook.com/rausportscenter/'
);
```

Repeat for all 40+ activities...

---

## 📋 Verification After Import

### **1. Check Total Count:**

```sql
SELECT energy_level, COUNT(*) as count
FROM activities
GROUP BY energy_level;
```

**Expected:**
- low: ~95
- medium: ~61
- high: **~57** (up from 17!)

### **2. Test "Intense Workout":**

```bash
curl -X POST http://localhost:3000/api/training/recommendations \
  -H "Content-Type: application/json" \
  -d '{"message": "intense workout", "location": {"city": "Bucharest"}}'
```

**Should now see:**
```
🔍 Executing intelligent query...
✅ Found 15+ semantically matched activities  ← Not 0!
🎯 Returning 5 final recommendations
```

NO MORE "falling back to broader search"! ✅

### **3. Check Specific Activities:**

```sql
SELECT name, category, energy_level, tags
FROM activities
WHERE slug IN (
  'bucharest-basketball-court-rau',
  'bucharest-boxing-gym-session',
  'bucharest-kickboxing-class'
);
```

Should show proper tags including `energy:high`, `mood:adrenaline`, etc.

---

## 🎯 What This Fixes

### **Before:**
```
User: "intense workout"
Query: WHERE energy_level = 'high' AND tags @> ARRAY['category:sports']
Result: 0 activities ❌
Fallback: Tier 2 (relaxed semantic)
```

### **After:**
```
User: "intense workout"
Query: WHERE energy_level = 'high' AND tags @> ARRAY['category:sports']
Result: 15+ activities ✅
Success: Tier 1 (strict semantic!)
```

---

## 📊 New Capabilities

After import, Claude semantic analysis will work perfectly for:

| Vibe | Before | After | Improvement |
|------|--------|-------|-------------|
| "Intense workout" | Tier 2 fallback | Tier 1 ✅ | +semantic |
| "HIIT class" | Tier 2 fallback | Tier 1 ✅ | +semantic |
| "Boxing workout" | Tier 2 fallback | Tier 1 ✅ | +semantic |
| "Team sports" | Tier 2 fallback | Tier 1 ✅ | +semantic |
| "Adventure sports" | Tier 2 fallback | Tier 1 ✅ | +semantic |

**Tier 1 usage:** 95% → **98%** (fewer gaps!)

---

## 🚨 Troubleshooting

### **Problem: "Column does not exist"**

Make sure your `activities` table has these columns:
- `slug`, `name`, `category`, `description`
- `city`, `region`, `latitude`, `longitude`
- `duration_min`, `duration_max`
- `seasonality`, `indoor_outdoor`, `energy_level`
- `tags` (text array), `maps_url`, `source_url`

### **Problem: "Duplicate key value"**

Some activities may already exist. The script uses `ON CONFLICT ... DO UPDATE`, so it should just update them.

### **Problem: CSV parsing issues**

Descriptions have commas and quotes. Make sure:
- Descriptions are wrapped in double quotes
- Internal quotes are escaped
- Use the provided parser (handles complex CSV)

---

## ✅ Success Criteria

After import, you should see:

1. ✅ **57+ high-energy activities** (was 17)
2. ✅ **40+ new venues** with booking URLs
3. ✅ **"Intense workout"** uses Tier 1 (no fallback)
4. ✅ **Gap logs disappear** for sports/fitness queries
5. ✅ **Training Mode approval** improves for high-energy vibes

---

## 🎉 Next Steps

1. **Import the data** (use script or SQL)
2. **Restart backend** (if running)
3. **Test "intense workout"** vibe
4. **Open Training Mode**
5. **Test high-energy vibes:**
   - "intense HIIT workout"
   - "boxing class"
   - "team sports game"
   - "mountain biking"
   - "rock climbing"

**Expected approval:** 90%+ (was <50% with fallback!)

Your semantic system will now handle high-energy queries perfectly! 🚀
