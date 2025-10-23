/**
 * Vibe Profile Selector
 * Dropdown/submenu component that shows user's saved vibe profiles
 * for quick filtering on the homepage
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
// @ts-ignore
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../src/design-system/colors';
import { tokens } from '../src/design-system/tokens';
import { vibeProfilesApi, VibeProfile } from '../src/services/vibeProfilesApi';

interface VibeProfileSelectorProps {
  deviceId: string;
  onProfileSelect: (profile: VibeProfile) => void;
  onCreateProfile: () => void;
}

export const VibeProfileSelector: React.FC<VibeProfileSelectorProps> = ({
  deviceId,
  onProfileSelect,
  onCreateProfile,
}) => {
  const [profiles, setProfiles] = useState<VibeProfile[]>([]);
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    if (deviceId) {
      loadProfiles();
    }
  }, [deviceId]);

  const loadProfiles = async () => {
    if (!deviceId) {
      console.log('⚠️ No deviceId yet, skipping profile load');
      return;
    }
    
    setLoading(true);
    try {
      const userProfiles = await vibeProfilesApi.getProfiles(deviceId);
      setProfiles(userProfiles);
      if (userProfiles.length > 0) {
        console.log('📚 Loaded', userProfiles.length, 'vibe profiles');
      }
    } catch (error) {
      // Silently handle - this is normal for new users or when backend is off
      if (__DEV__) {
        console.log('📋 No profiles to load (backend may not be running)');
      }
      setProfiles([]);
    } finally {
      setLoading(false);
    }
  };

  const handleProfileSelect = async (profile: VibeProfile) => {
    console.log('✨ Selected profile:', profile.name);
    
    // Track usage
    try {
      await vibeProfilesApi.markProfileAsUsed(profile.id, deviceId);
    } catch (error) {
      // Silently fail - profile still works, just usage not tracked
      if (__DEV__) {
        console.log('📋 Could not track profile usage (backend may not be running)');
      }
    }

    // Apply profile
    onProfileSelect(profile);
    setExpanded(false);
  };

  // Don't show component if loading failed or no profiles
  if (!deviceId || (profiles.length === 0 && !loading)) {
    return null;
  }

  return (
    <View style={styles.container}>
      {/* Header - Tap to expand/collapse */}
      <TouchableOpacity
        style={styles.header}
        onPress={() => setExpanded(!expanded)}
        activeOpacity={0.8}
      >
        <LinearGradient
          colors={['#667EEA', '#764BA2']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.headerGradient}
        >
          <View style={styles.headerContent}>
            <View style={styles.headerLeft}>
              <Ionicons name="bookmark" size={20} color="#fff" style={styles.headerIcon} />
              <Text style={styles.headerTitle}>Your Vibe Profiles</Text>
              <Text style={styles.profileCount}>({profiles.length})</Text>
            </View>
            <Ionicons
              name={expanded ? 'chevron-up' : 'chevron-down'}
              size={20}
              color="#fff"
            />
          </View>
        </LinearGradient>
      </TouchableOpacity>

      {/* Profile List - Shown when expanded */}
      {expanded && (
        <View style={styles.profileList}>
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color="#667EEA" />
            </View>
          ) : (
            <>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.profileScroll}
              >
                {profiles.map((profile) => (
                  <TouchableOpacity
                    key={profile.id}
                    style={styles.profileCard}
                    onPress={() => handleProfileSelect(profile)}
                    activeOpacity={0.7}
                  >
                    <View style={styles.profileEmoji}>
                      <Text style={styles.emojiText}>{profile.emoji || '✨'}</Text>
                    </View>
                    <Text style={styles.profileName} numberOfLines={1}>
                      {profile.name}
                    </Text>
                    {profile.times_used > 0 && (
                      <Text style={styles.usageCount}>
                        {profile.times_used}x
                      </Text>
                    )}
                  </TouchableOpacity>
                ))}

                {/* Create New Button */}
                <TouchableOpacity
                  style={[styles.profileCard, styles.createCard]}
                  onPress={onCreateProfile}
                  activeOpacity={0.7}
                >
                  <View style={styles.createIcon}>
                    <Ionicons name="add-circle" size={32} color="#667EEA" />
                  </View>
                  <Text style={styles.createText}>Create New</Text>
                </TouchableOpacity>
              </ScrollView>
            </>
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: tokens.spacing.sm,
  },
  header: {
    borderRadius: tokens.radius.lg,
    overflow: 'hidden',
    marginHorizontal: tokens.spacing.md,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  headerGradient: {
    paddingHorizontal: tokens.spacing.md,
    paddingVertical: tokens.spacing.sm,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerIcon: {
    marginRight: tokens.spacing.xs,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  profileCount: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    marginLeft: tokens.spacing.xs,
  },
  profileList: {
    marginTop: tokens.spacing.xs,
    paddingVertical: tokens.spacing.sm,
  },
  loadingContainer: {
    padding: tokens.spacing.md,
    alignItems: 'center',
  },
  profileScroll: {
    paddingHorizontal: tokens.spacing.md,
  },
  profileCard: {
    width: 100,
    marginRight: tokens.spacing.sm,
    padding: tokens.spacing.sm,
    backgroundColor: colors.base.surface,
    borderRadius: tokens.radius.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  profileEmoji: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.base.canvas,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: tokens.spacing.xs,
  },
  emojiText: {
    fontSize: 28,
  },
  profileName: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.text.primary,
    textAlign: 'center',
    marginBottom: 2,
  },
  usageCount: {
    fontSize: 11,
    color: colors.text.tertiary,
  },
  createCard: {
    borderStyle: 'dashed',
    borderColor: '#667EEA',
    backgroundColor: 'rgba(102, 126, 234, 0.05)',
  },
  createIcon: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: tokens.spacing.xs,
  },
  createText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#667EEA',
    textAlign: 'center',
  },
});
