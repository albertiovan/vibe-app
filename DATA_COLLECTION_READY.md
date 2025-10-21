# 🎉 Data Collection System Ready!

**Status:** ✅ **Complete & Ready to Use**  
**Date:** October 20, 2025

---

## 📦 **What's Been Created**

### **1. ChatGPT Prompt** (`backend/data/CHATGPT_PROMPT.md`)
A comprehensive, copy-paste prompt for ChatGPT o1/GPT-4 that includes:
- ✅ Detailed research instructions
- ✅ CSV format specifications
- ✅ Tag taxonomy reference
- ✅ Quality standards
- ✅ Example entries
- ✅ Data sources (Expedia, TripAdvisor, GetYourGuide, Viator, official websites)
- ✅ 100+ activities target
- ✅ 200-300 venues target

### **2. CSV Templates**
- ✅ `ACTIVITIES_TEMPLATE.csv` - 30 columns with example
- ✅ `VENUES_TEMPLATE.csv` - 26 columns with example

### **3. Documentation**
- ✅ `DATA_COLLECTION_INSTRUCTIONS.md` - Detailed reference guide
- ✅ `README.md` - Quick start guide

### **4. Conversion Script** (`scripts/csv-to-seed-json.ts`)
Automatically converts CSV → JSON with:
- ✅ Tag validation against taxonomy
- ✅ Google Maps URL generation
- ✅ Faceted tag creation
- ✅ Opening hours JSON formatting
- ✅ Data quality checks
- ✅ Statistics reporting

### **5. Package Updates**
- ✅ Added `csv-parse` dependency
- ✅ Added `csv:convert` script
- ✅ Added `csv:import` script (convert + seed)

---

## 🚀 **How to Use**

### **Step 1: Give Prompt to ChatGPT**

1. Open `/backend/data/CHATGPT_PROMPT.md`
2. Copy the entire file
3. Paste into **ChatGPT o1** (or GPT-4)
4. Wait for research results (may take 10-20 minutes for 100+ activities)

### **Step 2: Save CSV Files**

ChatGPT will provide two CSV files:
```
activities.csv  → Save to backend/data/activities.csv
venues.csv      → Save to backend/data/venues.csv
```

### **Step 3: Import to Database**

```bash
cd backend

# Install CSV parser (first time only)
npm install

# Convert CSV → JSON → Database in one command
npm run csv:import
```

Done! 🎉

---

## 📊 **What ChatGPT Will Research**

### **Activity Sources:**
- **Booking Platforms:**
  - GetYourGuide Romania
  - Viator Romania  
  - Expedia Things to Do
  - TripAdvisor Experiences
  - Booking.com Attractions

- **Official Sources:**
  - Romania Tourism Board
  - Regional tourism sites (Visit Brașov, etc.)
  - Official business websites
  - Google Maps verified locations

### **Geographic Coverage:**
- București (Bucharest) - 25+ activities
- Brașov - 15+ activities
- Cluj-Napoca - 10+ activities
- Timișoara, Iași, Constanța - 8-10 each
- Other regions - 16+ activities

### **Activity Categories:**
1. **Adventure** (15-20): Rock climbing, paragliding, via ferrata, MTB
2. **Nature** (10-15): Hiking, wildlife watching, forest trails
3. **Water** (8-12): Kayaking, paddleboarding, boat tours
4. **Wellness** (10-15): Thermal spas, saunas, yoga
5. **Culture** (15-20): Museums, castle tours, walking tours
6. **Culinary** (10-15): Wine tasting, cooking classes
7. **Creative** (8-12): Pottery, painting, workshops
8. **Sports** (10-15): Skiing, snowboarding, climbing gyms
9. **Nightlife** (8-10): Pub crawls, live music
10. **Learning** (8-10): Language, dance, music lessons

---

## 🏷️ **Tag System Overview**

Each activity will have **10-15 tags** across 17 facets:

