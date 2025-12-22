/**
 * AnimatedGradientBackground Component (React Native)
 * Slow-moving gradient background for Challenge Me screen
 * Creates immersive moment without being distracting
 */

import React, { useEffect } from 'react';
import { StyleSheet, ViewStyle } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
  Easing,
  interpolateColor,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';

interface AnimatedGradientBackgroundProps {
  colors: readonly [string, string, ...string[]]; // At least 2 colors required
  duration?: number; // Duration of one full cycle
  style?: ViewStyle;
  children?: React.ReactNode;
}

export const AnimatedGradientBackground: React.FC<AnimatedGradientBackgroundProps> = ({
  colors: colorArray,
  duration = 8000,
  style,
  children,
}) => {
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withRepeat(
      withSequence(
        withTiming(1, { duration: duration / 2, easing: Easing.inOut(Easing.ease) }),
        withTiming(0, { duration: duration / 2, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      false
    );
  }, [duration]);

  const animatedStyle = useAnimatedStyle(() => {
    // Subtle scale pulse for breathing effect (no rotation to avoid black edges)
    const scale = 1 + (progress.value * 0.05); // Gentle 5% scale variation
    
    return {
      opacity: 1,
      transform: [{ scale }],
    };
  });

  return (
    <Animated.View style={[StyleSheet.absoluteFill, animatedStyle, style]}>
      <LinearGradient
        colors={colorArray}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      >
        {children}
      </LinearGradient>
    </Animated.View>
  );
};
