# Activity Images Import - Complete Guide

## 🎯 Goal
Populate the database with 3-5 high-quality images for each of the 2,020 activities using ChatGPT to source images in batches of 50.

---

## 📦 What You Have

### Files Created
1. **CHATGPT_IMAGE_SOURCING_BATCH_PROMPT.md** - Template prompt for ChatGPT
2. **backend/scripts/import-activity-images.ts** - Import script for database
3. **backend/scripts/generate-batch-lists.ts** - Generates activity lists for all batches
4. **IMAGE_IMPORT_WORKFLOW.md** - Detailed workflow documentation

### Database Schema
- `image_urls` (text[]): Array of 3-5 image URLs per activity
- `hero_image_url` (text): Primary image (first from image_urls)

---

## 🚀 Quick Start (5 Steps)

### Step 1: Generate Activity Lists
```bash
cd /Users/aai/CascadeProjects/vibe-app
npx tsx backend/scripts/generate-batch-lists.ts
```

This creates 41 files in `backend/data/batch-lists/`:
- `batch-1-activities.txt` (Activities 1-50)
- `batch-2-activities.txt` (Activities 51-100)
- ... through batch-41

### Step 2: Prepare ChatGPT Prompt
1. Open `CHATGPT_IMAGE_SOURCING_BATCH_PROMPT.md`
2. Copy the entire content
3. Open `backend/data/batch-lists/batch-1-activities.txt`
4. Replace the activity list in the prompt with the content from batch-1-activities.txt

### Step 3: Get Images from ChatGPT
1. Paste the modified prompt into ChatGPT (GPT-4 recommended)
2. Wait for ChatGPT to generate the JSON array
3. Copy ONLY the JSON array (no extra text)

### Step 4: Save JSON Response
1. Create file: `backend/data/activity-images-batch-1.json`
2. Paste the JSON array from ChatGPT
3. Validate it's proper JSON

### Step 5: Import to Database
```bash
npx tsx backend/scripts/import-activity-images.ts batch-1
```

Review the output for success/errors, then repeat for batch-2, batch-3, etc.

---

## 📋 Batch Strategy

### Recommended Order
1. **Batches 1-10** (Activities 1-500) - Most popular activities
2. **Batches 11-20** (Activities 501-1000) - Common activities
3. **Batches 21-41** (Activities 1001-2020) - Remaining activities

### Time Estimate
- **Per Batch**: 10-15 minutes (ChatGPT + review + import)
- **Total Time**: 7-10 hours for all 41 batches
- **Recommendation**: Do 5-10 batches per session

---

## 🎨 Image Quality Standards

### Required
- ✅ Resolution: 1200x800px minimum
- ✅ Format: JPG, PNG, or WebP
- ✅ HTTPS URLs only
- ✅ Direct image links (ending in .jpg, .png, etc.)
- ✅ From approved sources: Unsplash, Pexels, Pixabay

### Content Guidelines
- ✅ Show actual locations/venues when possible
- ✅ Capture the activity mood and energy level
- ✅ High quality, professional photos
- ❌ No watermarks
- ❌ No generic stock photos
- ❌ No blurry or low-resolution images

---

## 🔍 Validation & Monitoring

### Check Progress
```bash
# Count activities with images
psql $DATABASE_URL -c "SELECT COUNT(*) FROM activities WHERE array_length(image_urls, 1) > 0;"

# Count activities without images
psql $DATABASE_URL -c "SELECT COUNT(*) FROM activities WHERE image_urls IS NULL OR array_length(image_urls, 1) = 0;"

# View sample activity with images
psql $DATABASE_URL -c "SELECT id, name, image_urls FROM activities WHERE id = 1;"
```

### Import Script Output
The script shows:
- ✅ Successfully imported: X
- ❌ Errors: X
- ⚠️ Skipped (not found): X
- 📝 Total processed: X

---

## 🛠️ Troubleshooting

### ChatGPT Issues

**Problem**: ChatGPT stops mid-batch  
**Solution**: Ask "Please continue from activity ID X"

**Problem**: ChatGPT gives generic images  
**Solution**: Be more specific: "Find images of the actual venue/location, not generic stock photos"

**Problem**: URLs are not direct image links  
**Solution**: Ask "Provide direct image URLs ending in .jpg or .png"

### Import Script Issues

