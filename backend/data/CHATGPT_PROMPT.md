# 🤖 ChatGPT Data Collection Prompt

**Copy this entire prompt and paste it into ChatGPT o1 (or GPT-4) for data research**

---

## Your Mission

Research and document **100+ real, bookable activities and venues** across Romania for a travel recommendation app. All data must come from official sources, booking platforms (Expedia, TripAdvisor, GetYourGuide, Viator, Booking.com), or verified business websites.

---

## Output Format

Provide your research in **two CSV files**:
1. `activities.csv` - 100+ activities
2. `venues.csv` - 200-300 venues (2-3 per activity)

---

## CSV Structure

### **activities.csv columns:**
```
slug,name,category,subtypes,description,city,region,latitude,longitude,duration_min,duration_max,seasonality,indoor_outdoor,energy_level,tags_experience_level,tags_mood,tags_terrain,tags_equipment,tags_context,tags_requirement,tags_risk_level,tags_weather_fit,tags_time_of_day,tags_travel_time_band,tags_skills,tags_cost_band,hero_image_url,source_url,notes
```

### **venues.csv columns:**
```
activity_slug,name,address,city,region,latitude,longitude,booking_url,website,phone,price_tier,seasonality,blurb,tags_equipment,tags_requirement,tags_context,tags_cost_band,opening_hours_monday,opening_hours_tuesday,opening_hours_wednesday,opening_hours_thursday,opening_hours_friday,opening_hours_saturday,opening_hours_sunday,source_url,notes
```

---

## Tag Taxonomy (IMPORTANT)

### **Activity Tags** (choose multiple per activity):

**REQUIRED:**
- **category:** adventure, nature, water, culture, wellness, nightlife, social, fitness, sports, seasonal, romance, mindfulness, creative, learning, culinary
- **experience_level:** beginner, intermediate, advanced, mixed
- **energy:** chill, medium, high
- **indoor_outdoor:** indoor, outdoor, either
- **seasonality:** winter, summer, shoulder, all

**RECOMMENDED (add 5-8 more):**
- **mood:** adrenaline, cozy, social, romantic, mindful, creative, explorer, relaxed, adventurous
- **terrain:** urban, forest, mountain, coast, lake, delta, cave, resort, valley, hill
- **context:** family, kids, solo, group, small-group, date, accessible, friends, team
- **requirement:** guide-required, guide-recommended, guide-optional, booking-required, permit-required, lesson-recommended, none
- **equipment:** rental-gear, helmet, harness, provided, skis, kayak, camera
- **risk_level:** low, moderate, exposed, high
- **weather_fit:** ok_in_rain, wind_sensitive, heat_sensitive, cold_friendly, all_weather
- **time_of_day:** sunrise, daytime, sunset, night, any
- **travel_time_band:** nearby, in-city, day-trip, overnight
- **skills:** balance, endurance, technique, navigation, none_required
- **cost_band:** $, $$, $$$, $$$$

**Format in CSV:** Separate multiple tags with commas (no spaces)
- Example: `tags_mood: adventurous,explorer`

---

## Research Sources

**Use these platforms to find real activities:**

1. **Booking Platforms:**
   - GetYourGuide Romania: https://www.getyourguide.com/romania-l237/
   - Viator Romania: https://www.viator.com/Romania/d21-ttd
   - Expedia Things to Do: Search "Romania activities"
   - TripAdvisor Experiences: Check "Things to Do" for each city
   - Booking.com Attractions

2. **Official Tourism:**
   - Romania Tourism: https://www.romania.travel
   - Visit Brașov, Visit Bucharest (regional sites)

3. **Google Maps/Places:**
   - Search "[activity] in [city] Romania"
   - Verify with recent reviews (last 6 months)
   - Get coordinates, phone, website

4. **Direct Business Websites:**
   - Ski resorts: Poiana Brașov, Sinaia
   - Therme București (spa)
   - Museums, wineries, adventure companies

---

## Activity Categories (Target Distribution)

1. **Adventure** (15-20): Rock climbing, via ferrata, paragliding, mountain biking, caving, ziplining
2. **Nature** (10-15): Hiking, wildlife watching, forest trails, park tours, Delta tours
3. **Water** (8-12): Kayaking, paddleboarding, boat tours, swimming, water sports
4. **Wellness** (10-15): Thermal spas, saunas, massage, yoga, meditation
5. **Culture** (15-20): Museums, castle tours, walking tours, photography, folk shows
6. **Culinary** (10-15): Wine tasting, cooking classes, food tours, brewery tours
7. **Creative** (8-12): Pottery, painting, photography, craft workshops
8. **Sports** (10-15): Skiing, snowboarding, tennis, golf, cycling, climbing gyms
9. **Nightlife** (8-10): Pub crawls, live music, clubs
10. **Learning** (8-10): Language, dance, music lessons, workshops

---

## Geographic Coverage

**Major Cities (Priority):**
- București (Bucharest) - 25+ activities
- Brașov - 15+ activities
- Cluj-Napoca - 10+ activities
- Timișoara - 8+ activities
- Iași - 8+ activities
- Constanța (Black Sea coast) - 10+ activities
- Sibiu - 8+ activities

**Regions:**
- Transylvania (Brașov, Sibiu, Cluj, Sighișoara)
- Carpathian Mountains (Sinaia, Predeal, Poiana Brașov)
- Black Sea Coast (Constanța, Mamaia)
- Danube Delta (Tulcea)
- Maramureș, Banat, Moldavia

---

## Quality Requirements

