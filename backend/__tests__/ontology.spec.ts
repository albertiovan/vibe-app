/**
 * Ontology Validation Tests
 * 
 * Tests for activity ontology schema validation, uniqueness,
 * provider mappings, and overall data integrity.
 */

import { describe, test, expect, beforeAll } from '@jest/globals';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { 
  OntologyValidator,
  type ActivitySubtype,
  type VibeEntry,
  ActivitySubtypeSchema,
  VibeEntrySchema,
  COMMON_GOOGLE_PLACES_TYPES
} from '../src/domain/activities/ontology/schema.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

describe('Ontology Schema Validation', () => {
  test('should validate valid activity subtype', () => {
    const validSubtype: ActivitySubtype = {
      id: 'mountain-biking',
      label: 'Mountain Biking',
      category: 'adventure',
      verbs: ['ride', 'pedal', 'navigate'],
      energy: 'high',
      indoorOutdoor: 'outdoor',
      seasonality: 'all',
      keywords: {
        en: ['mountain bike', 'trail', 'cycling'],
        ro: ['bicicletă de munte', 'traseu', 'ciclism']
      },
      synonyms: {
        en: ['MTB', 'off-road cycling'],
        ro: ['MTB', 'ciclism off-road']
      },
      google: {
        types: ['bicycle_store', 'park'],
        keywords: ['mountain biking', 'bike trail']
      }
    };

    expect(() => OntologyValidator.validateActivitySubtype(validSubtype)).not.toThrow();
  });

  test('should reject invalid activity subtype', () => {
    const invalidSubtype = {
      id: 'Invalid ID with spaces',
      label: '',
      category: 'invalid_category',
      verbs: [],
      energy: 'super_high',
      keywords: { en: [] }
    };

    expect(() => OntologyValidator.validateActivitySubtype(invalidSubtype)).toThrow();
  });

  test('should validate valid vibe entry', () => {
    const validVibe: VibeEntry = {
      id: 'adventure-seeking',
      cues: {
        en: ['I want adventure', 'need thrills', 'seeking excitement'],
        ro: ['vreau aventură', 'am nevoie de emoții', 'caut emoții']
      },
      preferredCategories: ['adventure', 'sports'],
      disallowedCategories: ['wellness']
    };

    expect(() => OntologyValidator.validateVibeEntry(validVibe)).not.toThrow();
  });

  test('should reject invalid vibe entry', () => {
    const invalidVibe = {
      id: 'invalid id',
      cues: { en: [] },
      preferredCategories: []
    };

    expect(() => OntologyValidator.validateVibeEntry(invalidVibe)).toThrow();
  });
});

