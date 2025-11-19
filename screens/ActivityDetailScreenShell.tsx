/**
 * ActivityDetailScreenShell
 * Activity detail with photo carousel and NEAREST VENUE SELECTION
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  Text,
  StyleSheet,
  Linking,
  Alert,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { OrbBackdrop } from '../ui/components/OrbBackdrop';
import { ShellHeader } from '../ui/components/ShellHeader';
import { GlassCard } from '../ui/components/GlassCard';
import { GlassButton } from '../ui/components/GlassButton';
import { ActivityCarousel } from '../ui/blocks/ActivityCarousel';
import { ActivityMeta } from '../ui/blocks/ActivityMeta';
import { theme } from '../ui/theme/tokens';
import { Activity } from '../ui/blocks/ActivityMiniCard';

type RootStackParamList = {
  ActivityDetailScreenShell: {
    activity: Activity;
    userLocation?: { latitude: number; longitude: number };
  };
  UserProfile: undefined;
};

type Venue = {
  id: string;
  name: string;
  location?: { lat: number; lng: number };
  distance?: number;
  mapsUrl?: string;
  website?: string;
  websiteUrl?: string;
  url?: string;
  [key: string]: any; // Allow additional properties
};

export const ActivityDetailScreenShell: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute<RouteProp<RootStackParamList, 'ActivityDetailScreenShell'>>();
  const { activity, userLocation } = route.params;

  const [selectedVenue, setSelectedVenue] = useState<Venue | null>(null);

  const colors = theme.colors;
  const typo = theme.typography;

  useEffect(() => {
    // 🎯 CRITICAL: Select nearest venue on mount
    selectNearestVenue();
  }, []);

  /**
   * NEAREST VENUE SELECTION LOGIC
   * Haversine formula to calculate distances and select closest venue
   */
  const selectNearestVenue = () => {
    const venues = activity.venues || [];

    // Case 1: No specific venues, use activity location
    if (venues.length === 0) {
      // Use activity's latitude/longitude if available
      const activityLocation = activity.location || 
        ((activity as any).latitude && (activity as any).longitude 
          ? { lat: (activity as any).latitude, lng: (activity as any).longitude }
          : undefined);
      
      setSelectedVenue({
        id: activity.id,
        name: activity.name,
        location: activityLocation,
        distance: activity.distance || activity.distanceKm || 0,
        mapsUrl: (activity as any).mapsUrl,
        website: (activity as any).website,
      });
      console.log('📍 Using activity location (no venues):', activityLocation);
      return;
    }

    // Case 2: No user location, use first venue
    if (!userLocation) {
      setSelectedVenue(venues[0]);
      console.log('📍 No user location, using first venue:', venues[0].name);
      return;
    }

    // Case 3: NEAREST VENUE RULE - Calculate distances and select closest
    // Filter out venues without location data
    const venuesWithLocation = venues.filter((venue) => venue.location?.lat && venue.location?.lng);
    
    // If no venues have location, use first venue
    if (venuesWithLocation.length === 0) {
      setSelectedVenue(venues[0]);
      console.log('📍 No venues with location data, using first venue:', venues[0].name);
      return;
    }
    
    const venuesWithDistance = venuesWithLocation.map((venue) => {
      const distance = calculateDistance(
        userLocation.latitude,
        userLocation.longitude,
        venue.location.lat,
        venue.location.lng
      );
      return { ...venue, distance };
    });

    // Sort by distance ascending
    venuesWithDistance.sort((a, b) => a.distance - b.distance);
    const nearestVenue = venuesWithDistance[0];

    console.log(
      `📍 Nearest venue selected: ${nearestVenue.name} (${nearestVenue.distance.toFixed(1)}km away)`
    );
    console.log(
      `   User location: ${userLocation.latitude.toFixed(4)}, ${userLocation.longitude.toFixed(4)}`
    );
    console.log(`   Other venues considered: ${venuesWithDistance.length - 1}`);

    setSelectedVenue(nearestVenue);
  };

  /**
   * Haversine formula to calculate distance between two coordinates
   * @returns Distance in kilometers
   */
  const calculateDistance = (
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number => {
    const R = 6371; // Earth's radius in km
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRad(lat1)) *
        Math.cos(toRad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const toRad = (degrees: number): number => {
    return degrees * (Math.PI / 180);
  };

  const handleLearnMore = async () => {
    // Debug: Log full activity and venue data
    console.log('\n🔍 WEBSITE LOOKUP DEBUG:');
    console.log('Activity object keys:', Object.keys(activity));
    console.log('Activity data:', JSON.stringify(activity, null, 2));
    console.log('Selected venue:', JSON.stringify(selectedVenue, null, 2));
    
    // Check multiple sources for website URL
    let website = selectedVenue?.website || 
                  selectedVenue?.websiteUrl ||
                  selectedVenue?.url ||
                  (selectedVenue as any)?.link ||
                  (activity as any).website || 
                  (activity as any).websiteUrl ||
                  (activity as any).url ||
                  (activity as any).link ||
                  (activity as any).websiteURL ||
                  (activity.venues && activity.venues.length > 0 && (activity.venues[0] as any).website) ||
                  (activity.venues && activity.venues.length > 0 && (activity.venues[0] as any).websiteUrl) ||
                  (activity.venues && activity.venues.length > 0 && (activity.venues[0] as any).url) ||
                  (activity.venues && activity.venues.length > 0 && (activity.venues[0] as any).link);
    
    console.log('Found website:', website);
    
    if (website) {
      // Ensure URL has protocol
      if (!website.startsWith('http://') && !website.startsWith('https://')) {
        website = 'https://' + website;
      }
      
      console.log('Opening URL:', website);
      
      try {
        const canOpen = await Linking.canOpenURL(website);
        if (canOpen) {
          await Linking.openURL(website);
        } else {
          console.error('Cannot open URL:', website);
          Alert.alert('Error', 'Invalid website URL: ' + website);
        }
      } catch (error) {
        console.error('Failed to open website:', error);
        Alert.alert('Error', 'Could not open website: ' + error);
      }
    } else {
      console.log('❌ No website found in any field');
      console.log('Checked fields:', [
        'selectedVenue.website', 'selectedVenue.websiteUrl', 'selectedVenue.url', 'selectedVenue.link',
        'activity.website', 'activity.websiteUrl', 'activity.url', 'activity.link',
        'venues[0].website', 'venues[0].websiteUrl', 'venues[0].url', 'venues[0].link'
      ]);
      Alert.alert(
        'Info', 
        'No website available for this activity.\n\nPlease check console logs for debugging info.'
      );
    }
  };

  const handleGoNow = async () => {
    try {
      let mapsUrl: string;

      if (selectedVenue?.mapsUrl) {
        mapsUrl = selectedVenue.mapsUrl;
      } else if (selectedVenue?.location) {
        // Use universal Google Maps URL (works on all platforms)
        const { lat, lng } = selectedVenue.location;
        const venueName = encodeURIComponent(selectedVenue.name);
        
        // Universal URL that opens in Google Maps app if installed, otherwise web
        mapsUrl = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}&query_place_id=${venueName}`;
      } else {
        // Generic search
        const query = encodeURIComponent(activity.name);
        mapsUrl = `https://www.google.com/maps/search/?api=1&query=${query}`;
      }

      await Linking.openURL(mapsUrl);
      console.log('🗺️  Opened maps:', mapsUrl);
    } catch (error) {
      console.error('Failed to open maps:', error);
      Alert.alert('Error', 'Could not open maps');
    }
  };

  const handleBack = () => {
    navigation.goBack();
  };

  const handleProfile = () => {
    (navigation as any).navigate('UserProfile');
  };

  // Get images for carousel
  const images = activity.photos || (activity.imageUrl ? [activity.imageUrl] : []);

  // Format duration for display
  const formatDuration = (): string | undefined => {
    const minutes = activity.duration_min || activity.durationMinutes;
    if (!minutes) return undefined;

    const maxMinutes = activity.duration_max || minutes;
    const hours = Math.round(minutes / 60);
    const maxHours = Math.round(maxMinutes / 60);

    if (hours === maxHours) {
      return `${hours}h`;
    }
    return `${hours}-${maxHours}h`;
  };

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
        testID="activity-detail-header"
      />

      {/* Title Overlay */}
      <View style={styles.titleOverlay}>
        <Text
          style={[typo.titleL, styles.title, { color: colors.fg.primary, opacity: 0.98 }]}
          numberOfLines={2}
        >
          {activity.name}
        </Text>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Photo Carousel */}
        <ActivityCarousel images={images} height={400} showLabel={true} />

        {/* Content Card */}
        <View style={styles.contentWrapper}>
          <GlassCard emphasis="low" style={styles.contentCard}>
            {/* Description */}
            {activity.description && (
              <Text style={[typo.bodyLarge, styles.description, { color: colors.fg.secondary, opacity: 0.9 }]}>
                {String(activity.description)}
              </Text>
            )}
            
            {!activity.description && (
              <Text style={[typo.bodyLarge, styles.description, { color: colors.fg.tertiary, fontStyle: 'italic', opacity: 0.7 }]}>
                Discover this exciting activity. Tap "GO NOW" to find the location and learn more.
              </Text>
            )}

            {/* Metadata */}
            <View style={styles.metaContainer}>
              <ActivityMeta
                time={formatDuration()}
                distance={selectedVenue?.distance}
                location={
                  activity.city && typeof activity.city === 'string' ? activity.city :
                  selectedVenue?.name && typeof selectedVenue.name === 'string' ? selectedVenue.name :
                  undefined
                }
              />
              
              {/* Nearest Venue Indicator */}
              {selectedVenue && 
               typeof selectedVenue.distance === 'number' && 
               selectedVenue.name && 
               typeof selectedVenue.name === 'string' && 
               activity.venues && 
               activity.venues.length > 1 && (
                <View style={styles.nearestBadge}>
                  <Text style={[typo.caption, { color: colors.gradient.accent.from }]}>
                    📍 Nearest: {selectedVenue.name} ({selectedVenue.distance.toFixed(1)}km)
                  </Text>
                </View>
              )}
            </View>

            {/* Action Buttons */}
            <View style={styles.actions}>
              <View style={styles.actionButton}>
                <GlassButton
                  label="Learn More"
                  kind="secondary"
                  onPress={handleLearnMore}
                  testID="learn-more-btn"
                />
              </View>

              <View style={styles.actionButton}>
                <GlassButton
                  label="GO NOW"
                  kind="primary"
                  onPress={handleGoNow}
                  testID="go-now-btn"
                />
              </View>
            </View>
          </GlassCard>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  titleOverlay: {
    position: 'absolute',
    top: 120,
    left: 24,
    right: 24,
    zIndex: 10,
  },
  title: {
    textShadowColor: 'rgba(0, 0, 0, 0.9)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  contentWrapper: {
    marginTop: -40,
    paddingHorizontal: 20,
  },
  contentCard: {
    padding: 0, // Override default
  },
  description: {
    padding: 24,
    lineHeight: 28,
    marginBottom: 12,
  },
  metaContainer: {
    paddingHorizontal: 24,
    marginBottom: 28,
  },
  nearestBadge: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  actions: {
    paddingHorizontal: 24,
    paddingBottom: 24,
    gap: 14,
  },
  actionButton: {
    // Full width buttons
  },
});
