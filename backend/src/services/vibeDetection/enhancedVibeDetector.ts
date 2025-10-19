/**
 * Enhanced Vibe Detector with Semantic Fallback
 * 
 * Integrates keyword-based vibe detection with semantic AI fallback
 * for comprehensive understanding of user expressions.
 */

import { semanticFallback } from '../ontology/semanticFallback.js';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export interface VibeDetectionResult {
  detectedActivities: string[];
  detectedVibeEntries: string[];
  confidence: number;
  method: 'keyword' | 'semantic' | 'hybrid';
  reasoning: string;
  semanticIntent?: string;
}

export interface VibeEntry {
  id: string;
  cues: {
    en: string[];
    ro: string[];
  };
  preferredCategories: string[];
}

export interface OntologyActivity {
  id: string;
  label: string;
  category: string;
  keywords: {
    en: string[];
    ro: string[];
  };
  synonyms: {
    en: string[];
    ro: string[];
  };
}

export class EnhancedVibeDetector {
  private vibeEntries: VibeEntry[] = [];
  private activities: OntologyActivity[] = [];
  private initialized = false;

  async initialize() {
    if (this.initialized) return;

    try {
      // Load vibe lexicon
      const vibePath = path.resolve(__dirname, '../../domain/activities/ontology/vibe_lexicon.json');
      const vibeData = JSON.parse(await fs.readFile(vibePath, 'utf8'));
      this.vibeEntries = vibeData.entries || [];

      // Load activities ontology
      const activitiesPath = path.resolve(__dirname, '../../domain/activities/ontology/activities.json');
      const activitiesData = JSON.parse(await fs.readFile(activitiesPath, 'utf8'));
      this.activities = activitiesData.subtypes || [];

      this.initialized = true;
      console.log(`🎯 Enhanced vibe detector initialized: ${this.vibeEntries.length} vibe entries, ${this.activities.length} activities`);
    } catch (error) {
      console.error('❌ Failed to initialize enhanced vibe detector:', error);
      throw error;
    }
  }

  /**
   * Detect user vibe with keyword + semantic fallback
   */
  async detectVibe(
    vibeText: string, 
    language: 'en' | 'ro' = 'en',
    confidenceThreshold: number = 70
  ): Promise<VibeDetectionResult> {
    await this.initialize();

    console.log(`🎯 Detecting vibe for: "${vibeText}" (${language})`);

    // Step 1: Try keyword-based detection
    const keywordResult = this.detectVibeKeywords(vibeText, language);
    
    console.log(`📊 Keyword detection: ${keywordResult.confidence}% confidence`);

    // Step 2: If keyword confidence is high enough, use it
    if (keywordResult.confidence >= confidenceThreshold) {
      return {
        ...keywordResult,
        method: 'keyword',
        reasoning: `Strong keyword match found (${keywordResult.confidence}%)`
      };
    }

    // Step 3: Try semantic fallback
    console.log(`🧠 Keyword confidence ${keywordResult.confidence}% below threshold, trying semantic fallback...`);
    
    try {
      const semanticResult = await semanticFallback.enhanceKeywordResults(
        vibeText,
        keywordResult.confidence,
        {
          activities: keywordResult.detectedActivities,
          vibeEntries: keywordResult.detectedVibeEntries
        },
        language
      );

      return {
        detectedActivities: semanticResult.activities,
        detectedVibeEntries: semanticResult.vibeEntries,
        confidence: semanticResult.finalScore,
        method: semanticResult.method as 'keyword' | 'semantic' | 'hybrid',
        reasoning: semanticResult.reasoning,
        semanticIntent: semanticResult.method === 'semantic' ? 'AI-detected emotional intent' : undefined
      };

    } catch (error) {
      console.error('❌ Semantic fallback failed:', error);
      
      // Fallback to keyword results even if low confidence
      return {
        ...keywordResult,
        method: 'keyword',
        reasoning: `Semantic fallback failed, using keyword results: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  /**
   * Keyword-based vibe detection (existing logic)
   */
  private detectVibeKeywords(vibeText: string, language: 'en' | 'ro'): Omit<VibeDetectionResult, 'method' | 'reasoning'> {
    const normalizedText = vibeText.toLowerCase();
    const detectedActivities: string[] = [];
    const detectedVibeEntries: string[] = [];
    let totalScore = 0;
    let maxScore = 0;

    // Check vibe entries
    for (const vibeEntry of this.vibeEntries) {
      const cues = vibeEntry.cues[language] || [];
      let vibeScore = 0;

      for (const cue of cues) {
        if (normalizedText.includes(cue.toLowerCase())) {
          vibeScore += 40; // Base score for vibe entry match
          detectedVibeEntries.push(vibeEntry.id);
          break; // Only count once per vibe entry
        }
      }

      if (vibeScore > 0) {
        totalScore += vibeScore;
        maxScore += 40;
      }
    }

    // Check activity keywords and synonyms
    for (const activity of this.activities) {
      const keywords = activity.keywords[language] || [];
      const synonyms = activity.synonyms[language] || [];
      let activityScore = 0;

      // Check keywords (higher weight)
      for (const keyword of keywords) {
        if (normalizedText.includes(keyword.toLowerCase())) {
          activityScore += 30;
        }
      }

      // Check synonyms (lower weight)
      for (const synonym of synonyms) {
        if (normalizedText.includes(synonym.toLowerCase())) {
          activityScore += 20;
        }
      }

      if (activityScore > 0) {
        detectedActivities.push(activity.id);
        totalScore += Math.min(activityScore, 60); // Cap per activity
        maxScore += 60;
      }
    }

    // Calculate confidence percentage
    const confidence = maxScore > 0 ? Math.round((totalScore / maxScore) * 100) : 0;

    return {
      detectedActivities: [...new Set(detectedActivities)], // Remove duplicates
      detectedVibeEntries: [...new Set(detectedVibeEntries)], // Remove duplicates
      confidence: Math.min(confidence, 100) // Cap at 100%
    };
  }

  /**
   * Get activity categories from detected activities
   */
  async getActivityCategories(activityIds: string[]): Promise<string[]> {
    await this.initialize();
    
    const categories = new Set<string>();
    
    for (const activityId of activityIds) {
      const activity = this.activities.find(a => a.id === activityId);
      if (activity) {
        categories.add(activity.category);
      }
    }
    
    return Array.from(categories);
  }

  /**
   * Get vibe entry categories from detected vibe entries
   */
  async getVibeCategories(vibeEntryIds: string[]): Promise<string[]> {
    await this.initialize();
    
    const categories = new Set<string>();
    
    for (const vibeEntryId of vibeEntryIds) {
      const vibeEntry = this.vibeEntries.find(v => v.id === vibeEntryId);
      if (vibeEntry) {
        vibeEntry.preferredCategories.forEach(cat => categories.add(cat));
      }
    }
    
    return Array.from(categories);
  }

  /**
   * Enhanced vibe detection that returns categories for orchestrator
   */
  async detectVibeWithCategories(
    vibeText: string,
    language: 'en' | 'ro' = 'en'
  ): Promise<VibeDetectionResult & { categories: string[] }> {
    const result = await this.detectVibe(vibeText, language);
    
    // Get categories from both activities and vibe entries
    const activityCategories = await this.getActivityCategories(result.detectedActivities);
    const vibeCategories = await this.getVibeCategories(result.detectedVibeEntries);
    
    const allCategories = [...new Set([...activityCategories, ...vibeCategories])];
    
    return {
      ...result,
      categories: allCategories
    };
  }
}

// Export singleton instance
export const enhancedVibeDetector = new EnhancedVibeDetector();
