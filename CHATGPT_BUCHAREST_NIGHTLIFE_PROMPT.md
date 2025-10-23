# ChatGPT Prompt: Bucharest Nightlife & Social Scene

## Instructions

I need you to research and create a comprehensive list of **nightlife and social venues** in Bucharest, Romania. Focus on venues where people go to socialize, drink, dance, listen to music, and experience the city's vibrant after-dark culture.

---

## Target Activities Categories

Focus on these types of nightlife experiences:

### **Nightlife - Clubs & Dance Venues:**
- Techno & electronic music clubs
- House & deep house venues
- Rock & alternative clubs
- Hip-hop & R&B clubs
- Latin dance clubs (salsa, bachata, reggaeton)
- LGBTQ+ friendly clubs
- Rooftop clubs

### **Nightlife - Bars & Pubs:**
- Cocktail bars (upscale & craft)
- Dive bars & underground spots
- Sports bars
- Irish pubs & international bars
- Wine bars
- Beer gardens & craft beer bars
- Speakeasy-style bars

### **Nightlife - Live Music & Entertainment:**
- Jazz clubs & live jazz venues
- Rock & indie music venues
- Blues bars
- Open mic venues
- Stand-up comedy clubs
- Karaoke bars

### **Social - Lounges & Social Hubs:**
- Hookah lounges
- Board game cafes (evening hours)
- Late-night cafes
- Social clubs & members clubs

---

## Geographic Coverage

**Focus exclusively on Bucharest neighborhoods:**

1. **Old Town (Centrul Vechi)** - Tourist hub, packed bars & clubs
2. **Lipscani District** - Nightlife epicenter
3. **Universitate** - Student bars, alternative scene
4. **Floreasca** - Upscale clubs, rooftop bars
5. **Obor & Romana** - Local bars, hidden gems
6. **Herăstrău Park area** - Elegant venues
7. **Cotroceni** - Quieter cocktail spots
8. **Titan & Pantelimon** - Emerging neighborhoods

**Coverage goal:** 40-60 nightlife activities across Bucharest

---

## CSV Format Required

### **ACTIVITIES CSV:**

**Columns (in this exact order):**
```
slug,name,category,subtypes,description,city,region,latitude,longitude,duration_min,duration_max,seasonality,indoor_outdoor,energy_level,tags_experience_level,tags_mood,tags_terrain,tags_equipment,tags_context,tags_requirement,tags_risk_level,tags_weather_fit,tags_time_of_day,tags_travel_time_band,tags_skills,tags_cost_band,hero_image_url,source_url,notes
```

**CRITICAL: Include the `energy_level` column!**

**Field Requirements:**

- **slug:** `bucharest-activity-name-venue` (lowercase, hyphens, unique)
- **name:** Clear, appealing activity name (e.g., "Techno Night at Club X", "Craft Cocktails at Y Bar")
- **category:** Choose from: `nightlife`, `social`
- **subtypes:** Comma-separated specific types:
  - **Nightlife:** `club`, `dance_venue`, `cocktail_bar`, `dive_bar`, `wine_bar`, `beer_bar`, `sports_bar`, `pub`, `jazz_club`, `live_music`, `karaoke`, `rooftop_bar`, `speakeasy`, `lounge`
  - **Social:** `hookah_lounge`, `late_night_cafe`, `board_game_cafe`
- **description:** 2-3 sentences describing the VIBE, atmosphere, crowd, music style, and what makes it special. Use sensory details (sound, lighting, energy). 150-200 words.
- **city:** `Bucharest`
- **region:** Neighborhood (e.g., `Lipscani`, `Old Town`, `Floreasca`, `Universitate`)
- **latitude, longitude:** Accurate coordinates (decimal format) - use Google Maps
- **duration_min, duration_max:** In minutes (typically 120-300 for bars, 180-360 for clubs)
- **seasonality:** `all` (most nightlife is year-round)
- **indoor_outdoor:** `indoor`, `outdoor` (rooftop bars), `both` (venues with terraces)
- **energy_level:** 
  - `high` - Dance clubs, techno venues, crowded bars
  - `medium` - Lounges, cocktail bars, jazz clubs, pubs
  - `low` - Wine bars, quiet speakeasies, late-night cafes
