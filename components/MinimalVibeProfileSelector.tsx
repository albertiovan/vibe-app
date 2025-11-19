/**
 * Minimal Vibe Profile Selector
 * Monochrome dropdown for saved vibe profiles
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { vibeProfilesApi, VibeProfile } from '../src/services/vibeProfilesApi';

interface MinimalVibeProfileSelectorProps {
  deviceId: string;
  onProfileSelect: (profile: VibeProfile | null) => void;
  onCreateProfile: () => void;
  selectedProfileId?: number;
}

export const MinimalVibeProfileSelector: React.FC<MinimalVibeProfileSelectorProps> = ({
  deviceId,
  onProfileSelect,
  onCreateProfile,
  selectedProfileId,
}) => {
  const [profiles, setProfiles] = useState<VibeProfile[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (deviceId) {
      loadProfiles();
    }
  }, [deviceId]);

  const loadProfiles = async () => {
    if (!deviceId) return;
    
    setLoading(true);
    try {
      const userProfiles = await vibeProfilesApi.getProfiles(deviceId);
      setProfiles(userProfiles);
    } catch (error) {
      if (__DEV__) {
        console.log('📋 No profiles to load');
      }
      setProfiles([]);
    } finally {
      setLoading(false);
    }
  };

  const handleProfileSelect = async (profile: VibeProfile) => {
    // If clicking the already-selected profile, deselect it
    if (selectedProfileId === profile.id) {
      console.log('✨ Deselected profile:', profile.name);
      onProfileSelect(null);
      return;
    }

    console.log('✨ Selected profile:', profile.name);
    
    // Only increment usage count if not already selected
    try {
      await vibeProfilesApi.markProfileAsUsed(profile.id, deviceId);
      // Reload profiles to update usage count
      loadProfiles();
    } catch (error) {
      if (__DEV__) {
        console.log('📋 Could not track profile usage');
      }
    }

    onProfileSelect(profile);
  };

  const handleDeleteProfile = (profile: VibeProfile) => {
    Alert.alert(
      'Delete Profile',
      `Are you sure you want to delete "${profile.name}"? This cannot be undone.`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await vibeProfilesApi.deleteProfile(profile.id, deviceId);
              console.log('🗑️ Deleted profile:', profile.name);
              
              // If deleted profile was selected, clear selection
              if (selectedProfileId === profile.id) {
                onProfileSelect(null);
              }
              
              // Reload profiles
              loadProfiles();
            } catch (error) {
              console.error('Failed to delete profile:', error);
              Alert.alert('Error', 'Failed to delete profile. Please try again.');
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="small" color="#FFFFFF" />
      </View>
    );
  }

  if (profiles.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No vibe profiles yet</Text>
        <TouchableOpacity
          style={styles.createButton}
          onPress={onCreateProfile}
          activeOpacity={0.7}
        >
          <Text style={styles.createButtonText}>+ Create Your First Profile</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {profiles.map((profile) => {
          const isSelected = selectedProfileId === profile.id;
          return (
          <TouchableOpacity
            key={profile.id}
            style={[styles.profileCard, isSelected && styles.profileCardSelected]}
            onPress={() => handleProfileSelect(profile)}
            onLongPress={() => handleDeleteProfile(profile)}
            activeOpacity={0.7}
          >
            <View style={styles.profileHeader}>
              <View style={styles.profileEmoji}>
                <Text style={styles.emojiText}>{profile.emoji || '✨'}</Text>
              </View>
              <View style={styles.profileInfo}>
                <Text style={styles.profileName}>{profile.name}</Text>
                {profile.description && (
                  <Text style={styles.profileDescription} numberOfLines={1}>
                    {profile.description}
                  </Text>
                )}
              </View>
              {profile.times_used > 0 && (
                <Text style={styles.usageCount}>{profile.times_used}x</Text>
              )}
            </View>
            {isSelected && (
              <View style={styles.selectedIndicator}>
                <Text style={styles.selectedText}>✓ Active</Text>
              </View>
            )}
            <TouchableOpacity
              style={styles.deleteButton}
              onPress={() => handleDeleteProfile(profile)}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Text style={styles.deleteText}>🗑️</Text>
            </TouchableOpacity>
          </TouchableOpacity>
          );
        })}

        {/* Create New Button */}
        <TouchableOpacity
          style={styles.createCard}
          onPress={onCreateProfile}
          activeOpacity={0.7}
        >
          <Text style={styles.createCardText}>+ Create New Profile</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    maxHeight: 400,
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyContainer: {
    padding: 32,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.6)',
    marginBottom: 16,
  },
  createButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    borderStyle: 'dashed',
  },
  createButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#FFFFFF',
  },
  scrollContent: {
    padding: 16,
    gap: 8,
  },
  profileCard: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  profileCardSelected: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderColor: 'rgba(255, 255, 255, 0.5)',
    borderWidth: 2,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  profileEmoji: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emojiText: {
    fontSize: 20,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  profileDescription: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.6)',
  },
  usageCount: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.5)',
    fontWeight: '500',
  },
  createCard: {
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    borderStyle: 'dashed',
    alignItems: 'center',
    marginTop: 8,
  },
  createCardText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#FFFFFF',
  },
  selectedIndicator: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  selectedText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  deleteButton: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 0, 0, 0.1)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 0, 0, 0.3)',
  },
  deleteText: {
    fontSize: 16,
  },
});
