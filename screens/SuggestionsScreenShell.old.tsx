/**
 * SuggestionsScreenShell
 * Shows 5 activity suggestions with mini cards and bottom AI bar
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useNavigation, useRoute, RouteProp, NavigationProp } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { OrbBackdrop } from '../ui/components/OrbBackdrop';
import { ShellHeader } from '../ui/components/ShellHeader';
import { AIQueryBar } from '../ui/components/AIQueryBar';
import { Activity } from '../ui/blocks/ActivityMiniCard';
import { SwipeableCardStack, SwipeableActivity } from '../ui/components/SwipeableCardStack';
import { ActivityDetailModal } from '../ui/components/ActivityDetailModal';
import { theme } from '../ui/theme/tokens';
import { chatApi } from '../src/services/chatApi';
import { FilterOptions } from '../components/filters/ActivityFilters';
import { getSmartSimplifiedName } from '../utils/activityNameSimplifier';

type RootStackParamList = {
  SuggestionsScreenShell: {
    conversationId: number;
    deviceId: string;
    userMessage: string;
    filters?: FilterOptions;
    userLocation?: { latitude: number; longitude: number };
  };
  ActivityDetailScreenShell: {
    activity: Activity;
    userLocation?: { latitude: number; longitude: number };
  };
  ActivityDetail: {
    activity: Activity;
    userLocation?: { latitude: number; longitude: number };
  };
  UserProfile: undefined;
};

export const SuggestionsScreenShell: React.FC = () => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const route = useRoute<RouteProp<RootStackParamList, 'SuggestionsScreenShell'>>();
  const { conversationId, deviceId, userMessage, filters, userLocation } = route.params;

  const [activities, setActivities] = useState<SwipeableActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState<SwipeableActivity | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  const colors = theme.colors;
  const typo = theme.typography;

  useEffect(() => {
    loadActivities();
  }, []);

  const loadActivities = async (showRefreshing = false) => {
    try {
      if (showRefreshing) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const location = {
        city: 'Bucharest',
        lat: userLocation?.latitude || 44.4268,
        lng: userLocation?.longitude || 26.1025,
      };

      const response = await chatApi.sendMessage({
        conversationId,
        message: userMessage,
        location,
        filters,
      });

      // Extract up to 5 activities and rank them
      const extractedActivities = response.activities?.slice(0, 5) || [];
      
      // Calculate relevance score based on vibe keywords
      const calculateRelevanceScore = (activity: any, vibe: string): number => {
        const vibeLower = vibe.toLowerCase();
        const activityName = (activity.name || '').toLowerCase();
        const activityCategory = (activity.category || activity.bucket || '').toLowerCase();
        const activityDesc = (activity.description || '').toLowerCase();
        
        let score = 0;
        
        // Extract vibe keywords
        const vibeKeywords = vibeLower.split(/\s+/).filter(w => w.length > 3);
        
        // Category matching (highest weight)
        if (vibeKeywords.some(keyword => activityCategory.includes(keyword))) {
          score += 50; // Strong match if category matches vibe
        }
        
        // Name matching (medium weight)
        vibeKeywords.forEach(keyword => {
          if (activityName.includes(keyword)) {
            score += 20;
          }
        });
        
        // Description matching (lower weight)
        vibeKeywords.forEach(keyword => {
          if (activityDesc.includes(keyword)) {
            score += 5;
          }
        });
        
        // Boost adventure category for adventure-related vibes
        if (vibeLower.includes('adventure') && activityCategory === 'adventure') {
          score += 30;
        }
        
        // Penalize mismatches (e.g., sports when asking for adventure)
        if (vibeLower.includes('adventure') && activityCategory === 'sports') {
          score -= 20;
        }
        
        return Math.max(0, score); // Ensure non-negative
      };
      
      // Transform to SwipeableActivity with relevance-based ranking
      const swipeableActivities: SwipeableActivity[] = extractedActivities.map((act, index) => {
        const relevanceScore = calculateRelevanceScore(act, userMessage);
        
        return {
          id: act.id || act.activityId || index,
          name: act.name || 'Unknown Activity',
          simplifiedName: getSmartSimplifiedName(act.name || '', act.category),
          description: act.description || 'No description available',
          category: act.category || act.bucket || 'general',
          imageUrl: act.imageUrl || act.photoUrl,
          region: act.region,
          city: act.city,
          matchScore: relevanceScore, // Use calculated relevance score
          venues: act.venues || [],
          duration_min: act.durationMinutes || act.duration_min,
          photos: act.photos || (act.imageUrl ? [act.imageUrl] : []),
          weather: act.weather, // Pass through weather data from backend
        };
      });
      
      // Sort by relevance score (highest first)
      swipeableActivities.sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0));
      
      // Normalize scores to 100% → 40% range for display
      const maxScore = swipeableActivities[0]?.matchScore || 100;
      swipeableActivities.forEach((act, index) => {
        const normalizedScore = maxScore > 0 ? (act.matchScore || 0) / maxScore : 1;
        act.matchScore = Math.max(0.4, normalizedScore); // 100% to 40%
      });
      
      // Debug logging
      console.log('\n📊 RANKED ACTIVITIES:');
      console.log('Total activities:', swipeableActivities.length);
      console.log('Raw response:', JSON.stringify(response, null, 2));
      swipeableActivities.forEach((act, idx) => {
        console.log(`\n#${idx + 1} (${Math.round((act.matchScore || 0) * 100)}% match):`, {
          name: act.name,
          simplified: act.simplifiedName,
          category: act.category,
          hasImage: !!act.imageUrl,
          imageUrl: act.imageUrl,
        });
      });
      
      console.log('\n🎯 Setting activities state:', swipeableActivities.length);
      setActivities(swipeableActivities);
      console.log('\n✅ Activities state set');
    } catch (error) {
      console.error('❌ Failed to load activities:', error);
      console.error('Error details:', JSON.stringify(error, null, 2));
      Alert.alert('Error', 'Failed to load suggestions. Please try again.');
    } finally {
      console.log('\n🏁 Loading complete. Activities count:', activities.length);
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleCardPress = (activity: SwipeableActivity) => {
    setSelectedActivity(activity);
    setShowDetailModal(true);
  };

  const handleCloseModal = () => {
    setShowDetailModal(false);
    setTimeout(() => setSelectedActivity(null), 300);
  };

  const handleExploreActivity = () => {
    if (!selectedActivity) return;
    
    // Convert SwipeableActivity back to Activity for navigation
    const fullActivity: Activity = {
      id: String(selectedActivity.id),
      name: selectedActivity.name,
      description: selectedActivity.description,
      category: selectedActivity.category,
      imageUrl: selectedActivity.imageUrl,
      region: selectedActivity.region,
      city: selectedActivity.city,
      venues: selectedActivity.venues || [],
      duration_min: selectedActivity.duration_min,
      photos: selectedActivity.photos,
    };
    
    console.log('🚀 Navigating to detail with activity:', {
      id: fullActivity.id,
      name: fullActivity.name,
      venuesCount: fullActivity.venues?.length || 0,
    });
    
    handleCloseModal();
    navigation.navigate('ActivityDetailScreenShell', {
      activity: fullActivity,
      userLocation,
    });
  };

  const handleWantDifferent = () => {
    loadActivities(true);
  };

  const handleBack = () => {
    navigation.goBack();
  };

  const handleProfile = () => {
    navigation.navigate('UserProfile');
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <OrbBackdrop variant="dark" />
        <ActivityIndicator size="large" color={colors.gradient.primary.from} />
        <Text style={[typo.body, { color: colors.fg.secondary, marginTop: 16 }]}>
          Finding your vibe...
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Background */}
      <OrbBackdrop variant="dark" />

      {/* Header */}
      <ShellHeader
        showBack={true}
        showProfile={true}
        onBack={handleBack}
        onProfile={handleProfile}
        testID="suggestions-header"
      />

      {/* Content */}
      <SafeAreaView style={styles.content} edges={['bottom']}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.gradient.primary.from} />
            <Text style={[typo.body, styles.loadingText, { color: colors.fg.secondary }]}>
              Finding your vibe...
            </Text>
          </View>
        ) : activities.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={[typo.titleM, { color: colors.fg.primary, marginBottom: 8 }]}>
              No activities found
            </Text>
            <Text style={[typo.body, { color: colors.fg.secondary, textAlign: 'center' }]}>
              Try a different vibe or adjust your filters
            </Text>
          </View>
        ) : (
          <>
            {/* Swipeable Card Stack */}
            <View style={styles.stackContainer}>
              <SwipeableCardStack
                activities={activities}
                onCardPress={handleCardPress}
                onRefresh={handleWantDifferent}
              />
            </View>

            {/* Bottom AI Bar */}
            <View style={styles.aiBarContainer}>
              <AIQueryBar
                placeholder="Want something different? 🎭"
                onSubmit={handleWantDifferent}
                testID="regenerate-bar"
              />
            </View>

            {/* Detail Modal */}
            {selectedActivity && (
              <ActivityDetailModal
                activity={selectedActivity}
                visible={showDetailModal}
                onClose={handleCloseModal}
                onExplore={handleExploreActivity}
              />
            )}
          </>
        )}
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingTop: 100, // Below header - more space to prevent cutoff
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  stackContainer: {
    flex: 1,
    marginTop: -50, // Pull up to use more screen space
  },
  aiBarContainer: {
    position: 'absolute',
    bottom: 30,
    left: 20,
    right: 20,
  },
  aiBarIcon: {
    fontSize: 20,
  },
});
