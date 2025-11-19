/**
 * Activity Filters Component
 * Comprehensive filtering UI for activities
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Switch,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export interface FilterOptions {
  // Location
  maxDistanceKm?: number;
  
  // Duration
  durationRange?: 'quick' | 'short' | 'medium' | 'long' | 'full-day' | 'any';
  
  // Crowd
  crowdSize?: string[];
  crowdType?: string[];
  
  // Group
  groupSuitability?: string[];
  
  // Price
  priceTier?: string[];
}

interface ActivityFiltersProps {
  onFiltersChange: (filters: FilterOptions) => void;
  userLocation?: { latitude: number; longitude: number };
  initialFilters?: FilterOptions; // NEW: Accept initial filters from parent
}

const DISTANCE_OPTIONS = [
  { label: 'Nearby', subtitle: '< 2km', value: 2, icon: 'walk' },
  { label: 'Walking', subtitle: '< 5km', value: 5, icon: 'walk' },
  { label: 'Biking', subtitle: '< 10km', value: 10, icon: 'bicycle' },
  { label: 'In City', subtitle: '< 20km', value: 20, icon: 'car' },
  { label: 'Anywhere', subtitle: 'No limit', value: null, icon: 'globe' },
];

const DURATION_OPTIONS = [
  { label: 'Quick', subtitle: '< 1h', value: 'quick', icon: 'flash' },
  { label: 'Short', subtitle: '1-2h', value: 'short', icon: 'time' },
  { label: 'Medium', subtitle: '2-4h', value: 'medium', icon: 'hourglass' },
  { label: 'Long', subtitle: '4-6h', value: 'long', icon: 'timer' },
  { label: 'Full Day', subtitle: '6h+', value: 'full-day', icon: 'sunny' },
];

const CROWD_SIZE_OPTIONS = [
  { label: 'Intimate', subtitle: '2-10 people', value: 'intimate', icon: 'heart' },
  { label: 'Small', subtitle: '10-30', value: 'small', icon: 'people' },
  { label: 'Medium', subtitle: '30-100', value: 'medium', icon: 'people-circle' },
  { label: 'Large', subtitle: '100-500', value: 'large', icon: 'people-outline' },
  { label: 'Massive', subtitle: '500+', value: 'massive', icon: 'globe' },
];

const CROWD_TYPE_OPTIONS = [
  { label: 'Locals', subtitle: 'Romanian vibe', value: 'locals', icon: 'home' },
  { label: 'Mixed', subtitle: 'Diverse crowd', value: 'mixed', icon: 'people' },
  { label: 'Tourists', subtitle: 'International', value: 'tourists', icon: 'airplane' },
];

const GROUP_OPTIONS = [
  { label: 'Solo', subtitle: 'Perfect alone', value: 'solo-friendly', icon: 'person' },
  { label: 'Couples', subtitle: 'For two', value: 'couples', icon: 'heart' },
  { label: 'Small Group', subtitle: '3-6 people', value: 'small-group', icon: 'people' },
  { label: 'Large Group', subtitle: '7+ people', value: 'large-group', icon: 'people-circle' },
];

const PRICE_OPTIONS = [
  { label: 'Free', subtitle: '0 RON', value: 'free', icon: 'gift' },
  { label: 'Budget', subtitle: '< 50 RON', value: 'budget', icon: 'cash' },
  { label: 'Moderate', subtitle: '50-200 RON', value: 'moderate', icon: 'card' },
  { label: 'Premium', subtitle: '200-500 RON', value: 'premium', icon: 'diamond' },
  { label: 'Luxury', subtitle: '500+ RON', value: 'luxury', icon: 'star' },
];

export default function ActivityFilters({ onFiltersChange, userLocation, initialFilters }: ActivityFiltersProps) {
  const [expanded, setExpanded] = useState(true);
  const [selectedDistance, setSelectedDistance] = useState<number | null>(initialFilters?.maxDistanceKm !== undefined ? initialFilters.maxDistanceKm : null);
  const [selectedDuration, setSelectedDuration] = useState<string>(initialFilters?.durationRange || 'any');
  const [selectedCrowdSizes, setSelectedCrowdSizes] = useState<string[]>(initialFilters?.crowdSize || []);
  const [selectedCrowdTypes, setSelectedCrowdTypes] = useState<string[]>(initialFilters?.crowdType || []);
  const [selectedGroups, setSelectedGroups] = useState<string[]>(initialFilters?.groupSuitability || []);
  const [selectedPrices, setSelectedPrices] = useState<string[]>(initialFilters?.priceTier || []);

  const hasActiveFilters = 
    selectedDistance !== null ||
    selectedDuration !== 'any' ||
    selectedCrowdSizes.length > 0 ||
    selectedCrowdTypes.length > 0 ||
    selectedGroups.length > 0 ||
    selectedPrices.length > 0;

  const applyFilters = () => {
    const filters: FilterOptions = {};
    
    if (selectedDistance !== null) {
      filters.maxDistanceKm = selectedDistance;
    }
    
    if (selectedDuration !== 'any') {
      filters.durationRange = selectedDuration as any;
    }
    
    if (selectedCrowdSizes.length > 0) {
      filters.crowdSize = selectedCrowdSizes;
    }
    
    if (selectedCrowdTypes.length > 0) {
      filters.crowdType = selectedCrowdTypes;
    }
    
    if (selectedGroups.length > 0) {
      filters.groupSuitability = selectedGroups;
    }
    
    if (selectedPrices.length > 0) {
      filters.priceTier = selectedPrices;
    }
    
    onFiltersChange(filters);
    setExpanded(false); // Close the panel after applying
  };

  const clearAllFilters = () => {
    setSelectedDistance(null);
    setSelectedDuration('any');
    setSelectedCrowdSizes([]);
    setSelectedCrowdTypes([]);
    setSelectedGroups([]);
    setSelectedPrices([]);
    onFiltersChange({});
  };

  const toggleMultiSelect = (
    value: string,
    selected: string[],
    setter: (val: string[]) => void
  ) => {
    if (selected.includes(value)) {
      setter(selected.filter(v => v !== value));
    } else {
      setter([...selected, value]);
    }
  };

  // Auto-expanded, no collapsed state needed

  return (
    <View style={styles.expandedContainer}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Ionicons name="options" size={24} color="rgba(0, 217, 255, 0.9)" />
          <Text style={styles.headerTitle}>Filters</Text>
        </View>
        <TouchableOpacity onPress={() => onFiltersChange({})}>
          <Ionicons name="close" size={24} color="rgba(255, 255, 255, 0.6)" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Distance Filter */}
        {userLocation && (
          <View style={styles.filterSection}>
            <Text style={styles.sectionTitle}>📍 Distance</Text>
            <View style={styles.optionsGrid}>
              {DISTANCE_OPTIONS.map((option) => (
                <TouchableOpacity
                  key={option.value?.toString() || 'any'}
                  style={[
                    styles.optionCard,
                    selectedDistance === option.value && styles.optionCardSelected,
                  ]}
                  onPress={() => setSelectedDistance(option.value)}
                >
                  <Ionicons
                    name={option.icon as any}
                    size={24}
                    color={selectedDistance === option.value ? 'rgba(0, 217, 255, 0.95)' : 'rgba(255, 255, 255, 0.4)'}
                  />
                  <Text style={[
                    styles.optionLabel,
                    selectedDistance === option.value && styles.optionLabelSelected
                  ]}>
                    {option.label}
                  </Text>
                  <Text style={styles.optionSubtitle}>{option.subtitle}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* Duration Filter */}
        <View style={styles.filterSection}>
          <Text style={styles.sectionTitle}>⏱️ Duration</Text>
          <View style={styles.optionsGrid}>
            {DURATION_OPTIONS.map((option) => (
              <TouchableOpacity
                key={option.value}
                style={[
                  styles.optionCard,
                  selectedDuration === option.value && styles.optionCardSelected,
                ]}
                onPress={() => setSelectedDuration(option.value)}
              >
                <Ionicons
                  name={option.icon as any}
                  size={24}
                  color={selectedDuration === option.value ? 'rgba(0, 217, 255, 0.95)' : 'rgba(255, 255, 255, 0.4)'}
                />
                <Text style={[
                  styles.optionLabel,
                  selectedDuration === option.value && styles.optionLabelSelected
                ]}>
                  {option.label}
                </Text>
                <Text style={styles.optionSubtitle}>{option.subtitle}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Crowd Size Filter */}
        <View style={styles.filterSection}>
          <Text style={styles.sectionTitle}>👥 Crowd Size</Text>
          <Text style={styles.sectionHint}>Select all that work for you</Text>
          <View style={styles.optionsGrid}>
            {CROWD_SIZE_OPTIONS.map((option) => (
              <TouchableOpacity
                key={option.value}
                style={[
                  styles.optionCard,
                  selectedCrowdSizes.includes(option.value) && styles.optionCardSelected,
                ]}
                onPress={() => toggleMultiSelect(option.value, selectedCrowdSizes, setSelectedCrowdSizes)}
              >
                <Ionicons
                  name={option.icon as any}
                  size={24}
                  color={selectedCrowdSizes.includes(option.value) ? 'rgba(0, 217, 255, 0.95)' : 'rgba(255, 255, 255, 0.4)'}
                />
                <Text style={[
                  styles.optionLabel,
                  selectedCrowdSizes.includes(option.value) && styles.optionLabelSelected
                ]}>
                  {option.label}
                </Text>
                <Text style={styles.optionSubtitle}>{option.subtitle}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Crowd Type Filter */}
        <View style={styles.filterSection}>
          <Text style={styles.sectionTitle}>🌍 Vibe</Text>
          <View style={styles.optionsGrid}>
            {CROWD_TYPE_OPTIONS.map((option) => (
              <TouchableOpacity
                key={option.value}
                style={[
                  styles.optionCard,
                  selectedCrowdTypes.includes(option.value) && styles.optionCardSelected,
                ]}
                onPress={() => toggleMultiSelect(option.value, selectedCrowdTypes, setSelectedCrowdTypes)}
              >
                <Ionicons
                  name={option.icon as any}
                  size={24}
                  color={selectedCrowdTypes.includes(option.value) ? 'rgba(0, 217, 255, 0.95)' : 'rgba(255, 255, 255, 0.4)'}
                />
                <Text style={[
                  styles.optionLabel,
                  selectedCrowdTypes.includes(option.value) && styles.optionLabelSelected
                ]}>
                  {option.label}
                </Text>
                <Text style={styles.optionSubtitle}>{option.subtitle}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Group Suitability Filter */}
        <View style={styles.filterSection}>
          <Text style={styles.sectionTitle}>🎯 Group Size</Text>
          <View style={styles.optionsGrid}>
            {GROUP_OPTIONS.map((option) => (
              <TouchableOpacity
                key={option.value}
                style={[
                  styles.optionCard,
                  selectedGroups.includes(option.value) && styles.optionCardSelected,
                ]}
                onPress={() => toggleMultiSelect(option.value, selectedGroups, setSelectedGroups)}
              >
                <Ionicons
                  name={option.icon as any}
                  size={24}
                  color={selectedGroups.includes(option.value) ? 'rgba(0, 217, 255, 0.95)' : 'rgba(255, 255, 255, 0.4)'}
                />
                <Text style={[
                  styles.optionLabel,
                  selectedGroups.includes(option.value) && styles.optionLabelSelected
                ]}>
                  {option.label}
                </Text>
                <Text style={styles.optionSubtitle}>{option.subtitle}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Price Filter */}
        <View style={styles.filterSection}>
          <Text style={styles.sectionTitle}>💰 Price</Text>
          <View style={styles.optionsGrid}>
            {PRICE_OPTIONS.map((option) => (
              <TouchableOpacity
                key={option.value}
                style={[
                  styles.optionCard,
                  selectedPrices.includes(option.value) && styles.optionCardSelected,
                ]}
                onPress={() => toggleMultiSelect(option.value, selectedPrices, setSelectedPrices)}
              >
                <Ionicons
                  name={option.icon as any}
                  size={24}
                  color={selectedPrices.includes(option.value) ? 'rgba(0, 217, 255, 0.95)' : 'rgba(255, 255, 255, 0.4)'}
                />
                <Text style={[
                  styles.optionLabel,
                  selectedPrices.includes(option.value) && styles.optionLabelSelected
                ]}>
                  {option.label}
                </Text>
                <Text style={styles.optionSubtitle}>{option.subtitle}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>

      {/* Action Buttons */}
      <View style={styles.actions}>
        {hasActiveFilters && (
          <TouchableOpacity style={styles.clearButton} onPress={clearAllFilters}>
            <Text style={styles.clearButtonText}>Clear All</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity style={styles.applyButton} onPress={applyFilters}>
          <Text style={styles.applyButtonText}>
            Apply Filters {hasActiveFilters && '✓'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  collapsedContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 170, 255, 0.08)',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(0, 217, 255, 0.2)',
    marginBottom: 16,
  },
  collapsedText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'rgba(0, 217, 255, 0.9)',
    marginLeft: 8,
    flex: 1,
  },
  badge: {
    backgroundColor: 'rgba(0, 217, 255, 0.3)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    fontSize: 12,
    color: '#fff',
  },
  expandedContainer: {
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    borderRadius: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(0, 217, 255, 0.2)',
    shadowColor: 'rgba(0, 217, 255, 0.3)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
    maxHeight: '80%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 217, 255, 0.15)',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: 'rgba(255, 255, 255, 0.95)',
    marginLeft: 12,
  },
  scrollView: {
    maxHeight: 500,
  },
  filterSection: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 217, 255, 0.1)',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: 8,
  },
  sectionHint: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.5)',
    marginBottom: 12,
  },
  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  optionCard: {
    width: '31%',
    backgroundColor: 'rgba(0, 170, 255, 0.05)',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0, 217, 255, 0.15)',
  },
  optionCardSelected: {
    backgroundColor: 'rgba(0, 217, 255, 0.15)',
    borderColor: 'rgba(0, 217, 255, 0.6)',
    borderWidth: 2,
  },
  optionLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.7)',
    marginTop: 8,
    textAlign: 'center',
  },
  optionLabelSelected: {
    color: 'rgba(0, 217, 255, 0.95)',
  },
  optionSubtitle: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.5)',
    marginTop: 2,
    textAlign: 'center',
  },
  actions: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 217, 255, 0.15)',
  },
  clearButton: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  clearButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.6)',
  },
  applyButton: {
    flex: 2,
    backgroundColor: 'rgba(0, 217, 255, 0.9)',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  applyButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },
});
