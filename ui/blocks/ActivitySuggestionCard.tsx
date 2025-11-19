/**
 * ActivitySuggestionCard
 * 
 * Full-screen swipeable card with comprehensive activity information
 * Accept/Deny buttons for ML learning
 * Different design from Challenge Me cards (blue/cyan theme vs red/orange)
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Image,
  Linking,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { theme } from '../theme/tokens';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface ActivitySuggestionCardProps {
  activity: any;
  userLocation?: { latitude: number; longitude: number };
  onAccept: () => void;
  onDeny: () => void;
  currentIndex: number;
  totalCount: number;
}

export const ActivitySuggestionCard: React.FC<ActivitySuggestionCardProps> = ({
  activity,
  userLocation,
  onAccept,
  onDeny,
  currentIndex,
  totalCount,
}) => {
  const colors = theme.colors;
  const typo = theme.typography;

  // Get primary photo
  const photo = activity.photos?.[0] || activity.imageUrl || activity.image_url;

  // Get venue info
  const venue = activity.venues?.[0];
  const location = venue?.location || activity.location;
  const distance = venue?.distance || activity.distance || activity.distanceKm;

  // Get duration
  const durationMin = activity.duration_min || activity.durationMin;
  const durationMax = activity.duration_max || activity.durationMax;
  const duration = durationMin && durationMax 
    ? `${durationMin}-${durationMax} min`
    : durationMin 
    ? `${durationMin}+ min`
    : 'Flexible';

  // Get website
  const website = activity.website || 
                  activity.websiteUrl || 
                  venue?.website || 
                  venue?.websiteUrl;

  // Get weather info
  const indoorOutdoor = activity.indoor_outdoor || activity.indoorOutdoor || 'both';
  const weatherIcon = indoorOutdoor === 'indoor' ? '🏠' : indoorOutdoor === 'outdoor' ? '🌤️' : '🏠/🌤️';

  const handleWebsite = async () => {
    if (website) {
      try {
        const canOpen = await Linking.canOpenURL(website);
        if (canOpen) {
          await Linking.openURL(website);
        } else {
          Alert.alert('Error', 'Cannot open this website');
        }
      } catch (error) {
        console.error('Failed to open website:', error);
        Alert.alert('Error', 'Failed to open website');
      }
    } else {
      Alert.alert('No Website', 'This activity does not have a website available');
    }
  };

  return (
    <View style={styles.container}>
      {/* Background Image with Gradient Overlay */}
      {photo ? (
        <Image source={{ uri: photo }} style={styles.backgroundImage} />
      ) : (
        <LinearGradient
          colors={['#0A0E17', '#1A2332', '#0F1922']}
          style={styles.backgroundGradient}
        />
      )}
      
      {/* Gradient Overlay */}
      <LinearGradient
        colors={['rgba(10, 14, 23, 0.7)', 'rgba(10, 14, 23, 0.95)']}
        style={styles.gradientOverlay}
      />

      {/* Content */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Counter and Swipe Hint */}
        <View style={styles.counterContainer}>
          <BlurView intensity={40} style={styles.counterBlur}>
            <Text style={[typo.caption, { color: colors.fg.secondary }]}>
              {currentIndex + 1} of {totalCount}
            </Text>
          </BlurView>
          
          {/* Swipe Hint - only show if not on last card */}
          {currentIndex < totalCount - 1 && (
            <View style={styles.swipeHintContainer}>
              <BlurView intensity={30} style={styles.swipeHintBlur}>
                <Text style={[typo.caption, { color: colors.fg.tertiary }]}>
                  Swipe for more →
                </Text>
              </BlurView>
            </View>
          )}
        </View>

        {/* Title */}
        <View style={styles.titleContainer}>
          <Text style={[typo.titleL, { color: colors.fg.primary }]}>
            {activity.name || activity.simplifiedName}
          </Text>
        </View>

        {/* Info Cards */}
        <View style={styles.infoSection}>
          {/* Meta Info Card */}
          <BlurView intensity={30} style={styles.infoCard}>
            <View style={styles.infoRow}>
              <View style={styles.infoItem}>
                <Text style={styles.infoIcon}>⏱️</Text>
                <Text style={[typo.bodySmall, { color: colors.fg.secondary }]}>
                  {duration}
                </Text>
              </View>
              
              {distance !== undefined && (
                <View style={styles.infoItem}>
                  <Text style={styles.infoIcon}>📍</Text>
                  <Text style={[typo.bodySmall, { color: colors.fg.secondary }]}>
                    {distance.toFixed(1)} km
                  </Text>
                </View>
              )}
              
              <View style={styles.infoItem}>
                <Text style={styles.infoIcon}>{weatherIcon}</Text>
                <Text style={[typo.bodySmall, { color: colors.fg.secondary }]}>
                  {indoorOutdoor}
                </Text>
              </View>
            </View>

            {/* Location */}
            {(activity.city || activity.region) && (
              <View style={[styles.infoRow, { marginTop: 12 }]}>
                <Text style={styles.infoIcon}>📌</Text>
                <Text style={[typo.bodySmall, { color: colors.fg.secondary, flex: 1 }]}>
                  {activity.city || activity.region}
                </Text>
              </View>
            )}
          </BlurView>

          {/* Description Card */}
          <BlurView intensity={30} style={styles.infoCard}>
            <Text style={[typo.caption, { color: colors.fg.tertiary, marginBottom: 8 }]}>
              DESCRIPTION
            </Text>
            <Text style={[typo.body, { color: colors.fg.secondary, lineHeight: 24 }]}>
              {activity.description || 'Discover this amazing activity and create unforgettable memories.'}
            </Text>
          </BlurView>

          {/* Energy Level */}
          {activity.energy_level && (
            <BlurView intensity={30} style={styles.infoCard}>
              <View style={styles.infoRow}>
                <Text style={[typo.caption, { color: colors.fg.tertiary }]}>
                  ENERGY LEVEL
                </Text>
                <View style={styles.energyBadge}>
                  <Text style={[typo.bodySmall, { color: '#00AAFF' }]}>
                    {activity.energy_level.toUpperCase()}
                  </Text>
                </View>
              </View>
            </BlurView>
          )}

          {/* Website Button */}
          {website && (
            <TouchableOpacity
              style={styles.websiteButton}
              onPress={handleWebsite}
              activeOpacity={0.8}
            >
              <BlurView intensity={30} style={styles.websiteButtonInner}>
                <Text style={[typo.body, { color: '#00AAFF' }]}>
                  🌐 Visit Website
                </Text>
              </BlurView>
            </TouchableOpacity>
          )}
        </View>

        {/* Spacer for buttons */}
        <View style={{ height: 140 }} />
      </ScrollView>

      {/* Accept/Deny Buttons */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.denyButton}
          onPress={onDeny}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={['rgba(255, 107, 107, 0.2)', 'rgba(255, 107, 107, 0.1)']}
            style={styles.buttonGradient}
          >
            <Text style={[typo.titleM, { color: '#FF6B6B' }]}>
              ✕ DENY
            </Text>
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.acceptButton}
          onPress={onAccept}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={['#00AAFF', '#00FFFF']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.buttonGradient}
          >
            <Text style={[typo.titleM, { color: '#FFFFFF' }]}>
              ✓ ACCEPT
            </Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
    backgroundColor: '#0A0E17',
  },
  backgroundImage: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  backgroundGradient: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  gradientOverlay: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingTop: 60,
  },
  counterContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  counterBlur: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  swipeHintContainer: {
    marginTop: 12,
  },
  swipeHintBlur: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(0, 170, 255, 0.2)',
  },
  titleContainer: {
    marginBottom: 24,
  },
  infoSection: {
    gap: 16,
  },
  infoCard: {
    padding: 20,
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  infoIcon: {
    fontSize: 16,
  },
  energyBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: 'rgba(0, 170, 255, 0.1)',
  },
  websiteButton: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  websiteButtonInner: {
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0, 170, 255, 0.3)',
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 40,
    left: 20,
    right: 20,
    flexDirection: 'row',
    gap: 12,
  },
  denyButton: {
    flex: 1,
    height: 60,
    borderRadius: 30,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'rgba(255, 107, 107, 0.5)',
  },
  acceptButton: {
    flex: 1,
    height: 60,
    borderRadius: 30,
    overflow: 'hidden',
  },
  buttonGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
