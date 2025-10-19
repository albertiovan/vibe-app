/**
 * Wikipedia Info Component
 * 
 * Displays contextual information about activities from Wikipedia
 */

import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Linking,
  Alert,
  Image,
} from 'react-native';
import { WikipediaSummary } from '../src/services/enrichmentApi';

interface WikipediaInfoProps {
  summary: WikipediaSummary;
  compact?: boolean;
}

export default function WikipediaInfo({ summary, compact = false }: WikipediaInfoProps) {
  const handleOpenWikipedia = async () => {
    try {
      if (!summary.url) {
        Alert.alert('Error', 'Wikipedia URL not available');
        return;
      }
      await Linking.openURL(summary.url);
    } catch (error) {
      console.error('Error opening Wikipedia:', error);
      Alert.alert('Error', 'Could not open Wikipedia article');
    }
  };

  if (compact) {
    return (
      <View style={styles.compactContainer}>
        <View style={styles.compactHeader}>
          <Text style={styles.compactTitle}>About this activity</Text>
          <TouchableOpacity onPress={handleOpenWikipedia}>
            <Text style={styles.wikipediaLink}>Wikipedia ↗</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.compactExtract} numberOfLines={3}>
          {summary.extract || 'No description available'}
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <Text style={styles.sectionTitle}>About this activity</Text>
          <Text style={styles.articleTitle}>{summary.title || 'Activity Information'}</Text>
        </View>
        {summary.thumbnail && (
          <Image source={{ uri: summary.thumbnail.source }} style={styles.thumbnail} />
        )}
      </View>
      
      <Text style={styles.extract}>{summary.extract || 'No description available'}</Text>
      
      <TouchableOpacity style={styles.wikipediaButton} onPress={handleOpenWikipedia}>
        <Text style={styles.wikipediaIcon}>📖</Text>
        <Text style={styles.wikipediaButtonText}>Read more on Wikipedia</Text>
        <Text style={styles.externalIcon}>↗</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#4285f4',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  titleContainer: {
    flex: 1,
    marginRight: 12,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4285f4',
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  articleTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
  },
  thumbnail: {
    width: 60,
    height: 60,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
  },
  extract: {
    fontSize: 15,
    lineHeight: 22,
    color: '#555',
    marginBottom: 16,
  },
  wikipediaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  wikipediaIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  wikipediaButtonText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: '#4285f4',
  },
  externalIcon: {
    fontSize: 14,
    color: '#666',
  },
  // Compact styles
  compactContainer: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#4285f4',
  },
  compactHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  compactTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#4285f4',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  wikipediaLink: {
    fontSize: 12,
    color: '#4285f4',
    fontWeight: '600',
  },
  compactExtract: {
    fontSize: 13,
    lineHeight: 18,
    color: '#555',
  },
});
