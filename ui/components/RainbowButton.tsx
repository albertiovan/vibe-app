import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';

interface RainbowButtonProps {
  children: string;
  onPress?: () => void;
  style?: ViewStyle;
  textStyle?: TextStyle;
  disabled?: boolean;
}

export function RainbowButton({
  children,
  onPress,
  style,
  textStyle,
  disabled = false,
}: RainbowButtonProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      style={[styles.button, style]}
      activeOpacity={0.8}
    >
      <Text style={[styles.text, textStyle]}>{children}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: 'rgba(253, 221, 16, 0.95)', // #FDDD10 yellow
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(253, 221, 16, 0.6)',
  },
  text: {
    color: '#000000', // Black text for better contrast on yellow
    fontSize: 16,
    fontWeight: '700',
  },
});
