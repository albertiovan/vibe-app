/**
 * Fix Leaderboard Views
 * Recreate views to work without user_accounts table
 */

import { Pool } from 'pg';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env') });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://localhost/vibe_app',
});

async function fixLeaderboardViews() {
  const client = await pool.connect();
  
  try {
    console.log('🔧 Fixing leaderboard views...\n');

    // Drop existing views
    console.log('Dropping old views...');
    await client.query(`
      DROP VIEW IF EXISTS weekly_challenge_leaderboard CASCADE;
      DROP VIEW IF EXISTS monthly_challenge_leaderboard CASCADE;
      DROP VIEW IF EXISTS alltime_challenge_leaderboard CASCADE;
    `);
    console.log('✅ Old views dropped\n');

    // Create new views without user_accounts dependency
    console.log('Creating new views...');
    
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
    console.log('✅ weekly_challenge_leaderboard created');

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
    console.log('✅ monthly_challenge_leaderboard created');

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
    console.log('✅ alltime_challenge_leaderboard created');

    console.log('\n✨ Leaderboard views fixed successfully!\n');

  } catch (error) {
    console.error('❌ Error fixing views:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

// Run the fix
fixLeaderboardViews().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
