import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  ActivityIndicator,
  Image,
  Linking,
  Dimensions,
  Modal,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import ExperienceDetailScreen from './ExperienceDetailScreen';
import EnrichedActivityCard from './components/EnrichedActivityCard';
import { ChatHomeScreen } from './screens/ChatHomeScreen';
import { ChatConversationScreen } from './screens/ChatConversationScreen';
import { UserProfileScreen } from './screens/UserProfileScreen';
import { MinimalUserProfileScreen } from './screens/MinimalUserProfileScreen';
import { ProfileScreenShell } from './screens/ProfileScreenShell';
import { DiscoveryScreen } from './screens/DiscoveryScreen';
import { MinimalDiscoveryScreen } from './screens/MinimalDiscoveryScreen';
import { SavedActivitiesScreen } from './screens/SavedActivitiesScreen';
import EnhancedExperienceDetailScreen from './screens/EnhancedExperienceDetailScreen';
import { TrainingModeScreen } from './screens/TrainingModeScreen';
import { OnboardingScreen as NewUserOnboarding } from './screens/OnboardingScreen';
import { ActivityCompletionWrapper } from './components/ActivityCompletionWrapper';
import { userStorage } from './src/services/userStorage';
import * as Location from 'expo-location';
import { LanguageProvider } from './src/i18n/LanguageContext';
import { ThemeProvider } from './src/contexts/ThemeContext';
import { VibeProvider } from './src/contexts/VibeContext';
// New Minimalistic UI - Pure Black, No Orb, Sidequests
import { HomeScreenMinimal } from './screens/HomeScreenMinimal';
import { NewHomeScreen } from './screens/NewHomeScreen';
import { MinimalSuggestionsScreen } from './screens/MinimalSuggestionsScreen';
import { MinimalActivityDetailScreen } from './screens/MinimalActivityDetailScreen';
import { MinimalChallengeMeScreen } from './screens/MinimalChallengeMeScreen';
import { ActivityAcceptedScreen } from './screens/ActivityAcceptedScreen';
import { ComponentShowcaseScreen } from './screens/ComponentShowcaseScreen';
import CommunityScreen from './screens/CommunityScreen';
import { isFeatureEnabled } from './config/featureFlags';

