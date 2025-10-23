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
import { getActivityFeedbackScores, filterAvoidedActivities, getFeedbackMultiplier } from '../feedback/feedbackScoring.js';
import { FilterOptions, buildFilterClause, filterByDistance } from '../filters/activityFilters.js';

interface VibeRequest {
  vibe: string;
  region?: string;
  city?: string;
  durationHours?: number;
  indoorOutdoor?: 'indoor' | 'outdoor' | 'both';
  energyLevel?: 'low' | 'medium' | 'high';
  currentSeason?: string;
  filters?: FilterOptions; // NEW: Comprehensive filtering options
}

interface RecommendationResult {
  ideas: Array<{
    activityId: number;
    name: string;
    bucket: string;
    region: string;
    distanceKm?: number; // NEW: Distance from user if location provided
    durationMinutes?: number; // NEW: Activity duration
    crowdSize?: string; // NEW: Crowd size
    groupSuitability?: string; // NEW: Solo/group friendly
    priceTier?: string; // NEW: Price tier
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
    connectionString: process.env.DATABASE_URL || 'postgresql://localhost/vibe_app',
  });
  
  try {
    // STEP 0: Load feedback scores for activity filtering and ranking
    console.log('📊 Loading training feedback scores...');
    const feedbackScores = await getActivityFeedbackScores(pool);
    console.log(`✅ Loaded feedback for ${feedbackScores.size} activities`);
    
    // Normalize region to match database
    let region = request.region || request.city || 'Bucharest';
    // Convert common variations to database format
    if (region.toLowerCase() === 'bucharest') region = 'București';
    if (region.toLowerCase() === 'cluj') region = 'Cluj';
    if (region.toLowerCase() === 'brasov') region = 'Brașov';
    
    console.log('🔍 Analyzing vibe semantically:', request.vibe);
    console.log('📋 Filters received:', JSON.stringify(request.filters, null, 2));
    
    // STEP 1: Deep semantic analysis
    const analysis = await analyzeVibeSemantically(request.vibe, {
      timeOfDay: new Date().getHours() < 12 ? 'morning' : 
                 new Date().getHours() < 17 ? 'afternoon' : 'evening'
    });
    
    console.log('🧠 Semantic analysis:', {
      intent: analysis.primaryIntent,
      categories: analysis.suggestedCategories,
      energy: analysis.energyLevel,
      confidence: analysis.confidence,
      keywordPrefer: analysis.keywordPrefer
    });
    
    // STEP 2: Build intelligent query with tag filtering AND user filters
    // Check if user wants to search anywhere (no distance limit or large distance)
    const searchEverywhere = !request.filters?.maxDistanceKm || request.filters.maxDistanceKm >= 50;
    
    let activitiesQuery = `
      SELECT a.id, a.name, a.category, a.city, a.region, a.description, a.tags, 
             a.energy_level, a.indoor_outdoor, a.latitude, a.longitude,
             a.duration_min, a.duration_max, a.crowd_size, a.crowd_type, 
             a.group_suitability, a.price_tier
      FROM activities a
      WHERE ${searchEverywhere ? '1=1' : '(a.region = $1 OR a.region = \'București\')'}
    `;
    
    console.log(`🌍 Search scope: ${searchEverywhere ? 'ALL ROMANIA' : `${region} + București`}`);
    if (searchEverywhere) {
      console.log(`🗺️  Preference: Activities OUTSIDE ${region} (user selected "Anywhere")`);
    }
    
    // Always include region as $1 for ORDER BY ranking, even when not used in WHERE
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
    
    // ALWAYS exclude activities that require explicit request (language learning, etc.)
    // These have been identified as too niche through training feedback
    activitiesQuery += ` AND NOT (a.tags && ARRAY['requirement:explicit-request']::text[])`;
    console.log('🚫 Auto-excluding activities with requirement:explicit-request tag');
    
    // STEP 2.4: Apply user-defined filters
    if (request.filters && Object.keys(request.filters).length > 0) {
      // Pass searchEverywhere flag to filter builder for travel-aware duration logic
      const filterResult = buildFilterClause(request.filters, paramIndex, searchEverywhere);
      activitiesQuery += filterResult.clause;
      queryParams.push(...filterResult.params);
      paramIndex += filterResult.params.length;
      console.log('🔍 Applied user filters:', Object.keys(request.filters).join(', '));
      if (searchEverywhere && request.filters.durationRange === 'full-day') {
        console.log('✈️ Travel-aware duration: Activity time + Travel time = Full day');
      }
    }
    
    // Smart ranking: prefer activities with preferred tags, then random within matches
    if (analysis.preferredTags.length > 0) {
      // Count how many preferred tags each activity has
      if (searchEverywhere) {
        // When "Anywhere" is explicitly selected: PREFER activities OUTSIDE current city
        // User is saying "I want to explore beyond my city"
        activitiesQuery += `
          ORDER BY 
            CASE WHEN a.region != $1 THEN 0 ELSE 1 END,  -- Outside city ranked HIGHER
            (SELECT COUNT(*) FROM unnest(a.tags) tag WHERE tag = ANY($${paramIndex}::text[])) DESC,
            RANDOM()
        `;
      } else {
        // When no distance filter: prefer LOCAL activities (default behavior)
        activitiesQuery += `
          ORDER BY 
            CASE WHEN a.region = $1 THEN 0 ELSE 1 END,  -- Local city ranked HIGHER
            (SELECT COUNT(*) FROM unnest(a.tags) tag WHERE tag = ANY($${paramIndex}::text[])) DESC,
            RANDOM()
        `;
      }
      queryParams.push(analysis.preferredTags);
      paramIndex++;
    } else {
      if (searchEverywhere) {
        // When "Anywhere" selected: PREFER activities outside current city
        activitiesQuery += `
          ORDER BY 
            CASE WHEN a.region != $1 THEN 0 ELSE 1 END,  -- Outside city first
            RANDOM()
        `;
      } else {
        // When no distance filter: prefer local
        activitiesQuery += `
          ORDER BY 
            CASE WHEN a.region = $1 THEN 0 ELSE 1 END,  -- Local first
            RANDOM()
        `;
      }
    }
    
    // Increase limit when searching all of Romania for specific activities
    const queryLimit = searchEverywhere ? 50 : 20;
    activitiesQuery += ` LIMIT ${queryLimit}`;
    console.log(`📊 Query limit: ${queryLimit} activities`);
    
    console.log('🔍 Executing intelligent query...');
    let { rows: activities } = await pool.query(activitiesQuery, queryParams);
    
    console.log(`✅ Found ${activities.length} semantically matched activities`);
    
    // STEP 2.5: Filter out consistently rejected activities based on feedback
    const beforeFeedbackFilter = activities.length;
    activities = filterAvoidedActivities(activities, feedbackScores);
    if (beforeFeedbackFilter > activities.length) {
      console.log(`🚫 Feedback filter: Removed ${beforeFeedbackFilter - activities.length} poorly-rated activities`);
    }
    
    // STEP 2.6: Apply keyword matching - MANDATORY for specific requests, PREFERRED for general
    if (analysis.keywordPrefer && analysis.keywordPrefer.length > 0) {
      // Determine if this is a SPECIFIC activity request (high confidence) or GENERAL request
      const isSpecificActivity = analysis.confidence >= 0.9;
      
      if (isSpecificActivity) {
        // HIGH SPECIFICITY: MANDATORY keyword matching (e.g., "mountain biking", "rock climbing")
        console.log('🎯 HIGH SPECIFICITY: Applying MANDATORY keyword filter for:', analysis.keywordPrefer);
        
        const beforeKeywordFilter = activities.length;
        activities = activities.filter((activity: any) => {
          const searchText = `${activity.name} ${activity.description || ''}`.toLowerCase();
          const hasMatch = analysis.keywordPrefer!.some(keyword => 
            searchText.includes(keyword.toLowerCase())
          );
          if (hasMatch) {
            activity._keywordMatchCount = analysis.keywordPrefer!.filter(keyword => 
              searchText.includes(keyword.toLowerCase())
            ).length;
          }
          return hasMatch;
        });
        
        console.log(`✅ MANDATORY keyword matching: ${activities.length} activities (removed ${beforeKeywordFilter - activities.length})`);
        
        // Sort by keyword match count
        activities.sort((a: any, b: any) => (b._keywordMatchCount || 0) - (a._keywordMatchCount || 0));
        console.log(`   Top match: "${activities[0]?.name}" with ${activities[0]?._keywordMatchCount} keyword matches`);
      } else {
        // GENERAL REQUEST: PREFERRED keyword boosting (e.g., "adventure in the mountains", "outdoor fun")
        console.log('🌟 GENERAL REQUEST: Applying keyword BOOSTING (not mandatory) for:', analysis.keywordPrefer);
        
        // Score all activities by keyword matches (but don't filter out non-matches)
        activities.forEach((activity: any) => {
          const searchText = `${activity.name} ${activity.description || ''}`.toLowerCase();
          activity._keywordMatchCount = analysis.keywordPrefer!.filter(keyword => 
            searchText.includes(keyword.toLowerCase())
          ).length;
        });
        
        // Sort by keyword match count (activities with keywords go first, but others still included)
        activities.sort((a: any, b: any) => (b._keywordMatchCount || 0) - (a._keywordMatchCount || 0));
        
        const withKeywords = activities.filter(a => a._keywordMatchCount > 0).length;
        console.log(`✅ Keyword boosting: ${withKeywords} activities match keywords, ${activities.length - withKeywords} others still included`);
      }
    }
    
    // STEP 2.7: Apply keyword AVOID filtering
    if (analysis.keywordAvoid && analysis.keywordAvoid.length > 0) {
      const beforeCount = activities.length;
      activities = activities.filter((activity: any) => {
        const activityName = activity.name.toLowerCase();
        const hasAvoidKeyword = analysis.keywordAvoid!.some(keyword => 
          activityName.includes(keyword.toLowerCase())
        );
        return !hasAvoidKeyword;
      });
      console.log(`🚫 Keyword filtering: Removed ${beforeCount - activities.length} activities with avoid keywords:`, analysis.keywordAvoid);
    }
    
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
    
    // STEP 2.7: Apply distance filtering if location provided
    if (request.filters?.userLatitude && request.filters?.userLongitude) {
      const beforeDistanceFilter = activities.length;
      activities = filterByDistance(
        activities,
        request.filters.userLatitude,
        request.filters.userLongitude,
        request.filters.maxDistanceKm || null
      );
      console.log(`📍 Distance filter: ${activities.length} activities after filtering (removed ${beforeDistanceFilter - activities.length})`);
      if (activities.length > 0) {
        console.log(`   Closest: ${activities[0].name} (${activities[0].distanceKm}km away)`);
      }
    }
    
    // STEP 3: Ensure we have enough activities - if not, do broader search
    if (activities.length < 5) {
      console.log(`⚠️ Only ${activities.length} activities found, broadening search...`);
      
      // Fallback: Search with just category, no other filters
      const fallbackQuery = `
        SELECT a.id, a.name, a.category, a.city, a.region, a.description, a.tags,
               a.energy_level, a.indoor_outdoor, a.latitude, a.longitude,
               a.duration_min, a.duration_max, a.crowd_size, a.crowd_type,
               a.group_suitability, a.price_tier
        FROM activities a
        WHERE ${searchEverywhere ? '1=1' : '(a.region = \'București\' OR a.region IN (\'Prahova\', \'Brașov\', \'Ilfov\'))'}
        ${analysis.suggestedCategories.length > 0 ? `AND a.category = ANY(ARRAY[${analysis.suggestedCategories.map(c => `'${c}'`).join(',')}]::text[])` : ''}
        ORDER BY RANDOM()
        LIMIT 30
      `;
      
      const { rows: fallbackActivities } = await pool.query(fallbackQuery);
      console.log(`🔄 Fallback found ${fallbackActivities.length} additional activities`);
      
      // Apply keyword matching to fallback too
      if (analysis.keywordPrefer && analysis.keywordPrefer.length > 0) {
        const keywordMatches = fallbackActivities.filter((activity: any) => {
          const searchText = `${activity.name} ${activity.description || ''}`.toLowerCase();
          return analysis.keywordPrefer!.some(keyword => 
            searchText.includes(keyword.toLowerCase())
          );
        });
        activities.push(...keywordMatches);
        console.log(`✅ Added ${keywordMatches.length} keyword-matching activities from fallback`);
      } else {
        activities.push(...fallbackActivities.slice(0, 10));
      }
    }
    
    // STEP 4: Select diverse final 5 activities (with feedback scoring)
    const selectedActivities = selectDiverseActivities(activities, 5, analysis, feedbackScores);
    
    // CRITICAL: If we still don't have 5, just take what we have
    if (selectedActivities.length < 5 && activities.length > selectedActivities.length) {
      console.log(`⚠️ Only selected ${selectedActivities.length}, adding more to reach 5...`);
      const remaining = activities.filter(a => !selectedActivities.includes(a)).slice(0, 5 - selectedActivities.length);
      selectedActivities.push(...remaining);
    }
    
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
          energy_level: activity.energy_level,
          indoor_outdoor: activity.indoor_outdoor,
          distanceKm: activity.distanceKm, // Include if calculated
          durationMinutes: activity.duration_min, // Activity duration
          crowdSize: activity.crowd_size,
          groupSuitability: activity.group_suitability,
          priceTier: activity.price_tier,
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
 * Now enhanced with feedback-based scoring AND energy variety
 */
function selectDiverseActivities(activities: any[], count: number, analysis: any, feedbackScores?: Map<number, any>): any[] {
  if (activities.length <= count) {
    console.log(`📊 Returning all ${activities.length} activities (less than ${count} requested)`);
    return activities;
  }
  
  console.log(`🎲 Selecting ${count} diverse activities from ${activities.length} candidates`);
  
  const selected: any[] = [];
  const usedCategories = new Set<string>();
  
  // Apply feedback multipliers to activities for scoring
  if (feedbackScores) {
    activities.forEach(activity => {
      activity._feedbackScore = getFeedbackMultiplier(activity.id, feedbackScores);
    });
    
    // Sort by feedback score first (higher is better)
    activities.sort((a, b) => (b._feedbackScore || 1.0) - (a._feedbackScore || 1.0));
    console.log('🎯 Activities ranked by feedback scores');
  }
  
  // NEW: Map energy levels to numeric values for comparison
  const energyLevelMap: Record<string, number> = {
    'low': 1,
    'medium': 2,
    'high': 3
  };
  
  const userEnergyLevel = analysis.energyLevel || 'medium';
  const userEnergyValue = energyLevelMap[userEnergyLevel] || 2;
  
  console.log(`⚡ User energy preference: ${userEnergyLevel} (${userEnergyValue})`);
  
  // NEW: Calculate target distribution - gentle variety, not extreme
  // If user wants low energy: 3 low, 1 medium, 1 high (gentle push)
  // If user wants medium: 3 medium, 1 low, 1 high (explore both directions)
  // If user wants high: 3 high, 1 medium, 1 low (try to balance)
  let targetDistribution = {
    matchingEnergy: Math.ceil(count * 0.6), // 60% match user preference (3 out of 5)
    stretchEnergy: Math.floor(count * 0.4)  // 40% gently stretch (2 out of 5)
  };
  
  console.log(`🎯 Target: ${targetDistribution.matchingEnergy} matching energy, ${targetDistribution.stretchEnergy} stretch activities`);
  
  // First pass: select diverse categories, prioritizing user's energy preference
  const matchingEnergyActivities = activities.filter(a => a.energy_level === userEnergyLevel);
  const stretchActivities = activities.filter(a => a.energy_level !== userEnergyLevel);
  
  console.log(`   Available: ${matchingEnergyActivities.length} matching energy, ${stretchActivities.length} stretch`);
  
  // Pick from matching energy first
  for (const activity of matchingEnergyActivities) {
    if (selected.length >= targetDistribution.matchingEnergy) break;
    
    if (!usedCategories.has(activity.category)) {
      selected.push(activity);
      usedCategories.add(activity.category);
      console.log(`   ✓ Added ${activity.name} (${activity.energy_level} energy, matches preference)`);
    }
  }
  
  // Fill remaining matching energy slots
  for (const activity of matchingEnergyActivities) {
    if (selected.length >= targetDistribution.matchingEnergy) break;
    if (!selected.includes(activity)) {
      selected.push(activity);
      usedCategories.add(activity.category);
      console.log(`   ✓ Added ${activity.name} (${activity.energy_level} energy, matches preference)`);
    }
  }
  
  // NEW: Now add stretch activities (different energy levels)
  // Prefer one step up/down rather than extreme jumps (gentle push)
  const gentleStretch = stretchActivities.filter(a => {
    const activityEnergyValue = energyLevelMap[a.energy_level] || 2;
    const diff = Math.abs(activityEnergyValue - userEnergyValue);
    return diff === 1; // Only 1 level different (gentle)
  });
  
  const extremeStretch = stretchActivities.filter(a => {
    const activityEnergyValue = energyLevelMap[a.energy_level] || 2;
    const diff = Math.abs(activityEnergyValue - userEnergyValue);
    return diff > 1; // More than 1 level different
  });
  
  console.log(`   Stretch options: ${gentleStretch.length} gentle, ${extremeStretch.length} extreme`);
  
  // Prefer gentle stretch first (one energy level up/down)
  for (const activity of gentleStretch) {
    if (selected.length >= count) break;
    if (!usedCategories.has(activity.category)) {
      selected.push(activity);
      usedCategories.add(activity.category);
      console.log(`   ⚡ Added ${activity.name} (${activity.energy_level} energy, gentle stretch)`);
    }
  }
  
  // Fill remaining with any stretch activities
  for (const activity of [...gentleStretch, ...extremeStretch]) {
    if (selected.length >= count) break;
    if (!selected.includes(activity)) {
      selected.push(activity);
      console.log(`   ⚡ Added ${activity.name} (${activity.energy_level} energy, variety)`);
    }
  }
  
  // Final pass: fill any remaining slots with best-scoring activities
  const remaining = activities.filter(a => !selected.includes(a));
  
  while (selected.length < count && remaining.length > 0) {
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
    console.log(`   + Filled remaining slot with ${best.name} (${best.energy_level} energy)`);
    remaining.splice(remaining.indexOf(best), 1);
  }
  
  // Log final energy distribution
  const energyDistribution = selected.reduce((acc, a) => {
    acc[a.energy_level] = (acc[a.energy_level] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  console.log(`✅ Selected ${selected.length} diverse activities with energy distribution:`, energyDistribution);
  selected.forEach((a, i) => console.log(`   ${i+1}. ${a.name} (${a.category}, ${a.energy_level} energy)`));
  
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
