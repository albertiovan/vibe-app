/**
 * Claude Autonomous Agent
 * 
 * Implements Think→Verify→Reflect reasoning chain for intelligent
 * vibe-to-activity mapping with self-debugging capabilities.
 */

import { z } from 'zod';
import { getLLMProvider } from '../llm/index.js';
import { AgentMemory, storeMemory, recallMemory, type MemoryEntry } from './memory.js';
import { GooglePlacesService } from '../googlePlacesService.js';
import { ALL_ROMANIA_ACTIVITIES } from '../../domain/activities/index.js';
import { schemaLearning } from './schemaLearning.js';

// Adaptive schemas that learn from Claude's natural output patterns
const PlanSchema = z.object({
  reasoning: z.string().min(10).max(1000), // More flexible length
  activities: z.array(z.object({
    id: z.string().optional().default('auto-generated'),
    name: z.string().optional(), // Claude often provides name instead of id
    bucket: z.string().optional().default('general'),
    category: z.string().optional(), // Alternative to bucket
    keywords: z.array(z.string()).optional().default([]),
    priority: z.number().min(0).max(1).optional().default(0.5),
    reasoning: z.string().optional().default('Activity matches user vibe'),
    confidence: z.number().min(0).max(1).optional().default(0.7)
  })).min(1).max(10), // More flexible range
  dataSources: z.array(z.string()).optional().default(['places']), // Accept any string, filter later
  verificationRules: z.array(z.string()).optional().default(['ensure quality', 'verify diversity']),
  searchStrategy: z.object({
    radius: z.number().optional().default(10000),
    diversityWeight: z.number().min(0).max(1).optional().default(0.7),
    qualityThreshold: z.number().min(0).max(5).optional().default(4.0),
    approach: z.string().optional().default('balanced')
  }).optional().default({})
}).transform(data => {
  // Post-process to normalize data
  return {
    ...data,
    activities: data.activities.map(activity => ({
      id: activity.id || `activity_${Math.random().toString(36).substr(2, 9)}`,
      bucket: activity.bucket || activity.category || 'general',
      keywords: activity.keywords || [],
      priority: activity.priority || 0.5,
      reasoning: activity.reasoning || 'Matches user preferences'
    })),
    dataSources: data.dataSources?.filter(ds => 
      ['places', 'openTripMap', 'weather', 'overpass'].includes(ds)
    ) || ['places'],
    searchStrategy: {
      radius: data.searchStrategy?.radius || 10000,
      diversityWeight: data.searchStrategy?.diversityWeight || 0.7,
      qualityThreshold: data.searchStrategy?.qualityThreshold || 4.0
    }
  };
});

const CurationSchema = z.object({
  finalActivities: z.array(z.object({
    name: z.string().min(1),
    category: z.string().optional().default('general'),
    type: z.string().optional(), // Alternative to category
    reasoning: z.string().optional().default('Selected for user'),
    confidence: z.number().min(0).max(1).optional().default(0.8),
    vibeMatch: z.number().min(0).max(1).optional().default(0.7),
    score: z.number().optional(), // Alternative to vibeMatch
    description: z.string().optional() // Additional field Claude might provide
  })).min(1).max(8), // More flexible
  diversityScore: z.number().min(0).max(1).optional().default(0.7),
  qualityScore: z.number().min(0).max(1).optional().default(0.8),
  reasoning: z.string().optional().default('Curated selection based on vibe match'),
  summary: z.string().optional(), // Alternative to reasoning
  totalFound: z.number().optional().default(0)
}).transform(data => {
  // Normalize the data
  return {
    finalActivities: data.finalActivities.map(activity => ({
      name: activity.name,
      category: activity.category || activity.type || 'general',
      reasoning: activity.reasoning || activity.description || 'Selected for user',
      confidence: activity.confidence || 0.8,
      vibeMatch: activity.vibeMatch || activity.score || 0.7
    })),
    diversityScore: data.diversityScore || 0.7,
    qualityScore: data.qualityScore || 0.8,
    reasoning: data.reasoning || data.summary || 'Curated selection based on vibe match'
  };
});

