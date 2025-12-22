# Activity Images Import System - Setup Complete ✅

## 📦 What Was Created

I've built a complete system for populating your database with high-quality images for all 2,020 activities using ChatGPT in manageable batches.

---

## 🗂️ Files Created

### 1. ChatGPT Prompt Template
**File**: `CHATGPT_IMAGE_SOURCING_BATCH_PROMPT.md`
- Ready-to-use prompt for ChatGPT
- Includes all quality requirements
- Specifies exact JSON format needed
- Template for Batch 1 (Activities 1-50)

### 2. Import Script
**File**: `backend/scripts/import-activity-images.ts`
- Validates image URLs
- Updates `image_urls` array in database
- Sets `hero_image_url` to first image
- Comprehensive error handling and logging

### 3. Batch Generator Script
**File**: `backend/scripts/generate-batch-lists.ts`
- Automatically generates activity lists for all 41 batches
- Creates formatted text files ready for ChatGPT prompts
- Outputs to `backend/data/batch-lists/`

### 4. Complete Workflow Guide
**File**: `ACTIVITY_IMAGES_IMPORT_GUIDE.md`
- Step-by-step instructions
- Troubleshooting section
- Progress tracking template
- Quick reference commands

### 5. Detailed Workflow
**File**: `IMAGE_IMPORT_WORKFLOW.md`
- Batch breakdown table
- Quality checklist
- Pro tips and best practices

### 6. Example Data
**File**: `backend/data/activity-images-EXAMPLE.json`
- Shows exact JSON format expected
- Sample with 3 activities
- Use as reference when saving ChatGPT responses

---

## 🚀 How to Use (Simple Version)

### Step 1: Generate Activity Lists
```bash
cd /Users/aai/CascadeProjects/vibe-app
npx tsx backend/scripts/generate-batch-lists.ts
```
This creates 41 files with activity lists for each batch.

### Step 2: Prepare ChatGPT Prompt
1. Open `CHATGPT_IMAGE_SOURCING_BATCH_PROMPT.md`
2. Copy entire content
3. Replace the activity list section with content from `backend/data/batch-lists/batch-1-activities.txt`

### Step 3: Get Images from ChatGPT
1. Paste modified prompt into ChatGPT (use GPT-4)
2. Wait for JSON response
3. Copy ONLY the JSON array

### Step 4: Save & Import
1. Save JSON to `backend/data/activity-images-batch-1.json`
2. Run: `npx tsx backend/scripts/import-activity-images.ts batch-1`

### Step 5: Repeat
Continue with batch-2, batch-3, etc. until all 41 batches are complete.

---

## 📊 The Numbers

- **Total Activities**: 2,020
- **Batch Size**: 50 activities per batch
- **Total Batches**: 41 batches
- **Images per Activity**: 3-5 high-quality images
- **Estimated Time**: 10-15 minutes per batch
- **Total Time**: 7-10 hours for all batches

---

## 🎯 Image Requirements

### Technical
- Resolution: 1200x800px minimum
- Format: JPG, PNG, or WebP
- HTTPS URLs only
- Direct image links (ending in .jpg, .png, etc.)

### Sources (Approved)
- Unsplash (unsplash.com)
- Pexels (pexels.com)
- Pixabay (pixabay.com)
- Official tourism websites
- Venue websites (when publicly accessible)

### Content
- Show actual locations/venues when possible
- Capture the activity mood and energy level
- High quality, professional photos
- No watermarks or low-resolution images

---

## 🔍 Monitoring Progress

### Check How Many Activities Have Images
```bash
psql $DATABASE_URL -c "SELECT COUNT(*) FROM activities WHERE array_length(image_urls, 1) > 0;"
```

### Check Activities Without Images
```bash
psql $DATABASE_URL -c "SELECT COUNT(*) FROM activities WHERE image_urls IS NULL OR array_length(image_urls, 1) = 0;"
```

### View Sample Activity
```bash
psql $DATABASE_URL -c "SELECT id, name, image_urls FROM activities WHERE id = 1;"
```

---

## 📋 Batch Strategy

### Recommended Order
1. **Start with Batch 1-10** (Activities 1-500)
   - Most popular and commonly recommended activities
   - Immediate impact on user experience

2. **Continue with Batch 11-20** (Activities 501-1000)
   - Common activities users will see

