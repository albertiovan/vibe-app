/**
 * Romanian Vibe Analyzer
 * Semantic analysis for Romanian language vibes
 * Maps Romanian expressions to activity categories and tags
 */

interface RomanianVibeAnalysis {
  primaryIntent: string;
  suggestedCategories: string[];
  energyLevel: 'low' | 'medium' | 'high';
  preferredTags: string[];
  requiredTags: string[];
  avoidTags: string[];
  confidence: number;
  keywordPrefer?: string[];
  keywordAvoid?: string[];
}

// Romanian vibe lexicon - maps Romanian expressions to categories
const ROMANIAN_VIBE_LEXICON: Record<string, { categories: string[]; tags: string[]; energy: string }> = {
  // Adventure & Adrenaline
  'aventura': { categories: ['adventure'], tags: ['mood:adrenaline', 'energy:high'], energy: 'high' },
  'adrenalina': { categories: ['adventure', 'sports'], tags: ['mood:adrenaline', 'energy:high'], energy: 'high' },
  'extrem': { categories: ['adventure', 'sports'], tags: ['mood:adrenaline', 'experience_level:advanced'], energy: 'high' },
  'provocare': { categories: ['adventure', 'sports'], tags: ['mood:adrenaline', 'energy:high'], energy: 'high' },
  
  // Relaxation & Wellness
  'relaxare': { categories: ['wellness', 'mindfulness'], tags: ['mood:relaxed', 'energy:low'], energy: 'low' },
  'liniste': { categories: ['wellness', 'mindfulness', 'nature'], tags: ['mood:mindful', 'energy:low'], energy: 'low' },
  'spa': { categories: ['wellness'], tags: ['mood:relaxed', 'indoor_outdoor:indoor'], energy: 'low' },
  'meditatie': { categories: ['mindfulness', 'wellness'], tags: ['mood:mindful', 'energy:low'], energy: 'low' },
  'yoga': { categories: ['wellness', 'fitness'], tags: ['mood:mindful', 'energy:medium'], energy: 'medium' },
  
  // Nature & Outdoors
  'natura': { categories: ['nature'], tags: ['indoor_outdoor:outdoor', 'terrain:forest'], energy: 'medium' },
  'munte': { categories: ['nature', 'adventure'], tags: ['terrain:mountain', 'indoor_outdoor:outdoor'], energy: 'high' },
  'padure': { categories: ['nature'], tags: ['terrain:forest', 'indoor_outdoor:outdoor'], energy: 'medium' },
  'plimbare': { categories: ['nature', 'social'], tags: ['energy:low', 'indoor_outdoor:outdoor'], energy: 'low' },
  'drumetie': { categories: ['nature', 'adventure'], tags: ['terrain:mountain', 'energy:high'], energy: 'high' },
  'hiking': { categories: ['nature', 'adventure'], tags: ['terrain:mountain', 'energy:high'], energy: 'high' },
  
  // Culture & Learning
  'cultura': { categories: ['culture', 'learning'], tags: ['mood:explorer', 'indoor_outdoor:indoor'], energy: 'medium' },
  'muzeu': { categories: ['culture'], tags: ['mood:explorer', 'terrain:urban'], energy: 'low' },
  'arta': { categories: ['culture', 'creative'], tags: ['mood:creative', 'indoor_outdoor:indoor'], energy: 'medium' },
  'istorie': { categories: ['culture', 'learning'], tags: ['mood:explorer'], energy: 'low' },
  'invatare': { categories: ['learning'], tags: ['mood:explorer', 'indoor_outdoor:indoor'], energy: 'medium' },
  
  // Food & Culinary
  'mancare': { categories: ['culinary'], tags: ['mood:social', 'terrain:urban'], energy: 'medium' },
  'restaurant': { categories: ['culinary'], tags: ['mood:social', 'context:date'], energy: 'medium' },
  'gatit': { categories: ['culinary', 'learning'], tags: ['mood:creative', 'indoor_outdoor:indoor'], energy: 'medium' },
  'degustare': { categories: ['culinary'], tags: ['mood:explorer', 'context:small-group'], energy: 'low' },
  'vin': { categories: ['culinary'], tags: ['mood:cozy', 'context:date'], energy: 'low' },
  
  // Social & Nightlife
  'petrecere': { categories: ['nightlife', 'social'], tags: ['mood:social', 'energy:high', 'time_of_day:night'], energy: 'high' },
  'bar': { categories: ['nightlife', 'social'], tags: ['mood:social', 'terrain:urban'], energy: 'medium' },
  'club': { categories: ['nightlife'], tags: ['mood:social', 'energy:high', 'time_of_day:night'], energy: 'high' },
  'prieteni': { categories: ['social'], tags: ['context:group', 'mood:social'], energy: 'medium' },
  'socializare': { categories: ['social'], tags: ['mood:social', 'context:group'], energy: 'medium' },
  
  // Romance & Date
  'romantic': { categories: ['romance', 'culinary'], tags: ['context:date', 'mood:romantic'], energy: 'low' },
  'intalnire': { categories: ['romance', 'social'], tags: ['context:date', 'mood:romantic'], energy: 'medium' },
  'cuplu': { categories: ['romance'], tags: ['context:date'], energy: 'medium' },
  
  // Sports & Fitness
  'sport': { categories: ['sports', 'fitness'], tags: ['energy:high', 'mood:adrenaline'], energy: 'high' },
  'fitness': { categories: ['fitness'], tags: ['energy:high', 'indoor_outdoor:indoor'], energy: 'high' },
  'alergare': { categories: ['fitness', 'sports'], tags: ['energy:high', 'indoor_outdoor:outdoor'], energy: 'high' },
  'ciclism': { categories: ['sports', 'nature'], tags: ['energy:high', 'indoor_outdoor:outdoor'], energy: 'high' },
  'inot': { categories: ['water', 'fitness'], tags: ['energy:medium', 'indoor_outdoor:either'], energy: 'medium' },
  
  // Creative & Arts
  'creativ': { categories: ['creative'], tags: ['mood:creative', 'indoor_outdoor:indoor'], energy: 'medium' },
  'pictura': { categories: ['creative'], tags: ['mood:creative', 'skills:technique'], energy: 'low' },
  'muzica': { categories: ['creative', 'culture'], tags: ['mood:creative'], energy: 'medium' },
  'dans': { categories: ['creative', 'fitness'], tags: ['mood:social', 'energy:high'], energy: 'high' },
  
  // Water Activities
  'apa': { categories: ['water'], tags: ['indoor_outdoor:outdoor', 'seasonality:summer'], energy: 'medium' },
  'plaja': { categories: ['water', 'nature'], tags: ['terrain:coast', 'seasonality:summer'], energy: 'low' },
  'lac': { categories: ['water', 'nature'], tags: ['terrain:lake', 'indoor_outdoor:outdoor'], energy: 'medium' },
  
  // Energy descriptors
  'obosit': { categories: ['wellness', 'mindfulness'], tags: ['energy:low', 'mood:relaxed'], energy: 'low' },
  'energic': { categories: ['sports', 'adventure'], tags: ['energy:high', 'mood:adrenaline'], energy: 'high' },
  'calm': { categories: ['wellness', 'mindfulness'], tags: ['energy:low', 'mood:mindful'], energy: 'low' },
  'activ': { categories: ['sports', 'fitness'], tags: ['energy:high'], energy: 'high' },
  
  // Time/Context
  'seara': { categories: ['nightlife', 'culinary'], tags: ['time_of_day:evening'], energy: 'medium' },
  'weekend': { categories: ['nature', 'social'], tags: ['context:group'], energy: 'medium' },
  'dimineata': { categories: ['fitness', 'nature'], tags: ['time_of_day:morning'], energy: 'medium' },
};

