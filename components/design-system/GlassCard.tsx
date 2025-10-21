/**
 * GlassCard Component
 * Translucent card with blur effect - core building block
 */

import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { BlurView } from 'expo-blur';
import { tokens } from '../../src/design-system/tokens';
import { colors } from '../../src/design-system/colors';

interface GlassCardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  intensity?: number;
  padding?: keyof typeof tokens.spacing;
  radius?: keyof typeof tokens.radius;
}

export const GlassCard: React.FC<GlassCardProps> = ({
  children,
  style,
  intensity = 20,
  padding = 'lg',
  radius = 'md',
}) => {
  return (
    <BlurView
      intensity={intensity}
      tint="dark"
      style={[
        styles.container,
        {
          borderRadius: tokens.radius[radius],
          padding: tokens.spacing[padding],
        },
        style,
      ]}
    >
      <View style={styles.glassOverlay} />
      <View style={styles.content}>
        {children}
      </View>
    </BlurView>
  );
};

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
    backgroundColor: colors.base.surface,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    ...tokens.shadow.md,
  },
  glassOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255,255,255,0.02)',
  },
  content: {
    zIndex: 1,
  },
});
