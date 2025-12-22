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
// ADMIN AUTHENTICATION MIDDLEWARE
// ============================================

/**
 * Simple admin authentication middleware
 * TODO: Replace with proper JWT authentication in production
 */
async function requireAdmin(req: Request, res: Response, next: express.NextFunction) {
  try {
    const userId = req.query.adminUserId || req.body.adminUserId;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized - Admin credentials required' });
    }

    // Check if user is admin or moderator
    const result = await pool.query(
      `SELECT role FROM user_accounts WHERE id = $1`,
      [userId]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Unauthorized - User not found' });
    }

    const role = result.rows[0].role;
    if (role !== 'admin' && role !== 'moderator') {
      return res.status(403).json({ error: 'Forbidden - Admin access required' });
    }

    // Store role in request for later use
    (req as any).adminRole = role;
    return next();
  } catch (error) {
    console.error('Admin auth error:', error);
    return res.status(500).json({ error: 'Authentication failed' });
  }
}

// ============================================
// MODERATION DASHBOARD
// ============================================

/**
 * GET /api/admin/dashboard
 * Get moderation dashboard overview
 */
router.get('/dashboard', requireAdmin, async (req: Request, res: Response) => {
  try {
    // Get pending reports count
    const reportsResult = await pool.query(
      `SELECT COUNT(*) as pending_reports FROM content_reports WHERE status = 'pending'`
    );

    // Get flagged content count
    const flaggedPostsResult = await pool.query(
      `SELECT COUNT(*) as flagged_posts FROM community_posts WHERE is_flagged = TRUE AND is_hidden = FALSE`
    );

    const flaggedCommentsResult = await pool.query(
      `SELECT COUNT(*) as flagged_comments FROM post_comments WHERE is_flagged = TRUE AND is_hidden = FALSE`
    );

    // Get community stats
    const statsResult = await pool.query(
      `SELECT 
        (SELECT COUNT(*) FROM community_posts WHERE created_at >= NOW() - INTERVAL '24 hours') as posts_today,
        (SELECT COUNT(*) FROM post_comments WHERE created_at >= NOW() - INTERVAL '24 hours') as comments_today,
        (SELECT COUNT(*) FROM activity_reviews WHERE created_at >= NOW() - INTERVAL '24 hours') as reviews_today,
        (SELECT COUNT(*) FROM user_accounts WHERE role = 'user') as total_users,
        (SELECT COUNT(*) FROM beta_waitlist WHERE status = 'waiting') as waitlist_count
      `
    );

    return res.json({
      moderation: {
        pendingReports: parseInt(reportsResult.rows[0].pending_reports),
        flaggedPosts: parseInt(flaggedPostsResult.rows[0].flagged_posts),
        flaggedComments: parseInt(flaggedCommentsResult.rows[0].flagged_comments),
      },
      activity: {
        postsToday: parseInt(statsResult.rows[0].posts_today),
        commentsToday: parseInt(statsResult.rows[0].comments_today),
        reviewsToday: parseInt(statsResult.rows[0].reviews_today),
      },
      community: {
        totalUsers: parseInt(statsResult.rows[0].total_users),
        waitlistCount: parseInt(statsResult.rows[0].waitlist_count),
      },
    });
  } catch (error) {
    console.error('Error fetching dashboard:', error);
    return res.status(500).json({ error: 'Failed to fetch dashboard' });
  }
});

// ============================================
// CONTENT REPORTS
// ============================================

/**
 * GET /api/admin/reports
 * Get all content reports with pagination
 */
