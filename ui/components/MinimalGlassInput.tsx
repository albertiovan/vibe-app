/**
 * MinimalGlassInput
 * Simple glassy input for vibe description
 */

import React from 'react';
import { View, TextInput, StyleSheet, TouchableOpacity, Text } from 'react-native';
import { useTheme } from '../../src/contexts/ThemeContext';

interface MinimalGlassInputProps {
  value: string;
  onChangeText: (text: string) => void;
  onSubmit: () => void;
  placeholder?: string;
  isLoading?: boolean;
}

export const MinimalGlassInput: React.FC<MinimalGlassInputProps> = ({
  value,
  onChangeText,
  onSubmit,
  placeholder = 'Describe your vibe...',
  isLoading = false,
}) => {
  const { resolvedTheme, colors: themeColors } = useTheme();

  return (
    <View style={[
      styles.container,
      {
        backgroundColor: resolvedTheme === 'light' 
          ? 'rgba(0, 0, 0, 0.04)' 
          : 'rgba(255, 255, 255, 0.08)',
        borderColor: resolvedTheme === 'light'
          ? 'rgba(0, 0, 0, 0.1)'
          : 'rgba(255, 255, 255, 0.15)',
      }
    ]}>
      <TextInput
        style={[
          styles.input,
          { color: themeColors.text.primary }
        ]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={themeColors.text.tertiary}
        onSubmitEditing={onSubmit}
        returnKeyType="search"
        editable={!isLoading}
        multiline={false}
      />
      {value.length > 0 && !isLoading && (
        <TouchableOpacity
          style={styles.submitButton}
          onPress={onSubmit}
          activeOpacity={0.7}
        >
          <Text style={styles.submitIcon}>→</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 24,
    borderWidth: 1,
    width: '100%',
    maxWidth: 500,
  },
  input: {
    flex: 1,
    fontSize: 16,
    fontWeight: '400',
  },
  submitButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  submitIcon: {
    fontSize: 20,
    color: '#FFFFFF',
  },
});
