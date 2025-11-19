/**
 * ProfileCustomization Component
 * Allows users to edit nickname and profile picture
 * Designed for future social features (friends, sharing, etc.)
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  Alert,
  ActivityIndicator,
  Modal,
  Platform,
} from 'react-native';

// Conditional import for expo-image-picker
let ImagePicker: any = null;
try {
  ImagePicker = require('expo-image-picker');
} catch (error) {
  console.warn('expo-image-picker not available, photo features disabled');
}
import { userStorage, UserAccount } from '../src/services/userStorage';

interface ProfileCustomizationProps {
  account: UserAccount;
  onUpdate: (updates: Partial<UserAccount>) => void;
  onClose?: () => void;
  isModal?: boolean;
}

export const ProfileCustomization: React.FC<ProfileCustomizationProps> = ({
  account,
  onUpdate,
  onClose,
  isModal = false,
}) => {
  const [nickname, setNickname] = useState(account.nickname || account.name);
  const [profilePicture, setProfilePicture] = useState(account.profilePicture);
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const requestPermissions = async () => {
    if (!ImagePicker) {
      Alert.alert(
        'Feature Unavailable',
        'Photo picker is not available. Please rebuild the app.',
        [{ text: 'OK' }]
      );
      return false;
    }
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Permission Required',
        'Please grant photo library access to upload a profile picture.',
        [{ text: 'OK' }]
      );
      return false;
    }
    return true;
  };

  const handlePickImage = async () => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    try {
      setIsUploading(true);
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1], // Square crop
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setProfilePicture(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleTakePhoto = async () => {
    if (!ImagePicker) {
      Alert.alert(
        'Feature Unavailable',
        'Camera is not available. Please rebuild the app.',
        [{ text: 'OK' }]
      );
      return;
    }
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Permission Required',
        'Please grant camera access to take a photo.',
        [{ text: 'OK' }]
      );
      return;
    }

    try {
      setIsUploading(true);
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setProfilePicture(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error taking photo:', error);
      Alert.alert('Error', 'Failed to take photo. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemovePhoto = () => {
    Alert.alert(
      'Remove Photo',
      'Are you sure you want to remove your profile picture?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => setProfilePicture(undefined),
        },
      ]
    );
  };

  const showPhotoOptions = () => {
    Alert.alert(
      'Profile Picture',
      'Choose an option',
      [
        { text: 'Take Photo', onPress: handleTakePhoto },
        { text: 'Choose from Library', onPress: handlePickImage },
        ...(profilePicture ? [{ text: 'Remove Photo', onPress: handleRemovePhoto, style: 'destructive' as const }] : []),
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  const handleSave = async () => {
    if (!nickname.trim()) {
      Alert.alert('Error', 'Please enter a nickname');
      return;
    }

    try {
      setIsSaving(true);
      const updates: Partial<UserAccount> = {
        nickname: nickname.trim(),
        profilePicture,
      };

      await userStorage.updateAccount(updates);
      onUpdate(updates);
      
      Alert.alert('Success', 'Profile updated successfully!');
      if (onClose) onClose();
    } catch (error) {
      console.error('Error saving profile:', error);
      Alert.alert('Error', 'Failed to save profile. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const renderContent = () => (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Customize Your Profile</Text>
        <Text style={styles.subtitle}>
          Set up your profile for future social features
        </Text>

        {/* Profile Picture Section */}
        <View style={styles.photoSection}>
          <Text style={styles.label}>Profile Picture</Text>
          
          <TouchableOpacity
            style={styles.photoContainer}
            onPress={showPhotoOptions}
            activeOpacity={0.8}
            disabled={isUploading}
          >
            {isUploading ? (
              <View style={styles.photoPlaceholder}>
                <ActivityIndicator size="large" color="#FFFFFF" />
              </View>
            ) : profilePicture ? (
              <Image source={{ uri: profilePicture }} style={styles.photo} />
            ) : (
              <View style={styles.photoPlaceholder}>
                <Text style={styles.photoPlaceholderIcon}>📷</Text>
                <Text style={styles.photoPlaceholderText}>Add Photo</Text>
              </View>
            )}
            
            {/* Edit overlay */}
            {!isUploading && (
              <View style={styles.photoOverlay}>
                <Text style={styles.photoOverlayText}>
                  {profilePicture ? 'Change' : 'Add'}
                </Text>
              </View>
            )}
          </TouchableOpacity>

          <Text style={styles.photoHint}>
            Tap to {profilePicture ? 'change' : 'add'} your profile picture
          </Text>
        </View>

        {/* Nickname Section */}
        <View style={styles.inputSection}>
          <Text style={styles.label}>Nickname</Text>
          <Text style={styles.inputHint}>
            This will be your display name when social features are available
          </Text>
          
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              value={nickname}
              onChangeText={setNickname}
              placeholder="Enter your nickname"
              placeholderTextColor="rgba(255, 255, 255, 0.4)"
              maxLength={30}
              autoCapitalize="words"
              autoCorrect={false}
            />
            <Text style={styles.characterCount}>{nickname.length}/30</Text>
          </View>
        </View>

        {/* Real Name Display */}
        <View style={styles.infoSection}>
          <Text style={styles.infoLabel}>Full Name (Private)</Text>
          <Text style={styles.infoValue}>{account.name}</Text>
          <Text style={styles.infoHint}>
            Your full name is private and won't be shared
          </Text>
        </View>

        {/* Save Button */}
        <TouchableOpacity
          style={styles.saveButton}
          onPress={handleSave}
          disabled={isSaving || isUploading}
          activeOpacity={0.7}
        >
          <Text style={styles.saveButtonText}>
            {isSaving ? 'Saving...' : 'Save Profile'}
          </Text>
        </TouchableOpacity>

        {isModal && onClose && (
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={onClose}
            activeOpacity={0.7}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  if (isModal) {
    return (
      <Modal
        visible={true}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={onClose}
      >
        {renderContent()}
      </Modal>
    );
  }

  return renderContent();
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
    padding: 20,
    justifyContent: 'center',
  },
  card: {
    maxWidth: 500,
    alignSelf: 'center',
    width: '100%',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.6)',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 20,
  },
  photoSection: {
    alignItems: 'center',
    marginBottom: 32,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 12,
    alignSelf: 'flex-start',
  },
  photoContainer: {
    width: 140,
    height: 140,
    borderRadius: 70,
    overflow: 'hidden',
    marginBottom: 12,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  photo: {
    width: '100%',
    height: '100%',
  },
  photoPlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  photoPlaceholderIcon: {
    fontSize: 48,
    marginBottom: 8,
  },
  photoPlaceholderText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.6)',
  },
  photoOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    paddingVertical: 6,
    alignItems: 'center',
  },
  photoOverlayText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#000000',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  photoHint: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.5)',
    textAlign: 'center',
  },
  inputSection: {
    marginBottom: 32,
  },
  inputHint: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.6)',
    marginBottom: 12,
    lineHeight: 18,
  },
  inputContainer: {
    position: 'relative',
  },
  input: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#FFFFFF',
    paddingRight: 60,
  },
  characterCount: {
    position: 'absolute',
    right: 16,
    top: '50%',
    transform: [{ translateY: -8 }],
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.5)',
  },
  infoSection: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
    padding: 16,
    marginBottom: 32,
  },
  infoLabel: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.5)',
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 1,
    fontWeight: '600',
  },
  infoValue: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '500',
    marginBottom: 8,
  },
  infoHint: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.5)',
    fontStyle: 'italic',
  },
  saveButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    paddingVertical: 16,
    paddingHorizontal: 24,
    alignItems: 'center',
    marginBottom: 16,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
  },
  cancelButton: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.6)',
  },
});
