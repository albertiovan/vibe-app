/**
 * Vibe Context for React Native
 * Manages current vibe state across the app
 * Tracks user's selected vibe and provides vibe-to-color mapping
 */

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { getVibeColorPalette, detectVibeFromText } from '../design-system/colors';

export type VibeState = 'calm' | 'excited' | 'romantic' | 'adventurous' | null;

interface VibeContextType {
  currentVibe: VibeState;
  setVibe: (vibe: VibeState) => void;
  setVibeFromText: (text: string) => void;
  clearVibe: () => void;
  getVibeColors: () => { primary: string; gradient: { start: string; end: string } } | null;
}

const VibeContext = createContext<VibeContextType | undefined>(undefined);

export const VibeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentVibe, setCurrentVibe] = useState<VibeState>(null);

  const setVibe = (vibe: VibeState) => {
    setCurrentVibe(vibe);
  };

  const setVibeFromText = (text: string) => {
    const detectedVibe = detectVibeFromText(text);
    setCurrentVibe(detectedVibe);
    console.log('🎨 Detected vibe from text:', text, '→', detectedVibe);
  };

  const clearVibe = () => {
    setCurrentVibe(null);
  };

  const getVibeColors = () => {
    if (!currentVibe) return null;
    return getVibeColorPalette(currentVibe);
  };

  return (
    <VibeContext.Provider value={{ currentVibe, setVibe, setVibeFromText, clearVibe, getVibeColors }}>
      {children}
    </VibeContext.Provider>
  );
};

export const useVibe = (): VibeContextType => {
  const context = useContext(VibeContext);
  if (!context) {
    throw new Error('useVibe must be used within a VibeProvider');
  }
  return context;
};
