# ChatGPT Prompt: Find Websites for 283 Romanian Activities

## Your Task

I need you to research and find the **official website URLs** for **283 activities** in Romania. I've provided a JSON file with all the details you need for each activity.

## What I'm Providing

**File:** `MISSING_WEBSITES_ACTIVITIES.json`

Each activity includes:
- `id` - Activity ID number
- `name` - Full activity name
- `category` - Type of activity (adventure, creative, culinary, etc.)
- `city` - City/location in Romania
- `latitude` & `longitude` - Exact GPS coordinates

## Your Research Instructions

1. **Use all available information** - name, city, category, and coordinates to identify the correct venue
2. **Find the official website** of the venue/operator/business
3. **Verify the website is active** and actually related to this activity
4. **Prioritize in this order:**
   - Official venue website (best)
   - Facebook page if no website exists
   - Booking platform page (last resort)
5. **For generic activities** (e.g., "Indoor Climbing Session"), find the most popular/reputable venue in that city matching the coordinates

## Important Guidelines

✅ **DO:**
- Use the GPS coordinates to verify you found the right venue
- Check if the website is currently active
- Use Facebook URLs if that's the only online presence: `https://www.facebook.com/pagename`
- For activities with "or" in the name (e.g., "VMAX or AMCKart"), choose the first one mentioned
- Return `null` for the website field if absolutely no online presence exists

❌ **DON'T:**
- Use booking aggregators (GetYourGuide, Viator, Booking.com) unless it's the ONLY option
- Guess or make up websites
- Use outdated/defunct websites
- Include query parameters or tracking codes in URLs

## Output Format

Return your results in this **exact JSON format**:

```json
[
  {
    "activity_id": 77,
    "activity_name": "Edenland Park Zipline & Aerial Courses",
    "city": "Balotești",
    "website": "https://edenland.ro"
  },
  {
    "activity_id": 78,
    "activity_name": "Comana Adventure Park & Kayak",
    "city": "Comana",
    "website": "https://parcaventura-comana.ro"
  },
  {
    "activity_id": 79,
    "activity_name": "Tandem Skydiving at Clinceni Airfield",
    "city": "Clinceni",
    "website": null
  }
]
```

## Categories Breakdown

The 283 activities are distributed across these categories:
- **Nightlife:** 46 activities (clubs, bars, lounges)
- **Social:** 43 activities (board games, escape rooms, coworking)
- **Sports:** 41 activities (tennis, badminton, swimming, team sports)
- **Adventure:** 38 activities (skydiving, via ferrata, ziplines, climbing)
- **Culinary:** 23 activities (cooking classes, wine tastings, food tours)
- **Creative:** 19 activities (pottery, painting, woodworking, crafts)
- **Fitness:** 19 activities (gyms, pools, bootcamps)
- **Winter:** 13 activities (skiing, snowboarding, ice climbing)
- **Water:** 11 activities (kayaking, surfing, diving, wakeboarding)
- **Romance:** 7 activities (rooftop dinners, boat rides, stargazing)
- **Wellness:** 7 activities (spas, thermal baths)
- **Motorsports:** 6 activities (karting venues)
- **Nature:** 5 activities (hiking, horseback riding)
- **Racket Sports:** 3 activities (squash, pickleball, table tennis)
- **Culture:** 2 activities (museum workshops)

## How to Proceed

1. **Download** the attached `MISSING_WEBSITES_ACTIVITIES.json` file
2. **Research** each activity systematically (you can batch by category)
3. **Return results** in batches if needed (e.g., 50 at a time)
4. **Use the exact JSON format** shown above

## Example Research Process

For activity: "Tandem Skydiving at Clinceni Airfield"
1. Search: "Clinceni skydiving Romania" + check coordinates (44.359, 25.942)
2. Find: TNT Brothers Skydiving operates there
3. Verify: Check if website exists and is active
4. Result: `{"activity_id": 79, "website": "https://tntbrothers.ro"}`

---

**Ready to start?** Please process the attached JSON file and return the website data in the format specified above. You can work through the categories systematically and return results in batches if that's easier.

Thank you!

