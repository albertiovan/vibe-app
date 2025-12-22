/**
 * Theme Context for React Native
 * Provides light/dark/system theme switching
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type ThemeMode = 'light' | 'dark' | 'system';
export type ResolvedTheme = 'light' | 'dark';

interface ThemeColors {
  background: string;
  surface: string;
  text: {
    primary: string;
    secondary: string;
    tertiary: string;
    onGlass: {
      primary: string;
      secondary: string;
      tertiary: string;
    };
  };
  accent: {
    primary: string;
    secondary: string;
  };
  border: string;
}

interface ThemeContextType {
  theme: ThemeMode;
  resolvedTheme: ResolvedTheme;
  colors: ThemeColors;
  setTheme: (theme: ThemeMode) => void;
}

const lightColors: ThemeColors = {
  background: '#F5F5F7', // Subtle warm gray gradient base
  surface: 'rgba(0, 0, 0, 0.05)',
  text: {
    primary: '#0B1220',
    secondary: '#1E3A5F',
    tertiary: '#4B6B94',
    onGlass: {
      primary: '#0B1220',
      secondary: '#1E3A5F',
      tertiary: '#4B6B94',
    },
  },
  accent: {
    primary: '#0EA5E9',
    secondary: '#6EE7F9',
  },
  border: 'rgba(0, 0, 0, 0.1)',
};

const darkColors: ThemeColors = {
  background: '#000000', // Pure black, no blue tone
  surface: 'rgba(255, 255, 255, 0.05)',
  text: {
    primary: '#FFFFFF',
    secondary: 'rgba(255, 255, 255, 0.7)',
    tertiary: 'rgba(255, 255, 255, 0.5)',
    onGlass: {
      primary: '#FFFFFF',
      secondary: 'rgba(255, 255, 255, 0.8)',
      tertiary: 'rgba(255, 255, 255, 0.6)',
    },
  },
  accent: {
    primary: '#00D9FF',
    secondary: '#6EE7F9',
  },
  border: 'rgba(255, 255, 255, 0.1)',
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const THEME_STORAGE_KEY = '@vibe_theme_preference';

export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const systemColorScheme = useColorScheme();
  const [theme, setThemeState] = useState<ThemeMode>('dark'); // Default to dark
  const [resolvedTheme, setResolvedTheme] = useState<ResolvedTheme>('dark');

  // Load saved theme preference on mount
  useEffect(() => {
    loadThemePreference();
  }, []);

  // Update resolved theme when theme or system preference changes
  useEffect(() => {
    const resolved = theme === 'system' 
      ? (systemColorScheme || 'dark') as ResolvedTheme
      : theme as ResolvedTheme;
    setResolvedTheme(resolved);
  }, [theme, systemColorScheme]);

  // Get current theme colors
  const colors = resolvedTheme === 'light' ? lightColors : darkColors;

  const loadThemePreference = async () => {
    try {
      const savedTheme = await AsyncStorage.getItem(THEME_STORAGE_KEY);
      if (savedTheme && ['light', 'dark', 'system'].includes(savedTheme)) {
        setThemeState(savedTheme as ThemeMode);
      }
    } catch (error) {
      console.error('Failed to load theme preference:', error);
    }
  };

  const setTheme = async (newTheme: ThemeMode) => {
    try {
      setThemeState(newTheme);
      await AsyncStorage.setItem(THEME_STORAGE_KEY, newTheme);
    } catch (error) {
      console.error('Failed to save theme preference:', error);
    }
  };

  return (
    <ThemeContext.Provider value={{ theme, resolvedTheme, colors, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
