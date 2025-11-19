/**
 * NewChatHomeScreen - Visual Shell Redesign
 * Static orb, radiating gradients, glass morphism UI
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Animated,
  Keyboard,
  Image,
} from 'react-native';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import * as Device from 'expo-device';
import * as Location from 'expo-location';
import { FilterOptions } from '../components/filters/ActivityFilters';
import { chatApi, ChatStartResponse } from '../src/services/chatApi';
import { userStorage } from '../src/services/userStorage';

type RootStackParamList = {
  ChatHome: undefined;
  ActivitySuggestions: {
    conversationId: number;
    deviceId: string;
    userMessage: string;
    filters?: FilterOptions;
    userLocation?: { latitude: number; longitude: number };
  };
  UserProfile: undefined;
  FiltersModal: { onApply: (filters: FilterOptions) => void };
  VibeProfilesModal: { onSelect: (filters: FilterOptions) => void };
};

export const NewChatHomeScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const [deviceId, setDeviceId] = useState<string>('');
  const [greeting, setGreeting] = useState<ChatStartResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [inputText, setInputText] = useState('');
  const [currentConversationId, setCurrentConversationId] = useState<number | null>(null);
  const [filters, setFilters] = useState<FilterOptions>({});
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [userName, setUserName] = useState('');
  
  // Animation for radiating gradients
  const radiateAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    initializeScreen();
    startRadiatingAnimation();
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

  const startRadiatingAnimation = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(radiateAnim, {
          toValue: 1,
          duration: 4000,
          useNativeDriver: false,
        }),
        Animated.timing(radiateAnim, {
          toValue: 0,
          duration: 4000,
          useNativeDriver: false,
        }),
      ])
    ).start();
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
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = () => {
    if (!inputText.trim() || !currentConversationId) return;

    const activeFilters = {
      ...filters,
      userLatitude: userLocation?.latitude,
      userLongitude: userLocation?.longitude,
    };

    navigation.navigate('ActivitySuggestions', {
      conversationId: currentConversationId,
      deviceId: deviceId,
      userMessage: inputText.trim(),
      filters: Object.keys(filters).length > 0 ? activeFilters : undefined,
      userLocation: userLocation || undefined,
    });

    setInputText('');
    Keyboard.dismiss();
  };

  const handleChallengeMe = () => {
    // TODO: Implement Challenge Me flow
    console.log('Challenge Me pressed');
  };

  // Radiating gradient animation
  const radiateOpacity = radiateAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0.3, 0.6, 0.3],
  });

  const radiateScale = radiateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.2],
  });

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Image
          source={require('../assets/orb.png')}
          style={styles.loadingOrb}
          resizeMode="contain"
        />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {/* Background gradient with radiating effect */}
      <LinearGradient
        colors={['#0A0E17', '#1A2332', '#0F1922']}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      {/* Radiating light rays */}
      <Animated.View
        style={[
          styles.radiatingGradient,
          {
            opacity: radiateOpacity,
            transform: [{ scale: radiateScale }],
          },
        ]}
      >
        <LinearGradient
          colors={['rgba(0,170,255,0.3)', 'transparent', 'rgba(0,255,255,0.2)']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
      </Animated.View>

      {/* Profile avatar - top right */}
      <TouchableOpacity
        style={styles.profileButton}
        onPress={() => navigation.navigate('UserProfile')}
      >
        <Text style={styles.profileIcon}>👤</Text>
      </TouchableOpacity>

      {/* Main content */}
      <View style={styles.content}>
        {/* Static orb */}
        <View style={styles.orbContainer}>
          <Image
            source={require('../assets/orb.png')}
            style={styles.orb}
            resizeMode="contain"
          />
          {/* Orb glow effect */}
          <View style={styles.orbGlow} />
        </View>

        {/* Greeting */}
        <View style={styles.greetingContainer}>
          {userName && (
            <Text style={styles.greetingName}>Hello {userName}</Text>
          )}
          <Text style={styles.greetingTitle}>What's the vibe?</Text>
        </View>

        {/* Glass capsule input */}
        <BlurView intensity={30} tint="dark" style={styles.inputGlass}>
          <TextInput
            style={styles.input}
            placeholder="Ask anything..."
            placeholderTextColor="rgba(255,255,255,0.5)"
            value={inputText}
            onChangeText={setInputText}
            onSubmitEditing={handleSendMessage}
            returnKeyType="send"
          />
          <TouchableOpacity
            onPress={handleSendMessage}
            disabled={!inputText.trim()}
            style={[styles.sendIcon, !inputText.trim() && styles.sendIconDisabled]}
          >
            <Text style={styles.sendIconText}>🎵</Text>
          </TouchableOpacity>
        </BlurView>

        {/* Challenge Me button */}
        <TouchableOpacity onPress={handleChallengeMe} activeOpacity={0.8}>
          <BlurView intensity={20} tint="light" style={styles.challengeButton}>
            <LinearGradient
              colors={['rgba(0,170,255,0.3)', 'rgba(0,255,255,0.3)']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.challengeGradient}
            >
              <Text style={styles.challengeText}>CHALLENGE ME</Text>
            </LinearGradient>
          </BlurView>
        </TouchableOpacity>

        {/* Bottom utility buttons */}
        <View style={styles.utilityRow}>
          <TouchableOpacity
            onPress={() => {
              /* TODO: Open filters modal */
            }}
            activeOpacity={0.8}
          >
            <BlurView intensity={20} tint="dark" style={styles.utilityButton}>
              <Text style={styles.utilityIcon}>⚙️</Text>
              <Text style={styles.utilityText}>Filters</Text>
            </BlurView>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => {
              /* TODO: Open vibe profiles modal */
            }}
            activeOpacity={0.8}
          >
            <BlurView intensity={20} tint="dark" style={styles.utilityButton}>
              <Text style={styles.utilityIcon}>📚</Text>
              <Text style={styles.utilityText}>Vibe Profiles</Text>
            </BlurView>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0E17',
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#0A0E17',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingOrb: {
    width: 120,
    height: 120,
    opacity: 0.8,
  },
  radiatingGradient: {
    position: 'absolute',
    top: -100,
    left: -100,
    right: -100,
    height: 600,
  },
  profileButton: {
    position: 'absolute',
    top: 60,
    right: 24,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  profileIcon: {
    fontSize: 24,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingBottom: 60,
  },
  orbContainer: {
    width: 220,
    height: 220,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 32,
  },
  orb: {
    width: 180,
    height: 180,
  },
  orbGlow: {
    position: 'absolute',
    width: 240,
    height: 240,
    borderRadius: 120,
    backgroundColor: 'rgba(0,170,255,0.2)',
    shadowColor: '#00AAFF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 60,
  },
  greetingContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  greetingName: {
    fontSize: 18,
    fontWeight: '400',
    color: 'rgba(255,255,255,0.7)',
    marginBottom: 8,
  },
  greetingTitle: {
    fontSize: 32,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  inputGlass: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 28,
    paddingHorizontal: 20,
    paddingVertical: 14,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
    overflow: 'hidden',
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#FFFFFF',
    paddingRight: 12,
  },
  sendIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0,170,255,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendIconDisabled: {
    opacity: 0.3,
  },
  sendIconText: {
    fontSize: 20,
  },
  challengeButton: {
    width: '100%',
    borderRadius: 28,
    overflow: 'hidden',
    marginBottom: 32,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  challengeGradient: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  challengeText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 1,
  },
  utilityRow: {
    flexDirection: 'row',
    gap: 16,
    width: '100%',
  },
  utilityButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
    overflow: 'hidden',
    gap: 8,
  },
  utilityIcon: {
    fontSize: 18,
  },
  utilityText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
