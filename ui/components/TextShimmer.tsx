/**
 * TextShimmer Component
 * 
 * Animated text with a shimmer/glow effect
 * React Native version using react-native-reanimated
 * 
 * Usage:
 * <TextShimmer duration={2}>
 *   Hello {firstName}, what's the vibe?
 * </TextShimmer>
 */

import React, { useEffect } from 'react';
import { Text, StyleSheet, TextStyle, View } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
  Easing,
  interpolate,
  interpolateColor,
} from 'react-native-reanimated';

interface TextShimmerProps {
  children: string;
  style?: TextStyle | TextStyle[];
  duration?: number; // Duration in seconds for one shimmer cycle
  baseColor?: string; // Base text color
  shimmerColor?: string; // Shimmer highlight color
}

export function TextShimmer({
  children,
  style,
  duration = 2,
  baseColor = '#a1a1aa',
  shimmerColor = '#ffffff',
}: TextShimmerProps) {
  const shimmerProgress = useSharedValue(0);

  useEffect(() => {
    // Animate shimmer effect infinitely
    shimmerProgress.value = withRepeat(
      withSequence(
        withTiming(1, {
          duration: duration * 1000,
          easing: Easing.inOut(Easing.ease),
        }),
        withTiming(0, {
          duration: duration * 1000,
          easing: Easing.inOut(Easing.ease),
        })
      ),
      -1, // Infinite repeat
      false
    );
  }, [duration]);

  const animatedTextStyle = useAnimatedStyle(() => {
    // Interpolate between base color and shimmer color
    const color = interpolateColor(
      shimmerProgress.value,
      [0, 0.5, 1],
      [baseColor, shimmerColor, baseColor]
    );

    // Add subtle scale effect
    const scale = interpolate(
      shimmerProgress.value,
      [0, 0.5, 1],
      [1, 1.02, 1]
    );

    return {
      color,
      transform: [{ scale }],
    };
  });

  return (
    <View style={styles.container}>
      <Animated.Text style={[styles.text, style, animatedTextStyle]}>
        {children}
      </Animated.Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontSize: 24,
    fontWeight: '600',
  },
});
