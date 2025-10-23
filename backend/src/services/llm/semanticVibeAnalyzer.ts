/**
 * Semantic Vibe Analyzer
 * 
 * Uses Claude to deeply understand user vibes beyond keywords
 * Example: "I miss legos" → understands building, creation, tactile making, pride in physical craft
 */

import Anthropic from '@anthropic-ai/sdk';

export interface SemanticVibeAnalysis {
  // Core understanding
  primaryIntent: string;
  emotionalContext: string;
  underlyingNeeds: string[];
  
  // Activity mapping
  suggestedCategories: string[];  // ['creative', 'learning', 'hands-on']
  energyLevel: 'low' | 'medium' | 'high';
  preferredMoods: string[];  // ['creative', 'mindful', 'cozy', 'explorer']
  
  // Contextual filters
  indoorOutdoor?: 'indoor' | 'outdoor' | 'both';
  socialContext?: 'solo' | 'date' | 'friends' | 'family' | 'any';
  durationPreference?: 'quick' | 'medium' | 'full-day';
  
  // Tag filters for database
  requiredTags: string[];  // Must have these tags
  preferredTags: string[];  // Boost activities with these
  avoidTags: string[];     // Exclude activities with these
  
  // Reasoning
  reasoning: string;
  confidence: number;  // 0-1
}

const SEMANTIC_ANALYSIS_PROMPT = `You are an expert at understanding human emotions, needs, and desires to recommend activities.

Your task: Deeply analyze a user's vibe statement to understand what they REALLY want, not just surface keywords.

EXAMPLE DEEP ANALYSIS:

User vibe: "I miss legos"

SURFACE (❌ WRONG):
- Keyword: "legos" → toy stores

DEEP (✅ CORRECT):
- PRIMARY INTENT: Wants to BUILD and CREATE something physical with their hands
- EMOTIONAL CONTEXT: Nostalgic for childhood joy of making things; misses tactile, step-by-step construction
- UNDERLYING NEEDS:
  * Physical creation (not digital)
  * Clear instructions/process
  * Sense of accomplishment when finished
  * Tactile, hands-on experience
  * See tangible results of their work
  
- SUGGESTED CATEGORIES: creative, learning (hands-on crafts like pottery, woodworking, model building, jewelry making)
- ENERGY: medium (focused but not exhausting)
- MOODS: creative, mindful, cozy, explorer (trying new techniques)
- TAGS:
  * Required: category:creative, equipment:provided, requirement:lesson-recommended
  * Preferred: mood:creative, mood:mindful, indoor_outdoor:indoor
  * Avoid: category:sports, energy:high, mood:adrenaline

ANOTHER EXAMPLE:

User vibe: "I want sports"

SURFACE (✅ OK but shallow):
- Keyword: "sports" → filter by category

DEEP (✅ BETTER):
- PRIMARY INTENT: Physical activity, possibly competitive or skill-based
- EMOTIONAL CONTEXT: Wants to move body, maybe test abilities or social play
- UNDERLYING NEEDS:
  * Physical exertion
  * Possibly social interaction
  * Clear rules/structure
  * Sense of competition or achievement
  
- SUGGESTED CATEGORIES: sports, fitness, adventure
- ENERGY: medium to high
- MOODS: adrenaline, social, explorer
- TAGS:
  * Required: category:sports OR category:fitness OR category:adventure
  * Preferred: energy:high, mood:adrenaline, context:friends
  * Avoid: energy:low, mood:relaxed

YOUR ANALYSIS PROCESS:

1. READ the vibe carefully - what is the user REALLY expressing?
2. IDENTIFY the emotional state (excited? tired? nostalgic? curious?)
3. UNDERSTAND underlying needs (physical? mental? social? achievement? relaxation?)
4. MAP to activity attributes (not just categories!)
5. CONSIDER context clues (time of day, season, mood indicators)
6. PROVIDE reasoning that shows deep understanding

DATABASE TAG SYSTEM:

Available tag facets:
- category: creative, sports, fitness, adventure, wellness, mindfulness, nature, culinary, culture, learning, water, social, romance, seasonal, nightlife
- energy: low, medium, high
- mood: creative, relaxed, cozy, mindful, romantic, social, adrenaline, adventurous, explorer
- indoor_outdoor: indoor, outdoor, both
- experience_level: beginner, intermediate, advanced, mixed
- context: solo, date, friends, family, small-group, group, team
- equipment: provided, rental-gear, none, camera, laptop
- requirement: booking-required, lesson-recommended, guide-required
- cost_band: $, $$, $$$, $$$$
- terrain: urban, forest, mountain, coast, lake, cave, valley
- time_of_day: morning, daytime, evening, night, sunset, sunrise, any
- travel_time_band: in-city, nearby, day-trip

CRITICAL: Return ONLY valid JSON. No markdown, no code blocks, no extra text.
All string values must be on single lines (no newlines).
Use spaces instead of newlines in multi-sentence text.

RETURN FORMAT (JSON):
{
  "primaryIntent": "string describing main goal",
  "emotionalContext": "user's emotional state/motivation",
  "underlyingNeeds": ["need1", "need2", "need3"],
  "suggestedCategories": ["category1", "category2"],
  "energyLevel": "low|medium|high",
  "preferredMoods": ["mood1", "mood2"],
  "indoorOutdoor": "indoor|outdoor|both|null",
  "socialContext": "solo|date|friends|family|any|null",
  "requiredTags": ["category:creative", "equipment:provided"],
  "preferredTags": ["mood:creative", "mood:mindful"],
  "avoidTags": ["energy:high", "mood:adrenaline"],
  "reasoning": "Single-line explanation with spaces not newlines",
  "confidence": 0.9
}

IMPORTANT: Keep ALL strings on single lines. No \\n characters in JSON string values.`;

