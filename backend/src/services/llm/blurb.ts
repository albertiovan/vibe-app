/**
 * Activity Blurb Generator
 * 
 * Generates activity-first blurbs using Claude LLM with strict JSON validation
 * and heuristic fallbacks. Focuses on what users DO at venues, not venue descriptions.
 */

import { getLLMProvider } from './index.js';
import { ACTIVITY_CONFIG, ACTIVITY_VERB_MAPPING, BUCKET_VERB_MAPPING, BucketId } from '../../types/activity.js';

export interface BlurbInput {
  name: string;
  types?: string[];
  editorialSummary?: string;
  rating?: number;
  userRatingsTotal?: number;
  activitySubtype: string;
  bucket: BucketId;
  indoorOutdoor?: 'indoor' | 'outdoor' | 'either';
  durationHintHrs?: [number, number];
  keywords?: string[];
}

export interface BlurbOutput {
  blurb: string;
}

const BLURB_SYSTEM_PROMPT = `You are an expert at writing activity-first venue descriptions. Your job is to generate a short blurb that tells users what they can DO at a venue, not what the venue is.

CRITICAL RULES:
- Return ONLY valid JSON: {"blurb": "your text here"}
- Maximum ${ACTIVITY_CONFIG.BLURB_MAX_WORDS} words
- Minimum ${ACTIVITY_CONFIG.BLURB_MIN_WORDS} words
- Start with action verbs (Dance, Explore, Try, Enjoy, etc.)
- Describe the ACTIVITY/EXPERIENCE, not the venue brand
- Use second-person implied ("Dance to...", "Explore...", "Try...")
- NO superlatives ("best", "amazing") unless in editorial_summary
- NO prices, availability, or booking info
- NO invented facts - only use provided data
- If insufficient information, return {"blurb": ""}

EXAMPLES:
- Night club → "Dance to live DJ sets with a mixed crowd until late"
- Museum → "Explore interactive exhibits and learn about local history"
- Climbing gym → "Boulder on beginner routes and challenge yourself indoors"
- Cafe → "Sip artisan coffee and work in a cozy social atmosphere"
- Park → "Walk peaceful trails and enjoy fresh air outdoors"`;

const BLURB_USER_PROMPT = `Generate an activity-first blurb for this venue:

Name: {name}
Types: {types}
Editorial Summary: {editorialSummary}
Activity Subtype: {activitySubtype}
Bucket: {bucket}
Indoor/Outdoor: {indoorOutdoor}
Duration: {duration}
Keywords: {keywords}
Rating: {rating} ({userRatingsTotal} reviews)

Focus on what users DO here. Return only JSON.`;

export class ActivityBlurbGenerator {
  private llm = getLLMProvider();
  private cache = new Map<string, { blurb: string; timestamp: number }>();

  /**
   * Generate activity-first blurb with LLM and fallback
   */
  async generateBlurb(input: BlurbInput): Promise<string> {
    try {
      // Check cache first
      const cacheKey = this.getCacheKey(input);
      const cached = this.cache.get(cacheKey);
      if (cached && this.isCacheValid(cached.timestamp)) {
        console.log('📝 Using cached blurb for:', input.name);
        return cached.blurb;
      }

      console.log('📝 Generating activity blurb for:', input.name);

      // Try LLM generation first
      const llmBlurb = await this.tryLLMGeneration(input);
      if (llmBlurb && this.validateBlurb(llmBlurb)) {
        console.log('✅ LLM blurb generated:', llmBlurb.slice(0, 50) + '...');
        this.cache.set(cacheKey, { blurb: llmBlurb, timestamp: Date.now() });
        return llmBlurb;
      }

      // Fallback to heuristic blurb
      console.log('🔄 Using heuristic fallback for:', input.name);
      const fallbackBlurb = this.generateHeuristicBlurb(input);
      this.cache.set(cacheKey, { blurb: fallbackBlurb, timestamp: Date.now() });
      return fallbackBlurb;

    } catch (error) {
      console.error('❌ Blurb generation error:', error);
      return this.generateHeuristicBlurb(input);
    }
  }

  /**
   * Try LLM-powered blurb generation
   */
  private async tryLLMGeneration(input: BlurbInput): Promise<string | null> {
    try {
      const prompt = this.buildPrompt(input);
      
      const result = await this.llm.completeJSON({
        system: BLURB_SYSTEM_PROMPT,
        user: prompt,
        schema: null as any, // We'll validate manually for more control
        maxTokens: 150
      });

      if (!result.ok) {
        console.warn('📝 LLM blurb generation failed:', result.error);
        return null;
      }

      // Validate JSON structure
      const data = result.data as any;
      if (!data || typeof data.blurb !== 'string') {
        console.warn('📝 Invalid LLM response structure:', data);
        return null;
      }

      const blurb = data.blurb.trim();
      
      // Additional validation
      if (!this.validateBlurb(blurb)) {
        console.warn('📝 LLM blurb failed validation:', blurb);
        return null;
      }

      return blurb;

    } catch (error) {
      console.warn('📝 LLM generation error:', error);
      return null;
    }
  }

