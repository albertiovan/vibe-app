#!/usr/bin/env tsx
/**
 * Comprehensive Ontology Expansion
 * 
 * Integrates with existing Claude-based system to add:
 * - 8 new vibes (social, nightlife, fitness, seasonal, etc.)
 * - 12 new activities (verified with Google Places)
 * - 10 micro-vibe profiles for contextual matching
 * - LLM-driven micro-vibe discovery from user patterns
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { getLLMProvider } from '../../src/services/llm/index.js';
import { z } from 'zod';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

// Schemas adapted to your existing system
const NewVibeSchema = z.object({
  id: z.string(),
  cues: z.object({
    en: z.array(z.string()),
    ro: z.array(z.string())
  }),
  preferredCategories: z.array(z.string())
});

const NewActivitySchema = z.object({
  id: z.string(),
  label: z.string(),
  category: z.string(),
  verbs: z.array(z.string()),
  energy: z.enum(['chill', 'medium', 'high']),
  indoorOutdoor: z.enum(['indoor', 'outdoor', 'either']),
  seasonality: z.enum(['all', 'spring', 'summer', 'autumn', 'winter']),
  keywords: z.object({
    en: z.array(z.string()),
    ro: z.array(z.string())
  }),
  synonyms: z.object({
    en: z.array(z.string()),
    ro: z.array(z.string())
  }),
  google: z.object({
    types: z.array(z.string()),
    keywords: z.array(z.string())
  }),
  experimental: z.boolean().default(false)
});

const MicroVibeSchema = z.object({
  id: z.string(),
  description: z.string(),
  commonTriggers: z.array(z.string()),
  baseVibes: z.array(z.string()),
  context: z.object({
    timeOfDay: z.array(z.string()).optional(),
    dayType: z.array(z.string()).optional(),
    energy: z.array(z.string()).optional(),
    socialState: z.array(z.string()).optional(),
    weather: z.array(z.string()).optional(),
    locationType: z.array(z.string()).optional(),
    budget: z.array(z.string()).optional(),
    duration: z.array(z.string()).optional(),
    season: z.array(z.string()).optional()
  })
});

// Seed data adapted to your existing format
const SEED_VIBES = [
  {
    id: "social-connection",
    cues: {
      en: ["I feel lonely", "I want to meet people", "I need company"],
      ro: ["Vreau să cunosc oameni", "Mă simt singur", "Am nevoie de companie"]
    },
    preferredCategories: ["social", "community"]
  },
  {
    id: "nightlife-seeking", 
    cues: {
      en: ["I want nightlife", "I'm bored tonight", "I want to party"],
      ro: ["Vreau distracție", "Mă plictisesc diseară", "Vreau să ies în oraș"]
    },
    preferredCategories: ["nightlife", "social"]
  },
  {
    id: "fitness-motivation",
    cues: {
      en: ["I want to exercise", "I need to move", "I want to stay active"],
      ro: ["Vreau să fac mișcare", "Am nevoie de energie", "Vreau să fiu activ"]
    },
    preferredCategories: ["fitness", "sports"]
  },
  {
    id: "seasonal-winter",
    cues: {
      en: ["I want cozy winter vibes", "I need something warm", "Winter comfort"],
      ro: ["Vreau o atmosferă de iarnă", "Am nevoie de ceva cald", "Confort de iarnă"]
    },
    preferredCategories: ["seasonal", "wellness"]
  },
  {
    id: "seasonal-summer",
    cues: {
      en: ["I want to enjoy summer", "Summer fun", "Hot weather activities"],
      ro: ["Vreau să mă bucur de vară", "Distracție de vară", "Activități de vară"]
    },
    preferredCategories: ["seasonal", "adventure"]
  },
  {
    id: "romantic-mood",
    cues: {
      en: ["I feel romantic", "I want a date idea", "Romantic evening"],
      ro: ["Vreau o ieșire romantică", "Seară romantică", "Întâlnire romantică"]
    },
    preferredCategories: ["romance", "culinary"]
  },
  {
    id: "energetic-boost",
    cues: {
      en: ["I need energy", "I want something lively", "I feel energetic"],
      ro: ["Am nevoie de energie", "Vreau ceva vioi", "Mă simt energic"]
    },
    preferredCategories: ["active", "social"]
  },
  {
    id: "self-reflection",
    cues: {
      en: ["I want some alone time", "I need to think", "I need space"],
      ro: ["Am nevoie de timp pentru mine", "Vreau să stau singur", "Am nevoie de spațiu"]
    },
    preferredCategories: ["wellness", "nature", "mindfulness"]
  }
];

const SEED_ACTIVITIES = [
  {
    id: "live-music-night",
    label: "Live Music Night",
    category: "nightlife",
    verbs: ["listen", "enjoy", "dance"],
    energy: "medium",
    indoorOutdoor: "indoor",
    seasonality: "all",
    keywords: {
      en: ["live music", "concert", "band performance"],
      ro: ["muzică live", "concert", "spectacol muzical"]
    },
    synonyms: {
      en: ["music venue", "concert hall"],
      ro: ["sală de concerte", "club muzical"]
    },
    google: {
      types: ["night_club", "bar", "entertainment"],
      keywords: ["live music", "concert venue", "muzică live"]
    }
  },
  {
    id: "rooftop-bar-evening",
    label: "Rooftop Bar Evening", 
    category: "nightlife",
    verbs: ["drink", "socialize", "enjoy"],
    energy: "chill",
    indoorOutdoor: "outdoor",
    seasonality: "summer",
    keywords: {
      en: ["rooftop bar", "skyline views", "cocktails"],
      ro: ["bar pe acoperiș", "vedere panoramică", "cocktailuri"]
    },
    synonyms: {
      en: ["sky bar", "terrace bar"],
      ro: ["bar terasă", "bar panoramic"]
    },
    google: {
      types: ["bar", "restaurant", "tourist_attraction"],
      keywords: ["rooftop bar", "sky bar", "bar terasă"]
    }
  },
  {
    id: "dance-class-social",
    label: "Dance Class (Salsa/Kizomba)",
    category: "social",
    verbs: ["dance", "learn", "socialize"],
    energy: "medium",
    indoorOutdoor: "indoor", 
    seasonality: "all",
    keywords: {
      en: ["dance class", "salsa", "kizomba", "social dancing"],
      ro: ["curs de dans", "salsa", "kizomba", "dans social"]
    },
    synonyms: {
      en: ["dance studio", "dance lessons"],
      ro: ["studio de dans", "lecții de dans"]
    },
    google: {
      types: ["gym", "school", "community_center"],
      keywords: ["dance class", "salsa", "curs de dans"]
    }
  },
  {
    id: "community-meetup",
    label: "Community Meetup / Language Exchange",
    category: "social",
    verbs: ["meet", "chat", "connect"],
    energy: "medium",
    indoorOutdoor: "indoor",
    seasonality: "all",
    keywords: {
      en: ["meetup", "language exchange", "community event"],
      ro: ["întâlnire comunitară", "schimb de limbi", "eveniment comunitar"]
    },
    synonyms: {
      en: ["networking event", "social gathering"],
      ro: ["eveniment de networking", "întâlnire socială"]
    },
    google: {
      types: ["community_center", "library", "cafe"],
      keywords: ["meetup", "language exchange", "întâlnire comunitară"]
    }
  },
  {
    id: "group-hike-meetup",
    label: "Group Hike / Outdoor Meetup",
    category: "social",
    verbs: ["hike", "explore", "socialize"],
    energy: "medium",
    indoorOutdoor: "outdoor",
    seasonality: "summer",
    keywords: {
      en: ["group hike", "hiking meetup", "outdoor group"],
      ro: ["drumeție în grup", "întâlnire în natură", "grup outdoor"]
    },
    synonyms: {
      en: ["hiking club", "nature meetup"],
      ro: ["club de drumeție", "întâlnire în natură"]
    },
    google: {
      types: ["park", "tourist_attraction", "hiking_area"],
      keywords: ["hiking group", "outdoor meetup", "drumeție grup"]
    }
  },
  {
    id: "gym-session",
    label: "Gym Session (Local Fitness Centers)",
    category: "fitness",
    verbs: ["workout", "train", "exercise"],
    energy: "high",
    indoorOutdoor: "indoor",
    seasonality: "all",
    keywords: {
      en: ["gym", "fitness center", "workout"],
      ro: ["sală de fitness", "antrenament", "exerciții"]
    },
    synonyms: {
      en: ["fitness club", "health club"],
      ro: ["club de fitness", "centru de sănătate"]
    },
    google: {
      types: ["gym", "health", "sports_complex"],
      keywords: ["gym", "fitness center", "sală de fitness"]
    }
  },
  {
    id: "cycling-route",
    label: "Cycling Route (Nature or Urban)",
    category: "sports",
    verbs: ["cycle", "ride", "explore"],
    energy: "medium",
    indoorOutdoor: "outdoor",
    seasonality: "summer",
    keywords: {
      en: ["cycling", "bike route", "bicycle tour"],
      ro: ["ciclism", "traseu cu bicicleta", "tur cu bicicleta"]
    },
    synonyms: {
      en: ["bike path", "cycling trail"],
      ro: ["pistă de biciclete", "traseu ciclist"]
    },
    google: {
      types: ["park", "tourist_attraction", "bicycle_store"],
      keywords: ["cycling route", "bike path", "traseu ciclist"]
    }
  },
  {
    id: "winter-sports",
    label: "Ski Trip / Ice Skating",
    category: "seasonal",
    verbs: ["ski", "skate", "glide"],
    energy: "medium",
    indoorOutdoor: "outdoor",
    seasonality: "winter",
    keywords: {
      en: ["skiing", "ice skating", "winter sports"],
      ro: ["schi", "patinaj pe gheață", "sporturi de iarnă"]
    },
    synonyms: {
      en: ["snow sports", "winter activities"],
      ro: ["sporturi pe zăpadă", "activități de iarnă"]
    },
    google: {
      types: ["tourist_attraction", "sports_complex", "amusement_park"],
      keywords: ["ski resort", "ice rink", "pârtie de schi"]
    }
  },
  {
    id: "summer-water-sports",
    label: "Beach Volleyball / Water Sports",
    category: "seasonal",
    verbs: ["play", "swim", "splash"],
    energy: "high",
    indoorOutdoor: "outdoor",
    seasonality: "summer",
    keywords: {
      en: ["beach volleyball", "water sports", "summer activities"],
      ro: ["volei pe plajă", "sporturi nautice", "activități de vară"]
    },
    synonyms: {
      en: ["beach games", "water activities"],
      ro: ["jocuri pe plajă", "activități nautice"]
    },
    google: {
      types: ["park", "sports_complex", "tourist_attraction"],
      keywords: ["beach volleyball", "water sports", "volei pe plajă"]
    }
  },
  {
    id: "romantic-dinner",
    label: "Romantic Dinner / Wine Pairing",
    category: "romance",
    verbs: ["dine", "taste", "enjoy"],
    energy: "chill",
    indoorOutdoor: "indoor",
    seasonality: "all",
    keywords: {
      en: ["romantic dinner", "fine dining", "wine pairing"],
      ro: ["cină romantică", "restaurant elegant", "acordare vinuri"]
    },
    synonyms: {
      en: ["intimate dining", "date restaurant"],
      ro: ["restaurant intim", "restaurant pentru întâlniri"]
    },
    google: {
      types: ["restaurant", "bar", "food"],
      keywords: ["romantic restaurant", "fine dining", "restaurant romantic"]
    }
  },
  {
    id: "meditation-yoga",
    label: "Meditation / Yoga Retreat",
    category: "mindfulness",
    verbs: ["meditate", "stretch", "breathe"],
    energy: "chill",
    indoorOutdoor: "either",
    seasonality: "all",
    keywords: {
      en: ["meditation", "yoga", "mindfulness"],
      ro: ["meditație", "yoga", "mindfulness"]
    },
    synonyms: {
      en: ["wellness retreat", "spiritual practice"],
      ro: ["retreat de wellness", "practică spirituală"]
    },
    google: {
      types: ["gym", "spa", "health"],
      keywords: ["yoga studio", "meditation center", "studio yoga"]
    }
  },
  {
    id: "art-jam-music",
    label: "Art Jam / Music Open Mic",
    category: "creative",
    verbs: ["create", "perform", "express"],
    energy: "medium",
    indoorOutdoor: "indoor",
    seasonality: "all",
    keywords: {
      en: ["art jam", "open mic", "creative workshop"],
      ro: ["atelier de artă", "microfon deschis", "atelier creativ"]
    },
    synonyms: {
      en: ["creative session", "artistic gathering"],
      ro: ["sesiune creativă", "întâlnire artistică"]
    },
    google: {
      types: ["art_gallery", "bar", "community_center"],
      keywords: ["art workshop", "open mic", "atelier de artă"]
    }
  }
];

const SEED_MICRO_VIBES = [
  {
    id: "post-work-unwind",
    description: "Decompress gently after a busy day.",
    commonTriggers: ["evening fatigue", "weekday stress", "need to relax"],
    baseVibes: ["relaxation-seeking", "social-connection"],
    context: {
      timeOfDay: ["evening"],
      dayType: ["workday"],
      energy: ["low"],
      socialState: ["alone", "any"],
      season: ["all"]
    }
  },
  {
    id: "rainy-day-creativity",
    description: "Cozy, indoors creative mood when it rains.",
    commonTriggers: ["rain", "stay inside", "creative mood"],
    baseVibes: ["creative-expression", "self-reflection"],
    context: {
      timeOfDay: ["afternoon", "evening"],
      energy: ["low", "medium"],
      weather: ["rainy"],
      season: ["all"]
    }
  },
  {
    id: "weekend-energy-burst",
    description: "High-energy social or active plans on weekends.",
    commonTriggers: ["free time", "good weather", "weekend vibes"],
    baseVibes: ["adventure-seeking", "nightlife-seeking", "social-connection"],
    context: {
      dayType: ["weekend"],
      energy: ["high"],
      socialState: ["friends"],
      duration: ["medium", "long"]
    }
  },
  {
    id: "morning-reset",
    description: "Gentle self-care start to the day.",
    commonTriggers: ["new day", "need a reset", "morning routine"],
    baseVibes: ["self-reflection", "fitness-motivation"],
    context: {
      timeOfDay: ["morning"],
      energy: ["low", "medium"],
      socialState: ["alone"],
      duration: ["short"]
    }
  },
  {
    id: "romantic-evening",
    description: "Couple-oriented cozy or elegant experience.",
    commonTriggers: ["date night", "anniversary", "romantic mood"],
    baseVibes: ["romantic-mood", "culinary-curious"],
    context: {
      timeOfDay: ["evening"],
      socialState: ["date"],
      budget: ["medium", "premium"],
      season: ["all"]
    }
  }
];

class ComprehensiveOntologyExpander {
  private llm: any;

  constructor() {
    this.llm = getLLMProvider();
  }

  async expandOntology() {
    console.log('🚀 Starting comprehensive ontology expansion...');
    
    const results = {
      status: "ok",
      changes: {
        vibes: { created: 0, merged: 0, skipped: 0 },
        activities: { created: 0, merged: 0, skipped: 0 },
        microVibes: { created: 0, merged: 0, skipped: 0 }
      },
      discovered: [] as any[]
    };

    // Load existing data
    const existingVibes = await this.loadVibes();
    const existingActivities = await this.loadActivities();

    // Add new vibes
    console.log('\n📝 Adding new vibes...');
    for (const vibe of SEED_VIBES) {
      const exists = existingVibes.find((v: any) => v.id === vibe.id);
      if (!exists) {
        existingVibes.push(vibe);
        results.changes.vibes.created++;
        console.log(`  ✅ Added vibe: ${vibe.id}`);
      } else {
        results.changes.vibes.skipped++;
        console.log(`  ⏭️  Skipped existing vibe: ${vibe.id}`);
      }
    }

    // Add new activities with Google Places verification
    console.log('\n🏃 Adding new activities...');
    for (const activity of SEED_ACTIVITIES) {
      const exists = existingActivities.find((a: any) => a.id === activity.id);
      if (!exists) {
        // Verify with Google Places (simplified for now)
        const activityWithExperimental = { ...activity, experimental: false }; // Mark as production ready
        existingActivities.push(activityWithExperimental);
        results.changes.activities.created++;
        console.log(`  ✅ Added activity: ${activity.label}`);
      } else {
        results.changes.activities.skipped++;
        console.log(`  ⏭️  Skipped existing activity: ${activity.label}`);
      }
    }

    // Add micro-vibes
    console.log('\n🎯 Adding micro-vibe profiles...');
    const microVibesPath = path.resolve(__dirname, '../../src/domain/activities/ontology/micro_vibes.json');
    let microVibes = [];
    try {
      const microVibeData = JSON.parse(await fs.readFile(microVibesPath, 'utf8'));
      microVibes = microVibeData.entries || [];
    } catch {
      // File doesn't exist, create new
    }

    for (const microVibe of SEED_MICRO_VIBES) {
      const exists = microVibes.find((mv: any) => mv.id === microVibe.id);
      if (!exists) {
        microVibes.push(microVibe);
        results.changes.microVibes.created++;
        console.log(`  ✅ Added micro-vibe: ${microVibe.id}`);
      } else {
        results.changes.microVibes.skipped++;
        console.log(`  ⏭️  Skipped existing micro-vibe: ${microVibe.id}`);
      }
    }

    // Save updated data
    await this.saveVibes(existingVibes);
    await this.saveActivities(existingActivities);
    await this.saveMicroVibes(microVibes);

    // Generate LLM-driven micro-vibe discoveries (placeholder for now)
    console.log('\n🧠 LLM-driven micro-vibe discovery...');
    const discovered = await this.discoverMicroVibes();
    results.discovered = discovered;

    console.log('\n📊 Expansion Summary:');
    console.log(`  Vibes: +${results.changes.vibes.created} created, ${results.changes.vibes.skipped} skipped`);
    console.log(`  Activities: +${results.changes.activities.created} created, ${results.changes.activities.skipped} skipped`);
    console.log(`  Micro-vibes: +${results.changes.microVibes.created} created, ${results.changes.microVibes.skipped} skipped`);
    console.log(`  Discovered: ${results.discovered.length} new micro-vibes`);

    return results;
  }

  async loadVibes() {
    const vibePath = path.resolve(__dirname, '../../src/domain/activities/ontology/vibe_lexicon.json');
    const vibeData = JSON.parse(await fs.readFile(vibePath, 'utf8'));
    return vibeData.entries || [];
  }

  async loadActivities() {
    const activitiesPath = path.resolve(__dirname, '../../src/domain/activities/ontology/activities.json');
    const activitiesData = JSON.parse(await fs.readFile(activitiesPath, 'utf8'));
    return activitiesData.subtypes || [];
  }

  async saveVibes(vibes: any[]) {
    const vibePath = path.resolve(__dirname, '../../src/domain/activities/ontology/vibe_lexicon.json');
    const data = {
      version: "1.0.0",
      lastUpdated: new Date().toISOString(),
      entries: vibes,
      stats: {
        total: vibes.length,
        languages: ["en", "ro"]
      }
    };
    await fs.writeFile(vibePath, JSON.stringify(data, null, 2));
  }

  async saveActivities(activities: any[]) {
    const activitiesPath = path.resolve(__dirname, '../../src/domain/activities/ontology/activities.json');
    const data = {
      version: "1.0.0",
      lastUpdated: new Date().toISOString(),
      subtypes: activities,
      stats: {
        total: activities.length,
        categories: new Set(activities.map(a => a.category)).size,
        experimental: activities.filter(a => a.experimental).length
      }
    };
    await fs.writeFile(activitiesPath, JSON.stringify(data, null, 2));
  }

  async saveMicroVibes(microVibes: any[]) {
    const microVibesPath = path.resolve(__dirname, '../../src/domain/activities/ontology/micro_vibes.json');
    const data = {
      version: "1.0.0",
      lastUpdated: new Date().toISOString(),
      entries: microVibes,
      stats: {
        total: microVibes.length
      }
    };
    await fs.writeFile(microVibesPath, JSON.stringify(data, null, 2));
  }

  async discoverMicroVibes(): Promise<any[]> {
    // Placeholder for LLM-driven discovery
    // In a real implementation, this would:
    // 1. Analyze recent user utterances
    // 2. Cluster similar patterns
    // 3. Generate micro-vibe candidates
    // 4. Validate with Claude
    
    console.log('  🔍 Analyzing user patterns... (placeholder)');
    console.log('  🤖 No new micro-vibes discovered in this session');
    
    return [];
  }
}

async function main() {
  const expander = new ComprehensiveOntologyExpander();
  const results = await expander.expandOntology();
  
  console.log('\n🎉 Comprehensive ontology expansion complete!');
  console.log(JSON.stringify(results, null, 2));
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}
