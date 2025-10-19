/**
 * Venue-Specific Micro-Blurbs Service
 * 
 * Generates unique, factual blurbs for venues using Claude + heuristic fallbacks.
 * Strict non-hallucination policy: only use provided Google Places data.
 */

import { rateLimitedLLM } from './rateLimitedProvider.js';

export interface VenueBlurbFields {
  name: string;
  types: string[];
  editorial_summary?: string;
  rating?: number;
  user_ratings_total?: number;
  bucket: string;
  keywords?: string[];
  vicinity?: string;
  price_level?: number;
}

export interface BlurbResult {
  blurb: string;
  method: 'claude' | 'heuristic' | 'fallback';
  confidence: number;
  cached?: boolean;
}

// Simple in-memory cache for blurbs (in production, use Redis)
const blurbCache = new Map<string, { blurb: string; timestamp: number; method: string }>();
const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours

/**
 * Generate venue-specific micro-blurb (≤22 words)
 */
export async function generateVenueBlurb(
  fields: VenueBlurbFields,
  options: {
    maxWords?: number;
    language?: string;
    modelVersion?: string;
  } = {}
): Promise<BlurbResult> {
  const maxWords = options.maxWords || 22;
  const language = options.language || 'en';
  const modelVersion = options.modelVersion || 'v1';
  
  // Generate cache key
  const cacheKey = `${fields.name}_${fields.bucket}_${language}_${modelVersion}`;
  
  // Check cache first
  const cached = blurbCache.get(cacheKey);
  if (cached && (Date.now() - cached.timestamp) < CACHE_TTL) {
    console.log('📝 Blurb cache hit:', fields.name);
    return {
      blurb: cached.blurb,
      method: cached.method as any,
      confidence: 0.9,
      cached: true
    };
  }

  console.log('📝 Generating blurb for:', fields.name, `(${fields.bucket})`);

  try {
    // Try Claude first
    const claudeResult = await generateClaudeBlurb(fields, maxWords, language);
    
    if (claudeResult.blurb && claudeResult.blurb.length > 0) {
      // Cache successful result
      blurbCache.set(cacheKey, {
        blurb: claudeResult.blurb,
        timestamp: Date.now(),
        method: 'claude'
      });
      
      return claudeResult;
    }
  } catch (error) {
    console.warn('📝 Claude blurb failed for:', fields.name, error);
  }

  // Fallback to heuristic
  const heuristicBlurb = generateHeuristicBlurb(fields, maxWords);
  
  // Cache heuristic result
  blurbCache.set(cacheKey, {
    blurb: heuristicBlurb,
    timestamp: Date.now(),
    method: 'heuristic'
  });

  return {
    blurb: heuristicBlurb,
    method: 'heuristic',
    confidence: 0.7
  };
}

/**
 * Generate blurb using Claude with strict non-hallucination prompt
 */
async function generateClaudeBlurb(
  fields: VenueBlurbFields,
  maxWords: number,
  language: string
): Promise<BlurbResult> {
  const systemPrompt = buildSystemPrompt(maxWords, language);
  const userPrompt = buildUserPrompt(fields);

  console.log('🤖 Claude blurb request:', {
    name: fields.name,
    bucket: fields.bucket,
    types: fields.types.slice(0, 3),
    maxWords
  });

  const response = await rateLimitedLLM.completeJSON({
    system: systemPrompt,
    user: userPrompt,
    schema: {
      type: 'object',
      properties: {
        blurb: { type: 'string' }
      },
      required: ['blurb']
    },
    maxTokens: 100 // Keep it short
  });

  if (!response.ok) {
    throw new Error(`Claude blurb failed: ${response.error}`);
  }

  const blurb = response.data.blurb;
  
  // Validate word count
  const wordCount = blurb.split(/\s+/).length;
  if (wordCount > maxWords) {
    console.warn(`📝 Blurb too long (${wordCount} words), truncating:`, blurb);
    const truncated = blurb.split(/\s+/).slice(0, maxWords).join(' ') + '...';
    return { blurb: truncated, method: 'claude', confidence: 0.8 };
  }

  console.log('✅ Claude blurb success:', blurb);
  return { blurb, method: 'claude', confidence: 0.95 };
}

/**
 * Build system prompt for Claude
 */
function buildSystemPrompt(maxWords: number, language: string): string {
  return `You are generating micro-blurbs for venue cards in a travel app.

CRITICAL RULES:
1. Describe the main ACTIVITY the user does at this venue in ≤${maxWords} words
2. Use ONLY the provided fields (name, types, editorial_summary, rating)
3. DO NOT invent facts, add adjectives, or hallucinate details not in the data
4. Focus on WHAT YOU DO there, not marketing language
5. Be specific and actionable
6. Language: ${language}

OUTPUT FORMAT: Return only JSON: {"blurb":"..."}

EXAMPLES:
Museum → "Explore themed exhibits and historical artifacts"
Climbing gym → "Boulder on routes for all skill levels"  
Zoo → "See exotic animals and local wildlife"
Restaurant → "Enjoy [cuisine type] dishes and local specialties"
Park → "Walk scenic trails and enjoy nature"`;
}

