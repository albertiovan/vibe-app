/**
 * Language Selector Component
 * Allows users to switch between English and Romanian
 */

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useLanguage } from '../src/i18n/LanguageContext';
import { theme } from '../ui/theme/tokens';

export const LanguageSelector: React.FC = () => {
  const { language, setLanguage } = useLanguage();
  const colors = theme.colors;

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[
          styles.button,
          language === 'en' && styles.activeButton,
          { borderColor: colors.glass.border },
        ]}
        onPress={() => setLanguage('en')}
        accessibilityRole="button"
        accessibilityLabel="Switch to English"
        accessibilityState={{ selected: language === 'en' }}
      >
        <Text
          style={[
            styles.buttonText,
            { color: language === 'en' ? colors.fg.primary : colors.fg.secondary },
          ]}
        >
          EN
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[
          styles.button,
          language === 'ro' && styles.activeButton,
          { borderColor: colors.glass.border },
        ]}
        onPress={() => setLanguage('ro')}
        accessibilityRole="button"
        accessibilityLabel="Comută la Română"
        accessibilityState={{ selected: language === 'ro' }}
      >
        <Text
          style={[
            styles.buttonText,
            { color: language === 'ro' ? colors.fg.primary : colors.fg.secondary },
          ]}
        >
          RO
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: 8,
  },
  button: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
    borderWidth: 1,
    minWidth: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeButton: {
    backgroundColor: 'rgba(0, 217, 255, 0.15)',
  },
  buttonText: {
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
});
