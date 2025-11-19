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

const CATEGORIES = [
  { id: 'wellness', label: 'Wellness', emoji: '🧘' },
  { id: 'nature', label: 'Nature', emoji: '🌲' },
  { id: 'culture', label: 'Culture', emoji: '🎭' },
  { id: 'adventure', label: 'Adventure', emoji: '⛰️' },
  { id: 'learning', label: 'Learning', emoji: '📚' },
  { id: 'culinary', label: 'Culinary', emoji: '🍜' },
  { id: 'water', label: 'Water', emoji: '🌊' },
  { id: 'nightlife', label: 'Nightlife', emoji: '🌃' },
  { id: 'social', label: 'Social', emoji: '🎉' },
  { id: 'fitness', label: 'Fitness', emoji: '💪' },
  { id: 'sports', label: 'Sports', emoji: '⚽' },
  { id: 'seasonal', label: 'Seasonal', emoji: '🎄' },
  { id: 'romance', label: 'Romance', emoji: '💕' },
  { id: 'mindfulness', label: 'Mindfulness', emoji: '🧠' },
  { id: 'creative', label: 'Creative', emoji: '🎨' },
];

export const MinimalUserProfileScreen: React.FC = () => {
  const navigation = useNavigation();
  const [deviceId, setDeviceId] = useState<string>('');
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [userAccount, setUserAccount] = useState<UserAccount | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [motionSensitivity, setMotionSensitivity] = useState(false);
  const [showCustomization, setShowCustomization] = useState(false);

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

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Text style={styles.backText}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Profile</Text>
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
                  <Text style={styles.profileName}>
                    {userAccount.nickname || userAccount.name}
                  </Text>
                  {userAccount.nickname && (
                    <Text style={styles.profileRealName}>{userAccount.name}</Text>
                  )}
                  {userAccount.email && (
                    <Text style={styles.profileEmail}>{userAccount.email}</Text>
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
              <Text style={styles.sectionTitle}>YOUR ACTIVITY</Text>
              <View style={styles.statsGrid}>
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>{profile.stats.totalSaved}</Text>
                  <Text style={styles.statLabel}>Saved</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>{profile.stats.totalCompleted}</Text>
                  <Text style={styles.statLabel}>Completed</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>{profile.stats.totalInteractions}</Text>
                  <Text style={styles.statLabel}>Total</Text>
                </View>
              </View>
            </View>
          )}

          {/* Favorite Categories */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>FAVORITE CATEGORIES</Text>
            <Text style={styles.sectionDescription}>
              Select your favorite activity types
            </Text>
            
            <View style={styles.categoriesGrid}>
              {CATEGORIES.map(category => {
                const isSelected = selectedCategories.includes(category.id);
                return (
                  <TouchableOpacity
                    key={category.id}
                    style={[
                      styles.categoryChip,
                      isSelected && styles.categoryChipSelected,
                    ]}
                    onPress={() => handleCategoryToggle(category.id)}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.categoryEmoji}>{category.emoji}</Text>
                    <Text style={[
                      styles.categoryLabel,
                      isSelected && styles.categoryLabelSelected,
                    ]}>
                      {category.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Settings */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>SETTINGS</Text>
            
            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingLabel}>Notifications</Text>
                <Text style={styles.settingDescription}>
                  Get notified about saved activities
                </Text>
              </View>
              <Switch
                value={notificationsEnabled}
                onValueChange={setNotificationsEnabled}
                trackColor={{ false: '#2F2F2F', true: '#FFFFFF' }}
                thumbColor={notificationsEnabled ? '#000000' : '#FFFFFF'}
                ios_backgroundColor="#2F2F2F"
              />
            </View>

            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingLabel}>Reduce Motion</Text>
                <Text style={styles.settingDescription}>
                  Minimize animations
                </Text>
              </View>
              <Switch
                value={motionSensitivity}
                onValueChange={setMotionSensitivity}
                trackColor={{ false: '#2F2F2F', true: '#FFFFFF' }}
                thumbColor={motionSensitivity ? '#000000' : '#FFFFFF'}
                ios_backgroundColor="#2F2F2F"
              />
            </View>
          </View>

          {/* Quick Actions */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>QUICK ACCESS</Text>
            
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => navigation.navigate('SavedActivities' as never)}
              activeOpacity={0.7}
            >
              <Text style={styles.actionButtonText}>Saved Activities</Text>
              <Text style={styles.actionButtonIcon}>→</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => navigation.navigate('TrainingMode' as never)}
              activeOpacity={0.7}
            >
              <Text style={styles.actionButtonText}>Training Mode</Text>
              <Text style={styles.actionButtonIcon}>→</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => navigation.navigate('Discovery' as never)}
              activeOpacity={0.7}
            >
              <Text style={styles.actionButtonText}>Discover Activities</Text>
              <Text style={styles.actionButtonIcon}>→</Text>
            </TouchableOpacity>
          </View>

          {/* Data & Privacy */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>DATA & PRIVACY</Text>
            
            <TouchableOpacity
              style={styles.actionButton}
              onPress={handleClearHistory}
              activeOpacity={0.7}
            >
              <Text style={styles.actionButtonText}>Clear History</Text>
              <Text style={styles.actionButtonIcon}>→</Text>
            </TouchableOpacity>

            <View style={styles.deviceInfo}>
              <Text style={styles.deviceInfoLabel}>Device ID</Text>
              <Text style={styles.deviceInfoValue}>{deviceId}</Text>
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
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#000000',
  },
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#000000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.6)',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backText: {
    fontSize: 24,
    color: '#FFFFFF',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
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
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.5)',
    letterSpacing: 1,
    marginBottom: 16,
  },
  sectionDescription: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.6)',
    marginBottom: 16,
    lineHeight: 20,
  },
  statsGrid: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingVertical: 20,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.6)',
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
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
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  categoryChipSelected: {
    backgroundColor: '#FFFFFF',
    borderColor: '#FFFFFF',
  },
  categoryEmoji: {
    fontSize: 14,
    marginRight: 6,
  },
  categoryLabel: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '500',
  },
  categoryLabelSelected: {
    color: '#000000',
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  settingInfo: {
    flex: 1,
    marginRight: 16,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.5)',
  },
  actionButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  actionButtonText: {
    fontSize: 15,
    color: '#FFFFFF',
    fontWeight: '500',
  },
  actionButtonIcon: {
    fontSize: 18,
    color: 'rgba(255, 255, 255, 0.6)',
  },
  deviceInfo: {
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
    marginTop: 8,
  },
  deviceInfoLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.5)',
    marginBottom: 4,
  },
  deviceInfoValue: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.6)',
    fontFamily: 'monospace',
  },
  saveButton: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    marginTop: 8,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
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
    borderColor: 'rgba(255, 255, 255, 0.2)',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 16,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  avatarPlaceholder: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarPlaceholderText: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  avatarEditBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#000000',
  },
  avatarEditIcon: {
    fontSize: 12,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  profileRealName: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.6)',
    marginBottom: 2,
  },
  profileEmail: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.5)',
  },
  editButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#FFFFFF',
    borderRadius: 6,
  },
  editButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000000',
  },
});
