# Database Check - Why No Venues?

## 🔍 Problem

Activities are returning with empty venues arrays:
```json
{
  "activityId": 156,
  "name": "Halotherapy Day at Slănic Prahova Salt Mine",
  "venues": []  // ❌ Empty!
}
```

---

## 📊 SQL Queries to Check Database

Run these queries in your PostgreSQL database to diagnose:

### **1. Check if activity exists:**
```sql
SELECT id, name, description 
FROM activities 
WHERE id = 156;
```

### **2. Check if activity has venues:**
```sql
SELECT * 
FROM venues 
WHERE activity_id = 156;
```

### **3. Count venues per activity:**
```sql
SELECT 
  a.id,
  a.name,
  COUNT(v.id) as venue_count
FROM activities a
LEFT JOIN venues v ON v.activity_id = a.id
GROUP BY a.id, a.name
ORDER BY a.id;
```

### **4. See which activities have venues:**
```sql
SELECT 
  a.id,
  a.name,
  COUNT(v.id) as venue_count,
  STRING_AGG(v.name, ', ') as venue_names
FROM activities a
LEFT JOIN venues v ON v.activity_id = a.id
GROUP BY a.id, a.name
HAVING COUNT(v.id) > 0
ORDER BY a.id;
```

### **5. Check if venues have websites:**
```sql
SELECT 
  v.id,
  v.name,
  v.website,
  v.activity_id,
  a.name as activity_name
FROM venues v
JOIN activities a ON a.id = v.activity_id
WHERE v.website IS NOT NULL
LIMIT 20;
```

---

## 🎯 Expected Results

### **If database is properly populated:**
```
Activity 156: 1-3 venues with names and websites
Activity 13: 1-3 venues with names and websites
etc.
```

### **If database is missing data:**
```
Activity 156: 0 venues ❌
Activity 13: 0 venues ❌
```

---

## 🔧 Possible Issues

### **Issue 1: Activities Don't Have Venues**
**Symptom:** Query returns 0 venues for activity
**Solution:** Need to insert venue records

### **Issue 2: Venues Missing Websites**
**Symptom:** Venues exist but `website` column is NULL
**Solution:** Need to populate website data

### **Issue 3: Foreign Key Mismatch**
**Symptom:** Venues exist but `activity_id` doesn't match
**Solution:** Fix `activity_id` references

---

## 💾 Sample Data Insert (If Missing)

If your database is missing venues, here's example data:

```sql
-- Insert a venue for activity 156 (Halotherapy at Salt Mine)
INSERT INTO venues (activity_id, name, city, region, website, phone, address, latitude, longitude, rating, price_tier)
VALUES (
  156,
  'Salina Slănic Prahova',
  'Slănic',
  'Prahova',
  'https://salina-slanicprahova.ro',
  '+40 244 240 151',
  'Str. Gării nr. 2, Slănic',
  45.2297,
  26.0342,
  4.5,
  'moderate'
);

-- Insert a venue for activity 13 (Parc Aventura)
INSERT INTO venues (activity_id, name, city, region, website, phone, address, latitude, longitude, rating, price_tier)
VALUES (
  13,
  'Parc Aventura Brașov',
  'Brașov',
  'Brașov',
  'https://parcaventura-brasov.ro',
  '+40 268 123456',
  'Str. Poienii, Brașov',
  45.6427,
  25.5887,
  4.7,
  'moderate'
);
```

---

## 🧪 Test Backend Query Directly

You can also test the backend query directly in psql:

```sql
-- This is the exact query your backend runs
SELECT v.id, v.name, v.city, v.rating, v.website, v.phone, v.address, 
       v.latitude, v.longitude, v.price_tier, v.rating_count
FROM venues v
WHERE v.activity_id = 156
ORDER BY v.rating DESC NULLS LAST
LIMIT 3;
```

---

## 🎯 Next Steps

### **Step 1: Run Diagnostic Queries**
```bash
# Connect to your database
psql -h localhost -U your_user -d vibe_database

# Run the queries above
```

### **Step 2: Check Results**

**If venues exist:**
- Check if `website` column has data
- If NULL, need to populate websites

**If venues don't exist:**
- Need to insert venue records
- Link them to activities via `activity_id`

### **Step 3: Share Results**

Share the output of:
```sql
SELECT 
  a.id,
  a.name,
  COUNT(v.id) as venue_count,
  MAX(v.website) as sample_website
FROM activities a
LEFT JOIN venues v ON v.activity_id = a.id
WHERE a.id IN (13, 156, 157, 158, 159)  -- The activities from your test
GROUP BY a.id, a.name;
```

This will tell us:
- Which activities have venues
- Which have websites
- What data needs to be populated

---

## 🚨 Current Status

**Backend Code:** ✅ Fixed (queries website field)  
**Database Data:** ❓ Unknown (need to check)

The backend is working correctly now - it's fetching website fields. The issue is that either:
1. Activities don't have venue records in database
2. OR venue records exist but don't have website data

**The diagnostic queries above will tell us which it is!**

---

## 📝 Quick Check Command

Run this one query to get a quick overview:

```bash
psql -h localhost -U your_user -d vibe_database -c "
SELECT 
  (SELECT COUNT(*) FROM activities) as total_activities,
  (SELECT COUNT(*) FROM venues) as total_venues,
  (SELECT COUNT(*) FROM venues WHERE website IS NOT NULL) as venues_with_websites,
  (SELECT COUNT(DISTINCT activity_id) FROM venues) as activities_with_venues;
"
```

This will show:
- Total activities in DB
- Total venues in DB
- How many venues have websites
- How many activities are linked to venues

Share this output and we'll know exactly what's missing!
