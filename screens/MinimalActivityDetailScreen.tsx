/**
 * MinimalActivityDetailScreen
 * Monochrome minimalist design with large hero image
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  Text,
  StyleSheet,
  Linking,
  Alert,
  Image,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { userStorage } from '../src/services/userStorage';
import { useTheme } from '../src/contexts/ThemeContext';
import { useVibe } from '../src/contexts/VibeContext';
import { LinearGradient } from 'expo-linear-gradient';
import { API_BASE_URL } from '../src/config/api';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

type RootStackParamList = {
  ActivityDetailScreenShell: {
    activity: any;
    userLocation?: { latitude: number; longitude: number };
  };
};

type Venue = {
  id?: string;
  venueId?: number;
  name: string;
  location?: { lat: number; lng: number };
  distance?: number;
  mapsUrl?: string;
  website?: string;
  websiteUrl?: string;
  url?: string;
  [key: string]: any;
};

export const MinimalActivityDetailScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute<RouteProp<RootStackParamList, 'ActivityDetailScreenShell'>>();
  const { activity, userLocation } = route.params;
  const { resolvedTheme, colors: themeColors } = useTheme();
  const { currentVibe, getVibeColors } = useVibe();

  const [selectedVenue, setSelectedVenue] = useState<Venue | null>(null);
  
  // Get vibe colors for accents
  const vibeColors = getVibeColors();

  useEffect(() => {
    selectNearestVenue();
  }, []);

  /**
   * Haversine formula to calculate distance between two coordinates
   */
  const calculateDistance = (
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number => {
    const R = 6371; // Earth's radius in km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  /**
   * NEAREST VENUE SELECTION LOGIC
   */
  const selectNearestVenue = () => {
    const venues = activity.venues || [];

    // Case 1: No specific venues, use activity location
    if (venues.length === 0) {
      const activityLocation =
        activity.location ||
        (activity.latitude && activity.longitude
          ? { lat: activity.latitude, lng: activity.longitude }
          : undefined);

      setSelectedVenue({
        id: activity.id,
        name: activity.name,
        location: activityLocation,
        distance: activity.distance || activity.distanceKm || 0,
        mapsUrl: activity.mapsUrl,
        website: activity.website,
      });
      return;
    }

    // Case 2: No user location, use first venue
    if (!userLocation) {
      setSelectedVenue(venues[0]);
      return;
    }

    // Case 3: NEAREST VENUE RULE - Calculate distances and select closest
    const venuesWithLocation = venues.filter(
      (venue: Venue) => venue.location?.lat && venue.location?.lng
    );

    if (venuesWithLocation.length === 0) {
      setSelectedVenue(venues[0]);
      return;
    }

    // Calculate distances for all venues
    const venuesWithDistances = venuesWithLocation.map((venue: Venue) => ({
      ...venue,
      distance: calculateDistance(
        userLocation.latitude,
        userLocation.longitude,
        venue.location!.lat,
        venue.location!.lng
      ),
    }));

    // Sort by distance and select nearest
    venuesWithDistances.sort((a: any, b: any) => a.distance! - b.distance!);
    const nearest = venuesWithDistances[0];

    setSelectedVenue(nearest);
    console.log(
      `📍 Nearest venue selected: ${nearest.name} (${nearest.distance?.toFixed(1)}km away)`
    );
  };

  const handleLearnMore = () => {
    if (selectedVenue?.website || selectedVenue?.websiteUrl || selectedVenue?.url) {
      const url = selectedVenue.website || selectedVenue.websiteUrl || selectedVenue.url;
      if (url) {
        Linking.openURL(url);
      }
    } else {
      Alert.alert('No Website', 'This venue does not have a website available.');
    }
  };

  const handleGoNow = async () => {
    // Log activity instance for completion tracking
    try {
      const account = await userStorage.getAccount();
      if (account?.userId) {
        await fetch(
          `${API_BASE_URL}/api/activity-completion/log`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              userId: account.userId,
              activityId: activity.id,
              actionType: 'go_now',
              venueId: selectedVenue?.venueId || selectedVenue?.id,
            }),
          }
        );
        console.log('✅ Activity GO NOW logged for completion tracking');
      }
    } catch (error) {
      console.error('Error logging GO NOW:', error);
      // Continue with navigation even if logging fails
    }

    // Open maps
    if (selectedVenue?.mapsUrl) {
      Linking.openURL(selectedVenue.mapsUrl);
    } else if (selectedVenue?.location) {
      const { lat, lng } = selectedVenue.location;
      const url = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
      Linking.openURL(url);
    } else {
      Alert.alert('No Location', 'Location information is not available for this venue.');
    }
  };

  const formatDistance = (distance?: number) => {
    if (!distance || distance === 0) return null; // Don't show distance if not calculated
    if (distance < 1) return `${Math.round(distance * 1000)}m`;
    return `${distance.toFixed(1)}km`;
  };

  const formatDuration = (min?: number, max?: number) => {
    if (!min && !max) return 'Flexible';
    const minHours = min ? Math.floor(min / 60) : 0;
    const maxHours = max ? Math.floor(max / 60) : 0;
    if (minHours === maxHours) return `${minHours}h`;
    return `${minHours}-${maxHours}h`;
  };

  return (
    <View style={[styles.container, { backgroundColor: themeColors.background }]}>
      <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
        {/* Hero Image with Overlay */}
        <View style={styles.heroContainer}>
          {activity.heroImage && (
            <Image
              source={{ uri: activity.heroImage }}
              style={styles.heroImage}
              resizeMode="cover"
            />
          )}
          <View style={styles.heroOverlay} />

          {/* Back Button */}
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
            activeOpacity={0.7}
          >
            <Text style={styles.backText}>←</Text>
          </TouchableOpacity>

          {/* Activity Name on Image */}
          <View style={styles.heroTextContainer}>
            <Text style={styles.activityName}>{activity.name}</Text>
          </View>
        </View>

        {/* Content */}
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Nearest Venue Info */}
          {selectedVenue && (
            <View style={styles.venueCard}>
              <Text style={[styles.venueLabel, { color: themeColors.text.secondary }]}>NEAREST</Text>
              <Text style={[styles.venueName, { color: themeColors.text.primary }]}>{selectedVenue.name}</Text>
              <Text style={[styles.venueDistance, { color: themeColors.text.secondary }]}>
                📍 {formatDistance(selectedVenue.distance)}
              </Text>
            </View>
          )}

          {/* Description */}
          <View style={styles.section}>
            <Text style={[styles.description, { color: themeColors.text.primary }]}>{activity.description}</Text>
          </View>

          {/* Meta Information */}
          <View style={styles.metaSection}>
            <View style={styles.metaRow}>
              <View style={styles.metaItem}>
                <Text style={styles.metaIcon}>⏱</Text>
                <View>
                  <Text style={[styles.metaLabel, { color: themeColors.text.secondary }]}>Duration</Text>
                  <Text style={[styles.metaValue, { color: themeColors.text.primary }]}>
                    {formatDuration(activity.duration_min, activity.duration_max)}
                  </Text>
                </View>
              </View>

              <View style={styles.metaDivider} />

              <View style={styles.metaItem}>
                <Text style={styles.metaIcon}>⚡</Text>
                <View>
                  <Text style={[styles.metaLabel, { color: themeColors.text.secondary }]}>Energy</Text>
                  <Text style={[styles.metaValue, { color: themeColors.text.primary }]}>
                    {activity.energy_level || 'Medium'}
                  </Text>
                </View>
              </View>

              <View style={styles.metaDivider} />

              <View style={styles.metaItem}>
                <Text style={styles.metaIcon}>📌</Text>
                <View>
                  <Text style={[styles.metaLabel, { color: themeColors.text.secondary }]}>Location</Text>
                  <Text style={[styles.metaValue, { color: themeColors.text.primary }]}>
                    {activity.city || activity.region || 'Bucharest'}
                  </Text>
                </View>
              </View>
            </View>
          </View>

          {/* Action Buttons */}
          <View style={styles.buttonsContainer}>
            <TouchableOpacity
              style={[
                styles.learnMoreButton,
                vibeColors && {
                  borderColor: vibeColors.primary,
                  borderWidth: 2,
                }
              ]}
              onPress={handleLearnMore}
              activeOpacity={0.7}
            >
              <Text style={[
                styles.learnMoreText,
                vibeColors && { color: vibeColors.primary }
              ]}>
                Learn More
              </Text>
            </TouchableOpacity>

            {vibeColors ? (
              <TouchableOpacity
                onPress={handleGoNow}
                activeOpacity={0.7}
              >
                <LinearGradient
                  colors={[vibeColors.gradient.start, vibeColors.gradient.end]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.goNowButton}
                >
                  <Text style={styles.goNowText}>GO NOW</Text>
                </LinearGradient>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={[styles.goNowButton, { backgroundColor: '#FFFFFF' }]}
                onPress={handleGoNow}
                activeOpacity={0.7}
              >
                <Text style={[styles.goNowText, { color: '#000000' }]}>GO NOW</Text>
              </TouchableOpacity>
            )}
          </View>

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
  safeArea: {
    flex: 1,
  },
  heroContainer: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT * 0.5,
    position: 'relative',
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  backButton: {
    position: 'absolute',
    top: 16,
    left: 20,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  backText: {
    fontSize: 24,
    color: '#FFFFFF',
  },
  heroTextContainer: {
    position: 'absolute',
    bottom: 24,
    left: 20,
    right: 20,
  },
  activityName: {
    fontSize: 32,
    fontWeight: '700',
    color: '#FFFFFF',
    lineHeight: 38,
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 20,
  },
  venueCard: {
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 16,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  venueLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.5)',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  venueName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  venueDistance: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  section: {
    marginHorizontal: 20,
    marginBottom: 24,
  },
  description: {
    fontSize: 15,
    color: 'rgba(255, 255, 255, 0.8)',
    lineHeight: 24,
  },
  metaSection: {
    marginHorizontal: 20,
    marginBottom: 24,
    padding: 20,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  metaIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  metaLabel: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.5)',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  metaValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    textTransform: 'capitalize',
  },
  metaDivider: {
    width: 1,
    height: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    marginHorizontal: 12,
  },
  buttonsContainer: {
    marginHorizontal: 20,
    gap: 12,
  },
  learnMoreButton: {
    paddingVertical: 16,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    alignItems: 'center',
  },
  learnMoreText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  goNowButton: {
    paddingVertical: 16,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
  },
  goNowText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000000',
    letterSpacing: 0.5,
  },
  bottomPadding: {
    height: 40,
  },
});
