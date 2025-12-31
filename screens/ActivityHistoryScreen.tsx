/**
 * ActivityHistoryScreen
 * Shows user's completed activities with ratings and photos
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { userStorage } from '../src/services/userStorage';
import { API_BASE_URL } from '../src/config/api';

interface CompletedActivity {
  instance_id: number;
  activity_name: string;
  category: string;
  venue_name?: string;
  user_rating: number;
  photo_url?: string;
  completed_at: string;
}

export function ActivityHistoryScreen() {
  const navigation = useNavigation();
  const [activities, setActivities] = useState<CompletedActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadHistory();
  }, []);

  async function loadHistory() {
    try {
      const account = await userStorage.getAccount();
      if (!account?.userId) {
        setLoading(false);
        return;
      }

      const response = await fetch(
        `${API_BASE_URL}/api/activity-completion/history?userId=${account.userId}&limit=50`
      );

      if (response.ok) {
        const data = await response.json();
        setActivities(data);
      }
    } catch (error) {
      console.error('Error loading history:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  function getRatingEmoji(rating: number): string {
    if (rating <= 3) return '😞';
    if (rating <= 5) return '😐';
    if (rating <= 7) return '😊';
    if (rating <= 9) return '😄';
    return '😍';
  }

  function formatDate(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString();
  }

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="rgba(253, 221, 16, 1)" />
        <Text style={styles.loadingText}>Loading your activities...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>My Activities</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Activity List */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              loadHistory();
            }}
            tintColor="rgba(253, 221, 16, 1)"
          />
        }
      >
        {activities.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyEmoji}>📭</Text>
            <Text style={styles.emptyTitle}>No activities yet</Text>
            <Text style={styles.emptyText}>
              Complete activities to see them here
            </Text>
          </View>
        ) : (
          activities.map((activity) => (
            <View key={activity.instance_id} style={styles.activityCard}>
              {activity.photo_url && (
                <Image
                  source={{ uri: activity.photo_url }}
                  style={styles.activityPhoto}
                  resizeMode="cover"
                />
              )}
              
              <View style={styles.activityContent}>
                <View style={styles.activityHeader}>
                  <Text style={styles.activityName}>{activity.activity_name}</Text>
                  <Text style={styles.ratingEmoji}>
                    {getRatingEmoji(activity.user_rating)}
                  </Text>
                </View>

                {activity.venue_name && (
                  <Text style={styles.venueName}>{activity.venue_name}</Text>
                )}

                <View style={styles.activityMeta}>
                  <Text style={styles.category}>{activity.category}</Text>
                  <Text style={styles.date}>
                    {formatDate(activity.completed_at)}
                  </Text>
                </View>

                <View style={styles.ratingBar}>
                  <View style={styles.ratingBarFill} />
                  <View
                    style={[
                      styles.ratingBarActive,
                      { width: `${(activity.user_rating / 10) * 100}%` },
                    ]}
                  />
                </View>
                <Text style={styles.ratingText}>
                  {activity.user_rating}/10
                </Text>
              </View>
            </View>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000000',
  },
  loadingText: {
    color: 'rgba(255, 255, 255, 0.6)',
    marginTop: 16,
    fontSize: 14,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
  },
  backText: {
    fontSize: 28,
    color: '#FFFFFF',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  placeholder: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  emptyState: {
    alignItems: 'center',
    paddingTop: 100,
  },
  emptyEmoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.6)',
    textAlign: 'center',
  },
  activityCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    marginBottom: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  activityPhoto: {
    width: '100%',
    height: 200,
  },
  activityContent: {
    padding: 16,
  },
  activityHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  activityName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    flex: 1,
    marginRight: 8,
  },
  ratingEmoji: {
    fontSize: 24,
  },
  venueName: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.6)',
    marginBottom: 12,
  },
  activityMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  category: {
    fontSize: 12,
    color: 'rgba(253, 221, 16, 1)',
    textTransform: 'uppercase',
    fontWeight: '600',
  },
  date: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.4)',
  },
  ratingBar: {
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: 8,
  },
  ratingBarFill: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    right: 0,
  },
  ratingBarActive: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    backgroundColor: 'rgba(253, 221, 16, 1)',
  },
  ratingText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.6)',
    textAlign: 'right',
  },
});
