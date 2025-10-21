/**
 * DiscoveryScreen
 * Browse activities with parallax images, filters, and map view
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Dimensions,
  FlatList,
} from 'react-native';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Device from 'expo-device';
import { GlassCard } from '../components/design-system/GlassCard';
import { VibeChip } from '../components/design-system/VibeChip';
import { ActivityCard } from '../components/design-system/ActivityCard';
import { userApi } from '../src/services/userApi';
import { colors, getTimeGradient } from '../src/design-system/colors';
import { tokens } from '../src/design-system/tokens';

const { width, height } = Dimensions.get('window');

type RootStackParamList = {
  Discovery: undefined;
  ExperienceDetail: { activity: any };
  UserProfile: undefined;
};

const FILTER_CATEGORIES = [
  { id: 'all', label: 'All', emoji: '✨' },
  { id: 'adventure', label: 'Adventure', emoji: '⛰️' },
  { id: 'culture', label: 'Culture', emoji: '🎭' },
  { id: 'culinary', label: 'Food', emoji: '🍜' },
  { id: 'wellness', label: 'Wellness', emoji: '🧘' },
  { id: 'nature', label: 'Nature', emoji: '🌲' },
];

const MOCK_ACTIVITIES = [
  {
    id: 1,
    name: 'Mountain Hiking in Piatra Craiului',
    description: 'Explore breathtaking mountain trails with stunning views',
    category: 'adventure',
    duration_min: 180,
    duration_max: 360,
    city: 'Zarnesti',
    region: 'Brasov',
    rating: 4.8,
    heroImage: 'https://images.unsplash.com/photo-1551632811-561732d1e306?w=800',
  },
  {
    id: 2,
    name: 'Traditional Romanian Cooking Class',
    description: 'Learn to make authentic sarmale and mici with a local chef',
    category: 'culinary',
    duration_min: 120,
    duration_max: 180,
    city: 'Bucharest',
    region: 'Bucharest',
    rating: 4.9,
    heroImage: 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=800',
  },
  {
    id: 3,
    name: 'Therme Spa Experience',
    description: 'Relax in thermal pools and enjoy world-class wellness facilities',
    category: 'wellness',
    duration_min: 180,
    duration_max: 480,
    city: 'Bucharest',
    region: 'Bucharest',
    rating: 4.7,
    heroImage: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=800',
  },
  {
    id: 4,
    name: 'Old Town Walking Tour',
    description: 'Discover hidden courtyards and historic landmarks',
    category: 'culture',
    duration_min: 120,
    duration_max: 180,
    city: 'Bucharest',
    region: 'Bucharest',
    rating: 4.6,
    heroImage: 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=800',
  },
  {
    id: 5,
    name: 'Danube Delta Boat Tour',
    description: 'Wildlife watching and bird photography in pristine wetlands',
    category: 'nature',
    duration_min: 480,
    duration_max: 720,
    city: 'Tulcea',
    region: 'Tulcea',
    rating: 4.9,
    heroImage: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800',
  },
];

export const DiscoveryScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showMap, setShowMap] = useState(false);
  const [savedActivities, setSavedActivities] = useState<number[]>([]);
  const [deviceId, setDeviceId] = useState<string>('');
  const scrollY = useRef(new Animated.Value(0)).current;
  
  const gradient = getTimeGradient();

  useEffect(() => {
    initializeScreen();
  }, []);

  const initializeScreen = async () => {
    try {
      const id = Device.modelId || `device-${Math.random().toString(36).substr(2, 9)}`;
      setDeviceId(id);
      
      console.log('📍 Location: Bucharest, Romania (hardcoded)');
      
      // Load saved activities
      const { savedActivities: saved } = await userApi.getSavedActivities(id, 'saved');
      setSavedActivities(saved.map(a => a.activity_id));
    } catch (error) {
      console.error('Failed to initialize:', error);
    }
  };

  const handleActivityPress = (activity: any) => {
    navigation.navigate('ExperienceDetail', { activity });
  };

  const handleSaveActivity = async (activityId: number) => {
    try {
      if (savedActivities.includes(activityId)) {
        await userApi.unsaveActivity(deviceId, activityId);
        setSavedActivities(prev => prev.filter(id => id !== activityId));
      } else {
        await userApi.saveActivity(deviceId, activityId);
        setSavedActivities(prev => [...prev, activityId]);
      }
    } catch (error) {
      console.error('Failed to save activity:', error);
    }
  };

  const filteredActivities = selectedCategory === 'all'
    ? MOCK_ACTIVITIES
    : MOCK_ACTIVITIES.filter(a => a.category === selectedCategory);

  // Parallax header animation
  const headerHeight = scrollY.interpolate({
    inputRange: [0, 200],
    outputRange: [200, 100],
    extrapolate: 'clamp',
  });

  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 150],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });

  return (
    <View style={styles.container}>
      {/* Animated Header */}
      <Animated.View style={[styles.header, { height: headerHeight }]}>
        <LinearGradient
          colors={[gradient.start, gradient.end]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
        <Animated.View style={[styles.headerContent, { opacity: headerOpacity }]}>
          <Text style={styles.headerTitle}>Discover</Text>
          <Text style={styles.headerSubtitle}>Find your next adventure</Text>
        </Animated.View>
        
        {/* Profile Button */}
        <TouchableOpacity
          style={styles.profileButton}
          onPress={() => navigation.navigate('UserProfile')}
        >
          <Text style={styles.profileIcon}>👤</Text>
        </TouchableOpacity>
      </Animated.View>

      {/* Filter Chips */}
      <View style={styles.filtersContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filtersContent}
        >
          {FILTER_CATEGORIES.map(category => (
            <VibeChip
              key={category.id}
              emoji={category.emoji}
              label={category.label}
              selected={selectedCategory === category.id}
              onPress={() => setSelectedCategory(category.id)}
              style={styles.filterChip}
            />
          ))}
        </ScrollView>
        
        {/* Map Toggle */}
        <TouchableOpacity
          style={styles.mapToggle}
          onPress={() => setShowMap(!showMap)}
        >
          <Text style={styles.mapToggleText}>{showMap ? '📋' : '🗺️'}</Text>
        </TouchableOpacity>
      </View>

      {/* Activities List */}
      <Animated.ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false }
        )}
        scrollEventThrottle={16}
      >
        {showMap ? (
          <GlassCard style={styles.mapPlaceholder} padding="xl" radius="md">
            <Text style={styles.mapPlaceholderText}>🗺️</Text>
            <Text style={styles.mapPlaceholderLabel}>Map View</Text>
            <Text style={styles.mapPlaceholderDescription}>
              Coming soon: Interactive map with activity locations
            </Text>
          </GlassCard>
        ) : (
          filteredActivities.map((activity, index) => (
            <Animated.View
              key={activity.id}
              style={{
                opacity: 1, // Simplified - remove complex parallax for now
              }}
            >
              <ActivityCard
                activity={activity}
                onPress={() => handleActivityPress(activity)}
                onSave={() => handleSaveActivity(activity.id)}
                saved={savedActivities.includes(activity.id)}
              />
            </Animated.View>
          ))
        )}
        
        {!showMap && filteredActivities.length === 0 && (
          <GlassCard style={styles.emptyState} padding="xl" radius="md">
            <Text style={styles.emptyStateEmoji}>🔍</Text>
            <Text style={styles.emptyStateText}>
              No activities found in this category
            </Text>
            <Text style={styles.emptyStateSubtext}>
              Try selecting a different filter
            </Text>
          </GlassCard>
        )}
      </Animated.ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.base.canvas,
  },
  header: {
    width: '100%',
    justifyContent: 'flex-end',
    paddingBottom: tokens.spacing.lg,
    paddingHorizontal: tokens.spacing.lg,
    overflow: 'hidden',
  },
  headerContent: {
    marginBottom: tokens.spacing.md,
  },
  headerTitle: {
    fontSize: tokens.typography.fontSize.xxl,
    fontWeight: tokens.typography.fontWeight.bold,
    color: colors.text.primary,
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: tokens.typography.fontSize.md,
    color: colors.text.secondary,
  },
  profileButton: {
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
  profileIcon: {
    fontSize: 24,
  },
  filtersContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: tokens.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  filtersContent: {
    paddingHorizontal: tokens.spacing.lg,
    gap: tokens.spacing.sm,
  },
  filterChip: {
    marginRight: 0,
  },
  mapToggle: {
    width: 44,
    height: 44,
    marginRight: tokens.spacing.md,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.base.surface,
    borderRadius: tokens.radius.sm,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  mapToggleText: {
    fontSize: 20,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: tokens.spacing.lg,
    paddingTop: tokens.spacing.md,
  },
  mapPlaceholder: {
    height: 400,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mapPlaceholderText: {
    fontSize: 64,
    marginBottom: tokens.spacing.md,
  },
  mapPlaceholderLabel: {
    fontSize: tokens.typography.fontSize.lg,
    fontWeight: tokens.typography.fontWeight.bold,
    color: colors.text.primary,
    marginBottom: tokens.spacing.xs,
  },
  mapPlaceholderDescription: {
    fontSize: tokens.typography.fontSize.sm,
    color: colors.text.secondary,
    textAlign: 'center',
  },
  emptyState: {
    marginTop: tokens.spacing.xxl,
    alignItems: 'center',
  },
  emptyStateEmoji: {
    fontSize: 64,
    marginBottom: tokens.spacing.md,
  },
  emptyStateText: {
    fontSize: tokens.typography.fontSize.lg,
    fontWeight: tokens.typography.fontWeight.semibold,
    color: colors.text.primary,
    marginBottom: tokens.spacing.xs,
  },
  emptyStateSubtext: {
    fontSize: tokens.typography.fontSize.sm,
    color: colors.text.secondary,
  },
});
