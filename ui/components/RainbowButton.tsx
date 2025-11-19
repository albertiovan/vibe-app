/**
 * RainbowButton Component
 * 
 * Animated button with rainbow gradient border and glow effect
 * React Native version using react-native-reanimated and expo-linear-gradient
 */

import React, { useEffect } from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle, TextStyle, View } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
  interpolate,
  interpolateColor,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';

interface RainbowButtonProps {
  children: string;
  onPress?: () => void;
  style?: ViewStyle;
  textStyle?: TextStyle;
  disabled?: boolean;
  speed?: number; // Animation speed in seconds
}

// Rainbow color palette (HSL converted to hex)
const RAINBOW_COLORS = [
  '#FF4D6D', // Red-pink (0° 100% 63%)
  '#C77DFF', // Purple (270° 100% 63%)
  '#4CC9F0', // Cyan (210° 100% 63%)
  '#4ECDC4', // Teal (195° 100% 63%)
  '#7FFF00', // Chartreuse (90° 100% 63%)
] as const;

export function RainbowButton({
  children,
  onPress,
  style,
  textStyle,
  disabled = false,
  speed = 2,
}: RainbowButtonProps) {
  const animationProgress = useSharedValue(0);

  useEffect(() => {
    // Infinite rainbow animation
    animationProgress.value = withRepeat(
      withTiming(1, {
        duration: speed * 1000,
        easing: Easing.linear,
      }),
      -1, // Infinite
      false
    );
  }, [speed]);

  // Animated gradient rotation
  const animatedGradientStyle = useAnimatedStyle(() => {
    // Rotate through rainbow colors
    const colorIndex = interpolate(
      animationProgress.value,
      [0, 0.2, 0.4, 0.6, 0.8, 1],
      [0, 1, 2, 3, 4, 0]
    );

    return {
      opacity: interpolate(
        animationProgress.value,
        [0, 0.5, 1],
        [0.8, 1, 0.8]
      ),
    };
  });

  // Animated glow effect
  const animatedGlowStyle = useAnimatedStyle(() => {
    const scale = interpolate(
      animationProgress.value,
      [0, 0.5, 1],
      [1, 1.1, 1]
    );

    const opacity = interpolate(
      animationProgress.value,
      [0, 0.5, 1],
      [0.6, 0.9, 0.6]
    );

    return {
      transform: [{ scale }],
      opacity,
    };
  });

  return (
    <View style={[styles.container, style]}>
      {/* Glow effect layer */}
      <Animated.View style={[styles.glowContainer, animatedGlowStyle]}>
        <BlurView intensity={20} style={styles.blur}>
          <LinearGradient
            colors={RAINBOW_COLORS}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.glow}
          />
        </BlurView>
      </Animated.View>

      {/* Main button with gradient border */}
      <TouchableOpacity
        onPress={onPress}
        disabled={disabled}
        activeOpacity={0.8}
        style={styles.button}
      >
        {/* Gradient border */}
        <Animated.View style={[styles.gradientBorder, animatedGradientStyle]}>
          <LinearGradient
            colors={RAINBOW_COLORS}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.gradient}
          />
        </Animated.View>

        {/* Inner button content */}
        <View style={styles.innerButton}>
          <Text style={[styles.text, textStyle, disabled && styles.disabledText]}>
            {children}
          </Text>
        </View>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  glowContainer: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    bottom: -8,
    left: 0,
    right: 0,
  },
  blur: {
    flex: 1,
    borderRadius: 16,
    overflow: 'hidden',
  },
  glow: {
    flex: 1,
    opacity: 0.6,
  },
  button: {
    position: 'relative',
    borderRadius: 16,
    overflow: 'hidden',
  },
  gradientBorder: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 16,
    padding: 2, // Border width
  },
  gradient: {
    flex: 1,
    borderRadius: 16,
  },
  innerButton: {
    backgroundColor: '#121213', // Dark background
    borderRadius: 14, // Slightly smaller for border effect
    paddingHorizontal: 32,
    paddingVertical: 14,
    margin: 2, // Creates the border effect
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  disabledText: {
    opacity: 0.5,
  },
});
