import express, { Request, Response } from 'express';
import { Pool } from 'pg';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../../.env') });

const router = express.Router();

// Database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://localhost/vibe_app',
});

// ============================================
// VIBE STORIES FEED
// ============================================

/**
 * GET /api/community/feed
 * Get paginated community feed
 * Query params: limit, offset, filter (all|following|nearby)
 */
router.get('/feed', async (req: Request, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string) || 20;
    const offset = parseInt(req.query.offset as string) || 0;
    const filter = req.query.filter || 'all'; // all, following, nearby
    const userId = req.query.userId as string;

    let query = `
      SELECT 
        cp.*,
        cp.user_id as nickname,
        NULL as profile_picture,
        a.name as activity_name,
        a.name_ro as activity_name_ro,
        a.hero_image_url as activity_image_url,
        EXISTS(SELECT 1 FROM post_likes WHERE post_id = cp.id AND user_id = $3) as user_has_liked
      FROM community_posts cp
      LEFT JOIN activities a ON cp.activity_id = a.id
      WHERE cp.is_hidden = FALSE
      ORDER BY cp.created_at DESC
      LIMIT $1 OFFSET $2
    `;

    const result = await pool.query(query, [limit, offset, userId || null]);

    return res.json({
      posts: result.rows,
      hasMore: result.rows.length === limit,
    });
  } catch (error) {
    console.error('Error fetching community feed:', error);
    return res.status(500).json({ error: 'Failed to fetch community feed' });
  }
});

/**
 * POST /api/community/posts
 * Create a new community post
 */
router.post('/posts', async (req: Request, res: Response) => {
  try {
    const {
      userId,
      activityId,
      postType,
      content,
      photoUrl,
      vibeBefore,
      vibeAfter,
      energyLevel,
      locationCity,
      locationLat,
      locationLng,
    } = req.body;

    if (!userId || !postType) {
      return res.status(400).json({ error: 'userId and postType are required' });
    }

    const result = await pool.query(
      `INSERT INTO community_posts 
       (user_id, activity_id, post_type, content, photo_url, vibe_before, vibe_after, 
        energy_level, location_city, location_lat, location_lng)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
       RETURNING *`,
      [
        userId,
        activityId || null,
        postType,
        content || null,
        photoUrl || null,
        vibeBefore || null,
        vibeAfter || null,
        energyLevel || null,
        locationCity || null,
        locationLat || null,
        locationLng || null,
      ]
    );

    return res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating post:', error);
    return res.status(500).json({ error: 'Failed to create post' });
  }
});

/**
 * DELETE /api/community/posts/:postId
 * Delete a post (only by owner or admin)
 */
router.delete('/posts/:postId', async (req: Request, res: Response) => {
  try {
    const { postId } = req.params;
    const { userId } = req.query;

    // Check ownership or admin role
    const checkResult = await pool.query(
      `SELECT user_id FROM community_posts WHERE id = $1`,
      [postId]
    );

    if (checkResult.rows.length === 0) {
      return res.status(404).json({ error: 'Post not found' });
    }

    if (checkResult.rows[0].user_id !== userId) {
      // TODO: Check if user is admin
      return res.status(403).json({ error: 'Unauthorized' });
    }

    await pool.query(`DELETE FROM community_posts WHERE id = $1`, [postId]);
    return res.json({ success: true });
  } catch (error) {
    console.error('Error deleting post:', error);
    return res.status(500).json({ error: 'Failed to delete post' });
  }
});

// ============================================
// LIKES
// ============================================

/**
 * POST /api/community/posts/:postId/like
 * Like a post
 */
router.post('/posts/:postId/like', async (req: Request, res: Response) => {
  try {
    const { postId } = req.params;
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ error: 'userId is required' });
    }

    // Insert like (will fail silently if already exists due to UNIQUE constraint)
    await pool.query(
      `INSERT INTO post_likes (post_id, user_id) 
       VALUES ($1, $2) 
       ON CONFLICT (post_id, user_id) DO NOTHING`,
      [postId, userId]
    );

    // Get updated post
    const result = await pool.query(
      `SELECT likes_count FROM community_posts WHERE id = $1`,
      [postId]
    );

    // TODO: Send push notification to post owner
    const postOwner = await pool.query(
      `SELECT user_id FROM community_posts WHERE id = $1`,
      [postId]
    );

    if (postOwner.rows[0]?.user_id !== userId) {
      // Don't notify if user liked their own post
      await sendPushNotification(postOwner.rows[0]?.user_id, {
        type: 'like',
        postId,
        userId,
      });
    }

    return res.json({ likesCount: result.rows[0]?.likes_count || 0 });
  } catch (error) {
    console.error('Error liking post:', error);
    return res.status(500).json({ error: 'Failed to like post' });
  }
});

