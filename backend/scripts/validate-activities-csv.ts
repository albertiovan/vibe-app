/**
 * Validate activities CSV before importing
 * Run: npx tsx backend/scripts/validate-activities-csv.ts
 */

import { readFileSync } from 'fs';
import { parse } from 'csv-parse/sync';
import { join } from 'path';

interface ValidationError {
  row: number;
  field: string;
  issue: string;
  value?: any;
}

const errors: ValidationError[] = [];
const warnings: ValidationError[] = [];

function validateActivitiesCSV() {
  console.log('🔍 Validating activities_continuation.csv...\n');
  
  try {
    const csvContent = readFileSync(
      join(__dirname, '../../activities_continuation.csv'),
      'utf-8'
    );
    
    const activities = parse(csvContent, {
      columns: true,
      skip_empty_lines: true,
      trim: true,
    });
    
    console.log(`📊 Validating ${activities.length} activities...\n`);
    
    const slugs = new Set();
    const names = new Set();
    
    activities.forEach((activity: any, index: number) => {
      const rowNum = index + 2; // +2 for header and 0-index
      
      // Required fields
      if (!activity.slug) {
        errors.push({ row: rowNum, field: 'slug', issue: 'Missing required field' });
      } else if (slugs.has(activity.slug)) {
        errors.push({ row: rowNum, field: 'slug', issue: 'Duplicate slug', value: activity.slug });
      } else {
        slugs.add(activity.slug);
      }
      
      if (!activity.name) {
        errors.push({ row: rowNum, field: 'name', issue: 'Missing required field' });
      } else if (names.has(activity.name)) {
        warnings.push({ row: rowNum, field: 'name', issue: 'Duplicate name (OK if intentional)', value: activity.name });
      } else {
        names.add(activity.name);
      }
      
      if (!activity.category) {
        errors.push({ row: rowNum, field: 'category', issue: 'Missing required field' });
      }
      
      if (!activity.description || activity.description.length < 50) {
        warnings.push({ row: rowNum, field: 'description', issue: 'Description too short (< 50 chars)' });
      }
      
      if (!activity.city || !activity.region) {
        errors.push({ row: rowNum, field: 'location', issue: 'Missing city or region' });
      }
      
      // Validate coordinates
      if (activity.latitude) {
        const lat = parseFloat(activity.latitude);
        if (isNaN(lat) || lat < 43 || lat > 48) {
          warnings.push({ row: rowNum, field: 'latitude', issue: 'Suspicious latitude for Romania', value: activity.latitude });
        }
      } else {
        warnings.push({ row: rowNum, field: 'latitude', issue: 'Missing coordinates' });
      }
      
      if (activity.longitude) {
        const lng = parseFloat(activity.longitude);
        if (isNaN(lng) || lng < 20 || lng > 30) {
          warnings.push({ row: rowNum, field: 'longitude', issue: 'Suspicious longitude for Romania', value: activity.longitude });
        }
      } else {
        warnings.push({ row: rowNum, field: 'longitude', issue: 'Missing coordinates' });
      }
      
      // Validate duration
      if (activity.duration_min) {
        const min = parseInt(activity.duration_min);
        if (isNaN(min) || min < 10 || min > 600) {
          warnings.push({ row: rowNum, field: 'duration_min', issue: 'Unusual duration', value: activity.duration_min });
        }
      }
      
      // Validate category
      const validCategories = [
        'creative', 'culinary', 'wellness', 'mindfulness', 'nature', 
        'learning', 'social', 'romance', 'sports', 'fitness', 
        'adventure', 'culture', 'nightlife', 'seasonal'
      ];
      
      if (activity.category && !validCategories.includes(activity.category)) {
        warnings.push({ row: rowNum, field: 'category', issue: 'Unknown category', value: activity.category });
      }
      
      // Validate energy level
      const validEnergy = ['chill', 'low', 'medium', 'high'];
      if (activity.energy_level && !validEnergy.includes(activity.energy_level)) {
        warnings.push({ row: rowNum, field: 'energy_level', issue: 'Invalid energy level', value: activity.energy_level });
      }
      
      // Validate indoor/outdoor
      const validIO = ['indoor', 'outdoor', 'either'];
      if (activity.indoor_outdoor && !validIO.includes(activity.indoor_outdoor)) {
        errors.push({ row: rowNum, field: 'indoor_outdoor', issue: 'Invalid value', value: activity.indoor_outdoor });
      }
      
      // Check for empty hero_image_url (expected)
      if (!activity.hero_image_url) {
        // This is OK, just tracking
      }
      
      // Check source_url
      if (!activity.source_url) {
        warnings.push({ row: rowNum, field: 'source_url', issue: 'Missing source URL for verification' });
      }
    });
    
    // Report results
    console.log('═══════════════════════════════════════════════════════════\n');
    
    if (errors.length === 0 && warnings.length === 0) {
      console.log('✅ PERFECT! No issues found.\n');
      console.log(`   ${activities.length} activities ready to import!\n`);
    } else {
      if (errors.length > 0) {
        console.log(`❌ ERRORS (${errors.length}) - Must fix before importing:\n`);
        errors.forEach(err => {
          console.log(`   Row ${err.row}: ${err.field} - ${err.issue}${err.value ? ` (${err.value})` : ''}`);
        });
        console.log();
      }
      
      if (warnings.length > 0) {
        console.log(`⚠️  WARNINGS (${warnings.length}) - Review but not blocking:\n`);
        warnings.slice(0, 20).forEach(warn => {
          console.log(`   Row ${warn.row}: ${warn.field} - ${warn.issue}${warn.value ? ` (${warn.value})` : ''}`);
        });
        if (warnings.length > 20) {
          console.log(`   ... and ${warnings.length - 20} more warnings\n`);
        }
        console.log();
      }
    }
    
    console.log('═══════════════════════════════════════════════════════════\n');
    
    if (errors.length > 0) {
      console.log('❌ FIX ERRORS BEFORE IMPORTING\n');
      process.exit(1);
    } else if (warnings.length > 0) {
      console.log('⚠️  Review warnings, then run import script\n');
      process.exit(0);
    } else {
      console.log('✅ Ready to import! Run:\n');
      console.log('   npx tsx backend/scripts/import-activities-continuation.ts\n');
      process.exit(0);
    }
    
  } catch (error: any) {
    console.error('❌ Validation failed:', error.message);
    process.exit(1);
  }
}

// Run validation
validateActivitiesCSV();
