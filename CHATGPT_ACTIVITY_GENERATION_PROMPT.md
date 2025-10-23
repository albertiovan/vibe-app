# ChatGPT Activity Generation Prompt

**Use this prompt with ChatGPT-4 or Claude to generate activities optimized for semantic vibe understanding**

---

## 🎯 MASTER PROMPT FOR CHATGPT

```
You are helping me curate activities for an intelligent recommendation system that uses SEMANTIC VIBE UNDERSTANDING, not just keyword matching.

CRITICAL: Our AI deeply analyzes user intent, emotion, and underlying needs. For example:
- "I miss legos" → AI understands: building, creating, tactile making, pride in finishing physical objects
- "I want sports" → AI understands: physical exertion, competition, achievement, possibly social

YOUR TASK: Generate activities that are SEMANTICALLY RICH and properly tagged.

---

## ACTIVITY REQUIREMENTS:

### 1. DESCRIPTION (Most Important!)
Write descriptions that reveal the UNDERLYING EXPERIENCE, not just what it is.

❌ BAD: "Pottery class where you make bowls"
✅ GOOD: "Shape clay with your hands in a step-by-step process, learning wedging, centering, and pulling techniques. Leave with a tangible object you built from scratch - that satisfying feeling of creating something physical."

Include these semantic elements:
- WHAT YOU DO with your hands/body (tactile, physical details)
- HOW IT FEELS emotionally (proud, calm, excited, accomplished)
- WHAT YOU GET from it (tangible object, skill, experience, social connection)
- STEP-BY-STEP vs FREEFORM nature
- SOLO vs SOCIAL experience

### 2. CATEGORY (Required)
Choose ONE primary category:
- creative, sports, fitness, adventure, wellness, mindfulness, nature, culinary, culture, learning, water, social, romance, seasonal, nightlife

### 3. ENERGY LEVEL (Required - Critical for Matching!)
Be HONEST about energy:
- **low**: Spa, massage, meditation, slow walks, reading, gentle stretching
- **medium**: Pottery, painting, badminton, casual cycling, cooking class
- **high**: CrossFit, rock climbing, intense sports, running, dance fitness

❌ DON'T say pottery is "low" energy - it requires focus and arm strength (medium)
❌ DON'T say walking is "high" energy - it's low

### 4. INDOOR/OUTDOOR (Required)
- indoor: Most classes, gyms, studios, museums
- outdoor: Parks, trails, sports fields, outdoor adventures
- both: Activities that work in either (like yoga, running)

### 5. TAGS (Required - Multiple Dimensions)

**Must include tags for:**

**Experience Level:**
- beginner, intermediate, advanced, mixed

**Mood tags** (what feeling it creates - MOST IMPORTANT for semantic matching):
- creative, relaxed, cozy, mindful, romantic, social, adrenaline, adventurous, explorer, focused

**Context** (who it's for):
- solo, date, friends, family, small-group, group, team

**Equipment:**
- provided, rental-gear, none, camera, laptop, phone

**Requirement:**
- booking-required, booking-optional, lesson-recommended, guide-required

**Cost:**
- $, $$, $$$, $$$$ (or free)

**Terrain** (if outdoor):
- urban, forest, mountain, coast, lake, cave, valley, park, hill

**Time of day:**
- morning, daytime, evening, night, sunset, sunrise, any

---

## OUTPUT FORMAT:

Generate activities as CSV rows with these columns:

slug,name,category,subtypes,description,city,region,latitude,longitude,duration_min,duration_max,seasonality,indoor_outdoor,energy_level,tags_experience_level,tags_mood,tags_terrain,tags_equipment,tags_context,tags_requirement,tags_risk_level,tags_weather_fit,tags_time_of_day,tags_travel_time_band,tags_skills,tags_cost_band,hero_image_url,source_url,notes

### COLUMN GUIDELINES:

- **slug**: lowercase-hyphenated-unique-id
- **name**: Clear, descriptive name (60 chars max)
- **category**: One of the 15 categories
- **subtypes**: Comma-separated (pottery,wheel_throwing)
- **description**: SEMANTIC-RICH 150-250 chars describing the EXPERIENCE
- **city/region**: Exact city and administrative region
- **lat/lon**: Accurate coordinates
- **duration_min/max**: Minutes (be realistic!)
- **seasonality**: all, summer, winter, shoulder (spring/summer/fall)
- **indoor_outdoor**: indoor, outdoor, both
- **energy_level**: low, medium, high (BE HONEST!)
- **tags_***: Comma-separated values (no spaces after commas!)

### TAG FORMAT (IMPORTANT):
```csv
tags_mood: "creative,mindful,cozy"  ← Correct
tags_mood: "creative, mindful, cozy"  ← Wrong (spaces!)
```

---

## EXAMPLES:

### Example 1: Building/Creating Activity (for "I miss legos" vibe)

```csv
bucharest-woodworking-basics,Woodworking Fundamentals Workshop,creative,"woodworking,making","Learn to saw, plane, and sand wood by hand to build a small functional object. Step-by-step instruction guides you through measuring, cutting, and assembly - that satisfying feeling of creating something real with your own hands that you can use or gift.",Bucharest,București,44.432,26.105,180,240,all,indoor,medium,beginner,"creative,mindful,focused,explorer","urban",provided,"solo,small-group",booking-required,moderate,all_weather,daytime,in-city,technique,$$,,https://example.com/woodworking,"Materials and safety gear included"
```

### Example 2: High-Energy Sports Activity (for "I want sports" vibe)

```csv
bucharest-squash-session,Squash Court Booking & Coaching,sports,"squash,racket_sport","Fast-paced racket sport in an indoor court - sprint, pivot, and strike the ball in intense rallies. Great cardio workout with competitive edge. Coaching available for beginners to learn technique and strategy.",Bucharest,București,44.445,26.098,60,90,all,indoor,high,beginner,"adrenaline,social,competitive","urban",rental-gear,"solo,friends",booking-required,low,all_weather,"daytime,evening",in-city,technique,$$,,https://example.com/squash,"Equipment rental available"
```

### Example 3: Relaxing Wellness (for "I'm exhausted" vibe)

```csv
bucharest-aromatherapy-massage,Aromatherapy Deep Tissue Massage,wellness,"massage,aromatherapy","Sink into 90 minutes of slow, therapeutic massage with warm essential oils. Therapist uses gentle pressure to release tension and calm your nervous system. Leave feeling physically lighter and mentally reset.",Bucharest,București,44.448,26.102,60,90,all,indoor,low,beginner,"relaxed,cozy,mindful","urban",provided,"solo,date",booking-required,low,all_weather,"evening,daytime",in-city,none_required,$$,,https://example.com/spa,"Quiet rooms, calming music"
```

---

## SEMANTIC DESCRIPTION CHECKLIST:

For EACH activity description, include:

✅ **Physical actions** (what you DO with hands/body)
✅ **Emotional outcome** (how you FEEL after)
✅ **Tangible results** (what you GET or make)
✅ **Process clarity** (step-by-step vs freeform)
✅ **Social dynamics** (solo focus vs group energy)
✅ **Underlying need it fills** (achievement, relaxation, connection, learning)

---

## REQUEST FORMAT:

When I ask you to generate activities, use this structure:

"Generate 10 [category] activities for [city/region] that appeal to someone who feels [vibe/emotion]. Focus on [specific type] experiences. Include full CSV rows with semantic-rich descriptions."

Example request:
"Generate 10 creative activities for Bucharest that appeal to someone who misses the feeling of building things with their hands (like legos). Focus on hands-on making experiences. Include full CSV rows."

---

## QUALITY CHECKS:

Before submitting, verify EACH activity:

1. ✅ Description reveals UNDERLYING EXPERIENCE (not just "what it is")
2. ✅ Energy level is HONEST (pottery = medium, not low!)
3. ✅ Mood tags match the FEELING it creates
4. ✅ All required tags included (experience_level, mood, context, equipment)
5. ✅ No spaces after commas in tag lists
6. ✅ Duration is realistic (don't say 30 min for a full workshop)
7. ✅ Indoor/outdoor matches reality
8. ✅ Coordinates are accurate

---

## WHAT MAKES A GREAT ACTIVITY FOR SEMANTIC MATCHING:

❌ "Pottery class - learn to make bowls" (surface-level)

✅ "Shape wet clay with your hands through centering, pulling, and trimming techniques. Build a bowl from scratch in a step-by-step process, getting your hands dirty and seeing tangible results of focused work. That proud feeling when you finish something physical."

The second one helps our AI understand it's perfect for someone who says "I miss legos" because it captures:
- Building/creating something
- Step-by-step process
- Hands-on/tactile
- Tangible result
- Sense of accomplishment

---

## READY TO USE:

Copy this entire prompt when starting a session with ChatGPT, then make requests like:

"Generate 15 high-energy sports activities for Bucharest suitable for beginners. Include team sports, racket sports, and fitness classes. Full CSV format with semantic-rich descriptions."

Or:

"Generate 10 creative hands-on making activities for Cluj that appeal to someone who wants to build/create physical objects. Think pottery, woodworking, jewelry, crafts. Full CSV format."

The AI will generate properly formatted, semantically rich activities ready for import! 🎯
```

