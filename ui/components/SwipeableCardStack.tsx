/**
 * SwipeableCardStack
 * Vertical swipeable card stack with smooth animations
 * Large center card with peek of cards above/below
 */

import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Image,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  interpolate,
  Extrapolate,
  runOnJS,
} from 'react-native-reanimated';
import { Gesture, GestureDetector, GestureHandlerRootView } from 'react-native-gesture-handler';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { theme } from '../theme/tokens';
import { WeatherBadge } from './WeatherBadge';

const { height: SCREEN_HEIGHT, width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_HEIGHT = SCREEN_HEIGHT * 0.65; // Large card takes 65% of screen
const CARD_WIDTH = SCREEN_WIDTH * 0.85;
const PEEK_AMOUNT = 80; // How much of other cards peek through
const SWIPE_THRESHOLD = 50; // Minimum swipe distance to trigger change

export interface SwipeableActivity {
  id: number;
  name: string;
  simplifiedName: string; // Generic name like "Skiing", "Art Class"
  description: string;
  category: string;
  imageUrl?: string;
  region?: string;
  city?: string;
  matchScore?: number; // For ranking
  venues?: any[]; // Venue data with locations
  duration_min?: number;
  photos?: string[];
  weather?: {
    temperature: number;
    condition: string;
    precipitation: number;
    suitability: 'good' | 'ok' | 'bad';
    icon: string;
    description: string;
    warning?: string | null;
  };
  [key: string]: any; // Allow additional properties
}

interface SwipeableCardStackProps {
  activities: SwipeableActivity[];
  onCardPress: (activity: SwipeableActivity) => void;
  onRefresh?: () => void;
}

export const SwipeableCardStack: React.FC<SwipeableCardStackProps> = ({
  activities,
  onCardPress,
  onRefresh,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const translateY = useSharedValue(0);
  const colors = theme.colors;
  const typo = theme.typography;

  // Debug logging
  console.log('🎴 SwipeableCardStack render:', {
    activitiesCount: activities.length,
    currentIndex,
    firstActivity: activities[0]?.simplifiedName,
  });

  const panGesture = Gesture.Pan()
    .onUpdate((event) => {
      translateY.value = event.translationY;
    })
    .onEnd((event) => {
      const velocity = event.velocityY;
      const translation = event.translationY;

      // Swipe up to next card
      if (translation < -SWIPE_THRESHOLD || velocity < -500) {
        if (currentIndex < activities.length - 1) {
          runOnJS(setCurrentIndex)(currentIndex + 1);
        }
        translateY.value = withSpring(0, { damping: 20, stiffness: 90 });
      }
      // Swipe down to previous card
      else if (translation > SWIPE_THRESHOLD || velocity > 500) {
        if (currentIndex > 0) {
          runOnJS(setCurrentIndex)(currentIndex - 1);
        }
        translateY.value = withSpring(0, { damping: 20, stiffness: 90 });
      }
      // Snap back
      else {
        translateY.value = withSpring(0, { damping: 20, stiffness: 90 });
      }
    });

  // Create animated styles for all cards upfront
  const cardStyles = activities.map((_, index) => {
    const position = index - currentIndex;
    
    return useAnimatedStyle(() => {
      // Calculate base position
      let baseTranslateY = position * (CARD_HEIGHT + 20);
      
      // Add gesture translation only to current card
      const gestureOffset = position === 0 ? translateY.value : 0;
      const finalTranslateY = baseTranslateY + gestureOffset;

      // Scale: center card is 1.0, others are 0.85/0.75
      const scale = interpolate(
        Math.abs(position),
        [0, 1, 2],
        [1, 0.85, 0.75],
        Extrapolate.CLAMP
      );

      // Opacity: center card is 1.0, others fade
      const opacity = interpolate(
        Math.abs(position),
        [0, 1, 2],
        [1, 0.6, 0.3],
        Extrapolate.CLAMP
      );

      // Z-index: center card should be on top
      const zIndex = 100 - Math.abs(position);

      return {
        transform: [
          { translateY: finalTranslateY },
          { scale },
        ],
        opacity,
        zIndex,
        elevation: zIndex, // For Android
      };
    });
  });

  const renderCard = (activity: SwipeableActivity, index: number) => {
    const position = index - currentIndex;
    const isCenter = position === 0;
    const isVisible = Math.abs(position) <= 2; // Show 2 cards above and below

    if (!isVisible) return null;

    return (
      <Animated.View
        key={activity.id}
        style={[
          styles.cardWrapper,
          cardStyles[index],
          { pointerEvents: isCenter ? 'auto' : 'none' },
        ]}
      >
        <TouchableOpacity
          activeOpacity={0.95}
          onPress={() => onCardPress(activity)}
          disabled={!isCenter}
        >
          <View style={styles.card}>
            {/* Background Image */}
            {activity.imageUrl ? (
              <Image
                source={{ uri: activity.imageUrl }}
                style={styles.cardImage}
                resizeMode="cover"
              />
            ) : (
              <LinearGradient
                colors={[colors.gradient.primary.from, colors.gradient.primary.to]}
                style={styles.cardImage}
              />
            )}

            {/* Gradient Overlay */}
            <LinearGradient
              colors={['rgba(0,0,0,0)', 'rgba(0,0,0,0.3)', 'rgba(0,0,0,0.8)']}
              style={styles.gradientOverlay}
            />

            {/* Card Content */}
            <View style={styles.cardContent}>
              {/* Weather Badge - Top Right */}
              {activity.weather && (
                <View style={styles.weatherBadgeContainer}>
                  <WeatherBadge weather={activity.weather} compact />
                </View>
              )}
              
              <Text style={[typo.titleXL, styles.cardTitle]}>
                {activity.simplifiedName}
              </Text>
              
              {/* Match indicator for center card */}
              {isCenter && activity.matchScore && (
                <View style={styles.matchBadge}>
                  <BlurView intensity={20} tint="dark" style={styles.matchBadgeBlur}>
                    <Text style={[typo.bodySmall, styles.matchText]}>
                      {Math.round(activity.matchScore * 100)}% Match
                    </Text>
                  </BlurView>
                </View>
              )}
            </View>

            {/* Glass border */}
            <View style={[styles.cardBorder, { borderColor: colors.glass.border }]} />
          </View>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  // Show debug message if no activities
  if (activities.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={[typo.titleM, { color: colors.fg.primary, textAlign: 'center', padding: 20 }]}>
          No activities to display
        </Text>
        <Text style={[typo.body, { color: colors.fg.secondary, textAlign: 'center', padding: 20 }]}>
          Debug: SwipeableCardStack received 0 activities
        </Text>
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={styles.container}>
      <GestureDetector gesture={panGesture}>
        <Animated.View style={styles.stackContainer}>
          {activities.map((activity, index) => renderCard(activity, index))}
        </Animated.View>
      </GestureDetector>

      {/* Swipe Indicator */}
      <View style={styles.swipeIndicator}>
        <Text style={[typo.bodySmall, { color: colors.fg.tertiary }]}>
          Swipe to explore • {currentIndex + 1} of {activities.length}
        </Text>
      </View>
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stackContainer: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardWrapper: {
    position: 'absolute',
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
  },
  card: {
    width: '100%',
    height: '100%',
    borderRadius: 28,
    overflow: 'hidden',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  cardImage: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  gradientOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '60%',
  },
  cardContent: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 32,
  },
  weatherBadgeContainer: {
    position: 'absolute',
    top: -CARD_HEIGHT + 80, // Position at top of card
    right: 0,
    zIndex: 10,
  },
  cardTitle: {
    color: '#FFFFFF',
    fontSize: 42,
    fontWeight: '700',
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
    letterSpacing: 0.5,
  },
  matchBadge: {
    alignSelf: 'center',
    marginTop: 16,
    borderRadius: 20,
    overflow: 'hidden',
  },
  matchBadgeBlur: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(0, 217, 255, 0.3)',
  },
  matchText: {
    color: 'rgba(0, 217, 255, 0.95)',
    fontWeight: '600',
    fontSize: 13,
  },
  cardBorder: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 28,
    borderWidth: 1,
    pointerEvents: 'none',
  },
  swipeIndicator: {
    position: 'absolute',
    bottom: 40,
    alignSelf: 'center',
  },
});
