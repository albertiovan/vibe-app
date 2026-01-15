/**
 * ActivityMiniCard Component
 * Compact card showing activity name, thumbnail, description, metadata, and Explore Now button
 */

import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { GlassCard } from '../components/GlassCard';
import { GlassButton } from '../components/GlassButton';
import { theme } from '../theme/tokens';

export interface Activity {
  id: string;
  name: string;
  description: string;
  imageUrl?: string;
  photos?: string[];
  city?: string;
  region?: string;
  distance?: number;
  distanceKm?: number;
  duration_min?: number;
  duration_max?: number;
  durationMinutes?: number;
  estimatedDuration?: string;
  category?: string;
  location?: { lat: number; lng: number };
  venues?: Array<{
    id: string;
    name: string;
    location: { lat: number; lng: number };
    distance?: number;
  }>;
}

interface ActivityMiniCardProps {
  activity: Activity;
  onExplore: (activity: Activity) => void;
  testID?: string;
}

export const ActivityMiniCard: React.FC<ActivityMiniCardProps> = ({
  activity,
  onExplore,
  testID,
}) => {
  const colors = theme.colors;
  const typo = theme.typography;

  // Get image URL - check all possible field names from database
  const imageUrl = (activity as any).hero_image_url || 
                   (activity as any).image_urls?.[0] || 
                   (activity as any).imageUrls?.[0] ||
                   activity.imageUrl || 
                   activity.photos?.[0] || 
                   'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400';

  // Format duration
  const formatDuration = (): string | null => {
    const minutes = activity.duration_min || activity.durationMinutes;
    if (!minutes) return null;

    const maxMinutes = activity.duration_max || minutes;
    const hours = Math.round(minutes / 60);
    const maxHours = Math.round(maxMinutes / 60);

    if (hours === maxHours) {
      return `${hours}h`;
    }
    return `${hours}-${maxHours}h`;
  };

  // Format distance
  const formatDistance = (): string | null => {
    const distance = activity.distance || activity.distanceKm;
    if (distance === undefined || distance === null) return null;
    return `${distance.toFixed(1)}km`;
  };

  const duration = formatDuration();
  const distance = formatDistance();

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={() => onExplore(activity)}
      testID={testID}
    >
      <GlassCard emphasis="high" style={styles.card}>
        <View style={styles.layout}>
          {/* Left: Content */}
          <View style={styles.content}>
            {/* Text Content - Top */}
            <View style={styles.textContent}>
              <Text
                style={[styles.name, { color: colors.fg.primary, fontWeight: '600' }]}
                numberOfLines={2}
              >
                {activity.name}
              </Text>

              {/* Metadata */}
              <View style={styles.metadata}>
                {duration && (
                  <View style={styles.metaItem}>
                    <Text style={styles.metaIcon}>⏱</Text>
                    <Text style={[typo.caption, { color: colors.fg.tertiary, fontSize: 11 }]}>
                      {duration}
                    </Text>
                  </View>
                )}
                {distance && (
                  <View style={styles.metaItem}>
                    <Text style={styles.metaIcon}>📍</Text>
                    <Text style={[typo.caption, { color: colors.fg.tertiary, fontSize: 11 }]}>
                      {distance}
                    </Text>
                  </View>
                )}
                {activity.city && (
                  <View style={styles.metaItem}>
                    <Text style={styles.metaIcon}>📌</Text>
                    <Text style={[typo.caption, { color: colors.fg.tertiary, fontSize: 11 }]} numberOfLines={1}>
                      {activity.city}
                    </Text>
                  </View>
                )}
              </View>
            </View>

            {/* Explore Now Button - Below text */}
            <View style={styles.buttonContainer}>
              <View style={{ 
                backgroundColor: 'rgba(0, 217, 255, 0.25)', // Transparent cyan like INSPO
                paddingHorizontal: 18,
                paddingVertical: 8,
                borderRadius: 14,
                borderWidth: 1,
                borderColor: 'rgba(0, 217, 255, 0.5)', // Brighter cyan border
              }}>
                <Text style={{ color: '#FFFFFF', fontSize: 12, fontWeight: '600', opacity: 0.95 }}>
                  Explore Now
                </Text>
              </View>
            </View>
          </View>

          {/* Right: Photo */}
          {imageUrl && (
            <View style={styles.photoContainer}>
              <Image
                source={{ uri: imageUrl }}
                style={styles.photo}
                resizeMode="cover"
              />
              <View style={styles.photoOverlay} />
              {/* Subtle cyan glow on photo edge */}
              <View style={styles.photoGlow} />
            </View>
          )}
        </View>
      </GlassCard>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    marginBottom: 14,
    padding: 0,
    height: 120, // Slightly taller for better visual balance
  },
  layout: {
    flexDirection: 'row',
    height: '100%',
  },
  content: {
    flex: 1,
    padding: 12,
    justifyContent: 'space-between',
  },
  textContent: {
    flex: 1,
  },
  name: {
    marginBottom: 5,
    fontSize: 16,
    lineHeight: 20,
    fontWeight: '600',
  },
  metadata: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 0,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  metaIcon: {
    fontSize: 10,
  },
  buttonContainer: {
    alignSelf: 'flex-start',
    marginTop: 6,
  },
  photoContainer: {
    width: 110, // Larger photo like INSPO
    position: 'relative',
    overflow: 'hidden',
    borderTopRightRadius: 20,
    borderBottomRightRadius: 20,
  },
  photo: {
    width: '100%',
    height: '100%',
  },
  photoOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.15)', // Less overlay for brighter photos
  },
  photoGlow: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 2,
    backgroundColor: 'rgba(0, 217, 255, 0.3)',
  },
});
