/**
 * Challenge Me Component
 * 
 * Suggests 3 personalized challenges based on user's past behavior
 * Pushes users outside their comfort zone to try new activities
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Animated,
  Dimensions,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
// @ts-ignore - Expo vector icons
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../src/design-system/colors';
import { tokens } from '../src/design-system/tokens';

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
  }>;
}

interface ChallengeMeProps {
  deviceId: string;
  onChallengeAccepted?: (challenge: Challenge) => void;
}

export const ChallengeMe: React.FC<ChallengeMeProps> = ({ deviceId, onChallengeAccepted }) => {
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [loading, setLoading] = useState(false);
  const [acceptedChallengeId, setAcceptedChallengeId] = useState<number | null>(null);
  const [showAcceptedAnimation, setShowAcceptedAnimation] = useState(false);
  const [selectedChallenge, setSelectedChallenge] = useState<Challenge | null>(null);
  
  const scaleAnim = new Animated.Value(0);
  const fadeAnim = new Animated.Value(0);

  const fetchChallenges = async () => {
    if (!deviceId) {
      console.log('⚠️ No deviceId yet, skipping challenge load');
      return;
    }
    
    setLoading(true);
    try {
      // Use platform-specific API URL
      const API_URL = Platform.OS === 'android' 
        ? 'http://10.0.2.2:3000'
        : 'http://localhost:3000';
        
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL || API_URL}/api/challenges/me?deviceId=${deviceId}`
      );
      
      if (!response.ok) {
        // Silently handle - normal for new users with no history
        if (__DEV__) {
          console.log('📋 No challenges yet (backend may not be running or no user history)');
        }
        setChallenges([]);
        return;
      }
      
      const data = await response.json();
      setChallenges(data.challenges || []);
      console.log('🎯 Loaded', data.challenges.length, 'challenges');
      
    } catch (error) {
      // Network error - silently handle
      if (__DEV__) {
        console.log('📋 Challenge Me: Backend not reachable');
      }
      setChallenges([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async (challenge: Challenge) => {
    console.log('✅ User accepted challenge:', challenge.name);
    
    // Record response
    try {
      await fetch(
        `${process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000'}/api/challenges/respond`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            deviceId,
            activityId: challenge.activityId,
            response: 'accepted',
            challengeReason: challenge.challengeReason
          })
        }
      );
    } catch (error) {
      console.error('Failed to record accept:', error);
    }

    // Show acceptance animation
    setSelectedChallenge(challenge);
    setAcceptedChallengeId(challenge.activityId);
    setShowAcceptedAnimation(true);

    // Animate
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      })
    ]).start();

    // Call parent callback after animation
    setTimeout(() => {
      onChallengeAccepted?.(challenge);
    }, 1500);
  };

  const handleDecline = async (challenge: Challenge) => {
    console.log('❌ User declined challenge:', challenge.name);
    
    // Record response
    try {
      await fetch(
        `${process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000'}/api/challenges/respond`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            deviceId,
            activityId: challenge.activityId,
            response: 'declined',
            challengeReason: challenge.challengeReason
          })
        }
      );
    } catch (error) {
      console.error('Failed to record decline:', error);
    }

    // Remove from list
    setChallenges(prev => prev.filter(c => c.activityId !== challenge.activityId));
  };

  const getCategoryIcon = (category: string): string => {
    const icons: Record<string, string> = {
      'sports': 'fitness',
      'adventure': 'rocket',
      'nature': 'leaf',
      'creative': 'brush',
      'fitness': 'barbell',
      'water': 'water',
      'wellness': 'heart',
      'culinary': 'restaurant',
      'nightlife': 'moon',
      'culture': 'library',
      'learning': 'school'
    };
    return icons[category] || 'star';
  };

  const getCategoryGradient = (category: string): [string, string] => {
    const gradients: Record<string, [string, string]> = {
      'sports': ['#FF6B6B', '#FF8E53'],
      'adventure': ['#4ECDC4', '#44A08D'],
      'nature': ['#11998E', '#38EF7D'],
      'creative': ['#A770EF', '#CF8BF3'],
      'fitness': ['#FA709A', '#FEE140'],
      'water': ['#4FACFE', '#00F2FE'],
      'wellness': ['#F093FB', '#F5576C'],
      'culinary': ['#FDC830', '#F37335'],
      'nightlife': ['#667EEA', '#764BA2'],
      'culture': ['#FA8BFF', '#2BD2FF'],
      'learning': ['#4FACFE', '#00F2FE']
    };
    return gradients[category] || ['#667EEA', '#764BA2'];
  };

  // Accepted Animation Overlay
  if (showAcceptedAnimation && selectedChallenge) {
    return (
      <View style={styles.acceptedOverlay}>
        <Animated.View
          style={[
            styles.acceptedCard,
            {
              transform: [{ scale: scaleAnim }],
              opacity: fadeAnim,
            }
          ]}
        >
          <LinearGradient
            colors={['#11998E', '#38EF7D']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.acceptedGradient}
          >
            <Ionicons name="checkmark-circle" size={80} color="#fff" />
            <Text style={styles.acceptedTitle}>Challenge Accepted!</Text>
            <Text style={styles.acceptedSubtitle}>{selectedChallenge.name}</Text>
            <Text style={styles.acceptedLocation}>
              {selectedChallenge.isLocal ? '📍 In your city' : `✈️ ${selectedChallenge.region}`}
            </Text>
          </LinearGradient>
        </Animated.View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.header}
        onPress={fetchChallenges}
        activeOpacity={0.8}
      >
        <LinearGradient
          colors={['#667EEA', '#764BA2']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.headerGradient}
        >
          <View style={styles.headerContent}>
            <View style={styles.headerLeft}>
              <Ionicons name="flash" size={24} color="#fff" style={styles.headerIcon} />
              <Text style={styles.headerTitle}>Challenge Me</Text>
            </View>
            <Text style={styles.headerSubtitle}>Try something new!</Text>
          </View>
        </LinearGradient>
      </TouchableOpacity>

      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#667EEA" />
          <Text style={styles.loadingText}>Finding your perfect challenges...</Text>
        </View>
      )}

      {!loading && challenges.length > 0 && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.challengesScroll}
        >
          {challenges.map((challenge, index) => (
            <View key={challenge.activityId} style={styles.challengeCard}>
              <LinearGradient
                colors={getCategoryGradient(challenge.category)}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.challengeGradient}
              >
                {/* Challenge Number Badge */}
                <View style={styles.challengeBadge}>
                  <Text style={styles.challengeBadgeText}>#{index + 1}</Text>
                </View>

                {/* Category Icon */}
                <View style={styles.iconContainer}>
                  <Ionicons 
                    name={getCategoryIcon(challenge.category) as any} 
                    size={40} 
                    color="#fff" 
                  />
                </View>

                {/* Activity Info */}
                <Text style={styles.challengeName} numberOfLines={2}>
                  {challenge.name}
                </Text>
                
                <View style={styles.challengeDetails}>
                  <View style={styles.detailBadge}>
                    <Ionicons name="flash" size={14} color="#fff" />
                    <Text style={styles.detailText}>{challenge.energy_level}</Text>
                  </View>
                  <View style={styles.detailBadge}>
                    <Ionicons 
                      name={challenge.isLocal ? 'home' : 'airplane'} 
                      size={14} 
                      color="#fff" 
                    />
                    <Text style={styles.detailText}>
                      {challenge.isLocal ? 'Local' : challenge.region}
                    </Text>
                  </View>
                </View>

                {/* Challenge Reason */}
                <Text style={styles.challengeReason} numberOfLines={3}>
                  {challenge.challengeReason}
                </Text>

                {/* Venue Info */}
                {challenge.venues.length > 0 && (
                  <View style={styles.venueInfo}>
                    <Ionicons name="location" size={12} color="rgba(255,255,255,0.8)" />
                    <Text style={styles.venueText} numberOfLines={1}>
                      {challenge.venues[0].name}
                    </Text>
                  </View>
                )}

                {/* Action Buttons */}
                <View style={styles.actionButtons}>
                  <TouchableOpacity
                    style={[styles.actionButton, styles.declineButton]}
                    onPress={() => handleDecline(challenge)}
                    disabled={acceptedChallengeId !== null}
                  >
                    <Ionicons name="close-circle" size={20} color="#fff" />
                    <Text style={styles.buttonText}>Pass</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.actionButton, styles.acceptButton]}
                    onPress={() => handleAccept(challenge)}
                    disabled={acceptedChallengeId !== null}
                  >
                    <Ionicons name="checkmark-circle" size={20} color="#fff" />
                    <Text style={styles.buttonText}>Accept</Text>
                  </TouchableOpacity>
                </View>
              </LinearGradient>
            </View>
          ))}
        </ScrollView>
      )}

      {!loading && challenges.length === 0 && (
        <View style={styles.emptyState}>
          <Ionicons name="flash-outline" size={48} color={colors.text.secondary} />
          <Text style={styles.emptyText}>Tap to discover new challenges!</Text>
        </View>
      )}
    </View>
  );
};

