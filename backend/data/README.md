# 📊 Data Collection System

Complete system for populating the Vibe app database with 100+ real Romanian activities and venues.

---

## 🎯 **Quick Start**

### **Step 1: Give ChatGPT the Prompt**
1. Open `CHATGPT_PROMPT.md`
2. Copy the entire contents
3. Paste into ChatGPT o1 (or GPT-4)
4. Wait for research results

### **Step 2: Save CSV Files**
ChatGPT will provide two files:
- `activities.csv` - Save to `/backend/data/activities.csv`
- `venues.csv` - Save to `/backend/data/venues.csv`

### **Step 3: Convert & Import**
```bash
# Install dependencies (first time only)
npm install

# Convert CSV to JSON and import to database
npm run csv:import
```

Done! Your database now has 100+ activities and venues.

---

## 📁 **Files in This Directory**

| File | Purpose |
|------|---------|
| `CHATGPT_PROMPT.md` | **Copy this to ChatGPT** - Complete research instructions |
| `DATA_COLLECTION_INSTRUCTIONS.md` | Detailed reference for data quality standards |
| `ACTIVITIES_TEMPLATE.csv` | Example activity CSV structure |
| `VENUES_TEMPLATE.csv` | Example venue CSV structure |
| `taxonomy.json` | Tag vocabulary (17 facets) |
| `README.md` | This file |

---

## 🔄 **Workflow**

```
1. ChatGPT Research
   ├─ Uses: GetYourGuide, Viator, TripAdvisor, Expedia
   ├─ Finds: Real bookable activities & venues
   └─ Outputs: activities.csv + venues.csv

2. CSV Conversion
   ├─ Script: csv-to-seed-json.ts
   ├─ Reads: CSV files
   ├─ Validates: Tags against taxonomy
   ├─ Generates: Maps URLs
   └─ Outputs: activities-seed.json

3. Database Import
   ├─ Script: database/seed.ts
   ├─ Reads: activities-seed.json
   ├─ Creates: Faceted tags
   ├─ Populates: activity_tags, venue_tags tables
   └─ Result: Fully seeded PostgreSQL database
```

---

## 📊 **Data Quality Standards**

### **Activities (100+)**
✅ Real & bookable from official sources  
✅ 40-80 word descriptions  
✅ 10-15 faceted tags minimum  
✅ Accurate coordinates (Google Maps)  
✅ Recent reviews confirming operation  
✅ Source URL documented  

### **Venues (200-300)**
✅ Real businesses with addresses  
✅ Website + phone + booking URL  
✅ Opening hours for each day  
✅ 15-25 word blurbs  
✅ Google Maps links auto-generated  
✅ Verified within last 6 months  

---

## 🏷️ **Tag System**

### **17 Tag Facets:**
- **category** - Primary activity type (adventure, wellness, culture, etc.)
- **experience_level** - beginner | intermediate | advanced
- **energy** - chill | medium | high
- **indoor_outdoor** - indoor | outdoor | either
- **seasonality** - winter | summer | shoulder | all
- **mood** - adrenaline, cozy, romantic, social, etc.
- **terrain** - urban, mountain, forest, coast, etc.
- **context** - family, solo, group, date, etc.
- **requirement** - guide-required, booking-required, etc.
- **equipment** - rental-gear, provided, helmet, etc.
- **risk_level** - low | moderate | exposed | high
- **weather_fit** - ok_in_rain, cold_friendly, etc.
- **time_of_day** - sunrise, daytime, sunset, night
- **travel_time_band** - nearby, in-city, day-trip, overnight
- **skills** - balance, endurance, technique, etc.
- **cost_band** - $ | $$ | $$$ | $$$$
- **subtype** - Specific activity types

See `taxonomy.json` for complete vocabulary.

---

## 🚀 **Commands**

```bash
# Convert CSV to JSON
npm run csv:convert

# Convert and import to database
npm run csv:import

# Just import existing JSON
npm run db:seed

# Reset database and reseed
npm run db:reset

# Check database status
npm run db:status
```

---

## 📋 **CSV Column Reference**

### **activities.csv (30 columns)**

| Column | Example |
|--------|---------|
| `slug` | `wine-tasting-dealu-mare` |
| `name` | `Wine tasting in Dealu Mare` |
| `category` | `culinary` |
| `subtypes` | `wine_tasting,vineyard` |
| `description` | 40-80 words of what you do |
| `city` | `Dealu Mare` |
| `region` | `Prahova` |
| `latitude` | `45.0500` |
| `longitude` | `26.0100` |
| `duration_min` | `120` (minutes) |
| `duration_max` | `180` (minutes) |
| `seasonality` | `all` or `winter,summer` |
| `indoor_outdoor` | `indoor` |
| `energy_level` | `chill` |
| `tags_experience_level` | `beginner` |
| `tags_mood` | `cozy,romantic` |
| `tags_terrain` | `valley,urban` |
| `tags_equipment` | `provided` |
| `tags_context` | `date,small-group` |
| `tags_requirement` | `booking-required` |
| `tags_risk_level` | `low` |
| `tags_weather_fit` | `all_weather` |
| `tags_time_of_day` | `daytime` |
| `tags_travel_time_band` | `day-trip` |
| `tags_skills` | `none_required` |
| `tags_cost_band` | `$$` |
| `hero_image_url` | (optional, leave blank) |
| `source_url` | Where you found it |
| `notes` | Research notes |

