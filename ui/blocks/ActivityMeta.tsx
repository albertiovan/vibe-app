/**
 * ActivityMeta Component
 * Display activity metadata: time, distance, location
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { theme } from '../theme/tokens';

interface ActivityMetaProps {
  time?: string; // e.g., "2-3h"
  distance?: number; // in km
  location?: string; // city name
  compact?: boolean;
}

export const ActivityMeta: React.FC<ActivityMetaProps> = ({
  time,
  distance,
  location,
  compact = false,
}) => {
  const colors = theme.colors;
  const typo = theme.typography;

  return (
    <View style={[styles.container, compact && styles.containerCompact]}>
      {time && typeof time === 'string' && (
        <View style={styles.metaItem}>
          <Text style={styles.icon}>⏱</Text>
          <Text style={[compact ? typo.caption : typo.bodySmall, { color: colors.fg.tertiary }]}>
            {time}
          </Text>
        </View>
      )}
      
      {distance !== undefined && distance !== null && typeof distance === 'number' && (
        <View style={styles.metaItem}>
          <Text style={styles.icon}>📍</Text>
          <Text style={[compact ? typo.caption : typo.bodySmall, { color: colors.fg.tertiary }]}>
            {distance.toFixed(1)}km
          </Text>
        </View>
      )}
      
      {location && typeof location === 'string' && (
        <View style={styles.metaItem}>
          <Text style={styles.icon}>📌</Text>
          <Text style={[compact ? typo.caption : typo.bodySmall, { color: colors.fg.tertiary }]}>
            {location}
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  containerCompact: {
    gap: 8,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  icon: {
    fontSize: 14,
  },
});
