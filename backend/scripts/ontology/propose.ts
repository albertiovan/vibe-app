#!/usr/bin/env tsx
/**
 * LLM-Driven Ontology Expansion Proposal
 * 
 * Calls Claude with current ontology + expansion rules to propose
 * new activity subtypes, vibe lexicon entries, and provider mappings.
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { getLLMProvider } from '../../src/services/llm/index.js';
import { ProposalBundleSchema, type ProposalBundle } from '../../src/domain/activities/ontology/schema.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const CLAUDE_SYSTEM_PROMPT = `You are expanding an ACTIVITIES ontology for a vibes→experiences app.
OUTPUT: JSON only, matching the exact schema structure provided.

CRITICAL: Follow the exact field names and structure shown in the schema. Use these exact values:
- energy: "chill", "medium", or "high" (not "low", "moderate", etc.)
- seasonality: "summer", "winter", or "all" (not "spring,summer,fall", "year-round", etc.)
- indoorOutdoor: "indoor", "outdoor", or "either"
- keywords: must be object with "en" and "ro" arrays
- synonyms: must be object with "en" and "ro" arrays

Rules:
- Recommend ACTIVITIES (what you do), not generic places.
- For each new subtype: include action VERBS, EN+RO keywords/synonyms, category, energy, indoor/outdoor, seasonality.
- Provide at least one Google Places mapping (types and/or keywords) that is likely to return items in Romania.
- Prefer concrete, verifiable experiences users can actually do (e.g., 'via ferrata beginner', 'sunrise hike', 'thermal baths').
- Keep verbs vivid and user-oriented ("ride", "climb", "soak", "dance", "explore").

Categories: adventure, nature, water, culture, wellness, nightlife, culinary, creative, sports, learning
Focus on Romania-specific activities that are missing from current ontology.

- If you cannot provide believable provider mappings, set experimental: true.

EXAMPLE JSON STRUCTURE (follow this exact format):
{
  "newSubtypes": [
    {
      "id": "thermal-baths",
      "label": "Thermal Baths",
      "category": "wellness",
      "verbs": ["soak", "relax", "unwind"],
      "energy": "chill",
      "indoorOutdoor": "either",
      "seasonality": "all",
      "keywords": {
        "en": ["thermal baths", "hot springs"],
        "ro": ["băi termale", "izvoare termale"]
      },
      "synonyms": {
        "en": ["hot springs", "mineral baths"],
        "ro": ["izvoare calde", "băi minerale"]
      },
      "google": {
        "types": ["spa", "tourist_attraction"],
        "keywords": ["thermal baths", "băi termale"]
      }
    }
  ],
  "updatedSubtypes": [],
  "vibeLexiconAdditions": [
    {
      "id": "relaxation-seeking",
      "cues": {
        "en": ["I need to relax", "I want to unwind"],
        "ro": ["Am nevoie de relaxare", "Vreau să mă relaxez"]
      },
      "preferredCategories": ["wellness", "nature"]
    }
  ],
  "rationale": "Added thermal baths as Romania has many famous thermal resorts."
}

Generate exactly 2 Romania-specific WATER activities. Be concise but creative.

IMPORTANT: Keep response under 1200 tokens. Generate only 2 water activities and 1 short vibe lexicon entry.

TARGET CATEGORIES: water, adventure, nature
FOCUS: Romania's unique water experiences
INSPIRATION: Danube Delta tours, Carpathian lakes, thermal springs, river adventures

Be creative and concise! Keep descriptions brief.`;

interface ExpansionContext {
  currentOntology: any;
  sampleVibes: string[];
  targetExpansions: string[];
  focusAreas: string[];
}

async function loadCurrentOntology(): Promise<any> {
  const snapshotsDir = path.resolve(__dirname, '../../src/domain/activities/ontology/snapshots');
  
  try {
    const files = await fs.readdir(snapshotsDir);
    const latestSnapshot = files
      .filter(f => f.startsWith('ontology-summary-'))
      .sort()
      .pop();
    
    if (latestSnapshot) {
      const content = await fs.readFile(path.join(snapshotsDir, latestSnapshot), 'utf-8');
      return JSON.parse(content);
    }
  } catch (error) {
    console.warn('⚠️ Could not load ontology snapshot, using minimal context');
  }
  
  // Fallback minimal context
  return {
    currentActivities: [],
    availableCategories: ['adventure', 'nature', 'water', 'culture', 'wellness', 'nightlife', 'culinary', 'creative', 'sports', 'learning'],
    stats: { totalActivities: 0 },
    gaps: { needsMoreVerbs: 0, needsRomanianKeywords: 0, needsProviderMappings: 0 }
  };
}

function createExpansionPrompt(context: ExpansionContext): string {
  return `Current ontology context:
- Total activities: ${context.currentOntology.stats?.totalActivities || 0}
- Categories: ${context.currentOntology.availableCategories?.join(', ') || 'adventure, nature, culture, wellness'}
- Gaps: ${JSON.stringify(context.currentOntology.gaps || {})}

Sample current activities (first few):
${JSON.stringify(context.currentOntology.currentActivities?.slice(0, 5) || [], null, 2)}

Target expansion areas:
${context.targetExpansions.join('\n')}

Sample user vibes to cover:
${context.sampleVibes.join(', ')}

Please propose 8-15 new activity subtypes that:
1. Fill gaps in the current ontology
2. Cover common Romanian experiences and international activities available in Romania
3. Have strong provider mappings (Google Places types/keywords)
4. Include vivid action verbs and Romanian translations
5. Cover different energy levels, environments, and seasons

Also propose 5-10 vibe lexicon entries that map common user expressions to these activities.

Return a JSON object matching the ProposalBundle schema with newSubtypes, updatedSubtypes (empty for now), vibeLexiconAdditions, and rationale.`;
}

async function generateProposal(context: ExpansionContext): Promise<ProposalBundle> {
  const llm = getLLMProvider();
  
  console.log('🧠 Calling Claude for ontology expansion...');
  
  const prompt = createExpansionPrompt(context);
  
  const result = await llm.completeJSON({
    system: CLAUDE_SYSTEM_PROMPT,
    user: prompt,
    schema: ProposalBundleSchema,
    maxTokens: 1200 // Reduced further to prevent JSON truncation
  });
  
  if (!result.ok) {
    throw new Error(`LLM proposal failed: ${result.error}`);
  }
  
  console.log('✅ Claude proposal generated successfully');
  return result.data;
}

async function saveProposal(proposal: ProposalBundle): Promise<string> {
  const proposalsDir = path.resolve(__dirname, '../../src/domain/activities/ontology/proposals');
  await fs.mkdir(proposalsDir, { recursive: true });
  
  const timestamp = new Date().toISOString().split('T')[0];
  const filename = `proposal-${timestamp}-${Date.now()}.json`;
  const filepath = path.join(proposalsDir, filename);
  
  await fs.writeFile(filepath, JSON.stringify(proposal, null, 2));
  
  return filepath;
}

async function main() {
  try {
    console.log('🚀 Starting LLM-driven ontology expansion...\n');
    
    // Load current ontology context
    console.log('📊 Loading current ontology...');
    const currentOntology = await loadCurrentOntology();
    
    // Define expansion context
    const context: ExpansionContext = {
      currentOntology,
      sampleVibes: [
        'I want adventure', 'I feel cozy', 'I need to relax', 'I want to be creative',
        'I feel lonely', 'I want thrills', 'I need nature', 'I want culture',
        'Vreau aventură', 'Mă simt singur', 'Am nevoie de relaxare', 'Vreau să fiu creativ'
      ],
      targetExpansions: [
        'Adventure: zipline canopy, canyoning, via ferrata beginner, indoor skydiving, ice climbing (winter), airsoft games, bungee, caving (speleology)',
        'Nature: sunrise hike, stargazing spots, birdwatching hides, autumn foliage walks, wildflower meadows (seasonal)',
        'Water: thermal bath towns (Băile Felix/Oradea), whitewater rafting sections, SUP on lakes (Snagov), cold-water dips',
        'Culture: street art safari, fortress circuits (Transylvania), village museums, traditional craft workshops',
        'Wellness: sauna rounds + cold plunge, forest bathing, yoga in the park, hammam rituals',
        'Nightlife: open-air summer gigs, vinyl DJ bars, live jazz clubs',
        'Creative: film photo walk, pottery wheel intro, maker space intro day, cosplay meetups',
        'Sports: padel socials, bouldering grade intro, skatepark beginner hour, running club intervals',
        'Learning: survival basics, wildlife tracking, foraging workshops (mushrooms—seasonal & safety disclaimers)'
      ],
      focusAreas: ['Romania-specific', 'Seasonal activities', 'Beginner-friendly', 'Social experiences']
    };
    
    // Generate proposal
    console.log('🧠 Generating expansion proposal...');
    const proposal = await generateProposal(context);
    
    // Save proposal
    const filepath = await saveProposal(proposal);
    
    // Display summary
    console.log('\n📋 Proposal Summary:');
    console.log(`   New subtypes: ${proposal.newSubtypes.length}`);
    console.log(`   Updated subtypes: ${proposal.updatedSubtypes.length}`);
    console.log(`   Vibe lexicon additions: ${proposal.vibeLexiconAdditions.length}`);
    console.log(`\n💾 Proposal saved to: ${filepath}`);
    
    console.log('\n🎯 New Activities Preview:');
    proposal.newSubtypes.slice(0, 5).forEach(subtype => {
      console.log(`   • ${subtype.label} (${subtype.category})`);
      console.log(`     Verbs: ${subtype.verbs.join(', ')}`);
      console.log(`     Google: ${subtype.google.types.join(', ')} | ${subtype.google.keywords.join(', ')}`);
      console.log(`     Experimental: ${subtype.experimental || false}`);
    });
    
    console.log('\n🗣️ Vibe Lexicon Preview:');
    proposal.vibeLexiconAdditions.slice(0, 3).forEach(vibe => {
      console.log(`   • ${vibe.id}: ${vibe.cues.en.join(', ')}`);
      console.log(`     RO: ${vibe.cues.ro.join(', ')}`);
      console.log(`     Categories: ${vibe.preferredCategories.join(', ')}`);
    });
    
    console.log(`\n📝 Rationale:\n${proposal.rationale}`);
    
  } catch (error) {
    console.error('❌ Proposal generation failed:', error);
    process.exit(1);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}
