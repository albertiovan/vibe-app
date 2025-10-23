-- Migration: Challenge Me System
-- Create tables for tracking user challenge responses and accepted challenges

-- Table: challenge_responses
-- Tracks user's accept/decline responses to challenges for learning
CREATE TABLE IF NOT EXISTS challenge_responses (
  id SERIAL PRIMARY KEY,
  user_identifier TEXT NOT NULL, -- deviceId or userId
  activity_id INTEGER NOT NULL REFERENCES activities(id),
  response TEXT NOT NULL CHECK (response IN ('accepted', 'declined')),
  challenge_reason TEXT, -- Why this was suggested as a challenge
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_challenge_responses_user ON challenge_responses(user_identifier);
CREATE INDEX IF NOT EXISTS idx_challenge_responses_activity ON challenge_responses(activity_id);
CREATE INDEX IF NOT EXISTS idx_challenge_responses_created ON challenge_responses(created_at);

-- Table: user_challenges
-- Tracks accepted challenges and their completion status
CREATE TABLE IF NOT EXISTS user_challenges (
  id SERIAL PRIMARY KEY,
  user_identifier TEXT NOT NULL,
  activity_id INTEGER NOT NULL REFERENCES activities(id),
  status TEXT NOT NULL CHECK (status IN ('pending', 'completed', 'cancelled')) DEFAULT 'pending',
  accepted_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  notes TEXT, -- User notes about the experience
  UNIQUE(user_identifier, activity_id)
);

CREATE INDEX IF NOT EXISTS idx_user_challenges_user ON user_challenges(user_identifier);
CREATE INDEX IF NOT EXISTS idx_user_challenges_status ON user_challenges(status);
CREATE INDEX IF NOT EXISTS idx_user_challenges_activity ON user_challenges(activity_id);

-- Comments
COMMENT ON TABLE challenge_responses IS 'Stores user responses to challenge suggestions for learning and improving recommendations';
COMMENT ON TABLE user_challenges IS 'Tracks accepted challenges and their completion status';
COMMENT ON COLUMN challenge_responses.challenge_reason IS 'The reason this activity was suggested as a challenge (e.g., "different from your usual cafe visits")';
COMMENT ON COLUMN user_challenges.status IS 'Status: pending (accepted but not done), completed (done!), cancelled (user changed mind)';
