/**
 * Handle Activities with 100% Rejection Rates
 * 
 * Based on training feedback data, this script:
 * 1. Identifies activities with 100% rejection (3+ ratings)
 * 2. Archives or deletes these activities from the database
 * 3. Logs the changes for review
 */

import { Pool } from 'pg';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://localhost/vibe_app',
});

interface RejectedActivity {
  activity_id: number;
  activity_name: string;
  bucket: string;
  total_ratings: number;
  thumbs_down: number;
  rejection_rate: number;
}

async function handleRejectedActivities() {
  try {
    console.log('🔍 Querying activities with 100% rejection rates...\n');

    // Find activities with 100% rejection and at least 3 ratings
    const query = `
      SELECT 
        activity_id,
        activity_name,
        bucket,
        COUNT(*) as total_ratings,
        SUM(CASE WHEN feedback = 'down' THEN 1 ELSE 0 END) as thumbs_down,
        ROUND(AVG(CASE WHEN feedback = 'down' THEN 1.0 ELSE 0.0 END) * 100, 1) as rejection_rate
      FROM training_feedback
      WHERE activity_id IS NOT NULL
      GROUP BY activity_id, activity_name, bucket
      HAVING 
        COUNT(*) >= 3 
        AND SUM(CASE WHEN feedback = 'down' THEN 1 ELSE 0 END) = COUNT(*)
      ORDER BY total_ratings DESC, activity_name
    `;

    const { rows: rejectedActivities } = await pool.query<RejectedActivity>(query);

    if (rejectedActivities.length === 0) {
      console.log('✅ No activities with 100% rejection rate found.');
      return;
    }

    console.log(`Found ${rejectedActivities.length} activities with 100% rejection:\n`);

    for (const activity of rejectedActivities) {
      console.log(`❌ ${activity.activity_name}`);
      console.log(`   Category: ${activity.bucket}`);
      console.log(`   Ratings: ${activity.total_ratings} (all thumbs down)`);
      console.log('');
    }

    console.log('\n📋 RECOMMENDED ACTIONS:\n');

    // Categorize by issue type
    const languageLearning = rejectedActivities.filter(a => 
      a.activity_name.toLowerCase().includes('language') || 
      a.activity_name.toLowerCase().includes('romanian')
    );

    const romance = rejectedActivities.filter(a => 
      a.bucket === 'romance' || 
      a.activity_name.toLowerCase().includes('romantic') ||
      a.activity_name.toLowerCase().includes('couple')
    );

    const escapeRooms = rejectedActivities.filter(a => 
      a.activity_name.toLowerCase().includes('escape room')
    );

    const cafes = rejectedActivities.filter(a => 
      a.activity_name.toLowerCase().includes('café') || 
      a.activity_name.toLowerCase().includes('coffee')
    );

    if (languageLearning.length > 0) {
      console.log('1️⃣ LANGUAGE LEARNING ACTIVITIES (ARCHIVE):');
      console.log('   These are too niche and only useful when explicitly requested.');
      console.log('   Recommendation: Keep in database but add tag "requirement:explicit-request"');
      languageLearning.forEach(a => console.log(`   - ${a.activity_name}`));
      console.log('');
    }

    if (romance.length > 0) {
      console.log('2️⃣ ROMANCE ACTIVITIES (RESTRICT):');
      console.log('   Only show when user explicitly mentions romantic context.');
      console.log('   Recommendation: Add tag "context:date-only" for strict filtering');
      romance.forEach(a => console.log(`   - ${a.activity_name}`));
      console.log('');
    }

    if (escapeRooms.length > 0) {
      console.log('3️⃣ ESCAPE ROOMS (RESTRICT):');
      console.log('   Over-suggested for generic "social" vibes.');
      console.log('   Recommendation: Only show for "puzzle", "challenge", "mystery" vibes');
      escapeRooms.forEach(a => console.log(`   - ${a.activity_name}`));
      console.log('');
    }

    if (cafes.length > 0) {
      console.log('4️⃣ CAFÉ ACTIVITIES (REMOVE):');
      console.log('   Too basic - users can find cafes without app help.');
      console.log('   Recommendation: DELETE these activities');
      cafes.forEach(a => console.log(`   - ${a.activity_name}`));
      console.log('');
    }

    console.log('\n⚙️  EXECUTING CHANGES...\n');

    // Delete café activities (too basic)
    if (cafes.length > 0) {
      for (const activity of cafes) {
        await pool.query(
          'DELETE FROM activities WHERE id = $1',
          [activity.activity_id]
        );
        console.log(`🗑️  Deleted: ${activity.activity_name}`);
      }
    }

    // Update language learning activities - add restrictive tag
    if (languageLearning.length > 0) {
      for (const activity of languageLearning) {
        await pool.query(`
          UPDATE activities 
          SET tags = array_append(tags, 'requirement:explicit-request')
          WHERE id = $1 
            AND NOT ('requirement:explicit-request' = ANY(tags))
        `, [activity.activity_id]);
        console.log(`🏷️  Tagged (explicit-request): ${activity.activity_name}`);
      }
    }

    // Update romance activities - add strict context tag
    if (romance.length > 0) {
      for (const activity of romance) {
        await pool.query(`
          UPDATE activities 
          SET tags = array_append(tags, 'context:date')
          WHERE id = $1 
            AND NOT ('context:date' = ANY(tags))
        `, [activity.activity_id]);
        console.log(`💑 Tagged (context:date): ${activity.activity_name}`);
      }
    }

    // Update escape rooms - add restrictive tags
    if (escapeRooms.length > 0) {
      for (const activity of escapeRooms) {
        await pool.query(`
          UPDATE activities 
          SET tags = ARRAY(
            SELECT DISTINCT unnest(tags || ARRAY['mood:puzzle', 'requirement:group-activity'])
          )
          WHERE id = $1
        `, [activity.activity_id]);
        console.log(`🧩 Tagged (puzzle/group): ${activity.activity_name}`);
      }
    }

    console.log('\n✅ All changes applied successfully!');
    console.log('\n📊 SUMMARY:');
    console.log(`   Deleted: ${cafes.length} café activities`);
    console.log(`   Restricted: ${languageLearning.length + romance.length + escapeRooms.length} activities with special tags`);
    console.log('\n💡 These activities will now only appear for specific, relevant vibes.');

  } catch (error) {
    console.error('❌ Error handling rejected activities:', error);
  } finally {
    await pool.end();
  }
}

// Run the script
handleRejectedActivities();
