import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import { useTheme } from '../src/contexts/ThemeContext';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import VibeStoriesFeed from '../components/community/VibeStoriesFeed';
import ChallengeLeaderboard from '../components/community/ChallengeLeaderboard';
import MyActivity from '../components/community/MyActivity';

type TabType = 'feed' | 'leaderboard' | 'activity';

export default function CommunityScreen() {
  const { colors } = useTheme();
  const navigation = useNavigation();
  const [activeTab, setActiveTab] = useState<TabType>('feed');

  const tabs: { id: TabType; label: string; icon: string }[] = [
    { id: 'feed', label: 'Feed', icon: '🌊' },
    { id: 'leaderboard', label: 'Leaderboard', icon: '🏆' },
    { id: 'activity', label: 'My Activity', icon: '👤' },
  ];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header with Back Button */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
          activeOpacity={0.7}
        >
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={[styles.headerTitle, { color: colors.text.primary }]}>
            Community
          </Text>
          <Text style={[styles.headerSubtitle, { color: colors.text.secondary }]}>
            Share your vibe, inspire others
          </Text>
        </View>
      </View>

      {/* Tab Bar */}
      <View style={styles.tabBar}>
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <TouchableOpacity
              key={tab.id}
              style={styles.tab}
              onPress={() => setActiveTab(tab.id)}
              activeOpacity={0.7}
            >
              {isActive ? (
                <LinearGradient
                  colors={['rgba(0, 217, 255, 0.2)', 'rgba(0, 170, 255, 0.1)']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.activeTabGradient}
                >
                  <Text style={styles.tabIcon}>{tab.icon}</Text>
                  <Text style={[styles.tabLabel, styles.activeTabLabel]}>
                    {tab.label}
                  </Text>
                </LinearGradient>
              ) : (
                <View style={styles.inactiveTab}>
                  <Text style={[styles.tabIcon, { opacity: 0.5 }]}>{tab.icon}</Text>
                  <Text style={[styles.tabLabel, { color: colors.text.secondary }]}>
                    {tab.label}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Tab Content */}
      <View style={styles.content}>
        {activeTab === 'feed' && <VibeStoriesFeed />}
        {activeTab === 'leaderboard' && <ChallengeLeaderboard />}
        {activeTab === 'activity' && <MyActivity />}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
    gap: 12,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 217, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backIcon: {
    fontSize: 24,
    color: '#00D9FF',
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: '700',
    letterSpacing: -0.5,
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 15,
    fontWeight: '400',
    letterSpacing: 0.2,
  },
  tabBar: {
    flexDirection: 'row',
    paddingHorizontal: 12,
    gap: 8,
    marginBottom: 16,
  },
  tab: {
    flex: 1,
  },
  activeTabGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(0, 217, 255, 0.3)',
    gap: 8,
  },
  inactiveTab: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 16,
    gap: 8,
  },
  tabIcon: {
    fontSize: 18,
  },
  tabLabel: {
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  activeTabLabel: {
    color: '#00D9FF',
  },
  content: {
    flex: 1,
  },
});
