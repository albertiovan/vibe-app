#!/usr/bin/env tsx
/**
 * Semantic Coverage Test
 * 
 * Tests the semantic fallback layer with creative user expressions
 * that would fail with keyword-only matching.
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { semanticFallback } from '../../src/services/ontology/semanticFallback.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

interface CreativeTestVibe {
  id: string;
  text: string;
  language: 'en' | 'ro';
  expectedCategory: string;
  expectedActivity?: string;
  description: string;
}

// ZERO KEYWORD OVERLAP TEST CASES
// These expressions have NO keywords that match your ontology
// Claude must use pure semantic understanding
const CREATIVE_TEST_VIBES: CreativeTestVibe[] = [
  // Mindfulness - ZERO keyword overlap
  {
    id: 'mental-chaos',
    text: 'My mind is racing and I can\'t stop the thoughts',
    language: 'en',
    expectedCategory: 'mindfulness',
    description: 'Mental overwhelm → mindfulness need (no "meditation" keywords)'
  },
  {
    id: 'soul-exhaustion',
    text: 'I feel spiritually drained and empty inside',
    language: 'en',
    expectedCategory: 'mindfulness',
    description: 'Spiritual depletion → mindfulness need (no "yoga" keywords)'
  },
  {
    id: 'inner-turmoil',
    text: 'There\'s so much chaos in my head right now',
    language: 'en',
    expectedCategory: 'mindfulness',
    description: 'Mental chaos → need for calm (no direct keywords)'
  },

  // Social - ZERO keyword overlap
  {
    id: 'human-void',
    text: 'I haven\'t talked to another human in days',
    language: 'en',
    expectedCategory: 'social',
    description: 'Isolation → social need (no "meet people" keywords)'
  },
  {
    id: 'conversation-starved',
    text: 'I\'m craving real conversation and laughter',
    language: 'en',
    expectedCategory: 'social',
    description: 'Conversation need → social activities (no "social" keywords)'
  },
  {
    id: 'echo-chamber',
    text: 'I\'m tired of talking to myself',
    language: 'en',
    expectedCategory: 'social',
    description: 'Self-isolation → need for human interaction'
  },

  // Adventure - ZERO keyword overlap  
  {
    id: 'life-monotony',
    text: 'Every day feels exactly the same and I\'m dying inside',
    language: 'en',
    expectedCategory: 'adventure',
    description: 'Monotony → need for excitement (no "adventure" keywords)'
  },
  {
    id: 'comfort-zone-prison',
    text: 'I feel trapped in my safe little bubble',
    language: 'en',
    expectedCategory: 'adventure',
    description: 'Comfort zone trap → need for challenges'
  },
  {
    id: 'heart-pounding',
    text: 'I miss that feeling when your heart pounds with excitement',
    language: 'en',
    expectedCategory: 'adventure',
    description: 'Missing excitement → adventure need'
  },

  // Creative - ZERO keyword overlap
  {
    id: 'expression-blocked',
    text: 'I have all these ideas trapped inside me',
    language: 'en',
    expectedCategory: 'creative',
    description: 'Creative blockage → need for artistic outlet'
  },
  {
    id: 'beauty-hunger',
    text: 'I want to bring something beautiful into existence',
    language: 'en',
    expectedCategory: 'creative',
    description: 'Creation desire → creative activities'
  },
  {
    id: 'hands-idle',
    text: 'My hands are itching to build something meaningful',
    language: 'en',
    expectedCategory: 'creative',
    description: 'Making desire → creative workshops'
  },

  // Wellness - ZERO keyword overlap
  {
    id: 'battery-dead',
    text: 'I feel completely drained and burnt out',
    language: 'en',
    expectedCategory: 'wellness',
    description: 'Burnout → wellness/relaxation need'
  },
  {
    id: 'tension-knots',
    text: 'My whole body feels like one giant knot',
    language: 'en',
    expectedCategory: 'wellness',
    description: 'Physical tension → wellness activities'
  },

  // Fitness - ZERO keyword overlap
  {
    id: 'body-stagnant',
    text: 'I feel like a slug that hasn\'t moved in weeks',
    language: 'en',
    expectedCategory: 'fitness',
    description: 'Physical stagnation → fitness need'
  },
  {
    id: 'energy-dormant',
    text: 'There\'s restless energy trapped in my muscles',
    language: 'en',
    expectedCategory: 'fitness',
    description: 'Restless energy → physical activity need'
  },

  // Nightlife - ZERO keyword overlap
  {
    id: 'evening-void',
    text: 'Another boring Friday night staring at the ceiling',
    language: 'en',
    expectedCategory: 'nightlife',
    description: 'Boring evening → nightlife need'
  },
  {
    id: 'music-soul',
    text: 'I need bass lines that make my soul vibrate',
    language: 'en',
    expectedCategory: 'nightlife',
    description: 'Music craving → live music venues'
  },

  // Romance - ZERO keyword overlap
  {
    id: 'heart-flutter',
    text: 'I miss that butterfly feeling in my stomach',
    language: 'en',
    expectedCategory: 'romance',
    description: 'Missing romance → romantic activities'
  },

  // Romanian - ZERO keyword overlap
  {
    id: 'suflet-gol',
    text: 'Sufletul meu e gol și am nevoie de ceva frumos',
    language: 'ro',
    expectedCategory: 'creative',
    description: 'Empty soul needs beauty → creative activities (Romanian)'
  },
  {
    id: 'inima-greoaie',
    text: 'Inima îmi e grea și am nevoie de lumină',
    language: 'ro',
    expectedCategory: 'social',
    description: 'Heavy heart needs light → social connection (Romanian)'
  }
];

class SemanticCoverageAnalyzer {
  async testSemanticFallback() {
    console.log('🧠 Testing Semantic Fallback Layer...\n');
    
    await semanticFallback.initialize();
    
    let totalTests = 0;
    let semanticSuccesses = 0;
    let keywordFailures = 0;
    
    for (const testVibe of CREATIVE_TEST_VIBES) {
      totalTests++;
      console.log(`Testing: "${testVibe.text}" (${testVibe.language})`);
      console.log(`Expected: ${testVibe.expectedCategory} - ${testVibe.description}`);
      
      try {
        // Simulate keyword matching failure (would be < 60% in real system)
        const keywordMatches = { activities: [], vibeEntries: [] };
        const keywordScore = 30; // Simulate low keyword score
        
        // Test semantic fallback
        const result = await semanticFallback.enhanceKeywordResults(
          testVibe.text,
          keywordScore,
          keywordMatches,
          testVibe.language
        );
        
        console.log(`🎯 Result: ${result.finalScore}% via ${result.method}`);
        console.log(`   Activities: ${result.activities.join(', ') || 'none'}`);
        console.log(`   Vibe entries: ${result.vibeEntries.join(', ') || 'none'}`);
        console.log(`   Reasoning: ${result.reasoning}`);
        
        // Check if semantic fallback succeeded
        if (result.method === 'semantic' && result.finalScore >= 70) {
          semanticSuccesses++;
          console.log('✅ Semantic fallback SUCCESS');
        } else if (result.method === 'hybrid' && result.finalScore >= 60) {
          semanticSuccesses++;
          console.log('✅ Hybrid approach SUCCESS');
        } else {
          keywordFailures++;
          console.log('❌ Both keyword and semantic failed');
        }
        
      } catch (error) {
        console.error(`❌ Error testing "${testVibe.text}":`, error);
        keywordFailures++;
      }
      
      console.log('');
    }
    
    // Results summary
    const semanticCoverage = Math.round((semanticSuccesses / totalTests) * 100);
    
    console.log('📊 Semantic Fallback Test Results:');
    console.log(`   Total creative expressions tested: ${totalTests}`);
    console.log(`   Semantic fallback successes: ${semanticSuccesses}`);
    console.log(`   Failed expressions: ${keywordFailures}`);
    console.log(`   Semantic coverage: ${semanticCoverage}%`);
    
    if (semanticCoverage >= 70) {
      console.log('\n🎉 Semantic fallback layer is working well!');
    } else {
      console.log('\n⚠️ Semantic fallback needs improvement');
    }
    
    return {
      totalTests,
      semanticSuccesses,
      keywordFailures,
      semanticCoverage
    };
  }
}

async function main() {
  const analyzer = new SemanticCoverageAnalyzer();
  await analyzer.testSemanticFallback();
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}
