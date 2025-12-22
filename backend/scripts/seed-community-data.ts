/**
 * Seed Community Data
 * Creates test accounts and sample posts for Community Tab visualization
 */

import { Pool } from 'pg';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env') });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://localhost/vibe_app',
});

// Test user device IDs (matching your users table structure)
const TEST_USERS = [
  {
    id: 'device_alex_test_2024',
    nickname: 'Alex',
    profilePicture: null, // Will show 'A' initial
  },
  {
    id: 'device_maria_test_2024',
    nickname: 'Maria',
    profilePicture: null, // Will show 'M' initial
  },
  {
    id: 'device_david_test_2024',
    nickname: 'David',
    profilePicture: null, // Will show 'D' initial
  },
  {
    id: 'device_sofia_test_2024',
    nickname: 'Sofia',
    profilePicture: null, // Will show 'S' initial
  },
  {
    id: 'device_chris_test_2024',
    nickname: 'Chris',
    profilePicture: null, // Will show 'C' initial
  },
];

// Sample posts with variety
const SAMPLE_POSTS = [
  {
    userId: 'device_alex_test_2024',
    postType: 'completion',
    content: 'Just finished an amazing yoga session at the park! Feeling so centered and peaceful. 🧘‍♂️',
    activityId: 1, // Yoga
    vibeBefore: 'stressed and tense',
    vibeAfter: 'calm and centered',
    locationCity: 'Bucharest',
  },
  {
    userId: 'device_maria_test_2024',
    postType: 'vibe_check',
    content: 'Coffee and good vibes this morning ☕ Ready to take on the day!',
    activityId: null,
    vibeBefore: 'sleepy',
    vibeAfter: 'energized',
    locationCity: 'Bucharest',
  },
  {
    userId: 'device_david_test_2024',
    postType: 'challenge',
    content: 'Completed the mountain biking challenge! The trails in Sinaia are incredible. Highly recommend! 🚵‍♂️',
    activityId: 15, // Mountain biking
    vibeBefore: 'nervous',
    vibeAfter: 'accomplished and thrilled',
    locationCity: 'Sinaia',
  },
  {
    userId: 'device_sofia_test_2024',
    postType: 'completion',
    content: 'Wine tasting at Dealu Mare was absolutely divine! Learned so much about Romanian wines. 🍷',
    activityId: 8, // Wine tasting
    vibeBefore: 'curious',
    vibeAfter: 'sophisticated and happy',
    locationCity: 'Dealu Mare',
  },
  {
    userId: 'device_chris_test_2024',
    postType: 'vibe_check',
    content: 'Rainy day = perfect reading day 📚 Currently lost in a great book at my favorite cafe.',
    activityId: null,
    vibeBefore: 'bored',
    vibeAfter: 'content and cozy',
    locationCity: 'Bucharest',
  },
  {
    userId: 'device_alex_test_2024',
    postType: 'completion',
    content: 'First time rock climbing and I loved it! My arms are sore but it was so worth it. 🧗‍♀️',
    activityId: 14, // Rock climbing
    vibeBefore: 'anxious',
    vibeAfter: 'proud and strong',
    locationCity: 'Bucharest',
  },
  {
    userId: 'device_maria_test_2024',
    postType: 'challenge',
    content: 'Sunrise hike to Omu Peak completed! The view was breathtaking. Best decision ever! 🌅',
    activityId: 2, // Hiking
    vibeBefore: 'tired',
    vibeAfter: 'inspired and alive',
    locationCity: 'Bucegi Mountains',
  },
  {
    userId: 'device_david_test_2024',
    postType: 'vibe_check',
    content: 'Sunday market vibes 🥖🧀 Nothing beats fresh produce and local crafts!',
    activityId: null,
    vibeBefore: 'restless',
    vibeAfter: 'satisfied and connected',
    locationCity: 'Bucharest',
  },
  {
    userId: 'device_sofia_test_2024',
    postType: 'completion',
    content: 'Pottery class was so therapeutic! Made my first bowl and it\'s not perfect but it\'s mine 🏺',
    activityId: 20, // Pottery workshop
    vibeBefore: 'stressed',
    vibeAfter: 'creative and relaxed',
    locationCity: 'Bucharest',
  },
  {
    userId: 'device_chris_test_2024',
    postType: 'challenge',
    content: 'Conquered my fear and went paragliding! The adrenaline rush was insane! 🪂',
    activityId: 13, // Paragliding
    vibeBefore: 'terrified',
    vibeAfter: 'fearless and exhilarated',
    locationCity: 'Brașov',
  },
  {
    userId: 'device_alex_test_2024',
    postType: 'vibe_check',
    content: 'Late night coding session with lo-fi beats 🎧💻 In the zone!',
    activityId: null,
    vibeBefore: 'unfocused',
    vibeAfter: 'productive and focused',
    locationCity: 'Bucharest',
  },
  {
    userId: 'device_maria_test_2024',
    postType: 'completion',
    content: 'Spa day at Therme was exactly what I needed. Feeling refreshed and renewed! 🧖‍♀️',
    activityId: 4, // Spa/wellness
    vibeBefore: 'exhausted',
    vibeAfter: 'rejuvenated and peaceful',
    locationCity: 'Bucharest',
  },
  {
    userId: 'device_david_test_2024',
    postType: 'completion',
    content: 'Cooking class tonight - learned to make perfect pasta from scratch! 🍝',
    activityId: 7, // Cooking class
    vibeBefore: 'hungry and curious',
    vibeAfter: 'accomplished and full',
    locationCity: 'Bucharest',
  },
  {
    userId: 'device_sofia_test_2024',
    postType: 'vibe_check',
    content: 'Gallery hopping in the old town. So much incredible art! 🎨',
    activityId: null,
    vibeBefore: 'uninspired',
    vibeAfter: 'inspired and thoughtful',
    locationCity: 'Bucharest',
  },
  {
    userId: 'device_chris_test_2024',
    postType: 'completion',
    content: 'Escape room with friends - we escaped with 2 minutes to spare! 🔐',
    activityId: 18, // Escape room
    vibeBefore: 'bored',
    vibeAfter: 'excited and accomplished',
    locationCity: 'Bucharest',
  },
];

