/**
 * Design Tokens - Central Export
 * Single source of truth for all design tokens
 */

export * from './colors';
export * from './effects';
export * from './typography';

import { getColors, ThemeVariant } from './colors';
import { blur, radius, shadowGlow, shadowCard, shadowPressed } from './effects';
import { typography } from './typography';

/**
 * Main theme object combining all tokens
 */
export const createTheme = (variant: ThemeVariant = 'dark') => ({
  colors: getColors(variant),
  blur,
  radius,
  shadows: {
    glow: shadowGlow,
    card: shadowCard,
    pressed: shadowPressed,
  },
  typography,
  variant,
});

export type Theme = ReturnType<typeof createTheme>;

// Default export
export const theme = createTheme('dark');
