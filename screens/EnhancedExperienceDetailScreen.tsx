/**
 * Enhanced Experience Detail Screen
 * Fullscreen parallax hero with glass morphism content
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Dimensions,
  Linking,
  Alert,
  Share,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Device from 'expo-device';
import { GlassCard } from '../components/design-system/GlassCard';
import { GradientButton } from '../components/design-system/GradientButton';
import YouTubeVideoCard from '../components/YouTubeVideoCard';
import WikipediaInfo from '../components/WikipediaInfo';
import WebContextCard from '../components/WebContextCard';
import { enrichmentApiService, ActivityEnrichment } from '../src/services/enrichmentApi';
import { userApi } from '../src/services/userApi';
import { colors, getCategoryColor } from '../src/design-system/colors';
import { tokens } from '../src/design-system/tokens';

const { width, height } = Dimensions.get('window');
const HEADER_MAX_HEIGHT = height * 0.6;
const HEADER_MIN_HEIGHT = 100;
const HEADER_SCROLL_DISTANCE = HEADER_MAX_HEIGHT - HEADER_MIN_HEIGHT;

export default function EnhancedExperienceDetailScreen() {
  const route = useRoute();
  const navigation = useNavigation();
  const { activity } = route.params as { activity: any };
  
  const [enrichment, setEnrichment] = useState<ActivityEnrichment | null>(null);
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);
  const [deviceId, setDeviceId] = useState<string>('');
  
  const scrollY = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    initializeScreen();
  }, []);

  const initializeScreen = async () => {
    try {
      const id = Device.modelId || `device-${Math.random().toString(36).substr(2, 9)}`;
      setDeviceId(id);
      
      // Check if activity is saved
      const { savedActivities } = await userApi.getSavedActivities(id, 'saved');
      setSaved(savedActivities.some(a => a.activity_id === activity.id));
      
      // Load enrichment
      const activityName = activity.name || 'activity';
      const region = activity.region || activity.city || 'Romania';
      const enrichmentData = await enrichmentApiService.getActivityEnrichment(activityName, region);
      setEnrichment(enrichmentData);
    } catch (error) {
      console.warn('Failed to initialize:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      if (saved) {
        await userApi.unsaveActivity(deviceId, activity.id);
        setSaved(false);
      } else {
        await userApi.saveActivity(deviceId, activity.id);
        setSaved(true);
      }
    } catch (error) {
      console.error('Failed to save activity:', error);
      Alert.alert('Error', 'Failed to save activity');
    }
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Check out ${activity.name}!`,
        title: activity.name,
      });
    } catch (error) {
      console.error('Failed to share:', error);
    }
  };

  const handleBook = async () => {
    if (activity.booking_url) {
      await Linking.openURL(activity.booking_url);
    } else {
      Alert.alert('Booking', 'Booking functionality coming soon!');
    }
  };

  const handleOpenMaps = async () => {
    try {
      let mapsUrl;
      if (activity.maps_url) {
        mapsUrl = activity.maps_url;
      } else {
        mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(activity.name)}`;
      }
      await Linking.openURL(mapsUrl);
    } catch (error) {
      console.error('Error opening maps:', error);
      Alert.alert('Error', 'Could not open maps');
    }
  };

  // Parallax animations
  const headerHeight = scrollY.interpolate({
    inputRange: [0, HEADER_SCROLL_DISTANCE],
    outputRange: [HEADER_MAX_HEIGHT, HEADER_MIN_HEIGHT],
    extrapolate: 'clamp',
  });

  const imageOpacity = scrollY.interpolate({
    inputRange: [0, HEADER_SCROLL_DISTANCE / 2, HEADER_SCROLL_DISTANCE],
    outputRange: [1, 0.8, 0.3],
    extrapolate: 'clamp',
  });

  const imageTranslate = scrollY.interpolate({
    inputRange: [0, HEADER_SCROLL_DISTANCE],
    outputRange: [0, -50],
    extrapolate: 'clamp',
  });

  const categoryColor = activity.category
    ? getCategoryColor(activity.category)
    : colors.accent.primary;

  return (
    <View style={styles.container}>
      {/* Parallax Hero Image */}
      <Animated.View style={[styles.header, { height: headerHeight }]}>
        <Animated.Image
          source={{ uri: activity.heroImage || 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800' }}
          style={[
            styles.heroImage,
            {
              opacity: imageOpacity,
              transform: [{ translateY: imageTranslate }],
            },
          ]}
          resizeMode="cover"
        />
        
        {/* Gradient Overlay */}
        <LinearGradient
          colors={['transparent', 'rgba(10,14,23,0.3)', 'rgba(10,14,23,0.9)']}
          style={styles.gradient}
        />

        {/* Back Button */}
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>

        {/* Save Button */}
        <TouchableOpacity
          style={styles.saveButtonHeader}
          onPress={handleSave}
        >
          <Text style={styles.saveIcon}>{saved ? '❤️' : '🤍'}</Text>
        </TouchableOpacity>
      </Animated.View>

      {/* Content */}
      <Animated.ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        scrollEventThrottle={16}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false }
        )}
      >
        {/* Main Info Card */}
        <GlassCard style={styles.mainCard} padding="lg" radius="md">
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
          <Text style={styles.title}>{activity.name}</Text>

          {/* Meta Info */}
          <View style={styles.metaRow}>
            {activity.rating && (
              <View style={styles.metaItem}>
                <Text style={styles.metaIcon}>⭐</Text>
                <Text style={styles.metaText}>{activity.rating.toFixed(1)}</Text>
              </View>
            )}
            {activity.city && (
              <View style={styles.metaItem}>
                <Text style={styles.metaIcon}>📍</Text>
                <Text style={styles.metaText}>{activity.city}</Text>
              </View>
            )}
            {activity.duration_min && (
              <View style={styles.metaItem}>
                <Text style={styles.metaIcon}>⏱</Text>
                <Text style={styles.metaText}>
                  {Math.round(activity.duration_min / 60)}-{Math.round(activity.duration_max / 60)}h
                </Text>
              </View>
            )}
          </View>

          {/* Description */}
          {activity.description && (
            <Text style={styles.description}>{activity.description}</Text>
          )}

          {/* Action Buttons */}
          <View style={styles.actions}>
            <GradientButton
              title="Book Now"
              onPress={handleBook}
              size="lg"
              style={styles.bookButton}
            />
            <TouchableOpacity style={styles.iconButton} onPress={handleOpenMaps}>
              <Text style={styles.iconButtonText}>🗺️</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconButton} onPress={handleShare}>
              <Text style={styles.iconButtonText}>📤</Text>
            </TouchableOpacity>
          </View>
        </GlassCard>

        {/* Enrichment Content */}
        {enrichment && (
          <>
            {enrichment.wikipedia && (
              <WikipediaInfo data={enrichment.wikipedia} />
            )}
            
            {enrichment.videos && enrichment.videos.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Video Guides</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  {enrichment.videos.map((video, index) => (
                    <YouTubeVideoCard key={index} video={video} />
                  ))}
                </ScrollView>
              </View>
            )}

            {enrichment.webContext && (
              <WebContextCard data={enrichment.webContext} />
            )}
          </>
        )}

        {/* Similar Activities (Placeholder) */}
        <GlassCard style={styles.section} padding="lg" radius="md">
          <Text style={styles.sectionTitle}>Similar Vibes</Text>
          <Text style={styles.sectionDescription}>
            More activities you might enjoy
          </Text>
          <View style={styles.similarPlaceholder}>
            <Text style={styles.similarPlaceholderText}>
              🔮 Coming soon: AI-powered similar recommendations
            </Text>
          </View>
        </GlassCard>

        <View style={{ height: 40 }} />
      </Animated.ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.base.canvas,
  },
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    overflow: 'hidden',
    zIndex: 10,
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  gradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: '80%',
  },
  backButton: {
    position: 'absolute',
    top: 50,
    left: tokens.spacing.lg,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(10,14,23,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  backButtonText: {
    fontSize: 24,
    color: colors.text.primary,
  },
  saveButtonHeader: {
    position: 'absolute',
    top: 50,
    right: tokens.spacing.lg,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(10,14,23,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  saveIcon: {
    fontSize: 24,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: HEADER_MAX_HEIGHT - 100,
    paddingHorizontal: tokens.spacing.lg,
  },
  mainCard: {
    marginBottom: tokens.spacing.lg,
  },
  categoryBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: tokens.spacing.sm,
    paddingVertical: 4,
    borderRadius: tokens.radius.sm,
    borderWidth: 1,
    marginBottom: tokens.spacing.sm,
  },
  categoryText: {
    fontSize: tokens.typography.fontSize.xs,
    fontWeight: tokens.typography.fontWeight.bold,
    letterSpacing: 1,
  },
  title: {
    fontSize: tokens.typography.fontSize.xxl,
    fontWeight: tokens.typography.fontWeight.bold,
    color: colors.text.primary,
    marginBottom: tokens.spacing.md,
    lineHeight: tokens.typography.fontSize.xxl * 1.2,
  },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: tokens.spacing.sm,
    marginBottom: tokens.spacing.md,
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
    fontSize: 14,
    marginRight: 4,
  },
  metaText: {
    fontSize: tokens.typography.fontSize.sm,
    color: colors.text.secondary,
    fontWeight: tokens.typography.fontWeight.medium,
  },
  description: {
    fontSize: tokens.typography.fontSize.md,
    color: colors.text.secondary,
    lineHeight: tokens.typography.fontSize.md * tokens.typography.lineHeight.relaxed,
    marginBottom: tokens.spacing.lg,
  },
  actions: {
    flexDirection: 'row',
    gap: tokens.spacing.sm,
  },
  bookButton: {
    flex: 1,
  },
  iconButton: {
    width: 50,
    height: 50,
    borderRadius: tokens.radius.sm,
    backgroundColor: colors.base.surface,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  iconButtonText: {
    fontSize: 24,
  },
  section: {
    marginBottom: tokens.spacing.lg,
  },
  sectionTitle: {
    fontSize: tokens.typography.fontSize.lg,
    fontWeight: tokens.typography.fontWeight.bold,
    color: colors.text.primary,
    marginBottom: tokens.spacing.xs,
  },
  sectionDescription: {
    fontSize: tokens.typography.fontSize.sm,
    color: colors.text.secondary,
    marginBottom: tokens.spacing.md,
  },
  similarPlaceholder: {
    padding: tokens.spacing.xl,
    alignItems: 'center',
  },
  similarPlaceholderText: {
    fontSize: tokens.typography.fontSize.sm,
    color: colors.text.tertiary,
    textAlign: 'center',
  },
});
