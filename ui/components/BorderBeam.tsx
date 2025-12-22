/**
 * BorderBeam Component
 * Animated border gradient effect for React Native
 * Creates a continuous glowing gradient that travels around the border
 * Uses 4 separate gradients (one per edge) for smooth continuous effect
 */

import React, { useEffect } from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
  interpolate,
  Extrapolation,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';

interface BorderBeamProps {
  children?: React.ReactNode;
  lightColor?: string;
  borderWidth?: number;
  duration?: number;
  borderRadius?: number;
  backgroundColor?: string;
  style?: ViewStyle;
}

export const BorderBeam: React.FC<BorderBeamProps> = ({
  children,
  lightColor = '#FFD93D',
  borderWidth = 2,
  duration = 8000,
  borderRadius = 20,
  backgroundColor = 'rgba(10, 14, 23, 0.95)',
  style,
}) => {
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withRepeat(
      withTiming(1, {
        duration,
        easing: Easing.linear,
      }),
      -1,
      false
    );
  }, [duration]);

  // Animate each edge with overlapping transitions for seamless loop
  // Top edge appears at both start and end to create smooth loop
  const topEdgeStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      progress.value,
      [0, 0.15, 0.25, 0.85, 0.95, 1],
      [0.8, 1, 0, 0, 0.8, 0.8],
      Extrapolation.CLAMP
    );
    return { opacity };
  });

  const rightEdgeStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      progress.value,
      [0.15, 0.25, 0.4, 0.5],
      [0, 0.8, 1, 0],
      Extrapolation.CLAMP
    );
    return { opacity };
  });

  const bottomEdgeStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      progress.value,
      [0.4, 0.5, 0.65, 0.75],
      [0, 0.8, 1, 0],
      Extrapolation.CLAMP
    );
    return { opacity };
  });

  const leftEdgeStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      progress.value,
      [0.65, 0.75, 0.9, 1],
      [0, 0.8, 1, 0.8],
      Extrapolation.CLAMP
    );
    return { opacity };
  });

  return (
    <View style={[styles.container, style]}>
      {/* Base border */}
      <View
        style={[
          StyleSheet.absoluteFill,
          {
            borderRadius,
            borderWidth: 1,
            borderColor: 'rgba(255, 255, 255, 0.1)',
          },
        ]}
      />

      {/* Top edge gradient */}
      <Animated.View
        style={[styles.topEdge, { borderTopLeftRadius: borderRadius, borderTopRightRadius: borderRadius }, topEdgeStyle]}
        pointerEvents="none"
      >
        <LinearGradient
          colors={['transparent', lightColor + 'FF', 'transparent']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={StyleSheet.absoluteFill}
        />
      </Animated.View>

      {/* Right edge gradient */}
      <Animated.View
        style={[styles.rightEdge, { borderTopRightRadius: borderRadius, borderBottomRightRadius: borderRadius }, rightEdgeStyle]}
        pointerEvents="none"
      >
        <LinearGradient
          colors={['transparent', lightColor + 'FF', 'transparent']}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
      </Animated.View>

      {/* Bottom edge gradient */}
      <Animated.View
        style={[styles.bottomEdge, { borderBottomLeftRadius: borderRadius, borderBottomRightRadius: borderRadius }, bottomEdgeStyle]}
        pointerEvents="none"
      >
        <LinearGradient
          colors={['transparent', lightColor + 'FF', 'transparent']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={StyleSheet.absoluteFill}
        />
      </Animated.View>

      {/* Left edge gradient */}
      <Animated.View
        style={[styles.leftEdge, { borderTopLeftRadius: borderRadius, borderBottomLeftRadius: borderRadius }, leftEdgeStyle]}
        pointerEvents="none"
      >
        <LinearGradient
          colors={['transparent', lightColor + 'FF', 'transparent']}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
      </Animated.View>

      {/* Inner content */}
      <View
        style={[
          styles.innerContent,
          {
            borderRadius: borderRadius - borderWidth,
            margin: borderWidth,
            backgroundColor,
          },
        ]}
      >
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
  topEdge: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 3,
  },
  rightEdge: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    width: 3,
  },
  bottomEdge: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 3,
  },
  leftEdge: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    width: 3,
  },
  innerContent: {
    flex: 1,
    overflow: 'hidden',
  },
});
