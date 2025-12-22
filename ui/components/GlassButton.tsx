/**
 * GlassButton Component
 * Pill-shaped button with pressed state and optional icon
 */

import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle, ActivityIndicator } from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { theme, blur, radius } from '../theme/tokens';

interface GlassButtonProps {
  label: string;
  icon?: React.ReactNode;
  kind?: 'primary' | 'secondary' | 'minimal';
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
  testID?: string;
}

export const GlassButton: React.FC<GlassButtonProps> = ({
  label,
  icon,
  kind = 'primary',
  onPress,
  disabled = false,
  loading = false,
  style,
  testID,
}) => {
  const colors = theme.colors;
  const typo = theme.typography;

  const renderContent = () => {
    const content = (
      <>
        {loading ? (
          <ActivityIndicator color={colors.fg.primary} size="small" />
        ) : (
          <>
            {icon}
            <Text
              style={[
                typo.button,
                styles.label,
                kind === 'primary' || kind === 'secondary' ? { color: '#000000' } : { color: colors.fg.primary },
                disabled && styles.labelDisabled,
              ]}
            >
              {label}
            </Text>
          </>
        )}
      </>
    );

    if (kind === 'primary') {
      return (
        <LinearGradient
          colors={[
            'rgba(253, 221, 16, 0.95)', // Bright yellow #FDDD10
            'rgba(253, 221, 16, 0.85)', // Slightly transparent yellow
          ]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={[styles.gradientContainer, disabled && styles.gradientDisabled]}
        >
          {content}
        </LinearGradient>
      );
    }

    if (kind === 'secondary') {
      return (
        <BlurView intensity={8} tint="dark" style={styles.glassContainer}>
          <LinearGradient
            colors={[
              'rgba(253, 221, 16, 0.25)', // Yellow with transparency
              'rgba(253, 221, 16, 0.15)',
            ]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={[styles.gradientContainer, disabled && styles.gradientDisabled]}
          >
            {content}
          </LinearGradient>
        </BlurView>
      );
    }

    // minimal
    return (
      <BlurView intensity={6} tint="dark" style={styles.glassContainer}>
        <LinearGradient
          colors={[
            'rgba(0, 170, 255, 0.12)',
            'rgba(0, 217, 255, 0.08)',
          ]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={[styles.gradientContainer, disabled && styles.gradientDisabled]}
        >
          {content}
        </LinearGradient>
      </BlurView>
    );
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
      style={[styles.button, style]}
      testID={testID}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: disabled || loading }}
    >
      {renderContent()}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: radius['2xl'],
    overflow: 'hidden',
    minHeight: 50,
  },
  glassContainer: {
    borderRadius: radius['2xl'],
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(253, 221, 16, 0.4)', // Yellow border
  },
  gradientContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 24,
    gap: 8,
    minHeight: 50,
  },
  gradientDisabled: {
    opacity: 0.5,
  },
  label: {
    textAlign: 'center',
  },
  labelDisabled: {
    opacity: 0.6,
  },
});
