/**
 * GlassCard Component
 * Translucent surface with blur and border
 */

import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { BlurView } from 'expo-blur';
import { theme, blur, radius } from '../theme/tokens';

interface GlassCardProps {
  children: React.ReactNode;
  emphasis?: 'low' | 'high';
  style?: ViewStyle;
  testID?: string;
}

export const GlassCard: React.FC<GlassCardProps> = ({
  children,
  emphasis = 'low',
  style,
  testID,
}) => {
  const colors = theme.colors;
  // Reduced blur for more transparency like INSPO
  const blurIntensity = emphasis === 'high' ? 12 : 6;

  return (
    <View style={[styles.wrapper, style]} testID={testID}>
      <BlurView
        intensity={blurIntensity}
        tint="dark"
        style={[
          styles.blurContainer,
          {
            backgroundColor: emphasis === 'high' 
              ? 'rgba(0, 170, 255, 0.12)' // More visible for high emphasis
              : 'rgba(0, 170, 255, 0.06)', // Very transparent for low emphasis
            borderColor: emphasis === 'high'
              ? 'rgba(0, 217, 255, 0.25)' // Brighter cyan border
              : 'rgba(0, 217, 255, 0.15)', // Subtle cyan border
          },
        ]}
      >
        <View style={styles.content}>{children}</View>
      </BlurView>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    borderRadius: radius.xl,
    overflow: 'hidden',
  },
  blurContainer: {
    borderWidth: 1,
    borderRadius: radius.xl,
    overflow: 'hidden',
  },
  content: {
    padding: 16,
  },
});
