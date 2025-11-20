/**
 * Vibe Profiles API Service
 * Handles all API calls for custom vibe profiles
 */

import { Platform } from 'react-native';

// Use appropriate API URL based on platform
const getApiUrl = () => {
  if (process.env.EXPO_PUBLIC_API_URL) {
    return process.env.EXPO_PUBLIC_API_URL;
  }
  
  // Match the same IP used in other services for consistency
  if (__DEV__) {
    // For iOS simulator, Android emulator, and local development
    return Platform.OS === 'android' 
      ? 'http://10.0.2.2:3000'
      : 'http://localhost:3000';
  }
  
  // For standalone builds on same Wi-Fi (your Mac's LAN IP)
  return 'http://10.103.30.198:3000';
};

const API_URL = getApiUrl();

export interface VibeProfileFilters {
  energyLevel?: 'low' | 'medium' | 'high';
  indoorOutdoor?: 'indoor' | 'outdoor' | 'both';
  durationRange?: 'quick' | 'short' | 'medium' | 'long' | 'full-day';
  maxDistanceKm?: number | null;
  groupSize?: 'solo' | 'couple' | 'small-group' | 'large-group';
  categories?: string[];
  timeOfDay?: 'morning' | 'afternoon' | 'evening' | 'night' | 'any';
  budget?: 'free' | 'budget' | 'moderate' | 'premium';
  mood?: string;
  whoWith?: 'solo' | 'date' | 'friends' | 'family' | 'colleagues';
  specificTags?: string[];
  vibeText?: string;
}

export interface VibeProfile {
  id: number;
  user_identifier: string;
  name: string;
  emoji?: string;
  description?: string;
  filters: VibeProfileFilters;
  times_used: number;
  last_used_at?: string;
  created_at: string;
  updated_at: string;
}

export interface ProfileTemplate {
  name: string;
  emoji: string;
  description: string;
  filters: VibeProfileFilters;
}

export const vibeProfilesApi = {
  /**
   * Get all profiles for a user
   */
  async getProfiles(deviceId: string): Promise<VibeProfile[]> {
    try {
      const response = await fetch(
        `${API_URL}/api/vibe-profiles?deviceId=${deviceId}`,
        {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          },
        }
      );
      
      if (!response.ok) {
        // Silently return empty array - normal for new users
        if (__DEV__) {
          console.log('📋 No profiles yet for user (status:', response.status, ')');
        }
        return [];
      }
      
      const data = await response.json();
      return data.profiles || [];
    } catch (error) {
      // Network error - backend might not be running or URL incorrect
      // This is expected for new users or when backend is off
      if (__DEV__) {
        console.log('📋 Vibe Profiles: Backend not reachable, showing no profiles');
      }
      return []; // Silently return empty array
    }
  },

  /**
   * Create a new profile
   */
  async createProfile(
    deviceId: string,
    name: string,
    filters: VibeProfileFilters,
    emoji?: string,
    description?: string
  ): Promise<VibeProfile> {
    const response = await fetch(`${API_URL}/api/vibe-profiles`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        deviceId,
        name,
        emoji,
        description,
        filters
      })
    });
    
    if (!response.ok) {
      throw new Error('Failed to create profile');
    }
    
    const data = await response.json();
    return data.profile;
  },

  /**
   * Update an existing profile
   */
  async updateProfile(
    profileId: number,
    deviceId: string,
    updates: {
      name?: string;
      emoji?: string;
      description?: string;
      filters?: VibeProfileFilters;
    }
  ): Promise<VibeProfile> {
    const response = await fetch(`${API_URL}/api/vibe-profiles/${profileId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        deviceId,
        ...updates
      })
    });
    
    if (!response.ok) {
      throw new Error('Failed to update profile');
    }
    
    const data = await response.json();
    return data.profile;
  },

  /**
   * Delete a profile
   */
  async deleteProfile(profileId: number, deviceId: string): Promise<void> {
    const response = await fetch(
      `${API_URL}/api/vibe-profiles/${profileId}?deviceId=${deviceId}`,
      { method: 'DELETE' }
    );
    
    if (!response.ok) {
      throw new Error('Failed to delete profile');
    }
  },

  /**
   * Mark profile as used (tracks usage)
   */
  async markProfileAsUsed(profileId: number, deviceId: string): Promise<void> {
    const response = await fetch(
      `${API_URL}/api/vibe-profiles/${profileId}/use`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ deviceId })
      }
    );
    
    if (!response.ok) {
      throw new Error('Failed to mark profile as used');
    }
  },

  /**
   * Get pre-built profile templates
   */
  async getTemplates(): Promise<ProfileTemplate[]> {
    const response = await fetch(`${API_URL}/api/vibe-profiles/templates`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch templates');
    }
    
    const data = await response.json();
    return data.templates;
  }
};