const ReflectionSchema = z.object({
  issues: z.array(z.string()).optional().default([]),
  problems: z.array(z.string()).optional().default([]), // Alternative to issues
  strengths: z.array(z.string()).optional().default([]),
  positives: z.array(z.string()).optional().default([]), // Alternative to strengths
  fixes: z.array(z.string()).optional().default([]),
  improvements: z.array(z.string()).optional().default([]), // Alternative to fixes
  adaptations: z.array(z.string()).optional().default([]),
  suggestions: z.array(z.string()).optional().default([]), // Alternative to adaptations
  confidence: z.number().min(0).max(1).optional().default(0.7),
  shouldRetry: z.boolean().optional().default(false),
  retry: z.boolean().optional(), // Alternative to shouldRetry
  learnings: z.array(z.string()).optional().default([]),
  insights: z.array(z.string()).optional().default([]), // Alternative to learnings
  assessment: z.string().optional(), // Overall assessment
  recommendation: z.string().optional() // Overall recommendation
}).transform(data => {
  // Normalize reflection data
  return {
    issues: [...(data.issues || []), ...(data.problems || [])],
    strengths: [...(data.strengths || []), ...(data.positives || [])],
    fixes: [...(data.fixes || []), ...(data.improvements || [])],
    adaptations: [...(data.adaptations || []), ...(data.suggestions || [])],
    confidence: data.confidence || 0.7,
    shouldRetry: data.shouldRetry || data.retry || false,
    learnings: [...(data.learnings || []), ...(data.insights || [])]
  };
});

export interface AgentContext {
  vibe: string;
  location: { lat: number; lng: number };
  filters: {
    durationHours?: number;
    radiusKm?: number;
    willingToTravel?: boolean;
  };
  userId?: string;
}

export interface AgentResult {
  activities: any[];
  reasoning: string;
  confidence: number;
  reflections: string[];
  adaptations: string[];
  memoryUsed: boolean;
}

export class ClaudeAgent {
  private llm: any;
  private placesService: GooglePlacesService;

  constructor() {
    // Lazy initialization - only create when needed
    this.placesService = new GooglePlacesService();
  }

  private ensureLLM() {
    if (!this.llm) {
      this.llm = getLLMProvider();
    }
  }

  /**
   * Main orchestration method: Think→Verify→Reflect
   */
  async orchestrate(context: AgentContext): Promise<AgentResult> {
    console.log('🤖 Claude Agent starting orchestration for:', `"${context.vibe}"`);
    
    try {
      // Recall past experiences
      const memories = await recallMemory(context.vibe, 3);
      const memoryInsights = await AgentMemory.getLearningInsights(context.vibe);
      
      console.log('🧠 Memory recall:', {
        matches: memories.length,
        successPatterns: memoryInsights.successPatterns.length,
        commonIssues: memoryInsights.commonIssues.length
      });

      // Stage A: Think (Planning)
      const plan = await this.think(context, memoryInsights);
      console.log('💭 Think stage complete:', {
        activities: plan.activities.length,
        dataSources: plan.dataSources,
        strategy: plan.searchStrategy
      });

      // Stage B: Verify (Data Integration)
      const verifiedData = await this.verify(plan, context);
      console.log('🔍 Verify stage complete:', {
        placesFound: verifiedData.places?.length || 0,
        weatherChecked: !!verifiedData.weather
      });

      // Stage C: Curate (Activity Selection)
      const curation = await this.curate(plan, verifiedData, context);
      console.log('🎯 Curation complete:', {
        finalActivities: curation.finalActivities.length,
        diversityScore: curation.diversityScore,
        qualityScore: curation.qualityScore
      });

      // Stage D: Reflect (Self-Critique)
      const reflection = await this.reflect(context, plan, curation);
      console.log('🪞 Reflection complete:', {
        issues: reflection.issues.length,
        strengths: reflection.strengths.length,
        shouldRetry: reflection.shouldRetry
      });

      // Store memory for future learning
      const memoryEntry: MemoryEntry = {
        vibe: context.vibe,
        successful: reflection.confidence > 0.7 && !reflection.shouldRetry,
        issues: reflection.issues,
        bestActivities: curation.finalActivities.map(a => a.name),
        timestamp: Date.now(),
        searchResults: {
          totalFound: verifiedData.places?.length || 0,
          topFiveTypes: curation.finalActivities.map(a => a.category),
          diversityScore: curation.diversityScore,
          avgRating: 0 // Will be calculated from actual results
        },
        reflections: reflection.strengths,
        adaptations: reflection.adaptations
      };

      await storeMemory(context.vibe, memoryEntry);

      // Return final result
      return {
        activities: this.transformToActivityFormat(curation.finalActivities, verifiedData.places || []),
        reasoning: curation.reasoning,
        confidence: reflection.confidence,
        reflections: reflection.learnings,
        adaptations: reflection.adaptations,
        memoryUsed: memories.length > 0
      };

    } catch (error) {
      console.error('❌ Claude Agent orchestration failed:', error);
      
      // Store failure memory
      await storeMemory(context.vibe, {
        vibe: context.vibe,
        successful: false,
        issues: [`Orchestration error: ${error}`],
        timestamp: Date.now()
      });

      throw error;
    }
  }

