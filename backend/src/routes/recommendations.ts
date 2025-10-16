import { Router, Request, Response } from 'express';
import { RecommendationService } from '../services/recommendationService';
import { ActivityCategory, PriceLevel } from '../types';
import { activitiesService } from '../services/activitiesService.js';
import { withBucharestActivities, enforceBucharestOnly } from '../utils/queryHelpers.js';
import { features, getDefaultDataSource } from '../config/features.js';
import { validateRequest, recommendationRequestSchema } from '../middleware/validation';
import { externalApiRateLimit } from '../middleware/security';

const router = Router();
const recommendationService = new RecommendationService();

// Get activity recommendations based on user's vibe
router.post('/recommendations',
  externalApiRateLimit, // 60 requests/minute rate limit for external API calls
  validateRequest(recommendationRequestSchema, 'body'),
  async (req: Request, res: Response) => {
    try {
      const request = req.validatedData;
      
      // Get recommendations
      const result = await recommendationService.getRecommendations(request);
      
      // Log successful request (no PII)
      console.log(`Recommendations generated: ${result.activities.length} activities for mood: ${result.moodAnalysis.primaryMood}`);
      
      res.json({
        success: true,
        data: {
          activities: result.activities,
          moodAnalysis: {
            primaryMood: result.moodAnalysis.primaryMood,
            secondaryMoods: result.moodAnalysis.secondaryMoods,
            confidence: result.moodAnalysis.confidence,
            suggestedCategories: result.moodAnalysis.suggestedCategories
          },
          meta: {
            totalResults: result.totalResults,
            timestamp: new Date().toISOString()
          }
        }
      });
    } catch (error) {
      console.error('Recommendations endpoint error:', error);
      
      res.status(500).json({
        error: 'internal_server_error',
        message: 'Failed to generate recommendations'
      });
    }
  }
);

// Parse mood from vibe text (standalone endpoint for testing)
router.post('/parse-mood',
  validateRequest(recommendationRequestSchema.pick({ vibe: true }), 'body'),
  async (req: Request, res: Response) => {
    try {
      const { vibe } = req.validatedData;
      
      const moodParser = new (await import('../services/moodParser')).MoodParser();
      const moodAnalysis = moodParser.parseMood(vibe);
      
      res.json({
        success: true,
        data: moodAnalysis
      });
    } catch (error) {
      console.error('Mood parsing error:', error);
      
      res.status(500).json({
        error: 'internal_server_error',
        message: 'Failed to parse mood'
      });
    }
  }
);

// Get activities recommendations (attractions/things to do)
router.post('/activities',
  externalApiRateLimit,
  validateRequest(recommendationRequestSchema, 'body'),
  async (req: Request, res: Response) => {
    try {
      const {
        vibe,
        city,
        categories,
        priceLevel,
        location,
        maxDistance
      } = req.body;

      console.log(`🎭 Activities request: "${vibe}" in ${city || 'default location'}`);

      // Use query helper to ensure Bucharest location
      const queryOptions = withBucharestActivities({
        categories: categories?.length > 0 ? categories : undefined,
        limit: 12
      });

      // Get activities from the activities service
      const activitySummaries = await activitiesService.listActivities(queryOptions);
      
      // Convert to the expected format
      const activities = activitySummaries.map(summary => ({
        id: summary.id,
        name: summary.name,
        description: '', // Will be filled from details if needed
        category: summary.category,
        location: {
          address: '',
          city: 'Bucharest',
          coordinates: summary.coordinates || { lat: 0, lng: 0 }
        },
        rating: summary.rating,
        priceLevel: summary.priceTier,
        imageUrl: summary.primaryPhoto,
        website: '',
        phone: '',
        tags: summary.tags,
        distance: summary.distance,
        moodRelevance: 0
      }));

      // Simple mood analysis for activities
      const moodAnalysis = {
        primaryMood: 'curious',
        secondaryMoods: [],
        confidence: 0.8,
        suggestedCategories: categories || ['cultural', 'outdoor'],
        suggestedTags: []
      };

      res.json({
        success: true,
        data: {
          activities,
          moodAnalysis,
          dataSource: 'activities',
          meta: {
            totalResults: activities.length,
            timestamp: new Date().toISOString(),
            location: city || 'Bucharest, Romania'
          }
        }
      });

      console.log(`✅ Activities recommendations generated: ${activities.length} activities`);

    } catch (error) {
      console.error('Activities recommendations error:', error);
      
      res.status(500).json({
        success: false,
        data: {
          activities: [],
          moodAnalysis: {
            primaryMood: 'curious',
            secondaryMoods: [],
            confidence: 0,
            suggestedCategories: [],
            suggestedTags: []
          },
          dataSource: 'activities',
          meta: {
            totalResults: 0,
            timestamp: new Date().toISOString()
          }
        },
        message: 'Internal server error generating activities recommendations',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
);

// Get restaurants recommendations
router.post('/restaurants',
  externalApiRateLimit,
  validateRequest(recommendationRequestSchema, 'body'),
  async (req: Request, res: Response) => {
    try {
      const {
        vibe,
        city,
        categories,
        priceLevel,
        location,
        maxDistance
      } = req.body;

      console.log(`🍽️ Restaurant request: "${vibe}" in ${city || 'default location'}`);

      // Use existing recommendation service for restaurants
      const result = await recommendationService.getRecommendations({
        vibe,
        city: city || 'Bucharest, Romania', // Enforce Bucharest default
        categories,
        priceLevel,
        location,
        maxDistance
      });

      res.json({
        success: true,
        data: {
          activities: result.activities,
          moodAnalysis: result.moodAnalysis,
          dataSource: 'restaurants',
          meta: {
            totalResults: result.totalResults,
            timestamp: new Date().toISOString(),
            location: city || 'Bucharest, Romania'
          }
        }
      });

      console.log(`✅ Restaurant recommendations generated: ${result.totalResults} restaurants`);

    } catch (error) {
      console.error('Restaurant recommendations error:', error);
      
      res.status(500).json({
        success: false,
        data: {
          activities: [],
          moodAnalysis: {
            primaryMood: 'curious',
            secondaryMoods: [],
            confidence: 0,
            suggestedCategories: [],
            suggestedTags: []
          },
          dataSource: 'restaurants',
          meta: {
            totalResults: 0,
            timestamp: new Date().toISOString()
          }
        },
        message: 'Internal server error generating restaurant recommendations',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
);

export default router;
