/**
 * SavedActivitiesScreen
 * User's saved activities with filters and actions
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { useNavigation, useFocusEffect, NavigationProp } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Device from 'expo-device';
import { GlassCard } from '../components/design-system/GlassCard';
import { VibeChip } from '../components/design-system/VibeChip';
import { GradientButton } from '../components/design-system/GradientButton';
import { userApi, SavedActivity } from '../src/services/userApi';
import { colors, getTimeGradient } from '../src/design-system/colors';
import { tokens } from '../src/design-system/tokens';

type RootStackParamList = {
  SavedActivities: undefined;
  ExperienceDetail: { activity: any };
  Discovery: undefined;
};

const STATUS_FILTERS = [
  { id: 'all', label: 'All', emoji: '✨' },
  { id: 'saved', label: 'Saved', emoji: '💾' },
  { id: 'completed', label: 'Done', emoji: '✅' },
  { id: 'canceled', label: 'Canceled', emoji: '❌' },
];

export const SavedActivitiesScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const [deviceId, setDeviceId] = useState<string>('');
  const [activities, setActivities] = useState<SavedActivity[]>([]);
  const [filteredActivities, setFilteredActivities] = useState<SavedActivity[]>([]);
  const [selectedStatus, setSelectedStatus] = useState<'all' | 'saved' | 'completed' | 'canceled'>('all');
  const [loading, setLoading] = useState(true);
  
  const gradient = getTimeGradient();

  useFocusEffect(
    React.useCallback(() => {
      loadSavedActivities();
    }, [])
  );

  useEffect(() => {
    const id = Device.modelId || `device-${Math.random().toString(36).substr(2, 9)}`;
    setDeviceId(id);
  }, []);

  useEffect(() => {
    filterActivities();
  }, [selectedStatus, activities]);

  const loadSavedActivities = async () => {
    try {
      setLoading(true);
      const id = Device.modelId || `device-${Math.random().toString(36).substr(2, 9)}`;
      const { savedActivities } = await userApi.getSavedActivities(id);
      setActivities(savedActivities);
    } catch (error) {
      console.error('Failed to load saved activities:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterActivities = () => {
    if (selectedStatus === 'all') {
      setFilteredActivities(activities);
    } else {
      setFilteredActivities(activities.filter(a => a.status === selectedStatus));
    }
  };

  const handleStatusChange = async (activityId: number, newStatus: 'saved' | 'completed' | 'canceled') => {
    try {
      await userApi.updateActivityStatus(deviceId, activityId, newStatus);
      
      // Update local state
      setActivities(prev => prev.map(a => 
        a.activity_id === activityId ? { ...a, status: newStatus } : a
      ));
    } catch (error) {
      console.error('Failed to update status:', error);
      Alert.alert('Error', 'Failed to update activity status');
    }
  };

  const handleDeleteActivity = (activityId: number, activityName: string) => {
    Alert.alert(
      'Remove Activity',
      `Remove "${activityName}" from saved activities?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            try {
              await userApi.unsaveActivity(deviceId, activityId);
              setActivities(prev => prev.filter(a => a.activity_id !== activityId));
            } catch (error) {
              console.error('Failed to delete activity:', error);
              Alert.alert('Error', 'Failed to remove activity');
            }
          },
        },
      ]
    );
  };

  const renderActivityCard = (activity: SavedActivity) => {
    return (
      <GlassCard key={activity.id} style={styles.activityCard} padding="md" radius="md">
        <View style={styles.activityHeader}>
          <View style={styles.activityInfo}>
            <Text style={styles.activityName} numberOfLines={2}>
              {activity.activity_name}
            </Text>
            <Text style={styles.activityMeta}>
              {activity.activity_category} • Saved {new Date(activity.saved_at).toLocaleDateString()}
            </Text>
            {activity.notes && (
              <Text style={styles.activityNotes} numberOfLines={2}>
                Note: {activity.notes}
              </Text>
            )}
          </View>
          
          {/* Status Badge */}
          <View style={[
            styles.statusBadge,
            activity.status === 'completed' && styles.statusCompleted,
            activity.status === 'canceled' && styles.statusCanceled,
          ]}>
            <Text style={styles.statusText}>
              {activity.status === 'saved' && '💾'}
              {activity.status === 'completed' && '✅'}
              {activity.status === 'canceled' && '❌'}
            </Text>
          </View>
        </View>

        {/* Actions */}
        <View style={styles.activityActions}>
          {activity.status === 'saved' && (
            <>
              <TouchableOpacity
                style={[styles.actionButton, styles.actionButtonComplete]}
                onPress={() => handleStatusChange(activity.activity_id, 'completed')}
              >
                <Text style={styles.actionButtonText}>✅ Complete</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.actionButton, styles.actionButtonCancel]}
                onPress={() => handleStatusChange(activity.activity_id, 'canceled')}
              >
                <Text style={styles.actionButtonText}>❌ Cancel</Text>
              </TouchableOpacity>
            </>
          )}
          
          <TouchableOpacity
            style={[styles.actionButton, styles.actionButtonDelete]}
            onPress={() => handleDeleteActivity(activity.activity_id, activity.activity_name)}
          >
            <Text style={styles.actionButtonText}>🗑️</Text>
          </TouchableOpacity>
        </View>
      </GlassCard>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading saved activities...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Background gradient */}
      <LinearGradient
        colors={[gradient.start, gradient.end]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      >
        <View style={[StyleSheet.absoluteFill, { opacity: 0.03 }]} />
      </LinearGradient>

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Saved Activities</Text>
        <Text style={styles.headerSubtitle}>
          {activities.length} {activities.length === 1 ? 'activity' : 'activities'} saved
        </Text>
      </View>

      {/* Filter Chips */}
      <View style={styles.filtersContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filtersContent}
        >
          {STATUS_FILTERS.map(filter => (
            <VibeChip
              key={filter.id}
              emoji={filter.emoji}
              label={filter.label}
              selected={selectedStatus === filter.id}
              onPress={() => setSelectedStatus(filter.id as any)}
              style={styles.filterChip}
            />
          ))}
        </ScrollView>
      </View>

      {/* Activities List */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {filteredActivities.length > 0 ? (
          filteredActivities.map(renderActivityCard)
        ) : (
          <GlassCard style={styles.emptyState} padding="xl" radius="md">
            <Text style={styles.emptyStateEmoji}>
              {selectedStatus === 'all' && '📝'}
              {selectedStatus === 'saved' && '💾'}
              {selectedStatus === 'completed' && '✅'}
              {selectedStatus === 'canceled' && '❌'}
            </Text>
            <Text style={styles.emptyStateText}>
              {selectedStatus === 'all' && 'No saved activities yet'}
              {selectedStatus === 'saved' && 'No saved activities'}
              {selectedStatus === 'completed' && 'No completed activities'}
              {selectedStatus === 'canceled' && 'No canceled activities'}
            </Text>
            <Text style={styles.emptyStateSubtext}>
              {selectedStatus === 'all' 
                ? 'Start exploring and save activities you like!'
                : 'Try selecting a different filter'
              }
            </Text>
            
            {selectedStatus === 'all' && (
              <GradientButton
                title="Discover Activities"
                onPress={() => navigation.navigate('Discovery')}
                size="md"
                style={styles.discoverButton}
              />
            )}
          </GlassCard>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.base.canvas,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: colors.base.canvas,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: tokens.typography.fontSize.md,
    color: colors.text.secondary,
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: tokens.spacing.lg,
    paddingBottom: tokens.spacing.lg,
  },
  headerTitle: {
    fontSize: tokens.typography.fontSize.xxl,
    fontWeight: tokens.typography.fontWeight.bold,
    color: colors.text.primary,
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: tokens.typography.fontSize.md,
    color: colors.text.secondary,
  },
  filtersContainer: {
    paddingVertical: tokens.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  filtersContent: {
    paddingHorizontal: tokens.spacing.lg,
    gap: tokens.spacing.sm,
  },
  filterChip: {
    marginRight: 0,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: tokens.spacing.lg,
  },
  activityCard: {
    marginBottom: tokens.spacing.md,
  },
  activityHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: tokens.spacing.sm,
  },
  activityInfo: {
    flex: 1,
    marginRight: tokens.spacing.sm,
  },
  activityName: {
    fontSize: tokens.typography.fontSize.lg,
    fontWeight: tokens.typography.fontWeight.semibold,
    color: colors.text.primary,
    marginBottom: 4,
  },
  activityMeta: {
    fontSize: tokens.typography.fontSize.xs,
    color: colors.text.tertiary,
    marginBottom: 4,
  },
  activityNotes: {
    fontSize: tokens.typography.fontSize.sm,
    color: colors.text.secondary,
    fontStyle: 'italic',
    marginTop: 4,
  },
  statusBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusCompleted: {
    backgroundColor: 'rgba(0,210,160,0.2)',
  },
  statusCanceled: {
    backgroundColor: 'rgba(255,82,82,0.2)',
  },
  statusText: {
    fontSize: 18,
  },
  activityActions: {
    flexDirection: 'row',
    gap: tokens.spacing.sm,
  },
  actionButton: {
    flex: 1,
    paddingVertical: tokens.spacing.sm,
    paddingHorizontal: tokens.spacing.md,
    borderRadius: tokens.radius.sm,
    backgroundColor: 'rgba(255,255,255,0.05)',
    alignItems: 'center',
  },
  actionButtonComplete: {
    backgroundColor: 'rgba(0,210,160,0.15)',
  },
  actionButtonCancel: {
    backgroundColor: 'rgba(255,82,82,0.15)',
  },
  actionButtonDelete: {
    flex: 0,
    paddingHorizontal: tokens.spacing.md,
  },
  actionButtonText: {
    fontSize: tokens.typography.fontSize.sm,
    color: colors.text.primary,
    fontWeight: tokens.typography.fontWeight.medium,
  },
  emptyState: {
    marginTop: tokens.spacing.xxl,
    alignItems: 'center',
  },
  emptyStateEmoji: {
    fontSize: 64,
    marginBottom: tokens.spacing.md,
  },
  emptyStateText: {
    fontSize: tokens.typography.fontSize.lg,
    fontWeight: tokens.typography.fontWeight.semibold,
    color: colors.text.primary,
    marginBottom: tokens.spacing.xs,
  },
  emptyStateSubtext: {
    fontSize: tokens.typography.fontSize.sm,
    color: colors.text.secondary,
    textAlign: 'center',
    marginBottom: tokens.spacing.lg,
  },
  discoverButton: {
    marginTop: tokens.spacing.md,
  },
});
