/**
 * Semantic Fallback Layer
 * 
 * Provides semantic understanding when keyword matching fails.
 * Uses Claude to understand user intent and map to ontology activities.
 */

import { rateLimitedLLM } from '../llm/rateLimitedProvider.js';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { z } from 'zod';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Zod schema for semantic match validation
const SemanticMatchSchema = z.object({
  activityIds: z.array(z.string()),
  vibeEntryIds: z.array(z.string()),
  confidence: z.number().min(0).max(1),
  reasoning: z.string(),
  semanticScore: z.number().min(0).max(100),
  detectedIntent: z.string().optional()
});

interface SemanticMatch {
  activityIds: string[];
  vibeEntryIds: string[];
  confidence: number;
  reasoning: string;
  semanticScore: number;
  detectedIntent?: string;
}

interface OntologyActivity {
  id: string;
  label: string;
  category: string;
  keywords: {
    en: string[];
    ro: string[];
  };
}

interface VibeEntry {
  id: string;
  cues: {
    en: string[];
    ro: string[];
  };
  preferredCategories: string[];
}

export class SemanticFallbackService {
  private llm: any;
  private activities: OntologyActivity[] = [];
  private vibeEntries: VibeEntry[] = [];
  private initialized: boolean = false;

  constructor() {
    // TIMING SAFETY: Never initialize LLM in constructor
    // Environment variables may not be loaded yet
  }

