-- Create user_accounts table for community features
-- This is separate from the 'users' table which uses device_id

CREATE TABLE IF NOT EXISTS user_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE,
  nickname TEXT,
  profile_picture TEXT,
  bio TEXT,
  
  -- Link to device-based users table if needed
  device_user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  
  -- Privacy settings
  is_public BOOLEAN DEFAULT TRUE,
  show_location BOOLEAN DEFAULT TRUE,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  last_active_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_user_accounts_email ON user_accounts(email);
CREATE INDEX IF NOT EXISTS idx_user_accounts_nickname ON user_accounts(nickname);
CREATE INDEX IF NOT EXISTS idx_user_accounts_device_user_id ON user_accounts(device_user_id);

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_user_accounts_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER user_accounts_updated_at
  BEFORE UPDATE ON user_accounts
  FOR EACH ROW
  EXECUTE FUNCTION update_user_accounts_updated_at();
