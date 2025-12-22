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
import { useVibe } from '../src/contexts/VibeContext';
import { useTheme } from '../src/contexts/ThemeContext';
import { AnimatedGradientBackground } from '../ui/components/AnimatedGradientBackground';
import { CategoryGradientCard } from '../ui/components/CategoryGradientCard';

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
  const { currentVibe, getVibeColors } = useVibe();
  const { resolvedTheme, colors: themeColors } = useTheme();

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

  const formatDistance = (distance?: number, city?: string, region?: string) => {
    if (distance && distance > 0) {
      if (distance < 1) return `${Math.round(distance * 1000)}m`;
      return `${distance.toFixed(1)}km`;
    }
    // If no distance calculated, show city/region instead
    return city || region || 'Bucharest';
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

  // Get background gradient colors based on vibe state
  const vibeColors = getVibeColors();
  const backgroundColors = vibeColors
    ? [vibeColors.gradient.start, vibeColors.gradient.end, themeColors.background]
    : resolvedTheme === 'light'
    ? ['#F5F5F5', '#E5E5E5', '#EFEFEF']
    : [themeColors.background, themeColors.background, themeColors.background];
  
  // Debug logging
  console.log('📱 Suggestions - Current vibe:', currentVibe);
  console.log('📱 Suggestions - Background colors:', backgroundColors);

  return (
    <View style={styles.container}>
      {/* Animated background - vibe-tinted */}
      <AnimatedGradientBackground
        colors={backgroundColors as [string, string, string]}
        duration={currentVibe ? 8000 : 15000}
      />
      
      <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Text style={[styles.backText, { color: themeColors.text.primary }]}>←</Text>
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: themeColors.text.primary }]}>Suggestions</Text>
          <View style={styles.headerSpacer} />
        </View>

        {/* Scrollable Feed */}
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {activities.map((activity, index) => (
            <CategoryGradientCard
              key={activity.id || index}
              category={activity.category}
              borderRadius={16}
              intensity="subtle"
              style={styles.card}
            >
              {/* Activity Number */}
              <View style={styles.cardHeader}>
                <Text style={[styles.activityNumber, { color: themeColors.text.tertiary }]}>Activity {index + 1}</Text>
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
                <Text style={[styles.activityName, { color: themeColors.text.primary }]}>{activity.name}</Text>

                {/* Description */}
                <Text style={[styles.activityDescription, { color: themeColors.text.secondary }]} numberOfLines={3}>
                  {activity.description}
                </Text>

                {/* Meta Info */}
                <View style={styles.metaRow}>
                  <View style={styles.metaItem}>
                    <Text style={styles.metaIcon}>⏱</Text>
                    <Text style={[styles.metaText, { color: themeColors.text.secondary }]}>
                      {formatDuration(activity.duration_min, activity.duration_max)}
                    </Text>
                  </View>
                  <View style={[styles.metaDivider, { backgroundColor: themeColors.border }]} />
                  <View style={styles.metaItem}>
                    <Text style={styles.metaIcon}>📍</Text>
                    <Text style={[styles.metaText, { color: themeColors.text.secondary }]}>
                      {formatDistance(activity.distance, activity.city, activity.region)}
                    </Text>
                  </View>
                  <View style={[styles.metaDivider, { backgroundColor: themeColors.border }]} />
                  <View style={styles.metaItem}>
                    <Text style={styles.metaIcon}>⚡</Text>
                    <Text style={[styles.metaText, { color: themeColors.text.secondary }]}>
                      {activity.energy_level || 'Medium'}
                    </Text>
                  </View>
                </View>

                {/* Explore Button */}
                <TouchableOpacity
                  style={[styles.exploreButton, { 
                    backgroundColor: resolvedTheme === 'light' ? '#FFFFFF' : themeColors.text.primary,
                    borderWidth: resolvedTheme === 'light' ? 1 : 0,
                    borderColor: resolvedTheme === 'light' ? 'rgba(0, 0, 0, 0.1)' : 'transparent'
                  }]}
                  onPress={() => handleExplore(activity)}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.exploreButtonText, { 
                    color: resolvedTheme === 'light' ? '#000000' : themeColors.background 
                  }]}>Explore Now</Text>
                </TouchableOpacity>
              </View>
            </CategoryGradientCard>
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
    backgroundColor: 'transparent',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
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