**REQUIRED (5 tags):**
- category (adventure, wellness, culture, etc.)
- experience_level (beginner/intermediate/advanced)
- energy (chill/medium/high)
- indoor_outdoor (indoor/outdoor/either)
- seasonality (winter/summer/shoulder/all)

**RECOMMENDED (5-10 more tags):**
- mood (adrenaline, cozy, romantic, etc.)
- terrain (mountain, urban, coast, etc.)
- context (family, solo, group, date, etc.)
- requirement (booking-required, guide-required, etc.)
- equipment (rental-gear, provided, etc.)
- risk_level (low/moderate/exposed/high)
- weather_fit (ok_in_rain, cold_friendly, etc.)
- And more...

See `backend/data/taxonomy.json` for complete vocabulary.

---

## ✅ **Quality Standards**

ChatGPT has been instructed to ensure:

### **Activities:**
✅ Real & bookable (not conceptual)  
✅ Official sources only  
✅ 40-80 word descriptions  
✅ Accurate coordinates from Google Maps  
✅ Current businesses (verified via recent reviews)  
✅ 10-15 comprehensive tags  
✅ Source URL documented  

### **Venues:**
✅ Real businesses with addresses  
✅ Website + phone + booking URL  
✅ Opening hours for each day  
✅ 15-25 word actionable blurbs  
✅ Recently verified (last 6 months)  
✅ Google Maps links auto-generated  

---

## 🔄 **Automated Workflow**

```
ChatGPT Research
    ↓
activities.csv + venues.csv
    ↓
npm run csv:import
    ↓
├─ Converts CSV → JSON
├─ Validates tags against taxonomy
├─ Generates Google Maps URLs
├─ Creates faceted tags
├─ Seeds PostgreSQL database
└─ Reports statistics
    ↓
✅ 100+ activities in database
✅ 200-300 venues with maps links
✅ Tag-based queries ready
✅ MCP recommendations operational
```

---

## 📋 **Example Entry**

### **Activity (from CSV):**
```csv
wine-tasting-dealu-mare,Wine tasting in Dealu Mare,culinary,"wine_tasting,vineyard","Sample local wines with a sommelier who explains terroir and pairing. Tours include cellar visits and snacks. Perfect for beginners and wine enthusiasts in Romania's top wine region.",Dealu Mare,Prahova,45.0500,26.0100,120,180,all,indoor,chill,beginner,"cozy,romantic","valley,urban",provided,"date,small-group",booking-required,low,all_weather,daytime,day-trip,none_required,$$,,https://getyourguide.com/dealu-mare,GetYourGuide
```

### **Venue (from CSV):**
```csv
wine-tasting-dealu-mare,Cramele Recaș,Str. Principală 45,Recaș,Timiș,45.7500,21.4500,https://cramele-recas.ro/booking,https://cramele-recas.ro,+40256200300,$$,,"Award-winning winery with guided tastings and vineyard tours in elegant rooms.",provided,booking-required,"group,date",$$,10:00-18:00,10:00-18:00,10:00-18:00,10:00-18:00,10:00-20:00,09:00-20:00,09:00-18:00,https://cramele-recas.ro,4.6★ (380 reviews)
```

### **Result in Database:**
```json
{
  "slug": "wine-tasting-dealu-mare",
  "name": "Wine tasting in Dealu Mare",
  "category": "culinary",
  "tags_faceted": [
    { "facet": "category", "value": "culinary" },
    { "facet": "experience_level", "value": "beginner" },
    { "facet": "mood", "value": "cozy" },
    { "facet": "mood", "value": "romantic" },
    { "facet": "terrain", "value": "valley" }
    // ... 10-15 total tags
  ],
  "venues": [
    {
      "name": "Cramele Recaș",
      "website": "https://cramele-recas.ro",
      "maps_url": "https://www.google.com/maps?q=45.7500,21.4500",
      "opening_hours_json": {
        "monday": "10:00-18:00",
        "friday": "10:00-20:00"
        // ...
      }
    }
  ]
}
```

