/**
 * ActivityCard Component
 * Modern activity card using the new design system
 */

import React, { useRef } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Dimensions,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { GlassCard } from './GlassCard';
import { colors, getCategoryColor } from '../../src/design-system/colors';
import { tokens } from '../../src/design-system/tokens';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width - (tokens.spacing.lg * 2);

interface ActivityCardProps {
  activity: {
    id: number;
    name: string;
    description?: string;
    category?: string;
    duration_min?: number;
    duration_max?: number;
    city?: string;
    region?: string;
    heroImage?: string;
    rating?: number;
  };
  onPress: () => void;
  onSave?: () => void;
  saved?: boolean;
  style?: any;
}

export const ActivityCard: React.FC<ActivityCardProps> = ({
  activity,
  onPress,
  onSave,
  saved = false,
  style,
}) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Animated.spring(scaleAnim, {
      toValue: 0.98,
      useNativeDriver: true,
      speed: 50,
      bounciness: 10,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      speed: 50,
      bounciness: 10,
    }).start();
  };

  const handleSave = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onSave?.();
  };

  const categoryColor = activity.category
    ? getCategoryColor(activity.category)
    : colors.accent.primary;

  const duration = activity.duration_min && activity.duration_max
    ? `${Math.round(activity.duration_min / 60)}-${Math.round(activity.duration_max / 60)}h`
    : null;

  return (
    <Animated.View
      style={[
        { transform: [{ scale: scaleAnim }] },
        styles.container,
        style,
      ]}
    >
      <TouchableOpacity
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={0.9}
      >
        <GlassCard padding="sm" radius="md" style={styles.card}>
          {/* Hero Image */}
          {activity.heroImage ? (
            <View style={styles.imageContainer}>
              <Image
                source={{ uri: activity.heroImage }}
                style={styles.heroImage}
                resizeMode="cover"
              />
              <LinearGradient
                colors={['transparent', 'rgba(10,14,23,0.8)']}
                style={styles.imageGradient}
              />
              
              {/* Save Button */}
              {onSave && (
                <TouchableOpacity
                  style={styles.saveButton}
                  onPress={handleSave}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <Text style={styles.saveIcon}>{saved ? '❤️' : '🤍'}</Text>
                </TouchableOpacity>
              )}
            </View>
          ) : (
            <View style={[styles.imageContainer, styles.placeholderImage]}>
              <LinearGradient
                colors={[categoryColor, colors.base.canvas]}
                style={StyleSheet.absoluteFill}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              />
            </View>
          )}

          {/* Content */}
          <View style={styles.content}>
            {/* Category Badge */}
            {activity.category && (
              <View
                style={[
                  styles.categoryBadge,
                  { backgroundColor: categoryColor + '30', borderColor: categoryColor + '60' }
                ]}
              >
                <Text style={[styles.categoryText, { color: categoryColor }]}>
                  {activity.category.toUpperCase()}
                </Text>
              </View>
            )}

            {/* Title */}
            <Text style={styles.title} numberOfLines={2}>
              {activity.name}
            </Text>

            {/* Description */}
            {activity.description && (
              <Text style={styles.description} numberOfLines={2}>
                {activity.description}
              </Text>
            )}

            {/* Meta Info */}
            <View style={styles.metaRow}>
              {duration && (
                <View style={styles.metaItem}>
                  <Text style={styles.metaIcon}>⏱</Text>
                  <Text style={styles.metaText}>{duration}</Text>
                </View>
              )}
              
              {activity.city && (
                <View style={styles.metaItem}>
                  <Text style={styles.metaIcon}>📍</Text>
                  <Text style={styles.metaText}>{activity.city}</Text>
                </View>
              )}

              {activity.rating && (
                <View style={styles.metaItem}>
                  <Text style={styles.metaIcon}>⭐</Text>
                  <Text style={styles.metaText}>{activity.rating.toFixed(1)}</Text>
                </View>
              )}
            </View>
          </View>
        </GlassCard>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: CARD_WIDTH,
    marginBottom: tokens.spacing.md,
  },
  card: {
    overflow: 'hidden',
  },
  imageContainer: {
    width: '100%',
    height: 200,
    borderRadius: tokens.radius.md,
    overflow: 'hidden',
    marginBottom: tokens.spacing.sm,
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  imageGradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: '50%',
  },
  placeholderImage: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  saveButton: {
    position: 'absolute',
    top: tokens.spacing.sm,
    right: tokens.spacing.sm,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(10,14,23,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  saveIcon: {
    fontSize: 20,
  },
  content: {
    padding: tokens.spacing.sm,
  },
  categoryBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: tokens.spacing.sm,
    paddingVertical: 4,
    borderRadius: tokens.radius.sm,
    borderWidth: 1,
    marginBottom: tokens.spacing.xs,
  },
  categoryText: {
    fontSize: tokens.typography.fontSize.xs,
    fontWeight: tokens.typography.fontWeight.bold,
    letterSpacing: 1,
  },
  title: {
    fontSize: tokens.typography.fontSize.lg,
    fontWeight: tokens.typography.fontWeight.bold,
    color: colors.text.primary,
    marginBottom: tokens.spacing.xs,
    lineHeight: tokens.typography.fontSize.lg * 1.3,
  },
  description: {
    fontSize: tokens.typography.fontSize.sm,
    color: colors.text.secondary,
    lineHeight: tokens.typography.fontSize.sm * tokens.typography.lineHeight.relaxed,
    marginBottom: tokens.spacing.sm,
  },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: tokens.spacing.sm,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    paddingHorizontal: tokens.spacing.sm,
    paddingVertical: 4,
    borderRadius: tokens.radius.sm,
  },
  metaIcon: {
    fontSize: 12,
    marginRight: 4,
  },
  metaText: {
    fontSize: tokens.typography.fontSize.xs,
    color: colors.text.secondary,
    fontWeight: tokens.typography.fontWeight.medium,
  },
});