/**
 * Analyze user vibe with deep semantic understanding
 */
export async function analyzeVibeSemantically(
  vibe: string,
  context?: {
    timeOfDay?: string;
    weather?: string;
    previousActivities?: string[];
  }
): Promise<SemanticVibeAnalysis> {
  
  // Validate API key is present
  if (!process.env.CLAUDE_API_KEY) {
    console.error('❌ CLAUDE_API_KEY not found in environment variables!');
    console.error('   Please ensure backend/.env has CLAUDE_API_KEY=sk-ant-...');
    console.error('   Falling back to keyword analysis...');
    return fallbackKeywordAnalysis(vibe);
  }
  
  const anthropic = new Anthropic({
    apiKey: process.env.CLAUDE_API_KEY
  });
  
  const contextString = context ? `

ADDITIONAL CONTEXT:
${context.timeOfDay ? `Time of day: ${context.timeOfDay}` : ''}
${context.weather ? `Weather: ${context.weather}` : ''}
${context.previousActivities?.length ? `User previously enjoyed: ${context.previousActivities.join(', ')}` : ''}
` : '';
  
  try {
    console.log('🧠 Performing deep semantic analysis of vibe:', vibe);
    
    const response = await anthropic.messages.create({
      model: process.env.LLM_MODEL || 'claude-3-haiku-20240307',
      max_tokens: 2048,
      temperature: 0.3, // Low temperature for consistent analysis
      system: SEMANTIC_ANALYSIS_PROMPT,
      messages: [{
        role: 'user',
        content: `Analyze this user vibe with deep understanding:

USER VIBE: "${vibe}"
${contextString}

Provide comprehensive semantic analysis in JSON format.`
      }]
    });
    
    const content = response.content[0];
    if (content.type !== 'text') {
      throw new Error('Unexpected response type from Claude');
    }
    
    // Parse JSON response with robust handling
    let jsonText = content.text.trim();
    
    // Remove markdown code blocks (multiple patterns)
    jsonText = jsonText.replace(/^```json\s*/i, '');
    jsonText = jsonText.replace(/^```\s*/i, '');
    jsonText = jsonText.replace(/\s*```$/i, '');
    
    // Find JSON object boundaries if there's extra text
    const jsonStart = jsonText.indexOf('{');
    const jsonEnd = jsonText.lastIndexOf('}');
    
    if (jsonStart !== -1 && jsonEnd !== -1) {
      jsonText = jsonText.substring(jsonStart, jsonEnd + 1);
    }
    
    let analysis: SemanticVibeAnalysis;
    
    try {
      analysis = JSON.parse(jsonText);
    } catch (parseError: any) {
      console.error('❌ JSON parse error:', parseError.message);
      console.error('📄 Attempted to parse:', jsonText.substring(0, 500));
      throw new Error(`JSON parsing failed: ${parseError.message}`);
    }
    
    // Validate required fields
    if (!analysis.primaryIntent || !analysis.suggestedCategories || !Array.isArray(analysis.suggestedCategories)) {
      console.error('❌ Invalid analysis structure:', analysis);
      throw new Error('Claude returned incomplete analysis');
    }
    
    console.log('✅ Semantic analysis complete:', {
      intent: analysis.primaryIntent.substring(0, 60),
      categories: analysis.suggestedCategories,
      confidence: analysis.confidence
    });
    
    return analysis;
    
  } catch (error) {
    console.error('❌ Semantic analysis failed:', error);
    
    // Fallback to basic keyword analysis
    return fallbackKeywordAnalysis(vibe);
  }
}

/**
 * Fallback keyword-based analysis if LLM fails
 */
function fallbackKeywordAnalysis(vibe: string): SemanticVibeAnalysis {
  const vibeLower = vibe.toLowerCase();
  const categories: string[] = [];
  const requiredTags: string[] = [];
  const preferredTags: string[] = [];
  
  // Basic keyword mapping
  if (vibeLower.includes('sport')) {
    categories.push('sports');
    requiredTags.push('category:sports');
  }
  if (vibeLower.includes('fitness') || vibeLower.includes('workout')) {
    categories.push('fitness');
    requiredTags.push('category:fitness');
  }
  if (vibeLower.includes('creative') || vibeLower.includes('art')) {
    categories.push('creative');
    requiredTags.push('category:creative');
  }
  if (vibeLower.includes('relax') || vibeLower.includes('spa')) {
    categories.push('wellness');
    requiredTags.push('category:wellness');
  }
  
  // Energy level
  let energyLevel: 'low' | 'medium' | 'high' = 'medium';
  if (vibeLower.includes('high energy') || vibeLower.includes('intense')) {
    energyLevel = 'high';
  } else if (vibeLower.includes('chill') || vibeLower.includes('relax')) {
    energyLevel = 'low';
  }
  
  return {
    primaryIntent: vibe,
    emotionalContext: 'Unknown (fallback analysis)',
    underlyingNeeds: [],
    suggestedCategories: categories.length > 0 ? categories : ['creative', 'nature'],
    energyLevel,
    preferredMoods: [],
    requiredTags,
    preferredTags,
    avoidTags: [],
    reasoning: 'Fallback keyword-based analysis (LLM unavailable)',
    confidence: 0.5
  };
}

export default {
  analyzeVibeSemantically
};
