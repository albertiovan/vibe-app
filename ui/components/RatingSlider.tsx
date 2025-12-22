/**
 * RatingSlider Component
 * Interactive 0-10 rating slider with emoji feedback and haptics
 */

import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Slider from '@react-native-community/slider';
import * as Haptics from 'expo-haptics';
import { theme } from '../theme/tokens';

interface RatingSliderProps {
  onRatingChange: (rating: number) => void;
  initialRating?: number;
}

export function RatingSlider({ 
  onRatingChange, 
  initialRating = 7 
}: RatingSliderProps) {
  const [rating, setRating] = useState(initialRating);
  const [lastThreshold, setLastThreshold] = useState(getThreshold(initialRating));
  
  function getThreshold(value: number): number {
    if (value <= 3) return 0;
    if (value <= 6) return 1;
    if (value <= 9) return 2;
    return 3;
  }
  
  function getRatingLabel(value: number): string {
    if (value <= 3) return 'Not great';
    if (value <= 5) return 'It was okay';
    if (value <= 7) return 'Good';
    if (value <= 9) return 'Very good';
    return 'Amazing!';
  }
  
  function getRatingEmoji(value: number): string {
    if (value <= 3) return '😞';
    if (value <= 5) return '😐';
    if (value <= 7) return '😊';
    if (value <= 9) return '😄';
    return '😍';
  }
  
  function getSliderColor(value: number): string {
    if (value <= 3) return '#FF6B6B'; // Red
    if (value <= 6) return '#FFD93D'; // Yellow
    if (value <= 8) return '#6BCF7F'; // Light green
    return 'rgba(253, 221, 16, 1)'; // Bright yellow for amazing
  }
  
  function handleValueChange(value: number) {
    const rounded = Math.round(value);
    setRating(rounded);
    onRatingChange(rounded);
    
    // Haptic feedback on threshold crossing
    const currentThreshold = getThreshold(rounded);
    if (currentThreshold !== lastThreshold) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      setLastThreshold(currentThreshold);
    }
  }
  
  function handleSlidingComplete(value: number) {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  }
  
  return (
    <View style={styles.container}>
      <View style={styles.sliderContainer}>
        {/* Left emoji */}
        <Text style={styles.emojiLeft}>😐</Text>
        
        {/* Slider */}
        <Slider
          style={styles.slider}
          minimumValue={0}
          maximumValue={10}
          step={1}
          value={rating}
          onValueChange={handleValueChange}
          onSlidingComplete={handleSlidingComplete}
          minimumTrackTintColor={getSliderColor(rating)}
          maximumTrackTintColor="rgba(255, 255, 255, 0.2)"
          thumbTintColor={getSliderColor(rating)}
        />
        
        {/* Right emoji */}
        <Text style={styles.emojiRight}>😍</Text>
      </View>
      
      {/* Labels */}
      <View style={styles.labels}>
        <Text style={styles.labelLeft}>Not great</Text>
        <Text style={styles.labelRight}>Amazing</Text>
      </View>
      
      {/* Current rating display */}
      <View style={styles.ratingDisplay}>
        <Text style={styles.ratingEmoji}>{getRatingEmoji(rating)}</Text>
        <Text style={styles.ratingText}>
          {getRatingLabel(rating)} ({rating}/10)
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 20,
    paddingHorizontal: 16,
  },
  sliderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  emojiLeft: {
    fontSize: 24,
  },
  emojiRight: {
    fontSize: 24,
  },
  slider: {
    flex: 1,
    height: 40,
  },
  labels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 40,
    marginTop: 8,
  },
  labelLeft: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.6)',
  },
  labelRight: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.6)',
  },
  ratingDisplay: {
    alignItems: 'center',
    marginTop: 20,
    padding: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  ratingEmoji: {
    fontSize: 32,
    marginBottom: 8,
  },
  ratingText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
