-- Community Features Migration
-- Vibe Stories Feed, Activity Reviews, Challenge Leaderboard, Admin Tools

-- ============================================
-- 1. COMMUNITY POSTS (Vibe Stories Feed)
-- ============================================
CREATE TABLE community_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES user_accounts(id) ON DELETE CASCADE,
  activity_id INTEGER REFERENCES activities(id) ON DELETE SET NULL,
  
  -- Post metadata
  post_type VARCHAR(50) NOT NULL CHECK (post_type IN ('completion', 'challenge', 'vibe_check', 'review')),
  content TEXT,
  photo_url TEXT, -- User uploaded photo URL
  
  -- Vibe context
  vibe_before VARCHAR(100),
  vibe_after VARCHAR(100),
  energy_level VARCHAR(20) CHECK (energy_level IN ('low', 'medium', 'high')),
  
  -- Location (approximate for privacy)
  location_city VARCHAR(100),
  location_lat DECIMAL(10, 8),
  location_lng DECIMAL(11, 8),
  
  -- Engagement metrics
  likes_count INTEGER DEFAULT 0,
  comments_count INTEGER DEFAULT 0,
  
  -- Moderation
  is_flagged BOOLEAN DEFAULT FALSE,
  is_hidden BOOLEAN DEFAULT FALSE,
  moderation_notes TEXT,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_community_posts_user_id ON community_posts(user_id);
CREATE INDEX idx_community_posts_activity_id ON community_posts(activity_id);
CREATE INDEX idx_community_posts_created_at ON community_posts(created_at DESC);
CREATE INDEX idx_community_posts_post_type ON community_posts(post_type);
CREATE INDEX idx_community_posts_moderation ON community_posts(is_flagged, is_hidden);

-- ============================================
-- 2. POST LIKES
-- ============================================
CREATE TABLE post_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES community_posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES user_accounts(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT NOW(),
  
  UNIQUE(post_id, user_id)
);

CREATE INDEX idx_post_likes_post_id ON post_likes(post_id);
CREATE INDEX idx_post_likes_user_id ON post_likes(user_id);

-- ============================================
-- 3. POST COMMENTS
-- ============================================
CREATE TABLE post_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES community_posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES user_accounts(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  
  -- Moderation
  is_flagged BOOLEAN DEFAULT FALSE,
  is_hidden BOOLEAN DEFAULT FALSE,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_post_comments_post_id ON post_comments(post_id);
CREATE INDEX idx_post_comments_user_id ON post_comments(user_id);
CREATE INDEX idx_post_comments_created_at ON post_comments(created_at DESC);

-- ============================================
-- 4. ACTIVITY REVIEWS & RATINGS
-- ============================================
CREATE TABLE activity_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES user_accounts(id) ON DELETE CASCADE,
  activity_id INTEGER NOT NULL REFERENCES activities(id) ON DELETE CASCADE,
  
  -- Review content
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review_text TEXT CHECK (char_length(review_text) <= 280), -- Twitter-style limit
  photo_url TEXT,
  
  -- Vibe tags (stored as JSON array)
  vibe_tags JSONB DEFAULT '[]'::jsonb,
  
  -- Recommendation context
  recommended_for_energy VARCHAR(20) CHECK (recommended_for_energy IN ('low', 'medium', 'high')),
  
  -- Engagement
  helpful_count INTEGER DEFAULT 0,
  
  -- Moderation
  is_flagged BOOLEAN DEFAULT FALSE,
  is_hidden BOOLEAN DEFAULT FALSE,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  UNIQUE(user_id, activity_id) -- One review per user per activity
);

CREATE INDEX idx_activity_reviews_activity_id ON activity_reviews(activity_id);
CREATE INDEX idx_activity_reviews_user_id ON activity_reviews(user_id);
CREATE INDEX idx_activity_reviews_rating ON activity_reviews(rating);
CREATE INDEX idx_activity_reviews_created_at ON activity_reviews(created_at DESC);

-- ============================================
-- 5. CHALLENGE LEADERBOARD
-- ============================================
CREATE TABLE challenge_completions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES user_accounts(id) ON DELETE CASCADE,
  activity_id INTEGER NOT NULL REFERENCES activities(id) ON DELETE CASCADE,
  
  -- Challenge context
  original_energy VARCHAR(20), -- User's preferred energy
  challenge_energy VARCHAR(20), -- Activity's energy level
  energy_difference INTEGER, -- Absolute difference (0-2)
  
  -- Completion proof
  photo_url TEXT,
  completion_notes TEXT,
  
  -- Leaderboard metrics
  points INTEGER DEFAULT 1, -- Can be weighted by difficulty
  
  completed_at TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_challenge_completions_user_id ON challenge_completions(user_id);
CREATE INDEX idx_challenge_completions_completed_at ON challenge_completions(completed_at DESC);

-- ============================================
-- 6. CONTENT REPORTS (Admin Moderation)
-- ============================================
CREATE TABLE content_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_user_id UUID NOT NULL REFERENCES user_accounts(id) ON DELETE CASCADE,
  
  -- What's being reported
  content_type VARCHAR(50) NOT NULL CHECK (content_type IN ('post', 'comment', 'review')),
  content_id UUID NOT NULL,
  
  -- Report details
  reason VARCHAR(100) NOT NULL CHECK (reason IN ('spam', 'inappropriate', 'harassment', 'false_info', 'other')),
  description TEXT,
  
  -- Admin action
  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'action_taken', 'dismissed')),
  admin_notes TEXT,
  reviewed_by UUID REFERENCES user_accounts(id),
  reviewed_at TIMESTAMP,
  
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_content_reports_status ON content_reports(status);
CREATE INDEX idx_content_reports_content ON content_reports(content_type, content_id);
CREATE INDEX idx_content_reports_created_at ON content_reports(created_at DESC);

