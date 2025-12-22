/**
 * Component Showcase Screen
 * Demo screen to test new UI/UX components
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { BorderBeam } from '../ui/components/BorderBeam';
import { ShineBorder } from '../ui/components/ShineBorder';
import { AnimatedGradientBackground } from '../ui/components/AnimatedGradientBackground';
import { CategoryGradientCard } from '../ui/components/CategoryGradientCard';
import { GlowButton } from '../ui/components/GlowButton';
import { ThemeToggle } from '../components/ThemeToggle';
import { useTheme } from '../src/contexts/ThemeContext';
import { colors, getCategoryColor } from '../src/design-system/colors';
import { tokens } from '../src/design-system/tokens';

export const ComponentShowcaseScreen: React.FC = () => {
  const navigation = useNavigation();
  const { resolvedTheme, colors: themeColors } = useTheme();
  const [selectedCategory, setSelectedCategory] = useState('wellness');

  const categories = [
    'wellness', 'nature', 'culture', 'adventure', 'culinary',
    'water', 'nightlife', 'social', 'fitness', 'sports'
  ];

  const dynamicStyles = {
    container: {
      flex: 1,
      backgroundColor: themeColors.background,
    },
    backButton: {
      fontSize: 16,
      color: themeColors.text.primary,
      fontWeight: '500' as const,
    },
    title: {
      fontSize: 20,
      fontWeight: '700' as const,
      color: themeColors.text.primary,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: '700' as const,
      color: themeColors.text.primary,
      marginBottom: 4,
    },
    sectionDesc: {
      fontSize: 14,
      color: themeColors.text.secondary,
      marginBottom: 16,
    },
    demoCardTitle: {
      fontSize: 18,
      fontWeight: '600' as const,
      color: themeColors.text.primary,
      marginBottom: 8,
    },
    demoCardText: {
      fontSize: 14,
      color: themeColors.text.secondary,
      lineHeight: 20,
    },
    categoryChip: {
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 16,
      backgroundColor: themeColors.surface,
      borderWidth: 1,
      borderColor: themeColors.border,
      marginRight: 8,
    },
    categoryChipText: {
      fontSize: 13,
      color: themeColors.text.secondary,
      fontWeight: '500' as const,
      textTransform: 'capitalize' as const,
    },
    colorLabel: {
      fontSize: 10,
      color: themeColors.text.tertiary,
      textAlign: 'center' as const,
    },
  };

  const gradientColors = resolvedTheme === 'light'
    ? (['#F5F5F5', '#E5E5E5', '#EFEFEF'] as const)
    : (['#0A0E17', '#1A2332', '#0F1922'] as const);

  return (
    <View style={dynamicStyles.container}>
      {/* Background */}
      <AnimatedGradientBackground
        colors={gradientColors}
        duration={10000}
      />

      <SafeAreaView style={styles.safeArea} edges={['top']}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={dynamicStyles.backButton}>← Back</Text>
          </TouchableOpacity>
          <Text style={dynamicStyles.title}>Component Showcase</Text>
          <View style={{ width: 60 }} />
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Theme Toggle */}
          <View style={styles.section}>
            <Text style={dynamicStyles.sectionTitle}>Theme Toggle</Text>
            <Text style={dynamicStyles.sectionDesc}>Current: {resolvedTheme}</Text>
            <ThemeToggle />
          </View>

          {/* BorderBeam */}
          <View style={styles.section}>
            <Text style={dynamicStyles.sectionTitle}>BorderBeam</Text>
            <Text style={dynamicStyles.sectionDesc}>Shimmering border for Challenge Me cards</Text>
            <BorderBeam
              lightColor={colors.highEnergy.primary}
              borderWidth={2}
              duration={8000}
              borderRadius={20}
              backgroundColor={themeColors.background}
              style={{ width: 320, height: 140 }}
            >
              <View style={styles.demoCard}>
                <Text style={dynamicStyles.demoCardTitle}>⚡ Challenge Card</Text>
                <Text style={dynamicStyles.demoCardText}>
                  Watch the light travel around the border
                </Text>
              </View>
            </BorderBeam>
          </View>

          {/* ShineBorder */}
          <View style={styles.section}>
            <Text style={dynamicStyles.sectionTitle}>ShineBorder</Text>
            <Text style={dynamicStyles.sectionDesc}>Subtle passing light for focused cards</Text>
            <ShineBorder
              shineColor={getCategoryColor(selectedCategory)}
              duration={3000}
              repeat={true}
              borderRadius={16}
              backgroundColor={themeColors.surface}
            >
              <View style={styles.demoCard}>
                <Text style={dynamicStyles.demoCardTitle}>✨ Focused Card</Text>
                <Text style={dynamicStyles.demoCardText}>
                  Watch the subtle shine pass across this card
                </Text>
              </View>
            </ShineBorder>
          </View>

          {/* CategoryGradientCard */}
          <View style={styles.section}>
            <Text style={dynamicStyles.sectionTitle}>CategoryGradientCard</Text>
            <Text style={dynamicStyles.sectionDesc}>Activity cards with category auras</Text>
            
            {/* Category selector */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.categoryScroll}
            >
              {categories.map((cat) => (
                <TouchableOpacity
                  key={cat}
                  style={[
                    dynamicStyles.categoryChip,
                    selectedCategory === cat && {
                      borderColor: getCategoryColor(cat),
                      backgroundColor: getCategoryColor(cat) + '20',
                    },
                  ]}
                  onPress={() => setSelectedCategory(cat)}
                >
                  <Text
                    style={[
                      dynamicStyles.categoryChipText,
                      selectedCategory === cat && { color: themeColors.text.primary },
                    ]}
                  >
                    {cat}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <CategoryGradientCard
              category={selectedCategory}
              intensity="medium"
              borderRadius={20}
            >
              <Text style={dynamicStyles.demoCardTitle}>
                {selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1)} Activity
              </Text>
              <Text style={dynamicStyles.demoCardText}>
                This card has a subtle {selectedCategory} category aura
              </Text>
            </CategoryGradientCard>
          </View>

          {/* GlowButton */}
          <View style={styles.section}>
            <Text style={dynamicStyles.sectionTitle}>GlowButton</Text>
            <Text style={dynamicStyles.sectionDesc}>Breathing glow for primary CTAs</Text>
            <GlowButton
              onPress={() => alert('Glow button pressed!')}
              title="Accept Challenge"
              glowColor={colors.highEnergy.primary}
              textColor="#000000"
              borderRadius={16}
            />
          </View>

          {/* Color Palette */}
          <View style={styles.section}>
            <Text style={dynamicStyles.sectionTitle}>Category Colors</Text>
            <Text style={dynamicStyles.sectionDesc}>All 15 category colors</Text>
            <View style={styles.colorGrid}>
              {[
                'wellness', 'nature', 'culture', 'adventure', 'culinary',
                'water', 'nightlife', 'social', 'fitness', 'sports',
                'seasonal', 'romance', 'mindfulness', 'creative'
              ].map((cat) => (
                <View key={cat} style={styles.colorItem}>
                  <View
                    style={[
                      styles.colorSwatch,
                      { backgroundColor: getCategoryColor(cat) },
                    ]}
                  />
                  <Text style={dynamicStyles.colorLabel}>{cat}</Text>
                </View>
              ))}
            </View>
          </View>

          <View style={{ height: 40 }} />
        </ScrollView>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0E17',
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  backButton: {
    fontSize: 16,
    color: colors.text.primary,
    fontWeight: '500',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text.primary,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text.primary,
    marginBottom: 4,
  },
  sectionDesc: {
    fontSize: 14,
    color: colors.text.secondary,
    marginBottom: 16,
  },
  demoCard: {
    padding: 20,
    minHeight: 120,
  },
  demoCardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: 8,
  },
  demoCardText: {
    fontSize: 14,
    color: colors.text.secondary,
    lineHeight: 20,
  },
  categoryScroll: {
    marginBottom: 16,
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    marginRight: 8,
  },
  categoryChipText: {
    fontSize: 13,
    color: colors.text.secondary,
    fontWeight: '500',
    textTransform: 'capitalize',
  },
  colorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  colorItem: {
    alignItems: 'center',
    width: 70,
  },
  colorSwatch: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginBottom: 6,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  colorLabel: {
    fontSize: 10,
    color: colors.text.tertiary,
    textAlign: 'center',
  },
});
