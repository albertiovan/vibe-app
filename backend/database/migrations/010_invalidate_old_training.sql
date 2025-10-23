-- Migration: Invalidate pre-semantic training data
-- Old training used RANDOM selection, making approval rates meaningless
-- New system uses SEMANTIC understanding for accurate matching

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

-- Add comments
COMMENT ON COLUMN training_sessions.semantic_version IS 
  'v1-random: Used random activity selection (invalid); v2-semantic: Uses semantic vibe understanding (valid)';

COMMENT ON COLUMN training_sessions.is_valid IS 
  'False for sessions before semantic fix was implemented';

-- Create view for valid training data only
CREATE OR REPLACE VIEW valid_training_sessions AS
SELECT * FROM training_sessions 
WHERE is_valid = true;

CREATE OR REPLACE VIEW invalid_training_sessions AS
SELECT * FROM training_sessions
WHERE is_valid = false;

-- Summary report
SELECT 
  semantic_version,
  is_valid,
  COUNT(*) as session_count,
  COUNT(DISTINCT ts.id) as unique_sessions,
  COUNT(f.id) as total_feedback_items
FROM training_sessions ts
LEFT JOIN training_feedback f ON f.session_id = ts.id
GROUP BY semantic_version, is_valid
ORDER BY semantic_version;

-- Output instructions
\echo ''
\echo '✅ Migration 010 complete!'
\echo ''
\echo 'Summary:'
\echo '- All pre-semantic sessions marked as INVALID (is_valid=false)'
\echo '- semantic_version set to "v1-random" for old data'
\echo '- New training sessions will automatically use "v2-semantic"'
\echo ''
\echo 'Database Changes:'
\echo '- Added: semantic_version column (tracks system version)'
\echo '- Added: is_valid column (marks data quality)'
\echo '- Created: valid_training_sessions view (filters valid data)'
\echo ''
\echo '⚠️  IMPORTANT: Previous training data (52% approval) is NOT VALID'
\echo '   Random selection made those results meaningless'
\echo ''
\echo 'Next steps:'
\echo '1. Ensure CLAUDE_API_KEY is set in backend/.env'
\echo '2. Restart backend server'
\echo '3. Verify semantic analysis in logs: "🧠 Semantic analysis"'
\echo '4. Open Training Mode and redo 100 sessions'
\echo '5. Compare v1-random (52%) vs v2-semantic (expected 75-85%)'
\echo ''
