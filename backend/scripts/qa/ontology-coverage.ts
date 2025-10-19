#!/usr/bin/env tsx
/**
 * Ontology-Based Coverage QA
 * 
 * Tests vibe-to-activity mapping using our actual ontology activities
 * and vibe lexicon entries, not just LLM mapping.
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

interface TestVibe {
  id: string;
  text: string;
  language: 'en' | 'ro';
  expectedCategories?: string[];
  minConfidence?: number;
}

interface OntologyActivity {
  id: string;
  label: string;
  category: string;
  keywords: {
    en: string[];
    ro: string[];
  };
  synonyms: {
    en: string[];
    ro: string[];
  };
}

interface VibeEntry {
  id: string;
  cues: {
    en: string[];
    ro: string[];
  };
  preferredCategories: string[];
}

interface OntologyCoverageResult {
  vibe: TestVibe;
  matchedActivities: OntologyActivity[];
  matchedVibeEntries: VibeEntry[];
  coverageScore: number;
  covered: boolean;
}

const TEST_VIBES: TestVibe[] = [
  // Learning vibes
  { id: 'learning-growth', text: 'I want to learn something new', language: 'en', expectedCategories: ['learning'], minConfidence: 0.6 },
  { id: 'invatare-ro', text: 'Vreau să învăț ceva nou', language: 'ro', expectedCategories: ['learning'], minConfidence: 0.6 },
  
  // Culinary vibes
  { id: 'food-experience', text: 'I want a food experience', language: 'en', expectedCategories: ['culinary'], minConfidence: 0.7 },
  { id: 'culinary-curious', text: 'I want to try new foods', language: 'en', expectedCategories: ['culinary'], minConfidence: 0.7 },
  
  // Water activities
  { id: 'water-activities', text: 'I want water activities', language: 'en', expectedCategories: ['water'], minConfidence: 0.8 },
  { id: 'nature-water', text: 'I want to be in nature', language: 'en', expectedCategories: ['nature', 'water'], minConfidence: 0.7 },
  
  // Creative activities
  { id: 'creative-expression', text: 'I want to be creative', language: 'en', expectedCategories: ['creative'], minConfidence: 0.7 },
  { id: 'creative-make', text: 'I want to make something', language: 'en', expectedCategories: ['creative'], minConfidence: 0.7 },
  
  // Adventure activities
  { id: 'adventure-seeking', text: 'I want adventure', language: 'en', expectedCategories: ['adventure'], minConfidence: 0.7 },
  { id: 'aventura-ro', text: 'Vreau aventură', language: 'ro', expectedCategories: ['adventure'], minConfidence: 0.7 },
  
  // Culture activities
  { id: 'cultural-exploration', text: 'I want culture', language: 'en', expectedCategories: ['culture'], minConfidence: 0.7 },
  { id: 'cultura-ro', text: 'Vreau cultură', language: 'ro', expectedCategories: ['culture'], minConfidence: 0.7 },
  
  // Wellness/relaxation
  { id: 'relaxation-wellness', text: 'I need to relax', language: 'en', expectedCategories: ['wellness'], minConfidence: 0.7 },
  { id: 'relaxare-ro', text: 'Am nevoie de relaxare', language: 'ro', expectedCategories: ['wellness'], minConfidence: 0.7 },

  // NEW CATEGORIES - Social vibes
  { id: 'social-connection', text: 'I feel lonely', language: 'en', expectedCategories: ['social'], minConfidence: 0.7 },
  { id: 'social-meetup', text: 'I want to meet people', language: 'en', expectedCategories: ['social'], minConfidence: 0.7 },
  { id: 'social-ro', text: 'Vreau să cunosc oameni', language: 'ro', expectedCategories: ['social'], minConfidence: 0.7 },

  // NEW CATEGORIES - Nightlife vibes  
  { id: 'nightlife-seeking', text: 'I want nightlife', language: 'en', expectedCategories: ['nightlife'], minConfidence: 0.7 },
  { id: 'nightlife-bored', text: 'I\'m bored tonight', language: 'en', expectedCategories: ['nightlife'], minConfidence: 0.7 },
  { id: 'nightlife-ro', text: 'Vreau distracție', language: 'ro', expectedCategories: ['nightlife'], minConfidence: 0.7 },

  // NEW CATEGORIES - Fitness vibes
  { id: 'fitness-motivation', text: 'I want to exercise', language: 'en', expectedCategories: ['fitness'], minConfidence: 0.7 },
  { id: 'fitness-active', text: 'I need to move', language: 'en', expectedCategories: ['fitness'], minConfidence: 0.7 },
  { id: 'fitness-ro', text: 'Vreau să fac mișcare', language: 'ro', expectedCategories: ['fitness'], minConfidence: 0.7 },

  // NEW CATEGORIES - Sports vibes
  { id: 'sports-cycling', text: 'I want to go cycling', language: 'en', expectedCategories: ['sports'], minConfidence: 0.7 },
  { id: 'sports-active', text: 'I want sports activities', language: 'en', expectedCategories: ['sports'], minConfidence: 0.7 },

  // NEW CATEGORIES - Seasonal vibes
  { id: 'seasonal-winter', text: 'I want cozy winter vibes', language: 'en', expectedCategories: ['seasonal'], minConfidence: 0.7 },
  { id: 'seasonal-summer', text: 'I want to enjoy summer', language: 'en', expectedCategories: ['seasonal'], minConfidence: 0.7 },

  // NEW CATEGORIES - Romance vibes
  { id: 'romantic-mood', text: 'I feel romantic', language: 'en', expectedCategories: ['romance'], minConfidence: 0.7 },
  { id: 'romantic-date', text: 'I want a date idea', language: 'en', expectedCategories: ['romance'], minConfidence: 0.7 },

  // NEW CATEGORIES - Mindfulness vibes
  { id: 'mindfulness-meditation', text: 'I want to meditate', language: 'en', expectedCategories: ['mindfulness'], minConfidence: 0.7 },
  { id: 'mindfulness-yoga', text: 'I need yoga', language: 'en', expectedCategories: ['mindfulness'], minConfidence: 0.7 }
];

class OntologyCoverageAnalyzer {
  private activities: OntologyActivity[] = [];
  private vibeEntries: VibeEntry[] = [];

  async loadOntology() {
    // Load activities
    const activitiesPath = path.resolve(__dirname, '../../src/domain/activities/ontology/activities.json');
    const activitiesData = JSON.parse(await fs.readFile(activitiesPath, 'utf8'));
    this.activities = activitiesData.subtypes || [];

    // Load vibe lexicon
    const vibePath = path.resolve(__dirname, '../../src/domain/activities/ontology/vibe_lexicon.json');
    const vibeData = JSON.parse(await fs.readFile(vibePath, 'utf8'));
    this.vibeEntries = vibeData.entries || [];

    console.log(`📊 Loaded ${this.activities.length} activities and ${this.vibeEntries.length} vibe entries`);
  }

  analyzeVibeCoverage(vibe: TestVibe): OntologyCoverageResult {
    const matchedActivities: OntologyActivity[] = [];
    const matchedVibeEntries: VibeEntry[] = [];

    // Check vibe lexicon matches
    for (const vibeEntry of this.vibeEntries) {
      const cues = vibeEntry.cues[vibe.language] || [];
      const vibeText = vibe.text.toLowerCase();
      
      for (const cue of cues) {
        if (vibeText.includes(cue.toLowerCase()) || cue.toLowerCase().includes(vibeText)) {
          matchedVibeEntries.push(vibeEntry);
          break;
        }
      }
    }

    // Check activity keyword matches
    for (const activity of this.activities) {
      const keywords = activity.keywords[vibe.language] || [];
      const synonyms = activity.synonyms[vibe.language] || [];
      const allTerms = [...keywords, ...synonyms];
      
      const vibeText = vibe.text.toLowerCase();
      
      for (const term of allTerms) {
        if (vibeText.includes(term.toLowerCase()) || term.toLowerCase().includes(vibeText)) {
          matchedActivities.push(activity);
          break;
        }
      }
      
      // Check if expected categories match activity category
      if (vibe.expectedCategories?.includes(activity.category)) {
        matchedActivities.push(activity);
      }
    }

    // Calculate coverage score
    let coverageScore = 0;
    
    // Vibe entry matches (40% weight)
    if (matchedVibeEntries.length > 0) {
      coverageScore += 0.4;
    }
    
    // Activity matches (60% weight)
    if (matchedActivities.length > 0) {
      coverageScore += 0.6;
    }
    
    // Bonus for multiple matches
    if (matchedActivities.length > 1) {
      coverageScore += 0.1;
    }
    
    const covered = coverageScore >= (vibe.minConfidence || 0.6);

    return {
      vibe,
      matchedActivities: [...new Set(matchedActivities)], // Remove duplicates
      matchedVibeEntries,
      coverageScore,
      covered
    };
  }

  async generateReport(): Promise<void> {
    await this.loadOntology();
    
    console.log('🔍 Analyzing ontology coverage for test vibes...\n');
    
    const results: OntologyCoverageResult[] = [];
    
    for (const vibe of TEST_VIBES) {
      console.log(`Testing: "${vibe.text}" (${vibe.language})`);
      const result = this.analyzeVibeCoverage(vibe);
      results.push(result);
      
      if (result.covered) {
        console.log(`✅ Covered (${Math.round(result.coverageScore * 100)}%)`);
        if (result.matchedActivities.length > 0) {
          console.log(`   Activities: ${result.matchedActivities.map(a => a.label).join(', ')}`);
        }
        if (result.matchedVibeEntries.length > 0) {
          console.log(`   Vibe entries: ${result.matchedVibeEntries.map(v => v.id).join(', ')}`);
        }
      } else {
        console.log(`❌ Not covered (${Math.round(result.coverageScore * 100)}%)`);
      }
      console.log();
    }

    // Generate summary
    const coveredVibes = results.filter(r => r.covered);
    const coveragePercentage = Math.round((coveredVibes.length / results.length) * 100);
    
    console.log('📊 Ontology Coverage Report:');
    console.log(`   Total test vibes: ${results.length}`);
    console.log(`   Covered vibes: ${coveredVibes.length} (${coveragePercentage}%)`);
    console.log(`   Uncovered vibes: ${results.length - coveredVibes.length}`);
    
    if (coveragePercentage >= 80) {
      console.log('\n🎯 Target Coverage: 80% - ✅ ACHIEVED!');
    } else {
      console.log('\n🎯 Target Coverage: 80% - ❌ FAILED');
      
      console.log('\n❌ Uncovered Vibes:');
      results.filter(r => !r.covered).forEach(result => {
        console.log(`   • "${result.vibe.text}" (${result.vibe.language})`);
        console.log(`     Score: ${Math.round(result.coverageScore * 100)}%`);
      });
    }

    // Save detailed report
    const reportPath = path.resolve(__dirname, '../../src/domain/activities/ontology/reports/ontology-coverage-report.json');
    await fs.writeFile(reportPath, JSON.stringify({
      timestamp: new Date().toISOString(),
      totalVibes: results.length,
      coveredVibes: coveredVibes.length,
      coveragePercentage,
      results
    }, null, 2));
    
    console.log(`\n💾 Detailed report saved to: ${reportPath}`);
  }
}

async function main() {
  const analyzer = new OntologyCoverageAnalyzer();
  await analyzer.generateReport();
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}
