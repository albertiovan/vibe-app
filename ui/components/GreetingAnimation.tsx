/**
 * GreetingAnimation
 * Smooth animated greeting that transitions from "Hello [name]" to "What's the vibe?"
 * Then moves title up and signals completion for input to appear
 */

import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { useTheme } from '../../src/contexts/ThemeContext';
import { useLanguage } from '../../src/i18n/LanguageContext';

interface GreetingAnimationProps {
  userName?: string;
  onComplete?: () => void;
  onTitlePositioned?: () => void; // New callback when title reaches final position
}

export const GreetingAnimation: React.FC<GreetingAnimationProps> = ({
  userName = 'there',
  onComplete,
  onTitlePositioned,
}) => {
  const { colors: themeColors } = useTheme();
  const { t } = useLanguage();
  const [showGreeting, setShowGreeting] = useState(true);
  const [showVibe, setShowVibe] = useState(false);
  
  // Animation values
  const greetingOpacity = useSharedValue(0);
  const greetingScale = useSharedValue(0.9);
  const vibeOpacity = useSharedValue(0);
  const vibeScale = useSharedValue(0.9);
  const vibeTranslateY = useSharedValue(0);

  useEffect(() => {
    // Step 1: Greeting animation - fade in and scale up (centered)
    greetingOpacity.value = withTiming(1, {
      duration: 800,
      easing: Easing.out(Easing.cubic),
    });
    greetingScale.value = withTiming(1, {
      duration: 800,
      easing: Easing.out(Easing.cubic),
    });

    // Step 2: After 1 second, fade out greeting (reduced from 2 seconds)
    const timer1 = setTimeout(() => {
      greetingOpacity.value = withTiming(0, {
        duration: 600,
        easing: Easing.in(Easing.cubic),
      });
      greetingScale.value = withTiming(0.9, {
        duration: 600,
        easing: Easing.in(Easing.cubic),
      });

      // Step 3: Show "What's the vibe?" in center
      setTimeout(() => {
        setShowGreeting(false);
        setShowVibe(true);
        vibeOpacity.value = withTiming(1, {
          duration: 800,
          easing: Easing.out(Easing.cubic),
        });
        vibeScale.value = withTiming(1, {
          duration: 800,
          easing: Easing.out(Easing.cubic),
        });

        // Step 4: After showing vibe, move it to final position
        setTimeout(() => {
          vibeTranslateY.value = withTiming(-20, {
            duration: 600,
            easing: Easing.inOut(Easing.cubic),
          });

          // Step 5: Signal that title is positioned, input can appear
          setTimeout(() => {
            onTitlePositioned?.();
            
            // Step 6: Complete animation
            setTimeout(() => {
              onComplete?.();
            }, 400);
          }, 600);
        }, 1500);
      }, 600);
    }, 1000);

    return () => clearTimeout(timer1);
  }, []);

  const greetingAnimatedStyle = useAnimatedStyle(() => ({
    opacity: greetingOpacity.value,
    transform: [{ scale: greetingScale.value }],
  }));

  const vibeAnimatedStyle = useAnimatedStyle(() => ({
    opacity: vibeOpacity.value,
    transform: [
      { scale: vibeScale.value },
      { translateY: vibeTranslateY.value },
    ],
  }));

  return (
    <View style={styles.container}>
      {showGreeting && (
        <Animated.View style={[styles.textContainer, greetingAnimatedStyle]}>
          <Text style={[styles.greeting, { color: themeColors.text.primary }]}>
            {t('greeting.hello')} {userName}
          </Text>
        </Animated.View>
      )}
      {showVibe && (
        <Animated.View style={[styles.textContainer, vibeAnimatedStyle]}>
          <Text style={[styles.vibe, { color: themeColors.text.primary }]}>
            {t('greeting.whats_the_vibe')}
          </Text>
        </Animated.View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 100,
  },
  textContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  greeting: {
    fontSize: 36,
    fontWeight: '600',
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  vibe: {
    fontSize: 38,
    fontWeight: '700',
    textAlign: 'center',
    letterSpacing: -0.5,
  },
});
