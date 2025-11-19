import { Pool } from 'pg';
import dotenv from 'dotenv';
import { join } from 'path';

dotenv.config({ path: join(__dirname, '../.env') });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://localhost/vibe_app',
});

async function updateEnergyLevels() {
  console.log('Starting energy level updates...');
  
  const updates = [
    ["321sport Community Run", "medium"],
    ["5-a-Side Football Pitch Hire (South)", "high"],
    ["50m Lap Swim (Olympic Pool)", "medium"],
    // Add all your activities here as ["name", "level"] pairs
  ];
  
  let count = 0;
  for (const [name, level] of updates) {
    await pool.query(
      'UPDATE activities SET energy_level = $1 WHERE name = $2',
      [level, name]
    );
    count++;
    if (count % 50 === 0) console.log(`Updated ${count} activities...`);
  }
  
  console.log(`✅ Updated ${count} activities with energy levels`);
  await pool.end();
}

updateEnergyLevels().catch(console.error);
