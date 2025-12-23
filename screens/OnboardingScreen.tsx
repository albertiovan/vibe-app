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
import { useLanguage } from '../src/i18n/LanguageContext';

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
  const { t, language, setLanguage } = useLanguage();
  const [step, setStep] = useState(0);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [energyLevel, setEnergyLevel] = useState<'low' | 'medium' | 'high'>('medium');
  const [indoorOutdoor, setIndoorOutdoor] = useState<'indoor' | 'outdoor' | 'both'>('both');
  const [opennessScore, setOpennessScore] = useState(3);
  const [loading, setLoading] = useState(false);

  const handleNext = () => {
    if (step === 1 && !name.trim()) {
      alert(t('onboarding.name_required'));
      return;
    }
    if (step === 3 && selectedInterests.length === 0) {
      alert(t('onboarding.interests_required'));
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
          {/* Progress Dots */}
          <View style={styles.progressContainer}>
            {[0, 1, 2, 3, 4].map((s) => (
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

          {/* Step 0: Language Selection */}
          {step === 0 && (
            <View style={styles.stepContainer}>
              <Text style={styles.emoji}>🌍</Text>
              <Text style={styles.title}>Choose Your Language</Text>
              <Text style={styles.subtitle}>
                Select your preferred language. You can change this later in Settings.
              </Text>

              <View style={styles.languageOptions}>
                <TouchableOpacity
                  style={[
                    styles.languageCard,
                    language === 'en' && styles.languageCardSelected,
                  ]}
                  onPress={() => setLanguage('en')}
                  activeOpacity={0.7}
                >
                  <Text style={styles.languageFlag}>🇬🇧</Text>
                  <Text style={[
                    styles.languageLabel,
                    language === 'en' && styles.languageLabelSelected,
                  ]}>
                    English
                  </Text>
                  {language === 'en' && (
                    <View style={styles.selectedBadge}>
                      <Ionicons name="checkmark-circle" size={24} color="#00D9FF" />
                    </View>
                  )}
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.languageCard,
                    language === 'ro' && styles.languageCardSelected,
                  ]}
                  onPress={() => setLanguage('ro')}
                  activeOpacity={0.7}
                >
                  <Text style={styles.languageFlag}>🇷🇴</Text>
                  <Text style={[
                    styles.languageLabel,
                    language === 'ro' && styles.languageLabelSelected,
                  ]}>
                    Română
                  </Text>
                  {language === 'ro' && (
                    <View style={styles.selectedBadge}>
                      <Ionicons name="checkmark-circle" size={24} color="#00D9FF" />
                    </View>
                  )}
                </TouchableOpacity>
              </View>

              <Text style={styles.helperText}>
                💡 You can change your language preference anytime in Profile → Settings
              </Text>
            </View>
          )}

          {/* Step 1: Basic Info */}
          {step === 1 && (
            <View style={styles.stepContainer}>
              <Text style={styles.emoji}>👋</Text>
              <Text style={styles.title}>{t('onboarding.welcome')}</Text>
              <Text style={styles.subtitle}>
                {t('onboarding.welcome_subtitle')}
              </Text>

              <View style={styles.inputContainer}>
                <Text style={styles.label}>{t('onboarding.name_label')}</Text>
                <TextInput
                  style={styles.input}
                  placeholder={t('onboarding.name')}
                  placeholderTextColor="rgba(255,255,255,0.5)"
                  value={name}
                  onChangeText={setName}
                  autoCapitalize="words"
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.label}>{t('onboarding.email_label')}</Text>
                <TextInput
                  style={styles.input}
                  placeholder={t('onboarding.email')}
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
              <Text style={styles.title}>{t('onboarding.interests')}</Text>
              <Text style={styles.subtitle}>
                {t('onboarding.interests_subtitle')}
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
              <Text style={styles.title}>{t('onboarding.preferences')}</Text>
              <Text style={styles.subtitle}>
                {t('onboarding.preferences_subtitle')}
              </Text>

              <View style={styles.preferenceSection}>
                <Text style={styles.preferenceLabel}>{t('onboarding.energy')}</Text>
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
                        {t(`onboarding.energy.${level}`)}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View style={styles.preferenceSection}>
                <Text style={styles.preferenceLabel}>{t('onboarding.indoor_outdoor')}</Text>
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
                        {t(`onboarding.indoor_outdoor.${pref}`)}
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
              <Text style={styles.title}>{t('onboarding.adventurousness')}</Text>
              <Text style={styles.subtitle}>
                {t('onboarding.adventurousness_subtitle')}
              </Text>

              <View style={styles.sliderContainer}>
                <View style={styles.scaleLabels}>
                  <Text style={styles.scaleLabel}>{t('onboarding.adventurousness_scale.low')}</Text>
                  <Text style={styles.scaleLabel}>{t('onboarding.adventurousness_scale.high')}</Text>
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
                {t('onboarding.adventurousness_helper')}
              </Text>
            </View>
          )}

          {/* Navigation Buttons */}
          <View style={styles.buttonContainer}>
            {step > 0 && (
              <TouchableOpacity
                style={styles.backButton}
                onPress={() => setStep(step - 1)}
              >
                <Text style={styles.buttonText}>{t('onboarding.back')}</Text>
              </TouchableOpacity>
            )}

            {step < 4 ? (
              <TouchableOpacity
                style={styles.nextButton}
                onPress={handleNext}
              >
                <Text style={styles.nextButtonText}>{t('onboarding.next')}</Text>
                <Ionicons name="arrow-forward" size={20} color="#667EEA" />
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
    fontSize: 16,
    fontWeight: '700',
    color: '#667EEA',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  languageOptions: {
    width: '100%',
    gap: tokens.spacing.md,
    marginVertical: tokens.spacing.xl,
  },
  languageCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: tokens.spacing.lg,
    borderRadius: tokens.radius.lg,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.3)',
    gap: tokens.spacing.md,
  },
  languageCardSelected: {
    backgroundColor: 'rgba(0, 217, 255, 0.2)',
    borderColor: '#00D9FF',
  },
  languageFlag: {
    fontSize: 48,
  },
  languageLabel: {
    flex: 1,
    fontSize: 20,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.9)',
  },
  languageLabelSelected: {
    color: '#fff',
  },
  selectedBadge: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
