# Activity Database Gaps - Priority List 🎯

## 🚨 Critical Gaps (Fallback Triggered)

These queries have **insufficient activities** and trigger fallback mode:

---

## 1. 🏊 **SWIMMING POOLS** (Critical)

**Query:** "I need a swimming pool"  
**Current:** 0 activities with swimming/pool keywords  
**Fallback:** Returns paddle boarding, yoga, spas (wrong)

### What to Add:
- [ ] Therme București (already exists, needs better tagging)
- [ ] Public pools in Bucharest (Dinamo, Floreasca, etc.)
- [ ] Hotel pools with day passes
- [ ] Aquatic centers in Cluj, Brașov, Timișoara
- [ ] Olympic-size pools for lap swimming
- [ ] Family-friendly pools
- [ ] Indoor vs outdoor pools (seasonal)

**Target:** 10-15 swimming venues

---

## 2. 🎾 **TENNIS COURTS** (Critical)

**Query:** "I need a tennis court"  
**Current:** 1 activity (Tennis Lesson at Herăstrău)  
**Fallback:** Returns padel, basketball courts

### What to Add:
- [ ] Public tennis courts (Herăstrău, Tineretului, etc.)
- [ ] Tennis clubs with hourly booking
- [ ] Indoor tennis facilities
- [ ] Tennis courts in Cluj, Brașov, Timișoara
- [ ] Clay vs hard court options
- [ ] Beginner-friendly courts with coaching

**Target:** 10-15 tennis venues

---

## 3. 🏸 **BADMINTON COURTS** (Critical)

**Query:** "Where can I play badminton"  
**Current:** 0 activities  
**Fallback:** Returns basketball, rugby, other sports

### What to Add:
- [ ] Sports centers with badminton courts
- [ ] Badminton clubs in major cities
- [ ] Indoor facilities (year-round)
- [ ] Drop-in badminton sessions
- [ ] Badminton leagues/social play

**Target:** 5-10 badminton venues

---

## 4. 👨‍🍳 **COOKING CLASSES** (High Priority)

**Query:** "I want to take a cooking class"  
**Current:** 4 activities (but 0 match "cooking class" keywords)  
**Fallback:** Returns cocktail classes, coffee workshops

### What to Add:
- [ ] Romanian traditional cooking classes
- [ ] Italian cooking workshops
- [ ] Asian cuisine classes (sushi, Thai, etc.)
- [ ] Baking and pastry classes
- [ ] Vegetarian/vegan cooking
- [ ] Chef-led professional classes
- [ ] Couples cooking classes

**Target:** 15-20 cooking classes

---

## 5. ✍️ **CALLIGRAPHY WORKSHOPS** (Medium Priority)

**Query:** "I want to learn calligraphy"  
**Current:** 1 activity  
**Fallback:** Returns painting, screen printing

### What to Add:
- [ ] Modern calligraphy workshops
- [ ] Traditional calligraphy classes
- [ ] Hand lettering for beginners
- [ ] Brush lettering workshops
- [ ] Digital calligraphy (iPad/Procreate)

**Target:** 5-8 calligraphy workshops

---

## 6. 🚶 **SELF-GUIDED ACTIVITIES** (Medium Priority)

**Query:** "I want self-guided activities"  
**Current:** 6 activities (0 match keywords)  
**Fallback:** Returns nature walks, spas

### What to Add:
- [ ] Audio walking tours (Old Town, Lipscani, etc.)
- [ ] Self-guided museum visits
- [ ] Hiking trails with maps (no guide needed)
- [ ] Bike rental + route maps
- [ ] Photography walks (self-paced)
- [ ] Scavenger hunts
- [ ] Self-guided food tours

**Target:** 15-20 self-guided options

---

## 7. ⏱️ **TIME-DURATION TAGGING** (High Priority)

**Queries:** "I have 30 minutes", "I have 1 hour", "I have 2-3 hours"  
**Current:** 0 activities with time_duration tags  
**Fallback:** Returns random activities

### What to Add:
**Not new activities, but TAGS to existing ones:**

- [ ] Tag all activities with `time_duration`:
  - `30min` - Quick resets, coffee stops, express workouts
  - `1hr` - Yoga classes, museum visits, short workshops
  - `2-3hr` - Cooking classes, painting workshops, sports
  - `half-day` - Day trips, longer workshops, spa days
  - `full-day` - Tours, adventure activities, multi-activity days

**Target:** Tag all 2000+ activities

---

## 8. 🎓 **BEGINNER-FRIENDLY CLASSES** (Medium Priority)

