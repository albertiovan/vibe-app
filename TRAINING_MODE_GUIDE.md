# Training Mode Guide

## Overview
Training Mode allows you to manually curate activity recommendations and improve the system's matching accuracy. While Claude API doesn't support direct fine-tuning, we collect feedback data to improve system prompts and activity mappings.

## ✅ What's Implemented

### 1. Training Mode Screen
- **Location**: Profile → Training Mode button
- **Features**:
  - Enter vibes one by one
  - Get AI recommendations
  - Rate with 👍 or 👎
  - Submit feedback to database
  - Track progress (100 sessions goal)

### 2. Backend API
- **`POST /api/training/feedback`** - Submit training feedback
- **`GET /api/training/stats`** - View training statistics
- **`GET /api/training/insights`** - Get actionable insights

### 3. Database
- **`training_sessions`** table - Stores each vibe input
- **`training_feedback`** table - Stores thumbs up/down for activities

## 🎯 How to Use

### Step 1: Access Training Mode
1. Open the app
2. Go to Profile (top right)
3. Tap "🎯 Training Mode"

### Step 2: Enter Test Vibes
Enter diverse vibes to test different scenarios:

**Good test cases:**
- "I just ate and I'm feeling lethargic" (energy level test)
- "Want something adventurous and outdoorsy" (activity type test)
- "Need to relax after a stressful day" (mood test)
- "Looking for a romantic evening" (context test)
- "High energy, want to move my body" (fitness test)

### Step 3: Rate Recommendations
- **👍** Good match - activity fits the vibe perfectly
- **👎** Bad match - activity doesn't match energy, mood, or context

**Example from your test:**
Vibe: "I just ate and I'm feeling lethargic"
- Paddle Court → 👎 (too high energy)
- Private Boat → 👍 (relaxing but some movement)
- Laser Tag → 👎 (very high energy)

### Step 4: Submit & Repeat
- Submit feedback for each vibe
- Continue for 100 different vibes
- Track your progress in the header

## 📊 Using the Collected Data

### 1. View Statistics
```bash
curl http://localhost:3000/api/training/stats
```

Returns:
- Total sessions & unique vibes
- Approval rates by activity
- Problem areas (low-rated activities)
- Vibe patterns

### 2. Get Insights
```bash
curl http://localhost:3000/api/training/insights
```

Returns actionable recommendations like:
- Energy level mismatches
- Bucket-mood incompatibilities
- Suggested prompt improvements

### 3. Apply Insights to Improve System

#### A. Update System Prompts
Based on insights, update `/backend/src/routes/chat.ts` system prompt:

```typescript
// BEFORE
"Suggest relaxing activities"

// AFTER (informed by training data)
"Suggest LOW ENERGY activities when user says 'lethargic' or 'just ate'.
Avoid: sports (paddle, laser tag), high-intensity fitness
Include: boat rides, spa, meditation, scenic walks"
```

#### B. Adjust Activity Ontology
Update `energy_level` in activities database:

```sql
-- Based on training feedback showing paddle is too high energy for relaxation
UPDATE activities 
SET energy_level = 'high' 
WHERE name = 'Paddle Court Booking';
```

#### C. Add Vibe-to-Activity Rules
Create explicit mapping rules in `/backend/data/vibe-lexicon.json`:

```json
{
  "pattern": "lethargic|just ate|food coma",
  "energy": "very_low",
  "exclude_categories": ["sports", "fitness", "adventure"],
  "prefer_categories": ["romance", "nature", "wellness", "mindfulness"]
}
```

## 📈 Continuous Improvement Cycle

```
1. Collect 100 training sessions
   ↓
2. Run insights endpoint
   ↓
3. Identify patterns (energy mismatches, bucket issues)
   ↓
4. Update system prompts and ontology
   ↓
5. Test with same vibes → measure improvement
   ↓
6. Collect more data → repeat
```

## 🚀 Quick Start Commands

### Run Migration
```bash
cd backend
npx tsx scripts/run-training-migration.ts
```

### Start Backend
```bash
cd backend
npm run dev
```

### View Training Stats
```bash
curl http://localhost:3000/api/training/stats | jq
```

### Export Training Data for Analysis
```bash
curl http://localhost:3000/api/training/insights > training-insights.json
```

## 📝 Example Training Session Workflow

### Session 1: Test "Lethargic after eating"
```
Input: "I just ate and I'm feeling lethargic"

Recommendations:
1. Paddle Court → 👎 (too active)
2. Private Boat → 👍 (good!)
3. Laser Tag → 👎 (too intense)

Submit → Progress: 1/100
```

### Session 2: Test "High energy morning"
```
Input: "Full of energy, want to work out"

Recommendations:
1. CrossFit Class → 👍 (perfect!)
2. Spa Treatment → 👎 (too relaxing)
3. Rock Climbing → 👍 (great match)

Submit → Progress: 2/100
```

### After 100 Sessions
1. Check `/api/training/insights`
2. Note patterns:
   - "Lethargic" → avoid sports (10/10 rejections)
   - "High energy" → prefer fitness (15/15 approvals)
3. Update prompts accordingly

## 🎓 Important Notes

### Claude API Limitations
- ❌ Cannot fine-tune the model directly
- ❌ Cannot update Claude's training data
- ✅ CAN improve system prompts with examples
- ✅ CAN use few-shot learning in prompts
- ✅ CAN adjust activity database and ontology

### Few-Shot Learning Example
Add successful examples to the system prompt:

```typescript
const systemPrompt = `You are a vibe-matching AI...

LEARNED PATTERNS FROM TRAINING:
- User says "lethargic" or "just ate" → Suggest LOW energy (spa, scenic walk, boat ride)
- User says "high energy" or "pumped up" → Suggest HIGH energy (CrossFit, climbing, running)
- User says "romantic" → Suggest couples activities (boat rides, wine tasting, spa)

...rest of prompt...
`;
```

## 🔧 Troubleshooting

### Training mode not accessible
- Check that TrainingModeScreen is imported in App.tsx
- Verify navigation types include `TrainingMode: undefined`
- Ensure backend is running on port 3000

### Feedback not saving
- Check database connection in backend/.env
- Verify tables created: `training_sessions`, `training_feedback`
- Check backend logs for errors

### Stats endpoint empty
- Ensure you've submitted at least one training session
- Check database: `SELECT COUNT(*) FROM training_sessions;`

## Next Steps

1. ✅ Complete 100 training sessions
2. 📊 Analyze insights endpoint
3. 🔧 Update system prompts based on patterns
4. ✅ Re-test with same vibes
5. 📈 Measure improvement in approval rates
6. 🔄 Iterate and refine

---

**Ready to train?** Go to Profile → Training Mode and start improving recommendations!
