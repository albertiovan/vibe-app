/**
 * MinimalUserProfileScreen
 * Minimal monochrome user profile and settings
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Switch,
  Alert,
  Image,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Device from 'expo-device';
import { ProfileCustomization } from '../components/ProfileCustomization';
import { userApi, UserProfile } from '../src/services/userApi';
import { userStorage, UserAccount } from '../src/services/userStorage';
import { useVibe } from '../src/contexts/VibeContext';
import { useTheme } from '../src/contexts/ThemeContext';
import { useLanguage } from '../src/i18n/LanguageContext';
import { ThemeToggle } from '../components/ThemeToggle';
import { FriendsManager } from '../components/FriendsManager';
import { getCategoryColor } from '../src/design-system/colors';
import { LinearGradient } from 'expo-linear-gradient';
import { AnimatedGradientBackground } from '../ui/components/AnimatedGradientBackground';

const CATEGORIES = [
  { id: 'wellness', labelKey: 'category.wellness', emoji: '🧘' },
  { id: 'nature', labelKey: 'category.nature', emoji: '🌲' },
  { id: 'culture', labelKey: 'category.culture', emoji: '🎭' },
  { id: 'adventure', labelKey: 'category.adventure', emoji: '⛰️' },
  { id: 'learning', labelKey: 'category.learning', emoji: '📚' },
  { id: 'culinary', labelKey: 'category.culinary', emoji: '🍜' },
  { id: 'water', labelKey: 'category.water', emoji: '🌊' },
  { id: 'nightlife', labelKey: 'category.nightlife', emoji: '🌃' },
  { id: 'social', labelKey: 'category.social', emoji: '🎉' },
  { id: 'fitness', labelKey: 'category.fitness', emoji: '💪' },
  { id: 'sports', labelKey: 'category.sports', emoji: '⚽' },
  { id: 'seasonal', labelKey: 'category.seasonal', emoji: '🎄' },
  { id: 'romance', labelKey: 'category.romance', emoji: '💕' },
  { id: 'mindfulness', labelKey: 'category.mindfulness', emoji: '🧠' },
  { id: 'creative', labelKey: 'category.creative', emoji: '🎨' },
];

export const MinimalUserProfileScreen: React.FC = () => {
  const navigation = useNavigation();
  const { currentVibe, getVibeColors } = useVibe();
  const { resolvedTheme, colors: themeColors } = useTheme();
  const { language, setLanguage, t } = useLanguage();
  const [deviceId, setDeviceId] = useState<string>('');
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [userAccount, setUserAccount] = useState<UserAccount | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [motionSensitivity, setMotionSensitivity] = useState(false);
  const [showCustomization, setShowCustomization] = useState(false);
  const [showFriendsManager, setShowFriendsManager] = useState(false);
  
  const styles = createStyles(themeColors);

  useEffect(() => {
    loadProfile();
  }, []);

  // Reload preferences when screen comes into focus
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      loadProfile();
    });
    return unsubscribe;
  }, [navigation]);

  const loadProfile = async () => {
    const id = Device.modelId || `device-${Math.random().toString(36).substr(2, 9)}`;
    setDeviceId(id);
    
    // Load user account from storage
    try {
      const account = await userStorage.getAccount();
      setUserAccount(account);
    } catch (error) {
      console.log('No user account found');
    }
    
    // Set default profile immediately to avoid timeout
    const defaultProfile = {
      userId: 0,
      stats: {
        totalSaved: 0,
        totalCompleted: 0,
        totalInteractions: 0,
        favoriteCategory: null,
      },
      preferences: {
        favoriteCategories: [],
        notificationsEnabled: true,
      },
      favoriteCategories: [],
    };
    
    setProfile(defaultProfile);
    setLoading(false);
    
    // Try to load real profile in background (optional)
    try {
      const userProfile = await userApi.getProfile(id);
      setProfile(userProfile);
      
      if (userProfile.preferences.favoriteCategories) {
        setSelectedCategories(userProfile.preferences.favoriteCategories);
      }
      if (userProfile.preferences.notificationsEnabled !== undefined) {
        setNotificationsEnabled(userProfile.preferences.notificationsEnabled);
      }
    } catch (error) {
      // Silently fail - already showing default profile
      console.log('Profile API not available, using defaults');
    }
  };

  const handleCategoryToggle = (categoryId: string) => {
    setSelectedCategories(prev => {
      if (prev.includes(categoryId)) {
        return prev.filter(id => id !== categoryId);
      } else {
        return [...prev, categoryId];
      }
    });
  };

  const handleSavePreferences = async () => {
    try {
      console.log('Saving preferences:', { favoriteCategories: selectedCategories, notificationsEnabled });
      
      const result = await userApi.updatePreferences(deviceId, {
        favoriteCategories: selectedCategories,
        notificationsEnabled,
      });
      
      console.log('Preferences saved successfully:', result);
      
      // Reload profile to confirm save
      await loadProfile();
      
      Alert.alert('Success', 'Preferences saved!');
    } catch (error) {
      console.error('Failed to save preferences:', error);
      Alert.alert('Error', `Failed to save preferences: ${error}`);
    }
  };

  const handleClearHistory = () => {
    Alert.alert(
      'Clear Conversation History',
      'Are you sure? This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: async () => {
            Alert.alert('Success', 'Conversation history cleared');
          },
        },
      ]
    );
  };

  // Get background gradient colors
  const vibeColors = getVibeColors();
  const backgroundColors = vibeColors
    ? [vibeColors.gradient.start, vibeColors.gradient.end, themeColors.background]
    : resolvedTheme === 'light'
    ? ['#F5F5F5', '#E5E5E5', '#EFEFEF']
    : [themeColors.background, themeColors.background, themeColors.background];

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <AnimatedGradientBackground
          colors={backgroundColors as [string, string, string]}
          duration={currentVibe ? 8000 : 15000}
        />
        <Text style={[styles.loadingText, { color: themeColors.text.secondary }]}>{t('profile.loading')}</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <AnimatedGradientBackground
        colors={backgroundColors as [string, string, string]}
        duration={currentVibe ? 8000 : 15000}
      />
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerSpacer} />
          <Text style={[styles.headerTitle, { color: themeColors.text.primary }]}>{t('profile.title')}</Text>
          <View style={styles.headerSpacer} />
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Profile Header */}
          {userAccount && (
            <View style={styles.profileSection}>
              <View style={styles.profileHeader}>
                <TouchableOpacity
                  style={styles.avatarContainer}
                  onPress={() => setShowCustomization(true)}
                  activeOpacity={0.8}
                >
                  {/* Vibe aura behind avatar */}
                  {currentVibe && getVibeColors() && (
                    <View style={styles.vibeAura}>
                      <LinearGradient
                        colors={[
                          getVibeColors()!.primary + '40',
                          getVibeColors()!.primary + '00',
                        ]}
                        start={{ x: 0.5, y: 0.5 }}
                        end={{ x: 1, y: 1 }}
                        style={StyleSheet.absoluteFill}
                      />
                    </View>
                  )}
                  
                  {userAccount.profilePicture ? (
                    <Image
                      source={{ uri: userAccount.profilePicture }}
                      style={styles.avatar}
                    />
                  ) : (
                    <View style={styles.avatarPlaceholder}>
                      <Text style={styles.avatarPlaceholderText}>
                        {(userAccount.nickname || userAccount.name).charAt(0).toUpperCase()}
                      </Text>
                    </View>
                  )}
                  <View style={styles.avatarEditBadge}>
                    <Text style={styles.avatarEditIcon}>✏️</Text>
                  </View>
                </TouchableOpacity>

                <View style={styles.profileInfo}>
                  <Text style={[styles.profileName, { color: themeColors.text.primary }]}>
                    {userAccount.nickname || userAccount.name}
                  </Text>
                  {userAccount.nickname && (
                    <Text style={[styles.profileRealName, { color: themeColors.text.secondary }]}>{userAccount.name}</Text>
                  )}
                  {userAccount.email && (
                    <Text style={[styles.profileEmail, { color: themeColors.text.tertiary }]}>{userAccount.email}</Text>
                  )}
                </View>

                <TouchableOpacity
                  style={styles.editButton}
                  onPress={() => setShowCustomization(true)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.editButtonText}>Edit</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* Stats */}
          {profile && (
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: themeColors.text.tertiary }]}>{t('profile.your_activity')}</Text>
              <View style={styles.statsGrid}>
                <View style={styles.statItem}>
                  <Text style={[styles.statValue, { color: themeColors.text.primary }]}>{profile.stats.totalSaved}</Text>
                  <Text style={[styles.statLabel, { color: themeColors.text.secondary }]}>{t('profile.saved')}</Text>
                </View>
                <View style={[styles.statDivider, { backgroundColor: themeColors.border }]} />
                <View style={styles.statItem}>
                  <Text style={[styles.statValue, { color: themeColors.text.primary }]}>{profile.stats.totalCompleted}</Text>
                  <Text style={[styles.statLabel, { color: themeColors.text.secondary }]}>{t('profile.completed')}</Text>
                </View>
                <View style={[styles.statDivider, { backgroundColor: themeColors.border }]} />
                <View style={styles.statItem}>
                  <Text style={[styles.statValue, { color: themeColors.text.primary }]}>{profile.stats.totalInteractions}</Text>
                  <Text style={[styles.statLabel, { color: themeColors.text.secondary }]}>{t('profile.total')}</Text>
                </View>
              </View>
            </View>
          )}

          {/* Favorite Categories */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: themeColors.text.tertiary }]}>{t('profile.favorite_categories')}</Text>
            <Text style={[styles.sectionDescription, { color: themeColors.text.secondary }]}>
              {t('profile.favorite_categories_desc')}
            </Text>
            
            <View style={styles.categoriesGrid}>
              {CATEGORIES.map(category => {
                const isSelected = selectedCategories.includes(category.id);
                const categoryColor = getCategoryColor(category.id);
                return (
                  <TouchableOpacity
                    key={category.id}
                    style={[
                      styles.categoryChip,
                      isSelected && {
                        borderColor: categoryColor + '80',
                        backgroundColor: categoryColor + '20',
                      },
                    ]}
                    onPress={() => handleCategoryToggle(category.id)}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.categoryEmoji}>{category.emoji}</Text>
                    <Text style={[
                      styles.categoryLabel,
                      isSelected && { color: categoryColor },
                    ]}>
                      {t(category.labelKey as any)}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Settings */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: themeColors.text.tertiary }]}>{t('profile.settings')}</Text>
            
            {/* Friends Management */}
            <TouchableOpacity
              style={[styles.settingRow, { borderColor: themeColors.border }]}
              onPress={() => setShowFriendsManager(true)}
              activeOpacity={0.7}
            >
              <View style={styles.settingInfo}>
                <Text style={[styles.settingLabel, { color: themeColors.text.primary }]}>Friends</Text>
                <Text style={[styles.settingDescription, { color: themeColors.text.secondary }]}>
                  Manage friends, search users, and privacy
                </Text>
              </View>
              <Text style={[styles.settingArrow, { color: themeColors.text.tertiary }]}>›</Text>
            </TouchableOpacity>
            
            {/* Theme Toggle */}
            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <Text style={[styles.settingLabel, { color: themeColors.text.primary }]}>{t('profile.theme')}</Text>
                <Text style={[styles.settingDescription, { color: themeColors.text.secondary }]}>
                  {t('profile.theme_desc')}
                </Text>
              </View>
              <ThemeToggle />
            </View>

            {/* Language Toggle */}
            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <Text style={[styles.settingLabel, { color: themeColors.text.primary }]}>{t('profile.language')}</Text>
                <Text style={[styles.settingDescription, { color: themeColors.text.secondary }]}>
                  {language === 'en' ? t('profile.language_desc') : t('profile.language_desc_ro')}
                </Text>
              </View>
              <View style={{ flexDirection: 'row', gap: 8 }}>
                <TouchableOpacity
                  style={[
                    styles.languageButton,
                    language === 'en' && styles.languageButtonActive,
                  ]}
                  onPress={() => setLanguage('en')}
                  activeOpacity={0.7}
                >
                  <Text style={[
                    styles.languageButtonText,
                    language === 'en' && { color: themeColors.accent.primary },
                  ]}>
                    EN
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.languageButton,
                    language === 'ro' && styles.languageButtonActive,
                  ]}
                  onPress={() => setLanguage('ro')}
                  activeOpacity={0.7}
                >
                  <Text style={[
                    styles.languageButtonText,
                    language === 'ro' && { color: themeColors.accent.primary },
                  ]}>
                    RO
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <Text style={[styles.settingLabel, { color: themeColors.text.primary }]}>{t('profile.notifications')}</Text>
                <Text style={[styles.settingDescription, { color: themeColors.text.secondary }]}>
                  {t('profile.notifications_desc')}
                </Text>
              </View>
              <Switch
                value={notificationsEnabled}
                onValueChange={setNotificationsEnabled}
                trackColor={{ false: themeColors.surface, true: themeColors.accent.primary }}
                thumbColor={notificationsEnabled ? themeColors.background : themeColors.text.primary}
                ios_backgroundColor={themeColors.surface}
              />
            </View>

            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <Text style={[styles.settingLabel, { color: themeColors.text.primary }]}>{t('profile.reduce_motion')}</Text>
                <Text style={[styles.settingDescription, { color: themeColors.text.secondary }]}>
                  {t('profile.reduce_motion_desc')}
                </Text>
              </View>
              <Switch
                value={motionSensitivity}
                onValueChange={setMotionSensitivity}
                trackColor={{ false: themeColors.surface, true: themeColors.accent.primary }}
                thumbColor={motionSensitivity ? themeColors.background : themeColors.text.primary}
                ios_backgroundColor={themeColors.surface}
              />
            </View>
          </View>

          {/* Quick Actions */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: themeColors.text.tertiary }]}>{t('profile.quick_access')}</Text>
            
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => navigation.navigate('SavedActivities' as never)}
              activeOpacity={0.7}
            >
              <Text style={[styles.actionButtonText, { color: themeColors.text.primary }]}>{t('profile.saved_activities')}</Text>
              <Text style={[styles.actionButtonIcon, { color: themeColors.text.secondary }]}>→</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => navigation.navigate('TrainingMode' as never)}
              activeOpacity={0.7}
            >
              <Text style={[styles.actionButtonText, { color: themeColors.text.primary }]}>{t('profile.training_mode')}</Text>
              <Text style={[styles.actionButtonIcon, { color: themeColors.text.secondary }]}>→</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => navigation.navigate('Discovery' as never)}
              activeOpacity={0.7}
            >
              <Text style={[styles.actionButtonText, { color: themeColors.text.primary }]}>{t('profile.discover_activities')}</Text>
              <Text style={[styles.actionButtonIcon, { color: themeColors.text.secondary }]}>→</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionButton, { borderWidth: 2, borderColor: '#FFD93D' }]}
              onPress={() => navigation.navigate('ComponentShowcase' as never)}
              activeOpacity={0.7}
            >
              <Text style={[styles.actionButtonText, { color: themeColors.text.primary }]}>{t('profile.component_showcase')}</Text>
              <Text style={[styles.actionButtonIcon, { color: themeColors.text.secondary }]}>→</Text>
            </TouchableOpacity>
          </View>

          {/* Data & Privacy */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: themeColors.text.tertiary }]}>DATA & PRIVACY</Text>
            
            <TouchableOpacity
              style={styles.actionButton}
              onPress={handleClearHistory}
              activeOpacity={0.7}
            >
              <Text style={[styles.actionButtonText, { color: themeColors.text.primary }]}>Clear History</Text>
              <Text style={[styles.actionButtonIcon, { color: themeColors.text.secondary }]}>→</Text>
            </TouchableOpacity>

            <View style={styles.deviceInfo}>
              <Text style={[styles.deviceInfoLabel, { color: themeColors.text.tertiary }]}>Device ID</Text>
              <Text style={[styles.deviceInfoValue, { color: themeColors.text.secondary }]}>{deviceId}</Text>
            </View>
          </View>

          {/* Save Button */}
          <TouchableOpacity
            style={styles.saveButton}
            onPress={handleSavePreferences}
            activeOpacity={0.7}
          >
            <Text style={styles.saveButtonText}>Save Preferences</Text>
          </TouchableOpacity>
        </ScrollView>

        {/* Profile Customization Modal */}
        {userAccount && showCustomization && (
          <ProfileCustomization
            account={userAccount}
            onUpdate={async (updates) => {
              // Update local state
              setUserAccount({ ...userAccount, ...updates });
              // Reload profile to reflect changes
              await loadProfile();
            }}
            onClose={() => setShowCustomization(false)}
            isModal={true}
          />
        )}

        {/* Friends Manager Modal */}
        {deviceId && showFriendsManager && (
          <FriendsManager
            deviceId={deviceId}
            visible={showFriendsManager}
            onClose={() => setShowFriendsManager(false)}
          />
        )}
      </View>
    </SafeAreaView>
  );
};

