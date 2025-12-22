/**
 * GreetingBlock Component
 * "Hello {name}" + "What's the vibe?" title with shimmer effect
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { theme } from '../theme/tokens';
import { TextShimmer } from '../components/TextShimmer';
import { useLanguage } from '../../src/i18n/LanguageContext';

interface GreetingBlockProps {
  firstName?: string;
}

export const GreetingBlock: React.FC<GreetingBlockProps> = ({
  firstName = 'there',
}) => {
  const colors = theme.colors;
  const typo = theme.typography;
  const { t } = useLanguage();

  const greetingText = `${t('greeting.hello')} ${firstName}, ${t('greeting.whats_the_vibe')}`;

  return (
    <View style={styles.container}>
      <TextShimmer
        duration={3}
        baseColor="rgba(255, 255, 255, 0.7)"
        shimmerColor="rgba(253, 221, 16, 1.0)" // #FDDD10 yellow shimmer
        style={{ ...typo.titleXL, ...styles.greeting }}
      >
        {greetingText}
      </TextShimmer>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginBottom: 36,
  },
  greeting: {
    marginBottom: 10,
    textAlign: 'center',
  },
  title: {
    textAlign: 'center',
    marginBottom: 0,
    fontWeight: '700',
  },
});