  /**
   * Stage A: Think - Generate activity plan based on vibe and memory
   */
  private async think(context: AgentContext, insights: any): Promise<z.infer<typeof PlanSchema>> {
    this.ensureLLM();
    const systemPrompt = `You are Claude 3 Haiku, the autonomous reasoning core of the Vibe app.

Your role: Transform user vibes into intelligent activity plans using past experience and reasoning.

CONTEXT:
- User vibe: "${context.vibe}"
- Location: ${context.location.lat}, ${context.location.lng} (Romania)
- Duration: ${context.filters.durationHours || 'flexible'} hours
- Travel willingness: ${context.filters.willingToTravel ? 'yes' : 'local only'}

MEMORY INSIGHTS:
- Success patterns: ${insights.successPatterns.slice(0, 3).join('; ') || 'none'}
- Common issues: ${insights.commonIssues.slice(0, 3).join('; ') || 'none'}
- Best activities: ${insights.bestActivities.slice(0, 5).join(', ') || 'none'}
- Adaptations: ${insights.adaptationSuggestions.slice(0, 3).join('; ') || 'none'}

AVAILABLE ACTIVITIES:
${ALL_ROMANIA_ACTIVITIES.slice(0, 10).map(a => `- ${a.category}: ${a.label} (${a.subtypes.join(', ')})`).join('\n')}

INSTRUCTIONS:
1. Analyze the vibe deeply - what does the user really want to experience?
2. Learn from past memory insights to avoid repeating mistakes
3. Plan 3-6 diverse activities that truly match the emotional intent
4. Choose appropriate data sources and verification rules
5. Set search strategy based on vibe complexity and location constraints

Generate a comprehensive plan that will lead to satisfying, diverse results.`;

    const userPrompt = `Plan activities for: "${context.vibe}"

Consider:
- Emotional intent behind the vibe
- Past learnings from similar requests
- Diversity across activity types
- Quality and feasibility requirements
- Romanian location context

Return a detailed JSON plan.`;

    // First attempt with schema validation
    const response = await this.llm.completeJSON({
      system: systemPrompt,
      user: userPrompt,
      schema: PlanSchema,
      maxTokens: 2000
    });

    if (response.ok) {
      // Success! Record the successful pattern
      await schemaLearning.recordSuccess('think', context.vibe, response.data);
      console.log('✅ Think stage: Schema validation successful');
      return response.data;
    }

    // Schema validation failed - attempt intelligent repair
    console.log('⚠️ Think stage: Schema validation failed, attempting repair...');
    
    try {
      // Parse the raw response to attempt repair
      const rawResponse = JSON.parse(response.error.split('Raw response: ')[1] || '{}');
      const validationErrors = response.error.includes('JSON validation failed:') ? 
        JSON.parse(response.error.split('JSON validation failed: ')[1].split('\nRaw response:')[0] || '[]') : [];

      // Attempt intelligent repair
      const repairResult = await schemaLearning.repairResponse('think', rawResponse, validationErrors);
      
      if (repairResult.success) {
        console.log('🔧 Think stage: Schema repair successful:', repairResult.changes);
        
        // Validate the repaired response
        const repairedValidation = PlanSchema.safeParse(repairResult.repaired);
        if (repairedValidation.success) {
          await schemaLearning.recordSuccess('think', context.vibe, repairedValidation.data);
          return repairedValidation.data;
        }
      }

      // Check if we should use fallback
      const shouldFallback = schemaLearning.shouldUseFallback('think', validationErrors.length);
      
      if (!shouldFallback) {
        // Record failure but don't use fallback yet
        await schemaLearning.recordFailure('think', context.vibe, rawResponse, validationErrors, false);
        throw new Error(`Think stage failed after repair attempt: ${response.error}`);
      }

      // Use intelligent fallback
      console.log('🚨 Think stage: Using intelligent fallback');
      await schemaLearning.recordFailure('think', context.vibe, rawResponse, validationErrors, true);
      
      return this.createFallbackPlan(context, rawResponse);

    } catch (parseError) {
      console.error('❌ Think stage: Failed to parse response for repair:', parseError);
      throw new Error(`Think stage failed: ${response.error}`);
    }
  }

