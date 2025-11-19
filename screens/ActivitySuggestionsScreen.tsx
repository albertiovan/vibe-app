/**
 * ActivitySuggestionsScreen - Visual Shell Redesign
 * Shows 5 mini activity cards with glass UI
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Image,
  ActivityIndicator,
} from 'react-native';
import { useNavigation, useRoute, RouteProp, NavigationProp } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { FilterOptions } from '../components/filters/ActivityFilters';
import { chatApi, Message } from '../src/services/chatApi';

type RootStackParamList = {
  ActivitySuggestions: {
    conversationId: number;
    deviceId: string;
    userMessage: string;
    filters?: FilterOptions;
    userLocation?: { latitude: number; longitude: number };
  };
  ActivityDetail: {
    activity: any;
    userLocation?: { latitude: number; longitude: number };
  };
  UserProfile: undefined;
};

type Activity = {
  id: string;
  name: string;
  description: string;
  imageUrl?: string;
  city?: string;
  region?: string;
  distance?: number;
  duration_min?: number;
  duration_max?: number;
  estimatedDuration?: string;
  category?: string;
  location?: { lat: number; lng: number };
};

export const ActivitySuggestionsScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const route = useRoute<RouteProp<RootStackParamList, 'ActivitySuggestions'>>();
  const { conversationId, deviceId, userMessage, filters, userLocation } = route.params;

  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadActivities();
  }, []);

  const loadActivities = async () => {
    try {
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

      // Extract activities from response
      const extractedActivities = response.activities?.slice(0, 5) || [];
      setActivities(extractedActivities);
    } catch (error) {
      console.error('Failed to load activities:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExploreActivity = (activity: Activity) => {
    navigation.navigate('ActivityDetail', {
      activity,
      userLocation,
    });
  };

  const handleWantDifferent = () => {
    // Regenerate activities
    setLoading(true);
    loadActivities();
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <LinearGradient
          colors={['#0A0E17', '#1A2332', '#0F1922']}
          style={StyleSheet.absoluteFill}
        />
        <ActivityIndicator size="large" color="#00AAFF" />
        <Text style={styles.loadingText}>Finding your vibe...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Background gradient */}
      <LinearGradient
        colors={['#0A0E17', '#1A2332', '#0F1922']}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      {/* Header buttons */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.profileButton}
          onPress={() => navigation.navigate('UserProfile')}
        >
          <Text style={styles.profileIcon}>👤</Text>
        </TouchableOpacity>
      </View>

      {/* Activity cards list */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {activities.map((activity, index) => (
          <View key={activity.id || index} style={styles.cardWrapper}>
            <BlurView intensity={30} tint="dark" style={styles.activityCard}>
              <View style={styles.cardLayout}>
                {/* Left side - Content */}
                <View style={styles.cardContent}>
                  <Text style={styles.activityName}>{activity.name}</Text>
                  <Text style={styles.activityDescription} numberOfLines={2}>
                    {activity.description}
                  </Text>

                  {/* Meta info */}
                  <View style={styles.metaContainer}>
                    {activity.duration_min && (
                      <View style={styles.metaItem}>
                        <Text style={styles.metaIcon}>⏱</Text>
                        <Text style={styles.metaText}>
                          {Math.round(activity.duration_min / 60)}-
                          {Math.round((activity.duration_max || activity.duration_min) / 60)}h
                        </Text>
                      </View>
                    )}
                    {activity.distance !== undefined && (
                      <View style={styles.metaItem}>
                        <Text style={styles.metaIcon}>📍</Text>
                        <Text style={styles.metaText}>
                          {activity.distance.toFixed(1)}km
                        </Text>
                      </View>
                    )}
                    {activity.city && (
                      <View style={styles.metaItem}>
                        <Text style={styles.metaIcon}>📌</Text>
                        <Text style={styles.metaText}>{activity.city}</Text>
                      </View>
                    )}
                  </View>

                  {/* Explore Now button */}
                  <TouchableOpacity
                    onPress={() => handleExploreActivity(activity)}
                    activeOpacity={0.8}
                  >
                    <BlurView intensity={40} tint="light" style={styles.exploreButton}>
                      <LinearGradient
                        colors={['rgba(0,170,255,0.4)', 'rgba(0,255,255,0.4)']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={styles.exploreGradient}
                      >
                        <Text style={styles.exploreText}>Explore Now</Text>
                      </LinearGradient>
                    </BlurView>
                  </TouchableOpacity>
                </View>

                {/* Right side - Photo */}
                {activity.imageUrl && (
                  <View style={styles.photoContainer}>
                    <Image
                      source={{ uri: activity.imageUrl }}
                      style={styles.activityPhoto}
                      resizeMode="cover"
                    />
                    <View style={styles.photoOverlay} />
                  </View>
                )}
              </View>
            </BlurView>
          </View>
        ))}
      </ScrollView>

      {/* Bottom AI bar */}
      <View style={styles.bottomBar}>
        <TouchableOpacity
          onPress={handleWantDifferent}
          activeOpacity={0.8}
          style={styles.bottomBarTouchable}
        >
          <BlurView intensity={40} tint="dark" style={styles.aiBar}>
            <Text style={styles.aiIcon}>🎭</Text>
            <Text style={styles.aiText}>Want something different?</Text>
            <Text style={styles.aiArrow}>→</Text>
          </BlurView>
        </TouchableOpacity>
      </View>
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
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: 'rgba(255,255,255,0.7)',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 60,
    paddingHorizontal: 24,
    paddingBottom: 16,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backIcon: {
    fontSize: 24,
    color: '#FFFFFF',
  },
  profileButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileIcon: {
    fontSize: 24,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 100,
  },
  cardWrapper: {
    marginBottom: 20,
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  activityCard: {
    overflow: 'hidden',
  },
  cardLayout: {
    flexDirection: 'row',
    minHeight: 180,
  },
  cardContent: {
    flex: 1,
    padding: 20,
    justifyContent: 'space-between',
  },
  activityName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  activityDescription: {
    fontSize: 14,
    lineHeight: 20,
    color: 'rgba(255,255,255,0.7)',
    marginBottom: 12,
  },
  metaContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 16,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaIcon: {
    fontSize: 12,
  },
  metaText: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.6)',
    fontWeight: '500',
  },
  exploreButton: {
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  exploreGradient: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  exploreText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  photoContainer: {
    width: 120,
    position: 'relative',
  },
  activityPhoto: {
    width: '100%',
    height: '100%',
  },
  photoOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.1)',
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  bottomBarTouchable: {
    borderRadius: 28,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
  },
  aiBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    gap: 12,
  },
  aiIcon: {
    fontSize: 20,
  },
  aiText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  aiArrow: {
    fontSize: 20,
    color: 'rgba(255,255,255,0.6)',
  },
});
