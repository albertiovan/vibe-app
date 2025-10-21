/**
 * User API Routes
 * Manage user preferences, saved activities, and personalization
 */

import express from 'express';
import { UserService } from '../services/user/userService.js';
import { ConversationHistoryService } from '../services/conversation/conversationHistory.js';

const router = express.Router();

/**
 * GET /api/user/profile
 * Get user profile and stats
 */
router.get('/profile', async (req, res) => {
  try {
    const { deviceId } = req.query;

    if (!deviceId) {
      return res.status(400).json({ error: 'device_id_required' });
    }

    const userId = await ConversationHistoryService.getOrCreateUser(deviceId as string);
    const [preferences, stats, favoriteCategories] = await Promise.all([
      UserService.getPreferences(userId),
      UserService.getUserStats(userId),
      UserService.getFavoriteCategories(userId)
    ]);

    res.json({
      userId,
      preferences,
      stats,
      favoriteCategories
    });

  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: 'internal_server_error' });
  }
});

/**
 * PUT /api/user/preferences
 * Update user preferences
 */
router.put('/preferences', async (req, res) => {
  try {
    const { deviceId, preferences } = req.body;

    if (!deviceId || !preferences) {
      return res.status(400).json({ error: 'device_id_and_preferences_required' });
    }

    const userId = await ConversationHistoryService.getOrCreateUser(deviceId);
    await UserService.updatePreferences(userId, preferences);

    res.json({ success: true, preferences });

  } catch (error) {
    console.error('Update preferences error:', error);
    res.status(500).json({ error: 'internal_server_error' });
  }
});

/**
 * POST /api/user/save-activity
 * Save an activity for later
 */
router.post('/save-activity', async (req, res) => {
  try {
    const { deviceId, activityId, notes } = req.body;

    if (!deviceId || !activityId) {
      return res.status(400).json({ error: 'device_id_and_activity_id_required' });
    }

    const userId = await ConversationHistoryService.getOrCreateUser(deviceId);
    const savedActivity = await UserService.saveActivity(userId, activityId, notes);

    // Track interaction
    await UserService.trackInteraction(userId, activityId, 'liked');

    res.json({ success: true, savedActivity });

  } catch (error) {
    console.error('Save activity error:', error);
    res.status(500).json({ error: 'internal_server_error' });
  }
});

/**
 * GET /api/user/saved-activities
 * Get user's saved activities
 */
router.get('/saved-activities', async (req, res) => {
  try {
    const { deviceId, status } = req.query;

    if (!deviceId) {
      return res.status(400).json({ error: 'device_id_required' });
    }

    const userId = await ConversationHistoryService.getOrCreateUser(deviceId as string);
    const savedActivities = await UserService.getSavedActivities(
      userId,
      status as 'saved' | 'completed' | 'canceled' | undefined
    );

    res.json({ savedActivities });

  } catch (error) {
    console.error('Get saved activities error:', error);
    res.status(500).json({ error: 'internal_server_error' });
  }
});

/**
 * PUT /api/user/activity-status
 * Update saved activity status
 */
router.put('/activity-status', async (req, res) => {
  try {
    const { deviceId, activityId, status } = req.body;

    if (!deviceId || !activityId || !status) {
      return res.status(400).json({ error: 'device_id_activity_id_and_status_required' });
    }

    const userId = await ConversationHistoryService.getOrCreateUser(deviceId);
    await UserService.updateActivityStatus(userId, activityId, status);

    // Track completion
    if (status === 'completed') {
      await UserService.trackInteraction(userId, activityId, 'booked');
    }

    res.json({ success: true });

  } catch (error) {
    console.error('Update activity status error:', error);
    res.status(500).json({ error: 'internal_server_error' });
  }
});

/**
 * DELETE /api/user/saved-activity/:id
 * Remove a saved activity
 */
router.delete('/saved-activity/:id', async (req, res) => {
  try {
    const { deviceId } = req.query;
    const activityId = parseInt(req.params.id);

    if (!deviceId) {
      return res.status(400).json({ error: 'device_id_required' });
    }

    const userId = await ConversationHistoryService.getOrCreateUser(deviceId as string);
    await UserService.unsaveActivity(userId, activityId);

    res.json({ success: true });

  } catch (error) {
    console.error('Unsave activity error:', error);
    res.status(500).json({ error: 'internal_server_error' });
  }
});

/**
 * POST /api/user/track-interaction
 * Track user interaction with an activity
 */
router.post('/track-interaction', async (req, res) => {
  try {
    const { deviceId, activityId, interactionType, context } = req.body;

    if (!deviceId || !activityId || !interactionType) {
      return res.status(400).json({ error: 'device_id_activity_id_and_type_required' });
    }

    const userId = await ConversationHistoryService.getOrCreateUser(deviceId);
    await UserService.trackInteraction(userId, activityId, interactionType, context);

    res.json({ success: true });

  } catch (error) {
    console.error('Track interaction error:', error);
    res.status(500).json({ error: 'internal_server_error' });
  }
});

/**
 * GET /api/user/recommendations
 * Get personalized recommendations based on user history
 */
router.get('/recommendations', async (req, res) => {
  try {
    const { deviceId, limit = 10 } = req.query;

    if (!deviceId) {
      return res.status(400).json({ error: 'device_id_required' });
    }

    const userId = await ConversationHistoryService.getOrCreateUser(deviceId as string);
    const recommendations = await UserService.getPersonalizedRecommendations(
      userId,
      parseInt(limit as string)
    );

    res.json({ recommendations });

  } catch (error) {
    console.error('Get recommendations error:', error);
    res.status(500).json({ error: 'internal_server_error' });
  }
});

/**
 * PUT /api/user/location
 * Update user location
 */
router.put('/location', async (req, res) => {
  try {
    const { deviceId, lat, lng, city } = req.body;

    if (!deviceId || !lat || !lng) {
      return res.status(400).json({ error: 'device_id_lat_lng_required' });
    }

    const userId = await ConversationHistoryService.getOrCreateUser(deviceId);
    await UserService.updateLocation(userId, lat, lng, city);

    res.json({ success: true });

  } catch (error) {
    console.error('Update location error:', error);
    res.status(500).json({ error: 'internal_server_error' });
  }
});

export default router;
