-- Migration 002: Enhanced Activity/Venue Fields
-- Add new fields to support the improved seed structure

BEGIN;

-- Add slug as unique identifier for activities
ALTER TABLE activities 
  ADD COLUMN IF NOT EXISTS slug TEXT UNIQUE,
  ADD COLUMN IF NOT EXISTS subtypes TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS image_urls TEXT[] DEFAULT '{}';

-- Add enhanced venue fields
ALTER TABLE venues
  ADD COLUMN IF NOT EXISTS blurb TEXT,
  ADD COLUMN IF NOT EXISTS image_urls TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS opening_hours_json JSONB;

-- Update price_tier to use $ notation
-- (We'll handle this in the seed data conversion)

-- Create index on slug for fast lookups
CREATE INDEX IF NOT EXISTS idx_activities_slug ON activities(slug);

-- Create index on subtypes for filtering
CREATE INDEX IF NOT EXISTS idx_activities_subtypes ON activities USING GIN(subtypes);

COMMIT;
