/**
 * RainbowButton Examples
 * 
 * Various ways to use the RainbowButton component
 */

import React from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { RainbowButton } from './RainbowButton';

export function RainbowButtonExamples() {
  return (
    <View style={styles.container}>
      {/* Basic usage */}
      <RainbowButton onPress={() => Alert.alert('Pressed!')}>
        Get Started
      </RainbowButton>

      {/* Challenge Me style */}
      <RainbowButton onPress={() => Alert.alert('Challenge accepted!')}>
        ⚡ CHALLENGE ME ⚡
      </RainbowButton>

      {/* Faster animation */}
      <RainbowButton
        speed={1}
        onPress={() => Alert.alert('Fast!')}
      >
        Quick Rainbow
      </RainbowButton>

      {/* Slower animation */}
      <RainbowButton
        speed={4}
        onPress={() => Alert.alert('Slow!')}
      >
        Slow Rainbow
      </RainbowButton>

      {/* Disabled state */}
      <RainbowButton disabled>
        Disabled Button
      </RainbowButton>

      {/* Custom text style */}
      <RainbowButton
        textStyle={{
          fontSize: 18,
          fontWeight: '700',
          letterSpacing: 1,
        }}
        onPress={() => Alert.alert('Custom style!')}
      >
        CUSTOM STYLE
      </RainbowButton>

      {/* Premium action */}
      <RainbowButton onPress={() => Alert.alert('Premium!')}>
        🌟 Get Premium Access
      </RainbowButton>

      {/* Explore action */}
      <RainbowButton onPress={() => Alert.alert('Exploring!')}>
        🚀 Let's Explore
      </RainbowButton>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 20,
    padding: 20,
    backgroundColor: '#000',
  },
});
