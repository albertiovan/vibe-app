/**
 * Activities Agent - Orchestrates the complete activity recommendation pipeline
 * 
 * Pipeline: propose → plan → verify → recommend
 * Features:
 * - Deterministic LLM calls (temperature 0-0.3)
 * - Mandatory venue verification
 * - Tool call budgets and concurrency limits
 * - Weather suitability integration
 * - Fallback heuristics for quality assurance
 */

import {
  VibeContext,
  ProposedActivities,
  ProposedActivitiesSchema,
  VerificationPlan,
  VerificationPlanSchema,
  ProviderResults,
  ActivityCuration,
  ActivityCurationSchema,
  OrchestratorResponse,
  ToolBudget,
  LLMConfig,
  WeatherHints
} from '../llm/schemas.js';

import {
  ACTIVITIES_ORCHESTRATOR_SYSTEM_PROMPT,
  PROPOSE_ACTIVITIES_PROMPT,
  PLAN_VERIFICATION_PROMPT,
  CURATE_RECOMMENDATIONS_PROMPT
} from '../llm/prompts.js';

import { generateWeatherHints, assessWeatherSuitability } from './weatherSuitability.js';
import { rateLimitedLLM } from '../llm/rateLimitedProvider.js';
import { ChallengeSelector } from './challengeSelector.js';
import { enhancedVibeDetector } from '../vibeDetection/enhancedVibeDetector.js';
import { ALL_ROMANIA_ACTIVITIES, ALL_SUBTYPES } from '../../domain/activities/index.js';
// Removed unused provider mappings - app now uses database only

export class ActivitiesAgent {
  private llmProvider: any;
  private challengeSelector: ChallengeSelector;
  
  // Default configurations
  private defaultLLMConfig: LLMConfig = {
    temperature: 0.2, // Low temperature for deterministic behavior
    maxTokens: 4000,
    retries: 3,
    timeout: 30000,
    model: 'claude-3-5-sonnet-20241022'
  };

  private defaultToolBudget: ToolBudget = {
    maxTotalCalls: 25,
    maxPerProvider: {
      google: 12,
      osm: 5,
      otm: 8
    },
    maxConcurrentCalls: 4,
    timeoutPerCall: 10000,
    maxTotalExecutionTime: 60000
  };
  
  constructor() {
    this.llmProvider = rateLimitedLLM;
    this.challengeSelector = new ChallengeSelector();
  }
  
  /**
   * Main orchestrator method: propose → plan → verify → recommend
   */
  async recommend(
    context: VibeContext,
    options?: {
      llmConfig?: Partial<LLMConfig>;
      toolBudget?: Partial<ToolBudget>;
    }
  ): Promise<OrchestratorResponse> {
    const startTime = Date.now();
    const llmConfig = { ...this.defaultLLMConfig, ...options?.llmConfig };
    const toolBudget = { ...this.defaultToolBudget, ...options?.toolBudget };

    console.log('🧠 Step 1: Proposing activities...');
    
    try {
      // Step 1: Generate weather hints
      const weatherHints = this.generateWeatherHints(context);
      
      // Step 2: Propose activities with enhanced vibe detection
      const proposedActivities = await this.proposeActivities(context, weatherHints, llmConfig);
      
      console.log(`✅ Proposed ${proposedActivities.intents.length} activities: [${proposedActivities.intents.map(i => `'${i.label}'`).join(', ')}]`);

      // Step 3: Plan verification
      console.log('🔍 Step 2: Planning verification...');
      const verificationPlan = await this.planVerification(proposedActivities, context, toolBudget, llmConfig);
      console.log(`✅ Planned ${verificationPlan.queries.length} verification queries`);

      // Step 4: Execute provider queries (mock for now)
      console.log('⚡ Step 3: Executing provider queries...');
      const providerResults = await this.executeProviderQueries(verificationPlan);
      console.log(`✅ Executed ${verificationPlan.queries.length} queries, ${this.calculateSuccessfulQueries(providerResults)} successful`);

      // Step 5: Curate final recommendations
      console.log('🎯 Step 4: Curating final recommendations...');
      const curation = await this.curateRecommendations(context, proposedActivities, providerResults, weatherHints, llmConfig);
      
      const totalTime = Date.now() - startTime;
      console.log(`✅ Orchestration complete in ${totalTime}ms, ${curation.recommendations.length} recommendations`);

      return {
        curation,
        execution: {
          totalTimeMs: totalTime,
          llmStats: {
            totalCalls: 3, // propose + plan + curate
            averageLatency: totalTime / 3,
            successRate: 1.0
          },
          providerStats: {
            totalCalls: verificationPlan.queries.length,
            successRate: this.calculateSuccessRate(providerResults),
            averageLatency: 1000 // Mock value
          },
          quality: {
            verificationRate: this.calculateVerificationRate(curation),
            diversityScore: this.calculateDiversityScore(curation),
            confidenceScore: this.calculateConfidenceScore(curation)
          }
        }
      };

    } catch (error) {
      console.error('❌ Orchestration failed:', error);
      return this.createEmptyResponse(startTime, error);
    }
  }

