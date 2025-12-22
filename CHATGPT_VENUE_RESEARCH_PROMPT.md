# ChatGPT Venue Research Prompt

## Instructions for ChatGPT

I need you to research and find **real, verified venues with websites** for 202 activities in Romania. I've uploaded a CSV file with the activity list.

### Your Task:

For each activity in the CSV, research and find:
1. **A real, existing venue** in the specified city that offers this activity
2. **The venue's official website** (must be a real, working website)
3. **The venue's full address**
4. **GPS coordinates** (latitude and longitude)

### Quality Requirements:

- ✅ **ONLY real venues** - no made-up or fictional venues
- ✅ **Verified websites** - must be actual working websites (check that they exist)
- ✅ **Accurate addresses** - full street address in Romania
- ✅ **Correct GPS coordinates** - must match the actual venue location
- ✅ **Appropriate venues** - must actually offer the activity described

### Research Guidelines:

1. **For specific venues mentioned in activity names** (e.g., "ASTRA Museum", "NOD Makerspace", "Assamblage Institute"):
   - Use the exact venue mentioned
   - Find their real website and address

2. **For generic activities** (e.g., "Yoga Class", "Escape Room"):
   - Find a popular, well-reviewed venue in that city
   - Prefer venues with good online presence and reviews

3. **For nightlife/clubs**:
   - If the activity name includes a specific club name, use that exact club
   - Otherwise, find a popular club/bar in that city for that type of music/vibe

4. **For wellness/spa activities**:
   - Find actual spa/wellness centers
   - For "Therme" activities, use Therme București
   - For salt mines, use the actual salt mine locations (Turda, Praid)

5. **For wineries**:
   - Use the exact winery names mentioned (Gramma, Lacerta, Domeniul Bogdan, etc.)
   - Find their official websites

### Output Format:

Please provide the results in this **EXACT JSON format** (this is critical for import):

```json
[
  {
    "activity_id": 8,
    "activity_name": "Transfăgărășan Scenic Day Tour",
    "venue_name": "Transfăgărășan Road - Bâlea Lake Starting Point",
    "full_address": "DN7C, Bâlea Lake, Sibiu County, Romania",
    "city": "Bâlea Lake",
    "latitude": 45.604,
    "longitude": 24.617,
    "website": "https://www.transfagarasan.com"
  },
  {
    "activity_id": 15,
    "activity_name": "Electronic Club Night in Bucharest",
    "venue_name": "Control Club",
    "full_address": "Strada Constantin Mille 4, București 010141, Romania",
    "city": "Bucharest",
    "latitude": 44.4329,
    "longitude": 26.1063,
    "website": "https://www.facebook.com/ControlClubBucharest"
  }
]
```

### Important Notes:

- **Do NOT make up websites** - if you can't find a website, use the venue's Facebook page or Google Maps link
- **Verify GPS coordinates** - make sure they're in Romania and match the city
- **Use official websites** - prefer .ro domains or official social media pages
- **Check that venues are still operating** - avoid closed businesses
- **For seasonal activities** (Christmas markets), use the public square/location, not a specific vendor

### Example Venues to Help You:

- **Escape Rooms**: MindMaze, Quest Room, Breakout, Exit Now
- **Yoga Studios**: Yogaholics, Samadhi Studio, Yoga Therapy
- **CrossFit**: CrossFit București, CrossFit Cluj, CrossFit Timișoara
- **Nightlife**: Control, Guesthouse, Flying Circus, Expirat, D'Arc
- **Wellness**: Therme București, World Class, Stejarii Country Club
- **Creative**: Assamblage Institute, NOD Makerspace, ASTRA Museum
- **Coffee**: Origo, M60, Beans & Dots, Tucano Coffee

### Deliverable:

Please provide:
1. **Complete JSON array** with all 202 venues
2. **Summary** of any activities where you couldn't find a suitable venue
3. **Notes** on any assumptions you made

### After You're Done:

I will copy your JSON output directly into my development environment and import it into our PostgreSQL database. The format MUST be exactly as specified above for the import to work.

---

## CSV File to Upload

Upload the file: `MISSING_VENUES_FOR_CHATGPT.csv`

This file contains 202 activities with:
- activity_id
- activity_name  
- city
- region
- category

---

## Why This Matters

These venues will be used in a mobile app to help users discover and book activities in Romania. Quality and accuracy are critical - users will click "Learn More" to visit the website and "GO NOW" to navigate to the venue. If the data is wrong, it breaks the user experience.

Thank you for your thorough research! 🙏