/**
 * Build user prompt with venue data
 */
function buildUserPrompt(fields: VenueBlurbFields): string {
  const data = {
    name: fields.name,
    types: fields.types,
    editorial_summary: fields.editorial_summary || null,
    rating: fields.rating || null,
    user_ratings_total: fields.user_ratings_total || null,
    bucket: fields.bucket,
    keywords: fields.keywords || []
  };

  return `Generate a micro-blurb for this venue:

${JSON.stringify(data, null, 2)}

Remember: Describe what the user DOES at this venue using only the provided data. No hallucinations.`;
}

/**
 * Generate heuristic blurb based on bucket and types
 */
function generateHeuristicBlurb(fields: VenueBlurbFields, maxWords: number): string {
  const { bucket, types, name } = fields;
  
  // Bucket-based templates
  const bucketTemplates: Record<string, string[]> = {
    adventure: [
      'Experience thrilling activities and challenges',
      'Get your adrenaline pumping with exciting adventures',
      'Try exciting outdoor and indoor activities'
    ],
    nature: [
      'Explore natural landscapes and wildlife',
      'Walk scenic trails and enjoy fresh air',
      'Connect with nature and outdoor beauty'
    ],
    culture: [
      'Explore exhibits and cultural heritage',
      'Discover history and artistic collections',
      'Learn about local culture and traditions'
    ],
    wellness: [
      'Relax and rejuvenate your mind and body',
      'Enjoy spa treatments and wellness services',
      'Unwind with therapeutic activities'
    ],
    social: [
      'Meet people and enjoy social activities',
      'Connect with others in a friendly atmosphere',
      'Socialize and make new connections'
    ],
    fitness: [
      'Work out and stay active',
      'Train with modern equipment and facilities',
      'Maintain your fitness goals'
    ],
    entertainment: [
      'Enjoy fun activities and entertainment',
      'Have a great time with friends and family',
      'Experience exciting entertainment options'
    ],
    nightlife: [
      'Enjoy drinks and nightlife atmosphere',
      'Dance and socialize in the evening',
      'Experience vibrant nighttime entertainment'
    ]
  };

  // Type-specific overrides
  const typeTemplates: Record<string, string> = {
    museum: 'Explore themed exhibits and artifacts',
    zoo: 'See exotic animals and local wildlife',
    aquarium: 'Discover marine life and underwater worlds',
    amusement_park: 'Enjoy rides and family entertainment',
    gym: 'Work out with modern fitness equipment',
    spa: 'Relax with spa treatments and wellness services',
    restaurant: 'Enjoy delicious meals and local cuisine',
    cafe: 'Sip coffee and enjoy light refreshments',
    bar: 'Enjoy drinks in a social atmosphere',
    night_club: 'Dance and enjoy nightlife entertainment',
    movie_theater: 'Watch the latest films and entertainment',
    bowling_alley: 'Bowl with friends and family',
    park: 'Walk trails and enjoy outdoor activities',
    shopping_mall: 'Shop and browse various stores',
    library: 'Read, study, and access resources',
    church: 'Attend services and spiritual activities'
  };

  // Check for specific type matches first
  for (const type of types) {
    if (typeTemplates[type]) {
      return typeTemplates[type];
    }
  }

  // Use bucket template
  const templates = bucketTemplates[bucket] || bucketTemplates.entertainment || [];
  const template = templates[Math.floor(Math.random() * templates.length)];
  
  return template || 'Discover something new and exciting';
}

/**
 * Batch generate blurbs for multiple venues
 */
export async function generateVenueBlurbsBatch(
  venues: VenueBlurbFields[],
  options: {
    maxWords?: number;
    language?: string;
    concurrency?: number;
  } = {}
): Promise<Map<string, BlurbResult>> {
  const concurrency = options.concurrency || 3;
  const results = new Map<string, BlurbResult>();
  
  console.log('📝 Batch generating blurbs for', venues.length, 'venues');

  // Process in batches to avoid overwhelming Claude
  for (let i = 0; i < venues.length; i += concurrency) {
    const batch = venues.slice(i, i + concurrency);
    
    const batchPromises = batch.map(async (venue) => {
      try {
        const result = await generateVenueBlurb(venue, options);
        return { venue, result };
      } catch (error) {
        console.warn('📝 Batch blurb failed for:', venue.name, error);
        return {
          venue,
          result: {
            blurb: generateHeuristicBlurb(venue, options.maxWords || 22),
            method: 'fallback' as const,
            confidence: 0.5
          }
        };
      }
    });

    const batchResults = await Promise.allSettled(batchPromises);
    
    batchResults.forEach((result) => {
      if (result.status === 'fulfilled') {
        const key = `${result.value.venue.name}_${result.value.venue.bucket}`;
        results.set(key, result.value.result);
      }
    });

    // Small delay between batches to be nice to Claude
    if (i + concurrency < venues.length) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }

  console.log('✅ Batch blurb generation complete:', results.size, 'results');
  return results;
}

/**
 * Clear blurb cache (for testing)
 */
export function clearBlurbCache(): void {
  blurbCache.clear();
  console.log('🗑️  Blurb cache cleared');
}