// Sample likes (create realistic engagement)
const SAMPLE_LIKES = [
  // Post 1 (Alex's yoga) - 5 likes
  { postIndex: 0, userIds: ['device_maria_test_2024', 'device_sofia_test_2024', 'device_chris_test_2024', 'device_david_test_2024'] },
  // Post 2 (Maria's coffee) - 3 likes
  { postIndex: 1, userIds: ['device_alex_test_2024', 'device_david_test_2024', 'device_chris_test_2024'] },
  // Post 3 (David's biking) - 8 likes
  { postIndex: 2, userIds: ['device_alex_test_2024', 'device_maria_test_2024', 'device_sofia_test_2024', 'device_chris_test_2024'] },
  // Post 4 (Sofia's wine) - 6 likes
  { postIndex: 3, userIds: ['device_alex_test_2024', 'device_maria_test_2024', 'device_david_test_2024', 'device_chris_test_2024'] },
  // Post 5 (Chris's reading) - 2 likes
  { postIndex: 4, userIds: ['device_alex_test_2024', 'device_sofia_test_2024'] },
  // Post 6 (Alex's climbing) - 7 likes
  { postIndex: 5, userIds: ['device_maria_test_2024', 'device_david_test_2024', 'device_sofia_test_2024', 'device_chris_test_2024'] },
  // Post 7 (Maria's sunrise) - 12 likes
  { postIndex: 6, userIds: ['device_alex_test_2024', 'device_david_test_2024', 'device_sofia_test_2024', 'device_chris_test_2024'] },
  // Post 8 (David's market) - 4 likes
  { postIndex: 7, userIds: ['device_maria_test_2024', 'device_sofia_test_2024', 'device_chris_test_2024'] },
  // Post 9 (Sofia's pottery) - 5 likes
  { postIndex: 8, userIds: ['device_alex_test_2024', 'device_maria_test_2024', 'device_david_test_2024'] },
  // Post 10 (Chris's paragliding) - 10 likes
  { postIndex: 9, userIds: ['device_alex_test_2024', 'device_maria_test_2024', 'device_david_test_2024', 'device_sofia_test_2024'] },
];

// Sample comments
const SAMPLE_COMMENTS = [
  { postIndex: 0, userId: 'device_maria_test_2024', content: 'This looks amazing! Which park did you go to?' },
  { postIndex: 0, userId: 'device_sofia_test_2024', content: 'I need to try this! 🧘‍♀️' },
  { postIndex: 2, userId: 'device_alex_test_2024', content: 'Wow! How difficult was the trail?' },
  { postIndex: 2, userId: 'device_maria_test_2024', content: 'Adding this to my bucket list! 🚵‍♀️' },
  { postIndex: 3, userId: 'device_chris_test_2024', content: 'Which winery did you visit?' },
  { postIndex: 6, userId: 'device_david_test_2024', content: 'That sunrise must have been incredible!' },
  { postIndex: 6, userId: 'device_sofia_test_2024', content: 'Goals! 🌄' },
  { postIndex: 9, userId: 'device_maria_test_2024', content: 'You\'re so brave! I want to try this!' },
  { postIndex: 9, userId: 'device_alex_test_2024', content: 'This is on my list for next month! 🪂' },
];