---

## 📁 **File Locations**

```
backend/
├── data/
│   ├── CHATGPT_PROMPT.md          ← Copy this to ChatGPT
│   ├── DATA_COLLECTION_INSTRUCTIONS.md
│   ├── README.md                  ← Quick start guide
│   ├── ACTIVITIES_TEMPLATE.csv    ← Example format
│   ├── VENUES_TEMPLATE.csv        ← Example format
│   └── taxonomy.json              ← Tag vocabulary
├── scripts/
│   └── csv-to-seed-json.ts        ← Automatic converter
├── database/
│   ├── seed.ts                    ← Imports to PostgreSQL
│   └── activities-seed.json       ← Generated from CSV
└── package.json                   ← Updated with scripts
```

---

## 🎯 **Expected Results**

After ChatGPT completes research:

**CSV Output:**
- ✅ 100-150 activities
- ✅ 200-400 venues
- ✅ All 10 categories covered
- ✅ Major Romanian cities included
- ✅ Mix of price points and experience levels

**After Import:**
- ✅ Fully populated PostgreSQL database
- ✅ Tag-based queries working
- ✅ MCP Claude recommendations operational
- ✅ Google Maps links for all venues
- ✅ Rich metadata for filtering

---

## 🐛 **Troubleshooting**

### **ChatGPT stops mid-research:**
- Ask: "Please continue with the remaining activities"
- Or split into batches: "First, do 50 adventure/nature activities"

### **CSV format issues:**
- ChatGPT should output proper CSV
- If not, ask: "Please output as CSV file with headers"

### **Import fails:**
```bash
# Check CSV files exist
ls -lh backend/data/activities.csv
ls -lh backend/data/venues.csv

# Test conversion only (don't import)
npm run csv:convert

# Check for errors
cat backend/database/activities-seed.json | head -50
```

### **Missing dependencies:**
```bash
npm install csv-parse
```

---

## 🚀 **Next Steps**

### **Option A: Start Data Collection** (Recommended)
1. Open `backend/data/CHATGPT_PROMPT.md`
2. Copy entire contents
3. Paste into ChatGPT o1
4. Save CSV files
5. Run `npm run csv:import`

### **Option B: Test with Sample Data**
1. Use the template CSVs as-is
2. Run `npm run csv:import`
3. Verify system works
4. Then get real data from ChatGPT

### **Option C: Manual Entry**
1. Edit `backend/database/activities-seed.json` directly
2. Add activities + venues manually
3. Run `npm run db:seed`

---

## 📊 **Timeline Estimate**

- **ChatGPT Research:** 15-30 minutes (for 100+ activities)
- **Save CSV Files:** 2 minutes
- **Install Dependencies:** 1 minute
- **Import to Database:** 1-2 minutes
- **Verification:** 2 minutes

**Total:** ~20-40 minutes from prompt to populated database!

---

## ✅ **Success Criteria**

You'll know it worked when:

```bash
$ psql vibe_app -c "SELECT COUNT(*) FROM activities;"
 count 
-------
   112
(1 row)

$ psql vibe_app -c "SELECT COUNT(*) FROM venues;"
 count 
-------
   278
(1 row)

$ psql vibe_app -c "SELECT COUNT(*) FROM activity_tags;"
 count 
-------
  1456
(1 row)
```

And you can query by tags:
```bash
$ psql vibe_app -c "SELECT name FROM activities WHERE tags && ARRAY['mood:adrenaline'] LIMIT 5;"
        name         
---------------------
 Tandem paragliding
 Via ferrata route
 Downhill MTB
 Rock climbing
 Canyoning adventure
(5 rows)
```

---

**🎉 Everything is ready! Just copy the prompt to ChatGPT and you'll have 100+ activities in under an hour!**

**File to copy:** `backend/data/CHATGPT_PROMPT.md`
