-- Migration: Invalidate pre-semantic training data
-- Run: psql $DATABASE_URL -f backend/database/migrations/010_invalidate_old_training.sql

-- Add semantic version tracking
ALTER TABLE training_sessions 
ADD COLUMN IF NOT EXISTS semantic_version TEXT DEFAULT 'v2-semantic';

ALTER TABLE training_sessions
ADD COLUMN IF NOT EXISTS is_valid BOOLEAN DEFAULT true;

-- Mark all existing sessions as invalid (they used random selection)
UPDATE training_sessions 
SET 
  is_valid = false, 
  semantic_version = 'v1-random',
  notes = COALESCE(notes || ' | ', '') || 'PRE-SEMANTIC-FIX: Random selection system. Approval rates not representative.'
WHERE created_at < NOW()
  AND (semantic_version IS NULL OR semantic_version = 'v2-semantic');

-- Add comment
COMMENT ON COLUMN training_sessions.semantic_version IS 
  'v1-random: Used random activity selection (invalid); v2-semantic: Uses semantic vibe understanding (valid)';

COMMENT ON COLUMN training_sessions.is_valid IS 
  'False for sessions before semantic fix was implemented';

-- Create view for valid training data only
CREATE OR REPLACE VIEW valid_training_sessions AS
SELECT * FROM training_sessions 
WHERE is_valid = true;

-- Summary
SELECT 
  semantic_version,
  is_valid,
  COUNT(*) as session_count,
  AVG(CASE WHEN f.rating = 'good' THEN 1.0 ELSE 0.0 END) as avg_approval_rate
FROM training_sessions ts
LEFT JOIN training_feedback f ON f.session_id = ts.id
GROUP BY semantic_version, is_valid
ORDER BY semantic_version;

-- Output instructions
\echo ''
\echo '✅ Migration complete!'
\echo ''
\echo 'Summary:'
\echo '- All pre-semantic sessions marked as invalid (is_valid=false)'
\echo '- semantic_version set to v1-random for old data'
\echo '- New training sessions will use v2-semantic'
\echo ''
\echo 'Next steps:'
\echo '1. Restart backend server to use new semantic system'
\echo '2. Open Training Mode in app'
\echo '3. Complete 100 new training sessions'
\echo '4. Compare v1-random vs v2-semantic approval rates'
\echo ''
