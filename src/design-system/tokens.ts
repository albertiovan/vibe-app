/**
 * Design System Tokens
 * Following the new "Liquid Realism" design direction
 */

export const tokens = {
  // Spacing (8px base grid)
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
    xxxl: 64,
  },

  // Border Radius (Progressive roundness)
  radius: {
    sm: 16,  // Chips/Badges (pill-like)
    md: 24,  // Cards (soft, inviting)
    lg: 32,  // Modals (immersive sheets)
    xl: 28,  // Bottom sheets (top corners only)
  },

  // Typography
  typography: {
    // Font families
    fontFamily: {
      display: 'SF Pro Rounded',
      body: 'SF Pro Text',
      fallback: 'System',
    },

    // Font sizes
    fontSize: {
      xs: 13,
      sm: 15,
      md: 17,
      lg: 22,
      xl: 28,
      xxl: 34,
    },

    // Font weights
    fontWeight: {
      regular: '400' as const,
      medium: '500' as const,
      semibold: '600' as const,
      bold: '700' as const,
    },

    // Line heights
    lineHeight: {
      tight: 1.2,
      normal: 1.5,
      relaxed: 1.75,
    },

    // Letter spacing
    letterSpacing: {
      tight: -0.02,
      normal: 0,
      wide: 0.03,
    },
  },

  // Animation durations
  animation: {
    fast: 200,
    medium: 400,
    slow: 600,
    breathe: 2000, // For thinking orb
  },

  // Z-index layers
  zIndex: {
    base: 0,
    cards: 10,
    overlay: 20,
    modal: 30,
    toast: 40,
  },

  // Shadows (subtle depth)
  shadow: {
    sm: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 2,
    },
    md: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15,
      shadowRadius: 8,
      elevation: 4,
    },
    lg: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.2,
      shadowRadius: 16,
      elevation: 8,
    },
  },
} as const;

export type Tokens = typeof tokens;
