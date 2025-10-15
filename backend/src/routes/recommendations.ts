import { Router, Request, Response } from 'express';
import { RecommendationService } from '../services/recommendationService';
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

export default router;
