/**
 * VibeChip Component
 * Pill-shaped chip for suggested vibes
 */

import React, { useRef } from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  Animated,
  ViewStyle,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { colors } from '../../src/design-system/colors';
import { tokens } from '../../src/design-system/tokens';

interface VibeChipProps {
  label: string;
  emoji?: string;
  onPress: () => void;
  selected?: boolean;
  style?: ViewStyle;
}

export const VibeChip: React.FC<VibeChipProps> = ({
  label,
  emoji,
  onPress,
  selected = false,
  style,
}) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
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
        activeOpacity={0.8}
      >
        <Animated.View
          style={[
            styles.chip,
            selected && styles.chipSelected,
          ]}
        >
          {emoji && <Text style={styles.emoji}>{emoji}</Text>}
          <Text style={[styles.label, selected && styles.labelSelected]}>
            {label}
          </Text>
        </Animated.View>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: tokens.spacing.sm,
    paddingHorizontal: tokens.spacing.md,
    borderRadius: tokens.radius.sm,
    backgroundColor: colors.base.surface,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  chipSelected: {
    backgroundColor: colors.accent.primaryGradient.start,
    borderColor: colors.accent.primaryGradient.end,
  },
  emoji: {
    fontSize: tokens.typography.fontSize.md,
    marginRight: tokens.spacing.xs,
  },
  label: {
    fontSize: tokens.typography.fontSize.sm,
    fontWeight: tokens.typography.fontWeight.medium,
    color: colors.text.secondary,
  },
  labelSelected: {
    color: colors.text.primary,
  },
});
