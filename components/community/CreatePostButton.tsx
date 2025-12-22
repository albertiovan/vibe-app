import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  TextInput,
  ScrollView,
  Image,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useTheme } from '../../src/contexts/ThemeContext';
import { GlassCard } from '../../ui/components/GlassCard';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import { createPost } from '../../src/services/communityApi';
import { userStorage } from '../../src/services/userStorage';

interface CreatePostButtonProps {
  userId: string;
  onPostCreated: () => void;
}

export default function CreatePostButton({ userId, onPostCreated }: CreatePostButtonProps) {
  const { colors } = useTheme();
  const [modalVisible, setModalVisible] = useState(false);
  const [content, setContent] = useState('');
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [vibeBefore, setVibeBefore] = useState('');
  const [vibeAfter, setVibeAfter] = useState('');
  const [postType, setPostType] = useState<'completion' | 'vibe_check'>('vibe_check');
  const [loading, setLoading] = useState(false);

  const handleOpenModal = () => {
    setModalVisible(true);
  };

  const handleCloseModal = () => {
    setModalVisible(false);
    // Reset form
    setContent('');
    setPhotoUri(null);
    setVibeBefore('');
    setVibeAfter('');
    setPostType('vibe_check');
  };

  const handlePickImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Please grant photo library access to upload images.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [16, 9],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setPhotoUri(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image');
    }
  };

  const handleTakePhoto = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Please grant camera access to take photos.');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [16, 9],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setPhotoUri(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error taking photo:', error);
      Alert.alert('Error', 'Failed to take photo');
    }
  };

  const handleRemovePhoto = () => {
    setPhotoUri(null);
  };

  const handleSubmit = async () => {
    if (!content.trim()) {
      Alert.alert('Missing Content', 'Please add some content to your post');
      return;
    }

    try {
      setLoading(true);

      // Get user location
      const account = await userStorage.getAccount();
      const locationCity = 'Bucharest'; // TODO: Get from actual location

      await createPost({
        userId,
        postType,
        content: content.trim(),
        photoUrl: photoUri || undefined,
        vibeBefore: vibeBefore.trim() || undefined,
        vibeAfter: vibeAfter.trim() || undefined,
        locationCity,
      });

      handleCloseModal();
      onPostCreated();
      Alert.alert('Success', 'Your post has been shared!');
    } catch (error) {
      console.error('Error creating post:', error);
      Alert.alert('Error', 'Failed to create post. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Floating Action Button */}
      <TouchableOpacity
        style={styles.fab}
        onPress={handleOpenModal}
        activeOpacity={0.8}
      >
        <LinearGradient
          colors={['rgba(0, 217, 255, 0.9)', 'rgba(0, 170, 255, 0.7)']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.fabGradient}
        >
          <Text style={styles.fabIcon}>✨</Text>
        </LinearGradient>
      </TouchableOpacity>

      {/* Create Post Modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={false}
        onRequestClose={handleCloseModal}
      >
        <View style={[styles.modalContainer, { backgroundColor: colors.background }]}>
          {/* Header */}
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={handleCloseModal} style={styles.closeButton}>
              <Text style={[styles.closeText, { color: colors.text.secondary }]}>
                Cancel
              </Text>
            </TouchableOpacity>
            <Text style={[styles.modalTitle, { color: colors.text.primary }]}>
              Share Your Vibe
            </Text>
            <TouchableOpacity
              onPress={handleSubmit}
              style={styles.submitButton}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator size="small" color="#00D9FF" />
              ) : (
                <Text style={styles.submitText}>Post</Text>
              )}
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
            {/* Post Type Selector */}
            <View style={styles.typeSelector}>
              <TouchableOpacity
                style={[
                  styles.typeButton,
                  postType === 'vibe_check' && styles.typeButtonActive,
                ]}
                onPress={() => setPostType('vibe_check')}
              >
                <Text
                  style={[
                    styles.typeButtonText,
                    { color: postType === 'vibe_check' ? '#00D9FF' : colors.text.secondary },
                  ]}
                >
                  🌊 Vibe Check
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.typeButton,
                  postType === 'completion' && styles.typeButtonActive,
                ]}
                onPress={() => setPostType('completion')}
              >
                <Text
                  style={[
                    styles.typeButtonText,
                    { color: postType === 'completion' ? '#00D9FF' : colors.text.secondary },
                  ]}
                >
                  ✅ Completed Activity
                </Text>
              </TouchableOpacity>
            </View>

            {/* Content Input */}
            <GlassCard emphasis="low" style={styles.inputCard}>
              <TextInput
                style={[styles.contentInput, { color: colors.text.primary }]}
                placeholder="What's your vibe today?"
                placeholderTextColor={colors.text.secondary}
                multiline
                numberOfLines={4}
                value={content}
                onChangeText={setContent}
                maxLength={500}
              />
              <Text style={[styles.charCount, { color: colors.text.secondary }]}>
                {content.length}/500
              </Text>
            </GlassCard>

            {/* Vibe Before/After */}
            <View style={styles.vibeInputs}>
              <GlassCard emphasis="low" style={styles.vibeCard}>
                <Text style={[styles.vibeLabel, { color: colors.text.secondary }]}>
                  Vibe Before
                </Text>
                <TextInput
                  style={[styles.vibeInput, { color: colors.text.primary }]}
                  placeholder="e.g., stressed, tired"
                  placeholderTextColor={colors.text.secondary}
                  value={vibeBefore}
                  onChangeText={setVibeBefore}
                  maxLength={50}
                />
              </GlassCard>

              <GlassCard emphasis="low" style={styles.vibeCard}>
                <Text style={[styles.vibeLabel, { color: colors.text.secondary }]}>
                  Vibe After
                </Text>
                <TextInput
                  style={[styles.vibeInput, { color: colors.text.primary }]}
                  placeholder="e.g., relaxed, energized"
                  placeholderTextColor={colors.text.secondary}
                  value={vibeAfter}
                  onChangeText={setVibeAfter}
                  maxLength={50}
                />
              </GlassCard>
            </View>

            {/* Photo */}
            {photoUri ? (
              <View style={styles.photoPreview}>
                <Image source={{ uri: photoUri }} style={styles.previewImage} />
                <TouchableOpacity
                  style={styles.removePhotoButton}
                  onPress={handleRemovePhoto}
                >
                  <Text style={styles.removePhotoText}>✕</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.photoButtons}>
                <TouchableOpacity
                  style={styles.photoButton}
                  onPress={handlePickImage}
                  activeOpacity={0.7}
                >
                  <LinearGradient
                    colors={['rgba(0, 217, 255, 0.2)', 'rgba(0, 170, 255, 0.1)']}
                    style={styles.photoButtonGradient}
                  >
                    <Text style={styles.photoButtonIcon}>📷</Text>
                    <Text style={[styles.photoButtonText, { color: colors.text.primary }]}>
                      Choose Photo
                    </Text>
                  </LinearGradient>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.photoButton}
                  onPress={handleTakePhoto}
                  activeOpacity={0.7}
                >
                  <LinearGradient
                    colors={['rgba(0, 217, 255, 0.2)', 'rgba(0, 170, 255, 0.1)']}
                    style={styles.photoButtonGradient}
                  >
                    <Text style={styles.photoButtonIcon}>📸</Text>
                    <Text style={[styles.photoButtonText, { color: colors.text.primary }]}>
                      Take Photo
                    </Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            )}
          </ScrollView>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 100,
    width: 60,
    height: 60,
    borderRadius: 30,
    elevation: 8,
    shadowColor: '#00D9FF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  fabGradient: {
    width: '100%',
    height: '100%',
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fabIcon: {
    fontSize: 28,
  },
  modalContainer: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  closeButton: {
    width: 60,
  },
  closeText: {
    fontSize: 16,
    fontWeight: '500',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  submitButton: {
    width: 60,
    alignItems: 'flex-end',
  },
  submitText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#00D9FF',
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  typeSelector: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  typeButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
  },
  typeButtonActive: {
    borderColor: '#00D9FF',
    backgroundColor: 'rgba(0, 217, 255, 0.1)',
  },
  typeButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  inputCard: {
    padding: 16,
    marginBottom: 16,
  },
  contentInput: {
    fontSize: 16,
    fontWeight: '400',
    lineHeight: 24,
    minHeight: 100,
    textAlignVertical: 'top',
  },
  charCount: {
    fontSize: 12,
    fontWeight: '500',
    textAlign: 'right',
    marginTop: 8,
  },
  vibeInputs: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  vibeCard: {
    flex: 1,
    padding: 12,
  },
  vibeLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 8,
  },
  vibeInput: {
    fontSize: 14,
    fontWeight: '400',
  },
  photoButtons: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  photoButton: {
    flex: 1,
  },
  photoButtonGradient: {
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderRadius: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0, 217, 255, 0.2)',
  },
  photoButtonIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  photoButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  photoPreview: {
    width: '100%',
    height: 240,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 20,
    position: 'relative',
  },
  previewImage: {
    width: '100%',
    height: '100%',
  },
  removePhotoButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  removePhotoText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
});
