/**
 * Activity Completion Routes
 * API endpoints for tracking activity completions
 */

import { Router, Request, Response } from 'express';
import { ActivityCompletionService } from '../services/activityCompletion/activityCompletionService';

const router = Router();

/**
 * GET /api/activity-completion/promptable
 * Get the activity that should be prompted about (if any)
 */
router.get('/promptable', async (req: Request, res: Response) => {
  try {
    const { userId } = req.query;

    if (!userId || typeof userId !== 'string') {
      return res.status(400).json({ error: 'userId is required' });
    }

    const activity = await ActivityCompletionService.getPromptableActivity(userId);
    
    if (!activity) {
      return res.status(404).json({ message: 'No pending activities' });
    }

    res.json(activity);
  } catch (error) {
    console.error('Error getting promptable activity:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * POST /api/activity-completion/log
 * Log when user presses GO NOW or Learn More
 */
router.post('/log', async (req: Request, res: Response) => {
  try {
    const { userId, activityId, actionType, venueId } = req.body;

    if (!userId || !activityId || !actionType) {
      return res.status(400).json({ 
        error: 'userId, activityId, and actionType are required' 
      });
    }

    if (!['go_now', 'learn_more'].includes(actionType)) {
      return res.status(400).json({ 
        error: 'actionType must be "go_now" or "learn_more"' 
      });
    }

    const instanceId = await ActivityCompletionService.logActivity(
      userId,
      activityId,
      actionType,
      venueId
    );

    res.json({ instanceId, message: 'Activity logged successfully' });
  } catch (error) {
    console.error('Error logging activity:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * POST /api/activity-completion/complete
 * User confirms they completed the activity
 */
router.post('/complete', async (req: Request, res: Response) => {
  try {
    const { instanceId, rating, photoUrl, review } = req.body;

    if (!instanceId || rating === undefined) {
      return res.status(400).json({ 
        error: 'instanceId and rating are required' 
      });
    }

    if (rating < 0 || rating > 10) {
      return res.status(400).json({ 
        error: 'rating must be between 0 and 10' 
      });
    }

    await ActivityCompletionService.confirmCompletion(
      instanceId,
      rating,
      photoUrl,
      review
    );

    res.json({ message: 'Activity completed successfully' });
  } catch (error) {
    console.error('Error completing activity:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * POST /api/activity-completion/ongoing
 * User marks activity as still ongoing (resets timer)
 */
router.post('/ongoing', async (req: Request, res: Response) => {
  try {
    const { instanceId } = req.body;

    if (!instanceId) {
      return res.status(400).json({ error: 'instanceId is required' });
    }

    await ActivityCompletionService.markOngoing(instanceId);

    res.json({ message: 'Activity marked as ongoing' });
  } catch (error) {
    console.error('Error marking activity as ongoing:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * POST /api/activity-completion/skip
 * User skips activity (didn't complete it)
 */
router.post('/skip', async (req: Request, res: Response) => {
  try {
    const { instanceId } = req.body;

    if (!instanceId) {
      return res.status(400).json({ error: 'instanceId is required' });
    }

    await ActivityCompletionService.skipActivity(instanceId);

    res.json({ message: 'Activity skipped' });
  } catch (error) {
    console.error('Error skipping activity:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * GET /api/activity-completion/history
 * Get user's completed activities
 */
router.get('/history', async (req: Request, res: Response) => {
  try {
    const { userId, limit, offset } = req.query;

    if (!userId || typeof userId !== 'string') {
      return res.status(400).json({ error: 'userId is required' });
    }

    const activities = await ActivityCompletionService.getCompletedActivities(
      userId,
      limit ? parseInt(limit as string) : 50,
      offset ? parseInt(offset as string) : 0
    );

    res.json(activities);
  } catch (error) {
    console.error('Error getting activity history:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * GET /api/activity-completion/stats
 * Get user's activity statistics
 */
router.get('/stats', async (req: Request, res: Response) => {
  try {
    const { userId } = req.query;

    if (!userId || typeof userId !== 'string') {
      return res.status(400).json({ error: 'userId is required' });
    }

    const stats = await ActivityCompletionService.getUserStats(userId);

    res.json(stats);
  } catch (error) {
    console.error('Error getting user stats:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * GET /api/activity-completion/pending-count
 * Get count of pending activities
 */
router.get('/pending-count', async (req: Request, res: Response) => {
  try {
    const { userId } = req.query;

    if (!userId || typeof userId !== 'string') {
      return res.status(400).json({ error: 'userId is required' });
    }

    const count = await ActivityCompletionService.getPendingCount(userId);

    res.json({ count });
  } catch (error) {
    console.error('Error getting pending count:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
