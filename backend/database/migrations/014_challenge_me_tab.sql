-- Migration: Challenge Me Tab enhancements
-- Adds decline_reason for feedback and challenge history tracking

-- Add decline_reason column to challenge_responses
ALTER TABLE challenge_responses 
ADD COLUMN IF NOT EXISTS decline_reason TEXT;

-- Add index for faster user lookups
CREATE INDEX IF NOT EXISTS idx_challenge_responses_user 
ON challenge_responses(user_identifier, created_at DESC);

-- Create challenge_history view for easy querying
CREATE OR REPLACE VIEW challenge_history AS
SELECT 
  cr.id,
  cr.user_identifier,
  cr.activity_id,
  cr.response,
  cr.challenge_reason,
  cr.decline_reason,
  cr.created_at,
  a.name as activity_name,
  a.category,
  a.energy_level,
  a.hero_image_url,
  a.region,
  a.city
FROM challenge_responses cr
JOIN activities a ON a.id = cr.activity_id
ORDER BY cr.created_at DESC;

COMMENT ON COLUMN challenge_responses.decline_reason IS 'User feedback on why they declined: too_far, not_now, not_for_me';
