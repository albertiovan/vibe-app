/**
 * Activity Completion Service
 * Tracks when users press GO NOW and complete activities
 */

import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://localhost/vibe_app'
});

export interface ActivityInstance {
  id: number;
  user_id: string;
  activity_id: number;
  venue_id?: number;
  action_type: 'go_now' | 'learn_more';
  action_timestamp: Date;
  status: 'pending' | 'ongoing' | 'completed' | 'skipped';
  user_confirmed?: boolean;
  user_rating?: number;
  user_review?: string;
  photo_url?: string;
  photo_shared?: boolean;
  prompted_at?: Date;
  responded_at?: Date;
  created_at: Date;
  updated_at: Date;
  
  // Joined fields
  activity_name?: string;
  activity_category?: string;
  venue_name?: string;
  venue_address?: string;
}

export interface CompletedActivity {
  instance_id: number;
  user_id: string;
  activity_id: number;
  activity_name: string;
  category: string;
  subcategory?: string;
  venue_id?: number;
  venue_name?: string;
  venue_address?: string;
  venue_latitude?: number;
  venue_longitude?: number;
  user_rating: number;
  user_review?: string;
  photo_url?: string;
  photo_shared: boolean;
  started_at: Date;
  completed_at: Date;
  created_at: Date;
}

export class ActivityCompletionService {
  
  /**
   * Log when user presses GO NOW or Learn More
   */
  static async logActivity(
    userId: string,
    activityId: number,
    actionType: 'go_now' | 'learn_more',
    venueId?: number
  ): Promise<number> {
    const result = await pool.query(
      `INSERT INTO activity_instances 
       (user_id, activity_id, venue_id, action_type, action_timestamp, status)
       VALUES ($1, $2, $3, $4, NOW(), 'pending')
       RETURNING id`,
      [userId, activityId, venueId, actionType]
    );
    
    return result.rows[0].id;
  }
  
  /**
   * Get the most recent pending activity that should be prompted about
   * Only returns activities where:
   * - Status is 'pending'
   * - Action was 'go_now' (high intent)
   * - At least 1 hour has passed since action
   */
  static async getPromptableActivity(userId: string): Promise<ActivityInstance | null> {
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    
    const result = await pool.query(
      `SELECT 
        ai.*,
        a.name as activity_name,
        a.category as activity_category,
        v.name as venue_name,
        v.address as venue_address
       FROM activity_instances ai
       JOIN activities a ON ai.activity_id = a.id
       LEFT JOIN venues v ON ai.venue_id = v.id
       WHERE ai.user_id = $1
         AND ai.status = 'pending'
         AND ai.action_timestamp < $2
         AND ai.action_type = 'go_now'
       ORDER BY ai.action_timestamp DESC
       LIMIT 1`,
      [userId, oneHourAgo]
    );
    
    return result.rows[0] || null;
  }
  
  /**
   * Get count of pending activities (for "X more to review" display)
   */
  static async getPendingCount(userId: string): Promise<number> {
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    
    const result = await pool.query(
      `SELECT COUNT(*) as count
       FROM activity_instances
       WHERE user_id = $1
         AND status = 'pending'
         AND action_timestamp < $2
         AND action_type = 'go_now'`,
      [userId, oneHourAgo]
    );
    
    return parseInt(result.rows[0].count);
  }
  
  /**
   * User confirms they completed the activity
   */
  static async confirmCompletion(
    instanceId: number,
    rating: number,
    photoUrl?: string,
    review?: string
  ): Promise<void> {
    await pool.query(
      `UPDATE activity_instances
       SET 
         status = 'completed',
         user_confirmed = TRUE,
         user_rating = $2,
         photo_url = $3,
         photo_shared = $4,
         user_review = $5,
         responded_at = NOW()
       WHERE id = $1`,
      [instanceId, rating, photoUrl, !!photoUrl, review]
    );
  }
  
  /**
   * User marks activity as ongoing (resets timer)
   */
  static async markOngoing(instanceId: number): Promise<void> {
    await pool.query(
      `UPDATE activity_instances
       SET 
         action_timestamp = NOW(),
         prompted_at = NOW()
       WHERE id = $1`,
      [instanceId]
    );
  }
  
  /**
   * User skips activity (didn't complete it)
   */
  static async skipActivity(instanceId: number): Promise<void> {
    await pool.query(
      `UPDATE activity_instances
       SET 
         status = 'skipped',
         user_confirmed = FALSE,
         responded_at = NOW()
       WHERE id = $1`,
      [instanceId]
    );
  }
  
  /**
   * Get user's completed activities (for History screen)
   */
  static async getCompletedActivities(
    userId: string,
    limit: number = 50,
    offset: number = 0
  ): Promise<CompletedActivity[]> {
    const result = await pool.query(
      `SELECT * FROM user_completed_activities
       WHERE user_id = $1
       ORDER BY completed_at DESC
       LIMIT $2 OFFSET $3`,
      [userId, limit, offset]
    );
    
    return result.rows;
  }
  
  /**
   * Get activity statistics for a user
   */
  static async getUserStats(userId: string): Promise<{
    total_completed: number;
    total_skipped: number;
    average_rating: number;
    activities_with_photos: number;
  }> {
    const result = await pool.query(
      `SELECT 
         COUNT(*) FILTER (WHERE status = 'completed') as total_completed,
         COUNT(*) FILTER (WHERE status = 'skipped') as total_skipped,
         AVG(user_rating) FILTER (WHERE status = 'completed') as average_rating,
         COUNT(*) FILTER (WHERE status = 'completed' AND photo_url IS NOT NULL) as activities_with_photos
       FROM activity_instances
       WHERE user_id = $1`,
      [userId]
    );
    
    return {
      total_completed: parseInt(result.rows[0].total_completed) || 0,
      total_skipped: parseInt(result.rows[0].total_skipped) || 0,
      average_rating: parseFloat(result.rows[0].average_rating) || 0,
      activities_with_photos: parseInt(result.rows[0].activities_with_photos) || 0,
    };
  }
  
  /**
   * Get activity by instance ID
   */
  static async getActivityInstance(instanceId: number): Promise<ActivityInstance | null> {
    const result = await pool.query(
      `SELECT 
        ai.*,
        a.name as activity_name,
        a.category as activity_category,
        v.name as venue_name
       FROM activity_instances ai
       JOIN activities a ON ai.activity_id = a.id
       LEFT JOIN venues v ON ai.venue_id = v.id
       WHERE ai.id = $1`,
      [instanceId]
    );
    
    return result.rows[0] || null;
  }
  
  /**
   * Delete old pending activities (cleanup job)
   * Removes pending activities older than 7 days
   */
  static async cleanupOldPending(): Promise<number> {
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    
    const result = await pool.query(
      `DELETE FROM activity_instances
       WHERE status = 'pending'
         AND action_timestamp < $1
       RETURNING id`,
      [sevenDaysAgo]
    );
    
    return result.rowCount || 0;
  }
}