router.get('/reports', requireAdmin, async (req: Request, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string) || 50;
    const offset = parseInt(req.query.offset as string) || 0;
    const status = req.query.status || 'pending';

    const result = await pool.query(
      `SELECT 
        cr.*,
        reporter.nickname as reporter_nickname,
        reviewer.nickname as reviewer_nickname
       FROM content_reports cr
       JOIN user_accounts reporter ON cr.reporter_user_id = reporter.id
       LEFT JOIN user_accounts reviewer ON cr.reviewed_by = reviewer.id
       WHERE cr.status = $1
       ORDER BY cr.created_at DESC
       LIMIT $2 OFFSET $3`,
      [status, limit, offset]
    );

    return res.json({
      reports: result.rows,
      hasMore: result.rows.length === limit,
    });
  } catch (error) {
    console.error('Error fetching reports:', error);
    return res.status(500).json({ error: 'Failed to fetch reports' });
  }
});

/**
 * GET /api/admin/reports/:reportId/content
 * Get the actual content being reported
 */
router.get('/reports/:reportId/content', requireAdmin, async (req: Request, res: Response) => {
  try {
    const { reportId } = req.params;

    // Get report details
    const reportResult = await pool.query(
      `SELECT content_type, content_id FROM content_reports WHERE id = $1`,
      [reportId]
    );

    if (reportResult.rows.length === 0) {
      return res.status(404).json({ error: 'Report not found' });
    }

    const { content_type, content_id } = reportResult.rows[0];
    let content = null;

    // Fetch the actual content based on type
    if (content_type === 'post') {
      const result = await pool.query(
        `SELECT cp.*, u.nickname, u.profile_picture, a.name as activity_name
         FROM community_posts cp
         JOIN user_accounts u ON cp.user_id = u.id
         LEFT JOIN activities a ON cp.activity_id = a.id
         WHERE cp.id = $1`,
        [content_id]
      );
      content = result.rows[0];
    } else if (content_type === 'comment') {
      const result = await pool.query(
        `SELECT pc.*, u.nickname, u.profile_picture
         FROM post_comments pc
         JOIN user_accounts u ON pc.user_id = u.id
         WHERE pc.id = $1`,
        [content_id]
      );
      content = result.rows[0];
    } else if (content_type === 'review') {
      const result = await pool.query(
        `SELECT ar.*, u.nickname, u.profile_picture, a.name as activity_name
         FROM activity_reviews ar
         JOIN user_accounts u ON ar.user_id = u.id
         JOIN activities a ON ar.activity_id = a.id
         WHERE ar.id = $1`,
        [content_id]
      );
      content = result.rows[0];
    }

    return res.json({ content });
  } catch (error) {
    console.error('Error fetching reported content:', error);
    return res.status(500).json({ error: 'Failed to fetch content' });
  }
});

/**
 * PUT /api/admin/reports/:reportId/review
 * Review a report and take action
 */
router.put('/reports/:reportId/review', requireAdmin, async (req: Request, res: Response) => {
  try {
    const { reportId } = req.params;
    const { action, adminNotes, adminUserId } = req.body;

    if (!action || !adminUserId) {
      return res.status(400).json({ error: 'action and adminUserId are required' });
    }

    // Valid actions: 'hide', 'delete', 'dismiss'
    if (!['hide', 'delete', 'dismiss'].includes(action)) {
      return res.status(400).json({ error: 'Invalid action' });
    }

    // Get report details
    const reportResult = await pool.query(
      `SELECT content_type, content_id FROM content_reports WHERE id = $1`,
      [reportId]
    );

    if (reportResult.rows.length === 0) {
      return res.status(404).json({ error: 'Report not found' });
    }

    const { content_type, content_id } = reportResult.rows[0];

    // Take action on the content
    if (action === 'hide') {
      if (content_type === 'post') {
        await pool.query(`UPDATE community_posts SET is_hidden = TRUE WHERE id = $1`, [content_id]);
      } else if (content_type === 'comment') {
        await pool.query(`UPDATE post_comments SET is_hidden = TRUE WHERE id = $1`, [content_id]);
      } else if (content_type === 'review') {
        await pool.query(`UPDATE activity_reviews SET is_hidden = TRUE WHERE id = $1`, [content_id]);
      }
    } else if (action === 'delete') {
      if (content_type === 'post') {
        await pool.query(`DELETE FROM community_posts WHERE id = $1`, [content_id]);
      } else if (content_type === 'comment') {
        await pool.query(`DELETE FROM post_comments WHERE id = $1`, [content_id]);
      } else if (content_type === 'review') {
        await pool.query(`DELETE FROM activity_reviews WHERE id = $1`, [content_id]);
      }
    }

    // Update report status
    const newStatus = action === 'dismiss' ? 'dismissed' : 'action_taken';
    await pool.query(
      `UPDATE content_reports 
       SET status = $1, admin_notes = $2, reviewed_by = $3, reviewed_at = NOW()
       WHERE id = $4`,
      [newStatus, adminNotes || null, adminUserId, reportId]
    );

    return res.json({ success: true, action });
  } catch (error) {
    console.error('Error reviewing report:', error);
    return res.status(500).json({ error: 'Failed to review report' });
  }
});