  /**
   * Stage B: Verify - Execute data fetches based on plan
   */
  private async verify(plan: z.infer<typeof PlanSchema>, context: AgentContext): Promise<{
    places?: any[];
    weather?: any;
    openTripMap?: any[];
    overpass?: any[];
  }> {
    const results: any = {};

    // Google Places search
    if (plan.dataSources.includes('places')) {
      const keywords = plan.activities.flatMap(a => a.keywords);
      const types = this.inferGooglePlacesTypes(plan.activities);
      
      try {
        const placesResult = await this.placesService.nearbySearch({
          location: `${context.location.lat},${context.location.lng}`,
          radius: plan.searchStrategy.radius,
          type: types[0] || 'establishment',
          keyword: keywords[0] || ''
        });
        
        results.places = placesResult || [];
        console.log('📍 Places found:', results.places.length);
      } catch (error) {
        console.error('❌ Places search failed:', error);
        results.places = [];
      }
    }

    // Weather data (if requested)
    if (plan.dataSources.includes('weather')) {
      // Implement weather fetch if needed
      results.weather = { condition: 'unknown' };
    }

    // OpenTripMap (if requested)
    if (plan.dataSources.includes('openTripMap')) {
      // Implement OpenTripMap integration if needed
      results.openTripMap = [];
    }

    return results;
  }

  /**
   * Stage C: Curate - Select and rank final activities
   */
  private async curate(
    plan: z.infer<typeof PlanSchema>, 
    data: any, 
    context: AgentContext
  ): Promise<z.infer<typeof CurationSchema>> {
    this.ensureLLM();
    const systemPrompt = `You are Claude 3 Haiku, curating the perfect activity selection.

ORIGINAL VIBE: "${context.vibe}"
PLAN REASONING: ${plan.reasoning}

VERIFIED DATA:
- Places found: ${data.places?.length || 0}
- Sample places: ${data.places?.slice(0, 5).map((p: any) => `${p.name} (${p.types?.slice(0, 2).join(', ')})`).join('; ') || 'none'}

CURATION RULES:
1. Select exactly 5 activities that best match the vibe
2. Ensure diversity across categories (no more than 2 from same bucket)
3. Prioritize quality (rating > ${plan.searchStrategy.qualityThreshold})
4. Match emotional intent, not just keywords
5. Consider practical feasibility for the user

QUALITY CRITERIA:
- Vibe match: How well does this fulfill the user's emotional need?
- Diversity: Variety across activity types and experiences
- Feasibility: Can the user actually do this activity?
- Quality: Is this a well-regarded, reliable option?

Select the 5 best activities and explain your reasoning.`;

    const userPrompt = `Curate the final 5 activities from the verified data.

Focus on:
- True vibe alignment (emotional satisfaction)
- Practical diversity (different types of experiences)
- Quality and reliability
- Feasible for the user's context

Return your curated selection with confidence scores.`;

    const response = await this.llm.completeJSON({
      system: systemPrompt,
      user: userPrompt,
      schema: CurationSchema,
      maxTokens: 1500
    });

    if (response.ok) {
      await schemaLearning.recordSuccess('curate', context.vibe, response.data);
      console.log('✅ Curate stage: Schema validation successful');
      return response.data;
    }

    // Attempt repair or use intelligent fallback
    console.log('⚠️ Curate stage: Schema validation failed, attempting repair...');
    
    try {
      const rawResponse = JSON.parse(response.error.split('Raw response: ')[1] || '{}');
      const validationErrors = response.error.includes('JSON validation failed:') ? 
        JSON.parse(response.error.split('JSON validation failed: ')[1].split('\nRaw response:')[0] || '[]') : [];

      const repairResult = await schemaLearning.repairResponse('curate', rawResponse, validationErrors);
      
      if (repairResult.success) {
        const repairedValidation = CurationSchema.safeParse(repairResult.repaired);
        if (repairedValidation.success) {
          await schemaLearning.recordSuccess('curate', context.vibe, repairedValidation.data);
          return repairedValidation.data;
        }
      }

      const shouldFallback = schemaLearning.shouldUseFallback('curate', validationErrors.length);
      
      if (shouldFallback) {
        console.log('🚨 Curate stage: Using intelligent fallback');
        await schemaLearning.recordFailure('curate', context.vibe, rawResponse, validationErrors, true);
        return this.createFallbackCuration(context, data.places || []);
      } else {
        await schemaLearning.recordFailure('curate', context.vibe, rawResponse, validationErrors, false);
        throw new Error(`Curate stage failed after repair attempt: ${response.error}`);
      }

    } catch (parseError) {
      console.error('❌ Curate stage: Failed to parse response for repair:', parseError);
      throw new Error(`Curate stage failed: ${response.error}`);
    }
  }