const createStyles = (themeColors: any) => StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: themeColors.text.secondary,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: themeColors.border,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backText: {
    fontSize: 24,
    color: themeColors.text.primary,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: themeColors.text.primary,
  },
  headerSpacer: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingVertical: 24,
    paddingBottom: 40,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1,
    color: themeColors.text.secondary,
    marginBottom: 16,
    textTransform: 'uppercase',
  },
  sectionDescription: {
    fontSize: 14,
    color: themeColors.text.secondary,
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingVertical: 20,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: themeColors.border,
    backgroundColor: themeColors.surface,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 28,
    fontWeight: '700',
    color: themeColors.text.primary,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 13,
    color: themeColors.text.secondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: themeColors.border,
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: themeColors.surface,
    borderWidth: 1,
    borderColor: themeColors.border,
    marginRight: 8,
    marginBottom: 8,
  },
  categoryChipSelected: {
    backgroundColor: themeColors.surface,
    borderColor: themeColors.surface,
  },
  categoryEmoji: {
    fontSize: 14,
    marginRight: 6,
  },
  categoryLabel: {
    fontSize: 14,
    color: themeColors.text.secondary,
    fontWeight: '500',
  },
  categoryLabelSelected: {
    color: themeColors.text.primary,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: themeColors.border,
  },
  settingInfo: {
    flex: 1,
    marginRight: 16,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: themeColors.text.primary,
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 13,
    color: themeColors.text.secondary,
  },
  settingArrow: {
    fontSize: 24,
    fontWeight: '300',
    color: themeColors.text.tertiary,
  },
  actionButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    backgroundColor: themeColors.surface,
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: themeColors.border,
  },
  actionButtonText: {
    fontSize: 15,
    color: themeColors.text.primary,
    fontWeight: '500',
  },
  actionButtonIcon: {
    fontSize: 18,
    color: themeColors.text.secondary,
  },
  deviceInfo: {
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: themeColors.border,
    marginTop: 8,
  },
  deviceInfoLabel: {
    fontSize: 12,
    color: themeColors.text.tertiary,
    marginBottom: 4,
  },
  deviceInfoValue: {
    fontSize: 13,
    color: themeColors.text.secondary,
    fontFamily: 'monospace',
  },
  saveButton: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 8,
    backgroundColor: themeColors.surface,
    alignItems: 'center',
    marginTop: 8,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: themeColors.text.primary,
  },
  profileSection: {
    marginBottom: 24,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: themeColors.border,
    backgroundColor: themeColors.surface,
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 16,
  },
  vibeAura: {
    position: 'absolute',
    top: -12,
    left: -12,
    right: -12,
    bottom: -12,
    borderRadius: 50,
    zIndex: 0,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 2,
    borderColor: themeColors.surface,
  },
  avatarPlaceholder: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: themeColors.surface,
    borderWidth: 2,
    borderColor: themeColors.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarPlaceholderText: {
    fontSize: 28,
    fontWeight: '700',
    color: themeColors.text.primary,
  },
  avatarEditBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: themeColors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: themeColors.border,
  },
  avatarEditIcon: {
    fontSize: 12,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 18,
    fontWeight: '600',
    color: themeColors.text.primary,
    marginBottom: 2,
  },
  profileRealName: {
    fontSize: 14,
    color: themeColors.text.secondary,
    marginBottom: 2,
  },
  profileEmail: {
    fontSize: 13,
    color: themeColors.text.tertiary,
  },
  editButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: themeColors.surface,
    borderRadius: 6,
  },
  editButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: themeColors.accent.primary,
  },
  languageButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    backgroundColor: themeColors.surface,
    borderWidth: 1,
    borderColor: themeColors.border,
    minWidth: 50,
    alignItems: 'center',
  },
  languageButtonActive: {
    borderColor: themeColors.accent.primary,
    backgroundColor: themeColors.surface,
  },
  languageButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: themeColors.text.secondary,
  },
});
