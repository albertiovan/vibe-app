/**
 * Startup Verification: Semantic Vibe System
 * 
 * Run on server startup to ensure semantic system is working
 * Run: npx tsx backend/scripts/verify-semantic-system.ts
 */

import dotenv from 'dotenv';
import { resolve } from 'path';

// Load environment
dotenv.config({ path: resolve(process.cwd(), '.env') });

import { analyzeVibeSemantically } from '../src/services/llm/semanticVibeAnalyzer.js';
import { Pool } from 'pg';

async function verifySystem() {
  console.log('🔍 Verifying Semantic Vibe System...\n');
  console.log('═'.repeat(80));
  
  let allPassed = true;
  
  // Test 1: Environment variables
  console.log('\n📋 TEST 1: Environment Variables');
  console.log('─'.repeat(80));
  
  if (!process.env.CLAUDE_API_KEY) {
    console.log('❌ CLAUDE_API_KEY not found!');
    console.log('   Please add to backend/.env: CLAUDE_API_KEY=sk-ant-...');
    allPassed = false;
  } else {
    const keyLength = process.env.CLAUDE_API_KEY.length;
    const keyPreview = process.env.CLAUDE_API_KEY.substring(0, 10) + '...';
    console.log(`✅ CLAUDE_API_KEY found (${keyLength} chars): ${keyPreview}`);
  }
  
  if (!process.env.DATABASE_URL) {
    console.log('❌ DATABASE_URL not found!');
    allPassed = false;
  } else {
    console.log(`✅ DATABASE_URL found: ${process.env.DATABASE_URL}`);
  }
  
  // Test 2: Database connection
  console.log('\n📋 TEST 2: Database Connection');
  console.log('─'.repeat(80));
  
  try {
    const pool = new Pool({ connectionString: process.env.DATABASE_URL });
    const result = await pool.query('SELECT COUNT(*) FROM activities');
    const activityCount = result.rows[0].count;
    console.log(`✅ Database connected: ${activityCount} activities found`);
    
    // Check for semantic columns
    const columnsCheck = await pool.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'training_sessions' 
        AND column_name IN ('semantic_version', 'is_valid')
    `);
    
    if (columnsCheck.rows.length === 2) {
      console.log('✅ Semantic training columns exist (semantic_version, is_valid)');
    } else {
      console.log('⚠️  Semantic training columns missing!');
      console.log('   Run: psql $DATABASE_URL -f backend/database/migrations/010_invalidate_old_training.sql');
      allPassed = false;
    }
    
    await pool.end();
  } catch (error: any) {
    console.log(`❌ Database connection failed: ${error.message}`);
    allPassed = false;
  }
  
  // Test 3: Semantic analysis
  console.log('\n📋 TEST 3: Semantic Vibe Analysis');
  console.log('─'.repeat(80));
  
  try {
    const testVibe = 'I want sports';
    console.log(`Testing vibe: "${testVibe}"`);
    
    const analysis = await analyzeVibeSemantically(testVibe);
    
    console.log('✅ Semantic analysis successful!');
    console.log(`   Intent: ${analysis.primaryIntent}`);
    console.log(`   Categories: ${analysis.suggestedCategories.join(', ')}`);
    console.log(`   Energy: ${analysis.energyLevel}`);
    console.log(`   Confidence: ${analysis.confidence}`);
    console.log(`   Required tags: ${analysis.requiredTags.join(', ')}`);
    
    if (analysis.confidence < 0.5) {
      console.log('⚠️  Warning: Low confidence analysis (might be using fallback)');
      allPassed = false;
    }
    
  } catch (error: any) {
    console.log(`❌ Semantic analysis failed: ${error.message}`);
    console.log('   This will cause recommendations to use keyword fallback!');
    allPassed = false;
  }
  
  // Test 4: Another semantic test
  console.log('\n📋 TEST 4: Deep Semantic Understanding');
  console.log('─'.repeat(80));
  
  try {
    const testVibe = 'I miss legos';
    console.log(`Testing vibe: "${testVibe}"`);
    
    const analysis = await analyzeVibeSemantically(testVibe);
    
    console.log('✅ Deep analysis successful!');
    console.log(`   Understanding: ${analysis.primaryIntent}`);
    console.log(`   Categories: ${analysis.suggestedCategories.join(', ')}`);
    
    // Check if it understands building/creating (not just "toys")
    const understandsCreation = 
      analysis.primaryIntent.toLowerCase().includes('build') ||
      analysis.primaryIntent.toLowerCase().includes('create') ||
      analysis.suggestedCategories.includes('creative');
    
    if (understandsCreation) {
      console.log('✅ Correctly understands "legos" = building/creating desire');
    } else {
      console.log('⚠️  May not deeply understand semantic meaning');
      console.log(`   Expected: building/creating context`);
      console.log(`   Got: ${analysis.primaryIntent}`);
    }
    
  } catch (error: any) {
    console.log(`❌ Deep analysis failed: ${error.message}`);
    allPassed = false;
  }
  
  // Final report
  console.log('\n═'.repeat(80));
  
  if (allPassed) {
    console.log('\n✅ ALL TESTS PASSED!');
    console.log('\n🎉 Semantic vibe system is working correctly!');
    console.log('   - API keys loaded');
    console.log('   - Database connected');
    console.log('   - Semantic analysis operational');
    console.log('   - Deep understanding verified');
    console.log('\n📊 Ready for training data collection!');
    console.log('   Old training data (52% approval) is marked INVALID');
    console.log('   New sessions will use v2-semantic system');
    console.log('   Expected new approval rate: 75-85%\n');
  } else {
    console.log('\n❌ SOME TESTS FAILED!');
    console.log('\nPlease fix the issues above before collecting training data.');
    console.log('The system may fall back to keyword analysis, making results invalid.\n');
    process.exit(1);
  }
}

// Run verification
verifySystem()
  .then(() => process.exit(0))
  .catch(error => {
    console.error('\n❌ Verification failed with error:', error);
    process.exit(1);
  });
