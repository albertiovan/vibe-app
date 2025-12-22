/**
 * ChallengeMeTab - Full-page Challenge Me experience
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Platform,
  Modal,
  Dimensions,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  runOnJS,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../src/contexts/ThemeContext';
import { useLanguage } from '../src/i18n/LanguageContext';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = SCREEN_WIDTH * 0.85;

const getApiUrl = () => {
  if (process.env.EXPO_PUBLIC_API_URL) return process.env.EXPO_PUBLIC_API_URL;
  if (__DEV__) {
    return Platform.OS === 'android' ? 'http://10.0.2.2:3000' : 'http://localhost:3000';
  }
  return 'http://10.103.30.198:3000';
};

interface Challenge {
  activityId: number;
  name: string;
  name_ro?: string;
  category: string;
  category_ro?: string;
  description: string;
  description_ro?: string;
  energy_level: string;
  photo?: string;
  region?: string;
  city?: string;
  challengeReason: string;
  challengeReason_ro?: string;
  distanceKm?: number;
}

interface Category {
  id: string;
  label: string;
  label_ro?: string;
  emoji: string;
  count: number;
}

interface WeatherData {
  temp: number;
  condition: string;
  emoji: string;
  display: string;
}

interface ChallengeMeTabProps {
  deviceId: string;
  onChallengeAccept: (challenge: Challenge) => void;
}

const DECLINE_REASONS = [
  { id: 'too_far', labelKey: 'challenge.decline_too_far', emoji: '📍' },
  { id: 'not_now', labelKey: 'challenge.decline_not_now', emoji: '⏰' },
  { id: 'not_for_me', labelKey: 'challenge.decline_not_for_me', emoji: '🙅' },
];

const ChallengeMeTab: React.FC<ChallengeMeTabProps> = ({ 
  deviceId, 
  onChallengeAccept 
}) => {
  const { colors: themeColors } = useTheme();
  const { t, language } = useLanguage();
  
  // Helper to get language-aware field
  const getLocalizedField = (item: Challenge, field: 'name' | 'category' | 'challengeReason') => {
    if (language === 'ro' && item[`${field}_ro` as keyof Challenge]) {
      return item[`${field}_ro` as keyof Challenge] as string;
    }
    return item[field];
  };
  
  const [todayChallenges, setTodayChallenges] = useState<Challenge[]>([]);
  const [currentChallengeIndex, setCurrentChallengeIndex] = useState(0);
  const [dayTrips, setDayTrips] = useState<Challenge[]>([]);
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [weatherSuggestion, setWeatherSuggestion] = useState<Challenge | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDeclineModal, setShowDeclineModal] = useState(false);
  const [declinedChallenge, setDeclinedChallenge] = useState<Challenge | null>(null);
  const [allChallengesCompleted, setAllChallengesCompleted] = useState(false);
  const [respondedChallenges, setRespondedChallenges] = useState<Set<number>>(new Set());
  
  const translateX = useSharedValue(0);
  const cardOpacity = useSharedValue(1);

  useEffect(() => {
    fetchAllData();
  }, [deviceId, language]);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        fetchTodayChallenges(),
        fetchDayTrips(),
        fetchWeatherWindow(),
        fetchCategories(),
      ]);
    } catch (error) {
      console.error('❌ Error fetching challenge data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTodayChallenges = async () => {
    try {
      const res = await fetch(`${getApiUrl()}/api/challenges/me?deviceId=${deviceId}&language=${language}`);
      if (res.ok) {
        const data = await res.json();
        setTodayChallenges(data.challenges || []);
      }
    } catch (error) {
      console.log('⚠️ Could not fetch today challenges');
    }
  };

  const fetchDayTrips = async () => {
    try {
      const res = await fetch(`${getApiUrl()}/api/challenges/day-trips?limit=3&language=${language}`);
      if (res.ok) {
        const data = await res.json();
        setDayTrips(data.dayTrips || []);
      }
    } catch (error) {
      console.log('⚠️ Could not fetch day trips');
    }
  };

  const fetchWeatherWindow = async () => {
    try {
      const res = await fetch(`${getApiUrl()}/api/challenges/weather-window?language=${language}`);
      if (res.ok) {
        const data = await res.json();
        setWeatherData(data.weather);
        setWeatherSuggestion(data.suggestion);
      }
    } catch (error) {
      console.log('⚠️ Could not fetch weather window');
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await fetch(`${getApiUrl()}/api/challenges/categories?language=${language}`);
      if (res.ok) {
        const data = await res.json();
        setCategories(data.categories?.slice(0, 8) || []);
      }
    } catch (error) {
      console.log('⚠️ Could not fetch categories');
    }
  };

  const handleAccept = useCallback((challenge: Challenge) => {
    fetch(`${getApiUrl()}/api/challenges/respond`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        deviceId,
        activityId: challenge.activityId,
        response: 'accepted',
        challengeReason: challenge.challengeReason,
      }),
    }).catch(console.error);

    // Mark challenge as responded
    setRespondedChallenges(prev => new Set(prev).add(challenge.activityId));
    
    // Check if all challenges have been responded to
    const newResponded = new Set(respondedChallenges).add(challenge.activityId);
    if (newResponded.size === todayChallenges.length) {
      setAllChallengesCompleted(true);
    }

    onChallengeAccept(challenge);
  }, [deviceId, onChallengeAccept, respondedChallenges, todayChallenges.length]);

  const handleDecline = useCallback((challenge: Challenge) => {
    setDeclinedChallenge(challenge);
    setShowDeclineModal(true);
  }, []);

  const submitDeclineReason = useCallback((reason: string) => {
    if (!declinedChallenge) return;

    fetch(`${getApiUrl()}/api/challenges/respond`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        deviceId,
        activityId: declinedChallenge.activityId,
        response: 'declined',
        challengeReason: declinedChallenge.challengeReason,
        declineReason: reason,
      }),
    }).catch(console.error);

    // Mark challenge as responded
    setRespondedChallenges(prev => new Set(prev).add(declinedChallenge.activityId));
    
    // Check if all challenges have been responded to
    const newResponded = new Set(respondedChallenges).add(declinedChallenge.activityId);
    if (newResponded.size === todayChallenges.length) {
      setAllChallengesCompleted(true);
    }

    setShowDeclineModal(false);
    setDeclinedChallenge(null);
    
    translateX.value = withTiming(-SCREEN_WIDTH, { duration: 200 }, () => {
      runOnJS(moveToNextChallenge)();
    });
  }, [deviceId, declinedChallenge, respondedChallenges, todayChallenges.length]);

  const moveToNextChallenge = useCallback(() => {
    translateX.value = 0;
    if (currentChallengeIndex < todayChallenges.length - 1) {
      setCurrentChallengeIndex(prev => prev + 1);
    }
  }, [currentChallengeIndex, todayChallenges.length]);

  const handleCategorySelect = useCallback(async (categoryId: string) => {
    try {
      const res = await fetch(`${getApiUrl()}/api/challenges/by-category/${categoryId}?deviceId=${deviceId}&language=${language}`);
      if (res.ok) {
        const data = await res.json();
        if (data.challenge) {
          onChallengeAccept(data.challenge);
        }
      }
    } catch (error) {
      console.error('❌ Error fetching category challenge:', error);
    }
  }, [deviceId, onChallengeAccept]);

  const panGesture = Gesture.Pan()
    .onUpdate((event) => {
      translateX.value = event.translationX;
    })
    .onEnd((event) => {
      const swipeThreshold = 80;
      
      if (event.translationX < -swipeThreshold) {
        const challenge = todayChallenges[currentChallengeIndex];
        if (challenge) {
          runOnJS(handleDecline)(challenge);
        }
      } else if (event.translationX > swipeThreshold) {
        translateX.value = withTiming(SCREEN_WIDTH, { duration: 200 }, () => {
          const challenge = todayChallenges[currentChallengeIndex];
          if (challenge) {
            runOnJS(handleAccept)(challenge);
          }
        });
      } else {
        translateX.value = withSpring(0);
      }
    });

  const cardAnimatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { rotate: `${translateX.value / 25}deg` },
    ],
    opacity: cardOpacity.value,
  }));

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#00AAFF" />
        <Text style={[styles.loadingText, { color: themeColors.text.secondary }]}>
          Loading challenges...
        </Text>
      </View>
    );
  }

  const currentChallenge = todayChallenges[currentChallengeIndex];

  return (
    <View style={styles.container}>
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: themeColors.text.primary }]}>
            ⚡ {t('challenge.today_title')}
          </Text>
          <Text style={[styles.sectionSubtitle, { color: themeColors.text.secondary }]}>
            {t('challenge.today_subtitle')}
          </Text>

          {allChallengesCompleted ? (
            <View style={styles.completedCard}>
              <Text style={[styles.completedEmoji]}>✨</Text>
              <Text style={[styles.completedTitle, { color: themeColors.text.primary }]}>
                {t('challenge.all_viewed')}
              </Text>
              <Text style={[styles.completedSubtitle, { color: themeColors.text.secondary }]}>
                {t('challenge.come_back_tomorrow')}
              </Text>
              <Text style={[styles.completedHint, { color: themeColors.text.tertiary }]}>
                {t('challenge.refresh_hint')}
              </Text>
            </View>
          ) : currentChallenge ? (
            <>
              <GestureDetector gesture={panGesture}>
                <Animated.View style={[styles.heroCard, cardAnimatedStyle]}>
                  <LinearGradient
                    colors={['#FF6B6B', '#FF8E53']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.heroGradient}
                  >
                    {currentChallenge.photo && (
                      <Image
                        source={{ uri: currentChallenge.photo }}
                        style={styles.heroImage}
                        resizeMode="cover"
                      />
                    )}
                    <View style={styles.heroOverlay}>
                      <View style={styles.challengeBadge}>
                        <Text style={styles.badgeText}>CHALLENGE {currentChallengeIndex + 1}/3</Text>
                      </View>
                      
                      <Text style={styles.heroTitle} numberOfLines={2}>
                        {getLocalizedField(currentChallenge, 'name')}
                      </Text>
                      
                      <View style={styles.reasonBox}>
                        <Text style={styles.reasonText} numberOfLines={3}>
                          {getLocalizedField(currentChallenge, 'challengeReason')}
                        </Text>
                      </View>
                      
                      <View style={styles.heroMeta}>
                        <Text style={styles.metaText}>
                          📍 {currentChallenge.region || currentChallenge.city}
                        </Text>
                        <Text style={styles.metaText}>
                          ⚡ {currentChallenge.energy_level}
                        </Text>
                      </View>
                      
                      <Text style={styles.swipeHint}>
                        👈 Swipe to pass • Swipe to accept 👉
                      </Text>
                    </View>
                  </LinearGradient>
</Animated.View>
</GestureDetector>

<View style={styles.actionButtons}>
<TouchableOpacity
style={[styles.minimalBtn, { borderColor: themeColors.border }]}
onPress={() => handleDecline(currentChallenge)}
activeOpacity={0.7}
>
<Text style={[styles.minimalBtnText, { color: themeColors.text.secondary }]}>
{t('challenge.decline')}
</Text>
</TouchableOpacity>
        
<TouchableOpacity
style={[styles.minimalBtn, styles.minimalBtnPrimary, { borderColor: themeColors.text.primary }]}
onPress={() => handleAccept(currentChallenge)}
activeOpacity={0.7}
>
<Text style={[styles.minimalBtnText, { color: themeColors.text.primary }]}>
{t('challenge.accept')}
</Text>
</TouchableOpacity>
</View>
</>
) : (
<View style={[styles.emptyCard, { backgroundColor: themeColors.surface }]}>
<Text style={[styles.emptyText, { color: themeColors.text.secondary }]}>
{t('challenge.no_challenges')}
</Text>
</View>
)}
</View>

{dayTrips.length > 0 && (
<View style={styles.section}>
<Text style={[styles.sectionTitle, { color: themeColors.text.primary }]}>
 {t('challenge.daytrip_title')}
</Text>
<Text style={[styles.sectionSubtitle, { color: themeColors.text.secondary }]}>
{t('challenge.daytrip_subtitle')}
</Text>

<ScrollView 
horizontal 
showsHorizontalScrollIndicator={false}
contentContainerStyle={styles.horizontalScroll}
>
{dayTrips.map((trip) => (
<TouchableOpacity
key={trip.activityId}
style={[styles.tripCard, { backgroundColor: themeColors.surface }]}
onPress={() => onChallengeAccept(trip)}
activeOpacity={0.8}
>
{trip.photo && (
<Image
source={{ uri: trip.photo }}
style={styles.tripImage}
resizeMode="cover"
/>
)}
<View style={styles.tripContent}>
<Text style={[styles.tripTitle, { color: themeColors.text.primary }]} numberOfLines={1}>
{getLocalizedField(trip, 'name')}
</Text>
<Text style={[styles.tripMeta, { color: themeColors.text.secondary }]}>
 {t('challenge.trip_meta')} {trip.region} • {trip.distanceKm ? `${trip.distanceKm}km` : t('challenge.trip_meta_daytrip')}
</Text>
</View>
</TouchableOpacity>
))}
</ScrollView>
</View>
)}

        {weatherData && weatherSuggestion && (
          <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: themeColors.text.primary }]}>
                🌤️ {t('challenge.weather_title')}
              </Text>
              <Text style={[styles.sectionSubtitle, { color: themeColors.text.secondary }]}>
                {t('challenge.weather_subtitle')}
              </Text>

            <TouchableOpacity
              style={[styles.weatherCard, { backgroundColor: themeColors.surface }]}
              onPress={() => onChallengeAccept(weatherSuggestion)}
              activeOpacity={0.8}
            >
              <View style={styles.weatherBadge}>
                <Text style={styles.weatherBadgeText}>{weatherData.display}</Text>
              </View>
              
              {weatherSuggestion.photo && (
                <Image
                  source={{ uri: weatherSuggestion.photo }}
                  style={styles.weatherImage}
                  resizeMode="cover"
                />
              )}
              
              <View style={styles.weatherContent}>
                <Text style={[styles.weatherTitle, { color: themeColors.text.primary }]} numberOfLines={2}>
                  {getLocalizedField(weatherSuggestion, 'name')}
                </Text>
                <Text style={[styles.weatherReason, { color: themeColors.text.secondary }]} numberOfLines={2}>
                  {getLocalizedField(weatherSuggestion, 'challengeReason')}
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        )}

        {categories.length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: themeColors.text.primary }]}>
              🎯 Challenge Me In...
            </Text>
            <Text style={[styles.sectionSubtitle, { color: themeColors.text.secondary }]}>
              Pick a category
            </Text>

            <View style={styles.categoryGrid}>
              {categories.map((category) => (
                <TouchableOpacity
                  key={category.id}
                  style={[styles.categoryChip, { backgroundColor: themeColors.surface }]}
                  onPress={() => handleCategorySelect(category.id)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.categoryEmoji}>{category.emoji}</Text>
                  <Text style={[styles.categoryLabel, { color: themeColors.text.primary }]}>
                    {language === 'ro' && category.label_ro ? category.label_ro : category.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        <View style={{ height: 120 }} />
      </ScrollView>

      <Modal
        visible={showDeclineModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowDeclineModal(false)}
      >
        <View style={styles.modalOverlay}>
          <BlurView intensity={20} tint="dark" style={StyleSheet.absoluteFill}>
            <View style={styles.modalContainer}>
              <View style={[styles.modalContent, { backgroundColor: themeColors.surface }]}>
                <Text style={[styles.modalTitle, { color: themeColors.text.primary }]}>
                  {t('challenge.why_not')}
                </Text>
                
                <View style={styles.declineOptions}>
                  {DECLINE_REASONS.map((reason) => (
                    <TouchableOpacity
                      key={reason.id}
                      style={[styles.declineOption, { borderColor: themeColors.border }]}
                      onPress={() => submitDeclineReason(reason.id)}
                    >
                      <Text style={styles.declineEmoji}>{reason.emoji}</Text>
                      <Text style={[styles.declineLabel, { color: themeColors.text.primary }]}>
                        {t(reason.labelKey as any)}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                <TouchableOpacity
                  style={styles.skipButton}
                  onPress={() => {
                    setShowDeclineModal(false);
                    moveToNextChallenge();
                  }}
                >
                  <Text style={[styles.skipText, { color: themeColors.text.secondary }]}>
                    {t('challenge.skip')}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </BlurView>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollView: { flex: 1 },
  scrollContent: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 20 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 16 },
  loadingText: { fontSize: 16 },
  section: { marginBottom: 32 },
  sectionTitle: { fontSize: 22, fontWeight: '700', marginBottom: 4 },
  sectionSubtitle: { fontSize: 14, marginBottom: 16 },
  heroCard: { width: CARD_WIDTH, height: 380, borderRadius: 20, overflow: 'hidden', alignSelf: 'center', marginBottom: 16 },
  heroGradient: { flex: 1 },
  heroImage: { ...StyleSheet.absoluteFillObject, opacity: 0.5 },
  heroOverlay: { flex: 1, padding: 20, justifyContent: 'space-between' },
  challengeBadge: { alignSelf: 'flex-start', backgroundColor: 'rgba(255, 255, 255, 0.2)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 },
  badgeText: { color: '#FFFFFF', fontSize: 11, fontWeight: '700', letterSpacing: 1 },
  heroTitle: { fontSize: 26, fontWeight: '700', color: '#FFFFFF', textAlign: 'center', marginTop: 20 },
  reasonBox: { backgroundColor: 'rgba(255, 255, 255, 0.15)', padding: 14, borderRadius: 14, marginTop: 16 },
  reasonText: { color: '#FFFFFF', fontSize: 15, fontWeight: '600', textAlign: 'center' },
  heroMeta: { flexDirection: 'row', justifyContent: 'center', gap: 16, marginTop: 12 },
  metaText: { color: 'rgba(255, 255, 255, 0.9)', fontSize: 13 },
  swipeHint: { color: 'rgba(255, 255, 255, 0.5)', fontSize: 11, textAlign: 'center', marginTop: 8 },
  actionButtons: { flexDirection: 'row', justifyContent: 'center', gap: 12, marginTop: 20 },
  minimalBtn: { paddingHorizontal: 24, paddingVertical: 12, borderRadius: 8, borderWidth: 1, minWidth: 100, alignItems: 'center' },
  minimalBtnPrimary: { backgroundColor: 'rgba(255, 255, 255, 0.05)' },
  minimalBtnText: { fontSize: 14, fontWeight: '500' },
  emptyCard: { padding: 40, borderRadius: 16, alignItems: 'center' },
  emptyText: { fontSize: 15 },
  completedCard: { padding: 50, borderRadius: 16, alignItems: 'center', marginTop: 20 },
  completedEmoji: { fontSize: 48, marginBottom: 16 },
  completedTitle: { fontSize: 20, fontWeight: '600', marginBottom: 8, textAlign: 'center' },
  completedSubtitle: { fontSize: 15, marginBottom: 8, textAlign: 'center' },
  completedHint: { fontSize: 12, textAlign: 'center', marginTop: 4 },
  horizontalScroll: { paddingRight: 20, gap: 12 },
  tripCard: { width: 180, borderRadius: 14, overflow: 'hidden' },
  tripImage: { width: '100%', height: 110 },
  tripContent: { padding: 12 },
  tripTitle: { fontSize: 15, fontWeight: '600' },
  tripMeta: { fontSize: 12, marginTop: 4 },
  weatherCard: { borderRadius: 16, overflow: 'hidden' },
  weatherBadge: { position: 'absolute', top: 12, right: 12, backgroundColor: 'rgba(0, 0, 0, 0.5)', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 10, zIndex: 1 },
  weatherBadgeText: { color: '#FFFFFF', fontSize: 13, fontWeight: '600' },
  weatherImage: { width: '100%', height: 140 },
  weatherContent: { padding: 14 },
  weatherTitle: { fontSize: 17, fontWeight: '600' },
  weatherReason: { fontSize: 13, marginTop: 4 },
  categoryGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  categoryChip: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 10, borderRadius: 18, gap: 6 },
  categoryEmoji: { fontSize: 18 },
  categoryLabel: { fontSize: 13, fontWeight: '500' },
  modalOverlay: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0, 0, 0, 0.5)' },
  modalContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  modalContent: { padding: 20, borderRadius: 20, minWidth: 260, alignItems: 'center' },
  modalTitle: { fontSize: 18, fontWeight: '600', marginBottom: 16 },
  declineOptions: { flexDirection: 'row', gap: 10 },
  declineOption: { alignItems: 'center', padding: 14, borderRadius: 14, borderWidth: 1, minWidth: 75 },
  declineEmoji: { fontSize: 22, marginBottom: 4 },
  declineLabel: { fontSize: 11, fontWeight: '500' },
  skipButton: { marginTop: 14, padding: 8 },
  skipText: { fontSize: 13 },
});

export default ChallengeMeTab;