/**
 * DELETE /api/community/posts/:postId/like
 * Unlike a post
 */
router.delete('/posts/:postId/like', async (req: Request, res: Response) => {
  try {
    const { postId } = req.params;
    const { userId } = req.query;

    await pool.query(
      `DELETE FROM post_likes WHERE post_id = $1 AND user_id = $2`,
      [postId, userId]
    );

    const result = await pool.query(
      `SELECT likes_count FROM community_posts WHERE id = $1`,
      [postId]
    );

    return res.json({ likesCount: result.rows[0]?.likes_count || 0 });
  } catch (error) {
    console.error('Error unliking post:', error);
    return res.status(500).json({ error: 'Failed to unlike post' });
  }
});

// ============================================
// COMMENTS
// ============================================

/**
 * GET /api/community/posts/:postId/comments
 * Get comments for a post
 */
router.get('/posts/:postId/comments', async (req: Request, res: Response) => {
  try {
    const { postId } = req.params;
    const limit = parseInt(req.query.limit as string) || 50;
    const offset = parseInt(req.query.offset as string) || 0;

    const result = await pool.query(
      `SELECT 
        pc.*,
        u.nickname,
        u.profile_picture
       FROM post_comments pc
       JOIN user_accounts u ON pc.user_id = u.id
       WHERE pc.post_id = $1 AND pc.is_hidden = FALSE
       ORDER BY pc.created_at ASC
       LIMIT $2 OFFSET $3`,
      [postId, limit, offset]
    );

    return res.json({ comments: result.rows });
  } catch (error) {
    console.error('Error fetching comments:', error);
    return res.status(500).json({ error: 'Failed to fetch comments' });
  }
});

/**
 * POST /api/community/posts/:postId/comments
 * Add a comment to a post
 */
