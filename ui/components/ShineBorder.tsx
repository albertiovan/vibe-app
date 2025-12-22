/**
 * ShineBorder Component
 * Subtle passing light effect for React Native
 * Creates a smooth horizontal shine that passes across the card
 */

import React, { useEffect } from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withDelay,
  Easing,
  interpolate,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';

interface ShineBorderProps {
  children?: React.ReactNode;
  shineColor?: string;
  duration?: number;
  repeat?: boolean;
  borderRadius?: number;
  backgroundColor?: string;
  style?: ViewStyle;
}

export const ShineBorder: React.FC<ShineBorderProps> = ({
  children,
  shineColor = '#FFFFFF',
  duration = 3000,
  repeat = true,
  borderRadius = 16,
  backgroundColor = 'rgba(10, 14, 23, 0.95)',
  style,
}) => {
  const progress = useSharedValue(0);

  useEffect(() => {
    if (repeat) {
      progress.value = withRepeat(
        withDelay(
          500,
          withTiming(1, {
            duration,
            easing: Easing.inOut(Easing.ease),
          })
        ),
        -1,
        false
      );
    } else {
      progress.value = withTiming(1, {
        duration,
        easing: Easing.inOut(Easing.ease),
      });
    }
  }, [duration, repeat]);

  const animatedStyle = useAnimatedStyle(() => {
    const translateX = interpolate(
      progress.value,
      [0, 1],
      [-100, 500]
    );

    const opacity = interpolate(
      progress.value,
      [0, 0.3, 0.5, 0.7, 1],
      [0, 0.15, 0.25, 0.15, 0]
    );

    return {
      transform: [{ translateX }],
      opacity,
    };
  });

  return (
    <View style={[styles.container, style]}>
      {/* Subtle border */}
      <View
        style={[
          StyleSheet.absoluteFill,
          {
            borderRadius,
            borderWidth: 1,
            borderColor: shineColor + '15',
          },
        ]}
      />

      {/* Animated shine effect */}
      <Animated.View
        style={[
          styles.shineContainer,
          animatedStyle,
        ]}
        pointerEvents="none"
      >
        <LinearGradient
          colors={[
            'transparent',
            shineColor + '00',
            shineColor + '20',
            shineColor + '40',
            shineColor + '20',
            shineColor + '00',
            'transparent',
          ]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.shine}
        />
      </Animated.View>

      {/* Content */}
      <View
        style={[
          styles.content,
          {
            borderRadius: borderRadius - 1,
            margin: 1,
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
  shineContainer: {
    position: 'absolute',
    top: 0,
    left: -150,
    width: 150,
    height: '100%',
    zIndex: 1,
  },
  shine: {
    flex: 1,
    width: 150,
  },
  content: {
    flex: 1,
    overflow: 'hidden',
  },
});
