#!/usr/bin/env tsx
/**
 * Export Current Ontology & Mappings
 * 
 * Extracts current activities.json, maps_types.ts, osm_tags.ts, otm_kinds.ts
 * to understand the existing ontology before expansion.
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface CurrentOntologySnapshot {
  activities: any[];
  googleMappings: Record<string, any>;
  osmMappings: Record<string, any>;
  otmMappings: Record<string, any>;
  vibeToPlacesMappings: Record<string, any>;
  exportedAt: string;
  stats: {
    totalActivities: number;
    categoriesCount: number;
    googleTypesCount: number;
    osmTagsCount: number;
  };
}

async function readJSONFile(filePath: string): Promise<any> {
  try {
    const content = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(content);
  } catch (error) {
    console.warn(`⚠️ Could not read ${filePath}:`, error instanceof Error ? error.message : error);
    return null;
  }
}

async function readTSFile(filePath: string): Promise<string> {
  try {
    return await fs.readFile(filePath, 'utf-8');
  } catch (error) {
    console.warn(`⚠️ Could not read ${filePath}:`, error instanceof Error ? error.message : error);
    return '';
  }
}

async function extractCurrentOntology(): Promise<CurrentOntologySnapshot> {
  const backendRoot = path.resolve(__dirname, '../../');
  
  console.log('📊 Exporting current ontology from:', backendRoot);

  // Try to find existing activities data
  const possibleActivityPaths = [
    path.join(backendRoot, 'src/domain/activities/activities.json'),
    path.join(backendRoot, 'src/data/activities.json'),
    path.join(backendRoot, 'data/activities.json'),
    path.join(backendRoot, 'src/types/activities.json')
  ];

  let activities: any[] = [];
  for (const activityPath of possibleActivityPaths) {
    const data = await readJSONFile(activityPath);
    if (data) {
      activities = Array.isArray(data) ? data : data.activities || [];
      console.log(`✅ Found activities at: ${activityPath} (${activities.length} entries)`);
      break;
    }
  }

  // Try to find vibe mappings
  const possibleVibePaths = [
    path.join(backendRoot, 'src/types/vibe.ts'),
    path.join(backendRoot, 'src/domain/vibe.ts'),
    path.join(backendRoot, 'src/config/vibe-mappings.ts')
  ];

  let vibeToPlacesMappings: Record<string, any> = {};
  for (const vibePath of possibleVibePaths) {
    const content = await readTSFile(vibePath);
    if (content.includes('VIBE_TO_PLACES_MAPPING')) {
      console.log(`✅ Found vibe mappings at: ${vibePath}`);
      // Extract the mapping object (simplified parsing)
      const mappingMatch = content.match(/VIBE_TO_PLACES_MAPPING\s*=\s*({[\s\S]*?});/);
      if (mappingMatch) {
        try {
          // This is a simplified extraction - in practice you'd want proper AST parsing
          vibeToPlacesMappings = { found: true, source: vibePath };
        } catch (error) {
          console.warn('Could not parse vibe mappings');
        }
      }
      break;
    }
  }

  // Try to find Google Places mappings
  const possibleGooglePaths = [
    path.join(backendRoot, 'src/services/places/maps_types.ts'),
    path.join(backendRoot, 'src/domain/activities/mapping/google-places-mapping.ts'),
    path.join(backendRoot, 'src/config/google-places.ts')
  ];

  let googleMappings: Record<string, any> = {};
  for (const googlePath of possibleGooglePaths) {
    const content = await readTSFile(googlePath);
    if (content.length > 0) {
      googleMappings = { found: true, source: googlePath };
      console.log(`✅ Found Google mappings at: ${googlePath}`);
      break;
    }
  }

  // Try to find OSM mappings
  const possibleOSMPaths = [
    path.join(backendRoot, 'src/services/places/osm_tags.ts'),
    path.join(backendRoot, 'src/domain/activities/mapping/osm-mapping.ts')
  ];

  let osmMappings: Record<string, any> = {};
  for (const osmPath of possibleOSMPaths) {
    const content = await readTSFile(osmPath);
    if (content.length > 0) {
      osmMappings = { found: true, source: osmPath };
      console.log(`✅ Found OSM mappings at: ${osmPath}`);
      break;
    }
  }

  // Try to find OTM mappings
  const possibleOTMPaths = [
    path.join(backendRoot, 'src/services/places/otm_kinds.ts'),
    path.join(backendRoot, 'src/domain/activities/mapping/opentripmap-mapping.ts')
  ];

  let otmMappings: Record<string, any> = {};
  for (const otmPath of possibleOTMPaths) {
    const content = await readTSFile(otmPath);
    if (content.length > 0) {
      otmMappings = { found: true, source: otmPath };
      console.log(`✅ Found OTM mappings at: ${otmPath}`);
      break;
    }
  }

  // Calculate stats
  const categories = new Set(activities.map(a => a.category).filter(Boolean));
  
  const snapshot: CurrentOntologySnapshot = {
    activities,
    googleMappings,
    osmMappings,
    otmMappings,
    vibeToPlacesMappings,
    exportedAt: new Date().toISOString(),
    stats: {
      totalActivities: activities.length,
      categoriesCount: categories.size,
      googleTypesCount: Object.keys(googleMappings).length,
      osmTagsCount: Object.keys(osmMappings).length
    }
  };

  return snapshot;
}

async function main() {
  try {
    console.log('🔍 Extracting current ontology & mappings...\n');
    
    const snapshot = await extractCurrentOntology();
    
    // Create output directory
    const outputDir = path.resolve(__dirname, '../../src/domain/activities/ontology/snapshots');
    await fs.mkdir(outputDir, { recursive: true });
    
    // Write snapshot
    const timestamp = new Date().toISOString().split('T')[0];
    const outputPath = path.join(outputDir, `current-ontology-${timestamp}.json`);
    
    await fs.writeFile(outputPath, JSON.stringify(snapshot, null, 2));
    
    console.log('\n📊 Current Ontology Snapshot:');
    console.log(`   Activities: ${snapshot.stats.totalActivities}`);
    console.log(`   Categories: ${snapshot.stats.categoriesCount}`);
    console.log(`   Google mappings: ${snapshot.stats.googleTypesCount}`);
    console.log(`   OSM mappings: ${snapshot.stats.osmTagsCount}`);
    console.log(`\n💾 Snapshot saved to: ${outputPath}`);
    
    // Also create a summary for Claude
    const summary = {
      currentActivities: snapshot.activities.slice(0, 10), // Sample for Claude
      availableCategories: [...new Set(snapshot.activities.map(a => a.category))],
      sampleGoogleTypes: ['cafe', 'restaurant', 'park', 'museum', 'gym'], // Common ones
      stats: snapshot.stats,
      gaps: {
        needsMoreVerbs: snapshot.activities.filter(a => !a.verbs || a.verbs.length === 0).length,
        needsRomanianKeywords: snapshot.activities.filter(a => !a.keywords?.ro).length,
        needsProviderMappings: snapshot.activities.filter(a => !a.google && !a.osm && !a.otm).length
      }
    };
    
    const summaryPath = path.join(outputDir, `ontology-summary-${timestamp}.json`);
    await fs.writeFile(summaryPath, JSON.stringify(summary, null, 2));
    
    console.log(`📋 Summary for LLM saved to: ${summaryPath}`);
    
  } catch (error) {
    console.error('❌ Export failed:', error);
    process.exit(1);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}