router.post('/posts/:postId/comments', async (req: Request, res: Response) => {
  try {
    const { postId } = req.params;
    const { userId, content } = req.body;

    if (!userId || !content) {
      return res.status(400).json({ error: 'userId and content are required' });
    }

    const result = await pool.query(
      `INSERT INTO post_comments (post_id, user_id, content)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [postId, userId, content]
    );

    // Get user info
    const userResult = await pool.query(
      `SELECT nickname, profile_picture FROM user_accounts WHERE id = $1`,
      [userId]
    );

    const comment = {
      ...result.rows[0],
      ...userResult.rows[0],
    };

    // TODO: Send push notification to post owner
    const postOwner = await pool.query(
      `SELECT user_id FROM community_posts WHERE id = $1`,
      [postId]
    );

    if (postOwner.rows[0]?.user_id !== userId) {
      await sendPushNotification(postOwner.rows[0]?.user_id, {
        type: 'comment',
        postId,
        userId,
        content,
      });
    }

    return res.status(201).json(comment);
  } catch (error) {
    console.error('Error adding comment:', error);
    return res.status(500).json({ error: 'Failed to add comment' });
  }
});

/**
 * DELETE /api/community/comments/:commentId
 * Delete a comment (only by owner or admin)
 */
router.delete('/comments/:commentId', async (req: Request, res: Response) => {
  try {
    const { commentId } = req.params;
    const { userId } = req.query;

    const checkResult = await pool.query(
      `SELECT user_id FROM post_comments WHERE id = $1`,
      [commentId]
    );

    if (checkResult.rows.length === 0) {
      return res.status(404).json({ error: 'Comment not found' });
    }

    if (checkResult.rows[0].user_id !== userId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    await pool.query(`DELETE FROM post_comments WHERE id = $1`, [commentId]);
    return res.json({ success: true });
  } catch (error) {
    console.error('Error deleting comment:', error);
    return res.status(500).json({ error: 'Failed to delete comment' });
  }
});

// ============================================
// ACTIVITY REVIEWS & RATINGS
// ============================================

/**
 * GET /api/community/activities/:activityId/reviews
 * Get reviews for an activity
 */
router.get('/activities/:activityId/reviews', async (req: Request, res: Response) => {
  try {
    const { activityId } = req.params;
    const limit = parseInt(req.query.limit as string) || 20;
    const offset = parseInt(req.query.offset as string) || 0;

    const result = await pool.query(
      `SELECT 
        ar.*,
        u.nickname,
        u.profile_picture
       FROM activity_reviews ar
       JOIN user_accounts u ON ar.user_id = u.id
       WHERE ar.activity_id = $1 AND ar.is_hidden = FALSE
       ORDER BY ar.created_at DESC
       LIMIT $2 OFFSET $3`,
      [activityId, limit, offset]
    );

    // Get average rating
    const avgResult = await pool.query(
      `SELECT AVG(rating)::numeric(3,2) as avg_rating, COUNT(*) as review_count
       FROM activity_reviews
       WHERE activity_id = $1 AND is_hidden = FALSE`,
      [activityId]
    );

    return res.json({
      reviews: result.rows,
      avgRating: parseFloat(avgResult.rows[0].avg_rating) || 0,
      reviewCount: parseInt(avgResult.rows[0].review_count) || 0,
    });
  } catch (error) {
    console.error('Error fetching reviews:', error);
    return res.status(500).json({ error: 'Failed to fetch reviews' });
  }
});

/**
 * POST /api/community/activities/:activityId/reviews
 * Create or update a review for an activity
 */
router.post('/activities/:activityId/reviews', async (req: Request, res: Response) => {
  try {
    const { activityId } = req.params;
    const {
      userId,
      rating,
      reviewText,
      photoUrl,
      vibeTags,
      recommendedForEnergy,
    } = req.body;

    if (!userId || !rating) {
      return res.status(400).json({ error: 'userId and rating are required' });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({ error: 'Rating must be between 1 and 5' });
    }

    const result = await pool.query(
      `INSERT INTO activity_reviews 
       (user_id, activity_id, rating, review_text, photo_url, vibe_tags, recommended_for_energy)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       ON CONFLICT (user_id, activity_id) 
       DO UPDATE SET 
         rating = EXCLUDED.rating,
         review_text = EXCLUDED.review_text,
         photo_url = EXCLUDED.photo_url,
         vibe_tags = EXCLUDED.vibe_tags,
         recommended_for_energy = EXCLUDED.recommended_for_energy,
         updated_at = NOW()
       RETURNING *`,
      [
        userId,
        activityId,
        rating,
        reviewText || null,
        photoUrl || null,
        JSON.stringify(vibeTags || []),
        recommendedForEnergy || null,
      ]
    );

    return res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating review:', error);
    return res.status(500).json({ error: 'Failed to create review' });
  }
});

// ============================================
// CHALLENGE LEADERBOARD
// ============================================

/**
 * GET /api/community/leaderboard
 * Get challenge leaderboard
 * Query params: period (weekly|monthly|alltime)
 */
router.get('/leaderboard', async (req: Request, res: Response) => {
  try {
    const period = req.query.period || 'weekly';
    let viewName = 'weekly_challenge_leaderboard';

    if (period === 'monthly') {
      viewName = 'monthly_challenge_leaderboard';
    } else if (period === 'alltime') {
      viewName = 'alltime_challenge_leaderboard';
    }

    const result = await pool.query(`SELECT * FROM ${viewName}`);

    return res.json({ leaderboard: result.rows, period });
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    return res.status(500).json({ error: 'Failed to fetch leaderboard' });
  }
});

/**
 * POST /api/community/challenges/complete
 * Record a challenge completion
 */
router.post('/challenges/complete', async (req: Request, res: Response) => {
  try {
    const {
      userId,
      activityId,
      originalEnergy,
      challengeEnergy,
      photoUrl,
      completionNotes,
    } = req.body;

    if (!userId || !activityId) {
      return res.status(400).json({ error: 'userId and activityId are required' });
    }

    // Calculate energy difference for points
    const energyMap: { [key: string]: number } = { low: 1, medium: 2, high: 3 };
    const energyDiff = Math.abs(
      energyMap[originalEnergy] - energyMap[challengeEnergy]
    );
    const points = energyDiff + 1; // 1-3 points based on difficulty

    const result = await pool.query(
      `INSERT INTO challenge_completions 
       (user_id, activity_id, original_energy, challenge_energy, energy_difference, 
        photo_url, completion_notes, points)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [
        userId,
        activityId,
        originalEnergy,
        challengeEnergy,
        energyDiff,
        photoUrl || null,
        completionNotes || null,
        points,
      ]
    );

    return res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error recording challenge completion:', error);
    return res.status(500).json({ error: 'Failed to record challenge completion' });
  }
});

/**
 * GET /api/community/users/:userId/stats
 * Get user's community stats
 */
