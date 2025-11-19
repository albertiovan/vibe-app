/**
 * Sidequests API Routes
 * Generates personalized activity suggestions that:
 * 1. Align with user's historical preferences
 * 2. Gently push them outside their comfort zone
 * 3. Are different from Challenge Me (more personalized, less extreme)
 */

import { Router, Request, Response } from 'express';
import { Pool } from 'pg';

const router = Router();

// Initialize database pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://localhost:5432/vibe_app',
});

interface UserPreferences {
  favoriteCategories: string[];
  energyLevels: { [key: string]: number }; // Count of activities by energy level
  recentActivities: number[]; // Activity IDs
}

/**
 * GET /api/sidequests
 * Returns 3 personalized activity suggestions
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    const { deviceId } = req.query;

    if (!deviceId) {
      return res.status(400).json({ error: 'deviceId is required' });
    }

    console.log(`📋 Generating sidequests for device: ${deviceId}`);

    // Get user preferences from interaction history
    const userPrefs = await getUserPreferences(deviceId as string);

    // Generate 3 personalized sidequests
    const sidequests = await generateSidequests(userPrefs, deviceId as string);

    return res.json({
      sidequests,
      generated: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error generating sidequests:', error);
    return res.status(500).json({ error: 'Failed to generate sidequests' });
  }
});

/**
 * Analyze user's interaction history to determine preferences
 */
async function getUserPreferences(deviceId: string): Promise<UserPreferences> {
  try {
    // Get user's interaction history
    const interactionsQuery = `
      SELECT 
        ai.activity_id,
        ai.interaction_type,
        ai.created_at,
        a.category,
        a.energy_level
      FROM activity_interactions ai
      JOIN activities a ON ai.activity_id = a.id
      WHERE ai.device_id = $1
      ORDER BY ai.created_at DESC
      LIMIT 50
    `;

    const result = await pool.query(interactionsQuery, [deviceId]);
    const interactions = result.rows;

    // Analyze favorite categories (weighted by interaction type)
    const categoryScores: { [key: string]: number } = {};
    const energyScores: { [key: string]: number } = {};
    const recentActivities: number[] = [];

    interactions.forEach((interaction: any) => {
      const weight = getInteractionWeight(interaction.interaction_type);
      
      // Category scoring
      if (!categoryScores[interaction.category]) {
        categoryScores[interaction.category] = 0;
      }
      categoryScores[interaction.category] += weight;

      // Energy level scoring
      if (!energyScores[interaction.energy_level]) {
        energyScores[interaction.energy_level] = 0;
      }
      energyScores[interaction.energy_level] += weight;

      // Track recent activities to avoid duplicates
      if (recentActivities.length < 20) {
        recentActivities.push(interaction.activity_id);
      }
    });

    // Get top 3 favorite categories
    const favoriteCategories = Object.entries(categoryScores)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3)
      .map(([category]) => category);

    console.log('📊 User preferences:', {
      favoriteCategories,
      energyDistribution: energyScores,
      interactionCount: interactions.length,
    });

    return {
      favoriteCategories,
      energyLevels: energyScores,
      recentActivities,
    };
  } catch (error) {
    console.error('Error getting user preferences:', error);
    return {
      favoriteCategories: [],
      energyLevels: {},
      recentActivities: [],
    };
  }
}

/**
 * Weight different interaction types
 */
function getInteractionWeight(interactionType: string): number {
  const weights: { [key: string]: number } = {
    completed: 3,
    saved: 2,
    viewed: 1,
    dismissed: -0.5,
  };
  return weights[interactionType] || 1;
}

/**
 * Generate 3 personalized sidequests
 * Strategy:
 * 1. One activity from user's favorite category (comfort zone)
 * 2. One activity from adjacent category (gentle push)
 * 3. One activity from different energy level (variety)
 */
