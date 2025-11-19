/**
 * Activity Feedback Routes
 * 
 * Tracks user accept/deny decisions for ML learning
 * Stores user preferences and patterns for personalization
 */

import express, { Request, Response } from 'express';
import { Pool } from 'pg';

const router = express.Router();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://localhost/vibe_app',
});

/**
 * POST /api/activities/feedback
 * Track user's accept/deny decision on an activity
 */
router.post('/feedback', async (req: Request, res: Response) => {
  try {
    const { deviceId, activityId, action, userMessage, filters } = req.body;

    if (!deviceId || !activityId || !action) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    if (!['accepted', 'denied'].includes(action)) {
      return res.status(400).json({ error: 'Invalid action. Must be "accepted" or "denied"' });
    }

    console.log(`📊 Activity feedback: ${action} - Activity ${activityId} by ${deviceId}`);

    // Store feedback in database
    await pool.query(`
      INSERT INTO activity_feedback (
        device_id,
        activity_id,
        action,
        user_message,
        filters,
        created_at
      ) VALUES ($1, $2, $3, $4, $5, NOW())
    `, [
      deviceId,
      activityId,
      action,
      userMessage || null,
      filters ? JSON.stringify(filters) : null,
    ]);

    // If accepted, also track in user_activities for history
    if (action === 'accepted') {
      await pool.query(`
        INSERT INTO user_activities (
          device_id,
          activity_id,
          status,
          accepted_at
        ) VALUES ($1, $2, 'pending', NOW())
        ON CONFLICT (device_id, activity_id) 
        DO UPDATE SET status = 'pending', accepted_at = NOW()
      `, [deviceId, activityId]);
    }

    return res.json({ 
      success: true,
      action,
      message: `Activity ${action} successfully tracked`
    });

  } catch (error) {
    console.error('❌ Activity feedback error:', error);
    return res.status(500).json({ 
      error: 'feedback_tracking_failed',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * GET /api/activities/feedback/stats
 * Get user's feedback statistics for ML insights
 */
router.get('/feedback/stats', async (req: Request, res: Response) => {
  try {
    const { deviceId } = req.query;

    if (!deviceId) {
      return res.status(400).json({ error: 'deviceId required' });
    }

    // Get acceptance rate
    const acceptanceRate = await pool.query(`
      SELECT 
        COUNT(*) FILTER (WHERE action = 'accepted') as accepted_count,
        COUNT(*) FILTER (WHERE action = 'denied') as denied_count,
        COUNT(*) as total_count
      FROM activity_feedback
      WHERE device_id = $1
    `, [deviceId]);

    // Get category preferences (most accepted categories)
    const categoryPreferences = await pool.query(`
      SELECT 
        a.category,
        COUNT(*) FILTER (WHERE af.action = 'accepted') as accepted_count,
        COUNT(*) FILTER (WHERE af.action = 'denied') as denied_count,
        ROUND(
          COUNT(*) FILTER (WHERE af.action = 'accepted')::numeric / 
          NULLIF(COUNT(*)::numeric, 0) * 100, 
          2
        ) as acceptance_rate
      FROM activity_feedback af
      JOIN activities a ON a.id = af.activity_id
      WHERE af.device_id = $1
      GROUP BY a.category
      ORDER BY accepted_count DESC
      LIMIT 10
    `, [deviceId]);

    // Get energy level preferences
    const energyPreferences = await pool.query(`
      SELECT 
        a.energy_level,
        COUNT(*) FILTER (WHERE af.action = 'accepted') as accepted_count,
        COUNT(*) FILTER (WHERE af.action = 'denied') as denied_count
      FROM activity_feedback af
      JOIN activities a ON a.id = af.activity_id
      WHERE af.device_id = $1
      GROUP BY a.energy_level
      ORDER BY accepted_count DESC
    `, [deviceId]);

    return res.json({
      deviceId,
      acceptanceRate: acceptanceRate.rows[0],
      categoryPreferences: categoryPreferences.rows,
      energyPreferences: energyPreferences.rows,
    });

  } catch (error) {
    console.error('❌ Feedback stats error:', error);
    return res.status(500).json({ 
      error: 'stats_retrieval_failed',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * GET /api/activities/feedback/recommendations
 * Get ML-powered recommendations based on user's feedback history
 */
router.get('/feedback/recommendations', async (req: Request, res: Response) => {
  try {
    const { deviceId, limit = 5 } = req.query;

    if (!deviceId) {
      return res.status(400).json({ error: 'deviceId required' });
    }

    // Get user's most accepted categories
    const topCategories = await pool.query(`
      SELECT a.category
      FROM activity_feedback af
      JOIN activities a ON a.id = af.activity_id
      WHERE af.device_id = $1 AND af.action = 'accepted'
      GROUP BY a.category
      ORDER BY COUNT(*) DESC
      LIMIT 3
    `, [deviceId]);

    const categories = topCategories.rows.map(row => row.category);

    if (categories.length === 0) {
      // No history, return popular activities
      const popular = await pool.query(`
        SELECT DISTINCT ON (a.id) a.*, v.name as venue_name, v.latitude, v.longitude
        FROM activities a
        LEFT JOIN venues v ON v.activity_id = a.id
        ORDER BY a.id, RANDOM()
        LIMIT $1
      `, [limit]);

      return res.json({
        recommendations: popular.rows,
        reason: 'popular',
      });
    }

    // Get activities from preferred categories that user hasn't seen yet
    const recommendations = await pool.query(`
      SELECT DISTINCT ON (a.id) a.*, v.name as venue_name, v.latitude, v.longitude
      FROM activities a
      LEFT JOIN venues v ON v.activity_id = a.id
      WHERE a.category = ANY($1::text[])
        AND a.id NOT IN (
          SELECT activity_id 
          FROM activity_feedback 
          WHERE device_id = $2
        )
      ORDER BY a.id, RANDOM()
      LIMIT $3
    `, [categories, deviceId, limit]);

    return res.json({
      recommendations: recommendations.rows,
      reason: 'personalized',
      basedOnCategories: categories,
    });

  } catch (error) {
    console.error('❌ Recommendations error:', error);
    return res.status(500).json({ 
      error: 'recommendations_failed',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;
