# Venue Research Instructions

## ✅ Auto-Generated Venues Deleted

I've successfully deleted the 202 auto-generated venues. The database is now clean and ready for real venue data.

**Current Status:**
- Activities without venues: **202**
- Ready for real venue import: ✅

---

## 📋 Files Created for You

### 1. CSV File for ChatGPT Upload
**File:** `MISSING_VENUES_FOR_CHATGPT.csv`

This file contains all 202 activities that need venues:
- activity_id
- activity_name
- city
- region
- category

**What to do:** Upload this file to ChatGPT

---

### 2. ChatGPT Research Prompt
**File:** `CHATGPT_VENUE_RESEARCH_PROMPT.md`

This is the complete prompt to give ChatGPT. It includes:
- Detailed instructions on what to research
- Quality requirements (real venues, verified websites)
- Exact JSON output format needed
- Examples of known venues to help
- Guidelines for different activity types

**What to do:** Copy this entire prompt and paste it into ChatGPT along with the CSV file

---

## 🔄 Workflow

### Step 1: Go to ChatGPT
Open ChatGPT (preferably GPT-4 for better research capabilities)

### Step 2: Upload the CSV
Upload: `MISSING_VENUES_FOR_CHATGPT.csv`

### Step 3: Paste the Prompt
Copy the entire contents of `CHATGPT_VENUE_RESEARCH_PROMPT.md` and paste it into ChatGPT

### Step 4: Wait for Research
ChatGPT will research all 202 activities and provide venue data in JSON format

### Step 5: Copy the JSON
ChatGPT will give you a JSON array like this:
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
  ...
]
```

### Step 6: Paste Here in Cascade
Come back to this Windsurf chat and paste the JSON. I'll import it directly into the database using the existing import script.

---

## 🎯 What ChatGPT Will Research

### Known Venues (Easy)
These are mentioned in the activity names:
- ASTRA Museum
- NOD Makerspace
- Assamblage Institute
- Therme București
- Salina Turda
- Salina Praid
- Gramma Winery
- Domeniul Bogdan
- Lacerta Winery
- Control Club
- Flying Circus
- Expirat
- And many more...

### Generic Activities (Requires Research)
ChatGPT will need to find appropriate venues for:
- Yoga classes → Find popular yoga studios
- Escape rooms → Find MindMaze or similar
- CrossFit sessions → Find CrossFit gyms
- Nightlife → Find popular clubs/bars
- Wellness → Find spas and wellness centers
- Creative workshops → Find art studios
- And more...

---

## ✅ Quality Checks

ChatGPT has been instructed to:
- ✅ Only use real, existing venues
- ✅ Verify websites are real and working
- ✅ Provide accurate GPS coordinates
- ✅ Use official websites (prefer .ro domains)
- ✅ Check venues are still operating
- ✅ Match venue type to activity type

---

## 🚀 After Import

Once you paste the JSON here, I will:
1. Validate the JSON format
2. Run the import script (`import-venues-from-chatgpt.ts`)
3. Verify all 202 venues were imported
4. Check for any errors
5. Confirm all activities now have venues and websites

Then your app will be fully functional with:
- ✅ Real venue names
- ✅ Working websites for "Learn More"
- ✅ GPS coordinates for "GO NOW"
- ✅ All 581 activities complete

---

## 📝 Notes

- The JSON format is **critical** - it must match exactly for the import to work
- ChatGPT has been given the exact format needed
- If ChatGPT can't find a venue for some activities, it will note them
- We can manually research any missing ones after the bulk import

---

## 🎉 Ready!

You're all set! Just:
1. Open ChatGPT
2. Upload `MISSING_VENUES_FOR_CHATGPT.csv`
3. Paste the prompt from `CHATGPT_VENUE_RESEARCH_PROMPT.md`
4. Wait for results
5. Copy the JSON back here

I'll be ready to import as soon as you paste the JSON! 🚀
