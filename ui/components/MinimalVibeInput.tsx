/**
 * MinimalVibeInput Component
 * 
 * Clean, ChatGPT-style input bar for vibe queries
 * Black and white, minimal aesthetic
 */

import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Keyboard,
  Platform,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

interface MinimalVibeInputProps {
  placeholder?: string;
  onSubmit: (text: string) => void;
  disabled?: boolean;
}

export function MinimalVibeInput({
  placeholder = "What's the vibe?",
  onSubmit,
  disabled = false,
}: MinimalVibeInputProps) {
  const [value, setValue] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<TextInput>(null);
  
  // Animation values
  const borderOpacity = useSharedValue(0.2);
  const scale = useSharedValue(1);

  // Handle focus
  const handleFocus = () => {
    setIsFocused(true);
    borderOpacity.value = withTiming(0.4, { duration: 200 });
  };

  // Handle blur
  const handleBlur = () => {
    setIsFocused(false);
    borderOpacity.value = withTiming(0.2, { duration: 200 });
  };

  // Handle submit
  const handleSubmit = () => {
    if (value.trim() && !disabled) {
      onSubmit(value.trim());
      setValue('');
      Keyboard.dismiss();
    }
  };

  // Animated border style
  const animatedBorderStyle = useAnimatedStyle(() => ({
    borderColor: `rgba(255, 255, 255, ${borderOpacity.value})`,
  }));

  const isSubmitDisabled = !value.trim() || disabled;

  return (
    <Animated.View style={[styles.container, animatedBorderStyle]}>
      <View style={styles.inputContainer}>
        <TextInput
          ref={inputRef}
          value={value}
          onChangeText={setValue}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onSubmitEditing={handleSubmit}
          placeholder={placeholder}
          placeholderTextColor="rgba(255, 255, 255, 0.4)"
          style={styles.input}
          multiline
          maxLength={500}
          editable={!disabled}
          returnKeyType="send"
          blurOnSubmit={false}
        />
        
        <TouchableOpacity
          onPress={handleSubmit}
          disabled={isSubmitDisabled}
          style={[
            styles.sendButton,
            isSubmitDisabled && styles.sendButtonDisabled,
          ]}
          activeOpacity={0.7}
        >
          <View style={styles.sendIconContainer}>
            {/* Up arrow icon */}
            <View style={styles.arrowIcon}>
              <View style={[styles.arrowLine, styles.arrowLineVertical]} />
              <View style={[styles.arrowLine, styles.arrowLineLeft]} />
              <View style={[styles.arrowLine, styles.arrowLineRight]} />
            </View>
          </View>
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#2F2F2F',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 16,
    paddingVertical: 12,
    minHeight: 52,
    maxHeight: 120,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  input: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '400',
    lineHeight: 22,
    paddingVertical: 0,
    minHeight: 22,
    maxHeight: 88,
  },
  sendButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  sendIconContainer: {
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  arrowIcon: {
    width: 12,
    height: 12,
    position: 'relative',
  },
  arrowLine: {
    position: 'absolute',
    backgroundColor: '#000000',
  },
  arrowLineVertical: {
    width: 2,
    height: 12,
    left: 5,
    top: 0,
  },
  arrowLineLeft: {
    width: 6,
    height: 2,
    left: 0,
    top: 3,
    transform: [{ rotate: '45deg' }],
  },
  arrowLineRight: {
    width: 6,
    height: 2,
    right: 0,
    top: 3,
    transform: [{ rotate: '-45deg' }],
  },
});
