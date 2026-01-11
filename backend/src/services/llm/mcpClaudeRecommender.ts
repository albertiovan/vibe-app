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
import { analyzeRomanianVibe } from './romanianVibeAnalyzer.js';
import { getActivityFeedbackScores, filterAvoidedActivities, getFeedbackMultiplier } from '../feedback/feedbackScoring.js';
import { FilterOptions, buildFilterClause, filterByDistance } from '../filters/activityFilters.js';
import { multiLocationWeather } from '../weather/multiLocationWeather.js';
import { assessWeatherSuitability } from '../orchestrator/weatherSuitability.js';

interface VibeRequest {
  vibe: string;
  region?: string;
  city?: string;
  durationHours?: number;
  indoorOutdoor?: 'indoor' | 'outdoor' | 'both';
  energyLevel?: 'low' | 'medium' | 'high';
  currentSeason?: string;
  filters?: FilterOptions; // NEW: Comprehensive filtering options
  language?: 'en' | 'ro'; // NEW: Language preference for responses
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
    expandedRadius?: boolean; // NEW: Indicates if distance was expanded
    originalMaxDistance?: number; // NEW: Original distance limit
    expandedMaxDistance?: number; // NEW: Expanded distance limit
    venues: Array<{
      venueId: number;
      name: string;
      city: string;
      rating?: number;
      booking_url?: string;
    }>;
  }>;
  metadata?: {
    degradationLevel: number;
    distanceExpanded: boolean;
    uxMessage: string | null;
  };
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
   - "I want to read" / "book shopping" → category:creative + keywords:["bookstore", "library", "reading"]
   - "quiet reading space" → mood:contemplative + keywords:["library", "bookstore", "cafe"]

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
  const dbUrl = process.env.DATABASE_URL || 'postgresql://localhost/vibe_app';
  console.log('🔌 Database connection:', dbUrl.includes('rds.amazonaws.com') ? 'RDS (production)' : 'localhost (development)');
  const pool = new Pool({
    connectionString: dbUrl,
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
    console.log('🌐 Language:', request.language || 'en');
    console.log('📋 Filters received:', JSON.stringify(request.filters, null, 2));
    
    // STEP 1: Deep semantic analysis (language-aware)
    const isRomanian = request.language === 'ro';
    const analysis = isRomanian 
      ? await analyzeRomanianVibe(request.vibe, {
          timeOfDay: new Date().getHours() < 12 ? 'morning' : 
                     new Date().getHours() < 17 ? 'afternoon' : 'evening'
        })
      : await analyzeVibeSemantically(request.vibe, {
          timeOfDay: new Date().getHours() < 12 ? 'morning' : 
                     new Date().getHours() < 17 ? 'afternoon' : 'evening'
        });
    
    console.log('🧠 Semantic analysis:', {
      language: isRomanian ? 'Romanian' : 'English',
      intent: analysis.primaryIntent,
      categories: analysis.suggestedCategories,
      energy: analysis.energyLevel,
      confidence: analysis.confidence,
      keywordPrefer: analysis.keywordPrefer
    });
    
    // STEP 1.5: Merge user's favorite categories with semantic analysis
    if (request.filters?.favoriteCategories && request.filters.favoriteCategories.length > 0) {
      console.log('❤️ User favorite categories:', request.filters.favoriteCategories);
      
      // Add favorite categories to suggested categories if not already present
      const favoriteCategoryTags = request.filters.favoriteCategories.map(c => `category:${c}`);
      
      // Boost activities in favorite categories by adding them to preferred tags
      analysis.preferredTags = [
        ...analysis.preferredTags,
        ...favoriteCategoryTags
      ];
      
      // If user's vibe matches their favorite categories, prioritize those
      const vibeMatchesFavorites = analysis.suggestedCategories.some(cat => 
        request.filters?.favoriteCategories?.includes(cat)
      );
      
      if (vibeMatchesFavorites) {
        console.log('✨ Vibe matches favorite categories - boosting those activities');
      } else {
        // Even if vibe doesn't match, still include some favorites for variety
        console.log('🎯 Including favorite categories for personalization');
        analysis.suggestedCategories = [
          ...analysis.suggestedCategories,
          ...request.filters.favoriteCategories.slice(0, 2) // Add top 2 favorites
        ];
      }
    }
    
    // STEP 2: Build intelligent query with NEW LOCATION FILTERING LOGIC
    // Three states: undefined (variety), 20 (in city only), null (explore outside)
    const userCity = request.filters?.userCity || region;
    const locationFilter = request.filters?.maxDistanceKm;
    
    let locationMode: 'variety' | 'in-city' | 'explore-outside';
    let whereClause: string;
    
    if (locationFilter === undefined) {
      // NO FILTER: Variety mode - mix of local and outside activities
      locationMode = 'variety';
      // Use $1 in a way that doesn't filter but helps PostgreSQL infer type
      whereClause = '($1::text IS NOT NULL OR $1::text IS NULL)'; // Always true, but uses $1
      console.log(`🌍 Location Mode: VARIETY (mix of ${userCity} + outside)`);
    } else if (locationFilter === 20) {
      // IN CITY: Only activities in user's current city
      locationMode = 'in-city';
      whereClause = `a.region = $1::text`; // Strict city match
      console.log(`📍 Location Mode: IN CITY ONLY (${userCity})`);
    } else if (locationFilter === null) {
      // EXPLORE ROMANIA: Only activities OUTSIDE user's city
      locationMode = 'explore-outside';
      whereClause = `a.region != $1::text`; // Exclude user's city
      console.log(`🗺️  Location Mode: EXPLORE OUTSIDE (exclude ${userCity})`);
    } else {
      // Fallback for other distance values
      locationMode = 'variety';
      whereClause = '($1::text IS NOT NULL OR $1::text IS NULL)'; // Always true, but uses $1
      console.log(`🌍 Location Mode: CUSTOM DISTANCE (${locationFilter}km)`);
    }
    
    // Select appropriate language fields based on user preference
    const nameField = isRomanian ? 'COALESCE(a.name_ro, a.name)' : 'a.name';
    const descField = isRomanian ? 'COALESCE(a.description_ro, a.description)' : 'a.description';
    const tagsField = isRomanian ? 'COALESCE(a.tags_ro, a.tags)' : 'a.tags';
    
    let activitiesQuery = `
      SELECT a.id, ${nameField} as name, a.category, a.city, a.region, 
             ${descField} as description, ${tagsField} as tags, 
             a.energy_level, a.indoor_outdoor, a.latitude, a.longitude,
             a.duration_min, a.duration_max, a.crowd_size, a.crowd_type, 
             a.group_suitability, a.price_tier
      FROM activities a
      WHERE ${whereClause}
    `;
    
    // Always include region as $1 for ORDER BY ranking, even when not used in WHERE
    const queryParams: (string | string[] | number)[] = [region];
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
      // Pass explore-outside flag to filter builder for travel-aware duration logic
      const filterResult = buildFilterClause(request.filters, paramIndex, locationMode === 'explore-outside');
      activitiesQuery += filterResult.clause;
      queryParams.push(...filterResult.params);
      paramIndex += filterResult.params.length;
      console.log('🔍 Applied user filters:', Object.keys(request.filters).join(', '));
      if (locationMode === 'explore-outside' && request.filters.durationRange === 'full-day') {
        console.log('✈️ Travel-aware duration: Activity time + Travel time = Full day');
      }
    }
    
    // Smart ranking: prefer activities with preferred tags, then random within matches
    if (analysis.preferredTags.length > 0) {
      // Count how many preferred tags each activity has
      if (locationMode === 'explore-outside') {
        // Explore Romania: PREFER activities OUTSIDE current city
        activitiesQuery += `
          ORDER BY 
            CASE WHEN a.region != $1 THEN 0 ELSE 1 END,  -- Outside city ranked HIGHER
            (SELECT COUNT(*) FROM unnest(a.tags) tag WHERE tag = ANY($${paramIndex}::text[])) DESC,
            RANDOM()
        `;
      } else if (locationMode === 'in-city') {
        // In City: Only local (already filtered in WHERE), just rank by tags
        activitiesQuery += `
          ORDER BY 
            (SELECT COUNT(*) FROM unnest(a.tags) tag WHERE tag = ANY($${paramIndex}::text[])) DESC,
            RANDOM()
        `;
      } else {
        // Variety mode: Random mix (variety enforced in post-processing)
        activitiesQuery += `
          ORDER BY 
            (SELECT COUNT(*) FROM unnest(a.tags) tag WHERE tag = ANY($${paramIndex}::text[])) DESC,
            RANDOM()
        `;
      }
      queryParams.push(analysis.preferredTags);
      paramIndex++;
    } else {
      if (locationMode === 'explore-outside') {
        // Explore Romania: PREFER activities outside current city
        activitiesQuery += `
          ORDER BY 
            CASE WHEN a.region != $1::text THEN 0 ELSE 1 END,  -- Outside city first
            RANDOM()
        `;
      } else {
        // In City or Variety: Random order (variety enforced later)
        activitiesQuery += `
          ORDER BY RANDOM()
        `;
      }
    }
    
    // Increase limit when exploring outside city for more options
    const queryLimit = locationMode === 'explore-outside' ? 50 : 30;
    activitiesQuery += ` LIMIT ${queryLimit}`;
    console.log(`📊 Query limit: ${queryLimit} activities`);
    
    console.log('🔍 Executing intelligent query...');
    console.log('📝 Query:', activitiesQuery);
    console.log('📝 Params:', queryParams);
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
    
    // STEP 2.8: Apply distance filtering if location provided
    let distanceExpanded = false;
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
    
    // STEP 2.9: GRACEFUL DEGRADATION - progressively relax filters if no results
    let degradationLevel = 0;
    const originalMaxDistance = request.filters?.maxDistanceKm;
    
    if (activities.length === 0) {
      console.log('⚠️ No activities matched filters, starting graceful degradation...');
      
      // DEGRADATION LEVEL 1: Demote MANDATORY keywords to PREFERRED (if high specificity)
      if (analysis.confidence >= 0.9 && analysis.keywordPrefer && analysis.keywordPrefer.length > 0) {
        degradationLevel = 1;
        console.log('🔄 DEGRADATION LEVEL 1: Demoting MANDATORY keywords to PREFERRED boosting');
        
        // Re-query with same semantic filters but keyword boosting instead of mandatory
        const { rows: relaxedActivities } = await pool.query(activitiesQuery, queryParams);
        
        // Apply keyword boosting (not filtering)
        relaxedActivities.forEach((activity: any) => {
          const searchText = `${activity.name} ${activity.description || ''}`.toLowerCase();
          activity._keywordMatchCount = analysis.keywordPrefer!.filter(keyword => 
            searchText.includes(keyword.toLowerCase())
          ).length;
        });
        
        // Sort by keyword matches (but keep all)
        relaxedActivities.sort((a: any, b: any) => (b._keywordMatchCount || 0) - (a._keywordMatchCount || 0));
        
        // Apply distance filter
        if (request.filters?.userLatitude && request.filters?.userLongitude) {
          activities = filterByDistance(
            relaxedActivities,
            request.filters.userLatitude,
            request.filters.userLongitude,
            request.filters.maxDistanceKm || null
          );
        } else {
          activities = relaxedActivities;
        }
        
        const withKeywords = activities.filter(a => a._keywordMatchCount > 0).length;
        console.log(`✅ Level 1: Found ${activities.length} activities (${withKeywords} with keywords, ${activities.length - withKeywords} others)`);
      }
    }
    
    if (activities.length === 0) {
      // DEGRADATION LEVEL 2: Expand distance radius by 50%
      if (originalMaxDistance && originalMaxDistance < 25) {
        degradationLevel = 2;
        const expandedDistance = Math.min(originalMaxDistance * 1.5, 25);
        console.log(`🔄 DEGRADATION LEVEL 2: Expanding radius from ${originalMaxDistance}km to ${expandedDistance}km`);
        
        const { rows: expandedActivities } = await pool.query(activitiesQuery, queryParams);
        
        if (request.filters?.userLatitude && request.filters?.userLongitude) {
          activities = filterByDistance(
            expandedActivities,
            request.filters.userLatitude,
            request.filters.userLongitude,
            expandedDistance
          );
          
          // Mark activities as expanded radius
          activities.forEach(a => {
            a._expandedRadius = true;
            a._originalMaxDistance = originalMaxDistance;
            a._expandedMaxDistance = expandedDistance;
          });
          
          distanceExpanded = true;
        }
        
        console.log(`✅ Level 2: Found ${activities.length} activities within ${expandedDistance}km`);
      }
    }
    
    if (activities.length === 0) {
      // DEGRADATION LEVEL 3: Broaden to category only (drop all tag requirements)
      degradationLevel = 3;
      console.log('🔄 DEGRADATION LEVEL 3: Dropping tag requirements, using category only');
      console.log('🚨 ACTIVITY GAP DETECTED:');
      console.log(`   Vibe: "${request.vibe}"`);
      console.log(`   Required tags: ${analysis.requiredTags.join(', ')}`);
      console.log(`   Energy: ${analysis.energyLevel}`);
      console.log(`   Categories: ${analysis.suggestedCategories.join(', ')}`);
      console.log('   💡 Consider adding more activities with these attributes!');
      
      const fallbackQuery = `
        SELECT a.id, a.name, a.category, a.city, a.region, a.description, a.tags,
               a.energy_level, a.indoor_outdoor, a.latitude, a.longitude,
               a.duration_min, a.duration_max, a.crowd_size, a.crowd_type,
               a.group_suitability, a.price_tier
        FROM activities a
        WHERE (a.region = $1 OR a.region = 'București')
        ${analysis.suggestedCategories.length > 0 ? 
          `AND a.category = ANY($2::text[])` : ''}
        ORDER BY 
          CASE WHEN a.region = $1 THEN 0 ELSE 1 END,
          RANDOM()
        LIMIT 30
      `;
      
      const fallbackParams = analysis.suggestedCategories.length > 0 
        ? [region, analysis.suggestedCategories] 
        : [region];
      
      let { rows: fallbackActivities } = await pool.query(fallbackQuery, fallbackParams);
      console.log(`📊 Level 3 fallback: Found ${fallbackActivities.length} activities before distance filter`);
      
      // Apply distance filter to fallback, but keep results if filter removes everything
      if (request.filters?.userLatitude && request.filters?.userLongitude) {
        const beforeFilter = fallbackActivities.length;
        const expandedDistance = originalMaxDistance ? Math.min(originalMaxDistance * 1.5, 25) : null;
        const filtered = filterByDistance(
          fallbackActivities,
          request.filters.userLatitude,
          request.filters.userLongitude,
          expandedDistance
        );
        
        // Only apply filter if it doesn't remove ALL activities
        if (filtered.length > 0) {
          fallbackActivities = filtered;
          console.log(`📍 Distance filter applied: ${fallbackActivities.length}/${beforeFilter} activities kept`);
          
          if (expandedDistance && expandedDistance !== originalMaxDistance) {
            fallbackActivities.forEach(a => {
              a._expandedRadius = true;
              a._originalMaxDistance = originalMaxDistance;
              a._expandedMaxDistance = expandedDistance;
            });
            distanceExpanded = true;
          }
        } else {
          console.log(`⚠️ Distance filter would remove all activities, keeping unfiltered results`);
          // Keep original activities without distance filtering
        }
      }
      
      if (fallbackActivities.length === 0) {
        throw new Error(`No activities found for region: ${region}`);
      }
      
      console.log(`✅ Level 3: Found ${fallbackActivities.length} activities (category-only match)`);
      activities = fallbackActivities;
    }
    
    // Log degradation summary
    if (degradationLevel > 0) {
      console.log(`📊 Degradation Summary: Level ${degradationLevel}, ${activities.length} activities found`);
      if (distanceExpanded) {
        console.log(`   ⚠️ Distance expanded from ${originalMaxDistance}km to ${activities[0]?._expandedMaxDistance}km`);
      }
    }
    
    // STEP 3: Additional fallback only if degradation didn't produce enough results
    // This should rarely trigger now that we have 3-level degradation
    if (activities.length < 3 && degradationLevel < 3) {
      console.log(`⚠️ Only ${activities.length} activities after degradation, applying final fallback...`);
      
      // Use expanded distance if available, otherwise original
      const effectiveMaxDistance = distanceExpanded 
        ? (activities[0]?._expandedMaxDistance || originalMaxDistance)
        : originalMaxDistance;
      
      const fallbackQuery = `
        SELECT a.id, a.name, a.category, a.city, a.region, a.description, a.tags,
               a.energy_level, a.indoor_outdoor, a.latitude, a.longitude,
               a.duration_min, a.duration_max, a.crowd_size, a.crowd_type,
               a.group_suitability, a.price_tier
        FROM activities a
        WHERE ${locationMode === 'explore-outside' ? 'a.region != $1' : 
                locationMode === 'in-city' ? 'a.region = $1' : 
                '(a.region = \'București\' OR a.region IN (\'Prahova\', \'Brașov\', \'Ilfov\'))'}
        ${analysis.suggestedCategories.length > 0 ? `AND a.category = ANY(ARRAY[${analysis.suggestedCategories.map(c => `'${c}'`).join(',')}]::text[])` : ''}
        ORDER BY RANDOM()
        LIMIT 30
      `;
      
      let { rows: fallbackActivities } = await pool.query(fallbackQuery);
      console.log(`🔄 Final fallback found ${fallbackActivities.length} additional activities`);
      
      // Apply distance filtering with expanded distance if applicable
      if (request.filters?.userLatitude && request.filters?.userLongitude) {
        const beforeFallbackDistanceFilter = fallbackActivities.length;
        fallbackActivities = filterByDistance(
          fallbackActivities,
          request.filters.userLatitude,
          request.filters.userLongitude,
          effectiveMaxDistance
        );
        console.log(`📍 Final fallback distance filter: ${fallbackActivities.length} activities (removed ${beforeFallbackDistanceFilter - fallbackActivities.length})`);
        
        // Mark with expanded radius if applicable
        if (distanceExpanded) {
          fallbackActivities.forEach(a => {
            a._expandedRadius = true;
            a._originalMaxDistance = originalMaxDistance;
            a._expandedMaxDistance = effectiveMaxDistance;
          });
        }
      }
      
      // Apply keyword matching to fallback
      if (analysis.keywordPrefer && analysis.keywordPrefer.length > 0) {
        const keywordMatches = fallbackActivities.filter((activity: any) => {
          const searchText = `${activity.name} ${activity.description || ''}`.toLowerCase();
          return analysis.keywordPrefer!.some(keyword => 
            searchText.includes(keyword.toLowerCase())
          );
        });
        activities.push(...keywordMatches);
        console.log(`✅ Added ${keywordMatches.length} keyword-matching activities from final fallback`);
      } else {
        activities.push(...fallbackActivities.slice(0, 10));
      }
    }
    
    // STEP 4: Score all activities and select top 5 by relevance
    console.log('🎯 Scoring activities by relevance...');
    
    // Score each activity
    activities.forEach(activity => {
      activity._relevanceScore = scoreActivity(activity, analysis);
    });
    
    // Sort by relevance score (highest first)
    activities.sort((a, b) => (b._relevanceScore || 0) - (a._relevanceScore || 0));
    
    // Log analysis for debugging
    console.log('🎯 Vibe Analysis:');
    console.log(`   Primary Intent: ${analysis.primaryIntent}`);
    console.log(`   Suggested Categories: ${analysis.suggestedCategories?.join(', ')}`);
    console.log(`   Energy Level: ${analysis.energyLevel}`);
    console.log(`   Confidence: ${analysis.confidence}`);
    
    // Log top scores for debugging
    console.log('📊 Top 10 activities by relevance score:');
    activities.slice(0, 10).forEach((a, i) => {
      console.log(`   ${i+1}. ${a.name} - Score: ${a._relevanceScore} (${a.category}, ${a.energy_level})`);
    });
    
    // STEP 4.4: Enforce variety for undefined filter mode (at least 1 local + 1 outside)
    if (locationMode === 'variety' && activities.length > 0) {
      console.log('🎯 Enforcing variety: ensuring mix of local + outside activities');
      
      const localActivities = activities.filter(a => a.region === userCity);
      const outsideActivities = activities.filter(a => a.region !== userCity);
      
      console.log(`   Found: ${localActivities.length} local, ${outsideActivities.length} outside`);
      
      // Ensure at least 1 local AND 1 outside (if we have enough activities)
      if (localActivities.length === 0 && outsideActivities.length > 0 && activities.length >= 2) {
        console.log('⚠️ No local activities found, fetching some for variety...');
        try {
          const localQuery = `
            SELECT a.id, a.name, a.category, a.city, a.region, a.description, a.tags,
                   a.energy_level, a.indoor_outdoor, a.latitude, a.longitude,
                   a.duration_min, a.duration_max, a.crowd_size, a.crowd_type,
                   a.group_suitability, a.price_tier
            FROM activities a
            WHERE a.region = $1
            ORDER BY RANDOM()
            LIMIT 2
          `;
          const { rows: localResults } = await pool.query(localQuery, [userCity]);
          
          if (localResults.length > 0) {
            // Score the local activities
            localResults.forEach(activity => {
              activity._relevanceScore = scoreActivity(activity, analysis);
            });
            // Mix: keep top outside activities + add local ones
            activities = [...localResults, ...outsideActivities.slice(0, 3)];
            console.log(`✅ Added ${localResults.length} local activities for variety`);
          }
        } catch (error) {
          console.log('⚠️ Could not fetch local activities:', error);
        }
      } else if (outsideActivities.length === 0 && localActivities.length > 0 && activities.length >= 2) {
        console.log('⚠️ No outside activities found, fetching some for variety...');
        try {
          const outsideQuery = `
            SELECT a.id, a.name, a.category, a.city, a.region, a.description, a.tags,
                   a.energy_level, a.indoor_outdoor, a.latitude, a.longitude,
                   a.duration_min, a.duration_max, a.crowd_size, a.crowd_type,
                   a.group_suitability, a.price_tier
            FROM activities a
            WHERE a.region != $1
            ORDER BY RANDOM()
            LIMIT 2
          `;
          const { rows: outsideResults } = await pool.query(outsideQuery, [userCity]);
          
          if (outsideResults.length > 0) {
            // Score the outside activities
            outsideResults.forEach(activity => {
              activity._relevanceScore = scoreActivity(activity, analysis);
            });
            // Mix: keep top local activities + add outside ones
            activities = [...localActivities.slice(0, 3), ...outsideResults];
            console.log(`✅ Added ${outsideResults.length} outside activities for variety`);
          }
        } catch (error) {
          console.log('⚠️ Could not fetch outside activities:', error);
        }
      }
      
      // Final variety mix: aim for balanced distribution
      if (localActivities.length > 0 && outsideActivities.length > 0) {
        const targetLocal = Math.ceil(5 * 0.6); // 3 local
        const targetOutside = Math.floor(5 * 0.4); // 2 outside
        
        const finalLocal = localActivities.slice(0, targetLocal);
        const finalOutside = outsideActivities.slice(0, targetOutside);
        
        // If we don't have enough of one type, fill with the other
        const totalNeeded = 5;
        const currentTotal = finalLocal.length + finalOutside.length;
        
        if (currentTotal < totalNeeded) {
          const needed = totalNeeded - currentTotal;
          if (finalLocal.length < targetLocal) {
            finalOutside.push(...outsideActivities.slice(targetOutside, targetOutside + needed));
          } else if (finalOutside.length < targetOutside) {
            finalLocal.push(...localActivities.slice(targetLocal, targetLocal + needed));
          }
        }
        
        activities = [...finalLocal, ...finalOutside];
        console.log(`✅ Variety enforced: ${finalLocal.length} local + ${finalOutside.length} outside`);
      }
    }
    
    // STEP 4.5: Weather filtering (if user location provided)
    let weatherFilteredActivities = activities;
    let weatherWarnings: Map<number, string> = new Map();
    
    if (request.filters?.userLatitude && request.filters?.userLongitude) {
      console.log('🌤️ Applying weather filtering...');
      
      // Get unique cities from activities
      const activityCities = Array.from(new Set(
        activities.map(a => a.region || a.city).filter(Boolean)
      ));
      
      // Determine user's city (default to București)
      const userCity = region || 'București';
      
      // Fetch weather for all locations
      const weatherData = await multiLocationWeather.getWeatherForActivities(
        userCity,
        activityCities
      );
      
      console.log(`✅ Fetched weather for ${weatherData.size} locations`);
      
      // Filter activities by weather suitability
      const goodWeatherActivities: any[] = [];
      const okWeatherActivities: any[] = [];
      const badWeatherActivities: any[] = [];
      
      for (const activity of activities) {
        const activityCity = activity.region || activity.city;
        const cityWeather = weatherData.get(activityCity);
        
        if (!cityWeather) {
          // No weather data, keep activity
          goodWeatherActivities.push(activity);
          continue;
        }
        
        activity._weather = cityWeather;
        
        // Use database indoor_outdoor values (properly tagged now)
        const isIndoor = activity.indoor_outdoor === 'indoor';
        const isOutdoor = activity.indoor_outdoor === 'outdoor';
        const isBoth = activity.indoor_outdoor === 'both';
        
        // Weather conditions
        const temp = cityWeather.temperature;
        const condition = (cityWeather.condition || '').toLowerCase();
        const precipitation = cityWeather.precipitation || 0;
        
        const isSnowing = condition.includes('snow') || condition.includes('blizzard');
        const isRaining = condition.includes('rain') || precipitation > 5;
        const isFreezing = temp < 0;
        const isVeryCold = temp < 5;
        const isStormy = condition.includes('storm') || condition.includes('thunder');
        const isExtremeWeather = isSnowing || isFreezing || isStormy;
        
        // INDOOR activities are always GOOD
        if (isIndoor) {
          goodWeatherActivities.push(activity);
          activity._weatherSuitability = 'good';
          continue;
        }
        
        // OUTDOOR activities - strict weather rules
        if (isOutdoor) {
          if (isExtremeWeather) {
            badWeatherActivities.push(activity);
            activity._weatherSuitability = 'bad';
            weatherWarnings.set(activity.id, `⚠️ Poor weather: ${temp}°C, ${cityWeather.description}`);
          } else if (isVeryCold || isRaining) {
            okWeatherActivities.push(activity);
            activity._weatherSuitability = 'ok';
            weatherWarnings.set(activity.id, `Weather may not be ideal: ${cityWeather.description}`);
          } else {
            goodWeatherActivities.push(activity);
            activity._weatherSuitability = 'good';
          }
          continue;
        }
        
        // BOTH activities - more lenient, only bad in extreme weather
        if (isBoth) {
          if (isExtremeWeather) {
            okWeatherActivities.push(activity);
            activity._weatherSuitability = 'ok';
            weatherWarnings.set(activity.id, `Weather not ideal: ${cityWeather.description}`);
          } else {
            goodWeatherActivities.push(activity);
            activity._weatherSuitability = 'good';
          }
          continue;
        }
        
        // NULL/unknown - treat as indoor (safe default)
        goodWeatherActivities.push(activity);
        activity._weatherSuitability = 'good';
      }
      
      // Log actual weather conditions
      const firstWeather = weatherData.values().next().value;
      if (firstWeather) {
        console.log(`🌡️ Current weather: ${firstWeather.temperature}°C, ${firstWeather.condition}, precip=${firstWeather.precipitation}mm`);
      }
      
      console.log(`🌤️ Weather filtering results:`);
      console.log(`   Good weather: ${goodWeatherActivities.length} activities`);
      console.log(`   OK weather: ${okWeatherActivities.length} activities`);
      console.log(`   Bad weather: ${badWeatherActivities.length} activities`);
      
      // Check if extreme weather - if so, NEVER include bad weather activities
      const firstWeatherData = weatherData.values().next().value;
      const isExtremeWeather = firstWeatherData && (
        firstWeatherData.temperature < 0 ||
        (firstWeatherData.condition || '').toLowerCase().includes('snow') ||
        (firstWeatherData.condition || '').toLowerCase().includes('storm')
      );
      
      if (isExtremeWeather) {
        // EXTREME WEATHER: Only good and OK activities, NO bad weather activities
        console.log(`🚫 Extreme weather (${firstWeatherData.temperature}°C) - excluding ${badWeatherActivities.length} outdoor activities`);
        weatherFilteredActivities = [
          ...goodWeatherActivities,
          ...okWeatherActivities
        ];
        
        // If not enough activities, fetch more indoor activities
        if (weatherFilteredActivities.length < 5) {
          console.log(`📍 Only ${weatherFilteredActivities.length} weather-appropriate activities, fetching more indoor options...`);
          const indoorQuery = `
            SELECT a.id, a.name, a.category, a.city, a.region, 
                   a.description, a.tags, a.energy_level, a.indoor_outdoor,
                   a.latitude, a.longitude, a.duration_min
            FROM activities a
            WHERE a.indoor_outdoor = 'indoor'
              AND a.id NOT IN (${weatherFilteredActivities.map(a => a.id).join(',') || '0'})
              AND a.region = 'București'
            ORDER BY RANDOM()
            LIMIT ${5 - weatherFilteredActivities.length}
          `;
          const { rows: indoorActivities } = await pool.query(indoorQuery);
          
          // Add weather data to indoor activities
          for (const activity of indoorActivities) {
            activity._weather = firstWeatherData;
            activity._weatherSuitability = 'good';
            activity._relevanceScore = 50; // Lower score but still included
          }
          
          weatherFilteredActivities = [...weatherFilteredActivities, ...indoorActivities];
          console.log(`✅ Added ${indoorActivities.length} indoor activities for extreme weather`);
        }
      } else {
        // Normal weather: Include all, prioritized by suitability
        weatherFilteredActivities = [
          ...goodWeatherActivities,
          ...okWeatherActivities,
          ...badWeatherActivities
        ];
      }
    }
    
    // CRITICAL: Remove duplicates by activity ID before selecting
    const uniqueActivities = Array.from(
      new Map(weatherFilteredActivities.map(a => [a.id, a])).values()
    );
    
    if (uniqueActivities.length < weatherFilteredActivities.length) {
      console.log(`🔄 Removed ${weatherFilteredActivities.length - uniqueActivities.length} duplicate activities`);
    }
    
    // Select top 5 activities by relevance (after weather filtering and deduplication)
    const selectedActivities = uniqueActivities.slice(0, 5);
    
    console.log(`✅ Selected top 5 unique activities by relevance score`);
    selectedActivities.forEach((a, i) => {
      console.log(`   ${i+1}. ${a.name} (ID: ${a.id}) - Score: ${a._relevanceScore} (${a.category}, ${a.energy_level})`);
    });
    
    // STEP 4: For each selected activity, get venues
    const ideas = await Promise.all(
      selectedActivities.map(async (activity) => {
        const venuesQuery = `
          SELECT v.id, v.name, v.city, v.rating, v.website, v.phone, v.address, 
                 v.latitude, v.longitude, v.price_tier, v.rating_count
          FROM venues v
          WHERE v.activity_id = $1
          ORDER BY v.rating DESC NULLS LAST
          LIMIT 3
        `;
        
        const { rows: venues } = await pool.query(venuesQuery, [activity.id]);
        
        // Add weather data if available
        const weatherInfo = activity._weather ? {
          temperature: activity._weather.temperature,
          condition: activity._weather.condition,
          precipitation: activity._weather.precipitation,
          suitability: activity._weatherSuitability || activity._weather.suitability,
          icon: activity._weather.icon,
          description: activity._weather.description,
          warning: weatherWarnings.get(activity.id) || null
        } : null;
        
        return {
          activityId: activity.id,
          name: activity.name,
          description: activity.description, // Add description
          bucket: activity.category,
          region: activity.region,
          city: activity.city, // Add city
          energy_level: activity.energy_level,
          indoor_outdoor: activity.indoor_outdoor,
          distanceKm: activity.distanceKm, // Include if calculated
          durationMinutes: activity.duration_min, // Activity duration
          duration_min: activity.duration_min, // Also include for compatibility
          duration_max: activity.duration_max, // Also include for compatibility
          crowdSize: activity.crowd_size,
          groupSuitability: activity.group_suitability,
          priceTier: activity.price_tier,
          website: activity.website, // Activity website (if available)
          websiteUrl: activity.website, // Also as websiteUrl for compatibility
          weather: weatherInfo, // NEW: Weather data for activity location
          expandedRadius: activity._expandedRadius || false, // NEW: Indicates if distance was expanded
          originalMaxDistance: activity._originalMaxDistance, // NEW: Original distance limit
          expandedMaxDistance: activity._expandedMaxDistance, // NEW: Expanded distance limit
          venues: venues.map(v => ({
            venueId: v.id,
            name: v.name,
            city: v.city,
            rating: v.rating,
            website: v.website, // NOW INCLUDED!
            phone: v.phone,
            address: v.address,
            location: (v.latitude && v.longitude) ? {
              lat: parseFloat(v.latitude),
              lng: parseFloat(v.longitude)
            } : undefined,
            priceTier: v.price_tier,
            ratingCount: v.rating_count
          }))
        };
      })
    );
    
    // Build UX messaging for degradation
    let uxMessage = null;
    if (degradationLevel > 0) {
      if (degradationLevel === 1) {
        uxMessage = 'We relaxed some filters to find more options for you.';
      } else if (degradationLevel === 2) {
        uxMessage = `We expanded the search radius to ${ideas[0]?.expandedMaxDistance}km to find these activities.`;
      } else if (degradationLevel === 3) {
        uxMessage = 'We broadened the search to show related activities in your area.';
      }
    }
    
    console.log(`🎯 Returning ${ideas.length} final recommendations`);
    if (uxMessage) {
      console.log(`💬 UX Message: ${uxMessage}`);
    }
    
    return { 
      ideas,
      metadata: {
        degradationLevel,
        distanceExpanded,
        uxMessage
      }
    };
    
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
 * HIGHER SCORE = BETTER MATCH
 */
function scoreActivity(activity: any, analysis: any): number {
  let score = 0;
  
  if (!activity.tags || !Array.isArray(activity.tags)) {
    return score;
  }
  
  // CRITICAL: Category match is most important (100 points per match)
  // This ensures activities in the requested category always rank highest
  let categoryMatches = 0;
  for (const category of analysis.suggestedCategories || []) {
    if (activity.tags.includes(`category:${category}`)) {
      score += 100;
      categoryMatches++;
    }
  }
  
  // Bonus for matching the PRIMARY category (first in list)
  if (analysis.suggestedCategories && analysis.suggestedCategories.length > 0) {
    const primaryCategory = analysis.suggestedCategories[0];
    if (activity.category === primaryCategory) {
      score += 50; // Extra 50 points for exact primary category match
    }
  }
  
  // Energy level match (30 points)
  if (activity.energy_level === analysis.energyLevel) {
    score += 30;
  }
  
  // Preferred tags (10 points each)
  for (const preferredTag of analysis.preferredTags || []) {
    if (activity.tags.includes(preferredTag)) {
      score += 10;
    }
  }
  
  // Required tags match (20 points each)
  for (const requiredTag of analysis.requiredTags || []) {
    if (activity.tags.includes(requiredTag)) {
      score += 20;
    }
  }
  
  // Keyword matches in name/description (15 points each)
  if (analysis.keywordPrefer && analysis.keywordPrefer.length > 0) {
    const searchText = `${activity.name} ${activity.description || ''}`.toLowerCase();
    for (const keyword of analysis.keywordPrefer) {
      if (searchText.includes(keyword.toLowerCase())) {
        score += 15;
      }
    }
  }
  
  // Feedback score multiplier (multiply by 0.5 to 1.5)
  if (activity._feedbackScore) {
    score = score * activity._feedbackScore;
  }
  
  // Keyword match count boost (from earlier filtering)
  if (activity._keywordMatchCount) {
    score += activity._keywordMatchCount * 10;
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