const { width } = Dimensions.get('window');
const CARD_WIDTH = width * 0.75;

const styles = StyleSheet.create({
  container: {
    marginVertical: tokens.spacing.md,
  },
  header: {
    borderRadius: tokens.radius.lg,
    overflow: 'hidden',
    marginHorizontal: tokens.spacing.md,
    marginBottom: tokens.spacing.sm,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  headerGradient: {
    padding: tokens.spacing.md,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerIcon: {
    marginRight: tokens.spacing.xs,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
    fontWeight: '500',
  },
  loadingContainer: {
    padding: tokens.spacing.xl,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: tokens.spacing.sm,
    color: colors.text.secondary,
    fontSize: 14,
  },
  challengesScroll: {
    paddingHorizontal: tokens.spacing.md,
    paddingVertical: tokens.spacing.xs,
  },
  challengeCard: {
    width: CARD_WIDTH,
    marginRight: tokens.spacing.md,
    borderRadius: tokens.radius.xl,
    overflow: 'hidden',
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  challengeGradient: {
    padding: tokens.spacing.lg,
    minHeight: 320,
  },
  challengeBadge: {
    position: 'absolute',
    top: tokens.spacing.sm,
    right: tokens.spacing.sm,
    backgroundColor: 'rgba(0,0,0,0.3)',
    paddingHorizontal: tokens.spacing.sm,
    paddingVertical: 4,
    borderRadius: 999,
  },
  challengeBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: tokens.spacing.sm,
  },
  challengeName: {
    fontSize: 22,
    fontWeight: '700',
    color: '#fff',
    marginBottom: tokens.spacing.xs,
  },
  challengeDetails: {
    flexDirection: 'row',
    marginBottom: tokens.spacing.sm,
  },
  detailBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: tokens.spacing.sm,
    paddingVertical: 4,
    borderRadius: 999,
    marginRight: tokens.spacing.xs,
  },
  detailText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  challengeReason: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.95)',
    lineHeight: 20,
    marginBottom: tokens.spacing.sm,
  },
  venueInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: tokens.spacing.md,
  },
  venueText: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
    marginLeft: 4,
    flex: 1,
  },
  actionButtons: {
    flexDirection: 'row',
    marginTop: 'auto',
    gap: tokens.spacing.sm,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: tokens.spacing.sm,
    borderRadius: tokens.radius.lg,
    gap: 6,
  },
  declineButton: {
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  acceptButton: {
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  emptyState: {
    alignItems: 'center',
    padding: tokens.spacing.xl,
  },
  emptyText: {
    color: colors.text.secondary,
    fontSize: 14,
    marginTop: tokens.spacing.sm,
  },
  acceptedOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.9)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
  acceptedCard: {
    width: width * 0.8,
    borderRadius: tokens.radius.xl,
    overflow: 'hidden',
  },
  acceptedGradient: {
    padding: tokens.spacing.xl * 2,
    alignItems: 'center',
  },
  acceptedTitle: {
    fontSize: 32,
    fontWeight: '800',
    color: '#fff',
    marginTop: tokens.spacing.lg,
    marginBottom: tokens.spacing.xs,
  },
  acceptedSubtitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#fff',
    textAlign: 'center',
    marginBottom: tokens.spacing.sm,
  },
  acceptedLocation: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.9)',
  },
});
