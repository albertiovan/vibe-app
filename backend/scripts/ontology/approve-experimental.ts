#!/usr/bin/env tsx
/**
 * Approve Experimental Activities
 * Moves experimental activities to production after review
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const EXPERIMENTAL_DIR = path.resolve(__dirname, '../../src/domain/activities/ontology/experimental');
const ACTIVITIES_FILE = path.resolve(__dirname, '../../src/domain/activities/ontology/activities.json');

async function approveExperimental(activityId: string) {
  console.log(`🔍 Looking for experimental activity: ${activityId}`);
  
  // Read experimental activities
  const experimentalFiles = fs.readdirSync(EXPERIMENTAL_DIR);
  let foundActivity = null;
  let sourceFile = null;
  
  for (const file of experimentalFiles) {
    if (file.endsWith('.json')) {
      const filePath = path.join(EXPERIMENTAL_DIR, file);
      const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      
      const activity = data.subtypes?.find((a: any) => a.id === activityId);
      if (activity) {
        foundActivity = activity;
        sourceFile = filePath;
        break;
      }
    }
  }
  
  if (!foundActivity) {
    console.log(`❌ Activity ${activityId} not found in experimental activities`);
    return;
  }
  
  console.log(`✅ Found experimental activity: ${foundActivity.label}`);
  
  // Read current production activities
  const activitiesData = JSON.parse(fs.readFileSync(ACTIVITIES_FILE, 'utf8'));
  
  // Remove experimental flag and add to production
  foundActivity.experimental = false;
  activitiesData.activities.push(foundActivity);
  activitiesData.stats.total += 1;
  
  // Create backup
  const backupDir = path.resolve(__dirname, '../../src/domain/activities/ontology/backups');
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupFile = path.join(backupDir, `activities-${timestamp}.json`);
  fs.writeFileSync(backupFile, JSON.stringify(activitiesData.activities, null, 2));
  
  // Write updated activities
  fs.writeFileSync(ACTIVITIES_FILE, JSON.stringify(activitiesData, null, 2));
  
  // Remove from experimental (optional - you might want to keep for records)
  // const expData = JSON.parse(fs.readFileSync(sourceFile, 'utf8'));
  // expData.subtypes = expData.subtypes.filter((a: any) => a.id !== activityId);
  // fs.writeFileSync(sourceFile, JSON.stringify(expData, null, 2));
  
  console.log(`🎉 Activity ${activityId} approved and moved to production!`);
  console.log(`💾 Backup created: ${backupFile}`);
}

async function listExperimental() {
  console.log('🧪 Experimental Activities:');
  
  const experimentalFiles = fs.readdirSync(EXPERIMENTAL_DIR);
  
  for (const file of experimentalFiles) {
    if (file.endsWith('.json')) {
      const filePath = path.join(EXPERIMENTAL_DIR, file);
      const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      
      if (data.subtypes?.length > 0) {
        console.log(`\n📁 ${file}:`);
        data.subtypes.forEach((activity: any) => {
          console.log(`   • ${activity.id}: ${activity.label}`);
          console.log(`     Category: ${activity.category}`);
          console.log(`     Reason: Safety/liability concerns`);
        });
      }
    }
  }
}

async function main() {
  const command = process.argv[2];
  const activityId = process.argv[3];
  
  if (command === 'list') {
    await listExperimental();
  } else if (command === 'approve' && activityId) {
    await approveExperimental(activityId);
  } else {
    console.log('Usage:');
    console.log('  tsx scripts/ontology/approve-experimental.ts list');
    console.log('  tsx scripts/ontology/approve-experimental.ts approve <activity-id>');
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}
