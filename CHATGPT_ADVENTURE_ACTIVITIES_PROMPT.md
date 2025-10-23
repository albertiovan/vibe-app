# ChatGPT Prompt: Adventure & Adrenaline Activities in Romania

## Instructions

I need you to research and create a comprehensive list of **adventurous and high-adrenaline activities** available throughout Romania. Focus on activities that give people an adrenaline rush, push boundaries, or provide thrilling experiences.

---

## Target Activities Categories

Focus on these types of activities:

### **Adventure Sports:**
- Rock climbing (sport & trad)
- Via ferrata routes
- Canyoning & gorge exploration
- Ice climbing (winter)
- Mountain biking (enduro, downhill)
- Ziplines & canopy tours
- Rope courses & adventure parks

### **Extreme Sports:**
- Paragliding & hang gliding
- Skydiving & parachuting
- Bungee jumping
- Base jumping spots
- Wingsuit flying locations

### **Water Adventures:**
- White water rafting (various grades)
- Kayaking (white water & sea)
- Canoeing expeditions
- Surfing & kitesurfing (Black Sea)
- Jet skiing
- Wakeboarding & water skiing
- Scuba diving (caves, wrecks)

### **Winter Adventures:**
- Backcountry skiing & snowboarding
- Ski touring
- Snowmobiling
- Ice climbing
- Winter mountaineering

### **Motorsports:**
- Off-road ATV/quad biking
- Rally driving experiences
- Dirt bike trails
- Go-karting (outdoor tracks)
- Drifting experiences

### **Other Adrenaline Activities:**
- Cave exploration (spelunking)
- High-altitude mountaineering
- Multi-day trekking (challenging routes)
- Trail running (technical/mountain)
- Survival experiences
- Tactical/airsoft experiences
- Indoor skydiving

---

## Geographic Coverage

**Prioritize these regions** (aim for 10-15 activities per major region):

1. **Carpathian Mountains** (Făgăraș, Bucegi, Retezat, Apuseni)
2. **Transylvania** (Brașov, Sibiu, Cluj)
3. **Danube Delta** (Tulcea)
4. **Black Sea Coast** (Constanța, Mangalia, Vama Veche)
5. **Maramureș** (Northern mountains)
6. **Banat** (Western Romania)
7. **Moldova region** (Eastern Romania)
8. **Dobrogea** (Limestone gorges)

**Coverage goal:** 60-80 activities across Romania

---

## CSV Format Required

### **ACTIVITIES CSV:**

**Columns (in this exact order):**
```
slug,name,category,subtypes,description,city,region,latitude,longitude,duration_min,duration_max,seasonality,indoor_outdoor,energy_level,tags_experience_level,tags_mood,tags_terrain,tags_equipment,tags_context,tags_requirement,tags_risk_level,tags_weather_fit,tags_time_of_day,tags_travel_time_band,tags_skills,tags_cost_band,hero_image_url,source_url,notes
```

**CRITICAL: Include the `energy_level` column!**

**Field Requirements:**

- **slug:** `city-activity-name-venue` (lowercase, hyphens, unique)
- **name:** Clear, descriptive activity name
- **category:** Choose from: `adventure`, `sports`, `water`, `winter`, `motorsports`
- **subtypes:** Comma-separated specific types (e.g., `rock_climbing,sport_climbing`)
- **description:** 2-3 sentences describing what participants DO and FEEL. Use active voice, sensory details. 150-200 words.
- **city:** Nearest city/town
- **region:** Romanian region (e.g., Brașov, Cluj, Constanța)
- **latitude, longitude:** Accurate coordinates (decimal format)
- **duration_min, duration_max:** In minutes (e.g., 120, 240)
- **seasonality:** `all`, `summer`, `winter`, `shoulder` (spring/fall)
- **indoor_outdoor:** `indoor`, `outdoor`, `both`
- **energy_level:** `high` (almost all should be high for this batch)
- **tags_experience_level:** `beginner`, `intermediate`, `advanced`, `expert`, `mixed`
- **tags_mood:** Comma-separated: `adrenaline`, `adventurous`, `explorer`, `focused`, `social`
- **tags_terrain:** `mountain`, `forest`, `coast`, `river`, `cliff`, `valley`, `cave`, `urban`
- **tags_equipment:** `provided`, `rental-gear`, `bring-own`, `none`
- **tags_context:** `solo`, `date`, `friends`, `small-group`, `team`
- **tags_requirement:** `guide-required`, `lesson-recommended`, `booking-required`, `booking-optional`
- **tags_risk_level:** `low`, `moderate`, `high`, `exposed`
- **tags_weather_fit:** `all_weather`, `wind_sensitive`, `heat_sensitive`, `cold_sensitive`
- **tags_time_of_day:** `daytime`, `sunrise`, `sunset`, `evening` (comma-separated)
- **tags_travel_time_band:** `in-city`, `nearby`, `day-trip`, `weekend-trip`
- **tags_skills:** `none_required`, `technique`, `endurance`, `balance`, `navigation`, `strength`
- **tags_cost_band:** `$` (under 50 RON), `$$` (50-200 RON), `$$$` (200-500 RON), `$$$$` (500+ RON)
- **hero_image_url:** Leave blank (empty)
- **source_url:** Website or social media link for booking/info
- **notes:** Brief practical note (gear, booking tips)

