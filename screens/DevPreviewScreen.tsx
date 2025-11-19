/**
 * DevPreviewScreen
 * Showcase all UI primitives for development and testing
 */

import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, SafeAreaView, Alert } from 'react-native';
import { OrbBackdrop, GlassCard, GlassButton, AIQueryBar, ShellHeader } from '../ui/components';
import { theme } from '../ui/theme/tokens';
import { useNavigation } from '@react-navigation/native';

export const DevPreviewScreen: React.FC = () => {
  const [themeVariant, setThemeVariant] = useState<'dark' | 'light'>('dark');
  const navigation = useNavigation();
  const colors = theme.colors;
  const typo = theme.typography;

  const handleQuerySubmit = (query: string) => {
    Alert.alert('Query Submitted', query);
  };

  const toggleTheme = () => {
    setThemeVariant((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  return (
    <View style={styles.container}>
      {/* Orb Backdrop */}
      <OrbBackdrop variant={themeVariant} />

      {/* Header */}
      <ShellHeader
        showBack={true}
        showProfile={true}
        onBack={() => navigation.goBack()}
        onProfile={() => Alert.alert('Profile', 'Profile tapped')}
        testID="dev-preview-header"
      />

      <SafeAreaView style={styles.safeArea}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Title */}
          <Text style={[typo.titleXL, styles.title, { color: colors.fg.primary }]}>
            UI Primitives
          </Text>
          <Text style={[typo.body, styles.subtitle, { color: colors.fg.secondary }]}>
            Component showcase and testing
          </Text>

          {/* Theme Toggle */}
          <GlassCard style={styles.section}>
            <Text style={[typo.titleM, styles.sectionTitle, { color: colors.fg.primary }]}>
              Theme
            </Text>
            <GlassButton
              label={`Switch to ${themeVariant === 'dark' ? 'Light' : 'Dark'} Mode`}
              kind="secondary"
              onPress={toggleTheme}
              testID="theme-toggle"
            />
          </GlassCard>

          {/* Buttons */}
          <GlassCard style={styles.section}>
            <Text style={[typo.titleM, styles.sectionTitle, { color: colors.fg.primary }]}>
              Buttons
            </Text>
            
            <View style={styles.buttonRow}>
              <GlassButton
                label="Primary"
                kind="primary"
                onPress={() => Alert.alert('Primary', 'Primary button pressed')}
                testID="btn-primary"
              />
            </View>

            <View style={styles.buttonRow}>
              <GlassButton
                label="Secondary"
                kind="secondary"
                onPress={() => Alert.alert('Secondary', 'Secondary button pressed')}
                testID="btn-secondary"
              />
            </View>

            <View style={styles.buttonRow}>
              <GlassButton
                label="Minimal"
                kind="minimal"
                onPress={() => Alert.alert('Minimal', 'Minimal button pressed')}
                testID="btn-minimal"
              />
            </View>

            <View style={styles.buttonRow}>
              <GlassButton
                label="Disabled"
                kind="primary"
                onPress={() => {}}
                disabled={true}
                testID="btn-disabled"
              />
            </View>

            <View style={styles.buttonRow}>
              <GlassButton
                label="Loading"
                kind="primary"
                onPress={() => {}}
                loading={true}
                testID="btn-loading"
              />
            </View>
          </GlassCard>

          {/* Input */}
          <GlassCard style={styles.section}>
            <Text style={[typo.titleM, styles.sectionTitle, { color: colors.fg.primary }]}>
              AI Query Bar
            </Text>
            <AIQueryBar
              placeholder="Type something..."
              onSubmit={handleQuerySubmit}
              testID="query-bar"
            />
          </GlassCard>

          {/* Cards */}
          <GlassCard style={styles.section} emphasis="low">
            <Text style={[typo.titleM, styles.sectionTitle, { color: colors.fg.primary }]}>
              Glass Card - Low Emphasis
            </Text>
            <Text style={[typo.body, { color: colors.fg.secondary }]}>
              This is a glass card with low emphasis (blur: 12px).
            </Text>
          </GlassCard>

          <GlassCard style={styles.section} emphasis="high">
            <Text style={[typo.titleM, styles.sectionTitle, { color: colors.fg.primary }]}>
              Glass Card - High Emphasis
            </Text>
            <Text style={[typo.body, { color: colors.fg.secondary }]}>
              This is a glass card with high emphasis (blur: 20px).
            </Text>
          </GlassCard>

          {/* Typography */}
          <GlassCard style={styles.section}>
            <Text style={[typo.titleM, styles.sectionTitle, { color: colors.fg.primary }]}>
              Typography
            </Text>
            
            <View style={styles.typoRow}>
              <Text style={[typo.titleXL, { color: colors.fg.primary }]}>Title XL</Text>
              <Text style={[typo.caption, { color: colors.fg.tertiary }]}>36sp, Semi-bold</Text>
            </View>

            <View style={styles.typoRow}>
              <Text style={[typo.titleL, { color: colors.fg.primary }]}>Title L</Text>
              <Text style={[typo.caption, { color: colors.fg.tertiary }]}>28sp, Semi-bold</Text>
            </View>

            <View style={styles.typoRow}>
              <Text style={[typo.titleM, { color: colors.fg.primary }]}>Title M</Text>
              <Text style={[typo.caption, { color: colors.fg.tertiary }]}>20sp, Semi-bold</Text>
            </View>

            <View style={styles.typoRow}>
              <Text style={[typo.bodyLarge, { color: colors.fg.primary }]}>Body Large</Text>
              <Text style={[typo.caption, { color: colors.fg.tertiary }]}>17sp, Regular</Text>
            </View>

            <View style={styles.typoRow}>
              <Text style={[typo.body, { color: colors.fg.primary }]}>Body</Text>
              <Text style={[typo.caption, { color: colors.fg.tertiary }]}>15sp, Regular</Text>
            </View>

            <View style={styles.typoRow}>
              <Text style={[typo.bodySmall, { color: colors.fg.primary }]}>Body Small</Text>
              <Text style={[typo.caption, { color: colors.fg.tertiary }]}>13sp, Regular</Text>
            </View>

            <View style={styles.typoRow}>
              <Text style={[typo.button, { color: colors.fg.primary }]}>Button</Text>
              <Text style={[typo.caption, { color: colors.fg.tertiary }]}>16sp, Medium</Text>
            </View>

            <View style={styles.typoRow}>
              <Text style={[typo.caption, { color: colors.fg.primary }]}>Caption</Text>
              <Text style={[typo.caption, { color: colors.fg.tertiary }]}>12sp, Regular</Text>
            </View>
          </GlassCard>

          {/* Colors */}
          <GlassCard style={styles.section}>
            <Text style={[typo.titleM, styles.sectionTitle, { color: colors.fg.primary }]}>
              Color Tokens
            </Text>
            
            <View style={styles.colorRow}>
              <View style={[styles.colorSwatch, { backgroundColor: colors.gradient.primary.from }]} />
              <Text style={[typo.bodySmall, { color: colors.fg.secondary }]}>Primary From</Text>
            </View>

            <View style={styles.colorRow}>
              <View style={[styles.colorSwatch, { backgroundColor: colors.gradient.primary.to }]} />
              <Text style={[typo.bodySmall, { color: colors.fg.secondary }]}>Primary To</Text>
            </View>

            <View style={styles.colorRow}>
              <View style={[styles.colorSwatch, { backgroundColor: colors.gradient.accent.from }]} />
              <Text style={[typo.bodySmall, { color: colors.fg.secondary }]}>Accent From</Text>
            </View>

            <View style={styles.colorRow}>
              <View style={[styles.colorSwatch, { backgroundColor: colors.gradient.accent.to }]} />
              <Text style={[typo.bodySmall, { color: colors.fg.secondary }]}>Accent To</Text>
            </View>

            <View style={styles.colorRow}>
              <View style={[styles.colorSwatch, { backgroundColor: colors.glass.surface }]} />
              <Text style={[typo.bodySmall, { color: colors.fg.secondary }]}>Glass Surface</Text>
            </View>
          </GlassCard>

          <View style={{ height: 40 }} />
        </ScrollView>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 120,
    paddingBottom: 40,
  },
  title: {
    marginBottom: 8,
  },
  subtitle: {
    marginBottom: 32,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    marginBottom: 16,
  },
  buttonRow: {
    marginBottom: 12,
  },
  typoRow: {
    marginBottom: 12,
  },
  colorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 12,
  },
  colorSwatch: {
    width: 40,
    height: 40,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.22)',
  },
});
