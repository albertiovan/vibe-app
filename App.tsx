import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView, Alert } from 'react-native';
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
function HomeScreen({ navigation }: any) {
  const [vibe, setVibe] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [location, setLocation] = React.useState<{lat: number, lng: number} | null>(null);

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
      setLocation({ lat: 44.4268, lng: 26.1025 });
      
      // FUTURE: Uncomment this for real GPS location
      // let currentLocation = await Location.getCurrentPositionAsync({});
      // setLocation({
      //   lat: currentLocation.coords.latitude,
      //   lng: currentLocation.coords.longitude
      // });
    } catch (error) {
      console.log('Location error:', error);
      // Fallback to Bucharest for testing
      setLocation({ lat: 44.4268, lng: 26.1025 });
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
      // TEMPORARY: Use working API while we fix the weather pipeline
      // TODO: Switch back to weather-aware pipeline once fixed
      const response = await fetch('http://10.103.30.198:3000/api/vibe/quick-match', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          mood: getVibeToMood(vibe.trim()),
          energy: getVibeToEnergy(vibe.trim()),
          location: {
            lat: location.lat,
            lng: location.lng,
            radius: 10
          },
          description: vibe.trim()
        }),
      });

      const data = await response.json();
      
      if (data.success && data.data.match && data.data.match.places.length > 0) {
        // Navigate to results with working API data
        navigation.navigate('Results', {
          places: data.data.match.places,
          vibeAnalysis: {
            primaryVibe: vibe.trim(),
            confidence: 0.85,
            weather: null // No weather data from old API
          },
          vibe: vibe.trim(),
          totalFound: data.data.match.places.length
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

      {/* Input Section */}
      <View style={styles.inputSection}>
        <TextInput
          style={styles.input}
          placeholder="How are you feeling today?"
          value={vibe}
          onChangeText={setVibe}
          multiline
        />
        
        <TouchableOpacity 
          style={[styles.submitButton, loading && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={loading}
        >
          <Text style={styles.submitButtonText}>
            {loading ? '...' : '→'}
          </Text>
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
        <Text style={styles.footerText}>🌤️ Weather-aware • 🎯 5 diverse picks • 🚫 No restaurants by default</Text>
      </View>
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
            <View style={styles.placeHeader}>
              <Text style={styles.activityName}>{place.name}</Text>
              <View style={styles.placeRating}>
                {place.rating && (
                  <Text style={styles.activityRating}>★ {place.rating}</Text>
                )}
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
    padding: 16,
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
});