// Challenge completions for leaderboard
const CHALLENGE_COMPLETIONS = [
  { userId: 'device_david_test_2024', activityId: 15, difficulty: 2.5, points: 250 },
  { userId: 'device_david_test_2024', activityId: 7, difficulty: 1.0, points: 100 },
  { userId: 'device_maria_test_2024', activityId: 2, difficulty: 2.0, points: 200 },
  { userId: 'device_maria_test_2024', activityId: 4, difficulty: 0.5, points: 50 },
  { userId: 'device_chris_test_2024', activityId: 13, difficulty: 3.0, points: 300 },
  { userId: 'device_chris_test_2024', activityId: 18, difficulty: 1.5, points: 150 },
  { userId: 'device_alex_test_2024', activityId: 14, difficulty: 2.0, points: 200 },
  { userId: 'device_alex_test_2024', activityId: 1, difficulty: 0.5, points: 50 },
  { userId: 'device_sofia_test_2024', activityId: 8, difficulty: 1.0, points: 100 },
  { userId: 'device_sofia_test_2024', activityId: 20, difficulty: 1.0, points: 100 },
];

async function seedCommunityData() {
  const client = await pool.connect();
  
  try {
    console.log('🌱 Starting community data seeding...\n');

    // Start transaction
    await client.query('BEGIN');

    // 1. Create posts
    console.log('📝 Creating sample posts...');
    const postIds: number[] = [];
    
    for (const post of SAMPLE_POSTS) {
      const result = await client.query(
        `INSERT INTO community_posts 
         (user_id, post_type, content, activity_id, vibe_before, vibe_after, location_city, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, NOW() - INTERVAL '${Math.floor(Math.random() * 7)} days' - INTERVAL '${Math.floor(Math.random() * 24)} hours')
         RETURNING id`,
        [post.userId, post.postType, post.content, post.activityId, post.vibeBefore, post.vibeAfter, post.locationCity]
      );
      postIds.push(result.rows[0].id);
    }
    console.log(`✅ Created ${postIds.length} posts\n`);

    // 2. Add likes
    console.log('❤️  Adding likes...');
    let totalLikes = 0;
    
    for (const likeGroup of SAMPLE_LIKES) {
      const postId = postIds[likeGroup.postIndex];
      for (const userId of likeGroup.userIds) {
        await client.query(
          `INSERT INTO post_likes (post_id, user_id, created_at)
           VALUES ($1, $2, NOW() - INTERVAL '${Math.floor(Math.random() * 5)} days')`,
          [postId, userId]
        );
        totalLikes++;
      }
    }
    console.log(`✅ Added ${totalLikes} likes\n`);

    // 3. Add comments
    console.log('💬 Adding comments...');
    
    for (const comment of SAMPLE_COMMENTS) {
      const postId = postIds[comment.postIndex];
      await client.query(
        `INSERT INTO post_comments (post_id, user_id, content, created_at)
         VALUES ($1, $2, $3, NOW() - INTERVAL '${Math.floor(Math.random() * 4)} days')`,
        [postId, comment.userId, comment.content]
      );
    }
    console.log(`✅ Added ${SAMPLE_COMMENTS.length} comments\n`);

    // 4. Add challenge completions
    console.log('🏆 Adding challenge completions...');
    
    for (const completion of CHALLENGE_COMPLETIONS) {
      await client.query(
        `INSERT INTO challenge_completions (user_id, activity_id, difficulty_level, points_earned, completed_at)
         VALUES ($1, $2, $3, $4, NOW() - INTERVAL '${Math.floor(Math.random() * 30)} days')`,
        [completion.userId, completion.activityId, completion.difficulty, completion.points]
      );
    }
    console.log(`✅ Added ${CHALLENGE_COMPLETIONS.length} challenge completions\n`);

    // Commit transaction
    await client.query('COMMIT');

    // 5. Show summary statistics
    console.log('📊 Summary Statistics:\n');
    
    const stats = await client.query(`
      SELECT 
        (SELECT COUNT(*) FROM community_posts) as total_posts,
        (SELECT COUNT(*) FROM post_likes) as total_likes,
        (SELECT COUNT(*) FROM post_comments) as total_comments,
        (SELECT COUNT(*) FROM challenge_completions) as total_challenges
    `);
    
    console.log(`   Posts:      ${stats.rows[0].total_posts}`);
    console.log(`   Likes:      ${stats.rows[0].total_likes}`);
    console.log(`   Comments:   ${stats.rows[0].total_comments}`);
    console.log(`   Challenges: ${stats.rows[0].total_challenges}`);
    
    console.log('\n📱 Test User Accounts:\n');
    TEST_USERS.forEach(user => {
      console.log(`   ${user.nickname} (${user.id})`);
    });

    console.log('\n✨ Community data seeding complete!\n');
    console.log('🎯 Next steps:');
    console.log('   1. Start the backend: cd backend && npm run dev');
    console.log('   2. Start the app: npm start');
    console.log('   3. Navigate to Community tab (👥)');
    console.log('   4. See the populated feed with posts, likes, and comments!\n');

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Error seeding community data:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

// Run the seeding
seedCommunityData().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