  /**
   * Generate heuristic fallback blurb
   */
  private generateHeuristicBlurb(input: BlurbInput): string {
    // Try activity subtype mapping first
    if (input.activitySubtype && ACTIVITY_VERB_MAPPING[input.activitySubtype]) {
      return ACTIVITY_VERB_MAPPING[input.activitySubtype];
    }

    // Try primary type mapping
    if (input.types && input.types.length > 0) {
      for (const type of input.types) {
        if (ACTIVITY_VERB_MAPPING[type]) {
          return ACTIVITY_VERB_MAPPING[type];
        }
      }
    }

    // Try bucket mapping
    if (BUCKET_VERB_MAPPING[input.bucket]) {
      return BUCKET_VERB_MAPPING[input.bucket];
    }

    // Final fallback
    return ACTIVITY_VERB_MAPPING['default'];
  }

  /**
   * Build LLM prompt with input data
   */
  private buildPrompt(input: BlurbInput): string {
    return BLURB_USER_PROMPT
      .replace('{name}', input.name || 'Unknown')
      .replace('{types}', input.types?.join(', ') || 'None')
      .replace('{editorialSummary}', input.editorialSummary || 'None')
      .replace('{activitySubtype}', input.activitySubtype || 'None')
      .replace('{bucket}', input.bucket || 'None')
      .replace('{indoorOutdoor}', input.indoorOutdoor || 'Either')
      .replace('{duration}', input.durationHintHrs ? `${input.durationHintHrs[0]}-${input.durationHintHrs[1]} hours` : 'Flexible')
      .replace('{keywords}', input.keywords?.join(', ') || 'None')
      .replace('{rating}', input.rating?.toString() || 'N/A')
      .replace('{userRatingsTotal}', input.userRatingsTotal?.toString() || '0');
  }

  /**
   * Validate blurb meets requirements
   */
  private validateBlurb(blurb: string): boolean {
    if (!blurb || typeof blurb !== 'string') {
      return false;
    }

    const trimmed = blurb.trim();
    
    // Check length
    if (trimmed.length === 0) {
      return false;
    }

    // Check word count
    const wordCount = trimmed.split(/\s+/).length;
    if (wordCount < ACTIVITY_CONFIG.BLURB_MIN_WORDS || wordCount > ACTIVITY_CONFIG.BLURB_MAX_WORDS) {
      console.warn(`📝 Blurb word count invalid: ${wordCount} words (${ACTIVITY_CONFIG.BLURB_MIN_WORDS}-${ACTIVITY_CONFIG.BLURB_MAX_WORDS} required)`);
      return false;
    }

    // Check for prohibited content
    const prohibited = ['best', 'amazing', 'incredible', '$', '€', 'price', 'cost', 'book now', 'reserve'];
    const lowerBlurb = trimmed.toLowerCase();
    for (const term of prohibited) {
      if (lowerBlurb.includes(term)) {
        console.warn(`📝 Blurb contains prohibited term: ${term}`);
        return false;
      }
    }

    return true;
  }

  /**
   * Generate cache key for blurb
   */
  private getCacheKey(input: BlurbInput): string {
    const key = `${input.name}_${input.activitySubtype}_${input.bucket}_v1`;
    return key.replace(/[^a-zA-Z0-9_]/g, '_');
  }

  /**
   * Check if cache entry is still valid
   */
  private isCacheValid(timestamp: number): boolean {
    const maxAge = ACTIVITY_CONFIG.CACHE_TTL_HOURS * 60 * 60 * 1000; // Convert to ms
    return (Date.now() - timestamp) < maxAge;
  }

  /**
   * Clear expired cache entries
   */
  clearExpiredCache(): void {
    const now = Date.now();
    const maxAge = ACTIVITY_CONFIG.CACHE_TTL_HOURS * 60 * 60 * 1000;
    
    for (const [key, value] of this.cache.entries()) {
      if ((now - value.timestamp) > maxAge) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * Get cache statistics
   */
  getCacheStats(): { size: number; hitRate?: number } {
    return {
      size: this.cache.size
    };
  }
}

// Singleton instance
let blurbGenerator: ActivityBlurbGenerator | null = null;

export function getBlurbGenerator(): ActivityBlurbGenerator {
  if (!blurbGenerator) {
    blurbGenerator = new ActivityBlurbGenerator();
  }
  return blurbGenerator;
}
