/**
 * Build Your Vibe Profile - Animated Onboarding Flow
 * Spotify-inspired personality profiling with ML foundation
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Dimensions,
  Animated,
} from 'react-native';

const { width } = Dimensions.get('window');

// Interest categories and items (from our taxonomy)
const INTEREST_CATEGORIES = {
  outdoor: {
    label: 'Outdoor & Adventure',
    emoji: '🏔️',
    interests: [
      { id: 'trails', label: 'Hiking & Trails', emoji: '🥾' },
      { id: 'climbing', label: 'Rock Climbing', emoji: '🧗' },
      { id: 'ski', label: 'Skiing & Winter Sports', emoji: '⛷️' },
      { id: 'water', label: 'Water Activities', emoji: '🏊' },
      { id: 'cycling', label: 'Cycling & Biking', emoji: '🚴' },
      { id: 'adrenaline', label: 'Extreme Sports', emoji: '🪂' }
    ]
  },
  culture: {
    label: 'Culture & Learning',
    emoji: '🏛️',
    interests: [
      { id: 'history', label: 'History & Heritage', emoji: '🏺' },
      { id: 'art', label: 'Art & Museums', emoji: '🎨' },
      { id: 'architecture', label: 'Architecture', emoji: '🏰' },
      { id: 'photography', label: 'Photography', emoji: '📸' },
      { id: 'local_culture', label: 'Local Culture', emoji: '🎭' }
    ]
  },
  social: {
    label: 'Social & Entertainment',
    emoji: '🎉',
    interests: [
      { id: 'nightlife', label: 'Nightlife & Bars', emoji: '🍸' },
      { id: 'music', label: 'Music & Concerts', emoji: '🎵' },
      { id: 'food', label: 'Food & Dining', emoji: '🍽️' },
      { id: 'shopping', label: 'Shopping', emoji: '🛍️' },
      { id: 'festivals', label: 'Events & Festivals', emoji: '🎪' }
    ]
  },
  wellness: {
    label: 'Wellness & Relaxation',
    emoji: '🧘',
    interests: [
      { id: 'spa', label: 'Spa & Wellness', emoji: '💆' },
      { id: 'meditation', label: 'Meditation & Mindfulness', emoji: '🕯️' },
      { id: 'nature', label: 'Nature & Parks', emoji: '🌳' },
      { id: 'yoga', label: 'Yoga & Fitness', emoji: '🧘' }
    ]
  }
};

const RISK_TOLERANCE_OPTIONS = [
  { id: 'chill', label: 'Chill', description: 'Relaxed, easy-going activities', emoji: '😌' },
  { id: 'medium', label: 'Balanced', description: 'Mix of comfort and adventure', emoji: '⚖️' },
  { id: 'high', label: 'Adventurous', description: 'Challenging, exciting experiences', emoji: '🚀' }
];

const TRAVEL_DISTANCE_OPTIONS = [
  { value: 10, label: 'Close by', description: 'Within 10km' },
  { value: 25, label: 'Around the city', description: 'Within 25km' },
  { value: 50, label: 'Day trips', description: 'Within 50km' },
  { value: 100, label: 'Weekend adventures', description: 'Within 100km' },
  { value: 200, label: 'Explore anywhere', description: 'Within 200km' }
];

interface OnboardingFlowProps {
  userId: string;
  onComplete: (profile: any) => void;
  onSkip?: () => void;
}

export default function OnboardingFlow({ userId, onComplete, onSkip }: OnboardingFlowProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [riskTolerance, setRiskTolerance] = useState<string>('medium');
  const [travelWillingness, setTravelWillingness] = useState<number>(50);
  const [loading, setLoading] = useState(false);

  const MINIMUM_INTERESTS = 3;
  const TOTAL_STEPS = 3;

  const steps = [
    'Select Your Interests',
    'Choose Your Style',
    'Set Travel Preferences'
  ];

  const toggleInterest = (interestId: string) => {
    setSelectedInterests(prev => {
      if (prev.includes(interestId)) {
        return prev.filter(id => id !== interestId);
      } else {
        return [...prev, interestId];
      }
    });
  };

  const canProceed = () => {
    switch (currentStep) {
      case 0:
        return selectedInterests.length >= MINIMUM_INTERESTS;
      case 1:
        return riskTolerance !== '';
      case 2:
        return travelWillingness > 0;
      default:
        return false;
    }
  };

  const nextStep = () => {
    if (currentStep < TOTAL_STEPS - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      completeOnboarding();
    }
  };

  const completeOnboarding = async () => {
    setLoading(true);
    
    try {
      const response = await fetch('http://10.103.30.198:3000/api/vibe-profile/onboarding', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          interests: selectedInterests,
          energyLevel: riskTolerance, // Map to energyLevel
          indoorOutdoor: 'either', // Default value
          socialStyle: 'either', // Default value
          opennessScore: Math.ceil(travelWillingness / 40) // Convert travel willingness to 1-5 scale
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        onComplete(data.data.profile);
      } else {
        Alert.alert('Setup Error', data.error || 'Failed to complete setup');
      }
    } catch (error) {
      Alert.alert('Network Error', 'Please check your connection and try again');
    } finally {
      setLoading(false);
    }
  };

  const renderInterestSelection = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>What interests you?</Text>
      <Text style={styles.stepSubtitle}>
        Select at least {MINIMUM_INTERESTS} interests to build your taste profile
      </Text>
      
      <View style={styles.selectionCounter}>
        <Text style={styles.counterText}>
          {selectedInterests.length} of {MINIMUM_INTERESTS} minimum selected
        </Text>
        {selectedInterests.length >= MINIMUM_INTERESTS && (
          <Text style={styles.counterSuccess}>✓ Ready to continue</Text>
        )}
      </View>

      <ScrollView style={styles.categoriesContainer} showsVerticalScrollIndicator={false}>
        {Object.entries(INTEREST_CATEGORIES).map(([categoryKey, category]) => (
          <View key={categoryKey} style={styles.categorySection}>
            <Text style={styles.categoryTitle}>
              {category.emoji} {category.label}
            </Text>
            
            <View style={styles.interestsGrid}>
              {category.interests.map(interest => (
                <TouchableOpacity
                  key={interest.id}
                  style={[
                    styles.interestChip,
                    selectedInterests.includes(interest.id) && styles.interestChipSelected
                  ]}
                  onPress={() => toggleInterest(interest.id)}
                >
                  <Text style={styles.interestEmoji}>{interest.emoji}</Text>
                  <Text style={[
                    styles.interestLabel,
                    selectedInterests.includes(interest.id) && styles.interestLabelSelected
                  ]}>
                    {interest.label}
                  </Text>
                  {selectedInterests.includes(interest.id) && (
                    <Text style={styles.selectedIndicator}>✓</Text>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );

  const renderRiskTolerance = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>What's your style?</Text>
      <Text style={styles.stepSubtitle}>
        Choose how adventurous you like your experiences
      </Text>

      <View style={styles.optionsContainer}>
        {RISK_TOLERANCE_OPTIONS.map(option => (
          <TouchableOpacity
            key={option.id}
            style={[
              styles.optionCard,
              riskTolerance === option.id && styles.optionCardSelected
            ]}
            onPress={() => setRiskTolerance(option.id)}
          >
            <Text style={styles.optionEmoji}>{option.emoji}</Text>
            <Text style={[
              styles.optionLabel,
              riskTolerance === option.id && styles.optionLabelSelected
            ]}>
              {option.label}
            </Text>
            <Text style={[
              styles.optionDescription,
              riskTolerance === option.id && styles.optionDescriptionSelected
            ]}>
              {option.description}
            </Text>
            {riskTolerance === option.id && (
              <Text style={styles.selectedIndicator}>✓</Text>
            )}
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderTravelPreferences = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>How far will you go?</Text>
      <Text style={styles.stepSubtitle}>
        Set your travel distance for discovering new places
      </Text>

      <View style={styles.optionsContainer}>
        {TRAVEL_DISTANCE_OPTIONS.map(option => (
          <TouchableOpacity
            key={option.value}
            style={[
              styles.optionCard,
              travelWillingness === option.value && styles.optionCardSelected
            ]}
            onPress={() => setTravelWillingness(option.value)}
          >
            <Text style={[
              styles.optionLabel,
              travelWillingness === option.value && styles.optionLabelSelected
            ]}>
              {option.label}
            </Text>
            <Text style={[
              styles.optionDescription,
              travelWillingness === option.value && styles.optionDescriptionSelected
            ]}>
              {option.description}
            </Text>
            {travelWillingness === option.value && (
              <Text style={styles.selectedIndicator}>✓</Text>
            )}
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 0:
        return renderInterestSelection();
      case 1:
        return renderRiskTolerance();
      case 2:
        return renderTravelPreferences();
      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Build Your Taste Profile</Text>
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View 
              style={[
                styles.progressFill, 
                { width: `${((currentStep + 1) / TOTAL_STEPS) * 100}%` }
              ]} 
            />
          </View>
          <Text style={styles.progressText}>
            Step {currentStep + 1} of {TOTAL_STEPS}: {steps[currentStep]}
          </Text>
        </View>
      </View>

      {/* Current Step Content */}
      {renderCurrentStep()}

      {/* Navigation */}
      <View style={styles.navigation}>
        {currentStep > 0 && (
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => setCurrentStep(prev => prev - 1)}
          >
            <Text style={styles.backButtonText}>← Back</Text>
          </TouchableOpacity>
        )}
        
        <View style={styles.rightButtons}>
          {onSkip && currentStep === 0 && (
            <TouchableOpacity
              style={styles.skipButton}
              onPress={onSkip}
            >
              <Text style={styles.skipButtonText}>Skip for now</Text>
            </TouchableOpacity>
          )}
          
          <TouchableOpacity
            style={[
              styles.nextButton,
              !canProceed() && styles.nextButtonDisabled
            ]}
            onPress={nextStep}
            disabled={!canProceed() || loading}
          >
            {loading ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <Text style={styles.nextButtonText}>
                {currentStep === TOTAL_STEPS - 1 ? "Complete Setup" : "Continue"}
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 24,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 16,
    textAlign: 'center',
  },
  progressContainer: {
    marginBottom: 8,
  },
  progressBar: {
    height: 4,
    backgroundColor: '#e5e7eb',
    borderRadius: 2,
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#0ea5e9',
    borderRadius: 2,
  },
  progressText: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
  },
  stepContainer: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 24,
  },
  stepTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 8,
    textAlign: 'center',
  },
  stepSubtitle: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 24,
  },
  selectionCounter: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    alignItems: 'center',
  },
  counterText: {
    fontSize: 16,
    color: '#374151',
    fontWeight: '600',
  },
  counterSuccess: {
    fontSize: 14,
    color: '#059669',
    marginTop: 4,
  },
  categoriesContainer: {
    flex: 1,
  },
  categorySection: {
    marginBottom: 32,
  },
  categoryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#374151',
    marginBottom: 16,
  },
  interestsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -6,
  },
  interestChip: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 12,
    margin: 6,
    minWidth: (width - 72) / 2,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#e5e7eb',
  },
  interestChipSelected: {
    borderColor: '#0ea5e9',
    backgroundColor: '#eff6ff',
  },
  interestEmoji: {
    fontSize: 24,
    marginBottom: 8,
  },
  interestLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    textAlign: 'center',
  },
  interestLabelSelected: {
    color: '#0ea5e9',
  },
  selectedIndicator: {
    position: 'absolute',
    top: 8,
    right: 8,
    color: '#0ea5e9',
    fontSize: 16,
    fontWeight: 'bold',
  },
  optionsContainer: {
    flex: 1,
  },
  optionCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: '#e5e7eb',
    position: 'relative',
  },
  optionCardSelected: {
    borderColor: '#0ea5e9',
    backgroundColor: '#eff6ff',
  },
  optionEmoji: {
    fontSize: 32,
    marginBottom: 12,
    textAlign: 'center',
  },
  optionLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#374151',
    marginBottom: 8,
    textAlign: 'center',
  },
  optionLabelSelected: {
    color: '#0ea5e9',
  },
  optionDescription: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
  },
  optionDescriptionSelected: {
    color: '#0ea5e9',
  },
  navigation: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 24,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  backButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  backButtonText: {
    fontSize: 16,
    color: '#6b7280',
    fontWeight: '600',
  },
  rightButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  skipButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginRight: 12,
  },
  skipButtonText: {
    fontSize: 16,
    color: '#6b7280',
    fontWeight: '600',
  },
  nextButton: {
    backgroundColor: '#0ea5e9',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 24,
    minWidth: 120,
    alignItems: 'center',
  },
  nextButtonDisabled: {
    backgroundColor: '#d1d5db',
  },
  nextButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});
