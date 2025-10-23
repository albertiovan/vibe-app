/**
 * Feedback Scoring Service
 * 
 * Analyzes training feedback data to score activities and inform recommendations
 */

import { Pool } from 'pg';

export interface ActivityFeedbackScore {
  activityId: number;
  activityName: string;
  totalRatings: number;
  thumbsUp: number;
  thumbsDown: number;
  approvalRate: number;
  bucket: string;
  shouldAvoid: boolean;  // True if consistently rejected (>80% rejection rate with 3+ ratings)
  shouldBoost: boolean;  // True if consistently approved (>70% approval with 3+ ratings)
}

export interface FeedbackInsights {
  topPerformers: ActivityFeedbackScore[];
  poorPerformers: ActivityFeedbackScore[];
  categoryPerformance: Map<string, number>;  // bucket -> approval rate
  energyMismatches: any[];
}

/**
 * Get feedback scores for all activities that have been rated
 */
export async function getActivityFeedbackScores(pool: Pool): Promise<Map<number, ActivityFeedbackScore>> {
  const query = `
    SELECT 
      activity_id,
      activity_name,
      bucket,
      COUNT(*) as total_ratings,
      SUM(CASE WHEN feedback = 'up' THEN 1 ELSE 0 END) as thumbs_up,
      SUM(CASE WHEN feedback = 'down' THEN 1 ELSE 0 END) as thumbs_down,
      ROUND(AVG(CASE WHEN feedback = 'up' THEN 1.0 ELSE 0.0 END) * 100, 1) as approval_rate
    FROM training_feedback
    WHERE activity_id IS NOT NULL
    GROUP BY activity_id, activity_name, bucket
    HAVING COUNT(*) >= 3
  `;

  const { rows } = await pool.query(query);
  const scoreMap = new Map<number, ActivityFeedbackScore>();

  for (const row of rows) {
    const approvalRate = parseFloat(row.approval_rate);
    const rejectionRate = 100 - approvalRate;
    
    scoreMap.set(row.activity_id, {
      activityId: row.activity_id,
      activityName: row.activity_name,
      totalRatings: parseInt(row.total_ratings),
      thumbsUp: parseInt(row.thumbs_up),
      thumbsDown: parseInt(row.thumbs_down),
      approvalRate: approvalRate,
      bucket: row.bucket,
      shouldAvoid: rejectionRate >= 80 && parseInt(row.total_ratings) >= 3,
      shouldBoost: approvalRate >= 70 && parseInt(row.total_ratings) >= 3,
    });
  }

  return scoreMap;
}

/**
 * Get comprehensive feedback insights for prompt optimization
 */
export async function getFeedbackInsights(pool: Pool): Promise<FeedbackInsights> {
  // Get activity scores
  const activityScores = await getActivityFeedbackScores(pool);
  const allScores = Array.from(activityScores.values());

  // Top performers (>70% approval, 3+ ratings)
  const topPerformers = allScores
    .filter(s => s.approvalRate >= 70)
    .sort((a, b) => b.approvalRate - a.approvalRate)
    .slice(0, 10);

  // Poor performers (<40% approval, 3+ ratings)
  const poorPerformers = allScores
    .filter(s => s.approvalRate < 40)
    .sort((a, b) => a.approvalRate - b.approvalRate)
    .slice(0, 10);

  // Category performance
  const categoryQuery = `
    SELECT 
      bucket,
      COUNT(*) as total_ratings,
      SUM(CASE WHEN feedback = 'up' THEN 1 ELSE 0 END) as thumbs_up,
      ROUND(AVG(CASE WHEN feedback = 'up' THEN 1.0 ELSE 0.0 END) * 100, 1) as approval_rate
    FROM training_feedback
    WHERE bucket IS NOT NULL
    GROUP BY bucket
    HAVING COUNT(*) >= 5
    ORDER BY approval_rate DESC
  `;

  const { rows: categoryRows } = await pool.query(categoryQuery);
  const categoryPerformance = new Map<string, number>();
  
  for (const row of categoryRows) {
    categoryPerformance.set(row.bucket, parseFloat(row.approval_rate));
  }

  // Energy mismatches
  const energyQuery = `
    SELECT 
      ts.vibe_analysis->>'energyLevel' as intended_energy,
      tf.energy_level as actual_energy,
      COUNT(*) as occurrences,
      SUM(CASE WHEN tf.feedback = 'down' THEN 1 ELSE 0 END) as rejections,
      ROUND(AVG(CASE WHEN tf.feedback = 'down' THEN 1.0 ELSE 0.0 END) * 100, 1) as rejection_rate
    FROM training_sessions ts
    JOIN training_feedback tf ON ts.id = tf.session_id
    WHERE tf.feedback = 'down' 
      AND ts.vibe_analysis->>'energyLevel' IS NOT NULL
      AND tf.energy_level IS NOT NULL
    GROUP BY ts.vibe_analysis->>'energyLevel', tf.energy_level
    HAVING COUNT(*) >= 2
    ORDER BY rejections DESC
  `;

  const { rows: energyRows } = await pool.query(energyQuery);

  return {
    topPerformers,
    poorPerformers,
    categoryPerformance,
    energyMismatches: energyRows,
  };
}

/**
 * Apply feedback-based weighting to activity recommendations
 * Returns a scoring multiplier: 0.5 for avoid, 1.5 for boost, 1.0 for neutral
 */
export function getFeedbackMultiplier(activityId: number, feedbackScores: Map<number, ActivityFeedbackScore>): number {
  const score = feedbackScores.get(activityId);
  
  if (!score) {
    return 1.0; // No feedback data, neutral
  }

  if (score.shouldAvoid) {
    return 0.3; // Strong penalty for consistently rejected activities
  }

  if (score.shouldBoost) {
    return 1.8; // Strong boost for consistently approved activities
  }

  // Linear scaling for activities with some feedback but not extreme
  // 40% approval = 0.7x, 50% = 1.0x, 60% = 1.3x, 70% = 1.5x
  if (score.approvalRate < 50) {
    return 0.5 + (score.approvalRate / 100);
  } else if (score.approvalRate < 70) {
    return 1.0 + ((score.approvalRate - 50) / 100);
  }

  return 1.5; // Good but not top tier
}

/**
 * Filter out activities that should be avoided based on feedback
 */
export function filterAvoidedActivities(
  activities: any[],
  feedbackScores: Map<number, ActivityFeedbackScore>
): any[] {
  return activities.filter(activity => {
    const score = feedbackScores.get(activity.id);
    return !score || !score.shouldAvoid;
  });
}
