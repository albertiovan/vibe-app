/**
 * Training Feedback Routes
 * Collect and analyze feedback for improving recommendations
 */

import express, { Request, Response } from 'express';
import { Pool } from 'pg';
import mcpRecommender from '../services/llm/mcpClaudeRecommender.js';
import { ContextualPromptsService } from '../services/context/contextualPrompts.js';
import { analyzeVibeSemantically } from '../services/llm/semanticVibeAnalyzer.js';

const router = express.Router();

// Lazy pool initialization to ensure DATABASE_URL is loaded
let pool: Pool | null = null;
function getPool(): Pool {
  if (!pool) {
    const dbUrl = process.env.DATABASE_URL || 'postgresql://localhost/vibe_app';
    pool = new Pool({ connectionString: dbUrl });
  }
  return pool;
}

/**
 * POST /api/training/recommendations
 * Get recommendations for a vibe without requiring a conversation
 */
router.post('/recommendations', async (req: Request, res: Response) => {
  try {
    const { message, location } = req.body;

    if (!message) {
      return res.status(400).json({
        success: false,
        error: 'Message is required',
      });
    }

    // Analyze vibe semantically to get energy level and other insights
    const semanticAnalysis = await analyzeVibeSemantically(message);

    // Get AI recommendations using the MCP recommender
    const recommendations = await mcpRecommender.getMCPRecommendations({
      vibe: message,
      city: location?.city || 'Bucharest'
    });

    // Detect vibe state
    const vibeState = ContextualPromptsService.detectVibeState(message);

    // Map recommendations to training format
    const activities = recommendations.ideas.map((activity: any) => ({
      id: activity.activityId, // Use activityId from MCP recommender
      name: activity.name,
      bucket: activity.bucket,
      region: activity.region || 'Bucharest',
      energy_level: activity.energy_level,
      indoor_outdoor: activity.indoor_outdoor,
    }));

    res.json({
      success: true,
      activities,
      vibeAnalysis: {
        primaryMood: vibeState,
        energyLevel: semanticAnalysis.energyLevel, // Real energy level from semantic analysis
        suggestedCategories: semanticAnalysis.suggestedCategories,
        preferredMoods: semanticAnalysis.preferredMoods,
        context: message,
      },
    });
  } catch (error) {
    console.error('Training recommendations error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get recommendations',
    });
  }
});

/**
 * POST /api/training/feedback
 * Submit training feedback for a vibe and its recommendations
 */
