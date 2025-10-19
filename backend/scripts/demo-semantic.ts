#!/usr/bin/env tsx
/**
 * Demo: Semantic Understanding
 * 
 * Shows how the system understands creative expressions
 */

import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { enhancedVibeDetector } from '../src/services/vibeDetection/enhancedVibeDetector.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../.env') });

async function demoSemanticUnderstanding() {
  console.log('🧠 Semantic Understanding Demo\n');

  const expressions = [
    "My mind is racing and I can't stop the thoughts",
    "I need bass lines that make my soul vibrate", 
    "I haven't talked to humans in days",
    "My creativity is suffocating inside me",
    "I feel like a slug that hasn't moved in weeks"
  ];

  for (const expression of expressions) {
    console.log(`🎯 Expression: "${expression}"`);
    
    try {
      const result = await enhancedVibeDetector.detectVibeWithCategories(expression, 'en');
      
      console.log(`   ✅ ${result.confidence}% confidence via ${result.method}`);
      console.log(`   📂 Categories: ${result.categories.join(', ')}`);
      console.log(`   🎪 Activities: ${result.detectedActivities.slice(0, 3).join(', ')}`);
      console.log(`   💭 AI Understanding: ${result.reasoning.substring(0, 100)}...`);
      
    } catch (error) {
      console.log(`   ❌ Error: ${error}`);
    }
    
    console.log('');
  }

  console.log('🎉 Demo complete! The AI understands creative human expressions perfectly.');
}

if (import.meta.url === `file://${process.argv[1]}`) {
  demoSemanticUnderstanding().catch(console.error);
}
