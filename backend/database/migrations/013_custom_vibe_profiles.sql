-- Migration: Custom Vibe Profiles System
-- Allow users to create and save their own vibe profiles for quick access

-- Table: vibe_profiles
-- Stores user-created custom vibe profiles
CREATE TABLE IF NOT EXISTS vibe_profiles (
  id SERIAL PRIMARY KEY,
  user_identifier TEXT NOT NULL, -- deviceId or userId
  name TEXT NOT NULL, -- e.g., "Date Night", "Solo Adventure", "Party Mood"
  emoji TEXT, -- Optional emoji for the profile
  description TEXT, -- Optional user description
  
  -- Profile configuration (stored as JSONB for flexibility)
  filters JSONB NOT NULL DEFAULT '{}', -- All filter preferences
  
  -- Usage tracking
  times_used INTEGER DEFAULT 0,
  last_used_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Constraints
  UNIQUE(user_identifier, name)
);

CREATE INDEX IF NOT EXISTS idx_vibe_profiles_user ON vibe_profiles(user_identifier);
CREATE INDEX IF NOT EXISTS idx_vibe_profiles_last_used ON vibe_profiles(last_used_at);

-- Comments
COMMENT ON TABLE vibe_profiles IS 'User-created custom vibe profiles for quick activity filtering';
COMMENT ON COLUMN vibe_profiles.filters IS 'JSONB containing: energyLevel, indoorOutdoor, duration, distance, groupSize, categories, timeOfDay, budget, mood, whoWith, specificTags';
COMMENT ON COLUMN vibe_profiles.times_used IS 'Track how often each profile is used for sorting/recommendations';

-- Example filters structure:
-- {
--   "energyLevel": "high",
--   "indoorOutdoor": "outdoor",
--   "durationRange": "medium",
--   "maxDistanceKm": 10,
--   "groupSize": "couple",
--   "categories": ["romantic", "culture", "culinary"],
--   "timeOfDay": "evening",
--   "budget": "moderate",
--   "mood": "romantic",
--   "whoWith": "date",
--   "specificTags": ["romantic", "date-friendly", "intimate"]
-- }