// ============================================
// FLAGGED CONTENT
// ============================================

/**
 * GET /api/admin/flagged
 * Get all flagged content
 */
router.get('/flagged', requireAdmin, async (req: Request, res: Response) => {
  try {
    const contentType = req.query.type || 'posts'; // posts, comments, reviews

    let result;
    if (contentType === 'posts') {
      result = await pool.query(
        `SELECT cp.*, u.nickname, u.profile_picture, a.name as activity_name
         FROM community_posts cp
         JOIN user_accounts u ON cp.user_id = u.id
         LEFT JOIN activities a ON cp.activity_id = a.id
         WHERE cp.is_flagged = TRUE AND cp.is_hidden = FALSE
         ORDER BY cp.created_at DESC
         LIMIT 50`
      );
    } else if (contentType === 'comments') {
      result = await pool.query(
        `SELECT pc.*, u.nickname, u.profile_picture
         FROM post_comments pc
         JOIN user_accounts u ON pc.user_id = u.id
         WHERE pc.is_flagged = TRUE AND pc.is_hidden = FALSE
         ORDER BY pc.created_at DESC
         LIMIT 50`
      );
    } else if (contentType === 'reviews') {
      result = await pool.query(
        `SELECT ar.*, u.nickname, u.profile_picture, a.name as activity_name
         FROM activity_reviews ar
         JOIN user_accounts u ON ar.user_id = u.id
         JOIN activities a ON ar.activity_id = a.id
         WHERE ar.is_flagged = TRUE AND ar.is_hidden = FALSE
         ORDER BY ar.created_at DESC
         LIMIT 50`
      );
    }

    return res.json({ flaggedContent: result?.rows || [] });
  } catch (error) {
    console.error('Error fetching flagged content:', error);
    return res.status(500).json({ error: 'Failed to fetch flagged content' });
  }
});

// ============================================
// USER MANAGEMENT
// ============================================

/**
 * GET /api/admin/users
 * Get users with pagination and search
 */
router.get('/users', requireAdmin, async (req: Request, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string) || 50;
    const offset = parseInt(req.query.offset as string) || 0;
    const search = req.query.search as string;

    let query = `
      SELECT 
        u.*,
        (SELECT COUNT(*) FROM community_posts WHERE user_id = u.id) as posts_count,
        (SELECT COUNT(*) FROM activity_reviews WHERE user_id = u.id) as reviews_count,
        (SELECT COUNT(*) FROM challenge_completions WHERE user_id = u.id) as challenges_count
      FROM user_accounts u
    `;

    const params: any[] = [limit, offset];

    if (search) {
      query += ` WHERE u.nickname ILIKE $3 OR u.email ILIKE $3`;
      params.push(`%${search}%`);
    }

    query += ` ORDER BY u.created_at DESC LIMIT $1 OFFSET $2`;

    const result = await pool.query(query, params);

    return res.json({
      users: result.rows,
      hasMore: result.rows.length === limit,
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    return res.status(500).json({ error: 'Failed to fetch users' });
  }
});

