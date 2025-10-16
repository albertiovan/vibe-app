/**
 * Vibe-to-Experience API Routes
 * Core AI-powered experience matching endpoints
 */

import express, { Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import { googlePlacesService } from '../services/googlePlacesService.js';
import { UserVibe } from '../types/vibe.js';

const router = express.Router();

/**
 * POST /api/vibe/match
 * Main endpoint: Get experiences based on user's current vibe
 */
router.post('/match', [
  // Validation middleware
  body('energy').isIn(['low', 'medium', 'high']).withMessage('Energy must be low, medium, or high'),
  body('social').isIn(['alone', 'intimate', 'small_group', 'crowd']).withMessage('Invalid social preference'),
  body('mood').isIn(['adventurous', 'relaxed', 'creative', 'productive', 'social', 'contemplative', 'playful']).withMessage('Invalid mood'),
  body('timeAvailable').isIn(['quick', 'moderate', 'extended', 'all_day']).withMessage('Invalid time preference'),
  body('budget').isIn(['free', 'budget', 'moderate', 'splurge']).withMessage('Invalid budget preference'),
  body('weatherPreference').isIn(['indoor', 'outdoor', 'either']).withMessage('Invalid weather preference'),
  body('exploration').isIn(['familiar', 'mixed', 'new']).withMessage('Invalid exploration preference'),
  body('location.lat').optional().isFloat({ min: -90, max: 90 }).withMessage('Invalid latitude'),
  body('location.lng').optional().isFloat({ min: -180, max: 180 }).withMessage('Invalid longitude'),
  body('location.radius').optional().isFloat({ min: 0.1, max: 50 }).withMessage('Radius must be between 0.1 and 50 km'),
], async (req: Request, res: Response) => {
  try {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Invalid vibe data',
        details: errors.array()
      });
    }

    const vibe: UserVibe = req.body;
    
    // Add context from request if not provided
    if (!vibe.timeOfDay) {
      const hour = new Date().getHours();
      if (hour < 12) vibe.timeOfDay = 'morning';
      else if (hour < 17) vibe.timeOfDay = 'afternoon';
      else if (hour < 21) vibe.timeOfDay = 'evening';
      else vibe.timeOfDay = 'night';
    }
    
    if (!vibe.dayType) {
      const day = new Date().getDay();
      vibe.dayType = (day === 0 || day === 6) ? 'weekend' : 'weekday';
    }

    console.log('🎭 Processing vibe match request:', {
      energy: vibe.energy,
      social: vibe.social,
      mood: vibe.mood,
      location: vibe.location ? 'provided' : 'default'
    });

    // Find experiences using Google Places
    const match = await googlePlacesService.findExperiencesByVibe(vibe);

    res.json({
      success: true,
      data: {
        vibe: vibe,
        match: match,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('❌ Vibe match error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to find vibe matches',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * POST /api/vibe/quick-match
 * Simplified endpoint for quick vibe matching with minimal input
 */
router.post('/quick-match', [
  body('mood').isIn(['adventurous', 'relaxed', 'creative', 'productive', 'social', 'contemplative', 'playful']),
  body('energy').optional().isIn(['low', 'medium', 'high']),
  body('location.lat').optional().isFloat({ min: -90, max: 90 }),
  body('location.lng').optional().isFloat({ min: -180, max: 180 }),
], async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Invalid quick vibe data',
        details: errors.array()
      });
    }

    // Build full vibe from minimal input with smart defaults
    const quickVibe: UserVibe = {
      energy: req.body.energy || 'medium',
      social: req.body.social || 'intimate',
      mood: req.body.mood,
      timeAvailable: req.body.timeAvailable || 'moderate',
      budget: req.body.budget || 'moderate',
      weatherPreference: req.body.weatherPreference || 'either',
      exploration: req.body.exploration || 'mixed',
      location: req.body.location,
      description: req.body.description
    };

    console.log('⚡ Processing quick vibe match:', quickVibe.mood);

    const match = await googlePlacesService.findExperiencesByVibe(quickVibe);

    res.json({
      success: true,
      data: {
        vibe: quickVibe,
        match: match,
        timestamp: new Date().toISOString(),
        mode: 'quick'
      }
    });

  } catch (error) {
    console.error('❌ Quick vibe match error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to find quick vibe matches',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * GET /api/vibe/presets
 * Get common vibe presets for quick selection
 */
router.get('/presets', (req, res) => {
  const presets = [
    {
      id: 'chill_morning',
      name: '☕ Chill Morning',
      description: 'Low-key start to the day',
      vibe: {
        energy: 'low',
        social: 'alone',
        mood: 'relaxed',
        timeAvailable: 'moderate',
        budget: 'budget',
        weatherPreference: 'either',
        exploration: 'familiar'
      }
    },
    {
      id: 'adventure_day',
      name: '🏔️ Adventure Day',
      description: 'High-energy outdoor exploration',
      vibe: {
        energy: 'high',
        social: 'small_group',
        mood: 'adventurous',
        timeAvailable: 'extended',
        budget: 'moderate',
        weatherPreference: 'outdoor',
        exploration: 'new'
      }
    },
    {
      id: 'creative_afternoon',
      name: '🎨 Creative Flow',
      description: 'Inspiring spaces for creativity',
      vibe: {
        energy: 'medium',
        social: 'alone',
        mood: 'creative',
        timeAvailable: 'extended',
        budget: 'moderate',
        weatherPreference: 'indoor',
        exploration: 'mixed'
      }
    },
    {
      id: 'social_evening',
      name: '🍻 Social Evening',
      description: 'Connect with friends and new people',
      vibe: {
        energy: 'medium',
        social: 'crowd',
        mood: 'social',
        timeAvailable: 'extended',
        budget: 'moderate',
        weatherPreference: 'either',
        exploration: 'mixed'
      }
    },
    {
      id: 'productive_focus',
      name: '💻 Productive Focus',
      description: 'Get things done in inspiring spaces',
      vibe: {
        energy: 'medium',
        social: 'alone',
        mood: 'productive',
        timeAvailable: 'extended',
        budget: 'budget',
        weatherPreference: 'indoor',
        exploration: 'familiar'
      }
    },
    {
      id: 'spontaneous_fun',
      name: '🎲 Spontaneous Fun',
      description: 'Quick playful activities nearby',
      vibe: {
        energy: 'high',
        social: 'intimate',
        mood: 'playful',
        timeAvailable: 'quick',
        budget: 'budget',
        weatherPreference: 'either',
        exploration: 'new'
      }
    }
  ];

  res.json({
    success: true,
    data: {
      presets,
      total: presets.length
    }
  });
});

/**
 * GET /api/vibe/options
 * Get all available vibe options for UI building
 */
router.get('/options', (req, res) => {
  const options = {
    energy: [
      { value: 'low', label: 'Low Energy', emoji: '😴', description: 'Calm, peaceful activities' },
      { value: 'medium', label: 'Medium Energy', emoji: '🚶', description: 'Moderate activity level' },
      { value: 'high', label: 'High Energy', emoji: '🏃', description: 'Active, energizing experiences' }
    ],
    social: [
      { value: 'alone', label: 'Solo', emoji: '🧘', description: 'Enjoy your own company' },
      { value: 'intimate', label: 'Intimate', emoji: '👫', description: 'Small, cozy settings' },
      { value: 'small_group', label: 'Small Group', emoji: '👥', description: '3-6 people activities' },
      { value: 'crowd', label: 'Crowd', emoji: '🎉', description: 'Bustling, social environments' }
    ],
    mood: [
      { value: 'adventurous', label: 'Adventurous', emoji: '🗺️', description: 'Try something new and exciting' },
      { value: 'relaxed', label: 'Relaxed', emoji: '🌿', description: 'Unwind and de-stress' },
      { value: 'creative', label: 'Creative', emoji: '🎨', description: 'Inspire your artistic side' },
      { value: 'productive', label: 'Productive', emoji: '💡', description: 'Get things done effectively' },
      { value: 'social', label: 'Social', emoji: '🤝', description: 'Connect with others' },
      { value: 'contemplative', label: 'Contemplative', emoji: '🤔', description: 'Think and reflect deeply' },
      { value: 'playful', label: 'Playful', emoji: '🎮', description: 'Have fun and be silly' }
    ],
    timeAvailable: [
      { value: 'quick', label: 'Quick (15-30 min)', emoji: '⚡', description: 'Short activities' },
      { value: 'moderate', label: 'Moderate (1-2 hours)', emoji: '⏰', description: 'Standard outings' },
      { value: 'extended', label: 'Extended (3-5 hours)', emoji: '🕐', description: 'Half-day adventures' },
      { value: 'all_day', label: 'All Day (6+ hours)', emoji: '🌅', description: 'Full-day experiences' }
    ],
    budget: [
      { value: 'free', label: 'Free', emoji: '💚', description: 'No cost activities' },
      { value: 'budget', label: 'Budget ($1-20)', emoji: '💵', description: 'Low-cost options' },
      { value: 'moderate', label: 'Moderate ($21-50)', emoji: '💳', description: 'Mid-range experiences' },
      { value: 'splurge', label: 'Splurge ($50+)', emoji: '💎', description: 'Premium activities' }
    ],
    weatherPreference: [
      { value: 'indoor', label: 'Indoor', emoji: '🏠', description: 'Climate-controlled spaces' },
      { value: 'outdoor', label: 'Outdoor', emoji: '🌞', description: 'Fresh air and nature' },
      { value: 'either', label: 'Either', emoji: '🌤️', description: 'No preference' }
    ],
    exploration: [
      { value: 'familiar', label: 'Familiar', emoji: '🏡', description: 'Known, comfortable places' },
      { value: 'mixed', label: 'Mixed', emoji: '🎯', description: 'Balance of old and new' },
      { value: 'new', label: 'New', emoji: '🔍', description: 'Discover hidden gems' }
    ]
  };

  res.json({
    success: true,
    data: options
  });
});

/**
 * GET /api/vibe/status
 * Service health check and configuration info
 */
router.get('/status', (req, res) => {
  const hasGoogleKey = Boolean(process.env.GOOGLE_MAPS_API_KEY);
  
  res.json({
    success: true,
    data: {
      service: 'Vibe-to-Experience AI',
      status: hasGoogleKey ? 'ready' : 'configuration_needed',
      googlePlacesEnabled: hasGoogleKey,
      version: '1.0.0',
      features: [
        'AI vibe matching',
        'Google Places integration',
        'Real-time experience discovery',
        'Smart filtering and ranking'
      ],
      timestamp: new Date().toISOString()
    }
  });
});

export default router;