- **tags_experience_level:** `beginner`, `intermediate`, `mixed` (for nightlife scene familiarity)
- **tags_mood:** Comma-separated: `party`, `social`, `romantic`, `energetic`, `chill`, `sophisticated`, `rebellious`, `underground`, `luxe`
- **tags_terrain:** `urban` (all nightlife)
- **tags_equipment:** `none` (or `formal-attire` for upscale clubs)
- **tags_context:** `date`, `friends`, `solo`, `small-group`, `large-group`
- **tags_requirement:** `reservation-recommended`, `cover-charge`, `guest-list`, `open-access`, `members-only`
- **tags_risk_level:** `low` (standard nightlife), `moderate` (crowded/late venues)
- **tags_weather_fit:** `all_weather` (indoor), `clear_weather` (rooftops)
- **tags_time_of_day:** `evening`, `night`, `late-night` (past midnight)
- **tags_travel_time_band:** `in-city` (all Bucharest venues)
- **tags_skills:** `none_required`, `dancing`, `social`
- **tags_cost_band:** 
  - `$` - Under 50 RON (dive bars, local pubs)
  - `$$` - 50-150 RON (standard bars, clubs with cover)
  - `$$$` - 150-300 RON (upscale cocktail bars, premium clubs)
  - `$$$$` - 300+ RON (VIP clubs, exclusive venues)
- **hero_image_url:** Leave blank (empty)
- **source_url:** Venue website, Instagram, Facebook page, or Google Maps link
- **notes:** Practical info (dress code, cover charge, best nights, crowd type)

---

### **VENUES CSV:**

**Columns (in this exact order):**
```
activity_slug,name,address,city,region,latitude,longitude,booking_url,website,phone,price_tier,seasonality,blurb,tags_equipment,tags_requirement,tags_context,tags_cost_band,opening_hours_monday,opening_hours_tuesday,opening_hours_wednesday,opening_hours_thursday,opening_hours_friday,opening_hours_saturday,opening_hours_sunday,source_url,notes
```

**Field Requirements:**

- **activity_slug:** Must match an activity slug exactly
- **name:** Venue name (e.g., "Guesthouse", "Control Club", "The Urbanist", "Shelter Cocktail Bar")
- **address:** Full street address in Bucharest
- **city:** `Bucharest`
- **region:** Neighborhood (match activity region)
- **latitude, longitude:** Venue coordinates
- **booking_url:** Reservation link or Facebook events page
- **website:** Venue website (or leave empty if none)
- **phone:** International format: +40 XXX XXX XXX
- **price_tier:** `$`, `$$`, `$$$`, `$$$$`
- **seasonality:** `all` (most venues year-round)
- **blurb:** 1-2 sentences describing venue atmosphere, signature drinks/music, unique features
- **tags_*** fields:** Same values as activity
- **opening_hours_*:** Format: 
  - `closed` (many clubs closed Mon-Wed)
  - `18:00-02:00` (bars)
  - `22:00-06:00` (clubs)
  - `varies` (event-based venues)
- **source_url:** Venue Instagram, Facebook, or Google Maps link
- **notes:** Cover charge amounts, dress code, entry requirements

---

## Research Guidelines

1. **Verify venues exist** - Use Google Maps, Instagram, Facebook, TripAdvisor, local Bucharest blogs
2. **Accurate coordinates** - Use Google Maps to get precise lat/long
3. **Real venues** - Include actual operating venues (check recent reviews/posts)
4. **Current scene** - Bucharest nightlife changes fast; verify venues are still operating
5. **Music genres** - Be specific about music styles and DJs
6. **Crowd & vibe** - Describe the typical clientele (students, expats, locals, tourists, LGBTQ+, etc.)
7. **Price transparency** - Note cover charges, average drink prices

---

## Venue Diversity Guidelines

**Create a SPECTRUM of venues across:**

### **Price Range:**
- **Budget ($):** 10-15 dive bars, student pubs, local hangouts (50 RON or less)
- **Mid-range ($$):** 15-20 standard clubs, cocktail bars (50-150 RON)
- **Upscale ($$$):** 10-12 premium cocktail bars, rooftop venues (150-300 RON)
- **Luxury ($$$$):** 5-8 VIP clubs, exclusive lounges (300+ RON)

