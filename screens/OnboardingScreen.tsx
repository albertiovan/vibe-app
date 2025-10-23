/**
 * Onboarding Screen
 * New user account creation and preferences setup
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
// @ts-ignore
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '../src/design-system/colors';
import { tokens } from '../src/design-system/tokens';
import { userStorage, UserPreferences } from '../src/services/userStorage';

interface OnboardingScreenProps {
  onComplete: () => void;
}

const INTERESTS = [
  { value: 'adventure', label: 'Adventure', icon: 'rocket' },
  { value: 'culture', label: 'Culture', icon: 'color-palette' },
  { value: 'culinary', label: 'Food & Drinks', icon: 'restaurant' },
  { value: 'nature', label: 'Nature', icon: 'leaf' },
  { value: 'sports', label: 'Sports', icon: 'football' },
  { value: 'wellness', label: 'Wellness', icon: 'heart' },
  { value: 'nightlife', label: 'Nightlife', icon: 'moon' },
  { value: 'creative', label: 'Arts & Crafts', icon: 'brush' },
];

export const OnboardingScreen: React.FC<OnboardingScreenProps> = ({ onComplete }) => {
  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [energyLevel, setEnergyLevel] = useState<'low' | 'medium' | 'high'>('medium');
  const [indoorOutdoor, setIndoorOutdoor] = useState<'indoor' | 'outdoor' | 'both'>('both');
  const [opennessScore, setOpennessScore] = useState(3);
  const [loading, setLoading] = useState(false);

  const handleNext = () => {
    if (step === 1 && !name.trim()) {
      alert('Please enter your name');
      return;
    }
    if (step === 2 && selectedInterests.length === 0) {
      alert('Please select at least one interest');
      return;
    }
    setStep(step + 1);
  };

  const handleComplete = async () => {
    setLoading(true);
    try {
      // Create account
      await userStorage.createAccount(name.trim(), email.trim() || undefined);

      // Save preferences
      const preferences: UserPreferences = {
        interests: selectedInterests,
        energyLevel,
        indoorOutdoor,
        opennessScore,
      };
      
      await userStorage.completeOnboarding(preferences);
      
      console.log('🎉 Onboarding complete!');
      onComplete();
    } catch (error) {
      console.error('Onboarding error:', error);
      alert('Failed to create account. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const toggleInterest = (interest: string) => {
    setSelectedInterests(prev =>
      prev.includes(interest)
        ? prev.filter(i => i !== interest)
        : [...prev, interest]
    );
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <LinearGradient
        colors={['#667EEA', '#764BA2', '#F093FB']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          {/* Progress Indicator */}
          <View style={styles.progressContainer}>
            {[1, 2, 3, 4].map((s) => (
              <View
                key={s}
                style={[
                  styles.progressDot,
                  s === step && styles.progressDotActive,
                  s < step && styles.progressDotComplete,
                ]}
              />
            ))}
          </View>

          {/* Step 1: Basic Info */}
          {step === 1 && (
            <View style={styles.stepContainer}>
              <Text style={styles.emoji}>👋</Text>
              <Text style={styles.title}>Welcome to Vibe!</Text>
              <Text style={styles.subtitle}>
                Let's create your account to personalize your experience
              </Text>

              <View style={styles.inputContainer}>
                <Text style={styles.label}>What's your name? *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter your name"
                  placeholderTextColor="rgba(255,255,255,0.5)"
                  value={name}
                  onChangeText={setName}
                  autoCapitalize="words"
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.label}>Email (optional)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="your@email.com"
                  placeholderTextColor="rgba(255,255,255,0.5)"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>
            </View>
          )}

          {/* Step 2: Interests */}
          {step === 2 && (
            <View style={styles.stepContainer}>
              <Text style={styles.emoji}>🎯</Text>
              <Text style={styles.title}>What are you into?</Text>
              <Text style={styles.subtitle}>
                Select your interests so we can personalize recommendations
              </Text>

              <View style={styles.interestsGrid}>
                {INTERESTS.map((interest) => (
                  <TouchableOpacity
                    key={interest.value}
                    style={[
                      styles.interestCard,
                      selectedInterests.includes(interest.value) &&
                        styles.interestCardSelected,
                    ]}
                    onPress={() => toggleInterest(interest.value)}
                  >
                    <Ionicons
                      name={interest.icon as any}
                      size={32}
                      color={
                        selectedInterests.includes(interest.value)
                          ? '#fff'
                          : 'rgba(255,255,255,0.8)'
                      }
                    />
                    <Text
                      style={[
                        styles.interestLabel,
                        selectedInterests.includes(interest.value) &&
                          styles.interestLabelSelected,
                      ]}
                    >
                      {interest.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          {/* Step 3: Energy & Preferences */}
          {step === 3 && (
            <View style={styles.stepContainer}>
              <Text style={styles.emoji}>⚡</Text>
              <Text style={styles.title}>Your Vibe</Text>
              <Text style={styles.subtitle}>
                Tell us about your activity preferences
              </Text>

              <View style={styles.preferenceSection}>
                <Text style={styles.preferenceLabel}>Energy Level</Text>
                <View style={styles.optionsRow}>
                  {(['low', 'medium', 'high'] as const).map((level) => (
                    <TouchableOpacity
                      key={level}
                      style={[
                        styles.optionButton,
                        energyLevel === level && styles.optionButtonSelected,
                      ]}
                      onPress={() => setEnergyLevel(level)}
                    >
                      <Text
                        style={[
                          styles.optionText,
                          energyLevel === level && styles.optionTextSelected,
                        ]}
                      >
                        {level.charAt(0).toUpperCase() + level.slice(1)}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View style={styles.preferenceSection}>
                <Text style={styles.preferenceLabel}>Indoor or Outdoor?</Text>
                <View style={styles.optionsRow}>
                  {(['indoor', 'outdoor', 'both'] as const).map((pref) => (
                    <TouchableOpacity
                      key={pref}
                      style={[
                        styles.optionButton,
                        indoorOutdoor === pref && styles.optionButtonSelected,
                      ]}
                      onPress={() => setIndoorOutdoor(pref)}
                    >
                      <Text
                        style={[
                          styles.optionText,
                          indoorOutdoor === pref && styles.optionTextSelected,
                        ]}
                      >
                        {pref.charAt(0).toUpperCase() + pref.slice(1)}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </View>
          )}

          {/* Step 4: Openness Score */}
          {step === 4 && (
            <View style={styles.stepContainer}>
              <Text style={styles.emoji}>🌟</Text>
              <Text style={styles.title}>How adventurous are you?</Text>
              <Text style={styles.subtitle}>
                Rate your willingness to try new things
              </Text>

              <View style={styles.sliderContainer}>
                <View style={styles.scaleLabels}>
                  <Text style={styles.scaleLabel}>Play it safe</Text>
                  <Text style={styles.scaleLabel}>Always exploring!</Text>
                </View>
                
                <View style={styles.scaleButtons}>
                  {[1, 2, 3, 4, 5].map((score) => (
                    <TouchableOpacity
                      key={score}
                      style={[
                        styles.scaleButton,
                        opennessScore === score && styles.scaleButtonSelected,
                      ]}
                      onPress={() => setOpennessScore(score)}
                    >
                      <Text
                        style={[
                          styles.scaleButtonText,
                          opennessScore === score && styles.scaleButtonTextSelected,
                        ]}
                      >
                        {score}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <Text style={styles.helperText}>
                This helps us suggest challenges that match your comfort level
              </Text>
            </View>
          )}

          {/* Navigation Buttons */}
          <View style={styles.buttonContainer}>
            {step > 1 && (
              <TouchableOpacity
                style={styles.backButton}
                onPress={() => setStep(step - 1)}
              >
                <Text style={styles.backButtonText}>Back</Text>
              </TouchableOpacity>
            )}

            {step < 4 ? (
              <TouchableOpacity
                style={styles.nextButton}
                onPress={handleNext}
              >
                <Text style={styles.nextButtonText}>Next</Text>
                <Ionicons name="arrow-forward" size={20} color="#fff" />
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={styles.completeButton}
                onPress={handleComplete}
                disabled={loading}
              >
                <Text style={styles.completeButtonText}>
                  {loading ? 'Creating Account...' : 'Get Started!'}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </ScrollView>
      </LinearGradient>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
    padding: tokens.spacing.xl,
    paddingTop: 80,
  },
  progressContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: tokens.spacing.sm,
    marginBottom: tokens.spacing.xl,
  },
  progressDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  progressDotActive: {
    backgroundColor: '#fff',
    width: 24,
  },
  progressDotComplete: {
    backgroundColor: 'rgba(255,255,255,0.6)',
  },
  stepContainer: {
    flex: 1,
    alignItems: 'center',
  },
  emoji: {
    fontSize: 72,
    marginBottom: tokens.spacing.lg,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: '#fff',
    textAlign: 'center',
    marginBottom: tokens.spacing.sm,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
    marginBottom: tokens.spacing.xl,
  },
  inputContainer: {
    width: '100%',
    marginBottom: tokens.spacing.lg,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
    marginBottom: tokens.spacing.xs,
  },
  input: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: tokens.radius.md,
    padding: tokens.spacing.md,
    fontSize: 16,
    color: '#fff',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  interestsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: tokens.spacing.sm,
    justifyContent: 'center',
  },
  interestCard: {
    width: '45%',
    padding: tokens.spacing.md,
    borderRadius: tokens.radius.lg,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  interestCardSelected: {
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderColor: '#fff',
  },
  interestLabel: {
    marginTop: tokens.spacing.xs,
    fontSize: 14,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
  },
  interestLabelSelected: {
    color: '#fff',
  },
  preferenceSection: {
    width: '100%',
    marginBottom: tokens.spacing.xl,
  },
  preferenceLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: tokens.spacing.sm,
  },
  optionsRow: {
    flexDirection: 'row',
    gap: tokens.spacing.sm,
  },
  optionButton: {
    flex: 1,
    padding: tokens.spacing.md,
    borderRadius: tokens.radius.lg,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  optionButtonSelected: {
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderColor: '#fff',
  },
  optionText: {
    fontSize: 14,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.8)',
  },
  optionTextSelected: {
    color: '#fff',
  },
  sliderContainer: {
    width: '100%',
    marginVertical: tokens.spacing.xl,
  },
  scaleLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: tokens.spacing.md,
  },
  scaleLabel: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
    fontWeight: '500',
  },
  scaleButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: tokens.spacing.xs,
  },
  scaleButton: {
    flex: 1,
    aspectRatio: 1,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  scaleButtonSelected: {
    backgroundColor: '#fff',
    borderColor: '#fff',
  },
  scaleButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.8)',
  },
  scaleButtonTextSelected: {
    color: '#667EEA',
  },
  helperText: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: tokens.spacing.md,
    marginTop: tokens.spacing.xl,
  },
  backButton: {
    flex: 1,
    padding: tokens.spacing.md,
    borderRadius: tokens.radius.lg,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  nextButton: {
    flex: 2,
    flexDirection: 'row',
    padding: tokens.spacing.md,
    borderRadius: tokens.radius.lg,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    gap: tokens.spacing.xs,
  },
  nextButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#667EEA',
  },
  completeButton: {
    flex: 1,
    padding: tokens.spacing.md,
    borderRadius: tokens.radius.lg,
    backgroundColor: '#fff',
    alignItems: 'center',
  },
  completeButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#667EEA',
  },
});
