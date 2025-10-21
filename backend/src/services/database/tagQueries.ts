/**
 * Tag-Based Query Helpers
 * 
 * Deterministic prefiltering for tag-first architecture
 */

import { Pool, QueryResult } from 'pg';
import { Tag } from '../../taxonomy/taxonomy.js';

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

export interface TagFilter {
  required?: Tag[];      // Must have ALL of these tags
  any?: Tag[];           // Must have AT LEAST ONE of these tags
  exclude?: Tag[];       // Must NOT have any of these tags
  region?: string;
  city?: string;
  limit?: number;
}

export interface ActivityWithTags {
  id: number;
  slug: string;
  name: string;
  description: string;
  category: string;
  subtypes: string[];
  tags: string[];
  city: string;
  region: string;
  maps_url: string | null;
  duration_min: number | null;
  duration_max: number | null;
  latitude: number | null;
  longitude: number | null;
}

export interface VenueWithTags {
  id: number;
  name: string;
  address: string;
  city: string;
  region: string;
  tags: string[];
  website: string | null;
  maps_url: string | null;
  phone: string | null;
  price_tier: string;
  blurb: string | null;
  rating: number | null;
  latitude: number | null;
  longitude: number | null;
}

/**
 * Search activities by tag criteria (deterministic prefilter)
 */
export async function searchActivitiesByTags(
  filter: TagFilter
): Promise<ActivityWithTags[]> {
  const client = await getPool().connect();
  
  try {
    const conditions: string[] = [];
    const params: any[] = [];
    let paramIndex = 1;

    // Required tags - must have ALL
    if (filter.required && filter.required.length > 0) {
      const requiredTags = filter.required.map(t => `${t.facet}:${t.value}`);
      conditions.push(`a.tags @> $${paramIndex}::text[]`);
      params.push(requiredTags);
      paramIndex++;
    }

    // Any tags - must have AT LEAST ONE
    if (filter.any && filter.any.length > 0) {
      const anyTags = filter.any.map(t => `${t.facet}:${t.value}`);
      conditions.push(`a.tags && $${paramIndex}::text[]`);
      params.push(anyTags);
      paramIndex++;
    }

    // Exclude tags - must NOT have any
    if (filter.exclude && filter.exclude.length > 0) {
      const excludeTags = filter.exclude.map(t => `${t.facet}:${t.value}`);
      conditions.push(`NOT (a.tags && $${paramIndex}::text[])`);
      params.push(excludeTags);
      paramIndex++;
    }

    // Region filter
    if (filter.region) {
      conditions.push(`a.region = $${paramIndex}`);
      params.push(filter.region);
      paramIndex++;
    }

    // City filter
    if (filter.city) {
      conditions.push(`a.city = $${paramIndex}`);
      params.push(filter.city);
      paramIndex++;
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
    const limit = filter.limit || 30;

    const query = `
      SELECT 
        id, slug, name, description, category, subtypes, tags,
        city, region, maps_url, duration_min, duration_max,
        latitude, longitude
      FROM activities a
      ${whereClause}
      ORDER BY id
      LIMIT $${paramIndex}
    `;
    params.push(limit);

    const result = await client.query<ActivityWithTags>(query, params);
    return result.rows;
  } finally {
    client.release();
  }
}

/**
 * Get venues for activities with tag filtering
 */
export async function getVenuesByTags(
  activityId: number,
  filter?: {
    required?: Tag[];
    any?: Tag[];
    city?: string;
    maxPrice?: string; // $, $$, $$$, $$$$
    minRating?: number;
    limit?: number;
  }
): Promise<VenueWithTags[]> {
  const client = await getPool().connect();
  
  try {
    const conditions: string[] = [`v.activity_id = $1`];
    const params: any[] = [activityId];
    let paramIndex = 2;

    if (filter?.required && filter.required.length > 0) {
      const requiredTags = filter.required.map(t => `${t.facet}:${t.value}`);
      conditions.push(`v.tags @> $${paramIndex}::text[]`);
      params.push(requiredTags);
      paramIndex++;
    }

    if (filter?.any && filter.any.length > 0) {
      const anyTags = filter.any.map(t => `${t.facet}:${t.value}`);
      conditions.push(`v.tags && $${paramIndex}::text[]`);
      params.push(anyTags);
      paramIndex++;
    }

    if (filter?.city) {
      conditions.push(`v.city = $${paramIndex}`);
      params.push(filter.city);
      paramIndex++;
    }

    if (filter?.minRating) {
      conditions.push(`v.rating >= $${paramIndex}`);
      params.push(filter.minRating);
      paramIndex++;
    }

    const limit = filter?.limit || 3;

    const query = `
      SELECT 
        id, name, address, city, region, tags, website, maps_url,
        phone, price_tier, blurb, rating, latitude, longitude
      FROM venues v
      WHERE ${conditions.join(' AND ')}
      ORDER BY rating DESC NULLS LAST
      LIMIT $${paramIndex}
    `;
    params.push(limit);

    const result = await client.query<VenueWithTags>(query, params);
    return result.rows;
  } finally {
    client.release();
  }
}

/**
 * Get tag frequency distribution
 */
export async function getTagStats(): Promise<{
  facet: string;
  value: string;
  count: number;
}[]> {
  const client = await getPool().connect();
  
  try {
    const result = await client.query(`
      SELECT facet, value, COUNT(*) as count
      FROM activity_tags
      GROUP BY facet, value
      ORDER BY count DESC, facet, value
    `);
    return result.rows;
  } finally {
    client.release();
  }
}

/**
 * Find similar activities by shared tags
 */
export async function findSimilarActivities(
  activityId: number,
  limit: number = 5
): Promise<ActivityWithTags[]> {
  const client = await getPool().connect();
  
  try {
    const result = await client.query<ActivityWithTags>(`
      WITH target_tags AS (
        SELECT tags FROM activities WHERE id = $1
      ),
      scored AS (
        SELECT 
          a.*,
          (
            SELECT COUNT(*)
            FROM unnest(a.tags) AS tag
            WHERE tag = ANY((SELECT tags FROM target_tags))
          ) AS shared_count
        FROM activities a
        WHERE a.id != $1
      )
      SELECT 
        id, slug, name, description, category, subtypes, tags,
        city, region, maps_url, duration_min, duration_max,
        latitude, longitude
      FROM scored
      WHERE shared_count > 0
      ORDER BY shared_count DESC, id
      LIMIT $2
    `, [activityId, limit]);
    
    return result.rows;
  } finally {
    client.release();
  }
}