-- ============================================
-- 7. BETA WAITLIST
-- ============================================
CREATE TABLE beta_waitlist (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES user_accounts(id) ON DELETE CASCADE,
  email VARCHAR(255) NOT NULL,
  
  -- Waitlist status
  status VARCHAR(50) DEFAULT 'waiting' CHECK (status IN ('waiting', 'invited', 'accepted')),
  invite_code VARCHAR(50) UNIQUE,
  
  -- Metadata
  signup_source VARCHAR(100), -- Where they heard about it
  referral_code VARCHAR(50), -- If referred by existing user
  
  invited_at TIMESTAMP,
  accepted_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  
  UNIQUE(email)
);

CREATE INDEX idx_beta_waitlist_status ON beta_waitlist(status);
CREATE INDEX idx_beta_waitlist_invite_code ON beta_waitlist(invite_code);

-- ============================================
-- 8. PUSH NOTIFICATION TOKENS
-- ============================================
CREATE TABLE push_notification_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES user_accounts(id) ON DELETE CASCADE,
  token TEXT NOT NULL,
  device_type VARCHAR(20) CHECK (device_type IN ('ios', 'android', 'web')),
  
  -- Preferences
  likes_enabled BOOLEAN DEFAULT TRUE,
  comments_enabled BOOLEAN DEFAULT TRUE,
  challenges_enabled BOOLEAN DEFAULT TRUE,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  UNIQUE(user_id, token)
);

CREATE INDEX idx_push_tokens_user_id ON push_notification_tokens(user_id);

-- ============================================
-- 9. TRIGGERS FOR COUNTER UPDATES
-- ============================================

-- Update likes_count on community_posts
CREATE OR REPLACE FUNCTION update_post_likes_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE community_posts SET likes_count = likes_count + 1 WHERE id = NEW.post_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE community_posts SET likes_count = likes_count - 1 WHERE id = OLD.post_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_post_likes_count
AFTER INSERT OR DELETE ON post_likes
FOR EACH ROW EXECUTE FUNCTION update_post_likes_count();

-- Update comments_count on community_posts
CREATE OR REPLACE FUNCTION update_post_comments_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE community_posts SET comments_count = comments_count + 1 WHERE id = NEW.post_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE community_posts SET comments_count = comments_count - 1 WHERE id = OLD.post_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_post_comments_count
AFTER INSERT OR DELETE ON post_comments
FOR EACH ROW EXECUTE FUNCTION update_post_comments_count();

-- ============================================
-- 10. VIEWS FOR LEADERBOARD
-- ============================================

-- Weekly leaderboard
CREATE OR REPLACE VIEW weekly_challenge_leaderboard AS
SELECT 
  u.id as user_id,
  u.nickname,
  u.profile_picture,
  COUNT(cc.id) as challenges_completed,
  SUM(cc.points) as total_points,
  AVG(cc.energy_difference) as avg_difficulty
FROM user_accounts u
JOIN challenge_completions cc ON u.id = cc.user_id
WHERE cc.completed_at >= NOW() - INTERVAL '7 days'
GROUP BY u.id, u.nickname, u.profile_picture
ORDER BY total_points DESC, challenges_completed DESC
LIMIT 100;

-- Monthly leaderboard
CREATE OR REPLACE VIEW monthly_challenge_leaderboard AS
SELECT 
  u.id as user_id,
  u.nickname,
  u.profile_picture,
  COUNT(cc.id) as challenges_completed,
  SUM(cc.points) as total_points,
  AVG(cc.energy_difference) as avg_difficulty
FROM user_accounts u
JOIN challenge_completions cc ON u.id = cc.user_id
WHERE cc.completed_at >= NOW() - INTERVAL '30 days'
GROUP BY u.id, u.nickname, u.profile_picture
ORDER BY total_points DESC, challenges_completed DESC
LIMIT 100;

-- All-time leaderboard
CREATE OR REPLACE VIEW alltime_challenge_leaderboard AS
SELECT 
  u.id as user_id,
  u.nickname,
  u.profile_picture,
  COUNT(cc.id) as challenges_completed,
  SUM(cc.points) as total_points,
  AVG(cc.energy_difference) as avg_difficulty
FROM user_accounts u
JOIN challenge_completions cc ON u.id = cc.user_id
GROUP BY u.id, u.nickname, u.profile_picture
ORDER BY total_points DESC, challenges_completed DESC
LIMIT 100;

-- ============================================
-- 11. ADMIN ROLES
-- ============================================
ALTER TABLE user_accounts ADD COLUMN IF NOT EXISTS role VARCHAR(20) DEFAULT 'user' CHECK (role IN ('user', 'moderator', 'admin'));
CREATE INDEX IF NOT EXISTS idx_user_accounts_role ON user_accounts(role);

COMMENT ON TABLE community_posts IS 'User-generated posts for Vibe Stories Feed';
COMMENT ON TABLE activity_reviews IS 'User reviews and ratings for activities';
COMMENT ON TABLE challenge_completions IS 'Tracking Challenge Me completions for leaderboard';
COMMENT ON TABLE content_reports IS 'User reports for content moderation';
COMMENT ON TABLE beta_waitlist IS 'Beta invite waitlist management';
