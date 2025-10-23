/**
 * Custom Vibe Profiles Routes
 * 
 * Allow users to create, save, and manage their own vibe profiles
 * for quick activity filtering based on common moods/situations
 */

import { Router, Request, Response } from 'express';
import { Pool } from 'pg';

const router = Router();
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://localhost/vibe_app',
});

interface VibeProfileFilters {
  energyLevel?: 'low' | 'medium' | 'high';
  indoorOutdoor?: 'indoor' | 'outdoor' | 'both';
  durationRange?: 'quick' | 'short' | 'medium' | 'long' | 'full-day';
  maxDistanceKm?: number | null;
  groupSize?: 'solo' | 'couple' | 'small-group' | 'large-group';
  categories?: string[];
  timeOfDay?: 'morning' | 'afternoon' | 'evening' | 'night' | 'any';
  budget?: 'free' | 'budget' | 'moderate' | 'premium';
  mood?: string;
  whoWith?: 'solo' | 'date' | 'friends' | 'family' | 'colleagues';
  specificTags?: string[];
  vibeText?: string; // Free-form vibe description
}

interface VibeProfile {
  id: number;
  user_identifier: string;
  name: string;
  emoji?: string;
  description?: string;
  filters: VibeProfileFilters;
  times_used: number;
  last_used_at?: Date;
  created_at: Date;
  updated_at: Date;
}

/**
 * GET /api/vibe-profiles
 * Get all vibe profiles for a user
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    const { deviceId, userId } = req.query;
    const userIdentifier = userId || deviceId;

    if (!userIdentifier) {
      return res.status(400).json({ error: 'User identifier required' });
    }

    const { rows: profiles } = await pool.query<VibeProfile>(`
      SELECT id, user_identifier, name, emoji, description, filters,
             times_used, last_used_at, created_at, updated_at
      FROM vibe_profiles
      WHERE user_identifier = $1
      ORDER BY times_used DESC, last_used_at DESC NULLS LAST, created_at DESC
    `, [userIdentifier]);

    return res.json({ profiles });

  } catch (error) {
    console.error('❌ Error fetching vibe profiles:', error);
    return res.status(500).json({ 
      error: 'fetch_failed',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * POST /api/vibe-profiles
 * Create a new vibe profile
 */
