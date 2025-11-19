/**
 * ChallengeMeScreen
 * 
 * Dedicated screen for Challenge Me feature with unique UI
 * Shows 3 personalized challenges with Accept/Deny buttons
 * Different from normal suggestions - more interactive and gamified
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Platform,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useNavigation, useRoute, RouteProp, NavigationProp } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  runOnJS,
} from 'react-native-reanimated';
import { Gesture, GestureDetector, GestureHandlerRootView } from 'react-native-gesture-handler';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { OrbBackdrop } from '../ui/components/OrbBackdrop';
import { theme } from '../ui/theme/tokens';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const CARD_WIDTH = SCREEN_WIDTH * 0.85;
const CARD_HEIGHT = SCREEN_HEIGHT * 0.6;

interface Challenge {
  activityId: number;
  name: string;
  category: string;
  region: string;
  city: string;
  description: string;
  energy_level: string;
  challengeReason: string;
  challengeScore: number;
  isLocal: boolean;
  venues: Array<{
    venueId: number;
    name: string;
    city: string;
    rating?: number;
    location?: { lat: number; lng: number };
  }>;
}

type RootStackParamList = {
  ChallengeMeScreen: {
    deviceId: string;
    userLocation?: { latitude: number; longitude: number };
  };
  ActivityDetailScreenShell: {
    activity: any;
    userLocation?: { latitude: number; longitude: number };
  };
  HomeScreenShell: undefined;
};

type ChallengeMeScreenRouteProp = RouteProp<RootStackParamList, 'ChallengeMeScreen'>;

export const ChallengeMeScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const route = useRoute<ChallengeMeScreenRouteProp>();
  const { deviceId, userLocation } = route.params;

  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [deniedChallenges, setDeniedChallenges] = useState<number[]>([]);

  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const scale = useSharedValue(1);

  const colors = theme.colors;
  const typo = theme.typography;

  useEffect(() => {
    fetchChallenges();
  }, []);

  const fetchChallenges = async () => {
    setLoading(true);
    try {
      const API_URL = Platform.OS === 'android' 
        ? 'http://10.0.2.2:3000'
        : 'http://localhost:3000';
        
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL || API_URL}/api/challenges/me?deviceId=${deviceId}`
      );
      
      if (!response.ok) {
        throw new Error('Failed to fetch challenges');
      }
      
      const data = await response.json();
      
      if (data.challenges && data.challenges.length > 0) {
        // Only take first 3 challenges
        setChallenges(data.challenges.slice(0, 3));
        setCurrentIndex(0);
        setDeniedChallenges([]);
      } else {
        Alert.alert(
          'No Challenges Yet',
          'Try a few activities first, then come back for personalized challenges!',
          [{ text: 'OK', onPress: () => navigation.goBack() }]
        );
      }
    } catch (error) {
      console.error('❌ Challenge fetch error:', error);
      Alert.alert(
        'Error',
        'Could not load challenges. Make sure the backend is running.',
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = () => {
    const challenge = challenges[currentIndex];
    console.log('✅ Challenge accepted:', challenge.name);

    // Convert challenge to activity format
    const activity = {
      id: challenge.activityId,
      activityId: challenge.activityId,
      name: challenge.name,
      description: challenge.description,
      category: challenge.category,
      region: challenge.region,
      city: challenge.city,
      energy_level: challenge.energy_level,
      venues: challenge.venues,
      simplifiedName: challenge.name,
      photos: [],
    };

    // Navigate to activity detail
    navigation.navigate('ActivityDetailScreenShell', {
      activity,
      userLocation,
    });
  };

  const handleDeny = () => {
    const challenge = challenges[currentIndex];
    console.log('❌ Challenge denied:', challenge.name);

    // Add to denied list
    setDeniedChallenges([...deniedChallenges, challenge.activityId]);

    // Animate card out
    translateX.value = withTiming(-SCREEN_WIDTH, { duration: 300 }, () => {
      runOnJS(moveToNextChallenge)();
    });
  };

  const moveToNextChallenge = () => {
    // Reset animation
    translateX.value = 0;
    translateY.value = 0;
    scale.value = 1;

    if (currentIndex < challenges.length - 1) {
      // Move to next challenge
      setCurrentIndex(currentIndex + 1);
    } else {
      // All challenges denied
      Alert.alert(
        'All Challenges Denied',
        'Want to see 3 more challenges?',
        [
          {
            text: 'No, Go Back',
            style: 'cancel',
            onPress: () => navigation.goBack(),
          },
          {
            text: 'Yes, Refresh',
            onPress: () => fetchChallenges(),
          },
        ]
      );
    }
  };

  const panGesture = Gesture.Pan()
    .onUpdate((event) => {
      translateX.value = event.translationX;
      translateY.value = event.translationY;
      
      // Scale down slightly when dragging
      const distance = Math.sqrt(event.translationX ** 2 + event.translationY ** 2);
      scale.value = Math.max(0.9, 1 - distance / 1000);
    })
    .onEnd((event) => {
      const swipeThreshold = 100;
      
      // Swipe left = Deny
      if (event.translationX < -swipeThreshold) {
        translateX.value = withTiming(-SCREEN_WIDTH, { duration: 300 }, () => {
          runOnJS(handleDeny)();
        });
      }
      // Swipe right = Accept
      else if (event.translationX > swipeThreshold) {
        translateX.value = withTiming(SCREEN_WIDTH, { duration: 300 }, () => {
          runOnJS(handleAccept)();
        });
      }
      // Snap back
      else {
        translateX.value = withSpring(0);
        translateY.value = withSpring(0);
        scale.value = withSpring(1);
      }
    });

  const cardAnimatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { scale: scale.value },
      { rotate: `${translateX.value / 20}deg` },
    ],
  }));

  if (loading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <OrbBackdrop variant="dark" />
        <ActivityIndicator size="large" color="#00AAFF" />
        <Text style={[typo.titleM, { color: colors.fg.primary, marginTop: 20 }]}>
          Finding your challenges...
        </Text>
      </View>
    );
  }

  if (challenges.length === 0) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <OrbBackdrop variant="dark" />
        <Text style={[typo.titleM, { color: colors.fg.primary }]}>
          No challenges available
        </Text>
      </View>
    );
  }

  const currentChallenge = challenges[currentIndex];
  const remainingCount = challenges.length - currentIndex;

  return (
    <GestureHandlerRootView style={styles.container}>
      <OrbBackdrop variant="dark" />
      
      <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backButtonText}>←</Text>
          </TouchableOpacity>
          
          <View style={styles.headerCenter}>
            <Text style={[typo.titleM, { color: colors.fg.primary }]}>
              ⚡ CHALLENGE ME
            </Text>
            <Text style={[typo.caption, { color: colors.fg.secondary }]}>
              {remainingCount} challenge{remainingCount !== 1 ? 's' : ''} remaining
            </Text>
          </View>
          
          <View style={{ width: 44 }} />
        </View>

        {/* Challenge Card */}
        <View style={styles.cardContainer}>
          <GestureDetector gesture={panGesture}>
            <Animated.View style={[styles.card, cardAnimatedStyle]}>
              <LinearGradient
                colors={['#FF6B6B', '#FF8E53', '#FFA07A']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.cardGradient}
              >
                <BlurView intensity={20} tint="dark" style={styles.cardContent}>
                  {/* Challenge Badge */}
                  <View style={styles.challengeBadge}>
                    <Text style={styles.challengeBadgeText}>
                      CHALLENGE #{currentIndex + 1}
                    </Text>
                  </View>

                  {/* Activity Name */}
                  <Text style={[typo.titleXL, styles.activityName]}>
                    {currentChallenge.name}
                  </Text>

                  {/* Challenge Reason */}
                  <View style={styles.reasonContainer}>
                    <Text style={[typo.body, styles.reasonText]}>
                      💪 {currentChallenge.challengeReason}
                    </Text>
                  </View>

                  {/* Description */}
                  <Text style={[typo.body, styles.description]}>
                    {currentChallenge.description}
                  </Text>

                  {/* Meta Info */}
                  <View style={styles.metaRow}>
                    <View style={styles.metaItem}>
                      <Text style={styles.metaLabel}>Category</Text>
                      <Text style={styles.metaValue}>{currentChallenge.category}</Text>
                    </View>
                    <View style={styles.metaItem}>
                      <Text style={styles.metaLabel}>Energy</Text>
                      <Text style={styles.metaValue}>{currentChallenge.energy_level}</Text>
                    </View>
                    <View style={styles.metaItem}>
                      <Text style={styles.metaLabel}>Location</Text>
                      <Text style={styles.metaValue}>{currentChallenge.city}</Text>
                    </View>
                  </View>

                  {/* Swipe Hint */}
                  <Text style={[typo.caption, styles.swipeHint]}>
                    👈 Swipe left to deny • Swipe right to accept 👉
                  </Text>
                </BlurView>
              </LinearGradient>
            </Animated.View>
          </GestureDetector>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionsContainer}>
          <TouchableOpacity
            style={[styles.actionButton, styles.denyButton]}
            onPress={handleDeny}
            activeOpacity={0.8}
          >
            <Text style={styles.denyButtonText}>✕</Text>
            <Text style={[typo.bodySmall, styles.buttonLabel]}>DENY</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.acceptButton]}
            onPress={handleAccept}
            activeOpacity={0.8}
          >
            <Text style={styles.acceptButtonText}>✓</Text>
            <Text style={[typo.bodySmall, styles.buttonLabel]}>ACCEPT</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0E17',
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButtonText: {
    fontSize: 24,
    color: '#FFFFFF',
  },
  headerCenter: {
    alignItems: 'center',
  },
  cardContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  card: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    borderRadius: 28,
    overflow: 'hidden',
  },
  cardGradient: {
    flex: 1,
    padding: 3,
  },
  cardContent: {
    flex: 1,
    borderRadius: 25,
    padding: 24,
    justifyContent: 'space-between',
  },
  challengeBadge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  challengeBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1,
  },
  activityName: {
    color: '#FFFFFF',
    fontSize: 32,
    fontWeight: '700',
    textAlign: 'center',
    marginTop: 20,
  },
  reasonContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    padding: 16,
    borderRadius: 16,
    marginVertical: 16,
  },
  reasonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  description: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 16,
  },
  metaItem: {
    alignItems: 'center',
  },
  metaLabel: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  metaValue: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    marginTop: 4,
  },
  swipeHint: {
    color: 'rgba(255, 255, 255, 0.5)',
    textAlign: 'center',
    marginTop: 12,
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingBottom: 40,
    gap: 40,
  },
  actionButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  denyButton: {
    backgroundColor: '#FF4444',
  },
  acceptButton: {
    backgroundColor: '#00DD88',
  },
  denyButtonText: {
    fontSize: 36,
    color: '#FFFFFF',
    fontWeight: '700',
  },
  acceptButtonText: {
    fontSize: 36,
    color: '#FFFFFF',
    fontWeight: '700',
  },
  buttonLabel: {
    color: '#FFFFFF',
    fontWeight: '700',
    marginTop: 4,
    fontSize: 11,
    letterSpacing: 0.5,
  },
});
