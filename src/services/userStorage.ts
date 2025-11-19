/**
 * User Storage Service
 * Manages user account data and authentication state
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

const USER_ACCOUNT_KEY = '@vibe_user_account';
const USER_PREFERENCES_KEY = '@vibe_user_preferences';

export interface UserAccount {
  userId: string;
  name: string;
  nickname?: string; // Display name for social features
  email?: string;
  profilePicture?: string; // URI to profile photo (local or remote)
  createdAt: string;
  onboardingCompleted: boolean;
}

export interface UserPreferences {
  interests: string[];
  energyLevel: 'low' | 'medium' | 'high';
  indoorOutdoor: 'indoor' | 'outdoor' | 'both';
  opennessScore: number; // 1-5, willingness to try new things
}

export const userStorage = {
  /**
   * Check if user account exists
   */
  async hasAccount(): Promise<boolean> {
    try {
      const account = await AsyncStorage.getItem(USER_ACCOUNT_KEY);
      return account !== null;
    } catch (error) {
      console.error('Error checking account:', error);
      return false;
    }
  },

  /**
   * Get current user account
   */
  async getAccount(): Promise<UserAccount | null> {
    try {
      const accountJson = await AsyncStorage.getItem(USER_ACCOUNT_KEY);
      if (!accountJson) return null;
      return JSON.parse(accountJson);
    } catch (error) {
      console.error('Error getting account:', error);
      return null;
    }
  },

  /**
   * Create new user account
   */
  async createAccount(name: string, email?: string): Promise<UserAccount> {
    try {
      const userId = `user_${Date.now()}_${Math.random().toString(36).substring(7)}`;
      
      const account: UserAccount = {
        userId,
        name,
        email,
        createdAt: new Date().toISOString(),
        onboardingCompleted: false,
      };

      await AsyncStorage.setItem(USER_ACCOUNT_KEY, JSON.stringify(account));
      console.log('✅ User account created:', userId);
      
      return account;
    } catch (error) {
      console.error('Error creating account:', error);
      throw error;
    }
  },

  /**
   * Update user account
   */
  async updateAccount(updates: Partial<UserAccount>): Promise<void> {
    try {
      const account = await this.getAccount();
      if (!account) throw new Error('No account found');

      const updatedAccount = { ...account, ...updates };
      await AsyncStorage.setItem(USER_ACCOUNT_KEY, JSON.stringify(updatedAccount));
      console.log('✅ Account updated');
    } catch (error) {
      console.error('Error updating account:', error);
      throw error;
    }
  },

  /**
   * Complete onboarding
   */
  async completeOnboarding(preferences: UserPreferences): Promise<void> {
    try {
      await this.updateAccount({ onboardingCompleted: true });
      await AsyncStorage.setItem(USER_PREFERENCES_KEY, JSON.stringify(preferences));
      console.log('✅ Onboarding completed');
    } catch (error) {
      console.error('Error completing onboarding:', error);
      throw error;
    }
  },

  /**
   * Get user preferences
   */
  async getPreferences(): Promise<UserPreferences | null> {
    try {
      const prefsJson = await AsyncStorage.getItem(USER_PREFERENCES_KEY);
      if (!prefsJson) return null;
      return JSON.parse(prefsJson);
    } catch (error) {
      console.error('Error getting preferences:', error);
      return null;
    }
  },

  /**
   * Update user preferences
   */
  async updatePreferences(updates: Partial<UserPreferences>): Promise<void> {
    try {
      const prefs = await this.getPreferences();
      const updatedPrefs = prefs ? { ...prefs, ...updates } : updates;
      await AsyncStorage.setItem(USER_PREFERENCES_KEY, JSON.stringify(updatedPrefs));
      console.log('✅ Preferences updated');
    } catch (error) {
      console.error('Error updating preferences:', error);
      throw error;
    }
  },

  /**
   * Clear all user data (for development/logout)
   */
  async clearAllData(): Promise<void> {
    try {
      await AsyncStorage.multiRemove([
        USER_ACCOUNT_KEY,
        USER_PREFERENCES_KEY,
      ]);
      console.log('🗑️  All user data cleared');
    } catch (error) {
      console.error('Error clearing data:', error);
      throw error;
    }
  },

  /**
   * Get user ID for API calls
   */
  async getUserId(): Promise<string | null> {
    try {
      const account = await this.getAccount();
      return account?.userId || null;
    } catch (error) {
      console.error('Error getting user ID:', error);
      return null;
    }
  },
};
