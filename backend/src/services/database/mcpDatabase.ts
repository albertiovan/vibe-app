/**
 * MCP Database Service
 * 
 * Provides database query functionality for the MCP-based architecture.
 * This service is used by Claude Haiku to query the curated activities and venues dataset.
 */

import { Pool, QueryResult } from 'pg';

export interface Activity {
  id: number;
  name: string;
  description: string | null;
  category: string;
  seasonality: string[];
  indoor_outdoor: string;
  energy_level: string;
  duration_min: number | null;
  duration_max: number | null;
  tags: string[];
  hero_image_url: string | null;
  youtube_video_ids: string[];
  city: string | null;
  region: string;
  latitude: number | null;
  longitude: number | null;
  created_at: Date;
}

export interface Venue {
  id: number;
  activity_id: number;
  name: string;
  address: string | null;
  city: string | null;
  region: string;
  latitude: number | null;
  longitude: number | null;
  price_tier: string | null;
  booking_url: string | null;
  seasonality: string[];
  tags: string[];
  phone: string | null;
  website: string | null;
  rating: number | null;
  rating_count: number | null;
  created_at: Date;
}

export interface ActivityWithVenues extends Activity {
  venues: Venue[];
}

/**
 * Database connection pool
 */
let pool: Pool | null = null;

function getPool(): Pool {
  if (!pool) {
    pool = new Pool({
      connectionString: process.env.DATABASE_URL || 'postgresql://localhost/vibe_app',
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
    });
  }
  return pool;
}

/**
 * Execute a read-only SQL query
 */
export async function executeQuery<T extends Record<string, any> = any>(
  query: string,
  params: any[] = []
): Promise<QueryResult<T>> {
  const client = await getPool().connect();
  try {
    // Ensure query is read-only by wrapping in a READ ONLY transaction
    await client.query('BEGIN READ ONLY');
    const result = await client.query<T>(query, params);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

/**
 * Search activities by filters
 */
export async function searchActivities(filters: {
  category?: string;
  region?: string;
  city?: string;
  indoorOutdoor?: 'indoor' | 'outdoor' | 'both';
  energyLevel?: 'low' | 'medium' | 'high' | 'very-high';
  seasonality?: string;
  durationMax?: number; // in minutes
  tags?: string[];
  limit?: number;
}): Promise<Activity[]> {
  const conditions: string[] = [];
  const params: any[] = [];
  let paramIndex = 1;

  if (filters.category) {
    conditions.push(`category = $${paramIndex++}`);
    params.push(filters.category);
  }

  if (filters.region) {
    conditions.push(`region = $${paramIndex++}`);
    params.push(filters.region);
  }

  if (filters.city) {
    conditions.push(`city = $${paramIndex++}`);
    params.push(filters.city);
  }

  if (filters.indoorOutdoor && filters.indoorOutdoor !== 'both') {
    conditions.push(`(indoor_outdoor = $${paramIndex} OR indoor_outdoor = 'both')`);
    params.push(filters.indoorOutdoor);
    paramIndex++;
  }

  if (filters.energyLevel) {
    conditions.push(`energy_level = $${paramIndex++}`);
    params.push(filters.energyLevel);
  }

  if (filters.seasonality) {
    conditions.push(`$${paramIndex} = ANY(seasonality)`);
    params.push(filters.seasonality);
    paramIndex++;
  }

  if (filters.durationMax) {
    conditions.push(`(duration_max IS NULL OR duration_max <= $${paramIndex++})`);
    params.push(filters.durationMax);
  }

  if (filters.tags && filters.tags.length > 0) {
    conditions.push(`tags && $${paramIndex++}::text[]`);
    params.push(filters.tags);
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
  const limit = filters.limit || 10;

  const query = `
    SELECT * FROM activities
    ${whereClause}
    ORDER BY id
    LIMIT $${paramIndex}
  `;
  params.push(limit);

  const result = await executeQuery<Activity>(query, params);
  return result.rows;
}

/**
 * Get venues for a specific activity
 */
export async function getVenuesForActivity(
  activityId: number,
  filters?: {
    city?: string;
    region?: string;
    priceTier?: string;
    minRating?: number;
    limit?: number;
  }
): Promise<Venue[]> {
  const conditions: string[] = [`activity_id = $1`];
  const params: any[] = [activityId];
  let paramIndex = 2;

  if (filters?.city) {
    conditions.push(`city = $${paramIndex++}`);
    params.push(filters.city);
  }

  if (filters?.region) {
    conditions.push(`region = $${paramIndex++}`);
    params.push(filters.region);
  }

  if (filters?.priceTier) {
    conditions.push(`price_tier = $${paramIndex++}`);
    params.push(filters.priceTier);
  }

  if (filters?.minRating) {
    conditions.push(`rating >= $${paramIndex++}`);
    params.push(filters.minRating);
  }

  const limit = filters?.limit || 3;

  const query = `
    SELECT * FROM venues
    WHERE ${conditions.join(' AND ')}
    ORDER BY rating DESC NULLS LAST, rating_count DESC NULLS LAST
    LIMIT $${paramIndex}
  `;
  params.push(limit);

  const result = await executeQuery<Venue>(query, params);
  return result.rows;
}

/**
 * Get activities with their venues
 */
export async function getActivitiesWithVenues(
  activityFilters: Parameters<typeof searchActivities>[0],
  venueFilters?: Parameters<typeof getVenuesForActivity>[1]
): Promise<ActivityWithVenues[]> {
  const activities = await searchActivities(activityFilters);
  
  const activitiesWithVenues = await Promise.all(
    activities.map(async (activity) => {
      const venues = await getVenuesForActivity(activity.id, venueFilters);
      return {
        ...activity,
        venues
      };
    })
  );

  return activitiesWithVenues;
}

/**
 * Get activity by ID
 */
export async function getActivityById(id: number): Promise<Activity | null> {
  const query = 'SELECT * FROM activities WHERE id = $1';
  const result = await executeQuery<Activity>(query, [id]);
  return result.rows[0] || null;
}

/**
 * Search activities by keyword (tags or name)
 */
export async function searchByKeyword(keyword: string, limit: number = 5): Promise<Activity[]> {
  const query = `
    SELECT * FROM activities
    WHERE 
      name ILIKE $1 OR
      description ILIKE $1 OR
      $2 = ANY(tags)
    LIMIT $3
  `;
  const result = await executeQuery<Activity>(query, [`%${keyword}%`, keyword.toLowerCase(), limit]);
  return result.rows;
}

/**
 * Get database statistics
 */
export async function getDatabaseStats(): Promise<{
  totalActivities: number;
  totalVenues: number;
  categoryCounts: { category: string; count: number }[];
  regionCounts: { region: string; count: number }[];
}> {
  const [activitiesResult, venuesResult, categoriesResult, regionsResult] = await Promise.all([
    executeQuery('SELECT COUNT(*) as count FROM activities'),
    executeQuery('SELECT COUNT(*) as count FROM venues'),
    executeQuery('SELECT category, COUNT(*) as count FROM activities GROUP BY category ORDER BY count DESC'),
    executeQuery('SELECT region, COUNT(*) as count FROM venues GROUP BY region ORDER BY count DESC')
  ]);

  return {
    totalActivities: parseInt(activitiesResult.rows[0].count),
    totalVenues: parseInt(venuesResult.rows[0].count),
    categoryCounts: categoriesResult.rows,
    regionCounts: regionsResult.rows
  };
}

/**
 * Close database connection pool
 */
export async function closeDatabase(): Promise<void> {
  if (pool) {
    await pool.end();
    pool = null;
  }
}
