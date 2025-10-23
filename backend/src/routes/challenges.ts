/**
 * Challenge Me Routes
 * 
 * Analyzes user behavior patterns and suggests NEW, EXCITING challenges
 * that push them outside their comfort zone
 */

import { Router, Request, Response } from 'express';
import { Pool } from 'pg';

const router = Router();
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://localhost/vibe_app',
});

interface ChallengeActivity {
  activityId: number;
  name: string;
  category: string;
  bucket: string;
  region: string;
  city: string;
  description: string;
  energy_level: string;
  indoor_outdoor: string;
  duration_min: number;
  duration_max: number;
  tags: string[];
  challengeReason: string;
  challengeScore: number;
  isLocal: boolean; // true if in user's city, false if requires travel
  venues: any[];
}

/**
 * GET /api/challenges/me
 * Get 3 personalized challenges based on user's past behavior
 */
router.get('/me', async (req: Request, res: Response) => {
  try {
    const { deviceId, userId } = req.query;
    const userIdentifier = userId || deviceId;

    if (!userIdentifier) {
      return res.status(400).json({ error: 'User identifier required' });
    }

    console.log('🎯 Generating challenges for user:', userIdentifier);

    // STEP 1: Analyze user's past activity patterns (gracefully handle new users)
    let userPattern;
    try {
      userPattern = await analyzeUserPattern(userIdentifier as string);
      console.log('📊 User pattern analysis:', userPattern);
    } catch (error) {
      console.log('⚠️ Could not analyze user pattern, using defaults for new user');
      // Default pattern for brand new users
      userPattern = {
        dominantCategories: [],
        dominantEnergy: 'medium',
        preferredLocation: 'local' as const,
        activityCount: 0,
        categoryDistribution: {},
        energyDistribution: {}
      };
    }

    // STEP 2: Generate challenge suggestions (opposite of comfort zone)
    const challenges = await generateChallenges(userPattern);
    console.log(`✅ Generated ${challenges.length} challenges`);

    return res.json({
      challenges,
      userPattern: {
        dominantCategories: userPattern.dominantCategories,
        dominantEnergy: userPattern.dominantEnergy,
        preferredLocation: userPattern.preferredLocation
      }
    });

  } catch (error) {
    console.error('❌ Challenge generation error:', error);
    return res.status(500).json({ 
      error: 'challenge_generation_failed',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * POST /api/challenges/respond
 * Record user's response to a challenge (accept/decline)
 */
router.post('/respond', async (req: Request, res: Response) => {
  try {
    const { deviceId, userId, activityId, response, challengeReason } = req.body;
    const userIdentifier = userId || deviceId;

    if (!userIdentifier || !activityId || !response) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    console.log(`📝 User ${response}ed challenge:`, activityId);

    // Store challenge response for future learning
    await pool.query(`
      INSERT INTO challenge_responses (user_identifier, activity_id, response, challenge_reason, created_at)
      VALUES ($1, $2, $3, $4, NOW())
    `, [userIdentifier, activityId, response, challengeReason]);

    // If accepted, create a pending activity for the user
    if (response === 'accepted') {
      await pool.query(`
        INSERT INTO user_challenges (user_identifier, activity_id, status, accepted_at)
        VALUES ($1, $2, 'pending', NOW())
        ON CONFLICT (user_identifier, activity_id) 
        DO UPDATE SET status = 'pending', accepted_at = NOW()
      `, [userIdentifier, activityId]);
    }

    return res.json({ success: true, response });

  } catch (error) {
    console.error('❌ Challenge response error:', error);
    return res.status(500).json({ 
      error: 'response_recording_failed',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * Analyze user's past activity patterns from conversation history
 */
async function analyzeUserPattern(userIdentifier: string): Promise<{
  dominantCategories: string[];
  dominantEnergy: string;
  preferredLocation: 'local' | 'travel';
  activityCount: number;
  categoryDistribution: Record<string, number>;
  energyDistribution: Record<string, number>;
}> {
  let pastActivities: any[] = [];
  
  // Try to get user's past activities from conversation history (if table exists)
  try {
    const result = await pool.query(`
      SELECT DISTINCT
        jsonb_array_elements(ch.metadata->'activities') as activity
      FROM conversation_history ch
      JOIN conversations c ON c.id = ch.conversation_id
      WHERE c.device_id = $1
        AND ch.role = 'assistant'
        AND ch.metadata ? 'activities'
        AND ch.created_at > NOW() - INTERVAL '90 days'
      LIMIT 100
    `, [userIdentifier]);
    pastActivities = result.rows;
  } catch (error) {
    console.log('⚠️ No conversation history available for user (new user or table not created yet)');
    // Return default pattern for new users
  }

  // Also get accepted challenge responses
  let acceptedChallenges: any[] = [];
  try {
    const result = await pool.query(`
      SELECT a.category, a.energy_level
      FROM challenge_responses cr
      JOIN activities a ON a.id = cr.activity_id
      WHERE cr.user_identifier = $1
        AND cr.response = 'accepted'
        AND cr.created_at > NOW() - INTERVAL '90 days'
    `, [userIdentifier]);
    acceptedChallenges = result.rows;
  } catch (error) {
    console.log('⚠️ No challenge history yet');
  }

  // Count categories
  const categoryCount: Record<string, number> = {};
  const energyCount: Record<string, number> = {};

  // Parse past activities  
  for (const row of pastActivities) {
    const activity = row.activity;
    const bucket = activity.bucket || activity.category;
    const energy = activity.energy_level;

    if (bucket) {
      categoryCount[bucket] = (categoryCount[bucket] || 0) + 1;
    }
    if (energy) {
      energyCount[energy] = (energyCount[energy] || 0) + 1;
    }
  }

  // Add accepted challenges with higher weight
  for (const challenge of acceptedChallenges) {
    if (challenge.category) {
      categoryCount[challenge.category] = (categoryCount[challenge.category] || 0) + 2; // Double weight
    }
    if (challenge.energy_level) {
      energyCount[challenge.energy_level] = (energyCount[challenge.energy_level] || 0) + 2;
    }
  }

  // Determine dominant patterns
  const sortedCategories = Object.entries(categoryCount)
    .sort(([, a], [, b]) => b - a)
    .map(([cat]) => cat);

  const sortedEnergy = Object.entries(energyCount)
    .sort(([, a], [, b]) => b - a)
    .map(([energy]) => energy);

  const dominantEnergy = sortedEnergy[0] || 'medium';
  const activityCount = pastActivities.length + acceptedChallenges.length;

  return {
    dominantCategories: sortedCategories.slice(0, 3),
    dominantEnergy,
    preferredLocation: 'local', // Could be enhanced with distance analysis
    activityCount,
    categoryDistribution: categoryCount,
    energyDistribution: energyCount
  };
}

/**
 * Generate 3 challenge activities that push user outside comfort zone
 */
async function generateChallenges(userPattern: Awaited<ReturnType<typeof analyzeUserPattern>>): Promise<ChallengeActivity[]> {
  const challenges: ChallengeActivity[] = [];

  // Define challenge strategy based on user patterns
  const challengeCategories = determineChallengeCategories(userPattern);
  const challengeEnergy = determineChallengeEnergy(userPattern);

  console.log('🎯 Challenge strategy:', { challengeCategories, challengeEnergy });

  // Query 1: LOCAL CHALLENGE (in user's city but different category)
  const localChallenge = await pool.query(`
    SELECT 
      a.id as activity_id, a.name, a.category, a.city, a.region, 
      a.description, a.tags, a.energy_level, a.indoor_outdoor,
      a.duration_min, a.duration_max
    FROM activities a
    WHERE a.category = ANY($1::text[])
      AND a.energy_level = $2
      AND a.region = 'București'
    ORDER BY RANDOM()
    LIMIT 1
  `, [challengeCategories, challengeEnergy]);

  if (localChallenge.rows.length > 0) {
    const activity = localChallenge.rows[0];
    challenges.push({
      activityId: activity.activity_id,
      name: activity.name,
      category: activity.category,
      bucket: activity.category,
      region: activity.region,
      city: activity.city,
      description: activity.description,
      energy_level: activity.energy_level,
      indoor_outdoor: activity.indoor_outdoor,
      duration_min: activity.duration_min,
      duration_max: activity.duration_max,
      tags: activity.tags,
      challengeReason: generateChallengeReason(activity.category, userPattern, true),
      challengeScore: 0.7,
      isLocal: true,
      venues: []
    });
  }

  // Query 2: TRAVEL CHALLENGE (outside city, adventurous)
  const travelChallenge = await pool.query(`
    SELECT 
      a.id as activity_id, a.name, a.category, a.city, a.region, 
      a.description, a.tags, a.energy_level, a.indoor_outdoor,
      a.duration_min, a.duration_max
    FROM activities a
    WHERE a.category IN ('adventure', 'nature', 'sports', 'water')
      AND a.energy_level = 'high'
      AND a.region != 'București'
      AND a.region IN ('Brașov', 'Prahova', 'Sinaia', 'Constanța')
    ORDER BY RANDOM()
    LIMIT 1
  `);

  if (travelChallenge.rows.length > 0) {
    const activity = travelChallenge.rows[0];
    challenges.push({
      activityId: activity.activity_id,
      name: activity.name,
      category: activity.category,
      bucket: activity.category,
      region: activity.region,
      city: activity.city,
      description: activity.description,
      energy_level: activity.energy_level,
      indoor_outdoor: activity.indoor_outdoor,
      duration_min: activity.duration_min,
      duration_max: activity.duration_max,
      tags: activity.tags,
      challengeReason: `Explore ${activity.region} - perfect for an adventure outside București!`,
      challengeScore: 0.85,
      isLocal: false,
      venues: []
    });
  }

  // Query 3: EXTREME CHALLENGE (completely different from user's pattern)
  const extremeChallenge = await pool.query(`
    SELECT 
      a.id as activity_id, a.name, a.category, a.city, a.region, 
      a.description, a.tags, a.energy_level, a.indoor_outdoor,
      a.duration_min, a.duration_max
    FROM activities a
    WHERE a.category NOT IN (SELECT unnest($1::text[]))
      AND a.energy_level != $2
      AND 'mood:adrenaline' = ANY(a.tags)
    ORDER BY RANDOM()
    LIMIT 1
  `, [userPattern.dominantCategories.length > 0 ? userPattern.dominantCategories : ['none'], userPattern.dominantEnergy]);

  if (extremeChallenge.rows.length > 0) {
    const activity = extremeChallenge.rows[0];
    challenges.push({
      activityId: activity.activity_id,
      name: activity.name,
      category: activity.category,
      bucket: activity.category,
      region: activity.region,
      city: activity.city,
      description: activity.description,
      energy_level: activity.energy_level,
      indoor_outdoor: activity.indoor_outdoor,
      duration_min: activity.duration_min,
      duration_max: activity.duration_max,
      tags: activity.tags,
      challengeReason: `Break out of your routine - try something completely new!`,
      challengeScore: 0.95,
      isLocal: activity.region === 'București',
      venues: []
    });
  }

  // Fetch venues for each challenge (if tables exist)
  for (const challenge of challenges) {
    try {
      const { rows: venues } = await pool.query(`
        SELECT v.id as venue_id, v.name, v.city, v.latitude, v.longitude, v.rating
        FROM venues v
        JOIN activity_venues av ON av.venue_id = v.id
        WHERE av.activity_id = $1
        LIMIT 3
      `, [challenge.activityId]);

      challenge.venues = venues.map(v => ({
        venueId: v.venue_id,
        name: v.name,
        city: v.city,
        rating: v.rating
      }));
    } catch (error) {
      // Venues table doesn't exist yet, skip for now
      challenge.venues = [];
    }
  }

  return challenges;
}

/**
 * Determine challenge categories (opposite of user's comfort zone)
 */
function determineChallengeCategories(userPattern: Awaited<ReturnType<typeof analyzeUserPattern>>): string[] {
  const { dominantCategories } = userPattern;

  // Map comfort zones to challenges
  const categoryOpposites: Record<string, string[]> = {
    'creative': ['sports', 'adventure', 'fitness'],
    'learning': ['nature', 'adventure', 'mindfulness'],
    'culture': ['sports', 'fitness', 'water'],
    'culinary': ['adventure', 'sports', 'nature'],
    'wellness': ['sports', 'adventure', 'seasonal'],
    'nightlife': ['nature', 'mindfulness', 'wellness'],
    'nature': ['nightlife', 'creative', 'learning'],
    'sports': ['creative', 'learning', 'culture'],
    'adventure': ['wellness', 'creative', 'culinary'],
    'fitness': ['creative', 'culinary', 'culture']
  };

  // Get opposite categories
  const opposites = new Set<string>();
  for (const category of dominantCategories) {
    const opposite = categoryOpposites[category] || ['adventure', 'nature', 'sports'];
    opposite.forEach(cat => opposites.add(cat));
  }

  // If user is new or no pattern, default to exciting challenges
  if (opposites.size === 0) {
    return ['adventure', 'sports', 'nature'];
  }

  return Array.from(opposites).slice(0, 3);
}

/**
 * Determine challenge energy level (push user to try different intensity)
 */
function determineChallengeEnergy(userPattern: Awaited<ReturnType<typeof analyzeUserPattern>>): string {
  const { dominantEnergy } = userPattern;

  // Push to different energy level
  if (dominantEnergy === 'low') return 'high'; // Push low-energy users to high
  if (dominantEnergy === 'high') return 'medium'; // Give high-energy users something different
  return 'high'; // Default to high energy for challenges
}

/**
 * Generate human-readable challenge reason
 */
function generateChallengeReason(category: string, userPattern: any, isLocal: boolean): string {
  const reasons: Record<string, string> = {
    'sports': `Time to get active! You usually enjoy ${userPattern.dominantCategories[0]}, but sports will energize you differently.`,
    'adventure': `Break out of your routine with some adrenaline! Perfect for pushing your boundaries.`,
    'creative': `Balance your usual activities with some creative expression.`,
    'nature': `Reconnect with nature - a refreshing change from your usual ${userPattern.dominantCategories[0]} activities.`,
    'fitness': `Challenge your body! A great complement to your ${userPattern.dominantCategories[0]} interests.`,
    'wellness': `Take care of yourself with something calming and restorative.`,
    'culinary': `Explore new flavors and cooking techniques - a tasty adventure!`,
    'water': `Make a splash with water activities - something completely different!`,
    'nightlife': `Experience București's vibrant nightlife scene!`,
    'mindfulness': `Find your zen with a mindful, centering experience.`,
  };

  const baseReason = reasons[category] || `Try something new - ${category} activities await!`;
  const locationNote = isLocal ? 'Right here in your city!' : 'Worth the trip!';

  return `${baseReason} ${locationNote}`;
}

export default router;
