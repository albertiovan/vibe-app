#!/usr/bin/env tsx
/**
 * Ontology Coverage QA Harness
 * 
 * Tests vibe-to-activity mapping coverage by running curated vibes
 * through the pipeline and checking if we can find verifiable venues.
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { VibeToPlacesMapper } from '../../src/services/llm/vibeToPlacesMapper.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

interface TestVibe {
  id: string;
  text: string;
  language: 'en' | 'ro';
  expectedCategories?: string[];
  expectedTypes?: string[];
  minConfidence?: number;
}

interface CoverageResult {
  vibe: TestVibe;
  mapped: boolean;
  mapping?: {
    types: string[];
    keywords: string[];
    buckets: string[];
    confidence: number;
  };
  verifiable: boolean;
  error?: string;
}

interface CoverageReport {
  totalVibes: number;
  mappedVibes: number;
  verifiableVibes: number;
  coveragePercentage: number;
  verifiabilityPercentage: number;
  results: CoverageResult[];
  uncoveredVibes: TestVibe[];
  recommendations: string[];
}

const TEST_VIBES: TestVibe[] = [
  // English vibes
  { id: 'adventure-seeking', text: 'I want adventure', language: 'en', expectedCategories: ['adventure'], minConfidence: 0.7 },
  { id: 'cozy-comfort', text: 'I want something cozy', language: 'en', expectedCategories: ['social', 'wellness'], minConfidence: 0.6 },
  { id: 'lonely-social', text: 'I feel lonely', language: 'en', expectedCategories: ['social', 'connection'], minConfidence: 0.8 },
  { id: 'creative-expression', text: 'I want to be creative', language: 'en', expectedCategories: ['creative', 'art'], minConfidence: 0.7 },
  { id: 'nature-escape', text: 'I need nature', language: 'en', expectedCategories: ['nature', 'outdoor'], minConfidence: 0.8 },
  { id: 'relaxation-wellness', text: 'I need to relax', language: 'en', expectedCategories: ['wellness', 'relaxation'], minConfidence: 0.7 },
  { id: 'cultural-exploration', text: 'I want culture', language: 'en', expectedCategories: ['culture'], minConfidence: 0.7 },
  { id: 'nightlife-energy', text: 'I want nightlife', language: 'en', expectedCategories: ['nightlife'], minConfidence: 0.8 },
  { id: 'fitness-active', text: 'I want to exercise', language: 'en', expectedCategories: ['sports', 'wellness'], minConfidence: 0.7 },
  { id: 'learning-growth', text: 'I want to learn something new', language: 'en', expectedCategories: ['learning'], minConfidence: 0.6 },
  { id: 'water-activities', text: 'I want water activities', language: 'en', expectedCategories: ['water'], minConfidence: 0.8 },
  { id: 'food-experience', text: 'I want a food experience', language: 'en', expectedCategories: ['culinary'], minConfidence: 0.7 },
  { id: 'thrills-adrenaline', text: 'I need thrills', language: 'en', expectedCategories: ['adventure', 'adrenaline'], minConfidence: 0.8 },
  { id: 'peaceful-quiet', text: 'I want peace and quiet', language: 'en', expectedCategories: ['wellness', 'nature'], minConfidence: 0.7 },
  { id: 'social-meetup', text: 'I want to meet people', language: 'en', expectedCategories: ['social'], minConfidence: 0.8 },

  // Romanian vibes
  { id: 'aventura-ro', text: 'Vreau aventură', language: 'ro', expectedCategories: ['adventure'], minConfidence: 0.7 },
  { id: 'confortabil-ro', text: 'Vreau ceva confortabil', language: 'ro', expectedCategories: ['social', 'wellness'], minConfidence: 0.6 },
  { id: 'singur-ro', text: 'Mă simt singur', language: 'ro', expectedCategories: ['social'], minConfidence: 0.8 },
  { id: 'creativ-ro', text: 'Vreau să fiu creativ', language: 'ro', expectedCategories: ['creative'], minConfidence: 0.7 },
  { id: 'natura-ro', text: 'Am nevoie de natură', language: 'ro', expectedCategories: ['nature'], minConfidence: 0.8 },
  { id: 'relaxare-ro', text: 'Am nevoie de relaxare', language: 'ro', expectedCategories: ['wellness'], minConfidence: 0.7 },
  { id: 'cultura-ro', text: 'Vreau cultură', language: 'ro', expectedCategories: ['culture'], minConfidence: 0.7 },
  { id: 'viata-de-noapte-ro', text: 'Vreau viață de noapte', language: 'ro', expectedCategories: ['nightlife'], minConfidence: 0.8 },
  { id: 'sport-ro', text: 'Vreau să fac sport', language: 'ro', expectedCategories: ['sports'], minConfidence: 0.7 },
  { id: 'invatare-ro', text: 'Vreau să învăț ceva nou', language: 'ro', expectedCategories: ['learning'], minConfidence: 0.6 },

  // Complex/nuanced vibes
  { id: 'winter-cozy', text: 'I want something warm and cozy for winter', language: 'en', expectedCategories: ['social', 'wellness'], minConfidence: 0.6 },
  { id: 'summer-outdoor', text: 'I want outdoor summer activities', language: 'en', expectedCategories: ['nature', 'adventure', 'water'], minConfidence: 0.7 },
  { id: 'rainy-day', text: 'What can I do on a rainy day?', language: 'en', expectedCategories: ['culture', 'creative', 'learning'], minConfidence: 0.5 },
  { id: 'date-night', text: 'I need ideas for a romantic date', language: 'en', expectedCategories: ['culture', 'culinary', 'nightlife'], minConfidence: 0.6 },
  { id: 'family-fun', text: 'I want family-friendly activities', language: 'en', expectedCategories: ['nature', 'culture', 'learning'], minConfidence: 0.6 },
  { id: 'stress-relief', text: 'I need to relieve stress', language: 'en', expectedCategories: ['wellness', 'nature'], minConfidence: 0.7 },
  { id: 'weekend-plans', text: 'I need weekend plans', language: 'en', minConfidence: 0.4 }, // Very open-ended
  { id: 'bored-evening', text: 'I\'m bored this evening', language: 'en', minConfidence: 0.4 }
];

class CoverageAnalyzer {
  private vibeMapper: VibeToPlacesMapper;

  constructor() {
    this.vibeMapper = new VibeToPlacesMapper();
  }

  async analyzeCoverage(testVibes: TestVibe[] = TEST_VIBES): Promise<CoverageReport> {
    console.log(`🔍 Analyzing coverage for ${testVibes.length} test vibes...`);
    
    const results: CoverageResult[] = [];
    
    for (const vibe of testVibes) {
      const result = await this.testVibe(vibe);
      results.push(result);
    }
    
    return this.generateReport(results, testVibes);
  }

  private async testVibe(vibe: TestVibe): Promise<CoverageResult> {
    try {
      console.log(`Testing: "${vibe.text}" (${vibe.language})`);
      
      const mapping = await this.vibeMapper.parseVibeToPlacesSpec(vibe.text);
      
      const mapped = mapping.types.length > 0 || mapping.keywords.length > 0;
      const meetsConfidence = mapping.confidence >= (vibe.minConfidence || 0.5);
      const hasExpectedCategories = vibe.expectedCategories ? 
        vibe.expectedCategories.some(cat => mapping.buckets.includes(cat)) : true;
      
      const verifiable = mapped && meetsConfidence && hasExpectedCategories;
      
      return {
        vibe,
        mapped,
        mapping: {
          types: mapping.types,
          keywords: mapping.keywords,
          buckets: mapping.buckets,
          confidence: mapping.confidence
        },
        verifiable
      };
      
    } catch (error) {
      console.error(`❌ Error testing vibe "${vibe.text}":`, error);
      
      return {
        vibe,
        mapped: false,
        verifiable: false,
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }

  private generateReport(results: CoverageResult[], testVibes: TestVibe[]): CoverageReport {
    const mappedResults = results.filter(r => r.mapped);
    const verifiableResults = results.filter(r => r.verifiable);
    const uncoveredVibes = results.filter(r => !r.verifiable).map(r => r.vibe);
    
    const coveragePercentage = Math.round((mappedResults.length / results.length) * 100);
    const verifiabilityPercentage = Math.round((verifiableResults.length / results.length) * 100);
    
    const recommendations = this.generateRecommendations(results);
    
    return {
      totalVibes: testVibes.length,
      mappedVibes: mappedResults.length,
      verifiableVibes: verifiableResults.length,
      coveragePercentage,
      verifiabilityPercentage,
      results,
      uncoveredVibes,
      recommendations
    };
  }

  private generateRecommendations(results: CoverageResult[]): string[] {
    const recommendations: string[] = [];
    
    // Analyze failure patterns
    const failedResults = results.filter(r => !r.verifiable);
    const lowConfidenceResults = results.filter(r => r.mapping && r.mapping.confidence < 0.6);
    const romanianFailures = failedResults.filter(r => r.vibe.language === 'ro');
    
    if (failedResults.length > results.length * 0.3) {
      recommendations.push('High failure rate (>30%) - consider expanding activity ontology');
    }
    
    if (lowConfidenceResults.length > results.length * 0.2) {
      recommendations.push('Many low-confidence mappings - improve vibe-to-activity training data');
    }
    
    if (romanianFailures.length > 0) {
      recommendations.push(`${romanianFailures.length} Romanian vibes failed - expand Romanian synonyms and keywords`);
    }
    
    // Category-specific recommendations
    const categoryFailures: Record<string, number> = {};
    failedResults.forEach(r => {
      r.vibe.expectedCategories?.forEach(cat => {
        categoryFailures[cat] = (categoryFailures[cat] || 0) + 1;
      });
    });
    
    Object.entries(categoryFailures).forEach(([category, count]) => {
      if (count >= 2) {
        recommendations.push(`Multiple failures in ${category} category - add more ${category} activities`);
      }
    });
    
    // Specific vibe recommendations
    const complexVibeFailures = failedResults.filter(r => 
      r.vibe.text.includes('rainy') || 
      r.vibe.text.includes('date') || 
      r.vibe.text.includes('family') ||
      r.vibe.text.includes('weekend')
    );
    
    if (complexVibeFailures.length > 0) {
      recommendations.push('Complex/contextual vibes failing - improve LLM prompt for nuanced understanding');
    }
    
    return recommendations;
  }
}

async function saveReport(report: CoverageReport): Promise<string> {
  const reportsDir = path.resolve(__dirname, '../../src/domain/activities/ontology/reports');
  await fs.mkdir(reportsDir, { recursive: true });
  
  const timestamp = new Date().toISOString().split('T')[0];
  const reportPath = path.join(reportsDir, `coverage-report-${timestamp}.json`);
  
  await fs.writeFile(reportPath, JSON.stringify(report, null, 2));
  return reportPath;
}

function displayReport(report: CoverageReport): void {
  console.log('\n📊 Ontology Coverage Report:');
  console.log(`   Total test vibes: ${report.totalVibes}`);
  console.log(`   Successfully mapped: ${report.mappedVibes} (${report.coveragePercentage}%)`);
  console.log(`   Verifiable results: ${report.verifiableVibes} (${report.verifiabilityPercentage}%)`);
  
  const targetCoverage = 80;
  const meetsTarget = report.verifiabilityPercentage >= targetCoverage;
  
  console.log(`\n🎯 Target Coverage: ${targetCoverage}% - ${meetsTarget ? '✅ PASSED' : '❌ FAILED'}`);
  
  if (report.uncoveredVibes.length > 0) {
    console.log('\n❌ Uncovered Vibes:');
    report.uncoveredVibes.slice(0, 5).forEach(vibe => {
      const result = report.results.find(r => r.vibe.id === vibe.id);
      console.log(`   • "${vibe.text}" (${vibe.language})`);
      if (result?.mapping) {
        console.log(`     Mapped to: ${result.mapping.buckets.join(', ')} (confidence: ${result.mapping.confidence})`);
      }
      if (result?.error) {
        console.log(`     Error: ${result.error}`);
      }
    });
    
    if (report.uncoveredVibes.length > 5) {
      console.log(`   ... and ${report.uncoveredVibes.length - 5} more`);
    }
  }
  
  if (report.recommendations.length > 0) {
    console.log('\n💡 Recommendations:');
    report.recommendations.forEach(rec => {
      console.log(`   • ${rec}`);
    });
  }
  
  // Language breakdown
  const enResults = report.results.filter(r => r.vibe.language === 'en');
  const roResults = report.results.filter(r => r.vibe.language === 'ro');
  
  if (enResults.length > 0 && roResults.length > 0) {
    const enSuccess = Math.round((enResults.filter(r => r.verifiable).length / enResults.length) * 100);
    const roSuccess = Math.round((roResults.filter(r => r.verifiable).length / roResults.length) * 100);
    
    console.log('\n🌐 Language Breakdown:');
    console.log(`   English: ${enSuccess}% success (${enResults.filter(r => r.verifiable).length}/${enResults.length})`);
    console.log(`   Romanian: ${roSuccess}% success (${roResults.filter(r => r.verifiable).length}/${roResults.length})`);
  }
}

async function main() {
  const args = process.argv.slice(2);
  const customVibesFile = args.find(arg => arg.endsWith('.json'));
  const verbose = args.includes('--verbose');
  
  try {
    let testVibes = TEST_VIBES;
    
    // Load custom test vibes if provided
    if (customVibesFile) {
      console.log(`📋 Loading custom test vibes from: ${customVibesFile}`);
      const content = await fs.readFile(customVibesFile, 'utf-8');
      const customVibes = JSON.parse(content);
      testVibes = Array.isArray(customVibes) ? customVibes : customVibes.vibes || TEST_VIBES;
    }
    
    const analyzer = new CoverageAnalyzer();
    const report = await analyzer.analyzeCoverage(testVibes);
    
    displayReport(report);
    
    const reportPath = await saveReport(report);
    console.log(`\n💾 Detailed report saved to: ${reportPath}`);
    
    if (verbose) {
      console.log('\n🔍 Detailed Results:');
      report.results.forEach(result => {
        console.log(`\n"${result.vibe.text}" (${result.vibe.language}):`);
        if (result.mapping) {
          console.log(`  Types: ${result.mapping.types.join(', ')}`);
          console.log(`  Keywords: ${result.mapping.keywords.join(', ')}`);
          console.log(`  Buckets: ${result.mapping.buckets.join(', ')}`);
          console.log(`  Confidence: ${result.mapping.confidence}`);
        }
        console.log(`  Verifiable: ${result.verifiable ? '✅' : '❌'}`);
      });
    }
    
    // Exit with error if coverage is too low
    if (report.verifiabilityPercentage < 80) {
      console.log('\n⚠️ Coverage below target threshold (80%)');
      process.exit(1);
    }
    
  } catch (error) {
    console.error('❌ Coverage analysis failed:', error);
    process.exit(1);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}
