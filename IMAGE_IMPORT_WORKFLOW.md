# Activity Images Import Workflow

## Overview
This workflow helps you populate the database with high-quality images for all 2,020 activities using ChatGPT to source images in manageable batches.

---

## 📋 Batch Structure

**Total Activities**: 2,020  
**Batch Size**: 50 activities per batch  
**Total Batches**: 41 batches

### Why Batches?
- Prevents ChatGPT from being overwhelmed
- Easier to review and validate
- Can pause and resume work
- Better error handling per batch

---

## 🚀 Step-by-Step Workflow

### Step 1: Get Batch Prompt
Open `CHATGPT_IMAGE_SOURCING_BATCH_PROMPT.md` and copy the entire content for the batch you want to process.

### Step 2: Customize for Your Batch
The prompt template is for **Batch 1 (Activities 1-50)**. For other batches:

**Batch 2 (51-100)**: Replace activity list with IDs 51-100  
**Batch 3 (101-150)**: Replace activity list with IDs 101-150  
...and so on

### Step 3: Paste in ChatGPT
1. Open ChatGPT (GPT-4 recommended)
2. Paste the entire batch prompt
3. Wait for ChatGPT to generate the JSON array

### Step 4: Save JSON Response
1. Copy ONLY the JSON array from ChatGPT's response
2. Create file: `backend/data/activity-images-batch-X.json`
3. Paste the JSON array
4. Validate it's proper JSON (use a JSON validator if needed)

### Step 5: Import to Database
```bash
cd /Users/aai/CascadeProjects/vibe-app
npx tsx backend/scripts/import-activity-images.ts batch-1
```

Replace `batch-1` with your batch number (batch-2, batch-3, etc.)

### Step 6: Review Results
The script will output:
- ✅ Successfully imported count
- ❌ Errors (if any)
- ⚠️ Skipped activities (not found in DB)
- Invalid URLs detected

### Step 7: Repeat for Next Batch
Continue with the next 50 activities until all 2,020 are complete.

---

## 📊 Batch Breakdown

| Batch | Activity IDs | Count | Status |
|-------|--------------|-------|--------|
| 1     | 1-50         | 50    | ⬜ Pending |
| 2     | 51-100       | 50    | ⬜ Pending |
| 3     | 101-150      | 50    | ⬜ Pending |
| 4     | 151-200      | 50    | ⬜ Pending |
| 5     | 201-250      | 50    | ⬜ Pending |
| 6     | 251-300      | 50    | ⬜ Pending |
| 7     | 301-350      | 50    | ⬜ Pending |
| 8     | 351-400      | 50    | ⬜ Pending |
| 9     | 401-450      | 50    | ⬜ Pending |
| 10    | 451-500      | 50    | ⬜ Pending |
| ...   | ...          | ...   | ... |
| 40    | 1951-2000    | 50    | ⬜ Pending |
| 41    | 2001-2020    | 20    | ⬜ Pending |

**Update this table as you complete batches!**

---

## 🎯 Image Quality Checklist

Before importing, verify ChatGPT's output:

### ✅ URL Validation
- [ ] All URLs start with `https://`
- [ ] URLs end with `.jpg`, `.png`, or `.webp`
- [ ] URLs are from approved sources (Unsplash, Pexels, Pixabay)
- [ ] No watermarked images

### ✅ Content Relevance
- [ ] Images match the activity description
- [ ] Show actual locations when possible
- [ ] Capture the right mood/energy level
- [ ] High resolution (1200x800px minimum)

### ✅ Quantity
- [ ] Each activity has 3-5 images
- [ ] First image is the best/most representative

---

## 🛠️ Troubleshooting

### Problem: "File not found"
**Solution**: Make sure you created the JSON file in the correct location:
```
backend/data/activity-images-batch-X.json
```

