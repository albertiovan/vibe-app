-- Training Feedback Tables
-- Stores human feedback on vibe → activity recommendations
-- This data will be used to improve the system prompts and activity mappings

-- Training sessions (each vibe input)
CREATE TABLE IF NOT EXISTS training_sessions (
    id SERIAL PRIMARY KEY,
    vibe TEXT NOT NULL,
    vibe_analysis JSONB, -- Stores the AI's interpretation (mood, energy, context)
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Training feedback (thumbs up/down for each activity)
CREATE TABLE IF NOT EXISTS training_feedback (
    id SERIAL PRIMARY KEY,
    session_id INTEGER REFERENCES training_sessions(id) ON DELETE CASCADE,
    activity_id INTEGER REFERENCES activities(id) ON DELETE CASCADE,
    activity_name TEXT NOT NULL,
    bucket TEXT,
    region TEXT,
    energy_level TEXT,
    indoor_outdoor TEXT,
    feedback TEXT CHECK (feedback IN ('up', 'down')), -- thumbs up or down
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_training_sessions_vibe ON training_sessions(vibe);
CREATE INDEX IF NOT EXISTS idx_training_sessions_created_at ON training_sessions(created_at);
CREATE INDEX IF NOT EXISTS idx_training_feedback_session ON training_feedback(session_id);
CREATE INDEX IF NOT EXISTS idx_training_feedback_activity ON training_feedback(activity_id);
CREATE INDEX IF NOT EXISTS idx_training_feedback_feedback ON training_feedback(feedback);
CREATE INDEX IF NOT EXISTS idx_training_feedback_bucket ON training_feedback(bucket);

-- Comment
COMMENT ON TABLE training_sessions IS 'Stores training sessions where user inputs vibes for testing';
COMMENT ON TABLE training_feedback IS 'Stores thumbs up/down feedback for activity recommendations';
COMMENT ON COLUMN training_feedback.feedback IS 'Either "up" (good match) or "down" (bad match)';
