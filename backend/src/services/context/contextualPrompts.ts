/**
 * Contextual Prompts Service
 * Generates time, weather, and location-aware AI prompts
 */

interface ContextualPromptOptions {
  timeOfDay: 'morning' | 'afternoon' | 'evening' | 'night';
  weather?: {
    condition: string;
    temperature: number;
  };
  location?: {
    city: string;
    isNewArea: boolean;
  };
  userHistory?: {
    lastActivityCategory?: string;
    favoriteCategories?: string[];
  };
}

interface PromptVariation {
  greeting: string;
  suggestion: string;
  emoji: string;
}

export class ContextualPromptsService {
  /**
   * Generate a context-aware prompt based on multiple factors
   */
  static generatePrompt(options: ContextualPromptOptions): PromptVariation {
    const { timeOfDay, weather, location, userHistory } = options;

    // Priority 1: New location
    if (location?.isNewArea) {
      return {
        greeting: `You're in ${location.city}!`,
        suggestion: "Want the local favorites or hidden gems?",
        emoji: "📍"
      };
    }

    // Priority 2: Weather-based
    if (weather) {
      const weatherPrompt = this.getWeatherPrompt(weather, timeOfDay);
      if (weatherPrompt) return weatherPrompt;
    }

    // Priority 3: Time-based
    return this.getTimeBasedPrompt(timeOfDay, userHistory);
  }

  /**
   * Get weather-aware prompts
   */
  private static getWeatherPrompt(
    weather: { condition: string; temperature: number },
    timeOfDay: string
  ): PromptVariation | null {
    const { condition, temperature } = weather;

    // Rainy weather
    if (condition.toLowerCase().includes('rain')) {
      return {
        greeting: "It's a bit gray out.",
        suggestion: "Cozy café or indoor adventure?",
        emoji: "🌧️"
      };
    }

    // Very hot weather
    if (temperature > 30) {
      return {
        greeting: "It's pretty warm today!",
        suggestion: "Pool, ice cream, or air-conditioned culture?",
        emoji: "☀️"
      };
    }

    // Cold weather
    if (temperature < 5) {
      return {
        greeting: "Bundle up! It's chilly.",
        suggestion: "Warm café, indoor activities, or brave the cold?",
        emoji: "❄️"
      };
    }

    // Beautiful weather
    if (condition.toLowerCase().includes('clear') && temperature > 15 && temperature < 28) {
      return {
        greeting: "Perfect weather outside!",
        suggestion: "Get out there – park, terrace, or adventure?",
        emoji: "🌤️"
      };
    }

    return null;
  }

  /**
   * Get time-of-day prompts
   */
  private static getTimeBasedPrompt(
    timeOfDay: string,
    userHistory?: { lastActivityCategory?: string; favoriteCategories?: string[] }
  ): PromptVariation {
    switch (timeOfDay) {
      case 'morning':
        return {
          greeting: "Good morning!",
          suggestion: "Coffee and a walk, or jump into something active?",
          emoji: "☀️"
        };

      case 'afternoon':
        return {
          greeting: "How's your day going?",
          suggestion: "Quick break activity or plan something for tonight?",
          emoji: "🌞"
        };

      case 'evening':
        // Personalize if we know their preferences
        if (userHistory?.favoriteCategories?.includes('nightlife')) {
          return {
            greeting: "What's the vibe for tonight?",
            suggestion: "Out on the town or something chill?",
            emoji: "🌅"
          };
        }
        return {
          greeting: "What's the vibe for tonight?",
          suggestion: "Wind down or explore?",
          emoji: "🌅"
        };

      case 'night':
        return {
          greeting: "Still going strong!",
          suggestion: "Late-night food, drinks, or call it a night?",
          emoji: "🌙"
        };

      default:
        return {
          greeting: "What's your vibe?",
          suggestion: "Tell me how you're feeling, or just say 'surprise me'",
          emoji: "🌤️"
        };
    }
  }

  /**
   * Get suggested vibe chips based on context
   */
  static getSuggestedVibes(options: ContextualPromptOptions): string[] {
    const { timeOfDay, weather, userHistory } = options;
    const suggestions: string[] = [];

    // Weather-based suggestions
    if (weather?.condition.toLowerCase().includes('rain')) {
      suggestions.push('😌 Chill', '🎨 Creative', '🍷 Cozy');
    } else if (weather?.condition.toLowerCase().includes('clear')) {
      suggestions.push('🔥 High Energy', '🌅 Sunset', '🏔️ Adventure');
    }

    // Time-based suggestions
    if (timeOfDay === 'morning') {
      suggestions.push('☕ Coffee', '🏃 Active', '🧘 Mindful');
    } else if (timeOfDay === 'evening') {
      suggestions.push('🍷 Date Night', '🎭 Cultural', '🌃 Nightlife');
    }

    // User history-based (add favorites)
    if (userHistory?.favoriteCategories) {
      const categoryToVibe: Record<string, string> = {
        'culinary': '🍜 Foodie',
        'adventure': '⛰️ Adventure',
        'wellness': '🧘 Wellness',
        'social': '🎉 Social'
      };

      userHistory.favoriteCategories.forEach(cat => {
        const vibe = categoryToVibe[cat];
        if (vibe && !suggestions.includes(vibe)) {
          suggestions.push(vibe);
        }
      });
    }

    // Default vibes if none matched
    if (suggestions.length === 0) {
      return ['😌 Chill', '🔥 High Energy', '🌅 Sunset', '🎨 Creative'];
    }

    return suggestions.slice(0, 4); // Max 4 chips
  }

  /**
   * Determine time of day from hour
   */
  static getTimeOfDay(hour: number): 'morning' | 'afternoon' | 'evening' | 'night' {
    if (hour >= 5 && hour < 12) return 'morning';
    if (hour >= 12 && hour < 17) return 'afternoon';
    if (hour >= 17 && hour < 22) return 'evening';
    return 'night';
  }

  /**
   * Detect vibe state from user message sentiment
   */
  static detectVibeState(userMessage: string): 'calm' | 'excited' | 'romantic' | 'adventurous' {
    const message = userMessage.toLowerCase();

    // Romantic indicators
    if (/(date|romantic|couple|partner|anniversary|intimate)/i.test(message)) {
      return 'romantic';
    }

    // Adventurous indicators
    if (/(adventure|exciting|thrill|adrenaline|explore|wild)/i.test(message)) {
      return 'adventurous';
    }

    // Excited indicators
    if (/(fun|party|social|friends|group|celebrate|energy)/i.test(message)) {
      return 'excited';
    }

    // Calm/chill indicators
    if (/(relax|chill|calm|peaceful|quiet|cozy|unwind)/i.test(message)) {
      return 'calm';
    }

    // Default
    return 'calm';
  }
}
