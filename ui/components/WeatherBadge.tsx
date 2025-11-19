/**
 * WeatherBadge Component
 * Displays current weather for activity location
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { BlurView } from 'expo-blur';
import { theme } from '../theme/tokens';

interface WeatherData {
  temperature: number;
  condition: string;
  precipitation: number;
  suitability: 'good' | 'ok' | 'bad';
  icon: string;
  description: string;
  warning?: string | null;
}

interface WeatherBadgeProps {
  weather: WeatherData;
  compact?: boolean; // Compact mode for smaller displays
}

export const WeatherBadge: React.FC<WeatherBadgeProps> = ({ weather, compact = false }) => {
  const colors = theme.colors;
  const typo = theme.typography;

  // Determine badge color based on suitability
  const getBadgeColor = () => {
    switch (weather.suitability) {
      case 'good':
        return {
          bg: 'rgba(34, 197, 94, 0.2)', // Green
          border: 'rgba(34, 197, 94, 0.4)',
          text: '#22C55E'
        };
      case 'ok':
        return {
          bg: 'rgba(251, 191, 36, 0.2)', // Yellow
          border: 'rgba(251, 191, 36, 0.4)',
          text: '#FBBF24'
        };
      case 'bad':
        return {
          bg: 'rgba(239, 68, 68, 0.2)', // Red
          border: 'rgba(239, 68, 68, 0.4)',
          text: '#EF4444'
        };
    }
  };

  const badgeColor = getBadgeColor();

  if (compact) {
    // Compact mode: Just icon and temperature
    return (
      <View style={[styles.compactBadge, { backgroundColor: badgeColor.bg, borderColor: badgeColor.border }]}>
        <Text style={[styles.compactText, { color: badgeColor.text }]}>
          {weather.icon} {weather.temperature}°C
        </Text>
      </View>
    );
  }

  // Full mode: Icon, temperature, and condition
  return (
    <BlurView intensity={20} tint="dark" style={styles.badge}>
      <View style={[styles.badgeContent, { backgroundColor: badgeColor.bg, borderColor: badgeColor.border }]}>
        <Text style={[styles.icon]}>{weather.icon}</Text>
        <View style={styles.textContainer}>
          <Text style={[typo.bodySmall, { color: badgeColor.text, fontWeight: '600' }]}>
            {weather.temperature}°C
          </Text>
          {weather.precipitation > 0 && (
            <Text style={[typo.caption, { color: badgeColor.text, opacity: 0.8 }]}>
              {weather.precipitation.toFixed(1)}mm
            </Text>
          )}
        </View>
      </View>
      
      {/* Warning badge if present */}
      {weather.warning && (
        <View style={[styles.warningBadge, { backgroundColor: 'rgba(239, 68, 68, 0.2)', borderColor: 'rgba(239, 68, 68, 0.4)' }]}>
          <Text style={[typo.caption, { color: '#EF4444' }]}>
            {weather.warning}
          </Text>
        </View>
      )}
    </BlurView>
  );
};

const styles = StyleSheet.create({
  badge: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  badgeContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    borderWidth: 1,
    gap: 8,
  },
  icon: {
    fontSize: 20,
  },
  textContainer: {
    flexDirection: 'column',
    gap: 2,
  },
  compactBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
  },
  compactText: {
    fontSize: 13,
    fontWeight: '600',
  },
  warningBadge: {
    marginTop: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
  },
});
