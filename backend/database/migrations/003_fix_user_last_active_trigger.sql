-- Migration: Fix user last_active trigger
-- The messages table doesn't have user_id, need to join through conversations
-- Version: 003
-- Date: 2025-01-21

-- Drop existing broken trigger
DROP TRIGGER IF EXISTS update_last_active_on_message ON messages;

-- Create corrected function that gets user_id from conversation
CREATE OR REPLACE FUNCTION update_user_last_active_from_message()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE users 
    SET last_active_at = NOW() 
    WHERE id = (
      SELECT user_id 
      FROM conversations 
      WHERE id = NEW.conversation_id
    );
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Recreate trigger with correct function
CREATE TRIGGER update_last_active_on_message AFTER INSERT ON messages
    FOR EACH ROW EXECUTE FUNCTION update_user_last_active_from_message();

COMMENT ON FUNCTION update_user_last_active_from_message IS 'Updates user last_active when they send a message (joins through conversations table)';
