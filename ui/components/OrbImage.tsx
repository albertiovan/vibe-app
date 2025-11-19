/**
 * OrbImage Component
 * Displays orb asset with gradient fallback if missing
 */

import React, { useState } from 'react';
import { View, Image, StyleSheet, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { theme } from '../theme/tokens';

interface OrbImageProps {
  size?: number;
  style?: ViewStyle;
}

export const OrbImage: React.FC<OrbImageProps> = ({ size = 180, style }) => {
  const [imageError, setImageError] = useState(false);
  const colors = theme.colors;

  // Try to load the orb image, fallback to gradient if missing
  if (!imageError) {
    return (
      <View style={[styles.container, { width: size, height: size }, style]}>
        <Image
          source={require('../../assets/orb.png')}
          style={[styles.image, { width: size, height: size }]}
          resizeMode="contain"
          onError={() => setImageError(true)}
        />
      </View>
    );
  }

  // Fallback: CSS/SVG-style gradient orb
  return (
    <View style={[styles.container, { width: size, height: size }, style]}>
      {/* Outer glow */}
      <View style={[styles.glowOuter, { width: size, height: size }]}>
        <LinearGradient
          colors={[`${colors.gradient.primary.from}40`, 'transparent']}
          style={[StyleSheet.absoluteFill, { borderRadius: size / 2 }]}
        />
      </View>
      
      {/* Middle glow */}
      <View style={[styles.glowMiddle, { width: size * 0.85, height: size * 0.85 }]}>
        <LinearGradient
          colors={[`${colors.gradient.primary.from}60`, `${colors.gradient.primary.to}40`]}
          style={[StyleSheet.absoluteFill, { borderRadius: (size * 0.85) / 2 }]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        />
      </View>
      
      {/* Core orb */}
      <View style={[styles.core, { width: size * 0.7, height: size * 0.7 }]}>
        <LinearGradient
          colors={[colors.gradient.primary.to, colors.gradient.primary.from]}
          style={[StyleSheet.absoluteFill, { borderRadius: (size * 0.7) / 2 }]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        />
      </View>
      
      {/* Inner highlight */}
      <View style={[styles.highlight, { width: size * 0.3, height: size * 0.3, top: size * 0.15, left: size * 0.25 }]}>
        <LinearGradient
          colors={['rgba(255, 255, 255, 0.6)', 'transparent']}
          style={[StyleSheet.absoluteFill, { borderRadius: (size * 0.3) / 2 }]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    // Image styles
  },
  glowOuter: {
    position: 'absolute',
  },
  glowMiddle: {
    position: 'absolute',
  },
  core: {
    position: 'absolute',
  },
  highlight: {
    position: 'absolute',
  },
});