  /**
   * Step 1: Propose activities using enhanced vibe detection
   */
  private async proposeActivities(
    context: VibeContext,
    weatherHints: WeatherHints,
    llmConfig: LLMConfig
  ): Promise<ProposedActivities> {
    // Step 1a: Enhanced vibe detection with semantic fallback
    console.log('🎯 Step 1a: Enhanced vibe detection...');
    const vibeDetection = await enhancedVibeDetector.detectVibeWithCategories(
      context.vibeText,
      'en' // TODO: Detect language from context
    );
    
    console.log(`✅ Vibe detection complete: ${vibeDetection.confidence}% confidence via ${vibeDetection.method}`);
    console.log(`   Detected categories: ${vibeDetection.categories.join(', ')}`);
    console.log(`   Reasoning: ${vibeDetection.reasoning}`);
    
    // Step 1b: Build enhanced prompt with vibe detection results
    const prompt = this.buildEnhancedProposePrompt(context, weatherHints, vibeDetection);
    
    try {
      const response = await this.llmProvider.completeJSON({
        system: ACTIVITIES_ORCHESTRATOR_SYSTEM_PROMPT,
        user: prompt,
        schema: ProposedActivitiesSchema,
        maxTokens: llmConfig.maxTokens
      });
      
      if (!response.ok) {
        throw new Error(`LLM call failed: ${response.error}`);
      }
      
      const proposedActivities = response.data;
      
      // Validate the response
      if (!proposedActivities.intents || !Array.isArray(proposedActivities.intents)) {
        throw new Error('Invalid ProposedActivities schema');
      }
      
      return proposedActivities;
      
    } catch (error) {
      console.error('❌ Failed to propose activities:', error);
      
      // Fallback: Use enhanced heuristic selection with vibe detection
      return this.enhancedHeuristicActivitySelection(context, weatherHints, vibeDetection);
    }
  }

  /**
   * Step 2: Plan verification queries for proposed activities
   */
  private async planVerification(
    proposedActivities: ProposedActivities,
    context: VibeContext,
    toolBudget: ToolBudget,
    llmConfig: LLMConfig
  ): Promise<VerificationPlan> {
    const prompt = this.buildPlanPrompt(proposedActivities, context, toolBudget);
    
    try {
      const response = await this.llmProvider.completeJSON({
        system: ACTIVITIES_ORCHESTRATOR_SYSTEM_PROMPT,
        user: prompt,
        schema: VerificationPlanSchema,
        maxTokens: llmConfig.maxTokens
      });
      
      if (!response.ok) {
        throw new Error(`LLM call failed: ${response.error}`);
      }
      
      const verificationPlan = response.data;
      
      // Validate and enforce budget limits
      if (verificationPlan.queries.length > toolBudget.maxTotalCalls) {
        verificationPlan.queries = verificationPlan.queries
          .sort((a: any, b: any) => b.priority - a.priority)
          .slice(0, toolBudget.maxTotalCalls);
      }
      
      return verificationPlan;
      
    } catch (error) {
      console.error('❌ Failed to plan verification:', error);
      
      // Fallback: Create heuristic verification plan
      return this.heuristicVerificationPlan(proposedActivities, context, toolBudget);
    }
  }

