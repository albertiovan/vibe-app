/**
 * TextShimmer Examples
 * 
 * Various ways to use the TextShimmer component
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { TextShimmer } from './TextShimmer';

export function TextShimmerExamples() {
  return (
    <View style={styles.container}>
      {/* Basic usage */}
      <TextShimmer>
        Hello there, what's the vibe?
      </TextShimmer>

      {/* Custom duration (faster shimmer) */}
      <TextShimmer duration={1.5}>
        Quick shimmer effect
      </TextShimmer>

      {/* Custom colors */}
      <TextShimmer
        baseColor="#6366f1"
        shimmerColor="#a5b4fc"
      >
        Custom colored shimmer
      </TextShimmer>

      {/* With custom styling */}
      <TextShimmer
        style={{
          fontSize: 32,
          fontWeight: '700',
          textAlign: 'center',
        }}
        baseColor="#8b5cf6"
        shimmerColor="#c4b5fd"
      >
        Large bold shimmer
      </TextShimmer>

      {/* Slow, subtle shimmer */}
      <TextShimmer
        duration={4}
        baseColor="#64748b"
        shimmerColor="#94a3b8"
      >
        Slow and subtle
      </TextShimmer>

      {/* Gold shimmer effect */}
      <TextShimmer
        duration={2.5}
        baseColor="#ca8a04"
        shimmerColor="#fef08a"
      >
        Golden shimmer ✨
      </TextShimmer>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 24,
    padding: 20,
  },
});
