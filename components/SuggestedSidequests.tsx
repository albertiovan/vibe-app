/**
 * SuggestedSidequests Component
 * Horizontal scrolling list of 3 personalized activity suggestions
 * Similar to Challenge Me but more aligned with user preferences
 * while still gently pushing boundaries
 */

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { useTheme } from '../src/contexts/ThemeContext';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = SCREEN_WIDTH * 0.75;
const CARD_SPACING = 16;

interface Sidequest {
  id: number;
  name: string;
  category: string;
  energyLevel: string;
  description: string;
  imageUrl?: string;
  venues?: any[];
  estimatedDuration?: string;
  distance?: number;
}

interface SuggestedSidequestsProps {
  deviceId: string;
  userLocation?: { latitude: number; longitude: number };
}

type RootStackParamList = {
  ActivityDetailScreenShell: {
    activity: any;
    userLocation?: { latitude: number; longitude: number };
  };
};

export const SuggestedSidequests: React.FC<SuggestedSidequestsProps> = ({
  deviceId,
  userLocation,
}) => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const { colors: themeColors } = useTheme();
  const [sidequests, setSidequests] = useState<Sidequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadSidequests();
  }, [deviceId]);

  const loadSidequests = async () => {
    try {
      setLoading(true);
      setError(null);

      // Try to fetch from API, but gracefully fall back to mock data
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 2000);
        
        const response = await fetch(`http://localhost:3000/api/sidequests?deviceId=${deviceId}`, {
          signal: controller.signal,
        });
        
        clearTimeout(timeoutId);
        
        if (response.ok) {
          const data = await response.json();
          setSidequests(data.sidequests || []);
          return;
        }
      } catch (apiError) {
        // API not available, use mock data silently
        console.log('📋 Using mock sidequests (backend not available)');
      }

      // Use mock data for development
      setSidequests(getMockSidequests());
    } catch (err) {
      console.log('📋 Using mock sidequests');
      setSidequests(getMockSidequests());
    } finally {
      setLoading(false);
    }
  };

  const getMockSidequests = (): Sidequest[] => {
    return [
      {
        id: 1,
        name: 'Morning Yoga Session',
        category: 'wellness',
        energyLevel: 'low',
        description: 'Start your day with mindful movement',
        estimatedDuration: '1 hour',
      },
      {
        id: 2,
        name: 'Local Art Gallery',
        category: 'culture',
        energyLevel: 'medium',
        description: 'Discover contemporary Romanian art',
        estimatedDuration: '2 hours',
      },
      {
        id: 3,
        name: 'Sunset Hike',
        category: 'nature',
        energyLevel: 'high',
        description: 'Catch golden hour views from the hills',
        estimatedDuration: '3 hours',
      },
    ];
  };

  const handleSidequestPress = (sidequest: Sidequest) => {
    navigation.navigate('ActivityDetailScreenShell', {
      activity: {
        id: sidequest.id,
        name: sidequest.name,
        category: sidequest.category,
        energyLevel: sidequest.energyLevel,
        description: sidequest.description,
        imageUrl: sidequest.imageUrl,
        venues: sidequest.venues || [],
        estimatedDuration: sidequest.estimatedDuration,
      },
      userLocation,
    });
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={[styles.sectionTitle, { color: themeColors.text.primary }]}>Suggested Sidequests</Text>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color={themeColors.text.secondary} />
          <Text style={[styles.loadingText, { color: themeColors.text.secondary }]}>Finding adventures...</Text>
        </View>
      </View>
    );
  }

  if (error || sidequests.length === 0) {
    return null; // Hide section if no sidequests
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={[styles.sectionTitle, { color: themeColors.text.primary }]}>Suggested Sidequests</Text>
        <Text style={[styles.sectionSubtitle, { color: themeColors.text.secondary }]}>
          Personalized picks to expand your horizons
        </Text>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        snapToInterval={CARD_WIDTH + CARD_SPACING}
        decelerationRate="fast"
        snapToAlignment="start"
      >
        {sidequests.map((sidequest, index) => (
          <TouchableOpacity
            key={sidequest.id}
            style={[
              styles.card,
              index === 0 && styles.firstCard,
              index === sidequests.length - 1 && styles.lastCard,
            ]}
            onPress={() => handleSidequestPress(sidequest)}
            activeOpacity={0.8}
          >
            {/* Image or placeholder */}
            {sidequest.imageUrl ? (
              <Image
                source={{ uri: sidequest.imageUrl }}
                style={styles.cardImage}
                resizeMode="cover"
              />
            ) : (
              <View style={styles.cardImagePlaceholder}>
                <Text style={styles.placeholderEmoji}>
                  {getCategoryEmoji(sidequest.category)}
                </Text>
              </View>
            )}

            {/* Content */}
            <View style={styles.cardContent}>
              <View style={styles.cardHeader}>
                <Text style={[styles.cardCategory, { color: themeColors.text.tertiary }]}>{sidequest.category}</Text>
                <View style={styles.energyBadge}>
                  <Text style={styles.energyText}>
                    {getEnergyIcon(sidequest.energyLevel)}
                  </Text>
                </View>
              </View>

              <Text style={[styles.cardTitle, { color: themeColors.text.primary }]} numberOfLines={2}>
                {sidequest.name}
              </Text>

              <Text style={[styles.cardDescription, { color: themeColors.text.secondary }]} numberOfLines={2}>
                {sidequest.description}
              </Text>

              {sidequest.estimatedDuration && (
                <View style={styles.cardFooter}>
                  <Text style={[styles.durationText, { color: themeColors.text.tertiary }]}>
                    ⏱ {sidequest.estimatedDuration}
                  </Text>
                </View>
              )}
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

const getCategoryEmoji = (category: string): string => {
  const emojiMap: { [key: string]: string } = {
    wellness: '🧘',
    nature: '🌲',
    culture: '🎭',
    adventure: '⛰️',
    learning: '📚',
    culinary: '🍜',
    water: '🌊',
    nightlife: '🌃',
    social: '🎉',
    fitness: '💪',
    sports: '⚽',
    seasonal: '🎄',
    romance: '💕',
    mindfulness: '🧠',
    creative: '🎨',
  };
  return emojiMap[category] || '✨';
};

const getEnergyIcon = (energyLevel: string): string => {
  const iconMap: { [key: string]: string } = {
    low: '🌙',
    medium: '☀️',
    high: '⚡',
  };
  return iconMap[energyLevel] || '☀️';
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 24,
  },
  header: {
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.6)',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    gap: 12,
  },
  loadingText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.6)',
  },
  scrollContent: {
    paddingLeft: 20,
    paddingRight: 20,
  },
  card: {
    width: CARD_WIDTH,
    marginRight: CARD_SPACING,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    overflow: 'hidden',
  },
  firstCard: {
    // No extra margin
  },
  lastCard: {
    marginRight: 0,
  },
  cardImage: {
    width: '100%',
    height: 140,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  cardImagePlaceholder: {
    width: '100%',
    height: 140,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderEmoji: {
    fontSize: 48,
  },
  cardContent: {
    padding: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  cardCategory: {
    fontSize: 11,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.6)',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  energyBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 10,
  },
  energyText: {
    fontSize: 12,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 6,
    lineHeight: 24,
  },
  cardDescription: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
    lineHeight: 20,
    marginBottom: 12,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  durationText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.5)',
  },
});
