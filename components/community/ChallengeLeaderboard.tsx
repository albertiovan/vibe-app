import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  Alert,
} from 'react-native';
import { useTheme } from '../../src/contexts/ThemeContext';
import { GlassCard } from '../../ui/components/GlassCard';
import { getLeaderboard, LeaderboardEntry } from '../../src/services/communityApi';
import { userStorage } from '../../src/services/userStorage';
import { LinearGradient } from 'expo-linear-gradient';

type Period = 'weekly' | 'monthly' | 'alltime';

export default function ChallengeLeaderboard() {
  const { colors } = useTheme();
  const [period, setPeriod] = useState<Period>('weekly');
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string>('');

  useEffect(() => {
    loadUserId();
  }, []);

  useEffect(() => {
    loadLeaderboard();
  }, [period]);

  const loadUserId = async () => {
    try {
      const account = await userStorage.getAccount();
      if (account?.userId) {
        setCurrentUserId(account.userId);
      }
    } catch (error) {
      console.error('Error loading user ID:', error);
    }
  };

  const loadLeaderboard = async () => {
    try {
      setLoading(true);
      const result = await getLeaderboard(period);
      setLeaderboard(result.leaderboard);
    } catch (error) {
      console.error('Error loading leaderboard:', error);
      Alert.alert('Error', 'Failed to load leaderboard');
    } finally {
      setLoading(false);
    }
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return '🥇';
      case 2:
        return '🥈';
      case 3:
        return '🥉';
      default:
        return `${rank}`;
    }
  };

  const getDifficultyColor = (difficulty: number) => {
    if (difficulty >= 2) return '#FF6B6B'; // High difficulty (red)
    if (difficulty >= 1) return '#FFA500'; // Medium difficulty (orange)
    return '#00D9FF'; // Low difficulty (cyan)
  };

  const renderLeaderboardEntry = ({ item, index }: { item: LeaderboardEntry; index: number }) => {
    const rank = index + 1;
    const isCurrentUser = item.user_id === currentUserId;
    const isTopThree = rank <= 3;
    
    // Extract nickname from user_id (e.g., "device_alex_test_2024" -> "Alex")
    const getNicknameFromUserId = (userId: string) => {
      const parts = userId.split('_');
      if (parts.length >= 2) {
        const name = parts[1];
        return name.charAt(0).toUpperCase() + name.slice(1);
      }
      return userId;
    };
    
    const displayName = getNicknameFromUserId(item.user_id);

    return (
      <GlassCard emphasis={isTopThree ? 'high' : 'low'} style={styles.entryCard}>
        {isTopThree && (
          <LinearGradient
            colors={['rgba(0, 217, 255, 0.1)', 'transparent']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.topThreeGradient}
          />
        )}

        <View style={styles.entryContent}>
          {/* Rank */}
          <View style={styles.rankContainer}>
            {rank <= 3 ? (
              <Text style={styles.rankIcon}>{getRankIcon(rank)}</Text>
            ) : (
              <Text style={[styles.rankNumber, { color: colors.text.secondary }]}>
                {rank}
              </Text>
            )}
          </View>

          {/* User Info */}
          <View style={styles.userContainer}>
            <View style={[styles.avatar, styles.avatarPlaceholder]}>
              <Text style={styles.avatarText}>
                {displayName.charAt(0).toUpperCase()}
              </Text>
            </View>
            <View style={styles.userInfo}>
              <Text
                style={[
                  styles.nickname,
                  { color: isCurrentUser ? '#00D9FF' : colors.text.primary },
                ]}
              >
                {displayName}
                {isCurrentUser && ' (You)'}
              </Text>
              <View style={styles.stats}>
                <Text style={[styles.statText, { color: colors.text.secondary }]}>
                  {item.challenges_completed} challenges
                </Text>
                {item.avg_difficulty != null && typeof item.avg_difficulty !== 'undefined' && (
                  <>
                    <Text style={styles.statDivider}>•</Text>
                    <Text
                      style={[
                        styles.statText,
                        { color: getDifficultyColor(Number(item.avg_difficulty)) },
                      ]}
                    >
                      {Number(item.avg_difficulty).toFixed(1)} avg difficulty
                    </Text>
                  </>
                )}
              </View>
            </View>
          </View>

          {/* Points */}
          <View style={styles.pointsContainer}>
            <Text style={[styles.points, { color: '#00D9FF' }]}>
              {item.total_points}
            </Text>
            <Text style={[styles.pointsLabel, { color: colors.text.secondary }]}>
              pts
            </Text>
          </View>
        </View>
      </GlassCard>
    );
  };

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyIcon}>🏆</Text>
      <Text style={[styles.emptyTitle, { color: colors.text.primary }]}>
        No rankings yet
      </Text>
      <Text style={[styles.emptySubtitle, { color: colors.text.secondary }]}>
        Complete challenges to appear on the leaderboard!
      </Text>
    </View>
  );

  if (loading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color="#00D9FF" />
        <Text style={[styles.loadingText, { color: colors.text.secondary }]}>
          Loading leaderboard...
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Period Selector */}
      <View style={styles.periodSelector}>
        {(['weekly', 'monthly', 'alltime'] as Period[]).map((p) => (
          <TouchableOpacity
            key={p}
            style={[
              styles.periodButton,
              period === p && styles.periodButtonActive,
            ]}
            onPress={() => setPeriod(p)}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.periodButtonText,
                {
                  color: period === p ? '#00D9FF' : colors.text.secondary,
                },
              ]}
            >
              {p === 'weekly' && 'This Week'}
              {p === 'monthly' && 'This Month'}
              {p === 'alltime' && 'All Time'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Leaderboard List */}
      <FlatList
        data={leaderboard}
        renderItem={renderLeaderboardEntry}
        keyExtractor={(item) => item.user_id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={renderEmpty}
        showsVerticalScrollIndicator={false}
      />
    </View>
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
  loadingText: {
    marginTop: 12,
    fontSize: 15,
    fontWeight: '500',
  },
  periodSelector: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  periodButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
  },
  periodButtonActive: {
    borderColor: '#00D9FF',
    backgroundColor: 'rgba(0, 217, 255, 0.1)',
  },
  periodButtonText: {
    fontSize: 13,
    fontWeight: '600',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 20,
  },
  entryCard: {
    marginBottom: 12,
    padding: 16,
    position: 'relative',
    overflow: 'hidden',
  },
  topThreeGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  entryContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  rankContainer: {
    width: 40,
    alignItems: 'center',
  },
  rankIcon: {
    fontSize: 28,
  },
  rankNumber: {
    fontSize: 18,
    fontWeight: '700',
  },
  userContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginRight: 12,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
  },
  avatarPlaceholder: {
    backgroundColor: 'rgba(0, 217, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#00D9FF',
  },
  userInfo: {
    flex: 1,
  },
  nickname: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  stats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexWrap: 'wrap',
  },
  statText: {
    fontSize: 12,
    fontWeight: '500',
  },
  statDivider: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.3)',
  },
  pointsContainer: {
    alignItems: 'flex-end',
  },
  points: {
    fontSize: 20,
    fontWeight: '700',
  },
  pointsLabel: {
    fontSize: 11,
    fontWeight: '600',
    marginTop: 2,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingTop: 80,
    paddingHorizontal: 40,
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
  },
});
