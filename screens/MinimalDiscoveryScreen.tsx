/**
 * MinimalDiscoveryScreen
 * Minimal monochrome discovery screen for browsing activities
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Image,
} from 'react-native';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Device from 'expo-device';
import { userApi } from '../src/services/userApi';

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

export const MinimalDiscoveryScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [savedActivities, setSavedActivities] = useState<number[]>([]);
  const [deviceId, setDeviceId] = useState<string>('');

  useEffect(() => {
    initializeScreen();
  }, []);

  const initializeScreen = async () => {
    const id = Device.modelId || `device-${Math.random().toString(36).substr(2, 9)}`;
    setDeviceId(id);
    
    // Try to load saved activities, but don't fail if API is down
    try {
      const { savedActivities: saved } = await userApi.getSavedActivities(id, 'saved');
      setSavedActivities(saved.map(a => a.activity_id));
    } catch (error) {
      console.log('Could not load saved activities, using defaults');
      setSavedActivities([]);
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
      console.log('Could not save activity');
      // Optimistically update UI anyway
      if (savedActivities.includes(activityId)) {
        setSavedActivities(prev => prev.filter(id => id !== activityId));
      } else {
        setSavedActivities(prev => [...prev, activityId]);
      }
    }
  };

  const filteredActivities = selectedCategory === 'all'
    ? MOCK_ACTIVITIES
    : MOCK_ACTIVITIES.filter(a => a.category === selectedCategory);

  const formatDuration = (min: number, max: number) => {
    const minHours = Math.floor(min / 60);
    const maxHours = Math.floor(max / 60);
    if (minHours === maxHours) {
      return `${minHours}h`;
    }
    return `${minHours}-${maxHours}h`;
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Text style={styles.backText}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Discover</Text>
          <View style={styles.headerSpacer} />
        </View>

        {/* Category Filters */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filtersScroll}
          style={styles.filtersContainer}
        >
          {FILTER_CATEGORIES.map((category) => (
            <TouchableOpacity
              key={category.id}
              style={[
                styles.categoryChip,
                selectedCategory === category.id && styles.categoryChipSelected,
              ]}
              onPress={() => setSelectedCategory(category.id)}
              activeOpacity={0.7}
            >
              <Text style={styles.categoryEmoji}>{category.emoji}</Text>
              <Text
                style={[
                  styles.categoryLabel,
                  selectedCategory === category.id && styles.categoryLabelSelected,
                ]}
              >
                {category.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Activities List */}
        <FlatList
          data={filteredActivities}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.activityCard}
              onPress={() => handleActivityPress(item)}
              activeOpacity={0.7}
            >
              {/* Image */}
              <View style={styles.imageContainer}>
                <Image
                  source={{ uri: item.heroImage }}
                  style={styles.activityImage}
                  resizeMode="cover"
                />
                <View style={styles.imageOverlay} />
                
                {/* Save Button */}
                <TouchableOpacity
                  style={styles.saveButton}
                  onPress={() => handleSaveActivity(item.id)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.saveIcon}>
                    {savedActivities.includes(item.id) ? '♥' : '♡'}
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Content */}
              <View style={styles.cardContent}>
                <Text style={styles.activityName} numberOfLines={2}>
                  {item.name}
                </Text>
                <Text style={styles.activityDescription} numberOfLines={2}>
                  {item.description}
                </Text>
                
                {/* Meta */}
                <View style={styles.metaRow}>
                  <Text style={styles.metaText}>
                    ⏱ {formatDuration(item.duration_min, item.duration_max)}
                  </Text>
                  <Text style={styles.metaDivider}>•</Text>
                  <Text style={styles.metaText}>
                    📍 {item.city}
                  </Text>
                  <Text style={styles.metaDivider}>•</Text>
                  <Text style={styles.metaText}>
                    ⭐ {item.rating}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          )}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#000000',
  },
  container: {
    flex: 1,
    backgroundColor: '#000000',
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
  filtersContainer: {
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  filtersScroll: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 8,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    marginRight: 8,
  },
  categoryChipSelected: {
    backgroundColor: '#FFFFFF',
    borderColor: '#FFFFFF',
  },
  categoryEmoji: {
    fontSize: 16,
    marginRight: 6,
  },
  categoryLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.8)',
  },
  categoryLabelSelected: {
    color: '#000000',
  },
  listContent: {
    padding: 20,
    gap: 16,
  },
  activityCard: {
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    overflow: 'hidden',
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
  saveButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  saveIcon: {
    fontSize: 20,
    color: '#FFFFFF',
  },
  cardContent: {
    padding: 16,
  },
  activityName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  activityDescription: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
    lineHeight: 20,
    marginBottom: 12,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaText: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.6)',
  },
  metaDivider: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.3)',
    marginHorizontal: 8,
  },
});
