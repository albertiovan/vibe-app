/**
 * Minimal Activity Filters Component
 * Simplified monochrome filtering UI with only price and distance
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { useTheme } from '../../src/contexts/ThemeContext';

export interface FilterOptions {
  // Location
  maxDistanceKm?: number | null;
  
  // Price
  priceTier?: string[];
}

interface MinimalActivityFiltersProps {
  onFiltersChange: (filters: FilterOptions) => void;
}

const DISTANCE_OPTIONS = [
  { label: 'In City', value: 20 },
  { label: 'Explore Romania', value: null },
];

const PRICE_OPTIONS = [
  { label: 'Free', value: 'free' },
  { label: 'Budget', subtitle: '< 50 RON', value: 'budget' },
  { label: 'Moderate', subtitle: '50-200 RON', value: 'moderate' },
  { label: 'Premium', subtitle: '200+ RON', value: 'premium' },
];

export default function MinimalActivityFilters({ onFiltersChange }: MinimalActivityFiltersProps) {
  const { colors: themeColors, resolvedTheme } = useTheme();
  const [selectedDistance, setSelectedDistance] = useState<number | null | undefined>(undefined);
  const [selectedPrices, setSelectedPrices] = useState<string[]>([]);

  const hasActiveFilters = 
    selectedDistance !== undefined ||
    selectedPrices.length > 0;

  const applyFilters = () => {
    const filters: FilterOptions = {};
    
    if (selectedDistance !== undefined) {
      filters.maxDistanceKm = selectedDistance;
    }
    
    if (selectedPrices.length > 0) {
      filters.priceTier = selectedPrices;
    }
    
    onFiltersChange(filters);
  };

  const clearAllFilters = () => {
    setSelectedDistance(undefined);
    setSelectedPrices([]);
    onFiltersChange({});
  };

  const togglePrice = (value: string) => {
    if (selectedPrices.includes(value)) {
      const newPrices = selectedPrices.filter(v => v !== value);
      setSelectedPrices(newPrices);
    } else {
      const newPrices = [...selectedPrices, value];
      setSelectedPrices(newPrices);
    }
  };

  // Apply filters immediately when selections change
  React.useEffect(() => {
    const filters: FilterOptions = {};
    
    if (selectedDistance !== undefined) {
      filters.maxDistanceKm = selectedDistance;
    }
    
    if (selectedPrices.length > 0) {
      filters.priceTier = selectedPrices;
    }
    
    // Call onFiltersChange but don't close the panel
    onFiltersChange(filters);
  }, [selectedDistance, selectedPrices]);

  return (
    <View style={styles.container}>
      {/* Distance Filter */}
      <View style={styles.filterSection}>
        <Text style={[styles.sectionTitle, { color: themeColors.text.tertiary }]}>Distance</Text>
        <View style={styles.optionsRow}>
          {DISTANCE_OPTIONS.map((option) => (
            <TouchableOpacity
              key={option.value?.toString() || 'any'}
              style={[
                styles.optionButton,
                {
                  backgroundColor: selectedDistance === option.value
                    ? (resolvedTheme === 'light' ? 'rgba(0, 0, 0, 0.08)' : '#FFFFFF')
                    : (resolvedTheme === 'light' ? 'rgba(0, 0, 0, 0.03)' : 'rgba(255, 255, 255, 0.05)'),
                  borderColor: selectedDistance === option.value
                    ? (resolvedTheme === 'light' ? 'rgba(0, 0, 0, 0.2)' : '#FFFFFF')
                    : (resolvedTheme === 'light' ? 'rgba(0, 0, 0, 0.1)' : 'rgba(255, 255, 255, 0.2)'),
                },
                selectedDistance === option.value && styles.optionButtonSelected,
              ]}
              onPress={() => setSelectedDistance(option.value)}
              activeOpacity={0.7}
            >
              <Text style={[
                styles.optionLabel,
                { color: selectedDistance === option.value ? themeColors.text.primary : themeColors.text.secondary },
                selectedDistance === option.value && styles.optionLabelSelected
              ]}>
                {option.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Price Filter */}
      <View style={styles.filterSection}>
        <Text style={[styles.sectionTitle, { color: themeColors.text.tertiary }]}>Price</Text>
        <View style={styles.optionsColumn}>
          {PRICE_OPTIONS.map((option) => (
            <TouchableOpacity
              key={option.value}
              style={[
                styles.priceOption,
                {
                  backgroundColor: selectedPrices.includes(option.value)
                    ? (resolvedTheme === 'light' ? 'rgba(0, 0, 0, 0.06)' : 'rgba(255, 255, 255, 0.1)')
                    : (resolvedTheme === 'light' ? 'rgba(0, 0, 0, 0.03)' : 'rgba(255, 255, 255, 0.05)'),
                  borderColor: selectedPrices.includes(option.value)
                    ? (resolvedTheme === 'light' ? 'rgba(0, 0, 0, 0.15)' : 'rgba(255, 255, 255, 0.4)')
                    : (resolvedTheme === 'light' ? 'rgba(0, 0, 0, 0.1)' : 'rgba(255, 255, 255, 0.2)'),
                },
                selectedPrices.includes(option.value) && styles.priceOptionSelected,
              ]}
              onPress={() => togglePrice(option.value)}
              activeOpacity={0.7}
            >
              <View style={styles.priceContent}>
                <Text style={[
                  styles.priceLabel,
                  { color: selectedPrices.includes(option.value) ? themeColors.text.primary : themeColors.text.secondary },
                  selectedPrices.includes(option.value) && styles.priceLabelSelected
                ]}>
                  {option.label}
                </Text>
                {option.subtitle && (
                  <Text style={[styles.priceSubtitle, { color: themeColors.text.tertiary }]}>{option.subtitle}</Text>
                )}
              </View>
              <View style={[
                styles.checkbox,
                {
                  backgroundColor: selectedPrices.includes(option.value)
                    ? (resolvedTheme === 'light' ? '#000000' : '#FFFFFF')
                    : 'transparent',
                  borderColor: selectedPrices.includes(option.value)
                    ? (resolvedTheme === 'light' ? '#000000' : '#FFFFFF')
                    : (resolvedTheme === 'light' ? 'rgba(0, 0, 0, 0.2)' : 'rgba(255, 255, 255, 0.3)'),
                },
                selectedPrices.includes(option.value) && styles.checkboxSelected
              ]}>
                {selectedPrices.includes(option.value) && (
                  <Text style={[styles.checkmark, { color: resolvedTheme === 'light' ? '#FFFFFF' : '#000000' }]}>✓</Text>
                )}
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Clear Button */}
      {hasActiveFilters && (
        <TouchableOpacity 
          style={styles.clearButton} 
          onPress={clearAllFilters}
          activeOpacity={0.7}
        >
          <Text style={[styles.clearButtonText, { color: themeColors.text.secondary }]}>Clear All</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'transparent',
    paddingVertical: 20,
    paddingHorizontal: 20,
    paddingBottom: 120,
    gap: 24,
  },
  filterSection: {
    gap: 12,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.6)',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  optionsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  optionButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    alignItems: 'center',
  },
  optionButtonSelected: {
    borderColor: '#FFFFFF',
    backgroundColor: '#FFFFFF',
  },
  optionLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.8)',
  },
  optionLabelSelected: {
    color: '#000000',
  },
  optionsColumn: {
    gap: 8,
  },
  priceOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  priceOptionSelected: {
    borderColor: 'rgba(255, 255, 255, 0.4)',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  priceContent: {
    flex: 1,
  },
  priceLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.8)',
  },
  priceLabelSelected: {
    color: '#FFFFFF',
  },
  priceSubtitle: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.5)',
    marginTop: 2,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxSelected: {
    borderColor: '#FFFFFF',
    backgroundColor: '#FFFFFF',
  },
  checkmark: {
    fontSize: 12,
    fontWeight: '700',
    color: '#000000',
  },
  clearButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    marginTop: 8,
  },
  clearButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.6)',
  },
});
