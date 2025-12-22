/**
 * Import Activity Images Script
 * 
 * This script imports image URLs from ChatGPT's JSON output into the database.
 * 
 * USAGE:
 * 1. Get JSON array from ChatGPT (from batch prompt)
 * 2. Save it to a file: backend/data/activity-images-batch-X.json
 * 3. Run: npx tsx backend/scripts/import-activity-images.ts batch-1
 * 
 * The script will:
 * - Validate all image URLs
 * - Update the image_urls array field in the database
 * - Set hero_image_url to the first image if not already set
 * - Log progress and any errors
 */

import { Pool } from 'pg';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

// Load environment variables from backend/.env
dotenv.config({ path: path.join(__dirname, '../.env') });

// Database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://localhost/vibe_app'
});

interface ActivityImage {
  id: number;
  name: string;
  image_urls: string[];
}

/**
 * Validate that a string is a valid image URL
 */
function isValidImageUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    const validExtensions = ['.jpg', '.jpeg', '.png', '.webp'];
    const hasValidExtension = validExtensions.some(ext => 
      parsed.pathname.toLowerCase().endsWith(ext)
    );
    const isHttps = parsed.protocol === 'https:';
    
    return isHttps && hasValidExtension;
  } catch {
    return false;
  }
}

/**
 * Import images for a batch of activities
 */
async function importActivityImages(batchName: string) {
  const filePath = path.join(__dirname, '../data', `activity-images-${batchName}.json`);
  
  // Check if file exists
  if (!fs.existsSync(filePath)) {
    console.error(`❌ File not found: ${filePath}`);
    console.log('\n💡 Expected file format: backend/data/activity-images-batch-1.json');
    console.log('   Create this file with the JSON array from ChatGPT\n');
    process.exit(1);
  }

  // Read and parse JSON
  let activities: ActivityImage[];
  try {
    const fileContent = fs.readFileSync(filePath, 'utf-8');
    activities = JSON.parse(fileContent);
    console.log(`📁 Loaded ${activities.length} activities from ${batchName}\n`);
  } catch (error) {
    console.error(`❌ Error parsing JSON file:`, error);
    process.exit(1);
  }

  // Validate structure
  if (!Array.isArray(activities)) {
    console.error('❌ JSON must be an array of activity objects');
    process.exit(1);
  }

  let successCount = 0;
  let errorCount = 0;
  let skippedCount = 0;

  // Process each activity
  for (const activity of activities) {
    const { id, name, image_urls } = activity;

    // Validate required fields
    if (!id || !name || !Array.isArray(image_urls)) {
      console.error(`❌ Invalid activity structure for ID ${id}: missing id, name, or image_urls`);
      errorCount++;
      continue;
    }

    // Validate image URLs
    const validUrls = image_urls.filter(isValidImageUrl);
    const invalidUrls = image_urls.filter(url => !isValidImageUrl(url));

    if (invalidUrls.length > 0) {
      console.warn(`⚠️  Activity ${id} (${name}): ${invalidUrls.length} invalid URLs skipped`);
      invalidUrls.forEach(url => console.warn(`   - ${url}`));
    }

    if (validUrls.length === 0) {
      console.error(`❌ Activity ${id} (${name}): No valid image URLs found`);
      errorCount++;
      continue;
    }

    try {
      // Check if activity exists
      const checkResult = await pool.query(
        'SELECT id, hero_image_url FROM activities WHERE id = $1',
        [id]
      );

      if (checkResult.rows.length === 0) {
        console.warn(`⚠️  Activity ${id} not found in database - skipping`);
        skippedCount++;
        continue;
      }

      const existingHeroImage = checkResult.rows[0].hero_image_url;

      // Update image_urls array
      await pool.query(
        'UPDATE activities SET image_urls = $1 WHERE id = $2',
        [validUrls, id]
      );

      // Set hero_image_url to first image if not already set or if it's a URL (not an actual image)
      const shouldUpdateHero = !existingHeroImage || 
                               existingHeroImage.startsWith('http://') || 
                               existingHeroImage.startsWith('https://www.');

      if (shouldUpdateHero) {
        await pool.query(
          'UPDATE activities SET hero_image_url = $1 WHERE id = $2',
          [validUrls[0], id]
        );
        console.log(`✅ Activity ${id} (${name}): ${validUrls.length} images + hero updated`);
      } else {
        console.log(`✅ Activity ${id} (${name}): ${validUrls.length} images added (hero kept)`);
      }

      successCount++;
    } catch (error) {
      console.error(`❌ Error updating activity ${id}:`, error);
      errorCount++;
    }
  }

  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('📊 IMPORT SUMMARY');
  console.log('='.repeat(60));
  console.log(`✅ Successfully imported: ${successCount}`);
  console.log(`❌ Errors: ${errorCount}`);
  console.log(`⚠️  Skipped (not found): ${skippedCount}`);
  console.log(`📝 Total processed: ${activities.length}`);
  console.log('='.repeat(60) + '\n');
}

/**
 * Main execution
 */
async function main() {
  const batchName = process.argv[2];

  if (!batchName) {
    console.log('Usage: npx tsx backend/scripts/import-activity-images.ts <batch-name>');
    console.log('');
    console.log('Examples:');
    console.log('  npx tsx backend/scripts/import-activity-images.ts batch-1');
    console.log('  npx tsx backend/scripts/import-activity-images.ts batch-2');
    console.log('');
    console.log('Expected file: backend/data/activity-images-<batch-name>.json');
    process.exit(1);
  }

  try {
    await importActivityImages(batchName);
  } catch (error) {
    console.error('Fatal error:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

main();
