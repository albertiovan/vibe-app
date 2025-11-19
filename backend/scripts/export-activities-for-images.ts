import { Pool } from 'pg';
import * as fs from 'fs';
import * as path from 'path';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

async function exportActivitiesCSV() {
  const client = await pool.connect();
  
  try {
    const result = await client.query(`
      SELECT 
        a.id,
        a.name,
        a.category,
        a.energy_level,
        STRING_AGG(
          CASE 
            WHEN v.name IS NOT NULL AND v.city IS NOT NULL 
            THEN v.name || ' (' || v.city || ')'
            ELSE 'N/A'
          END, 
          ' | '
        ) as venues
      FROM activities a
      LEFT JOIN venues v ON v.activity_id = a.id
      GROUP BY a.id, a.name, a.category, a.energy_level
      ORDER BY a.category, a.name
    `);

    // Create CSV header
    const header = 'id,name,category,energy_level,venues,image_url_1,image_url_2,image_url_3,image_url_4,image_url_5\n';
    
    // Create CSV rows
    const rows = result.rows.map(row => {
      const escapeCsv = (str: string) => {
        if (!str) return '""';
        return `"${String(str).replace(/"/g, '""')}"`;
      };
      
      return [
        row.id,
        escapeCsv(row.name),
        escapeCsv(row.category),
        escapeCsv(row.energy_level),
        escapeCsv(row.venues || 'N/A'),
        '', // image_url_1
        '', // image_url_2
        '', // image_url_3
        '', // image_url_4
        ''  // image_url_5
      ].join(',');
    }).join('\n');

    const csv = header + rows;
    const outputPath = path.join(__dirname, '../../ACTIVITIES_IMAGE_URLS.csv');
    fs.writeFileSync(outputPath, csv);
    
    console.log(`✅ Exported ${result.rows.length} activities to ACTIVITIES_IMAGE_URLS.csv`);
    console.log(`📁 File location: ${outputPath}`);
    
  } finally {
    client.release();
    await pool.end();
  }
}

exportActivitiesCSV().catch(console.error);