router.post('/feedback', async (req: Request, res: Response) => {
  try {
    const { vibe, vibeAnalysis, activities, timestamp } = req.body;

    if (!vibe || !activities || activities.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: vibe, activities',
      });
    }

    const client = await getPool().connect();

    try {
      await client.query('BEGIN');

      // Insert training session (marked as v2-semantic for valid data)
      const sessionResult = await client.query(
        `INSERT INTO training_sessions (vibe, vibe_analysis, created_at, semantic_version, is_valid)
         VALUES ($1, $2, $3, 'v2-semantic', true)
         RETURNING id`,
        [vibe, JSON.stringify(vibeAnalysis), timestamp || new Date().toISOString()]
      );

      const sessionId = sessionResult.rows[0].id;

      // Insert activity feedback
      for (const activity of activities) {
        if (activity.feedback) {
          await client.query(
            `INSERT INTO training_feedback 
             (session_id, activity_id, activity_name, bucket, region, energy_level, 
              indoor_outdoor, feedback, created_at)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
            [
              sessionId,
              activity.id,
              activity.name,
              activity.bucket,
              activity.region,
              activity.energy_level || null,
              activity.indoor_outdoor || null,
              activity.feedback,
              timestamp || new Date().toISOString(),
            ]
          );
        }
      }

      await client.query('COMMIT');

      // Get training statistics
      const statsResult = await client.query(
        `SELECT 
          COUNT(*) as total_sessions,
          COUNT(DISTINCT vibe) as unique_vibes,
          SUM(CASE WHEN feedback = 'up' THEN 1 ELSE 0 END) as positive_feedback,
          SUM(CASE WHEN feedback = 'down' THEN 1 ELSE 0 END) as negative_feedback
         FROM training_sessions ts
         JOIN training_feedback tf ON ts.id = tf.session_id`
      );

      res.json({
        success: true,
        sessionId,
        stats: statsResult.rows[0] || {},
      });
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Training feedback error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to save training feedback',
    });
  }
});

/**
 * GET /api/training/stats
 * Get training statistics and insights
 */
router.get('/stats', async (req: Request, res: Response) => {
  try {
    const client = await getPool().connect();

    try {
      // Overall statistics
      const overallStats = await client.query(
        `SELECT 
          COUNT(DISTINCT ts.id) as total_sessions,
          COUNT(DISTINCT ts.vibe) as unique_vibes,
          COUNT(*) as total_feedback,
          SUM(CASE WHEN tf.feedback = 'up' THEN 1 ELSE 0 END) as positive_feedback,
          SUM(CASE WHEN tf.feedback = 'down' THEN 1 ELSE 0 END) as negative_feedback,
          ROUND(
            100.0 * SUM(CASE WHEN tf.feedback = 'up' THEN 1 ELSE 0 END) / 
            NULLIF(COUNT(*), 0), 
            2
          ) as approval_rate
         FROM training_sessions ts
         LEFT JOIN training_feedback tf ON ts.id = tf.session_id`
      );

      // Activity performance (which activities get the most positive feedback)
      const activityPerformance = await client.query(
        `SELECT 
          tf.activity_name,
          tf.bucket,
          tf.energy_level,
          COUNT(*) as total_ratings,
          SUM(CASE WHEN tf.feedback = 'up' THEN 1 ELSE 0 END) as positive,
          SUM(CASE WHEN tf.feedback = 'down' THEN 1 ELSE 0 END) as negative,
          ROUND(
            100.0 * SUM(CASE WHEN tf.feedback = 'up' THEN 1 ELSE 0 END) / 
            NULLIF(COUNT(*), 0), 
            2
          ) as approval_rate
         FROM training_feedback tf
         GROUP BY tf.activity_name, tf.bucket, tf.energy_level
         HAVING COUNT(*) >= 3
         ORDER BY approval_rate DESC
         LIMIT 20`
      );

      // Problem areas (activities with low approval)
      const problemAreas = await client.query(
        `SELECT 
          tf.activity_name,
          tf.bucket,
          tf.energy_level,
          COUNT(*) as total_ratings,
          SUM(CASE WHEN tf.feedback = 'down' THEN 1 ELSE 0 END) as negative,
          ROUND(
            100.0 * SUM(CASE WHEN tf.feedback = 'down' THEN 1 ELSE 0 END) / 
            NULLIF(COUNT(*), 0), 
            2
          ) as rejection_rate
         FROM training_feedback tf
         GROUP BY tf.activity_name, tf.bucket, tf.energy_level
         HAVING COUNT(*) >= 3
         ORDER BY rejection_rate DESC
         LIMIT 20`
      );

      // Vibe patterns (which vibes are most problematic)
      const vibePatterns = await client.query(
        `SELECT 
          ts.vibe,
          ts.vibe_analysis->>'primaryMood' as mood,
          ts.vibe_analysis->>'energyLevel' as energy,
          COUNT(*) as total_activities,
          SUM(CASE WHEN tf.feedback = 'up' THEN 1 ELSE 0 END) as positive,
          SUM(CASE WHEN tf.feedback = 'down' THEN 1 ELSE 0 END) as negative,
          ROUND(
            100.0 * SUM(CASE WHEN tf.feedback = 'up' THEN 1 ELSE 0 END) / 
            NULLIF(COUNT(*), 0), 
            2
          ) as approval_rate
         FROM training_sessions ts
         LEFT JOIN training_feedback tf ON ts.id = tf.session_id
         GROUP BY ts.vibe, ts.vibe_analysis->>'primaryMood', ts.vibe_analysis->>'energyLevel'
         ORDER BY approval_rate ASC
         LIMIT 20`
      );

      res.json({
        success: true,
        data: {
          overall: overallStats.rows[0] || {},
          topActivities: activityPerformance.rows,
          problemAreas: problemAreas.rows,
          vibePatterns: vibePatterns.rows,
        },
      });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Training stats error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch training statistics',
    });
  }
});

/**
 * GET /api/training/insights
 * Get actionable insights from training data to improve prompts
 */
router.get('/insights', async (req: Request, res: Response) => {
  try {
    const client = await getPool().connect();

    try {
      // Energy level mismatches
      const energyMismatches = await client.query(
        `SELECT 
          ts.vibe_analysis->>'energyLevel' as intended_energy,
          tf.energy_level as actual_energy,
          COUNT(*) as occurrences,
          SUM(CASE WHEN tf.feedback = 'down' THEN 1 ELSE 0 END) as rejections
         FROM training_sessions ts
         JOIN training_feedback tf ON ts.id = tf.session_id
         WHERE tf.feedback = 'down' 
           AND ts.vibe_analysis->>'energyLevel' IS NOT NULL
           AND tf.energy_level IS NOT NULL
         GROUP BY ts.vibe_analysis->>'energyLevel', tf.energy_level
         HAVING COUNT(*) >= 2
         ORDER BY rejections DESC`
      );

      // Bucket mismatches
      const bucketIssues = await client.query(
        `SELECT 
          tf.bucket,
          ts.vibe_analysis->>'primaryMood' as mood,
          COUNT(*) as total_suggestions,
          SUM(CASE WHEN tf.feedback = 'down' THEN 1 ELSE 0 END) as rejections,
          ROUND(
            100.0 * SUM(CASE WHEN tf.feedback = 'down' THEN 1 ELSE 0 END) / 
            NULLIF(COUNT(*), 0), 
            2
          ) as rejection_rate
         FROM training_feedback tf
         JOIN training_sessions ts ON tf.session_id = ts.id
         GROUP BY tf.bucket, ts.vibe_analysis->>'primaryMood'
         HAVING COUNT(*) >= 3
         ORDER BY rejection_rate DESC
         LIMIT 15`
      );

      res.json({
        success: true,
        insights: {
          energyMismatches: energyMismatches.rows,
          bucketIssues: bucketIssues.rows,
          recommendations: generateRecommendations(
            energyMismatches.rows,
            bucketIssues.rows
          ),
        },
      });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Training insights error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate insights',
    });
  }
});

/**
 * Generate actionable recommendations from training data
 */
function generateRecommendations(energyMismatches: any[], bucketIssues: any[]): string[] {
  const recommendations: string[] = [];

  // Energy level recommendations
  if (energyMismatches.length > 0) {
    const topMismatch = energyMismatches[0];
    recommendations.push(
      `⚠️ Energy mismatch: When user wants "${topMismatch.intended_energy}" energy, avoid suggesting "${topMismatch.actual_energy}" activities (${topMismatch.rejections} rejections).`
    );
  }

  // Bucket recommendations
  if (bucketIssues.length > 0) {
    const topIssue = bucketIssues[0];
    if (parseFloat(topIssue.rejection_rate) > 60) {
      recommendations.push(
        `⚠️ Bucket mismatch: "${topIssue.bucket}" activities are poorly matched with "${topIssue.mood}" mood (${topIssue.rejection_rate}% rejection rate).`
      );
    }
  }

  // Add general recommendations
  if (recommendations.length === 0) {
    recommendations.push('✅ No major issues detected. Continue collecting training data.');
  }

  return recommendations;
}

export default router;
