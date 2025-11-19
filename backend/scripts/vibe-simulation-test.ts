/**
 * Vibe Simulation Test Suite
 * 
 * Tests 1000+ diverse vibes to identify semantic understanding issues
 * Generates detailed report of discrepancies and mismatches
 */

import { Pool } from 'pg';
import dotenv from 'dotenv';
import { join } from 'path';
import { writeFileSync } from 'fs';
import mcpRecommender from '../src/services/llm/mcpClaudeRecommender.js';

dotenv.config({ path: join(__dirname, '../.env') });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://localhost/vibe_app',
});

// Test vibes organized by category and specificity
const TEST_VIBES = {
  // DIRECT & SPECIFIC (High confidence expected)
  direct_sports: [
    "I want to play football",
    "I want to play basketball",
    "I need a tennis court",
    "Where can I go rock climbing",
    "I want to go mountain biking",
    "I want to play volleyball",
    "I need a swimming pool",
    "Where can I play badminton",
    "I want to go hiking",
    "I want to try paragliding"
  ],
  
  direct_creative: [
    "I want to paint",
    "I want to do pottery",
    "I want to learn photography",
    "I want to take a cooking class",
    "I want to learn calligraphy",
    "I want to do woodworking",
    "I want to learn sewing",
    "I want to make jewelry",
    "I want to do ceramics",
    "I want to learn embroidery"
  ],
  
  direct_food: [
    "I want to try wine tasting",
    "I want a coffee tasting",
    "I want to learn baking",
    "I want to try craft beer",
    "I want a cooking workshop",
    "I want to learn about cheese",
    "I want chocolate tasting",
    "I want a food tour",
    "I want to learn cocktails",
    "I want to try Romanian food"
  ],
  
  direct_culture: [
    "I want to visit a museum",
    "I want to see art",
    "I want to visit historical sites",
    "I want a walking tour",
    "I want to see architecture",
    "I want to visit churches",
    "I want to see monuments",
    "I want a cultural experience",
    "I want to learn history",
    "I want to visit galleries"
  ],
  
  direct_nature: [
    "I want to go to the mountains",
    "I want to see nature",
    "I want to go to a park",
    "I want to see wildlife",
    "I want to go to the forest",
    "I want to see waterfalls",
    "I want to go to the beach",
    "I want to see caves",
    "I want to go birdwatching",
    "I want to see lakes"
  ],
  
  direct_wellness: [
    "I want a spa day",
    "I want a massage",
    "I want to do yoga",
    "I want to meditate",
    "I want to relax",
    "I want a sauna",
    "I want thermal baths",
    "I want wellness",
    "I want to destress",
    "I want peace and quiet"
  ],
  
  direct_nightlife: [
    "I want to go clubbing",
    "I want to go to a bar",
    "I want live music",
    "I want to dance",
    "I want cocktails",
    "I want a rooftop bar",
    "I want nightlife",
    "I want to party",
    "I want jazz music",
    "I want a pub"
  ],
  
  direct_learning: [
    "I want to read",
    "I want to learn something new",
    "I want a workshop",
    "I want to study",
    "I want to go to a library",
    "I want to learn a skill",
    "I want education",
    "I want to take a class",
    "I want to learn Romanian",
    "I want to learn programming"
  ],
  
  // OBSCURE & VAGUE (Requires interpretation)
  obscure_emotional: [
    "I'm bored",
    "I'm feeling lonely",
    "I'm stressed",
    "I'm feeling adventurous",
    "I'm feeling romantic",
    "I'm feeling creative",
    "I'm feeling energetic",
    "I'm feeling tired",
    "I'm feeling curious",
    "I'm feeling nostalgic",
    "I need to clear my head",
    "I want to feel alive",
    "I need inspiration",
    "I want to escape",
    "I need a change of pace"
  ],
  
  obscure_contextual: [
    "It's raining outside",
    "I have 2 hours free",
    "I'm with my partner",
    "I'm alone today",
    "I'm with friends",
    "I have kids with me",
    "It's my birthday",
    "It's a Sunday morning",
    "It's Friday night",
    "I just finished work",
    "I'm on vacation",
    "I'm new to the city",
    "I'm visiting for a day",
    "I have the whole weekend",
    "I'm on a budget"
  ],
  
  obscure_abstract: [
    "I want something different",
    "Surprise me",
    "Something unique",
    "Something local",
    "Something authentic",
    "Something memorable",
    "Something Instagram-worthy",
    "Something off the beaten path",
    "Something cultural",
    "Something fun",
    "Something relaxing",
    "Something exciting",
    "Something romantic",
    "Something adventurous",
    "Something educational"
  ],
  
  obscure_mood: [
    "I want to feel cozy",
    "I want to feel accomplished",
    "I want to feel connected",
    "I want to feel free",
    "I want to feel challenged",
    "I want to feel pampered",
    "I want to feel inspired",
    "I want to feel grounded",
    "I want to feel energized",
    "I want to feel peaceful",
    "I want to feel social",
    "I want to feel independent",
    "I want to feel productive",
    "I want to feel spontaneous",
    "I want to feel sophisticated"
  ],
  
  // COMPOUND & COMPLEX (Multiple requirements)
  compound_requirements: [
    "I want outdoor adventure but I'm a beginner",
    "I want culture but something quick",
    "I want food and nature combined",
    "I want wellness but not expensive",
    "I want nightlife but not too loud",
    "I want learning but hands-on",
    "I want sports but low energy",
    "I want art but interactive",
    "I want social but intimate",
    "I want adventure but safe",
    "I want creative but no experience needed",
    "I want nature but close to city",
    "I want food but healthy",
    "I want culture but modern",
    "I want exercise but fun"
  ],
  
  compound_time_weather: [
    "I want something indoors because it's raining",
    "I want something quick for lunch break",
    "I want something for the whole day",
    "I want something for tonight",
    "I want something for this weekend",
    "I want something outdoors while the weather is nice",
    "I want something cozy for a cold day",
    "I want something refreshing for summer",
    "I want something romantic for date night",
    "I want something active for Saturday morning"
  ],
  
  // EDGE CASES & TRICKY
  edge_cases: [
    "I don't know what I want",
    "I want to try something I've never done",
    "I want the opposite of what I usually do",
    "I want to get out of my comfort zone",
    "I want to discover hidden gems",
    "I want what locals do",
    "I want to avoid tourist traps",
    "I want something free or cheap",
    "I want something luxurious",
    "I want to learn about Romanian culture",
    "I want to meet new people",
    "I want to be alone",
    "I want to impress someone",
    "I want to celebrate",
    "I want to recover from a breakup"
  ],
  
  // SEASONAL & TEMPORAL
  seasonal: [
    "I want winter activities",
    "I want summer activities",
    "I want spring activities",
    "I want autumn activities",
    "I want Christmas activities",
    "I want New Year activities",
    "I want Easter activities",
    "I want Valentine's activities",
    "I want Halloween activities",
    "I want weekend activities"
  ],
  
  // ENERGY LEVELS
  energy_explicit: [
    "I want high energy activities",
    "I want low energy activities",
    "I want medium energy activities",
    "I want adrenaline",
    "I want chill vibes",
    "I want intense workout",
    "I want gentle exercise",
    "I want extreme sports",
    "I want peaceful activities",
    "I want exciting activities"
  ],
  
  // GROUP DYNAMICS
  group_context: [
    "I want activities for couples",
    "I want activities for families",
    "I want activities for kids",
    "I want activities for groups",
    "I want activities for solo travelers",
    "I want activities for friends",
    "I want activities for team building",
    "I want activities for dates",
    "I want activities for seniors",
    "I want activities for teenagers"
  ],
  
  // PRICE SENSITIVITY
  price_context: [
    "I want free activities",
    "I want cheap activities",
    "I want budget-friendly activities",
    "I want mid-range activities",
    "I want luxury activities",
    "I want expensive experiences",
    "I want value for money",
    "I want premium experiences",
    "I don't care about price",
    "I want affordable fun"
  ],
  
  // DISTANCE & LOCATION
  location_context: [
    "I want something nearby",
    "I want something in the city center",
    "I want something outside the city",
    "I want a day trip",
    "I want something walking distance",
    "I want something worth traveling for",
    "I want something in Old Town",
    "I want something in nature",
    "I want something urban",
    "I want something remote"
  ],
  
  // SKILL LEVEL
  skill_context: [
    "I want beginner-friendly activities",
    "I want intermediate activities",
    "I want advanced activities",
    "I want expert-level activities",
    "I've never done this before",
    "I'm experienced at this",
    "I want to learn from scratch",
    "I want to improve my skills",
    "I want professional instruction",
    "I want self-guided activities"
  ],
  
  // DURATION
  duration_context: [
    "I have 30 minutes",
    "I have 1 hour",
    "I have 2-3 hours",
    "I have half a day",
    "I have a full day",
    "I have a weekend",
    "I have a week",
    "I want something quick",
    "I want something all day",
    "I want something flexible"
  ]
};

