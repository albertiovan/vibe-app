#!/usr/bin/env tsx
/**
 * Ontology Linting & Validation
 * 
 * Validates activity subtypes and vibe lexicon entries for:
 * - Schema compliance
 * - Unique IDs
 * - Required fields
 * - Provider mappings
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { 
  OntologyValidator, 
  type ActivitySubtype, 
  type VibeEntry,
  COMMON_GOOGLE_PLACES_TYPES 
} from '../../src/domain/activities/ontology/schema.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface LintResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
  stats: {
    totalSubtypes: number;
    experimentalCount: number;
    productionReadyCount: number;
    categoriesCount: number;
    verifiableCount: number;
  };
}

interface LintOptions {
  strict?: boolean;
  checkProviders?: boolean;
  requireRomanian?: boolean;
}

class OntologyLinter {
  private errors: string[] = [];
  private warnings: string[] = [];

  lint(subtypes: ActivitySubtype[], vibeEntries: VibeEntry[], options: LintOptions = {}): LintResult {
    this.errors = [];
    this.warnings = [];

    // Schema validation
    this.validateSchemas(subtypes, vibeEntries);
    
    // ID uniqueness
    this.checkUniqueIds(subtypes, vibeEntries);
    
    // Required fields
    this.checkRequiredFields(subtypes, options);
    
    // Provider mappings
    if (options.checkProviders) {
      this.checkProviderMappings(subtypes);
    }
    
    // Romanian translations
    if (options.requireRomanian) {
      this.checkRomanianTranslations(subtypes, vibeEntries);
    }
    
    // Category consistency
    this.checkCategoryConsistency(subtypes);
    
    // Verb quality
    this.checkVerbQuality(subtypes);

    const stats = this.calculateStats(subtypes);

    return {
      valid: this.errors.length === 0,
      errors: this.errors,
      warnings: this.warnings,
      stats
    };
  }

  private validateSchemas(subtypes: ActivitySubtype[], vibeEntries: VibeEntry[]): void {
    subtypes.forEach((subtype, index) => {
      try {
        OntologyValidator.validateActivitySubtype(subtype);
      } catch (error) {
        this.errors.push(`Subtype ${index} (${subtype.id || 'unknown'}): ${error instanceof Error ? error.message : error}`);
      }
    });

    vibeEntries.forEach((entry, index) => {
      try {
        OntologyValidator.validateVibeEntry(entry);
      } catch (error) {
        this.errors.push(`Vibe entry ${index} (${entry.id || 'unknown'}): ${error instanceof Error ? error.message : error}`);
      }
    });
  }

  private checkUniqueIds(subtypes: ActivitySubtype[], vibeEntries: VibeEntry[]): void {
    // Check subtype ID uniqueness
    const subtypeIds = subtypes.map(s => s.id);
    const duplicateSubtypeIds = OntologyValidator.checkUniqueIds(subtypes);
    
    if (duplicateSubtypeIds.length > 0) {
      this.errors.push(`Duplicate subtype IDs: ${duplicateSubtypeIds.join(', ')}`);
    }

    // Check vibe entry ID uniqueness
    const vibeIds = vibeEntries.map(v => v.id);
    const duplicateVibeIds = vibeIds.filter((id, index) => vibeIds.indexOf(id) !== index);
    const uniqueDuplicateVibeIds = [...new Set(duplicateVibeIds)];
    
    if (uniqueDuplicateVibeIds.length > 0) {
      this.errors.push(`Duplicate vibe entry IDs: ${uniqueDuplicateVibeIds.join(', ')}`);
    }

    // Check for ID conflicts between subtypes and vibe entries
    const conflictingIds = subtypeIds.filter(id => vibeIds.includes(id));
    if (conflictingIds.length > 0) {
      this.errors.push(`ID conflicts between subtypes and vibe entries: ${conflictingIds.join(', ')}`);
    }
  }

  private checkRequiredFields(subtypes: ActivitySubtype[], options: LintOptions): void {
    subtypes.forEach(subtype => {
      // Check verbs
      if (!subtype.verbs || subtype.verbs.length === 0) {
        this.errors.push(`${subtype.id}: Missing action verbs`);
      }

      // Check keywords
      if (!subtype.keywords?.en || subtype.keywords.en.length === 0) {
        this.errors.push(`${subtype.id}: Missing English keywords`);
      }

      if (!subtype.keywords?.ro || subtype.keywords.ro.length === 0) {
        if (options.requireRomanian) {
          this.errors.push(`${subtype.id}: Missing Romanian keywords`);
        } else {
          this.warnings.push(`${subtype.id}: Missing Romanian keywords`);
        }
      }

      // Check synonyms
      if (!subtype.synonyms?.en || subtype.synonyms.en.length === 0) {
        this.warnings.push(`${subtype.id}: Missing English synonyms`);
      }

      if (!subtype.synonyms?.ro || subtype.synonyms.ro.length === 0) {
        this.warnings.push(`${subtype.id}: Missing Romanian synonyms`);
      }

      // Check label quality
      if (subtype.label.length < 3) {
        this.errors.push(`${subtype.id}: Label too short`);
      }

      if (subtype.label.toLowerCase().includes('generic') || subtype.label.toLowerCase().includes('other')) {
        this.warnings.push(`${subtype.id}: Generic label detected`);
      }
    });
  }

  private checkProviderMappings(subtypes: ActivitySubtype[]): void {
    subtypes.forEach(subtype => {
      const mappingCheck = OntologyValidator.checkProviderMappings(subtype);
      
      if (!mappingCheck.isVerifiable && !subtype.experimental) {
        this.errors.push(`${subtype.id}: No provider mappings but not marked experimental`);
      }

      if (!mappingCheck.hasGoogleMapping) {
        if (subtype.experimental) {
          this.warnings.push(`${subtype.id}: No Google mapping (experimental)`);
        } else {
          this.errors.push(`${subtype.id}: No Google mapping for production subtype`);
        }
      }

      // Validate Google Places types
      if (subtype.google?.types) {
        const invalidTypes = subtype.google.types.filter(type => 
          !COMMON_GOOGLE_PLACES_TYPES.includes(type as any)
        );
        
        if (invalidTypes.length > 0) {
          this.warnings.push(`${subtype.id}: Uncommon Google Places types: ${invalidTypes.join(', ')}`);
        }
      }
    });
  }

  private checkRomanianTranslations(subtypes: ActivitySubtype[], vibeEntries: VibeEntry[]): void {
    subtypes.forEach(subtype => {
      if (!subtype.keywords?.ro || subtype.keywords.ro.length === 0) {
        this.errors.push(`${subtype.id}: Missing Romanian keywords (required)`);
      }

      if (!subtype.synonyms?.ro || subtype.synonyms.ro.length === 0) {
        this.errors.push(`${subtype.id}: Missing Romanian synonyms (required)`);
      }
    });

    vibeEntries.forEach(entry => {
      if (!entry.cues?.ro || entry.cues.ro.length === 0) {
        this.errors.push(`${entry.id}: Missing Romanian cues (required)`);
      }
    });
  }

  private checkCategoryConsistency(subtypes: ActivitySubtype[]): void {
    const categories = new Set(subtypes.map(s => s.category));
    
    categories.forEach(category => {
      const categorySubtypes = subtypes.filter(s => s.category === category);
      
      // Check for category-specific patterns
      if (category === 'water' && categorySubtypes.some(s => s.indoorOutdoor === 'indoor')) {
        this.warnings.push(`Water category has indoor activities - verify this is correct`);
      }
      
      if (category === 'nightlife' && categorySubtypes.some(s => s.energy === 'chill')) {
        this.warnings.push(`Nightlife category has chill energy activities - verify this is correct`);
      }
    });
  }

  private checkVerbQuality(subtypes: ActivitySubtype[]): void {
    const weakVerbs = ['do', 'have', 'get', 'go', 'see', 'visit', 'experience'];
    
    subtypes.forEach(subtype => {
      const hasWeakVerbs = subtype.verbs.some(verb => 
        weakVerbs.includes(verb.toLowerCase())
      );
      
      if (hasWeakVerbs) {
        this.warnings.push(`${subtype.id}: Contains weak verbs - consider more specific action words`);
      }

      const hasLongVerbs = subtype.verbs.some(verb => verb.length > 15);
      if (hasLongVerbs) {
        this.warnings.push(`${subtype.id}: Contains very long verbs - consider shorter alternatives`);
      }
    });
  }

  private calculateStats(subtypes: ActivitySubtype[]) {
    const experimentalCount = subtypes.filter(s => s.experimental).length;
    const productionReadyCount = subtypes.length - experimentalCount;
    const categoriesCount = new Set(subtypes.map(s => s.category)).size;
    const verifiableCount = subtypes.filter(s => 
      OntologyValidator.checkProviderMappings(s).isVerifiable
    ).length;

    return {
      totalSubtypes: subtypes.length,
      experimentalCount,
      productionReadyCount,
      categoriesCount,
      verifiableCount
    };
  }
}

async function loadProposal(proposalPath: string): Promise<{ subtypes: ActivitySubtype[], vibeEntries: VibeEntry[] }> {
  const content = await fs.readFile(proposalPath, 'utf-8');
  const proposal = JSON.parse(content);
  
  return {
    subtypes: proposal.newSubtypes || [],
    vibeEntries: proposal.vibeLexiconAdditions || []
  };
}

async function main() {
  const args = process.argv.slice(2);
  const proposalPath = args[0];
  
  if (!proposalPath) {
    console.error('Usage: tsx lint.ts <proposal-file.json>');
    process.exit(1);
  }

  try {
    console.log('🔍 Linting ontology proposal...\n');
    
    const { subtypes, vibeEntries } = await loadProposal(proposalPath);
    
    const linter = new OntologyLinter();
    const result = linter.lint(subtypes, vibeEntries, {
      strict: true,
      checkProviders: true,
      requireRomanian: true
    });
    
    // Display results
    console.log('📊 Lint Results:');
    console.log(`   Total subtypes: ${result.stats.totalSubtypes}`);
    console.log(`   Production ready: ${result.stats.productionReadyCount}`);
    console.log(`   Experimental: ${result.stats.experimentalCount}`);
    console.log(`   Categories: ${result.stats.categoriesCount}`);
    console.log(`   Verifiable: ${result.stats.verifiableCount}`);
    
    if (result.errors.length > 0) {
      console.log('\n❌ Errors:');
      result.errors.forEach(error => console.log(`   • ${error}`));
    }
    
    if (result.warnings.length > 0) {
      console.log('\n⚠️ Warnings:');
      result.warnings.forEach(warning => console.log(`   • ${warning}`));
    }
    
    if (result.valid) {
      console.log('\n✅ Ontology proposal is valid!');
    } else {
      console.log('\n❌ Ontology proposal has errors that must be fixed.');
      process.exit(1);
    }
    
  } catch (error) {
    console.error('❌ Linting failed:', error);
    process.exit(1);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}
