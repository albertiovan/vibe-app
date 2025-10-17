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
import { createStackNavigator } from '@react-navigation/stack';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import * as Location from 'expo-location';

// Define navigation types
type RootStackParamList = {
  Home: undefined;
  Results: {
    places: any[];
    vibeAnalysis: any;
    vibe: string;
    totalFound: number;
  };
};

const Stack = createStackNavigator<RootStackParamList>();

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
  { label: '4-6h', value: 5, description: 'Full day adventure' }
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

function HomeScreen({ navigation }: { navigation: any }) {
  const [vibe, setVibe] = useState('');
  const [filters, setFilters] = useState<SearchFilters>({ distanceKm: 10, durationHours: 3 });
  const [loading, setLoading] = useState(false);
  const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [showHelp, setShowHelp] = useState(false);
  const [selectedDistancePreset, setSelectedDistancePreset] = useState(1); // Default to "In the city"
  const [selectedDurationPreset, setSelectedDurationPreset] = useState(1); // Default to "2-4h"

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
      // NEW: Use enhanced nearby search with mandatory filters
      const response = await fetch('http://10.103.30.198:3000/api/nearby/search', {
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
            radiusMeters: filters.distanceKm * 1000, // Convert km to meters
            durationHours: filters.durationHours,
            nationwide: filters.distanceKm > 50 // Auto-enable nationwide for long distances
          }
        }),
      });

      const data = await response.json();
      
      if (data.success && data.data.topFive && data.data.topFive.length > 0) {
        // Navigate to results with Claude-first API data
        navigation.navigate('Results', {
          places: data.data.topFive,
          vibeAnalysis: {
            primaryVibe: vibe.trim(),
            confidence: 0.9, // Claude is very confident
            weather: data.data.context?.weather
          },
          vibe: vibe.trim(),
          totalFound: data.data.topFive.length
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

      {/* Places List */}
      <ScrollView style={styles.resultsList}>
        {places.map((place: any, index: number) => (
          <View key={place.id || index} style={styles.activityCard}>
            {/* Place Image with 16:9 Aspect Ratio */}
            <View style={styles.imageContainer}>
              {/* Loading indicator for images */}
              {place.imageUrl && (
                <View style={styles.imageLoadingIndicator}>
                  <ActivityIndicator size="small" color="#0EA5E9" />
                </View>
              )}
              
              <Image
                source={{
                  uri: place.imageUrl 
                    ? `http://10.103.30.198:3000${place.imageUrl}`
                    : 'https://via.placeholder.com/400x225/E5E7EB/9CA3AF?text=No+Photo'
                }}
                style={styles.placeImage}
                resizeMode="cover"
                onLoad={() => {
                  console.log('✅ Image loaded successfully for:', place.name);
                }}
                onError={(error) => {
                  console.log('❌ Image failed to load for:', place.name, error.nativeEvent.error);
                }}
                onLoadStart={() => {
                  console.log('🔄 Image loading started for:', place.name);
                }}
              />
              
              {/* Photo Attribution Overlay */}
              {place.photoAttribution && (
                <View style={styles.attributionOverlay}>
                  <Text style={styles.attributionText}>📷 Google</Text>
                </View>
              )}
              
              {/* Rating Badge Overlay */}
              {place.rating && (
                <View style={styles.ratingBadge}>
                  <Text style={styles.ratingBadgeText}>★ {place.rating}</Text>
                </View>
              )}
            </View>

            <View style={styles.cardContent}>
              <View style={styles.placeHeader}>
                <Text style={styles.activityName}>{place.name}</Text>
                <View style={styles.placeRating}>
                  {place.weatherSuitability && (
                    <Text style={styles.vibeScore}>{Math.round(place.weatherSuitability * 100)}%</Text>
                  )}
                </View>
              </View>
            
            {/* Location and Distance */}
            <Text style={styles.activityDescription}>
              {place.vicinity || place.region || 'Bucharest'} • {place.distance ? `${place.distance.toFixed(1)}km` : 'Nearby'}
            </Text>
            
            {/* Vibe Reasons and Info */}
            <View style={styles.vibeReasons}>
              {place.weatherHint && (
                <Text style={styles.vibeReason}>🌤️ {place.weatherHint}</Text>
              )}
              {place.bucket && (
                <Text style={styles.vibeReason}>🎯 {place.bucket.charAt(0).toUpperCase() + place.bucket.slice(1)} experience</Text>
              )}
              {place.vibeReasons && place.vibeReasons.length > 0 && (
                place.vibeReasons.slice(0, 2).map((reason: string, idx: number) => (
                  <Text key={idx} style={styles.vibeReason}>• {reason}</Text>
                ))
              )}
              {place.highlights && place.highlights.length > 0 && (
                place.highlights.slice(0, 2).map((highlight: string, idx: number) => (
                  <Text key={idx} style={styles.vibeReason}>• {highlight}</Text>
                ))
              )}
            </View>
            
            <View style={styles.activityMeta}>
              <Text style={styles.activityCategory}>
                {place.estimatedDuration || place.travelTime ? `${place.travelTime} min travel` : 'Visit time varies'}
              </Text>
              {place.walkingTime && (
                <Text style={styles.walkingTime}>{place.walkingTime} min walk</Text>
              )}
              {place.source && (
                <Text style={styles.walkingTime}>via {place.source}</Text>
              )}
            </View>

            {/* Google Maps Button */}
            {place.mapsUrl && (
              <TouchableOpacity
                style={styles.mapsButton}
                onPress={() => {
                  Linking.openURL(place.mapsUrl).catch(err => {
                    console.error('Failed to open Google Maps:', err);
                    Alert.alert('Error', 'Could not open Google Maps');
                  });
                }}
              >
                <Text style={styles.mapsButtonText}>🗺️ Open in Google Maps</Text>
              </TouchableOpacity>
            )}
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

// Main App Component
export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <NavigationContainer>
        <Stack.Navigator
          initialRouteName="Home"
          screenOptions={{
            headerShown: false,
          }}
        >
          <Stack.Screen name="Home" component={HomeScreen} />
          <Stack.Screen name="Results" component={ResultsScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </GestureHandlerRootView>
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
    marginBottom: 8,
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
});
