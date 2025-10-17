/**
 * Personalization API Routes
 * Onboarding, feedback, and user profile management
 */

import { Router, Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import { PersonalizationService } from '../services/personalization/personalizationService.js';
import { INTEREST_TAXONOMY, FEEDBACK_TAGS } from '../types/personalization.js';

const router = Router();
const personalizationService = new PersonalizationService();

/**
 * GET /api/personalization/interests
 * Get available interests for onboarding
 */
router.get('/interests', (req: Request, res: Response) => {
  res.json({
    success: true,
    data: {
      taxonomy: INTEREST_TAXONOMY,
      feedbackTags: FEEDBACK_TAGS
    }
  });
});

/**
 * POST /api/personalization/onboarding
 * Complete user onboarding with interests and preferences
 */
router.post('/onboarding', [
  body('userId').isString().isLength({ min: 1 }).withMessage('User ID required'),
  body('interests').isArray({ min: 3 }).withMessage('Please select at least 3 interests to build your taste profile'),
  body('interests.*').isString().withMessage('Invalid interest format'),
  body('travelWillingness').isInt({ min: 1, max: 500 }).withMessage('Travel willingness must be 1-500km'),
  body('riskTolerance').isIn(['chill', 'medium', 'high']).withMessage('Invalid risk tolerance'),
  body('dataConsent').isBoolean().withMessage('Data consent required'),
  body('feedbackOptIn').isBoolean().withMessage('Feedback opt-in required'),
  body('homeCity').optional().isString().withMessage('Invalid home city'),
  body('homeLocation.lat').optional().isFloat({ min: -90, max: 90 }).withMessage('Invalid latitude'),
  body('homeLocation.lng').optional().isFloat({ min: -180, max: 180 }).withMessage('Invalid longitude')
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

    const { userId, interests, travelWillingness, riskTolerance, dataConsent, feedbackOptIn, homeCity, homeLocation } = req.body;

    console.log('👤 Processing onboarding for user:', userId);

    // Validate interests against taxonomy
    const allInterestIds = Object.values(INTEREST_TAXONOMY)
      .flatMap(category => category.interests.map(interest => interest.id));
    
    const invalidInterests = interests.filter((id: string) => !allInterestIds.includes(id));
    if (invalidInterests.length > 0) {
      res.status(400).json({
        success: false,
        error: 'Invalid interests',
        details: { invalidInterests }
      });
      return;
    }

    const profile = await personalizationService.createUserProfile(userId, {
      interests,
      homeCity,
      homeLocation,
      travelWillingness,
      riskTolerance,
      dataConsent,
      feedbackOptIn
    });

    res.json({
      success: true,
      data: {
        profile: {
          id: profile.id,
          interests: profile.interests,
          riskTolerance: profile.riskTolerance,
          travelWillingness: profile.travelWillingnessKm,
          homeCity: profile.homeCity
        },
        message: 'Onboarding completed successfully'
      }
    });

  } catch (error) {
    console.error('👤 Onboarding error:', error);
    res.status(500).json({
      success: false,
      error: 'Onboarding failed',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * POST /api/personalization/feedback
 * Record user feedback on recommendations
 */
router.post('/feedback', [
  body('userId').isString().isLength({ min: 1 }).withMessage('User ID required'),
  body('itemId').isString().isLength({ min: 1 }).withMessage('Item ID required'),
  body('itemName').isString().isLength({ min: 1 }).withMessage('Item name required'),
  body('bucket').isString().isLength({ min: 1 }).withMessage('Bucket required'),
  body('outcome').isIn(['view', 'open_maps', 'like', 'dislike']).withMessage('Invalid outcome'),
  body('tags').optional().isArray().withMessage('Tags must be array'),
  body('tags.*').optional().isString().withMessage('Invalid tag format'),
  body('searchVibe').optional().isString().withMessage('Invalid search vibe'),
  body('userLocation.lat').optional().isFloat({ min: -90, max: 90 }).withMessage('Invalid latitude'),
  body('userLocation.lng').optional().isFloat({ min: -180, max: 180 }).withMessage('Invalid longitude'),
  body('weatherConditions').optional().isString().withMessage('Invalid weather conditions'),
  body('timeOfDay').optional().isIn(['morning', 'afternoon', 'evening', 'night']).withMessage('Invalid time of day')
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

    const { userId, itemId, itemName, bucket, outcome, tags, searchVibe, userLocation, weatherConditions, timeOfDay } = req.body;

    console.log('📊 Recording feedback:', { userId, outcome, bucket, tags });

    await personalizationService.recordInteraction({
      userId,
      itemId,
      itemName,
      bucket,
      outcome,
      tags,
      searchVibe,
      userLocation,
      weatherConditions,
      timeOfDay
    });

    res.json({
      success: true,
      message: 'Feedback recorded successfully'
    });

  } catch (error) {
    console.error('📊 Feedback error:', error);
    res.status(500).json({
      success: false,
      error: 'Feedback recording failed',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * GET /api/personalization/profile/:userId
 * Get user profile and preferences
 */
router.get('/profile/:userId', async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId } = req.params;
    
    const profile = await personalizationService.getUserProfile(userId);
    
    if (!profile) {
      res.status(404).json({
        success: false,
        error: 'User profile not found'
      });
      return;
    }

    res.json({
      success: true,
      data: {
        profile: {
          id: profile.id,
          interests: profile.interests,
          riskTolerance: profile.riskTolerance,
          travelWillingness: profile.travelWillingnessKm,
          homeCity: profile.homeCity,
          createdAt: profile.createdAt,
          updatedAt: profile.updatedAt
        }
      }
    });

  } catch (error) {
    console.error('👤 Profile fetch error:', error);
    res.status(500).json({
      success: false,
      error: 'Profile fetch failed',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * PUT /api/personalization/profile/:userId
 * Update user profile and preferences
 */
router.put('/profile/:userId', [
  body('interests').optional().isArray().withMessage('Interests must be array'),
  body('interests.*').optional().isString().withMessage('Invalid interest format'),
  body('travelWillingness').optional().isInt({ min: 1, max: 500 }).withMessage('Travel willingness must be 1-500km'),
  body('riskTolerance').optional().isIn(['chill', 'medium', 'high']).withMessage('Invalid risk tolerance'),
  body('homeCity').optional().isString().withMessage('Invalid home city'),
  body('homeLocation.lat').optional().isFloat({ min: -90, max: 90 }).withMessage('Invalid latitude'),
  body('homeLocation.lng').optional().isFloat({ min: -180, max: 180 }).withMessage('Invalid longitude')
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

    const { userId } = req.params;
    const updates = req.body;

    // Map homeLocation to profile fields
    if (updates.homeLocation) {
      updates.homeLat = updates.homeLocation.lat;
      updates.homeLng = updates.homeLocation.lng;
      delete updates.homeLocation;
    }

    if (updates.travelWillingness) {
      updates.travelWillingnessKm = updates.travelWillingness;
      delete updates.travelWillingness;
    }

    const updatedProfile = await personalizationService.updateUserProfile(userId, updates);
    
    if (!updatedProfile) {
      res.status(404).json({
        success: false,
        error: 'User profile not found'
      });
      return;
    }

    res.json({
      success: true,
      data: {
        profile: {
          id: updatedProfile.id,
          interests: updatedProfile.interests,
          riskTolerance: updatedProfile.riskTolerance,
          travelWillingness: updatedProfile.travelWillingnessKm,
          homeCity: updatedProfile.homeCity,
          updatedAt: updatedProfile.updatedAt
        }
      }
    });

  } catch (error) {
    console.error('👤 Profile update error:', error);
    res.status(500).json({
      success: false,
      error: 'Profile update failed',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * GET /api/personalization/stats/:userId
 * Get user personalization statistics (for debugging)
 */
router.get('/stats/:userId', async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId } = req.params;
    
    const stats = await personalizationService.getUserStats(userId);
    
    res.json({
      success: true,
      data: stats
    });

  } catch (error) {
    console.error('📊 Stats error:', error);
    res.status(500).json({
      success: false,
      error: 'Stats fetch failed',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * DELETE /api/personalization/profile/:userId
 * Delete user profile and all associated data (GDPR compliance)
 */
router.delete('/profile/:userId', async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId } = req.params;
    
    await personalizationService.deleteUserData(userId);
    
    res.json({
      success: true,
      message: 'User data deleted successfully'
    });

  } catch (error) {
    console.error('🗑️ Data deletion error:', error);
    res.status(500).json({
      success: false,
      error: 'Data deletion failed',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;
