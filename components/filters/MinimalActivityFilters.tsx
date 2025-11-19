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

  // Auto-apply when selections change
  React.useEffect(() => {
    applyFilters();
  }, [selectedDistance, selectedPrices]);

  return (
    <View style={styles.container}>
      {/* Distance Filter */}
      <View style={styles.filterSection}>
        <Text style={styles.sectionTitle}>Distance</Text>
        <View style={styles.optionsRow}>
          {DISTANCE_OPTIONS.map((option) => (
            <TouchableOpacity
              key={option.value?.toString() || 'any'}
              style={[
                styles.optionButton,
                selectedDistance === option.value && styles.optionButtonSelected,
              ]}
              onPress={() => setSelectedDistance(option.value)}
              activeOpacity={0.7}
            >
              <Text style={[
                styles.optionLabel,
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
        <Text style={styles.sectionTitle}>Price</Text>
        <View style={styles.optionsColumn}>
          {PRICE_OPTIONS.map((option) => (
            <TouchableOpacity
              key={option.value}
              style={[
                styles.priceOption,
                selectedPrices.includes(option.value) && styles.priceOptionSelected,
              ]}
              onPress={() => togglePrice(option.value)}
              activeOpacity={0.7}
            >
              <View style={styles.priceContent}>
                <Text style={[
                  styles.priceLabel,
                  selectedPrices.includes(option.value) && styles.priceLabelSelected
                ]}>
                  {option.label}
                </Text>
                {option.subtitle && (
                  <Text style={styles.priceSubtitle}>{option.subtitle}</Text>
                )}
              </View>
              <View style={[
                styles.checkbox,
                selectedPrices.includes(option.value) && styles.checkboxSelected
              ]}>
                {selectedPrices.includes(option.value) && (
                  <Text style={styles.checkmark}>✓</Text>
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
          <Text style={styles.clearButtonText}>Clear All</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#000000',
    paddingVertical: 20,
    paddingHorizontal: 20,
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
