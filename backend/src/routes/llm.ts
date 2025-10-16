/**
 * LLM Testing Routes
 * Endpoints for testing LLM provider functionality
 */

import express, { Request, Response } from 'express';
import { getLLMProvider, getLLMProviderInfo, testLLMConnection } from '../services/llm/index.js';
import { parseVibeToFilterSpec } from '../services/llm/queryUnderstanding.js';
import { rerankAndSummarize } from '../services/llm/curation.js';
import { isLLMConfigured } from '../config/llm.js';

const router = express.Router();

/**
 * GET /api/llm/status
 * Check LLM provider status and configuration
 */
router.get('/status', async (req: Request, res: Response) => {
  try {
    const info = getLLMProviderInfo();
    const isConfigured = isLLMConfigured();
    
    let connectionStatus = { ok: false, error: 'Not tested' };
    
    if (isConfigured) {
      connectionStatus = await testLLMConnection();
    }

    res.json({
      success: true,
      data: {
        provider: info.provider,
        model: info.model,
        timeoutMs: info.timeoutMs,
        isConfigured,
        connectionStatus,
        capabilities: [
          'parseVibeToFilterSpec',
          'rerankAndSummarize',
          'JSON validation',
          'Fallback handling'
        ],
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('❌ LLM status check error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to check LLM status',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * POST /api/llm/parse-vibe
 * Test vibe-to-filter parsing
 */
router.post('/parse-vibe', async (req: Request, res: Response) => {
  try {
    const { vibe } = req.body;
    
    if (!vibe || typeof vibe !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'Missing or invalid vibe text'
      });
    }

    console.log('🧠 Testing vibe parsing:', vibe);
    
    const startTime = Date.now();
    const filterSpec = await parseVibeToFilterSpec(vibe);
    const duration = Date.now() - startTime;

    res.json({
      success: true,
      data: {
        input: vibe,
        filterSpec,
        duration,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('❌ Vibe parsing test error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to parse vibe',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * POST /api/llm/curate
 * Test place curation
 */
router.post('/curate', async (req: Request, res: Response) => {
  try {
    const { query, items } = req.body;
    
    if (!query || typeof query !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'Missing or invalid query'
      });
    }

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Missing or invalid items array'
      });
    }

    console.log('🎯 Testing curation:', { query, itemCount: items.length });
    
    const startTime = Date.now();
    const curation = await rerankAndSummarize({ query, items });
    const duration = Date.now() - startTime;

    res.json({
      success: true,
      data: {
        input: { query, itemCount: items.length },
        curation,
        duration,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('❌ Curation test error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to curate places',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * GET /api/llm/test-fixtures
 * Get test data for LLM endpoints
 */
router.get('/test-fixtures', (req: Request, res: Response) => {
  const fixtures = {
    vibes: [
      'I want something adventurous and exciting',
      'I need to relax and unwind',
      'I want to learn about history and culture',
      'I want to be outside in nature',
      'It\'s raining, I need indoor activities',
      'I want to eat at a nice restaurant',
      'I\'m looking for free or cheap activities',
      'I want evening entertainment'
    ],
    samplePlaces: [
      {
        place_id: 'test_museum_1',
        name: 'National History Museum',
        types: ['museum', 'tourist_attraction'],
        rating: 4.5,
        user_ratings_total: 1250,
        vicinity: 'Downtown, City Center',
        editorial_summary: { overview: 'Comprehensive museum showcasing national history and culture' },
        vibeScore: 0.85,
        vibeReasons: ['Perfect for learning', 'Highly rated', 'Cultural experience']
      },
      {
        place_id: 'test_park_1',
        name: 'Central Park',
        types: ['park', 'tourist_attraction'],
        rating: 4.3,
        user_ratings_total: 890,
        vicinity: 'City Center',
        editorial_summary: { overview: 'Beautiful urban park with walking trails and gardens' },
        vibeScore: 0.78,
        vibeReasons: ['Great for relaxation', 'Outdoor space', 'Popular destination']
      },
      {
        place_id: 'test_gallery_1',
        name: 'Modern Art Gallery',
        types: ['art_gallery', 'tourist_attraction'],
        rating: 4.7,
        user_ratings_total: 456,
        vicinity: 'Arts District',
        editorial_summary: { overview: 'Contemporary art gallery featuring local and international artists' },
        vibeScore: 0.92,
        vibeReasons: ['Excellent for art lovers', 'Highly rated', 'Creative inspiration']
      }
    ]
  };

  res.json({
    success: true,
    data: fixtures
  });
});

export default router;
