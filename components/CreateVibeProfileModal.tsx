/**
 * Create Vibe Profile Modal
 * Form for creating/editing custom vibe profiles
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
// @ts-ignore
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../src/design-system/colors';
import { tokens } from '../src/design-system/tokens';
import { vibeProfilesApi, VibeProfileFilters } from '../src/services/vibeProfilesApi';

interface CreateVibeProfileModalProps {
  visible: boolean;
  deviceId: string;
  onClose: () => void;
  onProfileCreated: () => void;
  initialFilters?: VibeProfileFilters;
}

const EMOJIS = ['❤️', '🧭', '🎉', '☕', '💪', '🎨', '🍽️', '⚡', '🌅', '🌃', '🏖️', '🏔️'];

const MOODS = [
  { value: 'romantic', label: 'Romantic', icon: 'heart' },
  { value: 'adventurous', label: 'Adventurous', icon: 'compass' },
  { value: 'relaxed', label: 'Relaxed', icon: 'cafe' },
  { value: 'energetic', label: 'Energetic', icon: 'flash' },
  { value: 'curious', label: 'Curious', icon: 'bulb' },
  { value: 'social', label: 'Social', icon: 'people' },
];

const CATEGORIES = [
  'romantic', 'adventure', 'nature', 'culture', 'culinary',
  'fitness', 'wellness', 'nightlife', 'sports', 'creative'
];

export const CreateVibeProfileModal: React.FC<CreateVibeProfileModalProps> = ({
  visible,
  deviceId,
  onClose,
  onProfileCreated,
  initialFilters,
}) => {
  const [name, setName] = useState('');
  const [selectedEmoji, setSelectedEmoji] = useState('✨');
  const [description, setDescription] = useState('');
  const [saving, setSaving] = useState(false);

  // Filter states
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
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={28} color={colors.text.primary} />
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
            <Text style={styles.label}>Profile Name *</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., Date Night, Solo Adventure"
              placeholderTextColor={colors.text.tertiary}
              value={name}
              onChangeText={setName}
              maxLength={50}
            />
          </View>

          {/* Emoji Picker */}
          <View style={styles.section}>
            <Text style={styles.label}>Choose an Emoji</Text>
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
                >
                  <Text style={styles.emojiButtonText}>{emoji}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Description */}
          <View style={styles.section}>
            <Text style={styles.label}>Description (Optional)</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="What's this vibe for?"
              placeholderTextColor={colors.text.tertiary}
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
            <Text style={styles.dividerText}>Filter Your Vibe</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* Energy Level */}
          <View style={styles.section}>
            <Text style={styles.label}>Energy Level</Text>
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
            <Text style={styles.label}>Who's Joining?</Text>
            <View style={styles.optionsRow}>
              {(['solo', 'couple', 'small-group', 'large-group'] as const).map((size) => (
                <TouchableOpacity
                  key={size}
                  style={[
                    styles.optionButton,
                    groupSize === size && styles.optionButtonSelected,
                  ]}
                  onPress={() => setGroupSize(size)}
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
            <Text style={styles.label}>What's Your Mood?</Text>
            <View style={styles.moodGrid}>
              {MOODS.map((mood) => (
                <TouchableOpacity
                  key={mood.value}
                  style={[
                    styles.moodButton,
                    selectedMood === mood.value && styles.moodButtonSelected,
                  ]}
                  onPress={() => setSelectedMood(mood.value)}
                >
                  <Ionicons
                    name={mood.icon as any}
                    size={20}
                    color={selectedMood === mood.value ? '#fff' : colors.text.secondary}
                  />
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
            <Text style={styles.label}>Activity Categories</Text>
            <View style={styles.categoriesGrid}>
              {CATEGORIES.map((category) => (
                <TouchableOpacity
                  key={category}
                  style={[
                    styles.categoryChip,
                    selectedCategories.includes(category) && styles.categoryChipSelected,
                  ]}
                  onPress={() => toggleCategory(category)}
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
            <Text style={styles.label}>Time of Day</Text>
            <View style={styles.optionsRow}>
              {(['morning', 'afternoon', 'evening', 'night'] as const).map((time) => (
                <TouchableOpacity
                  key={time}
                  style={[
                    styles.optionButton,
                    timeOfDay === time && styles.optionButtonSelected,
                  ]}
                  onPress={() => setTimeOfDay(time)}
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
            <Text style={styles.label}>Budget</Text>
            <View style={styles.optionsRow}>
              {(['free', 'budget', 'moderate', 'premium'] as const).map((budgetLevel) => (
                <TouchableOpacity
                  key={budgetLevel}
                  style={[
                    styles.optionButton,
                    budget === budgetLevel && styles.optionButtonSelected,
                  ]}
                  onPress={() => setBudget(budgetLevel)}
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
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.base.canvas,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: tokens.spacing.md,
    paddingTop: 60,
    paddingBottom: tokens.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  closeButton: {
    padding: tokens.spacing.xs,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text.primary,
  },
  saveButton: {
    padding: tokens.spacing.xs,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#667EEA',
  },
  saveButtonDisabled: {
    opacity: 0.5,
  },
  content: {
    flex: 1,
    paddingHorizontal: tokens.spacing.lg,
  },
  section: {
    marginTop: tokens.spacing.lg,
  },
  label: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: tokens.spacing.sm,
  },
  input: {
    backgroundColor: colors.base.surface,
    borderRadius: tokens.radius.md,
    padding: tokens.spacing.md,
    fontSize: 16,
    color: colors.text.primary,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  emojiScroll: {
    gap: tokens.spacing.sm,
  },
  emojiButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.base.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  emojiButtonSelected: {
    borderColor: '#667EEA',
    backgroundColor: 'rgba(102, 126, 234, 0.1)',
  },
  emojiButtonText: {
    fontSize: 28,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: tokens.spacing.xl,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  dividerText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text.secondary,
    paddingHorizontal: tokens.spacing.md,
  },
  optionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: tokens.spacing.sm,
  },
  optionButton: {
    paddingHorizontal: tokens.spacing.md,
    paddingVertical: tokens.spacing.sm,
    borderRadius: tokens.radius.lg,
    backgroundColor: colors.base.surface,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  optionButtonSelected: {
    backgroundColor: '#667EEA',
    borderColor: '#667EEA',
  },
  optionButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text.primary,
  },
  optionButtonTextSelected: {
    color: '#fff',
  },
  moodGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: tokens.spacing.sm,
  },
  moodButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: tokens.spacing.xs,
    paddingHorizontal: tokens.spacing.md,
    paddingVertical: tokens.spacing.sm,
    borderRadius: tokens.radius.lg,
    backgroundColor: colors.base.surface,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  moodButtonSelected: {
    backgroundColor: '#667EEA',
    borderColor: '#667EEA',
  },
  moodButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text.primary,
  },
  moodButtonTextSelected: {
    color: '#fff',
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: tokens.spacing.sm,
  },
  categoryChip: {
    paddingHorizontal: tokens.spacing.md,
    paddingVertical: tokens.spacing.xs,
    borderRadius: 999,
    backgroundColor: colors.base.surface,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  categoryChipSelected: {
    backgroundColor: '#667EEA',
    borderColor: '#667EEA',
  },
  categoryChipText: {
    fontSize: 13,
    fontWeight: '500',
    color: colors.text.primary,
  },
  categoryChipTextSelected: {
    color: '#fff',
  },
  bottomPadding: {
    height: 100,
  },
});
