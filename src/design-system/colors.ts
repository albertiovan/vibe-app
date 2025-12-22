/**
 * Color System
 * Emotion-aware gradients and dynamic palettes
 */

export const colors = {
  // Base Layer (Always Present)
  base: {
    canvas: '#0A0E17',           // Deep charcoal navy
    surface: 'rgba(255,255,255,0.08)', // Translucent glass
    surfaceHover: 'rgba(255,255,255,0.12)',
  },

  // Text Hierarchy
  text: {
    primary: '#FFFFFF',
    secondary: 'rgba(255,255,255,0.6)',
    tertiary: 'rgba(255,255,255,0.4)',
    disabled: 'rgba(255,255,255,0.2)',
  },

  // Dynamic Gradient Overlays (Context-Aware)
  gradients: {
    morning: {
      start: '#FF6B6B', // Soft coral
      end: '#FFA94D',   // Amber
    },
    afternoon: {
      start: '#4ECDC4', // Cyan
      end: '#9B59B6',   // Violet
    },
    evening: {
      start: '#6C5CE7', // Deep purple
      end: '#FD79A8',   // Rose gold
    },
    night: {
      start: '#74B9FF', // Cool blue
      end: '#00B894',   // Teal
    },
  },

  // Accent Colors (Action & Feedback)
  accent: {
    primary: '#FF6B6B',       // Coral
    primaryGradient: {
      start: '#FF6B6B',
      end: '#FF8E53',
    },
    success: '#00D2A0',       // Soft mint
    warning: '#FFB142',       // Warm amber
    error: '#FF5252',         // Bright red
  },

  // AI Thinking Orb
  thinking: {
    gradient: {
      start: '#4ECDC4',       // Cyan
      end: '#9B59B6',         // Violet
    },
  },

  // Vibe State Colors
  vibeStates: {
    calm: {
      primary: '#74B9FF',
      gradient: { start: '#74B9FF', end: '#00B894' },
    },
    excited: {
      primary: '#FF6B6B',
      gradient: { start: '#FF6B6B', end: '#FFA94D' },
    },
    romantic: {
      primary: '#FD79A8',
      gradient: { start: '#6C5CE7', end: '#FD79A8' },
    },
    adventurous: {
      primary: '#FFA94D',
      gradient: { start: '#4ECDC4', end: '#FF8E53' },
    },
  },

  // Neutral colors for pre-vibe state (calm, non-directive)
  neutral: {
    primary: '#8B9DC3',      // Muted blue-grey for focus states
    surface: '#1A1F2E',      // Subtle surface
    border: '#2A3142',       // Subtle borders
    text: '#B8C5D6',         // Readable neutral text
  },

  // Category Colors (refined per UX spec - expressive but not neon)
  categories: {
    wellness: '#4ECDC4',       // Teal/soft-blue
    nature: '#00B894',         // Green
    culture: '#D4876F',        // Warm terracotta
    adventure: '#FF8E53',      // Orange
    culinary: '#FFB366',       // Warm apricot (food & drinks)
    water: '#4ECDC4',          // Cyan/blue
    nightlife: '#9B59B6',      // Purple
    social: '#FF6B9D',         // Pink/magenta
    fitness: '#00D2A0',        // Green/blue accent
    sports: '#74B9FF',         // Clear blue
    seasonal: '#6B8E7F',       // Evergreen/seasonal neutral
    romance: '#FD79A8',        // Pink
    mindfulness: '#A78BFA',    // Lavender/soft purple
    creative: '#C084FC',       // Playful purple/pink mix
  },

  // High-energy accent (reserved for Challenge Me)
  highEnergy: {
    primary: '#FFD93D',        // Warm yellow
    gradient: { start: '#FFD93D', end: '#FF8E53' },
  },
} as const;

/**
 * Get gradient for current time of day
 */
export function getTimeGradient(): { start: string; end: string } {
  const hour = new Date().getHours();
  
  if (hour >= 5 && hour < 12) return colors.gradients.morning;
  if (hour >= 12 && hour < 17) return colors.gradients.afternoon;
  if (hour >= 17 && hour < 22) return colors.gradients.evening;
  return colors.gradients.night;
}

/**
 * Get gradient for vibe state
 */