### **venues.csv (26 columns)**

| Column | Example |
|--------|---------|
| `activity_slug` | Links to activity |
| `name` | `Cramele Recaș` |
| `address` | Full street address |
| `city` | `Recaș` |
| `region` | `Timiș` |
| `latitude` | `45.7500` |
| `longitude` | `21.4500` |
| `booking_url` | Booking link |
| `website` | Official website |
| `phone` | `+40 256 123 456` |
| `price_tier` | `$$` |
| `seasonality` | (optional) |
| `blurb` | 15-25 words |
| `tags_equipment` | `provided` |
| `tags_requirement` | `booking-required` |
| `tags_context` | `group,date` |
| `tags_cost_band` | `$$` |
| `opening_hours_monday` | `10:00-18:00` |
| `opening_hours_tuesday` | `10:00-18:00` |
| `opening_hours_wednesday` | `10:00-18:00` |
| `opening_hours_thursday` | `10:00-18:00` |
| `opening_hours_friday` | `10:00-20:00` |
| `opening_hours_saturday` | `09:00-20:00` |
| `opening_hours_sunday` | `09:00-18:00` |
| `source_url` | Where you found it |
| `notes` | Research notes |

---

## 🎯 **Target Distribution**

| Category | Activities | Venues (2-3 each) |
|----------|-----------|-------------------|
| Adventure | 15-20 | 30-60 |
| Nature | 10-15 | 20-45 |
| Water | 8-12 | 16-36 |
| Wellness | 10-15 | 20-45 |
| Culture | 15-20 | 30-60 |
| Culinary | 10-15 | 20-45 |
| Creative | 8-12 | 16-36 |
| Sports | 10-15 | 20-45 |
| Nightlife | 8-10 | 16-30 |
| Learning | 8-10 | 16-30 |
| **TOTAL** | **100+** | **200-300+** |

---

## 📍 **Geographic Coverage**

| City/Region | Target Activities |
|-------------|------------------|
| București (Bucharest) | 25+ |
| Brașov | 15+ |
| Cluj-Napoca | 10+ |
| Timișoara | 8+ |
| Iași | 8+ |
| Constanța (Black Sea) | 10+ |
| Sibiu | 8+ |
| Other regions | 16+ |

---

## 🔍 **Data Sources**

ChatGPT will use these platforms:

**Primary Sources:**
- ✅ GetYourGuide Romania
- ✅ Viator Romania
- ✅ Expedia Things to Do
- ✅ TripAdvisor Experiences
- ✅ Booking.com Attractions
- ✅ Official tourism sites
- ✅ Business websites
- ✅ Google Maps/Places

**Quality Verification:**
- Recent reviews (last 6 months)
- Active listings
- Official contact information
- Bookable experiences

---

## 🐛 **Troubleshooting**

### **CSV Import Fails**
```bash
# Check CSV format
head -5 data/activities.csv

# Validate manually
npm run csv:convert -- data/activities.csv data/venues.csv
```

### **Missing Dependencies**
```bash
npm install csv-parse
```

### **Database Connection Error**
```bash
# Check DATABASE_URL in .env
echo $DATABASE_URL

# Test connection
psql $DATABASE_URL -c "SELECT version();"
```

### **Tags Not Validating**
- Check `taxonomy.json` for valid values
- Ensure tags match exactly (case-sensitive)
- Multiple tags separated by commas (no spaces)

---

## ✅ **Quality Checklist**

Before importing, verify:

- [ ] All activities have 10-15 tags minimum
- [ ] All venues have opening hours
- [ ] All coordinates from Google Maps
- [ ] All source URLs documented
- [ ] All descriptions 40-80 words (activities)
- [ ] All blurbs 15-25 words (venues)
- [ ] All phone numbers include +40 country code
- [ ] All businesses verified as currently operating
- [ ] CSV files properly formatted (no extra commas)
- [ ] No duplicate slugs

---

## 📝 **Example Workflow**

1. **Copy prompt to ChatGPT:**
   ```
   Open: CHATGPT_PROMPT.md
   Copy all → Paste into ChatGPT o1
   ```

2. **Save CSV files:**
   ```
   Save activities.csv to backend/data/
   Save venues.csv to backend/data/
   ```

3. **Install & Import:**
   ```bash
   cd backend
   npm install csv-parse
   npm run csv:import
   ```

4. **Verify:**
   ```bash
   npm run db:status
   psql vibe_app -c "SELECT COUNT(*) FROM activities;"
   psql vibe_app -c "SELECT COUNT(*) FROM venues;"
   ```

5. **Test recommendations:**
   ```bash
   npm run test:mcp
   ```

---

## 🎉 **Success Metrics**

After import, you should have:

- ✅ 100+ activities in database
- ✅ 200-300 venues in database
- ✅ Average 10-15 tags per activity
- ✅ 2-3 venues per activity
- ✅ All major Romanian cities covered
- ✅ Mix of indoor/outdoor activities
- ✅ Mix of energy levels and experience levels
- ✅ All price points represented ($-$$$$)
- ✅ Year-round activity options

---

**Ready to populate your database!** 🚀

1. Give `CHATGPT_PROMPT.md` to ChatGPT
2. Save the CSV files
3. Run `npm run csv:import`
4. Start recommending activities!