---

### **VENUES CSV:**

**Columns (in this exact order):**
```
activity_slug,name,address,city,region,latitude,longitude,booking_url,website,phone,price_tier,seasonality,blurb,tags_equipment,tags_requirement,tags_context,tags_cost_band,opening_hours_monday,opening_hours_tuesday,opening_hours_wednesday,opening_hours_thursday,opening_hours_friday,opening_hours_saturday,opening_hours_sunday,source_url,notes
```

**Field Requirements:**

- **activity_slug:** Must match an activity slug exactly
- **name:** Venue/operator name (e.g., "Adventure Carpathians", "Via Ferrata Turda")
- **address:** Street address or location description
- **city, region, latitude, longitude:** Match activity or venue-specific
- **booking_url:** Direct booking link if available
- **website:** Company/venue website
- **phone:** International format: +40 XXX XXX XXX
- **price_tier:** `$`, `$$`, `$$$`, `$$$$`
- **seasonality:** When venue operates: `all`, `summer`, `winter`, `shoulder`
- **blurb:** 1-2 sentence venue description (facilities, unique features)
- **tags_*** fields:** Same values as activity
- **opening_hours_*:** Format: `09:00-18:00`, `by-reservation`, `closed`, `varies`, `24h`
- **source_url:** Same as website or booking page
- **notes:** Venue-specific practical info

---

## Research Guidelines

1. **Verify venues exist** - Use Google Maps, official websites, TripAdvisor, local adventure companies
2. **Accurate coordinates** - Use Google Maps to get precise lat/long
3. **Real operators** - Include actual companies/guides (e.g., "Vertical Spirit", "Romania Wild", "Adventure Carpathians")
4. **Seasonality matters** - Ice climbing = winter, rafting = spring/summer, etc.
5. **Experience levels** - Clearly mark beginner-friendly vs. advanced-only
6. **Safety info** - Note guide requirements, risk levels honestly

---

## Example Activity Row:

```csv
fagaras-ridge-traverse,Făgăraș Ridge Traverse (Multi-day Trek),adventure,"alpine_trekking,high_mountain","Rope up for Romania's most iconic alpine traverse. Three to five days above treeline, you'll cross knife-edge ridges, scramble exposed peaks, and sleep in mountain refuges under star-blanched skies. Expect early starts, long days, and weather that can shift from bluebird to whiteout in minutes. A guide manages route-finding and risk, but your pack stays heavy and your legs do the work. Summit Moldoveanu (2544m) and string together a chain of 2000m+ giants. This is Romania's Haute Route—gritty, stunning, and unforgiving.",Victoria,Argeș,45.599,24.616,4320,7200,summer,outdoor,high,intermediate,"adventurous,explorer,focused","mountain,ridge",bring-own,"small-group,friends",guide-required,exposed,wind_sensitive,"daytime,sunrise",weekend-trip,endurance,$$$,,"https://mountainguide.ro/","Multi-day hut-to-hut; book guides early"
```

---

## Example Venue Row:

```csv
fagaras-ridge-traverse,Mountain Guide Romania,Strada Moților 6,Brașov,Brașov,45.655,25.607,https://mountainguide.ro/contact/,https://mountainguide.ro/,+40 723 456 789,$$$,summer,UIAGM-certified mountain guides for technical alpine routes and multi-day traverses; full gear rental available.,bring-own,guide-required,small-group,$$$,by-reservation,by-reservation,by-reservation,by-reservation,by-reservation,by-reservation,by-reservation,https://mountainguide.ro/,Weather-dependent; 4-6 person groups typical
```

---

## Output Format

Please provide:

1. **Activities CSV** - Complete CSV with header row + all activity rows
2. **Venues CSV** - Complete CSV with header row + all venue rows
3. **Summary** - Brief stats:
   - Total activities by category
   - Geographic distribution
   - Experience level breakdown
   - Seasonal availability

---

## Quality Checklist

Before submitting, verify:

- ✅ All slugs are unique
- ✅ Every activity has a matching venue
- ✅ Coordinates are accurate (check Google Maps)
- ✅ Descriptions are vivid and action-oriented
- ✅ Source URLs are valid and accessible
- ✅ **energy_level column is included for all activities**
- ✅ Risk levels match activity intensity
- ✅ Seasonality is realistic for Romania's climate
- ✅ CSV format is valid (proper quotes for fields with commas)

---

**Target: 60-80 high-quality adventure activities across Romania with verified venues and accurate details.**

**Focus on:** Adrenaline, challenge, breathtaking locations, and authentic Romanian adventure experiences.

Go! 🏔️⚡🚀