export function getVibeGradient(
  state: 'calm' | 'excited' | 'romantic' | 'adventurous'
): { start: string; end: string } {
  return colors.vibeStates[state].gradient;
}

/**
 * Get color for activity category
 */
export function getCategoryColor(category: string): string {
  return colors.categories[category as keyof typeof colors.categories] || colors.neutral.primary;
}

/**
 * Intelligently detect vibe from any text input
 */
export function detectVibeFromText(text: string): 'calm' | 'excited' | 'romantic' | 'adventurous' | null {
  if (!text) return null;
  
  const lowerText = text.toLowerCase();
  
  // Calm/Relaxed vibes
  const calmKeywords = ['calm', 'relax', 'peace', 'quiet', 'chill', 'zen', 'meditat', 'tranquil', 'serene', 'sooth', 'gentle', 'soft', 'slow', 'rest', 'unwind', 'comfort', 'cozy', 'mellow'];
  
  // Excited/Energetic vibes
  const excitedKeywords = ['excit', 'energy', 'pump', 'hype', 'party', 'fun', 'wild', 'crazy', 'intense', 'active', 'dynamic', 'vibrant', 'electric', 'thrill', 'rush', 'buzz', 'lively'];
  
  // Romantic vibes
  const romanticKeywords = ['romantic', 'love', 'date', 'intimate', 'cozy', 'candle', 'sunset', 'special', 'together', 'couple', 'passion', 'sweet', 'tender', 'warm', 'nostalg'];
  
  // Adventurous vibes
  const adventurousKeywords = ['adventur', 'explor', 'discover', 'new', 'challenge', 'bold', 'daring', 'outdoor', 'nature', 'hike', 'climb', 'journey', 'quest', 'wander', 'roam'];
  
  // Count matches for each category
  const scores = {
    calm: calmKeywords.filter(k => lowerText.includes(k)).length,
    excited: excitedKeywords.filter(k => lowerText.includes(k)).length,
    romantic: romanticKeywords.filter(k => lowerText.includes(k)).length,
    adventurous: adventurousKeywords.filter(k => lowerText.includes(k)).length,
  };
  
  // Find highest score
  const maxScore = Math.max(...Object.values(scores));
  if (maxScore === 0) {
    // No keywords matched - use sentiment analysis
    // Nostalgic, reflective, thoughtful -> romantic
    if (lowerText.match(/nostalg|memory|remember|past|old|vintage|classic|tradition/)) return 'romantic';
    // Creative, artistic, cultural -> calm
    if (lowerText.match(/creat|art|cultur|music|paint|draw|write|read/)) return 'calm';
    // Social, friends, people -> excited
    if (lowerText.match(/friend|social|people|group|meet|gather|hang/)) return 'excited';
    // Default to calm for unknown vibes
    return 'calm';
  }
  
  // Return the vibe with highest score
  const vibeEntry = Object.entries(scores).find(([_, score]) => score === maxScore);
  return vibeEntry ? vibeEntry[0] as 'calm' | 'excited' | 'romantic' | 'adventurous' : null;
}

/**
 * Get gradient for vibe state with optional intensity
 */
export function getVibeColorPalette(
  vibe?: 'calm' | 'excited' | 'romantic' | 'adventurous',
  intensity: 'subtle' | 'medium' | 'strong' = 'medium'
): { primary: string; gradient: { start: string; end: string } } {
  if (!vibe) {
    // Pre-vibe: return neutral
    return {
      primary: colors.neutral.primary,
      gradient: { start: colors.neutral.surface, end: colors.neutral.border },
    };
  }

  const baseGradient = colors.vibeStates[vibe].gradient;
  
  // Adjust opacity based on intensity
  const opacityMap = { subtle: 0.1, medium: 0.3, strong: 0.6 };
  const opacity = opacityMap[intensity];
  
  return {
    primary: colors.vibeStates[vibe].primary,
    gradient: baseGradient,
  };
}

/**
 * Get neutral color (for pre-vibe state)
 */
export function getNeutralColor(type: 'primary' | 'surface' | 'border' | 'text' = 'primary'): string {
  return colors.neutral[type];
}

/**
 * Convert hex to rgba with opacity
 */
export function hexToRgba(hex: string, opacity: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
}

export type Colors = typeof colors;