/**
 * PUT /api/admin/users/:userId/role
 * Update user role (admin only, not moderator)
 */
router.put('/users/:userId/role', requireAdmin, async (req: Request, res: Response) => {
  try {
    // Only admins can change roles
    if ((req as any).adminRole !== 'admin') {
      return res.status(403).json({ error: 'Only admins can change user roles' });
    }

    const { userId } = req.params;
    const { role } = req.body;

    if (!['user', 'moderator', 'admin'].includes(role)) {
      return res.status(400).json({ error: 'Invalid role' });
    }

    await pool.query(
      `UPDATE user_accounts SET role = $1 WHERE id = $2`,
      [role, userId]
    );

    return res.json({ success: true });
  } catch (error) {
    console.error('Error updating user role:', error);
    return res.status(500).json({ error: 'Failed to update user role' });
  }
});

// ============================================
// BETA WAITLIST MANAGEMENT
// ============================================

/**
 * GET /api/admin/waitlist
 * Get beta waitlist with pagination
 */
router.get('/waitlist', requireAdmin, async (req: Request, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string) || 50;
    const offset = parseInt(req.query.offset as string) || 0;
    const status = req.query.status || 'waiting';

    const result = await pool.query(
      `SELECT * FROM beta_waitlist 
       WHERE status = $1 
       ORDER BY created_at ASC 
       LIMIT $2 OFFSET $3`,
      [status, limit, offset]
    );

    return res.json({
      waitlist: result.rows,
      hasMore: result.rows.length === limit,
    });
  } catch (error) {
    console.error('Error fetching waitlist:', error);
    return res.status(500).json({ error: 'Failed to fetch waitlist' });
  }
});

/**
 * POST /api/admin/waitlist/:waitlistId/invite
 * Send invite to waitlist user
 */
router.post('/waitlist/:waitlistId/invite', requireAdmin, async (req: Request, res: Response) => {
  try {
    const { waitlistId } = req.params;

    // Generate unique invite code
    const inviteCode = `VIBE-${Math.random().toString(36).substring(2, 10).toUpperCase()}`;

    await pool.query(
      `UPDATE beta_waitlist 
       SET status = 'invited', invite_code = $1, invited_at = NOW()
       WHERE id = $2`,
      [inviteCode, waitlistId]
    );

    // TODO: Send email with invite code
    console.log(`📧 Invite sent with code: ${inviteCode}`);

    return res.json({ success: true, inviteCode });
  } catch (error) {
    console.error('Error sending invite:', error);
    return res.status(500).json({ error: 'Failed to send invite' });
  }
});

// ============================================
// ANALYTICS
// ============================================

/**
 * GET /api/admin/analytics
 * Get community analytics
 */
router.get('/analytics', requireAdmin, async (req: Request, res: Response) => {
  try {
    const period = req.query.period || '7d'; // 7d, 30d, 90d

    let interval = '7 days';
    if (period === '30d') interval = '30 days';
    if (period === '90d') interval = '90 days';

    const result = await pool.query(
      `SELECT 
        COUNT(DISTINCT cp.user_id) as active_users,
        COUNT(cp.id) as total_posts,
        COUNT(pc.id) as total_comments,
        COUNT(ar.id) as total_reviews,
        AVG(ar.rating)::numeric(3,2) as avg_rating,
        COUNT(cc.id) as total_challenges
       FROM community_posts cp
       LEFT JOIN post_comments pc ON pc.created_at >= NOW() - INTERVAL '${interval}'
       LEFT JOIN activity_reviews ar ON ar.created_at >= NOW() - INTERVAL '${interval}'
       LEFT JOIN challenge_completions cc ON cc.created_at >= NOW() - INTERVAL '${interval}'
       WHERE cp.created_at >= NOW() - INTERVAL '${interval}'`
    );

    return res.json({
      period,
      analytics: result.rows[0],
    });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    return res.status(500).json({ error: 'Failed to fetch analytics' });
  }
});

export default router;
