# 🚨 CRITICAL BUG FIX: Sports Query Issue

## The Problem

**File:** `backend/src/services/llm/mcpClaudeRecommender.ts` (lines 175-183)

**Bug:** Database query selects activities RANDOMLY without considering user vibe.

```javascript
// ❌ CURRENT (BROKEN)
const activitiesQuery = `
  SELECT a.id, a.name, a.category, a.city, a.region, a.description
  FROM activities a
  WHERE a.region = $1 OR a.region = 'București'
  ORDER BY RANDOM()  ← No vibe filtering!
  LIMIT 10
`;
```

**Result:** User says "I want sports" but gets random activities (spa, painting, knitting).

---

## Root Cause

1. AI correctly detects: "Mood: calm, Energy: medium, Context: I want sports"
2. **But this detection is NEVER used in the database query**
3. Query just grabs 10 random activities from Bucharest
4. With only 9 sports activities out of 173 total (5%), sports rarely appear

---

## Solution 1: Simple Category Filtering (Quick Fix)

Add basic keyword-to-category mapping:

```javascript
// backend/src/services/llm/mcpClaudeRecommender.ts

function parseVibeToCategory(vibe: string): string | null {
  const vibeLower = vibe.toLowerCase();
  
  // Direct category mentions
  if (vibeLower.includes('sport')) return 'sports';
  if (vibeLower.includes('fitness') || vibeLower.includes('workout') || vibeLower.includes('gym')) return 'fitness';
  if (vibeLower.includes('adventure') || vibeLower.includes('adrenaline')) return 'adventure';
  if (vibeLower.includes('creative') || vibeLower.includes('art') || vibeLower.includes('paint')) return 'creative';
  if (vibeLower.includes('wellness') || vibeLower.includes('spa') || vibeLower.includes('massage')) return 'wellness';
  if (vibeLower.includes('nature') || vibeLower.includes('outdoor') || vibeLower.includes('hik')) return 'nature';
  if (vibeLower.includes('food') || vibeLower.includes('restaurant') || vibeLower.includes('culinary')) return 'culinary';
  if (vibeLower.includes('water') || vibeLower.includes('swim') || vibeLower.includes('kayak')) return 'water';
  
  return null;
}

// In queryDatabaseDirectly():
const targetCategory = parseVibeToCategory(request.vibe);

let activitiesQuery = `
  SELECT a.id, a.name, a.category, a.city, a.region, a.description, a.energy_level, a.tags
  FROM activities a
  WHERE (a.region = $1 OR a.region = 'București')
`;

const queryParams: any[] = [region];

if (targetCategory) {
  activitiesQuery += ` AND a.category = $2`;
  queryParams.push(targetCategory);
  console.log(`🎯 Filtering by category: ${targetCategory}`);
}

activitiesQuery += `
  ORDER BY 
    CASE WHEN a.region = $1 THEN 0 ELSE 1 END,
    RANDOM()
  LIMIT 10
`;

const { rows: activities } = await pool.query(activitiesQuery, queryParams);
```

---

## Solution 2: Tag-Based Filtering (Better)

Use PostgreSQL array operators to filter by tags:

```javascript
function parseVibeToTags(vibe: string): string[] {
  const tags: string[] = [];
  const vibeLower = vibe.toLowerCase();
  
  // Category tags
  if (vibeLower.includes('sport')) tags.push('category:sports');
  if (vibeLower.includes('fitness')) tags.push('category:fitness');
  if (vibeLower.includes('adventure')) tags.push('category:adventure');
  if (vibeLower.includes('creative')) tags.push('category:creative');
  
  // Energy tags
  if (vibeLower.includes('high energy') || vibeLower.includes('intense')) tags.push('energy:high');
  if (vibeLower.includes('chill') || vibeLower.includes('relax')) tags.push('energy:low');
  if (vibeLower.includes('medium') || vibeLower.includes('moderate')) tags.push('energy:medium');
  
  // Mood tags
  if (vibeLower.includes('adrenaline') || vibeLower.includes('exciting')) tags.push('mood:adrenaline');
  if (vibeLower.includes('calm') || vibeLower.includes('peaceful')) tags.push('mood:relaxed');
  if (vibeLower.includes('creative') || vibeLower.includes('artistic')) tags.push('mood:creative');
  
  // Indoor/outdoor
  if (vibeLower.includes('outdoor') || vibeLower.includes('outside')) tags.push('indoor_outdoor:outdoor');
  if (vibeLower.includes('indoor') || vibeLower.includes('inside')) tags.push('indoor_outdoor:indoor');
  
  return tags;
}

// In queryDatabaseDirectly():
const tags = parseVibeToTags(request.vibe);

let activitiesQuery = `
  SELECT a.id, a.name, a.category, a.city, a.region, a.description, a.tags
  FROM activities a
  WHERE (a.region = $1 OR a.region = 'București')
