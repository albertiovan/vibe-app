import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';

// Zod schemas for input validation
export const recommendationRequestSchema = z.object({
  vibe: z.string()
    .min(1, 'Vibe cannot be empty')
    .max(500, 'Vibe text too long')
    .regex(/^[a-zA-Z0-9\s.,!?'-]+$/, 'Invalid characters in vibe text'),
  location: z.object({
    lat: z.number().min(-90).max(90),
    lng: z.number().min(-180).max(180)
  }).optional(),
  city: z.string()
    .min(1)
    .max(100)
    .regex(/^[a-zA-Z\s-]+$/, 'Invalid city name')
    .optional(),
  maxDistance: z.number()
    .min(1)
    .max(500)
    .optional(),
  priceLevel: z.array(z.enum(['free', 'budget', 'moderate', 'expensive']))
    .optional(),
  categories: z.array(z.enum([
    'outdoor', 'indoor', 'cultural', 'food', 'entertainment',
    'wellness', 'adventure', 'social', 'creative', 'relaxation'
  ])).optional()
});

export const locationSearchSchema = z.object({
  query: z.string()
    .min(1, 'Search query cannot be empty')
    .max(100, 'Search query too long')
    .regex(/^[a-zA-Z0-9\s.,'-]+$/, 'Invalid characters in search query'),
  lat: z.number().min(-90).max(90).optional(),
  lng: z.number().min(-180).max(180).optional(),
  limit: z.number().min(1).max(15).optional().default(10)
});

// Generic validation middleware factory
export function validateRequest<T>(schema: z.ZodSchema<T>, source: 'body' | 'query' | 'params' = 'body') {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      const data = source === 'body' ? req.body : 
                   source === 'query' ? req.query : 
                   req.params;
      
      const result = schema.safeParse(data);
      
      if (!result.success) {
        res.status(400).json({
          error: 'validation_error',
          message: 'Invalid request data',
          details: result.error.errors.map(err => ({
            field: err.path.join('.'),
            message: err.message
          }))
        });
        return;
      }
      
      // Attach validated data to request
      req.validatedData = result.data;
      next();
    } catch (error) {
      res.status(400).json({
        error: 'validation_error',
        message: 'Request validation failed'
      });
    }
  };
}

// Sanitize string inputs to prevent injection
export function sanitizeString(input: string): string {
  return input
    .trim()
    .replace(/[<>\"']/g, '') // Remove potentially dangerous characters
    .substring(0, 500); // Limit length
}

// Sanitize query parameters
export function sanitizeQuery(req: Request, res: Response, next: NextFunction) {
  if (req.query) {
    Object.keys(req.query).forEach(key => {
      if (typeof req.query[key] === 'string') {
        req.query[key] = sanitizeString(req.query[key] as string);
      }
    });
  }
  next();
}

// Extend Express Request type to include validated data
declare global {
  namespace Express {
    interface Request {
      validatedData?: any;
    }
  }
}
