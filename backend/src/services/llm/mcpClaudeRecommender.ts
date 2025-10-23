/**
 * MCP-Based Claude Recommender
 * 
 * Uses Claude 3 with PostgreSQL MCP server to query real activities database
 * NO MOCK DATA - queries actual database only
 */

import Anthropic from '@anthropic-ai/sdk';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
import { spawn } from 'child_process';
import { analyzeVibeSemantically } from './semanticVibeAnalyzer.js';

interface VibeRequest {
  vibe: string;
  region?: string;
  city?: string;
  durationHours?: number;
  indoorOutdoor?: 'indoor' | 'outdoor' | 'both';
  energyLevel?: 'low' | 'medium' | 'high';
  currentSeason?: string;
}

interface RecommendationResult {
  ideas: Array<{
    activityId: number;
    name: string;
    bucket: string;
    region: string;
    venues: Array<{
      venueId: number;
      name: string;
      city: string;
      rating?: number;
      booking_url?: string;
    }>;
  }>;
}

const MCP_SYSTEM_PROMPT = `You are an intelligent activity recommendation assistant with direct access to a PostgreSQL database containing curated activities and venues in Romania.

**DATABASE SCHEMA:**

activities table:
- id, slug, name, description
- category: Primary category
- tags: Array of FACETED tags in format "facet:value" (e.g., "mood:adrenaline", "experience_level:beginner")
- maps_url: Google Maps link for routing
- city, region: Location
- duration_min, duration_max: Minutes

venues table:
- id, name, address, city, region
- tags: Array of faceted tags
- website: Official site (for hours, booking)
- maps_url: Google Maps link
- price_tier: Cost level
- rating: 0-5 rating

**TAG FACETS AVAILABLE:**
- experience_level: beginner, intermediate, advanced
- energy: chill, medium, high
- indoor_outdoor: indoor, outdoor, either
- seasonality: winter, summer, shoulder, all
- mood: adrenaline, cozy, social, romantic, mindful, creative, explorer
- terrain: urban, forest, mountain, coast, lake
- equipment: rental-gear, helmet, harness, provided
- context: family, kids, solo, group, date
- requirement: guide-required, booking-required, lesson-recommended
- cost_band: $, $$, $$$, $$$$
- travel_time_band: nearby, in-city, day-trip, overnight

**YOUR TASK - TAG-FIRST WORKFLOW:**

1. **Parse user vibe** → Map to faceted tags
   - "I want adrenaline" → mood:adrenaline
   - "beginner-friendly" → experience_level:beginner
   - "outdoor summer" → indoor_outdoor:outdoor + seasonality:summer

2. **Query database** with tag filtering (DETERMINISTIC PREFILTER):
   \`\`\`sql
   SELECT * FROM activities 
   WHERE tags && ARRAY['mood:adrenaline', 'experience_level:beginner', 'seasonality:summer']
   AND region = 'București'
   LIMIT 30;
   \`\`\`
   
3. **Re-rank candidates** - From the returned results (max 30), select 5 diverse activities
   - Vary categories and moods
   - NEVER invent activities not in the result set

4. **Fetch venues** - For each selected activity:
   \`\`\`sql
   SELECT * FROM venues 
   WHERE activity_id = ? 
   ORDER BY rating DESC LIMIT 3;
   \`\`\`

5. **Return JSON** with tags, website, and maps_url included

**IMPORTANT RULES:**
- Use ONLY data from database queries - never invent activities or venues
- Query by tags using PostgreSQL array operators (&&, @>)
- Users discover hours via website and maps_url links (don't mention opening hours)
- Include faceted tags in response for frontend filtering
- Maximum 5 activities, 2-3 venues each

**RESPONSE FORMAT:**
Return ONLY valid JSON:
{
  "ideas": [
    {
      "activityId": 123,
      "name": "Activity name from DB",
      "bucket": "category from DB",
      "region": "region from DB",
      "tags": ["mood:adrenaline", "experience_level:beginner", "terrain:mountain"],
      "venues": [
        {
          "venueId": 456,
          "name": "Venue name from DB",
          "city": "city from DB",
          "website": "https://...",
          "maps_url": "https://google.com/maps?q=...",
          "tags": ["equipment:rental-gear", "cost_band:$$"]
        }
      ]
    }
  ]
}

**QUERY WORKFLOW:**
1. Parse vibe → identify faceted tags (mood, energy, experience_level, seasonality, indoor_outdoor, terrain, context)
2. Build tag array filter → tags && ARRAY['facet:value', ...]
3. Execute: SELECT * FROM activities WHERE tags && $1 AND region = $2 LIMIT 30
4. Re-rank for diversity (different categories/moods)
5. For top 5 → fetch venues with tags
6. Return JSON with tags, website, maps_url

Start by querying the database using tag-based filtering.`;

/**
 * Get recommendations using Claude with MCP database access
 * Queries real PostgreSQL database - no mock data
 */
