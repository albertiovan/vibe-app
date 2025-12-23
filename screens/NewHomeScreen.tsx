/**
 * NewHomeScreen
 * Reimagined startup screen with smooth animations and bottom navigation
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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import * as Device from 'expo-device';
import { AnimatedGradientBackground } from '../ui/components/AnimatedGradientBackground';
import { GreetingAnimation } from '../ui/components/GreetingAnimation';
import { MinimalGlassInput } from '../ui/components/MinimalGlassInput';
import { BottomNavBar, NavTab } from '../ui/components/BottomNavBar';
import { MinimalUserProfileScreen } from './MinimalUserProfileScreen';
import { LiquidGlassButton } from '../ui/components/LiquidGlassButton';
import ChallengeMeTab from './ChallengeMeTab';
import VibeStoriesFeed from '../components/community/VibeStoriesFeed';
import ChallengeLeaderboard from '../components/community/ChallengeLeaderboard';
import MyActivity from '../components/community/MyActivity';
import CreatePostButton from '../components/community/CreatePostButton';
import MinimalActivityFilters from '../components/filters/MinimalActivityFilters';
import { MinimalVibeProfileSelector } from '../components/MinimalVibeProfileSelector';
import { MinimalCreateVibeProfileModal } from '../components/MinimalCreateVibeProfileModal';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { API_BASE_URL } from '../src/config/api';
import { useVibe, VibeState } from '../src/contexts/VibeContext';
import { useTheme } from '../src/contexts/ThemeContext';
import { userStorage } from '../src/services/userStorage';
import { useLanguage } from '../src/i18n/LanguageContext';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
  runOnJS,
} from 'react-native-reanimated';

type RootStackParamList = {
  ActivityDetailScreenShell: {
    activity: any;
    userLocation?: { latitude: number; longitude: number };
  };
  Community: undefined;
};

export const NewHomeScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const { currentVibe, getVibeColors, setVibeFromText } = useVibe();
  const { resolvedTheme, colors: themeColors } = useTheme();
  const { t } = useLanguage();
  
  // State
  const [userName, setUserName] = useState<string>('there');
  const [deviceId, setDeviceId] = useState<string>('');
  const [showGreeting, setShowGreeting] = useState(true);
  const [showMainContent, setShowMainContent] = useState(false);
  const [vibeInput, setVibeInput] = useState('');
  const [activeTab, setActiveTab] = useState<NavTab>('home');
  const [showFilters, setShowFilters] = useState(false);
  const [showVibeProfiles, setShowVibeProfiles] = useState(false);
  const [showCreateProfileModal, setShowCreateProfileModal] = useState(false);
  const [filters, setFilters] = useState({});
  const [communitySubTab, setCommunitySubTab] = useState<'feed' | 'leaderboard' | 'activity'>('feed');
  
  // Animation values for input
  const inputOpacity = useSharedValue(0);
  const inputTranslateY = useSharedValue(20);
  const titleOpacity = useSharedValue(1); // For smooth title transition

  // Tab order for swipe navigation
  const tabOrder: NavTab[] = ['home', 'community', 'challenge', 'profile'];

  // Swipe gesture handler
  const handleSwipe = (direction: 'left' | 'right') => {
    const currentIndex = tabOrder.indexOf(activeTab);
    
    if (direction === 'left' && currentIndex < tabOrder.length - 1) {
      // Swipe left = next tab
      setActiveTab(tabOrder[currentIndex + 1]);
    } else if (direction === 'right' && currentIndex > 0) {
      // Swipe right = previous tab
      setActiveTab(tabOrder[currentIndex - 1]);
    }
  };

  // Pan gesture for swipe detection
  const panGesture = Gesture.Pan()
    .onEnd((event) => {
      const swipeThreshold = 50; // Minimum distance for swipe
      const velocityThreshold = 500; // Minimum velocity for swipe
      
      if (Math.abs(event.translationX) > swipeThreshold || Math.abs(event.velocityX) > velocityThreshold) {
        if (event.translationX > 0) {
          // Swiped right
          runOnJS(handleSwipe)('right');
        } else {
          // Swiped left
          runOnJS(handleSwipe)('left');
        }
      }
    });

  // Load user name and device ID
  useEffect(() => {
    loadUserName();
    loadDeviceId();
  }, []);

  const loadUserName = async () => {
    try {
      const account = await userStorage.getAccount();
      if (account?.nickname) {
        setUserName(account.nickname);
      } else if (account?.name) {
        setUserName(account.name.split(' ')[0]);
      }
    } catch (error) {
      console.log('No user account found');
    }
  };

  const loadDeviceId = async () => {
    try {
      const id = await userStorage.getUserId();
      if (id) {
        setDeviceId(id);
      } else {
        // Fallback: generate a temporary device ID
        setDeviceId(`device_${Date.now()}`);
      }
    } catch (error) {
      console.log('Could not get device ID');
      setDeviceId(`device_${Date.now()}`);
    }
  };

  const handleChallengeAccept = (challenge: any) => {
    // Convert challenge to activity format and navigate
    const activity = {
      id: challenge.activityId,
      activityId: challenge.activityId,
      name: challenge.name,
      description: challenge.description,
      category: challenge.category,
      region: challenge.region,
      city: challenge.city,
      energy_level: challenge.energy_level,
      hero_image_url: challenge.photo,
      photos: challenge.photo ? [challenge.photo] : [],
    };

    navigation.navigate('ActivityDetailScreenShell', {
      activity,
      userLocation: undefined, // Could add location here
    });
  };

  // Get background gradient colors - only apply vibe colors on home tab (not profile, challenge, or community)
  const vibeColors = getVibeColors();
  const backgroundColors = (activeTab === 'home' && vibeColors)
    ? [vibeColors.gradient.start, vibeColors.gradient.end, themeColors.background]
    : resolvedTheme === 'light'
    ? ['#FAFAFA', '#F5F5F7', '#F0F0F2'] // Subtle warm gradient for light mode
    : ['#000000', '#0A0A0A', '#000000']; // Pure black gradient for dark mode

  const handleVibeSubmit = async () => {
    if (vibeInput.trim()) {
      console.log('Vibe submitted:', vibeInput);
      
      // Detect and set vibe colors from the submitted text
      setVibeFromText(vibeInput.trim());
      
      try {
        // Start a new conversation first
        const response = await fetch(`${API_BASE_URL}/api/chat/start`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            deviceId: deviceId || 'anonymous',
            location: { city: 'Bucharest' }
          })
        });
        
        const data = await response.json();
        
        if (data.conversationId) {
          // Navigate to suggestions with the created conversation ID and filters
          navigation.navigate('SuggestionsScreenShell' as any, { 
            conversationId: data.conversationId,
            deviceId: deviceId || 'anonymous',
            userMessage: vibeInput.trim(),
            filters: filters,
            userLocation: undefined
          });
          
          // Clear input after submission
          setVibeInput('');
        }
      } catch (error) {
        console.error('Failed to start conversation:', error);
      }
    }
  };

  const handleTitlePositioned = () => {
    // Title has moved to final position, fade in the input
    inputOpacity.value = withTiming(1, {
      duration: 600,
      easing: Easing.out(Easing.cubic),
    });
    inputTranslateY.value = withTiming(0, {
      duration: 600,
      easing: Easing.out(Easing.cubic),
    });
  };

  const handleGreetingComplete = () => {
    // Fade out animated title, fade in static title at exact same position
    setTimeout(() => {
      setShowGreeting(false);
      setShowMainContent(true);
    }, 0);
  };

  const inputAnimatedStyle = useAnimatedStyle(() => ({
    opacity: inputOpacity.value,
    transform: [{ translateY: inputTranslateY.value }],
  }));

  // For profile, render full screen without SafeAreaView constraints
  if (activeTab === 'profile') {
    // Profile tab always uses theme colors, never vibe colors
    const profileColors = resolvedTheme === 'light'
      ? ['#FAFAFA', '#F5F5F7', '#F0F0F2'] as [string, string, string]
      : ['#000000', '#0A0A0A', '#000000'] as [string, string, string];
      
    return (
      <GestureDetector gesture={panGesture}>
        <View style={styles.profileFullScreen}>
          <AnimatedGradientBackground
            colors={profileColors}
            duration={20000}
          />
          <MinimalUserProfileScreen />
          {/* Floating Bottom Navigation */}
          <View style={styles.floatingNavContainer}>
            <BottomNavBar
              activeTab={activeTab}
              onTabChange={setActiveTab}
            />
          </View>

          {/* Create Vibe Profile Modal */}
          {showCreateProfileModal && deviceId && (
            <MinimalCreateVibeProfileModal
              visible={showCreateProfileModal}
              deviceId={deviceId}
              onClose={() => setShowCreateProfileModal(false)}
              onProfileCreated={() => {
                setShowCreateProfileModal(false);
                // Optionally reload profiles
              }}
            />
          )}
        </View>
      </GestureDetector>
    );
  }

  return (
    <GestureDetector gesture={panGesture}>
      <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
        <AnimatedGradientBackground
          colors={backgroundColors as [string, string, string]}
          duration={activeTab === 'home' && currentVibe ? 12000 : 20000}
        />
        
        <KeyboardAvoidingView
          style={styles.container}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={0}
        >
        {/* Main Content - Hide ScrollView on community tab */}
        {activeTab !== 'community' && (
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {/* Greeting Animation or Main Content */}
            <View style={styles.mainContent}>
              {/* Greeting Animation Container - always present */}
              {showGreeting && (
                <View style={styles.greetingContainer}>
                  <GreetingAnimation
                    userName={userName}
                    onComplete={handleGreetingComplete}
                    onTitlePositioned={handleTitlePositioned}
                  />
                </View>
              )}

              {/* Title - appears after animation and stays - hide on challenge and community tabs */}
              {showMainContent && activeTab !== 'challenge' && activeTab !== 'community' && (
                <Text style={[styles.title, { color: themeColors.text.primary }]}>
                  {t('greeting.whats_the_vibe')}
                </Text>
              )}

              {/* Content below title - hide on challenge and community tabs */}
              {activeTab !== 'challenge' && activeTab !== 'community' && (
                <View style={styles.contentBelow}>
                  {/* Vibe Input with animation - always takes up space */}
                  <Animated.View style={[styles.inputContainer, inputAnimatedStyle]}>
                    {showMainContent && (
                      <MinimalGlassInput
                        value={vibeInput}
                        onChangeText={setVibeInput}
                        onSubmit={handleVibeSubmit}
                        placeholder="Describe your vibe..."
                      />
                    )}
                  </Animated.View>

                  {/* Minimal Action Buttons */}
                  <Animated.View style={[styles.minimalActions, inputAnimatedStyle]}>
                    {showMainContent && (
                      <>
                        <TouchableOpacity
                          onPress={() => setShowFilters(!showFilters)}
                          activeOpacity={0.7}
                          style={styles.minimalButton}
                        >
                          <Text style={[styles.minimalButtonText, { color: themeColors.text.secondary }]}>
                            {t('home.filters')}
                          </Text>
                        </TouchableOpacity>
                        
                        <View style={[styles.divider, { backgroundColor: themeColors.text.tertiary }]} />
                        
                        <TouchableOpacity
                          onPress={() => setShowVibeProfiles(!showVibeProfiles)}
                          activeOpacity={0.7}
                          style={styles.minimalButton}
                        >
                          <Text style={[styles.minimalButtonText, { color: themeColors.text.secondary }]}>
                            {t('home.vibe_profiles')}
                          </Text>
                        </TouchableOpacity>
                      </>
                    )}
                  </Animated.View>

                  {/* Filters Component */}
                  {showFilters && (
                    <View style={styles.expandedSection}>
                      <MinimalActivityFilters
                        onFiltersChange={(newFilters) => {
                          setFilters(newFilters);
                        }}
                      />
                    </View>
                  )}

                  {/* Vibe Profiles Component */}
                  {showVibeProfiles && deviceId && (
                    <View style={styles.expandedSection}>
                      <MinimalVibeProfileSelector
                        deviceId={deviceId}
                        onProfileSelect={(profile) => {
                          if (profile) {
                            setFilters(profile.filters);
                          }
                          setShowVibeProfiles(false);
                        }}
                        onCreateProfile={() => {
                          setShowVibeProfiles(false);
                          setShowCreateProfileModal(true);
                        }}
                      />
                    </View>
                  )}
                </View>
              )}

              {/* Tab Content - Challenge Me */}
              {showMainContent && activeTab === 'challenge' && deviceId && (
                <ChallengeMeTab
                  deviceId={deviceId}
                  onChallengeAccept={handleChallengeAccept}
                />
              )}

            </View>
          </ScrollView>
        )}

        {/* Community Tab - Outside ScrollView to avoid nested VirtualizedList */}
        {showMainContent && activeTab === 'community' && (
          <View style={styles.communityContainer}>
            {/* Community Sub-Tabs */}
            <View style={[
              styles.communityTabs,
              {
                backgroundColor: resolvedTheme === 'light'
                  ? 'rgba(255, 255, 255, 0.85)'
                  : 'rgba(0, 0, 0, 0.85)',
                borderColor: resolvedTheme === 'light'
                  ? 'rgba(0, 0, 0, 0.1)'
                  : 'rgba(255, 255, 255, 0.4)',
              }
            ]}>
              {[
                { id: 'feed' as const, label: 'Feed', icon: '🌊' },
                { id: 'leaderboard' as const, label: 'Leaderboard', icon: '🏆' },
                { id: 'activity' as const, label: 'My Activity', icon: '👤' },
              ].map((tab) => (
                <TouchableOpacity
                  key={tab.id}
                  style={[
                    styles.communityTab,
                    communitySubTab === tab.id && {
                      backgroundColor: resolvedTheme === 'light'
                        ? 'rgba(0, 0, 0, 0.08)'
                        : 'rgba(255, 255, 255, 0.12)',
                      borderWidth: 1,
                      borderColor: resolvedTheme === 'light'
                        ? 'rgba(0, 0, 0, 0.15)'
                        : 'rgba(255, 255, 255, 0.4)',
                    },
                  ]}
                  onPress={() => setCommunitySubTab(tab.id)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.communityTabIcon}>{tab.icon}</Text>
                  <Text
                    style={[
                      styles.communityTabLabel,
                      { color: communitySubTab === tab.id ? '#00D9FF' : themeColors.text.secondary },
                    ]}
                  >
                    {tab.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Community Content */}
            <View style={styles.communityContent}>
              {communitySubTab === 'feed' && <VibeStoriesFeed />}
              {communitySubTab === 'leaderboard' && <ChallengeLeaderboard />}
              {communitySubTab === 'activity' && <MyActivity />}
            </View>

            {/* Create Post Button */}
            {communitySubTab === 'feed' && deviceId && (
              <CreatePostButton userId={deviceId} onPostCreated={() => {}} />
            )}
          </View>
        )}

        {/* Bottom Navigation - Floating */}
        {!showGreeting && (
          <View style={styles.bottomNavWrapper}>
            <BottomNavBar
              activeTab={activeTab}
              onTabChange={setActiveTab}
            />
          </View>
        )}

        {/* Create Vibe Profile Modal */}
        {showCreateProfileModal && deviceId && (
          <MinimalCreateVibeProfileModal
            visible={showCreateProfileModal}
            deviceId={deviceId}
            onClose={() => setShowCreateProfileModal(false)}
            onProfileCreated={() => {
              setShowCreateProfileModal(false);
              // Optionally reload profiles
            }}
          />
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
    </GestureDetector>
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
  },
  scrollContentProfile: {
    flexGrow: 1,
    paddingHorizontal: 0, // No padding for profile
  },
  profileFullScreen: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  floatingNavContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
    backgroundColor: 'transparent',
    alignItems: 'center',
  },
  fullScreenProfile: {
    flex: 1,
    width: '100%',
  },
  greetingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 200, // Push animation higher
  },
  mainContent: {
    flex: 1,
    paddingTop: 0, // No padding - title positioned absolutely
    gap: 20,
    alignItems: 'center',
    width: '100%',
  },
  title: {
    position: 'absolute',
    top: '50%',
    marginTop: -120, // Move back up higher
    width: '100%',
    fontSize: 38,
    fontWeight: '700',
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  contentBelow: {
    position: 'absolute',
    top: '50%',
    marginTop: -40, // Position below title
    width: '100%',
    alignItems: 'center',
    gap: 20,
    paddingHorizontal: 20,
  },
  inputContainer: {
    width: '100%',
    alignItems: 'center',
    minHeight: 60, // Reserve space to prevent layout shift
  },
  minimalActions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    marginTop: 8,
    minHeight: 30,
  },
  minimalButton: {
    paddingVertical: 4,
  },
  minimalButtonText: {
    fontSize: 14,
    fontWeight: '400',
  },
  divider: {
    width: 1,
    height: 14,
    opacity: 0.3,
  },
  expandedSection: {
    marginTop: 20,
    width: '100%',
  },
  tabContent: {
    flex: 1,
    width: '100%',
    marginTop: 20,
  },
  placeholderContent: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  placeholderText: {
    fontSize: 14,
  },
  communityContainer: {
    flex: 1,
    width: '100%',
    paddingTop: 0,
    paddingHorizontal: 0,
  },
  communityTabs: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 12,
    marginBottom: 16,
    marginHorizontal: 20,
    paddingVertical: 6,
    paddingHorizontal: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.4)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  communityTab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 18,
    gap: 5,
  },
  communityTabActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.4)',
  },
  communityTabIcon: {
    fontSize: 16,
  },
  communityTabLabel: {
    fontSize: 11,
    fontWeight: '600',
  },
  communityContent: {
    flex: 1,
  },
  bottomNavWrapper: {
    position: 'absolute',
    bottom: -10,
    left: 0,
    right: 0,
    alignItems: 'center',
    paddingBottom: 10,
    backgroundColor: 'transparent',
    pointerEvents: 'box-none',
  },
});
