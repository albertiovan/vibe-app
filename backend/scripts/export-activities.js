/**
 * Export activities data as SQL INSERT statements
 */

import pg from 'pg';
import fs from 'fs';
const { Pool } = pg;

const pool = new Pool({
  host: 'localhost',
  database: 'vibe_app',
  port: 5432
});

async function exportTable(tableName) {
  console.log(`Exporting ${tableName}...`);
  
  const { rows } = await pool.query(`SELECT * FROM ${tableName}`);
  console.log(`  Found ${rows.length} rows`);
  
  if (rows.length === 0) return [];
  
  const inserts = [];
  
  for (const row of rows) {
    const columns = Object.keys(row);
    const values = Object.values(row).map(val => {
      if (val === null) return 'NULL';
      if (typeof val === 'string') return `'${val.replace(/'/g, "''")}'`;
      if (typeof val === 'boolean') return val ? 'true' : 'false';
      if (Array.isArray(val)) return `ARRAY[${val.map(v => `'${v.replace(/'/g, "''")}'`).join(',')}]::text[]`;
      if (val instanceof Date) return `'${val.toISOString()}'`;
      return val;
    });
    
    inserts.push(`INSERT INTO ${tableName} (${columns.join(', ')}) VALUES (${values.join(', ')}) ON CONFLICT DO NOTHING;`);
  }
  
  return inserts;
}

async function main() {
  try {
    console.log('Connecting to local database...');
    await pool.query('SELECT 1');
    console.log('Connected!\n');
    
    const allInserts = [];
    
    // Export tables
    allInserts.push('-- Activities');
    allInserts.push(...await exportTable('activities'));
    allInserts.push('\n-- Venues');
    allInserts.push(...await exportTable('venues'));
    
    // Write to file
    const outputFile = '/tmp/activities_data.sql';
    fs.writeFileSync(outputFile, allInserts.join('\n'));
    console.log(`\n✅ Exported to ${outputFile}`);
    console.log(`   Total statements: ${allInserts.length}`);
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await pool.end();
  }
}

main();
