/**
 * LoadingShimmer Component
 * 
 * Animated loading text with wave shimmer effect
 * React Native version using react-native-reanimated
 */

import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  withDelay,
  Easing,
  interpolateColor,
  interpolate,
} from 'react-native-reanimated';

interface LoadingShimmerProps {
  text?: string;
  style?: any;
}

export function LoadingShimmer({
  text = 'Matching your vibe...',
  style,
}: LoadingShimmerProps) {
  const chars = text.split('');

  return (
    <View style={[styles.container, style]}>
      {chars.map((char, index) => (
        <AnimatedChar
          key={index}
          char={char}
          index={index}
          totalChars={chars.length}
        />
      ))}
    </View>
  );
}

interface AnimatedCharProps {
  char: string;
  index: number;
  totalChars: number;
}

function AnimatedChar({ char, index, totalChars }: AnimatedCharProps) {
  const progress = useSharedValue(0);

  useEffect(() => {
    const delay = (index / totalChars) * 300; // Stagger animation
    
    progress.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(1, { duration: 800, easing: Easing.inOut(Easing.ease) }),
          withTiming(0, { duration: 800, easing: Easing.inOut(Easing.ease) })
        ),
        -1, // Infinite
        false
      )
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => {
    // Color animation from gray to white
    const color = interpolateColor(
      progress.value,
      [0, 0.5, 1],
      ['rgba(255, 255, 255, 0.4)', 'rgba(255, 255, 255, 1)', 'rgba(255, 255, 255, 0.4)']
    );

    // Subtle scale animation
    const scale = interpolate(
      progress.value,
      [0, 0.5, 1],
      [1, 1.05, 1]
    );

    // Subtle vertical movement
    const translateY = interpolate(
      progress.value,
      [0, 0.5, 1],
      [0, -2, 0]
    );

    return {
      color,
      transform: [{ scale }, { translateY }],
    };
  });

  return (
    <Animated.Text style={[styles.char, animatedStyle]}>
      {char}
    </Animated.Text>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  char: {
    fontSize: 16,
    fontWeight: '400',
    color: 'rgba(255, 255, 255, 0.6)',
  },
});
