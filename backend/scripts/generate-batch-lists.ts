/**
 * Generate Activity Lists for All Batches
 * 
 * This script generates formatted activity lists for ChatGPT prompts.
 * It creates separate files for each batch of 50 activities.
 * 
 * USAGE:
 * npx tsx backend/scripts/generate-batch-lists.ts
 * 
 * OUTPUT:
 * Creates files in backend/data/batch-lists/:
 * - batch-1-activities.txt (Activities 1-50)
 * - batch-2-activities.txt (Activities 51-100)
 * - etc.
 */

import { Pool } from 'pg';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

// Load environment variables from backend/.env
dotenv.config({ path: path.join(__dirname, '../.env') });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://localhost/vibe_app'
});

const BATCH_SIZE = 50;

async function generateBatchLists() {
  try {
    // Get total count
    const countResult = await pool.query('SELECT COUNT(*) as total FROM activities');
    const totalActivities = parseInt(countResult.rows[0].total);
    const totalBatches = Math.ceil(totalActivities / BATCH_SIZE);

    console.log(`📊 Total Activities: ${totalActivities}`);
    console.log(`📦 Total Batches: ${totalBatches} (${BATCH_SIZE} per batch)\n`);

    // Create output directory
    const outputDir = path.join(__dirname, '../data/batch-lists');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    // Generate each batch
    for (let batchNum = 1; batchNum <= totalBatches; batchNum++) {
      const startId = (batchNum - 1) * BATCH_SIZE + 1;
      const endId = Math.min(batchNum * BATCH_SIZE, totalActivities);

      // Query activities for this batch
      const result = await pool.query(
        `SELECT id, name, city, region, category 
         FROM activities 
         WHERE id >= $1 AND id <= $2 
         ORDER BY id`,
        [startId, endId]
      );

      if (result.rows.length === 0) {
        console.log(`⚠️  Batch ${batchNum}: No activities found (IDs ${startId}-${endId})`);
        continue;
      }

      // Format activity list
      const activityList = result.rows
        .map(row => `${row.id}. ${row.name} - ${row.city}, ${row.region} - ${row.category}`)
        .join('\n');

      // Create batch file
      const fileName = `batch-${batchNum}-activities.txt`;
      const filePath = path.join(outputDir, fileName);
      
      const fileContent = `# BATCH ${batchNum}: Activities ${startId}-${endId}
# Total: ${result.rows.length} activities

${activityList}
`;

      fs.writeFileSync(filePath, fileContent, 'utf-8');
      console.log(`✅ Batch ${batchNum}: ${result.rows.length} activities → ${fileName}`);
    }

    console.log(`\n✨ Generated ${totalBatches} batch files in: ${outputDir}`);
    console.log('\n📋 Next Steps:');
    console.log('1. Open CHATGPT_IMAGE_SOURCING_BATCH_PROMPT.md');
    console.log('2. Replace the activity list with content from batch-X-activities.txt');
    console.log('3. Paste the modified prompt into ChatGPT');
    console.log('4. Save ChatGPT\'s JSON response to backend/data/activity-images-batch-X.json');
    console.log('5. Run: npx tsx backend/scripts/import-activity-images.ts batch-X\n');

  } catch (error) {
    console.error('❌ Error generating batch lists:', error);
    throw error;
  } finally {
    await pool.end();
  }
}

generateBatchLists();
