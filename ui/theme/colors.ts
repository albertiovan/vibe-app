/**
 * Color System
 * Maintains ≥ 4.5:1 contrast for text on glass surfaces
 */

export type ThemeVariant = 'dark' | 'light';

export interface ColorTokens {
  bg: {
    dark: string;
    light: string;
  };
  fg: {
    primary: string;
    secondary: string;
    tertiary: string;
  };
  gradient: {
    primary: {
      from: string;
      to: string;
    };
    accent: {
      from: string;
      to: string;
    };
  };
  glass: {
    surface: string;
    border: string;
    pressed: string;
  };
  muted: string;
  // New: Electric glow colors from INSPO
  glow?: {
    bright: string;  // Core glow
    medium: string;  // Mid-range glow
    soft: string;    // Outer halo
  };
}

export const darkColors: ColorTokens = {
  bg: {
    dark: '#000000', // Deep black like INSPO
    light: '#F2F7FF',
  },
  fg: {
    primary: '#FFFFFF', // Pure white at 90-95% opacity (applied in components)
    secondary: 'rgba(255, 255, 255, 0.7)', // 70% opacity for secondary text
    tertiary: 'rgba(255, 255, 255, 0.5)', // 50% opacity for tertiary text
  },
  gradient: {
    primary: {
      from: '#00AAFF', // Electric cyan from INSPO
      to: '#00D9FF',   // Bright cyan
    },
    accent: {
      from: '#00D9FF', // Cyan accent
      to: '#6EE7F9',   // Light cyan
    },
  },
  glass: {
    surface: 'rgba(0, 170, 255, 0.08)', // Cyan-tinted glass, more transparent
    border: 'rgba(0, 217, 255, 0.15)',  // Cyan border, subtle
    pressed: 'rgba(0, 170, 255, 0.15)', // Slightly more visible on press
  },
  muted: 'rgba(255, 255, 255, 0.4)', // Muted text at 40% opacity
};

export const lightColors: ColorTokens = {
  bg: {
    dark: '#0A0F1F',
    light: '#F2F7FF',
  },
  fg: {
    primary: '#0B1220', // on light
    secondary: '#1E3A5F',
    tertiary: '#4B6B94',
  },
  gradient: {
    primary: {
      from: '#0EA5E9',
      to: '#80D0FF',
    },
    accent: {
      from: '#6EE7F9',
      to: '#A7F3D0',
    },
  },
  glass: {
    surface: 'rgba(10, 15, 31, 0.14)',
    border: 'rgba(10, 15, 31, 0.22)',
    pressed: 'rgba(10, 15, 31, 0.22)',
  },
  muted: '#88A2C8',
};

/**
 * Get colors for current theme
 */
export const getColors = (variant: ThemeVariant = 'dark'): ColorTokens => {
  return variant === 'dark' ? darkColors : lightColors;
};

/**
 * Utility to create rgba color with custom opacity
 */
export const withOpacity = (color: string, opacity: number): string => {
  // Handle hex colors
  if (color.startsWith('#')) {
    const hex = color.replace('#', '');
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
  }
  // Handle rgba - replace opacity
  if (color.startsWith('rgba')) {
    return color.replace(/[\d.]+\)$/g, `${opacity})`);
  }
  return color;
};