router.get('/users/:userId/stats', async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    const stats = await pool.query(
      `SELECT 
        (SELECT COUNT(*) FROM community_posts WHERE user_id = $1) as posts_count,
        (SELECT COUNT(*) FROM activity_reviews WHERE user_id = $1) as reviews_count,
        (SELECT COUNT(*) FROM challenge_completions WHERE user_id = $1) as challenges_count,
        (SELECT SUM(points) FROM challenge_completions WHERE user_id = $1) as total_points,
        (SELECT SUM(likes_count) FROM community_posts WHERE user_id = $1) as total_likes_received
      `,
      [userId]
    );

    return res.json(stats.rows[0]);
  } catch (error) {
    console.error('Error fetching user stats:', error);
    return res.status(500).json({ error: 'Failed to fetch user stats' });
  }
});

// ============================================
// CONTENT MODERATION (Admin)
// ============================================

/**
 * POST /api/community/report
 * Report content for moderation
 */
router.post('/report', async (req: Request, res: Response) => {
  try {
    const { reporterUserId, contentType, contentId, reason, description } = req.body;

    if (!reporterUserId || !contentType || !contentId || !reason) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    await pool.query(
      `INSERT INTO content_reports 
       (reporter_user_id, content_type, content_id, reason, description)
       VALUES ($1, $2, $3, $4, $5)`,
      [reporterUserId, contentType, contentId, reason, description || null]
    );

    return res.status(201).json({ success: true });
  } catch (error) {
    console.error('Error submitting report:', error);
    return res.status(500).json({ error: 'Failed to submit report' });
  }
});

// ============================================
// PUSH NOTIFICATIONS
// ============================================

/**
 * POST /api/community/push-tokens
 * Register push notification token
 */
router.post('/push-tokens', async (req: Request, res: Response) => {
  try {
    const { userId, token, deviceType } = req.body;

    if (!userId || !token) {
      return res.status(400).json({ error: 'userId and token are required' });
    }

    await pool.query(
      `INSERT INTO push_notification_tokens (user_id, token, device_type)
       VALUES ($1, $2, $3)
       ON CONFLICT (user_id, token) 
       DO UPDATE SET updated_at = NOW()`,
      [userId, token, deviceType || 'ios']
    );

    return res.status(201).json({ success: true });
  } catch (error) {
    console.error('Error registering push token:', error);
    return res.status(500).json({ error: 'Failed to register push token' });
  }
});

/**
 * PUT /api/community/push-tokens/:userId/preferences
 * Update push notification preferences
 */
router.put('/push-tokens/:userId/preferences', async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const { likesEnabled, commentsEnabled, challengesEnabled } = req.body;

    await pool.query(
      `UPDATE push_notification_tokens 
       SET likes_enabled = $2, comments_enabled = $3, challenges_enabled = $4
       WHERE user_id = $1`,
      [userId, likesEnabled, commentsEnabled, challengesEnabled]
    );

    return res.json({ success: true });
  } catch (error) {
    console.error('Error updating push preferences:', error);
    return res.status(500).json({ error: 'Failed to update preferences' });
  }
});

// ============================================
// HELPER FUNCTIONS
// ============================================

async function sendPushNotification(
  userId: string,
  notification: { type: string; postId: string; userId: string; content?: string }
) {
  try {
    // Get user's push tokens and preferences
    const result = await pool.query(
      `SELECT token, device_type, likes_enabled, comments_enabled 
       FROM push_notification_tokens 
       WHERE user_id = $1`,
      [userId]
    );

    for (const tokenData of result.rows) {
      // Check if notification type is enabled
      if (notification.type === 'like' && !tokenData.likes_enabled) continue;
      if (notification.type === 'comment' && !tokenData.comments_enabled) continue;

      // Get sender info
      const senderResult = await pool.query(
        `SELECT nickname FROM user_accounts WHERE id = $1`,
        [notification.userId]
      );
      const senderName = senderResult.rows[0]?.nickname || 'Someone';

      // Build notification message
      let message = '';
      if (notification.type === 'like') {
        message = `${senderName} liked your post`;
      } else if (notification.type === 'comment') {
        message = `${senderName} commented: ${notification.content?.substring(0, 50)}...`;
      }

      // TODO: Send actual push notification using Expo Push Notifications
      console.log(`📲 Push notification to ${userId}:`, message);
      
      // Placeholder for actual implementation:
      // await expo.sendPushNotificationsAsync([{
      //   to: tokenData.token,
      //   sound: 'default',
      //   body: message,
      //   data: { postId: notification.postId, type: notification.type },
      // }]);
    }
  } catch (error) {
    console.error('Error sending push notification:', error);
  }
}

export default router;