**Problem**: "File not found"  
**Solution**: Ensure file is at `backend/data/activity-images-batch-X.json`

**Problem**: "Invalid JSON"  
**Solution**: 
- Copy ONLY the JSON array from ChatGPT
- Use https://jsonlint.com/ to validate
- Remove any text before `[` or after `]`

**Problem**: "Invalid URLs skipped"  
**Solution**: 
- Check URLs start with `https://`
- Check URLs end with `.jpg`, `.png`, or `.webp`
- Manually fix invalid URLs in the JSON file

**Problem**: "Activity not found in database"  
**Solution**: Normal - some IDs may not exist due to deletions or gaps

---

## 📊 Example JSON Format

```json
[
  {
    "id": 1,
    "name": "Therme București Wellness Day",
    "image_urls": [
      "https://images.unsplash.com/photo-1234567890/therme-pool.jpg",
      "https://images.pexels.com/photos/1234567/spa-wellness.jpg",
      "https://images.unsplash.com/photo-9876543210/thermal-bath.jpg"
    ]
  },
  {
    "id": 2,
    "name": "Peleș Castle Guided Visit",
    "image_urls": [
      "https://images.unsplash.com/photo-1234567890/peles-castle.jpg",
      "https://images.pexels.com/photos/1234567/peles-interior.jpg",
      "https://images.unsplash.com/photo-9876543210/peles-gardens.jpg",
      "https://images.unsplash.com/photo-1111111111/peles-architecture.jpg"
    ]
  }
]
```

---

## 📈 Progress Tracking Template

Create a file `image-import-progress.md` to track your work:

```markdown
# Image Import Progress

**Started**: [Date]
**Target**: 2,020 activities in 41 batches

## Completed Batches
- [x] Batch 1 (1-50) - [Date]
- [ ] Batch 2 (51-100)
- [ ] Batch 3 (101-150)
...

## Statistics
- Total activities: 2,020
- Activities with images: 0
- Completion: 0%

## Notes
- [Any issues or observations]
```

---

## 🎯 Success Checklist

Before marking a batch as complete:
- [ ] ChatGPT provided 3-5 images per activity
- [ ] All URLs are HTTPS and direct image links
- [ ] Spot-checked 5-10 random URLs (they load correctly)
- [ ] Import script ran without errors
- [ ] Database updated successfully
- [ ] Hero images set for all activities

---

## 💡 Pro Tips

1. **Use ChatGPT-4**: Much better at finding relevant, high-quality images
2. **Be specific**: If images are too generic, ask for "actual venue photos" or "location-specific images"
3. **Batch review**: Review 2-3 activities in each batch before importing
4. **Reuse wisely**: For similar activities (e.g., multiple nightclubs), you can reuse some images
5. **Take breaks**: 5-10 batches per session prevents fatigue
6. **Start with popular**: Do batches 1-10 first (most commonly recommended activities)

---

## 📞 Quick Reference Commands

```bash
# Generate all batch lists
npx tsx backend/scripts/generate-batch-lists.ts

# Import a batch
npx tsx backend/scripts/import-activity-images.ts batch-1

# Check progress
psql $DATABASE_URL -c "SELECT COUNT(*) FROM activities WHERE array_length(image_urls, 1) > 0;"

# View activities without images (first 20)
psql $DATABASE_URL -c "SELECT id, name FROM activities WHERE image_urls IS NULL OR array_length(image_urls, 1) = 0 ORDER BY id LIMIT 20;"

# View images for specific activity
psql $DATABASE_URL -c "SELECT id, name, image_urls, hero_image_url FROM activities WHERE id = 1;"
```

---

## 🎉 When You're Done

After completing all 41 batches:

1. **Verify completion**:
```bash
psql $DATABASE_URL -c "SELECT COUNT(*) as total, COUNT(CASE WHEN array_length(image_urls, 1) > 0 THEN 1 END) as with_images FROM activities;"
```

2. **Spot check random activities**:
```bash
psql $DATABASE_URL -c "SELECT id, name, array_length(image_urls, 1) as image_count FROM activities ORDER BY RANDOM() LIMIT 10;"
```

3. **Test in the app**: Open the mobile app and browse activities to see the images in action!

---

**Ready to start? Run Step 1 to generate the batch lists!** 🚀

```bash
cd /Users/aai/CascadeProjects/vibe-app
npx tsx backend/scripts/generate-batch-lists.ts
```
