/**
 * Activities API Routes
 * Endpoints for attractions and things to do
 */

import { Router, Request, Response } from 'express';
import { activitiesService } from '../services/activitiesService.js';
import { rapidApiConfig } from '../config/rapidapi.js';

const router = Router();

/**
 * GET /api/activities
 * List activities/attractions for a location
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    const {
      locationId = rapidApiConfig.defaultLocationId,
      limit = '10',
      sort = 'rating',
      categories
    } = req.query;

    // Parse and validate parameters
    const parsedLimit = Math.min(parseInt(limit as string) || 10, 50); // Max 50 results
    const parsedSort = ['rating', 'popularity', 'distance'].includes(sort as string) 
      ? (sort as 'rating' | 'popularity' | 'distance')
      : 'rating';
    
    const parsedCategories = categories 
      ? (categories as string).split(',').map(c => c.trim()).filter(Boolean)
      : undefined;

    console.log(`🎭 Activities API: Fetching activities for location ${locationId}`);

    const activities = await activitiesService.listActivities({
      locationId: locationId as string,
      limit: parsedLimit,
      sort: parsedSort,
      categories: parsedCategories
    });

    res.json({
      success: true,
      data: {
        activities,
        meta: {
          locationId,
          totalResults: activities.length,
          limit: parsedLimit,
          sort: parsedSort,
          categories: parsedCategories,
          timestamp: new Date().toISOString()
        }
      },
      message: `Found ${activities.length} activities`
    });

  } catch (error) {
    console.error('Activities list endpoint error:', error);
    
    res.status(500).json({
      success: false,
      data: {
        activities: [],
        meta: {
          totalResults: 0,
          timestamp: new Date().toISOString()
        }
      },
      message: 'Internal server error fetching activities',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * GET /api/activities/status
 * Get activities service status
 */
router.get('/status', async (req: Request, res: Response) => {
  try {
    const status = activitiesService.getStatus();

    res.json({
      success: true,
      data: {
        status,
        meta: {
          timestamp: new Date().toISOString()
        }
      },
      message: `Activities service is ${status.available ? 'available' : 'unavailable'}`
    });

  } catch (error) {
    console.error('Activities status endpoint error:', error);
    
    res.status(500).json({
      success: false,
      data: {
        status: {
          available: false,
          provider: 'Unknown',
          dataSource: 'Unknown',
          realAPI: false
        }
      },
      message: 'Error getting activities service status',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * GET /api/activities/:id
 * Get detailed information for a specific activity
 */
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        data: null,
        message: 'Activity ID is required'
      });
    }

    console.log(`🎭 Activities API: Fetching details for activity ${id}`);

    const activity = await activitiesService.getActivityDetails(id);

    if (!activity) {
      return res.status(404).json({
        success: false,
        data: null,
        message: `Activity with ID ${id} not found`
      });
    }

    res.json({
      success: true,
      data: {
        activity,
        meta: {
          activityId: id,
          timestamp: new Date().toISOString()
        }
      },
      message: `Activity details for ${activity.name}`
    });

  } catch (error) {
    console.error('Activity details endpoint error:', error);
    
    res.status(500).json({
      success: false,
      data: null,
      message: 'Internal server error fetching activity details',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * GET /api/activities/:id/photos
 * Get photos for a specific activity
 */
router.get('/:id/photos', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { limit = '10' } = req.query;

    if (!id) {
      return res.status(400).json({
        success: false,
        data: { photos: [] },
        message: 'Activity ID is required'
      });
    }

    const parsedLimit = Math.min(parseInt(limit as string) || 10, 20); // Max 20 photos

    console.log(`📸 Activities API: Fetching ${parsedLimit} photos for activity ${id}`);

    const photos = await activitiesService.getActivityPhotos(id, parsedLimit);

    res.json({
      success: true,
      data: {
        photos,
        meta: {
          activityId: id,
          totalPhotos: photos.length,
          limit: parsedLimit,
          timestamp: new Date().toISOString()
        }
      },
      message: `Found ${photos.length} photos`
    });

  } catch (error) {
    console.error('Activity photos endpoint error:', error);
    
    res.status(500).json({
      success: false,
      data: { photos: [] },
      message: 'Internal server error fetching activity photos',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * GET /api/activities/:id/reviews
 * Get reviews for a specific activity
 */
router.get('/:id/reviews', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { limit = '5', sort = 'helpful' } = req.query;

    if (!id) {
      return res.status(400).json({
        success: false,
        data: { reviews: [] },
        message: 'Activity ID is required'
      });
    }

    const parsedLimit = Math.min(parseInt(limit as string) || 5, 20); // Max 20 reviews
    const parsedSort = ['recent', 'helpful', 'rating'].includes(sort as string)
      ? (sort as 'recent' | 'helpful' | 'rating')
      : 'helpful';

    console.log(`💬 Activities API: Fetching ${parsedLimit} reviews for activity ${id}`);

    const reviews = await activitiesService.getActivityReviews(id, {
      limit: parsedLimit,
      sort: parsedSort
    });

    res.json({
      success: true,
      data: {
        reviews,
        meta: {
          activityId: id,
          totalReviews: reviews.length,
          limit: parsedLimit,
          sort: parsedSort,
          timestamp: new Date().toISOString()
        }
      },
      message: `Found ${reviews.length} reviews`
    });

  } catch (error) {
    console.error('Activity reviews endpoint error:', error);
    
    res.status(500).json({
      success: false,
      data: { reviews: [] },
      message: 'Internal server error fetching activity reviews',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;