interface TestResult {
  vibe: string;
  category: string;
  specificity: 'direct' | 'obscure' | 'compound' | 'edge_case';
  activities: any[];
  success: boolean;
  issues: string[];
  relevanceScore: number;
  categories_returned: string[];
  expected_categories?: string[];
  execution_time: number;
}

interface SimulationReport {
  total_tests: number;
  successful: number;
  failed: number;
  by_category: Record<string, { total: number; success: number; fail: number }>;
  by_specificity: Record<string, { total: number; success: number; fail: number }>;
  common_issues: Record<string, number>;
  worst_performers: TestResult[];
  best_performers: TestResult[];
  category_accuracy: Record<string, number>;
  avg_execution_time: number;
}

async function runSimulation(): Promise<SimulationReport> {
  console.log('🚀 Starting Vibe Simulation Test Suite\n');
  console.log('=' .repeat(80));
  
  const results: TestResult[] = [];
  let testCount = 0;
  
  // Flatten all test vibes
  const allTests: Array<{ vibe: string; category: string; specificity: string }> = [];
  
  for (const [category, vibes] of Object.entries(TEST_VIBES)) {
    const specificity = category.startsWith('direct') ? 'direct' :
                       category.startsWith('obscure') ? 'obscure' :
                       category.startsWith('compound') ? 'compound' : 'edge_case';
    
    for (const vibe of vibes) {
      allTests.push({ vibe, category, specificity });
    }
  }
  
  console.log(`📊 Total test vibes: ${allTests.length}\n`);
  
  // Run tests
  for (const test of allTests) {
    testCount++;
    const startTime = Date.now();
    
    try {
      console.log(`[${testCount}/${allTests.length}] Testing: "${test.vibe}"`);
      
      const recommendations = await mcpRecommender.getMCPRecommendations({
        vibe: test.vibe,
        city: 'Bucharest'
      });
      
      const executionTime = Date.now() - startTime;
      
      // Analyze results
      const issues: string[] = [];
      const categories_returned = [...new Set(recommendations.ideas.map((a: any) => a.bucket))];
      
      // Check for empty results
      if (recommendations.ideas.length === 0) {
        issues.push('NO_RESULTS');
      }
      
      // Check for duplicates
      const activityIds = recommendations.ideas.map((a: any) => a.activityId);
      const uniqueIds = new Set(activityIds);
      if (activityIds.length !== uniqueIds.size) {
        issues.push('DUPLICATE_ACTIVITIES');
      }
      
      // Check relevance based on category
      const expectedCategories = inferExpectedCategories(test.vibe, test.category);
      const hasRelevantCategory = categories_returned.some(cat => 
        expectedCategories.includes(cat)
      );
      
      if (!hasRelevantCategory && expectedCategories.length > 0) {
        issues.push('CATEGORY_MISMATCH');
      }
      
      // Calculate relevance score (0-100)
      let relevanceScore = 100;
      if (issues.includes('NO_RESULTS')) relevanceScore = 0;
      if (issues.includes('DUPLICATE_ACTIVITIES')) relevanceScore -= 20;
      if (issues.includes('CATEGORY_MISMATCH')) relevanceScore -= 40;
      
      const result: TestResult = {
        vibe: test.vibe,
        category: test.category,
        specificity: test.specificity as any,
        activities: recommendations.ideas,
        success: issues.length === 0 && relevanceScore >= 60,
        issues,
        relevanceScore,
        categories_returned,
        expected_categories: expectedCategories,
        execution_time: executionTime
      };
      
      results.push(result);
      
      console.log(`   ✓ ${recommendations.ideas.length} activities | ${categories_returned.join(', ')} | ${executionTime}ms`);
      if (issues.length > 0) {
        console.log(`   ⚠️  Issues: ${issues.join(', ')}`);
      }
      
    } catch (error) {
      const executionTime = Date.now() - startTime;
      console.log(`   ❌ Error: ${error instanceof Error ? error.message : 'Unknown'}`);
      
      results.push({
        vibe: test.vibe,
        category: test.category,
        specificity: test.specificity as any,
        activities: [],
        success: false,
        issues: ['ERROR'],
        relevanceScore: 0,
        categories_returned: [],
        execution_time: executionTime
      });
    }
    
    // Small delay to avoid overwhelming the API
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  
  // Generate report
  console.log('\n' + '='.repeat(80));
  console.log('📈 Generating Report...\n');
  
  const report = generateReport(results);
  
  return report;
}

function inferExpectedCategories(vibe: string, testCategory: string): string[] {
  const vibeLower = vibe.toLowerCase();
  
  // Direct mappings
  if (vibeLower.includes('football') || vibeLower.includes('basketball') || vibeLower.includes('sport')) {
    return ['sports', 'fitness'];
  }
  if (vibeLower.includes('paint') || vibeLower.includes('pottery') || vibeLower.includes('creative')) {
    return ['creative'];
  }
  if (vibeLower.includes('wine') || vibeLower.includes('food') || vibeLower.includes('cooking')) {
    return ['culinary'];
  }
  if (vibeLower.includes('museum') || vibeLower.includes('art') || vibeLower.includes('culture')) {
    return ['culture'];
  }
  if (vibeLower.includes('mountain') || vibeLower.includes('nature') || vibeLower.includes('hiking')) {
    return ['nature', 'adventure'];
  }
  if (vibeLower.includes('spa') || vibeLower.includes('massage') || vibeLower.includes('wellness')) {
    return ['wellness'];
  }
  if (vibeLower.includes('club') || vibeLower.includes('bar') || vibeLower.includes('nightlife')) {
    return ['nightlife', 'social'];
  }
  if (vibeLower.includes('read') || vibeLower.includes('learn') || vibeLower.includes('class')) {
    return ['learning', 'creative'];
  }
  
  // Category-based inference
  if (testCategory.includes('sports')) return ['sports', 'fitness'];
  if (testCategory.includes('creative')) return ['creative'];
  if (testCategory.includes('food')) return ['culinary'];
  if (testCategory.includes('culture')) return ['culture'];
  if (testCategory.includes('nature')) return ['nature', 'adventure'];
  if (testCategory.includes('wellness')) return ['wellness'];
  if (testCategory.includes('nightlife')) return ['nightlife', 'social'];
  if (testCategory.includes('learning')) return ['learning', 'creative'];
  
  // For obscure/abstract, accept any category
  return [];
}

function generateReport(results: TestResult[]): SimulationReport {
  const successful = results.filter(r => r.success).length;
  const failed = results.length - successful;
  
  // By category
  const by_category: Record<string, { total: number; success: number; fail: number }> = {};
  for (const result of results) {
    if (!by_category[result.category]) {
      by_category[result.category] = { total: 0, success: 0, fail: 0 };
    }
    by_category[result.category].total++;
    if (result.success) {
      by_category[result.category].success++;
    } else {
      by_category[result.category].fail++;
    }
  }
  
  // By specificity
  const by_specificity: Record<string, { total: number; success: number; fail: number }> = {};
  for (const result of results) {
    if (!by_specificity[result.specificity]) {
      by_specificity[result.specificity] = { total: 0, success: 0, fail: 0 };
    }
    by_specificity[result.specificity].total++;
    if (result.success) {
      by_specificity[result.specificity].success++;
    } else {
      by_specificity[result.specificity].fail++;
    }
  }
  
  // Common issues
  const common_issues: Record<string, number> = {};
  for (const result of results) {
    for (const issue of result.issues) {
      common_issues[issue] = (common_issues[issue] || 0) + 1;
    }
  }
  
  // Worst and best performers
  const sorted = [...results].sort((a, b) => a.relevanceScore - b.relevanceScore);
  const worst_performers = sorted.slice(0, 20);
  const best_performers = sorted.slice(-20).reverse();
  
  // Category accuracy
  const category_accuracy: Record<string, number> = {};
  for (const [category, stats] of Object.entries(by_category)) {
    category_accuracy[category] = (stats.success / stats.total) * 100;
  }
  
  // Average execution time
  const avg_execution_time = results.reduce((sum, r) => sum + r.execution_time, 0) / results.length;
  
  return {
    total_tests: results.length,
    successful,
    failed,
    by_category,
    by_specificity,
    common_issues,
    worst_performers,
    best_performers,
    category_accuracy,
    avg_execution_time
  };
}

function printReport(report: SimulationReport) {
  console.log('\n' + '='.repeat(80));
  console.log('📊 VIBE SIMULATION REPORT');
  console.log('='.repeat(80) + '\n');
  
  // Overall stats
  console.log('📈 OVERALL STATISTICS:');
  console.log(`   Total Tests: ${report.total_tests}`);
  console.log(`   Successful: ${report.successful} (${((report.successful / report.total_tests) * 100).toFixed(1)}%)`);
  console.log(`   Failed: ${report.failed} (${((report.failed / report.total_tests) * 100).toFixed(1)}%)`);
  console.log(`   Avg Execution Time: ${report.avg_execution_time.toFixed(0)}ms\n`);
  
  // By specificity
  console.log('🎯 BY SPECIFICITY:');
  for (const [specificity, stats] of Object.entries(report.by_specificity)) {
    const successRate = ((stats.success / stats.total) * 100).toFixed(1);
    console.log(`   ${specificity.toUpperCase()}: ${stats.success}/${stats.total} (${successRate}%)`);
  }
  console.log();
  
  // By category (top 10 worst)
  console.log('📂 CATEGORY ACCURACY (Worst Performers):');
  const sortedCategories = Object.entries(report.category_accuracy)
    .sort((a, b) => a[1] - b[1])
    .slice(0, 10);
  
  for (const [category, accuracy] of sortedCategories) {
    const stats = report.by_category[category];
    console.log(`   ${category}: ${accuracy.toFixed(1)}% (${stats.success}/${stats.total})`);
  }
  console.log();
  
  // Common issues
  console.log('⚠️  COMMON ISSUES:');
  const sortedIssues = Object.entries(report.common_issues)
    .sort((a, b) => b[1] - a[1]);
  
  for (const [issue, count] of sortedIssues) {
    const percentage = ((count / report.total_tests) * 100).toFixed(1);
    console.log(`   ${issue}: ${count} occurrences (${percentage}%)`);
  }
  console.log();
  
  // Worst performers
  console.log('❌ WORST PERFORMERS (Bottom 20):');
  for (let i = 0; i < Math.min(20, report.worst_performers.length); i++) {
    const result = report.worst_performers[i];
    console.log(`   ${i + 1}. "${result.vibe}"`);
    console.log(`      Score: ${result.relevanceScore}/100 | Issues: ${result.issues.join(', ')}`);
    console.log(`      Expected: [${result.expected_categories?.join(', ')}] | Got: [${result.categories_returned.join(', ')}]`);
  }
  console.log();
  
  console.log('='.repeat(80));
}

async function saveReport(report: SimulationReport, results: TestResult[]) {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const filename = `vibe-simulation-report-${timestamp}.json`;
  const filepath = join(__dirname, '../reports', filename);
  
  const fullReport = {
    metadata: {
      timestamp: new Date().toISOString(),
      total_tests: report.total_tests,
      success_rate: ((report.successful / report.total_tests) * 100).toFixed(2) + '%'
    },
    summary: report,
    detailed_results: results
  };
  
  writeFileSync(filepath, JSON.stringify(fullReport, null, 2));
  console.log(`\n💾 Full report saved to: ${filepath}`);
}

// Run simulation
runSimulation()
  .then(async (report) => {
    printReport(report);
    
    // Save detailed report
    const results: TestResult[] = []; // You'll need to pass this from runSimulation
    // await saveReport(report, results);
    
    console.log('\n✅ Simulation complete!\n');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Simulation failed:', error);
    process.exit(1);
  });
