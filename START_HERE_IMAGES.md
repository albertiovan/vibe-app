# 🚀 START HERE: Activity Images Import

## What You Need to Do

Populate 2,020 activities with high-quality images using ChatGPT in 41 batches of 50 activities each.

---

## ⚡ Quick Start (3 Commands)

### 1️⃣ Generate Activity Lists
```bash
cd /Users/aai/CascadeProjects/vibe-app
npx tsx backend/scripts/generate-batch-lists.ts
```
**Output**: Creates 41 files in `backend/data/batch-lists/`

### 2️⃣ Prepare ChatGPT Prompt
```bash
# Open these two files:
# 1. CHATGPT_IMAGE_SOURCING_BATCH_PROMPT.md (the template)
# 2. backend/data/batch-lists/batch-1-activities.txt (the activity list)
#
# Replace the activity list in the template with content from batch-1-activities.txt
# Copy the entire modified prompt
```

### 3️⃣ Get Images & Import
```bash
# 1. Paste prompt into ChatGPT (GPT-4 recommended)
# 2. Copy the JSON array response
# 3. Save to: backend/data/activity-images-batch-1.json
# 4. Run import:
npx tsx backend/scripts/import-activity-images.ts batch-1
```

---

## 🔄 The Workflow Loop

```
┌─────────────────────────────────────────────────────────┐
│  1. Open batch-X-activities.txt                         │
│  2. Replace activity list in ChatGPT prompt template    │
│  3. Paste into ChatGPT                                  │
│  4. Copy JSON response                                  │
│  5. Save to activity-images-batch-X.json                │
│  6. Run import script                                   │
│  7. Review results                                      │
│  8. Move to next batch (X + 1)                          │
└─────────────────────────────────────────────────────────┘
```

Repeat this loop 41 times (once per batch).

---

## 📊 Progress Tracking

| Batch | Activities | Status | Date |
|-------|-----------|--------|------|
| 1     | 1-50      | ⬜ Pending | - |
| 2     | 51-100    | ⬜ Pending | - |
| 3     | 101-150   | ⬜ Pending | - |
| 4     | 151-200   | ⬜ Pending | - |
| 5     | 201-250   | ⬜ Pending | - |
| ...   | ...       | ...    | ... |
| 41    | 2001-2020 | ⬜ Pending | - |

**Update this as you go!** Change ⬜ to ✅ when complete.

---

## 🎯 What ChatGPT Should Return

```json
[
  {
    "id": 1,
    "name": "Therme București Wellness Day",
    "image_urls": [
      "https://images.unsplash.com/photo-XXX/therme-pool.jpg",
      "https://images.pexels.com/photos/XXX/spa.jpg",
      "https://images.unsplash.com/photo-XXX/wellness.jpg"
    ]
  },
  {
    "id": 2,
    "name": "Peleș Castle Guided Visit",
    "image_urls": [
      "https://images.unsplash.com/photo-XXX/peles-castle.jpg",
      "https://images.pexels.com/photos/XXX/peles-interior.jpg",
      "https://images.unsplash.com/photo-XXX/peles-gardens.jpg"
    ]
  }
  // ... 48 more activities
]
```

**Copy ONLY this JSON array** - no extra text!

---

## ✅ Quality Checklist (Before Importing)

Before running the import script, verify:

- [ ] JSON is valid (use https://jsonlint.com/)
- [ ] All URLs start with `https://`
- [ ] All URLs end with `.jpg`, `.png`, or `.webp`
- [ ] Each activity has 3-5 images
- [ ] Spot-checked 5 random URLs (they load correctly)
- [ ] No watermarked images
- [ ] Images match activity descriptions

---

## 🎨 Image Requirements

### ✅ Good Images
- High resolution (1200x800px+)
- Show actual locations/venues
- Professional quality
- From Unsplash, Pexels, or Pixabay
- Direct image URLs

### ❌ Bad Images
- Low resolution or blurry
- Generic stock photos
- Watermarked
- Not HTTPS
- Not direct image links

---

## 📈 Monitor Your Progress

### Check How Many Done
```bash
psql $DATABASE_URL -c "SELECT COUNT(*) FROM activities WHERE array_length(image_urls, 1) > 0;"
```

### Check How Many Remaining
```bash
psql $DATABASE_URL -c "SELECT COUNT(*) FROM activities WHERE image_urls IS NULL OR array_length(image_urls, 1) = 0;"
```

### Calculate Percentage
```bash
psql $DATABASE_URL -c "SELECT ROUND(100.0 * COUNT(CASE WHEN array_length(image_urls, 1) > 0 THEN 1 END) / COUNT(*), 1) as completion_percentage FROM activities;"
```

---

## 🚨 Troubleshooting

### "File not found"
**Fix**: Create the file at `backend/data/activity-images-batch-X.json`

### "Invalid JSON"
**Fix**: Copy ONLY the JSON array from ChatGPT (no extra text)

### "Invalid URLs skipped"
**Fix**: Ensure URLs are HTTPS and end with `.jpg`, `.png`, or `.webp`

### ChatGPT stops mid-batch
**Fix**: Say "Please continue from activity ID X"

### ChatGPT gives generic images
**Fix**: Say "Find images of the actual venue/location, not generic stock photos"

---

## 💡 Pro Tips

1. **Use GPT-4**: Much better image quality
2. **Do 5-10 batches per session**: Prevents fatigue
3. **Start with Batch 1-10**: Most important activities
4. **Validate before importing**: Saves time fixing errors
5. **Take breaks**: Quality over speed

---

## 📚 Need More Details?

See these files for comprehensive documentation:
- **IMAGES_SETUP_COMPLETE.md** - Overview and setup
- **ACTIVITY_IMAGES_IMPORT_GUIDE.md** - Complete guide
- **IMAGE_IMPORT_WORKFLOW.md** - Detailed workflow

---

## 🎯 Your First Task

Run this command right now:

```bash
cd /Users/aai/CascadeProjects/vibe-app
npx tsx backend/scripts/generate-batch-lists.ts
```

This generates all 41 batch files. Then you're ready to start with Batch 1!

---

## 📝 Example Session

**Time**: 1-2 hours  
**Batches**: 5-10 batches  
**Activities**: 250-500 activities  

1. Run generate script (once, first time only)
2. For each batch:
   - Prepare ChatGPT prompt (2 min)
   - Get images from ChatGPT (5 min)
   - Save JSON and import (2 min)
   - Review results (1 min)
3. Take a break!
4. Repeat for next session

---

## 🎉 When You're Done

After all 41 batches:

```bash
# Verify completion
psql $DATABASE_URL -c "SELECT COUNT(*) as total, COUNT(CASE WHEN array_length(image_urls, 1) > 0 THEN 1 END) as with_images FROM activities;"

# Should show: total: 2020, with_images: 2020 ✅
```

Then test in your mobile app - all activities will have beautiful image carousels! 🎨

---

**Ready? Run the first command above to get started!** 🚀
