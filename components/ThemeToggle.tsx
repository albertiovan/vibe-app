/**
 * ThemeToggle Component
 * Allows users to switch between light, dark, and system themes
 */

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme, ThemeMode } from '../src/contexts/ThemeContext';
import { colors } from '../src/design-system/colors';
import { tokens } from '../src/design-system/tokens';

interface ThemeOption {
  value: ThemeMode;
  label: string;
  icon: string;
}

const THEME_OPTIONS: ThemeOption[] = [
  { value: 'light', label: 'Light', icon: '☀️' },
  { value: 'dark', label: 'Dark', icon: '🌙' },
  { value: 'system', label: 'System', icon: '⚙️' },
];

export const ThemeToggle: React.FC = () => {
  const { theme, setTheme } = useTheme();

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Theme</Text>
      <View style={styles.optionsContainer}>
        {THEME_OPTIONS.map((option) => {
          const isSelected = theme === option.value;
          return (
            <TouchableOpacity
              key={option.value}
              style={[
                styles.option,
                isSelected && styles.optionSelected,
              ]}
              onPress={() => setTheme(option.value)}
              activeOpacity={0.7}
            >
              <Text style={styles.optionIcon}>{option.icon}</Text>
              <Text
                style={[
                  styles.optionLabel,
                  isSelected && styles.optionLabelSelected,
                ]}
              >
                {option.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: tokens.spacing.md,
  },
  label: {
    fontSize: tokens.typography.fontSize.md,
    fontWeight: tokens.typography.fontWeight.medium,
    color: colors.text.primary,
    marginBottom: tokens.spacing.sm,
  },
  optionsContainer: {
    flexDirection: 'row',
    gap: tokens.spacing.sm,
  },
  option: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: tokens.spacing.md,
    paddingHorizontal: tokens.spacing.sm,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: tokens.radius.sm,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  optionSelected: {
    backgroundColor: colors.accent.primary + '30',
    borderColor: colors.accent.primary,
  },
  optionIcon: {
    fontSize: 18,
    marginRight: tokens.spacing.xs,
  },
  optionLabel: {
    fontSize: tokens.typography.fontSize.sm,
    color: colors.text.secondary,
    fontWeight: tokens.typography.fontWeight.medium,
  },
  optionLabelSelected: {
    color: colors.text.primary,
  },
});
