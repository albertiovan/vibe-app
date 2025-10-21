/**
 * User API Service
 * Frontend interface for user preferences and saved activities
 */

const API_URL = __DEV__
  ? 'http://10.103.30.198:3000/api'
  : 'https://your-production-api.com/api';

export interface UserProfile {
  userId: number;
  preferences: {
    favoriteCategories?: string[];
    excludedCategories?: string[];
    preferredEnergyLevels?: string[];
    preferredTimeOfDay?: string[];
    notificationsEnabled?: boolean;
  };
  stats: {
    totalSaved: number;
    totalCompleted: number;
    totalInteractions: number;
    favoriteCategory: string | null;
  };
  favoriteCategories: string[];
}

export interface SavedActivity {
  id: number;
  activity_id: number;
  activity_name: string;
  activity_category: string;
  saved_at: string;
  status: 'saved' | 'completed' | 'canceled';
  notes?: string;
}

class UserApiService {
  /**
   * Get user profile and stats
   */
  async getProfile(deviceId: string): Promise<UserProfile> {
    const response = await fetch(
      `${API_URL}/user/profile?deviceId=${encodeURIComponent(deviceId)}`
    );

    if (!response.ok) {
      throw new Error('Failed to get profile');
    }

    return response.json();
  }

  /**
   * Update user preferences
   */
  async updatePreferences(
    deviceId: string,
    preferences: UserProfile['preferences']
  ): Promise<{ success: boolean; preferences: UserProfile['preferences'] }> {
    const response = await fetch(`${API_URL}/user/preferences`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ deviceId, preferences }),
    });

    if (!response.ok) {
      throw new Error('Failed to update preferences');
    }

    return response.json();
  }

  /**
   * Save an activity for later
   */
  async saveActivity(
    deviceId: string,
    activityId: number,
    notes?: string
  ): Promise<{ success: boolean; savedActivity: SavedActivity }> {
    const response = await fetch(`${API_URL}/user/save-activity`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ deviceId, activityId, notes }),
    });

    if (!response.ok) {
      throw new Error('Failed to save activity');
    }

    return response.json();
  }

  /**
   * Get saved activities
   */
  async getSavedActivities(
    deviceId: string,
    status?: 'saved' | 'completed' | 'canceled'
  ): Promise<{ savedActivities: SavedActivity[] }> {
    const url = status
      ? `${API_URL}/user/saved-activities?deviceId=${encodeURIComponent(deviceId)}&status=${status}`
      : `${API_URL}/user/saved-activities?deviceId=${encodeURIComponent(deviceId)}`;

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error('Failed to get saved activities');
    }

    return response.json();
  }

  /**
   * Update activity status
   */
  async updateActivityStatus(
    deviceId: string,
    activityId: number,
    status: 'saved' | 'completed' | 'canceled'
  ): Promise<{ success: boolean }> {
    const response = await fetch(`${API_URL}/user/activity-status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ deviceId, activityId, status }),
    });

    if (!response.ok) {
      throw new Error('Failed to update activity status');
    }

    return response.json();
  }

  /**
   * Remove a saved activity
   */
  async unsaveActivity(deviceId: string, activityId: number): Promise<{ success: boolean }> {
    const response = await fetch(
      `${API_URL}/user/saved-activity/${activityId}?deviceId=${encodeURIComponent(deviceId)}`,
      { method: 'DELETE' }
    );

    if (!response.ok) {
      throw new Error('Failed to unsave activity');
    }

    return response.json();
  }

  /**
   * Track user interaction
   */
  async trackInteraction(
    deviceId: string,
    activityId: number,
    interactionType: 'viewed' | 'liked' | 'booked' | 'shared' | 'dismissed',
    context?: any
  ): Promise<{ success: boolean }> {
    const response = await fetch(`${API_URL}/user/track-interaction`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ deviceId, activityId, interactionType, context }),
    });

    if (!response.ok) {
      throw new Error('Failed to track interaction');
    }

    return response.json();
  }

  /**
   * Get personalized recommendations
   */
  async getRecommendations(deviceId: string, limit: number = 10): Promise<{ recommendations: any[] }> {
    const response = await fetch(
      `${API_URL}/user/recommendations?deviceId=${encodeURIComponent(deviceId)}&limit=${limit}`
    );

    if (!response.ok) {
      throw new Error('Failed to get recommendations');
    }

    return response.json();
  }

  /**
   * Update user location
   */
  async updateLocation(
    deviceId: string,
    lat: number,
    lng: number,
    city?: string
  ): Promise<{ success: boolean }> {
    const response = await fetch(`${API_URL}/user/location`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ deviceId, lat, lng, city }),
    });

    if (!response.ok) {
      throw new Error('Failed to update location');
    }

    return response.json();
  }
}

export const userApi = new UserApiService();
