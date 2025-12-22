/**
 * LoadingShimmer Component
 * 
 * Simple loading text (animations temporarily disabled)
 */

import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';

interface LoadingShimmerProps {
  text?: string;
  style?: any;
}

export function LoadingShimmer({
  text = 'Matching your vibe...',
  style,
}: LoadingShimmerProps) {
  return (
    <View style={[styles.container, style]}>
      <ActivityIndicator size="small" color="rgba(0, 217, 255, 0.9)" />
      <Text style={styles.text}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  text: {
    fontSize: 16,
    fontWeight: '400',
    color: 'rgba(255, 255, 255, 0.6)',
  },
});
