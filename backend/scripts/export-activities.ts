import * as fs from 'fs';
import * as path from 'path';
import { Pool } from 'pg';
import * as dotenv from 'dotenv';

dotenv.config({ path: path.join(__dirname, '..', '.env') });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://localhost/vibe_app'
});

async function exportActivities() {
  const client = await pool.connect();
  try {
    const result = await client.query(
      'SELECT id, name, name_ro, category, energy_level FROM activities ORDER BY id'
    );
    
    let csv = 'ID,Name_EN,Name_RO,Category,Energy_Level\n';
    for (const row of result.rows) {
      const name = row.name?.replace(/,/g, ';').replace(/"/g, "'") || '';
      const nameRo = row.name_ro?.replace(/,/g, ';').replace(/"/g, "'") || '';
      csv += `${row.id},"${name}","${nameRo}",${row.category || ''},${row.energy_level || ''}\n`;
    }
    
    const outputPath = path.join(__dirname, '..', '..', 'ALL_ACTIVITIES_COMPLETE.csv');
    fs.writeFileSync(outputPath, csv);
    console.log(`Exported ${result.rows.length} activities to ${outputPath}`);
  } finally {
    client.release();
    await pool.end();
  }
}

exportActivities().catch(console.error);