// Define navigation types
type RootStackParamList = {
  ChatHome: undefined;
  NewChatHome: undefined; // New visual shell home (old)
  HomeScreenShell: undefined; // New visual shell home (Prompt B)
  HomeScreenMinimal: undefined; // Minimal ChatGPT-style home
  NewHomeScreen: undefined; // Redesigned home with smooth animations
  SuggestionsScreenShell: { // New suggestions screen (Prompt C)
    conversationId: number;
    deviceId: string;
    userMessage: string;
    filters?: any;
    userLocation?: { latitude: number; longitude: number };
  };
  ActivitySuggestions: { // Old suggestions screen
    conversationId: number;
    deviceId: string;
    userMessage: string;
    filters?: any;
    userLocation?: { latitude: number; longitude: number };
  };
  ActivityDetailScreenShell: { // New detail screen (Prompt D)
    activity: any;
    userLocation?: { latitude: number; longitude: number };
  };
  ChallengeMeScreen: { // Challenge Me screen
    deviceId: string;
    userLocation?: { latitude: number; longitude: number };
  };
  ActivityAcceptedScreen: { // Activity accepted screen
    activity: any;
    userLocation?: { latitude: number; longitude: number };
  };
  ActivityDetail: { // Old detail screen
    activity: any;
    userLocation?: { latitude: number; longitude: number };
  };
  DevPreview: undefined; // Component showcase
  ChatConversation: {
    conversationId: number;
    deviceId: string;
    initialMessage?: string;
  };
  UserProfile: undefined;
  Community: undefined;
  Discovery: undefined;
  SavedActivities: undefined;
  TrainingMode: undefined;
  EnhancedExperienceDetail: {
    activity: any;
  };
  Onboarding: undefined;
  Home: undefined;
  ComponentShowcase: undefined;
  Results: {
    places: any[];
    vibeAnalysis: any;
    vibe: string;
    totalFound: number;
  };
  ExperienceDetail: {
    place: any;
  };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

// Helper functions to convert vibe text to mood and energy
function getVibeToMood(vibe: string): string {
  const text = vibe.toLowerCase();
  if (text.includes('adventurous') || text.includes('adventure') || text.includes('exciting')) return 'adventurous';
  if (text.includes('relax') || text.includes('calm') || text.includes('peaceful') || text.includes('chill')) return 'relaxed';
  if (text.includes('creative') || text.includes('art') || text.includes('culture')) return 'creative';
  if (text.includes('social') || text.includes('party') || text.includes('friends')) return 'social';
  if (text.includes('contemplative') || text.includes('think') || text.includes('quiet')) return 'contemplative';
  if (text.includes('fun') || text.includes('playful') || text.includes('enjoy')) return 'playful';
  return 'adventurous'; // Default
}

function getVibeToEnergy(vibe: string): string {
  const text = vibe.toLowerCase();
  if (text.includes('high energy') || text.includes('exciting') || text.includes('intense') || text.includes('adventure')) return 'high';
  if (text.includes('low energy') || text.includes('relax') || text.includes('calm') || text.includes('chill')) return 'low';
  return 'medium'; // Default
}

// Home Screen Component
// Search filters interface
interface SearchFilters {
  distanceKm: number;
  durationHours: number;
}

// Preset configurations
const DISTANCE_PRESETS = [
  { label: 'Nearby', value: 4, description: '3-5km around you' },
  { label: 'In the city', value: 10, description: '8-12km radius' },
  { label: 'Day trip', value: 100, description: '50-150km adventure' }
];

const DURATION_PRESETS = [
  { label: '1-2h', value: 1.5, description: 'Quick experience' },
  { label: '2-4h', value: 3, description: 'Half day activity' },
  { label: '4-6h', value: 5, description: 'Full day adventure' },
  { label: '8-12h', value: 10, description: 'Day trip with travel', travel: true }
];

// Help suggestions based on context
const HELP_SUGGESTIONS = [
  {
    condition: 'clear_day',
    title: 'Clear afternoon?',
    suggestion: 'Try 8km, 2-4h, "adrenaline outdoors"',
    vibe: 'adrenaline outdoors',
    distance: 8,
    duration: 3
  },
  {
    condition: 'rainy_day', 
    title: 'Rainy weather?',
    suggestion: 'Try 4km, 1-2h, "cozy cultural indoor"',
    vibe: 'cozy cultural indoor',
    distance: 4,
    duration: 1.5
  },
  {
    condition: 'weekend',
    title: 'Weekend vibes?',
    suggestion: 'Try 15km, 4-6h, "adventure with friends"',
    vibe: 'adventure with friends',
    distance: 15,
    duration: 5
  }
];

// Old Onboarding Screen - Removed
// Using dedicated OnboardingScreen.tsx imported at the top

function HomeScreen({ navigation }: { navigation: any }) {
  const [vibe, setVibe] = useState('');
  const [filters, setFilters] = useState<SearchFilters>({ distanceKm: 10, durationHours: 3 });
  const [loading, setLoading] = useState(false);
  const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [showHelp, setShowHelp] = useState(false);
  const [selectedDistancePreset, setSelectedDistancePreset] = useState(1); // Default to "In the city"
  const [selectedDurationPreset, setSelectedDurationPreset] = useState(1); // Default to "2-4h"
  const [userId, setUserId] = useState<string | null>(null);

  // Get user ID from storage or generate one
  React.useEffect(() => {
    // For now, use a simple user ID - in production, this would come from authentication
    const storedUserId = `user_${Date.now()}`;
    setUserId(storedUserId);
    console.log('👤 Using user ID for search:', storedUserId);
  }, []);

  // Sample vibe suggestions
  const vibeChips = [
    "I want adventure",
    "Something cultural", 
    "Peaceful nature",
    "Fun with friends",
    "Romantic evening"
  ];

  // Get user's current location
  React.useEffect(() => {
    getCurrentLocation();
  }, []);

  const getCurrentLocation = async () => {
    try {
      // Request permission to access location (for future use)
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission granted', 'Testing with Bucharest location for better results');
      }

      // FOR TESTING: Always use Bucharest coordinates where we have rich data
      // TODO: Remove this when ready for international deployment
      setLocation({ latitude: 44.4268, longitude: 26.1025 });
      
      // FUTURE: Uncomment this for real GPS location
      // let currentLocation = await Location.getCurrentPositionAsync({});
      // setLocation({
      //   latitude: currentLocation.coords.latitude,
      //   longitude: currentLocation.coords.longitude
      // });
    } catch (error) {
      console.log('Location error:', error);
      // Fallback to Bucharest for testing
      setLocation({ latitude: 44.4268, longitude: 26.1025 });
    }
  };

  const handleSubmit = async () => {
    if (!vibe.trim()) {
      Alert.alert('Please enter how you\'re feeling');
      return;
    }

    if (!location) {
      Alert.alert('Getting your location...');
      return;
    }

    setLoading(true);
    
    try {
      console.log('🔍 Starting search with:', {
        vibe: vibe.trim(),
        location,
        filters,
        distanceMeters: filters.distanceKm * 1000
      });

      // Use activities-first search with fallback to GooglePlaces
      const response = await fetch('http://10.103.30.198:3000/api/activities/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          vibe: vibe.trim(),
          location: {
            lat: location.latitude,
            lng: location.longitude
          },
          filters: {
            radiusMeters: filters.durationHours >= 8 ? 250000 : filters.distanceKm * 1000, // 250km for 8+ hours, else use preset
            durationHours: filters.durationHours,
            nationwide: filters.distanceKm > 50 || filters.durationHours >= 8, // Auto-enable for long distances or day trips
            willingToTravel: filters.durationHours >= 8 // Auto-enable travel for 8+ hour durations
          },
          userId: userId, // Add user ID for personalization
          timeOfDay: 'afternoon', // Could be dynamic
          weatherConditions: 'clear' // Could be from weather API
        }),
      });

      console.log('🌐 API Response status:', response.status);

      const data = await response.json();
      console.log('📊 API Response data:', {
        success: data.success,
        hasTopFive: !!(data.data?.topFive),
        topFiveLength: data.data?.topFive?.length || 0,
        hasPlaces: !!(data.data?.places),
        placesLength: data.data?.places?.length || 0,
        error: data.error,
        fullData: data
      });
      
      // Check both topFive and places arrays
      const places = data.data?.topFive || data.data?.places || [];
      
      if (data.success && places.length > 0) {
        // Generate contextual challenges based on user's vibe
        const generateContextualChallenges = (userVibe: string) => {
          const vibe = userVibe.toLowerCase();
          
          if (vibe.includes('lonely') || vibe.includes('social') || vibe.includes('connect')) {
            return [{
              intent: {
                id: 'challenge_social_event',
                label: 'Join a Community Art Workshop',
                category: 'social'
              },
              verifiedVenues: [{
                placeId: 'mock_art_center',
                name: 'Bucharest Art Center',
                rating: 4.4,
                coords: { lat: 44.4378, lng: 26.0969 },
                provider: 'google',
                mapsUrl: 'https://maps.google.com/search/?api=1&query=Bucharest+Art+Center',
                vicinity: 'Old Town, Bucharest'
              }],
              weatherSuitability: 'good',
              rationale: 'Perfect way to meet like-minded creative people in a welcoming environment',
              confidence: 0.85,
              challenge: {
                destinationCity: 'Bucharest',
                travelEstimate: {
                  distanceKm: 5,
                  drivingTimeHours: 0.3,
                  feasible: true,
                  transportMode: 'transit'
                },
                forecastBadge: {
                  condition: 'Indoor Event',
                  suitability: 'perfect'
                },
                safetyHint: 'Bring an open mind and willingness to try something new!',
                whyNow: 'Evening workshops are perfect for meeting people after work',
                challengeLevel: 2,
                comfortZoneStretch: ['Meeting new people', 'Trying art/creativity', 'Group activities']
              }
            }];
          } else if (vibe.includes('adventure') || vibe.includes('exciting') || vibe.includes('thrill')) {
            return [{
              intent: {
                id: 'challenge_hiking_bucegi',
                label: 'Hiking in Bucegi Mountains',
                category: 'nature'
              },
              verifiedVenues: [{
                placeId: 'mock_bucegi_trail',
                name: 'Omu Peak Trail',
                rating: 4.6,
                coords: { lat: 45.4108, lng: 25.4458 },
                provider: 'google',
                mapsUrl: 'https://maps.google.com/search/?api=1&query=Omu+Peak+Trail',
                vicinity: 'Bucegi Mountains'
              }],
              weatherSuitability: 'good',
              rationale: 'Perfect mountain adventure with stunning views',
              confidence: 0.9,
              challenge: {
                destinationCity: 'Brașov',
                travelEstimate: {
                  distanceKm: 150,
                  drivingTimeHours: 2.5,
                  feasible: true,
                  transportMode: 'drive'
                },
                forecastBadge: {
                  condition: 'Sunny 18°C',
                  suitability: 'perfect'
                },
                safetyHint: 'Bring proper hiking boots and water. Trail difficulty: 4/5',
                whyNow: 'Perfect weather conditions and autumn colors are at their peak',
                challengeLevel: 4,
                comfortZoneStretch: ['Higher altitude hiking', 'Mountain terrain', '6+ hour commitment']
              }
            }];
          } else if (vibe.includes('creative') || vibe.includes('art') || vibe.includes('make')) {
            return [{
              intent: {
                id: 'challenge_pottery_class',
                label: 'Try Pottery Making',
                category: 'creative'
              },
              verifiedVenues: [{
                placeId: 'mock_pottery_studio',
                name: 'Clay & Fire Studio',
                rating: 4.7,
                coords: { lat: 44.4501, lng: 26.0875 },
                provider: 'google',
                mapsUrl: 'https://maps.google.com/search/?api=1&query=Clay+Fire+Studio+Bucharest',
                vicinity: 'Amzei, Bucharest'
              }],
              weatherSuitability: 'good',
              rationale: 'Hands-on creative experience that produces something tangible',
              confidence: 0.8,
              challenge: {
                destinationCity: 'Bucharest',
                travelEstimate: {
                  distanceKm: 8,
                  drivingTimeHours: 0.4,
                  feasible: true,
                  transportMode: 'drive'
                },
                forecastBadge: {
                  condition: 'Indoor Activity',
                  suitability: 'perfect'
                },
                safetyHint: 'Wear clothes you don\'t mind getting clay on!',
                whyNow: 'Weekend pottery classes are relaxing and fulfilling',
                challengeLevel: 2,
                comfortZoneStretch: ['Working with hands', 'Artistic expression', 'Learning new skill']
              }
            }];
          } else {
            // Default challenge for other vibes
            return [{
              intent: {
                id: 'challenge_local_exploration',
                label: 'Explore Hidden Local Gems',
                category: 'culture'
              },
              verifiedVenues: [{
                placeId: 'mock_old_town',
                name: 'Old Town Walking Tour',
                rating: 4.5,
                coords: { lat: 44.4302, lng: 26.1026 },
                provider: 'google',
                mapsUrl: 'https://maps.google.com/search/?api=1&query=Bucharest+Old+Town',
                vicinity: 'Old Town, Bucharest'
              }],
              weatherSuitability: 'good',
              rationale: 'Discover the hidden stories and culture of your city',
              confidence: 0.75,
              challenge: {
                destinationCity: 'Bucharest',
                travelEstimate: {
                  distanceKm: 3,
                  drivingTimeHours: 0.2,
                  feasible: true,
                  transportMode: 'walk'
                },
                forecastBadge: {
                  condition: 'Partly Cloudy 16°C',
                  suitability: 'good'
                },
                safetyHint: 'Comfortable walking shoes recommended',
                whyNow: 'Perfect time to rediscover your city with fresh eyes',
                challengeLevel: 1,
                comfortZoneStretch: ['Urban exploration', 'Historical learning', 'Solo adventure']
              }
            }];
          }
        };

        const contextualChallenges = generateContextualChallenges(vibe.trim());

        // Navigate to results with activities-first API data
        navigation.navigate('Results', {
          places: places,
          challenges: contextualChallenges, // Use contextual challenges based on vibe
          vibeAnalysis: {
            primaryVibe: vibe.trim(),
            confidence: 0.9, // LLM orchestrator confidence
            weather: data.data.context?.weather
          },
          vibe: vibe.trim(),
          totalFound: places.length,
          orchestration: data.data?.orchestration // Pass orchestration debug info
        });
      } else {
        Alert.alert(
          'No Places Found',
          'We couldn\'t find any places matching your vibe in your area. Try a different description!'
        );
      }
    } catch (error) {
      console.error('Error:', error);
      Alert.alert(
        'Connection Error',
        'Unable to get recommendations. Please check your connection and try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar style="dark" backgroundColor="#f9fafb" />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>VIBE</Text>
        <Text style={styles.subtitle}>Weather-aware activity discovery • {location ? 'Bucharest, Romania (Testing)' : 'Getting location...'}</Text>
      </View>

      {/* Enhanced input section with mandatory filters */}
      <View style={styles.searchContainer}>
        {/* Vibe text input */}
        <View style={styles.vibeInputSection}>
          <TextInput
            style={styles.vibeInput}
            placeholder="What's your vibe? (e.g., I want adventure, something cultural...)"
            value={vibe}
            onChangeText={setVibe}
            multiline
            maxLength={500}
          />
          <TouchableOpacity 
            style={styles.helpButton}
            onPress={() => setShowHelp(true)}
          >
            <Text style={styles.helpButtonText}>?</Text>
          </TouchableOpacity>
        </View>

        {/* Distance filter */}
        <View style={styles.filterSection}>
          <Text style={styles.filterLabel}>Distance</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.presetsScroll}>
            {DISTANCE_PRESETS.map((preset, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.presetChip,
                  selectedDistancePreset === index && styles.presetChipSelected
                ]}
                onPress={() => {
                  setSelectedDistancePreset(index);
                  setFilters(prev => ({ ...prev, distanceKm: preset.value }));
                }}
              >
                <Text style={[
                  styles.presetChipText,
                  selectedDistancePreset === index && styles.presetChipTextSelected
                ]}>
                  {preset.label}
                </Text>
                <Text style={[
                  styles.presetChipDescription,
                  selectedDistancePreset === index && styles.presetChipDescriptionSelected
                ]}>
                  {preset.description}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Duration filter */}
        <View style={styles.filterSection}>
          <Text style={styles.filterLabel}>Duration</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.presetsScroll}>
            {DURATION_PRESETS.map((preset, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.presetChip,
                  selectedDurationPreset === index && styles.presetChipSelected
                ]}
                onPress={() => {
                  setSelectedDurationPreset(index);
                  setFilters(prev => ({ ...prev, durationHours: preset.value }));
                }}
              >
                <Text style={[
                  styles.presetChipText,
                  selectedDurationPreset === index && styles.presetChipTextSelected
                ]}>
                  {preset.label}
                </Text>
                <Text style={[
                  styles.presetChipDescription,
                  selectedDurationPreset === index && styles.presetChipDescriptionSelected
                ]}>
                  {preset.description}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Submit button */}
        <TouchableOpacity 
          style={[styles.enhancedSubmitButton, (!vibe.trim() || loading) && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={!vibe.trim() || loading}
        >
          {loading ? (
            <ActivityIndicator size="small" color="white" />
          ) : (
            <Text style={styles.enhancedSubmitButtonText}>
              Find Places • {filters.distanceKm}km • {filters.durationHours}h
            </Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Suggestion Chips */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipsContainer}>
        {['I feel adventurous', 'Want something cozy', 'Need high energy', 'Feeling creative'].map((suggestion, index) => (
          <TouchableOpacity
            key={index}
            style={styles.chip}
            onPress={() => setVibe(suggestion)}
          >
            <Text style={styles.chipText}>{suggestion}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>Powered by Claude AI • Google Places • OpenMeteo</Text>
      </View>

      {/* Help Modal */}
      <Modal
        visible={showHelp}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowHelp(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.helpModal}>
            <Text style={styles.helpModalTitle}>Help me decide</Text>
            <Text style={styles.helpModalSubtitle}>Here are some suggestions based on the current context:</Text>
            
            {HELP_SUGGESTIONS.map((suggestion, index) => (
              <TouchableOpacity
                key={index}
                style={styles.helpSuggestion}
                onPress={() => {
                  setVibe(suggestion.vibe);
                  setFilters({ distanceKm: suggestion.distance, durationHours: suggestion.duration });
                  setSelectedDistancePreset(DISTANCE_PRESETS.findIndex(p => Math.abs(p.value - suggestion.distance) < 2));
                  setSelectedDurationPreset(DURATION_PRESETS.findIndex(p => Math.abs(p.value - suggestion.duration) < 0.5));
                  setShowHelp(false);
                }}
              >
                <Text style={styles.helpSuggestionTitle}>{suggestion.title}</Text>
                <Text style={styles.helpSuggestionText}>{suggestion.suggestion}</Text>
              </TouchableOpacity>
            ))}
            
            <TouchableOpacity
              style={styles.helpCloseButton}
              onPress={() => setShowHelp(false)}
            >
              <Text style={styles.helpCloseButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

// Results Screen Component
function ResultsScreen({ route, navigation }: any) {
  const { places, vibeAnalysis, vibe, totalFound } = route.params;
  const [feedback, setFeedback] = useState<Record<string, 'like' | 'dislike' | null>>({});
  const [showChallenges, setShowChallenges] = useState(false);
  // Use the user ID from the onboarding (in production, get from auth/storage)
  const [userId] = useState('user_1760744332206'); // Should match the onboarding user

  const handleFeedback = async (place: any, result: 'like' | 'dislike') => {
    try {
      console.log(`${result === 'like' ? '👍' : '👎'} Feedback for:`, place.name);
      
      // Update local state immediately
      setFeedback(prev => ({ ...prev, [place.id]: result }));
      
      // Send to ML system
      const response = await fetch('http://10.103.30.198:3000/api/vibe-profile/track-event', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: userId,
          eventType: 'feedback',
          data: {
            itemId: place.id,
            itemName: place.name,
            bucket: place.bucket || 'general',
            result: result,
            location: place.location,
            searchVibe: vibe
          },
          context: {
            deviceType: 'mobile',
            appVersion: '1.0.0'
          }
        }),
      });

      const data = await response.json();
      if (data.success) {
        console.log('✅ Feedback recorded successfully');
      } else {
        console.error('❌ Feedback failed:', data.error);
      }
    } catch (error) {
      console.error('❌ Feedback error:', error);
    }
  };

  const handleChallengeAction = async (challenge: any, action: 'accept' | 'decline') => {
    try {
      console.log(`${action === 'accept' ? '✅' : '❌'} Challenge ${action}:`, challenge.intent.label);
      
      // Track challenge outcome for ML learning
      const response = await fetch('http://10.103.30.198:3000/api/vibe-profile/track-event', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: userId,
          eventType: action === 'accept' ? 'challenge_accept' : 'challenge_decline',
          data: {
            challengeId: challenge.intent.id,
            challengeLevel: challenge.challenge.challengeLevel,
            destinationCity: challenge.challenge.destinationCity,
            travelDistanceKm: challenge.challenge.travelEstimate.distanceKm,
            itemName: challenge.intent.label,
            bucket: challenge.intent.category
          },
          context: {
            deviceType: 'mobile',
            appVersion: '1.0.0'
          }
        }),
      });

      const data = await response.json();
      if (data.success) {
        console.log('✅ Challenge outcome recorded successfully');
        
        if (action === 'accept') {
          // Open the first venue in maps
          const firstVenue = challenge.verifiedVenues[0];
          if (firstVenue?.mapsUrl) {
            Linking.openURL(firstVenue.mapsUrl).catch(err => {
              console.error('Failed to open maps:', err);
            });
          }
          
          Alert.alert(
            'Challenge Accepted! 🎯',
            `Great choice! ${challenge.challenge.whyNow} Have an amazing adventure!`,
            [{ text: 'Let\'s Go!', style: 'default' }]
          );
        } else {
          Alert.alert(
            'Maybe Next Time 😊',
            'No worries! We\'ll keep learning your preferences and suggest better challenges.',
            [{ text: 'Sounds Good', style: 'default' }]
          );
        }
      } else {
        console.error('❌ Challenge tracking failed:', data.error);
      }
    } catch (error) {
      console.error('❌ Challenge action error:', error);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      
      {/* Header */}
      <View style={styles.resultsHeader}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <View style={styles.resultsHeaderText}>
          <Text style={styles.resultsTitle}>Your Places</Text>
          <Text style={styles.resultsSubtitle}>Based on: "{vibe}" • {totalFound} found</Text>
        </View>
      </View>

      {/* Vibe Analysis */}
      {vibeAnalysis && (
        <View style={styles.vibeAnalysis}>
          <Text style={styles.vibeAnalysisText}>
            {vibeAnalysis.primaryVibe} • {Math.round(vibeAnalysis.confidence * 100)}% match
          </Text>
        </View>
      )}

      {/* Challenge Me Section */}
      {route.params.challenges && route.params.challenges.length > 0 && (
        <View style={styles.challengeSection}>
          <TouchableOpacity 
            style={styles.challengeHeader}
            onPress={() => setShowChallenges(!showChallenges)}
          >
            <Text style={styles.challengeTitle}>🎯 Challenge Me</Text>
            <Text style={styles.challengeSubtitle}>Push beyond your comfort zone</Text>
            <Text style={styles.challengeToggle}>{showChallenges ? '▼' : '▶'}</Text>
          </TouchableOpacity>
          
          {showChallenges && (
            <View style={styles.challengeList}>
              {route.params.challenges.map((challenge: any, index: number) => (
                <View key={challenge.intent.id} style={styles.challengeCard}>
                  {/* Challenge Image */}
                  <View style={styles.challengeImageContainer}>
                    <Image
                      source={{
                        uri: challenge.verifiedVenues[0]?.imageUrl 
                          ? `http://10.103.30.198:3000${challenge.verifiedVenues[0].imageUrl}`
                          : 'https://via.placeholder.com/300x150/E5E7EB/9CA3AF?text=Adventure+Awaits'
                      }}
                      style={styles.challengeImage}
                      resizeMode="cover"
                    />
                    
                    {/* Challenge Level Badge */}
                    <View style={styles.challengeLevelBadge}>
                      <Text style={styles.challengeLevelText}>
                        Level {challenge.challenge.challengeLevel}
                      </Text>
                    </View>
                    
                    {/* Weather Badge */}
                    <View style={[
                      styles.weatherBadge,
                      challenge.challenge.forecastBadge.suitability === 'perfect' && styles.weatherPerfect,
                      challenge.challenge.forecastBadge.suitability === 'good' && styles.weatherGood,
                      challenge.challenge.forecastBadge.suitability === 'challenging' && styles.weatherChallenging
                    ]}>
                      <Text style={styles.weatherBadgeText}>
                        {challenge.challenge.forecastBadge.condition}
                      </Text>
                    </View>
                  </View>
                  
                  {/* Challenge Content */}
                  <View style={styles.challengeContent}>
                    <Text style={styles.challengeName}>{challenge.intent.label}</Text>
                    
                    {/* Destination & Travel */}
                    <View style={styles.challengeTravel}>
                      <Text style={styles.challengeDestination}>
                        📍 {challenge.challenge.destinationCity}
                      </Text>
                      <Text style={styles.challengeDistance}>
                        🚗 {Math.round(challenge.challenge.travelEstimate.distanceKm)}km • 
                        {Math.round(challenge.challenge.travelEstimate.drivingTimeHours * 60)}min
                      </Text>
                    </View>
                    
                    {/* Why Now */}
                    <Text style={styles.challengeWhyNow}>
                      ⏰ {challenge.challenge.whyNow}
                    </Text>
                    
                    {/* Comfort Zone Stretch */}
                    <View style={styles.challengeStretch}>
                      <Text style={styles.challengeStretchTitle}>This challenges you with:</Text>
                      {challenge.challenge.comfortZoneStretch.map((stretch: string, idx: number) => (
                        <Text key={idx} style={styles.challengeStretchItem}>
                          • {stretch}
                        </Text>
                      ))}
                    </View>
                    
                    {/* Safety Hint */}
                    {challenge.challenge.safetyHint && (
                      <Text style={styles.challengeSafety}>
                        ⚠️ {challenge.challenge.safetyHint}
                      </Text>
                    )}
                    
                    {/* Challenge Actions */}
                    <View style={styles.challengeActions}>
                      <TouchableOpacity
                        style={styles.challengeAcceptButton}
                        onPress={() => handleChallengeAction(challenge, 'accept')}
                      >
                        <Text style={styles.challengeAcceptText}>Accept Challenge</Text>
                      </TouchableOpacity>
                      
                      <TouchableOpacity
                        style={styles.challengeDeclineButton}
                        onPress={() => handleChallengeAction(challenge, 'decline')}
                      >
                        <Text style={styles.challengeDeclineText}>Maybe Later</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              ))}
            </View>
          )}
        </View>
      )}

      {/* Places List */}
      <ScrollView style={styles.resultsList}>
        {places.map((place: any, index: number) => (
          <EnrichedActivityCard
            key={place.id || index}
            place={place}
            onPress={() => navigation.navigate('ExperienceDetail', { place })}
            feedback={feedback}
            onFeedback={handleFeedback}
          />
        ))}
      </ScrollView>
    </View>
  );
};

// Main App Component
export default function App() {
  const [isOnboarded, setIsOnboarded] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkOnboardingStatus();
  }, []);

  const checkOnboardingStatus = async () => {
    try {
      const hasAccount = await userStorage.hasAccount();
      const account = await userStorage.getAccount();
      
      // User is onboarded if they have an account and completed onboarding
      setIsOnboarded(hasAccount && account?.onboardingCompleted === true);
    } catch (error) {
      console.error('Error checking onboarding:', error);
      setIsOnboarded(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOnboardingComplete = () => {
    setIsOnboarded(true);
  };

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0A0E17' }}>
        <ActivityIndicator size="large" color="#667EEA" />
        <Text style={{ color: '#fff', marginTop: 16 }}>Loading...</Text>
      </View>
    );
  }

  if (!isOnboarded) {
    return (
      <ThemeProvider>
        <VibeProvider>
          <LanguageProvider>
            <GestureHandlerRootView style={{ flex: 1 }}>
              <StatusBar style="light" />
              <NewUserOnboarding onComplete={handleOnboardingComplete} />
            </GestureHandlerRootView>
          </LanguageProvider>
        </VibeProvider>
      </ThemeProvider>
    );
  }

  // Use the new redesigned home screen with smooth animations
  const initialRoute = 'NewHomeScreen';

  return (
    <ThemeProvider>
      <VibeProvider>
        <LanguageProvider>
          <GestureHandlerRootView style={{ flex: 1 }}>
            <SafeAreaProvider>
              <ActivityCompletionWrapper>
                <NavigationContainer>
                <StatusBar style="auto" />
                <Stack.Navigator
                initialRouteName={initialRoute}
                screenOptions={{
                  headerShown: false,
                  contentStyle: { backgroundColor: 'transparent' },
                }}
              >
              {/* Pure Minimalistic Screens - Black Background, No Orb, Sidequests */}
              <Stack.Screen name="NewHomeScreen" component={NewHomeScreen} options={{ headerShown: false }} />
              <Stack.Screen name="HomeScreenMinimal" component={HomeScreenMinimal} options={{ headerShown: false }} />
              <Stack.Screen name="SuggestionsScreenShell" component={MinimalSuggestionsScreen} options={{ headerShown: false }} />
              <Stack.Screen name="ChallengeMeScreen" component={MinimalChallengeMeScreen} options={{ headerShown: false }} />
              <Stack.Screen name="ActivityAcceptedScreen" component={ActivityAcceptedScreen} options={{ headerShown: false }} />
              <Stack.Screen name="ActivityDetailScreenShell" component={MinimalActivityDetailScreen} options={{ headerShown: false }} />
              
              {/* Original Chat Interface Screens */}
              <Stack.Screen name="ChatHome" component={ChatHomeScreen} />
              <Stack.Screen 
                name="ChatConversation" 
                component={ChatConversationScreen}
                options={{
                  headerShown: true,
                  headerTitle: 'Chat',
                  headerStyle: {
                    backgroundColor: '#0A0E17',
                  },
                  headerTintColor: '#FFFFFF',
                  headerBackTitle: 'Back',
                }}
              />
              <Stack.Screen 
                name="UserProfile" 
                component={MinimalUserProfileScreen}
                options={{
                  headerShown: false,
                }}
              />
              <Stack.Screen 
                name="Community" 
                component={CommunityScreen}
                options={{
                  headerShown: false,
                }}
              />
              <Stack.Screen 
                name="TrainingMode" 
                component={TrainingModeScreen}
                options={{
                  headerShown: true,
                  headerTitle: '🎯 Training Mode',
                  headerStyle: {
                    backgroundColor: '#0A0E17',
                  },
                  headerTintColor: '#FFFFFF',
                  headerBackTitle: 'Back',
                }}
              />
              <Stack.Screen 
                name="Discovery" 
                component={MinimalDiscoveryScreen}
                options={{
                  headerShown: false,
                }}
              />
              <Stack.Screen 
                name="SavedActivities" 
                component={SavedActivitiesScreen}
                options={{
                  headerShown: true,
                  headerTitle: 'Saved',
                  headerStyle: {
                    backgroundColor: '#0A0E17',
                  },
                  headerTintColor: '#FFFFFF',
                  headerBackTitle: 'Back',
                }}
              />
              <Stack.Screen 
                name="EnhancedExperienceDetail" 
                component={EnhancedExperienceDetailScreen}
                options={{
                  headerShown: false,
                }}
              />
              
              {/* Component Showcase */}
              <Stack.Screen 
                name="ComponentShowcase" 
                component={ComponentShowcaseScreen}
                options={{
                  headerShown: false,
                }}
              />
              
              {/* Original Screens */}
              <Stack.Screen name="Home" component={HomeScreen} />
              <Stack.Screen name="Results" component={ResultsScreen} />
              <Stack.Screen name="ExperienceDetail" component={ExperienceDetailScreen} />
            </Stack.Navigator>
          </NavigationContainer>
          </ActivityCompletionWrapper>
        </SafeAreaProvider>
      </GestureHandlerRootView>
    </LanguageProvider>
    </VibeProvider>
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    paddingHorizontal: 24,
    paddingTop: 60,
  },
  header: {
    alignItems: 'center',
    marginBottom: 60,
  },
  title: {
    fontSize: 48,
    fontWeight: '300',
    color: '#1F2937',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
  },
  inputSection: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: 32,
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#1F2937',
    minHeight: 24,
    maxHeight: 120,
  },
  submitButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#0EA5E9',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 12,
  },
  submitButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  chipsContainer: {
    marginBottom: 40,
  },
  chip: {
    backgroundColor: 'white',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  chipText: {
    color: '#6B7280',
    fontSize: 14,
  },
  footer: {
    position: 'absolute',
    bottom: 40,
    left: 24,
    right: 24,
    alignItems: 'center',
  },
  footerText: {
    color: '#9CA3AF',
    fontSize: 12,
  },
  submitButtonDisabled: {
    backgroundColor: '#9CA3AF',
  },
  // Results Screen Styles
  resultsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  backButtonText: {
    fontSize: 18,
    color: '#374151',
  },
  resultsHeaderText: {
    flex: 1,
  },
  resultsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  resultsSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 2,
  },
  resultsList: {
    flex: 1,
  },
  activityCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  activityName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  activityBlurb: {
    fontSize: 14,
    color: '#4B5563',
    fontStyle: 'italic',
    lineHeight: 20,
    marginBottom: 8,
    paddingHorizontal: 2,
  },
  activityDescription: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
    marginBottom: 12,
  },
  activityMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  activityCategory: {
    backgroundColor: '#EFF6FF',
    color: '#1D4ED8',
    fontSize: 12,
    fontWeight: '500',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  activityRating: {
    color: '#F59E0B',
    fontSize: 14,
    fontWeight: '500',
  },
  // New styles for Google Places UI
  vibeAnalysis: {
    backgroundColor: '#EFF6FF',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    borderLeftWidth: 3,
    borderLeftColor: '#0EA5E9',
  },
  vibeAnalysisText: {
    color: '#1D4ED8',
    fontSize: 14,
    fontWeight: '500',
  },
  placeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  placeRating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  vibeScore: {
    backgroundColor: '#10B981',
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
    overflow: 'hidden',
  },
  vibeReasons: {
    marginVertical: 8,
  },
  vibeReason: {
    color: '#059669',
    fontSize: 12,
    fontStyle: 'italic',
    marginBottom: 2,
  },
  walkingTime: {
    color: '#6B7280',
    fontSize: 12,
    fontWeight: '500',
  },
  // New styles for images and Google Maps integration
  imageContainer: {
    position: 'relative',
    width: '100%',
    aspectRatio: 16 / 9, // 16:9 aspect ratio
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 12,
  },
  imageLoadingIndicator: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -10 }, { translateY: -10 }],
    zIndex: 1,
  },
  placeImage: {
    width: '100%',
    height: '100%',
  },
  attributionOverlay: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  attributionText: {
    color: 'white',
    fontSize: 10,
    fontWeight: '500',
  },
  ratingBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  ratingBadgeText: {
    color: '#F59E0B',
    fontSize: 12,
    fontWeight: 'bold',
  },
  cardContent: {
    paddingHorizontal: 4,
  },
  mapsButton: {
    backgroundColor: '#0EA5E9',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginTop: 12,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  mapsButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  // Enhanced search interface styles
  searchContainer: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  vibeInputSection: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: 20,
  },
  vibeInput: {
    flex: 1,
    fontSize: 16,
    color: '#1F2937',
    minHeight: 24,
    maxHeight: 80,
    paddingRight: 12,
  },
  helpButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  helpButtonText: {
    color: '#6B7280',
    fontSize: 16,
    fontWeight: '600',
  },
  filterSection: {
    marginBottom: 16,
  },
  filterLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  presetsScroll: {
    flexDirection: 'row',
  },
  presetChip: {
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginRight: 12,
    minWidth: 100,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  presetChipSelected: {
    backgroundColor: '#EFF6FF',
    borderColor: '#0EA5E9',
  },
  presetChipText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
    textAlign: 'center',
  },
  presetChipTextSelected: {
    color: '#0EA5E9',
  },
  presetChipDescription: {
    fontSize: 11,
    color: '#9CA3AF',
    textAlign: 'center',
    marginTop: 2,
  },
  presetChipDescriptionSelected: {
    color: '#0EA5E9',
  },
  enhancedSubmitButton: {
    backgroundColor: '#0EA5E9',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  enhancedSubmitButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  // Help modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  helpModal: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 400,
  },
  helpModalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 8,
  },
  helpModalSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 20,
  },
  helpSuggestion: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  helpSuggestionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  helpSuggestionText: {
    fontSize: 14,
    color: '#6B7280',
  },
  helpCloseButton: {
    backgroundColor: '#0EA5E9',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  helpCloseButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  // Onboarding styles
  interestsContainer: {
    flex: 1,
    marginBottom: 20,
  },
  interestsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  interestTile: {
    width: '48%',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#E5E7EB',
  },
  interestTileSelected: {
    borderColor: '#0EA5E9',
    backgroundColor: '#EFF6FF',
  },
  interestEmoji: {
    fontSize: 32,
    marginBottom: 8,
  },
  interestLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    textAlign: 'center',
  },
  interestLabelSelected: {
    color: '#0EA5E9',
  },
  selectedCheck: {
    position: 'absolute',
    top: 8,
    right: 8,
    color: '#0EA5E9',
    fontSize: 16,
    fontWeight: 'bold',
  },
  onboardingFooter: {
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  selectionCount: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 16,
  },
  completeButton: {
    backgroundColor: '#0EA5E9',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  completeButtonDisabled: {
    backgroundColor: '#9CA3AF',
  },
  completeButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  // Feedback buttons styles
  feedbackButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
    marginBottom: 8,
    gap: 12,
  },
  feedbackButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
  },
  likeButton: {
    backgroundColor: '#F0FDF4',
    borderColor: '#22C55E',
  },
  dislikeButton: {
    backgroundColor: '#FEF2F2',
    borderColor: '#EF4444',
  },
  feedbackButtonActive: {
    backgroundColor: '#0EA5E9',
    borderColor: '#0EA5E9',
  },
  feedbackButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  feedbackButtonTextActive: {
    color: 'white',
  },
  
  // Challenge Me Section Styles
  challengeSection: {
    marginTop: 16,
    marginBottom: 16,
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    overflow: 'hidden',
  },
  challengeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#0EA5E9',
  },
  challengeTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: 'white',
  },
  challengeSubtitle: {
    fontSize: 14,
    color: '#E0F2FE',
    marginTop: 2,
  },
  challengeToggle: {
    fontSize: 16,
    color: 'white',
    fontWeight: 'bold',
  },
  challengeList: {
    padding: 16,
  },
  challengeCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  challengeImageContainer: {
    position: 'relative',
    height: 150,
  },
  challengeImage: {
    width: '100%',
    height: '100%',
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  challengeLevelBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: '#EF4444',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  challengeLevelText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  weatherBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  weatherPerfect: {
    backgroundColor: '#10B981',
  },
  weatherGood: {
    backgroundColor: '#F59E0B',
  },
  weatherChallenging: {
    backgroundColor: '#6B7280',
  },
  weatherBadgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  challengeContent: {
    padding: 16,
  },
  challengeName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8,
  },
  challengeTravel: {
    marginBottom: 8,
  },
  challengeDestination: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
  },
  challengeDistance: {
    fontSize: 14,
    color: '#6B7280',
  },
  challengeWhyNow: {
    fontSize: 14,
    color: '#059669',
    fontWeight: '500',
    marginBottom: 12,
  },
  challengeStretch: {
    marginBottom: 12,
  },
  challengeStretchTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 4,
  },
  challengeStretchItem: {
    fontSize: 14,
    color: '#6B7280',
    marginLeft: 8,
  },
  challengeSafety: {
    fontSize: 14,
    color: '#DC2626',
    fontStyle: 'italic',
    marginBottom: 12,
  },
  challengeActions: {
    flexDirection: 'row',
    gap: 12,
  },
  challengeAcceptButton: {
    flex: 1,
    backgroundColor: '#0EA5E9',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  challengeAcceptText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  challengeDeclineButton: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  challengeDeclineText: {
    color: '#6B7280',
    fontSize: 14,
    fontWeight: '600',
  },
});
