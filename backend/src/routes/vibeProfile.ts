/**
 * Vibe Profile API Routes
 * Core personality onboarding + ML learning endpoints
 */

import { Router, Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import { VibeProfileService } from '../services/vibeProfile/vibeProfileService.js';
import { PERSONALITY_DIMENSIONS } from '../types/vibeProfile.js';

const router = Router();
const vibeProfileService = new VibeProfileService();

/**
 * GET /api/vibe-profile/onboarding-config
 * Get onboarding configuration for animated tiles
 */
router.get('/onboarding-config', (req: Request, res: Response) => {
  res.json({
    success: true,
    data: {
      dimensions: PERSONALITY_DIMENSIONS,
      flow: [
        { step: 1, dimension: 'interests', required: true },
        { step: 2, dimension: 'energyLevel', required: true },
        { step: 3, dimension: 'indoorOutdoor', required: true },
        { step: 4, dimension: 'socialStyle', required: true },
        { step: 5, dimension: 'opennessScore', required: true }
      ],
      totalSteps: 5
    }
  });
});

/**
 * POST /api/vibe-profile/onboarding
 * Complete onboarding and create vibe profile
 */
router.post('/onboarding', [
  body('userId').isString().isLength({ min: 1 }).withMessage('User ID required'),
  body('interests').isArray({ min: 3, max: 7 }).withMessage('Select 3-7 interests to build your taste profile'),
  body('interests.*').isString().withMessage('Invalid interest format'),
  body('energyLevel').isIn(['chill', 'medium', 'high']).withMessage('Invalid energy level'),
  body('indoorOutdoor').isIn(['indoor', 'outdoor', 'either']).withMessage('Invalid indoor/outdoor preference'),
  body('socialStyle').isIn(['solo', 'group', 'either']).withMessage('Invalid social style'),
  body('opennessScore').isInt({ min: 1, max: 5 }).withMessage('Openness score must be 1-5')
], async (req: Request, res: Response): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors.array()
      });
      return;
    }

    const { userId, interests, energyLevel, indoorOutdoor, socialStyle, opennessScore } = req.body;

    console.log('🧠 Processing vibe profile onboarding for user:', userId);

    // Validate interests against available options
    const availableInterests = PERSONALITY_DIMENSIONS.interests.tiles.map(tile => tile.id);
    const invalidInterests = interests.filter((id: string) => !availableInterests.includes(id));
    
    if (invalidInterests.length > 0) {
      res.status(400).json({
        success: false,
        error: 'Invalid interests selected',
        details: { invalidInterests }
      });
      return;
    }

    // Complete onboarding
    const { coreProfile, mlProfile } = await vibeProfileService.completeOnboarding({
      userId,
      interests,
      energyLevel,
      indoorOutdoor,
      socialStyle,
      opennessScore
    });

    res.json({
      success: true,
      data: {
        message: 'Vibe profile created successfully',
        profile: {
          userId: coreProfile.userId,
          interests: coreProfile.interests,
          energyLevel: coreProfile.energyLevel,
          indoorOutdoor: coreProfile.indoorOutdoor,
          socialStyle: coreProfile.socialStyle,
          opennessScore: coreProfile.opennessScore,
          onboardingComplete: coreProfile.onboardingComplete
        },
        mlProfile: {
          interestWeights: mlProfile.interestWeights,
          explorationBias: mlProfile.explorationBias,
          confidenceScore: mlProfile.confidenceScore
        }
      }
    });

  } catch (error) {
    console.error('🧠 Onboarding error:', error);
    res.status(500).json({
      success: false,
      error: 'Onboarding failed',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * POST /api/vibe-profile/track-event
 * Track user behavior event for ML learning
 */
router.post('/track-event', [
  body('userId').isString().isLength({ min: 1 }).withMessage('User ID required'),
  body('eventType').isIn(['activity_view', 'feedback', 'challenge_accept', 'map_open', 'search', 'dismiss']).withMessage('Invalid event type'),
  body('data').isObject().withMessage('Event data required'),
  body('context').optional().isObject().withMessage('Invalid context format')
], async (req: Request, res: Response): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors.array()
      });
      return;
    }

    const { userId, eventType, data, context = {} } = req.body;

    await vibeProfileService.trackEvent({
      userId,
      eventType,
      data,
      context
    });

    res.json({
      success: true,
      message: 'Event tracked successfully'
    });

  } catch (error) {
    console.error('📊 Event tracking error:', error);
    res.status(500).json({
      success: false,
      error: 'Event tracking failed',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * GET /api/vibe-profile/:userId
 * Get user's complete vibe profile
 */
router.get('/:userId', async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId } = req.params;
    
    const { coreProfile, mlProfile } = await vibeProfileService.getVibeProfile(userId);
    
    if (!coreProfile) {
      res.status(404).json({
        success: false,
        error: 'Vibe profile not found',
        message: 'User has not completed onboarding'
      });
      return;
    }

    res.json({
      success: true,
      data: {
        coreProfile: {
          userId: coreProfile.userId,
          interests: coreProfile.interests,
          energyLevel: coreProfile.energyLevel,
          indoorOutdoor: coreProfile.indoorOutdoor,
          socialStyle: coreProfile.socialStyle,
          opennessScore: coreProfile.opennessScore,
          onboardingComplete: coreProfile.onboardingComplete,
          createdAt: coreProfile.createdAt,
          lastUpdated: coreProfile.lastUpdated
        },
        mlProfile: mlProfile ? {
          interestWeights: mlProfile.interestWeights,
          explorationBias: mlProfile.explorationBias,
          confidenceScore: mlProfile.confidenceScore,
          totalInteractions: mlProfile.totalInteractions,
          profileVersion: mlProfile.profileVersion,
          lastModelUpdate: mlProfile.lastModelUpdate
        } : null
      }
    });

  } catch (error) {
    console.error('🧠 Profile fetch error:', error);
    res.status(500).json({
      success: false,
      error: 'Profile fetch failed',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * GET /api/vibe-profile/:userId/ai-context
 * Get AI context for Claude integration
 */
router.get('/:userId/ai-context', async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId } = req.params;
    const { timeOfDay, weatherConditions, location } = req.query;
    
    const sessionContext = {
      timeOfDay: timeOfDay as string,
      weatherConditions: weatherConditions as string,
      location: location ? JSON.parse(location as string) : null,
      searchHistory: [] // Could be populated from session
    };
    
    const aiContext = await vibeProfileService.getAIContext(userId, sessionContext);
    
    if (!aiContext) {
      res.status(404).json({
        success: false,
        error: 'Profile not found',
        message: 'User has not completed onboarding'
      });
      return;
    }

    res.json({
      success: true,
      data: {
        aiContext,
        sessionContext
      }
    });

  } catch (error) {
    console.error('🤖 AI context error:', error);
    res.status(500).json({
      success: false,
      error: 'AI context generation failed',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * GET /api/vibe-profile/:userId/weights
 * Get personalized ML weights for recommendations
 */
router.get('/:userId/weights', async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId } = req.params;
    
    const weights = await vibeProfileService.getPersonalizedWeights(userId);
    
    if (!weights) {
      res.status(404).json({
        success: false,
        error: 'Weights not found',
        message: 'User has not completed onboarding'
      });
      return;
    }

    // Sort weights by value for easier consumption
    const sortedWeights = Object.entries(weights)
      .sort(([,a], [,b]) => b - a)
      .reduce((obj, [key, value]) => {
        obj[key] = Math.round(value * 100) / 100; // Round to 2 decimal places
        return obj;
      }, {} as Record<string, number>);

    res.json({
      success: true,
      data: {
        weights: sortedWeights,
        topInterests: Object.entries(sortedWeights)
          .slice(0, 3)
          .map(([interest, weight]) => ({ interest, weight }))
      }
    });

  } catch (error) {
    console.error('⚖️ Weights fetch error:', error);
    res.status(500).json({
      success: false,
      error: 'Weights fetch failed',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * GET /api/vibe-profile/:userId/analytics
 * Get user analytics and insights
 */
router.get('/:userId/analytics', async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId } = req.params;
    
    const analytics = await vibeProfileService.getUserAnalytics(userId);
    
    if (!analytics) {
      res.status(404).json({
        success: false,
        error: 'Analytics not available',
        message: 'User has not completed onboarding'
      });
      return;
    }

    res.json({
      success: true,
      data: analytics
    });

  } catch (error) {
    console.error('📊 Analytics error:', error);
    res.status(500).json({
      success: false,
      error: 'Analytics fetch failed',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * GET /api/vibe-profile/:userId/export
 * Export user data (GDPR compliance)
 */
router.get('/:userId/export', async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId } = req.params;
    
    const userData = await vibeProfileService.exportUserData(userId);
    
    res.json({
      success: true,
      data: userData,
      exportedAt: new Date().toISOString(),
      dataTypes: ['coreProfile', 'mlProfile', 'events']
    });

  } catch (error) {
    console.error('📤 Export error:', error);
    res.status(500).json({
      success: false,
      error: 'Data export failed',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * DELETE /api/vibe-profile/:userId
 * Delete all user data (GDPR compliance)
 */
router.delete('/:userId', async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId } = req.params;
    
    await vibeProfileService.deleteUserData(userId);
    
    res.json({
      success: true,
      message: 'All vibe profile data deleted successfully',
      deletedAt: new Date().toISOString()
    });

  } catch (error) {
    console.error('🗑️ Deletion error:', error);
    res.status(500).json({
      success: false,
      error: 'Data deletion failed',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * GET /api/vibe-profile/admin/analytics
 * Get system-wide analytics (admin only)
 */
router.get('/admin/analytics', async (req: Request, res: Response): Promise<void> => {
  try {
    // TODO: Add admin authentication middleware
    
    const systemAnalytics = await vibeProfileService.getSystemAnalytics();
    
    res.json({
      success: true,
      data: systemAnalytics,
      generatedAt: new Date().toISOString()
    });

  } catch (error) {
    console.error('📊 System analytics error:', error);
    res.status(500).json({
      success: false,
      error: 'System analytics failed',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;
