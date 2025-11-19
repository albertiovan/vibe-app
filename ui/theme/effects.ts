/**
 * Effects & Radii
 * Blur values, border radii, and shadow definitions
 */

export const blur = {
  sm: 12,
  md: 20,
  lg: 28,
} as const;

export const radius = {
  xl: 20,
  '2xl': 28,
} as const;

export interface ShadowStyle {
  shadowColor: string;
  shadowOffset: { width: number; height: number };
  shadowOpacity: number;
  shadowRadius: number;
  elevation?: number; // For Android
}

/**
 * Soft glow effect matching primary gradient
 */
export const shadowGlow: ShadowStyle = {
  shadowColor: '#0EA5E9',
  shadowOffset: { width: 0, height: 0 },
  shadowOpacity: 0.4,
  shadowRadius: 20,
  elevation: 8,
};

/**
 * Subtle card shadow
 */
export const shadowCard: ShadowStyle = {
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 4 },
  shadowOpacity: 0.15,
  shadowRadius: 12,
  elevation: 4,
};

/**
 * Pressed state shadow (reduced)
 */
export const shadowPressed: ShadowStyle = {
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 1 },
  shadowOpacity: 0.1,
  shadowRadius: 4,
  elevation: 2,
};