  /**
   * Stage D: Reflect - Self-critique and learning
   */
  private async reflect(
    context: AgentContext,
    plan: z.infer<typeof PlanSchema>,
    curation: z.infer<typeof CurationSchema>
  ): Promise<z.infer<typeof ReflectionSchema>> {
    this.ensureLLM();
    const systemPrompt = `You are Claude 3 Haiku, reflecting on your own performance.

TASK ANALYSIS:
- Original vibe: "${context.vibe}"
- Activities planned: ${plan.activities.length}
- Final selection: ${curation.finalActivities.length}
- Diversity achieved: ${curation.diversityScore}
- Quality achieved: ${curation.qualityScore}

SELF-CRITIQUE FRAMEWORK:
1. Did I truly understand the user's emotional intent?
2. Are the results diverse and interesting?
3. Would a real user be satisfied with these suggestions?
4. What could be improved for similar future vibes?
5. Are there any obvious gaps or mistakes?

Be honest and constructive. Identify both strengths and weaknesses.
Propose specific adaptations for future similar requests.`;

    const userPrompt = `Reflect on this orchestration:

Analyze:
- How well did I match the vibe "${context.vibe}"?
- Is the diversity and quality satisfactory?
- What are the main strengths and issues?
- What should I learn for next time?
- Should I retry with different parameters?

Provide honest self-assessment and learning insights.`;

    const response = await this.llm.completeJSON({
      system: systemPrompt,
      user: userPrompt,
      schema: ReflectionSchema,
      maxTokens: 1000
    });

    if (response.ok) {
      await schemaLearning.recordSuccess('reflect', context.vibe, response.data);
      console.log('✅ Reflect stage: Schema validation successful');
      return response.data;
    }

    // For reflection, we're more lenient with fallbacks since it's self-critique
    console.log('⚠️ Reflect stage: Schema validation failed, using fallback');
    
    try {
      const rawResponse = JSON.parse(response.error.split('Raw response: ')[1] || '{}');
      const validationErrors = response.error.includes('JSON validation failed:') ? 
        JSON.parse(response.error.split('JSON validation failed: ')[1].split('\nRaw response:')[0] || '[]') : [];

      await schemaLearning.recordFailure('reflect', context.vibe, rawResponse, validationErrors, true);
      return this.createFallbackReflection(context);

    } catch (parseError) {
      console.error('❌ Reflect stage: Failed to parse response, using basic fallback');
      return this.createFallbackReflection(context);
    }
  }