router.post('/', async (req: Request, res: Response) => {
  try {
    const { deviceId, userId, name, emoji, description, filters } = req.body;
    const userIdentifier = userId || deviceId;

    if (!userIdentifier || !name || !filters) {
      return res.status(400).json({ error: 'Missing required fields: userIdentifier, name, filters' });
    }

    // Validate profile name length
    if (name.length > 50) {
      return res.status(400).json({ error: 'Profile name must be 50 characters or less' });
    }

    console.log('📝 Creating vibe profile:', name, 'for user:', userIdentifier);

    const { rows } = await pool.query<VibeProfile>(`
      INSERT INTO vibe_profiles (user_identifier, name, emoji, description, filters)
      VALUES ($1, $2, $3, $4, $5)
      ON CONFLICT (user_identifier, name) 
      DO UPDATE SET 
        emoji = EXCLUDED.emoji,
        description = EXCLUDED.description,
        filters = EXCLUDED.filters,
        updated_at = NOW()
      RETURNING *
    `, [userIdentifier, name, emoji, description, JSON.stringify(filters)]);

    console.log('✅ Vibe profile created:', rows[0].id);
    return res.json({ profile: rows[0] });

  } catch (error) {
    console.error('❌ Error creating vibe profile:', error);
    return res.status(500).json({ 
      error: 'creation_failed',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * PUT /api/vibe-profiles/:id
 * Update an existing vibe profile
 */
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { deviceId, userId, name, emoji, description, filters } = req.body;
    const userIdentifier = userId || deviceId;

    if (!userIdentifier) {
      return res.status(400).json({ error: 'User identifier required' });
    }

    console.log('📝 Updating vibe profile:', id);

    const { rows } = await pool.query<VibeProfile>(`
      UPDATE vibe_profiles
      SET name = COALESCE($2, name),
          emoji = COALESCE($3, emoji),
          description = COALESCE($4, description),
          filters = COALESCE($5, filters),
          updated_at = NOW()
      WHERE id = $1 AND user_identifier = $6
      RETURNING *
    `, [id, name, emoji, description, filters ? JSON.stringify(filters) : null, userIdentifier]);

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Profile not found or unauthorized' });
    }

    console.log('✅ Vibe profile updated:', rows[0].id);
    return res.json({ profile: rows[0] });

  } catch (error) {
    console.error('❌ Error updating vibe profile:', error);
    return res.status(500).json({ 
      error: 'update_failed',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * DELETE /api/vibe-profiles/:id
 * Delete a vibe profile
 */
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { deviceId, userId } = req.query;
    const userIdentifier = userId || deviceId;

    if (!userIdentifier) {
      return res.status(400).json({ error: 'User identifier required' });
    }

    console.log('🗑️  Deleting vibe profile:', id);

    const { rowCount } = await pool.query(`
      DELETE FROM vibe_profiles
      WHERE id = $1 AND user_identifier = $2
    `, [id, userIdentifier]);

    if (rowCount === 0) {
      return res.status(404).json({ error: 'Profile not found or unauthorized' });
    }

    console.log('✅ Vibe profile deleted:', id);
    return res.json({ success: true });

  } catch (error) {
    console.error('❌ Error deleting vibe profile:', error);
    return res.status(500).json({ 
      error: 'deletion_failed',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * POST /api/vibe-profiles/:id/use
 * Mark a profile as used (increments counter, updates last_used_at)
 */
router.post('/:id/use', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { deviceId, userId } = req.body;
    const userIdentifier = userId || deviceId;

    if (!userIdentifier) {
      return res.status(400).json({ error: 'User identifier required' });
    }

    const { rows } = await pool.query<VibeProfile>(`
      UPDATE vibe_profiles
      SET times_used = times_used + 1,
          last_used_at = NOW()
      WHERE id = $1 AND user_identifier = $2
      RETURNING *
    `, [id, userIdentifier]);

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Profile not found or unauthorized' });
    }

    return res.json({ profile: rows[0] });

  } catch (error) {
    console.error('❌ Error marking profile as used:', error);
    return res.status(500).json({ 
      error: 'use_tracking_failed',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * GET /api/vibe-profiles/templates
 * Get suggested profile templates to help users get started
 */
router.get('/templates', async (req: Request, res: Response) => {
  const templates = [
    {
      name: 'Date Night',
      emoji: '❤️',
      description: 'Romantic activities for two',
      filters: {
        groupSize: 'couple',
        mood: 'romantic',
        whoWith: 'date',
        categories: ['romantic', 'culinary', 'culture'],
        timeOfDay: 'evening',
        energyLevel: 'medium',
        budget: 'moderate',
        specificTags: ['romantic', 'date-friendly', 'intimate']
      }
    },
    {
      name: 'Solo Adventure',
      emoji: '🧭',
      description: 'Explore on your own terms',
      filters: {
        groupSize: 'solo',
        mood: 'explorer',
        whoWith: 'solo',
        categories: ['adventure', 'nature', 'culture'],
        energyLevel: 'high',
        indoorOutdoor: 'outdoor',
        specificTags: ['solo-friendly', 'exploration']
      }
    },
    {
      name: 'Party Mode',
      emoji: '🎉',
      description: 'Fun with friends, high energy',
      filters: {
        groupSize: 'large-group',
        mood: 'social',
        whoWith: 'friends',
        categories: ['nightlife', 'social'],
        timeOfDay: 'night',
        energyLevel: 'high',
        specificTags: ['social', 'party', 'nightlife']
      }
    },
    {
      name: 'Chill Sunday',
      emoji: '☕',
      description: 'Relaxed, low-key activities',
      filters: {
        energyLevel: 'low',
        mood: 'relaxed',
        durationRange: 'medium',
        categories: ['wellness', 'nature', 'culinary'],
        timeOfDay: 'afternoon',
        budget: 'budget',
        specificTags: ['relaxed', 'calm', 'peaceful']
      }
    },
    {
      name: 'Fitness Focus',
      emoji: '💪',
      description: 'Active and energizing',
      filters: {
        energyLevel: 'high',
        categories: ['fitness', 'sports', 'adventure'],
        indoorOutdoor: 'outdoor',
        mood: 'energetic',
        specificTags: ['workout', 'active', 'fitness']
      }
    },
    {
      name: 'Cultural Explorer',
      emoji: '🎨',
      description: 'Museums, galleries, history',
      filters: {
        categories: ['culture', 'learning'],
        indoorOutdoor: 'indoor',
        energyLevel: 'medium',
        mood: 'curious',
        specificTags: ['culture', 'art', 'history', 'educational']
      }
    },
    {
      name: 'Foodie Tour',
      emoji: '🍽️',
      description: 'Culinary adventures',
      filters: {
        categories: ['culinary'],
        groupSize: 'small-group',
        mood: 'curious',
        specificTags: ['food', 'dining', 'tasting']
      }
    },
    {
      name: 'Quick Break',
      emoji: '⚡',
      description: 'Short activities, close by',
      filters: {
        durationRange: 'quick',
        maxDistanceKm: 5,
        energyLevel: 'medium',
        specificTags: ['quick', 'nearby']
      }
    }
  ];

  return res.json({ templates });
});

export default router;
