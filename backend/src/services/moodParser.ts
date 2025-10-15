import { Mood, ActivityCategory, MoodAnalysis } from '../types';

// Rule-based mood parsing v1 - maps vibe text to mood and activity categories
export class MoodParser {
  private moodKeywords: Record<Mood, string[]> = {
    adventurous: ['adventure', 'exciting', 'thrill', 'explore', 'discover', 'wild', 'bold', 'daring', 'extreme'],
    relaxed: ['chill', 'calm', 'peaceful', 'quiet', 'serene', 'tranquil', 'laid-back', 'easy', 'slow'],
    social: ['friends', 'people', 'party', 'group', 'together', 'social', 'meet', 'crowd', 'community'],
    creative: ['art', 'creative', 'artistic', 'craft', 'design', 'paint', 'music', 'write', 'express'],
    energetic: ['energy', 'active', 'dynamic', 'vibrant', 'lively', 'pumped', 'intense', 'high-energy'],
    contemplative: ['think', 'reflect', 'meditate', 'ponder', 'quiet', 'introspective', 'mindful', 'zen'],
    romantic: ['romantic', 'intimate', 'cozy', 'date', 'couple', 'love', 'sweet', 'charming', 'tender'],
    curious: ['learn', 'discover', 'explore', 'curious', 'interesting', 'knowledge', 'new', 'wonder'],
    playful: ['fun', 'playful', 'silly', 'games', 'laugh', 'joy', 'amusing', 'entertaining', 'lighthearted'],
    peaceful: ['peace', 'harmony', 'balance', 'stillness', 'gentle', 'soft', 'soothing', 'restful']
  };

  private categoryMappings: Record<Mood, ActivityCategory[]> = {
    adventurous: ['outdoor', 'adventure', 'entertainment'],
    relaxed: ['wellness', 'relaxation', 'indoor'],
    social: ['social', 'entertainment', 'food'],
    creative: ['creative', 'cultural', 'indoor'],
    energetic: ['outdoor', 'adventure', 'entertainment'],
    contemplative: ['cultural', 'wellness', 'relaxation'],
    romantic: ['food', 'cultural', 'relaxation'],
    curious: ['cultural', 'indoor', 'creative'],
    playful: ['entertainment', 'social', 'outdoor'],
    peaceful: ['wellness', 'relaxation', 'outdoor']
  };

  private activityTags: Record<ActivityCategory, string[]> = {
    outdoor: ['hiking', 'park', 'nature', 'walking', 'cycling', 'sports', 'garden', 'beach'],
    indoor: ['museum', 'gallery', 'shopping', 'cinema', 'theater', 'library', 'cafe'],
    cultural: ['museum', 'gallery', 'theater', 'concert', 'exhibition', 'historic', 'art'],
    food: ['restaurant', 'cafe', 'bar', 'dining', 'cuisine', 'cooking', 'wine', 'coffee'],
    entertainment: ['cinema', 'theater', 'concert', 'show', 'games', 'bowling', 'karaoke'],
    wellness: ['spa', 'massage', 'yoga', 'meditation', 'fitness', 'health', 'relaxation'],
    adventure: ['climbing', 'hiking', 'extreme', 'sports', 'outdoor', 'adrenaline'],
    social: ['bar', 'club', 'event', 'gathering', 'party', 'meetup', 'community'],
    creative: ['workshop', 'art', 'craft', 'music', 'writing', 'design', 'pottery'],
    relaxation: ['spa', 'park', 'quiet', 'peaceful', 'calm', 'meditation', 'reading']
  };