  /**
   * Helper: Infer Google Places types from planned activities
   */
  private inferGooglePlacesTypes(activities: any[]): string[] {
    const typeMapping: Record<string, string[]> = {
      adventure: ['amusement_park', 'tourist_attraction', 'park'],
      culture: ['museum', 'art_gallery', 'library', 'tourist_attraction'],
      nature: ['park', 'natural_feature', 'campground'],
      sports: ['gym', 'stadium', 'health', 'physiotherapist'],
      wellness: ['spa', 'gym', 'health'],
      culinary: ['restaurant', 'cafe', 'bakery'],
      nightlife: ['night_club', 'bar', 'casino'],
      social: ['cafe', 'restaurant', 'bar']
    };

    const types = new Set<string>();
    activities.forEach(activity => {
      const mappedTypes = typeMapping[activity.bucket] || ['establishment'];
      mappedTypes.forEach(type => types.add(type));
    });

    return Array.from(types);
  }

  /**
   * Helper: Transform Claude's output to app format
   */
  private transformToActivityFormat(activities: any[], places: any[]): any[] {
    return activities.map((activity, index) => {
      // Find corresponding place data
      const matchingPlace = places.find(p => 
        p.name?.toLowerCase().includes(activity.name.toLowerCase()) ||
        activity.name.toLowerCase().includes(p.name?.toLowerCase())
      ) || places[index] || {};

      return {
        id: matchingPlace.placeId || `claude_${index}`,
        name: activity.name,
        category: activity.category,
        rating: matchingPlace.rating || 4.0,
        location: matchingPlace.geometry?.location || { lat: 0, lng: 0 },
        vicinity: matchingPlace.vicinity || 'Romania',
        types: matchingPlace.types || [activity.category],
        imageUrl: matchingPlace.photos?.[0] ? `/api/places/photo?ref=${matchingPlace.photos[0].photo_reference}&maxwidth=800` : null,
        mapsUrl: matchingPlace.placeId ? `https://www.google.com/maps/search/?api=1&query_place_id=${matchingPlace.placeId}` : null,
        vibeScore: activity.vibeMatch,
        confidence: activity.confidence,
        reasoning: activity.reasoning,
        bucket: activity.category,
        blurb: `${activity.reasoning.slice(0, 100)}...`
      };
    });
  }

  /**
   * Create intelligent fallback plan when schema validation fails
   */
  private createFallbackPlan(context: AgentContext, rawResponse?: any): z.infer<typeof PlanSchema> {
    console.log('🔄 Creating fallback plan for vibe:', context.vibe);

    // Extract what we can from the raw response
    const extractedActivities = this.extractActivitiesFromRaw(rawResponse, context.vibe);

    return {
      reasoning: `Fallback plan for "${context.vibe}" - focusing on core activity matching`,
      activities: extractedActivities,
      dataSources: ['places'],
      verificationRules: ['ensure quality', 'verify diversity'],
      searchStrategy: {
        radius: context.filters.radiusKm ? context.filters.radiusKm * 1000 : 10000,
        diversityWeight: 0.7,
        qualityThreshold: 4.0
      }
    };
  }

  /**
   * Create fallback curation when schema validation fails
   */
  private createFallbackCuration(context: AgentContext, places: any[]): z.infer<typeof CurationSchema> {
    console.log('🔄 Creating fallback curation for:', places.length, 'places');

    // Simple curation based on ratings and types
    const curated = places
      .filter(place => place.rating && place.rating >= 3.5)
      .sort((a, b) => (b.rating || 0) - (a.rating || 0))
      .slice(0, 5)
      .map(place => ({
        name: place.name || 'Unknown Activity',
        category: this.inferCategoryFromTypes(place.types) || 'general',
        reasoning: `High-rated venue (${place.rating}★) matching your vibe`,
        confidence: Math.min((place.rating || 3.5) / 5, 1.0),
        vibeMatch: 0.7
      }));

    return {
      finalActivities: curated.length > 0 ? curated : [{
        name: 'Explore Local Area',
        category: 'general',
        reasoning: 'Discover interesting places nearby',
        confidence: 0.6,
        vibeMatch: 0.6
      }],
      diversityScore: new Set(curated.map(a => a.category)).size / Math.max(curated.length, 1),
      qualityScore: curated.length > 0 ? curated.reduce((sum, a) => sum + a.confidence, 0) / curated.length : 0.6,
      reasoning: 'Fallback curation based on ratings and venue types'
    };
  }