  /**
   * Lazy initialization - ensures LLM is only created after environment is loaded
   * This prevents the timing issue where constructor runs before .env is loaded
   */
  private async ensureInitialized() {
    if (this.initialized) return;
    
    try {
      // Initialize LLM provider (after environment is loaded)
      this.llm = rateLimitedLLM;
      
      // Load ontology data
      const activitiesPath = path.resolve(__dirname, '../../domain/activities/ontology/activities.json');
      const vibePath = path.resolve(__dirname, '../../domain/activities/ontology/vibe_lexicon.json');
      
      const activitiesData = JSON.parse(await fs.readFile(activitiesPath, 'utf8'));
      const vibeData = JSON.parse(await fs.readFile(vibePath, 'utf8'));
      
      this.activities = activitiesData.subtypes || [];
      this.vibeEntries = vibeData.entries || [];
      
      this.initialized = true;
    } catch (error) {
      console.error('❌ SemanticFallbackService initialization failed:', error);
      throw new Error(`Semantic fallback initialization failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async initialize() {
    await this.ensureInitialized();
  }

  async analyzeSemanticIntent(userInput: string, language: 'en' | 'ro' = 'en'): Promise<SemanticMatch> {
    await this.ensureInitialized();

    // Create activity context for Claude
    const activityContext = this.activities.map(activity => ({
      id: activity.id,
      label: activity.label,
      category: activity.category,
      keywords: activity.keywords[language]?.slice(0, 3) || [] // Top 3 keywords only
    }));

    // Create vibe context for Claude
    const vibeContext = this.vibeEntries.map(vibe => ({
      id: vibe.id,
      cues: vibe.cues[language]?.slice(0, 2) || [], // Top 2 cues only
      categories: vibe.preferredCategories
    }));

    const prompt = `
You are a semantic intent analyzer. Analyze this user expression: "${userInput}"

IMPORTANT: Do NOT match keywords literally. Understand the DEEPER MEANING and EMOTIONAL INTENT.

AVAILABLE ACTIVITY CATEGORIES AND THEIR PURPOSES:
- wellness: Relaxation, stress relief, self-care, healing, peace
- mindfulness: Meditation, inner peace, spiritual practice, centering, calm
- social: Human connection, meeting people, combating loneliness, community
- adventure: Excitement, adrenaline, challenges, pushing limits, thrills
- creative: Artistic expression, making things, self-expression, inspiration
- nightlife: Entertainment, fun, social energy, evening activities
- fitness: Physical activity, movement, health, energy, strength
- nature: Outdoors, natural environments, fresh air, scenery
- culture: Learning, history, traditions, intellectual stimulation
- culinary: Food experiences, taste, cooking, dining
- romance: Intimate experiences, date activities, romantic connection
- water: Water-based activities, swimming, boats, aquatic sports
- seasonal: Season-specific activities (winter/summer)
- sports: Athletic activities, competition, physical challenges
- learning: Education, skill development, knowledge acquisition

AVAILABLE ACTIVITIES (DO NOT MATCH KEYWORDS - UNDERSTAND PURPOSE):
${activityContext.map(a => `- ${a.id}: ${a.label} (serves ${a.category} needs)`).join('\n')}

TASK: What is the user's EMOTIONAL NEED and DESIRED OUTCOME?
- What feeling are they seeking?
- What problem are they trying to solve?
- What experience would satisfy them?

RESPOND WITH JSON:
{
  "activityIds": ["most-relevant-activity-ids"],
  "vibeEntryIds": ["relevant-vibe-patterns"],
  "confidence": 0.85,
  "reasoning": "Explain the EMOTIONAL/SEMANTIC connection you identified",
  "semanticScore": 85,
  "detectedIntent": "Brief description of what the user actually wants"
}

CRITICAL: Base matches on SEMANTIC MEANING, not keyword overlap!
`;

    try {
      const result = await this.llm.completeJSON({
        system: "You are a semantic intent analyzer for activity recommendations. Focus on understanding the deeper meaning and emotional context of user requests.",
        user: prompt,
        schema: SemanticMatchSchema,
        maxTokens: 800
      });

      if (!result.ok) {
        throw new Error(`Semantic analysis failed: ${result.error}`);
      }

      return result.data;
    } catch (error) {
      console.error('Semantic fallback error:', error);
      return {
        activityIds: [],
        vibeEntryIds: [],
        confidence: 0,
        reasoning: 'Semantic analysis failed',
        semanticScore: 0
      };
    }
  }

  async enhanceKeywordResults(
    userInput: string, 
    keywordScore: number, 
    keywordMatches: { activities: string[], vibeEntries: string[] },
    language: 'en' | 'ro' = 'en'
  ): Promise<{
    finalScore: number;
    activities: string[];
    vibeEntries: string[];
    method: 'keyword' | 'semantic' | 'hybrid';
    reasoning: string;
  }> {
    // If keyword matching is strong enough, use it
    if (keywordScore >= 70) {
      return {
        finalScore: keywordScore,
        activities: keywordMatches.activities,
        vibeEntries: keywordMatches.vibeEntries,
        method: 'keyword',
        reasoning: 'Strong keyword match found'
      };
    }

    // If keyword matching is weak, try semantic fallback
    console.log(`🧠 Keyword score ${keywordScore}% below threshold, trying semantic fallback...`);
    
    const semanticMatch = await this.analyzeSemanticIntent(userInput, language);

    // If semantic analysis found good matches
    if (semanticMatch.confidence >= 0.7 && semanticMatch.semanticScore >= 70) {
      return {
        finalScore: semanticMatch.semanticScore,
        activities: semanticMatch.activityIds,
        vibeEntries: semanticMatch.vibeEntryIds,
        method: 'semantic',
        reasoning: `Semantic fallback: ${semanticMatch.reasoning}`
      };
    }

    // If both keyword and semantic are moderate, combine them
    if (keywordScore >= 40 && semanticMatch.confidence >= 0.5) {
      const combinedActivities = [...new Set([...keywordMatches.activities, ...semanticMatch.activityIds])];
      const combinedVibeEntries = [...new Set([...keywordMatches.vibeEntries, ...semanticMatch.vibeEntryIds])];
      const hybridScore = Math.max(keywordScore, semanticMatch.semanticScore);

      return {
        finalScore: hybridScore,
        activities: combinedActivities,
        vibeEntries: combinedVibeEntries,
        method: 'hybrid',
        reasoning: `Hybrid: Keyword (${keywordScore}%) + Semantic (${semanticMatch.semanticScore}%)`
      };
    }

    // Fallback to original keyword results
    return {
      finalScore: keywordScore,
      activities: keywordMatches.activities,
      vibeEntries: keywordMatches.vibeEntries,
      method: 'keyword',
      reasoning: 'Semantic fallback found no strong matches'
    };
  }
}

export const semanticFallback = new SemanticFallbackService();
