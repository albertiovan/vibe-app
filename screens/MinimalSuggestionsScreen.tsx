/**
 * MinimalSuggestionsScreen
 * Instagram-style vertical scrolling feed with monochrome cards
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Image,
  Dimensions,
} from 'react-native';
import { useNavigation, useRoute, RouteProp, NavigationProp } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LoadingShimmer } from '../ui/components/LoadingShimmer';
import { chatApi } from '../src/services/chatApi';
import { FilterOptions } from '../components/filters/ActivityFilters';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

type RootStackParamList = {
  SuggestionsScreenShell: {
    conversationId: number;
    deviceId: string;
    userMessage: string;
    filters?: FilterOptions;
    userLocation?: { latitude: number; longitude: number };
  };
  ActivityDetailScreenShell: {
    activity: any;
    userLocation?: { latitude: number; longitude: number };
  };
};

type SuggestionsScreenRouteProp = RouteProp<RootStackParamList, 'SuggestionsScreenShell'>;

export const MinimalSuggestionsScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const route = useRoute<SuggestionsScreenRouteProp>();
  const { conversationId, deviceId, userMessage, filters, userLocation } = route.params;

  const [activities, setActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

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
        setActivities([]);
      }
    } catch (error) {
      console.error('❌ Failed to load activities:', error);
      setActivities([]);
    } finally {
      setLoading(false);
    }
  };

  const handleExplore = (activity: any) => {
    navigation.navigate('ActivityDetailScreenShell', {
      activity,
      userLocation,
    });
  };

  const formatDuration = (min?: number, max?: number) => {
    if (!min && !max) return 'Flexible';
    const minHours = min ? Math.floor(min / 60) : 0;
    const maxHours = max ? Math.floor(max / 60) : 0;
    if (minHours === maxHours) return `${minHours}h`;
    return `${minHours}-${maxHours}h`;
  };

  const formatDistance = (distance?: number) => {
    if (!distance) return 'Nearby';
    if (distance < 1) return `${Math.round(distance * 1000)}m`;
    return `${distance.toFixed(1)}km`;
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <LoadingShimmer text="Matching your vibe..." />
      </View>
    );
  }

  if (activities.length === 0) {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Text style={styles.backText}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Suggestions</Text>
          <View style={styles.headerSpacer} />
        </View>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No activities found</Text>
          <Text style={styles.emptySubtext}>Try adjusting your filters</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Text style={styles.backText}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Suggestions</Text>
          <View style={styles.headerSpacer} />
        </View>

        {/* Scrollable Feed */}
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {activities.map((activity, index) => (
            <View key={activity.id || index} style={styles.card}>
              {/* Activity Number */}
              <View style={styles.cardHeader}>
                <Text style={styles.activityNumber}>Activity {index + 1}</Text>
              </View>

              {/* Image */}
              {activity.heroImage && (
                <View style={styles.imageContainer}>
                  <Image
                    source={{ uri: activity.heroImage }}
                    style={styles.activityImage}
                    resizeMode="cover"
                  />
                  <View style={styles.imageOverlay} />
                </View>
              )}

              {/* Content */}
              <View style={styles.cardContent}>
                {/* Name */}
                <Text style={styles.activityName}>{activity.name}</Text>

                {/* Description */}
                <Text style={styles.activityDescription} numberOfLines={3}>
                  {activity.description}
                </Text>

                {/* Meta Info */}
                <View style={styles.metaRow}>
                  <View style={styles.metaItem}>
                    <Text style={styles.metaIcon}>⏱</Text>
                    <Text style={styles.metaText}>
                      {formatDuration(activity.duration_min, activity.duration_max)}
                    </Text>
                  </View>
                  <View style={styles.metaDivider} />
                  <View style={styles.metaItem}>
                    <Text style={styles.metaIcon}>📍</Text>
                    <Text style={styles.metaText}>
                      {formatDistance(activity.distance)}
                    </Text>
                  </View>
                  <View style={styles.metaDivider} />
                  <View style={styles.metaItem}>
                    <Text style={styles.metaIcon}>⚡</Text>
                    <Text style={styles.metaText}>
                      {activity.energy_level || 'Medium'}
                    </Text>
                  </View>
                </View>

                {/* Explore Button */}
                <TouchableOpacity
                  style={styles.exploreButton}
                  onPress={() => handleExplore(activity)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.exploreButtonText}>Explore Now</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}

          {/* Bottom Padding */}
          <View style={styles.bottomPadding} />
        </ScrollView>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000000',
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
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  headerSpacer: {
    width: 40,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.6)',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 20,
  },
  card: {
    marginHorizontal: 20,
    marginBottom: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    overflow: 'hidden',
  },
  cardHeader: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
  },
  activityNumber: {
    fontSize: 11,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.5)',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  imageContainer: {
    width: '100%',
    height: 200,
    position: 'relative',
  },
  activityImage: {
    width: '100%',
    height: '100%',
  },
  imageOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
  },
  cardContent: {
    padding: 16,
  },
  activityName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 8,
    lineHeight: 26,
  },
  activityDescription: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
    lineHeight: 20,
    marginBottom: 16,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaIcon: {
    fontSize: 14,
    marginRight: 4,
  },
  metaText: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.6)',
  },
  metaDivider: {
    width: 1,
    height: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    marginHorizontal: 12,
  },
  exploreButton: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  exploreButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#000000',
  },
  bottomPadding: {
    height: 40,
  },
});
