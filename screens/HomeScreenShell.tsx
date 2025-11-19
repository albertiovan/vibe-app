/**
 * HomeScreenShell
 * New visual shell home screen with orb, gradients, and glass UI
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
  Text,
  Alert,
} from 'react-native';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Device from 'expo-device';
import * as Location from 'expo-location';
import { OrbBackdrop } from '../ui/components/OrbBackdrop';
import { GlassCard } from '../ui/components/GlassCard';
import { GlassButton } from '../ui/components/GlassButton';
import { AIQueryBar } from '../ui/components/AIQueryBar';
import { OrbImage } from '../ui/components/OrbImage';
import { GreetingBlock } from '../ui/blocks/GreetingBlock';
import { RainbowButton } from '../ui/components/RainbowButton';
import { theme } from '../ui/theme/tokens';
import { chatApi, ChatStartResponse } from '../src/services/chatApi';
import { userStorage } from '../src/services/userStorage';
import ActivityFilters, { FilterOptions } from '../components/filters/ActivityFilters';
import { VibeProfileSelector } from '../components/VibeProfileSelector';
import { CreateVibeProfileModal } from '../components/CreateVibeProfileModal';

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
  ActivityDetailScreenShell: {
    activity: any;
    userLocation?: { latitude: number; longitude: number };
  };
  ActivitySuggestions: {
    conversationId: number;
    deviceId: string;
    userMessage: string;
    filters?: FilterOptions;
    userLocation?: { latitude: number; longitude: number };
  };
  UserProfile: undefined;
};

export const HomeScreenShell: React.FC = () => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const [deviceId, setDeviceId] = useState<string>('');
  const [greeting, setGreeting] = useState<ChatStartResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentConversationId, setCurrentConversationId] = useState<number | null>(null);
  const [filters, setFilters] = useState<FilterOptions>({});
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(
    null
  );
  const [userName, setUserName] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filtersExpanded, setFiltersExpanded] = useState(false);
  const [showVibeProfiles, setShowVibeProfiles] = useState(false);
  const [showCreateProfileModal, setShowCreateProfileModal] = useState(false);

  const colors = theme.colors;
  const typo = theme.typography;

  useEffect(() => {
    initializeScreen();
    requestLocationPermission();
    loadUserName();
  }, []);

  const loadUserName = async () => {
    try {
      const account = await userStorage.getAccount();
      if (account?.name) {
        setUserName(account.name);
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
      }
    } catch (error) {
      console.error('Failed to get location:', error);
    }
  };

  const initializeScreen = async () => {
    try {
      const id = Device.modelId || `device-${Math.random().toString(36).substr(2, 9)}`;
      setDeviceId(id);

      const location = {
        city: 'Bucharest',
        lat: 44.4268,
        lng: 26.1025,
      };

      const response = await chatApi.startConversation({
        deviceId: id,
        location,
      });

      setGreeting(response);
      setCurrentConversationId(response.conversationId);
    } catch (error) {
      console.error('Failed to initialize:', error);
      
      // Graceful degradation: Create temporary conversation ID
      // This allows the app to work even if backend is offline
      const tempConversationId = Math.floor(Math.random() * 1000000);
      setCurrentConversationId(tempConversationId);
      
      if (__DEV__) {
        Alert.alert(
          'Backend Offline',
          'Could not connect to backend server. App will work with limited functionality.\n\nTo start backend:\ncd backend && npm run dev',
          [{ text: 'OK' }]
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const handleQuerySubmit = (query: string) => {
    if (!currentConversationId) {
      Alert.alert('Error', 'Conversation not initialized');
      return;
    }

    const activeFilters = {
      ...filters,
      userLatitude: userLocation?.latitude,
      userLongitude: userLocation?.longitude,
    };

    navigation.navigate('SuggestionsScreenShell', {
      conversationId: currentConversationId,
      deviceId: deviceId,
      userMessage: query,
      filters: Object.keys(filters).length > 0 ? activeFilters : undefined,
      userLocation: userLocation || undefined,
    });
  };

  const handleChallengeMe = async () => {
    if (!deviceId) {
      Alert.alert('Error', 'Device not initialized');
      return;
    }

    try {
      setLoading(true);
      
      // Fetch challenges directly from API
      const API_URL = Platform.OS === 'android' 
        ? 'http://10.0.2.2:3000'
        : 'http://localhost:3000';
        
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL || API_URL}/api/challenges/me?deviceId=${deviceId}`
      );
      
      if (!response.ok) {
        throw new Error('Failed to fetch challenges');
      }
      
      const data = await response.json();
      
      if (data.challenges && data.challenges.length > 0) {
        // Navigate directly to Challenge Me screen
        navigation.navigate('ChallengeMeScreen', {
          deviceId,
          userLocation: userLocation || undefined,
        });
      } else {
        Alert.alert(
          'No Challenges Yet',
          'Try a few activities first, then come back for personalized challenges!'
        );
      }
    } catch (error) {
      console.error('❌ Challenge Me error:', error);
      Alert.alert(
        'Error',
        'Could not load challenges. Make sure the backend is running.'
      );
    } finally {
      setLoading(false);
    }
  };

  // handleChallengeAccepted removed - no longer needed since we navigate directly

  const handleFilters = () => {
    setFiltersExpanded(!filtersExpanded);
  };

  const handleFiltersChange = (newFilters: FilterOptions) => {
    console.log('📋 Filters updated:', newFilters);
    setFilters(newFilters);
    setFiltersExpanded(false);
  };

  const handleVibeProfiles = () => {
    setShowVibeProfiles(!showVibeProfiles);
  };

  const handleProfileSelect = (profile: any) => {
    console.log('✨ Profile selected:', profile.name);
    setFilters(profile.filters || {});
    setShowVibeProfiles(false);
  };

  const handleCreateProfile = () => {
    setShowVibeProfiles(false);
    setShowCreateProfileModal(true);
  };

  const handleProfileCreated = () => {
    setShowCreateProfileModal(false);
    // Refresh vibe profiles list if needed
  };

  const handleProfile = () => {
    navigation.navigate('UserProfile');
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <OrbBackdrop variant="dark" />
        <OrbImage size={120} />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {/* Background with orb gradients */}
      <OrbBackdrop variant="dark" />

      <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
        {/* Profile button - top right */}
        <View style={styles.header}>
          <View style={styles.headerSpacer} />
          <TouchableOpacity
            style={[styles.profileButton, { backgroundColor: colors.glass.surface }]}
            onPress={handleProfile}
            accessibilityRole="button"
            accessibilityLabel="Open profile"
          >
            <Text style={styles.profileIcon}>👤</Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Orb */}
          <View style={styles.orbContainer}>
            <OrbImage size={180} />
          </View>

          {/* Greeting */}
          <GreetingBlock firstName={userName || 'there'} />

          {/* AI Query Bar with Let's explore button */}
          <View style={styles.queryContainer}>
            <AIQueryBar
              placeholder="Describe your mood, energy, desires..."
              onSubmit={handleQuerySubmit}
              testID="home-query-bar"
              submitButtonText="Let's explore!"
            />
          </View>

          {/* Spacer to push bottom content down */}
          <View style={{ flex: 1, minHeight: 40 }} />

          {/* Filters Section - auto-expanded */}
          {filtersExpanded && (
            <View style={styles.filtersContainer}>
              <ActivityFilters
                onFiltersChange={handleFiltersChange}
                userLocation={userLocation || undefined}
                initialFilters={filters}
              />
            </View>
          )}

          {/* Vibe Profiles Section */}
          {showVibeProfiles && deviceId && (
            <View style={styles.vibeProfilesContainer}>
              <VibeProfileSelector
                deviceId={deviceId}
                onProfileSelect={handleProfileSelect}
                onCreateProfile={handleCreateProfile}
              />
            </View>
          )}

          {/* Challenge Me Button - rainbow glow style */}
          <View style={styles.challengeButtonBottom}>
            <RainbowButton
              onPress={handleChallengeMe}
              speed={2}
            >
              ⚡ CHALLENGE ME ⚡
            </RainbowButton>
          </View>

          {/* Minimalist Utility Buttons - bottom centered */}
          <View style={styles.utilityRowBottom}>
            <TouchableOpacity
              style={styles.minimalButton}
              onPress={handleFilters}
              activeOpacity={0.7}
            >
              <Text style={styles.minimalButtonText}>
                Filters{Object.keys(filters).length > 0 ? ` (${Object.keys(filters).length})` : ''}
              </Text>
            </TouchableOpacity>

            <View style={styles.buttonDivider} />

            <TouchableOpacity
              style={styles.minimalButton}
              onPress={handleVibeProfiles}
              activeOpacity={0.7}
            >
              <Text style={styles.minimalButtonText}>Vibe Profiles</Text>
            </TouchableOpacity>
          </View>

          <View style={{ height: 40 }} />
        </ScrollView>
      </SafeAreaView>

      {/* Create Vibe Profile Modal */}
      {showCreateProfileModal && (
        <CreateVibeProfileModal
          visible={showCreateProfileModal}
          deviceId={deviceId}
          onClose={() => setShowCreateProfileModal(false)}
          onProfileCreated={handleProfileCreated}
          initialFilters={filters.durationRange === 'any' ? { ...filters, durationRange: undefined } : filters as any}
        />
      )}
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  headerSpacer: {
    width: 44,
  },
  profileButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.22)',
  },
  profileIcon: {
    fontSize: 24,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 20,
  },
  orbContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  queryContainer: {
    marginBottom: 20,
  },
  challengeContainer: {
    marginBottom: 24,
  },
  challengeMeContainer: {
    marginBottom: 24,
  },
  closeButton: {
    alignItems: 'center',
    paddingVertical: 12,
    marginTop: 12,
  },
  filtersContainer: {
    marginBottom: 16,
  },
  vibeProfilesContainer: {
    marginBottom: 16,
  },
  utilityRow: {
    flexDirection: 'row',
    gap: 12,
  },
  utilityButton: {
    flex: 1,
  },
  utilityIcon: {
    fontSize: 18,
  },
  challengeButtonBottom: {
    marginBottom: 20,
    marginTop: 10,
  },
  challengeMeButton: {
    backgroundColor: 'rgba(255, 50, 50, 0.15)',
    borderWidth: 2,
    borderColor: 'rgba(255, 50, 50, 0.5)',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#ff3232',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  challengeMeText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ff5555',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  utilityRowBottom: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
    marginBottom: 8,
  },
  minimalButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  minimalButtonText: {
    fontSize: 13,
    fontWeight: '400',
    color: 'rgba(255, 255, 255, 0.6)',
    letterSpacing: 0.3,
  },
  buttonDivider: {
    width: 1,
    height: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    marginHorizontal: 8,
  },
});
