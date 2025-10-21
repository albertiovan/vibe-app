-- Migration: User preferences, saved activities, and conversation history
-- Version: 002
-- Date: 2025-01-21

-- Create users table (simplified - expand with auth later)
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  device_id TEXT UNIQUE NOT NULL, -- For now, identify by device
  created_at TIMESTAMP DEFAULT NOW(),
  last_active_at TIMESTAMP DEFAULT NOW(),
  preferences JSONB DEFAULT '{}'::jsonb, -- Store user preferences as JSON
  location_lat DOUBLE PRECISION,
  location_lng DOUBLE PRECISION,
  location_city TEXT,
  CONSTRAINT valid_device_id CHECK (device_id != '')
);

-- Create saved activities table
CREATE TABLE IF NOT EXISTS saved_activities (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  activity_id INT NOT NULL REFERENCES activities(id) ON DELETE CASCADE,
  saved_at TIMESTAMP DEFAULT NOW(),
  notes TEXT,
  status TEXT CHECK (status IN ('saved', 'completed', 'canceled')) DEFAULT 'saved',
  UNIQUE(user_id, activity_id) -- Prevent duplicate saves
);

-- Create conversation history table
CREATE TABLE IF NOT EXISTS conversations (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  title TEXT, -- Auto-generated from first message
  context JSONB DEFAULT '{}'::jsonb, -- Store location, weather, time context
  vibe_state TEXT -- 'calm', 'excited', 'romantic', 'adventurous'
);

-- Create messages table
CREATE TABLE IF NOT EXISTS messages (
  id SERIAL PRIMARY KEY,
  conversation_id INT NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  metadata JSONB DEFAULT '{}'::jsonb, -- Store recommendations, cards, etc.
  created_at TIMESTAMP DEFAULT NOW(),
  CONSTRAINT valid_role CHECK (role IN ('user', 'assistant'))
);

-- Create activity interactions table (for learning preferences)
CREATE TABLE IF NOT EXISTS activity_interactions (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  activity_id INT NOT NULL REFERENCES activities(id) ON DELETE CASCADE,
  interaction_type TEXT CHECK (interaction_type IN ('viewed', 'liked', 'booked', 'shared', 'dismissed')),
  created_at TIMESTAMP DEFAULT NOW(),
  context JSONB DEFAULT '{}'::jsonb -- Store why they interacted (from which vibe, etc.)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_users_device_id ON users(device_id);
CREATE INDEX IF NOT EXISTS idx_users_last_active ON users(last_active_at DESC);

CREATE INDEX IF NOT EXISTS idx_saved_activities_user_id ON saved_activities(user_id);
CREATE INDEX IF NOT EXISTS idx_saved_activities_activity_id ON saved_activities(activity_id);
CREATE INDEX IF NOT EXISTS idx_saved_activities_status ON saved_activities(status);
CREATE INDEX IF NOT EXISTS idx_saved_activities_saved_at ON saved_activities(saved_at DESC);

CREATE INDEX IF NOT EXISTS idx_conversations_user_id ON conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_conversations_updated_at ON conversations(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_conversations_vibe_state ON conversations(vibe_state);

CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at);

CREATE INDEX IF NOT EXISTS idx_activity_interactions_user_id ON activity_interactions(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_interactions_activity_id ON activity_interactions(activity_id);
CREATE INDEX IF NOT EXISTS idx_activity_interactions_type ON activity_interactions(interaction_type);
CREATE INDEX IF NOT EXISTS idx_activity_interactions_created_at ON activity_interactions(created_at DESC);

-- Create updated_at trigger for conversations
CREATE TRIGGER update_conversations_updated_at BEFORE UPDATE ON conversations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create trigger to update user last_active
CREATE OR REPLACE FUNCTION update_user_last_active()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE users SET last_active_at = NOW() WHERE id = NEW.user_id;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_last_active_on_message AFTER INSERT ON messages
    FOR EACH ROW EXECUTE FUNCTION update_user_last_active();

CREATE TRIGGER update_last_active_on_interaction AFTER INSERT ON activity_interactions
    FOR EACH ROW EXECUTE FUNCTION update_user_last_active();

-- Add comments for documentation
COMMENT ON TABLE users IS 'User profiles and preferences';
COMMENT ON TABLE saved_activities IS 'User-saved activities for later';
COMMENT ON TABLE conversations IS 'Chat conversation sessions';
COMMENT ON TABLE messages IS 'Individual messages within conversations';
COMMENT ON TABLE activity_interactions IS 'User interactions with activities for learning preferences';

COMMENT ON COLUMN users.device_id IS 'Unique device identifier (pre-auth)';
COMMENT ON COLUMN users.preferences IS 'JSON object storing user preferences, favorite categories, etc.';
COMMENT ON COLUMN conversations.vibe_state IS 'Detected emotional state: calm, excited, romantic, adventurous';
COMMENT ON COLUMN messages.metadata IS 'JSON object storing activity cards, recommendations, etc.';