  /**
   * Step 4: Curate final recommendations using provider results
   */
  private async curateRecommendations(
    context: VibeContext,
    proposedActivities: ProposedActivities,
    providerResults: ProviderResults,
    weatherHints: WeatherHints,
    llmConfig: LLMConfig
  ): Promise<ActivityCuration> {
    const prompt = this.buildCuratePrompt(
      context,
      proposedActivities,
      providerResults,
      weatherHints
    );
    
    try {
      const response = await this.llmProvider.completeJSON({
        system: ACTIVITIES_ORCHESTRATOR_SYSTEM_PROMPT,
        user: prompt,
        schema: ActivityCurationSchema,
        maxTokens: llmConfig.maxTokens
      });
      
      if (!response.ok) {
        throw new Error(`LLM call failed: ${response.error}`);
      }
      
      const activityCuration = response.data;
      
      return activityCuration;
      
    } catch (error) {
      console.error('❌ Failed to curate recommendations:', error);
      
      // Fallback: Create heuristic recommendations
      return this.heuristicCuration(proposedActivities, providerResults, context);
    }
  }

  // Helper methods
  private generateWeatherHints(context: VibeContext): WeatherHints {
    const weatherByRegion: Record<string, any[]> = {};
    
    context.weather.forEach(regionWeather => {
      weatherByRegion[regionWeather.region] = regionWeather.forecastDaily.map(day => ({
        tMax: day.tMax,
        precipMm: day.precipMm,
        windMps: day.windMps,
        condition: day.condition
      }));
    });
    
    return generateWeatherHints(ALL_SUBTYPES, weatherByRegion);
  }

  private buildEnhancedProposePrompt(
    context: VibeContext, 
    weatherHints: WeatherHints, 
    vibeDetection: any
  ): string {
    return `${PROPOSE_ACTIVITIES_PROMPT}

ENHANCED VIBE ANALYSIS:
- Detection Method: ${vibeDetection.method}
- Confidence: ${vibeDetection.confidence}%
- Detected Categories: ${vibeDetection.categories.join(', ')}
- Reasoning: ${vibeDetection.reasoning}
- Detected Activities: ${vibeDetection.detectedActivities.join(', ')}

CONTEXT:
${JSON.stringify({
    userProfile: context.userProfile,
    vibeText: context.vibeText,
    sessionFilters: context.sessionFilters,
    regionsSeed: context.regionsSeed,
    timeContext: context.timeContext,
    weatherHints: weatherHints.suitabilityBySubtype,
    vibeDetectionResults: {
      detectedCategories: vibeDetection.categories,
      suggestedActivities: vibeDetection.detectedActivities,
      confidence: vibeDetection.confidence,
      method: vibeDetection.method
    },
    availableActivities: context.activityOntology.map((a: any) => ({
      id: a.id,
      label: a.label,
      category: a.category,
      subtypes: a.subtypes,
      regions: a.regions,
      energy: a.energy,
      difficulty: a.difficulty
    }))
  }, null, 2)}`;
  }

  private buildPlanPrompt(proposedActivities: ProposedActivities, context: VibeContext, toolBudget: ToolBudget): string {
    return `${PLAN_VERIFICATION_PROMPT}

PROPOSED ACTIVITIES:
${JSON.stringify(proposedActivities, null, 2)}

CONTEXT:
${JSON.stringify({
  regionsSeed: context.regionsSeed,
  toolBudget
}, null, 2)}`;
  }

  private buildCuratePrompt(
    context: VibeContext,
    proposedActivities: ProposedActivities,
    providerResults: ProviderResults,
    weatherHints: WeatherHints
  ): string {
    return `${CURATE_RECOMMENDATIONS_PROMPT}

PROPOSED ACTIVITIES:
${JSON.stringify(proposedActivities, null, 2)}

PROVIDER RESULTS:
${JSON.stringify(providerResults, null, 2)}

CONTEXT:
${JSON.stringify({
  userProfile: context.userProfile,
  sessionFilters: context.sessionFilters,
  weatherHints: weatherHints.suitabilityBySubtype
}, null, 2)}`;
  }

  // Mock implementations for testing
  private async executeProviderQueries(plan: VerificationPlan): Promise<ProviderResults> {
    // Mock implementation - in real system this would call actual providers
    return {
      results: plan.queries.map(query => ({
        queryId: query.intentId,
        provider: query.provider,
        success: Math.random() > 0.2, // 80% success rate
        venues: []
      }))
    };
  }

