/**
 * AnimatedGlassCard Component
 * Glass card with smooth fade-in and scale animations
 */

import React, { useEffect } from 'react';
import { ViewStyle } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { GlassCard } from './GlassCard';

interface AnimatedGlassCardProps {
  children: React.ReactNode;
  emphasis?: 'low' | 'high';
  style?: ViewStyle;
  testID?: string;
  delay?: number;
}

export const AnimatedGlassCard: React.FC<AnimatedGlassCardProps> = ({
  children,
  emphasis = 'low',
  style,
  testID,
  delay = 0,
}) => {
  const opacity = useSharedValue(0);
  const scale = useSharedValue(0.95);
  const translateY = useSharedValue(10);

  useEffect(() => {
    // Staggered entrance animation with delay
    const timer = setTimeout(() => {
      opacity.value = withTiming(1, {
        duration: 400,
        easing: Easing.out(Easing.cubic),
      });
      
      scale.value = withSpring(1, {
        damping: 15,
        stiffness: 100,
      });
      
      translateY.value = withTiming(0, {
        duration: 400,
        easing: Easing.out(Easing.cubic),
      });
    }, delay);

    return () => clearTimeout(timer);
  }, [delay]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [
      { scale: scale.value },
      { translateY: translateY.value },
    ],
  }));

  return (
    <Animated.View style={animatedStyle}>
      <GlassCard emphasis={emphasis} style={style} testID={testID}>
        {children}
      </GlassCard>
    </Animated.View>
  );
};