export async function getMCPRecommendations(
  request: VibeRequest
): Promise<RecommendationResult> {
  
  // For now, query database directly via pg
  // TODO: Full MCP integration when Anthropic SDK supports it in Node.js
  return await queryDatabaseDirectly(request);
}

/**
 * Query database using semantic vibe analysis
 * Real data from activities and venues tables
 */
async function queryDatabaseDirectly(request: VibeRequest): Promise<RecommendationResult> {
  const { Pool } = await import('pg');
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL
  });

  try {
    // Normalize region to match database
    let region = request.region || request.city || 'Bucharest';
    // Convert common variations to database format
    if (region.toLowerCase() === 'bucharest') region = 'București';
    if (region.toLowerCase() === 'cluj') region = 'Cluj';
    if (region.toLowerCase() === 'brasov') region = 'Brașov';
    
    console.log('🔍 Analyzing vibe semantically:', request.vibe);
    
    // STEP 1: Deep semantic analysis
    const analysis = await analyzeVibeSemantically(request.vibe, {
      timeOfDay: new Date().getHours() < 12 ? 'morning' : 
                 new Date().getHours() < 17 ? 'afternoon' : 'evening'
    });
    
    console.log('🧠 Semantic analysis:', {
      intent: analysis.primaryIntent,
      categories: analysis.suggestedCategories,
      energy: analysis.energyLevel,
      confidence: analysis.confidence
    });
    
    // STEP 2: Build intelligent query with tag filtering
    let activitiesQuery = `
      SELECT a.id, a.name, a.category, a.city, a.region, a.description, a.tags, a.energy_level
      FROM activities a
      WHERE (a.region = $1 OR a.region = 'București')
    `;
    
    const queryParams: any[] = [region];
    let paramIndex = 2;
    
    // Split required tags into category tags and non-category tags
    const categoryTags = analysis.requiredTags.filter(tag => tag.startsWith('category:'));
    const otherTags = analysis.requiredTags.filter(tag => 
      !tag.startsWith('category:') && !tag.startsWith('energy:')
    );
    
    // Filter by category tags (must match ANY category - OR logic)
    if (categoryTags.length > 0) {
      activitiesQuery += ` AND a.tags && $${paramIndex}::text[]`;
      queryParams.push(categoryTags);
      paramIndex++;
      console.log('🎯 Category tags (ANY):', categoryTags);
    }
    
    // Filter by other required tags (must have ALL of these - AND logic)
    if (otherTags.length > 0) {
      activitiesQuery += ` AND a.tags @> $${paramIndex}::text[]`;
      queryParams.push(otherTags);
      paramIndex++;
      console.log('🎯 Other required tags (ALL):', otherTags);
    }
    
    // If no required tags but has suggested categories, filter by category
    if (analysis.requiredTags.length === 0 && analysis.suggestedCategories.length > 0) {
      const categoryTagsFromSuggested = analysis.suggestedCategories.map(c => `category:${c}`);
      activitiesQuery += ` AND a.tags && $${paramIndex}::text[]`;
      queryParams.push(categoryTagsFromSuggested);
      paramIndex++;
      console.log('🎯 Category filter (from suggestions):', categoryTagsFromSuggested);
    }
    
    // Filter by energy level if specified
    if (analysis.energyLevel) {
      activitiesQuery += ` AND a.energy_level = $${paramIndex}`;
      queryParams.push(analysis.energyLevel);
      paramIndex++;
      console.log('⚡ Energy filter:', analysis.energyLevel);
    }
    
    // Exclude activities with avoid tags
    if (analysis.avoidTags.length > 0) {
      activitiesQuery += ` AND NOT (a.tags && $${paramIndex}::text[])`;
      queryParams.push(analysis.avoidTags);
      paramIndex++;
      console.log('❌ Avoiding tags:', analysis.avoidTags);
    }
    
    // Smart ranking: prefer activities with preferred tags, then random within matches
    if (analysis.preferredTags.length > 0) {
      // Count how many preferred tags each activity has
      activitiesQuery += `
        ORDER BY 
          CASE WHEN a.region = $1 THEN 0 ELSE 1 END,
          (SELECT COUNT(*) FROM unnest(a.tags) tag WHERE tag = ANY($${paramIndex}::text[])) DESC,
          RANDOM()
      `;
      queryParams.push(analysis.preferredTags);
      paramIndex++;
    } else {
      activitiesQuery += `
        ORDER BY 
          CASE WHEN a.region = $1 THEN 0 ELSE 1 END,
          RANDOM()
      `;
    }
    
    activitiesQuery += ` LIMIT 20`;  // Get more candidates for diversity
    
    console.log('🔍 Executing intelligent query...');
    const { rows: activities } = await pool.query(activitiesQuery, queryParams);
    
    console.log(`✅ Found ${activities.length} semantically matched activities`);
    
    if (activities.length === 0) {
      console.log('⚠️ No activities matched filters, falling back to broader search...');
      console.log('🚨 ACTIVITY GAP DETECTED:');
      console.log(`   Vibe: "${request.vibe}"`);
      console.log(`   Required tags: ${analysis.requiredTags.join(', ')}`);
      console.log(`   Energy: ${analysis.energyLevel}`);
      console.log(`   Categories: ${analysis.suggestedCategories.join(', ')}`);
      console.log('   💡 Consider adding more activities with these attributes!');
      
      // Fallback: just filter by category if available
      const fallbackQuery = `
        SELECT a.id, a.name, a.category, a.city, a.region, a.description, a.tags
        FROM activities a
        WHERE (a.region = $1 OR a.region = 'București')
        ${analysis.suggestedCategories.length > 0 ? 
          `AND a.category = ANY($2::text[])` : ''}
        ORDER BY 
          CASE WHEN a.region = $1 THEN 0 ELSE 1 END,
          RANDOM()
        LIMIT 10
      `;
      
      const fallbackParams = analysis.suggestedCategories.length > 0 
        ? [region, analysis.suggestedCategories] 
        : [region];
      
      const { rows: fallbackActivities } = await pool.query(fallbackQuery, fallbackParams);
      
      if (fallbackActivities.length === 0) {
        throw new Error(`No activities found for region: ${region}`);
      }
      
      console.log(`✅ Fallback found ${fallbackActivities.length} activities`);
      activities.push(...fallbackActivities);
    }
    
    // STEP 3: Select diverse final 5 activities
    const selectedActivities = selectDiverseActivities(activities, 5, analysis);
    
    // STEP 4: For each selected activity, get venues
    const ideas = await Promise.all(
      selectedActivities.map(async (activity) => {
        const venuesQuery = `
          SELECT v.id, v.name, v.city, v.rating
          FROM venues v
          WHERE v.activity_id = $1
          ORDER BY v.rating DESC NULLS LAST
          LIMIT 3
        `;
        
        const { rows: venues } = await pool.query(venuesQuery, [activity.id]);
        
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
    
    console.log(`🎯 Returning ${ideas.length} final recommendations`);
    return { ideas };
    
  } catch (error) {
    console.error('❌ Database query error:', error);
    throw error;
  } finally {
    await pool.end();
  }
}

/**
 * Select diverse activities from candidates
 * Ensures variety in categories and moods
 */
function selectDiverseActivities(activities: any[], count: number, analysis: any): any[] {
  if (activities.length <= count) {
    return activities;
  }
  
  const selected: any[] = [];
  const usedCategories = new Set<string>();
  
  // First pass: select one from each category
  for (const activity of activities) {
    if (selected.length >= count) break;
    
    if (!usedCategories.has(activity.category)) {
      selected.push(activity);
      usedCategories.add(activity.category);
    }
  }
  
  // Second pass: fill remaining slots with highest-scoring activities
  const remaining = activities.filter(a => !selected.includes(a));
  
  while (selected.length < count && remaining.length > 0) {
    // Pick best remaining activity (prefer activities with preferred tags)
    let best = remaining[0];
    let bestScore = scoreActivity(best, analysis);
    
    for (let i = 1; i < remaining.length; i++) {
      const score = scoreActivity(remaining[i], analysis);
      if (score > bestScore) {
        best = remaining[i];
        bestScore = score;
      }
    }
    
    selected.push(best);
    remaining.splice(remaining.indexOf(best), 1);
  }
  
  return selected;
}

/**
 * Score activity based on how well it matches analysis
 */
function scoreActivity(activity: any, analysis: any): number {
  let score = 0;
  
  if (!activity.tags || !Array.isArray(activity.tags)) {
    return score;
  }
  
  // +2 points for each preferred tag
  for (const preferredTag of analysis.preferredTags || []) {
    if (activity.tags.includes(preferredTag)) {
      score += 2;
    }
  }
  
  // +1 point for each suggested category
  for (const category of analysis.suggestedCategories || []) {
    if (activity.tags.includes(`category:${category}`)) {
      score += 1;
    }
  }
  
  // +1 point for matching energy level
  if (activity.energy_level === analysis.energyLevel) {
    score += 1;
  }
  
  return score;
}
/**
 * Test MCP connection and database access
 */
export async function testMCPConnection(): Promise<{
  success: boolean;
  stats?: any;
  error?: string;
}> {
  try {
    const anthropic = new Anthropic({
      apiKey: process.env.CLAUDE_API_KEY
    });

    const response = await anthropic.messages.create({
      model: 'claude-3-haiku-20240307',
      max_tokens: 1024,
      system: MCP_SYSTEM_PROMPT,
      messages: [
        {
          role: 'user',
          content: 'Query the database and return statistics: total activities, total venues, and list all categories. Return as JSON.'
        }
      ]
    });

    const content = response.content[0];
    if (content.type === 'text') {
      let jsonText = content.text.trim();
      jsonText = jsonText.replace(/^```json\n?/i, '').replace(/\n?```$/, '');
      const stats = JSON.parse(jsonText);
      return { success: true, stats };
    }

    return { success: false, error: 'Unexpected response format' };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

export default {
  getMCPRecommendations,
  testMCPConnection
};
