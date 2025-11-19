-- Activity Feedback Tables for ML Learning
-- Tracks user accept/deny decisions for personalization

-- Activity Feedback Table
CREATE TABLE IF NOT EXISTS activity_feedback (
  id SERIAL PRIMARY KEY,
  device_id TEXT NOT NULL,
  activity_id INTEGER NOT NULL REFERENCES activities(id) ON DELETE CASCADE,
  action TEXT NOT NULL CHECK (action IN ('accepted', 'denied')),
  user_message TEXT,
  filters JSONB,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Indexes for activity_feedback
CREATE INDEX IF NOT EXISTS idx_activity_feedback_device ON activity_feedback(device_id);
CREATE INDEX IF NOT EXISTS idx_activity_feedback_activity ON activity_feedback(activity_id);
CREATE INDEX IF NOT EXISTS idx_activity_feedback_action ON activity_feedback(action);
CREATE INDEX IF NOT EXISTS idx_activity_feedback_created ON activity_feedback(created_at DESC);

-- User Activities Table (for accepted activities)
CREATE TABLE IF NOT EXISTS user_activities (
  id SERIAL PRIMARY KEY,
  device_id TEXT NOT NULL,
  activity_id INTEGER NOT NULL REFERENCES activities(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'cancelled')),
  accepted_at TIMESTAMP NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMP,
  
  -- Prevent duplicate entries
  UNIQUE(device_id, activity_id)
);

-- Indexes for user_activities
CREATE INDEX IF NOT EXISTS idx_user_activities_device ON user_activities(device_id);
CREATE INDEX IF NOT EXISTS idx_user_activities_status ON user_activities(status);
CREATE INDEX IF NOT EXISTS idx_user_activities_accepted ON user_activities(accepted_at DESC);

-- Comments
COMMENT ON TABLE activity_feedback IS 'Tracks user accept/deny decisions for ML learning and personalization';
COMMENT ON TABLE user_activities IS 'Tracks accepted activities and their completion status';

COMMENT ON COLUMN activity_feedback.action IS 'User action: accepted or denied';
COMMENT ON COLUMN activity_feedback.user_message IS 'Original user query that led to this suggestion';
COMMENT ON COLUMN activity_feedback.filters IS 'Filters applied when activity was suggested';

COMMENT ON COLUMN user_activities.status IS 'Activity status: pending, completed, or cancelled';
COMMENT ON COLUMN user_activities.accepted_at IS 'When user accepted the activity';
COMMENT ON COLUMN user_activities.completed_at IS 'When user marked activity as completed';
