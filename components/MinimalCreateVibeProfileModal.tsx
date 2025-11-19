/**
 * Minimal Create Vibe Profile Modal
 * Monochrome form for creating vibe profiles with ALL filter options
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Modal,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { vibeProfilesApi, VibeProfileFilters } from '../src/services/vibeProfilesApi';

interface MinimalCreateVibeProfileModalProps {
  visible: boolean;
  deviceId: string;
  onClose: () => void;
  onProfileCreated: () => void;
  initialFilters?: VibeProfileFilters;
}

const EMOJIS = ['❤️', '🧭', '🎉', '☕', '💪', '🎨', '🍽️', '⚡', '🌅', '🌃', '🏖️', '🏔️'];

const MOODS = [
  { value: 'romantic', label: 'Romantic' },
  { value: 'adventurous', label: 'Adventurous' },
  { value: 'relaxed', label: 'Relaxed' },
  { value: 'energetic', label: 'Energetic' },
  { value: 'curious', label: 'Curious' },
  { value: 'social', label: 'Social' },
];

const CATEGORIES = [
  'romantic', 'adventure', 'nature', 'culture', 'culinary',
  'fitness', 'wellness', 'nightlife', 'sports', 'creative'
];

export const MinimalCreateVibeProfileModal: React.FC<MinimalCreateVibeProfileModalProps> = ({
  visible,
  deviceId,
  onClose,
  onProfileCreated,
  initialFilters,
}) => {
  const insets = useSafeAreaInsets();
  const [name, setName] = useState('');
  const [selectedEmoji, setSelectedEmoji] = useState('✨');
  const [description, setDescription] = useState('');
  const [saving, setSaving] = useState(false);

  // All filter states (kept from original)
  const [energyLevel, setEnergyLevel] = useState<'low' | 'medium' | 'high' | undefined>(
    initialFilters?.energyLevel
  );
  const [groupSize, setGroupSize] = useState<'solo' | 'couple' | 'small-group' | 'large-group' | undefined>(
    initialFilters?.groupSize
  );
  const [selectedMood, setSelectedMood] = useState<string | undefined>(initialFilters?.mood);
  const [selectedCategories, setSelectedCategories] = useState<string[]>(
    initialFilters?.categories || []
  );
  const [budget, setBudget] = useState<'free' | 'budget' | 'moderate' | 'premium' | undefined>(
    initialFilters?.budget
  );
  const [timeOfDay, setTimeOfDay] = useState<'morning' | 'afternoon' | 'evening' | 'night' | 'any' | undefined>(
    initialFilters?.timeOfDay
  );

  const handleSave = async () => {
    if (!name.trim()) {
      alert('Please enter a profile name');
      return;
    }

    setSaving(true);
    try {
      const filters: VibeProfileFilters = {
        energyLevel,
        groupSize,
        mood: selectedMood,
        categories: selectedCategories.length > 0 ? selectedCategories : undefined,
        budget,
        timeOfDay,
      };

      await vibeProfilesApi.createProfile(
        deviceId,
        name.trim(),
        filters,
        selectedEmoji,
        description.trim() || undefined
      );

      console.log('✅ Profile created:', name);
      onProfileCreated();
      resetForm();
      onClose();
    } catch (error) {
      console.error('Failed to create profile:', error);
      alert('Failed to create profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const resetForm = () => {
    setName('');
    setSelectedEmoji('✨');
    setDescription('');
    setEnergyLevel(undefined);
    setGroupSize(undefined);
    setSelectedMood(undefined);
    setSelectedCategories([]);
    setBudget(undefined);
    setTimeOfDay(undefined);
  };

  const toggleCategory = (category: string) => {
    setSelectedCategories(prev =>
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="fullScreen"
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        {/* Explicit top spacer for iPhone notch/status bar */}
        <View style={{ height: insets.top || 50, backgroundColor: '#000000' }} />
        
        <View style={styles.safeArea}>
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.container}
          >
            {/* Header */}
            <View style={styles.header}>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Text style={styles.closeText}>✕</Text>
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Create Vibe Profile</Text>
            <TouchableOpacity
              onPress={handleSave}
              style={styles.saveButton}
              disabled={saving}
            >
              <Text style={[styles.saveButtonText, saving && styles.saveButtonDisabled]}>
                {saving ? 'Saving...' : 'Save'}
              </Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {/* Profile Name */}
            <View style={styles.section}>
              <Text style={styles.label}>PROFILE NAME *</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g., Date Night, Solo Adventure"
                placeholderTextColor="rgba(255, 255, 255, 0.4)"
                value={name}
                onChangeText={setName}
                maxLength={50}
              />
            </View>

            {/* Emoji Picker */}
            <View style={styles.section}>
              <Text style={styles.label}>EMOJI</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.emojiScroll}
              >
                {EMOJIS.map((emoji) => (
                  <TouchableOpacity
                    key={emoji}
                    style={[
                      styles.emojiButton,
                      selectedEmoji === emoji && styles.emojiButtonSelected,
                    ]}
                    onPress={() => setSelectedEmoji(emoji)}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.emojiButtonText}>{emoji}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            {/* Description */}
            <View style={styles.section}>
              <Text style={styles.label}>DESCRIPTION (OPTIONAL)</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="What's this vibe for?"
                placeholderTextColor="rgba(255, 255, 255, 0.4)"
                value={description}
                onChangeText={setDescription}
                multiline
                numberOfLines={2}
                maxLength={100}
              />
            </View>

            {/* Divider */}
            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>FILTERS</Text>
              <View style={styles.dividerLine} />
            </View>

            {/* Energy Level */}
            <View style={styles.section}>
              <Text style={styles.label}>ENERGY LEVEL</Text>
              <View style={styles.optionsRow}>
                {(['low', 'medium', 'high'] as const).map((level) => (
                  <TouchableOpacity
                    key={level}
                    style={[
                      styles.optionButton,
                      energyLevel === level && styles.optionButtonSelected,
                    ]}
                    onPress={() => setEnergyLevel(level)}
                    activeOpacity={0.7}
                  >
                    <Text
                      style={[
                        styles.optionButtonText,
                        energyLevel === level && styles.optionButtonTextSelected,
                      ]}
                    >
                      {level.charAt(0).toUpperCase() + level.slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Who's Joining */}
            <View style={styles.section}>
              <Text style={styles.label}>WHO'S JOINING?</Text>
              <View style={styles.optionsRow}>
                {(['solo', 'couple', 'small-group', 'large-group'] as const).map((size) => (
                  <TouchableOpacity
                    key={size}
                    style={[
                      styles.optionButton,
                      groupSize === size && styles.optionButtonSelected,
                    ]}
                    onPress={() => setGroupSize(size)}
                    activeOpacity={0.7}
                  >
                    <Text
                      style={[
                        styles.optionButtonText,
                        groupSize === size && styles.optionButtonTextSelected,
                      ]}
                    >
                      {size === 'small-group' ? 'Small Group' : 
                       size === 'large-group' ? 'Large Group' :
                       size.charAt(0).toUpperCase() + size.slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Mood */}
            <View style={styles.section}>
              <Text style={styles.label}>MOOD</Text>
              <View style={styles.moodGrid}>
                {MOODS.map((mood) => (
                  <TouchableOpacity
                    key={mood.value}
                    style={[
                      styles.moodButton,
                      selectedMood === mood.value && styles.moodButtonSelected,
                    ]}
                    onPress={() => setSelectedMood(mood.value)}
                    activeOpacity={0.7}
                  >
                    <Text
                      style={[
                        styles.moodButtonText,
                        selectedMood === mood.value && styles.moodButtonTextSelected,
                      ]}
                    >
                      {mood.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Categories */}
            <View style={styles.section}>
              <Text style={styles.label}>ACTIVITY CATEGORIES</Text>
              <View style={styles.categoriesGrid}>
                {CATEGORIES.map((category) => (
                  <TouchableOpacity
                    key={category}
                    style={[
                      styles.categoryChip,
                      selectedCategories.includes(category) && styles.categoryChipSelected,
                    ]}
                    onPress={() => toggleCategory(category)}
                    activeOpacity={0.7}
                  >
                    <Text
                      style={[
                        styles.categoryChipText,
                        selectedCategories.includes(category) && styles.categoryChipTextSelected,
                      ]}
                    >
                      {category.charAt(0).toUpperCase() + category.slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Time of Day */}
            <View style={styles.section}>
              <Text style={styles.label}>TIME OF DAY</Text>
              <View style={styles.optionsRow}>
                {(['morning', 'afternoon', 'evening', 'night'] as const).map((time) => (
                  <TouchableOpacity
                    key={time}
                    style={[
                      styles.optionButton,
                      timeOfDay === time && styles.optionButtonSelected,
                    ]}
                    onPress={() => setTimeOfDay(time)}
                    activeOpacity={0.7}
                  >
                    <Text
                      style={[
                        styles.optionButtonText,
                        timeOfDay === time && styles.optionButtonTextSelected,
                      ]}
                    >
                      {time.charAt(0).toUpperCase() + time.slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Budget */}
            <View style={styles.section}>
              <Text style={styles.label}>BUDGET</Text>
              <View style={styles.optionsRow}>
                {(['free', 'budget', 'moderate', 'premium'] as const).map((budgetLevel) => (
                  <TouchableOpacity
                    key={budgetLevel}
                    style={[
                      styles.optionButton,
                      budget === budgetLevel && styles.optionButtonSelected,
                    ]}
                    onPress={() => setBudget(budgetLevel)}
                    activeOpacity={0.7}
                  >
                    <Text
                      style={[
                        styles.optionButtonText,
                        budget === budgetLevel && styles.optionButtonTextSelected,
                      ]}
                    >
                      {budgetLevel.charAt(0).toUpperCase() + budgetLevel.slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.bottomPadding} />
          </ScrollView>
        </KeyboardAvoidingView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: '#000000',
  },
  safeArea: {
    flex: 1,
    backgroundColor: '#000000',
  },
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  closeButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeText: {
    fontSize: 24,
    color: '#FFFFFF',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  saveButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  saveButtonDisabled: {
    opacity: 0.5,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  section: {
    marginTop: 24,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.6)',
    letterSpacing: 1,
    marginBottom: 12,
  },
  input: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 8,
    padding: 16,
    fontSize: 16,
    color: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  emojiScroll: {
    gap: 8,
  },
  emojiButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  emojiButtonSelected: {
    borderColor: '#FFFFFF',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  emojiButtonText: {
    fontSize: 28,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 32,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  dividerText: {
    fontSize: 12,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.5)',
    paddingHorizontal: 16,
    letterSpacing: 1,
  },
  optionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  optionButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  optionButtonSelected: {
    backgroundColor: '#FFFFFF',
    borderColor: '#FFFFFF',
  },
  optionButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.8)',
  },
  optionButtonTextSelected: {
    color: '#000000',
  },
  moodGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  moodButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  moodButtonSelected: {
    backgroundColor: '#FFFFFF',
    borderColor: '#FFFFFF',
  },
  moodButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.8)',
  },
  moodButtonTextSelected: {
    color: '#000000',
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  categoryChipSelected: {
    backgroundColor: '#FFFFFF',
    borderColor: '#FFFFFF',
  },
  categoryChipText: {
    fontSize: 13,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.8)',
  },
  categoryChipTextSelected: {
    color: '#000000',
  },
  bottomPadding: {
    height: 100,
  },
});
