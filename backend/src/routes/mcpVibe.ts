/**
 * MCP-Based Vibe Recommendations API
 * 
 * Uses Claude Haiku with PostgreSQL MCP access for curated activity recommendations
 */

import express, { Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import { getMCPRecommendations } from '../services/llm/mcpClaudeRecommender.js';
import { searchActivities, getVenuesForActivity, getDatabaseStats } from '../services/database/mcpDatabase.js';

const router = express.Router();

/**
 * POST /api/mcp-vibe/quick-match
 * Get activity recommendations using MCP database and Claude
 */
router.post('/quick-match', [
  body('vibe').isString().notEmpty().withMessage('Vibe description is required'),
  body('region').optional().isString(),
  body('city').optional().isString(),
  body('durationHours').optional().isFloat({ min: 0.5, max: 24 }),
  body('indoorOutdoor').optional().isIn(['indoor', 'outdoor', 'both']),
  body('energyLevel').optional().isIn(['low', 'medium', 'high']),
], async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Invalid request',
        details: errors.array()
      });
    }

    const { vibe, region, city, durationHours, indoorOutdoor, energyLevel } = req.body;

    console.log('🎭 MCP Vibe Match Request:', { vibe, region, city });

    // Get recommendations from Claude with MCP database access
    const recommendations = await getMCPRecommendations({
      vibe,
      region: region || 'București',
      city,
      durationHours,
      indoorOutdoor,
      energyLevel,
      currentSeason: getCurrentSeason()
    });

    return res.json({
      success: true,
      data: {
        ideas: recommendations.ideas,
        source: 'mcp-curated-database',
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('❌ MCP vibe match error:', error);
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get recommendations'
    });
  }
});

/**
 * GET /api/mcp-vibe/activities
 * Search activities directly from database
 */
router.get('/activities', async (req: Request, res: Response) => {
  try {
    const {
      category,
      region,
      city,
      indoorOutdoor,
      energyLevel,
      limit
    } = req.query;

    const activities = await searchActivities({
      category: category as string,
      region: region as string,
      city: city as string,
      indoorOutdoor: indoorOutdoor as any,
      energyLevel: energyLevel as any,
      limit: limit ? parseInt(limit as string) : 10
    });

    return res.json({
      success: true,
      data: {
        activities,
        count: activities.length
      }
    });

  } catch (error) {
    console.error('❌ Activities search error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to search activities'
    });
  }
});

/**
 * GET /api/mcp-vibe/activities/:id/venues
 * Get venues for a specific activity
 */
router.get('/activities/:id/venues', async (req: Request, res: Response) => {
  try {
    const activityId = parseInt(req.params.id);
    const { city, region, priceTier, minRating } = req.query;

    if (isNaN(activityId)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid activity ID'
      });
    }

    const venues = await getVenuesForActivity(activityId, {
      city: city as string,
      region: region as string,
      priceTier: priceTier as string,
      minRating: minRating ? parseFloat(minRating as string) : undefined
    });

    return res.json({
      success: true,
      data: {
        venues,
        count: venues.length
      }
    });

  } catch (error) {
    console.error('❌ Venues fetch error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch venues'
    });
  }
});

/**
 * GET /api/mcp-vibe/stats
 * Get database statistics
 */
router.get('/stats', async (req: Request, res: Response) => {
  try {
    const stats = await getDatabaseStats();

    return res.json({
      success: true,
      data: stats
    });

  } catch (error) {
    console.error('❌ Stats error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to get statistics'
    });
  }
});

/**
 * Helper: Get current season
 */
function getCurrentSeason(): string {
  const month = new Date().getMonth() + 1;
  if (month >= 3 && month <= 5) return 'spring';
  if (month >= 6 && month <= 8) return 'summer';
  if (month >= 9 && month <= 11) return 'fall';
  return 'winter';
}

export default router;