### **Energy Levels:**
- **High energy:** 20-25 activities (dance clubs, techno venues, packed bars)
- **Medium energy:** 15-20 activities (lounges, jazz clubs, cocktail bars)
- **Low energy:** 5-10 activities (wine bars, quiet speakeasies, late-night cafes)

### **Music Styles:**
- Electronic/Techno (Bucharest is known for this!)
- House & Deep House
- Rock & Alternative
- Hip-Hop & R&B
- Jazz & Live Music
- Mixed/Commercial
- No music (conversation bars)

### **Atmosphere:**
- Underground/Industrial (warehouse clubs)
- Elegant/Sophisticated (cocktail lounges)
- Casual/Dive (neighborhood bars)
- Touristy/Central (Old Town)
- Local/Hidden (residential neighborhoods)
- LGBTQ+ Friendly
- Rooftop/Open-air

---

## Example Activity Row:

```csv
bucharest-underground-techno-club-x,Underground Techno Night at Club X,nightlife,"club,dance_venue,techno","Descend into a brutalist basement where the bass rattles your ribcage and the strobe lights carve shadows through fog. This is Bucharest's techno temple—dark, sweaty, and relentless. DJs spin minimal techno and industrial rhythms until sunrise, while the crowd (locals, expats, serious ravers) loses itself on a packed concrete floor. No phones on the dancefloor, no photos, just pure sonic immersion. Expect a young, dressed-down crowd that knows the music. Cover charge varies by DJ lineup. Cash bar serves cheap beer and spirits. This is where Bucharest's underground electronic scene thrives—raw, unpretentious, and unapologetically intense.",Bucharest,Lipscani,44.432,26.102,240,420,all,indoor,high,intermediate,"party,energetic,underground,rebellious",urban,none,"friends,small-group",cover-charge,moderate,all_weather,"night,late-night",in-city,none,$$,,https://facebook.com/clubx,"No photos policy; cash only; 20-40 RON cover"
```

---

## Example Venue Row:

```csv
bucharest-underground-techno-club-x,Club X,Strada Gabroveni 12,Bucharest,Lipscani,44.432,26.102,,https://facebook.com/clubx,+40 722 123 456,$$,all,Concrete bunker-style club with world-class sound system and rotating international techno DJs; strict no-phones policy creates immersive experience.,none,cover-charge,"friends,small-group",$$,closed,closed,closed,22:00-06:00,23:00-08:00,23:00-08:00,closed,https://facebook.com/clubx,Cover: 20-40 RON depending on lineup; cash bar
```

---

## Output Format

Please provide:

1. **Activities CSV** - Complete CSV with header row + all activity rows
2. **Venues CSV** - Complete CSV with header row + all venue rows
3. **Summary** - Brief stats:
   - Total activities by category and subtype
   - Neighborhood distribution
   - Energy level breakdown (high/medium/low)
   - Price tier breakdown ($, $$, $$$, $$$$)
   - Music genre coverage

---

## Quality Checklist

Before submitting, verify:

- ✅ All slugs are unique
- ✅ Every activity has a matching venue
- ✅ Coordinates are accurate (check Google Maps)
- ✅ Descriptions capture the VIBE and atmosphere
- ✅ Source URLs are valid (Instagram/Facebook/Google Maps)
- ✅ **energy_level column is included for all activities**
- ✅ Price tiers reflect actual costs (check recent reviews)
- ✅ Opening hours are realistic for Bucharest nightlife
- ✅ CSV format is valid (proper quotes for fields with commas)
- ✅ Diverse spectrum: budget to luxury, underground to upscale
- ✅ Real venues that currently exist (check Google Maps/social media)

---

**Target: 40-60 high-quality nightlife activities in Bucharest with verified venues, accurate details, and diverse price/energy/vibe spectrum.**

**Focus on:** Authentic Bucharest nightlife culture, techno scene, hidden gems, and venues that showcase the city's legendary party reputation.

Go! 🍸🎧🌃✨
