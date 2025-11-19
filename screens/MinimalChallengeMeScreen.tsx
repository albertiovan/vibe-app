/**
 * MinimalChallengeMeScreen
 * Monochrome minimal design for Challenge Me feature
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Platform,
  ActivityIndicator,
  Modal,
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

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const CARD_WIDTH = SCREEN_WIDTH * 0.9;

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
  HomeScreenMinimal: undefined;
};

type ChallengeMeScreenRouteProp = RouteProp<RootStackParamList, 'ChallengeMeScreen'>;

export const MinimalChallengeMeScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const route = useRoute<ChallengeMeScreenRouteProp>();
  const { deviceId, userLocation } = route.params;

  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showMoreSuggestionsModal, setShowMoreSuggestionsModal] = useState(false);

  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const scale = useSharedValue(1);

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
        `${API_URL}/api/challenges/me?deviceId=${deviceId}${
          userLocation ? `&lat=${userLocation.latitude}&lng=${userLocation.longitude}` : ''
        }`
      );
      
      const data = await response.json();
      setChallenges(data.challenges || []);
    } catch (error) {
      console.error('Failed to load challenges:', error);
      setChallenges([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = () => {
    const challenge = challenges[currentIndex];
    
    // Navigate to activity detail
    navigation.navigate('ActivityDetailScreenShell', {
      activity: {
        id: challenge.activityId,
        name: challenge.name,
        description: challenge.description,
        category: challenge.category,
        city: challenge.city,
        region: challenge.region,
        energy_level: challenge.energy_level,
        venues: challenge.venues,
      },
      userLocation,
    });
  };

  const handleDeny = () => {
    // Move to next challenge
    if (currentIndex < challenges.length - 1) {
      setCurrentIndex(currentIndex + 1);
      resetCard();
    } else {
      // All challenges denied, show more suggestions modal
      setShowMoreSuggestionsModal(true);
    }
  };

  const handleMoreSuggestions = async () => {
    setShowMoreSuggestionsModal(false);
    setLoading(true);
    
    try {
      // Fetch more challenges
      await fetchChallenges();
      // Reset to first challenge
      setCurrentIndex(0);
      resetCard();
    } catch (error) {
      console.error('Failed to load more challenges:', error);
      // If fetch fails, go back to home
      navigation.navigate('HomeScreenMinimal');
    }
  };

  const handleGoHome = () => {
    setShowMoreSuggestionsModal(false);
    navigation.navigate('HomeScreenMinimal');
  };

  const resetCard = () => {
    translateX.value = 0;
    translateY.value = 0;
    scale.value = 1;
  };

  const panGesture = Gesture.Pan()
    .onUpdate((event) => {
      translateX.value = event.translationX;
      translateY.value = event.translationY;
      
      const distance = Math.sqrt(event.translationX ** 2 + event.translationY ** 2);
      scale.value = Math.max(0.95, 1 - distance / 1000);
    })
    .onEnd((event) => {
      const swipeThreshold = 100;
      
      if (event.translationX < -swipeThreshold) {
        translateX.value = withTiming(-SCREEN_WIDTH, { duration: 300 }, () => {
          runOnJS(handleDeny)();
        });
      } else if (event.translationX > swipeThreshold) {
        translateX.value = withTiming(SCREEN_WIDTH, { duration: 300 }, () => {
          runOnJS(handleAccept)();
        });
      } else {
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
        <ActivityIndicator size="large" color="#FFFFFF" />
        <Text style={styles.loadingText}>Finding your challenges...</Text>
      </View>
    );
  }

  if (challenges.length === 0) {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Text style={styles.backText}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Challenge Me</Text>
          <View style={styles.headerSpacer} />
        </View>
        <View style={styles.centerContent}>
          <Text style={styles.emptyText}>No challenges available</Text>
          <TouchableOpacity style={styles.retryButton} onPress={fetchChallenges}>
            <Text style={styles.retryButtonText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const currentChallenge = challenges[currentIndex];
  const remainingCount = challenges.length - currentIndex;

  return (
    <GestureHandlerRootView style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backText}>←</Text>
          </TouchableOpacity>
          
          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>⚡ CHALLENGE ME</Text>
            <Text style={styles.headerSubtitle}>
              {remainingCount} challenge{remainingCount !== 1 ? 's' : ''} remaining
            </Text>
          </View>
          
          <View style={styles.headerSpacer} />
        </View>

        {/* Challenge Card */}
        <View style={styles.cardContainer}>
          <GestureDetector gesture={panGesture}>
            <Animated.View style={[styles.card, cardAnimatedStyle]}>
              {/* Challenge Badge */}
              <View style={styles.challengeBadge}>
                <Text style={styles.challengeBadgeText}>
                  CHALLENGE #{currentIndex + 1}
                </Text>
              </View>

              {/* Activity Name */}
              <Text style={styles.activityName}>
                {currentChallenge.name}
              </Text>

              {/* Challenge Reason */}
              <View style={styles.reasonContainer}>
                <Text style={styles.reasonText}>
                  💪 {currentChallenge.challengeReason}
                </Text>
              </View>

              {/* Description */}
              <Text style={styles.description}>
                {currentChallenge.description}
              </Text>

              {/* Meta Info */}
              <View style={styles.metaRow}>
                <View style={styles.metaItem}>
                  <Text style={styles.metaLabel}>CATEGORY</Text>
                  <Text style={styles.metaValue} numberOfLines={2}>{currentChallenge.category}</Text>
                </View>
                <View style={styles.metaItem}>
                  <Text style={styles.metaLabel}>ENERGY</Text>
                  <Text style={styles.metaValue} numberOfLines={1}>{currentChallenge.energy_level}</Text>
                </View>
                <View style={styles.metaItem}>
                  <Text style={styles.metaLabel}>LOCATION</Text>
                  <Text 
                    style={styles.metaValue} 
                    numberOfLines={2}
                    adjustsFontSizeToFit
                    minimumFontScale={0.7}
                  >
                    {currentChallenge.city}
                  </Text>
                </View>
              </View>

              {/* Swipe Hint */}
              <Text style={styles.swipeHint}>
                Swipe left to deny • Swipe right to accept
              </Text>
            </Animated.View>
          </GestureDetector>
        </View>

        {/* Action Buttons - Minimal & Sleek */}
        <View style={styles.actionsContainer}>
          <TouchableOpacity
            style={styles.denyButton}
            onPress={handleDeny}
            activeOpacity={0.7}
          >
            <Text style={styles.denyButtonText}>✕ Deny</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.acceptButton}
            onPress={handleAccept}
            activeOpacity={0.7}
          >
            <Text style={styles.acceptButtonText}>✓ Accept</Text>
          </TouchableOpacity>
        </View>

        {/* More Suggestions Modal */}
        <Modal
          visible={showMoreSuggestionsModal}
          transparent
          animationType="fade"
          onRequestClose={handleGoHome}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>All Challenges Rejected</Text>
              <Text style={styles.modalMessage}>
                Would you like to see more suggestions?
              </Text>
              
              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={styles.modalButtonSecondary}
                  onPress={handleGoHome}
                  activeOpacity={0.7}
                >
                  <Text style={styles.modalButtonSecondaryText}>No, Go Home</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={styles.modalButtonPrimary}
                  onPress={handleMoreSuggestions}
                  activeOpacity={0.7}
                >
                  <Text style={styles.modalButtonPrimaryText}>Yes, More!</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.6)',
    marginTop: 16,
  },
  emptyText: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.6)',
    marginBottom: 24,
  },
  retryButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  retryButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
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
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backText: {
    fontSize: 24,
    color: '#FFFFFF',
  },
  headerCenter: {
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 1,
  },
  headerSubtitle: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.5)',
    marginTop: 2,
  },
  headerSpacer: {
    width: 40,
  },
  cardContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  card: {
    width: CARD_WIDTH,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    padding: 24,
    minHeight: SCREEN_HEIGHT * 0.55,
    justifyContent: 'space-between',
  },
  challengeBadge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  challengeBadgeText: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
  },
  activityName: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFFFFF',
    marginTop: 16,
    lineHeight: 34,
  },
  reasonContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    padding: 16,
    borderRadius: 12,
    marginTop: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  reasonText: {
    fontSize: 15,
    color: 'rgba(255, 255, 255, 0.9)',
    lineHeight: 22,
  },
  description: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
    lineHeight: 21,
    marginTop: 16,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 24,
    paddingHorizontal: 16,
    gap: 8,
  },
  metaItem: {
    alignItems: 'center',
    flex: 1,
    maxWidth: 110,
  },
  metaLabel: {
    color: 'rgba(255, 255, 255, 0.5)',
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  metaValue: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
    marginTop: 6,
    textAlign: 'center',
    width: '100%',
  },
  swipeHint: {
    color: 'rgba(255, 255, 255, 0.4)',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 16,
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 32,
    gap: 16,
  },
  denyButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
  },
  acceptButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
  },
  denyButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.8)',
  },
  acceptButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#000000',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  modalContent: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    padding: 32,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 12,
    textAlign: 'center',
  },
  modalMessage: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  modalButtonSecondary: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
  },
  modalButtonSecondaryText: {
    fontSize: 15,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.8)',
  },
  modalButtonPrimary: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
  },
  modalButtonPrimaryText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#000000',
  },
});