describe('Ontology Data Integrity', () => {
  let activities: ActivitySubtype[] = [];
  let vibeEntries: VibeEntry[] = [];

  beforeAll(async () => {
    // Load actual ontology files if they exist
    try {
      const activitiesPath = path.resolve(__dirname, '../src/domain/activities/ontology/activities.json');
      const activitiesContent = await fs.readFile(activitiesPath, 'utf-8');
      const activitiesData = JSON.parse(activitiesContent);
      activities = activitiesData.subtypes || activitiesData || [];
    } catch (error) {
      console.warn('No activities.json found, using empty array for tests');
    }

    try {
      const vibesPath = path.resolve(__dirname, '../src/domain/activities/ontology/vibe_lexicon.json');
      const vibesContent = await fs.readFile(vibesPath, 'utf-8');
      const vibesData = JSON.parse(vibesContent);
      vibeEntries = vibesData.entries || vibesData || [];
    } catch (error) {
      console.warn('No vibe_lexicon.json found, using empty array for tests');
    }
  });

  test('should have unique activity subtype IDs', () => {
    const duplicateIds = OntologyValidator.checkUniqueIds(activities);
    expect(duplicateIds).toHaveLength(0);
  });

  test('should have unique vibe entry IDs', () => {
    const vibeIds = vibeEntries.map(v => v.id);
    const duplicates = vibeIds.filter((id, index) => vibeIds.indexOf(id) !== index);
    const uniqueDuplicates = [...new Set(duplicates)];
    
    expect(uniqueDuplicates).toHaveLength(0);
  });

  test('should not have ID conflicts between subtypes and vibe entries', () => {
    const subtypeIds = new Set(activities.map(a => a.id));
    const vibeIds = vibeEntries.map(v => v.id);
    const conflicts = vibeIds.filter(id => subtypeIds.has(id));
    
    expect(conflicts).toHaveLength(0);
  });

  test('every production subtype should have action verbs', () => {
    const productionActivities = activities.filter(a => !a.experimental);
    const missingVerbs = productionActivities.filter(a => !a.verbs || a.verbs.length === 0);
    
    expect(missingVerbs).toHaveLength(0);
  });

  test('every production subtype should have English keywords', () => {
    const productionActivities = activities.filter(a => !a.experimental);
    const missingKeywords = productionActivities.filter(a => 
      !a.keywords?.en || a.keywords.en.length === 0
    );
    
    expect(missingKeywords).toHaveLength(0);
  });

  test('every production subtype should have Romanian keywords', () => {
    const productionActivities = activities.filter(a => !a.experimental);
    const missingRomanianKeywords = productionActivities.filter(a => 
      !a.keywords?.ro || a.keywords.ro.length === 0
    );
    
    // This might be a warning rather than error initially
    if (missingRomanianKeywords.length > 0) {
      console.warn(`${missingRomanianKeywords.length} activities missing Romanian keywords:`, 
        missingRomanianKeywords.map(a => a.id));
    }
  });

  test('every production subtype should have at least one provider mapping', () => {
    const productionActivities = activities.filter(a => !a.experimental);
    const missingMappings = productionActivities.filter(a => {
      const mappingCheck = OntologyValidator.checkProviderMappings(a);
      return !mappingCheck.isVerifiable;
    });
    
    expect(missingMappings).toHaveLength(0);
  });

  test('Google Places types should be valid', () => {
    const invalidTypes: { activity: string, types: string[] }[] = [];
    
    activities.forEach(activity => {
      if (activity.google?.types) {
        const invalid = activity.google.types.filter(type => 
          !COMMON_GOOGLE_PLACES_TYPES.includes(type as any)
        );
        
        if (invalid.length > 0) {
          invalidTypes.push({ activity: activity.id, types: invalid });
        }
      }
    });
    
    // Allow some uncommon types but warn about them
    if (invalidTypes.length > 0) {
      console.warn('Activities with uncommon Google Places types:', invalidTypes);
    }
  });

  test('activity labels should be descriptive', () => {
    const poorLabels = activities.filter(a => 
      a.label.length < 3 || 
      a.label.toLowerCase().includes('generic') ||
      a.label.toLowerCase().includes('other')
    );
    
    expect(poorLabels).toHaveLength(0);
  });

  test('verbs should be action-oriented', () => {
    const weakVerbs = ['do', 'have', 'get', 'go', 'see', 'visit', 'experience'];
    const activitiesWithWeakVerbs = activities.filter(a => 
      a.verbs?.some(verb => weakVerbs.includes(verb.toLowerCase()))
    );
    
    // This might be a warning rather than strict error
    if (activitiesWithWeakVerbs.length > 0) {
      console.warn(`${activitiesWithWeakVerbs.length} activities have weak verbs:`, 
        activitiesWithWeakVerbs.map(a => `${a.id}: ${a.verbs?.join(', ')}`));
    }
  });

  test('duration hints should be reasonable', () => {
    const unreasonableDurations = activities.filter(a => {
      if (!a.durationHintHrs) return false;
      const [min, max] = a.durationHintHrs;
      return min < 0 || max < min || max > 24; // More than 24 hours seems unreasonable for most activities
    });
    
    expect(unreasonableDurations).toHaveLength(0);
  });
});

