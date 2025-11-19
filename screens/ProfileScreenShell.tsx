/**
 * ProfileScreenShell
 * 
 * User profile with vibe profile management
 * Matches the design system of HomeScreenShell
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { OrbBackdrop } from '../ui/components/OrbBackdrop';
import { GlassCard } from '../ui/components/GlassCard';
import { theme } from '../ui/theme/tokens';
import { userStorage } from '../src/services/userStorage';
import { VibeProfileSelector } from '../components/VibeProfileSelector';
import { CreateVibeProfileModal } from '../components/CreateVibeProfileModal';

export const ProfileScreenShell: React.FC = () => {
  const navigation = useNavigation();
  const [deviceId, setDeviceId] = useState<string>('');
  const [userName, setUserName] = useState('');
  const [editingName, setEditingName] = useState(false);
  const [tempName, setTempName] = useState('');
  const [showCreateProfile, setShowCreateProfile] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const colors = theme.colors;
  const typo = theme.typography;

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const account = await userStorage.getAccount();
      if (account) {
        setDeviceId(account.userId);
        setUserName(account.name || 'Adventurer');
      } else {
        // Fallback for users without account
        const fallbackId = `device-${Math.random().toString(36).substr(2, 9)}`;
        setDeviceId(fallbackId);
        setUserName('Adventurer');
      }
    } catch (error) {
      console.error('❌ Failed to load user data:', error);
    }
  };

  const handleSaveName = async () => {
    if (tempName.trim()) {
      await userStorage.updateAccount({ name: tempName.trim() });
      setUserName(tempName.trim());
      setEditingName(false);
      Alert.alert('Success', 'Name updated!');
    }
  };

  const handleStartEdit = () => {
    setTempName(userName);
    setEditingName(true);
  };

  const handleProfileSelect = (profile: any) => {
    console.log('✨ Profile selected from profile screen:', profile.name);
    // Could navigate back to home with this profile active
    navigation.goBack();
  };

  const handleCreateProfile = () => {
    setShowCreateProfile(true);
  };

  const handleProfileCreated = () => {
    setShowCreateProfile(false);
    setRefreshKey(prev => prev + 1); // Refresh the vibe profiles list
    Alert.alert('Success', 'Vibe profile created!');
  };

  const handleResetTraining = async () => {
    Alert.alert(
      'Reset Training Data',
      'This will clear all your activity history and preferences. Are you sure?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: async () => {
            try {
              // Clear local storage
              await userStorage.clearAllData();
              Alert.alert('Success', 'Training data reset. Please restart the app.');
            } catch (error) {
              console.error('❌ Reset failed:', error);
              Alert.alert('Error', 'Failed to reset training data');
            }
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <OrbBackdrop variant="dark" />

      <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backButtonText}>←</Text>
          </TouchableOpacity>

          <Text style={[typo.titleM, { color: colors.fg.primary }]}>
            Profile
          </Text>

          <View style={{ width: 44 }} />
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* User Info Card */}
          <GlassCard emphasis="low" style={styles.card}>
            <Text style={[typo.titleM, { color: colors.fg.primary, marginBottom: 16 }]}>
              Your Info
            </Text>

            {editingName ? (
              <View>
                <TextInput
                  style={[typo.body, styles.input]}
                  value={tempName}
                  onChangeText={setTempName}
                  placeholder="Enter your name"
                  placeholderTextColor={colors.fg.tertiary}
                  autoFocus
                />
                <View style={styles.buttonRow}>
                  <TouchableOpacity
                    style={[styles.button, styles.cancelButton]}
                    onPress={() => setEditingName(false)}
                  >
                    <Text style={[typo.bodySmall, { color: colors.fg.secondary }]}>
                      Cancel
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.button, styles.saveButton]}
                    onPress={handleSaveName}
                  >
                    <Text style={[typo.bodySmall, { color: '#FFFFFF' }]}>
                      Save
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              <View>
                <Text style={[typo.body, { color: colors.fg.secondary, marginBottom: 8 }]}>
                  Name: {userName}
                </Text>
                <TouchableOpacity
                  style={[styles.button, styles.editButton]}
                  onPress={handleStartEdit}
                >
                  <Text style={[typo.bodySmall, { color: colors.fg.primary }]}>
                    Edit Name
                  </Text>
                </TouchableOpacity>
              </View>
            )}

            <View style={styles.divider} />

            <Text style={[typo.caption, { color: colors.fg.tertiary }]}>
              Device ID: {deviceId.substring(0, 12)}...
            </Text>
          </GlassCard>

          {/* Vibe Profiles Section */}
          <GlassCard emphasis="low" style={styles.card}>
            <View style={styles.sectionHeader}>
              <Text style={[typo.titleM, { color: colors.fg.primary }]}>
                Vibe Profiles
              </Text>
              <TouchableOpacity
                style={styles.createButton}
                onPress={handleCreateProfile}
              >
                <Text style={[typo.bodySmall, { color: '#00AAFF' }]}>
                  + Create New
                </Text>
              </TouchableOpacity>
            </View>

            <Text style={[typo.caption, { color: colors.fg.secondary, marginBottom: 16 }]}>
              Save your favorite filter combinations as profiles
            </Text>

            <VibeProfileSelector
              key={refreshKey}
              deviceId={deviceId}
              onProfileSelect={handleProfileSelect}
              onCreateProfile={handleCreateProfile}
            />
          </GlassCard>

          {/* Settings Card */}
          <GlassCard emphasis="low" style={styles.card}>
            <Text style={[typo.titleM, { color: colors.fg.primary, marginBottom: 16 }]}>
              Settings
            </Text>

            <TouchableOpacity
              style={styles.settingItem}
              onPress={handleResetTraining}
            >
              <Text style={[typo.body, { color: '#FF6B6B' }]}>
                Reset Training Data
              </Text>
              <Text style={[typo.caption, { color: colors.fg.tertiary }]}>
                Clear all activity history
              </Text>
            </TouchableOpacity>
          </GlassCard>

          {/* App Info */}
          <View style={styles.appInfo}>
            <Text style={[typo.caption, { color: colors.fg.tertiary, textAlign: 'center' }]}>
              Vibe App v1.0.0
            </Text>
            <Text style={[typo.caption, { color: colors.fg.tertiary, textAlign: 'center' }]}>
              Your personalized activity companion
            </Text>
          </View>
        </ScrollView>
      </SafeAreaView>

      {/* Create Vibe Profile Modal */}
      {showCreateProfile && (
        <CreateVibeProfileModal
          visible={showCreateProfile}
          deviceId={deviceId}
          onClose={() => setShowCreateProfile(false)}
          onProfileCreated={handleProfileCreated}
          initialFilters={{}}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0E17',
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButtonText: {
    fontSize: 24,
    color: '#FFFFFF',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  card: {
    marginBottom: 20,
    padding: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  createButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: 'rgba(0, 170, 255, 0.1)',
  },
  input: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 12,
    color: '#FFFFFF',
    marginBottom: 12,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  editButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  cancelButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  saveButton: {
    backgroundColor: '#00AAFF',
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    marginVertical: 16,
  },
  settingItem: {
    paddingVertical: 12,
  },
  appInfo: {
    marginTop: 20,
    gap: 4,
  },
});
