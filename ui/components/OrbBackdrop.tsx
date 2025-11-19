/**
 * OrbBackdrop Component
 * Paints radial + linear gradients that emanate from the orb area
 */

import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { theme, ThemeVariant } from '../theme/tokens';

const { width, height } = Dimensions.get('window');

interface OrbBackdropProps {
  variant?: ThemeVariant;
}

export const OrbBackdrop: React.FC<OrbBackdropProps> = ({ variant = 'dark' }) => {
  const colors = theme.colors;
  
  if (variant === 'dark') {
    return (
      <View style={StyleSheet.absoluteFill}>
        {/* Deep black base like INSPO */}
        <View style={[StyleSheet.absoluteFill, { backgroundColor: '#000000' }]} />
        
        {/* Bright electric cyan core glow - enhanced */}
        <View style={styles.brightGlow}>
          <LinearGradient
            colors={[
              'rgba(0, 217, 255, 0.6)',  // Brighter cyan core
              'rgba(0, 170, 255, 0.35)', // Enhanced mid glow
              'rgba(0, 170, 255, 0.15)',  // Soft outer
              'transparent',
            ]}
            start={{ x: 0.5, y: 0 }}
            end={{ x: 0.5, y: 0.6 }}
            style={StyleSheet.absoluteFill}
          />
        </View>
        
        {/* Secondary glow layer - creates the halo effect */}
        <View style={styles.radialGlow}>
          <LinearGradient
            colors={[
              'rgba(0, 217, 255, 0.25)', // Brighter electric cyan
              'rgba(110, 231, 249, 0.12)', // Enhanced light cyan fade
              'rgba(0, 170, 255, 0.05)',
              'transparent',
            ]}
            start={{ x: 0.5, y: 0 }}
            end={{ x: 0.5, y: 0.8 }}
            style={StyleSheet.absoluteFill}
          />
        </View>
        
        {/* Bottom fade to pure black */}
        <View style={styles.bottomFade}>
          <LinearGradient
            colors={[
              'transparent',
              'rgba(0, 0, 0, 0.8)',
              '#000000',
            ]}
            start={{ x: 0.5, y: 0 }}
            end={{ x: 0.5, y: 1 }}
            style={StyleSheet.absoluteFill}
          />
        </View>
      </View>
    );
  }
  
  // Light variant
  return (
    <View style={StyleSheet.absoluteFill}>
      <LinearGradient
        colors={[colors.bg.light, '#E5F2FF', colors.bg.light]}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      
      <View style={styles.radialGlow}>
        <LinearGradient
          colors={[
            `${colors.gradient.primary.from}20`,
            `${colors.gradient.primary.to}10`,
            'transparent',
          ]}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 0.6 }}
          style={StyleSheet.absoluteFill}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  brightGlow: {
    position: 'absolute',
    top: -height * 0.1,
    left: -width * 0.25,
    right: -width * 0.25,
    height: height * 0.6,
  },
  radialGlow: {
    position: 'absolute',
    top: -height * 0.2,
    left: -width * 0.35,
    right: -width * 0.35,
    height: height * 0.75,
  },
  bottomFade: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: height * 0.5,
  },
});