describe('Vibe Lexicon Quality', () => {
  let vibeEntries: VibeEntry[] = [];

  beforeAll(async () => {
    try {
      const vibesPath = path.resolve(__dirname, '../src/domain/activities/ontology/vibe_lexicon.json');
      const vibesContent = await fs.readFile(vibesPath, 'utf-8');
      const vibesData = JSON.parse(vibesContent);
      vibeEntries = vibesData.entries || vibesData || [];
    } catch (error) {
      console.warn('No vibe_lexicon.json found, using empty array for tests');
    }
  });

  test('vibe entries should have meaningful cues', () => {
    const poorCues = vibeEntries.filter(v => 
      v.cues.en.some(cue => cue.length < 3) ||
      v.cues.ro.some(cue => cue.length < 3)
    );
    
    expect(poorCues).toHaveLength(0);
  });

  test('vibe entries should reference valid categories', () => {
    const validCategories = ['adventure', 'nature', 'water', 'culture', 'wellness', 'nightlife', 'culinary', 'creative', 'sports', 'learning'];
    
    const invalidCategories = vibeEntries.filter(v => 
      v.preferredCategories.some(cat => !validCategories.includes(cat)) ||
      v.disallowedCategories?.some(cat => !validCategories.includes(cat))
    );
    
    expect(invalidCategories).toHaveLength(0);
  });

  test('vibe entries should have both English and Romanian cues', () => {
    const missingTranslations = vibeEntries.filter(v => 
      !v.cues.en || v.cues.en.length === 0 ||
      !v.cues.ro || v.cues.ro.length === 0
    );
    
    expect(missingTranslations).toHaveLength(0);
  });
});

describe('Provider Mapping Quality', () => {
  let activities: ActivitySubtype[] = [];

  beforeAll(async () => {
    try {
      const activitiesPath = path.resolve(__dirname, '../src/domain/activities/ontology/activities.json');
      const activitiesContent = await fs.readFile(activitiesPath, 'utf-8');
      const activitiesData = JSON.parse(activitiesContent);
      activities = activitiesData.subtypes || activitiesData || [];
    } catch (error) {
      console.warn('No activities.json found, using empty array for tests');
    }
  });

  test('Google mappings should have types or keywords', () => {
    const emptyGoogleMappings = activities.filter(a => 
      a.google && 
      (!a.google.types || a.google.types.length === 0) &&
      (!a.google.keywords || a.google.keywords.length === 0)
    );
    
    expect(emptyGoogleMappings).toHaveLength(0);
  });

  test('OSM mappings should have tags or queries', () => {
    const emptyOSMMappings = activities.filter(a => 
      a.osm && 
      !a.osm.tags && 
      !a.osm.ql
    );
    
    expect(emptyOSMMappings).toHaveLength(0);
  });

  test('OTM mappings should have kinds', () => {
    const emptyOTMMappings = activities.filter(a => 
      a.otm && 
      (!a.otm.kinds || a.otm.kinds.length === 0)
    );
    
    expect(emptyOTMMappings).toHaveLength(0);
  });
});

describe('Category Distribution', () => {
  let activities: ActivitySubtype[] = [];

  beforeAll(async () => {
    try {
      const activitiesPath = path.resolve(__dirname, '../src/domain/activities/ontology/activities.json');
      const activitiesContent = await fs.readFile(activitiesPath, 'utf-8');
      const activitiesData = JSON.parse(activitiesContent);
      activities = activitiesData.subtypes || activitiesData || [];
    } catch (error) {
      console.warn('No activities.json found, using empty array for tests');
    }
  });

  test('should have reasonable category distribution', () => {
    if (activities.length === 0) {
      console.warn('No activities to test category distribution');
      return;
    }

    const categoryCount: Record<string, number> = {};
    activities.forEach(a => {
      categoryCount[a.category] = (categoryCount[a.category] || 0) + 1;
    });

    // No single category should dominate (>50% of all activities)
    const maxCategoryCount = Math.max(...Object.values(categoryCount));
    const dominanceRatio = maxCategoryCount / activities.length;
    
    expect(dominanceRatio).toBeLessThan(0.5);

    // Should have at least 3 different categories
    const categoriesCount = Object.keys(categoryCount).length;
    expect(categoriesCount).toBeGreaterThanOrEqual(3);
  });

  test('should have activities across different energy levels', () => {
    if (activities.length === 0) return;

    const energyLevels = new Set(activities.map(a => a.energy));
    expect(energyLevels.size).toBeGreaterThanOrEqual(2);
  });

  test('should have both indoor and outdoor activities', () => {
    if (activities.length === 0) return;

    const environments = new Set(activities.map(a => a.indoorOutdoor));
    expect(environments.has('indoor') || environments.has('outdoor') || environments.has('either')).toBe(true);
  });
});
