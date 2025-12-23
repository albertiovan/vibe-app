import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useTheme } from '../../src/contexts/ThemeContext';
import { GlassCard } from '../../ui/components/GlassCard';
import { getUserStats, UserStats } from '../../src/services/communityApi';
import { userStorage } from '../../src/services/userStorage';
import { LinearGradient } from 'expo-linear-gradient';

export default function MyActivity() {
  const { colors } = useTheme();
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string>('');

  useEffect(() => {
    loadUserIdAndStats();
  }, []);

  const loadUserIdAndStats = async () => {
    try {
      setLoading(true);
      const account = await userStorage.getAccount();
      
      if (account?.userId) {
        setUserId(account.userId);
        try {
          const userStats = await getUserStats(account.userId);
          setStats(userStats);
        } catch (apiError) {
          console.log('API error, showing coming soon:', apiError);
          // Set to null to show coming soon message
          setStats(null);
        }
      }
    } catch (error) {
      console.error('Error loading user stats:', error);
      // Set to null to show coming soon message
      setStats(null);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color="#00D9FF" />
        <Text style={[styles.loadingText, { color: colors.text.secondary }]}>
          Loading your activity...
        </Text>
      </View>
    );
  }

  if (!stats) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <Text style={styles.emptyIcon}>📊</Text>
        <Text style={[styles.emptyTitle, { color: colors.text.primary }]}>
          No Activity Yet
        </Text>
        <Text style={[styles.emptySubtitle, { color: colors.text.secondary }]}>
          Start sharing posts, writing reviews, and completing challenges to see your stats here!
        </Text>
      </View>
    );
  }

  const statCards = [
    {
      icon: '📝',
      label: 'Posts',
      value: stats.posts_count,
      color: '#00D9FF',
    },
    {
      icon: '⭐',
      label: 'Reviews',
      value: stats.reviews_count,
      color: '#FFD700',
    },
    {
      icon: '🔥',
      label: 'Challenges',
      value: stats.challenges_count,
      color: '#FF6B6B',
    },
    {
      icon: '🏆',
      label: 'Points',
      value: stats.total_points || 0,
      color: '#00FF88',
    },
  ];

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* Overview Stats */}
      <View style={styles.statsGrid}>
        {statCards.map((stat, index) => (
          <GlassCard key={index} emphasis="high" style={styles.statCard}>
            <LinearGradient
              colors={[`${stat.color}20`, 'transparent']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.statGradient}
            />
            <Text style={styles.statIcon}>{stat.icon}</Text>
            <Text style={[styles.statValue, { color: stat.color }]}>
              {stat.value}
            </Text>
            <Text style={[styles.statLabel, { color: colors.text.secondary }]}>
              {stat.label}
            </Text>
          </GlassCard>
        ))}
      </View>

      {/* Engagement Summary */}
      <GlassCard emphasis="low" style={styles.summaryCard}>
        <Text style={[styles.summaryTitle, { color: colors.text.primary }]}>
          Community Engagement
        </Text>
        <View style={styles.summaryContent}>
          <View style={styles.summaryRow}>
            <Text style={[styles.summaryLabel, { color: colors.text.secondary }]}>
              Total Likes Received
            </Text>
            <Text style={[styles.summaryValue, { color: '#00D9FF' }]}>
              ❤️ {stats.total_likes_received || 0}
            </Text>
          </View>
          <View style={styles.summaryDivider} />
          <View style={styles.summaryRow}>
            <Text style={[styles.summaryLabel, { color: colors.text.secondary }]}>
              Avg Likes per Post
            </Text>
            <Text style={[styles.summaryValue, { color: colors.text.primary }]}>
              {stats.posts_count > 0
                ? ((stats.total_likes_received || 0) / stats.posts_count).toFixed(1)
                : '0'}
            </Text>
          </View>
        </View>
      </GlassCard>

      {/* Activity Breakdown */}
      <GlassCard emphasis="low" style={styles.breakdownCard}>
        <Text style={[styles.breakdownTitle, { color: colors.text.primary }]}>
          Your Contributions
        </Text>
        
        <View style={styles.progressContainer}>
          <View style={styles.progressHeader}>
            <Text style={[styles.progressLabel, { color: colors.text.secondary }]}>
              Posts
            </Text>
            <Text style={[styles.progressValue, { color: colors.text.primary }]}>
              {stats.posts_count}
            </Text>
          </View>
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                {
                  width: `${Math.min((stats.posts_count / 50) * 100, 100)}%`,
                  backgroundColor: '#00D9FF',
                },
              ]}
            />
          </View>
        </View>

        <View style={styles.progressContainer}>
          <View style={styles.progressHeader}>
            <Text style={[styles.progressLabel, { color: colors.text.secondary }]}>
              Reviews
            </Text>
            <Text style={[styles.progressValue, { color: colors.text.primary }]}>
              {stats.reviews_count}
            </Text>
          </View>
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                {
                  width: `${Math.min((stats.reviews_count / 50) * 100, 100)}%`,
                  backgroundColor: '#FFD700',
                },
              ]}
            />
          </View>
        </View>

        <View style={styles.progressContainer}>
          <View style={styles.progressHeader}>
            <Text style={[styles.progressLabel, { color: colors.text.secondary }]}>
              Challenges
            </Text>
            <Text style={[styles.progressValue, { color: colors.text.primary }]}>
              {stats.challenges_count}
            </Text>
          </View>
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                {
                  width: `${Math.min((stats.challenges_count / 20) * 100, 100)}%`,
                  backgroundColor: '#FF6B6B',
                },
              ]}
            />
          </View>
        </View>
      </GlassCard>

      {/* Encouragement Message */}
      {stats.posts_count === 0 && stats.reviews_count === 0 && stats.challenges_count === 0 && (
        <GlassCard emphasis="low" style={styles.encouragementCard}>
          <Text style={styles.encouragementIcon}>✨</Text>
          <Text style={[styles.encouragementTitle, { color: colors.text.primary }]}>
            Start Your Journey
          </Text>
          <Text style={[styles.encouragementText, { color: colors.text.secondary }]}>
            Share your first post, write a review, or complete a challenge to get started!
          </Text>
        </GlassCard>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 15,
    fontWeight: '500',
  },
  errorText: {
    fontSize: 15,
    fontWeight: '500',
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 15,
    fontWeight: '400',
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 40,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 16,
  },
  statCard: {
    width: '48%',
    padding: 20,
    alignItems: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  statGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  statIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  statValue: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 13,
    fontWeight: '600',
  },
  summaryCard: {
    padding: 20,
    marginBottom: 16,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 16,
  },
  summaryContent: {
    gap: 12,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: '700',
  },
  summaryDivider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  breakdownCard: {
    padding: 20,
    marginBottom: 16,
  },
  breakdownTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 20,
  },
  progressContainer: {
    marginBottom: 16,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressLabel: {
    fontSize: 14,
    fontWeight: '600',
  },
  progressValue: {
    fontSize: 14,
    fontWeight: '700',
  },
  progressBar: {
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  encouragementCard: {
    padding: 24,
    alignItems: 'center',
  },
  encouragementIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  encouragementTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 8,
    textAlign: 'center',
  },
  encouragementText: {
    fontSize: 14,
    fontWeight: '400',
    textAlign: 'center',
    lineHeight: 20,
  },
});
