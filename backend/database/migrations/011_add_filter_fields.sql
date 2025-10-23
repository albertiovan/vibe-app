-- Migration: Add comprehensive filter fields
-- Date: 2025-10-23
-- Purpose: Support distance, duration, and niche filtering

-- Add new filter columns to activities table
ALTER TABLE activities 
  ADD COLUMN IF NOT EXISTS crowd_size TEXT CHECK (crowd_size IN ('intimate', 'small', 'medium', 'large', 'massive')),
  ADD COLUMN IF NOT EXISTS crowd_type TEXT CHECK (crowd_type IN ('locals', 'mixed', 'tourists', 'expats', 'international')),
  ADD COLUMN IF NOT EXISTS group_suitability TEXT CHECK (group_suitability IN ('solo-only', 'solo-friendly', 'couples', 'small-group', 'large-group', 'any')),
  ADD COLUMN IF NOT EXISTS price_tier TEXT CHECK (price_tier IN ('free', 'budget', 'moderate', 'premium', 'luxury'));

-- Add indices for filtering performance
CREATE INDEX IF NOT EXISTS idx_activities_duration ON activities(duration_min, duration_max);
CREATE INDEX IF NOT EXISTS idx_activities_location ON activities(latitude, longitude) WHERE latitude IS NOT NULL AND longitude IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_activities_crowd_size ON activities(crowd_size);
CREATE INDEX IF NOT EXISTS idx_activities_group_suitability ON activities(group_suitability);
CREATE INDEX IF NOT EXISTS idx_activities_price_tier ON activities(price_tier);

-- Add spatial index for distance queries (PostGIS extension not required, using simple lat/lon)
-- For accurate distance calculations, we'll use the Haversine formula in the application layer

-- Update venues table with similar fields
ALTER TABLE venues
  ADD COLUMN IF NOT EXISTS crowd_size TEXT CHECK (crowd_size IN ('intimate', 'small', 'medium', 'large', 'massive')),
  ADD COLUMN IF NOT EXISTS crowd_type TEXT CHECK (crowd_type IN ('locals', 'mixed', 'tourists', 'expats', 'international')),
  ADD COLUMN IF NOT EXISTS latitude DOUBLE PRECISION,
  ADD COLUMN IF NOT EXISTS longitude DOUBLE PRECISION;

-- Create index for venue location
CREATE INDEX IF NOT EXISTS idx_venues_location ON venues(latitude, longitude) WHERE latitude IS NOT NULL AND longitude IS NOT NULL;

-- Add comments for documentation
COMMENT ON COLUMN activities.crowd_size IS 'Expected crowd size: intimate (2-10), small (10-30), medium (30-100), large (100-500), massive (500+)';
COMMENT ON COLUMN activities.crowd_type IS 'Typical crowd composition: locals (90%+ Romanian), mixed (50-90% local), tourists (50%+ tourists), expats, international';
COMMENT ON COLUMN activities.group_suitability IS 'Best suited for: solo-only, solo-friendly, couples, small-group (3-6), large-group (7+), any';
COMMENT ON COLUMN activities.price_tier IS 'Cost level: free (0 RON), budget (<50 RON), moderate (50-200 RON), premium (200-500 RON), luxury (500+ RON)';

-- Sample data updates for existing activities (can be expanded)
-- Update some common patterns based on activity type

-- Nightlife typically has larger crowds and mixed/tourist crowds
UPDATE activities 
SET 
  crowd_size = 'large',
  crowd_type = 'mixed',
  group_suitability = 'any',
  price_tier = 'moderate'
WHERE category = 'nightlife' AND crowd_size IS NULL;

-- Wellness activities typically intimate and solo-friendly
UPDATE activities 
SET 
  crowd_size = 'intimate',
  crowd_type = 'locals',
  group_suitability = 'solo-friendly',
  price_tier = 'premium'
WHERE category = 'wellness' AND crowd_size IS NULL;

-- Creative workshops typically small groups
UPDATE activities 
SET 
  crowd_size = 'small',
  crowd_type = 'locals',
  group_suitability = 'small-group',
  price_tier = 'moderate'
WHERE category = 'creative' AND crowd_size IS NULL;

-- Sports activities typically medium crowds
UPDATE activities 
SET 
  crowd_size = 'medium',
  crowd_type = 'locals',
  group_suitability = 'any',
  price_tier = 'budget'
WHERE category IN ('sports', 'fitness') AND crowd_size IS NULL;

-- Nature activities solo-friendly
UPDATE activities 
SET 
  crowd_size = 'small',
  crowd_type = 'mixed',
  group_suitability = 'solo-friendly',
  price_tier = 'free'
WHERE category = 'nature' AND crowd_size IS NULL;

-- Culinary activities
UPDATE activities 
SET 
  crowd_size = 'medium',
  crowd_type = 'mixed',
  group_suitability = 'any',
  price_tier = 'moderate'
WHERE category = 'culinary' AND crowd_size IS NULL;

-- Set default values for activities without specific values
UPDATE activities 
SET 
  crowd_size = COALESCE(crowd_size, 'medium'),
  crowd_type = COALESCE(crowd_type, 'mixed'),
  group_suitability = COALESCE(group_suitability, 'any'),
  price_tier = COALESCE(price_tier, 'moderate')
WHERE crowd_size IS NULL OR crowd_type IS NULL OR group_suitability IS NULL OR price_tier IS NULL;
