# Website Research Package Ready for ChatGPT

## Summary

Created a comprehensive ChatGPT prompt to research and find website URLs for **283 activities** that are currently missing this data.

## Files Created

### 1. CHATGPT_FIND_MISSING_WEBSITES_PROMPT.md
**Purpose:** Complete instructions for ChatGPT to research websites

**Contents:**
- Clear task description
- Research guidelines (prioritize official sites, use Facebook as fallback)
- Exact JSON output format required
- Category breakdown (46 nightlife, 43 social, 41 sports, etc.)
- Example research process
- Quality guidelines (avoid aggregators, verify active sites)

### 2. backend/MISSING_WEBSITES_ACTIVITIES.json
**Purpose:** Data file with all 283 activities needing websites

**Contents:**
- Activity ID
- Full activity name
- Category
- City location
- GPS coordinates (latitude/longitude)

**Size:** 2,265 lines of JSON data

## Current Database Status

- **Total activities:** 516
- **With websites:** 233 (45%)
- **Missing websites:** 283 (55%)
- **All have location data:** ✅ (latitude/longitude complete)

## Impact of Missing Websites

Activities without websites cannot show the **"Learn More" button** in the app. However:
- ✅ "GO NOW" button works (uses GPS coordinates)
- ✅ Distance filtering works
- ✅ Location display works
- ❌ "Learn More" button disabled

## Next Steps

1. **Copy the prompt** from `CHATGPT_FIND_MISSING_WEBSITES_PROMPT.md`
2. **Attach the JSON file** `backend/MISSING_WEBSITES_ACTIVITIES.json`
3. **Paste into ChatGPT** (GPT-4 recommended for accuracy)
4. **Collect results** in batches (ChatGPT may do 50-100 at a time)
5. **Import results** using the existing `update-missing-venue-data.ts` script

## Import Process (After Getting Results)

Once ChatGPT returns the website data:

```bash
# 1. Save ChatGPT's JSON output to a file
# backend/WEBSITE_UPDATES.json

# 2. Modify the update script to only update websites
# backend/scripts/update-websites-only.ts

# 3. Run the import
cd backend
DATABASE_URL=postgresql://localhost/vibe_app npx ts-node scripts/update-websites-only.ts
```

## Categories to Research

| Category | Count | Examples |
|----------|-------|----------|
| Nightlife | 46 | Control Club, Expirat, BOA |
| Social | 43 | Board games, escape rooms, VR |
| Sports | 41 | Tennis, badminton, swimming |
| Adventure | 38 | Skydiving, via ferrata, ziplines |
| Culinary | 23 | Cooking classes, wine tastings |
| Creative | 19 | Pottery, painting, woodworking |
| Fitness | 19 | Gyms, pools, bootcamps |
| Winter | 13 | Skiing, ice climbing |
| Water | 11 | Kayaking, surfing, diving |
| Romance | 7 | Rooftop dinners, boat rides |
| Wellness | 7 | Spas, thermal baths |
| Motorsports | 6 | Karting venues |
| Nature | 5 | Hiking, horseback riding |
| Racket Sports | 3 | Squash, pickleball |
| Culture | 2 | Museum workshops |

## Quality Expectations

ChatGPT should find websites for approximately:
- **70-80%** of activities (200-225 websites)
- **20-30%** may have no website (use Facebook or null)

This is normal - many smaller venues in Romania only have Facebook pages or no online presence.

---

**Status:** ✅ Ready to send to ChatGPT
**Files:** 2 files created
**Activities:** 283 ready for research
