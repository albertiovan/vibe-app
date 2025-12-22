/**
 * GlowButton Component
 * Button with animated pulsing glow effect for React Native
 * Creates a breathing glow animation around the button
 */

import React, { useEffect } from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle, TextStyle, View } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';

interface GlowButtonProps {
  onPress: () => void;
  title: string;
  glowColor?: string;
  textColor?: string;
  borderRadius?: number;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export const GlowButton: React.FC<GlowButtonProps> = ({
  onPress,
  title,
  glowColor = '#FFD93D',
  textColor = '#000000',
  borderRadius = 16,
  style,
  textStyle,
}) => {
  const glowScale = useSharedValue(1);
  const glowOpacity = useSharedValue(0.5);

  useEffect(() => {
    // Breathing animation for glow
    glowScale.value = withRepeat(
      withTiming(1.15, {
        duration: 2000,
        easing: Easing.inOut(Easing.ease),
      }),
      -1,
      true
    );

    glowOpacity.value = withRepeat(
      withTiming(0.8, {
        duration: 2000,
        easing: Easing.inOut(Easing.ease),
      }),
      -1,
      true
    );
  }, []);

  const animatedGlowStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: glowScale.value }],
      opacity: glowOpacity.value,
    };
  });

  return (
    <View style={[styles.container, style]}>
      {/* Outer glow layers */}
      <Animated.View
        style={[
          styles.glowOuter,
          {
            borderRadius: borderRadius + 20,
          },
          animatedGlowStyle,
        ]}
        pointerEvents="none"
      >
        <LinearGradient
          colors={[
            glowColor + '00',
            glowColor + '40',
            glowColor + '60',
            glowColor + '40',
            glowColor + '00',
          ]}
          start={{ x: 0.5, y: 0.5 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
      </Animated.View>

      {/* Button */}
      <TouchableOpacity
        onPress={onPress}
        activeOpacity={0.85}
        style={styles.touchable}
      >
        <LinearGradient
          colors={[glowColor, glowColor]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[
            styles.button,
            {
              borderRadius,
            },
          ]}
        >
          <Text style={[styles.text, { color: textColor }, textStyle]}>
            {title}
          </Text>
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  glowOuter: {
    position: 'absolute',
    top: -20,
    left: -20,
    right: -20,
    bottom: -20,
  },
  touchable: {
    zIndex: 1,
  },
  button: {
    paddingVertical: 16,
    paddingHorizontal: 32,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#FFD93D',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.6,
    shadowRadius: 12,
    elevation: 8,
  },
  text: {
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
});
