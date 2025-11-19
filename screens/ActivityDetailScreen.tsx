/**
 * ActivityDetailScreen - Visual Shell Redesign
 * Large photo carousel, nearest venue selection logic
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
  Linking,
  Alert,
} from 'react-native';
import { useNavigation, useRoute, RouteProp, NavigationProp } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';

const { width } = Dimensions.get('window');

type RootStackParamList = {
  ActivityDetail: {
    activity: any;
    userLocation?: { latitude: number; longitude: number };
  };
  UserProfile: undefined;
};

type Venue = {
  id: string;
  name: string;
  location: { lat: number; lng: number };
  distance: number;
  mapsUrl?: string;
  website?: string;
};

export const ActivityDetailScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const route = useRoute<RouteProp<RootStackParamList, 'ActivityDetail'>>();
  const { activity, userLocation } = route.params;

  const [selectedVenue, setSelectedVenue] = useState<Venue | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    // CRITICAL: Select nearest venue by default
    selectNearestVenue();
  }, []);

  const selectNearestVenue = () => {
    // Get all available venues for this activity
    const venues = activity.venues || [];

    if (venues.length === 0) {
      // No specific venues, use activity location
      setSelectedVenue({
        id: activity.id,
        name: activity.name,
        location: activity.location || { lat: 44.4268, lng: 26.1025 },
        distance: activity.distance || 0,
        mapsUrl: activity.mapsUrl,
        website: activity.website,
      });
      return;
    }

    if (!userLocation) {
      // No user location, use first venue
      setSelectedVenue(venues[0]);
      return;
    }

    // NEAREST VENUE RULE: Calculate distances and select closest
    const venuesWithDistance = venues.map((venue: any) => {
      const distance = calculateDistance(
        userLocation.latitude,
        userLocation.longitude,
        venue.location.lat,
        venue.location.lng
      );
      return { ...venue, distance };
    });

    // Sort by distance and select nearest
    venuesWithDistance.sort((a: any, b: any) => a.distance - b.distance);
    const nearestVenue = venuesWithDistance[0];

    console.log('📍 Nearest venue selected:', nearestVenue.name, `${nearestVenue.distance.toFixed(1)}km away`);
    setSelectedVenue(nearestVenue);
  };

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371; // Earth's radius in km
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const toRad = (degrees: number): number => {
    return degrees * (Math.PI / 180);
  };

  const handleLearnMore = async () => {
    const website = selectedVenue?.website || activity.website;
    if (website) {
      try {
        await Linking.openURL(website);
      } catch (error) {
        Alert.alert('Error', 'Could not open website');
      }
    } else {
      Alert.alert('Info', 'No website available for this activity');
    }
  };

  const handleGoNow = async () => {
    try {
      let mapsUrl;

      if (selectedVenue?.mapsUrl) {
        mapsUrl = selectedVenue.mapsUrl;
      } else if (selectedVenue?.location) {
        mapsUrl = `https://www.google.com/maps/search/?api=1&query=${selectedVenue.location.lat},${selectedVenue.location.lng}`;
      } else {
        mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(activity.name)}`;
      }

      await Linking.openURL(mapsUrl);
    } catch (error) {
      Alert.alert('Error', 'Could not open maps');
    }
  };

  // Get images for carousel
  const images = activity.images || [
    activity.imageUrl || 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800',
  ];

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
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.profileButton}
          onPress={() => navigation.navigate('UserProfile')}
        >
          <Text style={styles.profileIcon}>👤</Text>
        </TouchableOpacity>
      </View>

      {/* Title overlay on header */}
      <View style={styles.titleContainer}>
        <Text style={styles.activityTitle}>{activity.name}</Text>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Photo Carousel */}
        <View style={styles.carouselContainer}>
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={(e) => {
              const index = Math.round(e.nativeEvent.contentOffset.x / width);
              setCurrentImageIndex(index);
            }}
            style={styles.carousel}
          >
            {images.map((imageUri: string, index: number) => (
              <View key={index} style={styles.carouselSlide}>
                <Image source={{ uri: imageUri }} style={styles.carouselImage} resizeMode="cover" />
                {/* Gradient overlay for better text visibility */}
                <LinearGradient
                  colors={['transparent', 'rgba(10,14,23,0.6)']}
                  style={styles.carouselGradient}
                />
              </View>
            ))}
          </ScrollView>

          {/* Pagination dots */}
          {images.length > 1 && (
            <View style={styles.pagination}>
              {images.map((_: any, index: number) => (
                <View
                  key={index}
                  style={[styles.paginationDot, index === currentImageIndex && styles.paginationDotActive]}
                />
              ))}
            </View>
          )}

          {/* Photo Carousel label */}
          <View style={styles.carouselLabel}>
            <Text style={styles.carouselLabelText}>Photo Carousel</Text>
          </View>
        </View>

        {/* Content card */}
        <View style={styles.contentWrapper}>
          <BlurView intensity={30} tint="dark" style={styles.contentCard}>
            {/* Description */}
            <Text style={styles.description}>{activity.description}</Text>

            {/* Meta information */}
            <View style={styles.metaContainer}>
              {activity.duration_min && (
                <View style={styles.metaRow}>
                  <Text style={styles.metaIcon}>⏱</Text>
                  <Text style={styles.metaText}>
                    {Math.round(activity.duration_min / 60)}-
                    {Math.round((activity.duration_max || activity.duration_min) / 60)} hours
                  </Text>
                </View>
              )}
              {selectedVenue && (
                <View style={styles.metaRow}>
                  <Text style={styles.metaIcon}>📍</Text>
                  <Text style={styles.metaText}>
                    {selectedVenue.distance.toFixed(1)}km • {activity.city || 'Bucharest'}
                  </Text>
                </View>
              )}
              {activity.city && (
                <View style={styles.metaRow}>
                  <Text style={styles.metaIcon}>📌</Text>
                  <Text style={styles.metaText}>{activity.city}</Text>
                </View>
              )}
            </View>

            {/* Action buttons */}
            <View style={styles.actionButtons}>
              <TouchableOpacity onPress={handleLearnMore} activeOpacity={0.8} style={styles.actionButtonWrapper}>
                <BlurView intensity={40} tint="light" style={styles.learnMoreButton}>
                  <LinearGradient
                    colors={['rgba(100,200,255,0.3)', 'rgba(150,220,255,0.3)']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.buttonGradient}
                  >
                    <Text style={styles.learnMoreText}>Learn More</Text>
                  </LinearGradient>
                </BlurView>
              </TouchableOpacity>

              <TouchableOpacity onPress={handleGoNow} activeOpacity={0.8} style={styles.actionButtonWrapper}>
                <BlurView intensity={40} tint="light" style={styles.goNowButton}>
                  <LinearGradient
                    colors={['rgba(0,170,255,0.5)', 'rgba(0,255,255,0.5)']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.buttonGradient}
                  >
                    <Text style={styles.goNowText}>GO NOW</Text>
                  </LinearGradient>
                </BlurView>
              </TouchableOpacity>
            </View>
          </BlurView>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0E17',
  },
  header: {
    position: 'absolute',
    top: 60,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    zIndex: 10,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(10,14,23,0.8)',
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
    backgroundColor: 'rgba(10,14,23,0.8)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileIcon: {
    fontSize: 24,
  },
  titleContainer: {
    position: 'absolute',
    top: 120,
    left: 24,
    right: 24,
    zIndex: 9,
  },
  activityTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFFFFF',
    textShadowColor: 'rgba(0,0,0,0.8)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  carouselContainer: {
    height: 400,
    position: 'relative',
  },
  carousel: {
    flex: 1,
  },
  carouselSlide: {
    width: width,
    height: 400,
  },
  carouselImage: {
    width: '100%',
    height: '100%',
  },
  carouselGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 120,
  },
  pagination: {
    position: 'absolute',
    bottom: 80,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  paginationDotActive: {
    backgroundColor: '#FFFFFF',
    width: 24,
  },
  carouselLabel: {
    position: 'absolute',
    bottom: 40,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  carouselLabelText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.8)',
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  contentWrapper: {
    marginTop: -40,
    paddingHorizontal: 24,
  },
  contentCard: {
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    overflow: 'hidden',
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: 24,
  },
  metaContainer: {
    marginBottom: 24,
    gap: 12,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  metaIcon: {
    fontSize: 16,
  },
  metaText: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)',
    fontWeight: '500',
  },
  actionButtons: {
    gap: 12,
  },
  actionButtonWrapper: {
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  learnMoreButton: {
    overflow: 'hidden',
  },
  goNowButton: {
    overflow: 'hidden',
  },
  buttonGradient: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  learnMoreText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  goNowText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 1,
  },
});
