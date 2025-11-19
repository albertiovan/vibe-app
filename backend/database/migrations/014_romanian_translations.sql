-- Migration: Add Romanian translations to activities
-- This adds Romanian language support for all activity data

-- Add Romanian columns to activities table
ALTER TABLE activities
ADD COLUMN IF NOT EXISTS name_ro TEXT,
ADD COLUMN IF NOT EXISTS description_ro TEXT,
ADD COLUMN IF NOT EXISTS tags_ro TEXT[];

-- Add Romanian columns to venues table
ALTER TABLE venues
ADD COLUMN IF NOT EXISTS name_ro TEXT,
ADD COLUMN IF NOT EXISTS description_ro TEXT;

-- Create index for Romanian tags for faster queries
CREATE INDEX IF NOT EXISTS idx_activities_tags_ro ON activities USING GIN(tags_ro);

-- Add comment explaining the bilingual structure
COMMENT ON COLUMN activities.name_ro IS 'Romanian translation of activity name';
COMMENT ON COLUMN activities.description_ro IS 'Romanian translation of activity description';
COMMENT ON COLUMN activities.tags_ro IS 'Romanian translations of faceted tags (e.g., "categorie:creativ", "energie:ridicat")';
COMMENT ON COLUMN venues.name_ro IS 'Romanian translation of venue name';
COMMENT ON COLUMN venues.description_ro IS 'Romanian translation of venue description';
