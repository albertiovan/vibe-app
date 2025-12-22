/**
 * SuggestionsScreenShell (New Version)
 * 
 * Horizontal swipeable activity cards with Accept/Deny buttons
 * Full-screen cards with comprehensive information
 * ML-ready with accept/deny tracking
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  ActivityIndicator,
  Alert,
  FlatList,
  Dimensions,
  Text,
  TouchableOpacity,
} from 'react-native';
import { useNavigation, useRoute, RouteProp, NavigationProp } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { OrbBackdrop } from '../ui/components/OrbBackdrop';
import { ActivitySuggestionCard } from '../ui/blocks/ActivitySuggestionCard';
import { LoadingShimmer } from '../ui/components/LoadingShimmer';
import { theme } from '../ui/theme/tokens';
import { chatApi } from '../src/services/chatApi';
import { FilterOptions } from '../components/filters/ActivityFilters';
import { useLanguage } from '../src/i18n/LanguageContext';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

type RootStackParamList = {
  SuggestionsScreenShell: {
    conversationId: number;
    deviceId: string;
    userMessage: string;
    filters?: FilterOptions;
    userLocation?: { latitude: number; longitude: number };
  };
  ActivityAcceptedScreen: {
    activity: any;
    userLocation?: { latitude: number; longitude: number };
  };
  UserProfile: undefined;
};

export const SuggestionsScreenShell: React.FC = () => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const route = useRoute<RouteProp<RootStackParamList, 'SuggestionsScreenShell'>>();
  const { conversationId, deviceId, userMessage, filters, userLocation } = route.params;
  const { t } = useLanguage();

  const [activities, setActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [hasShownMorePrompt, setHasShownMorePrompt] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  const colors = theme.colors;
  const typo = theme.typography;

  useEffect(() => {
    loadActivities();
  }, []);

  const loadActivities = async () => {
    try {
      setLoading(true);

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

      if (response.activities && response.activities.length > 0) {
        setActivities(response.activities);
        console.log(`✅ Loaded ${response.activities.length} activities`);
      } else {
        Alert.alert(t('suggestions.title'), t('suggestions.empty'));
        navigation.goBack();
      }
    } catch (error) {
      console.error('❌ Failed to load activities:', error);
      Alert.alert(t('common.error'), t('error.generic'));
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async (activity: any) => {
    console.log('✅ Activity accepted:', activity.name);

    // Track acceptance for ML
    try {
      await fetch(`${process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000'}/api/activities/feedback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          deviceId,
          activityId: activity.id || activity.activityId,
          action: 'accepted',
          userMessage,
          filters,
        }),
      });
    } catch (error) {
      console.error('Failed to track acceptance:', error);
    }

    // Navigate to accepted screen
    navigation.navigate('ActivityAcceptedScreen', {
      activity,
      userLocation,
    });
  };

  const handleDeny = async (activity: any) => {
    console.log('❌ Activity denied:', activity.name);

    // Track denial for ML
    try {
      await fetch(`${process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000'}/api/activities/feedback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          deviceId,
          activityId: activity.id || activity.activityId,
          action: 'denied',
          userMessage,
          filters,
        }),
      });
    } catch (error) {
      console.error('Failed to track denial:', error);
    }

    // Move to next activity
    if (currentIndex < activities.length - 1) {
      const nextIndex = currentIndex + 1;
      setCurrentIndex(nextIndex);
      flatListRef.current?.scrollToIndex({ index: nextIndex, animated: true });
    } else {
      // All activities denied
      Alert.alert(
        'All Activities Reviewed',
        'You\'ve reviewed all suggestions. Would you like to search again?',
        [
          { text: 'Go Back', onPress: () => navigation.goBack() },
          { text: 'Search Again', onPress: () => navigation.goBack() },
        ]
      );
    }
  };

  const handleScroll = (event: any) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    const index = Math.round(offsetX / SCREEN_WIDTH);
    setCurrentIndex(index);
    
    // Check if user swiped past the last card
    if (index >= activities.length && !hasShownMorePrompt) {
      setHasShownMorePrompt(true);
      
      Alert.alert(
        'Want More Activities?',
        'Would you like to see more activity suggestions?',
        [
          { 
            text: 'No Thanks', 
            style: 'cancel',
            onPress: () => {
              // Scroll back to last card
              flatListRef.current?.scrollToIndex({ index: activities.length - 1, animated: true });
            }
          },
          { 
            text: 'Yes, Show More', 
            onPress: async () => {
              // Load more activities
              await loadMoreActivities();
            }
          },
        ]
      );
    }
  };
  
  const loadMoreActivities = async () => {
    try {
      setLoading(true);

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

      if (response.activities && response.activities.length > 0) {
        // Add new activities to existing ones
        setActivities(prev => [...prev, ...response.activities]);
        setHasShownMorePrompt(false); // Reset so they can request more again
        console.log(`✅ Loaded ${response.activities.length} more activities`);
      } else {
        Alert.alert('No More Activities', 'No additional activities found. Try different filters.');
        flatListRef.current?.scrollToIndex({ index: activities.length - 1, animated: true });
      }
    } catch (error) {
      console.error('❌ Failed to load more activities:', error);
      Alert.alert('Error', 'Failed to load more activities.');
      flatListRef.current?.scrollToIndex({ index: activities.length - 1, animated: true });
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    navigation.goBack();
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <OrbBackdrop variant="dark" />
        <LoadingShimmer text="Matching your vibe..." />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <OrbBackdrop variant="dark" />

      {/* Back Button */}
      <SafeAreaView style={styles.backButtonContainer} edges={['top']}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
      </SafeAreaView>

      {/* Horizontal Swipeable Cards */}
      <FlatList
        ref={flatListRef}
        data={activities}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        keyExtractor={(item, index) => `${item.id || item.activityId}-${index}`}
        renderItem={({ item, index }) => (
          <ActivitySuggestionCard
            activity={item}
            userLocation={userLocation}
            onAccept={() => handleAccept(item)}
            onDeny={() => handleDeny(item)}
            currentIndex={currentIndex}
            totalCount={activities.length}
          />
        )}
        getItemLayout={(data, index) => ({
          length: SCREEN_WIDTH,
          offset: SCREEN_WIDTH * index,
          index,
        })}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0E17',
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#0A0E17',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButtonContainer: {
    position: 'absolute',
    top: 0,
    left: 20,
    zIndex: 10,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
  },
  backButtonText: {
    fontSize: 24,
    color: '#FFFFFF',
  },
});
