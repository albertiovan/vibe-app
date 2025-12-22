/**
 * Friends API Service
 * Client-side API for friends management
 */

import { API_BASE_URL } from '../config/api';

export interface User {
  id: number;
  username: string;
  display_name?: string;
  profile_picture?: string;
  bio?: string;
  last_active?: string;
}

export interface Friend extends User {
  friends_since: string;
}

export interface FriendRequest {
  id: number;
  user_id: number;
  username: string;
  display_name?: string;
  profile_picture?: string;
  created_at: string;
}

export interface BlockedUser extends User {
  blocked_at: string;
  reason?: string;
}

export const friendsApi = {
  /**
   * Initialize or get user
   */
  async initUser(deviceId: string, username?: string, displayName?: string): Promise<User> {
    const response = await fetch(`${API_BASE_URL}/api/friends/user/init`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ deviceId, username, displayName }),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Failed to initialize user');
    return data.user;
  },

  /**
   * Update user profile
   */
  async updateProfile(
    deviceId: string,
    updates: { username?: string; displayName?: string; bio?: string; profilePicture?: string }
  ): Promise<User> {
    const response = await fetch(`${API_BASE_URL}/api/friends/user/profile`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ deviceId, ...updates }),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Failed to update profile');
    return data.user;
  },

  /**
   * Search users by username
   */
  async searchUsers(deviceId: string, query: string): Promise<User[]> {
    const response = await fetch(
      `${API_BASE_URL}/api/friends/user/search?deviceId=${deviceId}&query=${encodeURIComponent(query)}`
    );
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Failed to search users');
    return data.users;
  },

  /**
   * Send friend request
   */
  async sendFriendRequest(deviceId: string, friendUsername: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/api/friends/request/send`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ deviceId, friendUsername }),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Failed to send friend request');
  },

  /**
   * Accept friend request
   */
  async acceptFriendRequest(deviceId: string, friendshipId: number): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/api/friends/request/accept`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ deviceId, friendshipId }),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Failed to accept friend request');
  },

  /**
   * Reject friend request
   */
  async rejectFriendRequest(deviceId: string, friendshipId: number): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/api/friends/request/reject`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ deviceId, friendshipId }),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Failed to reject friend request');
  },

  /**
   * Get pending friend requests
   */
  async getPendingRequests(deviceId: string): Promise<FriendRequest[]> {
    const response = await fetch(`${API_BASE_URL}/api/friends/requests/pending?deviceId=${deviceId}`);
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Failed to get pending requests');
    return data.requests;
  },

  /**
   * Get friends list
   */
  async getFriends(deviceId: string): Promise<Friend[]> {
    const response = await fetch(`${API_BASE_URL}/api/friends/list?deviceId=${deviceId}`);
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Failed to get friends list');
    return data.friends;
  },

  /**
   * Remove friend
   */
  async removeFriend(deviceId: string, friendId: number): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/api/friends/remove`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ deviceId, friendId }),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Failed to remove friend');
  },

  /**
   * Clear all friends
   */
  async clearAllFriends(deviceId: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/api/friends/clear`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ deviceId }),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Failed to clear friends');
  },

  /**
   * Block user
   */
  async blockUser(deviceId: string, blockedUserId: number, reason?: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/api/friends/block`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ deviceId, blockedUserId, reason }),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Failed to block user');
  },

  /**
   * Unblock user
   */
  async unblockUser(deviceId: string, blockedUserId: number): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/api/friends/unblock`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ deviceId, blockedUserId }),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Failed to unblock user');
  },

  /**
   * Get blocked users
   */
  async getBlockedUsers(deviceId: string): Promise<BlockedUser[]> {
    const response = await fetch(`${API_BASE_URL}/api/friends/blocked?deviceId=${deviceId}`);
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Failed to get blocked users');
    return data.blocked;
  },

  /**
   * Report user
   */
  async reportUser(
    deviceId: string,
    reportedUserId: number,
    reason: 'spam' | 'harassment' | 'inappropriate' | 'other',
    description?: string
  ): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/api/friends/report`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ deviceId, reportedUserId, reason, description }),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Failed to report user');
  },
};
