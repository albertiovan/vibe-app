import React, { useEffect } from 'react';
import { StyleSheet, TextStyle } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  interpolateColor,
  Easing,
} from 'react-native-reanimated';

interface TextShimmerProps {
  children: string;
  style?: TextStyle;
  duration?: number;
  baseColor?: string;
  shimmerColor?: string;
}

export function TextShimmer({ 
  children, 
  style,
  duration = 3,
  baseColor = 'rgba(255, 255, 255, 0.7)',
  shimmerColor = 'rgba(253, 221, 16, 1.0)',
}: TextShimmerProps) {
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withRepeat(
      withSequence(
        withTiming(1, {
          duration: duration * 500,
          easing: Easing.inOut(Easing.ease),
        }),
        withTiming(0, {
          duration: duration * 500,
          easing: Easing.inOut(Easing.ease),
        })
      ),
      -1,
      false
    );
  }, [duration]);

  const animatedStyle = useAnimatedStyle(() => {
    const color = interpolateColor(
      progress.value,
      [0, 1],
      [baseColor, shimmerColor]
    );

    return {
      color,
    };
  });

  return (
    <Animated.Text style={[styles.text, style, animatedStyle]}>
      {children}
    </Animated.Text>
  );
}

const styles = StyleSheet.create({
  text: {
    fontSize: 16,
    fontWeight: '400',
  },
});