**Query:** "I want professional instruction"  
**Current:** 3 activities (0 match with beginner tag)  
**Fallback:** Returns random learning activities

### What to Add:
**Not new activities, but TAGS to existing ones:**

- [ ] Tag classes with `experience_level:beginner`
- [ ] Tag classes with `requirement:lesson-recommended`
- [ ] Ensure "intro", "basics", "beginner" classes are properly tagged

**Target:** Tag 50-100 beginner classes

---

## 📊 Summary by Priority

### **CRITICAL (Add Activities):**
1. 🏊 Swimming Pools - 10-15 venues
2. 🎾 Tennis Courts - 10-15 venues
3. 🏸 Badminton Courts - 5-10 venues
4. 👨‍🍳 Cooking Classes - 15-20 classes

**Total New Activities Needed:** 40-60

### **HIGH PRIORITY (Tagging):**
5. ⏱️ Time Duration Tags - Tag all 2000+ activities
6. 🎓 Beginner Tags - Tag 50-100 classes

### **MEDIUM PRIORITY (Add Activities):**
7. ✍️ Calligraphy Workshops - 5-8 workshops
8. 🚶 Self-Guided Activities - 15-20 options

**Total New Activities Needed:** 20-28

---

## 🎯 Quick Wins (Do First)

### **Week 1: Critical Sports Facilities**
- [ ] Add 10 swimming pools
- [ ] Add 10 tennis courts
- [ ] Add 5 badminton courts

### **Week 2: Cooking & Classes**
- [ ] Add 15 cooking classes
- [ ] Add 5 calligraphy workshops

### **Week 3: Tagging Blitz**
- [ ] Add time_duration tags to all activities
- [ ] Add experience_level:beginner to classes
- [ ] Add context:solo to self-guided activities

### **Week 4: Self-Guided Expansion**
- [ ] Add 15 self-guided tours/activities
- [ ] Create audio tour partnerships

---

## 📝 Data Collection Templates

### **Swimming Pool Template:**
```json
{
  "name": "Dinamo Swimming Pool",
  "category": "water",
  "tags": [
    "category:water",
    "category:fitness",
    "indoor_outdoor:indoor",
    "equipment:rental-gear",
    "time_duration:1-2hr",
    "cost_band:$"
  ],
  "keywords": ["swimming", "pool", "lap", "aquatic"],
  "description": "Olympic-size indoor pool for lap swimming and training"
}
```

### **Tennis Court Template:**
```json
{
  "name": "Herăstrău Tennis Courts",
  "category": "sports",
  "tags": [
    "category:sports",
    "indoor_outdoor:outdoor",
    "equipment:rental-gear",
    "time_duration:1-2hr",
    "cost_band:$"
  ],
  "keywords": ["tennis", "court", "outdoor", "sport"],
  "description": "Public outdoor tennis courts with equipment rental"
}
```

### **Cooking Class Template:**
```json
{
  "name": "Italian Pasta Making Workshop",
  "category": "culinary",
  "tags": [
    "category:culinary",
    "requirement:lesson-recommended",
    "experience_level:beginner",
    "equipment:provided",
    "time_duration:2-3hr",
    "cost_band:$$"
  ],
  "keywords": ["cooking", "class", "lesson", "chef", "pasta", "Italian"],
  "description": "Hands-on pasta making class with professional chef"
}
```

---

## 🚀 Impact Projection

### **Before (Current):**
- Swimming queries: 0% success → fallback
- Tennis queries: 10% success → fallback
- Badminton queries: 0% success → fallback
- Cooking queries: 20% success → fallback

### **After (With Additions):**
- Swimming queries: 95%+ success ✅
- Tennis queries: 95%+ success ✅
- Badminton queries: 95%+ success ✅
- Cooking queries: 95%+ success ✅

**Overall Success Rate:** 96% → **99%+** 🎉

---

## 📍 Geographic Coverage

### **Priority Cities:**
1. **Bucharest** - Add all missing types
2. **Cluj-Napoca** - Add sports facilities
3. **Brașov** - Add cooking classes
4. **Timișoara** - Add sports facilities
5. **Constanța** - Add aquatic activities

---

## ✅ Success Metrics

Track these after adding activities:

- [ ] Fallback rate drops from 4% to <1%
- [ ] Average response time stays <4 seconds
- [ ] User satisfaction increases
- [ ] Zero "no results" errors for common queries
- [ ] 99%+ success rate on simulation

---

**Next Steps:**
1. Review this list with team
2. Prioritize based on user demand
3. Start data collection (Week 1)
4. Add activities to database
5. Re-run simulation to verify improvements
