/**
 * UserProfileScreen
 * User profile, preferences, and settings
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
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Device from 'expo-device';
import { GlassCard } from '../components/design-system/GlassCard';
import { GradientButton } from '../components/design-system/GradientButton';
import { userApi, UserProfile } from '../src/services/userApi';
import { colors, getTimeGradient } from '../src/design-system/colors';
import { tokens } from '../src/design-system/tokens';

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

export const UserProfileScreen: React.FC = () => {
  const navigation = useNavigation();
  const [deviceId, setDeviceId] = useState<string>('');
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [motionSensitivity, setMotionSensitivity] = useState(false);
  
  const gradient = getTimeGradient();

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const id = Device.modelId || `device-${Math.random().toString(36).substr(2, 9)}`;
      setDeviceId(id);
      
      const userProfile = await userApi.getProfile(id);
      setProfile(userProfile);
      
      // Load preferences
      if (userProfile.preferences.favoriteCategories) {
        setSelectedCategories(userProfile.preferences.favoriteCategories);
      }
      if (userProfile.preferences.notificationsEnabled !== undefined) {
        setNotificationsEnabled(userProfile.preferences.notificationsEnabled);
      }
      
    } catch (error) {
      console.error('Failed to load profile:', error);
    } finally {
      setLoading(false);
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
      await userApi.updatePreferences(deviceId, {
        favoriteCategories: selectedCategories,
        notificationsEnabled,
      });
      
      Alert.alert('Success', 'Preferences saved!');
    } catch (error) {
      console.error('Failed to save preferences:', error);
      Alert.alert('Error', 'Failed to save preferences');
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
            // TODO: Implement clear history API
            Alert.alert('Success', 'Conversation history cleared');
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading profile...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Background gradient */}
      <LinearGradient
        colors={[gradient.start, gradient.end]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      >
        <View style={[StyleSheet.absoluteFill, { opacity: 0.03 }]} />
      </LinearGradient>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Profile & Settings</Text>
        </View>

        {/* Stats Card */}
        {profile && (
          <GlassCard style={styles.statsCard} padding="lg" radius="md">
            <Text style={styles.sectionTitle}>Your Activity</Text>
            <View style={styles.statsGrid}>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{profile.stats.totalSaved}</Text>
                <Text style={styles.statLabel}>Saved</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{profile.stats.totalCompleted}</Text>
                <Text style={styles.statLabel}>Completed</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{profile.stats.totalInteractions}</Text>
                <Text style={styles.statLabel}>Total</Text>
              </View>
            </View>
            
            {profile.stats.favoriteCategory && (
              <View style={styles.favoriteCategory}>
                <Text style={styles.favoriteCategoryLabel}>Favorite:</Text>
                <Text style={styles.favoriteCategoryValue}>
                  {profile.stats.favoriteCategory}
                </Text>
              </View>
            )}
          </GlassCard>
        )}

        {/* Favorite Categories */}
        <GlassCard style={styles.section} padding="lg" radius="md">
          <Text style={styles.sectionTitle}>Favorite Categories</Text>
          <Text style={styles.sectionDescription}>
            Select your favorite activity types to get better recommendations
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
        </GlassCard>

        {/* App Settings */}
        <GlassCard style={styles.section} padding="lg" radius="md">
          <Text style={styles.sectionTitle}>App Settings</Text>
          
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
              trackColor={{ false: '#3e3e3e', true: colors.accent.primary }}
              thumbColor="#fff"
            />
          </View>

          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Reduce Motion</Text>
              <Text style={styles.settingDescription}>
                Minimize animations for accessibility
              </Text>
            </View>
            <Switch
              value={motionSensitivity}
              onValueChange={setMotionSensitivity}
              trackColor={{ false: '#3e3e3e', true: colors.accent.primary }}
              thumbColor="#fff"
            />
          </View>
        </GlassCard>

        {/* Quick Actions */}
        <GlassCard style={styles.section} padding="lg" radius="md">
          <Text style={styles.sectionTitle}>Quick Access</Text>
          
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => navigation.navigate('SavedActivities' as never)}
            activeOpacity={0.7}
          >
            <Text style={styles.actionButtonText}>View Saved Activities</Text>
            <Text style={styles.actionButtonIcon}>💾 →</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => navigation.navigate('Discovery' as never)}
            activeOpacity={0.7}
          >
            <Text style={styles.actionButtonText}>Discover Activities</Text>
            <Text style={styles.actionButtonIcon}>🔍 →</Text>
          </TouchableOpacity>
        </GlassCard>

        {/* Actions */}
        <GlassCard style={styles.section} padding="lg" radius="md">
          <Text style={styles.sectionTitle}>Data & Privacy</Text>
          
          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleClearHistory}
            activeOpacity={0.7}
          >
            <Text style={styles.actionButtonText}>Clear Conversation History</Text>
            <Text style={styles.actionButtonIcon}>🗑️</Text>
          </TouchableOpacity>

          <View style={styles.deviceInfo}>
            <Text style={styles.deviceInfoLabel}>Device ID:</Text>
            <Text style={styles.deviceInfoValue}>{deviceId}</Text>
          </View>
        </GlassCard>

        {/* About */}
        <GlassCard style={styles.section} padding="lg" radius="md">
          <Text style={styles.sectionTitle}>About</Text>
          <Text style={styles.aboutText}>
            Vibe App v1.0.0{'\n'}
            AI-powered lifestyle recommendations
          </Text>
        </GlassCard>

        {/* Save Button */}
        <GradientButton
          title="Save Preferences"
          onPress={handleSavePreferences}
          size="lg"
          style={styles.saveButton}
        />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.base.canvas,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: colors.base.canvas,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: tokens.typography.fontSize.md,
    color: colors.text.secondary,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: tokens.spacing.lg,
    paddingTop: tokens.spacing.xl,
    paddingBottom: tokens.spacing.xxl,
  },
  header: {
    marginBottom: tokens.spacing.xl,
  },
  headerTitle: {
    fontSize: tokens.typography.fontSize.xxl,
    fontWeight: tokens.typography.fontWeight.bold,
    color: colors.text.primary,
  },
  statsCard: {
    marginBottom: tokens.spacing.lg,
  },
  sectionTitle: {
    fontSize: tokens.typography.fontSize.lg,
    fontWeight: tokens.typography.fontWeight.bold,
    color: colors.text.primary,
    marginBottom: tokens.spacing.sm,
  },
  sectionDescription: {
    fontSize: tokens.typography.fontSize.sm,
    color: colors.text.secondary,
    marginBottom: tokens.spacing.md,
    lineHeight: tokens.typography.fontSize.sm * tokens.typography.lineHeight.relaxed,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: tokens.spacing.md,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 32,
    fontWeight: tokens.typography.fontWeight.bold,
    color: colors.accent.primary,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: tokens.typography.fontSize.sm,
    color: colors.text.secondary,
  },
  favoriteCategory: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: tokens.spacing.sm,
    paddingTop: tokens.spacing.sm,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
  },
  favoriteCategoryLabel: {
    fontSize: tokens.typography.fontSize.sm,
    color: colors.text.secondary,
    marginRight: tokens.spacing.xs,
  },
  favoriteCategoryValue: {
    fontSize: tokens.typography.fontSize.sm,
    fontWeight: tokens.typography.fontWeight.semibold,
    color: colors.accent.primary,
    textTransform: 'capitalize',
  },
  section: {
    marginBottom: tokens.spacing.lg,
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: tokens.spacing.sm,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: tokens.spacing.md,
    paddingVertical: tokens.spacing.sm,
    borderRadius: tokens.radius.sm,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  categoryChipSelected: {
    backgroundColor: colors.accent.primary + '30',
    borderColor: colors.accent.primary,
  },
  categoryEmoji: {
    fontSize: 16,
    marginRight: tokens.spacing.xs,
  },
  categoryLabel: {
    fontSize: tokens.typography.fontSize.sm,
    color: colors.text.secondary,
    fontWeight: tokens.typography.fontWeight.medium,
  },
  categoryLabelSelected: {
    color: colors.text.primary,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: tokens.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  settingInfo: {
    flex: 1,
    marginRight: tokens.spacing.md,
  },
  settingLabel: {
    fontSize: tokens.typography.fontSize.md,
    fontWeight: tokens.typography.fontWeight.medium,
    color: colors.text.primary,
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: tokens.typography.fontSize.xs,
    color: colors.text.tertiary,
  },
  actionButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: tokens.spacing.md,
    paddingHorizontal: tokens.spacing.md,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: tokens.radius.sm,
    marginBottom: tokens.spacing.md,
  },
  actionButtonText: {
    fontSize: tokens.typography.fontSize.md,
    color: colors.text.primary,
  },
  actionButtonIcon: {
    fontSize: 20,
  },
  deviceInfo: {
    paddingTop: tokens.spacing.sm,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.05)',
  },
  deviceInfoLabel: {
    fontSize: tokens.typography.fontSize.xs,
    color: colors.text.tertiary,
    marginBottom: 4,
  },
  deviceInfoValue: {
    fontSize: tokens.typography.fontSize.sm,
    color: colors.text.secondary,
    fontFamily: 'monospace',
  },
  aboutText: {
    fontSize: tokens.typography.fontSize.sm,
    color: colors.text.secondary,
    lineHeight: tokens.typography.fontSize.sm * tokens.typography.lineHeight.relaxed,
  },
  saveButton: {
    marginTop: tokens.spacing.md,
  },
});
