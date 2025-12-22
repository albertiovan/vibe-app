/**
 * ActivityCompletionModal Component
 * 3-step modal for activity completion: Confirm → Rate → Photo
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  Image,
  StyleSheet,
  Animated,
  ScrollView,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { RatingSlider } from './RatingSlider';
import { GlassButton } from './GlassButton';
import { theme } from '../theme/tokens';

type Step = 'confirm' | 'rate' | 'photo';

interface ActivityCompletionModalProps {
  activity: {
    id: number;
    instanceId: number;
    name: string;
    venueName?: string;
    category?: string;
  };
  onComplete: (rating: number, photoUrl?: string) => void;
  onSkip: () => void;
  onOngoing: () => void;
}

export function ActivityCompletionModal({
  activity,
  onComplete,
  onSkip,
  onOngoing,
}: ActivityCompletionModalProps) {
  const [step, setStep] = useState<Step>('confirm');
  const [rating, setRating] = useState(7);
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [fadeAnim] = useState(new Animated.Value(0));
  
  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, []);
  
  // Step 1: Confirm completion
  if (step === 'confirm') {
    return (
      <Modal
        visible={true}
        transparent={true}
        animationType="fade"
        onRequestClose={onSkip}
      >
        <View style={styles.overlay}>
          <Animated.View style={[styles.modal, { opacity: fadeAnim }]}>
            <Text style={styles.title}>How was your activity?</Text>
            
            <View style={styles.activityInfo}>
              <Text style={styles.activityName}>{activity.name}</Text>
              {activity.venueName && (
                <Text style={styles.venueName}>{activity.venueName}</Text>
              )}
            </View>
            
            <View style={styles.confirmButtons}>
              <GlassButton
                label="✅ Yes, I did it!"
                kind="primary"
                onPress={() => setStep('rate')}
                style={styles.button}
              />
              
              <GlassButton
                label="❌ No, didn't go"
                kind="secondary"
                onPress={onSkip}
                style={styles.button}
              />
              
              <GlassButton
                label="⏰ Still ongoing"
                kind="secondary"
                onPress={onOngoing}
                style={styles.button}
              />
            </View>
          </Animated.View>
        </View>
      </Modal>
    );
  }
  
  // Step 2: Rate with slider
  if (step === 'rate') {
    return (
      <Modal
        visible={true}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setStep('confirm')}
      >
        <View style={styles.overlay}>
          <View style={styles.modal}>
            <Text style={styles.title}>How would you rate it?</Text>
            
            <View style={styles.activityInfo}>
              <Text style={styles.activityName}>{activity.name}</Text>
              {activity.venueName && (
                <Text style={styles.venueName}>{activity.venueName}</Text>
              )}
            </View>
            
            <RatingSlider
              initialRating={rating}
              onRatingChange={setRating}
            />
            
            <GlassButton
              label="Continue"
              kind="primary"
              onPress={() => setStep('photo')}
              style={styles.continueButton}
            />
          </View>
        </View>
      </Modal>
    );
  }
  
  // Step 3: Optional photo
  if (step === 'photo') {
    return (
      <Modal
        visible={true}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setStep('rate')}
      >
        <View style={styles.overlay}>
          <ScrollView 
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.modal}>
              <Text style={styles.title}>Add a photo?</Text>
              <Text style={styles.subtitle}>Share your experience with friends</Text>
              
              {!photoUri ? (
                <View style={styles.photoOptions}>
                  <TouchableOpacity
                    style={styles.photoButton}
                    onPress={async () => {
                      const result = await ImagePicker.launchCameraAsync({
                        allowsEditing: true,
                        aspect: [4, 3],
                        quality: 0.8,
                      });
                      if (!result.canceled) {
                        setPhotoUri(result.assets[0].uri);
                      }
                    }}
                  >
                    <Text style={styles.photoButtonText}>📸 Take Photo</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    style={styles.photoButton}
                    onPress={async () => {
                      const result = await ImagePicker.launchImageLibraryAsync({
                        allowsEditing: true,
                        aspect: [4, 3],
                        quality: 0.8,
                      });
                      if (!result.canceled) {
                        setPhotoUri(result.assets[0].uri);
                      }
                    }}
                  >
                    <Text style={styles.photoButtonText}>🖼️  Choose Photo</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <View style={styles.photoPreviewContainer}>
                  <Image source={{ uri: photoUri }} style={styles.photoPreview} />
                  <TouchableOpacity
                    style={styles.retakeButton}
                    onPress={() => setPhotoUri(null)}
                  >
                    <Text style={styles.retakeText}>Retake</Text>
                  </TouchableOpacity>
                </View>
              )}
              
              <View style={styles.photoActions}>
                <TouchableOpacity
                  style={styles.skipButton}
                  onPress={() => onComplete(rating)}
                >
                  <Text style={styles.skipText}>Skip</Text>
                </TouchableOpacity>
                
                <GlassButton
                  label={photoUri ? "Share to Profile" : "Continue"}
                  kind="primary"
                  onPress={() => onComplete(rating, photoUri || undefined)}
                  style={styles.continueButton}
                />
              </View>
            </View>
          </ScrollView>
        </View>
      </Modal>
    );
  }
  
  return null;
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modal: {
    backgroundColor: '#1A1A1A',
    borderRadius: 24,
    padding: 24,
    width: '100%',
    maxWidth: 400,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.6)',
    textAlign: 'center',
    marginBottom: 24,
  },
  activityInfo: {
    alignItems: 'center',
    marginBottom: 24,
    paddingBottom: 24,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  activityName: {
    fontSize: 20,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
    textAlign: 'center',
  },
  venueName: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.6)',
    textAlign: 'center',
  },
  confirmButtons: {
    gap: 12,
  },
  button: {
    width: '100%',
  },
  continueButton: {
    marginTop: 24,
  },
  photoOptions: {
    gap: 12,
    marginVertical: 20,
  },
  photoButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
  },
  photoButtonText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '500',
  },
  photoPreviewContainer: {
    marginVertical: 20,
  },
  photoPreview: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    marginBottom: 12,
  },
  retakeButton: {
    alignSelf: 'center',
    padding: 8,
  },
  retakeText: {
    color: 'rgba(253, 221, 16, 1)',
    fontSize: 14,
    fontWeight: '500',
  },
  photoActions: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
    marginTop: 20,
  },
  skipButton: {
    padding: 12,
  },
  skipText: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 14,
  },
});
