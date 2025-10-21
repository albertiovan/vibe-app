# 📋 Vibe App Data Collection Instructions

**Target:** 100+ Real Romanian Activities & Venues  
**Quality Standard:** Official sources, verified information, actionable recommendations  
**Format:** CSV (use provided templates)

---

## 🎯 **Mission**

Research and document **real, bookable activities and venues** across Romania that tourists and locals can actually visit. Focus on popular, well-reviewed experiences with official websites and contact information.

---

## 📚 **Where to Find Activities**

### **Primary Sources (Official):**
1. **Official Tourism Sites:**
   - Visit Romania: https://www.romania.travel
   - Regional tourism boards (e.g., Visit Brașov, Visit Bucharest)
   - City tourism offices

2. **Booking Platforms:**
   - GetYourGuide Romania
   - Viator Romania
   - Expedia Things to Do
   - TripAdvisor Experiences
   - Booking.com Attractions

3. **Official Business Websites:**
   - Ski resorts (e.g., Poiana Brașov, Sinaia)
   - Spa complexes (e.g., Therme București)
   - Adventure companies
   - Museums, galleries
   - Restaurants, wineries

4. **Google Maps / Google Places:**
   - Search for specific activity types
   - Check reviews, photos, official websites
   - Verify business is still operating

### **Activity Discovery Keywords:**
```
"things to do in [city] Romania"
"[activity] in Romania"
"best [experience] in [region]"
"outdoor activities Romania"
"indoor activities [city]"
```

---

## 📊 **Data Quality Standards**

