# Data Format Guide: Activities & Tags

## ✅ TAGS FORMAT (CURRENT SYSTEM - CORRECT!)

### **Database Schema**
```sql
tags text[] -- PostgreSQL array of strings
```

### **Tag Format: Prefixed Key-Value**
Each tag follows the pattern: `{category}:{value}`

**Examples:**
```javascript
[
  "category:creative",
  "context:solo",
  "context:small-group",
  "mood:creative",
  "mood:relaxed",
  "energy:low",
  "indoor_outdoor:indoor"
]
```

### **CSV Format**
In `activities_continuation.csv`, tags are stored as **comma-separated strings** in separate columns:

```csv
tags_context,tags_mood,tags_equipment
"solo,small-group","creative,relaxed,cozy","provided"
```

### **Import Script Conversion**
The import script (`import-activities-continuation.ts`) automatically:
1. Parses comma-separated strings
2. Adds prefixes based on column name
3. Stores as PostgreSQL array

**Conversion Example:**
```typescript
// CSV Input
tags_context: "solo,small-group"
tags_mood: "creative,relaxed"

// Database Output
tags: [
  "context:solo",
  "context:small-group",
  "mood:creative",
  "mood:relaxed"
]
```

### **Tag Categories**

| CSV Column | Prefix | Examples |
|------------|--------|----------|
| `tags_experience_level` | `experience_level:` | `beginner`, `intermediate`, `advanced`, `mixed` |
| `tags_mood` | `mood:` | `creative`, `relaxed`, `cozy`, `explorer`, `romantic`, `mindful` |
| `tags_terrain` | `terrain:` | `urban`, `park`, `delta`, `lake`, `resort` |
| `tags_equipment` | `equipment:` | `provided`, `none`, `camera`, `phone`, `laptop` |
| `tags_context` | `context:` | `solo`, `date`, `small-group`, `friends`, `group` |
| `tags_requirement` | `requirement:` | `booking-required`, `booking-optional`, `lesson-recommended`, `guide-optional` |
| `tags_risk_level` | `risk_level:` | `low`, `moderate`, `high` |
| `tags_weather_fit` | `weather_fit:` | `all_weather`, `ok_in_rain`, `wind_sensitive`, `cold_friendly` |
| `tags_time_of_day` | `time_of_day:` | `morning`, `daytime`, `evening`, `night`, `sunset`, `sunrise`, `any` |
| `tags_travel_time_band` | `travel_time_band:` | `in-city`, `nearby`, `day-trip` |
| `tags_skills` | `skills:` | `technique`, `balance`, `navigation`, `none_required` |
| `tags_cost_band` | `cost_band:` | `$`, `$$`, `$$$`, `$$$$` |

### **Special Tags (Auto-Generated)**
These are NOT in CSV columns but added by the import script:

| Field | Tag Prefix | Source |
|-------|------------|--------|
| `category` | `category:` | `category` column |
| `energy_level` | `energy:` | `energy_level` column |
| `indoor_outdoor` | `indoor_outdoor:` | `indoor_outdoor` column |
| `seasonality` | `seasonality:` | `seasonality` column |

---

## 📋 CONSTRAINT VALUES

### **Energy Level** (Required)
```sql
CHECK (energy_level IN ('low', 'medium', 'high', 'very-high'))
```
❌ Don't use: `chill` (use `low` instead)

### **Indoor/Outdoor** (Required)
```sql
CHECK (indoor_outdoor IN ('indoor', 'outdoor', 'both'))
```
❌ Don't use: `either` (use `both` instead)

### **Category** (Required)
Valid categories:
- `creative`, `culinary`, `wellness`, `mindfulness`
- `nature`, `learning`, `social`, `romance`
- `sports`, `fitness`, `adventure`, `culture`
- `nightlife`, `seasonal`

---

## 📝 CSV BEST PRACTICES

### ✅ **DO:**
```csv
tags_context,tags_mood
"solo,small-group","creative,relaxed"
```

- Use comma-separated strings
- No quotes around individual values
- Use underscores for multi-word values (`none_required`, `small-group`)

### ❌ **DON'T:**
```csv
tags_context,tags_mood
["solo","small-group"],"creative, relaxed, cozy"
```

- Don't use JSON array syntax
- Don't add spaces after commas (they'll be preserved)
- Don't use prefixes in CSV (added automatically)

---

## 🔍 QUERYING TAGS

### **Check if activity has a tag:**
```sql
SELECT * FROM activities 
WHERE 'context:solo' = ANY(tags);
```

### **Find activities with multiple tags:**
```sql
SELECT * FROM activities 
WHERE tags @> ARRAY['mood:creative', 'energy:low'];
```

### **Get all unique mood tags:**
```sql
SELECT DISTINCT unnest(tags) as tag 
FROM activities 
WHERE unnest(tags) LIKE 'mood:%';
```

---

## 🎯 SUMMARY

**Your current tag system is CORRECT and working as intended:**

1. ✅ CSV uses comma-separated strings (easy to edit)
2. ✅ Import script converts to prefixed arrays (database-friendly)
3. ✅ PostgreSQL stores as text[] (efficient querying)
4. ✅ Format supports multiple values per category

**No changes needed!** The import script handles all conversion automatically.

---

## 📊 VENUES DATA FORMAT (Optional)

If you're tracking venues separately, the recommended approach is:

### **Option 1: Embedded (Current)**
Activities include venue info directly (name, address, coordinates)
- ✅ Simple, no joins needed
- ❌ Duplicate venue data if multiple activities use same venue

### **Option 2: Normalized (Future)**
Separate `venues` table referenced by `activity_id`
- ✅ No duplicate venue data
- ✅ Easy to update venue info once
- ❌ Requires joins for queries

**Current system uses Option 1 (embedded) - this is fine for now.**

If you want to normalize venues later, you can create a migration to extract unique venues into a separate table.
