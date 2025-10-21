/**
 * GradientButton Component
 * Primary CTA with coral gradient and haptic feedback
 */

import React, { useRef } from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  Animated,
  ViewStyle,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { colors } from '../../src/design-system/colors';
import { tokens } from '../../src/design-system/tokens';

interface GradientButtonProps {
  onPress: () => void;
  title: string;
  variant?: 'primary' | 'secondary';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  style?: ViewStyle;
}

export const GradientButton: React.FC<GradientButtonProps> = ({
  onPress,
  title,
  variant = 'primary',
  size = 'md',
  disabled = false,
  style,
}) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    if (disabled) return;
    
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Animated.spring(scaleAnim, {
      toValue: 0.95,
      useNativeDriver: true,
      speed: 50,
      bounciness: 10,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      speed: 50,
      bounciness: 10,
    }).start();
  };

  const gradientColors =
    variant === 'primary'
      ? [colors.accent.primaryGradient.start, colors.accent.primaryGradient.end]
      : [colors.base.surface, colors.base.surfaceHover];

  const sizeStyles = {
    sm: { paddingVertical: 8, paddingHorizontal: 16 },
    md: { paddingVertical: 12, paddingHorizontal: 24 },
    lg: { paddingVertical: 16, paddingHorizontal: 32 },
  };

  const textSizes = {
    sm: tokens.typography.fontSize.sm,
    md: tokens.typography.fontSize.md,
    lg: tokens.typography.fontSize.lg,
  };

  return (
    <Animated.View
      style={[
        { transform: [{ scale: scaleAnim }] },
        style,
      ]}
    >
      <TouchableOpacity
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled}
        activeOpacity={0.9}
      >
        <LinearGradient
          colors={gradientColors}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={[
            styles.gradient,
            sizeStyles[size],
            disabled && styles.disabled,
          ]}
        >
          <Text
            style={[
              styles.text,
              { fontSize: textSizes[size] },
              disabled && styles.textDisabled,
            ]}
          >
            {title}
          </Text>
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  gradient: {
    borderRadius: tokens.radius.sm,
    justifyContent: 'center',
    alignItems: 'center',
    ...tokens.shadow.sm,
  },
  text: {
    color: colors.text.primary,
    fontWeight: tokens.typography.fontWeight.semibold,
    textAlign: 'center',
  },
  disabled: {
    opacity: 0.5,
  },
  textDisabled: {
    color: colors.text.disabled,
  },
});