// Romanian keywords for specific activities
const ROMANIAN_KEYWORDS: Record<string, string[]> = {
  'citit': ['biblioteca', 'librarie', 'carte'],
  'carte': ['biblioteca', 'librarie', 'citit'],
  'cafea': ['cafenea', 'coffee', 'espresso'],
  'bere': ['berarie', 'pub', 'craft beer'],
  'vin': ['cramă', 'degustare', 'wine'],
  'schi': ['partie', 'teleschi', 'ski'],
  'snowboard': ['partie', 'teleschi', 'snow'],
};

/**
 * Analyze Romanian vibe text and extract semantic meaning
 */
export async function analyzeRomanianVibe(
  vibe: string,
  context?: { timeOfDay?: string }
): Promise<RomanianVibeAnalysis> {
  const vibeLower = vibe.toLowerCase();
  
  // Initialize analysis
  const analysis: RomanianVibeAnalysis = {
    primaryIntent: 'general',
    suggestedCategories: [],
    energyLevel: 'medium',
    preferredTags: [],
    requiredTags: [],
    avoidTags: [],
    confidence: 0,
    keywordPrefer: [],
    keywordAvoid: [],
  };
  
  let matchCount = 0;
  const energyVotes: string[] = [];
  const categorySet = new Set<string>();
  const tagSet = new Set<string>();
  
  // Check each lexicon entry
  for (const [keyword, data] of Object.entries(ROMANIAN_VIBE_LEXICON)) {
    if (vibeLower.includes(keyword)) {
      matchCount++;
      
      // Add categories
      data.categories.forEach(cat => categorySet.add(cat));
      
      // Add tags
      data.tags.forEach(tag => tagSet.add(tag));
      
      // Vote for energy level
      energyVotes.push(data.energy);
      
      // Set primary intent to first strong match
      if (analysis.primaryIntent === 'general' && data.categories.length > 0) {
        analysis.primaryIntent = data.categories[0];
      }
    }
  }
  
  // Check for keyword preferences
  for (const [trigger, keywords] of Object.entries(ROMANIAN_KEYWORDS)) {
    if (vibeLower.includes(trigger)) {
      analysis.keywordPrefer = keywords;
    }
  }
  
  // Determine energy level from votes
  if (energyVotes.length > 0) {
    const energyCounts = {
      low: energyVotes.filter(e => e === 'low').length,
      medium: energyVotes.filter(e => e === 'medium').length,
      high: energyVotes.filter(e => e === 'high').length,
    };
    
    if (energyCounts.high > energyCounts.medium && energyCounts.high > energyCounts.low) {
      analysis.energyLevel = 'high';
    } else if (energyCounts.low > energyCounts.medium && energyCounts.low > energyCounts.high) {
      analysis.energyLevel = 'low';
    } else {
      analysis.energyLevel = 'medium';
    }
  }
  
  // Convert sets to arrays
  analysis.suggestedCategories = Array.from(categorySet);
  analysis.preferredTags = Array.from(tagSet);
  
  // Build required tags (must-have filters)
  const requiredTagSet = new Set<string>();
  
  // Add category tags as required
  analysis.suggestedCategories.forEach(cat => {
    requiredTagSet.add(`category:${cat}`);
  });
  
  // Add energy tag
  requiredTagSet.add(`energy:${analysis.energyLevel}`);
  
  analysis.requiredTags = Array.from(requiredTagSet);
  
  // Calculate confidence
  if (matchCount === 0) {
    analysis.confidence = 0.3; // Low confidence for no matches
  } else if (matchCount === 1) {
    analysis.confidence = 0.6; // Medium confidence
  } else {
    analysis.confidence = 0.9; // High confidence for multiple matches
  }
  
  // Fallback to general exploration if no matches
  if (analysis.suggestedCategories.length === 0) {
    analysis.suggestedCategories = ['culture', 'social', 'nature'];
    analysis.primaryIntent = 'exploration';
  }
  
  return analysis;
}