  /**
   * Create fallback reflection when schema validation fails
   */
  private createFallbackReflection(context: AgentContext): z.infer<typeof ReflectionSchema> {
    return {
      issues: ['Schema validation challenges', 'Complex vibe interpretation'],
      strengths: ['Maintained service availability', 'Provided relevant suggestions'],
      fixes: ['Improve schema flexibility', 'Enhance vibe parsing'],
      adaptations: ['Learn from this interaction', 'Adjust validation rules'],
      confidence: 0.6,
      shouldRetry: false,
      learnings: ['Fallback systems are important', 'Schema learning is needed']
    };
  }

  /**
   * Extract activities from raw Claude response
   */
  private extractActivitiesFromRaw(rawResponse: any, vibe: string): any[] {
    if (!rawResponse) {
      return this.createDefaultActivities(vibe);
    }

    try {
      // Try to extract activities from various possible structures
      let activities = [];

      if (rawResponse.activities && Array.isArray(rawResponse.activities)) {
        activities = rawResponse.activities;
      } else if (rawResponse.suggestions && Array.isArray(rawResponse.suggestions)) {
        activities = rawResponse.suggestions;
      } else if (rawResponse.recommendations && Array.isArray(rawResponse.recommendations)) {
        activities = rawResponse.recommendations;
      }

      // Normalize extracted activities
      return activities.slice(0, 5).map((activity: any, index: number) => ({
        id: activity.id || activity.name || `activity_${index}`,
        bucket: activity.bucket || activity.category || activity.type || this.inferBucketFromVibe(vibe),
        keywords: activity.keywords || activity.tags || [vibe.split(' ')[0]],
        priority: activity.priority || activity.score || 0.7,
        reasoning: activity.reasoning || activity.description || 'Extracted from response'
      }));

    } catch (error) {
      console.error('❌ Failed to extract activities from raw response:', error);
      return this.createDefaultActivities(vibe);
    }
  }

  /**
   * Create default activities when extraction fails
   */
  private createDefaultActivities(vibe: string): any[] {
    const bucket = this.inferBucketFromVibe(vibe);
    const keywords = vibe.toLowerCase().split(' ').filter(word => word.length > 2);

    return [{
      id: 'default_activity',
      bucket,
      keywords: keywords.slice(0, 3),
      priority: 0.7,
      reasoning: `Default activity for vibe: ${vibe}`
    }];
  }

  /**
   * Infer activity bucket from vibe text
   */
  private inferBucketFromVibe(vibe: string): string {
    const vibeText = vibe.toLowerCase();
    
    if (vibeText.includes('sport') || vibeText.includes('gym') || vibeText.includes('fitness')) return 'sports';
    if (vibeText.includes('culture') || vibeText.includes('museum') || vibeText.includes('art')) return 'culture';
    if (vibeText.includes('nature') || vibeText.includes('park') || vibeText.includes('outdoor')) return 'nature';
    if (vibeText.includes('food') || vibeText.includes('restaurant') || vibeText.includes('eat')) return 'culinary';
    if (vibeText.includes('coffee') || vibeText.includes('social') || vibeText.includes('meet')) return 'social';
    if (vibeText.includes('adventure') || vibeText.includes('exciting') || vibeText.includes('thrill')) return 'adventure';
    if (vibeText.includes('relax') || vibeText.includes('spa') || vibeText.includes('wellness')) return 'wellness';
    
    return 'general';
  }

  /**
   * Infer category from Google Places types
   */
  private inferCategoryFromTypes(types: string[] = []): string {
    if (types.includes('gym') || types.includes('stadium')) return 'sports';
    if (types.includes('museum') || types.includes('art_gallery')) return 'culture';
    if (types.includes('park') || types.includes('natural_feature')) return 'nature';
    if (types.includes('restaurant') || types.includes('cafe')) return 'culinary';
    if (types.includes('spa') || types.includes('health')) return 'wellness';
    if (types.includes('amusement_park') || types.includes('tourist_attraction')) return 'adventure';
    
    return 'general';
  }
}

// Lazy singleton instance
let _claudeAgent: ClaudeAgent | null = null;

export function getClaudeAgent(): ClaudeAgent {
  if (!_claudeAgent) {
    _claudeAgent = new ClaudeAgent();
  }
  return _claudeAgent;
}