---

## 🎯 QUICK REFERENCE: Tag Options

### Energy Levels
- `low` - Spa, meditation, gentle walks
- `medium` - Pottery, painting, casual sports
- `high` - CrossFit, climbing, intense sports

### Moods (Most Important!)
- `creative` - Making, building, artistic
- `relaxed` - Calm, peaceful, gentle
- `cozy` - Warm, comfortable, intimate
- `mindful` - Present, focused, meditative
- `romantic` - Intimate, beautiful, special
- `social` - Group energy, connection, friends
- `adrenaline` - Exciting, thrilling, intense
- `adventurous` - Exploration, new experiences
- `explorer` - Curious, discovering, learning
- `focused` - Concentration, skill-building

### Context
- `solo` - Best alone
- `date` - Romantic couples
- `friends` - Social groups
- `family` - All ages
- `small-group` - 3-8 people
- `group` - 8-20 people
- `team` - Organized teams

---

## 📊 Example ChatGPT Request

```
Using the prompt above, generate 15 activities for Bucharest in these categories:

1. 5 HIGH-ENERGY sports/fitness activities for "I want an intense workout"
2. 5 CREATIVE hands-on making activities for "I miss building things with my hands"
3. 5 LOW-ENERGY wellness activities for "I'm exhausted and need to unwind"

Each activity must have:
- Semantic-rich descriptions (what you DO, how it FEELS, what you GET)
- Honest energy levels
- Full tag sets
- Accurate coordinates for Bucharest

Format as CSV rows ready for import.
```
