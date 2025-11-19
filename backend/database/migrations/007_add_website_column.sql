-- Add website column to activities table

ALTER TABLE activities ADD COLUMN IF NOT EXISTS website TEXT;

-- Add index for website lookups
CREATE INDEX IF NOT EXISTS idx_activities_website ON activities(website) WHERE website IS NOT NULL;

-- Add comment
COMMENT ON COLUMN activities.website IS 'Official website URL for the activity or venue';
