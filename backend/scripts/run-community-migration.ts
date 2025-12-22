/**
 * Run Community Features Migration
 * Modified to work with existing users table (device_id as TEXT)
 */

import { Pool } from 'pg';
import * as dotenv from 'dotenv';
import * as path from 'path';
import * as fs from 'fs';

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env') });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://localhost/vibe_app',
});

async function runMigration() {
  const client = await pool.connect();
  
  try {
    console.log('🚀 Starting Community Features migration...\n');

    // Start transaction
    await client.query('BEGIN');

    // 1. COMMUNITY POSTS
    console.log('📝 Creating community_posts table...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS community_posts (
        id SERIAL PRIMARY KEY,
        user_id TEXT NOT NULL,
        activity_id INTEGER REFERENCES activities(id) ON DELETE SET NULL,
        
        -- Post metadata
        post_type VARCHAR(50) NOT NULL CHECK (post_type IN ('completion', 'challenge', 'vibe_check', 'review')),
        content TEXT,
        photo_url TEXT,
        
        -- Vibe context
        vibe_before VARCHAR(100),
        vibe_after VARCHAR(100),
        energy_level VARCHAR(20) CHECK (energy_level IN ('low', 'medium', 'high')),
        
        -- Location
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
    `);

    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_community_posts_user_id ON community_posts(user_id);
      CREATE INDEX IF NOT EXISTS idx_community_posts_activity_id ON community_posts(activity_id);
      CREATE INDEX IF NOT EXISTS idx_community_posts_created_at ON community_posts(created_at DESC);
      CREATE INDEX IF NOT EXISTS idx_community_posts_post_type ON community_posts(post_type);
      CREATE INDEX IF NOT EXISTS idx_community_posts_moderation ON community_posts(is_flagged, is_hidden);
    `);
    console.log('✅ community_posts created\n');

    // 2. POST LIKES
    console.log('❤️  Creating post_likes table...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS post_likes (
        id SERIAL PRIMARY KEY,
        post_id INTEGER NOT NULL REFERENCES community_posts(id) ON DELETE CASCADE,
        user_id TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT NOW(),
        
        UNIQUE(post_id, user_id)
      );
    `);

    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_post_likes_post_id ON post_likes(post_id);
      CREATE INDEX IF NOT EXISTS idx_post_likes_user_id ON post_likes(user_id);
    `);
    console.log('✅ post_likes created\n');

    // 3. POST COMMENTS
    console.log('💬 Creating post_comments table...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS post_comments (
        id SERIAL PRIMARY KEY,
        post_id INTEGER NOT NULL REFERENCES community_posts(id) ON DELETE CASCADE,
        user_id TEXT NOT NULL,
        content TEXT NOT NULL,
        
        -- Moderation
        is_flagged BOOLEAN DEFAULT FALSE,
        is_hidden BOOLEAN DEFAULT FALSE,
        
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `);

    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_post_comments_post_id ON post_comments(post_id);
      CREATE INDEX IF NOT EXISTS idx_post_comments_user_id ON post_comments(user_id);
      CREATE INDEX IF NOT EXISTS idx_post_comments_created_at ON post_comments(created_at DESC);
    `);
    console.log('✅ post_comments created\n');

    // 4. ACTIVITY REVIEWS
    console.log('⭐ Creating activity_reviews table...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS activity_reviews (
        id SERIAL PRIMARY KEY,
        user_id TEXT NOT NULL,
        activity_id INTEGER NOT NULL REFERENCES activities(id) ON DELETE CASCADE,
        
        -- Review content
        rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
        review_text TEXT CHECK (char_length(review_text) <= 280),
        photo_url TEXT,
        
        -- Vibe tags
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
        
        UNIQUE(user_id, activity_id)
      );
    `);

    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_activity_reviews_activity_id ON activity_reviews(activity_id);
      CREATE INDEX IF NOT EXISTS idx_activity_reviews_user_id ON activity_reviews(user_id);
      CREATE INDEX IF NOT EXISTS idx_activity_reviews_rating ON activity_reviews(rating);
      CREATE INDEX IF NOT EXISTS idx_activity_reviews_created_at ON activity_reviews(created_at DESC);
    `);
    console.log('✅ activity_reviews created\n');

    // 5. CHALLENGE COMPLETIONS
    console.log('🏆 Creating challenge_completions table...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS challenge_completions (
        id SERIAL PRIMARY KEY,
        user_id TEXT NOT NULL,
        activity_id INTEGER NOT NULL REFERENCES activities(id) ON DELETE CASCADE,
        
        -- Challenge context
        difficulty_level DECIMAL(3, 1) DEFAULT 1.0,
        points_earned INTEGER DEFAULT 100,
        
        -- Completion proof
        photo_url TEXT,
        completion_notes TEXT,
        
        completed_at TIMESTAMP DEFAULT NOW(),
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);

    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_challenge_completions_user_id ON challenge_completions(user_id);
      CREATE INDEX IF NOT EXISTS idx_challenge_completions_completed_at ON challenge_completions(completed_at DESC);
    `);
    console.log('✅ challenge_completions created\n');

    // 6. CONTENT REPORTS
    console.log('🚩 Creating content_reports table...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS content_reports (
        id SERIAL PRIMARY KEY,
        reporter_user_id TEXT NOT NULL,
        
        -- What's being reported
        content_type VARCHAR(50) NOT NULL CHECK (content_type IN ('post', 'comment', 'review')),
        content_id INTEGER NOT NULL,
        
        -- Report details
        reason VARCHAR(100) NOT NULL CHECK (reason IN ('spam', 'inappropriate', 'harassment', 'false_info', 'other')),
        description TEXT,
        
        -- Admin action
        status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'action_taken', 'dismissed')),
        admin_notes TEXT,
        reviewed_by TEXT,
        reviewed_at TIMESTAMP,
        
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);

    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_content_reports_status ON content_reports(status);
      CREATE INDEX IF NOT EXISTS idx_content_reports_content ON content_reports(content_type, content_id);
      CREATE INDEX IF NOT EXISTS idx_content_reports_created_at ON content_reports(created_at DESC);
    `);
    console.log('✅ content_reports created\n');

    // 7. BETA WAITLIST
    console.log('📋 Creating beta_waitlist table...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS beta_waitlist (
        id SERIAL PRIMARY KEY,
        user_id TEXT,
        email VARCHAR(255) NOT NULL,
        
        -- Waitlist status
        status VARCHAR(50) DEFAULT 'waiting' CHECK (status IN ('waiting', 'invited', 'accepted')),
        invite_code VARCHAR(50) UNIQUE,
        
        -- Metadata
        signup_source VARCHAR(100),
        referral_code VARCHAR(50),
        
        invited_at TIMESTAMP,
        accepted_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT NOW(),
        
        UNIQUE(email)
      );
    `);

    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_beta_waitlist_status ON beta_waitlist(status);
      CREATE INDEX IF NOT EXISTS idx_beta_waitlist_invite_code ON beta_waitlist(invite_code);
    `);
    console.log('✅ beta_waitlist created\n');

    // 8. PUSH NOTIFICATION TOKENS
    console.log('🔔 Creating push_notification_tokens table...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS push_notification_tokens (
        id SERIAL PRIMARY KEY,
        user_id TEXT NOT NULL,
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
    `);

    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_push_tokens_user_id ON push_notification_tokens(user_id);
    `);
    console.log('✅ push_notification_tokens created\n');

    // 9. TRIGGERS
    console.log('⚡ Creating triggers...');
    
    // Drop existing triggers if they exist
    await client.query(`DROP TRIGGER IF EXISTS trigger_update_post_likes_count ON post_likes;`);
    await client.query(`DROP TRIGGER IF EXISTS trigger_update_post_comments_count ON post_comments;`);
    await client.query(`DROP FUNCTION IF EXISTS update_post_likes_count();`);
    await client.query(`DROP FUNCTION IF EXISTS update_post_comments_count();`);

    // Likes counter trigger
    await client.query(`
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
    `);

    await client.query(`
      CREATE TRIGGER trigger_update_post_likes_count
      AFTER INSERT OR DELETE ON post_likes
      FOR EACH ROW EXECUTE FUNCTION update_post_likes_count();
    `);

    // Comments counter trigger
    await client.query(`
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
    `);

    await client.query(`
      CREATE TRIGGER trigger_update_post_comments_count
      AFTER INSERT OR DELETE ON post_comments
      FOR EACH ROW EXECUTE FUNCTION update_post_comments_count();
    `);
    console.log('✅ Triggers created\n');

    // 10. LEADERBOARD VIEWS
    console.log('📊 Creating leaderboard views...');
    
    await client.query(`DROP VIEW IF EXISTS weekly_challenge_leaderboard;`);
    await client.query(`DROP VIEW IF EXISTS monthly_challenge_leaderboard;`);
    await client.query(`DROP VIEW IF EXISTS alltime_challenge_leaderboard;`);

    await client.query(`
      CREATE VIEW weekly_challenge_leaderboard AS
      SELECT 
        cc.user_id,
        COUNT(cc.id) as challenges_completed,
        SUM(cc.points_earned) as total_points,
        AVG(cc.difficulty_level) as avg_difficulty
      FROM challenge_completions cc
      WHERE cc.completed_at >= NOW() - INTERVAL '7 days'
      GROUP BY cc.user_id
      ORDER BY total_points DESC, challenges_completed DESC
      LIMIT 100;
    `);

    await client.query(`
      CREATE VIEW monthly_challenge_leaderboard AS
      SELECT 
        cc.user_id,
        COUNT(cc.id) as challenges_completed,
        SUM(cc.points_earned) as total_points,
        AVG(cc.difficulty_level) as avg_difficulty
      FROM challenge_completions cc
      WHERE cc.completed_at >= NOW() - INTERVAL '30 days'
      GROUP BY cc.user_id
      ORDER BY total_points DESC, challenges_completed DESC
      LIMIT 100;
    `);

    await client.query(`
      CREATE VIEW alltime_challenge_leaderboard AS
      SELECT 
        cc.user_id,
        COUNT(cc.id) as challenges_completed,
        SUM(cc.points_earned) as total_points,
        AVG(cc.difficulty_level) as avg_difficulty
      FROM challenge_completions cc
      GROUP BY cc.user_id
      ORDER BY total_points DESC, challenges_completed DESC
      LIMIT 100;
    `);
    console.log('✅ Leaderboard views created\n');

    // Commit transaction
    await client.query('COMMIT');

    console.log('✨ Migration completed successfully!\n');
    console.log('📊 Tables created:');
    console.log('   - community_posts');
    console.log('   - post_likes');
    console.log('   - post_comments');
    console.log('   - activity_reviews');
    console.log('   - challenge_completions');
    console.log('   - content_reports');
    console.log('   - beta_waitlist');
    console.log('   - push_notification_tokens');
    console.log('\n🎯 Next step: Run seed script');
    console.log('   npx tsx backend/scripts/seed-community-data.ts\n');

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Migration failed:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

// Run the migration
runMigration().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
