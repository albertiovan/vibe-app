/**
 * BottomNavBar
 * Compact bottom navigation with smooth animations
 * Shows icon only for inactive tabs, icon + label for active tab
 */

import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { useTheme } from '../../src/contexts/ThemeContext';
import { useLanguage } from '../../src/i18n/LanguageContext';

export type NavTab = 'home' | 'profile' | 'challenge' | 'community';

interface BottomNavBarProps {
  activeTab: NavTab;
  onTabChange: (tab: NavTab) => void;
}

export const BottomNavBar: React.FC<BottomNavBarProps> = ({
  activeTab,
  onTabChange,
}) => {
  const { resolvedTheme, colors: themeColors } = useTheme();
  const { t } = useLanguage();

  const tabs = [
    { id: 'home' as NavTab, labelKey: 'nav.home', icon: '🏠' },
    { id: 'community' as NavTab, labelKey: 'nav.community', icon: '👥' },
    { id: 'challenge' as NavTab, labelKey: 'nav.challenge', icon: '⚡' },
    { id: 'profile' as NavTab, labelKey: 'nav.profile', icon: '👤' },
  ];

  // Calculate pill position and width based on active tab
  const getPillData = (tab: NavTab) => {
    // Fixed positions for each tab to ensure proper alignment
    // More evenly spaced for consistent animation feel
    switch (tab) {
      case 'home': 
        return { x: 6, width: 85 };
      case 'community': 
        return { x: 63, width: 105 };
      case 'challenge': 
        return { x: 125, width: 108 };
      case 'profile': 
        return { x: 187, width: 85 };
    }
  };

  // Single pill animation - initialize with current active tab position
  const initialPillData = getPillData(activeTab);
  const pillTranslateX = useSharedValue(initialPillData.x);
  const pillWidth = useSharedValue(initialPillData.width);
  
  // Individual tab content animations for subtle movement
  const homeTranslateX = useSharedValue(activeTab === 'home' ? 2 : 0);
  const communityTranslateX = useSharedValue(activeTab === 'community' ? 2 : 0);
  const challengeTranslateX = useSharedValue(activeTab === 'challenge' ? 2 : 0);
  const profileTranslateX = useSharedValue(activeTab === 'profile' ? 2 : 0);

  // Update pill position and width when activeTab changes
  React.useEffect(() => {
    const pillData = getPillData(activeTab);
    pillTranslateX.value = withTiming(pillData.x, { 
      duration: 300,
    });
    pillWidth.value = withTiming(pillData.width, { 
      duration: 300,
    });
    
    // Subtle lateral movement for tab content (2px shift when active)
    homeTranslateX.value = withTiming(activeTab === 'home' ? 2 : 0, { duration: 300 });
    communityTranslateX.value = withTiming(activeTab === 'community' ? 2 : 0, { duration: 300 });
    challengeTranslateX.value = withTiming(activeTab === 'challenge' ? 2 : 0, { duration: 300 });
    profileTranslateX.value = withTiming(activeTab === 'profile' ? 2 : 0, { duration: 300 });
  }, [activeTab]);

  // Animated style for the sliding pill
  const pillAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: pillTranslateX.value }],
    width: pillWidth.value,
  }));

  // Animated styles for each tab content
  const homeAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: homeTranslateX.value }],
  }));

  const communityAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: communityTranslateX.value }],
  }));

  const challengeAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: challengeTranslateX.value }],
  }));

  const profileAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: profileTranslateX.value }],
  }));

  const getTabAnimatedStyle = (tabId: NavTab) => {
    switch (tabId) {
      case 'home': return homeAnimatedStyle;
      case 'community': return communityAnimatedStyle;
      case 'challenge': return challengeAnimatedStyle;
      case 'profile': return profileAnimatedStyle;
    }
  };

  return (
    <View style={[
      styles.container,
      {
        backgroundColor: resolvedTheme === 'light'
          ? 'rgba(255, 255, 255, 0.85)'
          : 'rgba(0, 0, 0, 0.85)',
        borderColor: resolvedTheme === 'light'
          ? 'rgba(0, 0, 0, 0.1)'
          : 'rgba(255, 255, 255, 0.4)',
      }
    ]}>
      {/* Subtle inner glow */}
      <View style={[
        styles.innerGlow,
        {
          borderColor: resolvedTheme === 'light'
            ? 'rgba(255, 255, 255, 0.8)'
            : 'rgba(255, 255, 255, 0.4)',
        }
      ]} />
      
      {/* Single sliding pill */}
      <Animated.View style={[
        styles.slidingPill,
        pillAnimatedStyle,
        {
          backgroundColor: resolvedTheme === 'light'
            ? 'rgba(0, 0, 0, 0.08)'
            : 'rgba(255, 255, 255, 0.12)',
          borderColor: resolvedTheme === 'light'
            ? 'rgba(0, 0, 0, 0.15)'
            : 'rgba(255, 255, 255, 0.4)',
        }
      ]}>
        {/* Inner shimmer for sliding pill */}
        <View style={[
          styles.pillInnerGlow,
          {
            borderColor: resolvedTheme === 'light'
              ? 'rgba(255, 255, 255, 0.6)'
              : 'rgba(255, 255, 255, 0.3)',
          }
        ]} />
      </Animated.View>
      
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        
        return (
          <TouchableOpacity
            key={tab.id}
            style={styles.tab}
            onPress={() => onTabChange(tab.id)}
            activeOpacity={0.7}
          >
            <Animated.View style={[styles.tabContent, getTabAnimatedStyle(tab.id)]}>
              {/* Tab content */}
              <View style={styles.tabInner}>
                <Text style={styles.icon}>{tab.icon}</Text>
                {isActive && (
                  <Text style={[
                    styles.label,
                    {
                      color: themeColors.text.primary,
                      fontWeight: '600',
                    }
                  ]}>
                    {t(tab.labelKey as any)}
                  </Text>
                )}
              </View>
            </Animated.View>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderTopWidth: 0,
    justifyContent: 'space-between',
    alignItems: 'center',
    alignSelf: 'center',
    marginBottom: 28,
    borderRadius: 24,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
    overflow: 'hidden',
    width: 280,
  },
  innerGlow: {
    position: 'absolute',
    top: 0.5,
    left: 0.5,
    right: 0.5,
    bottom: 0.5,
    borderRadius: 23,
    borderWidth: 0.5,
    pointerEvents: 'none',
  },
  tab: {
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  tabContent: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  slidingPill: {
    position: 'absolute',
    top: 6,
    left: 0,
    height: 32,
    borderRadius: 18,
    borderWidth: 1,
    overflow: 'hidden',
    zIndex: 0,
  },
  activePill: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 18,
    borderWidth: 1,
    overflow: 'hidden',
  },
  pillInnerGlow: {
    position: 'absolute',
    top: 0.5,
    left: 0.5,
    right: 0.5,
    bottom: 0.5,
    borderRadius: 17,
    borderWidth: 0.5,
    pointerEvents: 'none',
  },
  tabInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingVertical: 6,
    paddingHorizontal: 8,
    zIndex: 1,
  },
  icon: {
    fontSize: 16,
  },
  label: {
    fontSize: 11,
    letterSpacing: 0.1,
  },
});
