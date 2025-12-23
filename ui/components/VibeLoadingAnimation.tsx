/**
 * VibeLoadingAnimation
 * Beautiful, smooth loading animation for vibe processing
 * Uses React Native Reanimated for 60fps performance
 */

import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
  withDelay,
  Easing,
  interpolate,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../src/contexts/ThemeContext';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface VibeLoadingAnimationProps {
  message?: string;
}

export const VibeLoadingAnimation: React.FC<VibeLoadingAnimationProps> = ({
  message = 'Finding your perfect vibe...',
}) => {
  const { colors: themeColors, resolvedTheme } = useTheme();
  
  // Animation values
  const progress = useSharedValue(0);
  const orb1Scale = useSharedValue(1);
  const orb2Scale = useSharedValue(1);
  const orb3Scale = useSharedValue(1);
  const rotation = useSharedValue(0);
  const pulseOpacity = useSharedValue(0.3);

  useEffect(() => {
    // Progress bar animation
    progress.value = withRepeat(
      withTiming(1, {
        duration: 2000,
        easing: Easing.bezier(0.4, 0, 0.2, 1),
      }),
      -1,
      false
    );

    // Orb pulsing animations (staggered)
    orb1Scale.value = withRepeat(
      withSequence(
        withTiming(1.2, { duration: 800, easing: Easing.inOut(Easing.ease) }),
        withTiming(1, { duration: 800, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      false
    );

    orb2Scale.value = withDelay(
      200,
      withRepeat(
        withSequence(
          withTiming(1.2, { duration: 800, easing: Easing.inOut(Easing.ease) }),
          withTiming(1, { duration: 800, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        false
      )
    );

    orb3Scale.value = withDelay(
      400,
      withRepeat(
        withSequence(
          withTiming(1.2, { duration: 800, easing: Easing.inOut(Easing.ease) }),
          withTiming(1, { duration: 800, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        false
      )
    );

    // Rotation animation
    rotation.value = withRepeat(
      withTiming(360, {
        duration: 3000,
        easing: Easing.linear,
      }),
      -1,
      false
    );

    // Pulse opacity
    pulseOpacity.value = withRepeat(
      withSequence(
        withTiming(0.8, { duration: 1000, easing: Easing.inOut(Easing.ease) }),
        withTiming(0.3, { duration: 1000, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      false
    );
  }, []);

  // Animated styles
  const progressBarStyle = useAnimatedStyle(() => {
    const width = interpolate(progress.value, [0, 1], [0, SCREEN_WIDTH * 0.7]);
    return {
      width,
    };
  });

  const orb1Style = useAnimatedStyle(() => ({
    transform: [{ scale: orb1Scale.value }],
  }));

  const orb2Style = useAnimatedStyle(() => ({
    transform: [{ scale: orb2Scale.value }],
  }));

  const orb3Style = useAnimatedStyle(() => ({
    transform: [{ scale: orb3Scale.value }],
  }));

  const rotatingRingStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  const pulseStyle = useAnimatedStyle(() => ({
    opacity: pulseOpacity.value,
  }));

  const isDark = resolvedTheme === 'dark';

  return (
    <View style={styles.container}>
      {/* Rotating ring background */}
      <Animated.View style={[styles.rotatingRing, rotatingRingStyle]}>
        <View
          style={[
            styles.ring,
            {
              borderColor: isDark
                ? 'rgba(255, 255, 255, 0.1)'
                : 'rgba(0, 0, 0, 0.05)',
            },
          ]}
        />
      </Animated.View>

      {/* Pulsing background glow */}
      <Animated.View style={[styles.pulseGlow, pulseStyle]}>
        <LinearGradient
          colors={
            isDark
              ? ['rgba(0, 170, 255, 0.2)', 'transparent']
              : ['rgba(0, 170, 255, 0.1)', 'transparent']
          }
          style={styles.glowGradient}
        />
      </Animated.View>

      {/* Three animated orbs */}
      <View style={styles.orbsContainer}>
        <Animated.View style={[styles.orb, orb1Style]}>
          <LinearGradient
            colors={['#00AAFF', '#00D9FF']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.orbGradient}
          />
        </Animated.View>

        <Animated.View style={[styles.orb, styles.orb2, orb2Style]}>
          <LinearGradient
            colors={['#00D9FF', '#00FFD9']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.orbGradient}
          />
        </Animated.View>

        <Animated.View style={[styles.orb, styles.orb3, orb3Style]}>
          <LinearGradient
            colors={['#00FFD9', '#00AAFF']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.orbGradient}
          />
        </Animated.View>
      </View>

      {/* Loading message */}
      <Text style={[styles.message, { color: themeColors.text.primary }]}>
        {message}
      </Text>

      {/* Progress bar */}
      <View
        style={[
          styles.progressBarContainer,
          {
            backgroundColor: isDark
              ? 'rgba(255, 255, 255, 0.1)'
              : 'rgba(0, 0, 0, 0.05)',
          },
        ]}
      >
        <Animated.View style={[styles.progressBar, progressBarStyle]}>
          <LinearGradient
            colors={['#00AAFF', '#00D9FF', '#00FFD9']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={StyleSheet.absoluteFill}
          />
        </Animated.View>
      </View>

      {/* Subtle hint text */}
      <Text style={[styles.hint, { color: themeColors.text.tertiary }]}>
        Analyzing your vibe and preferences...
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  rotatingRing: {
    position: 'absolute',
    width: 200,
    height: 200,
  },
  ring: {
    width: 200,
    height: 200,
    borderRadius: 100,
    borderWidth: 2,
  },
  pulseGlow: {
    position: 'absolute',
    width: 300,
    height: 300,
    borderRadius: 150,
  },
  glowGradient: {
    width: '100%',
    height: '100%',
    borderRadius: 150,
  },
  orbsContainer: {
    width: 120,
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 40,
  },
  orb: {
    position: 'absolute',
    width: 24,
    height: 24,
    borderRadius: 12,
    overflow: 'hidden',
  },
  orb2: {
    left: -30,
  },
  orb3: {
    right: -30,
  },
  orbGradient: {
    width: '100%',
    height: '100%',
  },
  message: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 24,
    letterSpacing: -0.3,
  },
  progressBarContainer: {
    width: SCREEN_WIDTH * 0.7,
    height: 4,
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: 16,
  },
  progressBar: {
    height: '100%',
    borderRadius: 2,
  },
  hint: {
    fontSize: 13,
    textAlign: 'center',
    marginTop: 8,
  },
});
