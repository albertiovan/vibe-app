-- Migration: Activity Completion Tracking System
-- Description: Track when users press GO NOW and complete activities
-- Date: 2025-11-23

-- Create activity_instances table
CREATE TABLE IF NOT EXISTS activity_instances (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL,
  activity_id INTEGER NOT NULL REFERENCES activities(id) ON DELETE CASCADE,
  venue_id INTEGER REFERENCES venues(id) ON DELETE SET NULL,
  
  -- Action tracking
  action_type VARCHAR(20) NOT NULL CHECK (action_type IN ('go_now', 'learn_more')),
  action_timestamp TIMESTAMP NOT NULL DEFAULT NOW(),
  
  -- Status tracking
  status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'ongoing', 'completed', 'skipped')),
  
  -- User responses
  user_confirmed BOOLEAN DEFAULT NULL,
  user_rating INTEGER CHECK (user_rating >= 0 AND user_rating <= 10),
  user_review TEXT,
  photo_url TEXT,
  photo_shared BOOLEAN DEFAULT FALSE,
  
  -- Metadata timestamps
  prompted_at TIMESTAMP,
  responded_at TIMESTAMP,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  
  -- Indexes for performance
  CONSTRAINT valid_rating CHECK (user_rating IS NULL OR (user_rating >= 0 AND user_rating <= 10))
);

-- Create indexes for common queries
CREATE INDEX idx_activity_instances_user_status ON activity_instances(user_id, status, action_timestamp DESC);
CREATE INDEX idx_activity_instances_pending ON activity_instances(user_id, status) WHERE status = 'pending';
CREATE INDEX idx_activity_instances_completed ON activity_instances(user_id, status) WHERE status = 'completed';
CREATE INDEX idx_activity_instances_activity ON activity_instances(activity_id);
CREATE INDEX idx_activity_instances_venue ON activity_instances(venue_id) WHERE venue_id IS NOT NULL;

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_activity_instances_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_activity_instances_updated_at
  BEFORE UPDATE ON activity_instances
  FOR EACH ROW
  EXECUTE FUNCTION update_activity_instances_updated_at();

-- Create view for completed activities with details
CREATE OR REPLACE VIEW user_completed_activities AS
SELECT 
  ai.id as instance_id,
  ai.user_id,
  ai.activity_id,
  a.name as activity_name,
  a.category,
  ai.venue_id,
  v.name as venue_name,
  v.address as venue_address,
  v.latitude as venue_latitude,
  v.longitude as venue_longitude,
  ai.user_rating,
  ai.user_review,
  ai.photo_url,
  ai.photo_shared,
  ai.action_timestamp as started_at,
  ai.responded_at as completed_at,
  ai.created_at
FROM activity_instances ai
JOIN activities a ON ai.activity_id = a.id
LEFT JOIN venues v ON ai.venue_id = v.id
WHERE ai.status = 'completed' 
  AND ai.user_confirmed = TRUE
ORDER BY ai.responded_at DESC;

-- Add comment for documentation
COMMENT ON TABLE activity_instances IS 'Tracks user activity completions for history and personalization';
COMMENT ON COLUMN activity_instances.action_type IS 'Type of action: go_now (high intent) or learn_more (low intent)';
COMMENT ON COLUMN activity_instances.status IS 'Current status: pending (not responded), ongoing (in progress), completed (finished), skipped (did not do)';
COMMENT ON COLUMN activity_instances.user_rating IS 'User rating from 0-10 via slider';
COMMENT ON COLUMN activity_instances.photo_url IS 'URL to uploaded photo if user shared one';
COMMENT ON COLUMN activity_instances.photo_shared IS 'Whether user chose to share photo to profile';
