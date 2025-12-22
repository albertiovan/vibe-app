/**
 * Friends Manager Component
 * Comprehensive friends management UI
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Modal,
} from 'react-native';
import { useTheme } from '../src/contexts/ThemeContext';
import { friendsApi, Friend, FriendRequest, User, BlockedUser } from '../src/services/friendsApi';

interface FriendsManagerProps {
  deviceId: string;
  visible: boolean;
  onClose: () => void;
}

type Tab = 'friends' | 'requests' | 'search' | 'blocked';

export const FriendsManager: React.FC<FriendsManagerProps> = ({ deviceId, visible, onClose }) => {
  const { colors: themeColors, resolvedTheme } = useTheme();
  const [activeTab, setActiveTab] = useState<Tab>('friends');
  const [loading, setLoading] = useState(false);
  
  // Friends
  const [friends, setFriends] = useState<Friend[]>([]);
  
  // Requests
  const [requests, setRequests] = useState<FriendRequest[]>([]);
  
  // Search
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [searching, setSearching] = useState(false);
  
  // Blocked
  const [blocked, setBlocked] = useState<BlockedUser[]>([]);

  useEffect(() => {
    if (visible && deviceId) {
      loadData();
    }
  }, [visible, activeTab, deviceId]);

  const loadData = async () => {
    if (!deviceId) return;
    
    setLoading(true);
    try {
      if (activeTab === 'friends') {
        const friendsList = await friendsApi.getFriends(deviceId);
        setFriends(friendsList);
      } else if (activeTab === 'requests') {
        const requestsList = await friendsApi.getPendingRequests(deviceId);
        setRequests(requestsList);
      } else if (activeTab === 'blocked') {
        const blockedList = await friendsApi.getBlockedUsers(deviceId);
        setBlocked(blockedList);
      }
    } catch (error) {
      console.error('Error loading friends data:', error);
      // Fail silently - user can retry by switching tabs
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    setSearching(true);
    try {
      const results = await friendsApi.searchUsers(deviceId, searchQuery);
      setSearchResults(results);
    } catch (error) {
      Alert.alert('Error', 'Failed to search users');
    } finally {
      setSearching(false);
    }
  };

  const handleSendRequest = async (username: string) => {
    try {
      await friendsApi.sendFriendRequest(deviceId, username);
      Alert.alert('Success', 'Friend request sent!');
      setSearchResults([]);
      setSearchQuery('');
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to send friend request');
    }
  };

  const handleAcceptRequest = async (friendshipId: number) => {
    try {
      await friendsApi.acceptFriendRequest(deviceId, friendshipId);
      Alert.alert('Success', 'Friend request accepted!');
      loadData();
    } catch (error) {
      Alert.alert('Error', 'Failed to accept friend request');
    }
  };

  const handleRejectRequest = async (friendshipId: number) => {
    try {
      await friendsApi.rejectFriendRequest(deviceId, friendshipId);
      loadData();
    } catch (error) {
      Alert.alert('Error', 'Failed to reject friend request');
    }
  };

  const handleRemoveFriend = async (friendId: number, friendName: string) => {
    Alert.alert(
      'Remove Friend',
      `Remove ${friendName} from your friends?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            try {
              await friendsApi.removeFriend(deviceId, friendId);
              loadData();
            } catch (error) {
              Alert.alert('Error', 'Failed to remove friend');
            }
          },
        },
      ]
    );
  };

  const handleClearAllFriends = () => {
    Alert.alert(
      'Clear All Friends',
      'Are you sure you want to remove all friends? This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear All',
          style: 'destructive',
          onPress: async () => {
            try {
              await friendsApi.clearAllFriends(deviceId);
              setFriends([]);
              Alert.alert('Success', 'All friends removed');
            } catch (error) {
              Alert.alert('Error', 'Failed to clear friends');
            }
          },
        },
      ]
    );
  };

  const handleBlockUser = async (userId: number, username: string) => {
    Alert.alert(
      'Block User',
      `Block ${username}? They won't be able to send you friend requests.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Block',
          style: 'destructive',
          onPress: async () => {
            try {
              await friendsApi.blockUser(deviceId, userId);
              Alert.alert('Success', 'User blocked');
              loadData();
            } catch (error) {
              Alert.alert('Error', 'Failed to block user');
            }
          },
        },
      ]
    );
  };

  const handleUnblockUser = async (userId: number) => {
    try {
      await friendsApi.unblockUser(deviceId, userId);
      loadData();
    } catch (error) {
      Alert.alert('Error', 'Failed to unblock user');
    }
  };

  const handleReportUser = async (userId: number, username: string) => {
    Alert.alert(
      'Report User',
      `Report ${username} for inappropriate behavior?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Spam', onPress: () => submitReport(userId, 'spam') },
        { text: 'Harassment', onPress: () => submitReport(userId, 'harassment') },
        { text: 'Inappropriate', onPress: () => submitReport(userId, 'inappropriate') },
      ]
    );
  };

  const submitReport = async (userId: number, reason: 'spam' | 'harassment' | 'inappropriate' | 'other') => {
    try {
      await friendsApi.reportUser(deviceId, userId, reason);
      Alert.alert('Success', 'User reported. Thank you for helping keep our community safe.');
    } catch (error) {
      Alert.alert('Error', 'Failed to report user');
    }
  };

  const renderFriendsList = () => (
    <View style={styles.listContainer}>
      {friends.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={[styles.emptyText, { color: themeColors.text.secondary }]}>
            No friends yet. Search for users to add!
          </Text>
        </View>
      ) : (
        <>
          <TouchableOpacity
            style={[styles.clearButton, { borderColor: themeColors.border }]}
            onPress={handleClearAllFriends}
          >
            <Text style={[styles.clearButtonText, { color: '#FF5252' }]}>Clear All Friends</Text>
          </TouchableOpacity>
          
          {friends.map((friend) => (
            <View key={friend.id} style={[styles.userCard, { backgroundColor: themeColors.surface, borderColor: themeColors.border }]}>
              <View style={styles.userInfo}>
                <View style={[styles.avatar, { backgroundColor: themeColors.accent.primary }]}>
                  <Text style={styles.avatarText}>{friend.username[0].toUpperCase()}</Text>
                </View>
                <View style={styles.userDetails}>
                  <Text style={[styles.username, { color: themeColors.text.primary }]}>@{friend.username}</Text>
                  {friend.display_name && (
                    <Text style={[styles.displayName, { color: themeColors.text.secondary }]}>{friend.display_name}</Text>
                  )}
                </View>
              </View>
              <View style={styles.actions}>
                <TouchableOpacity onPress={() => handleRemoveFriend(friend.id, friend.username)}>
                  <Text style={styles.removeText}>Remove</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => handleBlockUser(friend.id, friend.username)}>
                  <Text style={styles.blockText}>Block</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </>
      )}
    </View>
  );

  const renderRequestsList = () => (
    <View style={styles.listContainer}>
      {requests.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={[styles.emptyText, { color: themeColors.text.secondary }]}>
            No pending friend requests
          </Text>
        </View>
      ) : (
        requests.map((request) => (
          <View key={request.id} style={[styles.userCard, { backgroundColor: themeColors.surface, borderColor: themeColors.border }]}>
            <View style={styles.userInfo}>
              <View style={[styles.avatar, { backgroundColor: themeColors.accent.primary }]}>
                <Text style={styles.avatarText}>{request.username[0].toUpperCase()}</Text>
              </View>
              <View style={styles.userDetails}>
                <Text style={[styles.username, { color: themeColors.text.primary }]}>@{request.username}</Text>
                {request.display_name && (
                  <Text style={[styles.displayName, { color: themeColors.text.secondary }]}>{request.display_name}</Text>
                )}
              </View>
            </View>
            <View style={styles.actions}>
              <TouchableOpacity
                style={[styles.acceptButton, { backgroundColor: '#00D2A0' }]}
                onPress={() => handleAcceptRequest(request.id)}
              >
                <Text style={styles.buttonText}>Accept</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.rejectButton, { backgroundColor: '#FF5252' }]}
                onPress={() => handleRejectRequest(request.id)}
              >
                <Text style={styles.buttonText}>Reject</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))
      )}
    </View>
  );

  const renderSearch = () => (
    <View style={styles.listContainer}>
      <View style={styles.searchBar}>
        <TextInput
          style={[styles.searchInput, { 
            backgroundColor: themeColors.surface, 
            color: themeColors.text.primary,
            borderColor: themeColors.border 
          }]}
          placeholder="Search username..."
          placeholderTextColor={themeColors.text.tertiary}
          value={searchQuery}
          onChangeText={setSearchQuery}
          onSubmitEditing={handleSearch}
          autoCapitalize="none"
        />
        <TouchableOpacity
          style={[styles.searchButton, { backgroundColor: themeColors.accent.primary }]}
          onPress={handleSearch}
          disabled={searching}
        >
          {searching ? (
            <ActivityIndicator color="#FFFFFF" size="small" />
          ) : (
            <Text style={styles.searchButtonText}>Search</Text>
          )}
        </TouchableOpacity>
      </View>

      {searchResults.map((user) => (
        <View key={user.id} style={[styles.userCard, { backgroundColor: themeColors.surface, borderColor: themeColors.border }]}>
          <View style={styles.userInfo}>
            <View style={[styles.avatar, { backgroundColor: themeColors.accent.primary }]}>
              <Text style={styles.avatarText}>{user.username[0].toUpperCase()}</Text>
            </View>
            <View style={styles.userDetails}>
              <Text style={[styles.username, { color: themeColors.text.primary }]}>@{user.username}</Text>
              {user.display_name && (
                <Text style={[styles.displayName, { color: themeColors.text.secondary }]}>{user.display_name}</Text>
              )}
              {user.bio && (
                <Text style={[styles.bio, { color: themeColors.text.tertiary }]} numberOfLines={2}>{user.bio}</Text>
              )}
            </View>
          </View>
          <View style={styles.actions}>
            <TouchableOpacity
              style={[styles.addButton, { backgroundColor: themeColors.accent.primary }]}
              onPress={() => handleSendRequest(user.username)}
            >
              <Text style={styles.buttonText}>Add</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => handleReportUser(user.id, user.username)}>
              <Text style={styles.reportText}>Report</Text>
            </TouchableOpacity>
          </View>
        </View>
      ))}
    </View>
  );

  const renderBlocked = () => (
    <View style={styles.listContainer}>
      {blocked.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={[styles.emptyText, { color: themeColors.text.secondary }]}>
            No blocked users
          </Text>
        </View>
      ) : (
        blocked.map((user) => (
          <View key={user.id} style={[styles.userCard, { backgroundColor: themeColors.surface, borderColor: themeColors.border }]}>
            <View style={styles.userInfo}>
              <View style={[styles.avatar, { backgroundColor: '#FF5252' }]}>
                <Text style={styles.avatarText}>{user.username[0].toUpperCase()}</Text>
              </View>
              <View style={styles.userDetails}>
                <Text style={[styles.username, { color: themeColors.text.primary }]}>@{user.username}</Text>
                {user.display_name && (
                  <Text style={[styles.displayName, { color: themeColors.text.secondary }]}>{user.display_name}</Text>
                )}
              </View>
            </View>
            <TouchableOpacity
              style={[styles.unblockButton, { backgroundColor: themeColors.accent.primary }]}
              onPress={() => handleUnblockUser(user.id)}
            >
              <Text style={styles.buttonText}>Unblock</Text>
            </TouchableOpacity>
          </View>
        ))
      )}
    </View>
  );

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View style={[styles.container, { backgroundColor: themeColors.background }]}>
        {/* Header */}
        <View style={[styles.header, { borderBottomColor: themeColors.border }]}>
          <Text style={[styles.title, { color: themeColors.text.primary }]}>Friends</Text>
          <TouchableOpacity onPress={onClose}>
            <Text style={[styles.closeButton, { color: themeColors.text.primary }]}>✕</Text>
          </TouchableOpacity>
        </View>

        {/* Tabs */}
        <View style={styles.tabs}>
          {(['friends', 'requests', 'search', 'blocked'] as Tab[]).map((tab) => (
            <TouchableOpacity
              key={tab}
              style={[
                styles.tab,
                activeTab === tab && { borderBottomColor: themeColors.accent.primary, borderBottomWidth: 2 }
              ]}
              onPress={() => setActiveTab(tab)}
            >
              <Text style={[
                styles.tabText,
                { color: activeTab === tab ? themeColors.accent.primary : themeColors.text.secondary }
              ]}>
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </Text>
              {tab === 'requests' && requests.length > 0 && (
                <View style={[styles.badge, { backgroundColor: '#FF5252' }]}>
                  <Text style={styles.badgeText}>{requests.length}</Text>
                </View>
              )}
            </TouchableOpacity>
          ))}
        </View>

        {/* Content */}
        <ScrollView style={styles.content}>
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={themeColors.accent.primary} />
            </View>
          ) : (
            <>
              {activeTab === 'friends' && renderFriendsList()}
              {activeTab === 'requests' && renderRequestsList()}
              {activeTab === 'search' && renderSearch()}
              {activeTab === 'blocked' && renderBlocked()}
            </>
          )}
        </ScrollView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 60,
    borderBottomWidth: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
  },
  closeButton: {
    fontSize: 28,
    fontWeight: '300',
  },
  tabs: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    position: 'relative',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
  },
  badge: {
    position: 'absolute',
    top: 8,
    right: 8,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  content: {
    flex: 1,
  },
  listContainer: {
    padding: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
  },
  userCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '700',
  },
  userDetails: {
    flex: 1,
  },
  username: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  displayName: {
    fontSize: 14,
    marginBottom: 2,
  },
  bio: {
    fontSize: 13,
    marginTop: 4,
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
  },
  acceptButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  rejectButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  addButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  unblockButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  removeText: {
    color: '#FF5252',
    fontSize: 14,
    fontWeight: '600',
    paddingHorizontal: 8,
  },
  blockText: {
    color: '#FF8E53',
    fontSize: 14,
    fontWeight: '600',
    paddingHorizontal: 8,
  },
  reportText: {
    color: '#FF5252',
    fontSize: 14,
    fontWeight: '600',
    paddingHorizontal: 8,
  },
  searchBar: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  searchInput: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    fontSize: 16,
  },
  searchButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 80,
  },
  searchButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  clearButton: {
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
    marginBottom: 16,
  },
  clearButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
});
