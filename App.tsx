import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView, Alert } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

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

// Home Screen Component
function HomeScreen({ navigation }: any) {
  const [vibe, setVibe] = React.useState('');
  const [loading, setLoading] = React.useState(false);

  const handleSubmit = async () => {
    if (!vibe.trim()) {
      Alert.alert('Please enter how you\'re feeling');
      return;
    }

    setLoading(true);
    
    try {
      // Make API call to new Google Places vibe endpoint
      const response = await fetch('http://10.103.30.198:3000/api/vibe/quick-match', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          mood: 'relaxed', // Default mood - we'll make this dynamic later
          energy: 'medium',
          location: {
            lat: 44.4268,
            lng: 26.1025,
            radius: 10
          },
          description: vibe.trim()
        }),
      });

      const data = await response.json();
      
      if (data.success && data.data.match.places.length > 0) {
        // Navigate to results with Google Places data
        navigation.navigate('Results', {
          places: data.data.match.places,
          vibeAnalysis: data.data.match.vibeAnalysis,
          vibe: vibe.trim(),
          totalFound: data.data.match.totalFound
        });
      } else {
        Alert.alert(
          'No Places Found',
          'We couldn\'t find any places matching your vibe. Try a different description or check back later!'
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
        <Text style={styles.title}>VIBE DEBUG</Text>
        <Text style={styles.subtitle}>Discover activities that match your mood</Text>
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
        <Text style={styles.footerText}>Powered by AI • Discover Romania</Text>
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
          <View key={place.placeId || index} style={styles.activityCard}>
            <View style={styles.placeHeader}>
              <Text style={styles.activityName}>{place.name}</Text>
              <View style={styles.placeRating}>
                {place.rating && (
                  <Text style={styles.activityRating}>★ {place.rating}</Text>
                )}
                {place.vibeScore && (
                  <Text style={styles.vibeScore}>{Math.round(place.vibeScore * 100)}%</Text>
                )}
              </View>
            </View>
            
            <Text style={styles.activityDescription}>{place.vicinity}</Text>
            
            {/* Vibe Reasons */}
            {place.vibeReasons && place.vibeReasons.length > 0 && (
              <View style={styles.vibeReasons}>
                {place.vibeReasons.slice(0, 2).map((reason: string, idx: number) => (
                  <Text key={idx} style={styles.vibeReason}>• {reason}</Text>
                ))}
              </View>
            )}
            
            <View style={styles.activityMeta}>
              <Text style={styles.activityCategory}>
                {place.estimatedDuration || 'Visit time varies'}
              </Text>
              {place.walkingTime && (
                <Text style={styles.walkingTime}>{place.walkingTime} min walk</Text>
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
