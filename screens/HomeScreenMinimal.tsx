/**
 * HomeScreenMinimal
 * 
 * Simplified ChatGPT-style home screen
 * Black background, centered input, minimal aesthetic
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  Image,
} from 'react-native';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Device from 'expo-device';
import * as Location from 'expo-location';
import { AnimatedGradientBackground } from '../ui/components/AnimatedGradientBackground';
import { useVibe } from '../src/contexts/VibeContext';
import { useTheme } from '../src/contexts/ThemeContext';
import { MinimalVibeInput } from '../ui/components/MinimalVibeInput';
import { LoadingShimmer } from '../ui/components/LoadingShimmer';
import { TextShimmer } from '../ui/components/TextShimmer';
import { chatApi, ChatStartResponse } from '../src/services/chatApi';
import { userStorage } from '../src/services/userStorage';
import MinimalActivityFilters, { FilterOptions } from '../components/filters/MinimalActivityFilters';
import { MinimalVibeProfileSelector } from '../components/MinimalVibeProfileSelector';
import { MinimalCreateVibeProfileModal } from '../components/MinimalCreateVibeProfileModal';
import { SuggestedSidequests } from '../components/SuggestedSidequests';
import { VibeState } from '../src/contexts/VibeContext';

type RootStackParamList = {
  SuggestionsScreenShell: {
    conversationId: number;
    deviceId: string;
    userMessage: string;
    filters?: FilterOptions;
    userLocation?: { latitude: number; longitude: number };
  };
  ChallengeMeScreen: {
    deviceId: string;
    userLocation?: { latitude: number; longitude: number };
  };
  UserProfile: undefined;
};

export const HomeScreenMinimal: React.FC = () => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const { currentVibe, getVibeColors, setVibe, clearVibe } = useVibe();
  const { resolvedTheme, colors: themeColors } = useTheme();
  const [deviceId, setDeviceId] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [currentConversationId, setCurrentConversationId] = useState<number | null>(null);
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [userName, setUserName] = useState('');
  const [filters, setFilters] = useState<FilterOptions>({});
  const [showFilters, setShowFilters] = useState(false);
  const [showVibeProfiles, setShowVibeProfiles] = useState(false);
  const [showCreateProfileModal, setShowCreateProfileModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedProfileId, setSelectedProfileId] = useState<number | undefined>();

  useEffect(() => {
    initializeScreen();
    requestLocationPermission();
    loadUserName();
  }, []);

  const loadUserName = async () => {
    try {
      const account = await userStorage.getAccount();
      if (account?.name) {
        const firstName = account.name.split(' ')[0];
        setUserName(firstName);
      }
    } catch (error) {
      console.log('No user account yet');
    }
  };

  const requestLocationPermission = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        const location = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });
        setUserLocation({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        });
        console.log('📍 Location acquired:', location.coords);
      }
    } catch (error) {
      console.log('Location permission denied or error:', error);
    }
  };

  const initializeScreen = async () => {
    try {
      const id = Device.osInternalBuildId || `device-${Date.now()}`;
      setDeviceId(id);

      const response = await chatApi.startConversation({
        deviceId: id,
      });
      setCurrentConversationId(response.conversationId);
      setLoading(false);
    } catch (error) {
      console.error('Failed to initialize:', error);
      setLoading(false);
    }
  };

  // Detect vibe from user query - maps to our 4 core vibes
  const detectVibeFromQuery = (query: string): VibeState => {
    const lowerQuery = query.toLowerCase();
    
    // ROMANTIC - Romance, intimate experiences, date activities
    if (lowerQuery.match(/romantic|romance|date|love|intimate|cozy|candlelit|couple|valentine/)) {
      return 'romantic';
    }
    
    // ADVENTUROUS - Adventure, nature, outdoor, sports, fitness, water activities
    else if (lowerQuery.match(/adventurous|adventure|nature|outdoor|hike|climb|mountain|forest|trail|explore|sport|fitness|gym|workout|water|kayak|surf|bike|cycling|zipline|rope|boulder/)) {
      return 'adventurous';
    }
    
    // CALM - Wellness, mindfulness, culture, learning, creative, seasonal
    else if (lowerQuery.match(/calm|peaceful|relaxing|chill|zen|quiet|meditat|tranquil|serene|wellness|spa|yoga|massage|mindful|culture|museum|art|gallery|learn|study|creative|paint|craft|seasonal|autumn|spring|winter|summer/)) {
      return 'calm';
    }
    
    // EXCITED - Social, nightlife, culinary, party, energetic
    else if (lowerQuery.match(/energetic|party|fun|lively|upbeat|vibrant|dance|club|night|social|friends|group|culinary|food|restaurant|wine|taste|bar|cocktail|beer|drink/)) {
      return 'excited';
    }
    
    return null; // Neutral if no vibe detected
  };

  const handleSubmit = async (vibe: string) => {
    if (!deviceId || !currentConversationId) {
      console.error('Not initialized yet');
      return;
    }

    console.log('🎯 Submitting vibe:', vibe);
    
    // Detect and set vibe from query
    const detectedVibe = detectVibeFromQuery(vibe);
    if (detectedVibe) {
      setVibe(detectedVibe);
      console.log('🎨 Detected vibe:', detectedVibe);
    } else {
      clearVibe();
    }
    
    // Show loading state
    setIsSubmitting(true);

    // Small delay to show loading animation
    setTimeout(() => {
      setIsSubmitting(false);
      navigation.navigate('SuggestionsScreenShell', {
        conversationId: currentConversationId,
        deviceId,
        userMessage: vibe,
        filters,
        userLocation: userLocation || undefined,
      });
    }, 800);
  };

  const handleChallengeMe = async () => {
    if (!deviceId) return;

    // Navigate directly to Challenge Me screen
    navigation.navigate('ChallengeMeScreen', {
      deviceId,
      userLocation: userLocation || undefined,
    });
  };

  const handleProfile = () => {
    navigation.navigate('UserProfile');
  };

  const handleFilters = () => {
    setShowFilters(!showFilters);
    setShowVibeProfiles(false);
  };

  const handleVibeProfiles = () => {
    setShowVibeProfiles(!showVibeProfiles);
    setShowFilters(false);
  };

  const handleProfileSelect = (profile: any) => {
    if (profile === null) {
      // Deselect - clear filters and selected profile
      console.log('Deselected profile');
      setSelectedProfileId(undefined);
      setFilters({});
      clearVibe();
    } else {
      // Select - apply profile filters
      console.log('Selected profile:', profile.name);
      setSelectedProfileId(profile.id);
      setFilters(profile.filters || {});
      
      // Set vibe based on profile mood
      if (profile.filters?.mood) {
        const mood = profile.filters.mood.toLowerCase();
        if (mood === 'romantic') setVibe('romantic');
        else if (mood === 'adventurous') setVibe('adventurous');
        else if (mood === 'calm' || mood === 'relaxed') setVibe('calm');
        else if (mood === 'energetic' || mood === 'excited') setVibe('excited');
        else clearVibe();
      } else {
        clearVibe();
      }
    }
    setShowVibeProfiles(false);
  };

  const handleCreateProfile = () => {
    setShowVibeProfiles(false);
    setShowCreateProfileModal(true);
  };

  const handleCreateProfileComplete = () => {
    setShowCreateProfileModal(false);
  };

  // Get background gradient colors based on vibe state
  const vibeColors = getVibeColors();
  const backgroundColors = vibeColors
    ? [vibeColors.gradient.start, vibeColors.gradient.end, themeColors.background]
    : resolvedTheme === 'light'
    ? ['#F5F5F5', '#E5E5E5', '#EFEFEF']
    : [themeColors.background, themeColors.background, themeColors.background];
  
  // Debug logging
  console.log('🎨 Current vibe:', currentVibe);
  console.log('🎨 Vibe colors:', vibeColors);
  console.log('🎨 Background colors:', backgroundColors);
  console.log('🎨 Resolved theme:', resolvedTheme);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      {/* Animated background - neutral or vibe-tinted */}
      <AnimatedGradientBackground
        colors={backgroundColors as [string, string, string]}
        duration={currentVibe ? 8000 : 15000}
      />
      
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={handleProfile} style={styles.profileButton}>
            <View style={[styles.profileIcon, { 
              backgroundColor: resolvedTheme === 'light' ? '#2F2F2F' : '#2F2F2F',
              borderColor: themeColors.border 
            }]}>
              <Text style={[styles.profileText, { color: '#FFFFFF' }]}>
                {userName ? userName[0].toUpperCase() : '?'}
              </Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Main content area */}
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Hero Section - Main Vibe Input */}
          <View style={styles.heroSection}>
            {/* Greeting */}
            {!isSubmitting && (
              <View style={styles.greetingContainer}>
                <Text style={[styles.greeting, { color: themeColors.text.secondary }]}>
                  {userName ? `Hello ${userName}` : 'Hello'}
                </Text>
                <TextShimmer
                  duration={3}
                  baseColor={currentVibe && vibeColors ? vibeColors.primary : themeColors.text.primary}
                  shimmerColor={currentVibe && vibeColors ? vibeColors.primary + 'CC' : themeColors.text.primary}
                  style={styles.title}
                >
                  What's the vibe?
                </TextShimmer>
              </View>
            )}

            {/* Loading state */}
            {isSubmitting && (
              <View style={styles.loadingContainer}>
                <LoadingShimmer text="Matching your vibe..." />
              </View>
            )}

            {/* Input */}
            {!isSubmitting && (
              <View style={styles.inputWrapper}>
                <MinimalVibeInput
                  placeholder="Describe your vibe..."
                  onSubmit={handleSubmit}
                  disabled={loading}
                />
              </View>
            )}

            {/* Challenge Me button */}
            {!isSubmitting && (
              <TouchableOpacity
                onPress={handleChallengeMe}
                style={styles.challengeButton}
                activeOpacity={0.7}
              >
                <Image
                  source={
                    resolvedTheme === 'light'
                      ? require('../assets/challenge-me-light.png')
                      : require('../assets/challenge-me-dark.png')
                  }
                  style={styles.challengeImage}
                  resizeMode="contain"
                  onError={(error) => console.log('Image load error:', error)}
                  onLoad={() => console.log('Image loaded successfully')}
                />
              </TouchableOpacity>
            )}

            {/* Filters panel */}
            {showFilters && (
              <View style={[styles.filtersPanel, {
                backgroundColor: resolvedTheme === 'light' ? 'rgba(0, 0, 0, 0.05)' : 'rgba(255, 255, 255, 0.08)',
                borderColor: resolvedTheme === 'light' ? 'rgba(0, 0, 0, 0.1)' : 'rgba(255, 255, 255, 0.15)',
              }]}>
                <MinimalActivityFilters
                  onFiltersChange={setFilters}
                />
              </View>
            )}

            {/* Vibe Profiles panel */}
            {showVibeProfiles && deviceId && (
              <View style={[styles.vibeProfilesPanel, {
                backgroundColor: resolvedTheme === 'light' ? 'rgba(0, 0, 0, 0.05)' : 'rgba(255, 255, 255, 0.08)',
                borderColor: resolvedTheme === 'light' ? 'rgba(0, 0, 0, 0.1)' : 'rgba(255, 255, 255, 0.15)',
              }]}>
                <MinimalVibeProfileSelector
                  deviceId={deviceId}
                  onProfileSelect={handleProfileSelect}
                  onCreateProfile={handleCreateProfile}
                  selectedProfileId={selectedProfileId}
                />
              </View>
            )}

            {/* Bottom buttons */}
            {!isSubmitting && (
              <View style={styles.bottomButtons}>
                <TouchableOpacity
                  onPress={handleFilters}
                  style={styles.bottomButton}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.bottomButtonText, { color: themeColors.text.secondary }]}>
                    Filters{Object.keys(filters).length > 0 ? ` (${Object.keys(filters).length})` : ''}
                  </Text>
                </TouchableOpacity>

                <View style={[styles.buttonDivider, { backgroundColor: themeColors.border }]} />

                <TouchableOpacity
                  onPress={handleVibeProfiles}
                  style={styles.bottomButton}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.bottomButtonText, { color: themeColors.text.secondary }]}>Vibe Profiles</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>

          {/* Suggested Sidequests Section */}
          {!isSubmitting && deviceId && (
            <View style={styles.sidequestsSection}>
              <SuggestedSidequests
                deviceId={deviceId}
                userLocation={userLocation || undefined}
              />
            </View>
          )}
        </ScrollView>

        {/* Create Profile Modal */}
        <MinimalCreateVibeProfileModal
          visible={showCreateProfileModal}
          onClose={handleCreateProfileComplete}
          onProfileCreated={handleCreateProfileComplete}
          deviceId={deviceId}
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  profileButton: {
    padding: 4,
  },
  profileIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#2F2F2F',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  profileText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  scrollContent: {
    paddingBottom: 40,
  },
  heroSection: {
    minHeight: 600, // Fixed height instead of percentage
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 40,
    gap: 32,
  },
  sidequestsSection: {
    marginTop: 40,
  },
  greetingContainer: {
    alignItems: 'center',
    gap: 8,
  },
  greeting: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 16,
    fontWeight: '400',
  },
  title: {
    color: '#FFFFFF',
    fontSize: 32,
    fontWeight: '600',
    textAlign: 'center',
  },
  inputWrapper: {
    width: '100%',
    maxWidth: 600,
  },
  challengeButton: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
  },
  challengeImage: {
    width: '90%',
    height: 80,
    maxWidth: 400,
  },
  challengeText: {
    color: '#000000',
    fontSize: 14,
    fontWeight: '700',
  },
  loadingContainer: {
    paddingVertical: 40,
  },
  filtersPanel: {
    width: '100%',
    marginTop: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    overflow: 'hidden',
    // Glass morphism effect
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
  },
  vibeProfilesPanel: {
    width: '100%',
    marginTop: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    overflow: 'hidden',
    // Glass morphism effect
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
  },
  bottomButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
    gap: 16,
  },
  bottomButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  bottomButtonText: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 14,
    fontWeight: '400',
  },
  buttonDivider: {
    width: 1,
    height: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
});
