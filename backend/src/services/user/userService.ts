/**
 * User Service
 * Manages user preferences, saved activities, and interactions
 */

import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://localhost/vibe_app'
});

export interface UserPreferences {
  favoriteCategories?: string[];
  excludedCategories?: string[];
  preferredEnergyLevels?: string[];
  preferredTimeOfDay?: string[];
  notificationsEnabled?: boolean;
}

export interface SavedActivity {
  id: number;
  activity_id: number;
  activity_name: string;
  activity_category: string;
  saved_at: Date;
  status: 'saved' | 'completed' | 'canceled';
  notes?: string;
}

export class UserService {
  /**
   * Get user preferences
   */
  static async getPreferences(userId: number): Promise<UserPreferences> {
    const result = await pool.query(
      `SELECT preferences FROM users WHERE id = $1`,
      [userId]
    );
    return result.rows[0]?.preferences || {};
  }

  /**
   * Update user preferences (merges with existing preferences)
   */
  static async updatePreferences(userId: number, preferences: UserPreferences): Promise<void> {
    // Get existing preferences first
    const existing = await this.getPreferences(userId);
    
    // Merge new preferences with existing ones
    const merged = {
      ...existing,
      ...preferences
    };
    
    console.log('Updating preferences for user', userId, ':', merged);
    
    await pool.query(
      `UPDATE users SET preferences = $1, updated_at = NOW() WHERE id = $2`,
      [JSON.stringify(merged), userId]
    );
  }

  /**
   * Save an activity for later
   */
  static async saveActivity(
    userId: number,
    activityId: number,
    notes?: string
  ): Promise<SavedActivity> {
    const result = await pool.query(
      `INSERT INTO saved_activities (user_id, activity_id, notes) 
       VALUES ($1, $2, $3)
       ON CONFLICT (user_id, activity_id) 
       DO UPDATE SET 
         saved_at = NOW(),
         status = 'saved',
         notes = COALESCE($3, saved_activities.notes)
       RETURNING id, activity_id, saved_at, status, notes`,
      [userId, activityId, notes]
    );
    return result.rows[0];
  }

  /**
   * Get all saved activities for a user
   */
  static async getSavedActivities(
    userId: number,
    status?: 'saved' | 'completed' | 'canceled'
  ): Promise<SavedActivity[]> {
    const query = status
      ? `SELECT 
           sa.id,
           sa.activity_id,
           a.name as activity_name,
           a.category as activity_category,
           sa.saved_at,
           sa.status,
           sa.notes
         FROM saved_activities sa
         JOIN activities a ON sa.activity_id = a.id
         WHERE sa.user_id = $1 AND sa.status = $2
         ORDER BY sa.saved_at DESC`
      : `SELECT 
           sa.id,
           sa.activity_id,
           a.name as activity_name,
           a.category as activity_category,
           sa.saved_at,
           sa.status,
           sa.notes
         FROM saved_activities sa
         JOIN activities a ON sa.activity_id = a.id
         WHERE sa.user_id = $1
         ORDER BY sa.saved_at DESC`;

    const params = status ? [userId, status] : [userId];
    const result = await pool.query(query, params);
    return result.rows;
  }

  /**
   * Update saved activity status
   */
  static async updateActivityStatus(
    userId: number,
    activityId: number,
    status: 'saved' | 'completed' | 'canceled'
  ): Promise<void> {
    await pool.query(
      `UPDATE saved_activities 
       SET status = $1 
       WHERE user_id = $2 AND activity_id = $3`,
      [status, userId, activityId]
    );
  }

  /**
   * Remove a saved activity
   */
  static async unsaveActivity(userId: number, activityId: number): Promise<void> {
    await pool.query(
      `DELETE FROM saved_activities 
       WHERE user_id = $1 AND activity_id = $2`,
      [userId, activityId]
    );
  }

