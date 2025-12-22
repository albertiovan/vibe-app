/**
 * LiquidGlassButton
 * Apple-inspired liquid glass button with blur, transparency, and subtle animations
 * Based on iOS design principles for glass morphism
 */

import React from 'react';
import { 
  TouchableOpacity, 
  Text, 
  StyleSheet, 
  ViewStyle, 
  TextStyle, 
  View,
  ActivityIndicator,
} from 'react-native';
import { BlurView } from 'expo-blur';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { useTheme } from '../../src/contexts/ThemeContext';

interface LiquidGlassButtonProps {
  onPress: () => void;
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'tertiary';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  loading?: boolean;
  icon?: string; // Emoji or text icon
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
  style?: ViewStyle;
}

export const LiquidGlassButton: React.FC<LiquidGlassButtonProps> = ({
  onPress,
  children,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  icon,
  iconPosition = 'left',
  fullWidth = false,
  style,
}) => {
  const { resolvedTheme } = useTheme();
  
  // Animation values
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);

  const handlePressIn = () => {
    scale.value = withSpring(0.95, { damping: 15, stiffness: 300 });
    opacity.value = withTiming(0.8, { duration: 100 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15, stiffness: 300 });
    opacity.value = withTiming(1, { duration: 100 });
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  // Variant styles
  const getVariantStyle = (): ViewStyle => {
    const isDark = resolvedTheme === 'dark';
    
    switch (variant) {
      case 'primary':
        return {
          backgroundColor: isDark 
            ? 'rgba(255, 255, 255, 0.15)' 
            : 'rgba(0, 0, 0, 0.08)',
          borderColor: isDark 
            ? 'rgba(255, 255, 255, 0.3)' 
            : 'rgba(0, 0, 0, 0.15)',
        };
      case 'secondary':
        return {
          backgroundColor: isDark 
            ? 'rgba(255, 255, 255, 0.08)' 
            : 'rgba(0, 0, 0, 0.04)',
          borderColor: isDark 
            ? 'rgba(255, 255, 255, 0.2)' 
            : 'rgba(0, 0, 0, 0.1)',
        };
      case 'tertiary':
        return {
          backgroundColor: isDark 
            ? 'rgba(255, 255, 255, 0.05)' 
            : 'rgba(0, 0, 0, 0.02)',
          borderColor: isDark 
            ? 'rgba(255, 255, 255, 0.15)' 
            : 'rgba(0, 0, 0, 0.08)',
        };
    }
  };

  // Size styles
  const getSizeStyle = (): ViewStyle => {
    switch (size) {
      case 'small':
        return {
          paddingHorizontal: 16,
          paddingVertical: 8,
          borderRadius: 16,
        };
      case 'medium':
        return {
          paddingHorizontal: 24,
          paddingVertical: 12,
          borderRadius: 20,
        };
      case 'large':
        return {
          paddingHorizontal: 32,
          paddingVertical: 16,
          borderRadius: 24,
        };
    }
  };

  const getTextStyle = (): TextStyle => {
    const isDark = resolvedTheme === 'dark';
    
    return {
      color: isDark ? '#FFFFFF' : '#000000',
      fontSize: size === 'small' ? 14 : size === 'medium' ? 16 : 18,
      fontWeight: '600',
      textAlign: 'center',
    };
  };

  const isDisabled = disabled || loading;

  return (
    <Animated.View style={[animatedStyle, fullWidth && { width: '100%' }]}>
      <TouchableOpacity
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={isDisabled}
        activeOpacity={1}
        style={[
          styles.button,
          getSizeStyle(),
          getVariantStyle(),
          isDisabled && styles.disabled,
          fullWidth && { width: '100%' },
          style,
        ]}
      >
        <BlurView
          intensity={resolvedTheme === 'dark' ? 20 : 15}
          tint={resolvedTheme === 'dark' ? 'dark' : 'light'}
          style={StyleSheet.absoluteFill}
        />
        
        <View style={styles.content}>
          {/* Left icon */}
          {icon && iconPosition === 'left' && !loading && (
            <Text style={[styles.icon, { marginRight: 8 }]}>{icon}</Text>
          )}
          
          {/* Loading spinner */}
          {loading && (
            <ActivityIndicator 
              size="small" 
              color={resolvedTheme === 'dark' ? '#FFFFFF' : '#000000'}
              style={{ marginRight: children ? 8 : 0 }}
            />
          )}
          
          {/* Button text */}
          {children && <Text style={getTextStyle()}>{children}</Text>}
          
          {/* Right icon */}
          {icon && iconPosition === 'right' && !loading && (
            <Text style={[styles.icon, { marginLeft: 8 }]}>{icon}</Text>
          )}
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  button: {
    overflow: 'hidden',
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    fontSize: 18,
  },
  disabled: {
    opacity: 0.5,
  },
});