  public parseMood(vibeText: string): MoodAnalysis {
    const normalizedText = vibeText.toLowerCase().trim();
    const words = normalizedText.split(/\s+/);
    
    // Score each mood based on keyword matches
    const moodScores: Record<Mood, number> = {
      adventurous: 0, relaxed: 0, social: 0, creative: 0, energetic: 0,
      contemplative: 0, romantic: 0, curious: 0, playful: 0, peaceful: 0
    };

    // Calculate mood scores
    Object.entries(this.moodKeywords).forEach(([mood, keywords]) => {
      keywords.forEach(keyword => {
        if (normalizedText.includes(keyword)) {
          moodScores[mood as Mood] += 1;
          // Bonus for exact word matches
          if (words.includes(keyword)) {
            moodScores[mood as Mood] += 0.5;
          }
        }
      });
    });

    // Handle common phrases and sentiment
    this.applyContextualRules(normalizedText, moodScores);

    // Sort moods by score
    const sortedMoods = Object.entries(moodScores)
      .sort(([, a], [, b]) => b - a)
      .filter(([, score]) => score > 0);

    // Default to curious if no matches
    if (sortedMoods.length === 0) {
      sortedMoods.push(['curious', 1]);
    }

    const primaryMood = sortedMoods[0]![0] as Mood;
    const secondaryMoods = sortedMoods.slice(1, 3).map(([mood]) => mood as Mood);
    
    // Get suggested categories based on primary and secondary moods
    const suggestedCategories = this.getSuggestedCategories(primaryMood, secondaryMoods);
    
    // Get suggested tags
    const suggestedTags = this.getSuggestedTags(suggestedCategories, normalizedText);
    
    // Calculate confidence based on score strength
    const maxScore = Math.max(...Object.values(moodScores));
    const confidence = Math.min(maxScore / 3, 1); // Normalize to 0-1

    return {
      primaryMood,
      secondaryMoods,
      suggestedCategories,
      suggestedTags,
      confidence
    };
  }

  private applyContextualRules(text: string, scores: Record<Mood, number>): void {
    // Common phrases and their mood implications
    const contextRules = [
      { pattern: /feel like.*adventure/i, mood: 'adventurous', boost: 2 },
      { pattern: /want.*relax/i, mood: 'relaxed', boost: 2 },
      { pattern: /hang out|meet people/i, mood: 'social', boost: 2 },
      { pattern: /something.*creative/i, mood: 'creative', boost: 2 },
      { pattern: /high energy|pumped up/i, mood: 'energetic', boost: 2 },
      { pattern: /need.*peace/i, mood: 'peaceful', boost: 2 },
      { pattern: /romantic.*evening/i, mood: 'romantic', boost: 2 },
      { pattern: /learn.*new/i, mood: 'curious', boost: 2 },
      { pattern: /have.*fun/i, mood: 'playful', boost: 2 },
      { pattern: /quiet.*time/i, mood: 'contemplative', boost: 2 }
    ];

    contextRules.forEach(rule => {
      if (rule.pattern.test(text)) {
        scores[rule.mood as Mood] += rule.boost;
      }
    });
  }

  private getSuggestedCategories(primary: Mood, secondary: Mood[]): ActivityCategory[] {
    const categories = new Set<ActivityCategory>();
    
    // Add categories from primary mood
    this.categoryMappings[primary]?.forEach(cat => categories.add(cat));
    
    // Add categories from secondary moods
    secondary.forEach(mood => {
      this.categoryMappings[mood]?.slice(0, 2).forEach(cat => categories.add(cat));
    });

    return Array.from(categories).slice(0, 5); // Limit to 5 categories
  }

  private getSuggestedTags(categories: ActivityCategory[], text: string): string[] {
    const tags = new Set<string>();
    
    // Add tags based on categories
    categories.forEach(category => {
      this.activityTags[category]?.slice(0, 3).forEach(tag => tags.add(tag));
    });

    // Add specific tags mentioned in text
    const words = text.split(/\s+/);
    Object.values(this.activityTags).flat().forEach(tag => {
      if (words.some(word => word.includes(tag) || tag.includes(word))) {
        tags.add(tag);
      }
    });

    return Array.from(tags).slice(0, 8); // Limit to 8 tags
  }
}
