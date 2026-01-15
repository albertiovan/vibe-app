import 'dotenv/config';
import pg from 'pg';
import fs from 'fs';

// Disable SSL certificate verification globally
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const { Pool } = pg;

async function importAllImagesToProduction() {
  // Read all images from local database export
  const imageData = JSON.parse(fs.readFileSync('/tmp/all-images.json', 'utf-8'));
  
  const pool = new Pool({
    host: 'vibe-app-db.cnwak0ga4cbg.eu-north-1.rds.amazonaws.com',
    port: 5432,
    database: 'vibe_app',
    user: 'vibeadmin',
    password: 'zyprif-2cuQxa-jowgoc',
    ssl: { rejectUnauthorized: false }
  });

  let updated = 0;
  let failed = 0;
  const errors: { id: number; error: string }[] = [];

  console.log('🚀 Starting import to PRODUCTION RDS database...');
  console.log(`📊 Total images to import: ${imageData.length}`);
  console.log(`📍 ID range: ${imageData[0].id} - ${imageData[imageData.length - 1].id}`);
  console.log('🔒 Using SSL connection to RDS\n');

  try {
    for (const item of imageData) {
      try {
        const result = await pool.query(
          `UPDATE activities 
           SET image_urls = $1, 
               hero_image_url = $2
           WHERE id = $3
           RETURNING id, name`,
          [item.image_urls, item.image_urls[0], item.id]
        );

        if (result.rowCount && result.rowCount > 0) {
          updated++;
          if (updated % 25 === 0) {
            console.log(`✅ Progress: ${updated}/${imageData.length} updated`);
          }
        } else {
          failed++;
          errors.push({ id: item.id, error: 'Activity not found in production DB' });
        }
      } catch (err) {
        failed++;
        errors.push({ id: item.id, error: String(err) });
      }
    }

    console.log('\n========== PRODUCTION IMPORT COMPLETE ==========');
    console.log(`✅ Successfully updated: ${updated}`);
    console.log(`❌ Failed: ${failed}`);
    
    if (errors.length > 0 && errors.length <= 20) {
      console.log('\n⚠️  Errors:');
      errors.forEach(e => console.log(`  - ID ${e.id}: ${e.error}`));
    } else if (errors.length > 20) {
      console.log(`\n⚠️  ${errors.length} errors (showing first 20):`);
      errors.slice(0, 20).forEach(e => console.log(`  - ID ${e.id}: ${e.error}`));
    }

    // Verify production database state
    const stats = await pool.query(
      `SELECT 
        COUNT(*) as total_activities,
        COUNT(CASE WHEN array_length(image_urls, 1) > 0 THEN 1 END) as with_images
       FROM activities`
    );
    
    console.log('\n📊 Production Database Stats:');
    console.log(`  Total activities: ${stats.rows[0].total_activities}`);
    console.log(`  Activities with images: ${stats.rows[0].with_images}`);
    console.log(`  Coverage: ${Math.round((stats.rows[0].with_images / stats.rows[0].total_activities) * 100)}%`);

  } catch (err) {
    console.error('❌ Fatal error:', err);
  } finally {
    await pool.end();
    console.log('\n🔒 Connection closed');
  }
}

importAllImagesToProduction().catch(console.error);
