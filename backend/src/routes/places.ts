/**
 * Places API Routes
 * Photo proxy and place-related endpoints
 */

import { Router, Request, Response } from 'express';
import { query, validationResult } from 'express-validator';

const router = Router();

// In-memory cache for photo URLs (TTL 1 day)
interface PhotoCacheEntry {
  url: string;
  timestamp: number;
}

const photoCache = new Map<string, PhotoCacheEntry>();
const CACHE_TTL = 24 * 60 * 60 * 1000; // 1 day in milliseconds
const PHOTOS_MAX_WIDTH = parseInt(process.env.PHOTOS_MAX_WIDTH || '800', 10);

/**
 * GET /api/places/photo
 * Proxy for Google Places Photo API to avoid CORS and hide API key
 */
router.get('/photo', [
  query('ref').isString().isLength({ min: 1 }).withMessage('Photo reference required'),
  query('maxwidth').optional().isInt({ min: 100, max: 1600 }).withMessage('Invalid maxwidth')
], async (req: Request, res: Response): Promise<void> => {
  try {
    // Validate input
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors.array()
      });
      return;
    }

    const { ref, maxwidth } = req.query;
    const photoRef = ref as string;
    const width = parseInt(maxwidth as string || PHOTOS_MAX_WIDTH.toString(), 10);
    
    console.log('📸 Photo proxy request:', {
      ref: photoRef.slice(0, 20) + '...',
      maxwidth: width
    });

    // Check cache first
    const cacheKey = `${photoRef}_${width}`;
    const cached = photoCache.get(cacheKey);
    
    if (cached && (Date.now() - cached.timestamp) < CACHE_TTL) {
      console.log('📸 Cache hit for photo');
      res.redirect(302, cached.url);
      return;
    }

    // Build Google Places Photo API URL
    const photoUrl = `https://maps.googleapis.com/maps/api/place/photo` +
      `?photoreference=${encodeURIComponent(photoRef)}` +
      `&maxwidth=${width}` +
      `&key=${process.env.GOOGLE_MAPS_API_KEY}`;

    console.log('📸 Fetching from Google Places Photo API');

    // Fetch from Google Places Photo API
    const response = await fetch(photoUrl, {
      method: 'GET',
      redirect: 'manual' // Handle redirects manually
    });

    if (response.status === 302 || response.status === 301) {
      // Google returned a redirect to the actual image
      const imageUrl = response.headers.get('location');
      
      if (imageUrl) {
        console.log('📸 Got redirect to image URL');
        
        // Cache the resolved URL
        photoCache.set(cacheKey, {
          url: imageUrl,
          timestamp: Date.now()
        });

        // Set cache headers and redirect
        res.set({
          'Cache-Control': 'public, max-age=86400', // 1 day
          'Vary': 'Accept-Encoding'
        });
        
        res.redirect(302, imageUrl);
        return;
      }
    }

    if (response.ok) {
      // Direct image response
      const contentType = response.headers.get('content-type') || 'image/jpeg';
      const buffer = await response.arrayBuffer();
      
      console.log('📸 Got direct image response');
      
      res.set({
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=86400', // 1 day
        'Content-Length': buffer.byteLength.toString()
      });
      
      res.send(Buffer.from(buffer));
      return;
    }

    // Handle API errors
    if (response.status === 403) {
      console.warn('📸 Photo API quota exceeded or invalid key');
      res.status(403).json({
        success: false,
        error: 'Photo service unavailable'
      });
      return;
    }

    if (response.status === 400) {
      console.warn('📸 Invalid photo reference');
      res.status(404).json({
        success: false,
        error: 'Photo not found'
      });
      return;
    }

    console.error('📸 Unexpected photo API response:', response.status);
    res.status(500).json({
      success: false,
      error: 'Photo service error'
    });

  } catch (error) {
    console.error('📸 Photo proxy error:', error);
    res.status(500).json({
      success: false,
      error: 'Photo proxy failed',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * GET /api/places/photo/stats
 * Photo cache statistics (for debugging)
 */
router.get('/photo/stats', (req: Request, res: Response) => {
  const now = Date.now();
  const entries = Array.from(photoCache.entries());
  
  const stats = {
    totalCached: entries.length,
    validEntries: entries.filter(([, entry]) => (now - entry.timestamp) < CACHE_TTL).length,
    expiredEntries: entries.filter(([, entry]) => (now - entry.timestamp) >= CACHE_TTL).length,
    cacheSize: JSON.stringify(Object.fromEntries(photoCache)).length,
    maxWidth: PHOTOS_MAX_WIDTH
  };

  res.json({
    success: true,
    data: stats
  });
});

/**
 * POST /api/places/photo/clear-cache
 * Clear photo cache (for debugging)
 */
router.post('/photo/clear-cache', (req: Request, res: Response) => {
  const sizeBefore = photoCache.size;
  photoCache.clear();
  
  res.json({
    success: true,
    message: `Cleared ${sizeBefore} cached photo entries`
  });
});

export default router;