### Problem: "Invalid JSON"
**Solution**: 
1. Copy ONLY the JSON array from ChatGPT (no extra text)
2. Use a JSON validator: https://jsonlint.com/
3. Ensure proper formatting with commas and brackets

### Problem: "Activity not found in database"
**Solution**: The activity ID doesn't exist. This is normal if:
- Activities were deleted
- ID gaps exist in the database
- You're using an outdated activity list

### Problem: "Invalid URLs skipped"
**Solution**: ChatGPT provided URLs that don't meet requirements:
- Not HTTPS
- Not direct image links
- Invalid format
- Review and manually fix in the JSON file

### Problem: ChatGPT refuses to generate all 50
**Solution**: 
- Ask it to continue from where it stopped
- Or split the batch into 2 smaller batches (25 each)

---

## 📝 Generating Activity Lists for Batches

To get the activity list for any batch, run this SQL query:

```sql
-- Batch 1 (1-50)
SELECT id, name, city, region, category 
FROM activities 
WHERE id BETWEEN 1 AND 50 
ORDER BY id;

-- Batch 2 (51-100)
SELECT id, name, city, region, category 
FROM activities 
WHERE id BETWEEN 51 AND 100 
ORDER BY id;

-- And so on...
```

Or use Cascade to query the database and format the list.

---

## 🎨 Example ChatGPT Prompt Customization

### For Batch 2 (Activities 51-100):

1. Open `CHATGPT_IMAGE_SOURCING_BATCH_PROMPT.md`
2. Change the title: "BATCH 1" → "BATCH 2"
3. Replace the activity list with activities 51-100
4. Keep everything else the same

### Activity List Format:
```
51. Romanian Language Crash Course (Bucharest) - Bucharest, București - learning
52. Specialty Coffee Brewing Class (Bucharest) - Bucharest, București - learning
53. Barista Basics Workshop (Cluj) - Cluj-Napoca, Cluj - learning
...
```

---

## 📈 Progress Tracking

Create a simple tracker file to monitor your progress:

```json
{
  "total_activities": 2020,
  "total_batches": 41,
  "completed_batches": 0,
  "batches": {
    "batch-1": "pending",
    "batch-2": "pending",
    "batch-3": "pending"
  }
}
```

Update as you complete each batch!

---

## ⚡ Quick Commands Reference

```bash
# Import batch 1
npx tsx backend/scripts/import-activity-images.ts batch-1

# Import batch 2
npx tsx backend/scripts/import-activity-images.ts batch-2

# Check how many activities have images
psql $DATABASE_URL -c "SELECT COUNT(*) FROM activities WHERE array_length(image_urls, 1) > 0;"

# Check activities without images
psql $DATABASE_URL -c "SELECT id, name FROM activities WHERE image_urls IS NULL OR array_length(image_urls, 1) = 0 ORDER BY id LIMIT 20;"

# View images for a specific activity
psql $DATABASE_URL -c "SELECT id, name, image_urls FROM activities WHERE id = 1;"
```

---

## 🎯 Success Criteria

You'll know you're done when:
- ✅ All 2,020 activities have 3-5 images
- ✅ All hero_image_url fields are populated
- ✅ All images are from approved sources
- ✅ All URLs are valid and accessible
- ✅ Images match activity descriptions

---

## 💡 Pro Tips

1. **Start with popular activities**: Do Batch 1-10 first (most common activities)
2. **Review before importing**: Spot-check URLs in ChatGPT's output
3. **Use ChatGPT-4**: Better at finding relevant images
4. **Be specific**: If ChatGPT gives generic images, ask for more specific ones
5. **Reuse good images**: For similar activities, you can reuse some images
6. **Take breaks**: 5-10 batches per session is reasonable

---

## 📞 Need Help?

If you encounter issues:
1. Check the troubleshooting section above
2. Review the import script logs for specific errors
3. Validate your JSON file format
4. Ensure database connection is working

---

**Ready to start? Begin with Batch 1!** 🚀
