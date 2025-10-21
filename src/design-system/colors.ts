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

  // Category Colors (matches backend categories)
  categories: {
    wellness: '#00D2A0',
    nature: '#00B894',
    culture: '#9B59B6',
    adventure: '#FF8E53',
    learning: '#74B9FF',
    culinary: '#FFA94D',
    water: '#4ECDC4',
    nightlife: '#FD79A8',
    social: '#FF6B6B',
    fitness: '#00D2A0',
    sports: '#FF8E53',
    seasonal: '#6C5CE7',
    romance: '#FD79A8',
    mindfulness: '#74B9FF',
    creative: '#9B59B6',
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
  return colors.categories[category as keyof typeof colors.categories] || colors.accent.primary;
}

export type Colors = typeof colors;