### **For Every Activity:**
✅ **Real & bookable** - Must be an actual activity you can book/visit
✅ **Official source** - From website, GetYourGuide, Viator, TripAdvisor, etc.
✅ **Description** - 40-80 words explaining what you do and why it's fun
✅ **Accurate location** - Correct city, region, coordinates (Google Maps)
✅ **Current** - Business is operating (check recent reviews)
✅ **Well-tagged** - Minimum 10-15 total tags across all tag columns
✅ **Source documented** - `source_url` must be provided

### **For Every Venue:**
✅ **Real business** - Actual venue with address
✅ **Contact info** - Website + phone number
✅ **Bookable** - Booking URL or walk-in option
✅ **Opening hours** - At least approximate hours for each day
✅ **Recent reviews** - Check it's still operating (last 6 months)
✅ **Blurb** - 15-25 words on what makes it special
✅ **Source documented** - Where you found this venue

---

## Example Entry (DO THIS FORMAT)

### Activity Example:
```csv
wine-tasting-dealu-mare,Wine tasting in Dealu Mare,culinary,"wine_tasting,vineyard","Sample local wines with a sommelier who explains terroir, grape varieties, and pairing principles. Tours often include cellar visits and light snacks. It's a relaxed, educational afternoon in one of Romania's top wine regions, perfect for beginners and enthusiasts alike.",Dealu Mare,Prahova,45.0500,26.0100,120,180,all,indoor,chill,beginner,"cozy,romantic","valley,urban",provided,"date,small-group",booking-required,low,all_weather,daytime,day-trip,none_required,$$,,https://www.getyourguide.com/dealu-mare-wine-tour,GetYourGuide - 50+ bookings
```

### Venue Example:
```csv
wine-tasting-dealu-mare,Cramele Recaș,Str. Principală 45,Recaș,Timiș,45.7500,21.4500,https://cramele-recas.ro/booking,https://cramele-recas.ro,+40 256 200 300,$$,,"Award-winning winery with guided tastings, vineyard tours, and traditional Romanian meals in elegant tasting rooms.",provided,booking-required,"group,date",$$,10:00-18:00,10:00-18:00,10:00-18:00,10:00-18:00,10:00-20:00,09:00-20:00,09:00-18:00,https://cramele-recas.ro,4.6★ Google (380 reviews)
```

---

## Special Instructions

1. **Slug format:** lowercase, hyphens, descriptive  
   Example: `thermal-spa-baile-felix`, `ski-poiana-brasov`

2. **Descriptions:** Action-oriented, 40-80 words  
   ❌ Bad: "Great activity in Brașov"  
   ✅ Good: "Trek the dramatic Piatra Craiului ridge with panoramic views..."

3. **Coordinates:** Use Google Maps (decimal degrees)  
   Example: `45.5142, 25.2617`

4. **Phone numbers:** Include country code  
   Example: `+40 268 223 456`

5. **Opening hours:** Format as `HH:MM-HH:MM` or `closed`  
   Example: `10:00-18:00` or `closed`

6. **Tags:** Comma-separated, no spaces  
   Example: `adventurous,explorer` NOT `adventurous, explorer`

7. **Venue blurbs:** 15-25 words, action-led, highlight unique selling points

8. **Source URLs:** Always provide where you found the data

---

## Research Process

### **Step 1: Find Activities (Use These Searches)**
- "things to do in Bucharest" → TripAdvisor
- "Brașov outdoor activities" → GetYourGuide
- "Romania wine tours" → Viator
- "Ski resorts Romania" → Official resort websites
- "thermal spa Romania" → Therme București, Băile Felix

### **Step 2: Verify Each Activity**
- Check official website exists
- Verify it's still operating (recent reviews)
- Get accurate address/coordinates
- Note price range
- Document tags based on description

### **Step 3: Find 2-3 Venues Per Activity**
- Search "[activity] in [city]" on Google Maps
- Check ratings (aim for 4.0+ stars)
- Get official website, phone, address
- Note opening hours
- Verify booking process

### **Step 4: Document Everything**
- Add to CSV with all required columns filled
- Double-check coordinates
- Ensure tags are comprehensive (10+ tags per activity)
- Include source URL

---

## Output Instructions

**After research, provide:**

1. **activities.csv** - One row per activity, all columns filled
2. **venues.csv** - One row per venue, linked to activity via `activity_slug`
3. **Summary stats:**
   - Total activities by category
   - Total venues
   - Cities covered
   - Any issues or notes

---

## Quality Checklist

Before submitting, verify each entry has:

- [ ] Official source (website/booking platform)
- [ ] Accurate coordinates from Google Maps
- [ ] Current contact information
- [ ] Descriptive 40-80 word description (activities)
- [ ] 10-15 comprehensive tags (activities)
- [ ] Opening hours (venues)
- [ ] Recent reviews confirming it's operating
- [ ] Source URL documented
- [ ] No fictional or conceptual activities

---

## Priority Activities to Include

**Must-haves (if available):**
- Therme București (thermal spa)
- Peleș Castle tour (Sinaia)
- Brașov old town walking tour
- Poiana Brașov skiing
- Danube Delta boat tour
- Wine tasting (Dealu Mare or Jidvei)
- Bran Castle tour
- Transfăgărășan scenic drive
- Salt mine tour (Turda or Slănic)
- Village Museum Bucharest
- Painted monasteries tour (Bucovina)
- Bear watching (Brașov area)
- Via ferrata (Piatra Craiului)
- Black Sea kayaking (Constanța)

---

**Start researching and provide the completed CSV files!** 🚀

**Target: 100+ activities, 200-300 venues, all from official/verified sources.**