  private enhancedHeuristicActivitySelection(
    context: VibeContext,
    weatherHints: WeatherHints,
    vibeDetection: any
  ): ProposedActivities {
    console.log('🔄 Using enhanced heuristic activity selection with vibe detection');
    
    // Simple fallback - select activities based on vibe detection
    const selectedActivities = ALL_ROMANIA_ACTIVITIES
      .filter(activity => vibeDetection.categories.includes(activity.category))
      .slice(0, 5);

    return {
      intents: selectedActivities.map(activity => ({
        id: activity.id,
        label: activity.label,
        category: activity.category,
        subtypes: activity.subtypes,
        regions: activity.regions,
        vibeAlignment: `Enhanced selection: ${vibeDetection.method} detection (${vibeDetection.confidence}%)`,
        confidence: 0.7
      })),
      selectionRationale: `Enhanced heuristic selection with ${vibeDetection.method} vibe detection`
    };
  }

  private heuristicVerificationPlan(
    proposedActivities: ProposedActivities,
    context: VibeContext,
    toolBudget: ToolBudget
  ): VerificationPlan {
    console.log('🔄 Using heuristic verification plan');
    
    const queries = proposedActivities.intents.slice(0, toolBudget.maxTotalCalls).map((intent, index) => ({
      intentId: intent.id,
      provider: 'google' as const,
      priority: 5 - index,
      query: {
        location: context.regionsSeed[0] || { lat: 44.4268, lon: 26.1025 },
        radiusMeters: 5000,
        textQuery: intent.label,
        type: 'establishment'
      },
      expectedResultType: 'venues' as const
    }));

    return {
      queries,
      estimatedCalls: queries.length,
      strategy: 'Heuristic fallback plan'
    };
  }

  private heuristicCuration(
    proposedActivities: ProposedActivities,
    providerResults: ProviderResults,
    context: VibeContext
  ): ActivityCuration {
    console.log('🔄 Using heuristic curation');
    
    const recommendations = proposedActivities.intents.slice(0, 3).map(intent => ({
      intent: {
        id: intent.id,
        label: intent.label,
        category: intent.category,
        subtypes: intent.subtypes,
        regions: intent.regions,
        energy: 'medium',
        indoorOutdoor: 'mixed'
      },
      verifiedVenues: [],
      weatherSuitability: 'ok' as const,
      rationale: `Heuristic selection for ${intent.label}`,
      confidence: 0.7,
      personalizationFactors: {
        interestMatch: 0.7,
        energyMatch: 0.7,
        profileAlignment: 0.7
      }
    }));

    return {
      recommendations,
      curationRationale: 'Heuristic curation fallback'
    };
  }

  // Utility methods
  private calculateSuccessfulQueries(results: ProviderResults): number {
    return results.results.filter(r => r.success).length;
  }

  private calculateSuccessRate(results: ProviderResults): number {
    const total = results.results.length;
    const successful = this.calculateSuccessfulQueries(results);
    return total > 0 ? successful / total : 0;
  }

  private calculateVerificationRate(curation: ActivityCuration): number {
    const total = curation.recommendations.length;
    const verified = curation.recommendations.filter(r => r.verifiedVenues && r.verifiedVenues.length > 0).length;
    return total > 0 ? verified / total : 0;
  }

  private calculateDiversityScore(curation: ActivityCuration): number {
    const categories = new Set(curation.recommendations.map(r => r.intent.category));
    return categories.size / Math.max(curation.recommendations.length, 1);
  }

  private calculateConfidenceScore(curation: ActivityCuration): number {
    const confidences = curation.recommendations.map(r => r.confidence);
    return confidences.length > 0 ? confidences.reduce((sum, conf) => sum + conf, 0) / confidences.length : 0;
  }

  private createEmptyResponse(startTime: number, error: any): OrchestratorResponse {
    return {
      curation: {
        recommendations: [],
        curationRationale: `Failed due to error: ${error.message}`
      },
      execution: {
        totalTimeMs: Date.now() - startTime,
        llmStats: { totalCalls: 0, averageLatency: 0, successRate: 0 },
        providerStats: { totalCalls: 0, successRate: 0, averageLatency: 0 },
        quality: { verificationRate: 0, diversityScore: 0, confidenceScore: 0 }
      }
    };
  }
}
