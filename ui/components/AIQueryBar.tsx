/**
 * AIQueryBar Component
 * Glass capsule text input with submit action
 */

import React, { useState } from 'react';
import {
  View,
  Text as RNText,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Platform,
  AccessibilityInfo,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { theme, blur, radius } from '../theme/tokens';
import { useLanguage } from '../../src/i18n/LanguageContext';

interface AIQueryBarProps {
  placeholder?: string;
  onSubmit: (query: string) => void;
  autoFocus?: boolean;
  testID?: string;
  submitButtonText?: string;
}

export const AIQueryBar: React.FC<AIQueryBarProps> = ({
  placeholder,
  onSubmit,
  autoFocus = false,
  testID,
  submitButtonText,
}) => {
  const [query, setQuery] = useState('');
  const colors = theme.colors;
  const typo = theme.typography;
  const { t } = useLanguage();
  
  const placeholderText = placeholder || t('home.placeholder');

  const handleSubmit = () => {
    if (query.trim()) {
      onSubmit(query.trim());
      setQuery('');
      AccessibilityInfo.announceForAccessibility('Query submitted');
    }
  };

  const inputStyle = [
    styles.input,
    typo.body,
    { color: colors.fg.primary },
    Platform.OS === 'web' && ({ outline: 'none' } as any),
  ];

  return (
    <View style={styles.wrapper}>
      <BlurView intensity={8} tint="dark" style={styles.container}>
        <View
          style={[
            styles.innerContainer,
            {
              backgroundColor: 'rgba(0, 170, 255, 0.08)', // More transparent cyan-tinted glass
              borderColor: 'rgba(0, 217, 255, 0.25)', // Brighter cyan border
            },
          ]}
        >
          <TextInput
            style={inputStyle}
            placeholder={placeholderText}
            placeholderTextColor="rgba(255, 255, 255, 0.4)" // More transparent placeholder from INSPO
            value={query}
            onChangeText={setQuery}
            onSubmitEditing={handleSubmit}
            returnKeyType="send"
            autoFocus={autoFocus}
            autoCapitalize="none"
            autoCorrect={false}
            testID={testID}
            accessibilityLabel="AI query input"
            accessibilityHint="Enter your question and press send"
          />
          
          <TouchableOpacity
            onPress={handleSubmit}
            disabled={!query.trim()}
            style={[
              submitButtonText ? styles.sendButtonText : styles.sendButton,
              {
                backgroundColor: query.trim()
                  ? 'rgba(253, 221, 16, 0.95)' // #FDDD10 yellow when active
                  : 'rgba(253, 221, 16, 0.15)', // Very transparent when disabled
              },
            ]}
            accessibilityRole="button"
            accessibilityLabel={submitButtonText || "Send query"}
            accessibilityState={{ disabled: !query.trim() }}
          >
            {submitButtonText ? (
              <RNText style={[styles.buttonLabel, { color: query.trim() ? '#000000' : 'rgba(0, 0, 0, 0.4)' }]}>
                {submitButtonText}
              </RNText>
            ) : (
              <View style={styles.sendIcon}>
                <View style={[styles.arrow, { borderLeftColor: query.trim() ? '#000000' : colors.fg.primary }]} />
              </View>
            )}
          </TouchableOpacity>
        </View>
      </BlurView>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    borderRadius: radius['2xl'],
    overflow: 'hidden',
  },
  container: {
    borderRadius: radius['2xl'],
    overflow: 'hidden',
  },
  innerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: Platform.OS === 'ios' ? 14 : 10,
    borderWidth: 1,
    borderRadius: radius['2xl'],
    minHeight: 56,
  },
  input: {
    flex: 1,
    paddingRight: 12,
    minHeight: 40,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonText: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonLabel: {
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  sendIcon: {
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  arrow: {
    width: 0,
    height: 0,
    borderLeftWidth: 12,
    borderLeftColor: '#EAF6FF',
    borderTopWidth: 6,
    borderTopColor: 'transparent',
    borderBottomWidth: 6,
    borderBottomColor: 'transparent',
  },
});