  /**
   * Track user interaction with an activity
   */
  static async trackInteraction(
    userId: number,
    activityId: number,
    interactionType: 'viewed' | 'liked' | 'booked' | 'shared' | 'dismissed',
    context?: any
  ): Promise<void> {
    await pool.query(
      `INSERT INTO activity_interactions (user_id, activity_id, interaction_type, context) 
       VALUES ($1, $2, $3, $4)`,
      [userId, activityId, interactionType, JSON.stringify(context || {})]
    );
  }

  /**
   * Get user's favorite categories based on interactions
   */
  static async getFavoriteCategories(userId: number, limit: number = 5): Promise<string[]> {
    const result = await pool.query(
      `SELECT a.category, COUNT(*) as interaction_count
       FROM activity_interactions ai
       JOIN activities a ON ai.activity_id = a.id
       WHERE ai.user_id = $1 
         AND ai.interaction_type IN ('viewed', 'liked', 'booked')
         AND ai.created_at > NOW() - INTERVAL '30 days'
       GROUP BY a.category
       ORDER BY interaction_count DESC
       LIMIT $2`,
      [userId, limit]
    );
    return result.rows.map(row => row.category);
  }

  /**
   * Get personalized activity recommendations based on history
   */
  static async getPersonalizedRecommendations(userId: number, limit: number = 10): Promise<any[]> {
    // Get user's favorite categories
    const favoriteCategories = await this.getFavoriteCategories(userId, 3);

    if (favoriteCategories.length === 0) {
      // New user - return popular activities
      const result = await pool.query(
        `SELECT DISTINCT ON (a.id) a.*, 
         COUNT(ai.id) as popularity
         FROM activities a
         LEFT JOIN activity_interactions ai ON a.id = ai.activity_id
         GROUP BY a.id
         ORDER BY popularity DESC
         LIMIT $1`,
        [limit]
      );
      return result.rows;
    }

    // Return activities from favorite categories that user hasn't interacted with recently
    const result = await pool.query(
      `SELECT a.*
       FROM activities a
       WHERE a.category = ANY($1::text[])
         AND NOT EXISTS (
           SELECT 1 FROM activity_interactions ai
           WHERE ai.activity_id = a.id 
             AND ai.user_id = $2
             AND ai.created_at > NOW() - INTERVAL '7 days'
         )
       ORDER BY RANDOM()
       LIMIT $3`,
      [favoriteCategories, userId, limit]
    );
    return result.rows;
  }

  /**
   * Update user location
   */
  static async updateLocation(
    userId: number,
    lat: number,
    lng: number,
    city?: string
  ): Promise<void> {
    await pool.query(
      `UPDATE users 
       SET location_lat = $1, location_lng = $2, location_city = $3 
       WHERE id = $4`,
      [lat, lng, city, userId]
    );
  }

  /**
   * Get user stats for gamification
   */
  static async getUserStats(userId: number): Promise<{
    totalSaved: number;
    totalCompleted: number;
    totalInteractions: number;
    favoriteCategory: string | null;
  }> {
    const [savedResult, interactionsResult, categoryResult] = await Promise.all([
      pool.query(
        `SELECT 
          COUNT(*) FILTER (WHERE status = 'saved') as total_saved,
          COUNT(*) FILTER (WHERE status = 'completed') as total_completed
         FROM saved_activities
         WHERE user_id = $1`,
        [userId]
      ),
      pool.query(
        `SELECT COUNT(*) as total
         FROM activity_interactions
         WHERE user_id = $1`,
        [userId]
      ),
      pool.query(
        `SELECT a.category, COUNT(*) as count
         FROM activity_interactions ai
         JOIN activities a ON ai.activity_id = a.id
         WHERE ai.user_id = $1
         GROUP BY a.category
         ORDER BY count DESC
         LIMIT 1`,
        [userId]
      )
    ]);

    return {
      totalSaved: parseInt(savedResult.rows[0]?.total_saved || '0'),
      totalCompleted: parseInt(savedResult.rows[0]?.total_completed || '0'),
      totalInteractions: parseInt(interactionsResult.rows[0]?.total || '0'),
      favoriteCategory: categoryResult.rows[0]?.category || null
    };
  }
}
