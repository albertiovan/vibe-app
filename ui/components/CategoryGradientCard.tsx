/**
 * CategoryGradientCard Component
 * Activity card with subtle category-colored gradient aura
 * Maintains neutral surface for readability with category accent
 */

import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { getCategoryColor, hexToRgba } from '../../src/design-system/colors';
import { tokens } from '../../src/design-system/tokens';

interface CategoryGradientCardProps {
  category?: string;
  children: React.ReactNode;
  style?: ViewStyle;
  borderRadius?: number;
  intensity?: 'subtle' | 'medium' | 'strong'; // How prominent the category color is
}

export const CategoryGradientCard: React.FC<CategoryGradientCardProps> = ({
  category,
  children,
  style,
  borderRadius = tokens.radius.md,
  intensity = 'subtle',
}) => {
  const categoryColor = category ? getCategoryColor(category) : '#8B9DC3';
  
  // Intensity mapping for gradient opacity
  const intensityMap = {
    subtle: 0.08,
    medium: 0.15,
    strong: 0.25,
  };
  const opacity = intensityMap[intensity];

  return (
    <View style={[styles.container, style]}>
      {/* Category gradient aura - more subtle */}
      <LinearGradient
        colors={[
          categoryColor + '00',
          categoryColor + '15',
          categoryColor + '00',
        ]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[
          StyleSheet.absoluteFill,
          {
            borderRadius,
          },
        ]}
      />

      {/* Content */}
      <View style={styles.content}>
        {children}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    overflow: 'hidden',
  },
  gradientLayer: {
    ...StyleSheet.absoluteFillObject,
  },
  blurLayer: {
    ...StyleSheet.absoluteFillObject,
  },
  surfaceLayer: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(10, 15, 31, 0.6)', // Semi-transparent dark surface
  },
  border: {
    ...StyleSheet.absoluteFillObject,
    borderWidth: 1,
    backgroundColor: 'transparent',
  },
  content: {
    flex: 1,
    padding: tokens.spacing.md,
  },
});
