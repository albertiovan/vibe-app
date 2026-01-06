/**
 * Friends System API Routes
 * Handles friend requests, search, blocking, and reporting
 */

import express, { Request, Response } from 'express';
import { Pool } from 'pg';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../../.env') });

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

// ============================================
// USER MANAGEMENT
// ============================================

/**
 * Create or get user by device ID
 */
router.post('/user/init', async (req: Request, res: Response) => {
  try {
    const { deviceId, username, displayName } = req.body;

    if (!deviceId) {
      return res.status(400).json({ error: 'Device ID required' });
    }

    // Check if user exists
    let user = await getPool().query(
      'SELECT * FROM users WHERE device_id = $1',
      [deviceId]
    );

    if (user.rows.length === 0) {
      // Create new user
      user = await getPool().query(
        `INSERT INTO users (device_id, username, display_name, last_active)
         VALUES ($1, $2, $3, CURRENT_TIMESTAMP)
         RETURNING *`,
        [deviceId, username || null, displayName || null]
      );
    } else {
      // Update last active
      user = await getPool().query(
        `UPDATE users SET last_active = CURRENT_TIMESTAMP
         WHERE device_id = $1
         RETURNING *`,
        [deviceId]
      );
    }

    res.json({ user: user.rows[0] });
  } catch (error) {
    console.error('Error initializing user:', error);
    res.status(500).json({ error: 'Failed to initialize user' });
  }
});

/**
 * Update user profile
 */