### **✅ REQUIRED FOR EVERY ACTIVITY:**
1. **Real & Bookable** - Must be an actual activity you can do
2. **Official Information** - Data from official website or booking platform
3. **Accurate Location** - Correct city, region, coordinates
4. **Current** - Business is operating (check recent reviews)
5. **Descriptive** - 40-80 word description (what you do, why it's fun)
6. **Tagged** - At least 8-12 faceted tags per activity

### **✅ REQUIRED FOR EVERY VENUE:**
1. **Real Business** - Actual venue with address
2. **Contact Info** - Website + phone (if available)
3. **Bookable** - Booking URL or walk-in possible
4. **Opening Hours** - At least approximate hours
5. **Recent** - Check if still operating (reviews from last 6 months)
6. **Blurb** - 15-25 word description focusing on what makes it special

### **❌ AVOID:**
- Fictional or conceptual activities
- Closed businesses
- Activities without specific venues
- Vague descriptions ("fun activity", "great place")
- Missing contact information
- Outdated data

---

## 🏷️ **Tag Taxonomy Reference**

### **Activity Tags (Choose Multiple)**

#### **REQUIRED Tags:**
- **category:** adventure, nature, water, culture, wellness, nightlife, social, fitness, sports, seasonal, romance, mindfulness, creative, learning, culinary
- **experience_level:** beginner, intermediate, advanced, mixed
- **energy:** chill, medium, high
- **indoor_outdoor:** indoor, outdoor, either
- **seasonality:** winter, summer, shoulder, all

#### **RECOMMENDED Tags:**
- **mood:** adrenaline, cozy, social, romantic, mindful, creative, explorer, relaxed, adventurous
- **terrain:** urban, forest, mountain, coast, lake, delta, cave, resort, valley, hill
- **context:** family, kids, solo, group, small-group, date, accessible, friends, team
- **requirement:** guide-required, guide-recommended, guide-optional, booking-required, permit-required, lesson-recommended, lesson, none
- **equipment:** rental-gear, helmet, harness, lanyard, lifejackets, protective-gear, skis, kayak, camera, provided
- **risk_level:** low, moderate, exposed, high
- **weather_fit:** ok_in_rain, wind_sensitive, heat_sensitive, cold_friendly, all_weather
- **time_of_day:** sunrise, daytime, sunset, night, any
- **travel_time_band:** nearby, in-city, day-trip, overnight
- **skills:** balance, endurance, technique, navigation, camera_basics, wheel_throwing, none_required
- **cost_band:** $, $$, $$$, $$$$

#### **Tag Format:**
In CSV, list tags separated by commas in their respective columns:
- `tags_experience_level`: beginner
- `tags_mood`: adventurous,explorer
- `tags_terrain`: mountain
- `tags_equipment`: rental-gear,helmet

### **Venue Tags**
- **equipment:** What's provided/available
- **requirement:** booking-required, guide-required, etc.
- **context:** family, group, date, kids
- **cost_band:** $, $$, $$$, $$$$

---

## 📋 **CSV Column Definitions**

### **ACTIVITIES_TEMPLATE.csv**

| Column | Type | Description | Example |
|--------|------|-------------|---------|
| `slug` | text | URL-safe identifier | `wine-tasting-dealu-mare` |
| `name` | text | Activity name | `Wine tasting in Dealu Mare` |
| `category` | text | Primary category | `culinary` |
| `subtypes` | list | Comma-separated types | `wine_tasting,vineyard` |
| `description` | text | 40-80 words, what you do | `Sample local wines with a sommelier...` |
| `city` | text | City name | `Dealu Mare` |
| `region` | text | Romanian region | `Prahova` |
| `latitude` | number | Decimal degrees | `45.0500` |
| `longitude` | number | Decimal degrees | `26.0100` |
| `duration_min` | number | Minutes (minimum) | `120` |
| `duration_max` | number | Minutes (maximum) | `180` |
| `seasonality` | text | Best season | `all` or `winter` or `summer` |
| `indoor_outdoor` | text | Environment | `indoor` or `outdoor` or `either` |
| `energy_level` | text | Energy required | `chill` or `medium` or `high` |
| `tags_experience_level` | list | beginner/intermediate/advanced | `beginner` |
| `tags_mood` | list | Mood tags | `romantic,cozy` |
| `tags_terrain` | list | Terrain tags | `valley,urban` |
| `tags_equipment` | list | Equipment tags | `provided` |
| `tags_context` | list | Context tags | `date,small-group` |
| `tags_requirement` | list | Requirement tags | `booking-required` |
| `tags_risk_level` | list | Risk level | `low` |
| `tags_weather_fit` | list | Weather suitability | `all_weather` |
| `tags_time_of_day` | list | Best time | `daytime` or `sunset` |
| `tags_travel_time_band` | list | Travel distance | `day-trip` |
| `tags_skills` | list | Skills needed | `none_required` |
| `tags_cost_band` | list | Cost level | `$$` |
| `hero_image_url` | url | Image URL (optional) | Leave blank for now |
| `source_url` | url | Where you found this | `https://cramele-recas.ro` |
| `notes` | text | Research notes | `Found on TripAdvisor, 500+ reviews` |

### **VENUES_TEMPLATE.csv**

| Column | Type | Description | Example |
|--------|------|-------------|---------|
| `activity_slug` | text | Links to activity | `wine-tasting-dealu-mare` |
| `name` | text | Venue name | `Cramele Recaș` |
| `address` | text | Full street address | `Str. Principală 45, Recaș` |
| `city` | text | City name | `Recaș` |
| `region` | text | Romanian region | `Timiș` |
| `latitude` | number | Decimal degrees | `45.7500` |
| `longitude` | number | Decimal degrees | `21.4500` |
| `booking_url` | url | Booking link | `https://cramele-recas.ro/booking` |
| `website` | url | Official website | `https://cramele-recas.ro` |
| `phone` | text | Phone number | `+40 256 123 456` |
| `price_tier` | text | Cost level | `$$` |
| `seasonality` | text | Seasonal availability | Leave blank if year-round |
| `blurb` | text | 15-25 words | `Award-winning winery with guided tastings...` |
| `tags_equipment` | list | Equipment available | `provided` |
| `tags_requirement` | list | Requirements | `booking-required` |
| `tags_context` | list | Good for | `group,date` |
| `tags_cost_band` | list | Cost level | `$$` |
| `opening_hours_monday` | text | Hours | `10:00-18:00` or `closed` |
| `opening_hours_tuesday` | text | Hours | `10:00-18:00` |
| `opening_hours_wednesday` | text | Hours | `10:00-18:00` |
| `opening_hours_thursday` | text | Hours | `10:00-18:00` |
| `opening_hours_friday` | text | Hours | `10:00-20:00` |
| `opening_hours_saturday` | text | Hours | `09:00-20:00` |
| `opening_hours_sunday` | text | Hours | `09:00-18:00` |
| `source_url` | url | Where you found this | `https://google.com/maps/...` |
| `notes` | text | Research notes | `4.5 stars, 200 reviews` |

---

## 🎯 **Activity Categories & Examples**

### **1. Adventure (15-20 activities)**
- Rock climbing, bouldering
- Via ferrata routes
- Paragliding, tandem flights
- Mountain biking (downhill, cross-country)
- Canyoning
- Caving, cave tours
- Ziplining
- Off-road tours (4x4, ATV)

**Example Sources:**
- Brașov adventure companies
- Carpathian mountain guides
- Outdoor activity operators

### **2. Nature (10-15 activities)**
- Hiking trails (Piatra Craiului, Retezat)
- Wildlife watching (bears, birds)
- Forest bathing
- Botanical gardens
- National park tours
- Delta boat tours
- Scenic drives

**Example Sources:**
- Romania National Parks
- Danube Delta tourism
- Mountain hiking guides

### **3. Water (8-12 activities)**
- Kayaking (sea, river, lake)
- Stand-up paddleboarding
- Boat tours
- Fishing trips
- Swimming spots
- Water sports centers

**Example Sources:**
- Coast resorts (Mamaia, Constanța)
- Lake Vidraru activities
- Danube Delta tours

### **4. Wellness (10-15 activities)**
- Thermal spas (Therme, Felix Spa)
- Sauna experiences
- Massage & treatments
- Yoga retreats
- Meditation centers
- Wellness hotels

**Example Sources:**
- Therme București
- Băile Felix resort
- Wellness hotels

### **5. Culture (15-20 activities)**
- Museum visits (Village Museum, Art Museum)
- Historical tours (castles, fortresses)
- Walking tours (old town, architecture)
- Traditional craft workshops
- Folk performances
- Photography tours

**Example Sources:**
- Museum websites
- Free walking tours
- City tourism boards

### **6. Culinary (10-15 activities)**
- Wine tasting (Dealu Mare, Jidvei)
- Cooking classes
- Food tours
- Restaurant experiences
- Market visits
- Brewery tours

**Example Sources:**
- Romanian wineries
- Culinary tour companies
- TripAdvisor food experiences

### **7. Creative (8-12 activities)**
- Pottery classes
- Painting workshops
- Photography courses
- Craft workshops (woodworking, weaving)
- Art studio visits

**Example Sources:**
- Local art studios
- Community centers
- Artisan workshops

### **8. Sports & Fitness (10-15 activities)**
- Skiing (Poiana Brașov, Sinaia)
- Snowboarding
- Tennis, padel
- Golf
- Cycling routes
- Climbing gyms
- Fitness classes

**Example Sources:**
- Ski resorts
- Sports clubs
- Fitness centers

### **9. Nightlife & Social (8-10 activities)**
- Pub crawls
- Live music venues
- Dance clubs
- Karaoke bars
- Social events

**Example Sources:**
- Bucharest nightlife guides
- Event platforms

### **10. Learning (8-10 activities)**
- Language classes
- Dance lessons
- Music lessons
- Historical lectures
- Skill workshops

**Example Sources:**
- Community centers
- Cultural institutes

---

## 📍 **Romanian Regions to Cover**

### **Major Cities (Priority):**
1. **București** (Bucharest) - 25+ activities
2. **Brașov** - 15+ activities
3. **Cluj-Napoca** - 10+ activities
4. **Timișoara** - 8+ activities
5. **Iași** - 8+ activities
6. **Constanța** (coast) - 10+ activities
7. **Sibiu** - 8+ activities
8. **Oradea** - 5+ activities

### **Regions:**
- Transylvania (Brașov, Sibiu, Cluj, Sighișoara)
- Carpathian Mountains (Sinaia, Predeal, Poiana Brașov)
- Black Sea Coast (Constanța, Mamaia, Vama Veche)
- Danube Delta (Tulcea)
- Maramureș
- Banat (Timișoara)
- Moldavia (Iași, Suceava)

---

## ✅ **Quality Checklist**

Before adding an activity/venue, verify:

- [ ] **Real**: Can you book it or visit it today?
- [ ] **Official**: Data from official website or verified platform?
- [ ] **Accurate**: Location, contact info correct?
- [ ] **Current**: Recent reviews (last 6 months)?
- [ ] **Descriptive**: Clear 40-80 word description?
- [ ] **Tagged**: 8-12 relevant tags?
- [ ] **Bookable**: URL or walk-in info provided?
- [ ] **Source**: Documented where you found it?

---

## 📝 **Example Entries**

### **Good Activity Entry:**
```csv
hiking-piatra-craiului-brasov,Hike Piatra Craiului Ridge,nature,"hiking,mountain_hiking","Trek along the dramatic limestone ridge with panoramic Carpathian views and wildflower meadows. The main ridge route takes 6-8 hours and requires good fitness but rewards with stunning scenery. Mountain huts offer overnight stays. Best done June through September when trails are clear.",Zărnești,Brașov,45.5142,25.2617,360,480,summer,outdoor,high,intermediate,"explorer,adventurous","mountain,forest","hiking-boots,provided",solo,guide-optional,exposed,wind_sensitive,daytime,day-trip,"endurance,navigation",$$,,https://parcpiatra-craiului.ro,Official national park website
```

### **Good Venue Entry:**
```csv
hiking-piatra-craiului-brasov,Cabana Curmătura,Curmătura,Zărnești,Brașov,45.5000,25.2500,https://cabana-curmatura.ro,https://cabana-curmatura.ro,+40 268 223 456,$$,summer,"Mountain refuge at 1470m with rooms and traditional meals. Perfect base camp for Piatra Craiului hikes with local guides available.",,booking-required,"group,friends",$$,07:00-21:00,07:00-21:00,07:00-21:00,07:00-21:00,07:00-21:00,07:00-21:00,07:00-21:00,https://cabana-curmatura.ro,4.3★ on Google (150 reviews)
```

---

## 🚀 **Getting Started**

1. **Start with major cities**: București, Brașov, Cluj
2. **Use booking platforms**: GetYourGuide, Viator, Expedia
3. **Check TripAdvisor**: "Things to Do" section
4. **Verify official websites**: Get contact info
5. **Document sources**: Always include `source_url`
6. **Tag comprehensively**: 8-12 tags per activity
7. **Quality over quantity**: Better to have 100 great entries than 200 mediocre ones

---

## 🎯 **Target Breakdown**

- **100 activities** across 10 categories
- **2-3 venues per activity** (200-300 venues total)
- **All major cities covered**
- **Mix of price points** ($, $$, $$$, $$$$)
- **Mix of experience levels** (beginner to advanced)
- **Year-round options** (not just summer)

---

**Ready to research? Start with the templates and aim for quality, verified data!** 🚀