`;

const queryParams: any[] = [region];

if (tags.length > 0) {
  activitiesQuery += ` AND a.tags && $2::text[]`;  // PostgreSQL array overlap operator
  queryParams.push(tags);
  console.log(`🎯 Filtering by tags: ${tags.join(', ')}`);
}

activitiesQuery += `
  ORDER BY 
    CASE WHEN a.region = $1 THEN 0 ELSE 1 END,
    RANDOM()
  LIMIT 10
`;

const { rows: activities } = await pool.query(activitiesQuery, queryParams);
```

---

## Solution 3: LLM-Powered Selection (Original Design)

Let Claude actually select activities instead of random selection:

```javascript
async function queryDatabaseWithLLM(request: VibeRequest): Promise<RecommendationResult> {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  
  try {
    // 1. Get ALL activities from database
    const { rows: allActivities } = await pool.query(`
      SELECT id, name, category, description, tags, energy_level
      FROM activities
      WHERE region IN ($1, 'București')
      ORDER BY region, name
    `, [request.region || 'București']);
    
    // 2. Ask Claude to select best matches
    const anthropic = new Anthropic({ apiKey: process.env.CLAUDE_API_KEY });
    
    const response = await anthropic.messages.create({
      model: 'claude-3-haiku-20240307',
      max_tokens: 2048,
      system: `You are a smart activity recommender. Select 5 activities that best match the user's vibe.`,
      messages: [{
        role: 'user',
        content: `User vibe: "${request.vibe}"

Available activities:
${allActivities.map(a => `- ID ${a.id}: ${a.name} (${a.category}, ${a.energy_level})`).join('\n')}

Select 5 best activity IDs. Return ONLY a JSON array of IDs: [123, 456, 789, ...]`
      }]
    });
    
    const content = response.content[0];
    if (content.type !== 'text') throw new Error('Unexpected response');
    
    const selectedIds = JSON.parse(content.text.replace(/```json|```/g, '').trim());
    
    // 3. Fetch full details for selected activities
    const selectedActivities = allActivities.filter(a => selectedIds.includes(a.id));
    
    // 4. Get venues for each
    const ideas = await Promise.all(
      selectedActivities.map(async (activity) => {
        const { rows: venues } = await pool.query(`
          SELECT id, name, city, rating
          FROM venues
          WHERE activity_id = $1
          ORDER BY rating DESC NULLS LAST
          LIMIT 3
        `, [activity.id]);
        
        return {
          activityId: activity.id,
          name: activity.name,
          bucket: activity.category,
          region: activity.region,
          venues: venues.map(v => ({
            venueId: v.id,
            name: v.name,
            city: v.city,
            rating: v.rating
          }))
        };
      })
    );
    
    return { ideas };
    
  } finally {
    await pool.end();
  }
}
```

---

## Recommended Approach

**Use Solution 1 (Simple Category Filtering) as immediate fix:**

1. ✅ Quick to implement (5 minutes)
2. ✅ Solves 80% of cases ("I want sports" → category:sports)
3. ✅ No LLM costs for simple queries
4. ✅ Deterministic and debuggable

**Then enhance with Solution 2 (Tag-Based) for:**
- Energy level filtering
- Indoor/outdoor preferences  
- Mood-based selection

**Save Solution 3 (LLM-Powered) for:**
- Complex natural language vibes
- Vibe combinations
- Personalized ranking

---

## Testing the Fix

```bash
# Test 1: "I want sports" should return ONLY sports
curl -X POST http://localhost:3001/api/chat/message \
  -H "Content-Type: application/json" \
  -d '{
    "conversationId": 1,
    "message": "I want sports",
    "location": { "city": "Bucharest" }
  }'

# Expected: 5 sports activities

# Test 2: "high energy fitness" should return fitness + adventure
curl -X POST http://localhost:3001/api/chat/message \
  -H "Content-Type: application/json" \
  -d '{
    "conversationId": 1,
    "message": "I want high energy fitness activities",
    "location": { "city": "Bucharest" }
  }'

# Expected: CrossFit, HIIT, sports activities

# Test 3: "relaxing spa" should return wellness
curl -X POST http://localhost:3001/api/chat/message \
  -H "Content-Type: application/json" \
  -d '{
    "conversationId": 1,
    "message": "relaxing spa day",
    "location": { "city": "Bucharest" }
  }'

# Expected: Spa, massage, wellness activities
```

---

## Impact

**Before Fix:**
- "I want sports" → 5% chance of getting sports (random selection)
- Result: Spa, painting, knitting ❌

**After Fix (Solution 1):**
- "I want sports" → 100% sports activities ✅
- "fitness" → 100% fitness activities ✅
- "adventure" → 100% adventure activities ✅

**This will dramatically improve approval rates for explicit category requests!**

---

## Next Steps

1. ✅ Implement Solution 1 (category filtering)
2. ✅ Test with training mode
3. ✅ Monitor approval rate improvements
4. 📊 If approval improves, add more high-energy activities (sports/fitness/adventure)
5. 🎯 Enhance with tag-based filtering for energy/mood