router.put('/user/profile', async (req: Request, res: Response) => {
  try {
    const { deviceId, username, displayName, bio, profilePicture } = req.body;

    if (!deviceId) {
      return res.status(400).json({ error: 'Device ID required' });
    }

    // Check if username is taken
    if (username) {
      const existing = await getPool().query(
        'SELECT id FROM users WHERE username = $1 AND device_id != $2',
        [username, deviceId]
      );
      if (existing.rows.length > 0) {
        return res.status(400).json({ error: 'Username already taken' });
      }
    }

    const result = await getPool().query(
      `UPDATE users 
       SET username = COALESCE($2, username),
           display_name = COALESCE($3, display_name),
           bio = COALESCE($4, bio),
           profile_picture = COALESCE($5, profile_picture),
           updated_at = CURRENT_TIMESTAMP
       WHERE device_id = $1
       RETURNING *`,
      [deviceId, username, displayName, bio, profilePicture]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ user: result.rows[0] });
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

/**
 * Search users by username
 */
router.get('/user/search', async (req: Request, res: Response) => {
  try {
    const { query, deviceId } = req.query;

    if (!query || !deviceId) {
      return res.status(400).json({ error: 'Query and device ID required' });
    }

    // Get current user's blocked list
    const blocked = await getPool().query(
      `SELECT blocked_user_id FROM blocked_users WHERE user_id = (
        SELECT id FROM users WHERE device_id = $1
      )`,
      [deviceId]
    );
    const blockedIds = blocked.rows.map(r => r.blocked_user_id);

    // Search users (exclude self and blocked users)
    let queryText = `
      SELECT id, username, display_name, profile_picture, bio, last_active
      FROM users
      WHERE username ILIKE $1
        AND device_id != $2
        AND is_active = true
    `;
    const params: any[] = [`%${query}%`, deviceId];

    if (blockedIds.length > 0) {
      queryText += ` AND id NOT IN (${blockedIds.map((_, i) => `$${i + 3}`).join(',')})`;
      params.push(...blockedIds);
    }

    queryText += ' ORDER BY username LIMIT 20';

    const result = await getPool().query(queryText, params);

    res.json({ users: result.rows });
  } catch (error) {
    console.error('Error searching users:', error);
    res.status(500).json({ error: 'Failed to search users' });
  }
});

// ============================================
// FRIEND REQUESTS
// ============================================

/**
 * Send friend request
 */
router.post('/request/send', async (req: Request, res: Response) => {
  try {
    const { deviceId, friendUsername } = req.body;

    if (!deviceId || !friendUsername) {
      return res.status(400).json({ error: 'Device ID and friend username required' });
    }

    // Get user IDs
    const users = await getPool().query(
      `SELECT 
        (SELECT id FROM users WHERE device_id = $1) as user_id,
        (SELECT id FROM users WHERE username = $2) as friend_id`,
      [deviceId, friendUsername]
    );

    const { user_id, friend_id } = users.rows[0];

    if (!user_id || !friend_id) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check if already friends or request exists
    const existing = await getPool().query(
      `SELECT * FROM friendships 
       WHERE (user_id = $1 AND friend_id = $2) 
          OR (user_id = $2 AND friend_id = $1)`,
      [user_id, friend_id]
    );

    if (existing.rows.length > 0) {
      return res.status(400).json({ error: 'Friend request already exists' });
    }

    // Check if blocked
    const blocked = await getPool().query(
      `SELECT * FROM blocked_users 
       WHERE (user_id = $1 AND blocked_user_id = $2)
          OR (user_id = $2 AND blocked_user_id = $1)`,
      [user_id, friend_id]
    );

    if (blocked.rows.length > 0) {
      return res.status(403).json({ error: 'Cannot send friend request' });
    }

    // Create friend request
    const result = await getPool().query(
      `INSERT INTO friendships (user_id, friend_id, status, requested_by)
       VALUES ($1, $2, 'pending', $1)
       RETURNING *`,
      [user_id, friend_id]
    );

    res.json({ friendship: result.rows[0] });
  } catch (error) {
    console.error('Error sending friend request:', error);
    res.status(500).json({ error: 'Failed to send friend request' });
  }
});

/**
 * Accept friend request
 */
router.post('/request/accept', async (req: Request, res: Response) => {
  try {
    const { deviceId, friendshipId } = req.body;

    if (!deviceId || !friendshipId) {
      return res.status(400).json({ error: 'Device ID and friendship ID required' });
    }

    const userId = await getPool().query(
      'SELECT id FROM users WHERE device_id = $1',
      [deviceId]
    );

    if (userId.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Update friendship status
    const result = await getPool().query(
      `UPDATE friendships 
       SET status = 'accepted', updated_at = CURRENT_TIMESTAMP
       WHERE id = $1 AND friend_id = $2 AND status = 'pending'
       RETURNING *`,
      [friendshipId, userId.rows[0].id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Friend request not found' });
    }

    // Create reciprocal friendship
    await getPool().query(
      `INSERT INTO friendships (user_id, friend_id, status, requested_by)
       VALUES ($1, $2, 'accepted', $3)
       ON CONFLICT (user_id, friend_id) DO NOTHING`,
      [result.rows[0].friend_id, result.rows[0].user_id, result.rows[0].requested_by]
    );

    res.json({ friendship: result.rows[0] });
  } catch (error) {
    console.error('Error accepting friend request:', error);
    res.status(500).json({ error: 'Failed to accept friend request' });
  }
});

/**
 * Reject friend request
 */
router.post('/request/reject', async (req: Request, res: Response) => {
  try {
    const { deviceId, friendshipId } = req.body;

    if (!deviceId || !friendshipId) {
      return res.status(400).json({ error: 'Device ID and friendship ID required' });
    }

    const userId = await getPool().query(
      'SELECT id FROM users WHERE device_id = $1',
      [deviceId]
    );

    if (userId.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const result = await getPool().query(
      `DELETE FROM friendships 
       WHERE id = $1 AND friend_id = $2 AND status = 'pending'
       RETURNING *`,
      [friendshipId, userId.rows[0].id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Friend request not found' });
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Error rejecting friend request:', error);
    res.status(500).json({ error: 'Failed to reject friend request' });
  }
});

/**
 * Get pending friend requests
 */
router.get('/requests/pending', async (req: Request, res: Response) => {
  try {
    const { deviceId } = req.query;

    if (!deviceId) {
      return res.status(400).json({ error: 'Device ID required' });
    }

    const result = await getPool().query(
      `SELECT f.id, f.created_at, u.id as user_id, u.username, u.display_name, u.profile_picture
       FROM friendships f
       JOIN users u ON f.user_id = u.id
       WHERE f.friend_id = (SELECT id FROM users WHERE device_id = $1)
         AND f.status = 'pending'
       ORDER BY f.created_at DESC`,
      [deviceId]
    );

    res.json({ requests: result.rows });
  } catch (error) {
    console.error('Error getting pending requests:', error);
    res.status(500).json({ error: 'Failed to get pending requests' });
  }
});

/**
 * Get friends list
 */
router.get('/list', async (req: Request, res: Response) => {
  try {
    const { deviceId } = req.query;

    if (!deviceId) {
      return res.status(400).json({ error: 'Device ID required' });
    }

    const result = await getPool().query(
      `SELECT u.id, u.username, u.display_name, u.profile_picture, u.bio, u.last_active, f.created_at as friends_since
       FROM friendships f
       JOIN users u ON f.friend_id = u.id
       WHERE f.user_id = (SELECT id FROM users WHERE device_id = $1)
         AND f.status = 'accepted'
       ORDER BY u.last_active DESC`,
      [deviceId]
    );

    res.json({ friends: result.rows });
  } catch (error) {
    console.error('Error getting friends list:', error);
    res.status(500).json({ error: 'Failed to get friends list' });
  }
});

/**
 * Remove friend
 */
router.delete('/remove', async (req: Request, res: Response) => {
  try {
    const { deviceId, friendId } = req.body;

    if (!deviceId || !friendId) {
      return res.status(400).json({ error: 'Device ID and friend ID required' });
    }

    const userId = await getPool().query(
      'SELECT id FROM users WHERE device_id = $1',
      [deviceId]
    );

    if (userId.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Delete both directions of friendship
    await getPool().query(
      `DELETE FROM friendships 
       WHERE (user_id = $1 AND friend_id = $2)
          OR (user_id = $2 AND friend_id = $1)`,
      [userId.rows[0].id, friendId]
    );

    res.json({ success: true });
  } catch (error) {
    console.error('Error removing friend:', error);
    res.status(500).json({ error: 'Failed to remove friend' });
  }
});

/**
 * Clear all friends
 */
router.delete('/clear', async (req: Request, res: Response) => {
  try {
    const { deviceId } = req.body;

    if (!deviceId) {
      return res.status(400).json({ error: 'Device ID required' });
    }

    const userId = await getPool().query(
      'SELECT id FROM users WHERE device_id = $1',
      [deviceId]
    );

    if (userId.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    await getPool().query(
      `DELETE FROM friendships 
       WHERE user_id = $1 OR friend_id = $1`,
      [userId.rows[0].id]
    );

    res.json({ success: true });
  } catch (error) {
    console.error('Error clearing friends:', error);
    res.status(500).json({ error: 'Failed to clear friends' });
  }
});

// ============================================
// BLOCKING
// ============================================

/**
 * Block user
 */
router.post('/block', async (req: Request, res: Response) => {
  try {
    const { deviceId, blockedUserId, reason } = req.body;

    if (!deviceId || !blockedUserId) {
      return res.status(400).json({ error: 'Device ID and blocked user ID required' });
    }

    const userId = await getPool().query(
      'SELECT id FROM users WHERE device_id = $1',
      [deviceId]
    );

    if (userId.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Remove any existing friendships
    await getPool().query(
      `DELETE FROM friendships 
       WHERE (user_id = $1 AND friend_id = $2)
          OR (user_id = $2 AND friend_id = $1)`,
      [userId.rows[0].id, blockedUserId]
    );

    // Add to blocked list
    const result = await getPool().query(
      `INSERT INTO blocked_users (user_id, blocked_user_id, reason)
       VALUES ($1, $2, $3)
       ON CONFLICT (user_id, blocked_user_id) DO NOTHING
       RETURNING *`,
      [userId.rows[0].id, blockedUserId, reason]
    );

    res.json({ success: true, block: result.rows[0] });
  } catch (error) {
    console.error('Error blocking user:', error);
    res.status(500).json({ error: 'Failed to block user' });
  }
});

/**
 * Unblock user
 */
router.delete('/unblock', async (req: Request, res: Response) => {
  try {
    const { deviceId, blockedUserId } = req.body;

    if (!deviceId || !blockedUserId) {
      return res.status(400).json({ error: 'Device ID and blocked user ID required' });
    }

    const userId = await getPool().query(
      'SELECT id FROM users WHERE device_id = $1',
      [deviceId]
    );

    if (userId.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    await getPool().query(
      'DELETE FROM blocked_users WHERE user_id = $1 AND blocked_user_id = $2',
      [userId.rows[0].id, blockedUserId]
    );

    res.json({ success: true });
  } catch (error) {
    console.error('Error unblocking user:', error);
    res.status(500).json({ error: 'Failed to unblock user' });
  }
});

/**
 * Get blocked users list
 */
router.get('/blocked', async (req: Request, res: Response) => {
  try {
    const { deviceId } = req.query;

    if (!deviceId) {
      return res.status(400).json({ error: 'Device ID required' });
    }

    const result = await getPool().query(
      `SELECT u.id, u.username, u.display_name, u.profile_picture, b.created_at as blocked_at, b.reason
       FROM blocked_users b
       JOIN users u ON b.blocked_user_id = u.id
       WHERE b.user_id = (SELECT id FROM users WHERE device_id = $1)
       ORDER BY b.created_at DESC`,
      [deviceId]
    );

    res.json({ blocked: result.rows });
  } catch (error) {
    console.error('Error getting blocked users:', error);
    res.status(500).json({ error: 'Failed to get blocked users' });
  }
});

// ============================================
// REPORTING
// ============================================

/**
 * Report user
 */
router.post('/report', async (req: Request, res: Response) => {
  try {
    const { deviceId, reportedUserId, reason, description } = req.body;

    if (!deviceId || !reportedUserId || !reason) {
      return res.status(400).json({ error: 'Device ID, reported user ID, and reason required' });
    }

    const userId = await getPool().query(
      'SELECT id FROM users WHERE device_id = $1',
      [deviceId]
    );

    if (userId.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const result = await getPool().query(
      `INSERT INTO user_reports (reporter_id, reported_user_id, reason, description)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [userId.rows[0].id, reportedUserId, reason, description]
    );

    res.json({ success: true, report: result.rows[0] });
  } catch (error) {
    console.error('Error reporting user:', error);
    res.status(500).json({ error: 'Failed to report user' });
  }
});

export default router;