async function generateSidequests(
  userPrefs: UserPreferences,
  deviceId: string
): Promise<any[]> {
  const sidequests: any[] = [];

  try {
    // Determine user's primary energy level
    const primaryEnergy = getPrimaryEnergyLevel(userPrefs.energyLevels);

    // Sidequest 1: Favorite category, same energy level (comfort zone)
    if (userPrefs.favoriteCategories.length > 0) {
      const comfortActivity = await getActivityByPreferences({
        categories: [userPrefs.favoriteCategories[0]],
        energyLevel: primaryEnergy,
        excludeIds: [...userPrefs.recentActivities, ...sidequests.map(s => s.id)],
      });
      if (comfortActivity) sidequests.push(comfortActivity);
    }

    // Sidequest 2: Adjacent category, same energy level (gentle exploration)
    const adjacentCategories = getAdjacentCategories(userPrefs.favoriteCategories);
    if (adjacentCategories.length > 0) {
      const explorationActivity = await getActivityByPreferences({
        categories: adjacentCategories,
        energyLevel: primaryEnergy,
        excludeIds: [...userPrefs.recentActivities, ...sidequests.map(s => s.id)],
      });
      if (explorationActivity) sidequests.push(explorationActivity);
    }

    // Sidequest 3: Any category, different energy level (energy variety)
    const alternateEnergy = getAlternateEnergyLevel(primaryEnergy);
    const varietyActivity = await getActivityByPreferences({
      categories: [], // Any category
      energyLevel: alternateEnergy,
      excludeIds: [...userPrefs.recentActivities, ...sidequests.map(s => s.id)],
    });
    if (varietyActivity) sidequests.push(varietyActivity);

    // If we don't have 3 sidequests, fill with random activities
    while (sidequests.length < 3) {
      const randomActivity = await getActivityByPreferences({
        categories: [],
        energyLevel: null,
        excludeIds: [...userPrefs.recentActivities, ...sidequests.map(s => s.id)],
      });
      if (randomActivity) {
        sidequests.push(randomActivity);
      } else {
        break; // No more activities available
      }
    }

    console.log(`✨ Generated ${sidequests.length} sidequests`);
    return sidequests;
  } catch (error) {
    console.error('Error generating sidequests:', error);
    return [];
  }
}

/**
 * Get primary energy level from user's history
 */
function getPrimaryEnergyLevel(energyLevels: { [key: string]: number }): string {
  if (Object.keys(energyLevels).length === 0) return 'medium';

  const sorted = Object.entries(energyLevels).sort(([, a], [, b]) => b - a);
  return sorted[0][0];
}

/**
 * Get alternate energy level for variety
 */
function getAlternateEnergyLevel(primaryEnergy: string): string {
  const energyMap: { [key: string]: string } = {
    low: 'medium',
    medium: 'high',
    high: 'low',
  };
  return energyMap[primaryEnergy] || 'medium';
}

/**
 * Get categories adjacent to user's favorites
 * These are thematically related but different
 */
function getAdjacentCategories(favoriteCategories: string[]): string[] {
  const adjacencyMap: { [key: string]: string[] } = {
    wellness: ['mindfulness', 'fitness', 'nature'],
    nature: ['adventure', 'water', 'seasonal'],
    culture: ['learning', 'creative', 'social'],
    adventure: ['nature', 'sports', 'water'],
    learning: ['culture', 'creative', 'mindfulness'],
    culinary: ['social', 'culture', 'romance'],
    water: ['nature', 'adventure', 'sports'],
    nightlife: ['social', 'culinary', 'romance'],
    social: ['nightlife', 'culinary', 'culture'],
    fitness: ['wellness', 'sports', 'adventure'],
    sports: ['fitness', 'adventure', 'water'],
    seasonal: ['nature', 'culture', 'social'],
    romance: ['culinary', 'culture', 'nightlife'],
    mindfulness: ['wellness', 'nature', 'creative'],
    creative: ['culture', 'learning', 'mindfulness'],
  };

  const adjacent = new Set<string>();
  favoriteCategories.forEach((category) => {
    const related = adjacencyMap[category] || [];
    related.forEach((cat) => {
      if (!favoriteCategories.includes(cat)) {
        adjacent.add(cat);
      }
    });
  });

  return Array.from(adjacent);
}

/**
 * Get activity matching preferences
 */
async function getActivityByPreferences(options: {
  categories: string[];
  energyLevel: string | null;
  excludeIds: number[];
}): Promise<any | null> {
  try {
    let query = `
      SELECT 
        a.id,
        a.name,
        a.category,
        a.energy_level as "energyLevel",
        a.description,
        a.image_url as "imageUrl",
        a.estimated_duration as "estimatedDuration",
        json_agg(
          json_build_object(
            'name', v.name,
            'address', v.address,
            'latitude', v.latitude,
            'longitude', v.longitude
          )
        ) FILTER (WHERE v.id IS NOT NULL) as venues
      FROM activities a
      LEFT JOIN venues v ON a.id = v.activity_id
      WHERE 1=1
    `;

    const params: any[] = [];
    let paramIndex = 1;

    // Filter by categories
    if (options.categories.length > 0) {
      query += ` AND a.category = ANY($${paramIndex})`;
      params.push(options.categories);
      paramIndex++;
    }

    // Filter by energy level
    if (options.energyLevel) {
      query += ` AND a.energy_level = $${paramIndex}`;
      params.push(options.energyLevel);
      paramIndex++;
    }

    // Exclude recent activities
    if (options.excludeIds.length > 0) {
      query += ` AND a.id != ALL($${paramIndex})`;
      params.push(options.excludeIds);
      paramIndex++;
    }

    query += `
      GROUP BY a.id
      ORDER BY RANDOM()
      LIMIT 1
    `;

    const result = await pool.query(query, params);
    return result.rows[0] || null;
  } catch (error) {
    console.error('Error getting activity:', error);
    return null;
  }
}

export default router;
