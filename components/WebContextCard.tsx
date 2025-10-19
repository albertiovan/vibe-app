/**
 * Web Context Card Component
 * 
 * Displays additional context and tips from web search (Tavily)
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
} from 'react-native';

interface WebContextCardProps {
  webContext: {
    suggestions: string[];
    tips: string[];
  };
  compact?: boolean;
}

export default function WebContextCard({ webContext, compact = false }: WebContextCardProps) {
  if (!webContext.suggestions.length && !webContext.tips.length) {
    return null;
  }

  if (compact) {
    return (
      <View style={styles.compactContainer}>
        <Text style={styles.compactTitle}>💡 Tips & Suggestions</Text>
        {webContext.tips.slice(0, 2).map((tip, index) => (
          <Text key={index} style={styles.compactTip} numberOfLines={2}>
            • {tip}
          </Text>
        ))}
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerIcon}>🔍</Text>
        <Text style={styles.sectionTitle}>Web Insights</Text>
      </View>

      {webContext.suggestions.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.subsectionTitle}>Related Keywords</Text>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            style={styles.tagsContainer}
          >
            {webContext.suggestions.slice(0, 8).map((suggestion, index) => (
              <View key={index} style={styles.tag}>
                <Text style={styles.tagText}>{suggestion}</Text>
              </View>
            ))}
          </ScrollView>
        </View>
      )}

      {webContext.tips.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.subsectionTitle}>Tips & Insights</Text>
          {webContext.tips.slice(0, 3).map((tip, index) => (
            <View key={index} style={styles.tipContainer}>
              <Text style={styles.tipBullet}>💡</Text>
              <Text style={styles.tipText}>{tip}</Text>
            </View>
          ))}
        </View>
      )}

      <View style={styles.footer}>
        <Text style={styles.footerText}>Powered by web search</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff5e6',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#ff9800',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerIcon: {
    fontSize: 18,
    marginRight: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
  },
  section: {
    marginBottom: 16,
  },
  subsectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ff9800',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  tagsContainer: {
    flexDirection: 'row',
  },
  tag: {
    backgroundColor: '#fff',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#ff9800',
  },
  tagText: {
    fontSize: 12,
    color: '#ff9800',
    fontWeight: '600',
  },
  tipContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  tipBullet: {
    fontSize: 14,
    marginRight: 8,
    marginTop: 2,
  },
  tipText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
    color: '#555',
  },
  footer: {
    borderTopWidth: 1,
    borderTopColor: '#ffe0b3',
    paddingTop: 8,
    marginTop: 8,
  },
  footerText: {
    fontSize: 11,
    color: '#999',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  // Compact styles
  compactContainer: {
    backgroundColor: '#fff5e6',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#ff9800',
  },
  compactTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#ff9800',
    marginBottom: 8,
  },
  compactTip: {
    fontSize: 12,
    lineHeight: 16,
    color: '#555',
    marginBottom: 4,
  },
});