3. **Finish with Batch 21-41** (Activities 1001-2020)
   - Less common but still important

### Session Planning
- **Per Session**: 5-10 batches (1-2 hours)
- **Total Sessions**: 4-8 sessions to complete all batches
- **Take breaks**: Prevents fatigue and maintains quality

---

## 🛠️ Database Schema

The import script updates these fields:

```sql
-- Array of image URLs (3-5 per activity)
image_urls text[]

-- Primary/hero image (first from image_urls)
hero_image_url text
```

### Example After Import
```json
{
  "id": 1,
  "name": "Therme București Wellness Day",
  "image_urls": [
    "https://images.unsplash.com/photo-1234567890/therme-pool.jpg",
    "https://images.pexels.com/photos/1234567/spa-wellness.jpg",
    "https://images.unsplash.com/photo-9876543210/thermal-bath.jpg"
  ],
  "hero_image_url": "https://images.unsplash.com/photo-1234567890/therme-pool.jpg"
}
```

---

## 💡 Pro Tips

1. **Use ChatGPT-4**: Much better at finding relevant images than GPT-3.5
2. **Be Specific**: If images are generic, ask for "actual venue photos"
3. **Validate Before Import**: Spot-check 5-10 URLs in each batch
4. **Reuse Wisely**: Similar activities can share some images
5. **Start Small**: Do 2-3 batches first to get comfortable with the workflow
6. **Track Progress**: Update a progress file as you complete batches

---

## 🎯 Success Criteria

You'll know you're done when:
- ✅ All 2,020 activities have 3-5 images
- ✅ All `hero_image_url` fields are populated
- ✅ All images are from approved sources
- ✅ All URLs are valid and accessible
- ✅ Images match activity descriptions and mood

---

## 🚨 Common Issues & Solutions

### ChatGPT Issues
- **Stops mid-batch**: Ask "Please continue from activity ID X"
- **Generic images**: Ask for "actual venue/location photos"
- **Wrong format**: Remind it to provide "direct image URLs ending in .jpg or .png"

### Import Issues
- **File not found**: Check file is at `backend/data/activity-images-batch-X.json`
- **Invalid JSON**: Use https://jsonlint.com/ to validate
- **Invalid URLs**: Ensure HTTPS and proper file extensions
- **Activity not found**: Normal - some IDs may have gaps

---

## 📞 Quick Reference

### Generate Batch Lists
```bash
npx tsx backend/scripts/generate-batch-lists.ts
```

### Import a Batch
```bash
npx tsx backend/scripts/import-activity-images.ts batch-1
```

### Check Progress
```bash
psql $DATABASE_URL -c "SELECT COUNT(*) as total, COUNT(CASE WHEN array_length(image_urls, 1) > 0 THEN 1 END) as with_images FROM activities;"
```

---

## 📚 Documentation Files

For more details, see:
- **ACTIVITY_IMAGES_IMPORT_GUIDE.md** - Complete guide with all details
- **IMAGE_IMPORT_WORKFLOW.md** - Detailed workflow and batch breakdown
- **CHATGPT_IMAGE_SOURCING_BATCH_PROMPT.md** - ChatGPT prompt template

---

## 🎉 Ready to Start!

Everything is set up and ready to go. Here's your first command:

```bash
cd /Users/aai/CascadeProjects/vibe-app
npx tsx backend/scripts/generate-batch-lists.ts
```

This will create all 41 batch files. Then you can start with Batch 1!

---

## 📈 Example Progress Tracking

Create a file to track your work:

```markdown
# Image Import Progress

**Started**: December 11, 2025
**Target**: 2,020 activities in 41 batches

## Completed Batches
- [ ] Batch 1 (1-50)
- [ ] Batch 2 (51-100)
- [ ] Batch 3 (101-150)
[... continue for all 41 batches]

## Statistics
- Total activities: 2,020
- Activities with images: 0
- Completion: 0%
- Estimated time remaining: 10 hours

## Notes
- Using GPT-4 for better image quality
- Focusing on actual venue photos
- Validating URLs before importing
```

---

**Good luck! The system is designed to make this process as smooth as possible.** 🚀

If you encounter any issues, check the troubleshooting sections in the guide files or review the import script logs for specific error messages.
