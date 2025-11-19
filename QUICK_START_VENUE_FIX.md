# Quick Start: Fix Missing Venue Data

## The Problem
- 202 activities (43%) have no venue/location data
- Location filters don't work
- "Nearby" badges don't show
- "Learn More" and "GO NOW" buttons are broken

## The Solution (3 Steps)

### Step 1: Get ChatGPT Prompt
```bash
open CHATGPT_FIND_VENUES_WEBSITES_PROMPT.md
```

### Step 2: Use ChatGPT
1. Copy the entire content from the file
2. Paste into ChatGPT (GPT-4 recommended)
3. Wait for ChatGPT to research all 202 venues
4. Copy ChatGPT's JSON response
5. Save as `CHATGPT_VENUES_DATA.json` in project root

### Step 3: Import to Database
```bash
DATABASE_URL=postgresql://localhost/vibe_app npx tsx backend/scripts/import-venues-from-chatgpt.ts
```

## Done!
All activities will have:
- ✅ Venue names
- ✅ Full addresses
- ✅ Coordinates (for maps & distance)
- ✅ Websites (for "Learn More")

---

## Example ChatGPT Response Format
```json
[
  {
    "activity_id": 8,
    "activity_name": "Transfăgărășan Scenic Day Tour",
    "venue_name": "Transfăgărășan Tour Operators",
    "full_address": "Str. Example 123, Sector 1",
    "city": "Bucharest",
    "latitude": 44.4268,
    "longitude": 26.1025,
    "website": "https://example.ro"
  }
]
```

Save this as `CHATGPT_VENUES_DATA.json` and run the import script.
