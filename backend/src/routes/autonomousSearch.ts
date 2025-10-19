/**
 * Autonomous Search Routes
 * 
 * Uses Claude's autonomous agent for intelligent vibe-to-activity mapping
 * with self-reasoning, memory, and continuous adaptation.
 */

import { Router, Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import { getClaudeAgent } from '../services/claude/agent.js';
import { updateMemoryFeedback, getMemoryStats } from '../services/claude/memory.js';

const router = Router();

/**
 * Autonomous activities search using Claude agent
 */
router.post('/search', [
  body('vibe').isString().isLength({ min: 3, max: 200 }),
  body('location.lat').isFloat({ min: 43, max: 48 }),
  body('location.lng').isFloat({ min: 20, max: 30 }),
  body('filters.durationHours').optional().isInt({ min: 1, max: 24 }),
  body('filters.radiusKm').optional().isInt({ min: 1, max: 250 }),
  body('filters.willingToTravel').optional().isBoolean(),
  body('userId').optional().isString()
], async (req: Request, res: Response) => {
  try {
    // Validate request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Invalid request parameters',
        details: errors.array()
      });
    }

    const { vibe, location, filters = {}, userId } = req.body;
    
    console.log('🤖 Autonomous search request:', {
      vibe: `"${vibe}"`,
      location,
      filters,
      userId: userId ? `${userId.substring(0, 8)}...` : 'anonymous'
    });

    // Use Claude agent for autonomous reasoning
    const startTime = Date.now();
    const claudeAgent = getClaudeAgent();
    const result = await claudeAgent.orchestrate({
      vibe,
      location,
      filters,
      userId
    });
    const processingTime = Date.now() - startTime;

    console.log('✅ Autonomous search complete:', {
      activities: result.activities.length,
      confidence: result.confidence.toFixed(2),
      memoryUsed: result.memoryUsed,
      processingTime: `${processingTime}ms`
    });

    // Return structured response
    res.json({
      success: true,
      data: {
        // Core results
        topFive: result.activities.slice(0, 5),
        places: result.activities,
        
        // Autonomous intelligence metadata
        autonomous: {
          reasoning: result.reasoning,
          confidence: result.confidence,
          memoryUsed: result.memoryUsed,
          reflections: result.reflections,
          adaptations: result.adaptations,
          processingTime
        },
        
        // Search metadata
        vibe,
        location,
        filters,
        
        // Statistics
        searchStats: {
          totalFound: result.activities.length,
          searchCenters: [{ name: 'Autonomous Agent', lat: location.lat, lng: location.lng, resultsCount: result.activities.length }],
          autonomousIntelligence: {
            confidenceScore: result.confidence,
            memoryRecallUsed: result.memoryUsed,
            reflectionsGenerated: result.reflections.length,
            adaptationsProposed: result.adaptations.length
          }
        },
        
        // Processing metadata
        processingTime,
        
        // Agent metadata
        orchestration: {
          agent: 'Claude 3 Haiku Autonomous',
          pipeline: 'Think→Verify→Reflect',
          memoryEnabled: true,
          selfDebugging: true,
          continuousLearning: true
        }
      }
    });

  } catch (error) {
    console.error('❌ Autonomous search failed:', error);
    
    res.status(500).json({
      success: false,
      error: 'Autonomous search failed',
      details: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
});

/**
 * Provide feedback on autonomous search results
 */
router.post('/feedback', [
  body('vibe').isString().isLength({ min: 3, max: 200 }),
  body('feedback').isIn(['helpful', 'not_helpful', 'mixed']),
  body('userId').optional().isString()
], async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Invalid feedback parameters',
        details: errors.array()
      });
    }

    const { vibe, feedback, userId } = req.body;
    
    console.log('📝 Feedback received:', {
      vibe: `"${vibe}"`,
      feedback,
      userId: userId ? `${userId.substring(0, 8)}...` : 'anonymous'
    });

    // Update Claude's memory with user feedback
    await updateMemoryFeedback(vibe, feedback);

    res.json({
      success: true,
      message: 'Feedback recorded for continuous learning',
      data: {
        vibe,
        feedback,
        timestamp: Date.now()
      }
    });

  } catch (error) {
    console.error('❌ Feedback recording failed:', error);
    
    res.status(500).json({
      success: false,
      error: 'Failed to record feedback'
    });
  }
});

/**
 * Get Claude agent memory statistics
 */
router.get('/memory/stats', async (req: Request, res: Response) => {
  try {
    const stats = await getMemoryStats();
    
    res.json({
      success: true,
      data: {
        memory: stats,
        capabilities: {
          semanticMatching: true,
          continuousLearning: true,
          selfReflection: true,
          adaptiveImprovement: true,
          errorRecovery: true
        },
        agent: {
          model: 'Claude 3 Haiku (20240307)',
          mode: 'Autonomous Reasoning Agent',
          pipeline: 'Think→Verify→Reflect',
          temperature: '0.1-0.3 (adaptive)',
          memoryEnabled: true
        }
      }
    });

  } catch (error) {
    console.error('❌ Memory stats failed:', error);
    
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve memory statistics'
    });
  }
});

/**
 * Health check for autonomous system
 */
router.get('/health', async (req: Request, res: Response) => {
  try {
    const stats = await getMemoryStats();
    
    res.json({
      success: true,
      status: 'operational',
      data: {
        agent: 'Claude 3 Haiku Autonomous',
        capabilities: [
          'Self-Reasoning',
          'Memory & Learning', 
          'Self-Debugging',
          'Continuous Adaptation',
          'Error Recovery'
        ],
        memory: {
          totalVibes: stats.totalVibes,
          totalEntries: stats.totalEntries,
          successRate: `${(stats.successRate * 100).toFixed(1)}%`
        },
        lastUpdated: new Date().toISOString()
      }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      status: 'degraded',
      error: 'Autonomous system health check failed'
    });
  }
});

export default router;
